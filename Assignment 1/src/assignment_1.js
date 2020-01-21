// HelloTriangle.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'varying vec4 v_Color;'+
  'void main() {\n' +
  '  gl_Position = a_Position;\n' +
  '  v_Color = a_Color;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'varying vec4 v_Color;'+
   'void main(void) {'+
      'gl_FragColor = v_Color;'+
   '}';
var n = 0;
var buffer_data = new Float32Array();
var size = 0;
var currentShape = 'square';
function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas,false);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Specify the color for clearing <canvas>
  gl.clearColor(0, 0, 0, 1);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
  
  //Used for click and drag
  var mouse_down = false;
  
  // Register function (event handler) to be called on a mouse press and mouse move
  canvas.onmousedown = function(ev){mouse_down=true; click(ev, gl, canvas); }; 
  canvas.onmouseup = function(ev){ mouse_down=false; }; 
  canvas.onmousemove = function(ev){ if(mouse_down)click(ev, gl, canvas); };
}

function click(ev, gl, canvas, a_Position, u_FragColor) {
  var scale = document.getElementById("sizeRange").value/50;
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var red = document.getElementById("redRange").value/255;
  var blue = document.getElementById("blueRange").value/255;
  var green = document.getElementById("greenRange").value/255;
  var rect = ev.target.getBoundingClientRect();
  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
  if(currentShape == 'triangle'){
	  var points = new Float32Array([
	  x, y+(0.5*scale), red, green, blue,
	  x-(0.5*scale), y-(0.5*scale), red, green, blue , 
	  x+(0.5*scale), y-(0.5*scale), red, green, blue
	  ]);
	  size +=15;
	  var n = initVertexBuffers(gl,points);
  }else if(currentShape == 'square'){
	  var points = new Float32Array([
	  x-(.5*scale), y+(0.5*scale), red, green, blue,
	  x-(0.5*scale), y-(0.5*scale), red, green, blue,
	  x+(0.5*scale), y-(0.5*scale), red, green, blue
	  ]);
	  size +=15;
	  var n = initVertexBuffers(gl,points);
	  var points = new Float32Array([
	  x-(.5*scale), y+(0.5*scale), red, green, blue,
	  x+(0.5*scale), y+(0.5*scale), red, green, blue,
	  x+(0.5*scale), y-(0.5*scale), red, green, blue
	  ]);
	  size +=15;  
	  var n = initVertexBuffers(gl,points);
  }else if(currentShape == 'circle'){
	  for(var theta = 0; theta <= 360; theta += 45/(document.getElementById("segmentRange").value)*2){
			var j = theta * Math.PI / 180;
			if(theta == 0){
				var prevX = (Math.sin(0)/(2.0/scale)+x);
				var prevY = (Math.cos(0)/(2.0/scale)+y);
			}
			var points = new Float32Array([
			x,y, red, green, blue,
			prevX, prevY, red, green, blue,
			((Math.sin(j)/(2.0/scale))+x), ((Math.cos(j)/(2.0/scale))+y), red, green, blue
			]);
			size += 15;
			var n = initVertexBuffers(gl,points);
			var prevX = (Math.sin(j)/(2.0/scale)+x);
			var prevY = (Math.cos(j)/(2.0/scale)+y);
		}
  }
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
  // Draw the shapes
  gl.drawArrays(gl.TRIANGLES, 0, n);
}

function initVertexBuffers(gl,points) {
  var verticesColors = new Float32Array(size);
  
  if(size == 15){
	  buffer_data = points
  }else{
	  for(i = 0; i < size-15; i++){
		  verticesColors[i] = buffer_data[i];
	  }
	  var j = 0;
	  for(i = size-15; i < size; i++){
		  verticesColors[i] = points[j];
		  j++;
	  }
	  buffer_data = verticesColors;
  }
  
  //ADD DATA TO buffer_data
  n += 3; // The number of vertices

  // Create a buffer object
  var vertexColorBuffer = gl.createBuffer();  
  if (!vertexColorBuffer) {
    console.log('Failed to create the buffer object');
    return false;
  }

  // Write the vertex coordinates and colors to the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, buffer_data, gl.STATIC_DRAW);

  var FSIZE = buffer_data.BYTES_PER_ELEMENT;
  //Get the storage location of a_Position, assign and enable buffer
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 5, 0);
  gl.enableVertexAttribArray(a_Position);  // Enable the assignment of the buffer object

  // Get the storage location of a_Position, assign buffer and enable
  var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if(a_Color < 0) {
    console.log('Failed to get the storage location of a_Color');
    return -1;
  }
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 5, FSIZE * 2);
  gl.enableVertexAttribArray(a_Color);  // Enable the assignment of the buffer object

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
function clearCanvas() {
	//Get Canvas and gl elements
	var canvas = document.getElementById('webgl');
	var gl = getWebGLContext(canvas);
	size = 0;
	n = 0;
	var buffer_data = new Float32Array();
	gl.clear(gl.COLOR_BUFFER_BIT); //Clear Canvas
}

