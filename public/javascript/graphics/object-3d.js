// object-3d.js
// Base functionality for all objects displayable in WebGL. Subclass of Node3D so it can be inserted into a render tree.

import Color from '../core/color.js';
import GeometryData from './geometry-data.js';
import Texture from './texture.js';
import Node3D from './node-3d.js';
import BinaryFile from '../util/binary-file.js';
				
export default class Object3D extends Node3D {
	// glContext		GlContext		The webgl context this object will be contained within
	// geometryData	GeomeryData		opt. The static geomery this object will reference. If not passed in, an empty object will be created.
	constructor (glContext, geometryData) {
		super();
		
		this.gl = glContext || null;	// avoid it being undefined.

		this.shaderName = '';			// Overrides the default shader in GeometryData if provided.
		this.shader = null;				// Shader program from shader.js
		this.setShader('master');		// The default shader.
		this.selectionId = null;		// int. Uniquely identifies this object in getSelected(). Objects without a selectionId are not selectable.
				
		// The geometry data contains the vertex, normal, texture coord, index data for the object.  This data
		// is generally static and can be shared among multiple Object3d objects.
		this.geometryData = geometryData ? geometryData : new GeometryData(); 

		// Cosmetic properties that can make an instance look different than others.
		this.singleColor = null;	// Color.  If set, use this as the color instead of the buffer.
		this.texture = null;			// Texture (optional).  Do not set directly.  Use setTexture()
		this.textureIndex = -1;		// index. Indentifies the texture for serialization. If this is set, the texture itself will not be serialized and assumed to be serialized in another object such its template.
		this.isTransparent = false;// Transparent objects are drawn after solid objects.
		this.isWireframe = false;	// Shows the object in wireframe instead of solid.
		this.useZOffset = false;	// Should a z-offset be applied to this geometry.
		this.isSnappable = true;	// Should the object be drawn in the depth shader and snapped to on pan?
				
		if (glContext)
			this.updateShader();
	};
	
	// Override the shader used with this one. Used for finding the depth at a pixel.
	static useDepthShader = false;	

	// Override the shader used with the selection shader. Used for finding the id the object at the cursor.
	static useSelectShader = false;

	// Create a copy of this object with the passed glContext.  The geometry and tree structure is a shallow copy.
	// Context is optional.  If context is passed in, it assumes the constructor has already been called.
	clone (glContext /* opt */) {
		// Note if the context has changed, geomeryData cannot be a shallow copy like this.
		var obj = new Object3D(glContext ? glContext : this.gl, this.geometryData);
		Node3D.prototype.clone.call(this, obj);

		obj.shaderName = this.shaderName;		
		if (this.singleColor)
			obj.singleColor = this.singleColor.clone();
		obj.textureIndex = this.textureIndex;
		obj.texture = this.texture;				// shallow copy.  Textures are owned by the texture manager.
		obj.isTransparent = this.isTransparent;

		if (this.glContext)
			this.updateShader();
		return obj;		
	}
		
	_cleanup () {
		this.unbind();
	};

	// Binding generally happens automatically, but can be done manually by calling this function.
	bind () {
		this.geometryData.bind(this.gl);
	}

	// If the array data has changed, the buffers will need to be updated by calling this.
	unbind () {
		this.geometryData.unbind();
	}
	
	// Set the geometry data object to use.  This is useful if the object is shared among multiple 3d objects.
	setGeometryData (data /* GeometryData */) {
		this.unbind();
		this.geometryData = data;
	}

	getGeometryData () {
		return this.geometryData;
	}

	getGeometry () {
		return this.geometryData;
	}

	setGeometry (geometry /* GeometryData */) {
		this.setGeometryData(geometry);
	}
		
	// Set the shader program to use.  Shaders are found in shaders.js. Called from Node3D.setShader()
	// shaderName		string 		The name of the shader to use. Shader names are listed in shaders.js.
	_setShader (shaderName) {
		if (this.shaderName == shaderName)
			return;
		this.shaderName = shaderName;
		this.updateShader();
	};

	// Set the selection id returned from getSelected(). Objects with a null id are not selectable.
	// Use Node3D.setSelectionId().
	_setSelectionId (id) {
		this.selectionId = id;
	}

	getSelectionId () {
		return this.selectionId;
	}
	
	// Called from Node3D base class when the context is set.
	_setContext (glContext) {
		this.unbind();
		this.gl = glContext;
		if (this.texture)
			this.texture.setContext(glContext);
		this.updateShader();
	}

	getContext () {
		return this.gl;
	}

	updateShader () {
		if (this.gl) {
			if (this.shaderName)		// Prefer this shader name over the default given in geometryData.
				this.shader = this.gl.shaders.get(this.shaderName);
			else if (this.geometryData.shaderName)
				this.shader = this.gl.shaders.get(this.geometryData.shaderName);
		}
	}

	enableZOffset (enable) {
		this.useZOffset = enable !== false;
	}

	// Set if this object should be snapped to on pan. Setting it to false will cause the 
	// object to not be drawn when rendering for snapping.
	setSnappable (snappable) {
		this.isSnappable = snappable;
	}

	// Set how webGL inteprets the vertices. The number or the alias may be passed in.
	// 0		gl.POINTS			Vertices will be drawn as 1-pixel points
	// 1		gl.LINES				Drawn as lines 0->1, 1->2, 2->3
	// 2		gl.LINE_LOOP		Closed loop 0->1->2->0 (rarely used)
	// 3		gl.LINE_STRIP		Normal line 0->1->2->3 (rarely used)
	// 4		gl.TRIANGLES		default. Solid triangles of verts 0-1-2, 3-4-5, 6-7-8
	// 5		gl.TRIANGLE_STRIP Triangles of verts 0-1-2, 1-2-3, 2-3-4 (rarely used)
	// 6		gl.TRIANGLE_FAN	Triangles of verts 0-1-2, 0-2-3, 0-3-4 (rarely used)
	setDrawType (drawType) {
		this.geometryData.setDrawType(drawType);
	};

	getDrawType () {
		return this.geometryData.drawType;
	}
			
	// Convert a 3D object rendered as triangles to wireframe
	_toWireframe () {
		this.isWireframe = true;
	}

	// Convert a LINES object that was converted to wireframe into solid triangles.
	_toSolid () {
		this.isWireframe = false;
	}

	// -- VERTEX FUNCTIONS ------------------------
	
	getNumVerts () {
		return this.geometryData.getNumVerts();
	}

	getNumVertices () {
		return this.getNumVerts();
	}

	// Float32Array
	getVertices () {
		return this.geometryData.getVertices();
	}

	hasVertices () {
		return this.geometryData.hasVertices();
	}

	getVertexArrayLength () {
		return this.geometryData.getVertexArrayLength();
	}

	// Vector3
	getVertex (vertIndex, outVert /* opt, Vector3 */) {
		return this.geometryData.getVertex(vertIndex, outVert);
	}

	setVertices (vertices /*  Float32Array | number[] | Vector3[] | Triangle[] */) {
		this.geometryData.setVertices(vertices);
	};

	setVertex (vertIndex, vertex) {
		return this.geometryData.setVertex(vertIndex, vertex);
	}

	// If the verts will be changed often, this will be passed as a hint to webgl.
	useDynamicVerts (bool) {
		this.geometryData.dynamicVerts = bool;
	}

	// Rebind the vertices after they have been manually adjusted.
	unbindVertices () {
		this.geometryData.unbindVertices();
	}
	
	// -- NORMAL FUNCTIONS ------------------------
		
	setNormals (normals /*  Float32Array | number[] | Vector3[] */) {
		this.geometryData.setNormals(normals);
	};
		
	getNumNormals () {
		return this.geometryData.getNumNormals();
	}
		
	getNormals () {
		return this.geometryData.getNormals();
	}

	hasNormals () {
		return this.geometryData.hasNormals();
	}

	getNormalArrayLength () {
		return this.geometryData.getNormalArrayLength();
	}

	getNormal (index, result /* opt, Vector3 */) {
		return this.geometryData.getNormal(index, result);
	}

	setNormal (index, normal /* Vector3 */) {
		return this.geometryData.setNormal(index, normal);
	}

	// -- COLOR FUNCTIONS ----------------------------

	setColors (colors /* Float32Array | number[] | Color[] */) {
		this.geometryData.setColors(colors);
	};

	getColors () {
		return this.geometryData.getColors();
	}

	// Called from Node3d
	_setColor (rOrColor, g, b, a) {
		if (rOrColor == null || rOrColor == undefined) {
			this.singleColor = null;
			return;
		}
		if (!this.singleColor) 
			this.singleColor = new Color();
		this.singleColor.set(rOrColor, g, b, a);
		this.isTransparent = this.singleColor.a < 1.0;
	};

	// Set the alpha value. Use the Node3d version of the function.
	// a 		float		0-1. The new alpha value of the object. 0=transparent, 1=solid.
	_setAlpha (a) {
		if (this.singleColor) {
			this.singleColor.a = a;
			this.isTransparent = this.singleColor.a < 1.0;
		}
	}

	getColor () {
		return this.getSingleColor();
	}

	isSingleColor () {
		return !!(this.singleColor);
	};
	
	getSingleColor () {
		return this.singleColor;
	}

	
	hasColors () {
		return this.geometryData.hasColors();
	}

	getColorArrayLength () {
		return this.geometryData.getColorArrayLength();
	};
	
	// -- TEXTURE COORD FUNCTIONS --------------------

	setTextureCoords (coords /* Float32Array | number[] | Vector2[] */) {
		this.geometryData.setTextureCoords(coords);
		this.inverseTextureTransform = null;		// No texture coords have been applied.  Reapply.
	};

	getTexCoordArrayLength () {
		return this.geometryData.getTexCoordArrayLength();
	}

	getTextureCoords () {
		return this.getTextureCoords();
	}

	hasTextureCoords () {
		return this.geometryData.hasTextureCoords();
	}

	// [Float32Array]
	getTextureCoords () {
		return this.geometryData.getTextureCoords();
	}

	// -- VALUES FUNCTIONS -----------------

	setValues (values) {
		this.geometryData.setValues(values);
	}

	// returns	Float32Array
	getValues () {
		return this.geometryData.getValues();
	}

	hasValues () {
		return this.geometryData.hasValues();
	}

	setInt8ValuesA (values) {
		this.geometryData.setInt8ValuesA(values);
	}

	setInt8ValuesB (values) {
		this.geometryData.setInt8ValuesB(values);
	}

	set3dIndexValues (xIndices, yIndices, zIndices) {
		this.geometryData.set3dIndexValues(xIndices, yIndices, zIndices);
	}
	
	// -- FACET FUNCTIONS -------------------

	setIndices (indices /* Uint16Array or number[] */) {
		return this.geometryData.setIndices(indices);
	}

	getNumFacets () {
		return this.geometryData.getNumFacets();
	};

	getIndexArrayLength () {
		return this.geometryData.getIndexArrayLength();
	};

	getIndexArray () {
		return this.geometryData.getIndexArray();
	};
	
	// Return the facet as a triangle
	getFacet (facetIndex, triangle /* Triangle, out, opt */) {
		return this.geometryData.getFacet(facetIndex, triangle);
	};
	
	getFacetArea (facetIndex) {
		return this.geometryData.getFacetArea(facetIndex);
	};

	/* --- TEXTURE ------------------------ */

	hasTexture () {
		return !!this.texture;
	}

	getTexture () {
		return this.texture;
	}

	getTextureAlias () {
		return this.texture ? this.texture.getAlias() : null;
	}
	
	setTexture (texture /* Texture or alias name */) {
		var newTexture;
		if (!texture) 
			newTexture = null;
		else if (texture instanceof Texture) 
			newTexture = texture;
		else		// It's an alias. Get it from the manager
			newTexture = this.gl.textures.getTexture(texture);

		if (newTexture == this.texture)
			return;

		// Determine if the texture has transparency
		if (newTexture.isLoaded) {
			this.isTransparent = newTexture.hasAlpha();
		}
		else {		
			var self = this;
			newTexture.addCallback(function(texture) { self.isTransparent = texture.hasAlpha(); });
		}

		//if (this.texture) 		// Reset any texture transform that was applied by previous textures.
		//	this.resetTextureCoords();

		this.texture = newTexture;
						
		// Adjust the texture coord transform if necessary. 	
		if (this.texture) {
			if (this.texture.isLoaded) {
				if (this.adjustTexCoordsOnLoad)
					this.scaleTextureCoords(this.texture.getUMax(), this.texture.getVMax());
			}
			else {
				var self = this;
				this.texture.addCallback(function () {
					if (self.adjustTexCoordsOnLoad)
						self.scaleTextureCoords(self.texture.getUMax(), self.texture.getVMax());
				});
			}
		}
	}

	// Set the index of the texture which presumably points to a texture. Used for serialization.
	// If this is set, the texture itself is not saved.
	setTextureIndex (index) {
		this.textureIndex = index;
	}

	getTextureIndex () {
		return this.textureIndex;
	}
	
	// The main render function.
	// Render the object to the 3D window. Don't call this directly but instead call Node3D.render().
	// transform		Matrix		opt. Current world transform this object should inherit. Generally used when rendering children of an object.
	_render (transform) {
		// If there is no geometry it may be that it hasn't been initiailized yet or it is a parent container with no graphics information.
		if (!this.shader)
			return;
		if ((this.shader.a_position !== undefined) && (!this.geometryData.vertexArray || this.geometryData.vertexArray.length == 0))
			return;	// nothing bound yet.

		var gl = this.gl;
		var shader = this.shader;
		var drawAsWireframe = this.isWireframe && !Object3D.useDepthShader && !Object3D.useSelectShader;
		
		// Find the correct shader to use. Depth shaders are used to view the depth buffer in RGB for snapping.
		// Select shaders are used to identify the selectionId of the object at a position for object picking.
		if (Object3D.useDepthShader) {
			if (!this.isSnappable)
				return;
			if (this.geometryData.drawType < 4 && this.geometryData.drawType != 0)
				return;	// Don't snap to lines (drawType 1,2,3). Allow snap to points (drawType 0)
			if (this.singleColor && this.singleColor.a < 0.7) 
				return;	// Don't snap to significantly transparent objects
			if (shader.u_showDepth == undefined)	// shaders with this flag handle the depth with this flag.
				shader = this.gl.shaders.get('depth');
		}
		else if (Object3D.useSelectShader) {
			if (this.singleColor && this.singleColor.a < 0.7)
				return;		// do not select transparent items. Allow selection of the objects through them.
			if (this.shader.name == 'voxels')
				return;		// voxel shader uses the depth buffer for selection and has no positions 
			if (this.texture)
				shader = this.gl.shaders.get('select_texture');		// prevents picking transparent pixels in the texture.
			else
				shader = this.gl.shaders.get('select');
		}
						
		gl.shaders.switchProgram(shader);
		
		if (shader.u_id !== undefined) {
			if (this.selectionId == null)
				gl.uniform4f(shader.u_id, 255, 255, 255, 255); // the 'no data' value for selection.
			else    // convert the integer into 4 8-bit floats that will fit inside a color. Max:  16,777,214 (2^24-2)
				gl.uniform4f(shader.u_id, Math.floor(this.selectionId / 65536) % 256 / 255, 
												  Math.floor(this.selectionId / 256) % 256 / 255, 
												  this.selectionId % 256 / 255, 1.0);		
		}

		if (!this.geometryData.isBound()) {
			this.bind(gl);		// Buffers not yet created
		}

		if (this.texture && !drawAsWireframe) {
			if (this.texture.isLoaded == false)
				return;		// Texture not yet available.  Draw nothing.
			this.texture.bind();
		}
				
		if (shader.a_position !== undefined) {
			if (drawAsWireframe) // Use the wireframe buffer if in wireframe mode.
				gl.bindBuffer(gl.ARRAY_BUFFER, this.geometryData.getWireframeVertexBuffer(gl));
			else 
				gl.bindBuffer(gl.ARRAY_BUFFER, this.geometryData.vertexBuffer);
			gl.vertexAttribPointer(shader.a_position, 3, gl.FLOAT, false /* normalize */, 0 /* stride to next */, 0 /* start offset */);
		}
		
		if (shader.u_transformMatrix !== undefined) {
			gl.uniformMatrix4fv(shader.u_transformMatrix, false, transform.e);
		}

		if (shader.name == 'master') {	 // new master shader
			if (this.geometryData.hasColors() && !drawAsWireframe) {
				gl.bindBuffer(gl.ARRAY_BUFFER, this.geometryData.colorBuffer);
				gl.vertexAttribPointer(shader.a_color, 4, gl.FLOAT, false, 0, 0);
				gl.enableVertexAttribArray(shader.a_color);
				gl.disableVertexAttribArray(shader.a_texCoord);
				gl.uniform1i(shader.u_colorMode, 1);
			}
			else if (this.geometryData.hasTextureCoords() && this.texture && !drawAsWireframe) {
				gl.bindBuffer(gl.ARRAY_BUFFER, this.geometryData.texCoordBuffer);
				gl.vertexAttribPointer(shader.a_texCoord, 2, gl.FLOAT, false, 0, 0);
				gl.uniform1i(shader.u_sampler, 0 /* bind number.  Would be greater for multitexturing */);
				gl.disableVertexAttribArray(shader.a_color);
				gl.enableVertexAttribArray(shader.a_texCoord);
				gl.uniform1i(shader.u_colorMode, 2);
			}
			else {	// single color
				if (this.singleColor)
					gl.uniform4f(shader.u_singleColor, this.singleColor.r, this.singleColor.g, this.singleColor.b, this.singleColor.a);
				else
					gl.uniform4f(shader.u_color, 0.5, 0.5, 0.5, 1.0);	// wireframe may not have a single color defined
				gl.disableVertexAttribArray(shader.a_color);
				gl.disableVertexAttribArray(shader.a_texCoord);
				gl.uniform1i(shader.u_colorMode, 0);
			}

			if (this.geometryData.hasNormals() && !drawAsWireframe) {
				gl.bindBuffer(gl.ARRAY_BUFFER, this.geometryData.normalBuffer);
				gl.vertexAttribPointer(shader.a_normal, 3, gl.FLOAT, false, 0, 0);
				gl.uniform1i(shader.u_useLighting, 1);
				gl.enableVertexAttribArray(shader.a_normal);		
			}
			else {
				gl.uniform1i(shader.u_useLighting, 0);
				gl.disableVertexAttribArray(shader.a_normal);		// not using normals
			}			
		}
		else {
			if (shader.a_color !== undefined) {
				gl.bindBuffer(gl.ARRAY_BUFFER, this.geometryData.colorBuffer);
				gl.vertexAttribPointer(shader.a_color, 4, gl.FLOAT, false, 0, 0);
			}

			if (shader.u_color !== undefined) {
				gl.uniform4f(shader.u_color, this.singleColor.r, this.singleColor.g, this.singleColor.b, this.singleColor.a);
			}
			
			if (shader.a_texCoord !== undefined) {
				gl.bindBuffer(gl.ARRAY_BUFFER, this.geometryData.texCoordBuffer);
				gl.vertexAttribPointer(shader.a_texCoord, 2, gl.FLOAT, false, 0, 0);
				gl.uniform1i(shader.u_sampler, 0 /* bind number.  Would be greater for multitexturing */);

				if (shader.u_fontColor != undefined && this.fontColor) {
					gl.uniform4f(shader.u_fontColor, this.fontColor.r, this.fontColor.g, this.fontColor.b, this.fontColor.a);  // If this attribute exists this Object3d should have a textColor property
				}
			}

			if (shader.u_showDepth !== undefined)
				gl.uniform1f(shader.u_showDepth, Object3D.useDepthShader);
		}

		// Z offset is used when 2 objects appear in the same place and one should be preferred. An example is text on a wall.
		if (this.useZOffset) {
			gl.enable(gl.POLYGON_OFFSET_FILL);
			gl.polygonOffset(-10, -1);
		}

		// Do the actual drawing.
		if (drawAsWireframe) {
			gl.drawArrays(1 /* GL.LINES */, 0, this.geometryData.numWireframeVerts);
		}
		else if (this.geometryData.indexBuffer != null) {
				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.geometryData.indexBuffer);
				gl.drawElements(this.geometryData.drawType, this.geometryData.indexArray.length, gl.UNSIGNED_SHORT, 0 /* start */);
		}
		else {
			gl.drawArrays(this.geometryData.drawType, 0, this.geometryData.numBoundVertices);
		}

		if (this.useZOffset) {
			gl.disable(gl.POLYGON_OFFSET_FILL);
		}
	}
	
	// -- I/O -------------------------------------------------------------------------

	// Implemtation of the interface in BinaryFile.
	writeBinary (file /* BinaryFile */) {
		file.writeVersion(2.1);

		Node3D.prototype.writeBinary.call(this, file);
		
		file.writeObject(this.geometryData);
		file.writeString(this.shaderName);	// 2.0
		file.writeObject(this.singleColor);
		file.writeInt(this.textureIndex);	// 2.0
		if (this.textureIndex == -1)
			file.writeObject(this.texture); // 1.1
		file.writeBoolean(this.isTransparent);	// 1.11

		return this;
	}

	readBinary (file, glContext /* opt */) {
		var version = file.readVersion();
		if (version < 2.0 || version > 2.0) {
			console.log("Unable to read object3D version: " + version);
			return null;
		}

		Node3D.prototype.readBinary.call(this, file);

		this.setGeometryData(file.readObject(GeometryData));	
		this.shaderName = file.readString();
		this.setColor(file.readObject(Color));
		this.textureIndex = file.readInt();
		if (this.textureIndex == -1) 
			this.setTexture(file.readObject(Texture, glContext));
		this.isTransparent = file.readBoolean();		
		
		if (glContext)
			this.updateShader();
		return file;
	}

	static readBinary (file /* BinaryFile */, glContext /* opt */) {
		var obj = new Object3D(glContext);
		obj.readBinary(file, glContext);
		return obj;
	}
};

BinaryFile.registerType(Object3D, BinaryFile._OBJECT3D);