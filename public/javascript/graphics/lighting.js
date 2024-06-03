// lighting.js
// Defines lighting in a 3d scene. 
// Intensity for each light is from 0 to 1. The color of the object is multiplied by the sum of the factors
// of all lights relevant to that point. A sum over 1 will supersaturate a surface.

import Vector3 from '../core/vector3.js';
import Color from '../core/color.js';


// The base light in the scene that is visible even in the absense of other lights.
class AmbientLight {
	constructor (color, intensity) {
		this.color = color ? color : new Color(1, 1, 1);
		this.intensity = intensity !== undefined ? intensity : 0.7;			// 0-1
	}

	setColor (color) {
		this.color.set(color);
	}

	setIntensity (intensity) {
		this.intensity = Math.min(1.0, Math.max(0.0, intensity));
	}
}
	

// A light emitting light from an infitinite distance such as the sun.
class DirectionalLight {
	constructor (direction, intensity, color) {
		this.direction = direction ? direction.normalized() : new Vector3(-1, 0, 1);		// The direction the light is coming from
		this.color = color ? color : new Color(1, 1, 1);
		this.intensity = intensity !== undefined ? intensity : 0.4;			// 0-1
	}

	setColor (color) {
		this.color.set(color);
	}

	setIntensity (intensity) {
		this.intensity = Math.min(1.0, Math.max(0.0, intensity));
	}

	// The direction the light is coming from.
	setDirection (direction) {
		this.direction.set(direction);
		this.direction.normalize();
	}
}

	
// A light with a point position emitting light in every direction.
class PositionalLight {
	// intensity		0-1
	constructor (position, intensity, color) {
		this.position = position ? position.clone() : new Vector3(0, 0, 0);		// The direction the light is coming from
		this.color = color ? color : new Color(1, 1, 1);
		this.intensity = intensity !== undefined ? intensity : 0.8;			// 0-1
	}

	setColor (color) {
		this.color.set(color);
	}

	setIntensity (intensity) {
		this.intensity = Math.min(1.0, Math.max(0.0, intensity));
	}

	setPosition (position) {
		this.position.set(position);
	}

	writeBinary (file /* BinaryFile */) {
		file.writeObject(this.position);
		file.writeObject(this.color);
		file.writeFloat(this.intensity);
	}

	readBinary (file /* BinaryFile */) {
		file.readObject(this.position);
		file.readObject(this.color);
		this.intensity = file.readFloat();
	}

	static readBinary (file) {
		var obj = new PositionalLight();
		obj.readBinary(file);
		return obj;
	}
}


// A light with a point position, direction and cutoff.
class Spotlight {
	constructor (position, direction, cutoffAngle, intensity, color) {
		this.position = position ? position.clone() : new Vector3(0, 0, 0);		// The direction the light is coming from
		this.direction = direction ? direction.normalized() : new Vector3(0, 1, 0);
		this.cutoffAngle = cutoffAngle ? cutoffAngle : 20;		// degrees from the center which the spotlight quickly attenuates.
		this.color = color ? color : new Color(1, 1, 1);
		this.intensity = intensity !== undefined ? intensity : 0.8;			// 0-1
	}

	setPosition (position) {
		this.position.set(position);
	}

	setDirection (direction) {
		this.direction.set(direction);
		this.direction.normalize();
	}

	setCutoffAngle (angle /* degrees */) {
		this.cutoffAngle = angle;
	}

	setColor (color) {
		this.color.set(color);
	}

	setIntensity (intensity) {
		this.intensity = Math.min(1.0, Math.max(0.0, intensity));
	}

	writeBinary (file /* BinaryFile */) {
		file.writeObject(this.position);
		file.writeObject(this.direction);
		file.writeFloat(this.cutoffAngle);
		file.writeObject(this.color);
		file.writeFloat(this.intensity);
	}

	readBinary (file /* BinaryFile */) {
		file.readObject(this.position);
		file.readObject(this.direction);
		this.cutoffAngle = file.readFloat();
		file.readObject(this.color);
		this.intensity = file.readFloat()
	}

	static readBinary (file) {
		var obj = new Spotlight();
		obj.readBinary(file);
		return obj;
	}
}

	
export default class Lighting {
	constructor () {
		// Note: These members are accessed directly in shaders.js		
		this.ambient = new AmbientLight();
		this.directionals = [];			// DirectionalLight[]
		this.positionals = [];			// PositionalLight[]
		this.spotlights = [];			// Spotlight
	};
	
	getAmbientLight () {
		return this.ambientLight;
	}
		
	// Set the ambient light of the scene.  Intensity between 0 and 1.
	setAmbientLight (intensity, color) {
		this.ambient.setIntensity(intensity);
		if (color)
			this.ambient.setColor(color);
	};

	// returns DirectionalLight - The directional light added to the scene.
	addDirectionalLight (direction, intensity, color) {
		var light = new DirectionalLight(direction, intensity, color);
		this.directionals.push(light);
		return light;
	};

	// returns PositionalLight - Add a positional light to the scene which has no attenuation by distance.
	// Positional lights have a location but no direction.
	// position			Vector3		The location of the light.
	// intensity		0-1			The brightness of the light. 
	// color				Color			The color of the light.
	addPositionalLight (position, intensity, color) {
		var light = new PositionalLight(position, intensity, color);
		this.positionals.push(light);
		return light;
	}

	// returns Spotlight. Add a spotlight to the scene. Spotlights are not attenuated by distance but
	// are by angle.
	// position		Vector3		The location of the light
	// direction	Vector3		The direction the spotlight is pointing.
	// cutoff		number		degrees. The angle from the direction which the light will no longer shine.
	addSpotlight (position, direction, cutoff, intensity, color) {
		var light = new Spotlight(position, direction, cutoff, intensity, color);
		this.spotlights.push(light);
		return light;
	}

	// light		DirectionalLight | PositionalLight | SpotLight		The light to remove from the scene.
	removeLight (light) {
		var index = this.directionals.indexOf(light);
		if (index != -1) {
			this.directionals.splice(index, 1);
			return;
		}
		index = this.positionals.indexOf(light);
		if (index != -1) {
			this.positionals.splice(index, 1);
			return;
		}
		index = this.spotlights.indexOf(light);
		if (index != -1) {
			this.spotlights.splice(index, 1);
			return;
		}
	}

	// Update the shaders with the current lighting data.
	updateShaders (shaders) {
		shaders.updateLighting(this);
	};

	/* --- I/O ------------------------------------------------ */

	// Implementation of the BinaryFile interface so lighting can be written to a file.
	writeBinary (file /* BinaryFile */) {
		var version = 1.0;			// Any version before this is no longer valid.
		file.writeVersion(version);

		// Ambient
		file.writeObject(this.ambient.color);
		file.writeFloat(this.ambient.intensity);

		// Directional
		file.writeObject(this.directional.direction);
		file.writeObject(this.directional.color);
		file.writeFloat(this.directional.intensity);

		// Positional
		file.writeInt(this.positionals.length);
		for (var light of this.positionals) 
			file.writeObject(light);
		
		// Spotlights
		file.writeInt(this.spotlights.length);
		for (light of this.spotlights) 
			file.writeObject(light);

		return this;
	}

	// Objects		Node3D[]			The object tree(s) that contain the nodes that the animations will control
	readBinary (file /* BinaryFile */) {
		var version = file.readVersion();
		if (version < 1.0 || version > 1.0)  {
			console.error("Unable to read Lighting version: " + version);
			return this;
		}

		// Ambient
		file.readObject(this.ambient.color);
		this.ambient.intensity = file.readFloat();

		// Directional
		file.readObject(this.directional.direction);
		file.readObject(this.directional.color);
		this.directional.intensity = file.readFloat();

		// Positional
		var numLights = file.readInt();
		if (numLights !== this.positionals.length) {
			this.positionals = [];
			for (var i = 0; i < numLights; i++) 
				this.positionals.push(file.readObject(PositionalLight));
		}
		else {
			for (var i = 0; i < numLights; i++) 
				file.readObject(this.positionals[i]);	// overwrite/update the existing lights
		}

		// Spotlights
		numLights = file.readInt();
		if (numLights !== this.spotlights.length) {
			this.spotlights = [];
			for (var i = 0; i < numLights; i++) 
				this.spotlights.push(file.readObject(Spotlight));
		}
		else {
			for (var i = 0; i < numLights; i++) 
				file.readObject(this.spotlights[i]);	// overwrite/update the existing lights
		}

		return this;
	}

	static readBinary (file) {
		var obj = new Lighting();
		obj.readBinary(file);
		return obj;
	}
	
};