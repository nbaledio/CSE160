// HelloQuad.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'void main() {\n' +
  '  gl_Position = a_Position;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' +  // uniform変数
  'void main() {\n' +
  '  gl_FragColor = u_FragColor;\n' +
  '}\n';
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
  
  // Get the storage location of a_Position
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  var u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  
  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = function(ev){ click(ev, gl, canvas, a_Position, u_FragColor) };

  // Specify the color for clearing <canvas>
  gl.clearColor(0, 0, 0, 1);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_pointsSQ = [];  // The array for the position of a square
var g_colorsSQ = [];  // The array to store the color of a square
var g_scalesSQ = [];  //The array to store the scale of a square
var g_pointsTRI = [];  // The array for the position of a square
var g_colorsTRI = [];  // The array to store the color of a square
var g_scalesTRI = [];  //The array to store the scale of a square
var currentShape = 'square';
function click(ev, gl, canvas, a_Position, u_FragColor) {
	if(currentShape == 'square'){
		var x = ev.clientX; // x coordinate of a mouse pointer
		var y = ev.clientY; // y coordinate of a mouse pointer
		var rect = ev.target.getBoundingClientRect();
		x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
		y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
		// Store the coordinates to g_points array
		g_pointsSQ.push([x, y]);
		// Store the coordinates to g_points array
		var redValue = document.getElementById("redRange").value //gets the oninput value of Red
		var greenValue = document.getElementById("greenRange").value //gets the oninput value of Green
		var blueValue = document.getElementById("blueRange").value //gets the oninput value of Blue
		g_colorsSQ.push([redValue/255, greenValue/255, blueValue/255, 1.0]);  // Pushes currently selected color
		var scale = document.getElementById("sizeRange").value/50;
		g_scalesSQ.push(scale);
	}else if(currentShape == 'triangle'){
		var x = ev.clientX; // x coordinate of a mouse pointer
		var y = ev.clientY; // y coordinate of a mouse pointer
		var rect = ev.target.getBoundingClientRect();
		x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
		y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
		// Store the coordinates to g_points array
		g_pointsTRI.push([x, y]);
		// Store the coordinates to g_points array
		var redValue = document.getElementById("redRange").value //gets the oninput value of Red
		var greenValue = document.getElementById("greenRange").value //gets the oninput value of Green
		var blueValue = document.getElementById("blueRange").value //gets the oninput value of Blue
		g_colorsTRI.push([redValue/255, greenValue/255, blueValue/255, 1.0]);  // Pushes currently selected color
		var scale = document.getElementById("sizeRange").value/20;
		g_scalesTRI.push(scale);
	}
	// Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);
	
	//Draw Squares
	var len = g_pointsSQ.length;
    for(var i = 0; i < len; i++) {
		var xy = g_pointsSQ[i];
		var rgba = g_colorsSQ[i];
		// Write the positions of vertices to a vertex shader
		var n = initVertexBuffersSQUARE(gl,xy[0],xy[1],g_scalesSQ[i]);
			if (n < 0) {
				console.log('Failed to set the positions of the vertices');
				return;
			} 
		gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
		// Draw the rectangle
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
    }

	//Draw Triangles
	len = g_pointsTRI.length;
	for(var i = 0; i < len; i++){
		var xy = g_pointsTRI[i];
		var rgba = g_colorsTRI[i];
		// Write the positions of vertices to a vertex shader
		var n = initVertexBuffersTRIANGLE(gl,xy[0],xy[1],g_scalesTRI[i]);
		if (n < 0) {
			console.log('Failed to set the positions of the vertices');
			return;
		}
		// Specify the color for clearing <canvas>
		gl.clearColor(0, 0, 0, 1);
		//Set color
		gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
		// Draw the rectangle
		gl.drawArrays(gl.TRIANGLES, 0, n);
	}
}

function initVertexBuffersSQUARE(gl,x,y,scale) {
  var vertices = new Float32Array([
    x-(.5*scale), y+(0.5*scale),   x-(0.5*scale), y-(0.5*scale),   x+(0.5*scale), y+(0.5*scale),　x+(0.5*scale), y-(0.5*scale)
  ]);
  var n = 4; // The number of vertices

  // Create a buffer object
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return false;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);

  return n;
}

function initVertexBuffersTRIANGLE(gl,x,y,scale) {
  var vertices = new Float32Array([
    x, y+(0.2*scale),   x-(0.2*scale), y-(0.2*scale),   x+(0.2*scale), y-(0.2*scale)
  ]);
  var n = 3; // The number of vertices

  // Create a buffer object
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return false;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);

  return n;
}
//Changes selected shape to square
function square(){
	currentShape = 'square';
}
//Changes selected shape to triangle
function triangle(){
	currentShape = 'triangle';
}
//Changes selected shape to circle
function circle(){
	currentShape = 'circle';
}


//Clear Canvas Function
function clearCanvas(canvas) {
	//Get Canvas and gl elements
	var canvas = document.getElementById('webgl');
	var gl = getWebGLContext(canvas);
	g_pointsSQ.length = 0; //Clear vertex array
	g_colorsSQ.length = 0; //Clear color array
	g_scalesSQ.length = 0; //Clear scale array
	g_pointsTRI.length = 0; //Clear vertex array
	g_colorsTRI.length = 0; //Clear color array
	g_scalesTRI.length = 0; //Clear scale array
	gl.clear(gl.COLOR_BUFFER_BIT); //Clear Canvas
}
