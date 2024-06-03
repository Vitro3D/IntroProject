// canvas-2d.js
// Encapsulates drawing functionality on a 2d canvas using a defined coordinate system.
// The internal user-defined coordinate system is referred to as 'scene coordinates'.
// Usage:
// 1. Create a canvas by passing in a CANVAS element to the constructor
// 2. Call setDimensions(x, y) to set the size of the canvas object.
// 3. Call setProjection(x, y, ppu, invertY).
// 4. Add callbacks if desired for when a mouse is clicked on the canvas such as:
//    this.canvas2d.onMouseDown = function (p) { ... }
// 5. In a draw loop, call clear() to erase the previous frame.
// 6. In the draw loop, draw using functions like drawCircle(), drawRect(), drawGrid(). 
// - The objects must be redrawn every frame. The canvas does not 'remember' what was on it.


import Vector2 from "../core/vector2.js";
import Vector3 from "../core/vector3.js";
import Matrix from "../core/matrix.js";
import Range from "../core/range.js";
import BBox3 from "../core/bbox3.js";
import Color from "../core/color.js";

var _vec1 = new Vector2();
var _vec2 = new Vector2();


export default class Canvas2D {

	// canvasElement		Canvas 	The DOM element that this object will draw upon.
	// eventPassThrough	bool		Pass true if there is an element behind this canvas that will need to hear the events without being blocked.  For example, a transparent canvas may need this.
	constructor (canvasElement, eventPassThrough) {
		this.eventPassThrough = eventPassThrough;
		this.captureLeftClick = false;	// Even if the events are 'pass through', prevent the left click from doing so.
		this.captureRightClick = false;
		this.disableZoom = false;
		this.disablePan = false;
		this.panButton = 2;				// 0=left, 2=right
		this.selectButton = 0;			// 0=left, 2=right

		this.onSelect = null;			// function (Vector2, unitsPerPixel).  Called when the canvas is left clicked.  The scene coordinates are passed in and the current units per pixel.

		this.domElement = canvasElement;
		this.width = canvasElement.clientWidth;		// Width in pixels
		this.height = canvasElement.clientHeight;		// Height in pixels
		canvasElement.width = this.width;
		canvasElement.height = this.height;			// If the height and width of the canvas context do not match the client, this won't work.
		this.context = canvasElement.getContext('2d');
		this.context.font = "12px Courier";		// a fixed with font
		this.invertY = false;

		this.lookAt = new Vector2(0, 0);
		this.upDir = new Vector3(0, 1, 0);
		this.projMatrix = new Matrix();
		this.rotMatrix = new Matrix();
		this.translationMatrix = new Matrix();
		this.matrix = new Matrix();
		//this.invMatrix = new Matrix();

		// Callbacks that can be set.  Returns the coord of the event in scene space.
		this.onPan = null;				// function ().  Called when the view has been panned via a mouse move.
		this.onMouseMove = null;		// function (p, shiftKey, ctrlKey, altKey)
		this.onMouseDown = null;		// function (p,  button, shiftKey, ctrlKey, altKey)
		this.onMouseUp = null;			// function (p, shiftKey, ctrlKey, altKey)
		this.onKeyDown = null;			// function (ev, p). Called if a key is pressed and the mouse is over the canvas. Passed the event and the scene point of the mouse.
		this.onAltSelect = null;		// function (p /*Vector2*/). Called when an alt selection is made on the canvas (mouse right click or long touch). p is in scene space.
		this.needsRedraw = false;		// bool. The canvas view has been moved so it needs to be redrawn.

		// UI
		this.lastMousePos = new Vector2();		// The last location of the mouse cursor, in canvas space		
		this.lastMousePosScene = new Vector2();// The last location of the mouse cursor, in scene space.
		this.mouseDownLeft = false;
		this.mouseDownRight = false;
		this.isMouseOver = false;					// Is the mouse currently over this canvas?
		this.panning = false;
		this.lastPanPos = new Vector2();			// The last pan location of the mouse cursor, in canvas space.
		this.lastTouchDistance = -1;				// The last recorded distance between a 2 finger touch in pixels.
		this.enableSelectionBox = false;
		this.selecting = false;
		this.selectPos = new Vector2();			// The select position in canvas space
		this.selectBoxStart = new Vector2();	// One corner of the current selection box in scene space
		this.selectBoxEnd = new Vector2();		// The other corner of the current selection box in scene space
		this.selectBoxColor = '#349eeb88';
		this.selectBoxBorder = '#174e7566';

		//this.selectedPos = new Vector2();		// The last position selected by the user in scene space.
		this.limitTo1Touch = false;
		this.currentTouches = {};		// The touches currently active, keyed by the touch identifier.

		var touch = { identifier: 99999,			// DEBUG
							canvasX: 300,
							canvasY: 300};
		//this.currentTouches[touch.identifier] = touch;

		var self = this;
		var domElem = canvasElement;
		if (this.eventPassThrough) {
			canvasElement.style.pointerEvents = "none";		// block pointer events and use the document's listener
			domElem = document;
		}
			
		canvasElement.className += canvasElement.className ? ' canvas2D' : 'canvas2D';	// add the canvas2D css.
				
		if (canvasElement.onpointerdown === undefined)
			domElem.addEventListener("mousedown", function(ev) {  if (!self.eventPassThrough || self.isWithin(ev.x, ev.y))  self._onMouseDown(ev); });
		else
			domElem.addEventListener("pointerdown", function (ev) { if (!self.eventPassThrough || self.isWithin(ev.x, ev.y)) self._onMouseDown(ev); });

		if (canvasElement.onpointerup === undefined)
			domElem.addEventListener("mouseup", function (ev) {  if (!self.eventPassThrough || self.isWithin(ev.x, ev.y))	self._onMouseUp(ev); });
		else
			domElem.addEventListener("pointerup", function (ev) { if (!self.eventPassThrough || self.isWithin(ev.x, ev.y))  self._onMouseUp(ev); });

		if (document.onpointermove === undefined)
			domElem.addEventListener('mousemove', function (ev) {  self._onMouseMove(ev); }, false);
		else
			domElem.addEventListener('pointermove', function (ev) { self._onMouseMove(ev); }, false);	// when attached to doc, this will tell update the isMouseOver member.
		domElem.addEventListener('mousewheel', function (ev) { if (!self.eventPassThrough || self.isWithin(ev.x, ev.y))	self._onMouseWheel(ev); });

		if (domElem == canvasElement) {
			domElem.addEventListener('mouseout', function (ev) { self.isMouseOver = false; });	// If the dom element is the document, it will recienve the mouseover message outside the canvas and this isn't necessary.
		}

		document.addEventListener('keydown', function (ev) { self._onKeyDown(ev); }, false);
		document.addEventListener('touchstart',  function (ev) { self._onTouchStart(ev); }, { passive: false, capture: false });	// touch events default to 'passive' which means they can't be set to be ignored.
		document.addEventListener('touchend',	  function (ev) { self._onTouchEnd(ev); }, { passive: false, capture: false });
		document.addEventListener('touchcancel', function (ev) { self._onTouchEnd(ev); }, { passive: false, capture: false });
		document.addEventListener('touchmove',   function (ev) { self._onTouchMove(ev); }, { passive: false, capture: false });
		canvasElement.oncontextmenu = function (ev) { self._onAltSelect(ev); };		// Disable right-click context menu
			
		// The bottom left in projection coordinate system.  Note that the y is inverted so the bottom is the lowest y.
		this.xLeft = 0;	 
		this.yLow = 0;			// Either the top if 'invertY' is false or the bottom if it is true.
		this.pixelsPerUnitX = 1;
		this.pixelsPerUnitY = 1;	
	}
		
	getCanvas = function () {
		return this.domElement;
	}

	// All objects drawn will inherit this alpha value. 
	// alpha		0-1		0=transparent, 1=opaque
	setGlobalAlpha = function (alpha) {
		this.context.globalAlpha = alpha;
		this.needsRedraw = true;
	}

	// Should the selection box appear when the user click-drags the cursor?
	setEnableSelectionBox = function (enable) {
		this.enableSelectionBox = enable;
	}

	// Set the button that will pan the view.
	// button		0|1|2		0=left, 1=middle, 2=right
	setPanButton = function (button) {
		this.panButton = button;
	}

	// Clear the canvas with an html color (eg. "#FFFFFF")
	// If no color is specified, all the pixels are cleared to completely transparent.
   clear = function (color)  {
	   // clear the canvas
		var context = this.context;
		context.clearRect(0, 0, this.width, this.height);
		if (color) {
			context.fillStyle = color;
			context.fillRect(0, 0, this.width, this.height);
		}
   };

	// Set the dimensions of the canvas in pixels.
	setDimensions = function (width, height) {
		this.domElement.width = width;
		this.domElement.height = height;
		this.domElement.style.width = width + "px";
		this.domElement.style.height = height + "px";
		this.width = width;
		this.height = height;
		this.setProjection(this.lookAt.x, this.lookAt.y, this.pixelsPerUnitX, this.invertY, this.pixelsPerUnitY);
		this.needsRedraw = true;
	};

	// Set the dimensions as it appears on the screen. This can be different than the internal
	// representation of the canvas.
	setStyleDimensions = function (width, height) {
		this.domElement.style.width = width + "px";
		this.domElement.style.height = height + "px";
		this.needsRedraw = true;
	}
	
	// Is the passed client pixel within the bounds of the canvas? Useful for event handling.
	isWithin = function (xOrVec, y) {
		_vec2.set(xOrVec, y);
		this.clientToCanvas(_vec2.x, _vec2.y, _vec1);
		return (_vec1.x >= 0 && _vec1.x < this.width && 
				  _vec1.y >= 0 && _vec1.y < this.height);
	}

	// returns		Vector2		The center point in this canvas' coordinate system.
   getCenter = function () {
	   return new Vector2(this.xLeft + (this.width / 2.0 / this.pixelsPerUnitX),
								 this.yLow + (this.height / 2.0 / this.pixelsPerUnitY));
   };

   // returns		Vector2		The center point in canvas pixel coordinates (0,0 is top left)
   getCenterC = function () {
	   return new Vector2(this.width / 2.0,
								 this.height / 2.0);
   };

   // Set the center of the canvas in scene coordinates
   setCenter = function (xOrVector, y) {
		if (typeof xOrVector == 'number') 
			this.setProjection(xOrVector, y, this.pixelsPerUnitX, this.invertY, this.pixelsPerUnitY);
		else 
			this.setProjection(xOrVector.x, xOrVector.y, this.pixelsPerUnitX, this.invertY, this.pixelsPerUnitY);
		this.needsRedraw = true;
	};

	// returns 	bool		Right mouse button is depressed on the canvas.
	isRightMouseDown = function () {
		return this.mouseDownRight;
	}

	// returns 	bool		Left mouse button is depressed on the canvas.
	isLeftMouseDown = function () {
		return this.mouseDownLeft;
	}

	// returns Vector2	The last recorded mouse position in this canvas in scene space.
	getLastMousePosition = function () {
		return this.lastMousePosScene;
	}

	// returns 	float		Number of canvas pixels in one scene unit.
   pixelsToUnits = function (pixels) {
	   return pixels / this.pixelsPerUnitX;
	};
	
	// returns 	float		Number of scene units in a canvas pixel
	unitsToPixels = function (units) {
		return units * this.pixelsPerUnitX;
	}

	// returns	float		Number of pixels per scene unit.
	getPixelsPerUnit = function () {
		return this.pixelsPerUnitX;
	}

	// returns float		Number of scene units per pixel
	getUnitsPerPixel = function () {
		return 1.0 / this.pixelsPerUnitX;
	}

	// If the pixel units are not the same for x and y, these functions can be used.
	pixelsToUnitsX = function (pixels) {
	   return pixels / this.pixelsPerUnitX;
	};
	
	unitsToPixelsX = function (units) {
		return units * this.pixelsPerUnitX;
	}

	pixelsToUnitsY = function (pixels) {
	   return pixels / this.pixelsPerUnitY;
	};
	
	unitsToPixelsY = function (units) {
		return units * this.pixelsPerUnitY;
	}

	// Pan the scene in internal units.
	// x, y		number		Number of scene units to pan the view.
	pan = function (xOrVec, y) {
		var newCenter = this.getCenter();
		newCenter.add(xOrVec, y);
		this.setCenter(newCenter);

		if (this.onPan) 
			this.onPan();		
		this.needsRedraw = true;
	};

	// Pan the scene in canvas pixel units.
	panInPixels = function (x, y) {
		this.pan(x / this.pixelsPerUnitX, y / this.pixelsPerUnitY);
	}

   // Zoom the scene by a factor.  1.05 zooms in 5%, 95% would zoom out 5%.
   zoom = function (factor) {
		var center = this.getCenter();
		this.pixelsPerUnitX *= factor;
		this.pixelsPerUnitY *= factor;
	   this.setCenter(center.x, center.y);
	   this._updateMatrices();
		this.needsRedraw = true;
   };

	// Set the number of pixels per scene unit. 
	// ppuX		pixels		Number of pixels in the x direction per scene unit
	// ppuY		pixels		opt, def=ppuX. Pixels in the y direction per scene unit. 
	setPixelsPerUnit = function (ppuX, ppuY) {
		if (ppuX <= 0.0)
			return;
		this.pixelsPerUnitX = ppuX;
		this.pixelsPerUnitY = ppuY ? ppuY : ppuX;
		this._updateMatrices();
		this.needsRedraw = true;
	};
	
	// Set the number of internal units per pixel.
	// uppX		units			Number of units per pixel X
	// uppY		units			opt, def=uppX. Number of units per pixel Y
	setUnitsPerPixel = function (uppX, uppY) {
		if (uppX <= 0.0)
			return;
		this.setPixelsPerUnit(1.0 / uppX, uppY ? 1.0 / uppY : undefined);
		this.needsRedraw = true;
	};

   // Set which direction is up, in scene coordinates
   setUpDirection = function (x, y) {
	   this.upDir.set(x, y, 0);
	   this.upDir.normalize();
	   this._updateMatrices();
		this.needsRedraw = true;
   };

	// Set up the projection in one function
	// xCenter,yCenter	number		The scene unit that will be displayed at the center of the canvas
	// pixelsPerUnit		number	The number of canvas pixels that are in one scene unit.			
	// invertY				bool		opt, def=true. If true, the Y+ axis will go up. If false, the Y+ axis will go down.
	// pixelsPerUnitY		number	opt, def=pixelsPerUnit. Number of pixels Y if different from pixels per unit X.
   setProjection = function (xCenter, yCenter, pixelsPerUnit, invertY, pixelsPerUnitY) {
		if (invertY === undefined) invertY = true;
		this.pixelsPerUnitX = pixelsPerUnit;
		this.pixelsPerUnitY = pixelsPerUnitY ? pixelsPerUnitY : pixelsPerUnit;
	   this.xLeft = xCenter - (this.width / 2.0 / this.pixelsPerUnitX);
	   this.yLow = yCenter - (this.height / 2.0 / this.pixelsPerUnitY);
	   this.invertY = invertY;

	   this.lookAt.x = xCenter;
	   this.lookAt.y = yCenter;
	   this._updateMatrices();
		this.needsRedraw = true;
   };

	// Set the projection up from what values should be on the left and right edges.
	// left		number		The scene unit that should be on the left of the visible canvas.
	// right		number		The scene unit that should be on the right of the visible canvas.
	// yCenter	number		opt, def=0. The scene unit Y that should appear in the center of the canvas.
	setLeftRight = function (left, right, yCenter) {
		yCenter = yCenter || 0;
		this.setProjection((left + right) / 2, yCenter, 
								this.width / (right - left));	// pixels per unit
	}
 
	
	// returns 	BBox3 	The bounding box of the current view in scene coordinates.
	getBBox = function (result) {
		if (!result)
			result = new BBox3();
		else
			result.clear();
		result.add(this.getRightX(), this.getTopY());
		result.add(this.getLeftX(), this.getBottomY());
		return result;
	}

	// returns  float		The scene y currently at the top of the view.
   getTopY = function () {
	   return this.canvasToScene(0, 0).y;
   };

	// returns 	float		The scene y currently at the bottom of the view.
   getBottomY = function () {
	   return this.canvasToScene(0, this.height).y;
   };

	// returns 	float		The scene x currently at the left of the view.
   getLeftX = function () {
	   return this.canvasToScene(0, 0).x;
   };

	// returns 	float		The scene x currently at the right of the view.
   getRightX = function () {
	   return this.canvasToScene(this.width, 0).x;
   };

	// returns	float		The x extent of the current visible scene in scene units.
	getExtentX = function () {
		return this.width / this.pixelsPerUnitX;
	};

	// returns	float		The y extent of the current visible scene in scene units.
	getExtentY = function () {
		return this.height / this.pixelsPerUnitY;
	};


	/* -- COORD CONVERSION ---------- */

	// returns					Vector2		The coordinate in Canvas pixel coordinates
	// clientX, clienty		number		The client coordinate, generally from an event.
	// result					Vector2		opt. Out value to place the result into.
   clientToCanvas = function (clientX, clientY, result /* opt, Vector2 */) {
	   var rect = this.domElement.getBoundingClientRect();
		if (!result)
			result = new Vector2();
		result.set(clientX - rect.left, clientY - rect.top);
		return result;
	};
	
	// returns				Vector2		The scene coordinate the passed client coordinate maps to.
	// clientX, clientY	number		The client coordinates generally from an event.
	// result				Vector2		opt. Out value to place the result into.
   clientToScene = function (clientX, clientY, result /* opt, Vector2 */) {
		if (!result)
			result = new Vector2();
	   this.clientToCanvas(clientX, clientY, result);
	   this.canvasToScene(result.x, result.y, result);
		return result;
   };

   // Transform a 2D point from scene space to pixel space for drawing.
   sceneToCanvas = function (x, y, result /* Vector2 out opt */) {
		if (!result) result = new Vector2();
	   result.set(x, y);
	   this.matrix.applyToVector(result);
		if (this.invertY)
			result.y = this.height - result.y;
	   return result;
   };

   canvasToScene = function (xOrVec, yOrResult, result) {
		var x, y;
		if (xOrVec.x !== undefined)  {
			result = yOrResult;
			x = xOrVec.x;
			y = xOrVec.y;
		}
		else {
			x = xOrVec;
			y = yOrResult;
		}
		if (!result)
			result = new Vector2();
		if (this.invertY)
		  	y = this.height - y;
		result.set(x / this.pixelsPerUnitX + this.xLeft, y / this.pixelsPerUnitY + this.yLow);
		return result;
   };

   // Get the distance from the center in canvas coordinates
   vecFromCenter = function (canvasX, canvasY) {
	   var rect = this.domElement.getBoundingClientRect();
	   return new Vector2(canvasX - (rect.width / 2),
							   canvasY - (rect.height / 2));		// Flip the Y
	};
	
	/* -- MATRIX STUFF -- */

   _updateProjMatrix = function () {
	   this.projMatrix.setToTranslation(this.width / 2.0, this.height / 2.0);	// The canvas may have different dimensions internally than the css displayed element.
	   this.projMatrix.e[0] = this.pixelsPerUnitX;
	   this.projMatrix.e[5] = this.pixelsPerUnitY;
   };

   // Matrix stuff
   _updateMatrices = function () {
	   this._updateProjMatrix();
	
	   // Update the view matrix
	   var zVec = new Vector3(0, 0, 1);
	   this.rotMatrix.setFromZYVectors(zVec, this.upDir);
	   this.translationMatrix.setToTranslation(-this.lookAt.x, -this.lookAt.y);
	
	   var resultMatrix = new Matrix();
	   this.rotMatrix.multiply(this.translationMatrix, resultMatrix);
	   this.projMatrix.multiply(resultMatrix, this.matrix /* out */);
	   //this.matrix.invert(this.invMatrix /* out */);
   };

	/* -- EVENT HANDLERS -- */
   
   _onMouseDown = function (ev) {
		//this.clientToCanvas(ev.x, ev.y, this.lastMousePos);
		if (ev.button == this.panButton) { 
			this.panning = !this.disablePan;
			this.lastPanPos.set(this.lastMousePos);	// sets the initial location of the pan
			this.mouseDownRight = true;
			if (this.captureRightClick)
				ev.preventDefault();
		}
		if (ev.button == this.selectButton && this.onSelect) {
			this.selecting = true;
			this.selectPos.set(this.lastMousePos);
			this.clientToScene(ev.x, ev.y, this.selectBoxStart);
			this.selectBoxEnd.set(this.selectBoxStart);
			this.mouseDownLeft = true;
			ev.preventDefault();
			if (this.captureLeftClick)
				ev.preventDefault();
			this.needsRedraw = true;
		}

		if (this.onMouseDown) {
			var p = this.clientToScene(ev.x, ev.y);
			this.onMouseDown(p, ev.button, ev.shiftKey, ev.ctrlKey, ev.altKey);
		}
	};

	_onAltSelect = function (ev) {
		ev.preventDefault();		// don't allow the context menu to appear.
		if (!this.onAltSelect)
			return;

		var pos = this.clientToScene(ev.x, ev.y);
		this.onAltSelect(pos);
	};

   _onMouseUp = function (ev) {
		if (this.selecting && this.onSelect) {
			// Depending on how much the mouse was moved, it will be considered a point click or a bounds selection
			if (this.selectPos.distance(this.lastMousePos) < 15) {		
				var p = this.canvasToScene(this.lastMousePos);
				this.onSelect(p, ev.shiftKey, ev.ctrlKey, ev.altKey);
			}
			else {		
				var bbox = new BBox3(this.selectBoxStart, this.selectBoxEnd);
				this.onSelect(bbox, ev.shiftKey, ev.ctrlKey, ev.altKey);
			}
		}
		if (ev.button == 0 /* left */) 
			this.mouseDownLeft = false;
		if (ev.button == 2 /* right */) 
			this.mouseDownRight = false;

		if (this.onMouseUp) {
			var p = this.clientToScene(ev.x, ev.y);
			this.onMouseUp(p, ev.shiftKey, ev.ctrlKey, ev.altKey);
		}

		this.panning = false;
		this.selecting = false;
	};

   _onMouseMove = function (ev) {
		var p = _vec1;
		this.clientToCanvas(ev.x, ev.y, p);
		this.lastMousePos.set(p);
		this.canvasToScene(this.lastMousePos, this.lastMousePosScene);
							
		if (p.x >= 0 && p.x < this.width && p.y >= 0 && p.y < this.height) {
			this.isMouseOver = true;
			if (this.panning) {
				this.canvasToScene(this.lastPanPos, _vec2);
				_vec2.sub(this.lastMousePosScene);
				this.pan(_vec2);
				this.lastPanPos.set(this.lastMousePos);
			}
			if (this.selecting && this.enableSelectionBox) {
				this.selectBoxEnd.set(this.lastMousePosScene);
				this.needsRedraw = true;
			}

			if (this.onMouseMove) 
				this.onMouseMove(this.lastMousePosScene, ev.shiftKey, ev.ctrlKey, ev.altKey);
			
		}
		else {
			this.isMouseOver = false;
			this.panning = false;
			this.selecting = false;
		}

   };

   _onMouseWheel = function (ev) {
		if (this.disableZoom)
			return;

		var delta;
		switch (ev.deltaMode) {
			case 0:  delta = ev.wheelDeltaY; break;			// 0 = pixels.  wheel delta Y is independent of scroll speed settings.  Used by IE, Chrome where it is -120 or 120 on the mouse wheel.  Trackpad used more specific numbers.
			case 1:  delta = ev.deltaY * 33; break;			// 1 = lines.  Used by FF.  Chrome, IE conversion = 33.  No speed settings indepentent value known.
			case 2:  delta = ev.deltaY * 120; break;			// 2 = pages.  Used when mouse setting is set to 'scroll per page'.
		}
				
		var zoomAdj = 1.0 + (Math.abs(delta) / 1000);
		if (delta < 0)
			zoomAdj = 1.0 / zoomAdj;		// Keeps from having the zoom in be faster than the zoom out.
		this.zoom(zoomAdj);

		//var handled = this.onMouseWheel(ev.deltaY);
		//if (handled)
			ev.preventDefault();
	   //}
   };

   _onKeyDown = function (ev) {

		//console.log(ev.which);
		
		if (ev.which == 27)	{// Esc 
			this.selecting = false;
		}

	   if (this.isMouseOver) {
		   if (this.onKeyDown)  {
			   var handled = this.onKeyDown(ev, this.lastMousePosScene);		// Pass the event and the location in the scene the mouse is at.
			   if (handled)
					ev.preventDefault();
		   }
	   }
   };

   /* -- TOUCH FUNCTIONALITY ------------------------------ */

   hasTouches = function () {
	   for (var touchId in this.currentTouches) {
		   if (this.currentTouches.hasOwnProperty(touchId)) {
			   return true;
		   }
	   }
	   return false;
   };
		
   getTouches = function () {
	   return this.currentTouches;
   };

   getFirstTouch = function () {
	   for (var touchId in this.currentTouches) {
		   if (this.currentTouches.hasOwnProperty(touchId)) {
			   return this.currentTouches[touchId];
		   }
	   }
	   return null;
   };

	_getNumTouches = function () {
      var count = 0;
      for (var prop in this.currentTouches)
         if (this.currentTouches.hasOwnProperty(prop))
               count++;
      return count;
   };

	// Returns the distance between the first 2 touches in pixels.  Generally used for zooming.
	_getTouchDistance = function () {
		var firstTouch = null, secondTouch = null;
		for (var touchId in this.currentTouches) {
			if (this.currentTouches.hasOwnProperty(touchId)) {
				if (!firstTouch) {
					firstTouch = this.currentTouches[touchId];
				}
				else {
					secondTouch = this.currentTouches[touchId];
					break;
				}
			}
		}
		if (!secondTouch)
			return -1;

		_vec1.set(firstTouch.canvasX, firstTouch.canvasY);
		_vec2.set(secondTouch.canvasX, secondTouch.canvasY);
		return _vec1.distance(_vec2);
	}

   updateTouchStatus = function () {
		return;

	   var statusElement = document.getElementById("errorOutput");

	   if (statusElement) {
		   var msg = "";
		   for (var touchId in this.currentTouches) {
			   if (this.currentTouches.hasOwnProperty(touchId)) {
				   var touch = this.currentTouches[touchId];
				   msg += "Touch " + touch.identifier + ": " + touch.canvasX + ", " + touch.canvasY + "<br>";
			   }
		   }
		   statusElement.innerHTML = msg;
	   }
	
   };

   _onTouchStart = function (touchEvent) {
	   if (this.limitTo1Touch == true && this.currentTouches >= 1)
		   return;

	   var newTouches = touchEvent.changedTouches;
		
		var p = _vec1;
	   for (var i = 0; i < newTouches.length; i++) {
		   var touch = newTouches[i];
			var p = this.clientToCanvas(touch.clientX, touch.clientY);
			
		   // only add the touch if it is within the bounds of the canvas.
		   if (this.isWithin(touch.clientX, touch.clientY)) {
			   touch.canvasX = p.x;		// add the canvasX and canvasY properties for convenience
			   touch.canvasY = p.y;	
			   this.currentTouches[touch.identifier] = touch;

				var numTouches = this._getNumTouches();
				if (numTouches == 1) {
					this.panning = !this.disablePan;
					this.lastPanPos.set(p); 						// last pan is in canvas space
					this.canvasToScene(p, this.selectPos);		// select pos is in scene space
					this.selecting = true;
				}
				else {
					this.panning = false;
				}
				
				if (numTouches == 2) {
					this.lastTouchDistance = this._getTouchDistance();
				}

				//touchEvent.preventDefault();

				//if (this.onTouchStart) 
		   	//	this.onTouchStart(p.x, p.y);
		   }
	   }

	   this.updateTouchStatus();
   };
	
   _onTouchEnd = function (touchEvent) {
	   var touches = touchEvent.changedTouches;

	   for (var i = 0; i < touches.length; i++) {
		   delete this.currentTouches[touches[i].identifier];
		}
		
		if (this._getNumTouches() == 0 && this.selecting && this.onSelect) {
			var canvasPoint = _vec1;
			this.clientToCanvas(touches[0].clientX, touches[0].clientY, canvasPoint);
			if (this.selectPos.distance(canvasPoint) < 8) {		// If the user moved the mouse significantly while the button was down, we'll consider that a cancel.
				var p = this.clientToScene(touches[0].clientX, touches[0].clientY);
				this.onSelect(p);
			}
		}

		this.panning = false;
		this.selecting = false;

	   if (this.onTouchEnd)
		   this.onTouchEnd(touchEvent);

	   this.updateTouchStatus();
   };

   _onTouchMove = function (ev /* TouchEvent */) {
	   var touches = ev.changedTouches;

		// Update the touch positions
	   for (var i = 0; i < touches.length; i++) {
		   var touch = touches[i];
		   var curTouch = this.currentTouches[touch.identifier];

		   if (curTouch) {
			   var p = this.clientToCanvas(touch.clientX, touch.clientY);
			   curTouch.canvasX = p.x;	// update canvasX and canvasY
			   curTouch.canvasY = p.y;
			   //ev.preventDefault();
		   }
	   }

		var numTouches = this._getNumTouches();
		if (numTouches == 1) {
			// var touch = this.getFirstTouch();
			// var sceneP = this.canvasToScene(touch.canvasX, touch.canvasY);	// use the canvasX and canvasY props we added
			
			// var panAmount = _vec1;
			// this.canvasToScene(this.lastPanPos, panAmount);
			// panAmount.sub(sceneP);
			// this.pan(panAmount);
			// this.lastPanPos.set(touch.canvasX, touch.canvasY);

			// Adding preventDefault() here prevents the page from panning. It also will call the 
			// pointerEvent handler and our move event will be handled there.
			ev.preventDefault();
			if (this.onPan)	this.onPan();	// not used?
		}
		else if (numTouches == 2) {
			// pinch zoom.  Zoom amount is based on the change of distance between 2 touches.
			var distance = this._getTouchDistance();
			if (this.lastTouchDistance != -1 && distance != -1) {
				var distanceDelta = distance - this.lastTouchDistance;
				var factor = 1.0 + ((Math.abs(distanceDelta) / this.width) * 2);
				if (distanceDelta < 0)
					factor = 1.0 / factor;
				this.zoom(factor);
			}
			ev.preventDefault();		// Prevents the cell phone browser from zooming in
			this.lastTouchDistance = distance;
		}

	   //if (this.onTouchMove)
		//  this.onTouchMove(ev);

	   this.updateTouchStatus();
   };



	/* -- DRAW FUNCTIONALITY ----------------- */
	
	// xAxisColor	cssColor		color of the horizontal x axis
	// yAxisColor  cssColor		color of the vertical x axis. Where the 2 meet is the origin.
	drawAxes = function (xAxisColor, yAxisColor) {
		this.drawLine(this.getLeftX(), 0, this.getRightX(), 0, xAxisColor);
		this.drawLine(0, this.getTopY(), 0, this.getBottomY(), yAxisColor);
	}

	// Draw a uniform grid of the specified step.
	// step			number		The distance between parallel lines
	// color			CSS Color | Color	The color of the grid lines
	// options
	//  xOffset    number      Distance to offset the grid in x
	//  yOffset    number      Distance to offset the grid in y
	//	 vertOnly	bool			Draw only the vertical lines
	//	 horOnly		bool			Draw only the horizontal lines
	//  xMin,xMax	number		range of x values. Outside of these values no lines will be drawn.
	//  yMin,yMax	number		range of y values. Outside of these values no lines will be drawn.
	drawGrid = function (step, color, options) {
		if (step <= 0)
			return;	// prevent values that can result in an infinte loop

		var xOffset = (!options || options.xOffset === undefined) ? 0 : options.xOffset;
		var yOffset = (!options || options.yOffset === undefined) ? 0 : options.yOffset;
		var xMin = (!options || options.xMin === undefined) ? -1e10 : options.xMin;
		var xMax = (!options || options.xMax === undefined) ? 1e10 : options.xMax;
		var yMin = (!options || options.yMin === undefined) ? -1e10 : options.yMin;
		var yMax = (!options || options.yMax === undefined) ? 1e10 : options.yMax;

		var xRange = new Range(Math.max(xMin, this.getLeftX()), Math.min(xMax, this.getRightX()));
		var yRange = new Range(Math.max(yMin, this.getBottomY()), Math.min(yMax, this.getTopY()));
		var xStart = step * (Math.floor((xRange.min - xOffset) / step) + 1) 
		var yStart = step * (Math.floor((yRange.min - yOffset) / step) + 1) 
		
		// Draw the vertical lines
		if (!options || !options.horOnly) {
			for (var x = xStart; x < xRange.max - xOffset; x += step) {
				this.drawLine(x + xOffset, yRange.min, x + xOffset, yRange.max, color);	
			}
		}

		// Draw the horizontal lines
		if (!options || !options.vertOnly) {
			for (var y = yStart; y < yRange.max - yOffset; y += step) {
				this.drawLine(xRange.min, y + yOffset, xRange.max, y + yOffset, color);	
			}
		}
	};

   // Draw a line using Vectors (V) and in canvas coordinates (C)
   drawLineVC = function (p1 /* Vector2 */, p2 /* Vector2 */, color) {
	   this.drawLineC(p1.x, p1.y, p2.x, p2.y, color);
   };

   // Draw a line in canvas coordinates
	// x1, y1		number	Start point in canvas pixel coordinates
	// x2, y2		number	End point in canvas pixel coordinates
	// color		Color | cssColor	Color of the line
	// thickness	number	Thickness of the line in pixels.
   drawLineC = function (x1, y1, x2, y2, color, thickness) {
		if (color instanceof Color)
			color = color.toHtml();
		this.context.strokeStyle = color;
		this.context.lineWidth = thickness ? thickness : 1;
	   this.context.beginPath();
	   this.context.moveTo(x1, y1);
	   this.context.lineTo(x2, y2);
	   this.context.stroke();
   };

   // Draw a line using vectors in local scene coordinates
	// v1			Vector2/3		Start point in scene coordinats
	// v2			Vector2/3		End point in scene coordinates
	// color		Color | cssColor  Color of the line.
   drawLineV = function (v1, v2, color, thickness) {
	   this.drawLine(v1.x, v1.y, v2.x, v2.y, color, thickness);
   };

   // Draw a line in the local scene coordinates.
	// x1, y1		float		Start point in scene coordinates
	// x2, y2		float		End point in scene coordinates
	// thickness	float		Thickness in pixels.
	// color			Color | cssColor	Color of the line.
   drawLine = function (x1, y1, x2, y2, color, thickness) {	
	   var start = this.sceneToCanvas(x1, y1);
	   var end = this.sceneToCanvas(x2, y2);
	   this.drawLineC(start.x, start.y, end.x, end.y, color, thickness);
	};
	
	// Draw a group of vector2 as a line.  Vectors are in canvas space.
	// outlineColor, fillColor: Html color. optional.
	//	loop: bool opt. The end vertex should be appended to the start
   drawPathC = function (vectors /* Vector2[] */, outlineColor, fillColor, loop, thickness) {
	   if (vectors.length == 0)
			return;
		thickness = thickness ? thickness : 1.0;
		
		if (outlineColor) 
			this.context.strokeStyle = outlineColor;
		if (fillColor)
			this.context.fillStyle = fillColor;
		
	   this.context.beginPath();
	   this.context.moveTo(vectors[0].x, vectors[0].y);
	   for (var i = 0; i < vectors.length; i++) 
		   this.context.lineTo(vectors[i].x, vectors[i].y);
		
		if (loop) 
			this.context.lineTo(vectors[0].x, vectors[0].y);
		if (fillColor)
			this.context.fill();
		if (outlineColor) {
			this.context.lineWidth = thickness;
			this.context.stroke();
		}
   };

	// Draw a group of vector2 as a line. Vectors are in scene space.
	// outlineColor, fillColor: Html color. optional.
	//	loop: bool opt. The end vertex should be appended to the start
   drawPath = function (vectors /* Vector2/3[] */, outlineColor, fillColor, loop, thickness) {
	   if (vectors.length == 0)
			return;
		thickness = thickness ? thickness : 1.0;
		
		if (outlineColor) 
			this.context.strokeStyle = outlineColor;
		if (fillColor)
			this.context.fillStyle = fillColor;
		
	   this.context.beginPath();
	   this.sceneToCanvas(vectors[0].x, vectors[0].y, _vec1);
	   this.context.moveTo(_vec1.x, _vec1.y);
	   for (var i = 0; i < vectors.length; i++) {
		   this.sceneToCanvas(vectors[i].x, vectors[i].y, _vec2);
		   this.context.lineTo(_vec2.x, _vec2.y);
		}

		if (loop) 
			this.context.lineTo(_vec1.x, _vec1.y);
		if (fillColor)
			this.context.fill();
		if (outlineColor) {
			this.context.lineWidth = thickness;
			this.context.stroke();
		}
   };

   // Draw a circle using canvas coordinates (pixels).  Angles in radians. See drawCircle()
   drawCircleC = function (canvasX, canvasY, canvasRad, outlineColor, fillColor, startAngle, endAngle, ccw, thickness) {
		if (fillColor instanceof Color)
			fillColor = fillColor.toHtml();
		if (outlineColor instanceof Color)
			outlineColor = outlineColor.toHtml();
		if (startAngle === undefined)
			startAngle = 0;
		if (endAngle === undefined)
			endAngle = Math.PI * 2;
		if (ccw === undefined)
			ccw = false;
	
	   var context = this.context;
	   context.beginPath();
	   context.arc(canvasX, canvasY, canvasRad, startAngle, endAngle, ccw); 

		//context.arc(200, 200, 100, 2, 0);
		
	   if (fillColor)  {
		   context.fillStyle = fillColor;
		   context.fill();
	   }
	   if (outlineColor) {
			context.lineWidth = thickness || 1;
		   context.strokeStyle = outlineColor;
		   context.stroke();
	   }
   };

	// Draw a circle on the canvas in scene space. 
	// x, y			float			The center of the circle in scene space
	// radius		float			Radius in scene space
	// outlineColor Color | HtmlColor 	opt. Outline color (eg. rgb(200, 200, 100) | "#FFFFFF"). If null, the circle is drawn with no outline.
	// fillColor 	Color | HtmlColor 	opt. Fill color. If null, the circle is drawn with no fill.
	// startAngle	radians		opt. def=0. The start of the circle. 0=+X, PI/2 = -y, PI = -x, PI*1.5 = +y
	// endAngle		radius		opt. def=2*PI. The end of the circle. 0=+X, PI/2 = -y, PI = -x, PI*1.5 = +y
	// ccw			boolean		opt. def=false. From start to end is counter-clockwise. default is clockwise
	// thickness	float			opt. def=1. The thickness of the circle in pixels.
   drawCircle = function (x, y, radius, outlineColor, fillColor, startAngle /* opt */, endAngle /* opt */, ccw, thickness) {
	   var canvasCoord = this.sceneToCanvas(x, y);
	   var canvasRad = radius * this.pixelsPerUnitX;

	   this.drawCircleC(canvasCoord.x, canvasCoord.y, canvasRad, outlineColor, fillColor, startAngle, endAngle, ccw, thickness);
	};
	
	// image: BitmapImage | Image | other image format.  Image to draw.
	// x, y: center of the image, in scene space.
	// width, height: width and height of the image in pixels
	drawImage = function (image, x, y, width, height) {
		var canvasCoord = this.sceneToCanvas(x, y);
		var context = this.context;
		context.drawImage(image, canvasCoord.x - width / 2.0, canvasCoord.y - height / 2.0, width, height);
	};

	// Draw an image on the canvas in pixel coords.
	// x, y				pixel		Location of the upperLeft
	// width, height	pixel		Size of the image on the canvas.
	drawImageC = function (image, x, y, width, height) {
		var context = this.context;
		context.drawImage(image, x, y, width, height);
	};

   // Draw a rectangle in canvas coordinates
   drawRectangleC = function (x, y, width, height, outlineColor, fillColor, thickness) {
	   var context = this.context;

		if (fillColor instanceof Color)
			fillColor = fillColor.toHtml();
		if (outlineColor instanceof Color)
			outlineColor = outlineColor.toHtml();
	
	   if (fillColor)  {
		   context.fillStyle = fillColor;
		   context.fillRect(x, y, width, height);
	   }
	   if (outlineColor) {
			this.context.lineWidth = thickness ? thickness : 1;
		   context.strokeStyle = outlineColor;
		   context.strokeRect(x, y, width, height);
	   }
   };

   // Draw a rectangle.  If outlineColor or fillColor are null, do not draw those.  x and y are in scene coordinates.
	// x,y				number	Corner point in scene coordinates. Lower-left corner if it is not y inverted.
	// width				number	Width of the rectangle in scene coordinates. 
	// height			number	Height of the rectangle in scene coordinates
	// outlineColor Color | cssColor	opt, def=no outline. Color of the outline. 
	// fillColor	 Color | cssColor opt, def=no fill. Color of the fill.
	// thickness		number	opt. Thickness of the outline if relevant.
   drawRectangle = function (x, y, width, height, outlineColor, fillColor, thickness) {
	   var context = this.context;
	   var p = this.sceneToCanvas(x, y);
	   var h = height * this.pixelsPerUnitY;	// Convert to canvas space
	   if (this.invertY)
		   h = -h;

	   this.drawRectangleC(p.x, p.y, width * this.pixelsPerUnitX, h, outlineColor, fillColor, thickness);
	};
	
	// Clear the pixels within the passed rectangle. Sets the pixels to 0,0,0,0
	clearRectangle = function (x, y, width, height) {
		var context = this.context;
	   var p = this.sceneToCanvas(x, y);
	   var h = height * this.pixelsPerUnitY;	// Convert to canvas space
	   if (this.invertY)
		   h = -h;

	   context.clearRect(p.x, p.y, width * this.pixelsPerUnitX, h);
	}

	// Draw text on the canvas using scene units. Size is still in pixels.
   drawText = function (text, x, y, color, size, center) {
		var p = this.sceneToCanvas(x, y);
		this.drawTextC(text, p.x, p.y, color, size, center);
	};
	
	// Draw text in canvas coordinates where 0,0 is the top-left corner of the canvas and the units are pixels.
	// color		CssColor		The color of the text (eg. "FF00FF")
	// size		number		opt. def=16. font size in pixels
	// center 	bool			Center the text on the passed coords (def=false)
	drawTextC = function (text, x, y, color, size, center) {
		if (!size) size = 16;
		this.context.font = "bold " + size + "px Courier ";	// fixed width
		this.context.textAlign = "left";
		this.context.fillStyle = color ? color : "rgb(0, 0, 0)";
		
		if (center) {
			x -= this.context.measureText(text).width * 0.5;
			y += size * 0.40;	// aesthetically it looks better if it's up a little bit.
		}
	   this.context.fillText(text, x, y);
	}

	// Draw multiple lines of text onto the canvas. 
	// text		string		The text to display. Linebreaks are denoted with '\n'.
	// x,y		number		The canvas pixel coordinates to start displaying the text
	// color		CssColor		The color of the text (eg. "#4332FF")
	// size		number		The pixel height of the text.
	drawMultilineTextC = function (text, x, y, color, size) {
		if (!size) size = 16;
		var lines = text.split('\n');
		var p = this.sceneToCanvas(x, y);
		for (var i = 0; i < lines.length; i++) {
			this.drawTextC(lines[i], x, y + (i * size * 1.1), color, size, false /* center */);
		}
	};

	// Call from the main draw loop to draw the selection rectangle if using the selection functionality.
	drawUI = function () {
		// Selection box
		if (this.selecting) {
			var a = this.selectBoxStart;
			var b = this.selectBoxEnd;
			this.context.lineWidth = 3;
			this.drawRectangle(a.x, a.y, b.x - a.x, b.y - a.y, this.selectBoxBorder, this.selectBoxColor);
			this.context.lineWidth = 1;
		}

	}

	// Render the current contents of the canvas to an Image object.
	// returns 	Image		A DOM element containing the canvas information
	toImage = function () {
		var img = document.createElement("IMG");
		img.src = this.domElement.toDataURL('image/png'); // It seems the canvas needs to be rendered (not hidden) for this to work.
		return img;  
	}

	// Save a png to the passed url containing the current contents of the canvas.
	// url		string		Location of a server that will accept the image.
	save = function (url) {		
		var png = this.domElement.toDataURL("image/png");
		png = png.slice(22);        // Remove the header 'data:image/png;base64'. 
		var decoded = window.atob(png);     // Convert from base64 encoding  'ascii to binary'

		// Store in a Uint8Array.  For some reason sending it as anything other than a uint array will result in any value over x80
		// being incorrectly transferred.
		var intArray = new Uint8Array(decoded.length);
		for (var i = 0; i < decoded.length; i++)
			intArray[i] = decoded.charCodeAt(i);

		var request = new XMLHttpRequest();
		request.open("POST", url, true /* async */);
		request.setRequestHeader("Content-type", "text/plain");
		request.onload = function ()    {   console.log("Canvas image saved to '" + url + "' : " + request.responseText);      }
		request.onerror = function (e)  {   console.log("Canvas image save error: " + e.message);	       }
		request.send(intArray);
	}  
};