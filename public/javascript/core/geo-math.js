// geo-math.js
// Intersections and other geometric functionality optimised for performance

import Vector2 from './vector2.js';
import Vector3 from './vector3.js';
import Matrix from './matrix.js'	// used in testing

export default class GeoMath {
			
	// Vector2. The point on the line that is at the passed parameter.
	// p1, p2		Vector2		The points of the line
	// param			float			p1=0, p2=1. Can be outside this range.
	// result		Vector2		opt, out. The point on the line at the passed parameter.
	static line2_param (p1, p2, param, result) {
		if (!result) 
			result = new Vector2();
		result.set(p1.x * (1.0 - param) + p2.x * param,
						p1.y * (1.0 - param) + p2.y * param);
		return result;
	}

	static line3_param (p1, p2, param, result) {
		if (!result) 
			result = new Vector3();
		result.x = p1.x * (1.0 - param) + p2.x * param;
		result.y = p1.y * (1.0 - param) + p2.y * param;
		result.z = p1.z * (1.0 - param) + p2.z * param;
		return result;
	}

	// Vector2. Returns a random x,y value that lies within a circle of the passed radius.
	static random_in_circle (radius) {
		var result = new Vector2();
		do {
			result.set(Math.random() - 0.5, Math.random() - 0.5);
		} while (result.length() > 0.5)
		result.mult(radius);
		return result;
	}

	// Returns the parameter on the LINE that is CLOSEST to the passed POINT. XY dimenstions only.
	static line_x_point2 (p1 /* Vector2/3 */, p2 /* Vector2/3 */, point2 /* Vector2 */) {
		if (p1.x == p2.x && p1.y == p2.y) {		
			return 0;	// not a line.
		}

		var perp = new Vector2(-(p2.y - p1.y), p2.x - p1.x);	// the perpiduclar of this line in 2d
		var a = this.line_x_ray(p1, p2, point2, perp);	// the closest distance will be the perpedicular of the line to the point.

		if (a < 0) 
			return 0;
		if (a > 1)
			return 1;
		return a;
	}

	// Returns the parameter on the RAY that is CLOSEST to the passed POINT. XY dimensions only.
	static ray_x_point2 (p1 /* Vector2 */, dir /* Vector2 */, point /* Vector2 */) {
		var dir = new Vector2(dir);
		dir.normalize();
		var perp = new Vector2(-dir.y, dir.x);

		var d = ((perp.y * dir.x) - (perp.x * dir.y));
		var a = p1.y - point.y;
		var b = p1.x - point.x;
		var c = (perp.x * a) - (perp.y * b);
		a = c / d;		

		return a;
	}

	// Returns the parameter on the LINE where it enters a CIRCLE. Returns null if no intersection.
	static line_x_circle (p1 /* Vector2/3*/, p2 /* Vector2/3 */, center /* Vector2 */, radius) {
		if (p1.x == p2.x && p1.y == p2.y) 
			return null;	// Not a line in 2d.
		
		// Find the point on the line closest to the center of the circle.
		var perp = new Vector2(-(p2.y - p1.y), p2.x - p1.x);		// the perpiduclar [thanks dad] of this line in 2d
		var closeParam = this.line_x_ray(p1, p2, center, perp);
		var closePoint = this.line2_param(p1, p2, closeParam);
			
		// Use pythagorean to find the circle intersection with the radius as the hypotenuse
		var distToClose = closePoint.distance(center);
		if (distToClose > radius)
			return null;		// will not intersect
		var b = Math.sqrt(radius * radius - distToClose * distToClose);	// Distance from the close point where it enters the circle.
		var bParam = b / p1.distance(p2);			// parameterized.
		return closeParam - bParam;
	}

	// Returns the parameter on the LINE where it enters the SPHERE. A negative result means it intersects
	// before p1. Returns null if no intersection occurs.
	// From: https://www.codeproject.com/Articles/19799/Simple-Ray-Tracing-in-C-Part-II-Triangles-Intersec
	static line_x_sphere (p1 /* Vector3 */, p2 /* Vector3 */, center /* Vector3 */, radius) {
		var delta = new Vector3(p2.x - p1.x, p2.y - p1.y, p2.z - p1.z);

		// Quadratic equation
		var A = delta.x ** 2 + delta.y ** 2 + delta.z ** 2;
		var B = 2.0 * (p1.x * delta.x + p1.y * delta.y + p1.z * delta.z - 
							delta.x * center.x - delta.y * center.y - delta.z * center.z);

		var C = p1.x**2 - 2 * p1.x * center.x + center.x**2 + p1.y**2 - 2 * p1.y * center.y + center.y**2 +
					p1.z**2 - 2 * p1.z * center.z + center.z**2 - radius**2;
		var D = B**2 - 4 * A * C;

		if (D < 0)
			return null;

		var t1 = (-B - Math.sqrt(D)) / (2.0 * A);
		var t2 = (-B + Math.sqrt(D)) / (2.0 * A);	// if it's tangent t1 and t2 will be the same.
		return t1 < t2 ? t1 : t2;
	}
	
	// Return the parameter on the LINE where it intersects with the passed RAY. XY Only. Returns null
	// if the line and ray are parallel and never intersect.
	// rayP		Vector2		The origin of the ray
	// rayD		Vector2		The direction of the ray
	static line_x_ray (p1 /* Vector2 */, p2 /* Vector2 */, rayP /* Vector2 */, rayD /* Vector2 */) {
		if (p1.x == p2.x && p1.y == p2.y) 
			return null;		// not a line.
		if (rayD.x == 0 && rayD.y == 0)
			return null;		// not a ray.
		
		var pDir = new Vector2(p2.x - p1.x, p2.y - p1.y);	// direction of p
		pDir.normalize();
		var rayDir = new Vector2(rayD);	// direction of the ray
		rayDir.normalize();
					
		var d = ((rayDir.y * pDir.x) - (rayDir.x * pDir.y));
		if (d == 0) {	
			return null;	// parallel
		}
		var a = p1.y - rayP.y;
		var b = p1.x - rayP.x;
		var c = (rayDir.x * a) - (rayDir.y * b);
		var a = c / d;		
		return a / p1.distance(p2);
	}

	// Returns the param on LINE where it intersects with another LINE. XY only. Returns null if the lines are parallel.
	// -http://jsfiddle.net/justin_c_rounds/Gd2S2/light/
	static line_x_line (p1 /* Vector2 */, p2 /* Vector2 */, q1 /* Vector2 */, q2 /* Vector2 */) {
		if (p1.x == p2.x && p1.y == p2.y) 
			return null;	// not a line
		if (q1.x == q2.x && q1.y == q2.y)
			return null;	// not a line
		var pDir = new Vector2(p2.x - p1.x, p2.y - p1.y);	// direction of p
		pDir.normalize();
		var qDir = new Vector2(q2.x - q1.x, q2.y - q1.y);	// direction of q
		qDir.normalize();

		var d = ((qDir.y * pDir.x) - (qDir.x * pDir.y));
		if (d == 0) 
			return null;		// parallel
		
		var a = p1.y - q1.y;
		var b = p1.x - q1.x;
		var e = (qDir.x * a) - (qDir.y * b);
		var f = (pDir.x * a) - (pDir.y * b);
		var a = e / d / p1.distance(p2);		// intersect param on p
		//f2_b = f2_f / f2_d / q1.distance(q2);		// intersect param on q

		return a;
	}

	// Returns the param on a RAY where it intersects with another RAY
	static ray_x_ray (p1 /* Vector2 */, dir1 /* Vector2 */, p2 /* Vector2 */, dir2 /* Vector2 */) {
		if (dir1.x == 0 && dir1.y == 0) 
			return null;	// not a direction
		if (dir2.x == 0 && dir2.y == 0)
			return null;	// not a direction
		var dir1 = new Vector2(dir1);	// direction of p
		dir1.normalize();
		var dir2 = new Vector2(dir2);	// direction of q
		dir2.normalize();

		var d = ((dir2.y * dir1.x) - (dir2.x * dir1.y));
		if (d == 0) 
			return null;		// rays are parallel
		
		var a = p1.y - p2.y;
		var b = p1.x - p2.x;
		var e = (dir2.x * a) - (dir2.y * b);
		//var f = (dir1.x * a) - (dir1.y * b);
		a = e / d / p1.distance(p2);		// intersect param on p
		
		return a;
	}

	// Returns the parameter in which a line intersects the passed z plane. 
	// Returns null if the passed line is parallel with the z plane.
	static line_x_zPlane (p1 /* Vector3 */, p2 /* Vector3 */, z) {
		if ((p1.z == z && p2.z == z))
			return 0.0;		// It's parallel and coincident with the z plane. 
		if (p1.z == p2.z) {
			return null;
		}
		var a = p1.distance(p2);		// length
		var b = (p2.z - p1.z) / a;	// zSlope
		var c = (z - p1.z) / b;	// distanceFromStart
		return c / a;	// param
	}

	// Returns the distance the point is from the plane. 
	// Returns a negative value if the point is on the side of the plane opposite the normal.
	// p				Vector3		The point to test
	// planeP		Vector3		A point on the plane
	// planeNormal Vector3		A normalized vector pointing out from the plane
	static point_dist_plane (p /* Vector3 */, planeP, planeNormal) {
		var p = new Vector3(p.x - planeP.x, p.y - planeP.y, p.z - planeP.z);
		return p.dot(planeNormal);		
	}

	// Returns the param on the line which crosses the plane.
	// returns			param			The intersection point. 0=p1, 1=p2, 0.5=midpoint. Will return a parameter outside 0-1.
	// returns 			null			No intersection or line is parallel with the plane.
	// p1, p2			Vector3		Defines the line.
	// planeP			Vector3		A point on the plane
	// planeNormal		Vector3		A normalized vector defining the vector pointing out from the plane.
	static line_x_plane (p1, p2, planeP, planeNormal) {
		var dir = new Vector3(p2.x - p1.x, p2.y - p1.y, p2.z - p1.z);
		var dot = -dir.dot(planeNormal);		// How fast the line is approaching the plane. Lines coming together will have a negative dot, so invert it.
		var pDist = this.point_dist_plane(p1, planeP, planeNormal); 	// The distance from p1 to the plane.

		if (dot == 0)		
			return null;		// line is parallel with the plane. 
			
		return pDist / dot;		// It's this distance away and approaching at this speed.
	}

	// Returns the PARAM of the intersection between a LINE and a TRIANGLE
	// see https://en.wikipedia.org/wiki/M%C3%B6ller%E2%80%93Trumbore_intersection_algorithm
	// returns		param			0=start of line, 1=end of line, 0.5 midpoint
	// returns		null			No intersection, line is parallel to the triangle or intersects before or after the line.
	// p1,p2			Vector3		The two points of the line
	// tp1,tp2,tp3 Vector3		The three points of the triangle. Winding does not matter.
	static line_x_triangle(p1, p2, tp1, tp2, tp3) {
		var dir = p2.subc(p1);
		var e1 = tp2.subc(tp1);		// triangle edge 1
		var e2 = tp3.subc(tp1);		// triangle edge 2
		var h = dir.cross(e2);		// up from line vector and edge
		var a = e1.dot(h);
		if (a > -1e-8 && a < 1e-8)
			return null;		// line is parallel to the triangle

		var f = 1.0 / a;
		var s = p1.subc(tp1);	// triangle p1 direction from line p1.
		var u = f * s.dot(h);	// barycentric coord U. UVW coords measure of how close they are to the 3 points of the triangle.
		if (u < 0 || u > 1)		// if it is exactly 0 or 1, this indicates it is on an edge.
			return null;		

		var q = s.cross(e1);
		var v = f * dir.dot(q);	// barycentric coord V (W would be 1-u-v).
		if (v < 0 || (u + v) > 1.0) // if it is exactly 0 or 1, this indicates it is on an edge.
			return null;

		// At this stage we can compute t to find out where the intersection point is on the line.
		var t = f * e2.dot(q);
		if (t < -1e-7 || t > 1)
			return null;	// intersects before the line starts or after it ends.
		return t;
	}

	// Returns true if the line intersects the box.
	// within the box. Returns null if the line is never in the box.
	// p1, p2			Vector2/3		Defines the line. Only x and y are used.
	// left, right		float				Left and right sides of the box.
	// bottom, top		float				Top and bottom sides of the box.
	// result			{enters, exits}	Opt. The 2d params when the line is within the box. 
	static line2_x_box (p1, p2, left, right, bottom, top, result) {
		if ((p1.x < left && p2.x < left) || (p1.x > right && p2.x > right) || 
				(p1.y < bottom && p2.y < bottom) || (p1.y > top && p2.y > top))
			return false;		// both points are off one side of the box.
		
		var xEnters, xExits;
		if (p2.x - p1.x == 0) {
			xEnters = -100;	// infinitely within
			xExits = 100;
		}
		else {
			let xLeft = (left - p1.x) / (p2.x - p1.x);		// param where it crosses the left edge.
			let xRight = (right - p1.x) / (p2.x - p1.x);		// param where it crosses the right edge.
			xEnters = Math.min(xLeft, xRight);
			xExits = Math.max(xLeft, xRight);
		}

		var yEnters, yExits
		if (p2.y - p1.y == 0) {
			yEnters = -100;	// infinitely within
			yExits = 100;
		}
		else {
			let yBot = (bottom - p1.y) / (p2.y - p1.y);
			let yTop = (top - p1.y) / (p2.y - p1.y);
			yEnters = Math.min(yBot, yTop);
			yExits = Math.max(yBot, yTop);
		}
		
		var enters = Math.max(xEnters, yEnters);
		var exits = Math.min(xExits, yExits);

		if (enters > 1 || exits < 0 || enters > exits)
			return false;

		if (result) {
			result.enters = Math.max(0, enters);
			result.exits = Math.min(1, exits);
		}
		return true;
	}

	/* -- TESTING ---------------------------------------------- */

	static Test () {
		var check = function (a, b) {
			if ((a === null && b !== null) || (a !== null && b === null)) 
				return console.log("GeoMath Test failure: " + a + " != " + b);
			if (Math.abs(a - b) > 0.00001)
				return console.log("GeoMath Test failure: " + a + " != " + b);
		}
		var checkVec = function (a, b) {
			if (!a.equals(b))
				console.log("GeoMath Test failure: " + a.toString() + " != " + b.toString());
		}

		var G = GeoMath;
		
		var p1 = new Vector2(0, 0); 
		var p2 = new Vector2(0, 30);
		var param = G.line_x_ray(p1, p2, new Vector2(5, 10), new Vector2(-1, 0));
		check(param, 0.333333);
		param = G.line_x_ray(p1, p2, new Vector2(5, 10), new Vector2(1, 0));
		check(param, 0.333333);
		p1.set(10, 10), p2.set(20, 20);
		param = G.line_x_ray(p1, p2, new Vector2(20, 10), new Vector2(-1, -1));
		check(param, null);
		param = G.line_x_ray(p1, p2, new Vector2(20, 10), new Vector2(1, -1));
		check(param, 0.5);
		param = G.line_x_ray(p1, p2, new Vector2(40, 10), new Vector2(1, -1));
		check(param, 1.5);
		param = G.line_x_ray(p1, p2, new Vector2(0, 0), new Vector2(1, -1));
		check(param, -1.0);		

		var zParam = G.line_x_zPlane(new Vector3(0,0,0), new Vector3(0, 0, 10), 2.0);
		check(zParam, 0.2);
		zParam = G.line_x_zPlane(new Vector3(10, 10, 10), new Vector3(20, 20, 20), 19.0);
		check(zParam, 0.9);
		zParam = G.line_x_zPlane(new Vector3(10, 10, 10), new Vector3(20, 20, 20), 25.0);
		check(zParam, 1.5);
		zParam = G.line_x_zPlane(new Vector3(10, 10, 10), new Vector3(20, 20, 10), 30.0);
		check(zParam, null);

		var p1 = new Vector3(0,0,2), p2 = new Vector3(0, 0, 1.5);
		var param = G.line_x_plane(p1, p2, new Vector3(0,0,0), new Vector3(0,0,1));
		check(param, 4);
		var param = G.line_x_plane(p1, p2, new Vector3(0,0,3), new Vector3(0,0,1));
		check(param, -2);
		var param = G.line_x_plane(p1, p2, new Vector3(0,0,3), new Vector3(1,0,0));
		check(param, null);		// line is parallel to the plane
		p1.set(0, 0, 0), p2.set(1, 1, 0);
		var param = G.line_x_plane(p1, p2, new Vector3(2,2,0), new Vector3(-1,-1,0));
		check(param, 2);
		var param = G.line_x_plane(p1, p2, new Vector3(2,2,0), new Vector3(1,1,0));
		check(param, 2);
		var param = G.line_x_plane(p1, p2, new Vector3(0,0,0), new Vector3(0,0,1));	
		check(param, null);	// line parallel but on the plane
		var param = G.line_x_plane(p1, p2, new Vector3(1,1,0), new Vector3(1,0,0));	
		check(param, 1);	// second point on plane
		
		var p1 = new Vector2(0, 0), p2 = new Vector2(0, 10);
		var result = new Vector2();
		var param = G.line_x_line(p1, p2, new Vector2(-5, 4), new Vector2(5, 4), result);
		check(param, 0.4);
		param = G.line_x_line(p1, p2, new Vector2(-8, 6), new Vector2(2, 6), result);
		check(param, 0.6);
		param = G.line_x_line(p1, p2, new Vector2(10, 10), new Vector2(10, 0), result);	
		check(param, null);	// parallel
		param = G.line_x_line(p1, p2, new Vector2(-5, 12), new Vector2(15, 12), result);	
		check(param, 1.2);	// over the top
		param = G.line_x_line(p1, p2, new Vector2(-5, -12), new Vector2(15, -12), result);	
		check(param, -1.2);	// below
		param = G.line_x_line(p1, p2, new Vector2(-5, 0), new Vector2(150, 0), result);	
		check(param, 0);
				
		// line_x_point2
		var p1 = new Vector2(0, 0), p2 = new Vector2(10, 0);
		var param = G.line_x_point2(p1, p2, new Vector2(5, 5));
		check(param, 0.5);
		var param = G.line_x_point2(p1, p2, new Vector2(15, 5));
		check(param, 1.0);
		var param = G.line_x_point2(p1, p2, new Vector2(-5, 5));
		check(param, 0.0);
		
		// line_x_circle
		var p1 = new Vector3(-5, 4, 0), p2 = new Vector2(5, 4);		// test using the 3-4-5 triangle. Line is length 10.
		var p = G.line_x_circle(p1, p2, new Vector3(0, 0, 0), 5);
		check(p, 0.2);			// Intersection should be 0.3 before the closest point.
		p = G.line_x_circle(p1, p2, new Vector3(0, 2, 0), 5);
		check(p, 0.0417424);
		p = G.line_x_circle(p1, p2, new Vector2(0, -2), 5);
		check(p, null);
		p = G.line_x_circle(p1, p2, new Vector2(0, 4), 1);		// circle on line
		check(p, 0.4);

		// ray_x_point2
		var p1 = new Vector3(0, 0, 0), dir = new Vector2(1, 0);
		p = G.ray_x_point2(p1, dir, new Vector2(5, 0));
		check(p, 5.0);
		p = G.ray_x_point2(p1, dir, new Vector2(-5, 10));
		check(p, -5.0);
		p = G.ray_x_point2(p1, dir, new Vector2(-5, 10));
		check(p, -5.0);
		dir.set(1, 1);
		p = G.ray_x_point2(p1, dir, new Vector2(10, 10));
		check(p, Math.sqrt(100 + 100));
		p = G.ray_x_point2(p1, dir, new Vector2(100, 10));
		check(p, 77.7817459);

		// line_x_triangle
		{
			var line = [new Vector3(0, 0, 0), new Vector3(2, 0, 0)];
			var tri = [new Vector3(1, -1, -1), new Vector3(1, 1, -1), new Vector3(1, 1, 2)];
			p = G.line_x_triangle(line[0], line[1], tri[0], tri[1], tri[2]);
			check(p, 0.5);		// triangle should bisect the line.
			tri[2].set(1, 1, 1);		
			p = G.line_x_triangle(line[0], line[1], tri[0], tri[1], tri[2]);
			check(p, 0.5);		// line intersects on the edge.
			tri[2].set(1, 1, 0);
			p = G.line_x_triangle(line[0], line[1], tri[0], tri[1], tri[2]);
			check(p, null);	// line does not intersect

			tri[2].set(1, 1, 2);	// test line intersection param
			line[0].set(1, 0, 0);
			p = G.line_x_triangle(line[0], line[1], tri[0], tri[1], tri[2]);
			check(p, 0);
			line[0].set(0, 0, 0); line[1].set(1, 0, 0);
			p = G.line_x_triangle(line[0], line[1], tri[0], tri[1], tri[2]);
			check(p, 1);

			var tri2 = [new Vector3(1, -1, 0), new Vector3(2, 1, 0), new Vector3(1, 1, 0)];
			p = G.line_x_triangle(line[0], line[1], tri2[0], tri2[1], tri2[2]);
			check(p, null);	// triangle is parallel to the line.

			var line = [new Vector3(0, 0, 0), new Vector3(2, 0, 0)];		// test in a semi-random orientation
			var tri = [new Vector3(1, -1, -1), new Vector3(1, 1, -1), new Vector3(1, 1, 2)];
			var m = Matrix.fromRotation(1.2, 0.4, 0.5, Math.PI * 0.75);	
			m.translate(2, 1.2, 1.4);
			m.apply(line);		m.apply(tri);
			p = G.line_x_triangle(line[0], line[1], tri[0], tri[1], tri[2]);
			check(p, 0.5);
			
		}

		// Performance testing
		var NUM_ITERS = 0;
		var timeSum = 0;
		for (var t = 0; t < NUM_ITERS; t++) {
			var NUM_TESTS = 1000000;
			var start = performance.now();
			
			for (var i = 0; i < NUM_TESTS; i++) {
				p = G.line_x_triangle(line[0], line[1], tri[0], tri[1], tri[2]);
			}	
			var time = performance.now() - start;
			timeSum += time;
			console.log(`${NUM_TESTS.toLocaleString()} tests done in ${time.toFixed(1)} ms.`)		
		}
		if (NUM_ITERS > 1) 
			console.log(`Average time: ${(timeSum / NUM_ITERS).toFixed(1)} ms.`);

		//console.log("GeoMath test complete.");
		//p = G.ray_x_ray
	}
}

GeoMath.Test();