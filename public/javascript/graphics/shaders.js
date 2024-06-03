// shaders.js
// - Defines the shaders in glsl (GL shader language).

import Vector3 from '../core/vector3.js';
import MathExt from '../core/math-ext.js';
import Color from '../core/color.js';
		
var MAX_DIRECTIONAL_LIGHTS = 3;
var MAX_POSITIONAL_LIGHTS = 3;
var MAX_SPOTLIGHTS = 4;

var _c = new Color();
var _dir = new Vector3();


// Vertex shader code for the lighting model
var VSLightsDefines = `
	uniform mediump int	u_useLighting;	// 0/1. Should the lighting be used. If not, it will not be shaded.	
	//attribute vec3 a_normal;				// Disable this attribute if not using lighting.	
		
	// positional lights
	uniform mediump int  u_positionalOn[${MAX_POSITIONAL_LIGHTS}];
	uniform vec3 u_positionalPos[${MAX_POSITIONAL_LIGHTS}];	// world location of each light

	// spotlights
	uniform mediump int  u_spotlightOn[${MAX_SPOTLIGHTS}];
	uniform vec3 u_spotlightPos[${MAX_SPOTLIGHTS}];	// world location of each light
	uniform vec3 u_spotlightDirs[${MAX_SPOTLIGHTS}];
	uniform float u_spotlightCutoffStart[${MAX_SPOTLIGHTS}];	// cutoff angle from the center as a cosine fo the angle. ie 20deg = 0.939. Angle were the light is 1.
	uniform float u_spotlightCutoffEnd[${MAX_SPOTLIGHTS}];	// cutoff angle from the center where the light is 0.

	// outputs
	varying vec3 v_normal;
	varying vec3 v_posLightDirs[${MAX_POSITIONAL_LIGHTS}];		// direction the light is coming from
	varying float v_posLightAtten[${MAX_POSITIONAL_LIGHTS}];
	varying vec3 v_spotlightDirs[${MAX_SPOTLIGHTS}];
	varying float v_spotlightAtten[${MAX_SPOTLIGHTS}];
`
		
// ref: https://gamedev.stackexchange.com/questions/56897/glsl-light-attenuation-color-and-intensity-formula
// Vertex shader for the lighting system. Computes the light directions and attenuations of the positional lights and spotlights
// The following variable must have been defined in the shader:
//	 pos			vec4		The position in world space (ie u_transformMatrix * a_position)
//	 transform	mat4		The world transform (not the view transform) used for rotating the normal.
//	 a_normal	vec3		The normal attribute of this vertex
var VSLightsBody = `
	
	if (u_useLighting == 1) {
		//mat3 rotTransform = mat3(transform);
		//vec3 normal = rotTransform * a_normal;

		v_normal = normalize(mat3(transform) * vec3(a_normal));
		
		// Positional lights
		for (int i=0; i < ${MAX_POSITIONAL_LIGHTS}; i++) {
			if (u_positionalOn[i] == 0)
				break;
			vec3 lightDir = u_positionalPos[i] - vec3(pos); 
			float distance = length(lightDir);
			v_posLightDirs[i] = normalize(lightDir);
			v_posLightAtten[i] = 1.0 / (1.0 + distance * 0.1 + distance * distance + 0.01); // common formula for light dropoff in computer graphics. 
		}

		// Spotlights
		for (int i = 0; i < ${MAX_SPOTLIGHTS}; i++) {
			if (u_spotlightOn[i] == 0)
				break;
			vec3 lightDir = u_spotlightPos[i] - vec3(pos);
			v_spotlightDirs[i] = normalize(lightDir);

			// Attenuation due to angle
			float dot = dot(v_spotlightDirs[i], u_spotlightDirs[i]); 
			if (dot < u_spotlightCutoffEnd[i]) {
				v_spotlightAtten[i] = 0.0;		// outside cone of light
				continue;
			}
			else if (dot < u_spotlightCutoffStart[i]) {
				v_spotlightAtten[i] = (dot - u_spotlightCutoffEnd[i]) / (u_spotlightCutoffStart[i] - u_spotlightCutoffEnd[i]);
			}
			else {
				v_spotlightAtten[i] = 1.0;
			}
			
			// Attenuation due to distance
			float distance = length(lightDir);
			v_spotlightAtten[i] = v_spotlightAtten[i] * (1.0 / (1.0 + distance * 0.1 + distance * distance * 0.01));	
		}
	}
`

// fragment shader code for the lighting model
var FSLightsDefines = `
	uniform mediump int	u_useLighting;
	uniform vec3 u_ambientColor;

	uniform mediump int	u_directionalOn[${MAX_DIRECTIONAL_LIGHTS}];
	uniform vec3 			u_directionalColors[${MAX_DIRECTIONAL_LIGHTS}];
	uniform vec3 			u_directionalDirs[${MAX_DIRECTIONAL_LIGHTS}];

	uniform mediump int  u_positionalOn[${MAX_POSITIONAL_LIGHTS}];	// need mediump because by default the precision is different between fragment and vertex shaders.
	uniform vec3 			u_positionalColors[${MAX_POSITIONAL_LIGHTS}];
	uniform mediump int  u_spotlightOn[${MAX_SPOTLIGHTS}];
	uniform vec3 			u_spotlightColors[${MAX_SPOTLIGHTS}];

	varying vec3 	v_normal;
	varying vec3 	v_posLightDirs[${MAX_POSITIONAL_LIGHTS}];		// direction the light is coming from
	varying float 	v_posLightAtten[${MAX_POSITIONAL_LIGHTS}];		// factors to multiply by for distance from source. (0-1)
	varying vec3 	v_spotlightDirs[${MAX_SPOTLIGHTS}];				// direction the light is coming from
	varying float 	v_spotlightAtten[${MAX_SPOTLIGHTS}];				
`

// creates 'color'. Requires normal, origColor.
var FSLightsBody = `
	vec3 color;
	if (u_useLighting == 1) {
		// Ambient light
		color = origColor.rgb * u_ambientColor;
	
		// Directional lights
		for (int i=0; i < ${MAX_DIRECTIONAL_LIGHTS}; i++) {
			if (u_directionalOn[i] == 0)	
				break;
			float dotA = max(dot(u_directionalDirs[i], v_normal), 0.0);
			color = color + (origColor.rgb * u_directionalColors[i] * dotA);
		}

		// Positional lights
		for (int i=0; i < ${MAX_POSITIONAL_LIGHTS}; i++) {
			if (u_positionalOn[i] == 0)
				break;
			//if (v_posLightAtten[i] < 0.01)
			//	continue;
			float dotA = max(dot(v_posLightDirs[i], v_normal), 0.0);
			color = color + (u_positionalColors[i] * origColor.rgb * (dotA * v_posLightAtten[i]));
		}

		// Spotlights
		for (int i=0; i < ${MAX_SPOTLIGHTS}; i++) {
			if (u_spotlightOn[i] == 0)
				break;
			if (v_spotlightAtten[i] < 0.01)
				continue;
			float dotA = max(dot(v_spotlightDirs[i], v_normal), 0.0);
			color = color + (u_spotlightColors[i] * origColor.rgb * (dotA * v_spotlightAtten[i]));
		}
	}
	else {
		color = origColor.rgb;
	}
`

		
// Master shader. In most instances, this general purpose shader is the one to use.
var MASTER_VERTEX_SHADER = `
	// MASTER VERTEX SHADER
	precision mediump float;
	attribute vec4 a_position;
	attribute vec4 a_color;			// enable only when colormode = 1
	attribute vec2 a_texCoord;		// enable only when colormode = 2
	attribute vec3 a_normal;		// Disable this attribute if not using lighting.	
	
	uniform mat4 u_transformMatrix;
	uniform mat4 u_viewMatrix;
	uniform mediump int u_colorMode;	// 0: single color using u_singleColor. 1: color buffer using a_color. 2: texture
	uniform vec4 u_singleColor;		// used when colormode = 0
	uniform mediump int u_useFog;		// 1: Apply fog to the scene.
	${VSLightsDefines}

	varying vec4 v_color;
	varying vec2 v_texCoord;
	varying vec4 v_position;
	
	void main()  {
		mat4 transform;
		transform = u_transformMatrix;
		vec4 pos = transform * a_position;
								
		if (u_colorMode == 0) 
			v_color = u_singleColor;		// single color
		else if (u_colorMode == 1)
			v_color = a_color;		// per-vertex color
		else
			v_texCoord = a_texCoord;	// texture

		${VSLightsBody}
		gl_Position = u_viewMatrix * pos;
		v_position = gl_Position;
	}
`
// General purpose fragment shader that is paired with the master vertex shader. 
var MASTER_FRAGMENT_SHADER = `
	// MASTER FRAGMENT SHADER
	precision mediump float;
	uniform mediump int u_colorMode;	// 0: single color using u_singleColor. 1: color buffer.  2: texture
	uniform sampler2D u_sampler;	// texture index
	// Fog
	uniform mediump int u_useFog;		// 1: apply fog to the scene.
	uniform vec3 u_fogColor;
	uniform float u_maxFog;				// 0-1. 1=totally opaque at u_maxFogDistance
	uniform float u_maxFogDistance;	// distance in which u_maxFog will occur.

	${FSLightsDefines}
	varying vec4 v_color;
	varying vec2 v_texCoord;
	varying vec4 v_position;			// The view position of the fragment.

	void main()  {
		vec4 origColor;
		if (u_colorMode == 2)
			origColor = texture2D(u_sampler, v_texCoord);
		else
			origColor = v_color;
		
		${FSLightsBody}
		
		
		if (u_useFog == 1) {
			// v_position.z in perspective is the z distance from the camera. This value is divided by w. In ortho it's -1 to 1.
			// smoothstep: maps the result of the third param two params to 0 and 1, where 0=the first param and 1=the second. The transition is smooth.
			// minFogDistance = 0.8
			float param = smoothstep(0.8, u_maxFogDistance, pow(v_position.z, 1.1)) * u_maxFog;
			color = mix(color, u_fogColor, param);		// z is the distance from the camera in z.
			if (origColor.a > 0.05)
				origColor.a = max(origColor.a, param);		// prevents transparent object from being visible in the fog.
		}
		gl_FragColor = vec4(color, origColor.a);
	
		if (gl_FragColor.a < 0.1)
			discard;			// do not allow almost clear pixels to enter the depth buffer.
	}`

	
/* -- FONT SHADER ----------------------------- */

// Simple shader for text which uses a texture containing the letters. It is not affected by lighting.
var FONT_VS =  `
	precision mediump float;
	attribute vec4 a_position;
	attribute vec2 a_texCoord;
	uniform mat4 u_viewMatrix;
	uniform mat4 u_transformMatrix;
	varying vec2 v_texCoord;

	void main()  {
		gl_Position = u_viewMatrix * u_transformMatrix * a_position;
		v_texCoord = a_texCoord;
	}`
	
// The object using this shader must have a 'u_fontColor' property.
var FONT_FS = `
	precision mediump float;
	uniform sampler2D u_sampler;
	uniform vec4 u_fontColor;
	varying vec2 v_texCoord;
	void main()  {
		vec4 color = u_fontColor;
		color.a = color.a * texture2D(u_sampler, v_texCoord).r;	// Font is saved in greyscale.
		if (color.a < 0.0)
			discard; 
		gl_FragColor = color;
	}`

/* --- DEPTH SHADERS -------------------------------------- */

// Depth shaders output to the color buffer the z depth of the pixel.
// Shader used to convert the depth buffer value into a color. Used for finding the position of a point at a pixel.
var DEPTH_VS = `
		precision mediump float;
		attribute vec4 a_position;
		uniform mat4 u_transformMatrix;
		uniform mat4 u_viewMatrix;
		varying vec4 v_pos; 
		
		void main()  {
		gl_Position = u_viewMatrix * u_transformMatrix * a_position;
		v_pos = gl_Position; 
}`

// Places the depth of the pixel in the RGB color. 
var DEPTH_FS = `
	precision mediump float;
	float sampleZ; 
	varying vec4 v_pos; 
	
	void main()  {
		sampleZ = (v_pos.z + 1.0) / 2.0 * 255.0; 		// map z value from -1 to 1 => 0 to 255.
		gl_FragColor = vec4(floor(sampleZ) / 255.0,
									fract(sampleZ),
									1, 1);		// if we wanted higher precision we could probably figure these out.
	}`

		
/* --- SELECTION SHADERS ----------------------------------------- */

// Selection buffers output to the color buffer the ID of the object that owns the pixel.
// Shader used to select objects with a number. 
var SELECT_VS = `
	precision mediump float;
	attribute vec4 a_position;
	uniform mat4 u_transformMatrix;
	uniform mat4 u_viewMatrix;
				
	void main()  {
		gl_Position = u_viewMatrix * u_transformMatrix * a_position;
	}`

// The color will be output the ID as the color with the most significant digits in the red.
var SELECT_FS = `
	precision mediump float;
	uniform vec4 u_id; 
				
	void main()  {
		gl_FragColor = u_id; 
	}`

var SELECT_TEXTURE_VS = `
	precision mediump float;
	attribute vec4 a_position;
	attribute vec2 a_texCoord;
	uniform mat4 u_transformMatrix;
	uniform mat4 u_viewMatrix;
	varying vec2 v_texCoord;
				
	void main()  {
		gl_Position = u_viewMatrix * u_transformMatrix * a_position;
		v_texCoord = a_texCoord;
	}`

// Do not render textures with no alpha. This will prevent these pixels from being selected.
// The color will be the id of of the object.
var SELECT_TEXTURE_FS = `
	precision mediump float;
	uniform sampler2D u_sampler;
	uniform vec4 u_id; 
	varying vec2 v_texCoord;

	void main()  {
		vec4 pixColor = texture2D(u_sampler, v_texCoord);
		if (pixColor.a < 0.1)
			discard;
		gl_FragColor = u_id; 
	}`

	
export default class Shaders {

	constructor (glContext)
	{
		this.gl = glContext,
		this.numActiveAttribs = 0,		// Number of attributes currently active in the gl system.
		this.shaders = [];				// WebGLProgram[] + variable locations + name. All the available shaders.
		this.shaderMap = new Map();	// string => shader. For easily identifying and retrieving shaders. Shaders are serialized by name.
		
		this.init();
	}

	// Identifing shaders by id are used when serializing objects.
	addShader (shader, name /* string */) {
		this.shaderMap.set(name, shader);
		shader.name = name;
		this.shaders.push(shader);
	}

	init () {
		var gl = this.gl;


		var addLightVars = function (shader) {
			shader.u_useLighting = gl.getUniformLocation(shader, 'u_useLighting');
			shader.u_ambientColor = gl.getUniformLocation(shader, 'u_ambientColor');	
			
			shader.u_directionalOn = new Array(MAX_DIRECTIONAL_LIGHTS);
			shader.u_directionalColors = new Array(MAX_DIRECTIONAL_LIGHTS);
			shader.u_directionalDirs = new Array(MAX_DIRECTIONAL_LIGHTS);
			for (var i=0; i < MAX_DIRECTIONAL_LIGHTS; i++) {
				shader.u_directionalOn[i] = gl.getUniformLocation(shader, 'u_directionalOn[' + i + ']');
				shader.u_directionalColors[i] = gl.getUniformLocation(shader, 'u_directionalColors[' + i + ']');
				shader.u_directionalDirs[i] = gl.getUniformLocation(shader, 'u_directionalDirs[' + i + ']');
			}

			shader.u_positionalOn = new Array(MAX_POSITIONAL_LIGHTS);
			shader.u_positionalPos = new Array(MAX_POSITIONAL_LIGHTS);
			shader.u_positionalColors = new Array(MAX_POSITIONAL_LIGHTS);
			for (var i = 0; i < MAX_POSITIONAL_LIGHTS; i++) {
				shader.u_positionalOn[i] = gl.getUniformLocation(shader, 'u_positionalOn[' + i + ']');
				shader.u_positionalPos[i] = gl.getUniformLocation(shader, 'u_positionalPos[' + i + ']');
				shader.u_positionalColors[i] = gl.getUniformLocation(shader, 'u_positionalColors[' + i + ']');
			}

			shader.u_spotlightOn = new Array(MAX_SPOTLIGHTS);
			shader.u_spotlightPos = new Array(MAX_SPOTLIGHTS);
			shader.u_spotlightDirs = new Array(MAX_SPOTLIGHTS);
			shader.u_spotlightCutoffStart = new Array(MAX_SPOTLIGHTS);
			shader.u_spotlightCutoffEnd = new Array(MAX_SPOTLIGHTS);
			shader.u_spotlightColors = new Array(MAX_SPOTLIGHTS);
			for (var i = 0; i < MAX_SPOTLIGHTS; i++) {
				shader.u_spotlightOn[i] = gl.getUniformLocation(shader, 'u_spotlightOn[' + i + ']');
				shader.u_spotlightPos[i] = gl.getUniformLocation(shader, 'u_spotlightPos[' + i + ']');
				shader.u_spotlightDirs[i] = gl.getUniformLocation(shader, 'u_spotlightDirs[' + i + ']');
				shader.u_spotlightCutoffStart[i] = gl.getUniformLocation(shader, 'u_spotlightCutoffStart[' + i + ']');
				shader.u_spotlightCutoffEnd[i] = gl.getUniformLocation(shader, 'u_spotlightCutoffEnd[' + i + ']');
				shader.u_spotlightColors[i] = gl.getUniformLocation(shader, 'u_spotlightColors[' + i + ']');
			}
		}

		// General shader with colors per vertex, normals and lighting.
		var master_shader = _createProgram(gl, MASTER_VERTEX_SHADER, MASTER_FRAGMENT_SHADER);
		master_shader.a_position = gl.getAttribLocation(master_shader, 'a_position');
		master_shader.a_color = gl.getAttribLocation(master_shader, 'a_color');
		master_shader.a_normal = gl.getAttribLocation(master_shader, 'a_normal');
		master_shader.a_texCoord = gl.getAttribLocation(master_shader, 'a_texCoord');
		master_shader.u_colorMode = gl.getUniformLocation(master_shader, 'u_colorMode');
		master_shader.u_singleColor = gl.getUniformLocation(master_shader, 'u_singleColor');
		master_shader.u_sampler = gl.getUniformLocation(master_shader, 'u_sampler');
		master_shader.u_transformMatrix = gl.getUniformLocation(master_shader, 'u_transformMatrix');
		master_shader.u_viewMatrix = gl.getUniformLocation(master_shader, 'u_viewMatrix');
		master_shader.u_useFog = gl.getUniformLocation(master_shader, 'u_useFog');
		master_shader.u_fogColor = gl.getUniformLocation(master_shader, 'u_fogColor');
		master_shader.u_maxFog = gl.getUniformLocation(master_shader, 'u_maxFog');
		master_shader.u_maxFogDistance = gl.getUniformLocation(master_shader, 'u_maxFogDistance');
		addLightVars(master_shader);
		this.gl.useProgram(master_shader);
		gl.uniform1i(master_shader.u_useFog, 0);	// by default, do not use fog.
		this.addShader(master_shader, 'master');

		
		// Note: The font shaders require the property fontColor (Color) to be present on the 3d object.
		var font = _createProgram(gl, FONT_VS, FONT_FS);
		font.a_position = gl.getAttribLocation(font, 'a_position');
		font.a_texCoord = gl.getAttribLocation(font, 'a_texCoord');
		font.u_sampler = gl.getUniformLocation(font, 'u_sampler');
		font.u_fontColor = gl.getUniformLocation(font, 'u_fontColor');
		font.u_viewMatrix = gl.getUniformLocation(font, 'u_viewMatrix');
		font.u_transformMatrix = gl.getUniformLocation(font, 'u_transformMatrix');
		this.addShader(font, 'font');

		// Depth shaders are for retrieving the depth value in the buffer. Used for finding the actual position of a visible point on the screen
		var depth = _createProgram(gl, DEPTH_VS, DEPTH_FS);
		depth.a_position = gl.getAttribLocation(depth, 'a_position');
		depth.u_viewMatrix = gl.getUniformLocation(depth, 'u_viewMatrix');
		depth.u_transformMatrix = gl.getUniformLocation(depth, 'u_transformMatrix');
		this.addShader(depth, 'depth');
		
		// Selection shaders are used for determining the object rendered on a pixel for picking.
		var select = _createProgram(gl, SELECT_VS, SELECT_FS);
		select.a_position = gl.getAttribLocation(select, 'a_position');
		select.u_viewMatrix = gl.getUniformLocation(select, 'u_viewMatrix');
		select.u_transformMatrix = gl.getUniformLocation(select, 'u_transformMatrix');
		select.u_id = gl.getUniformLocation(select, 'u_id');
		this.addShader(select, 'select');

		var select_texture = _createProgram(gl, SELECT_TEXTURE_VS, SELECT_TEXTURE_FS);
		select_texture.a_position = gl.getAttribLocation(select_texture, 'a_position');
		select_texture.a_texCoord = gl.getAttribLocation(select_texture, 'a_texCoord');
		select_texture.u_sampler = gl.getUniformLocation(select_texture, 'u_sampler');
		select_texture.u_viewMatrix = gl.getUniformLocation(select_texture, 'u_viewMatrix');
		select_texture.u_transformMatrix = gl.getUniformLocation(select_texture, 'u_transformMatrix');
		select_texture.u_id = gl.getUniformLocation(select_texture, 'u_id');
		this.addShader(select_texture, 'select_texture');

		//console.log("Shaders created in " + (Date.now() - now) + "ms");
	};
	
	cleanup () {
		for (var shader of this.shaders) {
			this.gl.deleteShader(shader);
		}
		this.shaders = [];
	}

	setViewMatrix (viewMatrix) {
		for (var shader of this.shaders) {
			this.gl.useProgram(shader);
			this.gl.uniformMatrix4fv(shader.u_viewMatrix, false /* transpose (must be false) */, viewMatrix);
		}
		return;
	};


	// Update the shaders that have lighting parameters with the information from the lighting object.
	updateLighting (lighting /* Lighting */) {
		for (var shader of this.shaders) {
			if (!shader.u_ambientColor)
				continue;	// no lighting in this shader.

			this.gl.useProgram(shader);
			
			// Ambient
			_c.set(lighting.ambient.color);
			_c.mult(lighting.ambient.intensity);	// multiply by intensity
			this.gl.uniform3f(shader.u_ambientColor, _c.r, _c.g, _c.b);
			
			// Directional
			for (var i=0; i < MAX_DIRECTIONAL_LIGHTS; i++) {
				if (i < lighting.directionals.length) {
					this.gl.uniform1i(shader.u_directionalOn[i], 1);
					var light = lighting.directionals[i];
					_c.set(light.color);
					_c.mult(light.intensity);
					_dir.set(light.direction);
					this.gl.uniform3f(shader.u_directionalColors[i], _c.r, _c.g, _c.b);
					this.gl.uniform3f(shader.u_directionalDirs[i], _dir.x, _dir.y, _dir.z);
				}
				else {
					this.gl.uniform1i(shader.u_directionalOn[i], 0);
				}
			}
						
			// Positional 
			for (i=0; i < MAX_POSITIONAL_LIGHTS; i++) {
				if (i < lighting.positionals.length) {
					this.gl.uniform1i(shader.u_positionalOn[i], 1);
					var light = lighting.positionals[i];
					_c.set(light.color);
					_c.mult(light.intensity);
					this.gl.uniform3f(shader.u_positionalPos[i], light.position.x, light.position.y, light.position.z);
					this.gl.uniform3f(shader.u_positionalColors[i], _c.r, _c.g, _c.b);
				}
				else {
					this.gl.uniform1i(shader.u_positionalOn[i], 0);
				}
			}

			// Spotlights
			for (i=0; i < MAX_SPOTLIGHTS; i++) {
				if (i < lighting.spotlights.length) {
					this.gl.uniform1i(shader.u_spotlightOn[i], 1);
					var light = lighting.spotlights[i];
					_c.set(light.color);
					_c.mult(light.intensity);
					this.gl.uniform3f(shader.u_spotlightPos[i], light.position.x, light.position.y, light.position.z);
					this.gl.uniform3f(shader.u_spotlightDirs[i], light.direction.x, light.direction.y, light.direction.z);
					this.gl.uniform1f(shader.u_spotlightCutoffStart[i], Math.cos(MathExt.degToRad(light.cutoffAngle)));
					this.gl.uniform1f(shader.u_spotlightCutoffEnd[i], Math.cos(MathExt.degToRad(light.cutoffAngle + 5)));
					this.gl.uniform3f(shader.u_spotlightColors[i], _c.r, _c.g, _c.b);
				}
				else {
					this.gl.uniform1i(shader.u_spotlightOn[i], 0);
				}
			}
		}
	}

	// useFog		bool			Fog should be applied to the scene. Initially it is false.
	// fogColor		Color			The color of the fog at max. 
	// maxFog		0-1			The maximum opacity of the fog which occurs at maxFogDistance. 0=no fog. 1=opaque fog.
	// maxFogDistance meters	The distance at which maxFog occurs.
	setFog (useFog, fogColor, maxFog, maxFogDistance) {
		var shader = this.get("master");
		this.gl.useProgram(shader);
		this.gl.uniform1i(shader.u_useFog, useFog ? 1 : 0);
		if (fogColor)
			this.gl.uniform3f(shader.u_fogColor, fogColor.r, fogColor.g, fogColor.b);
		if (maxFog != undefined)
			this.gl.uniform1f(shader.u_maxFog, maxFog);
		if (maxFogDistance != undefined)
			this.gl.uniform1f(shader.u_maxFogDistance, maxFogDistance);
	}
	
	// Returns GlShaderProgram: The shader with the passed name or null if the shader does not exist.
	get (name /* string */) {
		if (this.gl == null)
			return null;	// not initialized.		
		var shader = this.shaderMap.get(name);
		if (!shader)
			return null;
		return shader;	
	}
		
	// Change the shader program currently in use.
	// from: http://www.mjbshaw.com/2013/03/webgl-fixing-invalidoperation.html
	// Ensures extra attributes are not enabled which would cause an openGl error.
	switchProgram (program)  {
		var gl = this.gl;
		var newActiveAttribs = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);

		if (newActiveAttribs != this.numActiveAttribs) {
			for (var i = 0; i < newActiveAttribs; i++)
				gl.enableVertexAttribArray(i);
			for (var i = newActiveAttribs; i < this.numActiveAttribs; i++)
				gl.disableVertexAttribArray(i);	
			this.numActiveAttribs = newActiveAttribs;
		}
		
		gl.useProgram(program);
	}
		

};

// Returns WebGLShader - The new shader compiled from the passed code.
// gl			WebGLContext		The context to create the shader into.
// type		gl.VERTEX_SHADER | gl.FRAGMENT_SHADER		The type of shader
// source	string				The GLSL code to compile into a shader.
function _loadShader(gl, type, source) {
	// Create shader object
	var shader = gl.createShader(type);
	if (shader == null) {
		console.log('unable to create shader');
		return null;
	}

	gl.shaderSource(shader, source);

	// Compile the shader
	gl.compileShader(shader);

	// Check the result of compilation
	var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
	if (!compiled) {
		var error = gl.getShaderInfoLog(shader);
		console.log('Failed to compile shader: ' + error);
		gl.deleteShader(shader);
		return null;
	}

	// const message = gl.getShaderInfoLog(shader);
	// console.log("Shader msg: " + message);
	
	return shader;
}

// Returns WebGLProgram - The vertex/fragment shader program that is loaded into memory and made available for use.
// gl			WebGLContext	The webgl context to create the program into.	
// vshader	WebGLShader		The compiled vertex shader to attach to the program
// fshader	WebGLShader		The compiled fragment shader to attach to the program.
function _createProgram(gl, vshader, fshader) {
	// Create shader object
	var vertexShader = _loadShader(gl, gl.VERTEX_SHADER, vshader);
	var fragmentShader = _loadShader(gl, gl.FRAGMENT_SHADER, fshader);
	if (!vertexShader || !fragmentShader) {
		return null;
	}

	// Create a program object
	var program = gl.createProgram();
	if (!program) {
		return null;
	}

	// Attach the shader objects
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);

	// Link the program object
	gl.linkProgram(program);

	// Check the result of linking
	var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
	if (!linked) {
		var error = gl.getProgramInfoLog(program);
		console.log('Failed to link program: ' + error);
		gl.deleteProgram(program);
		gl.deleteShader(fragmentShader);
		gl.deleteShader(vertexShader);
		return null;
	}
	return program;
}
