// geometry-data.js
// Vertex data for WebGL objects.  Having this data in a seperate class allows for this data
// to be shared between objects.

import Vector3 from '../core/vector3.js';
import Matrix from '../core/matrix.js';
import MathExt from '../core/math-ext.js';
import Triangle from '../core/triangle.js';

export default class GeometryData {

	constructor () {
		this.shaderName = "master";	// The name of the default shader to use to display this data.
		this.drawType = 4;			// gl.LINES = 1, gl.TRIANGLES = 4

		this.vertexArray = null;	// Float32Array
		this.vertexBuffer = null;
		this.dynamicVerts = false;	// Bind the verts with the 'dynamic' hint because they will be changed often.
		
		this.normalArray = null;	// Float32Array.  Normals are 1 per vertex.
		this.normalBuffer = null;
		
		this.colorArray = null;		// Float32Array.  Parallel with vertices.
		this.colorBuffer = null;
		
		this.texCoordArray = null; // Float32Array
      this.texCoordBuffer = null;

		this.indexArray = null;		// Uint16Array
		this.indexBuffer = null;

		// General utility arrays. 
		this.valuesArray = null;		// Float32Array. Parallel with vertices. For any per-vertex value that may be relevant to the graphic.
		this.valuesBuffer = null;

		this.int8ArrayA = null;		// Int8Array. Parallel with vertices. For any other value that should be represented per-vert.
		this.int8BufferA = null;

		this.int8ArrayB = null;		// Int8Array. An additional array to use in shaders. In the voxel shader it is used for the boundary status.
		this.int8BufferB = null;

		// 3d indices. An alternative way to define positions. Used for voxels.
		this.xIndexArray = null;		// Int16Array. Parallel with vertices. The x index of the voxel.
		this.xIndexBuffer = null;
		this.yIndexArray = null;
		this.yIndexBuffer = null;
		this.zIndexArray = null;
		this.zIndexBuffer = null;
				
		this.boundContext = null;	// GlContext. cache value.  If there is a bound gl context store it here.
		this.numBoundVertices = 0;	// Number of vertices in the vertex array.

		// Used to display wireframe, generally for debugging.
		this.numWireframeVerts = 0;
		this.wireframeVertexBuffer = null;
		
		//this.dictionary = {};		// 'id' => {start, length}.  If there are multiple objects in the data, their index ranges are defined here.
	}
	
	// Add the contents of the passed GeometryData to this one. This geometry data must already have some data.
	merge (other /* GeometryData */) {
		if (this.drawType != other.drawType) {
			console.log("Draw types are not the same. Cannot merge!");
			return;
		}
		if ((this.normalArray && this.normalArray.length > 0) != (other.normalArray && other.normalArray.length > 0)) {
			console.log("Normals defined on one and not the other. Cannot merge!");
			return;
		}
		if ((this.colorArray && this.colorArray.length > 0) != (other.colorArray && other.colorArray.length > 0)) {
			console.log("Colors defined on one and not the other. Cannot merge!");
			return;
		}
		if ((this.texCoordArray && this.texCoordArray.length > 0) != (other.texCoordArray && other.texCoordArray.length > 0)) {
			console.log("Texture coordinates defined on one and not the other. Cannot merge!");
			return;
		}
		if ((this.valuesArray && this.valuesArray.length > 0) != (other.valuesArray && other.valuesArray.length > 0)) {
			console.log("Values defined on one and not the other. Cannot merge!");
			return;
		}
		if ((this.int8ArrayA && this.int8ArrayA.length > 0) != (other.int8ArrayA && other.int8ArrayA.length > 0)) {
			console.log("Utility values defined on one and not the other. Cannot merge!");
			return;
		}
		if ((this.indexArray && this.indexArray.length > 0) != (other.indexArray && other.indexArray.length > 0)) {
			console.log("Indices defined on one and not the other. Cannot merge!");
			return;
		}

		var mergeFloatArrays = function (array1, array2) {
			var length1 = array1 ? array1.length : 0;
			var length2 = array2 ? array2.length : 0;
			var array = new Float32Array(length1 + length2);
			for (var i = 0; i < length1; i++) 
				array[i] = array1[i];
			for (var i = 0; i < length2; i++) 
				array[i+length1] = array2[i];
			return array;
		}

		var numVerts = this.vertexArray.length / 3;	// record for index offset.
		this.setVertices(mergeFloatArrays(this.vertexArray, other.vertexArray));
		this.setNormals(mergeFloatArrays(this.normalArray, other.normalArray));
		this.setTextureCoords(mergeFloatArrays(this.texCoordArray, other.texCoordArray));
		this.setValues(mergeFloatArrays(this.valuesArray, other.valuesArray));
		this.setColors(mergeFloatArrays(this.colors, other.colors));
			
		if (this.indexArray && this.indexArray.length > 0) {
			if (this.vertexArray.length / 3 > 65535) 
				console.log("Caution: Attempting to merge two meshes where the vert count is greater than 65535!");
			var length1 = this.indexArray.length;
			var length2 = other.indexArray.length;
			var newIndices = new Int16Array(length1 + length2);
			for (var i = 0; i < length1; i++) 
				newIndices[i] = this.indexArray[i];
			for (var i = 0; i < length2; i++)
				newIndices[i+length1] = other.indexArray[i] + numVerts;
			this.setIndices(newIndices);
		}
	}
	
	// Set the default shader for this geometry data. Can be overridden in the Object3D that uses the geometry.
	setShader (shaderName /* string */) {
		this.shaderName = shaderName;
	}
				
	// drawType = gl.POINTS | gl.LINE_STRIP | gl.LINE_LOOP | gl.LINES | gl.TRIANGLE_STRIP | gl.TRIANGLE_FAN | gl.TRIANGLES (def)
	setDrawType (drawType) {
		if (typeof drawType == 'string') {
			switch (drawType) {
				case 'lines':  this.drawType = 1;  break;
				case 'triangles': this.drawType = 4; break;
			}	
		}
		else {
			this.drawType = drawType;
		}
	}

	// Scale the vertices themselves. This is useful if the base model needs to be transformed before using it.
	scale (factor) {
		for (var i = 0; i < this.vertexArray.length; i++) {
			this.vertexArray[i] *= factor;
		}
		this._geometryChanged();
	};

	translate (xOrVec, y, z) {
		if (xOrVec.x !== undefined) {
			for (var i = 0; i < this.vertexArray.length; i += 3) {
				this.vertexArray[i + 0] += xOrVec.x;
				this.vertexArray[i + 1] += xOrVec.y;
				this.vertexArray[i + 2] += xOrVec.z;
			}
		}
		else {
			for (var i = 0; i < this.vertexArray.length; i += 3) {
				this.vertexArray[i + 0] += xOrVec;
				this.vertexArray[i + 1] += y;
				this.vertexArray[i + 2] += z;
			}
		}
		this._geometryChanged();
	};

	// Rotate the vertices around an axis.  Useful if the base model needs to be transformed before using it.
	rotate (x, y, z, deg) {
		var matrix = Matrix.fromRotation(x, y, z, MathExt.degToRad(deg));
		var vert = new Vector3();
		for (var i = 0; i < this.getNumVerts(); i++) {
			this.getVertex(i, vert);
			matrix.applyToVec(vert);
			this.setVertex(i, vert);
		}
		this._geometryChanged();
	};

	// Apply a permanent transform to each of the verts.
	applyTransform (matrix) {
		var vert = new Vector3();
		for (var i = 0; i < this.getNumVerts(); i++) {
			this.getVertex(i, vert);
			matrix.applyToVec(vert);
			this.setVertex(i, vert);
		}
		this._geometryChanged();
	};
	
	// not implemented
	getBoundingBox () {
		return null;
	};

	/* -- VERTICES ---------------------------------- */

	// Main function for setting the vertices of this object. Vertices may be set as often as needed.
	// setVertices (Float32Array)			Set from a typed array of points in the format x,y,z,x... Best performance.
	// setVertices (Array[number])		Set from an Array of xyz values. Poor performance. Recommend using Float32Array for larger objects.
	// setVertices (Array[Vector3])		Set from an Array of Vertex3 points
	// setVertices (Array[Triangle])		Set from an array of Triangle objects.
	setVertices (vertices) {
		if (vertices.length === 0)
			return;

		if (vertices instanceof Float32Array) {
			if (this.vertexArray != vertices) {
				if (this.vertexArray)
					this.unbindVertices();
				this.vertexArray = vertices;
			}
		}
		else if (typeof vertices[0] == "number") {
		 	this.vertexArray = new Float32Array(vertices);
		}
		else if (vertices[0] instanceof Triangle) {
			if (!this.vertexArray || this.vertexArray.length != vertices.length * 9)
				this.vertexArray = new Float32Array(vertices.length * 9);
			var tri;
			for (var i = 0; i < vertices.length; i++) {
				tri = vertices[i];
				this.vertexArray[i * 9 + 0] = tri.p1.x; 	this.vertexArray[i * 9 + 1] = tri.p1.y;	this.vertexArray[i * 9 + 2] = tri.p1.z;
				this.vertexArray[i * 9 + 3] = tri.p2.x; 	this.vertexArray[i * 9 + 4] = tri.p2.y;	this.vertexArray[i * 9 + 5] = tri.p2.z;
				this.vertexArray[i * 9 + 6] = tri.p3.x; 	this.vertexArray[i * 9 + 7] = tri.p3.y;	this.vertexArray[i * 9 + 8] = tri.p3.z;
			}	
		}
		else {			// Vector3 or Vertex2 array
			if (!this.vertexArray || this.vertexArray.length != vertices.length * 3)
				this.vertexArray = new Float32Array(vertices.length * 3);
			for (var i = 0; i < vertices.length; i++) {
				this.vertexArray[i * 3 + 0] = vertices[i].x;
				this.vertexArray[i * 3 + 1] = vertices[i].y;
				this.vertexArray[i * 3 + 2] = vertices[i].z ? vertices[i].z : 0.0;
			}
		}
		this.bindVertices();
	};

	getNumVerts () {
		if (!this.vertexArray)
			return 0;
		return this.vertexArray.length / 3;
	}

	getNumVertices () {
		return this.getNumVerts();
	}

	// Float32Array
	getVertices () {
		return this.vertexArray;
	}

	hasVertices () {
		return this.vertexArray && this.vertexArray.length > 0;
	}
		
	getVertexArrayLength () {
		return this.vertexArray.length;
	}

	// Returns Vector3: A vertex at position vertIndex
	// outVert		Vector3		opt, out. The result is placed in this object instead of creating a new Vertex3 for efficiency.
	getVertex (vertIndex, outVert /* opt, Vector3 */) {
		if (vertIndex > this.vertexArray.length / 3)
			return null;
		if (!outVert)
			outVert = new Vector3();
		outVert.set(this.vertexArray[vertIndex * 3], this.vertexArray[vertIndex * 3 + 1], this.vertexArray[vertIndex * 3 + 2]);
		return outVert;
	}

	// Set a single vertex at position vertIndex
	// vertIndex	int		Replace the ith vertex in the array. Starts at array position i*3 as each point is 3 values.
	// vertex		Vector3	The vertex to place in that position.
	setVertex (vertIndex, vertex) {
		if (vertIndex > this.vertexArray.length / 3)
			return;
		this.vertexArray[vertIndex * 3] = vertex.x;
		this.vertexArray[vertIndex * 3 + 1] = vertex.y;
		this.vertexArray[vertIndex * 3 + 2] = vertex.z;
	}
	
	/* ----- NORMALS -------------------------------- */

	// Main function for setting the normals of this object. Normals may be set as often as needed.
	// Normals are always x,y,z and parallel with vertices.
	// setNormals (Float32Array)		Set from a typed array of points in the format x,y,z,x... Best performance.
	// setNormals (Array[number])		Set from an Array of xyz values. Poor performance. Recommend using Float32Array for larger objects.
	// setNormals (Array[Vector3])	Set from an Array of Vertex3 points
	setNormals (normals) {
		this.normalsArray = null;

		if (normals instanceof Float32Array) {
			this.normalArray = normals;
		}
		else if (typeof normals[0] == "number") {
			this.normalArray = new Float32Array(normals);
		}
		else {			// Vector3 array
			if (normals.length == 0)
				return;

			this.normalArray = new Float32Array(normals.length * 3);
			for (var i = 0; i < normals.length; i++) {
				normals[i].normalize();
				this.normalArray[i * 3 + 0] = normals[i].x;
				this.normalArray[i * 3 + 1] = normals[i].y;
				this.normalArray[i * 3 + 2] = normals[i].z;
			}
		}
	};

	getNumNormals () {
		if (!this.normalArray)
			return 0;
		return this.normalArray.length / 3;
	}
		
	// Returns the normals as an array of Vector3 objects.
	getNormals () {
		var normals = [];
		for (var i = 0; i < this.normalArray.length / 3; i++) 
			normals.push(new Vector3(this.normalArray[i * 3], this.normalArray[i * 3 + 1], this.normalArray[i * 3 + 2]));
		return normals;
	}

	hasNormals () {
		return this.normalArray && this.normalArray.length > 0;
	}

	getNormalArrayLength () {
		return this.normalArray.length;
	}

	getNormal (index, result /* opt, Vector3 */) {
		if (index > this.normalArray.length / 3)
			return null;
		if (!result)
			result = new Vector3();
		result.set(this.normalArray[index * 3], this.normalArray[index * 3 + 1], this.normalArray[index * 3 + 2]);
		return result;
	}

	setNormal (index, normal /* Vector3 */) {
		if (vertIndex > this.normalArray.length / 3)
			return;
		this.normalArray[vertIndex * 3] = normal.x;
		this.normalArray[vertIndex * 3 + 1] = normal.y;
		this.normalArray[vertIndex * 3 + 2] = normal.z;
	}

	/* ------ COLORS ---------------------------------- */
	
	// Main function for setting the colors of this object. Colors may be set as often as needed. 
	// Color values are always between 0-1 and are always rgba. Colors are parallel with the vertices.
	// setColors (Float32Array)		Set from a typed array of points in the format r,g,b,a... Recommended for large objects for performance.
	// setColors (Array[number])		Set from an Array of rgba values. 
	// setColors (Array[Color])		Set from an Array of Color objects
	setColors (colors) {
		this.colorArray = null;

		if (colors instanceof Float32Array) {
			this.colorArray = colors;
		}
		else if (typeof colors[0] == "number") {
			this.colorArray = new Float32Array(colors);
		}
		else {	// Color array
			if (colors.length === 0)
				return;

			this.colorArray = new Float32Array(colors.length * 4);
			for (var i = 0; i < colors.length; i++) {
				this.colorArray[i * 4 + 0] = colors[i].r;
				this.colorArray[i * 4 + 1] = colors[i].g;
				this.colorArray[i * 4 + 2] = colors[i].b;
				this.colorArray[i * 4 + 3] = colors[i].a;
			}
		}
	};
	
	getColorArrayLength () {
		if (!this.colorArray)
			return 0;
		return this.colorArray.length;
	}

	getColors () {
		return this.colorArray;
	}

	hasColors () {
		return this.colorArray && this.colorArray.length > 0;
	}

	/* ----- TEXTURE COORDINATES ------------------------- */

	// Main function for setting the texture coordinates of this object. Coords may be set as often as needed. 
	// Coordinates are always two dimensional u,v. Coordinates are parallel with the vertices.
	// setTextureCoords (Float32Array)		Set from a typed array of points in the format u,v.. Best performance.
	// setTextureCoords (Array[number])		Set from an Array of rgba values. Recommend using Float32Array for larger objects.
	// setTextureCoords (Array[Vector2])	Set from an Array of Vector2 objects
	setTextureCoords (coords /* Float32Array | number[] | Vector2[] */) {
		this.texCoordArray = null;

		if (!coords)
			return;

		if (coords instanceof Float32Array) {
			this.texCoordArray = coords;
		}
		else if (typeof coords[0] == "number") {
			this.texCoordArray = new Float32Array(coords);
		}
		else {	// Vector2
			if (coords.length == 0)
				return;

			this.texCoordArray = new Float32Array(coords.length * 2);
			for (var i = 0; i < coords.length; i++) {
				this.texCoordArray[i * 2 + 0] = coords[i].x;
				this.texCoordArray[i * 2 + 1] = coords[i].y;
			}
		}
	};

	getTexCoordArrayLength () {
		if (!this.texCoordArray) {
			return 0;
		}
		return this.texCoordArray.length;
	}

	hasTexture () {
		return this.hasTextureCoords();
	}

	hasTextureCoords () {
		return this.texCoordArray && this.texCoordArray.length > 0;
	}

	// [Float32Array]
	getTextureCoords () {
		return this.texCoordArray;
	}
	
	/* --- VALUES ---------------------------------- */
	
	// Main function for setting the general values of this object. Values are used for different
	// things in the shaders.
	// setValues (Float32Array)		Set from a typed array of float values
	// setValues (Array[number])		Set from an Array of numbers
	setValues (values) {
		this.valuesArray = null;
		if (values instanceof Float32Array) 
			this.valuesArray = values;
		else 
			this.valuesArray = new Float32Array(values);
		this.bindValues();
	};

	getValues () {
		return this.valuesArray;
	}

	hasValues () {
		return this.valuesArray && this.valuesArray.length > 0;
	}

	// Set the 8-bit integer values for whatever the shader decides they should be used for.
	// setInt8ValuesA (Int8Array)			Set from a typed array of int values
	// setInt8ValuesA (Array[number])		Set from an Array of numbers
	setInt8ValuesA (values) {
		this.int8ArrayA = null;
		if (values instanceof Int8Array) 
			this.int8ArrayA = values;
		else 
			this.int8ArrayA = new Int8Array(values);
		this.bindInt8ValuesA();
	};

	// Another set of int8 values to use if necessary.
	// setInt8ValuesB (Int8Array)			Set from a typed array of int values
	// setInt8ValuesB (Array[number])		Set from an Array of numbers
	setInt8ValuesB (values) {
		this.int8ArrayB = null;
		if (values instanceof Int8Array) 
			this.int8ArrayB = values;
		else 
			this.int8ArrayB = new Int8Array(values);
		this.bindInt8ValuesB();
	};


	// Set the 16-bit integer values for whatever the shader decides they should be used for.
	// set3dIndexValues (Uint16Array, Uint16Array, Uint16Array)		Set from a typed array of int values
	// set3dIndexValues (Array[number])	Set from an Array of numbers
	set3dIndexValues (xIndices, yIndices, zIndices) {
		this.xIndexArray = this.yIndexArray = this.zIndexArray = null;
		if (xIndices instanceof Uint16Array) {
			this.xIndexArray = xIndices;
			this.yIndexArray = yIndices;
			this.zIndexArray = zIndices;
		}
		else {
			this.xIndexArray = new Uint16Array(xIndices);
			this.yIndexArray = new Uint16Array(yIndices);
			this.zIndexArray = new Uint16Array(zIndices);
		}
		this.bindIndex16Values();
	};

	  
	/* ------ INDICES --------------------------------- */

	// Main function for setting the indices of this object. Indices may be set as often as needed. 
	// Index values are referencing the vertices and may not be higher than 65535 because they are referenced as 2 byte integers in webgl.
	// setIndices (Uint16Array)		Set from a typed array. Best performance.
	// setIndices (Array[number])		Set from an Array of numbers. Recommend using Float32Array for larger objects.
	setIndices (indices /* Uint16Array or number[] */) {
		this.indexArray = null;

		if (indices instanceof Uint16Array) {
			this.indexArray = indices;
		}
		else {		// number[]
			if (indices.length === 0)
				return;

			this.indexArray = new Uint16Array(indices);
		}
	}

	getIndexArray () {
		return this.indexArray;
	};

	getIndexArrayLength () {
		if (this.indexArray == null)
			return 0;
		return this.indexArray.length;
	};

	getNumFacets () {
		if (this.indexArray != null && this.indexArray.length > 0) 
			return this.indexArray.length / 3;
		if (this.vertexArray != null && this.indexArray.length > 0)
			return this.vertexArray.length / 9;
		return 0;
	};
	
	// Return the facet as a triangle
	getFacet (facetIndex, triangle /* Triangle, out, opt */) {
		if (!triangle)
			triangle = new Triangle();

		if (this.indexArray && this.indexArray.length > 0) {
			triangle.p1.set(this.vertexArray[this.indexArray[facetIndex * 3] * 3 + 0],		// x
								 this.vertexArray[this.indexArray[facetIndex * 3] * 3 + 1],		// y
								 this.vertexArray[this.indexArray[facetIndex * 3] * 3 + 2]);	// z
			triangle.p2.set(this.vertexArray[this.indexArray[facetIndex * 3 + 1] * 3 + 0],
								 this.vertexArray[this.indexArray[facetIndex * 3 + 1] * 3 + 1],
								 this.vertexArray[this.indexArray[facetIndex * 3 + 1] * 3 + 2]);
			triangle.p3.set(this.vertexArray[this.indexArray[facetIndex * 3 + 2] * 3 + 0],
								 this.vertexArray[this.indexArray[facetIndex * 3 + 2] * 3 + 1],
								 this.vertexArray[this.indexArray[facetIndex * 3 + 2] * 3 + 2]);
		}
		else if (this.vertices && this.vertices.length > 0) {
			triangle.p1.set(this.vertexArray[facetIndex * 9 + 0],
								this.vertexArray[facetIndex * 9 + 1],
								this.vertexArray[facetIndex * 9 + 2]);
			triangle.p2.set(this.vertexArray[facetIndex * 9 + 3],
								this.vertexArray[facetIndex * 9 + 4],
								this.vertexArray[facetIndex * 9 + 5]);
			triangle.p3.set(this.vertexArray[facetIndex * 9 + 6],
								this.vertexArray[facetIndex * 9 + 7],
								this.vertexArray[facetIndex * 9 + 8]);
		}		
		return triangle;
	};
	
	getFacetArea (facetIndex) {
		var facet = this.getFacet(facetIndex);
		if (facet == null)
			return;
		return facet.getArea();
	};
	
	/* ----- BINDINGS ------------------------------- */

	bind (glContext) {
		this.bindVertices(glContext);
		this.bindNormals(glContext);
		this.bindColors(glContext);
		this.bindTextureCoords(glContext);
		this.bindIndices(glContext);
		this.bindValues(glContext);
		this.bindInt8ValuesA(glContext);
		this.bindInt8ValuesB(glContext);
		this.bindIndex16Values(glContext);
		
		this.boundContext = glContext;
		// In some shaders there are no verts but rather indices into a volume.
		this.numBoundVertices = this.vertexArray ? this.vertexArray.length / 3 : this.xIndexArray.length;
	}

	unbind () {
		var gl = this.boundContext;
		if (!gl)
			return;
		if (this.vertexBuffer) { gl.deleteBuffer(this.vertexBuffer); this.vertexBuffer = null; }
		if (this.normalBuffer) { gl.deleteBuffer(this.normalBuffer); this.normalBuffer = null; }
		if (this.colorBuffer) { gl.deleteBuffer(this.colorBuffer); this.colorBuffer = null; }
		if (this.texCoordBuffer) { gl.deleteBuffer(this.texCoordBuffer); this.texCoordBuffer = null; }
		if (this.valuesBuffer) { gl.deleteBuffer(this.valuesBuffer); this.valuesBuffer = null; }
		if (this.int8BufferA) { gl.deleteBuffer(this.int8BufferA); this.int8BufferA = null; }
		if (this.int8BufferB) { gl.deleteBuffer(this.int8BufferB); this.int8BufferB = null; }
		if (this.xIndexBuffer) { gl.deleteBuffer(this.xIndexBuffer); this.xIndexBuffer = null; }
		if (this.yIndexBuffer) { gl.deleteBuffer(this.yIndexBuffer); this.yIndexBuffer = null; }
		if (this.zIndexBuffer) { gl.deleteBuffer(this.zIndexBuffer); this.zIndexBuffer = null; }
		if (this.indexBuffer) { gl.deleteBuffer(this.indexBuffer); this.indexBuffer = null; }
	};

	unbindVertices () {
		var gl = this.boundContext;
		if (gl && this.vertexBuffer) { 
			gl.deleteBuffer(this.vertexBuffer); 
			this.vertexBuffer = null; 
		}
	}
	
	isBound () {
		return this.vertexBuffer || this.xIndexBuffer;
	}

	// Bind the vertex array to the graphics memory.
	bindVertices (glContext) {
		var gl = glContext || this.boundContext;
		
		if (gl && this.vertexArray != null && this.vertexArray.length > 0) {
			if (!this.vertexBuffer)
				this.vertexBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, this.vertexArray, this.dynamicVerts ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW);
		}
	};

	bindNormals (glContext) {
		var gl = glContext || this.boundContext;
	
		if (gl && this.normalArray != null && this.normalArray.length > 0) {
			if (!this.normalBuffer)
				this.normalBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, this.normalArray, gl.STATIC_DRAW);
		}
	};

	bindColors (glContext) {
		var gl = glContext || this.boundContext;
					
		if (gl && this.colorArray != null && this.colorArray.length > 0) {
			if (!this.colorBuffer)
				this.colorBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, this.colorArray, gl.STATIC_DRAW);
		}
	};
	
	bindTextureCoords (glContext) {
		var gl = glContext || this.boundContext;
				
		if (gl && this.texCoordArray != null && this.texCoordArray.length > 0) {
			if (!this.texCoordBuffer)
				this.texCoordBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, this.texCoordArray, gl.STATIC_DRAW);
		}
	}

	unbindValues () {
		var gl = this.boundContext;
		if (gl && this.valuesBuffer) { 
			gl.deleteBuffer(this.valuesBuffer); 
			this.valuesBuffer = null; 
		}
	}

	bindValues (glContext) {
		var gl = glContext || this.boundContext;
		if (gl && this.valuesArray != null && this.valuesArray.length > 0) {
			if (!this.valuesBuffer)
				this.valuesBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, this.valuesBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, this.valuesArray, gl.DYNAMIC_DRAW);	// assume they will change often.
		}
	}

	unbindIntValues () {
		var gl = this.boundContext;
		if (gl && this.int8BufferA) { 
			gl.deleteBuffer(this.int8BufferA); 
			this.int8BufferA = null; 
		}
	}

	bindInt8ValuesA (glContext) {
		var gl = glContext || this.boundContext;
		if (gl && this.int8ArrayA != null && this.int8ArrayA.length > 0) {
			if (!this.int8BufferA)
				this.int8BufferA = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, this.int8BufferA);
			gl.bufferData(gl.ARRAY_BUFFER, this.int8ArrayA, gl.STATIC_DRAW);	
		}
	}

	bindInt8ValuesB (glContext) {
		var gl = glContext || this.boundContext;
		if (gl && this.int8ArrayB != null && this.int8ArrayB.length > 0) {
			if (!this.int8BufferB)
				this.int8BufferB = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, this.int8BufferB);
			gl.bufferData(gl.ARRAY_BUFFER, this.int8ArrayB, gl.STATIC_DRAW);	
		}
	}

	bindIndex16Values (glContext) {
		var gl = glContext || this.boundContext;
		if (gl && this.xIndexArray != null && this.xIndexArray.length > 0) {
			if (!this.xIndexBuffer)  {
				this.xIndexBuffer = gl.createBuffer();
				this.yIndexBuffer = gl.createBuffer();
				this.zIndexBuffer = gl.createBuffer();
			}
			gl.bindBuffer(gl.ARRAY_BUFFER, this.xIndexBuffer);		// assume they will change often.
			gl.bufferData(gl.ARRAY_BUFFER, this.xIndexArray, gl.STATIC_DRAW);	
			gl.bindBuffer(gl.ARRAY_BUFFER, this.yIndexBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, this.yIndexArray, gl.STATIC_DRAW);
			gl.bindBuffer(gl.ARRAY_BUFFER, this.zIndexBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, this.zIndexArray, gl.STATIC_DRAW);	
		}
	}

	bindIndices (glContext) {
		var gl = glContext || this.boundContext;
		
		if (gl && this.indexArray && this.indexArray.length > 0) {
			if (!this.indexBuffer)
				this.indexBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indexArray, gl.STATIC_DRAW);
		}
	}
	
	_geometryChanged () {
		this.unbind();
	}

	/* --- WIREFRAME ---------------------- */

	// Solid objects can be requested to be displayed as wireframe, generally for debugging purposes.
	// When wireframe verts are requested, create them and store them in a buffer - but not until then.
	getWireframeVertexBuffer (glContext) {
		if (this.vertexArray == null)
			return null;
		if (!this.wireframeVertexBuffer) {
			var indices, iI = 0;
			if (this.indexArray && this.indexArray.length > 0) {
				indices = new Uint32Array(this.indexArray.length / 3 * 18);
				for (var i = 0; i < this.indexArray.length; i += 3) {	// iterate through the facets.
					// P1 -> P2
					indices[iI++] = this.indexArray[i]; 
					indices[iI++] = this.indexArray[i + 1]; 
					// P2 -> P3
					indices[iI++] = this.indexArray[i + 1]; 
					indices[iI++] = this.indexArray[i + 2]; 
					// P3 -> P1
					indices[iI++] = this.indexArray[i + 2]; 
					indices[iI++] = this.indexArray[i + 1]; 
				}
			}
			else {
				indices = new Uint32Array(this.vertexArray.length / 3 * 6);
				for (var i = 0; i < this.vertexArray.length / 3; i+=3) {	
					// P1 -> P2
					indices[iI++] = i; 
					indices[iI++] = i + 1; 
					// P2 -> P3
					indices[iI++] = i + 1;
					indices[iI++] = i + 2;
					// P3 -> P1
					indices[iI++] = i + 2;
					indices[iI++] = i;
				}
			}

			var wfVerts = new Float32Array(indices.length * 3), vI = 0;
			for (var i = 0; i < indices.length; i++) {
				wfVerts[vI++] = this.vertexArray[indices[i] * 3 + 0]; // x
				wfVerts[vI++] = this.vertexArray[indices[i] * 3 + 1]; // y
				wfVerts[vI++] = this.vertexArray[indices[i] * 3 + 2]; // z	
			}
			
			this.wireframeVertexBuffer = glContext.createBuffer();
			glContext.bindBuffer(glContext.ARRAY_BUFFER, this.wireframeVertexBuffer);
			glContext.bufferData(glContext.ARRAY_BUFFER, wfVerts, glContext.STATIC_DRAW);
			this.numWireframeVerts = wfVerts.length / 3;
		}
		return this.wireframeVertexBuffer;
	}


	/* --- I/O ---------------------------------------------------------- */
	
	// Implementation of the interface of BinaryFile that allows the object to be serialized in a binary file.
	writeBinary (file /* BinaryFile */) {
		file.writeVersion(2.0);
		file.writeString(this.shaderName);
		file.writeInt(this.drawType);
		file.writeFloat32Array(this.vertexArray);
		file.writeCompFloatArray(this.normalArray, 1, function (val) { return (val + 1.0) / 2.0 * 255; });
		file.writeCompFloatArray(this.colorArray, 1, function (val) { return val * 255; });
		file.writeFloat32Array(this.texCoordArray);
		file.writeIntArray(this.indexArray);
		
		return this;
	}

	readBinary (file /* BinaryFile */) {
		var version = file.readVersion();
		if (version < 2.0 || version > 2.0) {
			console.log("Unable to read geometry version: " + version);
			return file;
		}

		this.shaderName = file.readString();
		this.drawType = file.readInt();
		this.vertexArray = file.readFloat32Array();
		this.normalArray = file.readCompFloat32Array(1, function (val) { return val / 255 * 2.0 - 1.0; });
		this.colorArray = file.readCompFloat32Array(1, function (val) { return val / 255; });
		this.texCoordArray = file.readFloat32Array();
		this.indexArray = file.readUint16Array();
		
		return file;
	}

	static readBinary (file /* BinaryFile */) {
		var geometry = new GeometryData();
		geometry.readBinary(file);
		return geometry;
	}

}

