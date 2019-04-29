#version 300 es
precision highp float;

uniform vec3 u_Eye, u_Ref, u_Up;
uniform vec2 u_Dimensions;
uniform float u_Time;
uniform sampler2D u_Texture;

in vec2 fs_Pos;
out vec4 out_Col;

void main() {

vec4 colorTexture = texture(u_Texture, fs_Pos.xy);
out_Col = colorTexture;
//out_Col = vec4(uv, 0.0, 1.0);
    
}