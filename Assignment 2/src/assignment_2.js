// DepthBuffer.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'uniform mat4 u_mvpMatrix;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_Position = u_mvpMatrix * a_Position;\n' +
  '  v_Color = a_Color;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
  '}\n';
  
var n = 36*16;
var buffer_data = new Float32Array();
var translaters = [];
var scalers = [];
var thetaX = 0;
var thetaY = 0;
var thetaZ = 0;
var translatersIndex = 0;
var scalersIndex = 0;
var rotation = 0;
var increment = 1;

function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  
  // Enable depth test
  gl.enable(gl.DEPTH_TEST);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }
  
  // Set the vertex coordinates and color 
  initVertexBuffers(gl,-1.6,-.2,0,.7,.6,.6,255/255,198/255,166/255); //snout
  initVertexBuffers(gl,-1.9,0,0,.2,.2,.2,0,0,0); // nose
  initVertexBuffers(gl,-1.61,-.39,0,.7,.2,.65,0,0,0); // mouth
  initVertexBuffers(gl,-1,0,0,1,1,1,186/255,186/255,186/255); //head 
  initVertexBuffers(gl,-1,.6,-.3,.1,.4,.3,115/255,115/255,115/255); // left ear
  initVertexBuffers(gl,-1,.6,.3,.1,.4,.3,115/255,115/255,115/255); // right ear
  initVertexBuffers(gl,-1.45,.2,-.3,.2,.2,.2,0,0,0); // left eye
  initVertexBuffers(gl,-1.45,.2,.3,.2,.2,.2,0,0,0); // right eye
  initVertexBuffers(gl,-.3,0,0,1.2,1.2,1.2,195/255,195/255,195/255); // collar 
  initVertexBuffers(gl,0,0,0,1,1,1,200/255,200/255,200/255); //upper body 
  initVertexBuffers(gl,.7,0,0,1.3,1,1,200/255,200/255,200/255); // lower body
  initVertexBuffers(gl,-.5,-.7,.3,.3,1.1,.3,180/255,180/255,180/255); // front left leg
  initVertexBuffers(gl,-.5,-.7,-.3,.3,1.1,.3,180/255,180/255,180/255); // front right leg
  initVertexBuffers(gl,.9,-.7,.3,.3,1.1,.3,180/255,180/255,180/255); // back left leg
  initVertexBuffers(gl,.9,-.7,-.3,.3,1.1,.3,180/255,180/255,180/255); // back right leg
  initVertexBuffers(gl,1.6,-.1,0,.3,1.1,.3,204/255,204/255,204/255); // tail
  
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 1.0, 0.0, 1.0);
  
  // Get the storage location of u_mvpMatrix
  var u_mvpMatrix = gl.getUniformLocation(gl.program, 'u_mvpMatrix');
  if (!u_mvpMatrix) { 
    console.log('Failed to get the storage location of u_mvpMatrix');
    return;
  }

  var modelMatrix = new Matrix4(); // Model matrix
  var viewMatrix = new Matrix4();  // View matrix
  var projMatrix = new Matrix4();  // Projection matrix
  var mvpMatrix = new Matrix4();   // Model view projection matrix

  // Calculate the view matrix and the projection matrix
  //modelMatrix.setTranslate(0.75, 0, 0);
  viewMatrix.setLookAt(0, 0, 5, 0, 0, -100, 0, 1, 0);
  projMatrix.setPerspective(60, canvas.width/canvas.height, 1, 100);
  // Calculate the model view projection matrix
  mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
  // Pass the model view projection matrix
  gl.uniformMatrix4fv(u_mvpMatrix, false, mvpMatrix.elements);
  
  //Initial translation/scale
  scale();
  rotateTail();
  translate();
  
  // Start drawing
  var tick = function() {
  if(rotation != document.getElementById("perspectiveYRange").value){
    draw(gl,canvas);   // Draw the animal
  }
  requestAnimationFrame(tick,canvas); // Request that the browser ?calls tick
}
tick();
}

function draw(gl,canvas){
	untranslate();
	translate();
    rotateY();

	rotation = (document.getElementById("perspectiveYRange").value);

	// Create a buffer object
	var vertexColorbuffer = gl.createBuffer();  
	if (!vertexColorbuffer) {
		console.log('Failed to create the buffer object');
		return -1;
	}

	// Write vertex information to buffer object
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorbuffer);
	gl.bufferData(gl.ARRAY_BUFFER, buffer_data, gl.STATIC_DRAW);

	var FSIZE = buffer_data.BYTES_PER_ELEMENT;
  
	// Assign the buffer object to a_Position and enable the assignment
	var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
	if(a_Position < 0) {
		console.log('Failed to get the storage location of a_Position');
		return -1;
	}
	gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
	gl.enableVertexAttribArray(a_Position);
  
	// Assign the buffer object to a_Color and enable the assignment
	var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
	if(a_Color < 0) {
		console.log('Failed to get the storage location of a_Color');
		return -1;
	}
	gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
	gl.enableVertexAttribArray(a_Color);

	// Unbind the buffer object
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
  
	// Clear color and depth buffer
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
	// Draw the cubes
	gl.drawArrays(gl.TRIANGLES, 0, n);
}

function initVertexBuffers(gl,x,y,z,scaleX,scaleY,scaleZ,R,G,B) {
	
  //Push translaters to array
  translaters.push(x);
  translaters.push(y);
  translaters.push(z);
  
  //Push scalers to array  
  scalers.push(scaleX);
  scalers.push(scaleY);
  scalers.push(scaleZ);
  
  //Write vertices/colors to buffer
  var verticesColors = new Float32Array([
	// Vertex coordinates and color
    -0.5,  0.5,   0.5,  R,  G,  B,  //Front
    -0.5, -0.5,   0.5,  R,  G,  B,
    0.5, 0.5,   0.5,  R,  G,  B, 
	0.5, 0.5,   0.5,  R,  G,  B, 
	-0.5, -0.5,   0.5,  R,  G,  B, 
	0.5, -0.5,   0.5,  R,  G,  B, 
	 
	-0.5,  0.5, -0.5,  R,  G,  B,  //Back
    -0.5, -0.5, -0.5,  R,  G,  B,
    0.5, 0.5, -0.5,  R,  G,  B, 
	0.5, 0.5, -0.5,  R,  G,  B, 
	-0.5, -0.5, -0.5,  R,  G,  B, 
	0.5, -0.5, -0.5,  R,  G,  B, 
	
	-0.5,  0.5,   0.5,  R,  G,  B,  //Left
    -0.5, -0.5,   0.5,  R,  G,  B,
    -0.5, 0.5,   -0.5,  R,  G,  B, 
	-0.5, 0.5,   -0.5,  R,  G,  B, 
	-0.5, -0.5,   0.5,  R,  G,  B, 
	-0.5, -0.5,   -0.5,  R,  G,  B, 
	
	0.5,  0.5,   0.5,  R,  G,  B,  //Right
    0.5, -0.5,   0.5,  R,  G,  B,
    0.5, 0.5,   -0.5,  R,  G,  B, 
	0.5, -0.5,   0.5,  R,  G,  B, 
	0.5, 0.5,   -0.5,  R,  G,  B, 
	0.5, -0.5,   -0.5,  R,  G,  B, 
	
	0.5,  0.5,   0.5,  R,  G,  B,  //Top
    -0.5, 0.5,   0.5,  R,  G,  B,
    0.5, 0.5,   -0.5,  R,  G,  B,
	0.5, 0.5,   -0.5,  R,  G,  B, 
	-0.5, 0.5,   0.5,  R,  G,  B, 
	-0.5, 0.5,   -0.5,  R,  G,  B, 
	
	-0.5,  -0.5,   0.5,  R,  G,  B,  //Bottom
    0.5, -0.5,   0.5,  R,  G,  B,
    -0.5, -0.5,   -0.5,  R,  G,  B, 
	0.5, -0.5,   -0.5,  R,  G,  B, 
	0.5, -0.5,   0.5,  R,  G,  B, 
	-0.5, -0.5,   -0.5,  R,  G,  B, 
  ]);
  
  var newBufferData = new Float32Array(buffer_data.length+216);
  
  if(buffer_data.length == 0){
	  buffer_data = verticesColors;
  }else{
	  for(i = 0; i < buffer_data.length; i++){
		  newBufferData[i] = buffer_data[i];
	  }
	  var j = 0;
	  for(i = newBufferData.length-216; i < newBufferData.length; i++){
		  newBufferData[i] = verticesColors[j];
		  j++;
	  }
	  buffer_data = newBufferData;
  } 
}

function rotateY(){
  //Reset rotation
  thetaY = (-rotation*Math.PI)/180;
  
  //Rotate around y axis
  for(i = 0; i < buffer_data.length; i+=6){
	  var x = (Math.cos(thetaY)*buffer_data[i]) + (Math.sin(thetaY)*buffer_data[i+2])
	  var z = (-Math.sin(thetaY)*buffer_data[i]) + (Math.cos(thetaY)*buffer_data[i+2])
	  buffer_data[i] = x;
	  buffer_data[i+2] =  z;
  }
  
  //Apply new rotation
  thetaY = (document.getElementById("perspectiveYRange").value*Math.PI)/180;
  //Rotate around y axis
  for(i = 0; i < buffer_data.length; i+=6){
	  var x = (Math.cos(thetaY)*buffer_data[i]) + (Math.sin(thetaY)*buffer_data[i+2])
	  var z = (-Math.sin(thetaY)*buffer_data[i]) + (Math.cos(thetaY)*buffer_data[i+2])
	  buffer_data[i] = x;
	  buffer_data[i+2] =  z;
  }
}

function scale(){
	for(i = 0; i < scalers.length; i+=3){
		for(j = 0; j < 36; j++){
			buffer_data[scalersIndex] = buffer_data[scalersIndex] * scalers[i];
			buffer_data[scalersIndex+1] = buffer_data[scalersIndex+1] * scalers[i+1];
			buffer_data[scalersIndex+2] = buffer_data[scalersIndex+2] * scalers[i+2]
			scalersIndex +=6
		}
	}
	scalersIndex = 0;
}

function translate(){
	for(i = 0; i < translaters.length; i+=3){
		for(j = 0; j < 36; j++){
			buffer_data[translatersIndex] = buffer_data[translatersIndex] + translaters[i];
			buffer_data[translatersIndex+1] = buffer_data[translatersIndex+1] + translaters[i+1];
			buffer_data[translatersIndex+2] = buffer_data[translatersIndex+2] + translaters[i+2]
			translatersIndex +=6;
		}
	}
	translatersIndex = 0;
}
function unscale(){
	for(i = 0; i < scalers.length; i+=3){
		for(j = 0; j < 36; j++){
			buffer_data[scalersIndex] = buffer_data[scalersIndex] / scalers[i];
			buffer_data[scalersIndex+1] = buffer_data[scalersIndex+1] / scalers[i+1];
			buffer_data[scalersIndex+2] = buffer_data[scalersIndex+2] / scalers[i+2];
			scalersIndex +=6;
		}
	}
	scalersIndex = 0;
}

function untranslate(){
	for(i = 0; i < translaters.length; i+=3){
		for(j = 0; j < 36; j++){
			buffer_data[translatersIndex] = buffer_data[translatersIndex] - translaters[i];
			buffer_data[translatersIndex+1] = buffer_data[translatersIndex+1] - translaters[i+1];
			buffer_data[translatersIndex+2] = buffer_data[translatersIndex+2] - translaters[i+2]
			translatersIndex +=6;
		}
	}
	translatersIndex = 0;
}

function rotateTail(){
  for(i = buffer_data.length-216; i < buffer_data.length; i+=6){
	  var x = (Math.cos(45)*buffer_data[i]) + (-Math.sin(45)*buffer_data[i+1])
	  var y = (Math.sin(45)*buffer_data[i]) + (Math.cos(45)*buffer_data[i+1])
	  buffer_data[i] = x;
	  buffer_data[i+1] =  y;
  }
}

function animateLegs(){
	//Reset rotation
	for(i = 2160; i < buffer_data.length-216; i+=6){
	  var x = (Math.cos(-thetaZ)*buffer_data[i])+(-Math.sin(-thetaZ)*buffer_data[i+1]);
	  var y = (Math.sin(-thetaZ)*buffer_data[i])+(Math.cos(-thetaZ)*buffer_data[i+1]);
	  buffer_data[i] = x;
	  buffer_data[i+1] = y;
	}
	
		if(thetaZ == 45){
		increment = -1;
	}else if(thetaZ == -45){
		increment= 1;
	}
	thetaZ += increment;
	
	//Rotate to new angle
	for(i = 2160; i < buffer_data.length-216; i+=6){
	  var x = (Math.cos(-thetaZ)*buffer_data[i])+(-Math.sin(-thetaZ)*buffer_data[i+1]);
	  var y = (Math.sin(-thetaZ)*buffer_data[i])+(Math.cos(-thetaZ)*buffer_data[i+1]);
	  buffer_data[i] = x;
	  buffer_data[i+1] = y;
	}
}