import {vec3, vec4, mat4, mat3} from 'gl-matrix';
import Drawable from './Drawable';
import {gl} from '../../globals';
import Texture from './Texture';
import Texture3D from './Texture3D';

var activeProgram: WebGLProgram = null;

export class Shader {
  shader: WebGLShader;

  constructor(type: number, source: string) {
    this.shader = gl.createShader(type);
    gl.shaderSource(this.shader, source);
    gl.compileShader(this.shader);

    if (!gl.getShaderParameter(this.shader, gl.COMPILE_STATUS)) {
      throw gl.getShaderInfoLog(this.shader);
    }
  }
};

class ShaderProgram {
  prog: WebGLProgram;

  attrPos: number;
  attrNor: number;
  attrCol: number; // This time, it's an instanced rendering attribute, so each particle can have a unique color. Not per-vertex, but per-instance.
  attrTranslate: number; // Used in the vertex shader during instanced rendering to offset the vertex positions to the particle's drawn position.
  attrUV: number;
  // Added for HW4
  // transform matrix columns
  attrTransformC1: number; 
  attrTransformC2: number; 
  attrTransformC3: number; 
  attrTransformC4: number; 

  unifModel: WebGLUniformLocation;
  unifModelInvTr: WebGLUniformLocation;
  unifViewProj: WebGLUniformLocation;
  unifCameraAxes: WebGLUniformLocation;
  unifTime: WebGLUniformLocation;
  unifRef: WebGLUniformLocation;
  unifEye: WebGLUniformLocation;
  unifUp: WebGLUniformLocation;
  unifDimensions: WebGLUniformLocation;

  unifSampler1: WebGLUniformLocation;
  unifSampler3D: WebGLUniformLocation; 
  unifMinX: WebGLUniformLocation; 

  constructor(shaders: Array<Shader>) {
    this.prog = gl.createProgram();

    for (let shader of shaders) {
      gl.attachShader(this.prog, shader.shader);
    }
    gl.linkProgram(this.prog);
    if (!gl.getProgramParameter(this.prog, gl.LINK_STATUS)) {
      throw gl.getProgramInfoLog(this.prog);
    }

    this.attrPos = gl.getAttribLocation(this.prog, "vs_Pos");
    this.attrNor = gl.getAttribLocation(this.prog, "vs_Nor");
    this.attrCol = gl.getAttribLocation(this.prog, "vs_Col");
    this.attrTranslate = gl.getAttribLocation(this.prog, "vs_Translate");
    this.attrUV = gl.getAttribLocation(this.prog, "vs_UV");
    // Added for HW4
    this.attrTransformC1 = gl.getAttribLocation(this.prog, "vs_TransformC1");
    this.attrTransformC2 = gl.getAttribLocation(this.prog, "vs_TransformC2");
    this.attrTransformC3 = gl.getAttribLocation(this.prog, "vs_TransformC3");
    this.attrTransformC4 = gl.getAttribLocation(this.prog, "vs_TransformC4");

    this.unifModel      = gl.getUniformLocation(this.prog, "u_Model");
    this.unifModelInvTr = gl.getUniformLocation(this.prog, "u_ModelInvTr");
    this.unifViewProj   = gl.getUniformLocation(this.prog, "u_ViewProj");
    this.unifCameraAxes      = gl.getUniformLocation(this.prog, "u_CameraAxes");
    this.unifTime      = gl.getUniformLocation(this.prog, "u_Time");
    this.unifEye   = gl.getUniformLocation(this.prog, "u_Eye");
    this.unifRef   = gl.getUniformLocation(this.prog, "u_Ref");
    this.unifUp   = gl.getUniformLocation(this.prog, "u_Up");
    this.unifDimensions = gl.getUniformLocation(this.prog, "u_Dimensions");
    this.unifSampler1   = gl.getUniformLocation(this.prog, "u_Texture");
    this.unifSampler3D = gl.getUniformLocation(this.prog, "u_Texture3D");
    this.unifMinX = gl.getUniformLocation(this.prog, "u_minX");
  }

   // Bind the given Texture to the given texture unit
   bindTexToUnit(handleName: WebGLUniformLocation, tex: Texture, unit: number) {
    this.use();
    gl.activeTexture(gl.TEXTURE0 + unit);
    tex.bindTex();
    gl.uniform1i(handleName, unit);
  }

  // for 3D texture
  bindTexToUnit2(handleName: WebGLUniformLocation, tex: Texture3D, unit: number) {
    this.use();
    gl.activeTexture(gl.TEXTURE0 + unit);
    tex.bindTex();
    gl.uniform1i(handleName, unit);
  }
  use() {
    if (activeProgram !== this.prog) {
      gl.useProgram(this.prog);
      activeProgram = this.prog;
    }
  }  

  setEyeRefUp(eye: vec3, ref: vec3, up: vec3) {
    this.use();
    if(this.unifEye !== -1) {
      gl.uniform3f(this.unifEye, eye[0], eye[1], eye[2]);
    }
    if(this.unifRef !== -1) {
      gl.uniform3f(this.unifRef, ref[0], ref[1], ref[2]);
    }
    if(this.unifUp !== -1) {
      gl.uniform3f(this.unifUp, up[0], up[1], up[2]);
    }
  }

  setDimensions(width: number, height: number) {
    this.use();
    if(this.unifDimensions !== -1) {
      gl.uniform2f(this.unifDimensions, width, height);
    }
  }

  setModelMatrix(model: mat4) {
    this.use();
    if (this.unifModel !== -1) {
      gl.uniformMatrix4fv(this.unifModel, false, model);
    }

    if (this.unifModelInvTr !== -1) {
      let modelinvtr: mat4 = mat4.create();
      mat4.transpose(modelinvtr, model);
      mat4.invert(modelinvtr, modelinvtr);
      gl.uniformMatrix4fv(this.unifModelInvTr, false, modelinvtr);
    }
  }

  setViewProjMatrix(vp: mat4) {
    this.use();
    if (this.unifViewProj !== -1) {
      gl.uniformMatrix4fv(this.unifViewProj, false, vp);
    }
  }

  setCameraAxes(axes: mat3) {
    this.use();
    if (this.unifCameraAxes !== -1) {
      gl.uniformMatrix3fv(this.unifCameraAxes, false, axes);
    }
  }

  setTime(t: number) {
    this.use();
    if (this.unifTime !== -1) {
      gl.uniform1f(this.unifTime, t);
    }
  }

  // from gui slider value
  setMinX(min: number) {
    this.use();
    if (this.unifMinX !== -1) {
      gl.uniform1f(this.unifMinX, min);
    }
  }

  draw(d: Drawable) {
    this.use();

    if (this.attrPos != -1 && d.bindPos()) {
      gl.enableVertexAttribArray(this.attrPos);
      gl.vertexAttribPointer(this.attrPos, 4, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(this.attrPos, 0); // Advance 1 index in pos VBO for each vertex
    }

    if (this.attrNor != -1 && d.bindNor()) {
      gl.enableVertexAttribArray(this.attrNor);
      gl.vertexAttribPointer(this.attrNor, 4, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(this.attrNor, 0); // Advance 1 index in nor VBO for each vertex
    }

    if (this.attrCol != -1 && d.bindCol()) {
      gl.enableVertexAttribArray(this.attrCol);
      gl.vertexAttribPointer(this.attrCol, 4, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(this.attrCol, 1); // Advance 1 index in col VBO for each drawn instance
    }

    if (this.attrTranslate != -1 && d.bindTranslate()) {
      gl.enableVertexAttribArray(this.attrTranslate);
      gl.vertexAttribPointer(this.attrTranslate, 3, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(this.attrTranslate, 1); // Advance 1 index in translate VBO for each drawn instance
    }

    if (this.attrUV != -1 && d.bindUV()) {
      gl.enableVertexAttribArray(this.attrUV);
      gl.vertexAttribPointer(this.attrUV, 2, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(this.attrUV, 0); // Advance 1 index in pos VBO for each vertex
    }
    
    // TODO: Set up attribute data for additional instanced rendering data as needed
    if (this.attrTransformC1 != -1 && d.bindTransformC1()) {
      gl.enableVertexAttribArray(this.attrTransformC1);
      gl.vertexAttribPointer(this.attrTransformC1, 4, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(this.attrTransformC1, 1); // Advance 1 index in VBO
    }

    if (this.attrTransformC2 != -1 && d.bindTransformC2()) {
      gl.enableVertexAttribArray(this.attrTransformC2);
      gl.vertexAttribPointer(this.attrTransformC2, 4, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(this.attrTransformC2, 1); // Advance 1 index 
    }

    if (this.attrTransformC3 != -1 && d.bindTransformC3()) {
      gl.enableVertexAttribArray(this.attrTransformC3);
      gl.vertexAttribPointer(this.attrTransformC3, 4, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(this.attrTransformC3, 1); // Advance 1 index 
    }

    if (this.attrTransformC4 != -1 && d.bindTransformC4()) {
      gl.enableVertexAttribArray(this.attrTransformC4);
      gl.vertexAttribPointer(this.attrTransformC4, 4, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(this.attrTransformC4, 1); // Advance 1 index 
    }

    d.bindIdx();
    // drawElementsInstanced uses the vertexAttribDivisor for each "in" variable to
    // determine how to link it to each drawn instance of the bound VBO.
    // For example, the index used to look in the VBO associated with
    // vs_Pos (attrPos) is advanced by 1 for each thread of the GPU running the
    // vertex shader since its divisor is 0.
    // On the other hand, the index used to look in the VBO associated with
    // vs_Translate (attrTranslate) is advanced by 1 only when the next instance
    // of our drawn object (in the base code example, the square) is processed
    // by the GPU, thus being the same value for the first set of four vertices,
    // then advancing to a new value for the next four, then the next four, and
    // so on.
    gl.drawElementsInstanced(d.drawMode(), d.elemCount(), gl.UNSIGNED_INT, 0, d.numInstances);

    if (this.attrPos != -1) gl.disableVertexAttribArray(this.attrPos);
    if (this.attrNor != -1) gl.disableVertexAttribArray(this.attrNor);
    if (this.attrCol != -1) gl.disableVertexAttribArray(this.attrCol);
    if (this.attrTranslate != -1) gl.disableVertexAttribArray(this.attrTranslate);
    if (this.attrUV != -1) gl.disableVertexAttribArray(this.attrUV);
    // Added for HW4
    if (this.attrTransformC1 != -1) gl.disableVertexAttribArray(this.attrTransformC1);
    if (this.attrTransformC2 != -1) gl.disableVertexAttribArray(this.attrTransformC2);
    if (this.attrTransformC3 != -1) gl.disableVertexAttribArray(this.attrTransformC3);
    if (this.attrTransformC4 != -1) gl.disableVertexAttribArray(this.attrTransformC4);
  }
};

export default ShaderProgram;