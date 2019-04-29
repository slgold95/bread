import {vec2, vec3, mat4} from 'gl-matrix';
import OpenGLRenderer from '../rendering/gl/OpenGLRenderer';
import Camera from '../Camera';
import {setGL} from '../globals';
import ShaderProgram, {Shader} from '../rendering/gl/ShaderProgram';
import {readTextFile, populateVoxelArray, get3DTex} from '../globals';
import Mesh from '../geometry/Mesh';

class Voxelization {
    distanceArray: any = [];
    innerVoxelArray: any = [];
    outerVoxelArray: any = [];
    length: number;
    radius: Array<any> = [];   

    constructor() {
        this.distanceArray = new Array(50 * 50 * 50);
        this.distanceArray.fill(0.0);
        this.length = 40.0;
    }

setUpTexture(innerVoxelArray: any [], outerVoxelArray: any[]) {        
    this.innerVoxelArray = get3DTex(innerVoxelArray, this.length);        
    this.outerVoxelArray = get3DTex(outerVoxelArray, this.length); 
 }

// function to populate VBO data for the voxels
populateVoxelVBOs(theMesh: Mesh, voxelString: string, 
    currMinX: number, currMinY: number, currMinZ: number, currMaxX: number, currMaxY: number, currMaxZ: number, baked: boolean, identifier: number): Mesh {      
       
    theMesh.t1 = [];
    theMesh.t2 = [];
    theMesh.t3 = [];
    theMesh.t4 = [];
    theMesh.cArray = [];

    let voxelArray: any = [];
    voxelArray = populateVoxelArray(voxelString);

    let loopNum: number = 0;
    let numInstances = voxelArray.length/3.0; 
    let scale: number = 1.0;

    let overallTransformMat = mat4.create();
    let translateMat = mat4.create();
    let scaleMat = mat4.create();
    let offset: number = this.length / 2.0;

    // x loop for x values of voxel position data
    for (var x = 0; x < this.length; x ++) {    
        if (x < currMinX * 10 || x > currMaxX * 10) {
        // do not populate VBOs, skip them entirely
        continue;
        }
        // y loop for y values in pos data
        for (var y = 0; y < this.length; y++) {       
            if (y < currMinY * 10 || y > currMaxY * 10) {
                // do not populate VBOs, skip them entirely
                continue;
                }
            // z for z val data    
            for (var z = 0; z < this.length; z ++) {           
                if (z < currMinZ * 10 || z > currMaxZ * 10) {
                    // do not populate VBOs, skip them entirely
                    continue;
                    }
                var idx = x + y * this.length + z * this.length * this.length;
                if(this.innerVoxelArray[idx] == 1) {                 
                    overallTransformMat = mat4.create();
                    translateMat = mat4.create();
                    scaleMat = mat4.create();                        
                    // scale vector into scaleMat
                    mat4.fromScaling(scaleMat, vec3.fromValues(scale, scale, scale));
                    // translation vector in translateMat
                    mat4.fromTranslation(translateMat, vec3.fromValues(x - offset, y - offset, z - offset));
                    // get overall transformation mat
                    mat4.multiply(overallTransformMat, overallTransformMat, scaleMat);
                    mat4.multiply(overallTransformMat, overallTransformMat, translateMat);

                     // colors
                    if(baked){
                    theMesh.cArray.push(this.outerVoxelArray[idx]); // R channel - pass color data values to frag shader - distance                    
                    theMesh.cArray.push(0.0); 
                    theMesh.cArray.push(0.0);
                    theMesh.cArray.push(1.0); // Alpha channel
                    }
                    else if(!baked){
                    theMesh.cArray.push(0.0); // R channel - dough color
                    theMesh.cArray.push(0.0);
                    theMesh.cArray.push(0.0);
                    theMesh.cArray.push(1.0); // Alpha channel
                    }                   
                    // transform column 1
                    theMesh.t1.push(overallTransformMat[0]);
                    theMesh.t1.push(overallTransformMat[1]);
                    theMesh.t1.push(overallTransformMat[2]);
                    theMesh.t1.push(overallTransformMat[3]);
                    // transform column 2
                    theMesh.t2.push(overallTransformMat[4]);
                    theMesh.t2.push(overallTransformMat[5]);
                    theMesh.t2.push(overallTransformMat[6]);
                    theMesh.t2.push(overallTransformMat[7]);
                    // transform column 3
                    theMesh.t3.push(overallTransformMat[8]);
                    theMesh.t3.push(overallTransformMat[9]);
                    theMesh.t3.push(overallTransformMat[10]);
                    theMesh.t3.push(overallTransformMat[11]);

                    // identifier identifies if cherries, knight, car, or loafs are being created
                    // adds different amounts of offset to center them
                    if(identifier == 1.0){ // 1 for cherries
                    // transform column 4
                    theMesh.t4.push(overallTransformMat[12]);
                    theMesh.t4.push(overallTransformMat[13] + 8.0);
                    theMesh.t4.push(overallTransformMat[14]);
                    theMesh.t4.push(overallTransformMat[15]);
                    }
                    else if(identifier == 2.0){ // 2 for knight
                        // transform column 4
                        theMesh.t4.push(overallTransformMat[12] + 15.0);
                        theMesh.t4.push(overallTransformMat[13]);
                        theMesh.t4.push(overallTransformMat[14]);
                        theMesh.t4.push(overallTransformMat[15]);
                    }  
                    else if(identifier == 3.0){ // 3 for car
                        // transform column 4
                        theMesh.t4.push(overallTransformMat[12]);
                        theMesh.t4.push(overallTransformMat[13] + 15.0);
                        theMesh.t4.push(overallTransformMat[14]);
                        theMesh.t4.push(overallTransformMat[15]);
                    }  
                    else if(identifier == 4.0){ // 4 for loafs
                        // transform column 4
                        theMesh.t4.push(overallTransformMat[12]);
                        theMesh.t4.push(overallTransformMat[13] + 20);
                        theMesh.t4.push(overallTransformMat[14]);
                        theMesh.t4.push(overallTransformMat[15]);
                    }               

                    loopNum ++; // use this as the num instances to account for skipped loopings
                }                    
            }
        }
    }  
    let cubeCol1: Float32Array = new Float32Array(theMesh.t1);
    let cubeCol2: Float32Array = new Float32Array(theMesh.t2);
    let cubeCol3: Float32Array = new Float32Array(theMesh.t3);
    let cubeCol4: Float32Array = new Float32Array(theMesh.t4);
    let cubeColors: Float32Array = new Float32Array(theMesh.cArray);
    theMesh.setInstanceVBOs(cubeCol1, cubeCol2, cubeCol3, cubeCol4, cubeColors);
    theMesh.setNumInstances(loopNum); // loopNum for number of times the loop runs

    return theMesh;
}

// get the distance between the two passed in vectors
getDistance(temp1: vec3, temp2: vec3): any {
    var differenceVec = vec3.fromValues(0.0, 0.0, 0.0);
    // store the subtraction result in differenceVec
    vec3.subtract(differenceVec, temp1, temp2);
    // return the distance
    return vec3.length(differenceVec);
}

// setting variables from "Procedural Bread Making" paper pdf
getBubbles(): any {
    // bubble variables
    var minRadius = 1.0;
    var maxRadius = 5;
    // fractal exponent, likly occurance of a bubble in relation to its radius
    var d = 5.6; 
    // amount of voxels at each radius
    var k = 0.69 * Math.pow(this.length, 3) / 5.0;      
    
    this.radius = new Array(Math.pow(this.length, 3)); // Array of voxelization length in x, y, z dimensions
    this.radius.fill(0.0); // defualt values

    // loop for the bubble radius max value
    for (var i = minRadius; i < maxRadius; i ++) {
        var N = k / (Math.pow(i, d));
        // loop for N
        for (var j = 0; j < N; j++) {
            // multiply by the size of the voxelization to have bubbles throughout
            var xVal = Math.floor(Math.random() * this.length);
            var yVal = Math.floor(Math.random() * this.length);
            var zVal = Math.floor(Math.random() * this.length);            
            var testPoint = vec3.fromValues(xVal, yVal ,zVal);

            for (var x = -i; x < (i + 1); x ++) {
                for (var y = -i; y < (i + 1); y ++) {
                    for (var z = -i; z < (i + 1); z ++) {
                        // get index in the array
                        var idx = xVal + x + (yVal + y) * this.length + (zVal + z) * this.length * this.length;
                        // if it's on the crust, skip - no bubbles
                        if (this.outerVoxelArray[idx] == 1) {
                            continue;
                        }
                        // position to check against the testPoint (the center pos)
                        var testing = vec3.fromValues(xVal + x, (yVal + y), (zVal + z));

                        if (this.getDistance(testPoint, testing) < i) {
                            // set inner array to 0 if in the bound
                            this.innerVoxelArray[idx] = 0.0;
                        
                            // set the radius array to i's value
                            if (this.radius[idx] < i) {
                            this.radius[idx] = i;
                            }
                        }
                    } // close z loop
                } // close y loop
            } // close x loop 
        } // close j loop
      } // close i loop
   } // closes bubbles method  
  
};

export default Voxelization;