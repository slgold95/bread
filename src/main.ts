import {vec3, vec4, mat4, quat} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Square from './geometry/Square';
import MySquare from './geometry/MySquare';
import MyIcosphere from './geometry/MyIcosphere';
import ScreenQuad from './geometry/ScreenQuad';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import {readTextFile, get3DTex} from './globals';
import Mesh from './geometry/Mesh'; // for obj loading
import Texture from './rendering/gl/Texture';
import Texture3D from './rendering/gl/Texture3D';
import Cube from './geometry/Cube';
import Voxelization from './binvox/Voxelization'

const controls = {
  'Cherries': createCherries,
  'Knight': createKnight,
  'Car': createCar,
  'Loafs': createLoafs,
  xMin: 0.0,
  yMin: 0.0,
  zMin: 0.0,
  xMax: 5.0,
  yMax: 5.0,
  zMax: 5.0,
  'Bake': bakeBread,
};

// booleans
let showCherries: boolean = true;
let showKnight: boolean = false;
let showCar: boolean = false;
let showLoafs: boolean = false;
let baked: boolean = false;

let currMinX: number;
let currMaxX: number;
let currMinY: number;
let currMaxY: number;
let currMinZ: number;
let currMaxZ: number;

let mySquare: MySquare;
let screenQuad: ScreenQuad;
let voxelCube: Mesh;

// shapes
let sphere: MyIcosphere;
let cubeObj: Mesh;
let wahoo: Mesh;
let time: number = 0.0;

// filepaths
let voxelArrayPath: string;
let voxelArrayOuterPath: string;

// Texture
let breadSource: Texture;

function createCherries(): void {
  showCherries = true;
  showKnight = false;
  showCar = false;
  showLoafs = false;  
  baked = false;

  voxelArrayPath = './src/binvox/cherryFullOfVoxels50.txt';
  voxelArrayOuterPath = './src/binvox/cherryOuter50.txt'; 
  voxelization.length = 52.0;

  // get the texture
  voxelArray = populateVoxelArray(voxelArrayPath);
  voxelArrayOuter = populateVoxelArray(voxelArrayOuterPath);
  voxelization.setUpTexture(voxelArray, voxelArrayOuter);
  // populate the VBOs with unbaked bread data
  voxelCube = voxelization.populateVoxelVBOs(voxelCube, voxelArrayPath, controls.xMin, controls.yMin, controls.zMin,
    controls.xMax, controls.yMax, controls.zMax, baked, 1.0);
}

function createKnight(): void {
  showCherries = false;
  showKnight = true;
  showCar = false;
  showLoafs = false;    
  baked = false; 

  voxelArrayPath = './src/binvox/chevalierFullOfVoxels50.txt';
  voxelArrayOuterPath = './src/binvox/chevalierOuter50.txt';
  voxelization.length = 50.0; 
  
  // get the texture
  voxelArray = populateVoxelArray(voxelArrayPath);  
  voxelArrayOuter = populateVoxelArray(voxelArrayOuterPath);
  voxelization.setUpTexture(voxelArray, voxelArrayOuter);
  // populate the VBOs with unbaked bread data
  voxelCube = voxelization.populateVoxelVBOs(voxelCube, voxelArrayPath, controls.xMin, controls.yMin, controls.zMin,
    controls.xMax, controls.yMax, controls.zMax, baked, 2.0);
}

function createCar(): void {
  showCherries = false;
  showKnight = false;
  showCar = true;
  showLoafs = false; 
  baked = false;
  
  voxelArrayPath = './src/binvox/carFullOfVoxels50.txt';
  voxelArrayOuterPath = './src/binvox/carOuter50.txt';
  voxelization.length = 50;
  
  // get the texture
  voxelArray = populateVoxelArray(voxelArrayPath);  
  voxelArrayOuter = populateVoxelArray(voxelArrayOuterPath);
  voxelization.setUpTexture(voxelArray, voxelArrayOuter);
  // populate the VBOs with unbaked bread data
  voxelCube = voxelization.populateVoxelVBOs(voxelCube, voxelArrayPath, controls.xMin, controls.yMin, controls.zMin,
    controls.xMax, controls.yMax, controls.zMax, baked, 3.0);
}

function createLoafs(): void {
  showCherries = false;
  showKnight = false;
  showCar = false;
  showLoafs = true; 
  baked = false;
  
  voxelArrayPath = './src/binvox/breadFullOfVoxels50.txt';
  voxelArrayOuterPath = './src/binvox/breadOuter50.txt';
  voxelization.length = 52;
  
  // get the texture
  voxelArray = populateVoxelArray(voxelArrayPath);  
  voxelArrayOuter = populateVoxelArray(voxelArrayOuterPath);
  voxelization.setUpTexture(voxelArray, voxelArrayOuter);
  // populate the VBOs with unbaked bread data
  voxelCube = voxelization.populateVoxelVBOs(voxelCube, voxelArrayPath, controls.xMin, controls.yMin, controls.zMin,
    controls.xMax, controls.yMax, controls.zMax, baked, 4.0);
}

function bakeBread(): void {
  baked = true;
  if(showCherries){
    //console.log("bake the Cherries bread"); 
    voxelArray = populateVoxelArray(voxelArrayPath);
    voxelArrayOuter = populateVoxelArray(voxelArrayOuterPath);
    voxelization.setUpTexture(voxelArray, voxelArrayOuter);
    // get the bubbles
    voxelization.getBubbles();
    voxelCube = voxelization.populateVoxelVBOs(voxelCube, voxelArrayPath, controls.xMin, controls.yMin, controls.zMin,
      controls.xMax, controls.yMax, controls.zMax, baked, 1.0);  
  }
  if(showKnight){
    //console.log("bake the knight bread");
    voxelArray = populateVoxelArray(voxelArrayPath);
    voxelArrayOuter = populateVoxelArray(voxelArrayOuterPath);
    voxelization.setUpTexture(voxelArray, voxelArrayOuter);
    // get the bubbles
    voxelization.getBubbles();
    voxelCube = voxelization.populateVoxelVBOs(voxelCube, voxelArrayPath, controls.xMin, controls.yMin, controls.zMin,
      controls.xMax, controls.yMax, controls.zMax, baked, 2.0);  
  }
  if(showCar){
    //console.log("bake the Car bread");
    voxelArray = populateVoxelArray(voxelArrayPath);
    voxelArrayOuter = populateVoxelArray(voxelArrayOuterPath);
    voxelization.setUpTexture(voxelArray, voxelArrayOuter);
    // get the bubbles
    voxelization.getBubbles();
    voxelCube = voxelization.populateVoxelVBOs(voxelCube, voxelArrayPath, controls.xMin, controls.yMin, controls.zMin,
      controls.xMax, controls.yMax, controls.zMax, baked, 3.0);
  }
  if(showLoafs){
    //console.log("bake the breadloaf bread");
    voxelArray = populateVoxelArray(voxelArrayPath);
    voxelArrayOuter = populateVoxelArray(voxelArrayOuterPath);
    voxelization.setUpTexture(voxelArray, voxelArrayOuter);
    // get the bubbles
    voxelization.getBubbles();
    voxelCube = voxelization.populateVoxelVBOs(voxelCube, voxelArrayPath, controls.xMin, controls.yMin, controls.zMin,
      controls.xMax, controls.yMax, controls.zMax, baked, 4.0);
  }
}

// Function to parse the voxel data from .txt file ------------------------------------------------
function populateVoxelArray(textFilePath: string): any {
  let voxelString: string = readTextFile(textFilePath);
  var parsedArray = voxelString.split('\n');
  let voxelArray: any = []; // array for the vec3s of voxel position data
  //console.log(parsedArray);
  for (var i = 0; i < parsedArray.length; i ++){    
    var newArray = parsedArray[i].split(/[ ,]+/);
    //console.log(newArray);
    voxelArray.push(parseFloat(newArray[0])); 
    voxelArray.push(parseFloat(newArray[1])); 
    voxelArray.push(parseFloat(newArray[2]));    
  } 
  return voxelArray;
}
// --------------------------------------------------------------------------------------------

// function to populate VBO data for the voxels
// pass in the mesh (instance cubes), pass in the voxel array to grab data from
// function populateVoxelVOBs(voxelCube: Mesh, voxelArray: any[], distanceArray: any[]){
//     let cubeColorsArray = []; 
//     let cubeCol1Array = []; 
//     let cubeCol2Array = []; 
//     let cubeCol3Array = []; 
//     let cubeCol4Array = [];  
//     let scale: number = 1.0;
//     let loopNum: number = 0;
//     let numInstances = voxelArray.length/3.0;   
    
//   for(var i = 0; i < numInstances * 3; i += 3) {
//     // min and max X
//     let a: number = voxelArray[i];
//     let b: number = voxelArray[i];
//     // min and max Y
//     let c: number = voxelArray[i + 1];
//     let d: number = voxelArray[i + 1];
//     // min and max Z
//     let e: number = voxelArray[i + 2];
//     let f: number = voxelArray[i + 2];

//     if (a < currMinX * 10 || b > currMaxX * 10 || c < currMinY * 10 || d > currMaxY * 10 || e < currMinZ * 10 || f > currMaxZ * 10) {
//       // do not populate VBOs, skip them entirely
//       continue;
//     }
//     // colors
//     cubeColorsArray.push(distanceArray[i]); // blurs the edges  // R channel - pass the distance values to frag shader
//     cubeColorsArray.push(0.0); // G channel - pass the maximum value found in the distance array
//     cubeColorsArray.push(1.0); // B 
//     cubeColorsArray.push(1.0); // alpha
//     // transform column 1
//     cubeCol1Array.push(scale);
//     cubeCol1Array.push(0.0);
//     cubeCol1Array.push(0.0);
//     cubeCol1Array.push(0.0);
//     // transform column 2
//     cubeCol2Array.push(0.0);
//     cubeCol2Array.push(scale);
//     cubeCol2Array.push(0.0);
//     cubeCol2Array.push(0.0);
//     // transform column 3
//     cubeCol3Array.push(0.0);
//     cubeCol3Array.push(0.0);
//     cubeCol3Array.push(scale);
//     cubeCol3Array.push(0.0);
//     // transform column 4
//     cubeCol4Array.push(voxelArray[i] - 15);// - 50.0); // minus 50 to center Wahoo at 0
//     cubeCol4Array.push(voxelArray[i + 1] - 15);// - 50.0); 
//     cubeCol4Array.push(voxelArray[i + 2] - 20);// - 20.0); 
//     cubeCol4Array.push(1.0);
//     loopNum ++; // use this as the num instances to account for skipped loopings
//     }
//   let cubeCol1: Float32Array = new Float32Array(cubeCol1Array);
//   let cubeCol2: Float32Array = new Float32Array(cubeCol2Array);
//   let cubeCol3: Float32Array = new Float32Array(cubeCol3Array);
//   let cubeCol4: Float32Array = new Float32Array(cubeCol4Array);
//   let cubeColors: Float32Array = new Float32Array(cubeColorsArray);
//   voxelCube.setInstanceVBOs(cubeCol1, cubeCol2, cubeCol3, cubeCol4, cubeColors);
//   voxelCube.setNumInstances(loopNum); 
// }
// -------------------------------------------------------------------------------------------------------

let voxelArray: any = []; // array for the vec3
let voxelArrayOuter: any = []; // array for the vec3
let distanceArrayWahoo: any = []; // to hold the distance between inner-voxels and outer-voxels

let voxelization: Voxelization;

function loadScene() {
  mySquare = new MySquare();
  mySquare.create();
  screenQuad = new ScreenQuad();
  screenQuad.create();

  //breadSource = new Texture('./src/binvox/fractal.jpg', 1);
  breadSource = new Texture('./src/binvox/innerBread.jpg', 1);

  // For instance rendering the voxels ------------------------------------------------------
  let cubeString: string = readTextFile('./src/geometry/cube.obj');
  //let cubeString: string = readTextFile('./src/geometry/subdividedCube.obj');
  voxelCube = new Mesh(cubeString, vec3.fromValues(0.0, 0.0, 0.0));
  voxelCube.create();

  showLoafs = true;
    
  // // Wahoo Mesh
  // let objWahoo: string = readTextFile('./src/geometry/wahoo.obj');
  // wahoo = new Mesh(objWahoo, vec3.fromValues(0.0, 0.0, 0.0));
  // wahoo.create();
    
  // set up mesh VBOs
  // let wahooColorsArray: number[] = [1.0, 0.0, 0.0, 1.0]; // red
  // let col1Array: number[] = [1.0, 0, 0, 0]; // scale x
  // let col2Array: number[] = [0, 1.0, 0, 0]; // scale y
  // let col3Array: number[] = [0, 0, 1.0, 0]; // scale z
  // let col4Array: number[] = [0, 0, 0, 1]; // translation
  // let col1: Float32Array = new Float32Array(col1Array);
  // let col2: Float32Array = new Float32Array(col2Array);
  // let col3: Float32Array = new Float32Array(col3Array);
  // let col4: Float32Array = new Float32Array(col4Array);
  // let colors: Float32Array = new Float32Array(wahooColorsArray);
  // wahoo.setInstanceVBOs(col1, col2, col3, col4, colors);
  // wahoo.setNumInstances(1); 
   
  // Set up instanced rendering data arrays here.
  // This example creates a set of positional
  // offsets and gradiated colors for a 100x100 grid
  // of squares, even though the VBO data for just
  // one square is actually passed to the GPU
   
}

function main() {
  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // Add controls to the gui
  const gui = new DAT.GUI();
  gui.add(controls, 'Cherries');
  gui.add(controls, 'Knight');
  gui.add(controls, 'Car');
  gui.add(controls, 'Loafs');
  gui.add(controls, 'xMin', 0.0, 5.0).step(0.1);
  gui.add(controls, 'yMin', 0.0, 5.0).step(0.1);
  gui.add(controls, 'zMin', 0.0, 5.0).step(0.1);
  gui.add(controls, 'xMax', 0.0, 5.0).step(0.1);
  gui.add(controls, 'yMax', 0.0, 5.0).step(0.1);
  gui.add(controls, 'zMax', 0.0, 5.0).step(0.1);
  gui.add(controls, 'Bake');

  // set the gui parameters
  currMinX = controls.xMin;
  currMaxX = controls.xMax;
  currMinY = controls.yMin;
  currMaxY = controls.yMax;
  currMinZ = controls.zMin;
  currMaxZ = controls.zMax;
  
  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // Initial call to load scene
  loadScene();

  const camera = new Camera(vec3.fromValues(10, 10, 10), vec3.fromValues(0, 0, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.2, 0.2, 0.2, 1);
  //gl.enable(gl.BLEND);
  //gl.blendFunc(gl.ONE, gl.ONE); // Additive blending
  gl.enable(gl.DEPTH_TEST);

  const instancedShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/instanced-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/instanced-frag.glsl')),
  ]);

  const flat = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/flat-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/flat-frag.glsl')),
  ]);

  const textureShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/texture-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/texture-frag.glsl')),
  ]);

  const textureShader2 = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/texture2-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/texture2-frag.glsl')),
  ]);
  
  // initialize the voxelization
  voxelization = new Voxelization();

  // bind texture
  textureShader2.bindTexToUnit(textureShader2.unifSampler1, breadSource, 0);

  // This function will be called every frame
  function tick() {
    camera.update();
    stats.begin();
    instancedShader.setTime(time);
    flat.setTime(time++);
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);

    // pass gui slider values
    textureShader2.setMinPos(vec3.fromValues(controls.xMin, controls.yMin, controls.zMin));
    textureShader2.setMaxPos(vec3.fromValues(controls.xMax, controls.yMax, controls.zMax));
      
    renderer.clear();
    //renderer.render(camera, flat, [screenQuad]);
    renderer.render(camera, textureShader2, [screenQuad]);
      
    // Show Cherries only
    if(showCherries && !showKnight && !showCar && !showLoafs) {      
      renderer.render(camera, instancedShader, [voxelCube]);
       // slicing through mesh
       // Min and Max X
       if((currMinX - controls.xMin) != 0.0){
       currMinX = controls.xMin;
       voxelCube = voxelization.populateVoxelVBOs(voxelCube, voxelArrayPath, currMinX, currMinY, currMinZ, currMaxX, currMaxY, currMaxZ, baked, 1.0);
       }
       if((currMaxX - controls.xMax) != 0.0){
       currMaxX = controls.xMax;
       voxelCube = voxelization.populateVoxelVBOs(voxelCube, voxelArrayPath, currMinX, currMinY, currMinZ, currMaxX, currMaxY, currMaxZ, baked, 1.0);       }
       // Min and Max Y
       if((currMinY - controls.yMin) != 0.0){
       currMinY = controls.yMin; 
       voxelCube = voxelization.populateVoxelVBOs(voxelCube, voxelArrayPath, currMinX, currMinY, currMinZ, currMaxX, currMaxY, currMaxZ, baked, 1.0);  
       }
     if((currMaxY - controls.yMax) != 0.0){
      currMaxY = controls.yMax;
      voxelCube = voxelization.populateVoxelVBOs(voxelCube, voxelArrayPath, currMinX, currMinY, currMinZ, currMaxX, currMaxY, currMaxZ, baked, 1.0);
      }
     // Min and Max Z
     if((currMinZ - controls.zMin) != 0.0){
      currMinZ = controls.zMin; 
      voxelCube = voxelization.populateVoxelVBOs(voxelCube, voxelArrayPath, currMinX, currMinY, currMinZ, currMaxX, currMaxY, currMaxZ, baked, 1.0);   
      }
     if((currMaxZ - controls.zMax) != 0.0){
      currMaxZ = controls.zMax;
      voxelCube = voxelization.populateVoxelVBOs(voxelCube, voxelArrayPath, currMinX, currMinY, currMinZ, currMaxX, currMaxY, currMaxZ, baked, 1.0);
      }      
    } // closes the if to render the wahoo only

    // show the knight only
    if(!showCherries && showKnight && !showCar && !showLoafs) {
      //renderer.render(camera, instancedShader, [knight]);     
      renderer.render(camera, instancedShader, [voxelCube]); 
      // slicing through mesh
       // Min and Max X
       if((currMinX - controls.xMin) != 0.0){
        currMinX = controls.xMin;
        voxelCube = voxelization.populateVoxelVBOs(voxelCube, voxelArrayPath, currMinX, currMinY, currMinZ, currMaxX, currMaxY, currMaxZ, baked, 2.0);
        }
        if((currMaxX - controls.xMax) != 0.0){
        currMaxX = controls.xMax;
        voxelCube = voxelization.populateVoxelVBOs(voxelCube, voxelArrayPath, currMinX, currMinY, currMinZ, currMaxX, currMaxY, currMaxZ, baked, 2.0);
        }
        // Min and Max Y
        if((currMinY - controls.yMin) != 0.0){
        currMinY = controls.yMin; 
        voxelCube = voxelization.populateVoxelVBOs(voxelCube, voxelArrayPath, currMinX, currMinY, currMinZ, currMaxX, currMaxY, currMaxZ, baked, 2.0);
      }
      if((currMaxY - controls.yMax) != 0.0){
       currMaxY = controls.yMax;
       voxelCube = voxelization.populateVoxelVBOs(voxelCube, voxelArrayPath, currMinX, currMinY, currMinZ, currMaxX, currMaxY, currMaxZ, baked, 2.0);
      }
      // Min and Max Z
      if((currMinZ - controls.zMin) != 0.0){
       currMinZ = controls.zMin; 
       voxelCube = voxelization.populateVoxelVBOs(voxelCube, voxelArrayPath, currMinX, currMinY, currMinZ, currMaxX, currMaxY, currMaxZ, baked, 2.0);
      }
      if((currMaxZ - controls.zMax) != 0.0){
       currMaxZ = controls.zMax;
       voxelCube = voxelization.populateVoxelVBOs(voxelCube, voxelArrayPath, currMinX, currMinY, currMinZ, currMaxX, currMaxY, currMaxZ, baked, 2.0);
      }      
    }
    // show the car only
    if(!showCherries && !showKnight && showCar && !showLoafs) {     
      //renderer.render(camera, instancedShader, [car]);
      renderer.render(camera, instancedShader, [voxelCube]);
       // Min and Max X
       if((currMinX - controls.xMin) != 0.0){
        currMinX = controls.xMin;
        voxelCube = voxelization.populateVoxelVBOs(voxelCube, voxelArrayPath, currMinX, currMinY, currMinZ, currMaxX, currMaxY, currMaxZ, baked, 3.0);
        }
        if((currMaxX - controls.xMax) != 0.0){
        currMaxX = controls.xMax;
        voxelCube = voxelization.populateVoxelVBOs(voxelCube, voxelArrayPath, currMinX, currMinY, currMinZ, currMaxX, currMaxY, currMaxZ, baked, 3.0);
        }
        // Min and Max Y
        if((currMinY - controls.yMin) != 0.0){
        currMinY = controls.yMin; 
        voxelCube = voxelization.populateVoxelVBOs(voxelCube, voxelArrayPath, currMinX, currMinY, currMinZ, currMaxX, currMaxY, currMaxZ, baked, 3.0);
      }
      if((currMaxY - controls.yMax) != 0.0){
       currMaxY = controls.yMax;
       voxelCube = voxelization.populateVoxelVBOs(voxelCube, voxelArrayPath, currMinX, currMinY, currMinZ, currMaxX, currMaxY, currMaxZ, baked, 3.0);
      }
      // Min and Max Z
      if((currMinZ - controls.zMin) != 0.0){
       currMinZ = controls.zMin; 
       voxelCube = voxelization.populateVoxelVBOs(voxelCube, voxelArrayPath, currMinX, currMinY, currMinZ, currMaxX, currMaxY, currMaxZ, baked, 3.0);
      }
      if((currMaxZ - controls.zMax) != 0.0){
       currMaxZ = controls.zMax;
       voxelCube = voxelization.populateVoxelVBOs(voxelCube, voxelArrayPath, currMinX, currMinY, currMinZ, currMaxX, currMaxY, currMaxZ, baked, 3.0);
      }          
    }
    // show the loafs only
    if(!showCherries && !showKnight && !showCar && showLoafs) {      
      renderer.render(camera, instancedShader, [voxelCube]);
       // slicing through mesh
       // Min and Max X
       if((currMinX - controls.xMin) != 0.0){
       currMinX = controls.xMin;
       voxelCube = voxelization.populateVoxelVBOs(voxelCube, voxelArrayPath, currMinX, currMinY, currMinZ, currMaxX, currMaxY, currMaxZ, baked, 4.0);
       }
       if((currMaxX - controls.xMax) != 0.0){
       currMaxX = controls.xMax;
       voxelCube = voxelization.populateVoxelVBOs(voxelCube, voxelArrayPath, currMinX, currMinY, currMinZ, currMaxX, currMaxY, currMaxZ, baked, 4.0);       }
       // Min and Max Y
       if((currMinY - controls.yMin) != 0.0){
       currMinY = controls.yMin; 
       voxelCube = voxelization.populateVoxelVBOs(voxelCube, voxelArrayPath, currMinX, currMinY, currMinZ, currMaxX, currMaxY, currMaxZ, baked, 4.0);  
       }
     if((currMaxY - controls.yMax) != 0.0){
      currMaxY = controls.yMax;
      voxelCube = voxelization.populateVoxelVBOs(voxelCube, voxelArrayPath, currMinX, currMinY, currMinZ, currMaxX, currMaxY, currMaxZ, baked, 4.0);
      }
     // Min and Max Z
     if((currMinZ - controls.zMin) != 0.0){
      currMinZ = controls.zMin; 
      voxelCube = voxelization.populateVoxelVBOs(voxelCube, voxelArrayPath, currMinX, currMinY, currMinZ, currMaxX, currMaxY, currMaxZ, baked, 4.0);   
      }
     if((currMaxZ - controls.zMax) != 0.0){
      currMaxZ = controls.zMax;
      voxelCube = voxelization.populateVoxelVBOs(voxelCube, voxelArrayPath, currMinX, currMinY, currMinZ, currMaxX, currMaxY, currMaxZ, baked, 4.0);
      }      
    }
    
    stats.end();

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
    flat.setDimensions(window.innerWidth, window.innerHeight);
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();
  flat.setDimensions(window.innerWidth, window.innerHeight);

  // Start the render loop
  tick();
}

main();