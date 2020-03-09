// PointLightedCube.js (c) 2012 matsuda and kanda
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
   //  'attribute vec4 a_Color;\n' + // Defined constant in main()
  'attribute vec4 a_Normal;\n' +
  'uniform mat4 u_MvpMatrix;\n' +
  'uniform mat4 u_ModelMatrix;\n' +    // Model matrix
  'uniform mat4 u_NormalMatrix;\n' +   // Transformation matrix of the normal
  'uniform vec3 u_LightColor;\n' +     // Light color
  'uniform vec3 u_LightPosition;\n' +  // Position of the light source
  'uniform vec3 u_AmbientLight;\n' +   // Ambient light color
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  vec4 color = vec4(1.0, 0.0, 0.0, 1.0);\n' + // Sphere color
  '  gl_Position = u_MvpMatrix * a_Position;\n' +
     // Calculate a normal to be fit with a model matrix, and make it 1.0 in length
  '  vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
     // Calculate world coordinate of vertex
  '  vec4 vertexPosition = u_ModelMatrix * a_Position;\n' +
     // Calculate the light direction and make it 1.0 in length
  '  vec3 lightDirection = normalize(u_LightPosition - vec3(vertexPosition));\n' +
     // The dot product of the light direction and the normal
  '  float nDotL = max(dot(lightDirection, normal), 0.0);\n' +
     // Calculate the color due to diffuse reflection
  '  vec3 diffuse = u_LightColor * color.rgb * nDotL;\n' +
     // Calculate the color due to ambient reflection
  '  vec3 ambient = u_AmbientLight * color.rgb;\n' +
     // Add the surface colors due to diffuse reflection and ambient reflection
  '  v_Color = vec4(diffuse + ambient, color.a);\n' + 
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' +  // uniform変数
  '#endif\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color + u_FragColor;\n' +
  '}\n';
  
var lightXPos = 0;
var lightYPos = 0;
var lightZPos = -2.0;
var theta = 0;
var lightRadius = 5;
var enableLighting = true;
var cubeTranslateX = 0;
var cubeTranslateY = 0;
var cubeTranslateZ = -2;
var TranslateX = 0;
var TranslateZ = 0;
var rotation = 0;

var positions = [];
var indices = [];
    
function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Set the vertex coordinates, the color and the normal
  var n = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  // Set the clear color and enable the depth test
  gl.clearColor(0, 0, 0, 1);
  gl.enable(gl.DEPTH_TEST);

  // Get the storage locations of uniform variables and so on
  var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  var u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  var u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
  var u_LightPosition = gl.getUniformLocation(gl.program, 'u_LightPosition');
  var u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');
  if (!u_MvpMatrix || !u_NormalMatrix || !u_LightColor || !u_LightPosition　|| !u_AmbientLight) { 
    console.log('Failed to get the storage location');
    return;
  }

  // Set the light color (white)
  gl.uniform3f(u_LightColor, 0.8, 0.8, 0.8);
  // Set the light direction (in the world coordinate)
  gl.uniform3f(u_LightPosition, 5.0, 8.0, 7.0);
  // Set the ambient light
  gl.uniform3f(u_AmbientLight, 0.2, 0.2, 0.2);

  var modelMatrix = new Matrix4();  // Model matrix
  var mvpMatrix = new Matrix4(); 　 // Model view projection matrix
  var normalMatrix = new Matrix4(); // Transformation matrix for normals

  // Pass the model matrix to u_ModelMatrix
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  // Calculate the view projection matrix
  mvpMatrix.setPerspective(30, canvas.width/canvas.height, 1, 100);
  mvpMatrix.lookAt(0, 0, 9, 0, 0, 0, 0, 1, 0);
  mvpMatrix.multiply(modelMatrix);
  // Pass the model view projection matrix to u_MvpMatrix
  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

  // Calculate the matrix to transform the normal based on the model matrix
  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  // Pass the transformation matrix for normals to u_NormalMatrix
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements); 

  var u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor'); 
  gl.uniform4f(u_FragColor, 0.0,0.0,0.0,0.0);  
  
  var tick = function() {
	rotateLight();
    gl.uniform3f(u_LightPosition, lightXPos, lightYPos, lightZPos);
	
	//Lighting Option
	if(enableLighting){
		gl.uniform3f(u_LightColor, 0.8, 0.8, 0.8);
	}else{
		gl.uniform3f(u_LightColor, 0.0, 0.0, 0.0);
	}
	
	//Update Camera
	positions = [];
	indices = [];
	var n = initVertexBuffers(gl);	
	
	// Pass the model view projection matrix to u_MvpMatrix
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
	
    // Clear color and depth buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
    // Draw the cube(Note that the 3rd argument is the gl.UNSIGNED_SHORT)
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_SHORT, 0);
	
	requestAnimationFrame(tick,canvas);
  }
	tick();
}

function initVertexBuffers(gl) { // Create a sphere
  var SPHERE_DIV = 13;

  var i, ai, si, ci;
  var j, aj, sj, cj;
  var p1, p2;

  //SPHERE 1 (LEFT)

  // Generate coordinates
  for (j = 0; j <= SPHERE_DIV; j++) {
    aj = j * Math.PI / SPHERE_DIV;
    sj = Math.sin(aj);
    cj = Math.cos(aj);
    for (i = 0; i <= SPHERE_DIV; i++) {
      ai = i * 2 * Math.PI / SPHERE_DIV;
      si = Math.sin(ai);
      ci = Math.cos(ai);

      positions.push((si * sj)-2);  // X
      positions.push(cj);       // Y
      positions.push(ci * sj);  // Z
    }
  }

  // Generate indices
  for (j = 0; j < SPHERE_DIV; j++) {
    for (i = 0; i < SPHERE_DIV; i++) {
      p1 = j * (SPHERE_DIV+1) + i;
      p2 = p1 + (SPHERE_DIV+1);

      indices.push(p1);
      indices.push(p2);
      indices.push(p1 + 1);

      indices.push(p1 + 1);
      indices.push(p2);
      indices.push(p2 + 1);
    }
  }
  
  //SPHERE 2 (RIGHT)
  
  // Generate coordinates
  for (j = 0; j <= SPHERE_DIV; j++) {
    aj = j * Math.PI / SPHERE_DIV;
    sj = Math.sin(aj);
    cj = Math.cos(aj);
    for (i = 0; i <= SPHERE_DIV; i++) {
      ai = i * 2 * Math.PI / SPHERE_DIV;
      si = Math.sin(ai);
      ci = Math.cos(ai);

      positions.push((si * sj)+2);  // X
      positions.push(cj);     // Y
      positions.push(ci * sj);  // Z
    }
  }
  
  // Generate indices
  for (j = 0; j < SPHERE_DIV; j++) {
    for (i = 0; i < SPHERE_DIV; i++) {
      p1 = (j * (SPHERE_DIV+1) + i) + 196;
      p2 = p1 + (SPHERE_DIV+1);

      indices.push(p1);
      indices.push(p2);
      indices.push(p1 + 1);

      indices.push(p1 + 1);
      indices.push(p2);
      indices.push(p2 + 1);
    }
  }
  
  //CUBE (???)
  // Create a cube
  //    v6----- v5
  //   /|      /|
  //  v1------v0|
  //  | |     | |
  //  | |v7---|-|v4
  //  |/      |/
  //  v2------v3
  var vertices = new Float32Array([   // Coordinates
     1.0 + cubeTranslateX, 1.0 + cubeTranslateY, 1.0 + cubeTranslateZ,  -1.0 + cubeTranslateX, 1.0 + cubeTranslateY, 1.0 + cubeTranslateZ,  -1.0 + cubeTranslateX,-1.0 + cubeTranslateY, 1.0 + cubeTranslateZ,   1.0 + cubeTranslateX,-1.0 + cubeTranslateY, 1.0 + cubeTranslateZ, // v0-v1-v2-v3 front
     1.0 + cubeTranslateX, 1.0 + cubeTranslateY, 1.0 + cubeTranslateZ,   1.0 + cubeTranslateX,-1.0 + cubeTranslateY, 1.0 + cubeTranslateZ,   1.0 + cubeTranslateX,-1.0 + cubeTranslateY,-1.0 + cubeTranslateZ,   1.0 + cubeTranslateX, 1.0 + cubeTranslateY,-1.0 + cubeTranslateZ, // v0-v3-v4-v5 right
     1.0 + cubeTranslateX, 1.0 + cubeTranslateY, 1.0 + cubeTranslateZ,   1.0 + cubeTranslateX, 1.0 + cubeTranslateY,-1.0 + cubeTranslateZ,  -1.0 + cubeTranslateX, 1.0 + cubeTranslateY,-1.0 + cubeTranslateZ,  -1.0 + cubeTranslateX, 1.0 + cubeTranslateY, 1.0 + cubeTranslateZ, // v0-v5-v6-v1 up
    -1.0 + cubeTranslateX, 1.0 + cubeTranslateY, 1.0 + cubeTranslateZ,  -1.0 + cubeTranslateX, 1.0 + cubeTranslateY,-1.0 + cubeTranslateZ,  -1.0 + cubeTranslateX,-1.0 + cubeTranslateY,-1.0 + cubeTranslateZ,  -1.0 + cubeTranslateX,-1.0 + cubeTranslateY, 1.0 + cubeTranslateZ, // v1-v6-v7-v2 left
    -1.0 + cubeTranslateX,-1.0 + cubeTranslateY,-1.0 + cubeTranslateZ,   1.0 + cubeTranslateX,-1.0 + cubeTranslateY,-1.0 + cubeTranslateZ,   1.0 + cubeTranslateX,-1.0 + cubeTranslateY, 1.0 + cubeTranslateZ,  -1.0+ cubeTranslateX,-1.0 + cubeTranslateY, 1.0 + cubeTranslateZ, // v7-v4-v3-v2 down
     1.0 + cubeTranslateX,-1.0 + cubeTranslateY,-1.0 + cubeTranslateZ,  -1.0 + cubeTranslateX,-1.0 + cubeTranslateY,-1.0 + cubeTranslateZ,  -1.0 + cubeTranslateX, 1.0 + cubeTranslateY,-1.0 + cubeTranslateZ,   1.0 + cubeTranslateX, 1.0 + cubeTranslateY,-1.0 + cubeTranslateZ,  // v4-v7-v6-v5 back
  ]);
  
  //Generate Coordinates
  for(i = 0; i < vertices.length; i++){
	  positions.push(vertices[i]);
  }
  
  //Generate indices
  var cubeIndices = new Uint8Array([
     0, 1, 2,   0, 2, 3,    // front
     4, 5, 6,   4, 6, 7,    // right
     8, 9,10,   8,10,11,    // up
    12,13,14,  12,14,15,    // left
    16,17,18,  16,18,19,    // down
    20,21,22,  20,22,23,     // back
	
	24, 25, 26,   24, 26, 27,  // front
    28, 29, 30,   28, 30, 31,  // right
    32, 33,34,    32,34,35,    // up
    36,37,38,     36,38,39,    // left
    40,41,42,     40,42,43,    // down
    44,45,46,     44,46,47     // back
  ]);
  
  for(i = 0; i < cubeIndices.length; i++){
	  indices.push(cubeIndices[i]+392);
  }
  
  rotateY(gl);
  rotation = (document.getElementById("perspectiveYRange").value);

  // Write the vertex property to buffers (coordinates and normals)
  // Same data can be used for vertex and normal
  // In order to make it intelligible, another buffer is prepared separately
  if (!initArrayBuffer(gl, 'a_Position', new Float32Array(positions), gl.FLOAT, 3)) return -1;
  if (!initArrayBuffer(gl, 'a_Normal', new Float32Array(positions), gl.FLOAT, 3))  return -1;
  
  // Unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // Write the indices to the buffer object
  var indexBuffer = gl.createBuffer();
  if (!indexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

  return indices.length;
}

function initArrayBuffer(gl, attribute, data, type, num) {
  // Create a buffer object
  var buffer = gl.createBuffer();
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return false;
  }
  // Write date into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  // Assign the buffer object to the attribute variable
  var a_attribute = gl.getAttribLocation(gl.program, attribute);
  if (a_attribute < 0) {
    console.log('Failed to get the storage location of ' + attribute);
    return false;
  }
  gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
  // Enable the assignment of the buffer object to the attribute variable
  gl.enableVertexAttribArray(a_attribute);

  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return true;
}

function ToggleLighting(){
	enableLighting = !enableLighting;
}

function rotateY(gl){
  //Apply new rotation
  thetaY = (document.getElementById("perspectiveYRange").value*Math.PI)/180;
  //Rotate around y axis
  for(i = 0; i < positions.length; i+=3){
	  var x = (Math.cos(thetaY)*positions[i]) + (Math.sin(thetaY)*positions[i+2]);
	  var z = (-Math.sin(thetaY)*positions[i]) + (Math.cos(thetaY)*positions[i+2]);
	  positions[i] = x;
	  positions[i+2] =  z;
  }
}

function rotateLight(){
	//Circle light around Z Axis
	theta += .01;
	if(theta > 360){
		theta = 0;
	}
	
	lightXPos = Math.cos(theta) * lightRadius;
	lightYPos = Math.sin(theta) * lightRadius;
}