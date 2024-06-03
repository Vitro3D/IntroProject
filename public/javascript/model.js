// model.js
// Defines an instance of geometry in the scene.

import Object3D from './graphics/object-3d.js'
import BBox3 from './core/bbox3.js'
import Vector3 from './core/vector3.js'
import Color from './core/color.js'
import Matrix from './core/matrix.js'
import StlFile from './util/stl-file.js'

var nextSelectionId = 100;	// start id. Selection ids are unique and their range should not overlap with other object types.

export default class Model {

	// stlFile		StlFile		opt. The stl geometry of the model.
	constructor (stlFile) {
		// Information that Vue will use for reporting to the user. Objects with a 
		// large amount of data like graphics should not be made reactive for performance reasons.
		this.filename = '';				// The original filename of the model (eg 'testpart.stl')
		this.numFacets = 0;				// Number of triangles in the model.
		this.bounds = new BBox3();		// The 3d extents of the original stl file this model was loaded from.	
		this.units = 'mm';				// The units used in the source stl. Note the stl file is unitless so this needs to be set manually.
		this.isSubstrate = false;		// If true, the model is a substrate for overmolding.
				
		this.object3d = null;		// Object3D. Graphical representation of the model.
		this.vertices = null;		// Float32Array. The verts representing the triangles. 9 values per triangle (xyzxyzxyz).
		this.normals = null;			// Float32Array. The normals parallel with vertices for graphics. 9 values per triangle (xyzxyzxyz).

		this.isSelected = false;			// The object is currently selected.
		this.isVisible = true;				// The object is currently visible within the 3d view.
		this.translation = new Vector3();
		this.rotTransform = new Matrix();
		this.scaleFactor = 1.0;
		this.transform = new Matrix();		// The current transform that should be applied to the vertices.
		this.color = new Color();
		this._updateColor();
		
		if (stlFile)
			this.fromStl(stlFile);
	}

	// Colors the models are displayed as.
	static stdColor = new Color(150, 200, 175);
	static substrateColor = new Color(130, 130, 130);
	static selectedColor = new Color(247, 238, 64);

	cleanup () { 
		if (this.object3d)
			this.object3d.cleanup();
	}

	// Set the model from a loaded stl file.
	// stlFile		StlFile			The loaded stlFile object.
	fromStl (stlFile) {
		if (!(stlFile instanceof StlFile)) {
			return;
		}
		stlFile.center();		// Set the center to 0,0,0. Makes scales and rotations more intuitive.
		this.filename = stlFile.filename;
		this.numFacets = stlFile.getNumFacets();
		this.bounds.set(stlFile.getBounds());
		this.vertices = stlFile.getVertices();
		this.normals = stlFile.getNormals();
		
	}

	// returns		Vector3		The current extent of the of the model. Used in the GUI.
	getDimensions () {
		var scale = this._getScale();
		var dim = new Vector3(this.bounds.extentX() * scale,
									 this.bounds.extentY() * scale,
									 this.bounds.extentZ() * scale);
		return dim;							 
	}

	// returns	BBox3		The bounds of the original stl before transforms
	getBounds () {
		return this.bounds;
	}

	// returns 	Float32Array
	getVertices () {
		return this.vertices;
	}

	// returns 	Matrix 	The current transform.
	getTransform () {
		return this.transform;
	}
	
	_updateColor () {
		this.color.set(this.isSelected ? Model.selectedColor : this.isSubstrate ? Model.substrateColor : Model.stdColor);
		if (this.object3d)
			this.object3d.setColor(this.color);
	}

	// unit		string	'mm' | 'inches' | 'meters'. The unit the verts should be interpreted as.
	setUnits (units) {
		if (units != 'mm' && units != 'inches' && units != 'meters')
			return;
		this.units = units;
		this._updateTransform();
	}

	// isSubstrate		bool		The model is a substrate for overmolding.
	setIsSubstrate (isSubstrate) {
		this.isSubstrate = !!isSubstrate;
		this._updateColor();
	}
	
	getSelectionId () {
		if (!this.object3d)
			return null;
		return this.object3d.getSelectionId();
	}

	setSelected (bool) {
		this.isSelected = bool;
		this._updateColor();
	}

	setVisible (bool) {
		this.isVisible = bool;
	}
	
	// translate (Vector3)
	// translate (x, y, z)
	translate (x, y, z) {
		this.translation.add(x, y, z);
		this._updateTransform();
	}

	// Rotate the model around an axis.
	// x,y,z		number		The axis to rotate around in model space.
	// degrees	number		The degrees CCW to rotate the model.
	rotate (x, y, z, degrees) {
		var vector = new Vector3(x, y, z);
		this.rotTransform.apply(vector);	// convert from world-space to model-space
		var radians = degrees / 57.2957795;
		this.rotTransform.rotate(vector, radians);
		this._updateTransform();
	}

	// Scale the model by a factor. A factor less than 1 will shrink the model.
	scale (factor) {
		if (factor == 0)
			return;
		this.scaleFactor *= factor;
		this._updateTransform();
	}

	// Get the total factor the model should be scaled by. Keep the user defined scaling and the
	// unit scaling seperate.
	_getScale () {
		var unitScale = 1.0;
		switch (this.units) {
			case 'inches': 	unitScale = 1.0 / 25.4; break;
			case 'meters':		unitScale = 1.0 / 1000; break;
		}
		return unitScale * this.scaleFactor;
	}

	_updateTransform () {
		this.transform.setToScale(this._getScale());
		this.transform.premultiply(this.rotTransform);
		this.transform.addTranslation(this.translation);
		if (this.object3d)
			this.object3d.setTransform(this.transform);
	}

	// Set the center of the model so it is at the passed point.
	// position		Vector3		The point that the model's center should be at.
	setCenter (position) {
		var center = this.bounds.getCenter();
		this.transform.apply(center);	// the current position of the center.
		center.subtract(position).reverse();
		this.translate(center);
	}

	// Set the bottom-center of the model to the passed point.
	setBottom (position) {
		var center = this.bounds.getCenter();
		center.z = this.bounds.minZ();
		center.subtract(position).reverse();
		this.translate(center);
	}

	// returns Object3D - The graphical representation of the model.
	getObject3d (glContext) {
		if (!this.object3d) {
			var obj = new Object3D(glContext);
			obj.setColor(this.color);
			obj.setVertices(this.vertices);
			obj.setNormals(this.normals);
			obj.setTransform(this.transform);
			obj.setSelectionId(nextSelectionId++);
			this.object3d = obj;
		}
		return this.object3d;
	}

	// Render the 3d object to the scene.
	// transparent		bool		opt, def=false. Render the object as transparent. Otherwise it will be solid.
	render (glContext, transparent) {
		if (!this.isVisible)
			return;
		var obj = this.getObject3d(glContext);
		obj.setAlpha(transparent ? 0.6 : 1.0);
		this.getObject3d(glContext).render();
	}

	/* --- I/O ------------------------------------- */

	writeBinary (file /* BinaryFile */) {
		var version = 1.1;
		file.writeVersion(version);

		file.writeString(this.filename);
		file.writeInt(this.numFacets);
		file.writeObject(this.bounds);
		file.writeString(this.units);
		file.writeFloatArray(this.vertices);
		file.writeFloatArray(this.normals);
		file.writeObject(this.translation);
		file.writeObject(this.rotTransform);
		file.writeFloat(this.scaleFactor);		
		file.writeBoolean(this.isSubstrate);	// 1.1
	}

	readBinary (file /* BinaryFile */) {
		var version = file.readVersion();
		if (version > 1.1) {
			console.log("Cannot read Model file version:" + version);
			return;
		}

		this.filename = file.readString();
		this.numFacets = file.readInt();
		this.bounds = file.readObject(BBox3);
		this.units = file.readString();
		this.vertices = file.readFloatArray();
		this.normals = file.readFloatArray();
		this.translation = file.readObject(Vector3);
		this.rotTransform = file.readObject(Matrix);
		this.scaleFactor = file.readFloat();
		if (version >= 1.1)
			this.isSubstrate = file.readBoolean();

		this._updateTransform();
		this._updateColor();
	}

	static readBinary (file /* BinaryFile */) {
		var obj = new Model();
		obj.readBinary(file);
		return obj;
	}
}