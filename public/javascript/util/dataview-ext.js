// dataview-ext.js
// A group of functions that enable easier parsing of the native DataView object.
// These operations are common when parsing binary files of various types.
	
export default class DataViewExt {

	// A null-terminated string represented with 1 byte per character. This is a common format in binary files.
	// dataview		DataView		A view into an array buffer containing the raw data
	// offset		int			The byte position in which to start reading
	// length		int			The maximum length to read in characters.
	static getString (dataView, offset, length) {
		var str = "";
		for (var i = 0; i < length; i++)   {
			var charCode = dataView.getUint8(offset + i);
			if (charCode == 0)
				break;		// null char.
			str += String.fromCharCode(charCode);
		}
		return str;
	}

	// A null-terminated string represented with 2 bytes per character
	//	offset		int		The position in the stream to start reading
	// length		int		The maximum length of the string in characters.		
	static getUnicodeString (dataView, offset, length) {
		var str = "";
		for (var i = 0; i < length; i += 2)   {
			var charCode = dataView.getUint16(offset + i);
			if (charCode == 0)
				break;
			str += String.fromCharCode(charCode);
		}
		return str;
	}

	// Get a vector3 from 3 4-byte floats.  Consumes 12 bytes.
	// offset		int		The position in the stream to start reading
	// result		Vector3	opt. The read vector is placed in this object. If undefined, a new Vector3 is created.
	static getVector3 (dataView, offset, result) {
		if (!result || result.x === undefined)
			result = new Vector3();

		result.x = dataView.getFloat32(offset, true);
		result.y = dataView.getFloat32(offset + 4, true);
		result.z = dataView.getFloat32(offset + 8, true);
			
		return result;
	}

	// Set the 12 bytes starting at offset to 3 4-byte floats representing x, y, z.
	// offset		int		The position in the stream to start reading
	// vec			Vector3	The vector to add to the DataView buffer. 
	static setVector3 (dataView, offset, vec /* Vector3 */) {
		dataView.setFloat32(offset, vec.x, true);
		dataView.setFloat32(offset + 4, vec.y, true);
		dataView.setFloat32(offset + 8, vec.z, true);
	}
};
