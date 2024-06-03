// vector2.js
// - General functionality for a 2D vector or vertex

import MathExt from './math-ext.js';
import BinaryFile from '../util/binary-file.js';
	
export default class Vector2 {
	
	// Vector2(Vector2)	initialize from another vector2
	// Vector2(Vector3)  initialize from a vector3. The z value is discarded.
	// Vector2(x, y)		initialize from an x and y value.
	constructor (xOrVec, y) {
		if (xOrVec && xOrVec.x !== undefined) {
			this.x = xOrVec.x;
			this.y = xOrVec.y;
		}
		else {
			this.x = xOrVec ? xOrVec : 0;
			this.y = y ? y : 0;
		}
	}

	// Create a copy of this vector.
	clone () {
		return new Vector2(this.x, this.y);
	};

	// Set the values of this vector.
	// set (x, y)
	// set (Vector2) - or any object with x and y values.
	set (xOrVec, y) {
		if (xOrVec.x !== undefined) {
			this.x = xOrVec.x;
			this.y = xOrVec.y;
		}
		else {
			this.x = xOrVec;
			this.y = y;
		}
		return this;
	};

	// Returns true if the vector is within the tolerance of the passed vector. Each dimension is tested seperately (not a distance)
	equals (xOrVec, yOrTol, tol) {
		if (xOrVec === undefined || xOrVec === null)
			return false;
		if (xOrVec.x !== undefined) {
			if (yOrTol === undefined)
				yOrTol = 0.00001;
			return Math.abs(xOrVec.x - this.x) < yOrTol && 
					Math.abs(xOrVec.y - this.y) < yOrTol;
		}
		else {
			if (tol === undefined)
				tol = 0.00001;
			return Math.abs(xOrVec - this.x) < tol && 
					Math.abs(yOrTol - this.y) < tol;
		}
	}

	// Returns true if the x and y values are valid numbers.
	isValid () {
		return isFinite(this.x) && isFinite(this.y);
	}
	
	
	toString (precision) {
		var p = precision ? precision : 4;
		return "X: " + this.x.toFixed(p) + "\tY: " + this.y.toFixed(p);
	};

	reverse () {
		this.x = -this.x;
		this.y = -this.y;
		return this;
	};

	// Returns the counter clockwise perpedicular to this ray.
	getPerpedicular (result) {
		if (!result)
			result = new Vector2();
		result.set(-this.y, this.x);
		return result;
	}

	perpedicular (result) {
		return this.getPerpedicular(result);
	};
	
	length () {
		return (this.x * this.x + this.y * this.y) ** 0.5;
		//return Math.sqrt(this.x * this.x + this.y * this.y);
	};

	// Make this vector the passed length.
	setLength (newLength) {
		if (newLength == 0) {
			this.set(0,0);
			return;
		}
		var length = this.length();
		if (length != 0) {
			this.mult(newLength / length);
		}
		return this;
	};

	distance (vecOrX, y) {
		var x = vecOrX;
		if (vecOrX.x !== undefined) {
			x = vecOrX.x;
			y = vecOrX.y;
		}
		x -= this.x;
		y -= this.y;
		return (x * x + y * y) ** 0.5;
		//return Math.sqrt(x * x + y * y);
	};

	distanceXY (vecOrX, y) {
		return this.distance(vecOrX, y);
	}

	
	dot (other /* Vector2 */) {
		return other.x * this.x + other.y * this.y;
	};

	normalize () {
		this.div(this.length());
		return this;
	};

	normalized () {
		var result = this.clone();
		result.div(this.length());
		return result;
	}

	// Angle between two vec2 objects.  In radians.
	angleBetween (other /* Vector2 */) {
		var a = this.normalized();
		var b = other.normalized();
		var dot = a.dot(b);
		return Math.acos(dot);
	};

	// The angle from other in radians. Range = {0, 2 * PI}
	// other		Vector2 		opt. def=(0,1)
	getAngle (other /* Vec */) {
		if (other) {
			angleDelta = other.getAngle() - this.getAngle();
			if (angleDelta > Math.PI)
				angleDelta = angleDelta - (Math.PI * 2.0);
			else if (angleDelta < -Math.PI)
				angleDelta = angleDelta + (Math.PI * 2.0);
			return angleDelta;
		}
		else {
			_vec = this.normalized();
			var angle = Math.acos(_vec.x);	    // Returns a value between 0 and PI.
			if (_vec.y < 0)
				angle = Math.PI + (Math.PI - angle);
			return angle;
		}
	};
	
	// Returns angle from other in radians.
	angle (other) {
		return this.getAngle(other);
	}

	// Add a value to this vector.
	// add (x, y)
	// add (Vector2) - or any object with x and y values.
	// add (scalar)
	add (xOrVec, y) {
		if (xOrVec.x !== undefined) {
			this.x += xOrVec.x;
			this.y += xOrVec.y;
			return this;
		}
		if (y === undefined) {
			this.x += xOrVec;
			this.y += xOrVec;
			return this;
		}
		this.x += xOrVec;
		this.y += y;
		return this;
	}

	// returns a new Vector2 ('clone and add') containing the sum of this vector and the passed.
	// addc (x, y)
	// addc (Vector2) - or any object with x and y values.
	addc (xOrVec, y) {
		if (xOrVec.x != undefined) 
			return new Vector2(this.x + xOrVec.x, this.y + xOrVec.y);
		else
			return new Vector2(this.x + xOrVec, this.y + y);
	}

	// Subtract a value from this vector.
	// sub (x, y)
	// sub (Vector2) - or any object with x and y values.
	// sub (scalar)
	sub (xOrVec, y) {
		if (xOrVec.x !== undefined) {
			this.x -= xOrVec.x;
			this.y -= xOrVec.y;
			return this;
		}
		if (y === undefined) {
			this.x -= xOrVec;
			this.y -= xOrVec;
			return this;
		}
		this.x -= xOrVec;
		this.y -= y;
		return this;
	}

	// Returns a new Vector2 ('clone and subtract'). Optionally pass in a vector that will store the result for effeciency.
	// subc (x, y, [result])	- result is an optional Vector2.
	// subc (vec, [result])
	subc (xOrVec, yOrResult, result) {
		if (xOrVec.x != undefined) {
			if (!yOrResult) {
				yOrResult = new Vector2();
			}
			yOrResult.set(this.x - xOrVec.x, this.y - xOrVec.y);
			return yOrResult;
		}
		else {
			if (!result) {
				result = new Vector2();
			}
			result.set(this.x - xOrVec, this.y - yOrResult);
			return result;
		}
	}

	// Multiply this vector by a number.
	mult (scalar) {
		this.x *= scalar;
		this.y *= scalar;
		return this;
	}
	
	multiply (scalar) {
		this.mult(scalar);
	}

	// Returns Vector2 - the result of the multiplication (clone and multiply)
	multc (scalar) {
		return new Vector2(this.x * scalar, this.y * scalar);
	}
	
	multiplyc (other) {
		return multc(other);
	}

	// Divide this vector by a number.
	div (scalar) {
		this.x /= scalar;
		this.y /= scalar;
		return this;
	}

	divide (scalar) {
		return this.div(scalar);
	}

	// Returns Vector2 - the result of the division by a number.
	divc (scalar) {
		return new Vector2(this.x * scalar, this.y * scalar);
	}

	// Returns number - the direction of this vector as a compass heading.  
	// Straight up (+y): 0, right (+x): 90, down (-y): 180, left (-x): 270.
	getHeading() {
		if (this.x === 0 && this.y === 0)
			return 0;
		var angle = MathExt.radToDeg(this.angle());
		angle = angle - (2 * (angle - 180));
		angle += 90;
		angle = angle % 360;
		return angle;
	};

	// Set length 1 with a direction derived from the passed compass heading.
	// 0: (0,1), 90: (1,0), 180: (0,-1)
	setToHeading (heading) {
		heading -= 90;
		heading = heading - (2 * (heading - 180));
		var angle = MathExt.degToRad(heading);
		this.set(Math.cos(angle), Math.sin(angle));
		return this;
	};

	// returns Vector2 - A new vector of length 1 with a direction derived from the passed compass heading.
	// 0: (0,1), 90: (1,0), 180: (0,-1)
	static fromHeading (heading) {
		var vec = new Vector2();
		vec.setToHeading(heading);
		return vec;
	};

	// Implementation of the BinaryFile interface for writing an object to a binary file.
	writeBinary (file /* BinaryFile */) {
		file.writeFloat(this.x);
		file.writeFloat(this.y);
		return this;
	};

	readBinary (file /* BinaryFile */) {
		this.x = file.readFloat();
		this.y = file.readFloat();
	}

	static readBinary (file /* BinaryFile */) {
		var v = new Vector2();
		v.x = file.readFloat();
		v.y = file.readFloat();
		return v;
	}
}

// utility so it does not have to declare a new vector2 repeatedly.
var _vec = new Vector2();

// Register this type with the serializer so it can be dynamically saved 
// or loaded.
BinaryFile.registerType(Vector2, BinaryFile._VECTOR2);

