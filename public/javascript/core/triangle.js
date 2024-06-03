// triangle.js
// - Triangle functionality

import Vector3 from './vector3.js';
import Plane from './plane.js';

// Declare some utility objects to save memory allocations.
var _vec1 = new Vector3(), _vec2 = new Vector3(), _vec3 = new Vector3();

// isPointWithin()
var _e12 = new Vector3(), _e23 = new Vector3(), _e31 = new Vector3(), _normal = new Vector3();
var _cross_e12 = new Vector3(), _cross_e23 = new Vector3(), _cross_e31 = new Vector3();
var  _v12 = new Vector3(), _v23 = new Vector3(), _v31 = new Vector3();

export default class Triangle {
	constructor (p1, p2, p3) {
		this.p1 = new Vector3(0, 0, 0);
		this.p2 = new Vector3(0, 0, 0);
		this.p3 = new Vector3(0, 0, 0);

		if (p1) this.p1.set(p1);
		if (p2) this.p2.set(p2);
		if (p3) this.p3.set(p3);

		this._plane = null;			// Plane.  cached value.
	}

	set (p1, p2, p3) {
		if (p1 instanceof Triangle) {
			this.p1.set(p1.p1);
			this.p2.set(p1.p2);
			this.p3.set(p1.p3);
		}
		else {
			this.p1.set(p1);
			this.p2.set(p2);
			this.p3.set(p3);
		}
		if (this._plane)
			this._updatePlane();
	}

	// Set using the expanded xyz members.
	set2 (p1x, p1y, p1z, p2x, p2y, p2z, p3x, p3y, p3z) {
		this.p1.set(p1x, p1y, p1z);
		this.p2.set(p2x, p2y, p2z);
		this.p3.set(p3x, p3y, p3z);
		if (this._plane)
			this._updatePlane();
	}

	// From http://math.oregonstate.edu/home/programs/undergrad/CalculusQuestStudyGuides/vcalc/crossprod/crossprod.html
	getArea () {
		this.p2.sub(this.p1, _vec2); 
		this.p3.sub(this.p1, _vec3); 
		if (_vec2.length() == 0 || _vec3.length() == 0)
			return 0;

		var cross = _vec2.cross(_vec3);
		var area = cross.length() / 2.0;
		return area;
	}

	getNormal (result /* opt */) {
		if (!result)
			result = new Vector3();

		_vec2.set(this.p2);
		_vec3.set(this.p3);

		_vec2.sub(this.p1); 
		_vec3.sub(this.p1); 
		_vec2.cross(_vec3, result);
		result.normalize();

		return result;		
	}

	getCentroid (triangle, result) {
		if (!result)
			result = new Vector3();
		result.set(this.p1);
		result.add(this.p2);
		result.add(this.p3);
		result.div(3);
		return result;
	}

	// Implementation used for ObjectMap.
	getBoundingBox2 (bbox /* BBox2 */) {
		bbox.clear();
		bbox.addPoint(this.p1);
		bbox.addPoint(this.p2);
		bbox.addPoint(this.p3);
	}

	_updatePlane () {
		if (!this._plane)
			this._plane = new Plane();
		this._plane.setFromPoints(this.p1, this.p2, this.p3);
	}

	getPlane () {
		if (!this._plane) 
			this._updatePlane();
		return this._plane;
	}

	translate (xOrVec, y, z) {
		this.p1.add(xOrVec, y, z);
		this.p2.add(xOrVec, y, z);
		this.p3.add(xOrVec, y, z);
	}
	
	// Returns if this point lies within the triangle if it were projected onto the triangle's plane.
	isPointWithin (point) {
		this.p1.sub(this.p2, _e12);
		this.p2.sub(this.p3, _e23);
		this.p3.sub(this.p1, _e31);
		_e12.cross(_e23, _normal);

		_e12.cross(_normal, _cross_e12);
		point.sub(this.p2, _v12);
		var dot_e12 = _v12.dot(_cross_e12);
		if (dot_e12 < 0.0)
			return false;

		_e23.cross(_normal, _cross_e23);
		point.sub(this.p3, _v23);
		var dot_e23 = _v23.dot(_cross_e23);
		if (dot_e23 < 0.0)
			return false;

		_e31.cross(_normal, _cross_e31);
		point.sub(this.p1, _v31);
		var dot_e31 = _v31.dot(_cross_e31);
		if (dot_e31 < 0.0)
			return false;

		return true;
	}

	// Get the parameter of the line where it intersects the triangle.  Returns null if no intersection.
	getIntersectionParameter (line /* Line3 */) {
		var plane = this.getPlane();
		var param = plane.getLineIntersection(line, _vec1 /* intersect point */);
		if (param && this.isPointWithin(_vec1)) {
			return param;
		}
		return null;
	}
}