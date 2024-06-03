// simple-objects.js
// A library of simple geometries for display
// The shapes are generally created around the origin (0,0) and can be moved using
// the transform manipulation functions in Node3D (which is the parent of Object3D).
// Most notably: setPosition(), setForward(), and setUpVec().


import Object3D from './object-3d.js';
import Color from '../core/color.js';
import Vector2 from '../core/vector2.js';

export default class SimpleObjects {

	// Create a rectangle on the xy plane. The center point is 0,0. 
	// returns		Object3D			The created 2d rectangle on the xy plane
	// width			number			The width of the rectangle in world units.
	// height		number			The height of the rectangle in world units.
	// color			Color | string The color of the rectangle or the texture alias.
	// textureMin	Vector2			opt, def=0,0. The UV texture coordinate at the min corner. 
	// textureMax	Vector2			opt, def=1,1. The UV texture coordinate at the max corner. For tiling texture.
	static createRectangle (glContext, width, height, color, textureMin, textureMax) {
		if (!textureMin)
			textureMin = new Vector2(0, 0);
		if (!textureMax)
			textureMax = new Vector2(1, 1);
		
		var rectangle = new Object3D(glContext);
		rectangle.setVertices([-width / 2.0, -height / 2.0, 0.0, // lower-left
									-width / 2.0, height / 2.0, 0.0,
									width / 2.0, height / 2.0, 0.0,
									width / 2.0, -height / 2.0, 0.0]);

		rectangle.setIndices([0, 1, 2, 0, 2, 3]);
		

		if (typeof color == 'string') {		// texture alias
			var textureAlias = color;
			var texCoords = [textureMin.x, textureMin.y,  textureMin.x, textureMax.y,  textureMax.x, textureMax.y,  textureMax.x, textureMin.y];
			rectangle.texture = glContext.textures.getTexture(textureAlias);
			rectangle.setTextureCoords(texCoords);
		}
		else {
			rectangle.setColor(color == undefined ? new Color(1.0, 1.0, 1.0) : color);
		}
		
		return rectangle;
	};

	// Create a outline of a rectangle on the xy plane with lines. The center point is 0,0. 
	// returns		Object3D			The created 2d rectangle on the xy plane
	// width			number			The width of the rectangle in world units.
	// height		number			The height of the rectangle in world units.
	// color			Color  			The color of the rectangle.
	static createOutlineRectangle (glContext, width, height, color) {
		var rectangle = new Object3D(glContext);
		rectangle.setVertices([-width / 2.0, -height / 2.0, 0.0, // lower-left
										-width / 2.0, height / 2.0, 0.0,
										width / 2.0, height / 2.0, 0.0,
										width / 2.0, -height / 2.0, 0.0])
	
		rectangle.setColor(color == undefined ? new Color(0.0, 1.0, 0.0) : color);
		rectangle.setDrawType(glContext.LINE_LOOP);
		return rectangle;
	}

	// returns Object3D
	// Create a 3d box whose center is 0,0,0. 
	// gl			GLWebContext	The context the box will be initialized into.
	// width		world units		The x dimension of the box.
	// depth		world units		The y dimension of the box.
	// height	world units		The z dimension of the box.
	// color		Color				opt. def=magenta. The color of the box.
	static createBox (glContext, width, depth, height, color /* Color */) {
		var box = new Object3D(glContext);

		// verts are duplicated so the normals can be assigned per face and not per vertex.
		var verts = [-width / 2, depth / 2,   height / 2,		// 4 0 top front left
						  -width / 2, depth / 2,  -height / 2,		// 0 1 bottom front left
						  width / 2,  depth / 2,  height / 2,		// 5 2 top front right
						  width / 2,  depth / 2,  -height / 2,		// 1 3 bottom front right

						  width / 2,  depth / 2,  height / 2,		// 5 4 top front right
						  width / 2,  depth / 2,  -height / 2,		// 1 5 bottom front right
						  width / 2,  -depth / 2, height / 2,		// 6 6 top back right
						  width / 2,  -depth / 2, -height / 2,		// 2 7 bottom back right

						  -width / 2, -depth / 2, height / 2,		// 7 8 top back left
						  width / 2,  -depth / 2, height / 2,		// 6 9 top back right
						  -width / 2, -depth / 2, -height / 2,		// 3 10 bottom back left
						  width / 2,  -depth / 2, -height / 2,		// 2 11 bottom back right

						  -width / 2, -depth / 2, height / 2,		// 7 12 top back left
						  -width / 2, depth / 2,  height / 2,		// 4 13 top front left
						  -width / 2, depth / 2,  -height / 2,		// 0 14 bottom front left
						  -width / 2, -depth / 2, -height / 2,		// 3 15 bottom back left

						  -width / 2, -depth / 2, height / 2,		// 7 16 top back left
						  -width / 2, depth / 2,  height / 2,		// 4 17 top front left
						  width / 2,  -depth / 2, height / 2,		// 6 18 top back right
						  width / 2,  depth / 2,  height / 2,		// 5 19 top front right

						  -width / 2, -depth / 2, -height / 2,		// 3 20 bottom back left
						  width / 2,  -depth / 2, -height / 2,		// 2 21 bottom back right
						  -width / 2, depth / 2,  -height / 2,		// 0 22 bottom front left
						  width / 2,  depth / 2,  -height / 2,		// 1 23 bottom front right
						];

		var indices = [0, 1, 2,  2, 1, 3,			// front
							4, 5, 6,  6, 5, 7,			// right
							8, 9, 10,  9, 10, 11,      // back

							12, 13, 14,  12, 14, 15,	// left
							16, 17, 18,  18, 17, 19, 	// top
							20, 21, 22,  22, 21, 23		// bottom
					  ];
		var normals = [0,-1,0, 0,-1,0, 0,-1,0,	0,-1,0,	// front
					  	 	1,0,0,  1,0,0,  1,0,0,  1,0,0,	// right
							0,1,0,  0,1,0,  0,1,0,	0,1,0,	// back
							-1,0,0, -1,0,0, -1,0,0,	-1,0,0,	// left
							0,0,1,  0,0,1,  0,0,1,	0,0,1,	// top
							0,0,-1, 0,0,-1, 0,0,-1,	0,0,-1	// bottom
					];
		
		box.setVertices(new Float32Array(verts));
		box.setNormals(new Float32Array(normals));
		box.setIndices(indices);
		box.setColor(color == undefined ? new Color(1.0, 0.0, 1.0) : color);
		//box.setUpVec(0, 0, 1);
		return box;
	}

	// Create an outline of the bounding box where z is up.
	// bbox			BBox3		The dimensions of the box.
	// color			Color		Color of the box.
	static createBoxOutline (glContext, bbox, color) {
		var l = bbox.min.x, r = bbox.max.x;		// left, right
		var f = bbox.min.y, k = bbox.max.y;		// front, back
		var b = bbox.min.z, t = bbox.max.z;		// bottom, top
		
		var verts = [l,f,b, l,f,t, l,f,t, r,f,t, r,f,t, r,f,b, r,f,b, l,f,b, // front
						 l,k,b, l,k,t, l,k,t, r,k,t, r,k,t, r,k,b, r,k,b, l,k,b, // back
						 l,f,t, l,k,t, r,f,t, r,k,t, r,f,b, r,k,b, l,f,b, l,k,b]; // sides
		return SimpleObjects.createLines(glContext, verts, color);				
	}

	// Returns Object3D
	// Create a sphere centered on 0,0,0. 
	// glContext			GlContext	The context to create this object within.
	// radius				number		The radius of the sphere
	// slices				number		def=20. Number of slices (lines of latitude). The stacks will be half this.
	// options:
	//		color				Color			def=white. Single color of the sphere
	// 	genTexCoords	boolean		def=false. Generate texture coordinates
	static createSphere (glContext, radius, slices, options) {
		if (!options)
			options = {};
		if (!slices)
			slices = 20;
		
		var stacks = Math.ceil(slices / 2);
		var numVerts = (stacks + 1) * (slices + 1);  // slices + 1: the first set is repeated for proper texture coordinates
		var verts = new Float32Array(numVerts * 3);
		var normals = new Float32Array(numVerts * 3);
		var texCoords = null;
		if (options.genTexCoords)
			texCoords = new Array(numVerts * 2);
		var numFacets = slices * 2 * (stacks - 1);
		var indices = new Array(numFacets * 3);
		
		var pI = 0, nI = 0, cI = 0, tI = 0, iI = 0;
		var step = (Math.PI * 2) / slices;
		var lastStackStart = 0;
		for (var i = 0; i <= stacks; i++) {
			var stackStart = pI / 3;	// Start index for this stack.
			var stackRadius = Math.sin(i / stacks * Math.PI) * radius;	// Radius of this stack
			var stackZ = Math.sin(i / stacks * Math.PI - (Math.PI / 2)) * radius;

			for (var j = 0; j <= slices; j++) {
				var x = Math.cos(j * step) * stackRadius;	
				var y = Math.sin(j * step) * stackRadius;
				var z = stackZ;
				verts[pI++] = x;	verts[pI++] = y; 	verts[pI++] = z;
				normals[nI++] = x; normals[nI++] = y; normals[nI++] = z;
				if (texCoords) {
					texCoords[tI++] = invert ? (1.0 - (j / slices)) : (j / slices); // long (0 - 1)
					texCoords[tI++] = i / stacks; // lat  (0 - 1)
				}
			}

			// Add the indices
			for (var j = 0; j < slices; j++) {
				var left = j;   // The left point's offset
				var right = j + 1;
				if (i == 0)
					break;		// first ring has no facets.

				// Check to prevent the pole stacks from creating degenerate triangles
				if (i != stacks) {
					indices[iI++] = lastStackStart + left;
					indices[iI++] = stackStart + right;
					indices[iI++] = stackStart + left;
				}
				if (i != 1) {
					indices[iI++] = lastStackStart + right;
					indices[iI++] = stackStart + right;
					indices[iI++] = lastStackStart + left;
				}
			}
			lastStackStart = stackStart;
		}

		var sphere = new Object3D(glContext);
		sphere.setVertices(verts);
		sphere.setNormals(normals);
		sphere.setIndices(indices);
		sphere.setColor(options.color == undefined ? new Color(1.0, 1.0, 1.0) : options.color);
		if (texCoords) 
			sphere.setTextureCoords(texCoords);
		return sphere;
	}

	// Create a solid circle on the XY plane centered at 0,0,0. The bottom edge
	// will be along the x axis.
	// sides		number		opt,def=20. Number of sides on the cirlce. eg 3=triangle.
	// color		Color			opt. Color of the circle
	static createCircle (glContext, radius, sides, color) {
		if (!sides)
			sides = 20;

		var verts = [];
		verts.push(0,0,0);	// center point.
		var step = (Math.PI * 2) / sides;
		var start = -(Math.PI / 2) - (Math.PI * 2) / (sides * 2);
		for (var j = 0; j <= sides; j++) {
			var x = Math.cos(j * step + start) * radius;	
			var y = Math.sin(j * step + start) * radius;
			verts.push(x, y, 0);
		}

		var circle = new Object3D(glContext);
		circle.setVertices(verts);
		circle.setColor(color || new Color(100, 100, 100));
		circle.setDrawType(glContext.TRIANGLE_FAN);
		return circle;
	}

	// Create an outline of a circle on the XY plane centered at 0,0,0. The bottom
	// edge will be along the x axis.
	// sides		number		opt,def=20 Number of sides on the circle. eg 4=square.
	static createCircleOutline (glContext, radius, sides, color) {
		if (!sides)
			sides = 20;

		var verts = [];
		var step = (Math.PI * 2) / sides;
		var start = -(Math.PI / 2) - (Math.PI * 2) / (sides * 2);
		for (var j = 0; j <= sides; j++) {
			var x = Math.cos(j * step + start) * radius;	
			var y = Math.sin(j * step + start) * radius;
			verts.push(x, y, 0);
		}

		var circle = new Object3D(glContext);
		circle.setVertices(verts);
		circle.setColor(color || new Color(100, 100, 100));
		circle.setDrawType(glContext.LINE_LOOP);
		return circle;
	}

	// returns Object3D
	// Create a cylinder where the bottom center is at (0,0,0) and the top is (0,0,height)
	// sides				int				opt, def=10. Number of sides
	// options:
	//		color				Color			def=white. Single color of the sphere
	// 	genTexCoords	boolean		def=false. Generate texture coordinates
	//    cap				boolean		def=false. Create end caps for the cylinder
	static createCylinder (glContext, height, radius, sides, options) {
		if (!options)
			options = {};
		if (!sides)
		sides = 10;
		var color = options.color || new Color(1.0, 0.0, 1.0);

		var numVerts = (sides + 1) * 2;  
		var verts = new Float32Array(numVerts * 3);
		var normals = new Float32Array(numVerts * 3);
		var texCoords = options.genTexCoords ? new Array(numVerts * 2) : null;
		var numFacets = sides * 2;
		var indices = new Array(numFacets * 3);
		
		var pI = 0, nI = 0, tI = 0, iI = 0;
		var step = (Math.PI * 2) / sides;
		var start = -(Math.PI / 2) - (Math.PI * 2) / (sides * 2); // so bottom edge is along the x axis.
				
		for (var j = 0; j <= sides; j++) {
			var x = Math.cos(j * step + start) * radius;	
			var y = Math.sin(j * step + start) * radius;
			verts[pI++] = x;	verts[pI++] = y; 	verts[pI++] = 0;
			verts[pI++] = x;	verts[pI++] = y; 	verts[pI++] = height;
			normals[nI++] = x; normals[nI++] = y; normals[nI++] = 0;
			normals[nI++] = x; normals[nI++] = y; normals[nI++] = 0;
			if (texCoords) {
				texCoords[tI++] = j / sides;	texCoords[tI++] = 0;
				texCoords[tI++] = j / sides;	texCoords[tI++] = 1;
			}
		}
		
		// Add the indices
		for (var j = 0; j < sides; j++) {
			var bl = j * 2;
			var tl = j * 2 + 1;
			var br = (j * 2 + 2) % verts.length;
			var tr = (j * 2 + 3) % verts.length;

			indices[iI++] = bl; indices[iI++] = tr; indices[iI++] = tl;
			indices[iI++] = bl; indices[iI++] = br; indices[iI++] = tr;
		}
		
		var cylinder = new Object3D(glContext);
		cylinder.setVertices(verts);
		cylinder.setNormals(normals);
		cylinder.setIndices(indices);
		cylinder.setColor(color);
		if (texCoords) 
			cylinder.setTextureCoords(texCoords);

		if (options.cap) {
			var topCap = SimpleObjects.createCircle(glContext, radius, sides, color);
			topCap.setPosition(0,0,height);
			topCap.setParent(cylinder);
			var botCap = SimpleObjects.createCircle(glContext, radius, sides, color);
			botCap.setPosition(0,0,0);
			botCap.setParent(cylinder);
		}
		return cylinder;
	}

	// Returns Object3D
	// Create a pyramid where the center of the base is at the origin and the top is at 0,0,height.
	// glContext		GlContext		opt. The graphical context to create the object within.
	// base				float				The length of each side of the pyramid on the xy plane
	//	height			float				The height of the pyramid in the z direction
	// color				Color				opt. The color of the pyramd. Default is grey.
	static createPyramid (glContext, base, height, color) {
		var pyramid = new Object3D(glContext);
		
		var top = new Vector3(0, 0, height);	
		var bl = new Vector3(-base / 2.0, 	base / 2.0, 	0.0);	// back left
		var br = new Vector3(base / 2.0, 	base / 2.0, 	0.0);	// back right
		var fr = new Vector3(base / 2.0, 	-base / 2.0, 	0.0); // front right
		var fl = new Vector3(-base / 2.0, 	-base / 2.0, 	0.0);	// front left

		pyramid.setVertices([top, br, bl,		// Back
								  top, fr, br, 	// Right
								  top, fl, fr, 	// Front
								  top, bl, fl]);	// Left
		
		_tri.set(top, br, bl);		var backN = _tri.getNormal();
		_tri.set(top, fr, br);		var rightN = _tri.getNormal();
		_tri.set(top, fl, fr);		var frontN = _tri.getNormal();
		_tri.set(top, bl, fl);		var leftN = _tri.getNormal();

		pyramid.setNormals([backN, backN, backN, rightN, rightN, rightN,
								frontN, frontN, frontN, leftN, leftN, leftN]);
		
		pyramid.setColor(color ? color : new Color(0.6, 0.6, 0.6));

		return pyramid;
	};

	// Create a line or series of lines.
	// returns		Object3D					The renderable 3d lines.
	// verts			Vector3[] | float[] | Float32Array	The points of the lines.
	// colors		Color | Color[] | Float32Array		One color or per vertex colors
	// drawType		1 (gl.LINES)(def) | 2 (gl.LINE_LOOP) | 3 (gl.LINE_STRIP)
	static createLines (glContext, verts, colors, drawType) {
		var lines = new Object3D(glContext)
				
		lines.setVertices(verts);
		lines.setDrawType(drawType || glContext.LINES);
				
		if (Array.isArray(colors)) 
			lines.setColors(colors);
		else 
			lines.setColor(colors);

		return lines;
	};

	// Create a simple mesh from the passed verts. 
	// returns		Object3D			The renderable mesh
	// verts			Vector3[] | float[] | Float32Array	The points of the mesh
	// normals		Vector3[] | float[] | Float32Array  opt. per-vert normals. If none the shading will be flat.
	// colors		Color | Color[] | Float32Array		opt. per-vert colors or whole mesh color. 
	// indices		int[] | Uint16Array						opt. facet indices. If none, each 3 verts are interpreted as a triangle.
	static createMesh (glContext, verts, normals, colors, indices) {
		var mesh = new Object3D(glContext);

		mesh.setVertices(verts);
		if (normals)
			mesh.setNormals(normals);
		if (colors instanceof Color)
			mesh.setColor(colors);
		else if (Array.isArray(colors))
			mesh.setColors(colors);
		if (indices)
			mesh.setIndices(indices);
		return mesh;
	}

}
			