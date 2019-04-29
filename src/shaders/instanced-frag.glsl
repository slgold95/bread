#version 300 es
precision highp float;

uniform vec3 u_Eye, u_Ref, u_Up;
uniform vec2 u_Dimensions;
uniform float u_Time;
uniform sampler2D u_Texture;

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

// for bread coloring
vec3 crust = vec3(0.6118, 0.4392, 0.2431);
vec3 innerBread = vec3(0.9647, 0.9686, 0.749);

float t = fs_Col.r;
// smaller distances get the crust color, farther distances get the innerBread color
vec3 finalColor = mix(crust, innerBread, 1.0 - t) * lightIntensity;

out_Col = vec4(clamp(finalColor, 0.0, 1.0), 1.0); // stop colors from blowing out

}
