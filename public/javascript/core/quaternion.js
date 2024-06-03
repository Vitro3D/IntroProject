// quaternion.js
// Based on the npm project quaternion
// Quaternions represent a 4 dimensional complex number with one real part (w) and 3 imaginary (x,y,z)
// The x,y,z components define the axis of rotation, the w the angle.

import Matrix from './matrix.js';
		
export default class Quaternion {

	constructor (w, x, y, z) {
		this.w = 1;			// real number
		this.x = 0;			// imaginary
		this.y = 0; 		// imaginary
		this.z = 0;			// imaginary
		if (w === undefined) 
			this.set(w, x, y, z);
	}

	set (w, x, y, z) {
		if (w instanceof Quaternion) {
			this.w = w.w; this.x = w.x; this.y = w.y; this.z = w.z;
		}
		else {
			this.w = w; this.x = x; this.y = y; this.z = z;
		}
	}

	length () {
		return Math.sqrt(this.w * this.w + this.x * this.x + this.y * this.y + this.z * this.z);
	}

	normalize () {
		var factor = 1 / this.length();
		this.w *= factor;
		this.x *= factor;
		this.y *= factor;
		this.z *= factor;
		return this;
	}

	add (w, x, y, z) {
		if (w instanceof (Quaternion)) {
			x = w.x;	y = w.y; z = w.z; w = w.w;
		}
		this.w += w; this.x += x; this.y += y; this.z += z;
		return this;
	}

	sub (w, x, y, z) {
		if (w instanceof (Quaternion)) {
			x = w.x;	y = w.y; z = w.z; w = w.w;
		}
		this.w -= w; this.x -= x; this.y -= y; this.z -= z;
		return this;
	}

	// Calculates the Hamilton product of this quaternion and the passed one. Can be scaled by passing (scale, 0, 0, 0)
	mult (w, x, y, z, result) {
		if (w instanceof (Quaternion)) {
			x = w.x;	y = w.y; z = w.z; w = w.w;
		}
		if (!result)
			result = this;
		
		_q.w = this.w * w - this.x * x - this.y * y - this.z * z;
		_q.x = this.w * x + this.x * w + this.y * z - this.z * y;
		_q.y = this.w * y + this.y * w + this.z * x - this.x * z;
		_q.z = this.w * z + this.z * w + this.x * y - this.y * x;

		result.w = _q.w; result.x = _q.x; result.y = _q.y; result.z = _q.z;
		return this;
	}

	dot (w, x, y, z) {
		if (w instanceof (Quaternion)) {
			x = w.x;	y = w.y; z = w.z; w = w.w;
		}
		return this.w * w + this.x * x + this.y * y + this.z * z;
	}

	inverse (result) {
		if (!result)
			result = new Quaternion();
		var normSq = this.w * this.w + this.x * this.x + this.y * this.y + this.z * this.z;
		normSq = 1 / normSq;
		result.w = w * normSq;
		result.x = -x * normSq;
		result.y = -y * normSq;
		result.z = -z * normSq;
	}

	// Interpolate between two quaternions. If quats are interpolated normally, they may
	// sometimes take the 'long way around'. For instance if x is -1 on one and 1 on the other.
	// In this case they are the same angle but will interpolate all the way around.
	slerp (other, pct, result) {
		if (!result) 
			result = new Quaternion();

		if (pct < 0.0001) {
			result.set(this);
			return result;
		}
		if (pct > 0.9999) {
			result.set(other);
			return result;
		}
		
		var cosTheta0 = this.w * other.w + this.x * other.x + this.y * other.y + this.z * other.z;
		var flip = cosTheta0 < 0;
		if (flip) {
			cosTheta0 = -cosTheta0;
		}
		if (cosTheta0 >= 0.99999) {
			if (flip) {
				result.w = -this.w + (other.w - this.w) * pct;
				result.x = -this.x + (other.x - this.x) * pct;
				result.y = -this.y + (other.y - this.y) * pct;
				result.z = -this.z + (other.z - this.z) * pct;
			}
			else {
				result.w = this.w + (other.w - this.w) * pct;
				result.x = this.x + (other.x - this.x) * pct;
				result.y = this.y + (other.y - this.y) * pct;
				result.z = this.z + (other.z - this.z) * pct;
			}
			return result;
		}

		var theta0 = Math.acos(cosTheta0);
		var sinTheta0 = Math.sin(theta0);

		var theta = theta0 * pct;
		var sinTheta = Math.sin(theta);
		var cosTheta = Math.cos(theta);

		var s0 = cosTheta - cosTheta0 * sinTheta / sinTheta0;
		var s1 = sinTheta / sinTheta0;

		if (flip) {
			result.w = s0 * -this.w + s1 * other.w;
			result.x = s0 * -this.x + s1 * other.x;
			result.y = s0 * -this.y + s1 * other.y;
			result.z = s0 * -this.z + s1 * other.z;
		}
		else {
			result.w = s0 * this.w + s1 * other.w;
			result.x = s0 * this.x + s1 * other.x;
			result.y = s0 * this.y + s1 * other.y;
			result.z = s0 * this.z + s1 * other.z;
		}
		return result;

	}

	// returns Matrix: The quaternion converted to a 4x4 matrix.
	toMatrix (result) {
		if (!result)
			result = new Matrix();

		result.e[0] = 2 * (this.w * this.w + this.x * this.x) - 1;
		result.e[1] = 2 * (this.x * this.y + this.w * this.z);
		result.e[2] = 2 * (this.x * this.z - this.w * this.y);
		result.e[3] = 0;

		result.e[4] = 2 * (this.x * this.y - this.w * this.z);
		result.e[5] = 2 * (this.w * this.w + this.y * this.y) - 1;
		result.e[6] = 2 * (this.y * this.z + this.w * this.x);
		result.e[7] = 0;

		result.e[8] = 2 * (this.x * this.z + this.w * this.y);
		result.e[9] = 2 * (this.y * this.z - this.w * this.x);
		result.e[10] = 2 * (this.w * this.w + this.z * this.z) - 1;
		result.e[11] = 0;
		
		result.e[12] = 0;
		result.e[13] = 0;
		result.e[14] = 0;
		result.e[15] = 1;
	}
}

var _q = new Quaternion();
