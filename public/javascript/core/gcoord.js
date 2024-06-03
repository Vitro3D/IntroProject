// gcoord.js
// - Coordinates in lat/long

import Vector2 from './vector2.js';
import Vector3 from './vector3.js';
import MathExt from './math-ext.js';

var _vec = new Vector3();

export default class GCoord {
	constructor (lat, long) {
		this.lat = lat ? lat : 0;
		this.long = long ? long : 0;		// Degrees East of the meridian
	}

	clone () {
		return new GCoord(this.lat, this.long);
	}

	// set (GCoord)
	// set (lat, long)
	set (gCoordOrlat, long) {
		if (gCoordOrlat.lat !== undefined) {
			this.lat = gCoordOrlat.lat;
			this.long = gCoordOrlat.long;
		}
		else {
			this.lat = gCoordOrlat;
			this.long = long;
		}
	};

	// Returns true if the passed coord is within tol of this one.
	equals (other, tol /* opt */) {
		if (tol === undefined) tol = 0.001;
		return Math.abs(this.lat - other.lat) < tol && Math.abs(this.long - other.long) < tol;
	}

	isValid () {
		return this.lat >= -90.0 && this.lat <= 90.0;
	}

	setInvalid () {
		this.lat = 99.0;
	}

	// Return the angle in radians between this coord and the passed one.
	angle (other /* GCoord */) {
		var p1 = this.toVec3();
		var p2 = other.toVec3();
		var a = p1.angle(p2);
		return a;
	};
	
	// returns Vec2 of the mapping to a polar coordinate where the center is the north pole.
	// .https://en.wikipedia.org/wiki/Azimuthal_equidistant_projection
	// degOfArc: -1 and 1 will map to this number of latitude from the pole.  In degrees.
	toPolar (degOfArc) {
		var theta = MathExt.degToRad(this.long);
		var distanceToPole = Math.PI / 2 - MathExt.degToRad(this.lat);
		distanceToPole *= (degOfArc / 90.0);

		var result = new Vector2();
		result.x = distanceToPole * Math.sin(theta);
		result.y = -distanceToPole * Math.cos(theta);
		return result;
	};
	
	// Invert the longitude of the coordinate. eg: 90 => 270
	invertLong () {
		this.long = (180 + (180 - this.long)) % 360;
	};

	addScalar (scalar) {
		this.lat += scalar;
		this.long += scalar;
		return this;
	};

	add (lat, long) {
		this.lat += lat;
		this.long += long;
		return this;
	};

	addc (lat, long) {
		return new GCoord(this.lat + lat, this.long + long);
	};
		
	// Returns a GCoord that lies between this coordinate and the passed one.
	getMidpoint (other /* GCoord */) {
		var p1 = this.toVec3();
		var p2 = other.toVec3();
		p1.set((p1.x + p2.x) / 2.0, (p1.y + p2.y) / 2.0, (p1.z + p2.z) / 2.0);
		var result = GCoord.FromVec3(p1);
		return result;
	};

	// Shortest distance to another point on a great circle.
	distance (other) {
		var p1 = this.toVec3();
		var p2 = other.toVec3();
		var d = Math.acos(p1.dot(p2));
		return d;
	};

	// onlyEast  	bool	 def=false. If true, only E will be used.
	// onlyWest		bool	 def=false. If true, only W will be used.
	toString (longOffset, onlyEast, onlyWest) {
		var long = this.long + (longOffset ? longOffset : 0);

		if ((!onlyEast && !onlyWest) && long > 180.0)
			long = -(180.0 - (long - 180.0));
		else if ((onlyEast || onlyWest) && long < 0.0)
			long += 360.0;
		if (onlyWest)
			long = 360.0 - long;
			
		return Math.abs(this.lat.toFixed(3)) + String.fromCharCode(176) + (this.lat > 0 ? " N, " : " S, ") +
				Math.abs(long.toFixed(3)) + String.fromCharCode(176) + (onlyWest ? "W" : onlyEast ? "E" : long > 0 ? " E" : " W");
	}

	// Output the string without using NSEW.  Positive is N and E, negative is S and W
	toStringAbs (precision) {
		if (precision === undefined)
			precision = 2;

		var long = this.long;
		while (long > 180 && long < 1000)
			long -= 180;

		while (long < -180 && long > -1000)
			long += 180;
			
		return this.lat.toFixed(precision) + String.fromCharCode(176) + ", " + 
				 long.toFixed(precision) + String.fromCharCode(176);
	}
	
	// From a point on a sphere. Returned longitude is from -180 to 180
	fromVec3 (xOrVec, y, z) {
		_vec.set(xOrVec, y, z);
		_vec.normalize();
		var latRadians = Math.asin(_vec.z);
		this.lat = MathExt.radToDeg(latRadians);

		if (Math.abs(this.lat) > 89.995) {
			this.long = 0.0;	// Remove ambiguity of longitude very near the poles.
		}
		else {
			this.long = MathExt.radToDeg(Math.acos(Math.min(1.0, Math.max(-1.0, _vec.x / Math.cos(latRadians)))));
			if (_vec.y < 0)
				this.long = -this.long;
		}
	};

	// static
	static fromVec3 (xOrVec, y, z) {
		var result = new GCoord();
		result.fromVec3(xOrVec, y, z);
		return result;
	}

	// static
	static fromVec2 (x, y, radius) {
		if (!radius) radius = 1.0;
		var l = Math.sqrt(x * x + y * y)
		var z = Math.sqrt(radius * radius - l * l);
		return GCoord.fromVec3(x, y, z);
	}

	toVec3 (radius /* def=1.0*/, result /* opt */) {
		return GCoord.toVec3(this.lat, this.long, radius, result);
	};

	static toVec3 (lat, long, radius, result /* opt */) {
		if (!result)
			result = new Vector3();

		radius = radius == null ? 1.0 : radius;
		var latr = MathExt.degToRad(lat);
		var longr = MathExt.degToRad(long);
		result.x = Math.cos(longr) * Math.cos(latr);
		result.y = Math.sin(longr) * Math.cos(latr);
		result.z = Math.sin(latr);
		result.mult(radius)
		return result;
	}
	
	// Implementation of the BinaryFile interface.
	writeBinary (file /* BinaryFile */) {
		file.writeFloat(this.lat);
		file.writeFloat(this.long);
		return this;
	};

	static readBinary (file /* BinaryFile */) {
		var coord = new GCoord();
		coord.lat = file.readFloat();
		coord.long = file.readFloat();
		return coord;
	}
}