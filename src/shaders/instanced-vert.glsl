#version 300 es

uniform mat4 u_ViewProj;
uniform float u_Time;

uniform mat3 u_CameraAxes; // Used for rendering particles as billboards (quads that are always looking at the camera)
// gl_Position = center + vs_Pos.x * camRight + vs_Pos.y * camUp;

in vec4 vs_Pos; // Non-instanced; each particle is the same quad drawn in a different place
in vec4 vs_Nor; // Non-instanced, and presently unused
in vec4 vs_Col; // An instanced rendering attribute; each particle instance has a different color
// in vec3 vs_Translate; // Another instance rendering attribute used to position each quad instance in the scene
// in vec2 vs_UV; // Non-instanced, and presently unused in main(). Feel free to use it for your meshes.
// Columns for overall transformation matrix - unique to each instance
in vec4 vs_TransformC1;
in vec4 vs_TransformC2;
in vec4 vs_TransformC3;
in vec4 vs_TransformC4;

out vec4 fs_Col;
out vec4 fs_Pos;
out vec4 fs_Nor; // normals

float random1( vec2 p , vec2 seed) {
  return fract(sin(dot(p + seed, vec2(127.1, 311.7))) * 43758.5453);
}

float random1( vec3 p , vec3 seed) {
  return fract(sin(dot(p + seed, vec3(987.654, 123.456, 531.975))) * 85734.3545);
}

vec2 random2( vec2 p , vec2 seed) {
  return fract(sin(vec2(dot(p + seed, vec2(311.7, 127.1)), dot(p + seed, vec2(269.5, 183.3)))) * 85734.3545);
}


// Added This
float interpNoise2D(float x, float y){
 float intX = floor(x);
 float fractX = fract(x);
 float intY = floor(y);
 float fractY = fract(y);

 vec2 seedVec = vec2(intX, intY);

 float v1 = random1(vec2(intX, intY), seedVec);
 float v2 = random1(vec2(intX + 1.0f, intY), seedVec);
 float v3 = random1(vec2(intX, intY + 1.0f), seedVec);
 float v4 = random1(vec2(intX + 1.0f, intY + 1.0f), seedVec);

 float i1 = mix(v1, v2, fractX);
 float i2 = mix(v3, v4, fractX);

return mix(i1, i2, fractY);

}

// Added this
float randomFunc(vec2 inVec){
return fract(sin(dot(inVec, vec2(12.9898, 78.233)))* 43758.5453123);
}

// Added this
float interpNoise2D(vec2 vec){
  vec2 i = floor(vec);
  vec2 f = fract(vec);

  float a = randomFunc(i);
  float b = randomFunc(i + vec2(1.0f, 0.0f));
  float c = randomFunc(i + vec2(0.0f, 1.0f));
  float d = randomFunc(i + vec2(1.0f, 1.0f));
 
  vec2 u = f * f * (3.0f - 2.0f * f);

return mix(a, b, u.x) + (c-a)*u.y * (1.0f-u.x) + (d-b) * u.x * u.y;
}


// Added this
float fbm(float x, float y){
  float total = 0.0f;
  float persistence = 0.5f;
  float octaves = 8.0f;

  for(float i = 0.0f; i < octaves; i ++){
      float frequency = pow(2.0f, i);
      float amp = pow(persistence, i);
      total += interpNoise2D(vec2(x * frequency, y * frequency)) * amp;       
  }
  return total;
}

void main() {
    fs_Col = vs_Col;
    fs_Pos = vs_Pos;
    fs_Nor = vs_Nor;
    //vec3 offset = vs_Translate;
    //offset.z = (sin((u_Time + offset.x) * 3.14159 * 0.1) + cos((u_Time + offset.y) * 3.14159 * 0.1)) * 1.5;
    //vec3 billboardPos = offset + vs_Pos.x * u_CameraAxes[0] + vs_Pos.y * u_CameraAxes[1];
    //gl_Position = u_ViewProj * vec4(fs_Pos.xyz + offset, 1.0);    

    mat4 overallTransforms = mat4(vs_TransformC1, vs_TransformC2, vs_TransformC3, vs_TransformC4);
    vec4 finalPos = overallTransforms * vs_Pos;
    //gl_Position = u_ViewProj * finalPos;

    // vs_Col.r is the distance from center
    //vec4 offsetPos = vs_Pos + vec4(cos(vs_Pos.z * 2.0 + (u_Time * 0.25)), sin(vs_Pos.y * 2.0 + (u_Time * 0.25)), 0.0, 0.0) / 2.0;

    // this only "moves" the mesh once it's been baked
    if(vs_Col.r != 0.0){
    // scaled out by 1.5
    mat4 scaledT = mat4(vs_TransformC1 * 1.5, vs_TransformC2 * 1.5, vs_TransformC3 * 1.5, vs_TransformC4);
    vec4 nPos = scaledT * vs_Pos;
    // scaled out by 2.0
    mat4 scaledTransforms = mat4(vs_TransformC1 * 2.0, vs_TransformC2 * 2.0, vs_TransformC3 * 2.0, vs_TransformC4);
    vec4 newPos = scaledTransforms * vs_Pos;
    float t = sin(u_Time * 0.025);
    // finalPos = scaledTransforms * mix(finalPos, newPos, t);
    vec4 mixedPos = mix(nPos, newPos, 0.75);
    gl_Position = u_ViewProj * mixedPos;
    } 
    else {
    gl_Position = u_ViewProj * finalPos;
    }

    // float x = vs_Pos.x;// + u_PlanePos.x;
    // float y = vs_Pos.z;// + u_PlanePos.y;
    // float noiseTerm = fbm(x, y);
    // float height = pow(smoothstep(0.0, 0.9, pow(smoothstep(0.0, 1.0, noiseTerm), 2.0)), 100.0) 
    // * (floor(noiseTerm * 30.0)/30.0) + noiseTerm  * 10.0; 
  
    // vec4 modelposition = vec4(vs_Pos.x, height /20.0, vs_Pos.z, 1.0);
    // modelposition = overallTransforms * modelposition;
    // gl_Position = u_ViewProj * modelposition;
    

    // Old final pos
    // gl_Position = u_ViewProj * finalPos;
}