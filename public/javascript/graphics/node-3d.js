// node-3d.js
// A node in the render tree. Object3D is a subclass of Node3D which has geometry
// associated with them. Nodes without geometry are useful for instances when geometries
// have a common inherited transform.

import Vector3 from '../core/vector3.js';
import Matrix from '../core/matrix.js';
import BinaryFile from '../util/binary-file.js';
import Quaternion from '../core/quaternion.js';
import TransformStack from './transform-stack.js';

var _xVec = new Vector3(), _forwardVec = new Vector3(), _upVec = new Vector3();
var _matrix = new Matrix();
var _quat = new Quaternion();
	
var transformStack = new TransformStack();	// The main render state for displaying tree structures.

export default class Node3D {
	
	constructor () {
		this.name = '';
		this.id = -1;		// integer. Used to identify nodes that are linked when serialized. -1 = no id.
		this._isVisible = true;		// Determines if this object and its children be displayed.

		// TSR components (translation, scale, rotation)
		this.forward = new Vector3(0, 1, 0);	// Vector3. Local Y Axis. The forward direction of the object (the local y+ axis).
		// Vector3. Local Z axis. The up direction of the object. Note the term 'up' for object is 'toward the sky' (z axis) while 
		// for cameras the term 'up' is the top of the screen (y axis).
		this.upVec = new Vector3(0, 0, 1);		
		this.position = new Vector3(0, 0, 0);	// Vector3. Translation of the object.  
		this.scaleFactor = new Vector3(1, 1, 1);		// Scale the geometry by this amount in xyz

		this.transform = new Matrix();
		this.rotTransform = new Matrix();		// The rotation transform. For use with normals
		this.invTransform = new Matrix();
		this.transformNeedsUpdate = false;
		this.transformCache = new Map();			// Node3D->Matrix. Cache transforms that are frequently requested by the animations.

		this.parent = null;			// A root node would have no parent
		this.children = [];			// Node3D
	}
	
	// Makes a shallow copy of this node and its children. Geometry will still reference the same data.
	// Called from object3d. Probably needs to be reworked.
	// other		Node3D	opt. Populates this value instead of creating a new one.
	clone (other) {
		if (!other)
			other = new Node3D();
		other.name = this.name;
		other.id = this.id;

		other.forward.set(this.forward);
		other.upVec.set(this.upVec);
		other.position.set(this.position);
		other.scaleFactor.set(this.scaleFactor);
		other.transformNeedsUpdate = true;
		
		for (var i = 0; i < this.children.length; i++) {
			var newChild = this.children[i].clone();
			other.children.push(newChild);
			newChild.parent = other;
		}
		return other;
	}
	
	setName (name) {
		this.name = name;
	}

	getName () {
		return this.name;
	}

	setId (id) {
		this.id = id;
	}

	getId () {
		return this.id;
	}

	// If a parent node is not visible, all child nodes will not be visible.
	setVisible (visible) {
		this._isVisible = visible;
	}

	isVisible () {
		return this._isVisible;
	}

	/* -- TSR (translation/scale/rotation) ------------------------- */

	getPosition () {
		return this.position;
	}

	// Set the object's center position.
	// setPosition(Vector2 | Vector3), setPosition(x, y [, z])
	setPosition (xOrVec, y, z) {
		this.position.set(xOrVec, y, z);
		this.transformNeedsUpdate = true;
	};

	// translate(Vector2 | Vector3), translate(x, y [, z])
	translate (xOrVec, y, z) {
		this.position.add(xOrVec, y, z);
		this.transformNeedsUpdate = true;
	};

	getForward () {
		return this.forward;
	}

	// Set the forward vector which is the local y+ axis.
	// setForward(Vector3), setForward(x,y,z)
	setForward (xOrVec /* Vector3 or number */, y, z) {
		_forwardVec.set(xOrVec, y, z);
		if (_forwardVec.x == 0 && _forwardVec.y == 0 && _forwardVec.z == 0)
			return;		// null vectors will just cause chaos
		this.forward.set(_forwardVec);
		// Make upVec and forward orthoganol and normalized
		this.forward.cross(this.upVec, _xVec);	
		if (_xVec.length() < 0.0001) {
			this.upVec.x += 0.00012;	this.upVec.y += 0.00815;	this.upVec.z -= 0.000158478;	// some pseudo random number
			this.forward.cross(this.upVec, _xVec);	
		}
		_xVec.cross(this.forward, this.upVec);	
		this.upVec.normalize();
		this.forward.normalize();
		this.transformNeedsUpdate = true;
	};

	getUpVec () {
		return this.upVec;
	}
		
	// Set the up vector, which is the local z+ axis.
	// setUpVec(Vector3), setUpVec(x, y, z)
	setUpVec (xOrVec, y, z) {
		_upVec.set(xOrVec, y, z);
		if (_upVec.length() == 0)
			return;			// null vectors just cause chaos.
		this.upVec.set(_upVec);
		// Make sure upVec and forward orthoganol and normalized
		this.upVec.cross(this.forward, _xVec);
		if (_xVec.length() < 0.0001)	{	// upvec and forward are the same. Alter the forward slightly
			this.forward.x += 0.00012; this.forward.y += 0.002100; this.forward.z += 0.00023;
			_upVec.cross(this.forward, _xVec);
		}
		_xVec.cross(this.upVec, this.forward);
		this.upVec.normalize();
		this.forward.normalize();
		this.transformNeedsUpdate = true;
	};

	setZVec (xOrVec, y, z) {
		this.setUpVec(xOrVec, y, z);
	}

	setUp (xOrVec, y, z) {
		this.setUpVec(xOrVec, y, z);
	}

	// Rotate the node along the passed vector
	// x,y,z		number		The vector to rotate around. It does not need to be normalized.
	// angle		radians		Amount to rotate the object CCW.
	rotate (x, y, z, angle) {
		_matrix.setToRotation(x, y, z, angle);
		_matrix.applyToVector(this.position);
		_matrix.applyToVector(this.forward);		
		_matrix.applyToVector(this.upVec);			
		this.forward.normalize();
		this.upVec.normalize();
		this.transformNeedsUpdate = true;
	}

	// Set the rotation from a quaternion, where w is the constant value.
	setFromQuaternion (w, x, y, z) {
		_quat.set(w, x, y, z);
		_quat.toMatrix(_matrix);
		this.setRotation(_matrix);
	}

	// Set the rotation from a Matrix.
	setRotation (matrix) {
		this.upVec.set(matrix.getZAxisH());
		this.forward.set(matrix.getYAxisH())
		this.upVec.normalize();
		this.forward.normalize();
		this.transformNeedsUpdate = true;
	}

	getScale () {
		return this.scaleFactor;
	}
	
	// Scale the object. Scaling is applied before rotation and translation.
	// setScale(scalar), setScale(Vector3), setScale(x, y, z)
	setScale (xOrVec, y, z) {
		if (xOrVec instanceof Vector3)
			this.scaleFactor.set(xOrVec);
		else {
			this.scaleFactor.set(xOrVec, y ? y : xOrVec, z ? z : xOrVec);
		}
		this.transformNeedsUpdate = true;
	}

	// Change the current scaling of the object by the passed factor. eg. scale(2) doubles the size.
	// No value should be 0.
	// scale(scalar), scale(Vector3), scale(x,y,z)
	scale (x, y, z) {
		if (x instanceof Vector3) {	y = x.y; z = x.z; x = x.x;		}
		if (y === undefined)		  {	y = x; 	}
		if (z === undefined)		  {	z = x; 	}
		this.scaleFactor.set(x * this.scaleFactor.x, y * this.scaleFactor.y, z * this.scaleFactor.z);
		this.transformNeedsUpdate = true;
	}


	/* --- TRANSFORMS ------------------------	*/

	getTransform () {
		if (this.transformNeedsUpdate)
			this._updateTransform();
		return this.transform;
	}
	
	getInverseTransform () {
		if (this.transformNeedsUpdate)
			this._updateTransform();
		return this.invTransform;
	};

	getRotationTransform () {
		if (this.transformNeedsUpdate)
			this._updateTransform();
		return this.rotTransform;
	}

	setTransform (matrix) {
		this.transform.set(matrix);
	}

	setTransform (matrix) {
		matrix.decompose(this.position, _xVec, this.forward, this.upVec, this.scaleFactor);	// z up, y forward.
		this.transformNeedsUpdate = true;
	}
	
	// Premultiply the current transform by the passed transform.
	applyTransform (matrix) {
		if (this.transformNeedsUpdate)
			this._updateTransform();
		this.transform.premultiply(matrix);
		this.transform.decompose(this.position, _xVec, this.forward, this.upVec, this.scaleFactor);	// z up, x forward.
		this.transformNeedsUpdate = true;
	}

	// Get the transform of this object along with all parent objects. This will not be accurate
	// for objects that are jointed.
	getWorldTransform (result) {
		if (!result)
			result = new Matrix();
		result.set(this.getTransform());
		var node = this;
		while(node.parent) {
			result.premultiply(node.parent.getTransform());
			node = node.parent;
		}
		return result;
	}
	
	// Get the transform to a parent node, but not including the parent node. Cached for speed. 
	// Specifically used for animations.
	getTransformToParent (parentNode) {
		if (!parentNode || parentNode == this.parent) {
			if (this.transformNeedsUpdate)
				this._updateTransform();
			return this.transform;
		}

		if (this.transformCache.has(parentNode)) {
			return this.transformCache.get(parentNode);
		}
		// Calculate the new transform
		var m = new Matrix();
		var node = this;
		m.set(this.getTransform());
		while (node.parent && node.parent != parentNode) {
			node = node.parent;
			m.premultiply(node.getTransform());
		}
		this.transformCache.set(parentNode, m);		
		return m;
	}

	// update the transform from the forward and up vecs
	_updateTransform () {
		if (!this.transformNeedsUpdate)
			return;

		// update the rotation transform
		this.rotTransform.setFromZYVectors(this.upVec, this.forward);

		// update the standard transform
		this.transform.setToScale(this.scaleFactor);
		this.transform.premultiply(this.rotTransform);
		this.transform.addTranslation(this.position.x, this.position.y, this.position.z);	// same as multiplying by a translation matrix, but probably faster.
		
		// update the inverted transform
		this.transform.inverted(this.invTransform);
		this.transformNeedsUpdate = false;
	}
		
	/* -- TREE ------------------------------------- */

	isRoot () {
		return !this.parent;
	}

	// Returns Node3D: The root node of this tree.
	getRoot () {
		var root = this;
		while (root.parent) 
			root = root.parent;
		return root;
	}

	hasChildren () {
		return this.children.length > 0;
	}

	// returns Node3D[]. 
	getChildren () {
		return this.children;
	}

	// Add a child object to this node in the tree.
	// obj		Node3D		The child to add.
	addChild (obj) {
		obj.parent = this;
		this.children.push(obj);
	}

	// Set the children of this node to the passed nodes. Removes existing children.
	// objs		iterable collection of Node3D. 	The children to add.
	setChildren (objs) {
		for (var i=0; i < this.children; i++) 
			this.children[i].parent = null;
		this.children = [];
		for (var child of objs) 
			this.addChild(child);
	}

	// Set this node's parent, removing the previous parent.
	// obj		Node3D	The node to set as the parent.
	setParent (obj) {
		if (this.parent) {
			this.parent.removeChild(this);
		}
		if (obj) {
			obj.addChild(this);
		}
	}

	// Remove a child from this node. Returns true if the node was found and removed.
	removeChild (obj) {
		var index = this.children.indexOf(obj);
		if (index != -1) {
			this.children[index].parent = null;
			this.children.splice(index, 1);
			return true;
		}
		return false;
	}

	// Returns null if no descendant is found.
	findChild (id) {
		if (this.id == id)
			return this;
		var node = null;
		for (var child of this.children) {
			node = child.findChild(id);
			if (node)
				return node;
		}
		return null;
	}

	// Returns true if there is a descendant node with the passed node id.
	isDecendantOf (id) {
		var node = this;
		while (node.parent) {
			if (node.parent.id == id)
				return true;
			node = node.parent;
		}
		return false;
	}
	
	// Returns Node3D - A node that is a descendant of the root with this id.
	getNode (nodeId) {
		var root = this.getRoot();
		var node = root.findChild(nodeId);
		return node;
	}

	// Private recursive function used in getRenderNodes()
	_getRenderNodes (nodes /* Object3D[] */) {
		if (this.gl !== undefined) // determine if it's an Object3D by checking gl.
			nodes.push(this);
		for (var child of this.children)
			child._getRenderNodes(nodes);
	}

	// Returns Object3D[] - All child objects (including this one) that are Object3D type.
	getRenderNodes () {
		var nodes = [];
		this._getRenderNodes(nodes);
		return nodes;
	}

	/* -- Graphics functions that require recursive calls through the tree ----------- */

	// Make sure the whole tree get the context set even if some nodes don't care.
	setContext (glContext) {
		if (this._setContext)
			this._setContext(glContext);
		for (var child of this.children) 
			child.setContext(glContext);
	}

	// Make sure the whole tree is sent the cleanup message even if some nodes don't care.
	cleanup () {
		if (this._cleanup)
			this._cleanup();
		for (var child of this.children) 
			child.cleanup();
	}
	
	// Set the shader of this object. If recursive is true, set all children to this shader as well.
	setShader (name, recursive) {
		if (this._setShader)
			this._setShader(name);
		if (recursive) {
			for (var child of this.children) 
				child.setShader(name, true);
		}
	}

	// Convert a 3D object rendered as triangles to wireframe
	toWireframe () {
		if (this._toWireframe)
			this._toWireframe();
		for (var child of this.children)
			child.toWireframe();	
	}

	// Convert a LINES object that was converted to wireframe into solid triangles.
	toSolid () {
		if (this._toSolid)
			this._toSolid();
		for (var child of this.children)
			child.toSolid();	
	}

	// Set the single color value for this tree.
	// setColor(Color)
	// setColor(r, g, b, a)		may be 0-1 or 0-255.
	setColor (rOrColor, g, b, a) {
		if (this._setColor)
			this._setColor(rOrColor, g, b, a);
		for (var child of this.children)
			child.setColor(rOrColor, g, b, a);	
	}

	// Set the alpha value.
	// a 		float		0-1. The new alpha value of the object. 0=transparent, 1=solid.
	setAlpha (a) {
		if (this._setAlpha)
			this._setAlpha(a);
		for (var child of this.children)
			child.setAlpha(a);	
	}

	// Get the number of facets as a sum of all the facets in the child nodes.
	getNumFacetsTree () {
		var numFacets = 0;
		if (this.getNumFacets) 
			numFacets = this.getNumFacets();
		for (var child of this.children)
			numFacets += child.getNumFacetsTree();
		return numFacets;
	}

	// Get the number of 3d objects in this tree, this node inclusive. Objects have 3d geometry.
	getNumObjects () {
		var numObjects = 0;
		if (this.getContext !== undefined)
			numObjects++;
		for (var child of this.children)
			numObjects += child.getNumObjects();
		return numObjects;
	}

	// Set the selection id of the Object3D returned from Renderer.getSelected(). Objects with a null 
	// id are not selectable.
	// propogate		bool		opt, def=true. Set the id to all it's decendents.
	setSelectionId (id, propogate) {
		if (this._setSelectionId)
			this._setSelectionId(id);
		if (propogate !== false) {
			for (var child of this.children)
				child.setSelectionId(id, true);
		}
	}
	
	// Set selectionId in nodes of this subtree to their node id.
	setSelectionIdToNodeId () {
		if (this._setSelectionId)
			this._setSelectionId(this.id);
		for (var child of this.children)
			child.setSelectionIdToNodeId();
	}
		
	// Main render function. Render this node and its child nodes.
	// transparent		bool			false=render only solid objects. true=render only transparent objects.
	_renderNode (transparent) {
		if (this._isVisible == false)
			return;
		
		transformStack.push();
		transformStack.multiply(this.getTransform());

		if (this._render) {
			if ((transparent === undefined) || (transparent == this.isTransparent))
				this._render(transformStack.getTransform()); 
		}
		for (var i = 0; i < this.children.length; i++) {
			this.children[i]._renderNode(transparent);
		}

		transformStack.pop();
	}

	renderTransparent () {
		this._renderNode(true);
	}

	renderSolid () {
		this._renderNode(false);
	}

	render() {
		this._renderNode(false);
		this._renderNode(true);
	}

	// Recursive function for getBoundingBox(). Maintains a matrix state.
	_getBoundingBox (result) {
		if (!this._isVisible)
			return;	// do not include geometry in the tree that is not visible.
		if (this._objBoundingBox)
			this._objBoundingBox(result)
		for (var i = 0; i < this.children.length; i++) {
			this.children[i]._getBoundingBox(result);
		}
	}

	// Implementation of the BinaryFile interface.
	writeBinary (file /* BinaryFile */) {
		
		file.writeVersion(1.0);

		file.writeString(this.name);
		file.writeInt(this.id);

		file.writeObject(this.forward);
		file.writeObject(this.upVec);
		file.writeObject(this.position);
		file.writeObject(this.scaleFactor);

		file.writeObjectArraySC(this.children);
		return this;
	}

	readBinary (file /* BinaryFile */) {
		var version = file.readVersion();
		if (version < 1.0 || version > 1.0) {
			console.log("Unable to read Node3D version: " + version);
			return file;
		}

		this.name = file.readString();
		this.id = file.readInt();

		this.forward = file.readObject(Vector3);
		this.upVec = file.readObject(Vector3);
		this.position = file.readObject(Vector3);
		this.scaleFactor = file.readObject(Vector3);
		this.transformNeedsUpdate = true;

		this.children = file.readObjectArraySC();
		for (var child of this.children)
			child.parent = this;
		return file;
	}

	static readBinary (file /* BinaryFile */) {
		var obj = new Node3D();
		obj.readBinary(file);
		return obj;
	}
}

BinaryFile.registerType(Node3D, BinaryFile._NODE3D);

