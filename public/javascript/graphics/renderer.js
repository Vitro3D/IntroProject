// renderer.js
// The WebGL renderer that allows free movement of the scene. Used for displaying arbitrary objects.


import Camera from './camera.js';
import Lighting from './lighting.js';
import TextureManager from './texture-manager.js';
import Shaders from './shaders.js';
import Object3D from './object-3d.js';

import Color from '../core/color.js';
import Vector2 from '../core/vector2.js';
import Vector3 from '../core/vector3.js';
import MathExt from '../core/math-ext.js';
import GCoord from '../core/gcoord.js';
import GeoMath from '../core/geo-math.js';

var _coord = new GCoord();
var _color = new Color();
var _vec = new Vector3();
	
export default class Renderer {
	constructor (canvas /* DOM Canvas */) {
		// Create the canvas
		var self = this;
		this.canvas = canvas;
		this.canvas.setAttribute("tabindex", 1);	// tabindex on canvas makes it focusable.

		this.onRender = null;		// Called on the render loop. Render objects here if you'd like.
		this.onMouseUp = null;    	// function(ev). Called when a mouse button is released.
		this.onMouseDown = null;   // function(ev). Called when a mouse button is pressed.
		this.onMouseMove = null;	// function(ev). Called when the mouse is moved within the renderer.
		this.onKeyDown = null;		// function(ev). Called when a key is pressed within the renderer.
		
		// Prefer the pointer events to the mouse events if they are available.  Fixes issue where Surface stylus would stop responding after opening a file or color dialog.
		if (this.canvas.onpointerdown === undefined)
			this.canvas.addEventListener("mousedown", function(ev) {  self._onMouseDown(ev); });
		else
			this.canvas.onpointerdown = function (ev) { self._onMouseDown(ev); };
		
		if (this.canvas.onpointerup === undefined)
			this.canvas.addEventListener("mouseup", function (ev) {  self._onMouseUp(ev); });
		else
			this.canvas.onpointerup = function (ev) { self._onMouseUp(ev); };
		
		if (document.onpointermove === undefined)
			document.addEventListener('mousemove', function (ev) {  self._onMouseMove(ev); }, false);
		else
			document.addEventListener('pointermove', function (ev) { self._onMouseMove(ev); }, false);
		
		this.canvas.addEventListener('wheel', function (ev) { self._onMouseWheel(ev); }, false);

		this.canvas.addEventListener('keydown', function (ev) { self._onKeyDown(ev); }, false);		
		this.canvas.addEventListener('touchstart', function (ev) { self.onTouchStart(ev); }, false);
		this.canvas.addEventListener('touchend', function (ev) { self.onTouchEnd(ev); }, false);
		this.canvas.addEventListener('touchcancel', function (ev) { self.onTouchCancel(ev); }, false);
		this.canvas.addEventListener('touchmove', function (ev) { self.onTouchMove(ev); }, false);
		this.canvas.oncontextmenu = function (ev) { return false; };		// Disable right-click context menu
		
		// The border that appears indicating where z rotation is available.
		this.zRotateBarSize = 80;		// Pixels from the edge which is reserved for z-rotation.
		this.lastButtonDown = null;
	   
		this.gl = this.getWebGLContext(this.canvas);   // The openGL context  
		var gl = this.gl;
		gl.shaders = new Shaders(gl); 
		gl.textures = new TextureManager(gl);
		
		// Touches and mouse		
		this.currentTouches = { };			// The current touches being applied
		this.touchSamplesToUse = 1;		// Use a number of samples for smoothing. (deprecated?)
		this.touchSamples = [];				// A queue of touch info.  [{distance, angle}]
		this.lastCoords = null;				// The last coords picked on mousemove.

		// Basic Objects
		this.objects3D = [];					// Object3D[]. Objects to render in 3d scene
		this.transObjects3D = [];			// Object3D[]. Transparent objects that should be rendered last.
				
		this.backgroundColor = new Color(0.0, 0.0, 0.0);
		this.needsRedraw = true;
						
		// Camera
		this.camera = new Camera(this.canvas);
		var forward = new Vector3(-0.695, 0.685, -0.215);
		this.camera.setOrientation(forward, new Vector3(0, 0, 1));		
		this.camera.setNearPlane(-100.0);
		this.camera.setDistance(20.0);
		this.camera.setFarPlane(100.0);
		this.camera.setFov(30.0);
		this.camera.setPosition(0, 0, 0);
		this.zRotateBarSize = 80;	
		
		// Lighting
		this.lighting = new Lighting(this.gl);
		this.setToDirectionalLighting();

		// Panning
		this.panning = false;
		this.lastPan = { x: 0, y: 0 };	  // last mouse position when panning

		// Rotation
		this.trackballRadius = (this.canvas.clientHeight / 2) - 20;
		this.rotating = false;
		this.zRotating = false;
		this.lastRotate = new Vector3();    // last position on the trackball.
		this.zUpRotating = false;				// Rotation mode used by the viewer.
		this.lastZUpRotate = new GCoord();	// The last position of the cursor when using 'z up' rotation.
		this.lastZUpClient = new Vector2();	// The last cursor position when using the zup rotation.
		this.rotationMode = Renderer.StandardRotation;
		this.enableRotate = true;
		this.trackballEl = null;		// The DOM element that appears while rotating.

		this.viewMode = Renderer.Ortho;
	
		// WebGlBuffers for selection and determining depth.
		this.frameBuffer = null; 	
		this.depthBuffer = null; 
		this.colorBuffer = null;

		// Enable the z-buffer
		gl.enable(gl.DEPTH_TEST);
		gl.depthFunc(gl.LEQUAL);

		// Enable alpha blending
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

		// Nonsense for copyright.  Do not remove.
		if (document.alphaBlocker && document.alphaBlocker.enabled)
			document.alphaBlocker.disable();

		this.updateTrackballRadius();
								
		var fps = 30;
		this.lastIntervalTime = null;
		setInterval(
			function () {
				var interval = null;
				var now = Date.now();
				if (self.lastIntervalTime)
					interval = now - self.lastIntervalTime;
				self.lastIntervalTime = now;

				if (self.onNextFrame)
					self.onNextFrame(interval);

				self.render ();
			}, 1000 / fps);
	}

	// View Modes
	static Ortho = 1;			// View with an orthographic projection
	static Perspective = 2;	// View with a perspective projection
	
	// Rotation Modes
	static StandardRotation = 1;
	static ViewerRotation = 2;
	
	// Get the context directly from the canvas.
	getWebGLContext () {
		var names = ["webgl2", "webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
		var context = null;
		for (var i = 0; i < names.length; i++) {
			try {	context = this.canvas.getContext(names[i]);	} 
			catch (e) { }
			if (context) {		break;	}
		}
		if (!context) {
			console.log("Error creating webgl context for canvas!");
			return null;
		}
		return context;
	}
	
	getContext () {
		return this.gl;	
	};

	getShaders () {
		return this.gl.shaders;
	}

	getLighting () {
		return this.lighting;
	}

	getMaxTextureSize () {
		return this.gl.getParameter(this.gl.MAX_TEXTURE_SIZE);
	};

	// pixelRatio: Each CSS pixel is actually this many pixels so create a canvas x times as large as the reported value.
	setCanvasSize (width, height, pixelRatio) {
		if (this.canvas.width == width && this.canvas.height == height)
			return;

		if (!pixelRatio) pixelRatio = 1;

		var gl = this.gl;

		// Keep the html element dimensions and the style the same to avoid stretching and keep the 
		// UI honest with its cursor locations.
		this.canvas.width = width * pixelRatio;
		this.canvas.height = height * pixelRatio;
		this.canvas.style.width = width + "px";
		this.canvas.style.height =  height + "px";		
		gl.viewport(0, 0, width * pixelRatio, height * pixelRatio);

		// Update the buffers used for selection.
		gl.deleteFramebuffer(this.frameBuffer);
		gl.deleteRenderbuffer(this.depthBuffer);
		gl.deleteRenderbuffer(this.colorBuffer);
		
		// The frame buffer that will be written to instead of the normal color buffer when picking.
		this.frameBuffer = gl.createFramebuffer(); 
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);	

		// The buffer the frame buffer will write to that will be read from
		this.colorBuffer = gl.createRenderbuffer();
		gl.bindRenderbuffer(gl.RENDERBUFFER, this.colorBuffer);
		gl.renderbufferStorage(gl.RENDERBUFFER, gl.RGBA8, width, height);
		gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, this.colorBuffer);	// attach to the render buffer
		
		// Depth buffer our frame buffer will write to. Note webGL doesn't let you read directly from this.
		this.depthbuffer = gl.createRenderbuffer();
		gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthbuffer);
		gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
		gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.depthbuffer);	// attach to the render buffer

		gl.bindFramebuffer(gl.FRAMEBUFFER, null);	// draw to the normal color buffer again.
	};

	getCanvasHeight () {
		return this.canvas.clientHeight;
	};

	getCanvasWidth () {
		return this.canvas.clientWidth;
	};

	// el		DOMElement		The DOM element to show while rotating.
	setTrackballElement(el) {
		this.trackballEl = el;
		this._showTrackballElement(false);
	}

	// show		bool		If true, the element assigned as the trackballEl will be visible.
	_showTrackballElement(show) {
		if (this.trackballEl)
			this.trackballEl.style.display = show ? 'block' : 'none';
	}

	// returns Camera
	getCamera () {
		return this.camera;
	}

	getDistance () {
		return this.camera.getDistance();
	};

	setDistance (distance) {
		this.camera.setDistance(distance);
		this.camera.setFarPlane(distance * 10);
		this.camera.setNearPlane(-distance * 10);
	}

	setFov (deg) {
		this.camera.setFov(deg);
	}

	getFov () {
		return this.camera.getFov();
	}

	setNearPlane (nearPlane) {
		this.camera.setNearPlane(nearPlane);
		//console.log(this.camera.getNearPlane() + " - " + this.camera.getFarPlane());
	}

	getNearPlane () {
		return this.camera.getNearPlane();
	}

	setFarPlane (farPlane) {
		this.camera.setFarPlane(farPlane);
	}

	getFarPlane () {
		return this.camera.getFarPlane();
	}

	// Pan the camera the passed amount.
	// translateCamera(Vector3)
	// translateCamera(x, y, z)
	translateCamera (x, y, z) {
		this.camera.pan(x, y, z);
	}

	// Set the orientation of the camera with seperate xyz values.
	setOrientation (lookAtX, lookAtY, lookAtZ, yUpX, yUpY, yUpZ) {
		if (yUpX === undefined) {	yUpX = 0.0;  yUpY = 0.0; yUpZ = 1.0;	}
		this.camera.setOrientation(new Vector3(lookAtX, lookAtY, lookAtZ), new Vector3(yUpX, yUpY, yUpZ));
	}

	// Set the direction the camera is looking.
	// setForward(Vector3)
	// setForward(x, y, z)
	setForward (x, y, z) {
		this.camera.setForward(x, y, z);
	}

	// For displaying shading in the scene.
	setToDirectionalLighting () {
		this.lighting.setAmbientLight(0.6, new Color(1.0, 1.0, 1.0));	
		this.lighting.addDirectionalLight(new Vector3(0.4, 0.0, -0.5), 0.45, new Color(1.0, 1.0, 1.0));
		this.lighting.addDirectionalLight(new Vector3(0.0, 0.5, 1.0), 0.2, new Color(1.0, 1.0, 1.0));
		this.lighting.addDirectionalLight(new Vector3(-0.4, 0.0, 0.2), 0.2, new Color(1.0, 1.0, 1.0));
	}

	// Set to only ambient light. No shading will appear in the scene.
	setToFlatLighting () {
		this.lighting.setAmbientLight(1.0, new Color(1.0, 1.0, 1.0));
		this.lighting.setDirectionalIntensity(0);
	}

	setRotateButton (button /* "right" || "left" */) {
		this.rightButtonRotates = (button == "right");
	};

	setBackgroundColor (r, g, b, a) {
		this.backgroundColor = new Color(r, g, b, a ? a : 1);
		this.needsRedraw = true;
	};

	// useFog		bool			Fog should be applied to the scene. Initially it is false.
	// fogColor		Color			The color of the fog at max. 
	// maxFog		0-1			The maximum opacity of the fog which occurs at maxFogDistance. 0=no fog. 1=opaque fog.
	// maxFogDistance number	The distance at which maxFog occurs.
	setFog (useFog, fogColor, maxFog, maxFogDistance) {
		this.gl.shaders.setFog(useFog, fogColor, maxFog, maxFogDistance);
	}

	hasObject (object /* Object3D */) {
		return this.objects3D.indexOf(object) != -1 || this.transObjects3D.indexOf(object) != -1;
	}

	// Add a 3D object to the scene that the renderer will take ownership of.
	// object			Object3D		An object the renderer will draw.
	// isTransparent	bool			def=false. Transparent objects will be drawn after the solid objects.
	addObject (object, isTransparent)  {
		if (isTransparent)
			this.transObjects3D.push(object);
		else
			this.objects3D.push(object);
		this.needsRedraw = true;
	};

	addObjects (objects /* Object3D[] */, isTransparent /* def=false */)  {
		for (obj of objects) {
			if (isTransparent)
				this.transObjects3D.push(obj);
			else
				this.objects3D.push(obj);
		}
		this.needsRedraw = true;
	};
	
	removeObject (object /* Object3D */) {
		var index = this.objects3D.indexOf(object);
		if (index != -1) {
			var obj = this.objects3D.splice(index, 1)[0];
			obj.cleanup();
		}
		else {
			index = this.transObjects3D.indexOf(object);
			if (index != -1) {
				var obj = this.transObjects3D.splice(index, 1)[0];	
				obj.cleanup();
			}
		}
		this.needsRedraw = true;
		return;
	}

	removeObjects (objects /* Object3D[] */) {
		for (var obj of objects)
			this.removeObject(obj);
	}
	
	// Main render loop.
	render () {

		var gl = this.gl;
		if (!this.needsRedraw && !this.camera.hasChanged())
			return;
		
		gl.clearColor(this.backgroundColor.r, this.backgroundColor.g, this.backgroundColor.b, this.backgroundColor.a);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		
		gl.shaders.setViewMatrix(this.camera.getMatrixRaw());
		this.lighting.updateShaders(this.gl.shaders);
				
		for (var i = 0; i < this.objects3D.length; i++) {
			this.objects3D[i].render();
		}

		// Draw transparent objects last.
		for (var i = 0; i < this.transObjects3D.length; i++) {
			this.transObjects3D[i].render();
		}

		if (this.onRender)
			this.onRender();	// may be overridden.

		this.needsRedraw = false;
	}

	// Snap the focus of the cursor to whatever is at the center of the view. This keeps the center
	// of rotation to an intuitive point.
	snapFocus = function () {
		var p = this.getPointAtViewCenter();
		if (p)
			this.camera.setPosition(p);
		return;
	}

	// Vector3. Returns the location of the point that is at the center of the view. Returns null if no point was hit.
	// Draw the scene with the depth shader to an offscreen buffer and then read a pixel from that.
	// Used to snap to the pixel at the crosshairs.
	// Room for optimization if this was used a lot (for instance limiting the size of the frame buffer).
	getPointAtViewCenter () {
		return this.getPointAtPixel();
	}

	// returns 				Vector3	The 3d point that is currently displayed at the passed pixel. 
	// clientX, clientY	number	opt. def=center of canvas. The client coordinates to test. Client coordinates are from the top, left of the browser window and are returned in events.
	getPointAtPixel (clientX, clientY) {
		var gl = this.gl;

		var x, y;
		if (clientX && clientY) {
			var vec = this.camera.clientToCanvasCoords(clientX, clientY, true /* invertY */);
			x = vec.x;
			y = vec.y;
		}
		else {		// use the center point of the canvas.
			x = this.camera.getWidth() / 2;
			y = this.camera.getHeight() / 2;
		}
		x = Math.round(x);
		y = Math.round(y);
		
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);	// draw to this buffer instead of the normal color buffer
		
		// Draw the scene to the offscreen buffer.
		Object3D.useDepthShader = true;
		this.needsRedraw = true;
		_color.set(this.backgroundColor)
		this.backgroundColor.set(0, 0, 0, 0);
		this.render();
		Object3D.useDepthShader = false;
		this.backgroundColor.set(_color);

		// Read the pixel and delete the frame buffer.
		var data = new Uint8Array(1*1*4);
		gl.readPixels(x, y, 1 /* width */, 1 /* height */, gl.RGBA, gl.UNSIGNED_BYTE, data);	
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);	// set to draw to the normal color buffer again.

		if (data[3] == 0) {
			return null;		// no object drawn here.
		}

		// Get the z value at that pixel.
		var value = data[0] + data[1] / 255;		// map data from 0-255 back to -1 to 1.
		value = value / 255 * 2 - 1;
		
		var matrix = this.camera.getMatrix().clone();
		matrix.invert();
		var vec = new Vector3(x / this.camera.getWidth() * 2.0 - 1.0, 	// x value is from -1 to 1
									 (y / this.camera.getHeight()) * 2.0 - 1.0,	// y value is from -1 to 1. Invert the y first
									 value);		// z is the value of the depth buffer from -1 to 1
		matrix.applyToVec(vec);
		return vec;		
	}

	// int. Returns the selectionId of the Object3D that lies at the passed pixel. Returns null if nothing with an id was drawn at that position.
	// clientX, clientY		Client coordinates of the click which can be retrieved from the mouse event.
	getSelected (clientX, clientY) {
		var gl = this.gl;
		
		var vec = this.camera.clientToCanvasCoords(clientX, clientY, true /* invertY */);
		var x = Math.round(vec.x);
		var y = Math.round(vec.y);
		
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);	// draw to this buffer instead of the normal color buffer
		
		// Draw the scene to the offscreen buffer.
		Object3D.useSelectShader = true;
		this.needsRedraw = true;
		_color.set(this.backgroundColor);
		this.backgroundColor.set(255, 255, 255, 255);	// The 'no value' color.
		this.render();
		Object3D.useSelectShader = false;
		this.backgroundColor.set(_color);

		// Read the pixel and delete the frame buffer.
		var data = new Uint8Array(1*1*4);
		gl.readPixels(x, y, 1 /* width */, 1 /* height */, gl.RGBA, gl.UNSIGNED_BYTE, data);	
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);	// draw to the normal color buffer again.
		
		if (data[0] == 255 && data[1] == 255 && data[2] == 255 && data[3] == 255) 
			return null;		// no object with an id was drawn here.

		var value = data[0] * 65536 +
						data[1] * 256 +
						data[2];
		return value;
	}

	updateTrackballRadius () {
		this.trackballRadius = this.camera.getHeight() * 0.40;
		if (this.camera.getAspectRatio() < 1.0) {	// taller than wide.  Limit to the width
			this.trackballRadius *= this.camera.getAspectRatio();
		}
	}

	updateTrackball (clientX, clientY, forceZRotation) {
		if (!this.enableRotate)
			return;

		if (this.trackballRadius == 0)
			this.updateTrackballRadius();

		// Map the client point onto the trackball
		var canvasCenter = this.camera.getCanvasCenter();
		var canvasLoc = this.camera.clientToCanvasCoords(clientX, clientY, true /* invertY */);	// canvas coords are pixel coords on the canvas.
		var vecFromCenter = canvasLoc.subc(canvasCenter);
		var d = vecFromCenter.length();
		var nr = new Vector3(vecFromCenter.x, vecFromCenter.y, 0.0);		// new rotate point on the trackball
				
		// Check to see if it should be rotating around the view's z-axis, such as when it is outside the circle.
		var zRotating = forceZRotation || (d > this.trackballRadius);
			
		if (!zRotating) {
			// total length of vector should always be the radius of the trackball
			nr.z = Math.sqrt(this.trackballRadius * this.trackballRadius - nr.x * nr.x - nr.y * nr.y);
		}
		
		// Rotate only if it has changed and we are not toggling z rotation (The two rotations are not compatible).
		if (this.rotating && !nr.equals(this.lastRotate) && (this.zRotating == zRotating)) {
			var angle = nr.angle(this.lastRotate);
			if (angle != 0.0) {
				var cross = nr.cross(this.lastRotate);
				cross.normalize();
				this.camera.rotate(cross.x, cross.y, cross.z, angle); // Rotate by the cross product of the two vectors
				//this.trackball.rotate(cross.x, cross.y, cross.z, -angle);
				this.needsRedraw = true;
			}
		}

		this.lastRotate.set(nr.x, nr.y, nr.z);
		this.zRotating = zRotating;
		this.rotating = true;

		this._showTrackballElement(true);
	}

	updateZUpRotation (clientX, clientY) {
		if (!this.enableRotate)
			return;

		var pickedPos = this.getPickedCoords(clientX, clientY);
		if (!pickedPos) {
			this.zUpRotating = false;
			return;
		}
		pickedPos = pickedPos.clone();
		
		if (this.zUpRotating) {
			this.camera.getZAxisScreen(_vec);		// long rotation vec

			var longChange = pickedPos.long - this.lastZUpRotate.long;
			if (Math.abs(pickedPos.lat) > 84)
				longChange = 0;	 // spinning the object when near the poles of the trackball is too erratic.
			
			this.camera.rotate(_vec.x, _vec.y, _vec.z, MathExt.degToRad(longChange));
	
			var latChange = pickedPos.lat - this.lastZUpRotate.lat;
			var clientYChange = clientY - this.lastZUpClient.y;
			if ((clientYChange < 0 && latChange < 0) || (clientYChange > 0 && latChange > 0)) {
				latChange = -latChange;		// the case where the user is scrolling 'over the top' of the poles.
			}
			this.camera.rotate(1, 0, 0, MathExt.degToRad(-latChange));			
			if (this.camera.getZAxisScreen().y < 0.0)	  // don't allow upside-down objects
				this.camera.rotate(1, 0, 0, MathExt.degToRad(latChange));			
			
		}
		this.lastZUpRotate.set(this.getPickedCoords(clientX, clientY));
		this.lastZUpClient.set(clientX, clientY);

		this.zUpRotating = true;
	}

	// returns Line3 - the line from the near plane to far plane at the passed client coordinates.
	// clientX, clientY		pixel		The coordinats of the picked point in client-space.
	getProjectedLine (clientX, clientY) {
		return this.camera.projectLine(clientX, clientY);
	}

	// returns GCoord - the picked coordinates of a sphere of the passed radius.  Used for trackball.
	getPickedCoords (clientX, clientY, radius) {
		if (!this.camera)
			return null;		// This prevents the debug console from filling up on mouse move

		if (!radius)
			radius = 1.0;

		var ray = this.camera.projectLine(clientX, clientY);
				
		var intersection = GeoMath.line_x_sphere(ray.p1, ray.p2, new Vector3(0,0,0), radius);
		//var intersection = Sphere.intersection(ray, radius);
		if (intersection == null)
			return null;
		_coord.fromVec3(intersection);
		return _coord;
	}

   /* -- TOUCH CONTROLS -- */
   updateTouchStatus () {
      var statusElement = document.getElementById("debugOutput");
      if (statusElement) {
	      var msg = "";
	      for (var touchId in this.currentTouches) {
		      if (this.currentTouches.hasOwnProperty(touchId)) {
			      var touch = this.currentTouches[touchId];
			      msg += "Touch " + touch.identifier + ": " + touch.curClientX + ", " + touch.curClientY + "<br>";
		      }
	      }
	      //statusElement.innerHTML = msg;
      }	
   }

   _getNumTouches () {
      var count = 0;
      for (var prop in this.currentTouches)
         if (this.currentTouches.hasOwnProperty(prop))
               count++;
      return count;
   };

   _getFirstTouch () {
      for (var touchId in this.currentTouches) {
		   if (this.currentTouches.hasOwnProperty(touchId)) {
			   return this.currentTouches[touchId];
		   }
	   }
	   return null;
   };

	_getTouchDetails () {
		var firstTouch = null, secondTouch = null;
		for (var touchId in this.currentTouches) {
			if (this.currentTouches.hasOwnProperty(touchId)) {
					if (!firstTouch)
					firstTouch = this.currentTouches[touchId];
					else {
						secondTouch = this.currentTouches[touchId];
						break;
					}
			}
		}
		if (!secondTouch)
			return null;
		var vecA = new Vector2(firstTouch.curClientX, firstTouch.curClientY);
		var vecB = new Vector2(secondTouch.curClientX, secondTouch.curClientY);
		var distance = vecA.distance(vecB);

		vecB.sub(vecA);
        var angle = vecB.angle();
        
		return { distance:  distance,
				 angle:     angle 
        };
	};
    
	onTouchStart (touchEvent) {
	            
		var newTouches = touchEvent.changedTouches;

		var rect = this.canvas.getBoundingClientRect();
		for (var i = 0; i < newTouches.length; i++) {
			var touch = newTouches[i];

			// only add the touch if it is within the bounds of the canvas.
			var p = { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
			if (p.x >= 0 && p.x < rect.width && p.y >= 0 && p.y < rect.height) {
				touch.curClientX = touch.clientX;        // Assigning directly to clientX does not work (property?)
				touch.curClientY = touch.clientY;

				// Uncomment this to add a fake touch for testing multiple touches on the desktop
				//if (this._getNumTouches() == 0) {	this.currentTouches[999] = { curClientX: touch.clientX, curClientY: touch.clientY };		}

				this.currentTouches[touch.identifier] = touch;
				touchEvent.preventDefault();
			}
		}

		var numTouches = this._getNumTouches();
		if (numTouches > 0) {
			var touch = this._getFirstTouch();
			if (this.rotationMode == Renderer.StandardRotation) {
				this.updateTrackball(touch.clientX, touch.clientY);		// Rotate}
			}
			else if (this.rotationMode == Renderer.ViewerRotation) {
				this.updateZUpRotation(touch.clientX, touch.clientY);
			}
		}
		if (numTouches > 1) {
			var details = this._getTouchDetails();
			this.touchSamples.push(details);
		}

		this.updateTouchStatus();
	};
    
   onTouchMove (touchEvent) {
	    
	   var numTouches = this._getNumTouches();
	   if (numTouches == 0)
		   return;

	   var touches = touchEvent.changedTouches;

	   for (var i = 0; i < touches.length; i++) {
		   var touch = touches[i];
		   var curTouch = this.currentTouches[touch.identifier];

		   if (curTouch) {
			   curTouch.curClientX = touch.clientX;        // Assigning directly to clientX does not work (property?)
			   curTouch.curClientY = touch.clientY;
		   }
	   }
        
	   if (numTouches > 0 && this.rotating)  {
		   var touch = this._getFirstTouch();	
		   this.updateTrackball(touch.curClientX, touch.curClientY);   
	   }
		if (numTouches > 0 && this.zUpRotating) {
			var touch = this._getFirstTouch();
			this.updateZUpRotation(touch.curClientX, touch.curClientY);
		}
	   if (numTouches > 1) {
			var details = this._getTouchDetails();
			var newDistance = details.distance;
			var newAngle = details.angle;
            
			if (this.touchSamples.length == this.touchSamplesToUse) {
				var curDistance = 0, curAngle = 0;
			for (var i = 0; i < this.touchSamples.length; i++) {
				curDistance += this.touchSamples[i].distance;
				curAngle += this.touchSamples[i].angle;
			}
			curDistance /= this.touchSamplesToUse;
			curAngle /= this.touchSamplesToUse;
                
			var distanceDelta = (newDistance - curDistance) / curDistance;		// Fraction of the change.  Half = .5.  Double = 2.0.   
			var newDistance;
			switch (this.viewMode) {
				case Renderer.Ortho:
					distanceDelta *= 1.1;
					newDistance = this.camera.getDistance() * (1 / (distanceDelta + 1.0)); 
					this.camera.setDistance(newDistance);
					break;
				case Renderer.Perspective:
					var newFov = this.camera.getFov() * ((-distanceDelta * 1.2) + 1.0);
					this.camera.setFov(Math.max(1.0, Math.min(60, newFov)));		// Changes about 1 degree per click.
					break;
			}
			
			// Viewer Rotation restricts rotation so the poles are always centered.  Don't allow touches to mess with that.
			if (this.rotationMode != Renderer.ViewerRotation) {
				var angleDelta = newAngle - curAngle;
				this.camera.rotate(0.0, 0.0, 1.0, -angleDelta);
			}
			this.needsRedraw = true;

			this.touchSamples.shift();      // Removes first element.
			}
			this.touchSamples.push(details);
		}
		touchEvent.preventDefault(); 
		this.updateTouchStatus();
   }

    
	onTouchEnd (touchEvent) {
		var touches = touchEvent.changedTouches;

		for (var i = 0; i < touches.length; i++) {
			delete this.currentTouches[touches[i].identifier];
		}

		if (this._getNumTouches() < 2) {
			this.zUpRotating = false;
			this.touchSamples = [];
			this._showTrackballElement(false);
			this.snapFocus();
		}
		this.rotating = false;
		this.zUpRotating = false;

		this.updateTouchStatus();
	}
	
	_onMouseMove (ev) {
		if (ev.pointerType == "touch")
			return;

		if (this.panning == true) {
			this.camera.panInPixels(ev.x - this.lastPan.x, -(ev.y - this.lastPan.y));	// Inverse Y
			this.lastPan.x = ev.x; this.lastPan.y = ev.y;
		}
		if (this.rotating == true) {
			// Find the rotation angle by mapping the pixel onto a trackball sphere.
			this.updateTrackball(ev.x, ev.y, false /* force_z_rotation */);
		}
		if (this.zUpRotating == true) {
			this.updateZUpRotation(ev.x, ev.y);
		}
		if (this.onMouseMove) {
			this.onMouseMove(ev);
		}
				
	}
	
	_onMouseDown (ev) {
		if (ev.pointerType == "touch")
			return;
		
		this.lastButtonDown = ev.button;
		if (ev.button == 0 /* left */) {
			if (this.rotationMode == Renderer.ViewerRotation) {
				this.updateZUpRotation(ev.x, ev.y);
			}
		}

		else if (ev.button == 1 /* middle (wheel) */) {
			this.panning = true;
			this.lastPan.x = ev.x; this.lastPan.y = ev.y;
			ev.preventDefault();
		}

		else if (ev.button == 2 /* right */) {
			if (this.rotationMode == Renderer.StandardRotation) {
				if (this.onRotateStart)
					this.onRotateStart();
				this.updateTrackball(ev.x, ev.y);		// Rotate
			}
			else if (this.rotationMode == Renderer.ViewerRotation) {
				this.updateZUpRotation(ev.x, ev.y);
			}
		}

		if (this.onMouseDown)
			this.onMouseDown(ev);
	}
  
	_onMouseUp (ev) {
		if (ev.pointerType == "touch")
			return;

		if (this.panning)
			this.snapFocus();

		this.rotating = false;
		this.panning = false;
		this.zUpRotating = false;
		this._showTrackballElement(false);

		if (this.onMouseUp)
			this.onMouseUp(ev);
	}

	_onMouseWheel (ev) {
		var delta = 0;
		switch (ev.deltaMode) {
			case 0:  delta = ev.wheelDeltaY; break;			// 0 = pixels.  wheel delta Y is independent of scroll speed settings.  Used by IE, Chrome where it is -120 or 120 on the mouse wheel.  Trackpad used more specific numbers.
			case 1:  delta = ev.deltaY * 33; break;			// 1 = lines.  Used by FF.  Chrome, IE conversion = 33.  No speed settings indepentent value known.
			case 2:  delta = ev.deltaY * 120; break;			// 2 = pages.  Used when mouse setting is set to 'scroll per page'.
		}
		//console.log(ev.deltaY + " (" + ev.wheelDeltaY + ")" + " [" + delta + "]");
		
		// Zoom camera
		var newDistance = this.camera.getDistance() * (1 + (-delta / 1200.0)); 
		this.setDistance(newDistance);
						
		this.needsRedraw = true;
		ev.preventDefault();
	}

	_onKeyDown (ev) {
		var key = ev.key;

		var handled = false;
				
		switch (ev.which) {
			case 27: {		// ESC
			
				return;
			}
			case 69: { // e  (make objects solid, not wireframe)
				for (var i = 0; i < this.objects3D.length; i++) 
					this.objects3D[i].toSolid();
				this.needsRedraw = true;
				break;
			}
			case 87: {	// w  (make objects wireframe)
				for (var i = 0; i < this.objects3D.length; i++) 
					this.objects3D[i].toWireframe();
				this.needsRedraw = true;
				break;
			}
		}
		if (this.onKeyDown)
			this.onKeyDown(ev);
	}
}