GLKit.Light = function(id)
{
    this._id   = id;

    this.ambient  = new Float32Array([1,1,1]);
    this.diffuse  = new Float32Array([1,1,1]);
    this.specular = new Float32Array([1,1,1]);

    this.position             = GLKit.Vec3.ZERO();
    this.direction            = null;
    this.spotExponent         = null;
    this.spotCutOff           = null;

    this.constantAttentuation = 1.0;
    this.linearAttentuation   = 0;
    this.quadricAttentuation  = 0.01;
};


GLKit.Light.prototype.setAmbient     = function(color)  {this.ambient[0] = color[0];this.ambient[1] = color[1];this.ambient[2] = color[2];};
GLKit.Light.prototype.setAmbient3f   = function(r,g,b)  {this.ambient[0] = r;this.ambient[1] = g;this.ambient[2] = b;};

GLKit.Light.prototype.setDiffuse     = function(color)  {this.diffuse[0] = color[0];this.diffuse[1] = color[1];this.diffuse[2] = color[2];};
GLKit.Light.prototype.setDiffuse3f   = function(r,g,b)  {this.diffuse[0] = r;this.diffuse[1] = g;this.diffuse[2] = b;};

GLKit.Light.prototype.setSpecular    = function(color)  {this.specular[0] = color[0];this.specular[1] = color[1];this.specular[2] = color[2];};
GLKit.Light.prototype.setSpecular3f  = function(r,g,b)  {this.specular[0] = r;this.specular[1] = g;this.specular[2] = b;};

GLKit.Light.prototype.setPosition    = function(v)    {GLKit.Vec3.set(this.position,v);};
GLKit.Light.prototype.setPosition3f  = function(x,y,z){GLKit.Vec3.set3f(this.position,x,y,z);};

GLKit.Light.prototype.setDirection   = function(v)    {GLKit.Vec3.set(this.direction,v);};
GLKit.Light.prototype.setDirection3f = function(x,y,z){GLKit.Vec3.set3f(this.direction,x,y,z);};

GLKit.Light.prototype.lookAt         = function(position,target)
{
    this.setPosition(position);
    this.setDirection(GLKit.Vec3.normalize(GLKit.subbed(target,position)));
};

GLKit.Light.prototype.getId = function(){return this._id;};

//TODO: Add
/*---------------------------------------------------------------------------------------------------------*/

GLKit.PointLight =  function(id)
{
    GLKit.Light.call(this,arguments);
};

GLKit.PointLight.prototype = Object.create(GLKit.Light.prototype);

/*---------------------------------------------------------------------------------------------------------*/

GLKit.DirectionalLight =  function(id)
{
    GLKit.Light.call(this,arguments);
};

GLKit.DirectionalLight.prototype = Object.create(GLKit.Light.prototype);