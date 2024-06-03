// line3.js
// General object defining 2 points in space.

import Vector3 from './vector3.js';
	
export default class Line3  {
	
	// Create a line from 2 points. 
	// p1		Vector3		opt, def=0,0,0. The start point.
	// p2		Vector3		opt, def=0,0,0. The end poitn.
	constructor (p1, p2) {
		this.p1 = new Vector3();
		this.p2 = new Vector3();
		
		if (p1)
			this.p1.set(p1);
		if (p2)
			this.p2.set(p2);
	}
	
	// Set the points of the line. 
	// set (Line3)
	// set (Vector3 start, Vector3 end)
	// set (Vector3 start, Vector3 dir, length)
	set (arg1, arg2, arg3) {
		if (arg1 instanceof Line3) {	// (Line)
			this.p1.set(arg1.p1);
			this.p2.set(arg1.p2);
		}
		else if (arg3 !== undefined) {		// (Vector3 start, Vector3 dir, length)
			this.p1.set(arg1);
			this.p2.set(arg1);
			this.p2.add(arg2);
			this.setLength(arg3);
		}
		else {		// (Vector3 start, Vector3 end)
			this.p1.set(arg1);
			this.p2.set(arg2);
		}
		return this;
	}

	// Returns Vector3 - the direction of the line.
	direction (result /* opt, Vector3 */) {
		if (!result)
			result = new Vector3();

		result.set(this.p2.x - this.p1.x, this.p2.y - this.p1.y, this.p2.z - this.p1.z); 
		if (result.length() == 0)
			result.set(1,0,0);
		result.normalize();
		return result;
	}

	getDirection (result /* opt, Vector3 */) {
		return this.direction(result);
	}

	// Returns number - the distance between the two poitns.
	length () {
		return this.getLength();
	}

	// Returns number - the distance between the two poitns.
	getLength () {
		return Math.sqrt((this.p2.x - this.p1.x) * (this.p2.x - this.p1.x) + 
							  (this.p2.y - this.p1.y) * (this.p2.y - this.p1.y) +
								(this.p2.z - this.p1.z) * (this.p2.z - this.p1.z));
	}

	// Returns number - the xy distance bewteen the two points.
	getXYLength () {
		return Math.sqrt((this.p2.x - this.p1.x) * (this.p2.x - this.p1.x) + 
							  (this.p2.y - this.p1.y) * (this.p2.y - this.p1.y));
	}

	// Sets the distance between the two points, preserving the direction and p1.
	setLength (length) {
		this.p2.set(this.direction());
		this.p2.setLength(length);
		this.p2.add(this.p1);
	}

	// Set the start point (p1)
	setStart (xOrVec, y, z) {
		this.p1.set(xOrVec, y, z);
	}

	// Set the end point (p2)
	setEnd (xOrVec, y, z) {
		this.p2.set(xOrVec, y, z);
	}


	// Returns Vector3 - the point at the passed parameter. param 0=start, param 1=end.
	paramToPoint (param, result) {
		if (!result)
			result = new Vector3();
		result.set(this.p1.x * (1.0 - param) + (this.p2.x * param),
					  this.p1.y * (1.0 - param) + (this.p2.y * param),
					  this.p1.z * (1.0 - param) + (this.p2.z * param));
		return result;
	}

	// Returns Vector3 - the point at the passed parameter. param 0=start, param 1=end.
	param (param, result) {
		return this.paramToPoint(param, result);
	}

	// Returns number - The parameter of the point on the line, assuming the point is on the line.
	pointToParam (point /* Vector3 */) {
		var length = this.p1.distance(this.p2);
		var d1 = point.distance(this.p1);
		var d2 = point.distance(this.p2);
		if (d1 + d2 > length * 1.001) {	// provide a small margin for rounding.
			if (d1 < d2)
				return -d1 / length
			else
				return 1 + d2 / length;
		}
		return d1 / length;
	}

	// Returns number - the param on the line that intersect the passed z plane. Returns null if it does 
	// not intersect the z plane. Intersection reported may occur outside the 0-1 parameters of the line.
	getParamAtZ (z) {
		//if ((this.p1.z > z && this.p2.z > z) || (this.p1.z < z && this.p2.z < z)) {
		//	return null;	
		//}
		if ((this.p1.z == z && this.p2.z == z))
			return 0.0;		// It's parallel and coincident with the z plane. 
		var zSlope = (this.p2.z - this.p1.z) / this.length();
		var distanceFromStart = (z - this.p1.z) / zSlope;
		var param = distanceFromStart / this.length();
		return param;
	}

	
	toString () {
		return "p1: " + this.p1.toString() + ", p2: " + this.p2.toString();
	}


	/* --- TESTING ------------------------------ */

	static Test () {
		var check = function (a, b) {
			if (Math.abs(a - b) > 0.00001)
				console.log("Line3 Test failure: " + a + " != " + b);
		}
		var line1 = new Line3(new Vector3(0, 0, 0), new Vector3(0, 0, 10));
		var zParam = line1.getParamAtZ(2.0);
		check(zParam, 0.2);

		line1.set(new Vector3(10, 10, 10), new Vector3(20, 20, 20));
		zParam = line1.getParamAtZ(19.0);
		check(zParam, 0.9);

		zParam = line1.getParamAtZ(25.0);
		check(zParam, 1.5);
		zParam = line1.getParamAtZ(5.0);
		check(zParam, -0.5);

		line1.set(new Vector3(4, 0, 0), new Vector3(8, 0, 0));
		var d = line1.pointToParam(new Vector3(5, 0, 0));
		check(d, 0.25);
		var d = line1.pointToParam(new Vector3(12, 0, 0));
		check(d, 2.0);
		var d = line1.pointToParam(new Vector3(0,0,0));
		check(d, -1.0);

	}
}

//Line3.Test();
	
