export var gl: WebGL2RenderingContext;
export function setGL(_gl: WebGL2RenderingContext) {
  gl = _gl;
}

export function readTextFile(file: string): string
{
    var text = "";
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                var allText = rawFile.responseText;
                text = allText;
            }
        }
    }
    rawFile.send(null);
    return text;
}

// Function to parse the voxel data from .txt file ------------------------------------------------
export function populateVoxelArray(textFilePath: string): any {
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

  export function get3DTex(offsetsArray: Array<number>, size: number): any {   
    var length = Math.pow(size, 3);
    var texture = new Array(length);
    texture.fill(0.0);
    for(var i = 0.0; i < offsetsArray.length / 3.0; i ++) {
        var x = offsetsArray[(i * 3)]; // x
        var y = offsetsArray[(i * 3) + 1]; // y
        var z = offsetsArray[(i * 3) + 2]; // z
 
       var idx = x + y * size + z * size * size;
       // set the value to be 1.0
       texture[idx] = 1.0;
    }
    return texture;
 }