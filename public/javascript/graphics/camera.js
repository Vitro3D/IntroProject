// camera.js
// Calculates the projection needed to convert world-space to screen-space and vice versa.

import Vector3 from '../core/vector3.js';
import Matrix from '../core/matrix.js';
import MathExt from '../core/math-ext.js';
import Line3 from '../core/line3.js';
	
export default class Camera{
	// A virtual camera that calculates the matrices needed for displaying 3d objects.
	// canvas		DOM Canvas		The Canavs object the camera will be used in. The projection is dependent upon the size of the canvas.
	constructor (canvas) {
		this.fov = 30.0;							// Field of view, in degrees, from the center to the top of the canvas.
		this.far = 20.0;							// Far clipping plane.  Must be positive when using perspective views.
		this.near = -this.far;					// Near clipping plane.  Must be positive in perspective views.
		this.perspective = false;				// Perspective or Ortho?
		this.orthoHeight = null;				// Opt. If populated the coordinate height of the window respects this value and not fov

		this.position = new Vector3(0, 0, 0);	// The position of the camera
		this.forward = new Vector3(0, 0, -1);	// The direction the camera is facing.  Normalized.
		this.yUp = new Vector3(0, 1, 0);			// The up direction of the camera.  Normalized.
						
		this.distance = 4.0;						// In the orthographic view, this is the distance the FOV will be valid at. In perspective, this does nothing.
		this.rotMatrix = new Matrix();		// Current rotation of the scene
		this.invRotMatrix = new Matrix();	// The inverse rotation matrix.

		this.viewMatrix = new Matrix();		// Derived from the camera position in the scene.  Includes rotation and translation
		this.projMatrix = new Matrix();		// Matrix  (ortho / perspective)

		this.matrix = new Matrix();		// The final matrix to pass to shaders (viewMatrix * projMatrix)
		this.invMatrix = new Matrix();	// The inverse of the final matrix

		this.canvas = canvas;
		this.matrixNeedsUpdate = true;			// The matrices need to be recomputed
		this.cameraChangedFlag = true;			// Flag to indicate the camera has changed since last calling the flag.
	};

	getPosition ()		{ return this.position;  }
	getForward ()		{ return this.forward;  }
	getYUp ()			{ return this.yUp;  }

	// Set the position of the camera (where it is looking from in 3-space).
	// setPosition(Vector3)
	// setPosition(x, y, z)
	setPosition (vecOrX, y, z) {
		this.position.set(vecOrX, y, z);
		this._changed();
	}

	// Set only the z position of the camera.
	setPositionZ (zPos) {
		this.position.z = zPos;
		this._changed();
	}

	// Set the up vector. The vector is a direction which the top of the camera faces. A camera level with the XY plane
	// will have an up vector of (0,0,1).
	setYUp (vecOrX, y, z) {
		this.yUp.set(vecOrX, y, z);
		this.yUp.normalize();
		this._changed();
	}

	// Set the forward vector. The vector is the direction that points directly into the screen (the direction the camera is looking).
	setForward (vecOrX, y, z) {
		this.forward.set(vecOrX, y, z);
		this.forward.normalize();
		this._changed();
	}
	
	// Set the point in space the camera is looking. An alternative to setting the forward as a direction.
	setLookAt (vec /* Vector3 */) {
		var dir = vec.subc(this.position);
		this.setForward(dir);
		this._changed();
	}

	// Get the matrix which defines the current camera transform, including the projection.
	getMatrix () {
		if (this.matrixNeedsUpdate)
			this.updateMatrices();
		return this.matrix;
	};

	// returns Float32Array[16]. The raw matrix suitable for passing to the shaders.
	getMatrixRaw () {
		if (this.matrixNeedsUpdate)
			this.updateMatrices();
		return this.getMatrix().e;
	};

	// The matrix representing the current rotation transform of the camera. Will not include translation.
	getRotationMatrix () {
		if (this.matrixNeedsUpdate)
			this.updateMatrices();
		return this.rotMatrix;
	};

	// returns Float32Array[16]. The raw form of the rotation matrix suitable for use in the shaders.
	getRotationMatrixRaw () {
		return this.getRotationMatrix().e;
	}
	
	// Set the rotation matrix of the camera (the orientation) from the passed matrix.
	setRotationMatrix (matrix) {
		this.rotMatrix.set(matrix);
		this._changed();
	}
	
	// Returns Matrix. Get the matrix representing the inverse of the rotation. Used to remove a rotation from an object.
	getInverseRotationMatrix () {
		if (this.matrixNeedsUpdate)
			this.updateMatrices();
		return this.invRotMatrix;
	}

	// Returns Float32Array[16].
	getInverseRotationMatrixRaw () {
		return this.getInverseRotationMatrix().e;
	}

	_changed () {
		this.matrixNeedsUpdate = true;
		this.cameraChangedFlag = true;
	}

	// Has the camera changed since its last update? Useful for finding if the graphics should be updated.
	hasChanged () {
		if (!this.cameraChangedFlag)
			return false;
		this.cameraChangedFlag = false;
		return true;
	}

	update () {
		this.updateMatrices();
	}

	// Calculate the matrices needed for display.
	updateMatrices () {
		// forward needs to be reversed because the projection looks down the z-axis.
		this.rotMatrix.setFromZYVectors(this.forward.reversed(), this.yUp);	
		this.rotMatrix.invert(this.invRotMatrix);
				
		this.viewMatrix.setToTranslation(-this.position.x, -this.position.y, -this.position.z);
		this.viewMatrix.premultiply(this.invRotMatrix);
				
		if (this.perspective)
			this.updatePerspectiveProj();
		else
			this.updateOrthoProj();
				
		this.projMatrix.multiply(this.viewMatrix, this.matrix);

		// Invert the matrices for reference.
		this.rotMatrix.invert(this.invRotMatrix);
		this.matrix.invert(this.invMatrix);

		this.matrixNeedsUpdate = false;

		if (isNaN(this.matrix.e[0])) {
			console.log("Matrix is NaN!");
			return;
		}
	};

	
	// Convert client-space (coordinates generally received from event messages) to canvas-space which are
	// pixels relative to the top-left of the canvas.
	clientToCanvasCoords (clientX, clientY, invertY, result) {
		if (!result)
			result = new Vector3();
		var rect = this.canvas.getBoundingClientRect();
		if (!invertY)
			result.set(clientX - rect.left, clientY - rect.top, 0.0);
		else 
			result.set(clientX - rect.left, rect.height - (clientY - rect.top), 0.0);
		return result;
	}

	// Get the pixel position at the center of the canvas.  In canvas coordinates.
	getCanvasCenter () {
		var rect = this.canvas.getBoundingClientRect();
		if (rect.height > 0)
			return new Vector3(rect.width / 2.0, rect.height / 2.0, 0);
		else
			return new Vector3(this.canvas.width / 2.0, this.canvas.height / 2.0, 0);
	}

	// Distance a point in canvas-space is from the edge of the canvas.
	distanceFromEdge (canvasX, canvasY) {
		var rect = this.canvas.getBoundingClientRect();
		return Math.min(Math.min(canvasX, rect.width - canvasX), Math.min(canvasY, rect.height - canvasY));
	}

	// Returns the height of the canvas in pixels.
	getHeight () {
		var rect = this.canvas.getBoundingClientRect();
		return rect.height == 0 ? this.canvas.height : rect.height;	// canvas may not be in the DOM
	}

	// Returns the width of the canvas in pixels.
	getWidth () {
		var rect = this.canvas.getBoundingClientRect();
		return rect.width == 0 ? this.canvas.width : rect.width;
	}

	// Returns (width / height). A value > 1.0 is wider than tall.
	getAspectRatio () {
		if (this.canvasWidth > 0)
			return this.canvas.clientWidth / this.canvas.clientHeight;
		else
			return this.canvas.width / this.canvas.height;
	}

	// Transform a point from world-space to camera-space. The camera location in camera-space is (0,0,0).
	applyTransform (point /* Vector3 */) {
		this.viewMatrix.applyToVec(point);
	}

	// Convert a client-space pixel to world-space. The depth is at the far plane unless useFarPlane is true.
	// Useful for drawing rays into the scene.
	// useNearPlane	bool  	opt. def=false. If true the pixel is at the depth of the near plane, otherwise the far plane is used.
	project (clientX, clientY, useNearPlane) {
		if (this.matrixNeedsUpdate)
			this.updateMatrices();

		var vec = this.clientToCanvasCoords(clientX, clientY);
		var w = this.canvas.clientWidth || this.canvas.width;	// If the canvas is not in the DOM it will not have a clientWidth.
		var h = this.canvas.clientHeight || this.canvas.height;
		vec.x = vec.x / w * 2.0 - 1.0;			// Convert to values between -1 and 1.  This is what the projection matrix converts world points to.
		vec.y = (h - vec.y) / h * 2.0 - 1.0;	// y is inverted. 
		vec.z = useNearPlane ? 0.0 : 1.0;			// For more exact z in ortho use: 'clientZ / (this.far - this.near) * 2.0;'
		
		if (this.perspective) {
			var w = useNearPlane ? this.near : this.far;		// w is the distance from the camera.
			vec.mult(w);	
			vec.w = w;
		}
								
		this.invMatrix.applyToVec(vec);
		vec.removeW();
		return vec;
	};
	
	// Returns a Line3 going into the screen from the near plane to the far plane at the 
	// passed client coords. 
	projectLine (clientX, clientY) {
		var p1, p2;

		var p1 = this.project(clientX, clientY, true /* nearPlane */);
		var p2 = this.project(clientX, clientY, false);
		
		return new Line3(p1, p2);
	};

	// Distance of a pixel point, in pixels, from the center canvas.
	distanceFromCenter (clientX, clientY) {
		var rect = this.canvas.getBoundingClientRect();
		var vec = new Vector3(clientX - rect.left, clientY - rect.top, 0.0);
	}

	// Returns Vector3 representing the world-space direction of the canvas' x axis.
	getXAxisScreen (result /* Vector3, opt */) {
		if (this.matrixNeedsUpdate)
			this.updateMatrices();
		return this.rotMatrix.getXAxisH(result);
	}

	// Returns Vector3 representing the world-space direction of the canvas' y axis.
	getYAxisScreen (result /* Vector3, opt */) {
		if (this.matrixNeedsUpdate)
			this.updateMatrices();
		return this.rotMatrix.getYAxisH(result);
	}

	// Returns Vector3 representing the world-space direction of the canvas' z axis.
	getZAxisScreen (result /* Vector3, opt */) {
		if (this.matrixNeedsUpdate)
			this.updateMatrices();
		return this.rotMatrix.getZAxisH(result);
	}

	// Returns Vector3 representing the world-space x-axis in screen-space.
	getXAxisWorld (result /* Vector3, opt */) {
		if (this.matrixNeedsUpdate)
			this.updateMatrices();
		return this.rotMatrix.getXAxisV(result);
	}

	// Returns Vector3 representing the world-space y-axis in screen-space.
	getYAxisWorld (result /* Vector3, opt */) {
		if (this.matrixNeedsUpdate)
			this.updateMatrices();
		return this.rotMatrix.getYAxisV(result);
	}

	// Returns Vector3 representing the world-space z-axis in screen-space.
	getZAxisWorld (result /* Vector3, opt */) {
		if (this.matrixNeedsUpdate)
			this.updateMatrices();
		return this.rotMatrix.getZAxisV(result);
	}

	// Set the orientation of the camera. Equivalent to calling setForward() and setYUp().
	// forward		Vector3		World-space direction the camera is pointing.
	// yUp			Vector3		World-space direction the top of the camera faces.
	setOrientation (forward, yUp) {
		this.setForward(forward);
		this.setYUp(yUp);
		this._changed();
	}
	
	// returns		float		world distance of a pixel's width.
	// atDistance	float		opt, def=midplane. The distance from the camera. Not relevant for orthographic projections. 
	distancePerPixel (atDistance) {
		var totalY = this.getVisibleY(atDistance);
		return totalY / (this.canvas.clientHeight || this.canvas.height);
	}

	// Total Y from the top to the bottom. Used to find distance per pixel.
	// atDistance		float		opt, def=far plane. Distance from the camera. Only relevant in perpective mode.
	getVisibleY (atDistance) {
		var totalY;
		if (this.perspective) {
			if (!atDistance)
				atDistance = (this.far + this.near) / 2.0;
			totalY = Math.tan(MathExt.degToRad(this.fov)) * atDistance * 2.0; // Total Y visible in screen space
		}
		else {
			totalY = (Math.tan(MathExt.degToRad(this.fov)) * this.distance) * 2.0; // Total Y visible in screen space
		}
		return totalY;
	}

	// Returns pixels. Finds the number of pixels the object would be if it were perpedicular to the camera lookat line.
	// worldDistance		float		In world-space
	// atDistance			float		opt, def=far plane. Distance from the camera. Not relevant for orthographic views.
	pixelDistance (worldDistance, atDistance) {
		return worldDistance / this.distancePerPixel(atDistance);
	}

	// ZOOM -----------------------------------------------------------------------------

	// Set the camera distance. This is the distance the FOV will be valid at. Only relevant for orthographic projections.
	setDistance (distance) {
		this.distance = distance;
		this._changed();
	}

	// Get the orthographic projection distance (where the FOV will be valid at)
	getDistance () {
		return this.distance;
	}
			
	// Set the pixel distance to a certain amount. Orthographic only?
	setPixelDistance (pixelDistance) {
		var height = this.canvas.height;
		var pixelsToTop = height / 2.0;
		var worldTop = pixelsToTop * pixelDistance;

		var fov = MathExt.degToRad(this.fov);
		var distance = worldTop / Math.tan(fov);		// Kind of working backwards from what the ortho projection will do.
		this.setDistance(distance);
	}

	// PAN ------------------------------------------------------------------------------

	// Pan a specific amount in scene space.
	pan (x, y, z) {
		this.position.add(x, y, z);
		this._changed();
	}

	// Pan a certain amount of pixels in screen space
	panInPixels (x, y) {
		var panX = _vec;
		var panY = _vec2;

		var distancePerPixel = this.distancePerPixel();
		this.getXAxisScreen(panX);
		this.getYAxisScreen(panY);

		panX.mult(distancePerPixel * x);
		panY.mult(distancePerPixel * y);
		panX.add(panY);
		this.pan(-panX.x, -panX.y, -panX.z);
	}

	// ROTATION -------------------------------------------------------------------------


	// Rotate the view around the passed normalized axis.  Angle is in radians.
	// Rotation axis is relative to the view, such that 0, 1, 0 would rotate the whole scene horizontally,
	// regardless of the current camera orientation.
	rotate (x, y, z, angle) {
		if (isNaN(angle)) {
			console.log("Angle is NaN! (x:" + x + " y: " + y + " z:");
			return;
		}
		if (x * x + y * y + z * z == 0.0) {
			console.log("Rotate vector is zero!");
			return;
		}

		if (this.matrixNeedsUpdate)
		 	this.updateMatrices();

		_vec.set(x, y, z);
		this.rotMatrix.applyToVec(_vec);

		_matrix.setToRotation(_vec.x, _vec.y, _vec.z, angle);
		_matrix.applyToVec(this.forward);
		_matrix.applyToVec(this.yUp);

		this._changed();
	};

	// Rotate camera around a vector.  Angle is in radians.
	rotate2 (vec, angle) {
		this.rotate(vec.x, vec.y, vec.z, angle);
	};

	reverseOrientation () {
		var xAxis = this.rotMatrix.getXAxisV();
		var yAxis = this.rotMatrix.getYAxisV();
		var zAxis = this.rotMatrix.getZAxisV();
		xAxis.reverse(); zAxis.reverse();			// Do not flip the Y.  (Keep the right-handed system)
		this.rotMatrix.setAxesV(xAxis, yAxis, zAxis);

		// Flip the y Axis around as well.  This is done because we may have inverted the texture coordinates.
		var xAxis = this.rotMatrix.getXAxisV();
		var yAxis = this.rotMatrix.getYAxisV();
		var zAxis = this.rotMatrix.getZAxisV();

		xAxis.y = -xAxis.y;
		yAxis.y = -yAxis.y;
		zAxis.y = -zAxis.y;
		xAxis.reverse();
		this.rotMatrix.setAxesV(xAxis, yAxis, zAxis);
		
		this._changed();
	};

	// Align the view to the nearest axis. Aligns both the forward and up vecs.
	alignToAxis () {
		var xAxis = new Vector3(1, 0, 0);
		var yAxis = new Vector3(0, 1, 0);
		var zAxis = new Vector3(0, 0, 1);
		var zVec = this.getZAxisScreen();
		var yVec = this.getYAxisScreen();
		
		// Align the forward
		var vec = new Vector3(zVec.dot(xAxis), zVec.dot(yAxis), zVec.dot(zAxis));
		if (Math.abs(vec.x) > Math.abs(vec.y) && Math.abs(vec.x) > Math.abs(vec.z)) 
			this.setForward(vec.x > 0 ? xAxis.reversed() : xAxis);
		else if (Math.abs(vec.y) > Math.abs(vec.z)) 
			this.setForward(vec.y > 0 ? yAxis.reversed() : yAxis);
		else
			this.setForward(vec.z > 0 ? zAxis.reversed() : zAxis);
							  
		// Align the up vec
		vec.set(yVec.dot(xAxis), yVec.dot(yAxis), yVec.dot(zAxis));
		if (Math.abs(vec.x) > Math.abs(vec.y) && Math.abs(vec.x) > Math.abs(vec.z)) 
			this.setYUp(vec.x > 0 ? xAxis : xAxis.reversed());
		else if (Math.abs(vec.y) > Math.abs(vec.z)) 
			this.setYUp(vec.y > 0 ? yAxis : yAxis.reversed());
		else
			this.setYUp(vec.z > 0 ? zAxis : zAxis.reversed());
		this._changed();
	}

	// PROJECTION -----------------------------------------------------------------------

	setNearPlane (nearPlane) {
		this.near = nearPlane;
		this._changed();
	}

	getNearPlane () {
		return this.near;
	}

	setFarPlane (farPlane) {
		this.far = farPlane;
		this._changed();
	}

	getFarPlane () {
		return this.far;
	}

	setToPerspective () {
		this.perspective = true;
		this._changed();
	}

	setToOrtho () {
		this.perspective = false;
		this._changed();
	}

	// Set the field of view in degrees from the top to the center.
	setFov (degrees) {
		this.fov = degrees;
		this._changed();
	}

	getFov () {
		return this.fov;
	}

	// Set the fov of the ortho window from the desired top to bottom height
	setOrthoHeight (height) {
		this.orthoHeight = height;
	}

	getOrthoHeight () {
		return this.orthoHeight;
	}

	updateOrthoProj () {
		var top;
		if (this.orthoHeight != null) {
			top = this.orthoHeight / 2.0;
			this.fov = MathExt.radToDeg(Math.atan(top / this.distance));	// necessary for other functionality
		}
		else
			top = Math.tan(MathExt.degToRad(this.fov)) * this.distance;

		var ar = this.getAspectRatio();
		var left = top * ar;

		this.projMatrix.setToOrtho(-left, left, -top, top, this.near, this.far);
	};

	// Set projection matrix to perspective.  fovy: field of view in the vertical direction
	// ascpect: The ascpect ratio
	updatePerspectiveProj () {
		var ar = this.getAspectRatio();

		// FOV is the total field of view from top to bottom.  In ortho it is only from the top to the middle.
		this.projMatrix.setToPerspective(this.fov * 2.0, Math.max(0.001, this.near), this.far, ar);
	};

}	

var _vec = new Vector3();
var _vec2 = new Vector3();
var _matrix = new Matrix();
