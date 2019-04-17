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
import {readTextFile} from './globals';
import Mesh from './geometry/Mesh'; // for obj loading
import Texture from './rendering/gl/Texture';
import Texture3D from './rendering/gl/Texture3D';

const controls = {
  'Wahoo': createWahoo,
  'Knight': createKnight,
  'Hand': createHand,
  xMin: 0.0,
  yMin: 0.0,
  zMin: 0.0,
  xMax: 0.0,
  yMax: 0.0,
  zMax: 0.0,
};

// booleans
let showWahoo: boolean = true;
let showKnight: boolean = false;
let showHand: boolean = false;

let mySquare: MySquare;
let screenQuad: ScreenQuad;

// shapes
let sphere: MyIcosphere;
let cubeObj: Mesh;
let wahoo: Mesh;
let knight: Mesh;
let hand: Mesh;
let time: number = 0.0;


function createWahoo(): void{
  showWahoo = true;
  showKnight = false;
  showHand = false;
}

function createKnight(): void{
  showWahoo = false;
  showKnight = true;
  showHand = false;
}

function createHand(): void{
  showWahoo = false;
  showKnight = false;
  showHand = true;
}

let marioTexture: Texture;
let wahoo3D: Texture3D;

function loadScene() {
  mySquare = new MySquare();
  mySquare.create();
  screenQuad = new ScreenQuad();
  screenQuad.create();

  // Mario Texture
  marioTexture = new Texture('./src/binvox/fractal.jpg', 0);
  //marioTexture = new Texture('./src/binvox/wahoo.raw', 0);
  wahoo3D = new Texture3D('./src/binvox/wahoo.raw', 0);

  // Sphere - using MyIcosphere
  sphere = new MyIcosphere(vec3.fromValues(0.0, 0.0, 0.0), 1.0, 5);
  sphere.create();

  // Cube
  let cubeString: string = readTextFile('./src/geometry/cube.obj');
  cubeObj = new Mesh(cubeString, vec3.fromValues(0.0, 0.0, 0.0));
  cubeObj.create();
  
  // Wahoo Mesh
  let objWahoo: string = readTextFile('./src/geometry/wahoo.obj');
  wahoo = new Mesh(objWahoo, vec3.fromValues(0.0, 0.0, 0.0));
  wahoo.create();

  // Knight
  let obj0: string = readTextFile('./src/binvox/chevalier.obj');
  knight = new Mesh(obj0, vec3.fromValues(0.0, 0.0, 0.0));
  knight.create();

  // Hand
  let obj1: string = readTextFile('./src/binvox/gipshand2-3k.obj');
  hand = new Mesh(obj1, vec3.fromValues(0.0, 0.0, 0.0));
  hand.create();
    
  // set up mesh VBOs
  let wahooColorsArray: number[] = [1.0, 0.0, 0.0, 1.0]; // red
  let col1Array: number[] = [1.0, 0, 0, 0]; // scale x
  let col2Array: number[] = [0, 1.0, 0, 0]; // scale y
  let col3Array: number[] = [0, 0, 1.0, 0]; // scale z
  let col4Array: number[] = [0, 0, 0, 1]; // translation
  let col1: Float32Array = new Float32Array(col1Array);
  let col2: Float32Array = new Float32Array(col2Array);
  let col3: Float32Array = new Float32Array(col3Array);
  let col4: Float32Array = new Float32Array(col4Array);
  let colors: Float32Array = new Float32Array(wahooColorsArray);
  wahoo.setInstanceVBOs(col1, col2, col3, col4, colors);
  wahoo.setNumInstances(1); 
  
   // set up mesh VBOs
   let sphereColorsArray: number[] = [0.0, 0.0, 1.0, 1.0]; // blue
   let sphereCol1Array: number[] = [3.0, 0, 0, 0]; // scale x
   let sphereCol2Array: number[] = [0, 3.0, 0, 0]; // scale y
   let sphereCol3Array: number[] = [0, 0, 3.0, 0]; // scale z
   let sphereCol4Array: number[] = [0, 0, 0, 1]; // translation
   let sphereCol1: Float32Array = new Float32Array(sphereCol1Array);
   let sphereCol2: Float32Array = new Float32Array(sphereCol2Array);
   let sphereCol3: Float32Array = new Float32Array(sphereCol3Array);
   let sphereCol4: Float32Array = new Float32Array(sphereCol4Array);
   let sphereColors: Float32Array = new Float32Array(sphereColorsArray);
  sphere.setInstanceVBOs(sphereCol1, sphereCol2, sphereCol3, sphereCol4, sphereColors);
  sphere.setNumInstances(1); 
  cubeObj.setInstanceVBOs(sphereCol1, sphereCol2, sphereCol3, sphereCol4, sphereColors);
  cubeObj.setNumInstances(1); 

  // set up mesh VBOs
  let knightColorsArray: number[] = [0.0, 0.0, 1.0, 1.0]; // blue
  let knightCol1Array: number[] = [5.0, 0, 0, 0]; // scale x
  let knightCol2Array: number[] = [0, 5.0, 0, 0]; // scale y
  let knightCol3Array: number[] = [0, 0, 5.0, 0]; // scale z
  let knightCol4Array: number[] = [0, -4.0, 0, 1]; // translation
  let knightCol1: Float32Array = new Float32Array(knightCol1Array);
  let knightCol2: Float32Array = new Float32Array(knightCol2Array);
  let knightCol3: Float32Array = new Float32Array(knightCol3Array);
  let knightCol4: Float32Array = new Float32Array(knightCol4Array);
  let knightColors: Float32Array = new Float32Array(knightColorsArray);
  knight.setInstanceVBOs(knightCol1, knightCol2, knightCol3, knightCol4, knightColors);
  knight.setNumInstances(1); 

  // set up mesh VBOs
  let handColorsArray: number[] = [0.0, 0.0, 1.0, 1.0]; // blue
  let handCol1Array: number[] = [0.05, 0, 0, 0]; // scale x
  let handCol2Array: number[] = [0, 0.05, 0, 0]; // scale y
  let handCol3Array: number[] = [0, 0, 0.05, 0]; // scale z
  let handCol4Array: number[] = [0, 0.0, 0, 1]; // translation
  let handCol1: Float32Array = new Float32Array(handCol1Array);
  let handCol2: Float32Array = new Float32Array(handCol2Array);
  let handCol3: Float32Array = new Float32Array(handCol3Array);
  let handCol4: Float32Array = new Float32Array(handCol4Array);
  let handColors: Float32Array = new Float32Array(handColorsArray);
  hand.setInstanceVBOs(handCol1, handCol2, handCol3, handCol4, handColors);
  hand.setNumInstances(1); 
 
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
  gui.add(controls, 'Wahoo');
  gui.add(controls, 'Knight');
  gui.add(controls, 'Hand');
  gui.add(controls, 'xMin', -1.0, 1.0).step(0.1);
  gui.add(controls, 'yMin', -1.0, 1.0).step(0.1);
  gui.add(controls, 'zMin', -1.0, 1.0).step(0.1);
  gui.add(controls, 'xMax', -1.0, 1.0).step(0.1);
  gui.add(controls, 'yMax', -1.0, 1.0).step(0.1);
  gui.add(controls, 'zMax', -1.0, 1.0).step(0.1);
  
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

  instancedShader.bindTexToUnit(instancedShader.unifSampler1, marioTexture, 0);
  textureShader.bindTexToUnit2(textureShader.unifSampler1, wahoo3D, 0);

  // This function will be called every frame
  function tick() {
    camera.update();
    stats.begin();
    instancedShader.setTime(time);
    flat.setTime(time++);
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);

    // pass gui slider values
    textureShader.setMinX(controls.xMin);
      
    renderer.clear();
    renderer.render(camera, flat, [screenQuad]);
    // renderer.render(camera, instancedShader, [          
    //   sphere, 
    //   wahoo,     
    // ]);
    // Show Wahoo only
    if(showWahoo && !showKnight && !showHand) {
      //renderer.render(camera, instancedShader, [sphere]);
      //renderer.render(camera, instancedShader, [wahoo]);
      renderer.render(camera, textureShader, [wahoo]);
    }
    // show the knight only
    if(!showWahoo && showKnight && !showHand) {
      renderer.render(camera, instancedShader, [knight]);      
    }
    // show the hand
    if(!showWahoo && !showKnight && showHand) {
      //renderer.render(camera, instancedShader, [wahoo]);
      renderer.render(camera, instancedShader, [hand]); // the coloring is strange? maybe reverse the normals
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