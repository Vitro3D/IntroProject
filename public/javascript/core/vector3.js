// vector3.js
// - General functionality for a 3d vector or vertex

import MathExt from './math-ext.js';
import Vector2 from './vector2.js';
import BinaryFile from '../util/binary-file.js';

export default class Vector3 {

	// Vector2(Vector3)  initialize from a vector3. 
	// Vector2(Vector2)	initialize from a vector2. The z is set to 0.
	// Vector2(x, y, z=0)	initialize from an x, y, and optional z value.
	constructor (xOrVec /*float*/, y /*float*/, z /*float*/) {
		if (xOrVec && xOrVec.x !== undefined) {
			this.x = xOrVec.x;
			this.y = xOrVec.y;
			this.z = xOrVec.z ? xOrVec.z : 0.0;
			return;
		}
		this.x = xOrVec == undefined ? 0.0 : xOrVec;
		this.y = y == undefined ? 0.0 : y;
		this.z = z == undefined ? 0.0 : z;
	}

	
	// returns constant vectors along the axes
	static get X() { return _X  }	// 1, 0, 0
	static get Y() { return _Y; } // 0, 1, 0
	static get Z() { return _Z; } // 0, 0, 1
	static get NegX() { return _negX; } // -1, 0, 0
	static get NegY() { return _negY; } // 0, -1, 0
	static get NegZ() { return _negZ; } // 0, 0, -1

	clone () {
		return new Vector3(this.x, this.y, this.z);
	};

	// Returns true if the passed vector is within tolerance of this one.
	// equals(x, y, z, tol)
	// equals(vec3, tol)
	equals (xOrVec, yOrTol, z, tol) {
		if (xOrVec === undefined || xOrVec === null)
			return false;
		if (xOrVec.x !== undefined) {
			if (yOrTol === undefined)
				yOrTol = 0.00001;
			return Math.abs(xOrVec.x - this.x) < yOrTol && 
						Math.abs(xOrVec.y - this.y) < yOrTol && 
						Math.abs(xOrVec.z - this.z) < yOrTol;
		}
		else {
			if (tol === undefined)
				tol = 0.00001;
			return Math.abs(xOrVec - this.x) < tol && 
						Math.abs(yOrTol - this.y) < tol && 
						Math.abs(z - this.z) < tol;
		}
		
	}

	// Returns true if the x,y, and z values are all valid numbers.
	isValid () {
		return isFinite(this.x) && isFinite(this.y) && isFinite(this.z);
	}

	// set (x, y, z)
	// set (Vector3)
	// set (Vector2)
	set (xOrVec, y, z) {
		if (y !== undefined) {
			this.x = xOrVec;
			this.y = y;
			this.z = z ? z : 0.0;
		}
		else {
			this.x = xOrVec.x;
			this.y = xOrVec.y;
			this.z = xOrVec.z === undefined ? 0.0 : xOrVec.z;
			if (xOrVec.w !== undefined)
				this.w = xOrVec.w;
		}
		return this;
	}

	// Get a single component with an index where x=0, y=1, z=2
	getComponent (i) {
		if (i == 0) return this.x;
		else if (i == 1) return this.y;
		else if (i == 2) return this.z;
	}

	// Set a single component with an index where x=0, y=1, z=2
	setComponent (i, value) {
		if (i == 0) this.x = value;
		else if (i == 1) this.y = value;
		else if (i == 2) this.z = value;
		return this;
	}

	

	setX (x) {
		this.x = x;
		return this;
	}

	setY (y) {
		this.y = y;
		return this;
	}

	setZ (z) {
		this.z = z;
		return this;
	}

	// Return a new vector the same as this one but with a different z.
	withZ (z) {
		return new Vector3(this.x, this.y, z);
	}

	isZero () {
		return this.x == 0 && this.y == 0 && this.z == 0;
	}

	// returns the length of the vector
	length () {
		return (this.x * this.x + this.y * this.y + this.z * this.z) ** 0.5;
	};

	getLength () {
		return this.length();
	};

	// returns the xy length of the vector
	lengthXY () {
		return (this.x * this.x + this.y * this.y) ** 0.5;
	};
	
	getXYLength () {
		return this.lengthXY();
	}

	// Set the vector to a new length.
	setLength (newLength) {
		if (newLength == 0) {
			this.set(0,0,0);
			return;
		}
		var length = this.length();
		if (length > 0)
			this.mult(newLength / length);
		return this;
	};

	// Returns a new vector with the same direction and the passed length
	withLength (newLength) {
		var vec = this.clone();
		vec.setLength(newLength);
		return vec;
	};

	// Returns the distance between this vector and another object that has x,y(,z) values.
	distance (other /* Vector3 */) {
		if (other.z === undefined)
			return this.distanceXY(other);
		return ((this.x - other.x) * (this.x - other.x) + 
					(this.y - other.y) * (this.y - other.y) +
					(this.z - other.z) * (this.z - other.z)) ** 0.5;
	};

	// Returns the XY distance between this vector and another that has x,y values.
	// distanceXY(Vector2)
	// distanceXY(Vector3)
	// distanceXY(x, y)
	distanceXY (xOrVec, y) {
		if (xOrVec.x !== undefined) {
			return ((this.x - xOrVec.x) * (this.x - xOrVec.x) + 
						(this.y - xOrVec.y) * (this.y - xOrVec.y)) ** 0.5;
		}
		return ((this.x - xOrVec) * (this.x - xOrVec) + (this.y - y) * (this.y - y)) ** 0.5;
	};

	// Sets the length of this vector to 1. If the vector is 0,0,0 it is left unchanged.
	normalize () {
		if(this.length() !== 0){
			this.div(this.length());
		}
		return this;
	};

	// Returns a new vector3 with the same direction and length 1. Optionally, pass in a
	// vector3 to be populated instead.
	normalized (result /* opt */) {
		if (!result)
			result = new Vector3();
		result.set(this);
		result.div(this.length());
		return result;
	};

	// W represents the distance in perspective projections.  Points may get a w value
	// when multiplied by pespective matrices.
	removeW () {
		if (this.w === undefined)
			return;
		if (this.w !== undefined)
			this.div(this.w);
		delete this.w;
	};

	// Applies the w value to the xyz. Does not remove the w which has a performance hit.
	applyW () {
		this.x /= this.w;
		this.y /= this.w;
		this.z /= this.w;
		this.w = 1.0;
	}

	reverse () {
		this.x = -this.x;
		this.y = -this.y;
		this.z = -this.z;
		if (this.w !== undefined)
			this.w = -this.w;
		return this;
	}

	// Returns a new Vector3 with the direction reversed. Optionally, pass in a vector3 to be populated.
	reversed (result /* opt */) {
		if (!result)
			result = new Vector3();
		result.set(-this.x, -this.y, -this.z);
		if (this.w !== undefined)
			result.w = -result.w;
		return result;
	}

	// returns the dot product of this vector with the passed vector or (x,y,z) values.
	dot (xOrVec, y, z) {
		if (xOrVec.x !== undefined) 
			return xOrVec.x * this.x + xOrVec.y * this.y + xOrVec.z * this.z;
		return xOrVec * this.x + y * this.y + z * this.z;
	};

	// returns a vector3 representing the cross product of this vector and another. Optionally,
	// pass in a vector3 to be populated.
	cross (other /* Vector3 */, result /* opt. Vector3 */) {
		if (!result)
			result = new Vector3();
		result.x = this.y * other.z - this.z * other.y;
		result.y = this.z * other.x - this.x * other.z;
		result.z = this.x * other.y - this.y * other.x;
		return result;
	};

	// Returns a new vector or populates the passed vector with all values positive.
	abs (result /* opt. Vector3 */) {
		if (!result)
			result = this;
		result.x = Math.abs(this.x);
		result.y = Math.abs(this.y);
		result.z = Math.abs(this.z);
		return result;
	}

	// Returns the angle in radians with another vector.
	angle (other /* Vector3 */) {
		this.normalized(_vec);
		other.normalized(_vecB);
		var dot = _vec.dot(_vecB);
		if (dot >= 1.0)		// dot can sometimes be something like 1.000002.
			return 0.0;
		if (dot <= -1.0)
			return Math.PI;	// 180 degrees
		return Math.acos(dot);
	};

	// Returns the angle in degrees with another vector.
	angleDeg (other /* vector */) {
		return MathExt.radToDeg(this.angle(other));
	};

	// Returns the angle between to vec3s in radians.
	static Angle (vec1, vec2) {
		return vec1.angle(vec2);
	};

	// The angle from vector (0,1) in radians.  Range = {0 : 2*PI}
	angleXY () {
		_vec2.set(this);
		return _vec2.angle();
	};
	
	getPitch () {
		return MathExt.radToDeg(Math.asin(this.z));
	}

	// Angle is relative to the view vector.  View vector points toward the tested vectors.
	// If other is CCW, the result is positive.  CW = negative.
	relAngle (other /* vector */, viewVector) {
		var angle = this.angle(other);
				
		var testVec = this.cross(other);
		if (testVec.angle(viewVector) > Math.PI / 2.0)
			testVec.reverse();
		testVec = this.cross(testVec);
		testVec.normalize();
		var testAngle = testVec.angle(other);
		if (testAngle > Math.PI / 2.0)		// 90 deg
			angle = -angle;
		return angle;
	};

	// Subtract a vector from this one. 
	// sub (Vector2 | Vector3)
	// sub (x, y, z)
	// sub (scalar)
	sub (xOrVec, y, z) {
		if (xOrVec.x !== undefined) {
			this.x = this.x - xOrVec.x;
			this.y = this.y - xOrVec.y;
			if (xOrVec.z !== undefined)
				this.z = this.z - xOrVec.z;	
			return this;
		}
		if (y === undefined) {
			this.x -= xOrVec;
			this.y -= xOrVec;
			this.z -= xOrVec;
			return this;
		}
		this.x = this.x - xOrVec;
		this.y = this.y - y;
		if (z !== undefined)
			this.z = this.z - z;
		return this;
	};

	subtract (other, result) {
		return this.sub(other);
	}

	// Subtract a vector from this one, placing the result in a different vector leaving this one unchanged.
	// subc (vec, result)
	// subc (x, y, z, result)
	// returns 	Vector3		The result of the subtraction
	// x,y,z		number		The vector to subtract as components
	// vec		Vector3		The vector to subtract
	// result	Vector3		opt. The object to place the result in.
	subc (x, y, z, result) {
		if (x.x !== undefined) {
			var result = y || new Vector3();
			result.set(this.x - x.x, this.y - x.y, this.z - (x.z || 0));
			return result;
		}
		else {
			var result = result || new Vector3();
			result.set(this.x - x, this.y - y, this.z - z);
			return result;
		}
	}

	// Add the passed vector to this one.
	// add (Vector2 | Vector3)
	// add (x, y, z)
	// add (scalar)	
	add (xOrVec /* vector */, y, z) {
		if (xOrVec.x !== undefined) {
			this.x = this.x + xOrVec.x;
			this.y = this.y + xOrVec.y;
			if (xOrVec.z !== undefined)
				this.z = this.z + xOrVec.z;	
			return this;
		}
		if (y === undefined) {
			this.x += xOrVec;
			this.y += xOrVec;
			this.z += xOrVec;
			return this;
		}
		this.x = this.x + xOrVec;
		this.y = this.y + y;
		if (z !== undefined)
			this.z = this.z + z;
		return this;
	};

	// Add a vector from this one, placing the result in a different vector leaving this one unchanged.
	// addc (vec, result)
	// addc (x, y, z, result)
	// returns 	Vector3				The result of the addition
	// x,y,z		number				The vector to add as components
	// vec		Vector3 | Vector2	The vector to add
	// result	Vector3				opt. The object to place the result in.
	addc (x, y, z, result) {
		if (x.x !== undefined) {
			var result = y || new Vector3();
			result.set(this.x + x.x, this.y + x.y, this.z + (x.z || 0));
			return result;
		}
		else {
			var result = result || new Vector3();
			result.set(this.x + x, this.y + y, this.z + z);
			return result;
		}
	}

	mult (scalar) {
		this.x = this.x * scalar;
		this.y = this.y * scalar;
		this.z = this.z * scalar;
		if (this.w)
			this.w = this.w * scalar;
		return this;
	}

	multiply (scalar) {
		return this.mult(scalar);
	}

	// Vector3. Returns a new vector and leaves this one unchanged.
	multc (scalar) {
		var result = this.clone();
		result.mult(scalar);
		return result;
	};

	multiplyc (scalar) {
		return this.multc(scalar);
	}

	// Multiply each component by a value.
	multComp (x, y, z) {
		if (x.x !== undefined) {
			y = x.y;
			z = x.z;
			x = x.x;
		}
		this.x *= x;
		this.y *= y;
		this.z *= z;
		return this;
	};

	div (scalar) {
		this.x = this.x / scalar;
		this.y = this.y / scalar;
		this.z = this.z / scalar;
		if (this.w)
			this.w = this.w / scalar;
		return this;
	};

	divide (scalar) {
		return this.div(scalar);
	}

	// Divide by a scalar, returning a clone of the vector.
	divc (scalar) {
		var result = this.clone();
		result.div(scalar);
		return result;
	};

	// Divide each component by a value.
	divComp (x, y, z) {
		if (x.x !== undefined) {
			y = x.y;
			z = x.z;
			x = x.x;
		}
		this.x /= x;
		this.y /= y;
		this.z /= z;
		return this;
	};

	// round the values to the passed percision. eg. (3.14159, 2 => 3.14).
	rounded (digits) {
		return new Vector3(MathExt.round(this.x, digits),
									MathExt.round(this.y, digits),
									MathExt.round(this.z, digits));
	};
	
	// Returns a string of the vector most suitable for debugging.
	toString (precision) {
		var p = precision ? precision : 4;
		var msg = "X: " + this.x.toFixed(p) + "\tY: " + this.y.toFixed(p) + "\tZ: " + this.z.toFixed(p);
		if (this.w !== undefined)
			msg += " W: " + this.w.toFixed(p);
		return msg;
	};
		
	// Implementation of the BinaryFile interface for writing an object to a binary file.
	writeBinary (file /* BinaryFile */) {
		file.writeFloat(this.x);
		file.writeFloat(this.y);
		file.writeFloat(this.z);
		return this;
	};

	readBinary (file /* BinaryFile */) {
		this.x = file.readFloat();
		this.y = file.readFloat();
		this.z = file.readFloat();
	}


	static readBinary (file /* BinaryFile */) {
		var v = new Vector3();
		v.x = file.readFloat();
		v.y = file.readFloat();
		v.z = file.readFloat();
		return v;
	}
}

var _vec = new Vector3();
var _vecB = new Vector3();
var _vec2 = new Vector2();

const _X = new Vector3(1, 0, 0);  
const _Y = new Vector3(0, 1, 0);	
const _Z = new Vector3(0, 0, 1);	
const _negX = new Vector3(-1, 0, 0);	
const _negY = new Vector3(0, -1, 0);	
const _negZ = new Vector3(0, 0, -1);  

BinaryFile.registerType(Vector3, BinaryFile._VECTOR3);	// Allow Vector3 to be serialized with writeObjectDynamic(). When adding new object record it in the comments of BinaryFile.registerType().
