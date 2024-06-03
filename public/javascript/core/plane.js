// plane.js
// General functionality for a plane in 3-space

import Vector3 from './vector3.js';

var _vec1 = new Vector3();

export default class Plane  {
	// point		Vector3		A point that lies on the plane
	// normal	Vector3		The direction pointing directly out of the plane
	constructor (point, normal) {
		this.point = point;		// Vector3. A point on the plane.
		this.normal = normal;	// Vector3. The up direction of the plane.
		if (this.normal)
			normal.normalize();
	}

	// Create a copy of the plan.e
	clone () {
		return new Plane(this.point.clone(), this.normal.clone());
	}

	// Set the plane from a point (Vector3) and normal (Vector3)
	set (point, normal) {
		this.point = point;
		this.normal = normal;
		normal.normalize();
	}
	
	// Returns false if the plane is not valid. For instance if the normal was set to 0,0,0.
	isValid () {
		return !isNaN(this.normal.x);
	}

	// Returns number - The distance a point is from this plane.
	getPointDistance (point /* Vector3 */) {
		point.sub(this.point, _vec1);
		var distance = _vec1.dot(this.normal);
		return Math.abs(distance);
	}

	distance (point /* Vector3 */) {
		return this.getPointDistance(point);
	}

	// Returns true if the passed point lies above the plane (in the direction of the normal)
	isAbove (point /* Vector3 */) {
		point.sub(this.point, _vec1);
		var distance = _vec1.dot(this.normal);
		return distance > 0;
	}

	// Returns number - The param on the passed line where intersection occurs with this plane.
	// 0: Start point, 1: end point, 0.5: mid point. If the intersection is outside these values, null is returned.
	// line			Line3		The line to test for intersection
	// intersect	Vector3	The location of intersection	
	getLineIntersection (line /* Line3 */, intersect /* opt out Vector3 */) {
		if (!this.isValid())
			return null;

		var p1Distance = this.getPointDistance(line.p1);
		var p2Distance = this.getPointDistance(line.p2);
		var distanceFromPlane = Math.max(p1Distance, p2Distance);
		var reverse = p2Distance > p1Distance;	// do calculations as if p2 was the start.  
		
		var lineDir = _vec1;
		line.getDirection(lineDir);
		var dot = Math.abs(lineDir.dot(this.normal));     // This is how fast the line approaches the plane.
		if (dot < 0.00001)
			return null;        // normal and this line are parallel.

		var distanceOnLine = distanceFromPlane / Math.abs(dot);
		var lineLength = line.length();
		if (distanceOnLine > lineLength)
			return null;        // Intersect point is beyond the point where the line ends.  If the line is going away from the plane it will fail here as well.
		var param = reverse ? 1.0 - (distanceOnLine / lineLength) : (distanceOnLine / lineLength);

		if (intersect) {
			var moveVector = lineDir.mult(distanceOnLine);
			if (reverse)
				line.p2.sub(moveVector, intersect);
			else
				line.p1.add(moveVector, intersect);
		}
		return param;		
	}

	// Transform the point and normal of this plane.
	applyTransform (matrix) {
		matrix.applyToVec(this.point);
		matrix.applyToVec(this.normal);
	}

	// Set the plane from 3 Vector3 points. The points should be in CCW order looking 
	// down onto the facet.
	setFromPoints (p1, p2, p3) {
		var seg = p3.subc(p1);
		var seg2 = p2.subc(p1);
		this.set(p1, seg2.cross(seg));
	}	
}