
// stl-file.js
// File for stl file creation and manipulation

// Sample stl facet format: 
//	  facet normal 0.960208 -0.000309705 0.279285
//	    outer loop
//	      vertex -9.9228 18.8735 -36.4485
//	      vertex -9.92381 15.1638 -36.4492
//	      vertex -9.92124 15.1638 -36.458
//	    endloop
//	  endfacet

import Vector3 from '../core/vector3.js';
import BBox3 from '../core/bbox3.js';
import GeoMath from '../core/geo-math.js';
import DataViewExt from './dataview-ext.js';

var _v1 = new Vector3(), _v2 = new Vector3(), _v3 = new Vector3();

export default class StlFile {
	// urlOfFile		string | File | number	 opt. Url or File to initialize this to. A number will initialize the buffer to that many facets.
	// callback 		function (StlFile) 		opt. Called when file load has completed.
	constructor (urlOrFile, callback) {
		this.filename = "";
		this.source = "";			// The source of the stl (eg. OnShape)
		this.isLoaded = false;			// True if the file has finished loading. NA if creating from scratch.
		this.bounds = new BBox3();		// cached value.

		this.verts = null;		// Float32Array. Buffer for the verts. 3 floats per point. 3 points per facet.
		this.normals = null;		// Float32Array. Buffer for the normals. 1 normal per facet.

		this.numFacets = 0;		// The actual number of facets defined in the stl.
		this.setBufferSize(100);

		if (urlOrFile) {
			if (typeof urlOrFile === 'number') {
				this.setBufferSize(Math.ceil(estNumFacets));
			}
			else if (typeof urlOrFile === 'string') {
				this.loadFromUrl(urlOrFile, callback);	
			}
			else if (urlOrFile instanceof File) {
				this.loadFromFile(urlOrFile, callback);
			}
		}
	}

	// Create a deep copy of the StlFile.
	clone () {
		var stl = new StlFile(this.numFacets);
		stl.filename = this.filename;
		stl.source = this.source;
		stl.setNumFacets(this.numFacets);

		for (var i = 0; i < this.verts.length; i++) 
			stl.verts[i] = this.verts[i];
		for (var i = 0; i < this.normals.length; i++) 
			stl.normals[i] = this.normals[i];
		
		return stl;
	}

	// Clear the stl file.
	reset () {
		this.numFacets = 0;
		this.verts = new Float32Array(100 * 9);
		this.normals = new Float32Array(100 * 3);
		this.bounds.clear();
	}

	clear () {
		this.reset();
	}

	// Set the buffer sizes to accomodate a specific number of facets. Copy any existing data over.
	setBufferSize (numFacets) {
		var newVerts = new Float32Array(numFacets * 9);
		var newNormals = new Float32Array(numFacets * 3);	
		newVerts.fill(0);
		newNormals.fill(0);

		for (var i = 0; i < this.numFacets * 9; i++) 
			newVerts[i] = this.verts[i];
		for (var i = 0; i < this.numFacets * 3; i++)
			newNormals[i] = this.normals[i];
		this.verts = newVerts;
		this.normals = newNormals;
	}
	
	// returns Float32Array - The verts in x,y,z,x,y,z... format. Each 3 points represents a facet.
	getVertices () {
		return this.verts;
	}
	
	// returns Float32Array - An array of normals, 1 per facet. There are 3 times as many verts as normals.
	getFacetNormals () {
		return this.normals;
	}

	// returns Float32Array - An array of normals, 1 per vertex, suitable for webgl display.
	getNormals () {
		// change from per-facet to per-vertex normals by duplicating the normals a couple times.
		var norms = new Float32Array(this.numFacets * 9);	
		for (var i = 0; i < this.numFacets; i++) {
			norms[i * 9 + 0] = norms[i * 9 + 3] = norms[i * 9 + 6] = this.normals[i * 3 + 0];
			norms[i * 9 + 1] = norms[i * 9 + 4] = norms[i * 9 + 7] = this.normals[i * 3 + 1];
			norms[i * 9 + 2] = norms[i * 9 + 5] = norms[i * 9 + 8] = this.normals[i * 3 + 2];
		}
		return norms;
	}

	// Update all the normals. Call when significant geometry has changed.
	updateNormals () {
		this.normals = new Float32Array(this.numFacets * 3);
		for (var i = 0; i < this.numFacets; i++) {
			_v1.set(this.verts[i * 9 + 0], this.verts[i * 9 + 1], this.verts[i * 9 + 2]);
			_v2.set(this.verts[i * 9 + 3], this.verts[i * 9 + 4], this.verts[i * 9 + 5]);
			_v3.set(this.verts[i * 9 + 6], this.verts[i * 9 + 7], this.verts[i * 9 + 8]);
			_v2.sub(_v1);
			_v3.sub(_v1);
			_v2.cross(_v3, _v1 /* result */);
			if (_v1.length() == 0)
				_v1.set(1, 0, 0);
			else
				_v1.normalize();
			this.normals[i * 3 + 0] = _v1.x;
			this.normals[i * 3 + 1] = _v1.y;
			this.normals[i * 3 + 2] = _v1.z;
		}
	}
	
	// returns Uint16Array - The indices of the facets. Since STL files do not share points among facets, 
	// the indices returned are simply [0,1,2,3,4...]
	getIndices () {
		var indices = new Uint16Array(this.numFacets * 3);
		for (var i = 0; i < this.numFacets * 3; i++)
			indices[i] = i;
		return indices;
	}

	// Set the number of facets in this stl. The buffers are set to this size with additional padding for adding facets.
	// numFacets		int		Set the number of facets in this stl file. 
	setNumFacets (numFacets) {
		if (numFacets * 9 > this.verts.length) {	
			// dynamically enlarge the buffer if there's not enough room.
			this.setBufferSize(Math.ceil(numFacets * 1.4));	
		}
		this.numFacets = numFacets;
	}

	// returns the number of facets currently in this model.
	getNumFacets () { 
		return this.numFacets;
	}

	// Populates the passed verts with the facet values
	// index			int			The index of the facet to retrieve.
	// v1,v2,v3		Vector3		out. Populated with the 3 verts of the facet.
	getFacet (index, v1, v2, v3) {
		v1.set(this.verts[index * 9 + 0], this.verts[index * 9 + 1], this.verts[index * 9 + 2]);
		v2.set(this.verts[index * 9 + 3], this.verts[index * 9 + 4], this.verts[index * 9 + 5]);
		v3.set(this.verts[index * 9 + 6], this.verts[index * 9 + 7], this.verts[index * 9 + 8]);
	}
	
	setFacet (index, v1, v2, v3) {
		if (index >= this.numFacets) {
			console.log("Facet index OOB!");
			return;
		}
		index *= 9;
		this.verts[index + 0] = v1.x;	this.verts[index + 1] = v1.y;	this.verts[index + 2] = v1.z;
		this.verts[index + 3] = v2.x;	this.verts[index + 4] = v2.y;	this.verts[index + 5] = v2.z;
		this.verts[index + 6] = v3.x;	this.verts[index + 7] = v3.y;	this.verts[index + 8] = v3.z;
	}

	// Add a facet to this stl
	// v1, v2, v3		Vector3		The points of the facet in CCW order.
	// normal			Vector3		optional. The normal of the facet. 
	addFacet (v1, v2, v3, normal) {
		var index = this.numFacets * 9;
		this.setNumFacets(this.numFacets + 1);
		this.verts[index + 0] = v1.x;	this.verts[index + 1] = v1.y;	this.verts[index + 2] = v1.z;
		this.verts[index + 3] = v2.x;	this.verts[index + 4] = v2.y;	this.verts[index + 5] = v2.z;
		this.verts[index + 6] = v3.x;	this.verts[index + 7] = v3.y;	this.verts[index + 8] = v3.z;

		if (normal) {
			index /= 3;
			this.normals[index + 0] = normal.x; this.normals[index + 1] = normal.y; this.normals[index + 2] = normal.z;
		}
		else {		// Calc normal if not passed in.
			_v1.set(v1); _v2.set(v2); _v3.set(v3);
			_v2.sub(v1); _v3.sub(v1);
			_v2.cross(_v3, _v1 /* result */);
			if (_v1.length() == 0)
				_v1.set(1, 0, 0);
			else
				_v1.normalize();
			this.normals[index / 3 + 0] = _v1.x;
			this.normals[index / 3 + 1] = _v1.y;
			this.normals[index / 3 + 2] = _v1.z;
		}
	}

	// Remove the passed facets from the stl. Returns a new StlFile with the removed indices.
	// facetIndices	int[]		The facet indices to remove.
	removeFacets (facetIndices /* [int] */) {
		var newStl = new StlFile(facetIndices.length);
		if (!facetIndices || facetIndices.length == 0)
			return newStl;
		
		var numFacets = this.numFacets;
		var verts = this.getVertices();
		this.clear();		// Clear and remake this existing stl.
		this.setBufferSize(numFacets - facetIndices.length);		
		
		var facets = facetIndices.sort(function (a, b) { if (a < b) return -1; if (a > b) return 1; return 0; });
		var fI = 0;		// index into the facets arrray
		for (var i = 0; i < numFacets; i++) {
			_v1.set(verts[i * 9 + 0], verts[i * 9 + 1], verts[i * 9 + 2]);
			_v2.set(verts[i * 9 + 3], verts[i * 9 + 4], verts[i * 9 + 5]);
			_v3.set(verts[i * 9 + 6], verts[i * 9 + 7], verts[i * 9 + 8]);
			if (fI < facets.length && facets[fI] == i) {
				newStl.addFacet(_v1, _v2, _v3);
				//while (fI < facets.length && facets[fI] == i)	// watch for duplicates
					fI++;
			}
			else {
				this.addFacet(_v1, _v2, _v3);
			}
		}
		return newStl;
	}

	// Add a facet from another stl file. NOT TESTED
	// index		int	The facet index in the passed stl file
	addFacetFromStl (stl /* StlFile */, index) {
		var index = this.numFacets * 9;
		this.setNumFacets(this.numFacets + 1);
		for (var i = 0; i < 9; i++) {
			this.verts[index + i] = stl.verts[index * 9 + i];
		}
		for (var i = 0; i < 3; i++) {
			this.normals[index / 3 + i] = stl.normals[index * 3 + i];
		}
	}

	// returns BBox3 - The minimum bounding box containing all points.
	getBounds () {
		if (!this.bounds.isValid()) {
			for (var i = 0; i < this.numFacets; i++) {
				this.bounds.add(this.verts[i * 9 + 0], this.verts[i * 9 + 1], this.verts[i * 9 + 2]);
				this.bounds.add(this.verts[i * 9 + 3], this.verts[i * 9 + 4], this.verts[i * 9 + 5]);
				this.bounds.add(this.verts[i * 9 + 6], this.verts[i * 9 + 7], this.verts[i * 9 + 8]);
			}
		}
		return this.bounds;
	}

	// returns Vector3 - The center of the StlFile. It is a new Vector3 and not a reference.
	getCenter () {
		return this.getBounds().getCenter();
	}

	// Sets the center of the model as the origin point for the vertices.
	center () {
		var center = this.getCenter();
		this.translate(center.reversed());
	}

	// Transform the STL points by the passed matrix.
	// matrix		Matrix		The transform to apply.
	applyMatrix (matrix) {
		var vert = new Vector3();
		for (var i = 0; i < this.verts.length / 3; i++) {
			vert.set(this.verts[i * 3 + 0], this.verts[i * 3 + 1], this.verts[i * 3 + 2]);
			matrix.applyToVector(vert);
			this.verts[i * 3 + 0] = vert.x;
			this.verts[i * 3 + 1] = vert.y;
			this.verts[i * 3 + 2] = vert.z;
		}
		this.updateNormals();
		this.bounds.clear();
	}

	applyTransform (matrix) {
		this.applyMatrix(matrix);
	}

	// Flip the Y value of each vert about the XY plane.
	flipY () {
		for (var i = 0; i < this.numFacets; i++) {
			this.verts[i * 9 + 1] = -this.verts[i * 9 + 1];
			this.verts[i * 9 + 4] = -this.verts[i * 9 + 4];
			this.verts[i * 9 + 7] = -this.verts[i * 9 + 7];
		}
		this.bounds.clear();
	}

	// Flip the winding of the facets from CCW to CW or vice versa.
	flipWinding () {
		var temp;
		for (var i = 0; i < this.numFacets; i++) {
			for (var j = 0; j < 3; j++) {
				temp = this.verts[i * 9 + (j * 3 + 2)];
				this.verts[i * 9 + (j * 3 + 2)] = this.verts[i * 9 + (j * 3 + 1)];
				this.verts[i * 9 + (j * 3 + 1)] = temp;
			}
		}
	}

	// Move the points the passed amount
	// translate(Vector3)
	// translate(x, y, z)
	translate (xOrVec, y, z) {
		if (xOrVec.x !== undefined) {
			y = xOrVec.y;
			z = xOrVec.z;
			xOrVec = xOrVec.x;
		}
		for (var i = 0; i < this.numFacets; i++) {
			for (var j = 0; j < 3; j++) {
				this.verts[i * 9 + (j * 3 + 0)] += xOrVec;
				this.verts[i * 9 + (j * 3 + 1)] += y;
				if (z)
					this.verts[i * 9 + (j * 3 + 2)] += z;
			}
		}
		this.bounds.clear();
	}

	// Scale by the passed factors. If y and z are undefined, the scale is uniform.
	scale (x, y, z) {
		if (y === undefined)
			y = x;
		if (z === undefined)
			z = x;

		for (var i = 0; i < this.numFacets * 9; i+=3) {
			this.verts[i] *= x;
			this.verts[i+1] *= y;
			this.verts[i+2] *= z;
		}
		this.bounds.clear();
	}

	// Skew the values of x and y with respect to the other axes.
	// xy		number	The amount to modify x with respect to y. 0=no modification
	// xz		number	The amount to modify x with respect to z.
	// yz		number	The amount to modify y with respect to z.
	applySkew (xy, xz, yz) {
		var x, y, z;
		for (var i = 0; i < this.numFacets * 9; i+=3) {
			x = this.verts[i];
			y = this.verts[i+1];
			z = this.verts[i+2];
			this.verts[i] += (xy * y) + (xz * z);
			this.verts[i+1] += (yz * z); 
		}
		this.bounds.clear();
	}

	// Skew the Y value the passed amount with respect to Z.
	skewYZ (amount) {
		var z;
		for (var i = 0; i < this.numFacets * 9; i+=3) {
			z = this.verts[i+2];
			this.verts[i+1] += z * amount;			
		}
		this.bounds.clear();
	}

	// Skew the Z value the passed amount with respect to Z.
	skewXZ (amount) {
		var z;
		for (var i = 0; i < this.numFacets * 9; i+=3) {
			z = this.verts[i+2];
			this.verts[i] += z * amount;			
		}
		this.bounds.clear();
	}

	// Returns int[]. Returns all facet indices that lie entirely within the passed bounding box
	getFacetsWithin (bbox /* BBox2/3 */) {
		var results = [];
		for (var i = 0; i < this.numFacets; i++) {
			if ((this.verts[i * 9 + 0] < bbox.min.x || this.verts[i * 9 + 0] > bbox.max.x) || 
				 (this.verts[i * 9 + 3] < bbox.min.x || this.verts[i * 9 + 3] > bbox.max.x) ||
				 (this.verts[i * 9 + 6] < bbox.min.x || this.verts[i * 9 + 6] > bbox.max.x))
				continue;
			if ((this.verts[i * 9 + 1] < bbox.min.y || this.verts[i * 9 + 1] > bbox.max.y) || 
			 	 (this.verts[i * 9 + 4] < bbox.min.y || this.verts[i * 9 + 4] > bbox.max.y) || 
				 (this.verts[i * 9 + 7] < bbox.min.y || this.verts[i * 9 + 7] > bbox.max.y))
				continue;
			if (bbox.min.z !== undefined && 
				 (this.verts[i * 9 + 2] < bbox.min.z || this.verts[i * 9 + 2] > bbox.max.z)
				 (this.verts[i * 9 + 5] < bbox.min.z || this.verts[i * 9 + 5] > bbox.max.z)
				 (this.verts[i * 9 + 8] < bbox.min.z || this.verts[i * 9 + 8] > bbox.max.z))
				continue;
			results.push(i);
		}
		return results;
	}

	// Add a square of points as two triangles. The points should be passed in CCW order from the direction of view.
	// The square will be split into triangles at v2-v4.
	// All points are Vertex3.
	addSquare (v1, v2, v3, v4) {
		this.addFacet(v4, v1, v2);
		this.addFacet(v4, v2, v3);
		// removed check for degeneracy
	}

	// Add a ring of facets (donut).
	// Inner and outer must be the same length and coorelate with each other.
	// outer		Vector3[]		The outside of the ring. Points in CCW order
	// inner		Vector3[]		The inside of the ring. Points in CCW order
	addRing (outer /* Vector3[] */, inner /* Vector3[] */) {
		if (outer.length != inner.length || outer.length < 3) {
			console.log("Invalid STL ring parameters."); return;
		}

		var nextI;
		for (var i = 0; i < outer.length; i++) {
			nextI = (i + 1) % outer.length;
			this.addSquare(inner[i], outer[i], outer[nextI], inner[nextI]);
		}
		this.bounds.clear();
	}

	// Split the StlFile at the passed z plane. This stlfile will contain only the facets below the z plane.
	// returns StlFile - The facets above this z level.
	// z		number		The plane to split the file at.
	splitAtZPlane (z) {
		var verts = this.getVertices();
		var numFacets = this.numFacets;
		var loStl = this;
		loStl.reset();
		var hiStl = new StlFile();

		var index, side1, side2, lonePoint, point1, point2;
		var tol = 0.0001;
		var v1 = new Vector3(), v2 = new Vector3(), v3 = new Vector3();
		var s1 = new Vector3(), s2 = new Vector3();		// split points
		for (var i = 0; i < numFacets; i++) {
			index = i * 9;				 // index into the vert array
			v1.set(verts[index + 0], verts[index + 1], verts[index + 2]);
			v2.set(verts[index + 3], verts[index + 4], verts[index + 5]);
			v3.set(verts[index + 6], verts[index + 7], verts[index + 8]);

			if (v1.z <= (z + tol) && v2.z <= (z + tol) && v3.z <= (z + tol)) {	// facet entirely below the plane. No need to split.
				loStl.addFacet(v1, v2, v3);
			}
			else if (v1.z >= (z - tol) && v2.z >= (z - tol) && v3.z >= (z - tol)) {	// facet entirely above the plane.
				hiStl.addFacet(v1, v2, v3);
			}
			else {		// split the facet
				var e12 = GeoMath.line_x_zPlane(v1, v2, z);	// param
				var e23 = GeoMath.line_x_zPlane(v2, v3, z);
				var e31 = GeoMath.line_x_zPlane(v3, v1, z);
				
				if (e12 <= 0 || e12 >= 1) {	// v3 is the lone point (edge 12 has no intersection or lies on the plane)
					lonePoint = v3;
					point1 = v1;
					point2 = v2;
					edge1 = e31;
					edge2 = e23;
				}
				else if (e23 <= 0 || e23 >= 1) {	// v1 is the lone point (edge 23 has no intersection)
					lonePoint = v1;
					point1 = v2;
					point2 = v3;
					edge1 = e12;
					edge2 = e31;
				}
				else {		// edge 31 has no intersection so v2 is the lone point
					lonePoint = v2;
					point1 = v3;	// point ccw from lone point
					point2 = v1;	// point ccw from point1
					edge1 = e23;
					edge2 = e12;
				}

				GeoMath.line3_param(lonePoint, point1, edge1, s1);
				GeoMath.line3_param(point2, lonePoint, edge2, s2);	// get the point (s1) of z plane intersection
				
				side1 = lonePoint.z > z ? hiStl : loStl;		// stl with 1 points
				side2 = lonePoint.z > z ? loStl : hiStl;		// stl with 2 points
				side1.addFacet(s1, s2, lonePoint);
				if (s1.distance(point1) < 0.001) 		// this would indicate the midpoint is exactly on the z plane and should be split down the middle.
					side2.addFacet(point1, point2, s2);						
				else if (s2.distance(point2) < 0.001) 
					side2.addFacet(point1, point2, s1);
				else {			// split the 4 sided polygon into 2 triangles.
					side2.addFacet(s2, s1, point1);
					side2.addFacet(s2, point1, point2);
				}
			}
		}

		//Add the facets to the top and bottom to heal the holes.
		var avs = hiStl.getVertices();	// Float32Array
		var v1 = new Vector3(), v2 = new Vector3(), v3 = new Vector3();
		var numFacets = hiStl.numFacets;
		for (var i=0; i < numFacets; i++) {
			v1.x = avs[i*9+0]; v1.y = avs[i*9+1]; v1.z = z;
			v2.x = avs[i*9+3]; v2.y = avs[i*9+4]; v2.z = z;
			v3.x = avs[i*9+6]; v3.y = avs[i*9+7]; v3.z = z;
			try{
				loStl.addFacet(v1, v2, v3);
				hiStl.addFacet(v1, v2, v3);
			}
			catch(e) {
			 debugger;
			}
		}

		return hiStl;
	}

	// Split the facets between two z levels until their edge length is below the passed value.
	// minZ		number		Split only facets above this z level
	// maxZ  	number		Split only facets below this z level
	runSplicer (minZ, maxZ, maxEdgeLength) {
		maxEdgeLength = Math.max(0.005, maxEdgeLength);
		minZ -= 1e-5;	// floating point adjustments
		maxZ += 1e-5;	

		var self = this;
		var m12 = new Vector3();	// center, midpoints
		var split_facet = function (index, v1, v2, v3) {	// splits facet midway between v1 and v2
			m12.set(v1).add(v2).div(2);
			self.setFacet(index, m12, v3, v1);
			self.addFacet(m12, v2, v3);
		}

		var index;
		var c1, c2, c3;		// bools. consider verts because they are within minZ and maxZ.
		var d12, d23, d31;	// distances
		var v1 = new Vector3(), v2 = new Vector3(), v3 = new Vector3();
		for (var i = 0; i < this.numFacets; i++) {
			if (i % 40000 == 0) {
				var msg = "Splitting facet " + i + " of " + this.numFacets + " (" + (i * 100 / this.numFacets).toFixed(1) + "%) "
				console.log(msg);
			}

			index = i * 9;				 // index into the vert array
			v1.set(this.verts[index + 0], this.verts[index + 1], this.verts[index + 2]);
			v2.set(this.verts[index + 3], this.verts[index + 4], this.verts[index + 5]);
			v3.set(this.verts[index + 6], this.verts[index + 7], this.verts[index + 8]);

			c1 = v1.z >= minZ && v1.z <= maxZ;
			c2 = v2.z >= minZ && v2.z <= maxZ;
			c3 = v3.z >= minZ && v3.z <= maxZ;
			
			d12 = (c1 && c2) ? v1.distance(v2) : 0; 
			d23 = (c2 && c3) ? v2.distance(v3) : 0;
			d31 = (c3 && c1) ? v3.distance(v1) : 0;

			// Keep splitting the face until all the edges within the z range are all shorter than the requested length.
			// Since all edges are split according to the same rules the tessellation should stay tight, even on the edges.
			while (d12 > maxEdgeLength || d23 > maxEdgeLength || d31 > maxEdgeLength) {
				if (d12 > d23 && d12 > d31) 
					split_facet(i, v1, v2, v3);
				else if (d23 > d31)
					split_facet(i, v2, v3, v1);
				else
					split_facet(i, v3, v1, v2);
									
				v1.set(this.verts[index + 0], this.verts[index + 1], this.verts[index + 2]);
				v2.set(this.verts[index + 3], this.verts[index + 4], this.verts[index + 5]);
				v3.set(this.verts[index + 6], this.verts[index + 7], this.verts[index + 8]);

				c1 = v1.z >= minZ && v1.z <= maxZ;
				c2 = v2.z >= minZ && v2.z <= maxZ;
				c3 = v3.z >= minZ && v3.z <= maxZ;

				d12 = (c1 && c2) ? v1.distance(v2) : 0; 
				d23 = (c2 && c3) ? v2.distance(v3) : 0;
				d31 = (c3 && c1) ? v3.distance(v1) : 0;
			}
		}
		this.updateNormals();
	}

	// Merge the facets of the passed StlFile into this one. 
	// other		StlFile		The file to merge. It will be left unchanged.
	// offset	Vector3		opt, def=0,0,0. The amount to offset the passed in stl file.
	merge (other, offset) {
		if (!(other instanceof StlFile))
			return;
		if (!offset)
			offset = new Vector3(0,0,0);

		var startIndex = this.numFacets * 9;
		this.setNumFacets(this.numFacets + other.numFacets);
		for (var i = 0; i < other.numFacets * 9; i+=3) {
			this.verts[startIndex + i + 0] = other.verts[i + 0] + offset.x;
			this.verts[startIndex + i + 1] = other.verts[i + 1] + offset.y;
			this.verts[startIndex + i + 2] = other.verts[i + 2] + offset.z;
		}	
		startIndex /= 3;
		for (var i = 0; i < other.numFacets * 3; i++) {
			this.normals[startIndex + i] = other.normals[i];
		}	
		this.bounds.clear();
	}

	// Process the contents of an stl file that is an ascii string.
	// Example facet:
	// facet normal -0.104575 -0.973416 0.203779
	//		outer loop
	//			vertex -0.00267627 0.00540587 0.00380084
	//			vertex -0.00264419 0.00535025 0.00355163
	//			vertex -0.00216396 0.00534277 0.00376233
 	//		endloop
	//	endfacet
	// returns 	boolean		true if successful, false if it is really a binary.
	// str		string		The contents of the stl file.
	_parseASCII (str) {
		var lines = str.split("\n");
		
		var verts = [new Vector3(), new Vector3(), new Vector3()];
		var normal = new Vector3();
		var curVert = 0;

		for (var i = 0; i < lines.length; i++) {
			var line = lines[i].trim();
			var tokens = line.split(" ");
			// Remove tokens that are just empty spaces.
			for (var j=0; j < tokens.length; j++) {
				if (tokens[j].trim() == "") {
					tokens.splice(j, 1);
					j--;
				}			
			}

			switch (tokens[0]) {
				case 'solid': 		// 'solid Mesh'. The top line.
					this.source = tokens[1]; 
					break;
				case 'facet':	//  'facet normal 0.960208 -0.000309705 0.279285'
					if (tokens[1] == 'normal') 
						normal.set(Number(tokens[2]), Number(tokens[3]), Number(tokens[4]));
					else
						normal.set(0,0,0);
					break;
				case 'vertex':		// 'vertex -9.9228 18.8735 -36.4485'
					verts[curVert].set(Number(tokens[1]), Number(tokens[2]), Number(tokens[3]));
					curVert++;
					break;
				case 'endfacet':
					this.addFacet(verts[0], verts[1], verts[2], normal);
					curVert = 0;
					break;
				case 'outer':		// 'outer loop'
				case 'endloop':
					break;		// beginning / end of facet
				case 'endSolid':	// end of file
					break;
				default:
					if (line.length > 100) 	// unknown tag and line length is much too long. It is really a binary file pretending to be an ascii.
						return false;
			}
		}
		return true;
	}

	// Process the contents of an stl file that is in binary format
	_parseBinary (dataView) {
		var header = DataViewExt.getString(dataView, 0, 80);
		var numTriangles = dataView.getUint32(80, true);
		if (numTriangles > 1e7)	// sanity check
			return;
		this.setBufferSize(numTriangles);

		var pos = 84;
		var v1 = new Vector3(), v2 = new Vector3(), v3 = new Vector3(), normal = new Vector3();
		for (var i = 0; i < numTriangles; i++) {
			DataViewExt.getVector3(dataView, pos, normal); pos += 12;
			DataViewExt.getVector3(dataView, pos, v1); pos += 12;
			DataViewExt.getVector3(dataView, pos, v2); pos += 12;
			DataViewExt.getVector3(dataView, pos, v3); pos += 12;
			this.addFacet(v1, v2, v3, normal);
			pos += 2;	// skip over 2 unused bytes.
		}
	};
	
	// Process the contents of an stl file.
	_parse (arrayBuffer) {
		var dataView = new DataView(arrayBuffer);
		var startStr = DataViewExt.getString(dataView, 0, 5);

		if (startStr == "solid") {
			var decoder = new TextDecoder();
			var str = decoder.decode(arrayBuffer);
			if (!this._parseASCII(str))
				this._parseBinary(dataView);	// really a binary that started with 'solid'
		}
		else {
			this._parseBinary(dataView);
		}
		this.getBounds();		// update the bounding box for the file.
	}
	
	// toFileString () {
	// 	var str = "solid " + this.source + "\n";
	// 	for (var i = 0; i < this.facets.length; i++) {
	//			** FROM StlFacet ** 
	// 		var str = "  facet normal " + this.normal.x.toFixed(4) + " " + this.normal.y.toFixed(4) + " " + this.normal.z.toFixed(4) + "\n";
	// 		str +=    "    outer loop\n";
	// 		for (var i = 0; i < this.vertices.length; i++) 
	// 			str += "      vertex " + this.vertices[i].x.toFixed(4) + " " + this.vertices[i].y.toFixed(4) + " " + this.vertices[i].z.toFixed(4) + "\n";
	// 		str +=    "    endloop\n";
	// 		str +=    "  endfacet\n";
	// 		return str;
	// 	}
	// 	str += "endsolid " + this.source + "\n";
	// 	return str;
	// }

	// returns ArrayBuffer - the StlFile in the format of a binary stl file.
	toBinary () {
		var numFacets = this.numFacets;
		
		var fileSize = numFacets * 50 + 84;	
		var arrayBuffer = new ArrayBuffer(fileSize);
		var dataView = new DataView(arrayBuffer);

		dataView.setUint32(80, numFacets, true);
		var pos = 84;
		
		var v1 = new Vector3(), v2 = new Vector3(), v3 = new Vector3(), n = new Vector3();
		for (var i = 0; i < numFacets; i++) {
			v1.set(this.verts[i * 9 + 0], this.verts[i * 9 + 1], this.verts[i * 9 + 2]);
			v2.set(this.verts[i * 9 + 3], this.verts[i * 9 + 4], this.verts[i * 9 + 5]);
			v3.set(this.verts[i * 9 + 6], this.verts[i * 9 + 7], this.verts[i * 9 + 8]);
			n.set(this.normals[i * 3 + 0], this.normals[i * 3 + 1], this.normals[i * 3 + 2]);
			DataViewExt.setVector3(dataView, pos, n);
			DataViewExt.setVector3(dataView, pos + 12, v1);
			DataViewExt.setVector3(dataView, pos + 24, v2);
			DataViewExt.setVector3(dataView, pos + 36, v3);
			pos += 50;
		}

		return arrayBuffer;
	}

	// POSTs the stl file as binary data to the passed url.
	// url			string			Address of a server that will accept the data.
	// callback		function()		Called when the stl has successfully been sent.
	save (url, callback) {
		var buffer = this.toBinary();		// ArrayBuffer
						
		var request = new XMLHttpRequest();
		request.open("POST", url, true /* async */);	// POST sends data
		request.setRequestHeader("Content-type", "application/octet-stream");
		request.onload = function ()    {   console.log("Ready: " + request.responseText);   if (callback) callback();   }
		request.onerror = function (e)  {   console.log("Server error: " + e.message);	       }
		request.send(buffer);
	}

	// Load an stl file from a server that is hosting the stl.
	// callback		function(StlFile)		Called when it has finished loading.
	loadFromUrl (url, callback) {
		var request = new XMLHttpRequest();
		request.open("GET", url, true /* async */);
		request.responseType = "arraybuffer";
		//request.setRequestHeader("Content-type", "text/plain");

		this.reset();
		this.isLoaded = false;

		var self = this;
		request.onload = function ()  {
			var urlTokens = url.split('/');
			self.filename = urlTokens[urlTokens.length - 1];

			if (request.status != 200) {
				console.log("Error loading stl " + url + ": " + request.status + " - " + request.statusText);
				return;
			}

			var arrayBuffer = request.response;
			if (arrayBuffer) {
				self._parse(arrayBuffer);
				self.isLoaded = true;
				if (callback) {
					callback(self);
				}
			}
		}
		request.onerror = function (e)  {   console.log("Server error: " + e.message);	       }
		request.send();	
	}

	// Load an stl file from the devices local storage
	// file			File					The file object that was selected.
	// callback		function(StlFile) Called when the file has finished parsing.
	loadFromFile (file, callback) {
		var reader = new FileReader();
		this.filename = file.name;
		
		this.clear();
		this.isLoaded = false;

      var self = this;
		reader.onload = function (event)
		{
			self._parse(event.target.result);
			self.isLoaded = true;
         if (callback) {
            callback(self);
         }
		};
      reader.onerror = function (error) {
         console.log("Error loading stl file: " + self.filename + " (" + error.message + ")");
		};

		reader.readAsArrayBuffer(file);
	}
	
	// callback		function(StlFile)		Called when the stl has loaded successfuly.
	load (fileOrUrl, callback) {
		if (fileOrUrl instanceof File) {
			this.loadFromFile(fileOrUrl, callback);
		}
		else {
			this.loadFromUrl(fileOrUrl, callback);
		}
	}

	
	// Implementation of BinaryFile interface.
	writeBinary (file /* BinaryFile */) {
		var version = 1.0;
		file.writeVersion(version);

		file.writeString(this.filename);
		file.writeString(this.source);
		file.writeInt(this.numFacets);
		file.writeFloat32Array(this.verts);
		file.writeFloat32Array(this.normals);
	}

	// Implementation of BinaryFile interface.
	static readBinary (file /* BinaryFile */) {
		var version = file.readVersion();
		if (version > 1.0) { 
			console.log("Cannot read STLFile version " + version);
			return;
		}

		var stl = new StlFile();
		stl.filename = file.readString();
		stl.source = file.readString();
		stl.numFacets = file.readInt();
		stl.verts = file.readFloat32Array();
		stl.normals = file.readFloat32Array();
		stl.isLoaded = true;
		return stl;
	}

	static Test() {
		var check = function (a, b) {
			if (Math.abs(a - b) > 0.00001)
				console.log("StlFile Test failure: " + a + " != " + b);
		}

		var stl = new StlFile();
		stl.addFacet(new Vector3(0, 0, 5), new Vector3(0, 0, -5), new Vector3(2, 0, -1));
		var newStl = stl.splitAtZPlane(0);
		check(stl.numFacets, 2);
		check(newStl.numFacets, 1);

		stl.reset();
		stl.addFacet(new Vector3(0, 0, -5), new Vector3(2, 0, 1), new Vector3(0, 0, 5));
		var newStl = stl.splitAtZPlane(0);
		check(stl.numFacets, 1);
		check(newStl.numFacets, 2);

		stl.reset();
		stl.addFacet(new Vector3(0, 0, 5), new Vector3(0, 0, -5), new Vector3(2, 0, 0));
		var newStl = stl.splitAtZPlane(0);
		check(stl.numFacets, 1);
		check(newStl.numFacets, 1);
	}
}
