#version 300 es
precision mediump sampler3D;
precision highp float;

uniform vec3 u_Eye, u_Ref, u_Up;
uniform vec2 u_Dimensions;
uniform float u_Time;
uniform sampler2D u_Texture;
uniform sampler3D u_Texture3D;

in vec4 fs_Col;
in vec4 fs_Pos;
in vec4 fs_Nor; // normals

out vec4 out_Col;

void main()
{
vec3 n = fs_Nor.xyz;
vec3 lightVector = u_Eye;
vec2 uv = 0.5 * (fs_Pos.xy + vec2(1.0, 1.0));
uv.x /= u_Dimensions.x;
uv.y /= u_Dimensions.y;
//uv.x -= 0.25 * u_Dimensions.x / u_Dimensions.y;

// h is the average of the view and light vectors
vec3 h = (u_Eye + lightVector) / 2.0;
// specular intensity
float specularInt = max(pow(dot(normalize(h), normalize(n)), 23.0) , 0.0);  
// dot between normals and light direction
float diffuseTerm = dot(normalize(n), normalize(lightVector));  
// Avoid negative lighting values
diffuseTerm = clamp(diffuseTerm, 0.0, 1.0);    
float ambientTerm = 0.2;
float lightIntensity = diffuseTerm + ambientTerm;

// use custom coloring for bread instead of fs_Col
vec3 color = fs_Col.xyz * lightIntensity;
//out_Col = vec4(clamp(color, 0.0, 1.0), 1.0); // stop colors from blowing out

vec4 colorTexture = texture(u_Texture3D, fs_Pos.xyz);
// 1 means in the mesh - reading from binary raw file
if(colorTexture.r == 1.0){
  colorTexture = vec4(1.0, 0.0, 0.0, 1.0);
}
else if(colorTexture.r == 0.0){
  colorTexture = vec4(0.0, 0.0, 1.0, 1.0);
}
out_Col = colorTexture * lightIntensity;
}
