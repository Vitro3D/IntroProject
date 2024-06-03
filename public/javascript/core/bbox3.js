// BBox3.js
// General functionality for a bounding box (2D or 3D)

import Vector3 from './vector3.js';
import Range from './range.js';
	

export default class BBox3 {

	// p1		Vector3		opt. An initial point to add to the bounding box.
	// p2		Vector3		opt. An second initial point to add to the bounding box.
	constructor (p1, p2) {
		this.min = new Vector3(1e8, 1e8, 1e8);
		this.max = new Vector3(-1e8, -1e8, -1e8);
        
		if (p1 != null)
			this.addPoint(p1);
		if (p2 != null)
			this.addPoint(p2);
	}

	clone () {
		var b = new BBox3(this.min, this.max);
		return b;
	}

	// Returns true if the passed bounding box values are equal to this one.
	// other		BBox3		The bounding box to compare it to.
	equals (other) {
		return this.min.equals(other.min) && this.max.equals(other.max);
	}

	// Set the bounding box to specific values.
	// set (BBox3)
	// set (Vector3, [Vector3])
	set (p1, p2) {
		if (p1 instanceof BBox3) {
			this.min.set(p1.min);
			this.max.set(p1.max);
		}
		else {
			this.clear();
			this.addPoint(p1);
			if (p2)
				this.addPoint(p2);
		}
		return this;
	}

	// Reset the bounding box to an invalid state.
	clear() {
		this.min.x = this.min.y = this.min.z = 1e8;
		this.max.x = this.max.y = this.max.z = -1e8;
	};

	reset () {
		this.clear();
	}

	isValid () {
		return this.min.x <= this.max.x;
	}
		
	getWidth () 	{	return this.max.x - this.min.x;		};
	getHeight () 	{	return this.max.y - this.min.y;		};
	getDepth () 	{	return this.max.z - this.min.z;		};

	minX () 			{  return this.min.x;  }
	minY () 			{  return this.min.y;  }
	minZ () 			{  return this.min.z;  }
	minDim (dim)	{  return this.min[dim] }
	maxX () 			{  return this.max.x;  }
	maxY () 			{  return this.max.y;  }
	maxZ () 			{  return this.max.z;  }
	maxDim (dim)	{  return this.max[dim] }

	extentX () 		{  return (this.max.x - this.min.x);  }
	extentY () 		{  return (this.max.y - this.min.y);  }
	extentZ () 		{  return (this.max.z - this.min.z);  }
	extent (dim) 	{  return dim == 'x' ? this.extentX() : dim == 'y' ? this.extentY() : dim == 'z' ? this.extentZ() : undefined; } 
	centerX () 		{  return (this.max.x + this.min.x) / 2.0;  }
	centerY () 		{  return (this.max.y + this.min.y) / 2.0;  }
	centerZ () 		{  return (this.max.z + this.min.z) / 2.0;  }
	center () 		{ 	return new Vector3(this.centerX(), this.centerY(), this.centerZ()); }
	getCenter () 	{  return new Vector3(this.centerX(), this.centerY(), this.centerZ()); }
	
	// Add a value to the bounding box. The box will only change if the added point is outside the box.
	// add(Vector3)
	// add(x, y, z)
	// add(BBox3)
	add (xOrVec, y, z) {
		if (xOrVec instanceof Vector3) {
			if (xOrVec.x < this.min.x) this.min.x = xOrVec.x;
			if (xOrVec.x > this.max.x) this.max.x = xOrVec.x;
			if (xOrVec.y < this.min.y) this.min.y = xOrVec.y;
			if (xOrVec.y > this.max.y) this.max.y = xOrVec.y;
			if (xOrVec.z < this.min.z) this.min.z = xOrVec.z;
			if (xOrVec.z > this.max.z) this.max.z = xOrVec.z;
		}
		else if (xOrVec instanceof BBox3) {
			this.add(xOrVec.min);
			this.add(xOrVec.max);
		}
		else {
			if (xOrVec < this.min.x) this.min.x = xOrVec;
			if (xOrVec > this.max.x) this.max.x = xOrVec;
			if (y < this.min.y) this.min.y = y;
			if (y > this.max.y) this.max.y = y;
			if (z < this.min.z) this.min.z = z;
			if (z > this.max.z) this.max.z = z;
		}
		return this;
	}
		
	addPoint (xOrVec, y, z) {
		return this.add(xOrVec, y, z);
	};

	// Add multiple points to the bounding box. 
	// points		iterable container of Vector3
	addPoints (points) {
		for (var p of points) {
			this.add(p);
		}
	}
	
	// bbox		BBox3		Adds the min and max values of the passed bbox to this one.
	addBBox (bbox) {
		this.add(bbox.min);
		this.add(bbox.max);
	};
	
	// Returns Vector3 - The extents of this bounding box.
	getSize () {
		return new Vector3(this.max.x - this.min.x,
								this.max.y - this.min.y,
								this.max.z - this.min.z);
	};

	// Vector3
	extents () {
		return this.getSize();
	}

	// Returns true if the passed point is within this bounding box.
	// contains (Vector2)
	// contains (Vector3)
	// contains (x, y, z)
	contains (p /* Vector2/3 */, y, z) {
		if (p.x !== undefined) {
			return p.x >= this.min.x && p.x <= this.max.x && 
				    p.y >= this.min.y && p.y <= this.max.y && 
					 (p.z === undefined || p.z >= this.min.z && p.z <= this.max.z);
		}
		else {
			return p >= this.min.x && p <= this.max.x && 
				    y >= this.min.y && y <= this.max.y && 
					 (z === undefined || z >= this.min.z && z <= this.max.z);
		}
	};
	
	// Increase the size of the bounding box equally in all dimensions by the passed amount. 
	// Passing a negative amount shrinks the box. Note that it may become invalid.
	// expand (value)   - uniform expand
	// expand (x, y, z) - expand by axis
	expand (x, y, z) {
		if (y == undefined) {
			y = x;
			z = x;
		}
		this.min.x -= x;
		this.max.x += x;
		this.min.y -= y;
		this.max.y += y;
		this.min.z -= z;
		this.max.z += z;
		return this;
	}

	// Apply a transform to the bounding box. The eight points are transformed and added to the box. Note that if it is rotated the 
	// result will be a larger box. So it should only be used for a rough idea.
	applyTransform (transform /* Matrix */) {
		_box.clear();
		var p = new Vector3();
		p.set(this.min.x, this.min.y, this.min.z); transform.applyToVec(p);	_box.add(p);
		p.set(this.min.x, this.min.y, this.max.z); transform.applyToVec(p);	_box.add(p);
		p.set(this.min.x, this.max.y, this.min.z); transform.applyToVec(p);	_box.add(p);
		p.set(this.min.x, this.max.y, this.max.z); transform.applyToVec(p);	_box.add(p);

		p.set(this.max.x, this.min.y, this.min.z); transform.applyToVec(p);	_box.add(p);
		p.set(this.max.x, this.min.y, this.max.z); transform.applyToVec(p);	_box.add(p);
		p.set(this.max.x, this.max.y, this.min.z); transform.applyToVec(p);	_box.add(p);
		p.set(this.max.x, this.max.y, this.max.z); transform.applyToVec(p);	_box.add(p);

		this.set(_box);
	}

	// Get a normal from a point that lies on the box. Returns null if the point does not lie on the edge.
	// If the point lies on a corner, the corner normal will be returned.
	getNormal (point, normal /* out, Vector3 */) {
		if (!normal)
			normal = new Vector3();
		
		var tol = 0.001;
		var useCorners = true;
		if (useCorners) {	
			normal.set(0,0,0);
			if (Math.abs(point.x - this.min.x) < tol)		// left
				normal.set(-1, 0, 0);
			else if (Math.abs(point.x - this.max.x) < tol) // right
				normal.set(1, 0, 0);
			if (Math.abs(point.y - this.min.y) < tol) // front
				normal.set(0, -1, 0);
			else if (Math.abs(point.y - this.max.y) < tol) // back
				normal.set(0, 1, 0);
			if (Math.abs(point.z - this.min.z) < tol) // bottom
				normal.set(0, 0, -1);
			else if (Math.abs(point.z - this.max.z) < tol) // top
				normal.set(0, 0, 1);
			if (!normal.x && !normal.y && !normal.z)
				return null;		// point is not on the edge
			normal.normalize();
		}
		else {
			if (Math.abs(point.x - this.min.x) < tol)		// left
				normal.set(-1, 0, 0);
			else if (Math.abs(point.x - this.max.x) < tol) // right
				normal.set(1, 0, 0);
			else if (Math.abs(point.y - this.min.y) < tol) // front
				normal.set(0, -1, 0);
			else if (Math.abs(point.y - this.max.y) < tol) // back
				normal.set(0, 1, 0);
			else if (Math.abs(point.z - this.min.z) < tol) // bottom
				normal.set(0, 0, -1);
			else if (Math.abs(point.z - this.max.z) < tol) // top
				normal.set(0, 0, 1);
			else
				return null;
		}
		
		return normal;
	}

	// Get a normal from a point that lies on the box as if the box was a cylinder.
	// Compute the normal as a xy vector from the center. If the normal lies on the top or bottom,
	// it will be straight up or down.
	getNormalAsCylinder (point, normal /* out, Vector3 */) {
		if (!normal)
			normal = new Vector3();
		var tol = 0.001;
		if (Math.abs(point.z - this.min.z) < tol) // bottom
			normal.set(0, 0, -1);
		else if (Math.abs(point.z - this.max.z) < tol) // top
			normal.set(0, 0, 1);
		else if (Math.abs(point.x - this.min.x) < tol || 		// left
			 		Math.abs(point.x - this.max.x) < tol || // right
					Math.abs(point.y - this.min.y) < tol ||	// front
					Math.abs(point.y - this.max.y) < tol) { // back
			normal.set(point.x - (this.max.x + this.min.x) / 2,
						  point.y - (this.max.y + this.min.y) / 2, 
						  0);
			normal.normalize();
		}
		else	
			return null;
		return normal;
	}

	// Returns the line parameter where the line ENTERS the box.
	// A return value below 0 means the entry point is before the start point. The start point may or may not be within the box.
	// A return value greater than 0 means both points are outside the box and this is where it would enter if it were extended.
	// A return value of null means no intersection occurs even if the line was extended.
	// p1			Vector3		The start point (param=0)
	// p2			Vector3		The end point (param=1)
	// result	Array[2]		opt. Array of 2 floats that define the parameters of the 2 intersection points. The lower parameter is always first.
	getIntersectionParam (p1, p2, result) {
		_range1.clear();
    
		var delta = p2.x - p1.x;
		if (delta == 0) {
			if (p1.x < this.min.x || p1.x > this.max.x)
				return null;		// parallel to x and does not intersect
		}
		else {
			_range1.set((this.min.x - p1.x) / delta, (this.max.x - p1.x) / delta);	// params where it intersects the right and left planes.
		}

		delta = p2.y - p1.y;
		if (delta == 0) {
			if (p1.y < this.min.y || p1.y > this.max.y)
				return null;
		}
		else {
			_range2.set((this.min.y - p1.y) / delta, (this.max.y - p1.y) / delta);
			_range1.union(_range2);
			if (!_range1.isValid())
				return null;		// X and Y intersection do not occur at the same time. Does not intersect.	
		}

		delta = p2.z - p1.z;
		if (delta == 0) {
			if (p1.z < this.min.z || p1.z > this.max.z)
				return null;		// parallel to z and does not intersect
			else if (!_range1.isValid())
				return null;		// occurs when the two points are identical and within the bbox.
		}
		else {
			_range2.set((this.min.z - p1.z) / delta, (this.max.z - p1.z) / delta);
			_range1.union(_range2);
			if (!_range1.isValid())
				return null;		// Z intersection does not occur at the same time as X and Y intersection. 
		}

		// We now have a range of params where the line is within the bbox. Return the low value in the range which represents entry.
		if (result) {
			result[0] = _range1.min;
			result[1] = _range1.max;
		}
		return _range1.min;
	}

	toString (precision) {
		precision = precision ? precision : 2;
		return "Min) X: " + this.min.x.toFixed(precision) + " Y: " + this.min.y.toFixed(precision) + " Z: " + this.min.z.toFixed(precision) + 
				" Max) X: " + this.max.x.toFixed(precision) + " Y: " + this.max.y.toFixed(precision) + " Z: " + this.max.z.toFixed(precision);
	}

	/* --- I/O -------------------- */

	// Implementation of the BinaryFile interface.
	writeBinary (file /* BinaryFile */) {
		file.writeObject(this.min);
		file.writeObject(this.max);
		return this;
	};

	static readBinary (file /* BinaryFile */) {
		var b = new BBox3();
		b.min = file.readObject(Vector3);
		b.max = file.readObject(Vector3);
		return b;
	}

	
	static Test () {
		var check = function (a, b) {
			if (Math.abs(a - b) > 0.00001)
				console.log("BBox3 Test failure: " + a + " != " + b);
		}

		var box = new BBox3();
		box.add(1, 1, 1);
		box.add(5, 5, 5);
		var p1 = new Vector3(0, 1, 3);	// outside box
		var p2 = new Vector3(4, 3, 3);	// inside box
		var param = box.getIntersectionParam(p1, p2);
		check(param, 0.25);
		
		param = box.getIntersectionParam(p2, p1);	// reverse it. p1 is within box. 
		check(param, -0.25);
		
		p1.set(6, 3, 3);
		p2.set(6, 8, 3);	// x is parallel and does not intersect
		param = box.getIntersectionParam(p1, p2);
		check(param, null);

		p1.set(4, 0, 3);
		p2.set(4, 10, 3);	// x is parallel but does intersect
		param = box.getIntersectionParam(p1, p2);
		check(param, 0.1);
		
		p1.set(3, 2, -4);
		p2.set(4, 3, 10);
		param = box.getIntersectionParam(p1, p2);
		check(param, 0.3571428571);

		p1.set(0,0,0);
		p2.set(0,0,0);		// points are the same and outside the box
		param = box.getIntersectionParam(p1, p2);	
		check(param, null);

		p1.set(3,3,3);
		p2.set(3,3,3);		// points are the same and inside the box. Should report no intersection.
		param = box.getIntersectionParam(p1, p2);
		check(param, null);

		p1.set(3, 3, 3);	
		p2.set(7, 3, 3);	// intersection before the start point, p1 within box.
		param = box.getIntersectionParam(p1, p2);
		check(param, -0.5);

		p1.set(7, 3, 3);	
		p2.set(10, 3, 3);	// intersection before the start point, p1 outside box
		param = box.getIntersectionParam(p1, p2);
		check(param, -0.5);

		p1.set(3, 3, 7);
		p2.set(3, 3, 6);	// intersection after the end point
		param = box.getIntersectionParam(p1, p2);
		check(param, -2.0);
		
		var normal = new Vector3();
		p1.set(3, 3, 5);		// on top face
		box.getNormal(p1, normal);
		check(normal.equals(0, 0, 1));
		normal = box.getNormalAsCylinder(p1, normal);	// should be unchanged
		check(normal.equals(0, 0, 1));

		p1.set(1, 3, 2);		// on left face
		normal = box.getNormal(p1);
		check(normal.equals(-1, 0, 0));
		normal = box.getNormalAsCylinder(p1);
		check(normal.equals(-1, 0, 0));
		p1.set(1, 2, 2);
		normal = box.getNormalAsCylinder(p1);
		check(normal.equals(-0.89442, -0.447213, 0));
	}
}

//Test();

var _range1 = new Range();
var _range2 = new Range();
var _box = new BBox3();
