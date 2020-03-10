// DepthBuffer.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'uniform mat4 u_mvpMatrix;\n' +  
  'attribute vec2 a_TexCoord;\n' +
  'varying vec2 v_TexCoord;\n' +
  'void main() {\n' +
  '  gl_Position = u_mvpMatrix * a_Position;\n' +
  '  v_TexCoord = a_TexCoord;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' +  // uniform変数
  '#endif\n' +
  'uniform sampler2D u_Sampler;\n' +
  'varying vec2 v_TexCoord;\n' +
  'void main() {\n' +
  'gl_FragColor = u_FragColor + texture2D(u_Sampler, v_TexCoord);\n' +
  '}\n';
  
var n = 36 * 700;
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
var thetaFace = 0;
var thetaFaceIncrement = 1;
var value = 45;
var prevX = 45;
var newX = 45;

var TranslateX = -2;
var TranslateY = 0;
var TranslateZ = -2;

var rotateX = 0;
var rotateZ = 0;
var lookAngle = 0;

function main() {
  //Add keydown event listener
  document.addEventListener('keydown', updateCamera);
  
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
  
  // Set the vertex coordinates of cubes
  initVertexBuffers(gl,0,-51,0,500.0,100.0,500.0,80/255,237/255,69/255);
  //Make surrounding walls
  //Horizontal
  for(var j = 0; j < 4; j++){
	  for(var i = 0; i < 64; i++){
		if(i < 32){
		  initVertexBuffers(gl,(i/2)-7,j/2,-4,.5,.5,.5,255/255,0/255,0/255);
		}else{
		  initVertexBuffers(gl,(i/2)-23,j/2,12,.5,.5,.5,255/255,255/255,0/255);
		}	
		n++;
	  }
  } 
  //Vertical
  for(var j = 0; j < 4; j++){
	  for(var i = 0; i < 64; i++){
	    if(i < 32){
		  initVertexBuffers(gl,9,j/2,(i/2)-4,.5,.5,.5,0/255,255/255,255/255);
	    }else{
		  initVertexBuffers(gl,-7,j/2,(i/2)-20,.5,.5,.5,255/255,0/255,255/255);
	    }
		
      }
  }
  
  //Filler walls(in no particular arrangement)
  for(var i = 0; i < 20; i++){
	  if(i < 10){
		  initVertexBuffers(gl,5,0,(i/2)-4,.5,.5,.5,255/255,255/255,255/255);
	  }else{
		  initVertexBuffers(gl,5,0,(i/2)+2,.5,.5,.5,255/255,255/255,255/255);
	  }
  } 
  for(var i = 0; i < 15; i++){
	  if(i < 10){
		  initVertexBuffers(gl,5,.5,(i/2)-4,.5,.5,.5,255/255,255/255,255/255);
	  }else{
		  initVertexBuffers(gl,5,.5,(i/2)+3,.5,.5,.5,255/255,255/255,255/255);
	  }
  } 
  for(var i = 0; i < 15; i++){
	  if(i < 10){
		  initVertexBuffers(gl,5,1,(i/2)-4,.5,.5,.5,255/255,255/255,255/255);
	  }else{
		  initVertexBuffers(gl,5,1,(i/2)+5,.5,.5,.5,255/255,255/255,255/255);
	  }
  } 
  for(var i = 0; i < 20; i++){
	  if(i < 13){
		  initVertexBuffers(gl,-2,0,(i/2)-4,.5,.5,.5,255/255,255/255,255/255);
	  }else{
		  initVertexBuffers(gl,-2,0,(i/2)+2,.5,.5,.5,255/255,255/255,255/255);
	  }
  }
  for(var i = 0; i < 15; i++){
	  if(i < 8){
		  initVertexBuffers(gl,-2,.5,(i/2)-4,.5,.5,.5,255/255,255/255,255/255);
	  }else{
		  initVertexBuffers(gl,-2,.5,(i/2)+4,.5,.5,.5,255/255,255/255,255/255);
	  }
  }
  for(var i = 0; i < 20; i++){
	  if(i < 13){
		  initVertexBuffers(gl,-2,0,(i/2)-4,.5,.5,.5,255/255,255/255,255/255);
	  }else{
		  initVertexBuffers(gl,-2,0,(i/2)+2,.5,.5,.5,255/255,255/255,255/255);
	  }
  }
  for(var i = 0; i < 20; i++){
	  if(i < 10){
		  initVertexBuffers(gl,-4,0,(i/2)-4,.5,.5,.5,255/255,255/255,255/255);
	  }else{
		  initVertexBuffers(gl,-4,0,(i/2)+2,.5,.5,.5,255/255,255/255,255/255);
	  }
  }
  for(var i = 0; i < 20; i++){
	  if(i < 3){
		  initVertexBuffers(gl,7,0,(i/2)-4,.5,.5,.5,255/255,255/255,255/255);
	  }else{
		  initVertexBuffers(gl,7,0,(i/2)+2,.5,.5,.5,255/255,255/255,255/255);
	  }
  }
  
  for(var i = 0; i < 28; i++){
     if(i < 14){
	     initVertexBuffers(gl,(i/2)-7,0,4,.5,.5,.5,255/255,0/255,0/255);
     }else{
		 initVertexBuffers(gl,(i/2)-4,0,4,.5,.5,.5,255/255,0/255,0/255);
	 }  	  
  }
  
  for(var i = 0; i < 25; i++){
     if(i < 10){
	     initVertexBuffers(gl,(i/2)-6,.5,4,.5,.5,.5,255/255,0/255,0/255);
     }else{
		 initVertexBuffers(gl,(i/2)-1,.5,4,.5,.5,.5,255/255,0/255,0/255);
	 }  	  
  } 
  initTextures(gl,n);
  rotateTexturesPieces();
  scale();
  translate();
  
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  // Specify the color for clearing <canvas>
  gl.clearColor(102/255, 88/255,223/255, 1.0);
  
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
  projMatrix.setPerspective(60, canvas.width/canvas.height, 1, 100);
  
  // Start drawing
  var tick = function() {
	//Update Camera Position
	modelMatrix.setTranslate(TranslateX, 0, TranslateZ);
    viewMatrix.setLookAt(-1, 0, 0, rotateX, 0, rotateZ, 0, 1, 0);	
    mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
    gl.uniformMatrix4fv(u_mvpMatrix, false, mvpMatrix.elements);	
	//Draw the World
	draw(gl,canvas);
	requestAnimationFrame(tick,canvas);
	}
	tick();
}

function draw(gl,canvas){
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
	gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE *6, 0);
	gl.enableVertexAttribArray(a_Position);
	
	// Get the storage location of a_TexCoord
    var a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord');
    if (a_TexCoord < 0) {
      console.log('Failed to get the storage location of a_TexCoord');
      return -1;
    }
    // Assign the buffer object to a_TexCoord variable
    gl.vertexAttribPointer(a_TexCoord, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
    gl.enableVertexAttribArray(a_TexCoord);  // Enable the assignment of the buffer object
	
	// Get the storage location of u_FragColor
    var u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
     console.log('Failed to get the storage location of u_FragColor');
      return;
    }

	// Unbind the buffer object
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
  
	// Clear color and depth buffer
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  	
	// Draw the cubes
	gl.uniform4f(u_FragColor, 0.0,1.0,0.0,0.0);
	gl.disableVertexAttribArray(a_TexCoord);
	gl.drawArrays(gl.TRIANGLES, 0, 36);
	
	gl.uniform4f(u_FragColor, 0.0,0.0,0.0,1.0);
	gl.enableVertexAttribArray(a_TexCoord);	
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
    -0.5,  0.5,  0.5,  -1,1,1,  //Front
    -0.5, -0.5,  0.5,  -1,-1,1,
    0.5,   0.5,  0.5,  1,1,1, 
	0.5,   0.5,  0.5,  1,1,1 ,
	-0.5, -0.5,  0.5,  -1,-1,1,
	0.5,  -0.5,  0.5,  1,-1,1, 
	 
	-0.5,  0.5, -0.5,  -1,1,-1,  //Back
    -0.5, -0.5, -0.5,  -1,-1,-1,
    0.5,  0.5, -0.5,  1,1,1,
	0.5, 0.5, -0.5,  1,1,-1, 
	-0.5, -0.5, -0.5,  -1,-1,-1,
	0.5, -0.5, -0.5,  1,-1,-1 , 
	
	-0.5,  0.5,  0.0,  -1,1,1,  //Right
    -0.5, -0.5,  0.0,  -1,-1,1,
    0.5,   0.5,  0.0,  1,1,1, 
	0.5,   0.5,  0.0,  1,1,1 ,
	-0.5, -0.5,  0.0,  -1,-1,1,
	0.5,  -0.5,  0.0,  1,-1,1, 
	
	-0.5,  0.5,  0.0,  -1,1,1,  //Left
    -0.5, -0.5,  0.0,  -1,-1,1,
    0.5,   0.5,  0.0,  1,1,1, 
	0.5,   0.5,  0.0,  1,1,1 ,
	-0.5, -0.5,  0.0,  -1,-1,1,
	0.5,  -0.5,  0.0,  1,-1,1,
	
	-0.5,  0.5,  0.0,  -1,1,1,  //Top
    -0.5, -0.5,  0.0,  -1,-1,1,
    0.5,   0.5,  0.0,  1,1,1, 
	0.5,   0.5,  0.0,  1,1,1 ,
	-0.5, -0.5,  0.0,  -1,-1,1,
	0.5,  -0.5,  0.0,  1,-1,1,
	
	-0.5,  0.5,  0.0,  -1,1,1,  //Bottom
    -0.5, -0.5,  0.0,  -1,-1,1,
    0.5,   0.5,  0.0,  1,1,1, 
	0.5,   0.5,  0.0,  1,1,1 ,
	-0.5, -0.5,  0.0,  -1,-1,1,
	0.5,  -0.5,  0.0,  1,-1,1,
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

function initTextures(gl, n) {
  var texture = gl.createTexture();   // Create a texture object
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  // Get the storage location of u_Sampler
  var u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
  if (!u_Sampler) {
    console.log('Failed to get the storage location of u_Sampler');
    return false;
  }
  var image = new Image();  // Create the image object
  if (!image) {
    console.log('Failed to create the image object');
    return false;
  }
  // Register the event handler to be called on loading an image
  image.onload = function(){ loadTexture(gl, n, texture, u_Sampler, image); };
  // Tell the browser to load an image
  image.src = 'textures/dirt.jpg';

  return true;
}

function loadTexture(gl, n, texture, u_Sampler, image) {
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE0);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler, 0);
}

function rotateTexturesPieces(){
	//Reset rotation
	thetaX = (Math.PI)/2;
    thetaY = (Math.PI)/2;
	var squarecheck = 0;
  
    //Right Walls
    for(i = 72; i < buffer_data.length; i+=6){ 	  
	  var x = (Math.cos(thetaY)*buffer_data[i]) + (Math.sin(thetaY)*buffer_data[i+2])
	  var z = (-Math.sin(thetaY)*buffer_data[i]) + (Math.cos(thetaY)*buffer_data[i+2])
	  buffer_data[i] =  x +.5;
	  buffer_data[i+2] =  z;
	  squarecheck++;
	  if(squarecheck == 6){
		  squarecheck = 0;
		  i+=180;
	  }	
    }

    //Left Walls
    for(i = 108; i < buffer_data.length; i+=6){  
	  var x = (Math.cos(thetaY)*buffer_data[i]) + (Math.sin(thetaY)*buffer_data[i+2])
	  var z = (-Math.sin(thetaY)*buffer_data[i]) + (Math.cos(thetaY)*buffer_data[i+2])
	  buffer_data[i] =  x -.5;
	  buffer_data[i+2] =  z;
	  squarecheck++;
	  if(squarecheck == 6){
		  squarecheck = 0;
		  i+=180;
	  }	
    }

	//Bottom Walls
    for(i = 144; i < buffer_data.length; i+=6){	
		var y = (Math.cos(thetaX)*buffer_data[i+1]) - (Math.sin(thetaX)*buffer_data[i+2])
	    var z = (Math.sin(thetaX)*buffer_data[i+1]) + (Math.cos(thetaX)*buffer_data[i+2])
		buffer_data[i+1] = y -.5;
		buffer_data[i+2] = z;
		squarecheck++;
		if(squarecheck == 6){
		  squarecheck = 0;
		  i+=180;
	    }	
    }
	
	//Top Walls
    for(i = 180; i < buffer_data.length; i+=6){	
		var y = (Math.cos(thetaX)*buffer_data[i+1]) - (Math.sin(thetaX)*buffer_data[i+2])
	    var z = (Math.sin(thetaX)*buffer_data[i+1]) + (Math.cos(thetaX)*buffer_data[i+2])
		buffer_data[i+1] = y +.5;
		buffer_data[i+2] = z;	
		squarecheck++;
		if(squarecheck == 6){
		  squarecheck = 0;
		  i+=180;
	    }	
    }
}

function updateCamera(e){
	//Movement controls
	if(e.code == "KeyW"){
		TranslateX -= .5;		
	}else if(e.code == "KeyS"){
		TranslateX += .5;
	}
	if(e.code == "KeyA"){
		TranslateZ += .5;
	}else if(e.code == "KeyD"){
		TranslateZ -= .5;
	}
	
	//Camera Controls
	if(e.code == "KeyQ"){
		if(lookAngle >= -180 && lookAngle < 180){
			lookAngle -= 10;
		}
		if(lookAngle > 180 && lookAngle < 270){
			lookAngle += 10;
			if(lookAngle == 270){
				lookAngle = -270;
			}
		}
		if(lookAngle >= -270 && lookAngle <= -190){
			lookAngle+=10;
			if(lookAngle == -190){
				lookAngle = 170;
			}
		}
		
	}else if(e.code == "KeyE"){
		if(lookAngle >= -180 && lookAngle < 180){
			lookAngle += 10;
		}		
		if(lookAngle < -180 && lookAngle > -270){
			lookAngle -= 10;
			if(lookAngle == -270){
				lookAngle = 270;
			}
		}
		if(lookAngle <= 270 && lookAngle >= 190){
			lookAngle-=10;
			if(lookAngle == 190){
				lookAngle = -170;
			}
		}
	}
				
	//Connect viewing angles
	if(lookAngle == -180){
		lookAngle = 190;
	}else if(lookAngle == 180){
		lookAngle = -190;
	}
	
		
	if(lookAngle <= 180 && lookAngle >= -180){
		rotateX = (Math.cos(lookAngle*Math.PI/180));
		rotateZ = (Math.sin(lookAngle*Math.PI/180));
	}else{
		rotateX = (1/Math.cos(lookAngle*Math.PI/180));
		rotateZ = (1/Math.sin(lookAngle*Math.PI/180));
	}
	console.log(e.code);
}