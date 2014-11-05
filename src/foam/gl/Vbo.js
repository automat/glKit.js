var _gl = require('./gl');

/**
 * Buffer object representation
 * @param {Number} [target=gl.ARRAY_BUFFER] - Target buffer, gl.ARRAY_BUFFER, gl.ELEMENT_ARRAY_BUFFER
 * @constructor
 */

function Vbo(target){
	this._gl     = _gl.get();
	this._obj    = this._gl.createBuffer();
	this._target = target || this._gl.ARRAY_BUFFER;
}

/**
 * Binds the buffer.
 * @returns {Vbo}
 */

Vbo.prototype.bind = function(){
	this._gl.bindBuffer(this._target,this._obj);
	return this;
};

/**
 * Unbinds the buffer.
 */

Vbo.prototype.unbind = function(){
	this._gl.bindBuffer(this._target,null);
};

/**
 * Deletes the buffer.
 */

Vbo.prototype.delete = function(){
	this._gl.deleteBuffer(this._obj);
	this._obj = null;
};


/**
 * Modifies or sets some of the buffers data.
 * @param {Number} offset - Data offset bytelength
 * @param {ArrayBufferView} data - Data to be set.
 * @returns {Vbo}
 */

Vbo.prototype.bufferSubData = function(offset,data){
	this._gl.bufferSubData(this._target,offset,data);
	return this;
};

/**
 * Initializes the buffer.
 * @param {Number|ArrayBufferView} sizeOrData - Size or data
 * @param {Number} usage - gl.STREAM_DRAW, gl.STATIC_DRAW, gl.DYNAMIC_DRAW
 * @returns {Vbo}
 */

Vbo.prototype.bufferData = function(sizeOrData,usage){
	this._gl.bufferData(this._target,sizeOrData,usage);
	return this;
};


module.exports = Vbo;