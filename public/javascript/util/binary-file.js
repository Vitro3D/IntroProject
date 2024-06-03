// binary-file.js
// - Implements the saving and loading of objects as sequential binary data.
// - Everything is BIG ENDIAN
// 
// To write basic objects to a stream use the appropriate function:
//  writeFloat(number), readFloat()
//  writeInt(number), readFloat()
//  writeIntArray(number[]), readIntArray()
//
// To write objects to a stream, implement the following functions in a class:
//  writeBinary (BinaryFile)
//  static readBinary (BinaryFile)
// 
// Write and read objects to a stream with:
//  binaryFile.writeObject(object)
//  obj = binaryFile.readObject(Object Type)   eg. file.readObject(Vector3)
//
// Optionally, the objects can be written without the need for knowing the object type if the object type has
// been registered with registerType(). Example:
//  Matrix.js: registerType(Matrix, BinaryFile._MATRIX)
//
// Writing and reading these objects is done with:
//  binaryFile.writeObjectDynamic(object)
//  obj = binaryFile.readObjectDynamic()		- no need to pass the type. The type was written to the stream.

var isClient = typeof window !== 'undefined' && window == globalThis;
if (!isClient) {	
	var util = await import('util');
	var TextEncoder = util.TextEncoder;
	var TextDecoder = util.TextDecoder;
	var fs = await import('fs') //require('fs', null);		// without the 2nd argument it will result in an error on the client. Not sure why this works.
}

// When the buffer needs to be enlarged, use these values.
var bufferSizes = [512, 1024, 2048, 4096, 8192, 16384, 32768, 65536, 131072, 262144, 524288, 1048576, 2097152, 4194304, 
							 8388608 /* 8MB */, 16777216, 33554432, 67108864, 134217728, 268435456 /* 256 MB */, 357913942, 
							 536870912 /* 512 MB */, 805306368 /* 768 MB */];

// Returns the size of the buffer needed if the file was the passed size in bytes.
var getBufferSize = function (minSize) {
	if (!minSize)
		return bufferSizes[0];

	for (var i = 0; i < bufferSizes.length; i++) {
		if (bufferSizes[i] > minSize) {
			return bufferSizes[i];
		}
	}
	console.error("Requested buffer size too big (" + minSize + ")!");		// Protect against some crazy size request
	return null;
}
	

export default class BinaryFile {
	// BinaryFile (initialSize)
	//		initialSize		int 	 	opt, def=1024. Create a binary file with an initial size. The buffer will be enlarged as necessary.
	// BinaryFile (arrayBuffer)
	//		arrayBuffer		ArrayBuffer | Uint8Array	Create a binary file with the passed array buffer.  Generally for reading.
	constructor (sizeOrBuffer) {
		this.loadedSize = null;
		if (sizeOrBuffer instanceof ArrayBuffer) {
			this.arrayBuffer = sizeOrBuffer;
			this.loadedSize = this.arrayBuffer.byteLength;
		}
		else if (sizeOrBuffer instanceof Uint8Array) {
			if (sizeOrBuffer.byteOffset) {		// This is a NodeJS Buffer object.
				this.arrayBuffer = sizeOrBuffer.buffer.slice(sizeOrBuffer.byteOffset, sizeOrBuffer.byteOffset + sizeOrBuffer.length);
			}
			else {		// This is read from file
				this.arrayBuffer = sizeOrBuffer.buffer;
			}
			this.loadedSize = this.arrayBuffer.byteLength;
		}
		else if (typeof sizeOrBuffer == 'number') {
			this.arrayBuffer = new ArrayBuffer(getBufferSize(sizeOrBuffer));
		}
		else {
			this.arrayBuffer = new ArrayBuffer(getBufferSize(100));
		}
		
		this.dataView = new DataView(this.arrayBuffer);
		this.pos = 0;		// Position in the file of the last byte of data.
	}

	// Type registration. Allows the object type to be written to the stream. When read the type will be known so the 
	// calling read function does not have to know what type it is explicity. Useful if the type of object is not determinate.
	static typeToId = new Map();			// Class(function) -> int
	static idToType = new Map();			// int -> Class(function)
	
	// Ids must not be larger than 65535 and must be unique.
	// eg. BinaryFile.registerType(Node3D, _NODE3D) (once Node3D is defined - like at the end of the file)
	// List the unique ids here to indicate that they are taken.
	static _NODE3D = 1;
	static _OBJECT3D = 2;
	static _VECTOR2 = 3;
	static _VECTOR3 = 4;
	static _COLOR = 5;
	static _MATRIX = 6;
	static registerType (type, id) {
		BinaryFile.typeToId.set(type, id);
		BinaryFile.idToType.set(id, type);
	}

	// Returns the size of the buffer which may not be the size of the valid data.
	length () {
		return this.arrayBuffer.byteLength;
	}

	// Get the current byte position in the stream. Useful for saving a marker you may want to come back to.
	getPosition () {
		return this.pos;
	}

	// Set the byte position in the stream for the next read.
	setPosition (pos) {
		this.pos = pos;
	}

	// Returns the ArrayBuffer containing the data for the file.
	getBuffer () {
		return this.arrayBuffer.slice(0, this.pos);		// truncate the unused data from the end.
	}

	// The size of the loaded buffer or the number of bytes written to the buffer. This will
	// return an incorrect result if the position has been manually changed.
	getSize () {
		if (this.loadedSize)
			return this.loadedSize;
		return this.getPosition();	// Buffer used for writing.
	}

	// Prepares the buffer to hold the passed number of bytes.  If the buffer is too small to 
	// store it, the buffer will be enlarged.
	_prepBuffer (bytes) {
		var reqSize = this.pos + bytes;

		if (reqSize < this.arrayBuffer.byteLength)
			return;		// it's fine.

		// Enlarge the array to the next size.
		var newSize = getBufferSize(reqSize);
		if (!newSize)
			return;		// too big

		//if (this.arrayBuffer.resizable) {
		//	this.arrayBuffer.resize(newSize);	// new Chrome functionality 3-23. All buffers seem to not be resizable however.
		//}
		//else {
			var newBuffer = new ArrayBuffer(newSize);
			var newView = new Uint8Array(newBuffer);
			var oldView = new Uint8Array(this.arrayBuffer);
			for (var j = 0; j < this.pos; j++) {
				newView[j] = oldView[j];		// fastest way to copy.  100MB takes about .2 seconds
			}
			this.arrayBuffer = newBuffer;
			this.dataView = new DataView(this.arrayBuffer);
		//}
		
		//console.log("Buffer size increased to " + newSize);
		return;
	}

	_writeInt (val, numBytes, signed) {
		if (!signed) {
			switch (numBytes) {
				case 1: this.dataView.setUint8(this.pos, val); this.pos++; break;
				case 2: this.dataView.setUint16(this.pos, val, false); this.pos += 2; break;
				case 4: this.dataView.setUint32(this.pos, val, false); this.pos += 4; break;
				case 8: this.dataView.setBigUint64(this.pos, BigInt(val), false); this.pos += 8; break;	// note BigInt is only recently browser compatible.
			}
		}
		else {
			switch (numBytes) {
				case 1: this.dataView.setInt8(this.pos, val); this.pos++; break;
				case 2: this.dataView.setInt16(this.pos, val, false); this.pos += 2; break;
				case 4: this.dataView.setInt32(this.pos, val, false); this.pos += 4; break;
				case 8: this.dataView.setBigInt64(this.pos, BigInt(val), false); this.pos += 8; break;
			}
		}
	}

	_readInt (numBytes, signed) {
		var val = null;
		if (!signed) {
			switch (numBytes) {
				case 1: val = this.dataView.getUint8(this.pos); this.pos++; break;
				case 2: val = this.dataView.getUint16(this.pos, false); this.pos += 2; break;
				case 4: val = this.dataView.getUint32(this.pos, false); this.pos += 4; break;
				case 8: val = Number(this.dataView.getBigUint64(this.pos, false)); this.pos += 8; break;	// BigInt. For some reason the dataview jumps to bigint for 64 bit numbers even though Number is 64 bits.
			}
		}
		else {
			switch (numBytes) {
				case 1: val = this.dataView.getInt8(this.pos); this.pos++; break;
				case 2: val = this.dataView.getInt16(this.pos, false); this.pos += 2; break;
				case 4: val = this.dataView.getInt32(this.pos, false); this.pos += 4; break;
				case 8: val = Number(this.dataView.getBigInt64(this.pos, false)); this.pos += 8; break;	// BigInt
			}
		}
		return val;
	}

	// returns array of the type it was saved as in writeIntArray()
	_readIntArray (outType, bytes, signed, sharedBuffer) {
		if (!bytes) bytes = 4;
		if (signed === undefined) signed = true;

		var size = this.dataView.getUint32(this.pos);  this.pos += 4;
		if (this.pos + size * bytes > this.arrayBuffer.byteLength) {
			console.error("Invalid array size read!  Bad file or bad input.");
			return;
		}

		var result;
		if (!sharedBuffer) {
			switch (outType) {
				case 0: result = new Array(size); break;
				case 1: result = new Int8Array(size); break;
				case 2: result = new Int16Array(size); break;
				case 3: result = new Int32Array(size); break;
				case 4: result = new BigInt64Array(size); break;
				case 5: result = new Uint8Array(size); break;
				case 6: result = new Uint16Array(size); break;
				case 7: result = new Uint32Array(size); break;
				case 8: result = new BigUint64Array(size); break;
				case 9: result = new Float32Array(size); break;
			}
		}
		else {
			switch (outType) {
				case 0: result = new Array(size); break;
				case 1: result = new Int8Array(new SharedArrayBuffer(size)); break;
				case 2: result = new Int16Array(new SharedArrayBuffer(size * 2)); break;
				case 3: result = new Int32Array(new SharedArrayBuffer(size * 4)); break;
				case 4: result = new BigInt64Array(new SharedArrayBuffer(size * 8)); break;
				case 5: result = new Uint8Array(new SharedArrayBuffer(size)); break;
				case 6: result = new Uint16Array(new SharedArrayBuffer(size * 2)); break;
				case 7: result = new Uint32Array(new SharedArrayBuffer(size * 4)); break;
				case 8: result = new BigUint64Array(new SharedArrayBuffer(size * 8)); break;
				case 9: result = new Float32Array(new SharedArrayBuffer(size * 4)); break;
			}
		}

		var val;
		for (var i = 0; i < size; i++) {
			val = this._readInt(bytes, signed, false);
			result[i] = val;
		}
		return result;
	}

	/*--- WRITES --------------------------------- */

	// Write a string to the stream.  
	// bytes: opt, def=1.  The number of bytes per character
	// Max string length: 65535
	writeString (string, bytes) {
		if (!bytes)
			bytes = 1;

		if (string === null || string === undefined) {
			this.writeInt(0, 2, false);	// string is length 0.
			return this;
		}

		if (string.length > 65535) {	// this is usually an error case anyway
			console.log("Cannot write strings larger than 65535 chars! Implement writeLongString()!");
			this.writeInt(0, 2, false);
			return;
		}
		
		this.writeInt(string.length, 2, false);
		for (var i = 0; i < string.length; i++) {
			var charCode = string.charCodeAt(i);
			this.writeInt(charCode, bytes, false /* signed */);
		}
		return this;
	}

	// Writes a string of arbitrary size. Always UTF-8.
	writeStringLong (string) {
		var byteArray = new Uint8Array();
		if (string.length < 20e6) {
			var encoder = new TextEncoder();
			byteArray = encoder.encode(string);
		}
		else {
			console.log("Cannot write strings larger than 20MB!");
		}

		this.writeIntArray(byteArray, 1, false);
		return this;
	}

	writeStringArray (stringArray /* string[] */) {
		this._writeArrayLength(stringArray);
		for (var i = 0; i < stringArray.length; i++) {
			this.writeString(stringArray[i]);
		}
		return this;
	}

	// Write a file version as two ints, the second represents the mantissa to 2 places.  
	// This prevents problems with floating point rounding (eg 1.1 will read as 1.1000003)
	writeVersion (version) {
		var major = Math.floor(version);
		var minor = Math.round((version - major) * 100);
		this.writeInt(major, 1, false);
		this.writeInt(minor, 1, false);
		return this;
	}

	_writeArrayLength (array) {
		if (!array)
			this.writeInt(0, 4, false);
		else
			this.writeInt(array.length, 4, false);
		return this;
	}
		
	// Write an object to the steam.
	// The object must have implemented 'writeBinary (BinaryFile)'
	writeObject (object) {
		if (!object) {
			this.writeInt(0, 1 /* bytes */, false);
			return;
		}
		this.writeInt(1, 1, false);		// The first byte is a 1 if the object is not null or undefined.
		if (!object.writeBinary) {
			console.log("BinaryFile write error: " + object.constructor.name + " has not implemented writeBinary()!");
			return;
		}
		object.writeBinary(this);
		return this;
	}

	// Write an Array of objects to the stream. 
	writeObjectArray (objArray) {
		if (!Array.isArray(objArray)) {
			console.error("Object passed to writeObjectArray is not an array!");
			return;
		}
		this._writeArrayLength(objArray);
		if (objArray) {
			for (var i = 0; i < objArray.length; i++) {
				this.writeObject(objArray[i]);
			}
		}
		return this;
	}

	// Write an object whose type may be indeterminate when loaded such as when saving an array of subclassed objects.
	// object		Object		Any object that has been registered with registerType() and has an implemented writeBinary().
	writeObjectDynamic (object) {
		if (!object) {
			this.writeInt(0, 1 /* bytes */, false);	// object not valid. Will read as null.
			return;
		}

		// Write the id of the type so it can be identified when loading.
		if (!BinaryFile.typeToId.has(object.constructor)) {
			console.log("BinaryFile write error: " + object.constructor.name + " has not been registered!");
			this.writeInt(0, 1 /* bytes */, false);	// object not valid. Will read as null.
			return;
		}
		
		this.writeInt(1, 1, false);		// object valid.
		this.writeInt(BinaryFile.typeToId.get(object.constructor), 2 /* bytes */, false /* signed */);
		object.writeBinary(this);
		return this;
	}

	// Write an array of objects whose type is indeterminate such as subclassed objects.
	writeObjectArrayDynamic (objArray) {
		this._writeArrayLength(objArray);
		if (objArray) {
			for (var i = 0; i < objArray.length; i++) {
				this.writeObjectDynamic(objArray[i]);
			}
		}
		return this;
	}

	// Write a Map object. Keys can be integer, string or object. Values are written as string, float or object.
	writeMap (map) {
		if (!map) {	this.writeInt(0, 1 /* bytes */, false);	return;		}
		this.writeInt(1, 1, false);		// The first byte is a 1 if the object is not null or undefined.

		this.writeInt(map.size, 4, false);
		for (key of map.keys()) {
			switch (typeof(key)) {
				case 'string': 	this.writeString(key);  break;
				case 'number':		this.writeInt(key);		break;
				default:				this.writeObject(key);	break;
			}
			var value = map.get(key);
			switch (typeof(value)) {
				case 'string': 	this.writeString(value); 	break;
				case 'number':		this.writeFloat(value);		break;
				default:				this.writeObject(value);	break;
			}
		}
		return this;
	}

	writeBoolean (value) {
		this._prepBuffer(1);
		this._writeInt(value, 1, false);
	};

	// bytes: opt. def=4. the number of bytes the int should be stored in [1, 2, 4, 8]
	// signed: def=false
	writeInt (value, numBytes, signed) {
		if (!numBytes) numBytes = 4;
		if (signed === undefined) signed = true;
		this._prepBuffer(numBytes);
		this._writeInt(value, numBytes, signed);
		return this;
	}

	// values 	number[] or typed int array  	If null, a zero length array is written.
	// bytes	 	number 			opt, def=4. Number of bytes for each value [1, 2, 4, 8]. For typed arrays, this value is inferred.
	// signed	boolean			opt, def=true. Integers should be stored as signed. For typed arrays, this value is inferred.
	writeIntArray (values, numBytes, signed) {
						
		if (!numBytes) {
			if (values instanceof Int8Array || values instanceof Uint8Array) numBytes = 1;
			else if (values instanceof Int16Array || values instanceof Uint16Array) numBytes = 2;
			else if (values instanceof Int32Array || values instanceof Uint32Array) numBytes = 4;
			//else if (values instanceof BigInt64Array || values instanceof BigUint64Array) numBytes = 8;
			else numBytes = 4;
		}
		if (signed === undefined)  {
			if (values instanceof Uint8Array || values instanceof Uint16Array || values instanceof Uint32Array /*|| values instanceof BigUint64Array*/)
				signed = false;
			else
				signed = true;
		}
		
		var numValues = values ? values.length : 0;
		this._prepBuffer(numValues * numBytes + 4);
		this.dataView.setUint32(this.pos, numValues);	this.pos += 4;	// write the size of the array
		
		for (var i = 0; i < numValues; i++) {
			this._writeInt(values[i], numBytes, signed, false);
		}
		return this;
	}

	// value: number
	writeFloat (value) {
		this._prepBuffer(4);
		this.dataView.setFloat32(this.pos, value, false); this.pos += 4;
		return this;
	}

	// values: number[]
	writeFloatArray (values) {
		var numValues = values ? values.length : 0;
		this._prepBuffer(numValues * 4 + 4);

		this.dataView.setUint32(this.pos, numValues);	this.pos += 4;	// write the size of the array
		for (var i = 0; i < numValues; i++) {
			this.dataView.setFloat32(this.pos, values[i], false); this.pos += 4;
		}
		
		return this;
	}

	writeFloat32Array (values) {
		this.writeFloatArray(values);
		return this;
	}

	// Write the values of a float array as unsigned integers of 'bytes' bytes each for compression.  Generally bytes are 1 or 2.
	// compFunc: function(val) => val.  compression function.  converts the float into an unsigned int.
	writeCompFloatArray (values, bytes, compFunc) {
		var numValues = values ? values.length : 0;
		this._prepBuffer(numValues * bytes + 4);

		this.dataView.setUint32(this.pos, numValues);	this.pos += 4;	// write the size of the array
		for (var i = 0; i < numValues; i++) {
			var val = Math.round(compFunc(values[i]));
			this._writeInt(val, bytes, false);
		}
		return this;
	}


	/* -- READS ----------------------------------------------- */

	// returns String.
	// bytesPerChar 	int	optional, def=1. The number of bytes per character
	readString (bytesPerChar) {
		if (!bytesPerChar)
			bytesPerChar = 1;
		
		var str = "";
		var length = this.readInt(2, false /*signed */);

		for (var i = 0; i < length; i++)   {
			var charCode = this.readInt(bytesPerChar, false);
			str += String.fromCharCode(charCode);
		}
		return str;
	}


	// returns String.
	readStringLong () {
		byteArray = this.readInt8Array();
		if (byteArray.length == 0)
			return '';

		
		var decoder = new TextDecoder();
		//var decoder = new TextDecoder();
		var str = decoder.decode(byteArray)
		return str;
	}

	// returns String[]
	readStringArray () {
		var numStrings = this._readArrayLength();
		if (numStrings > 1e7) {
			console.log("Number of strings in array exceeds 10 million. Bad read?");
			return;
		}
		var strings = [];
		for (var i = 0; i < numStrings; i++) {
			var str = this.readString();
			strings.push(str);
		}
		return strings;
	}

	// Read a version value. Because of floating point rounding we store the version as two ints. The second representing
	// the mantissa.
	readVersion () {
		var major = this.readInt(1, false);
		var minor = this.readInt(1, false);

		return major + (minor / 100);
	}

	_readArrayLength () {
		return this.readInt(4, false /* signed */);
	}

	__readArrayLength () {
		return this.dataView.readInt()
	}

	// Read an array of objects from the stream.  
	// objectOrType	Object | Class	The type of object to be read (eg Vector3) or the object to read into.
	// args				{}  				opt. Passed to the readBinary function for any initialization parameters that are necessary.
	readObjectArray (objectOrType, args) {
		var numObjects = this._readArrayLength();
		if (numObjects > 1e7) {
			console.log("Number of objects in array exceeds 10 million. Bad read?");
			return;
		}
		var objects = new Array(numObjects);
		for (var i = 0; i < numObjects; i++) {
			objects[i] = this.readObject(objectOrType, args);
		}
		return objects;
	}

	// Read a Javascript object from the stream.  
	// Pass in the objectType (eg. 'Color', 'Vector3')
	// The object must have implemented objectType.readBinary(BinaryFile) (note not prototype)
	// objectOrType	Object | Class	The object to read the data into OR the type of object (eg Vector3)
	// args				{}  				opt. Passed to the readBinary function for any initialization parameters that are necessary.
	readObject (objectOrType, args) {
		var valid = this.readInt(1, false);
		if (valid != 1)
			return null;
		
		if (!objectOrType.readBinary) {
			console.log("Read error: " + objectOrType.constructor.name + " has not implemented readBinary()!");
			return;
		}

		var obj = objectOrType.readBinary(this, args);
		return obj;
	}

	// Read an object where the type is not known but has been registered and saved with writeObjectDynamic.
	readObjectDynamic (args) {
		var valid = this.readInt(1, false);
		if (valid != 1)
			return null;

		var id = this.readInt(2, false);
		if (!BinaryFile.idToType.has(id)) {
			console.log("Read error: id " + id + " has not been registered!");
			return;
		}

		var obj = BinaryFile.idToType.get(id).readBinary(this, args);
		return obj;
	}

	// Read an array of objects that was written with writeObjectArrayDynamic(). 
	// args		Object		opt. Arguments that should be passed into readBinary. An example would be a WebGl context.
	readObjectArrayDynamic (args) {
		var numObjects = this._readArrayLength();
		if (numObjects > 1e7) {
			console.log("Number of objects in array exceeds 10 million. Bad read?");
			return;
		}
		var objects = new Array(numObjects);
		for (var i = 0; i < numObjects; i++) {
			objects[i] = this.readObjectDynamic(args);
		}
		return objects;
	}

	// Read a Map Object that was written with writeMap()
	// keyType		'string', 'number', or ObjectType
	// valType		'string', 'number', or ObjectType
	// valArgs		any			optional. Arguments needed for reading the value type.
	readMap (keyType, valType, valArgs) {
		var valid = this.readInt(1, false);
		if (valid != 1)	return null;

		var map = new Map();
		var size = this.readInt(4, false);
		for (var i = 0; i < size; i++) {
			var key, value;
			switch (keyType) {
				case 'string':		key = this.readString(); break;
				case 'number':		key = this.readInt(); break;
				default:				key = this.readObject(keyType);
			}
			switch (valType) {
				case 'string':		value = this.readString(); break;
				case 'number':		value = this.readFloat(); break;
				default:				value = this.readObject(valType, valArgs);
			}
			map.set(key, value);
		}
		return map;
	}

	// Read a boolean from the stream that was written with writeBoolean().
	readBoolean () {
		return !!this._readInt(1, false);
	}

	// Read an integer from the stream that was written with writeInt().
	// bytes: opt def=4. Number of bytes the int is stored as in the file.
	// signed: opt bool def=true.  It is stored in the file signed or unsigned
	readInt (bytes, signed) {
		if (!bytes) bytes = 4;
		if (signed === undefined) signed = true;
		return this._readInt(bytes, signed);	
	}

	// Returns Array[number] - Read an array of integers that was written with writeIntArray().
	// bytes: bytes per entry in the file.  It may be different than the bytes per entry in the array due to compression.
	readIntArray (bytes, signed) {	
		return this._readIntArray(0, bytes ? bytes : 4, signed == undefined ? true : signed);
	}

	readInt8Array () {
		return this._readIntArray(1, 1, true /* signed */);
	}

	readInt16Array () {	
		return this._readIntArray(2, 2, true);
	}

	readInt32Array () {
		return this._readIntArray(3, 4, true);
	}

	readBigInt64Array () {
		return this._readIntArray(4, 8, true);
	}

	readUint8Array () {
		return this._readIntArray(5, 1, false);
	}

	readUint16Array () {
		return this._readIntArray(6, 2, false);
	}

	readUint32Array () {
		return this._readIntArray(7, 4, false);
	}

	readBigUint64Array () {
		return this._readIntArray(8, 8, false);
	}

	// Returns number - Read a 4 byte float from the stream that was written with writeFloat().
	readFloat () {
		var f = this.dataView.getFloat32(this.pos);	this.pos += 4;
		return f;
	}

	// Returns Array[number] - Read an array of floats from the stream that was written with writeFloatArray().
	readFloatArray () {
		var size = this.dataView.getUint32(this.pos);  this.pos += 4;
		if (this.pos + size * 4 > this.arrayBuffer.byteLength) {
			console.error("Invalid array size read!  Bad file.");
			return;
		}
		var result = new Array(size);
		for (var i = 0; i < size; i++) {
			result[i] = this.dataView.getFloat32(this.pos, false); this.pos += 4;
		}
		return result;
	}

	// Read an array of 4-byte floats as a Float32Array.
	// useSharedArray		bool	opt, def=false. The underlying buffer will be a SharedArrayBuffer. Used for sharing data among threads.
	readFloat32Array (useSharedArray) {
		var size = this.dataView.getUint32(this.pos);  this.pos += 4;
		if (this.pos + size * 4 > this.arrayBuffer.byteLength) {
			console.error("Invalid array size read!  Bad file.");
			return;
		}
		var result = new Float32Array(useSharedArray ? new SharedArrayBuffer(size * 4) : size);
		for (var i = 0; i < size; i++) {
			result[i] = this.dataView.getFloat32(this.pos, false); this.pos += 4;
		}
		return result;
	}

	// Read a compressed float32 array written with writeCompFloatArray().
	// Useful for large amounts of data that do not require the precision of 32 bits such as normals and colors.
	// bytes					number				 The number of bytes each compressed value set in writeCompFloatArray()
	// uncompressFunc		function (number)	 The function that translates this compressed value into an uncompressed one.
	// sharedBuffer		bool					 opt. def=false. The buffer in the created array should be a shared array.
	readCompFloat32Array (bytes, uncompressFunc, sharedBuffer) {
		var result = this._readIntArray(9, bytes ? bytes : 4, false /* signed */, sharedBuffer);
		for (var i = 0; i < result.length; i++) {
			result[i] = uncompressFunc(result[i]);
		}
		return result;
	}

	// Send the array of data to the passed url as a POST on a server that can process it or save the data.
	// url			string			The location of the server that will receive the data
	// callback	 	function()		Called when the request has completed successfully.
	save (url, callback) {
		var saveBuffer = this.arrayBuffer.slice(0, this.pos);		// truncate the unused data from the end.
		
		var request = new XMLHttpRequest();
		request.open("POST", url, true /* async */);	// POST sends data
		request.setRequestHeader("Content-type", "application/octet-stream");
		request.onload = function ()    {   if (callback) callback(url); else { console.log("Ready: " + request.responseText); }     }
		request.onerror = function (e)  {   console.log("Server error: " + e.message);	       }
		request.send(saveBuffer);
	}


	// static. Load a binary file from the passed url or File object asyncronously. 
	// In NodeJS use loadNodeJS() instead.
	// callback: function (BinaryFile).  Passes the loaded file when finished loading or null on error.
	static load (urlOrFile, callback) {
		if (!callback)
			return;

		var onLoad = function (data /* ArrayBuffer */) {
			var file = new BinaryFile(data);
			callback(file);
		}

		if (urlOrFile instanceof File) {	// File will be undefined in NodeJS
			var reader = new FileReader();
			reader.onload = function (event) { onLoad(event.target.result);  };
			reader.readAsArrayBuffer(urlOrFile);
		}
		else {
			var request = new XMLHttpRequest();
			request.open("GET", urlOrFile, true /* async */);		// GET retrieves data
			request.setRequestHeader("Content-type", "application/octet-stream");
			request.responseType = "arraybuffer";
			request.onload = function ()    { 
				if (request.status != 200) {
					console.log("Error downloading binary file " + urlOrFile + " (" + request.status + ", " + request.statusText + ")");
					callback(null);
					return;
				}
				onLoad(request.response);
			}
			request.onerror = function(e)  {   console.log("Server error: " + e.message);	callback(null);;   }
			request.send();
		}
	}

	// returns Promise. static. Load the file using the Promise pattern.
	static loadAsync (urlOrFile) {
		return new Promise (function (onResolve, onReject) {
			BinaryFile.load(urlOrFile, function (file) {
				onResolve(file);		// will be null if unsuccessful.
			});
		});
	}
	
	// Perform a unit test on this class.
	static Test  () {
		var file = new BinaryFile();

		file.writeFloat(12.5);
		file.writeInt(89);
		file.writeInt(-43, 2, true);
		file.writeInt(99, 8, false);
		file.writeFloatArray([2.12, 9.19, 0.04]);
		file.writeIntArray([988, 10440, 11]);
		file.writeIntArray([988, -10440, 11], 4, true);
		file.writeIntArray([101, 244, 6], 1, false);

		var a = new Float32Array(3);
		a[0] = 12.2; a[1] = 0.00388; a[2] = 899;
		file.writeFloatArray(a);

		var b = new Int16Array(3);
		b[0] = 900; b[1] = 4; b[2] = 64000;
		file.writeIntArray(b);

		var c = new Float32Array(3);
		c[0] = 0.444;  c[1] = -.940;  c[2] = 0.010;
		file.writeCompFloatArray(c, 2, function (val) { return (val + 1.0) / 2.0 * 65535; });

		file.writeString('TEST STRING!', 2);

		file.writeVersion(1.00);
		file.writeVersion(8.50);
		file.writeVersion(0.91);
		file.writeVersion(1.1);


		// ---  Read the data back -----

		var check = function (a, b) {
			if (typeof a == 'string') {
				return a == b;
			}
			if (a[0] !== undefined) {
				for (var i = 0; i < a.length; i++) {
					check(a[i], b[i]);
				}
			}
			else {
				if (Math.abs(a - b) > 0.00001)
					console.log("Test error: " + a + " != " + b);
			}
		}

		file = new BinaryFile(file.arrayBuffer);
		check(file.readFloat(), 12.5);
		check(file.readInt(), 89);
		check(file.readInt(2, true), -43);
		check(Number(file.readInt(8, false)), 99);

		check(file.readFloatArray(), [2.12, 9.19, 0.04]);
		check(file.readIntArray(), [988, 10440, 11]);
		check(file.readIntArray(4, true), [988, -10440, 11]);
		check(file.readIntArray(1, false), [101, 244, 6]);

		var a = file.readFloat32Array();
		check(a.length, 3);
		check(a instanceof Float32Array, true);
		check(a, [12.2, 0.00388, 899]);

		var b = file.readInt16Array();
		check(b, [900, 4, 64000 - 65536 ]);
		
		var c = file.readCompFloat32Array(2, function (val) { return val / 65535 * 2.0 - 1.0; });
		check(c, [0.444, -.940, 0.010]);

		var s = file.readString(2);
		check(s, 'TEST STRING!');

		var v = file.readVersion();
		check(v, 1.00);
		var v = file.readVersion();
		check(v, 8.50);
		var v = file.readVersion();
		check(v, 0.91);
		var v = file.readVersion();
		check(v, 1.1);
	}
}

//BinaryFile.Test();



