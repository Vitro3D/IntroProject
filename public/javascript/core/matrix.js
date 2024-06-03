// matrix.js
// Represents a 4x4 matrix.  Based on examples in WebGL: Programming Guide.
// Most functionality is valid for Vector2 and Vector3.
// Note:
//  WebGL stores its translation in 12, 13 and 14. This is normally thought of as column 4 but
//  written out it would be row 4. WebGL calls its columns rows.
//  https://webglfundamentals.org/webgl/lessons/webgl-matrix-vs-math.html


import Vector2 from './vector2.js';
import Vector3 from './vector3.js';
import MathExt from './math-ext.js';
import BinaryFile from '../util/binary-file.js';

export default class Matrix {

	constructor() {
		// Initialize to identity
		this.e = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);		// column major, which is different from like every example on the internet.
	};

	// Create a copy of this Matrix.
	clone () {
		var n = new Matrix();
		for (var i = 0; i < 16; i++) {
			n.e[i] = this.e[i];
		}
		return n;
	};

	// Set to the identity matrix.
	setToIdentity () {
		this.e[0] = 1;  this.e[1] = 0;  this.e[2] = 0;  this.e[3] = 0;
		this.e[4] = 0;  this.e[5] = 1;  this.e[6] = 0;  this.e[7] = 0;
		this.e[8] = 0;  this.e[9] = 0;  this.e[10] = 1; this.e[11] = 0;
		this.e[12] = 0; this.e[13] = 0; this.e[14] = 0; this.e[15] = 1;
	};

	isIdentity () {
		var identity = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
		for (var i=0; i<16; i++) {
			if (this.e[i] != identity[i])
				return false;
		}
		return true;
	}

	reset () {
		this.setToIdentity();
	};

	// Set all 16 values to 0.
	setToZero () {
		for (var i = 0; i < 16; i++) {
			this.e[i] = 0;
		}
	}

	// Set to the values in another matrix.
	set (other /* Matrix */) {
		for (var i = 0; i < 16; i++) {
			this.e[i] = other.e[i];
		}
	}

	// Place the 16 floats into the passed array.
	// array		array | typedArray	
	// offset	int		opt, def=0. The index to start at.
	placeInArray (array, offset) {
		if (!offset)
			offset = 0;
		for (var i = 0; i < 16; i++) {
			array[i + offset] = this.e[i];
		}
	}

	// Apply only the 3x3 rotation matrix to the passed vector. Apply only the rotation to the passed vector. 
	// The matrix is not changed.
	// vec		Vector2 | Vector3		The vector to be rotated.
	applyRotation (vec) {
		var length = vec.length();
		var x = vec.x * this.e[0] + vec.y * this.e[4] + (vec.z ? vec.z : 0.0) * this.e[8];
		var y = vec.x * this.e[1] + vec.y * this.e[5] + (vec.z ? vec.z : 0.0) * this.e[9];
		var z = vec.x * this.e[2] + vec.y * this.e[6] + (vec.z ? vec.z : 0.0) * this.e[10];
		
		vec.set(x, y, z);
		vec.setLength(length);	// The length would have changed if there was a scale applied to the matrix.
		return vec;
	}

	// Apply only the scale and rotation of the matrix to the passed vector.
	applyScaleRotation (vec, y, z) {
		if (vec.x === undefined) {
			if (z === undefined)
				vec = new Vector2(vec, y);
			else 
				vec = new Vector3(vec, y, z);
		}
				
		var x = vec.x * this.e[0] + vec.y * this.e[4] + (vec.z ? vec.z : 0.0) * this.e[8];
		var y = vec.x * this.e[1] + vec.y * this.e[5] + (vec.z ? vec.z : 0.0) * this.e[9];
		var z = vec.x * this.e[2] + vec.y * this.e[6] + (vec.z ? vec.z : 0.0) * this.e[10];
		
		vec.set(x, y, z);
		return vec;
	}

	// Multiply the passed vector by the matrix. 
	// applyToVector(x, y, z)
	// applyToVector(Vector3)
	// returns		Vector3		This vector which has been changed.
	applyToVector (vec, y, z) {
		this.apply(vec, y, z);
	}
	
	applyToVec (vec, y, z) {
		return this.applyToVector(vec, y, z);
	};

	// Multiply this matrix by the passed vector. Ignore edge cases for performance.
	// - no w value. result must be passed in.
	// martix		{}				serialized Matrix. 
	// result		Vector3		req, out. The result of the transform.
	static applyFast (matrix, x, y, z, result) {
		var e = matrix.e;
		
		var rx = x * e[0] + y * e[4] + z * e[8] + (1 * e[12]);
		var ry = x * e[1] + y * e[5] + z * e[9] + (1 * e[13]);
		var rz = x * e[2] + y * e[6] + z * e[10] + (1 * e[14]);
		var rw = x * e[3] + y * e[7] + z * e[11] + (1 * e[15]);

		if (rw != 1.0) {	// Generally will be 1.0 except for points transformed by the perspective matrix. Apply the w to the values.
			rx = rx / rw;
			ry = ry / rw;
			rz = rz / rw;
		}
		result.x = rx;
		result.y = ry;
		result.z = rz;
	}

	// Multiply this matrix by the passed vector(s)
	// apply (x,y,z)
	// apply (Vector3)
	apply (vec, y, z) {
		if (vec.x === undefined) {		// create a vector if no vector is passed in.
			if (z === undefined)
				vec = new Vector2(vec, y);
			else 
				vec = new Vector3(vec, y, z);
		}

		var e = this.e;
		var vecW = (vec.w === undefined) ? 1.0 : vec.w;

		var x = vec.x * e[0] + vec.y * e[4] + (vec.z ? vec.z : 0.0) * e[8] + (vecW * e[12]);
		var y = vec.x * e[1] + vec.y * e[5] + (vec.z ? vec.z : 0.0) * e[9] + (vecW * e[13]);
		var z = vec.x * e[2] + vec.y * e[6] + (vec.z ? vec.z : 0.0) * e[10] + (vecW * e[14]);
		var w = vec.x * e[3] + vec.y * e[7] + (vec.z ? vec.z : 0.0) * e[11] + (vecW * e[15]);

		if (w != 1.0) {	// Generally will be 1.0 except for points transformed by the perspective matrix. Apply the w to the values.
			x = x / w;
			y = y / w;
			z = z / w;
		}

		vec.set(x, y, z);
		//if (Math.abs(w - 1.0) > 0.0001)		
		//	vec.w = w;
		return vec;
	}

	// Apply the matrix to an iterable array of Vector2 or Vector3s
	applyToVecs (vecs) {
		for (var vec of vecs) {
			this.applyToVector(vec);
		}
	}

	// Using floating point precision, the rotation matrix can get off after several multiplications. 
	// This renormalizes the rotation matrix. Assumes there is no scaling.
	normalizeRotation (tolerance /* number */) {
		var e = this.e;
		var tol = tolerance == null ? 0.001 : tolerance;
		var xMag = e[0] * e[0] + e[1] * e[1] + e[2] * e[2];
		var yMag = e[4] * e[4] + e[5] * e[5] + e[6] * e[6];
		var zMag = e[8] * e[8] + e[9] * e[9] + e[10] * e[10];
		if (Math.abs(xMag - 1.0) > tol || Math.abs(yMag - 1.0) > tol || Math.abs(zMag - 1.0) > tol) {
			_xVec.set(e[0], e[1], e[2]);
			_xVec.normalize();
			_yVec.set(e[4], e[5], e[6]);
			_xVec.cross(_yVec, _zVec);
			_zVec.normalize();
			_zVec.cross(_xVec, _yVec);
			e[0] = _xVec.x; e[1] = _xVec.y; e[2] = _xVec.z;
			e[4] = _yVec.x; e[5] = _yVec.y; e[6] = _yVec.z;
			e[8] = _zVec.x; e[9] = _zVec.y; e[10] = _zVec.z;
		}
	}

	// Retrieve the x axis by going horizontally (1st row)
	getXAxisH (result /* Vector3 */) {
		if (!result) result = new Vector3();
		result.x = this.e[0];
		result.y = this.e[1];
		result.z = this.e[2];
		return result;
	}

	// Retrieve the y axis horizontally (2nd row)
	getYAxisH (result /* Vector3 */) {
		if (!result) result = new Vector3();
		result.x = this.e[4];
		result.y = this.e[5];
		result.z = this.e[6];
		return result;
	}

	// Retrieve the z axis horizontally (3rd row)
	getZAxisH (result /* Vector3 */) {
		if (!result) result = new Vector3();
		result.x = this.e[8];
		result.y = this.e[9];
		result.z = this.e[10];
		return result;
	}

	// Retrieve the x axis by going vertically (1st column)
	getXAxisV (result /* Vector3 */) {
		if (!result) result = new Vector3();
		result.x = this.e[0];
		result.y = this.e[4];
		result.z = this.e[8];
		return result;
	}

	// Retrieve the y axis vertically (2nd column)
	getYAxisV (result /* Vector3 */) {
		if (!result) result = new Vector3();
		result.x = this.e[1];
		result.y = this.e[5];
		result.z = this.e[9];
		return result;
	}

	// Retrieve the z axis vertically (3rd column)
	getZAxisV (result /* Vector3 */) {
		if (!result) result = new Vector3();
		result.x = this.e[2];
		result.y = this.e[6];
		result.z = this.e[10];
		return result;
	}

	// Retrieve the translation (4th column)
	getTranslation (result /* Vector3 */) {
		if (!result) result = new Vector3();
		result.set(this.e[12], this.e[13], this.e[14]);
		return result;
	};

	// Set the orientation of the axis where the z vec appears to point in the passed direction.
	setAxesH (xVec, yVec, zVec /* opt */) {
		var e = this.e;
		if (zVec == undefined) zVec = new Vector3(0, 0, 1);
		e[0] = xVec.x; e[1] = xVec.y; e[2] = xVec.z;
		e[4] = yVec.x; e[5] = yVec.y; e[6] = yVec.z;
		e[8] = zVec.x; e[9] = zVec.y; e[10] = zVec.z;
	}

	// Set the orientation of the axes where the z vec goes into the screen.
	setAxesV (xVec, yVec, zVec /* opt */) {
		var e = this.e;
		if (zVec == undefined) zVec = new Vector3(0, 0, 1);
		e[0] = xVec.x; e[4] = xVec.y; e[8] = xVec.z;
		e[1] = yVec.x; e[5] = yVec.y; e[9] = yVec.z;
		e[2] = zVec.x; e[6] = zVec.y; e[10] = zVec.z;
	}

	// Set the 4th column (translation) to the passed values. Removes all scaling and rotation.
	// setToTranslation(Vector3)
	// setToTranslation(x, y, z)
	setToTranslation (x, y, z /* opt */) {
		if (x instanceof Vector3) {
			z = x.z;
			y = x.y;
			x = x.x;
		}
		var e = this.e;
		if (z == undefined) z = 0.0;
		e[0] = 1; e[4] = 0; e[8] = 0; e[12] = x;
		e[1] = 0; e[5] = 1; e[9] = 0; e[13] = y;
		e[2] = 0; e[6] = 0; e[10] = 1; e[14] = z;
		e[3] = 0; e[7] = 0; e[11] = 0; e[15] = 1;
		return this;
	};

	// Multiply by a translation matrix defined by the passed translation.
	// translate (x,y,z) || translate(Vector3)
	translate (x, y, z /* opt */) {
		if (x instanceof Vector3) {
			z = x.z;
			y = x.y;
			x = x.x;
		}
		var e = this.e;
		if (z == undefined) z = 0.0;
		e[12] += e[0] * x + e[4] * y + e[8] * z;
		e[13] += e[1] * x + e[5] * y + e[9] * z;
		e[14] += e[2] * x + e[6] * y + e[10] * z;
		e[15] += e[3] * x + e[7] * y + e[11] * z;
		return this;
	};

	// Adds a translation straight up without modifying it for scale or rotation
	addTranslation (x, y, z /* opt */) {
		if (x instanceof Vector3) {
			z = x.z;
			y = x.y;
			x = x.x;
		}
		var e = this.e;
		e[12] += x;
		e[13] += y;
		if (z) e[14] += z;
		return this;
	};

	clearTranslation () {
		var e = this.e;
		e[12] = e[13] = e[14] = 0.0;
	}

	
	// // Get the bottom row which contains the zeros.
	// getZeros (result /* Vector3 */) {
	// 	if (!result) result = new Vector3();
	// 	result.set(this.e[3], this.e[7], this.e[11]);
	// 	return result;
	// }
		
	// Scale this matrix
	// scale(Vector3)
	// scale(x, y, z)
	// scale(scalar)
	scale (x, y, z /* opt */) {
		_m.setToScale(x, y, z);
		this.premultiply(_m);
	};

	
	// setToScale(Vector3)		
	// setToScale(x, y, z)		
	// setToScale(scalar)		Uniform scaling
	setToScale (xOrVec, y, z /* opt */) {
		this.setToIdentity();
		if (xOrVec instanceof Vector3) {
			this.e[0] = xOrVec.x;	this.e[5] = xOrVec.y;	this.e[10] = xOrVec.z;
		}
		else {
			this.e[0] = xOrVec;	
			this.e[5] = y ? y : xOrVec;
			this.e[10] = z ? z : xOrVec;
		}
	};

	// Create a new matrix from the passed scale values.
	static fromScale (xOrVec, y, z) {
		var m = new Matrix();
		m.setToScale(xOrVec, y, z);
		return m;
	}

	// Create a new matrix from the passed rotation axis and radians.
	static fromRotation (x, y, z, angle /* radians */) {
		if (z == null) z = 0.0;
		var m = new Matrix();
		m.setToRotation(x, y, z, angle);
		return m;
	}

	// Create a new matrix from the passed translation
	static fromTranslation (x, y, z) {
		var m = new Matrix();
		if (x instanceof Vector2)
			m.setToTranslation(x.x, x.y, 0);
		else if (x instanceof Vector3)
			m.setToTranslation(x.x, x.y, x.z);
		else 
			m.setToTranslation(x, y, z);
		return m;
	}

	
	// Set the rotation to an angle around a rotation axis.  Angle in radians.
	setToRotation (x, y, z, angle) {
		if (z == null) z = 0.0;

		var e = this.e;
		var s = Math.sin(angle);
		var c = Math.cos(angle);

		// Rotation around another axis
		var len = Math.sqrt(x * x + y * y + z * z);
		if (len !== 1) {
			var rlen = 1 / len;
			x *= rlen;
			y *= rlen;
			z *= rlen;
		}
		var nc = 1 - c;
		var xy = x * y;
		var yz = y * z;
		var zx = z * x;
		var xs = x * s;
		var ys = y * s;
		var zs = z * s;

		e[0] = x * x * nc + c;
		e[1] = xy * nc + zs;
		e[2] = zx * nc - ys;
		e[3] = 0;

		e[4] = xy * nc - zs;
		e[5] = y * y * nc + c;
		e[6] = yz * nc + xs;
		e[7] = 0;

		e[8] = zx * nc + ys;
		e[9] = yz * nc - xs;
		e[10] = z * z * nc + c;
		e[11] = 0;

		e[12] = 0;
		e[13] = 0;
		e[14] = 0;
		e[15] = 1;

		return this;
	};

	// Rotate the matrix around the passed axis, angle in radians
	//	angle			radians		Amount CCW radians to rotate around the passed axis.
	// rotate (x, y, z, angle)
	// rotate (Vector3, angle)
	rotate (x, y, z, angle) {
		if (x instanceof Vector3) {
			angle = y;  z = x.z;	y = x.y;	x = x.x;
		}
		else if (z == null) z = 0.0;
		
		_m.setToRotation(x, y, z, angle);
		var x = this.clone();
		var xMag = _m.e[0] * _m.e[0] + _m.e[1] * _m.e[1] + _m.e[2] * _m.e[2];
		var thisXMag = this.e[0] * this.e[0] + this.e[1] * this.e[1] + this.e[2] * this.e[2];
		this.premultiply(_m);
		var thisXMag2 = this.e[0] * this.e[0] + this.e[1] * this.e[1] + this.e[2] * this.e[2];
		this.normalizeRotation();
		return this;
	};

	// Create a new matrix from X and Z vectors. The Y vector is inferred and all vectors
	// are enforced to be orthogonal with the z direction remaining unchanged. The vectors are normalized
	static fromZXVectors (zVector, xVector, translation /* opt */) {
		var m = new Matrix();
		m.setFromZXVectors(zVector, xVector, translation);
		return m;
	};

	// Set the orientation of the matrix using known z and x vectors.
	// zVector		Vector3			The up vector.
	// xVector		Vector3			opt, def=(1,0,0). The x vector. This will be chaged to be orthogonal if necessary.
	// translation	Vector3			opt, def=(0,0,0). The origin of the object after rotation. It must be applied before the rotation so it's useful to define it here.
	setFromZXVectors (zVector, xVector /* Vector3 - optional */, translation) {
		this.reset();
		if (!xVector)
			xVector = new Vector3(1, 0, 0);
		if (xVector.distance(zVector) < 0.005) {
			xVector.set(0, 1, 0);
			if (xVector.distance(zVector < 0.005))
				xVector.set(1, 0, 0);
		}

		_zVec.set(zVector);
		_zVec.normalize();
		_xVec.set(xVector);
		_zVec.cross(_xVec, _yVec);
		_yVec.normalize();
		_yVec.cross(_zVec, _xVec);
				
		if (translation) 
			 this.translate(translation.x, translation.y, translation.z);
		    
		this.setAxesH(_xVec, _yVec, _zVec);			
	}

	// Create a new matrix from the passed z and x vectors. The y vector is inferred and orthogonality
	// is enforced. The z direction remains unchanged.
	// zVector			Vector3		The direction of the z vector which is often the lookat or forward direction.
	// xVector			Vector3		The direction of the x vector which is often the roll vector.
	// translation		Vector3		opt. The translation to add to the matrix.
	static fromZYVectors (zVector, xVector, translation /* opt */) {
		var m = new Matrix();
		m.setFromZYVectors(zVector, xVector, translation);
		return m;
	};
	
	// Set the orientation vectors of the new matrix. The vectors will be normalized and orthogonal.
	// If z and y are not orthogonal, the y vector will be changed and the z will remain unchanged.
	// zVector		Vector3		The direction of the z vector in the space being converted from.
	// yVector		Vector3		The direction of the y vector in the space being converted from.
	setFromZYVectors (zVector, yVector /* Vector3 - optional */, translation /* Vector3 - optional */) {
		this.reset();
		if (!yVector)
			yVector = new Vector3(0, 1, 0);
		if (yVector.distance(zVector) < 0.005) {
			yVector.set(0, 1, 0);
			if (yVector.distance(zVector < 0.005))
				yVector.set(1, 0, 0);
		}

		_zVec.set(zVector);
		_zVec.normalize();
		_yVec.set(yVector);
		_yVec.cross(_zVec, _xVec);	// set the xVec to (y X z)
		_xVec.normalize();			
		_zVec.cross(_xVec, _yVec); // set the yVec to (z X x)
				
		if (translation) 
		    this.translate(translation.x, translation.y, translation.z);
		else
			this.clearTranslation();
		    
		this.setAxesH(_xVec, _yVec, _zVec);
	}

	
	// forward		Vector3		The direction of the z vector in the original space.
	// upVec			Vector3		The direction of the y vector in the original space.
	// setFromZYVectors (forward, upVec, colMajor /* = false */) {
	// 	_zVec.set(forward);
	// 	_yVec.set(upVec);
	// 	_yVec.normalize();
	// 	_zVec.normalize();

	// 	if (_zVec.distance(_yVec) < 0.005) {
	// 		if (_yVec.distance(_YVEC) < 0.005)
	// 			_yVec.set(0, 0, 1);
	// 		else
	// 			_yVec.set(0, 1, 0);  // try for true y up.
	// 	}
	// 	_yVec.cross(_zVec, _xVec /*result */);
	// 	_xVec.normalize();
	// 	_zVec.cross(_xVec, _yVec /* result */);
	// 	_yVec.normalize();
	// 	if (colMajor)
	// 		this.setAxesV(_xVec, _yVec, _zVec);
	// 	else
	// 		this.setAxesH(_xVec, _yVec, _zVec);
	// 	this.clearTranslation();
	// }

	// Set the matrix from a quaternion which defines rotation. w is the scalar.
	// https://automaticaddison.com/how-to-convert-a-quaternion-to-a-rotation-matrix/
	// setFromQuaternion (w, x, y, z) {
	// 	if (w.w) {
	// 		w
	// 	}
	// 	this.e[0] = 2 * (w * w + x * x) - 1;
	// 	this.e[1] = 2 * (x * y + w * z);
	// 	this.e[2] = 2 * (x * z - w * y);
	// 	this.e[3] = 0;

	// 	this.e[4] = 2 * (x * y - w * z);
	// 	this.e[5] = 2 * (w * w + y * y) - 1;
	// 	this.e[6] = 2 * (y * z + w * x);
	// 	this.e[7] = 0;

	// 	this.e[8] = 2 * (x * z + w * y);
	// 	this.e[9] = 2 * (y * z - w * x);
	// 	this.e[10] = 2 * (w * w + z * z) - 1;
	// 	this.e[11] = 0;
		
	// 	this.e[12] = 0;
	// 	this.e[13] = 0;
	// 	this.e[14] = 0;
	// 	this.e[15] = 1;
	// }
   
	// Deconstruct the matrix into its TRS (translation/rotation/scale) components.
	// translation	Vector3		out, opt. Populates with the translation of the matrix
	// xVec			Vector3		out, opt. The object's x vector in world space
	// yVec			Vector3		out, opt. The object's y vector in world space (the facing direction)
	// zVec			Vector3		out, opt. The object's z vector in world space (the up direction)
	// scale			Vector3		out, opt. The amount the object was scaled by.
	decompose (translation, xVec, yVec, zVec, scale) {
		if (!xVec)	xVec = _xVec;
		if (!yVec)  yVec = _yVec;
		if (!zVec)  zVec = _zVec;
		
		this.getXAxisH(xVec);
		this.getYAxisH(yVec);
		this.getZAxisH(zVec);

		if (scale)
			scale.set(xVec.length(), yVec.length(), zVec.length());
		xVec.normalize();
		yVec.normalize();
		zVec.normalize();
		
		if (translation)
			translation.set(this.e[12], this.e[13], this.e[14]);
	}

	getScale (result) {
		if (!result)
			result = new Vector3();
		this.decompose(null, null, null, null, result);
		return result;
	}

	// Matrix. Returns a matrix that contains only the normalized rotation components.
	getRotation (result) {
		if (!result)
			result = new Matrix();			
		this.getXAxisH(_xVec);
		this.getYAxisH(_yVec);
		this.getZAxisH(_zVec);
		_xVec.normalize();
		_yVec.normalize();
		_zVec.normalize();

		result.setToIdentity();
		result.setAxesH(_xVec, _yVec, _zVec);
		return result;
	}
    
	// Multiply this matrix by another matrix. This matrix is modified unless another is
	// passed in. In that case, the changes will affect that one.
	multiply (other /* matrix */, optResult) {
		var e = this.e;
		var b = other.e;
		var r = optResult != null ? optResult.e : this.e;
		var ai0, ai1, ai2, ai3;

		for (var i = 0; i < 4; i++) {
			ai0 = e[i]; ai1 = e[i + 4]; ai2 = e[i + 8]; ai3 = e[i + 12];
			r[i] = ai0 * b[0] + ai1 * b[1] + ai2 * b[2] + ai3 * b[3];
			r[i + 4] =  ai0 * b[4] +  ai1 * b[5] +  ai2 * b[6] +  ai3 * b[7];
			r[i + 8] =  ai0 * b[8] +  ai1 * b[9] +  ai2 * b[10] + ai3 * b[11];
			r[i + 12] = ai0 * b[12] + ai1 * b[13] + ai2 * b[14] + ai3 * b[15];
		}
		return this;
	};

	// Premultiply this matrix by the passed matrix. If result is passed in, the result
	// is placed there and this matrix is not changed.
	premultiply (other /* matrix */, result /* matrix, opt */) {
		var e = this.e;
		var o = other.e;
		var r = result != null ? result.e : this.e;
		var ai0, ai1, ai2, ai3;

		for (var i = 0; i < 16; i+=4) {
			ai0 = e[i]; ai1 = e[i + 1]; ai2 = e[i + 2]; ai3 = e[i + 3];
			r[i + 0] = ai0 * o[0] + ai1 * o[4] + ai2 * o[8] + ai3 * o[12];
			r[i + 1] = ai0 * o[1] + ai1 * o[5] + ai2 * o[9] + ai3 * o[13];
			r[i + 2] = ai0 * o[2] + ai1 * o[6] + ai2 * o[10] + ai3 * o[14];
			r[i + 3] = ai0 * o[3] + ai1 * o[7] + ai2 * o[11] + ai3 * o[15];
		}
		return this;
	};

	// Multiply a matrix by this one, returning a new matrix.
	multiplied (other /* matrix */) {
		var n = this.clone();
		n.multiply(other);
		return n;
	};

	// Multiply a matrix by this one, returning a new matrix.  
	premultiplied (other /* matrix */) {
		var n = this.clone();
		n.premultiply(other);
		return n;
	};

	multiplyScalar (scalar) {
		for (var i = 0; i < 16; i++) {
			this.e[i] *= scalar;
		}
	}

	add (other /* matrix */) {
		for (var i = 0; i < 16; i++) {
			this.e[i] += other.e[i];
		}
	}

	// Inverts the matrix. If result is passed in, it will populate the result matrix
	// instead of changing this matrix.
	invert (result /* opt. Matrix */) {
		var e = this.e
		var r = result != null ? result.e : this.e;
		
		_inv[0] = e[5] * e[10] * e[15] - e[5] * e[11] * e[14] - e[9] * e[6] * e[15]
					+ e[9] * e[7] * e[14] + e[13] * e[6] * e[11] - e[13] * e[7] * e[10];
		_inv[4] = -e[4] * e[10] * e[15] + e[4] * e[11] * e[14] + e[8] * e[6] * e[15]
					- e[8] * e[7] * e[14] - e[12] * e[6] * e[11] + e[12] * e[7] * e[10];
		_inv[8] = e[4] * e[9] * e[15] - e[4] * e[11] * e[13] - e[8] * e[5] * e[15]
					+ e[8] * e[7] * e[13] + e[12] * e[5] * e[11] - e[12] * e[7] * e[9];
		_inv[12] = -e[4] * e[9] * e[14] + e[4] * e[10] * e[13] + e[8] * e[5] * e[14]
					- e[8] * e[6] * e[13] - e[12] * e[5] * e[10] + e[12] * e[6] * e[9];

		_inv[1] = -e[1] * e[10] * e[15] + e[1] * e[11] * e[14] + e[9] * e[2] * e[15]
					- e[9] * e[3] * e[14] - e[13] * e[2] * e[11] + e[13] * e[3] * e[10];
		_inv[5] = e[0] * e[10] * e[15] - e[0] * e[11] * e[14] - e[8] * e[2] * e[15]
					+ e[8] * e[3] * e[14] + e[12] * e[2] * e[11] - e[12] * e[3] * e[10];
		_inv[9] = -e[0] * e[9] * e[15] + e[0] * e[11] * e[13] + e[8] * e[1] * e[15]
					- e[8] * e[3] * e[13] - e[12] * e[1] * e[11] + e[12] * e[3] * e[9];
		_inv[13] = e[0] * e[9] * e[14] - e[0] * e[10] * e[13] - e[8] * e[1] * e[14]
					+ e[8] * e[2] * e[13] + e[12] * e[1] * e[10] - e[12] * e[2] * e[9];

		_inv[2] = e[1] * e[6] * e[15] - e[1] * e[7] * e[14] - e[5] * e[2] * e[15]
					+ e[5] * e[3] * e[14] + e[13] * e[2] * e[7] - e[13] * e[3] * e[6];
		_inv[6] = -e[0] * e[6] * e[15] + e[0] * e[7] * e[14] + e[4] * e[2] * e[15]
					- e[4] * e[3] * e[14] - e[12] * e[2] * e[7] + e[12] * e[3] * e[6];
		_inv[10] = e[0] * e[5] * e[15] - e[0] * e[7] * e[13] - e[4] * e[1] * e[15]
					+ e[4] * e[3] * e[13] + e[12] * e[1] * e[7] - e[12] * e[3] * e[5];
		_inv[14] = -e[0] * e[5] * e[14] + e[0] * e[6] * e[13] + e[4] * e[1] * e[14]
					- e[4] * e[2] * e[13] - e[12] * e[1] * e[6] + e[12] * e[2] * e[5];

		_inv[3] = -e[1] * e[6] * e[11] + e[1] * e[7] * e[10] + e[5] * e[2] * e[11]
					- e[5] * e[3] * e[10] - e[9] * e[2] * e[7] + e[9] * e[3] * e[6];
		_inv[7] = e[0] * e[6] * e[11] - e[0] * e[7] * e[10] - e[4] * e[2] * e[11]
					+ e[4] * e[3] * e[10] + e[8] * e[2] * e[7] - e[8] * e[3] * e[6];
		_inv[11] = -e[0] * e[5] * e[11] + e[0] * e[7] * e[9] + e[4] * e[1] * e[11]
					- e[4] * e[3] * e[9] - e[8] * e[1] * e[7] + e[8] * e[3] * e[5];
		_inv[15] = e[0] * e[5] * e[10] - e[0] * e[6] * e[9] - e[4] * e[1] * e[10]
					+ e[4] * e[2] * e[9] + e[8] * e[1] * e[6] - e[8] * e[2] * e[5];

		var det = e[0] * _inv[0] + e[1] * _inv[4] + e[2] * _inv[8] + e[3] * _inv[12];
		if (det === 0) {
			return;
		}

		det = 1 / det;
		for (var i = 0; i < 16; i++) {
			r[i] = _inv[i] * det;
		}
	};
	
	// Returns a new matrix that is the inversion of this matrix. Optionally pass in a matrix
	// which will be populated.
	inverted (result /* opt, Matrix */) {
		var r = result;
		if (result) 
			r.set(this);
		else
			r = this.clone();
		r.invert();
		return r;
	};

	// Returns a new matrix that has been inverted, or sets the passed 'result' to the inverted matrix.
	getInverted (result /* opt, Matrix */) {
		return this.inverted(result);
	};

	/* -- PROJECTION ------------------------------------- */

	// Set the matrix to the orthographic projection where lines along the depth are parallel.
	// left, right: The scene point x at the left and right if the view matrix does not alter the scene.
	// bottom, top: The scene point y that would map to the bottom and top if the view matrix does not alter the scene.
	// near, far: The near and far clip planes. 
	setToOrtho (left, right, bottom, top, near, far) {
		if (left === right || bottom === top || near === far) {
			throw 'null frustum';
		}

		var rw = 1 / (right - left);
		var rh = 1 / (top - bottom);
		var rd = 1 / (far - near);

		var e = this.e;

		e[0] = 2 * rw;
		e[1] = 0;
		e[2] = 0;
		e[3] = 0;

		e[4] = 0;
		e[5] = 2 * rh;
		e[6] = 0;
		e[7] = 0;

		e[8] = 0;
		e[9] = 0;
		e[10] = -2 * rd;
		e[11] = 0;

		e[12] = -(right + left) * rw;
		e[13] = -(top + bottom) * rh;
		e[14] = -(far + near) * rd;
		e[15] = 1;

		return this;
	};

	// Set projection matrix to perspective. Will convert from camera space to screen space. 
	// The result is left=-1, right=1, top=1, bottom=-1
	// The result will contain a 4th component (w) called the homogeneous coordinate. 
	// fovy		degrees 		Field of view in the vertical direction from top to bottom.
	// near		number		The near plane. Must be greater than 0.
	// far		number		The far plane. Must be greater than 0 and not equal to the near plane.
	// ar			number		The ascpect ratio
	setToPerspective (fovy, near, far, ar) {
		if (near === far || near <= 0 || far <= 0 || fovy <= 0) {
			console.error("Invalid params to setPerspective()");
			return;
		}

		fovy = Math.PI * fovy / 180 / 2;		// convert degrees to radians.
		var s = Math.sin(fovy);
		var ct = Math.cos(fovy) / s;

		var e = this.e;

		e[0] = ct / ar;
		e[1] = 0;
		e[2] = 0;
		e[3] = 0;

		e[4] = 0;
		e[5] = ct;
		e[6] = 0;
		e[7] = 0;

		e[8] = 0;
		e[9] = 0;
		e[10] = -(far + near) / (far - near);
		e[11] = -1;

		e[12] = 0;
		e[13] = 0;
		e[14] = (-2 * near * far) / (far - near);
		e[15] = 0;

		return this;
	};

	// Export a string of this matrix suitable for debugging
	toString (precision) {
		if (precision === undefined)
			precision = 3;

		var msg = "";
		for (var i = 0; i < 4; i++) {
			msg += this.e[i*4].toFixed(precision) + "\t";
			msg += this.e[i*4+1].toFixed(precision) + "\t"; 
			msg += this.e[i*4+2].toFixed(precision) + "\t"; 
			msg += this.e[i*4+3].toFixed(precision) + "\n";
		}
		return msg;
	}

	toStringHtml (precision) {
		if (precision === undefined)
			precision = 3;

		var msg = "<TABLE>";
		for (var i = 0; i < 4; i++) {
			msg += "<TR><TD>" + this.e[i*4].toFixed(precision) + "</TD>";
			msg += "<TD>" + this.e[i*4+1].toFixed(precision) + "</TD>"; 
			msg += "<TD>" + this.e[i*4+2].toFixed(precision) + "</TD>"; 
			msg += "<TD>" + this.e[i*4+3].toFixed(precision) + "</TD></TR>";
		}
		msg += "</TABLE>";
		return msg;
	};

	// Implementation of the BinaryFile interface for writing an object to a binary file.
	writeBinary (file /* BinaryFile */) {
		file.writeFloat32Array(this.e);
		return this;
	};

	readBinary (file /* BinaryFile */) {
		this.e = file.readFloat32Array();
	}

	static readBinary (file /* BinaryFile */) {
		var m = new Matrix();
		m.e = file.readFloat32Array();
		return m;
	}

	// Unit test for Matrix. TODO - verify correct answers
	static Test () {
		var scale = new Matrix();
		scale.setToScale(4, 3, 2);

		var rot = new Matrix();
		rot.setToRotation(1, 1, 1, MathExt.degToRad(45));

		var translate = new Matrix();
		translate.setToTranslation(10, 5, 2);

		var m = new Matrix();
		
		m.premultiply(scale);
		m.premultiply(rot);
		m.premultiply(translate);

		console.log(m.toString());

		var x = m.getXAxisH();
		var y = m.getYAxisH();
		var z = m.getZAxisH();
		console.log(x.length().toFixed(3), y.length().toFixed(3), z.length().toFixed(3));
	
		var s = new Vector3(), x = new Vector3(), y = new Vector3(), z = new Vector3(), t = new Vector3();
		m.decompose(t, x, y, z, s);

		console.log(t, x, y, z, s);
	}
}
	
// Declared in this scope so the vars are not declared and removed over and over.
var _xVec = new Vector3(), _yVec = new Vector3(), _zVec = new Vector3();
var _inv = new Float32Array(16);
var _m = new Matrix();
var _YVEC = new Vector3(0, 1, 0);

BinaryFile.registerType(Matrix, BinaryFile._MATRIX);	// allows serialization with WriteObjectDynamic
	
//Test();

	




