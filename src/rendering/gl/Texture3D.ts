import {gl} from '../../globals';
import { readFile } from 'fs';

export class Texture3D {
  texture: WebGLTexture;

  bindTex() {
  	  gl.bindTexture(gl.TEXTURE_3D, this.texture);
  }

  handle(): WebGLTexture {
  	return this.texture;
  }

  isPowerOf2(value: number) : boolean {
      return (value & (value - 1)) == 0;
  }

  constructor(imgSource: string, clampVert: number) {
  	this.texture = gl.createTexture();
  	this.bindTex();

    // create a white pixel to serve as placeholder
  	const formatSrc = gl.RGBA;
  	const formatDst = gl.RGBA;
  	const lvl = 0;
  	const phWidth = 1; // placeholder
    const phHeight = 1;
    const phDepth = 1;
  	const phImg = new Uint8Array([255, 255, 255, 255]);
    const formatBit = gl.UNSIGNED_BYTE; // TODO: HDR
    
    // gl get error

      //          target,    level, internal format, width,height,depth, border, format, type, data
  	gl.texImage3D(gl.TEXTURE_3D, lvl, formatDst, phWidth, phHeight, phDepth, 0, formatSrc, formatBit, phImg);

    // get a javascript image locally and load it. not instant but will auto-replace white pixel
    
    //const img = new Image();
    
    let SIZE: number = 200;
    //let raw: string = readFile();
    let data: Uint8Array = new Uint8Array(SIZE * SIZE * SIZE);
    for (var k = 0; k < SIZE; ++k) {
        for (var j = 0; j < SIZE; ++j) {
            for (var i = 0; i < SIZE; ++i) {
                data[i + j * SIZE + k * SIZE * SIZE] = Math.sin(i) * 256;
          }
       }
    }    

    if(clampVert == 0) {   
      //debugger;   
    	//img.onload = function() {
        //debugger;
        console.log("3D: image onload function (if)");
    		this.bindTex();
        //gl.texImage3D(gl.TEXTURE_3D, lvl, formatDst, img.width, img.height, phDepth, 0, formatSrc, formatBit, img);
        gl.texImage3D(gl.TEXTURE_3D, lvl, formatDst, SIZE, SIZE, SIZE, 0, formatSrc, formatBit, data);
    		gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        //gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_R, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); 
    	//}.bind(this);
  }
  else {
    //debugger;
    //img.onload = function() {
      //debugger;
      console.log("3D: image onload function (else)");
      this.bindTex();
      // gl.texImage3D(gl.TEXTURE_3D, lvl, formatDst, img.width, img.height, phDepth, 0, formatSrc, formatBit, img);
      gl.texImage3D(gl.TEXTURE_3D, lvl, formatDst, SIZE, SIZE, SIZE, 0, formatSrc, formatBit, data);
      gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    //}.bind(this);
  }
    //img.src = imgSource; // load the image
  }


};

export default Texture3D;
