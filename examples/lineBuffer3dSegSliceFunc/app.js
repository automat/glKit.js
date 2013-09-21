(function()
{
    /*---------------------------------------------------------------------------------------------------------*/

    function App(element)
    {
        GLKit.Application.apply(this,arguments);

        this._zoom = 3;

        var light0 = this._light0 = new GLKit.Light(this.gl.LIGHT_0);
            light0.setAmbient3f(0,0,0);
            light0.setDiffuse3f(0.8,0.8,0.8);
            light0.setSpecular3f(1,1,1);
            light0.setPosition3f(1,1,1);

        var material = this._material0 = new GLKit.Material();
            material.setDiffuse3f(0.7,0.1,0.2);
            material.setAmbient3f(0.7,0.1,0.7);
            material.setSpecular3f(1,1,1);
            material.shininess = 100.0;

        var len = 2000;
        var i = -1;
        var r = 1;
        var a;
        var arr = new Array(len * 3);


        while(++i < len)
        {
            a = Math.PI * 8 / len * i;
            arr[i*3  ] = Math.cos(a) * r;
            arr[i*3+1] = (-0.5 + i/len) * 2;
            arr[i*3+2] = Math.sin(a) * r;

        }

        var lineBuffer = this._line3dBuffer = new GLKit.LineBuffer3d(len,16);
            lineBuffer.setPoints(arr);
            lineBuffer.applySliceSegmentFunc(function(i,j,numPoints,numSegments)
                                             {
                                                 var a = Math.PI * 2 / numSegments * j;
                                                 var d = j > numSegments  * 0.5 ?  1 : -1;

                                                 return [ Math.cos(a) * 0.0125,
                                                         (Math.sin(a) - d) * 0.075];
                                             });

        this.setSize(window.innerWidth,window.innerHeight);
        this.setTargetFPS(60);

    }

    App.prototype = Object.create(GLKit.Application.prototype);

    App.prototype.onWindowResize = function(){this.setSize(window.innerWidth,window.innerHeight);};

    App.prototype.update = function()
    {
        var gl        = this.gl,
            cam       = this.camera,
            time      = this.getSecondsElapsed(),
            timeDelta = this.getTimeDelta();

        var light0 = this._light0;

        var zoom = this._zoom = GLKit.Math.lerp(this._zoom, 3 + this.getMouseWheelDelta() * 0.25, timeDelta * 0.0025);


        gl.clear3f(0.1,0.1,0.1);
        gl.loadIdentity();

        gl.drawMode(gl.LINES);

        var camRotX,camRotY;

        if(this.isMouseDown())
        {
            camRotX = ( -1 + this.mouse.getX() / this.glWindow.getWidth() * 2.0 ) * Math.PI;
            camRotY = ( -1 + this.mouse.getY() / this.glWindow.getHeight() * 2.0) * Math.PI * 0.5;

            GLKit.Vec3.lerp3f(cam.position,
                              Math.cos(camRotX) * zoom,
                              Math.sin(camRotY) * zoom,
                              Math.sin(camRotX) * zoom,
                              timeDelta * 0.25);
        }
        else
        {
            camRotX = time * 0.25;

            cam.setPosition3f(Math.cos(camRotX) * zoom,
                              zoom,
                              Math.sin(camRotX) * zoom);

        }

        cam.setTarget3f(0,0,0);
        cam.updateMatrices();

        gl.drawMode(gl.LINE_LOOP);

        this.drawSystem();

        /*---------------------------------------------------------------------------------------------------------*/

        var lineBuffer = this._line3dBuffer;

        var len = lineBuffer.getNumPoints();
        var i = -1;
        var r = 1;
        var a;
        var n;

        while(++i < len)
        {
            n = i / len;

            a = Math.PI * Math.sin(time) * 64 / len * i + Math.sin(time*0.025)* Math.PI * 2;
            r = 2 / (len-1) * i  + Math.sin(time);

            lineBuffer.setPoint3f(i, Math.cos(a) * r,
                                     (-0.5 + n) * 2,
                                     Math.sin(a) * r);

        }

        lineBuffer.update();
        lineBuffer.updateVertexNormals();

        gl.useLighting(true);
        gl.useMaterial(true);

        gl.drawMode(gl.TRIANGLES);
        gl.light(light0);
        gl.material(this._material0);
        gl.drawGeometry(lineBuffer);

        gl.useMaterial(false);
        gl.useLighting(false);

        /*---------------------------------------------------------------------------------------------------------*/
    };

    /*---------------------------------------------------------------------------------------------------------*/

    App.prototype.drawSystem = function()
    {
        var gl = this.gl;

        gl.color1f(0.15);
        GLKit.GLUtil.drawGridCube(gl,8,1);

        gl.color1f(0.25);
        gl.pushMatrix();
        {
            gl.translate3f(0,-0.01,0);
            GLKit.GLUtil.drawGrid(gl,8,1);
        }
        gl.popMatrix();

        GLKit.GLUtil.drawAxes(gl,4);

        gl.color1f(1);

        gl.pushMatrix();
        {
            gl.translate(this._light0.position);
            GLKit.GLUtil.octahedron(gl,0.075);
        }
        gl.popMatrix();
    };

    /*---------------------------------------------------------------------------------------------------------*/

    window.addEventListener('load',function()
    {
        var app = new App(document.getElementById('canvasGLContainer'));
    });

    /*---------------------------------------------------------------------------------------------------------*/
})();