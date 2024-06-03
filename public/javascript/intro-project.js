// intro-project.js
// - The main file for this intro project.
// - Original Author:		Matthew Hartloff 2023 	hartlomj@gmail.com

// - Internal dimensions are millimeters.
// - This file is mostly for delegating UI tasks.
// - Tab spacing is 3 characters.

import { createApp, ref } from '../scripts/vue.esm-browser.js'		// Vue
import { io } from '../scripts/socket.io.esm.min.js'		// Socket IO. Allows easy communication with the server
import Buefy from '../scripts/buefy.esm.js'			// Adds UI controls such as buttons and dialogs. https://buefy.org/documentation/
import Vector3 from './core/vector3.js'
import Color from './core/color.js'
import BBox3 from './core/bbox3.js'
import Renderer from './graphics/renderer.js'
import SimpleObjects from './graphics/simple-objects.js'
import BinaryFile from './util/binary-file.js'
import StlFile from './util/stl-file.js'
import Model from './model.js'
import Vector2 from './core/vector2.js'
import Canvas2D from './graphics/canvas-2d.js'
import CustomListbox from './util/custom-listbox.js'

// The dom element that produces the choose file dialog.
var fileSelector = document.createElement("INPUT");
fileSelector.type = "file";


// Information about each Model that may be displayed to the user. This represents the data that should be displayed to the user.
// We don't want the whole Model to be reactive because reactive elements have a performance penalty and should not include 
// large data structures like Models have.
class ModelInfo {
	constructor() {
		this.filename = '';
		this.numFacets = 0;
		this.dimensions = new Vector3();
		this.isSelected = false;
	}
	sync (model /* Model */) {
		this.filename = model.filename;
		this.numFacets = model.numFacets;
		this.dimensions.set(model.getDimensions());
		this.isSelected = model.isSelected;
	}
}

class IntroProject {
	// Called on page load
	constructor() {
		this.gl = null;				// WebGLContext. The context of the 3d renderer.
		this.renderer = null;		// Renderer. Controls the display of the 3d view.
		this.vue = null;				// Access to the vue methods and variables.

		this.models = [];				// Model[]. The stl models in the scene.
		
		// UI and Graphics
		this.localAxes = null;			// Object3D. The local axes of the selected object.
		this.selectedObject = null;	// Model. The selected model. Null if no obejct is selected.
		this.lastMousePos = new Vector2();	// The last registered mouse position over the renderer.

		// Server 
		this.socket = null;				// Socket. Used to communicate with the server.
		
		this.testObj = null;				// debug. Use this for whatever.
		this.testObjPos = new Vector3();	// debug

		this.initSocket();
		this.initUI();
		this.initGraphics();
	}


	// Initialize the reactive Vue component.
	initUI() {
		var self = this;

		var app = createApp({
			data() {
				return {
					// All reactive variables. When any of these change the DOM will update.
					activeTab: 			0,							// The tab index currently being displayed. 0=leftmost. 
					showModels: 		true,						// View the loaded models.
					serverText:			'no server message',
					testNumber:			0,

					// Models Tab
					transformType: 	1,							// 0: Translation, 1: Rotation, 2: Scale
					modelInfos: 		[],						// ModelInfo[]. UI information about the models. Parallel with models[].
					modelUnits: 		[],						// Units selected for each model. "mm" | "inches" | "meters". Parallel with modelInfos. For whatever reason, it's not responsive if units were within the modelInfo.
					modelIsVisible:	[],						// bool. Model is not visible on the screen. Parallel with modelInfos.

					// Test Tab
					testVar:				3,							// Just a test var for whatever.
				}
			},

			// computed: A way to have derived variables that are accessible from within html and this vue container.
			// These are accessed not as functions but as members. eg. (testComputed > 0)
			computed: {
				testComputed() { return 9+8 },
			},

			// Methods accessible from the html and within this vue container.
			methods: {
				// --- RENDERER --------------
				updateView() {
					self.renderer.needsRedraw = true;
				},

				// --- MODELS TAB ---------
				onModelRowClicked(rowIndex) {
					self.setSelected(self.models[rowIndex]);
				},
				// Called when the 'open stl' button is clicked.
				onLoadStl() {
					fileSelector.accept = ".stl";
					fileSelector.multiple = false;
					fileSelector.value = null;	// this allows the same file to be reselected and still fire the change event.

					fileSelector.onchange = function () {
						if (this.files.length == 0)
							return;
						self.loadModel(this.files[0]);	// obj files are defined as a combination of .obj, .mtl, and .png files.
					}
					fileSelector.click();
				},

				// translate the selected model
				translateModel(x, y, z) {
					if (self.selectedObject instanceof Model)
						self.selectedObject.translate(x, y, z);
					self.updateModelInfos();
				},

				// rotate the selected model around an axis
				rotateModel(x, y, z, degrees) {
					if (self.selectedObject instanceof Model)
						self.selectedObject.rotate(x, y, z, degrees);
					self.updateModelInfos();
				},

				scaleModel(factor) {
					if (self.selectedObject instanceof Model)
						self.selectedObject.scale(factor);
					self.updateModelInfos();
				},

				// The eyeball in a model row was clicked.
				onModelVisible (modelIndex) {
					this.modelIsVisible[modelIndex] = !this.modelIsVisible[modelIndex];
					self.models[modelIndex].setVisible(this.modelIsVisible[modelIndex]);
					self.needsRedraw = true;
				},

				// A model has changed units (eg mm to inches)
				onUnitChange (modelIndex) {
					self.models[modelIndex].setUnits(this.modelUnits[modelIndex]);
					self.updateModelInfos();
				},

				// A model was deleted from the models list.
				onDeleteModel(modelIndex) {
					self.models.splice(modelIndex, 1);
					self.updateModelInfos();
				},


				// --- TEST TAB -----------------

				// Test button is pressed. One way to send data - BinaryFile 
				onTest() {
					var file = new BinaryFile();
					file.writeFloat(32);
					file.writeFloat(90);
					self.socket.emit('test', file.getBuffer());	// Send a 'test' message to the server.
				},

				// Another way is to pass the values directly.
				onTest2() {
					self.test2();
				}
			},

			// Called when the reactive values change.
			watch: {
				activeTab: {	// user changes tabs
					handler(val) {
						console.log("Active tab is now " + val);
						self.renderer.needsRedraw = true;
					},
					deep: false		// just for example that a 'deep watch' can be done.
				},
				
				testVar: {
					handler(val) {
						console.log(`Test var is now ${val}`);
					}
				},
			},

			// Called after the vue component has finished being mounted.
			mounted() {
				var el = document.getElementById('vue-container');
				el.style.display = 'block';	// prevents the html from being displayed before vue has modified it.
				self.vue = this;
			}
		});

		app.use(Buefy);
		app.component("custom-listbox", CustomListbox);	// Make sure the components are registered before mounting.

		app.mount("#vue-container");


		// EVENT REGISTRATION

		// Load an stl by dropping it on the 3d view.
		var dropTarget = document.getElementById('view_canvas');
		dropTarget.addEventListener('drop', function (ev) {
			self.loadModel(ev.dataTransfer.files[0]);
		});

		// Prevent a dragged file from opening in a new window.
		document.addEventListener('dragover', function (ev) {
			ev.preventDefault();
			ev.stopPropagation();
		});
		document.addEventListener('drop', function (ev) {
			ev.preventDefault();
			ev.stopPropagation();
		});

	}


	// Initialize the hooks for the messages received from the server.
	initSocket() {
		this.socket = io("/", { 	// io is in the included script 'socket.io'
			transports: ['websocket'],
			reconnectionAttempts: 2
		});

		// Called when the connection is made by socket.io.
		this.socket.on("connect", () => {
			console.log("Connected to IntroProject Compute Server successfully");
		});

		// Called when socket.io detects an error.
		this.socket.on("error", (error) => {
			this.vue.simStatus.message = `Connection error: ${error}`;
			console.error("Error connecting to IntroProject Compute Server: " + error);
		})

		
		this.socket.on("test recieved", (buffer) => {
			var file = new BinaryFile(buffer);
			this.vue.serverText = file.readString();
		})

		this.socket.on("test2 received", (string) => {
			this.vue.serverText = string;
		})
	}
	
	// Initialize the graphics
	initGraphics () {
		var self = this;
		var viewCanvas = document.getElementById('view_canvas');		// Contains the selectable elements
		var container = document.getElementById('renderer_container')
		var containerSize = container.getBoundingClientRect();
		this.renderer = new Renderer(viewCanvas);
		this.renderer.setCanvasSize(containerSize.width - 10, containerSize.height - 10);
		this.renderer.setTrackballElement(document.getElementById("trackball_circle")); 	// The DOM element containing a circle that appears when rotating.
		this.renderer.onMouseUp = function (ev) { self.onRendererMouseUp(ev); }	// Called to snap the focus to the point at the cursor.
		this.renderer.onMouseDown = function (ev) { self.onRendererMouseDown(ev); }
		this.renderer.onMouseMove = function (ev) { self.onRendererMouseMove(ev); }
		this.renderer.onKeyDown = function (ev) { self.onRendererKeyDown(ev); }
		this.renderer.onRender = function () { self.render() };
		this.renderer.setDistance(30);					// Initial distance from the part.
		this.renderer.setForward(-0.168, 0.962, -0.213);		// starting view angle.
		//this.renderer.translateCamera(0,0,-5);
		this.renderer.setBackgroundColor(0.1, 0.1, 0.1);
		this.gl = this.renderer.getContext();

		// Initialize the local axes.
		var axisSize = 20.0, axisAlpha = 0.65;
		var verts = [0, 0, 0, axisSize, 0, 0, 0, 0, 0, 0, axisSize, 0, 0, 0, 0, 0, 0, axisSize];
		var colors = [1, 0, 0, axisAlpha, 1, 0, 0, axisAlpha, 0, 1, 0, axisAlpha, 0, 1, 0, axisAlpha, 0, 0, 1, axisAlpha, 0, 0, 1, axisAlpha];
		this.localAxes = SimpleObjects.createLines(this.gl, verts, colors);

		var size = 20;
		this.testObj = SimpleObjects.createBoxOutline(this.gl, new BBox3(new Vector3(-size / 2, -size / 2, -size / 2), new Vector3(size / 2, size / 2, size / 2)), new Color(200, 100, 100));
	}

	// debug function
	test() {
		var proj = this.projections[0];
		var result = new Array(2);
		var start = new Vector3(-10, 0, -3);
		var end = new Vector3(10, 0, -3);

		var tests = 1e9;
		var x;
		var now = performance.now();
		for (var i = 0; i < tests; i++) {
			x = Math.sqrt(24.486);
		}
		console.log(`Tests done in ${(performance.now() - now).toFixed(2)}ms.`);

		var now = performance.now();
		for (var i = 0; i < tests; i++) {
			x = 24.486 ** 0.5;
		}
		console.log(`Tests done in ${(performance.now() - now).toFixed(2)}ms.`);
	}

	test2() {
		this.socket.emit("test2", this.vue.testNumber);
	}

	resetAll () {
		// Cleanup graphics resources
		for (var model of this.models)
			model.cleanup();
		this.models = [];
		this.updateModelInfos();
	}

		
	/* --- MODELS ------------------------------------------------------ */

	clearModels() {
		this.models = [];
		this.vue.modelInfos = [];
		this.vue.modelUnits = [];
		this.vue.modelIsSubstrate = []
	}

	// Sync the UI info of the models with the loaded models. Should be called whenever the models change.
	updateModelInfos() {
		if (this.vue.modelInfos.length != this.models.length) {
			this.vue.modelInfos = [];
			this.vue.modelUnits = [];
			this.vue.modelIsSubstrate = [];
			this.vue.modelIsVisible = [];
		}
		this.vue.hasSubstrate = false;
		for (var i = 0; i < this.models.length; i++) {
			if (!this.vue.modelInfos[i])
				this.vue.modelInfos[i] = new ModelInfo();
			this.vue.modelInfos[i].sync(this.models[i]);
			this.vue.modelUnits[i] = this.models[i].units;
			this.vue.modelIsSubstrate[i] = this.models[i].isSubstrate ? '1' : '0';
			if (this.models[i].isSubstrate)
				this.vue.hasSubstrate = true;
			this.vue.modelIsVisible[i] = this.models[i].isVisible;
		}
	}

	// Load an stl file from the local drive and add it to the scene.
	// file		File		The file to load. Must be an STL file.
	loadModel(file) {
		var ext = file.name.split('.');
		ext = ext[ext.length - 1];
		if (ext.toLowerCase() != 'stl')
			return;
		var self = this;
		var stlFile = new StlFile(file, function () {
			//self.clearModels();		// Allow only one model for now.
			var model = new Model(stlFile);
			// Default the model to the center of the container
			model.setCenter(new Vector3(0, 0, 0));
			self.models.push(model);
			self.updateModelInfos();
			self.setSelected(model);
			self.renderer.needsRedraw = true;
		});
	}

	/* --- GUI ---------------------------------------- */

	// Set the object that is currently selected. Pass in null to clear the selection.
	// obj		number | Model | Projection	The object to set as selected or the selection id of the object.
	setSelected(obj) {
		// Clear the currently selected object
		if (this.selectedObject) {
			this.selectedObject.setSelected(false);
			this.selectedObject = null;
			this.updateModelInfos();
		}

		this.renderer.needsRedraw = true;

		if (obj === null)
			return;

		if (typeof obj == 'object') {
			this.selectedObject = obj;
		}
		else {	// A selection id was passed in. Find the object it belongs to.
			for (var model of this.models) {
				if (model.getSelectionId() == obj) {
					this.selectedObject = model;
					break;
				}
			}
		}
		if (!this.selectedObject)
			return;		// object had an id but it wasn't found.

		this.selectedObject.setSelected(true);

		if (this.selectedObject instanceof Model) {
			// If a model was selected display the local axes on the model. This helps with visualizing rotations.
			this.localAxes.setPosition(this.selectedObject.getBounds().getCenter());
			this.localAxes.setParent(this.selectedObject.getObject3d(this.gl));
			this.updateModelInfos();
		}
	}

	// Called when the mouse button is released while the renderer is focused.
	onRendererMouseUp(ev) {
		this.dragging = false;
	}

	// Called when the mouse button is pressed within the 3D view.
	onRendererMouseDown(ev) {
		if (ev.button == 0 /* left */) {
			var selectedId = this.renderer.getSelected(ev.x, ev.y);
			if (selectedId) {
				this.setSelected(selectedId);
				this.dragging = true;
			}
			else {
				this.setSelected(null);	// nothing selected 
			}

		}
	}

	onRendererMouseMove(ev) {
		if (this.dragging) {
			// Check if the user is dragging a model.
			if (this.selectedObject instanceof Model) {
				var camera = this.renderer.getCamera();
				var delta = new Vector3(ev.x, ev.y, 0);
				delta.sub(this.lastMousePos);
				delta.y = -delta.y;	// invert the y
				delta.mult(camera.distancePerPixel());
				camera.getRotationMatrix().apply(delta);
				this.selectedObject.translate(delta);
				this.renderer.needsRedraw = true;
			}
		}
		this.lastMousePos.set(ev.x, ev.y);
	}

	// Hotkey mapping. Called when a key is pressed while the 3D view has focus. 
	onRendererKeyDown(ev) {
		//console.log(ev.which);
		switch (ev.which) {
			case 46: {		// DEL
				break;
			}
			case 69: { // e: make objects solid, not wireframe
				// for (var model of this.models)
				// 	model.object3d.toSolid();
				// this.renderer.needsRedraw = true;
				break;
			}
			case 87: {	// w:  make objects wireframe
				// for (var model of this.models) 
				// 	model.object3d.toWireframe();
				// this.renderer.needsRedraw = true;
				break;
			}
			case 192: {	// ` (backtick): align to axis
				this.renderer.getCamera().alignToAxis();
				this.renderer.needsRedraw = true;
				break;
			}
		}
	}

	/* -- GRAPHICS --------------------------------------------- */


	// Called when the frame is ready to render. 
	render() {
		//Object3D.useDepthShader = true;		// uncomment to see what the depth shader is displaying 

		this.localAxes.setVisible(this.selectedObject instanceof Model && this.vue.transformType == 1);

		// Models
		if (this.vue.showModels) {
			for (var model of this.models) {
				model.render(this.gl, false /* transparent */);
			}
		}

		// Debugging
		if (this.testObj) {
			//this.testObj.setPosition(this.testObjPos);
			this.testObj.render();
		}
	}
}

// Main entry point. Called when the page is loaded.
addEventListener("load", function () {
	var proj = new IntroProject();
});

