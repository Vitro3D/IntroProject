// render-state-stack.js
// A stack of matrices which maintain the current transform matrix while traversing a render tree.
// The matrices are created once and the stack position is maintained manually. This prevents matrices
// from being created and destructed many times a render cycle.

import Matrix from '../core/matrix.js';

export default class TransformStack {

	constructor () {
		var stateDepth = 50;		// maximum depth of the stack.
		this.curIndex = 0;		// index of the current stack. -1 indicate there is no matrix on the stack.
		this.states = new Array(stateDepth);
		for (var i = 0; i < stateDepth; i++)
			this.states[i] = new Matrix();
	}

	// Clear the stack.
	reset () {
		this.curIndex = 0;
		this.states[0].reset();
	}

	// Returns Matrix - The current transform on the stack.
	getTransform () {
		return this.states[this.curIndex];
	}

	// matrix	Matrix	The matrix to multiple the current matrix by.
	multiply (matrix) {
		this.states[this.curIndex].multiply(matrix);
	}

	// Push the stack. The new transform is a copy of the old.
	push () {
		if (this.curIndex >= this.stateDepth - 1) {
			console.log("Cannot push new state. Maximum stack depth reached.");
			return;
		}

		this.states[this.curIndex + 1].set(this.states[this.curIndex]);
		this.curIndex++;
	}

	// Pop the stack. The popped transform is lost.
	pop () {
		if (this.curIndex == 0) {
			console.log("Cannot pop matrix stack. Already empty!");
			return;
		}
		this.curIndex--;
	}
}
