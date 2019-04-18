import {vec3, vec4} from 'gl-matrix';
import Drawable from '../rendering/gl/Drawable';
import {gl} from '../globals';

class Cube extends Drawable {
  indices: Uint32Array;
  positions: Float32Array;
  normals: Float32Array;
  colors: Float32Array;
  uvs: Float32Array;
  center: vec4;

  offsets: Float32Array; // Data for bufTranslate, added for InstanceVBO stuff
  transC1: Float32Array;
  transC2: Float32Array;
  transC3: Float32Array;
  transC4: Float32Array;

  constructor(center: vec3) {
    super(); // Call the constructor of the super class. This is required.
    this.center = vec4.fromValues(center[0], center[1], center[2], 1);
  }

  create() {

    // the indicies to get the values for each traingle
    this.indices = new Uint32Array([
                            //Front
                             0, 1, 2,
                             0, 2, 3,
                            // Right
                            4, 5, 6,
                            4, 6, 7,
                            // Left
                            8, 9, 10,
                            8, 10, 11,
                            // Back
                            12, 13, 14,
                            12, 14, 15,
                            // Top
                            16, 17, 18,
                            16, 18, 19,
                            // Bottom
                            20, 21, 22,
                            20, 22, 23                                                                       
    ]);

    // all notmals face outward (postive) of according xyz direction
this.normals = new Float32Array([
                           // Front
                           0, 0, 1, 0,
                           0, 0, 1, 0,
                           0, 0, 1, 0,
                           0, 0, 1, 0,
                           // Right
                           1, 0, 0, 0,
                           1, 0, 0, 0,
                           1, 0, 0, 0,
                           1, 0, 0, 0,
                           // Left
                           1, 0, 0, 0,
                           1, 0, 0, 0,
                           1, 0, 0, 0,
                           1, 0, 0, 0,
                           // Back
                           0, 0, 1, 0,
                           0, 0, 1, 0,
                           0, 0, 1, 0,
                           0, 0, 1, 0,
                           // Top
                           0, 1, 0, 0,
                           0, 1, 0, 0,
                           0, 1, 0, 0,
                           0, 1, 0, 0,
                           // Bottom
                           0, 1, 0, 0,
                           0, 1, 0, 0,
                           0, 1, 0, 0,
                           0, 1, 0, 0 
]);

this.positions = new Float32Array([
                           // Front
                           0.5,  0.5,  0.5, 1.0,
                           0.5, -0.5,  0.5, 1.0,
                           -0.5, -0.5,  0.5, 1.0,
                           -0.5,  0.5,  0.5, 1.0,
                           // Right
                           0.5,  0.5, -0.5, 1.0,
                           0.5, -0.5, -0.5, 1.0,
                           0.5, -0.5,  0.5, 1.0,
                           0.5,  0.5,  0.5, 1.0,
                           // Left
                           -0.5,  0.5,  0.5, 1.0,
                           -0.5, -0.5,  0.5, 1.0,
                           -0.5, -0.5, -0.5, 1.0,
                           -0.5,  0.5, -0.5, 1.0,
                           // Back
                           -0.5,  0.5, -0.5, 1.0,
                           -0.5, -0.5, -0.5, 1.0,
                           0.5, -0.5, -0.5, 1.0,
                           0.5,  0.5, -0.5, 1.0,
                           // Top
                           0.5,  0.5, -0.5, 1.0,
                           0.5,  0.5,  0.5, 1.0,
                           -0.5,  0.5,  0.5, 1.0,
                           -0.5,  0.5, -0.5, 1.0,
                           // Bottom
                           0.5, -0.5,  0.5, 1.0,
                           0.5, -0.5, -0.5, 1.0,
                           -0.5, -0.5, -0.5, 1.0,
                           -0.5, -0.5,  0.5, 1.0 
]);
 //------------------------------------------------------------------
// for a square
  // this.indices = new Uint32Array([0, 1, 2,
  //                                 0, 2, 3]);
  // this.normals = new Float32Array([0, 0, 1, 0,
  //                                  0, 0, 1, 0,
  //                                  0, 0, 1, 0,
  //                                  0, 0, 1, 0]);
  // this.positions = new Float32Array([-1, -1, 0, 1,
  //                                    1, -1, 0, 1,
  //                                    1, 1, 0, 1,
  //                                    -1, 1, 0, 1]);
// ---------------------------------------------------------------------
    this.generateIdx();
    this.generatePos();
    this.generateNor();
    this.generateUV();
    this.generateCol();

    this.generateTransformC1();
    this.generateTransformC2();
    this.generateTransformC3();
    this.generateTransformC4();

    this.count = this.indices.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufNor);
    gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
    gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);

    console.log(`Created cube`);
  }

  setInstanceVBOs(inC1: Float32Array, inC2: Float32Array, inC3: Float32Array, inC4: Float32Array, inColors: Float32Array) {
    this.transC1 = inC1;
    this.transC2 = inC2;
    this.transC3 = inC3;
    this.transC4 = inC4;
    this.colors = inColors;  
  
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol);
    gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);
   
    // Added
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransformC1);
    gl.bufferData(gl.ARRAY_BUFFER, this.transC1, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransformC2);
    gl.bufferData(gl.ARRAY_BUFFER, this.transC2, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransformC3);
    gl.bufferData(gl.ARRAY_BUFFER, this.transC3, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransformC4);
    gl.bufferData(gl.ARRAY_BUFFER, this.transC4, gl.STATIC_DRAW);
  }
};

export default Cube;
