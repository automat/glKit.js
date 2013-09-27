;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Foam = require('../../src/foam/foam.js');

function App()
{
    Foam.Application.apply(this,arguments);

    this.setFullWindowFrame(true);

    this.setTargetFPS(60);
    this.setSize(4024,1000);
}

App.prototype = Object.create(Foam.Application.prototype);

App.prototype.setup = function()
{
    this._zoom = 1;

    var light0 = this._light0 = new Foam.Light(this.kgl.LIGHT_0);
    light0.setAmbient3f(0,0,0);
    light0.setDiffuse3f(0.8,0.8,0.8);
    light0.setSpecular3f(1,1,1);
    light0.setPosition3f(1,1,1);

    var material = this._material0 = new Foam.Material();
    material.setDiffuse3f(0.7,0.1,0.2);
    material.setAmbient3f(0.7,0.1,0.7);
    material.setSpecular3f(1,1,1);
    material.shininess = 100.0;


    var splineNumPoints = 100;
    var splinePoints = new Array(splineNumPoints * 3);
    var i = -1,n;
    while(++i < splineNumPoints)
    {
        n = i / (splineNumPoints - 1);
        splinePoints[i * 3    ] = Math.cos(Math.PI * n * 10);//(-0.5 +n) * 4;//Math.cos(Math.PI * n * 10);
        splinePoints[i * 3 + 1] = (-0.5 + n) * 4;//0;//(-0.5 + n) * 4;
        splinePoints[i * 3 + 2] = Math.sin(Math.PI * n * 10);//0;//Math.sin(Math.PI * n * 10);
    }
    var spline = this._spline = new Foam.Spline();
    spline.setDetail(4);
    spline.setPoints(splinePoints);
    spline.update();

    var numBufferPoints = 100;
    var lineBuffer = this._lineBuffer0 = new Foam.LineBuffer3d(new Array(numBufferPoints * 3),16,0.35,null,true);


};

App.prototype.update = function()
{
    var gl        = this.kgl,
        cam       = this.camera,
        time      = this.getSecondsElapsed(),
        timeDelta = this.getTimeDelta();

    var light0 = this._light0;

    var zoom = this._zoom = Foam.Math.lerp(this._zoom, 1 + this.getMouseWheelDelta() * 0.25, timeDelta * 0.0025);


    gl.clear3f(0.1,0.1,0.1);
    gl.loadIdentity();

    gl.drawMode(gl.LINES);

    var camRotX,camRotY;

    if(this.isMouseDown())
    {
        camRotX = ( -1 + this.mouse.getX() / this.getWidth() * 2.0 ) * Math.PI;
        camRotY = ( -1 + this.mouse.getY() / this.getHeight() * 2.0) * Math.PI * 0.5;

        Foam.Vec3.lerp3f(cam.position,
            Math.cos(camRotX) * zoom,
            Math.sin(camRotY) * zoom,
            Math.sin(camRotX) * zoom,
            timeDelta * 0.25);
    }
    else
    {

        cam.setPosition3f(4 * zoom,
            0,
            0);

    }

    cam.setTarget3f(0,0,0);
    cam.updateMatrices();

    gl.drawMode(gl.LINE_LOOP);

    //this.drawSystem();

    /*---------------------------------------------------------------------------------------------------------*/


    var spline          = this._spline,
        splineNumPoints = spline.getNumPoints(),
        splinePoints    = spline.points;



    gl.color1f(1);
    gl.drawMode(gl.LINE_STRIP);
    gl.pointSize(1);

    gl.linev(spline.vertices);
    gl.color3f(1,1,1);
    gl.drawMode(gl.LINE_STRIP);
    gl.pointSize(3);
    gl.drawMode(gl.POINTS);
    //gl.points(spline.vertices);
    gl.color3f(1,0,1);
    gl.pointSize(10);


    var r;

    var i = -1,n;








    gl.useLighting(true);
    gl.useMaterial(true);

    gl.light(light0);
    gl.material(this._material0);

    var lineBuffer0 = this._lineBuffer0,
        lineBuffer1 = this._lineBuffer1;
    var len        = lineBuffer0.getNumPoints();

    var intrpl;
    var vec = Foam.Vec3.make();
    var intrplBase,
        intrplScaled;

    var scale = 0.75;

    i = -1;
    while (++i < len)
    {
        n = i / (len - 1);

        scale = 0.75;
        intrplBase   = (0.5 + Foam.Math.saw(time * 0.15) * 0.5);
        intrplScaled = intrplBase * (1 + scale) - scale;
        intrpl = Math.max(0, Math.min(n * scale + intrplScaled, 1));
        lineBuffer0.setPoint(i, spline.getVec3OnSpline(intrpl, vec));



    }

    lineBuffer0.update();
    lineBuffer0.updateVertexNormals();

    gl.drawGeometry(lineBuffer0);
    //gl.drawGeometry(lineBuffer1);

    gl.useMaterial(false);
    gl.useLighting(false);

    gl.drawMode(gl.POINTS);
    gl.color3f(1,0,1);
    gl.pointSize(2);
    gl.points(lineBuffer0.vertices);

    gl.drawMode(gl.LINES);
    // gl.linev(lineBuffer.vertices);
    gl.drawGeometry(lineBuffer0);
};

App.prototype.drawSystem =  function()
{
    var kgl = this.kgl;

    kgl.color1f(0.10);
    Foam.fGLUtil.drawGridCube(kgl,70,1);

    kgl.color1f(0.075);
    kgl.pushMatrix();
    {
        kgl.translate3f(0,-0.01,0);
        Foam.fGLUtil.drawGrid(kgl,70,1);
    }
    kgl.popMatrix();
};

var app = new App();

},{"../../src/foam/foam.js":6}],2:[function(require,module,exports){
var Default = require('../system/fDefault'),
    glkError  = require('../system/fError');

function AppImpl()
{
    this._context3d = null;
    this._context2d = null;

    this._windowTitle       = 0;
    this._isFullWindowFrame = false;
    this._isFullscreen      = false;
    this._isBorderless      = false;
    this._displayId         = 0;

    this._keyDown   = false;
    this._keyStr    = '';
    this._keyCode   = '';

    this._mouseDown       = false;
    this._mouseMove       = false;
    this._mouseWheelDelta = 0.0;

    this._mouseMove   = false;
    this._mouseBounds = true;

    this._targetFPS     = Default.APP_FPS;
    this._bUpdate       = true;

    this._frames        = 0;
    this._frametime     = 0;
    this._framenum      = 0;
    this._time          = 0;
    this._timeStart     = -1;
    this._timeNext      = 0;
    this._timeInterval  = this._targetFPS / 1000.0;
    this._timeDelta     = 0;

    this._width  = -1;
    this._height = -1;
    this._ratio  = -1;

    this._isInitialized = false;
}

AppImpl.prototype.isInitialized = function()    {return this._isInitialized;};

AppImpl.prototype.setUpdate     = function(bool){this._bUpdate = bool;};

AppImpl.prototype.init    = function(appObj)      {throw new Error(glkError.METHOD_NOT_IMPLEMENTED);};
AppImpl.prototype.setSize = function(width,height){throw new Error(glkError.METHOD_NOT_IMPLEMENTED);};

AppImpl.prototype.setFullWindowFrame = function(bool){throw new Error(glkError.METHOD_NOT_IMPLEMENTED);};
AppImpl.prototype.isFullWindowFrame  = function()    {return this._isFullWindowFrame;};

AppImpl.prototype.setFullscreen = function(bool){return false;};
AppImpl.prototype.isFullscreen  = function(){return this._isFullscreen;};

AppImpl.prototype.setBorderless = function(bool){return false;};
AppImpl.prototype.isBorderless  = function(){return this._isBorderless;}

AppImpl.prototype.setDisplay = function(num){return false;};
AppImpl.prototype.getDisplay = function(){return this._displayId;}


AppImpl.prototype.getWidth  = function()            {return this._width;};
AppImpl.prototype.getHeight = function()            {return this._height;};
AppImpl.prototype.getAspectRatioWindow = function(){return this._ratio;};

AppImpl.prototype.setTargetFPS = function(fps){this._targetFPS = fps;this._timeInterval  = this._targetFPS / 1000.0;};
AppImpl.prototype.getTargetFPS = function()   {return this._targetFPS;};

AppImpl.prototype.setWindowTitle       = function(title){this._windowTitle = title;};
AppImpl.prototype.restrictMouseToFrame = function(bool) {this._mouseBounds = bool;};

AppImpl.prototype.getFramesElapsed  = function(){throw new Error(glkError.METHOD_NOT_IMPLEMENTED);};
AppImpl.prototype.getSecondsElapsed = function(){throw new Error(glkError.METHOD_NOT_IMPLEMENTED);};
AppImpl.prototype.getTime           = function(){throw new Error(glkError.METHOD_NOT_IMPLEMENTED);};
AppImpl.prototype.getTimeStart      = function(){throw new Error(glkError.METHOD_NOT_IMPLEMENTED);};
AppImpl.prototype.getTimeNext       = function(){throw new Error(glkError.METHOD_NOT_IMPLEMENTED);};
AppImpl.prototype.getTimeDelta      = function(){throw new Error(glkError.METHOD_NOT_IMPLEMENTED);};

AppImpl.prototype.isKeyDown          = function(){return this._keyDown;};
AppImpl.prototype.isMouseDown        = function(){return this._mouseDown;};
AppImpl.prototype.isMouseMove        = function(){return this._mouseMove;};
AppImpl.prototype.getKeyCode         = function(){return this._keyCode;};
AppImpl.prototype.getKeyStr          = function(){return this._keyStr;};
AppImpl.prototype.getMouseWheelDelta = function(){return this._mouseWheelDelta;};


AppImpl.prototype.setMouseListenerTarget = function(obj){return false;};
AppImpl.prototype.setKeyListenerTarget   = function(obj){return false;};
AppImpl.prototype.getParent              = function()   {return false;};
AppImpl.prototype.setParent              = function(obj){return false;};

module.exports = AppImpl;
},{"../system/fDefault":37,"../system/fError":38}],3:[function(require,module,exports){
var Default     = require('../system/fDefault'),
    kError      = require('../system/fError'),
    kGL         = require('../graphics/fGL'),
    AppImpl     = require('./fAppImpl'),
    CameraBasic = require('../graphics/fCameraBasic'),
    plask       = require('plask');

function AppImplPlask()
{
    AppImpl.apply(this,arguments);
}

AppImplPlask.prototype = Object.create(AppImpl.prototype);

AppImplPlask.prototype.setSize = function(width,height)
{
    if(this._isInitialized)throw new Error(kError.PLASK_WINDOW_SIZE_SET);

    this._width  = width;
    this._height = height;
    this._ratio  = width / height;
};

//TODO: Fix time delta, double measuring of time in general

AppImplPlask.prototype.init = function(appObj)
{
    var self = this;
    var mouse;
    var prevTime = 0,
        timeDelta,
        time;


    function updateMouse(x,y)
    {
        appObj.mouse._positionLast[0] = appObj.mouse._position[0];
        appObj.mouse._positionLast[1] = appObj.mouse._position[1];

        if(self._mouseBounds)
        {
            appObj.mouse._position[0] = Math.max(0,Math.min(x,self._width));
            appObj.mouse._position[1] = Math.max(0,Math.min(y,self._height));
        }
        else
        {
            appObj.mouse._position[0] = x;
            appObj.mouse._position[1] = y;
        }
    }

    plask.simpleWindow({

        settings:
        {
            width:       self._width  || Default.APP_WIDTH,
            height:      self._height || Default.APP_HEIGHT,
            type:        Default.APP_PLASK_TYPE,
            vsync:       Default.APP_PLASK_VSYNC,
            multisample: Default.APP_PLASK_MULTISAMPLE,
            borderless:  self._isBorderless,
            fullscreen:  self._isFullscreen,
            title:       self._windowTitle || Default.APP_PLASK_WINDOW_TITLE
        },

        init:function()
        {
            appObj.kgl    = new kGL(this.gl,null);
            appObj.camera = new CameraBasic();
            appObj.kgl.setCamera(appObj.camera);
            appObj.camera.setPerspective(Default.CAMERA_FOV,
                                         self._ratio,
                                         Default.CAMERA_NEAR,
                                         Default.CAMERA_FAR);

            appObj.camera.setTarget3f(0,0,0);
            appObj.camera.updateMatrices();

            if(self._bUpdate)this.framerate(self._targetFPS);
            appObj.setup();

            self._timeStart = Date.now();
            self._timeNext  = Date.now();

            this.on('mouseMoved',
                function(e)
                {
                    updateMouse(e.x, e.y);
                    appObj.onMouseMove(e);
                });

            this.on('leftMouseDragged',
                function(e)
                {
                    updateMouse(e.x, e.y);
                    appObj.onMouseMove(e);

                });

            this.on('leftMouseDown',
                function(e)
                {
                    self._mouseDown = true;
                    appObj.onMouseDown(e);
                }
            );

            this.on('leftMouseUp',
                function(e)
                {
                    self._mouseDown = false;
                    appObj.onMouseUp(e);
                }
            );

            this.on('scrollWheel',
                function(e)
                {
                    self._mouseWheelDelta += Math.max(-1,Math.min(1,e.dy)) * -1;
                    appObj.onMouseWheel(e);
                }
            );

            this.on('keyUp',
                function(e)
                {
                    self._keyDown = false;
                    self._keyStr  = e.str;
                    self._keyCode = e.keyCode;
                    appObj.onKeyUp(e);
                }
            );

            this.on('keyDown',
                function(e)
                {
                    self._keyDown = true;
                    self._keyStr  = e.str;
                    self._keyCode = e.keyCode;
                    appObj.onKeyDown(e);
                }
            );

            self._isInitialized = true;
        },

        draw:function()
        {
            self._framenum  = this.framenum;
            time            = self._frametime = this.frametime;

            mouse           = appObj.mouse;
            self._mouseMove = mouse._position[0] != mouse._positionLast[0] ||
                              mouse._position[1] != mouse._positionLast[1];


            //eh jo, TODO: check
            self._timeDelta = Math.min((time - prevTime)*10,1);
            appObj.update();
            prevTime = time;

        }});
};

AppImplPlask.prototype.getSecondsElapsed = function(){return this._frametime;};
AppImplPlask.prototype.getFramesElapsed  = function(){return this._framenum;};
AppImplPlask.prototype.getTimeDelta      = function(){return this._timeDelta;};
AppImplPlask.prototype.getTimeStart      = function(){return this._timeStart;};

AppImplPlask.prototype.setFullWindowFrame = function(bool){this._isFullWindowFrame = bool;return true;};
AppImplPlask.prototype.setFullscreen      = function(bool){this._isFullscreen = bool;return true;};
AppImplPlask.prototype.setBorderless      = function(bool){this._isBorderless = bool;return true;};


module.exports = AppImplPlask;




},{"../graphics/fCameraBasic":16,"../graphics/fGL":17,"../system/fDefault":37,"../system/fError":38,"./fAppImpl":2,"plask":43}],4:[function(require,module,exports){
var Default     = require('../system/fDefault'),
    AppImpl     = require('./fAppImpl'),
    kGL         = require('../graphics/fGL'),
    CameraBasic = require('../graphics/fCameraBasic');

function AppImplWeb()
{
    AppImpl.apply(this,arguments);

    var canvas3d = this._canvas3d = document.createElement('canvas');
        canvas3d.setAttribute('tabindex','0');
        canvas3d.focus();

    this._context3d = canvas3d.getContext('webkit-3d') ||
                      canvas3d.getContext("webgl") ||
                      canvas3d.getContext("experimental-webgl");

    var canvas2d = this._canvas2d = document.createElement('canvas');

    this._parent           = null;
    this._mouseEventTarget = canvas3d;
    this._keyEventTarget   = canvas3d;

    this._context2d = canvas2d.getContext('2d');

    window.requestAnimationFrame = window.requestAnimationFrame ||
                                   window.webkitRequestAnimationFrame ||
                                   window.mozRequestAnimationFrame;

}

AppImplWeb.prototype = Object.create(AppImpl.prototype);

AppImplWeb.prototype.getParent = function()   {return this._context3d.parentNode;};
AppImplWeb.prototype.setParent = function(obj){this._parent = obj;};


AppImplWeb.prototype.setSize = function(width,height)
{
    if(this._isFullWindowFrame){width = window.innerWidth; height = window.innerHeight;}
    if(width == this._width && height == this._height)return;

    this._width  = width;
    this._height = height;
    this._ratio  = width / height;

    if(!this._isInitialized) return;

    this._updateCanvas3dSize();
};

AppImplWeb.prototype._init = function(appObj)
{
    var self   = this;
    var mouse  = appObj.mouse;
    var canvas = this._canvas3d;

    document.title = this._windowTitle || document.title;

    if(!this._parent)document.body.appendChild(canvas);
    else this._parent.appendChild(canvas);

    this._updateCanvas3dSize();

    var mouseEventTarget = this._mouseEventTarget,
        keyEventTarget   = this._keyEventTarget;


    appObj.kgl = new kGL(this._context3d,this._context2d);
    appObj.kgl.gl.viewport(0,0,this._width,this._height);

    appObj.camera = new CameraBasic();
    appObj.kgl.setCamera(appObj.camera);
    appObj.camera.setPerspective(Default.CAMERA_FOV,
                                 self._ratio,
                                 Default.CAMERA_NEAR,
                                 Default.CAMERA_FAR);
    appObj.camera.setTarget3f(0,0,0);
    appObj.camera.updateMatrices();

    appObj.setup();

    mouseEventTarget.addEventListener('mousemove',
        function(e)
        {
            mouse._positionLast[0] = mouse._position[0];
            mouse._positionLast[1] = mouse._position[1];

            mouse._position[0] = e.pageX;
            mouse._position[1] = e.pageY;

            appObj.onMouseMove(e);

        });

    mouseEventTarget.addEventListener('mousedown',
        function(e)
        {
            self._mouseDown = true;
            appObj.onMouseDown(e);

        });

    mouseEventTarget.addEventListener('mouseup',
        function(e)
        {
            self._mouseDown = false;
            appObj.onMouseUp(e);

        });

    mouseEventTarget.addEventListener('mousewheel',
        function(e)
        {
            self._mouseWheelDelta += Math.max(-1,Math.min(1, e.wheelDelta)) * -1;
            appObj.onMouseWheel(e);
        });


    keyEventTarget.addEventListener('keydown',
        function(e)
        {
            self._keyDown = true;
            self._keyCode = e.keyCode;
            self._keyStr  = String.fromCharCode(e.keyCode);//not reliable;
            appObj.onKeyDown(e);

        });

    keyEventTarget.addEventListener('keyup',
        function(e)
        {
            self._keyDown = false;
            self._keyCode = e.keyCode;
            self._keyStr  = String.fromCharCode(e.keyCode);
            appObj.onKeyUp(e);

        });


    var fullWindowFrame = this._isFullWindowFrame;
    var camera;
    var gl;

    var windowWidth,
        windowHeight;

    function updateCameraRatio()
    {
        camera = appObj.camera;
        camera.setAspectRatio(self._ratio);
        camera.updateProjectionMatrix();
    }

    function updateViewportGL()
    {
        gl = appObj.kgl;
        gl.gl.viewport(0,0,self._width,self._height);
        gl.clearColor(gl.getClearBuffer());
    }


    window.addEventListener('resize',
        function(e)
        {
            windowWidth  = window.innerWidth;
            windowHeight = window.innerHeight;

            if(fullWindowFrame)
            {
                self.setSize(windowWidth,windowHeight);

                updateCameraRatio();
                updateViewportGL();
            }

            appObj.onWindowResize(e);

            if(!fullWindowFrame && (self._width == windowWidth && self._height == windowHeight))
            {
                updateCameraRatio();
                updateViewportGL();
            }
        });

    if(this._bUpdate)
    {
        var time, timeDelta;
        var timeInterval = this._timeInterval;
        var timeNext;

        function update()
        {
            requestAnimationFrame(update,null);

            time      = self._time = Date.now();
            timeDelta = time - self._timeNext;

            self._timeDelta = Math.min(timeDelta / timeInterval, 1);

            if(timeDelta > timeInterval)
            {
                timeNext = self._timeNext = time - (timeDelta % timeInterval);

                appObj.update();

                self._timeElapsed = (timeNext - self._timeStart) / 1000.0;
                self._framenum++;
            }



        }

        update();

    }
    else appObj.update();

    this._parent = null;
    this._isInitialized = true;

};


AppImplWeb.prototype.init = function(appObj)
{
    var self = this;
    window.addEventListener('load',function(){self._init(appObj);});
};

AppImplWeb.prototype._updateCanvas3dSize = function()
{
    var canvas = this._canvas3d,
        width  = this._width,
        height = this._height;

        canvas.style.width  = width  + 'px';
        canvas.style.height = height + 'px';
        canvas.width        = width;
        canvas.height       = height;
};

AppImplWeb.prototype.getSecondsElapsed = function(){return this._timeElapsed;};
AppImplWeb.prototype.getTimeDelta      = function(){return this._timeDelta;};

AppImplWeb.prototype.setMouseListenerTarget = function(obj){this._mouseEventTarget = obj;};
AppImplWeb.prototype.setKeyListenerTarget   = function(obj){this._keyEventTarget = obj;};
AppImplWeb.prototype.setFullWindowFrame     = function(bool){this._isFullWindowFrame = bool;return true;};


module.exports = AppImplWeb;


},{"../graphics/fCameraBasic":16,"../graphics/fGL":17,"../system/fDefault":37,"./fAppImpl":2}],5:[function(require,module,exports){
var kError       = require('../system/fError'),
    Platform     = require('../system/fPlatform'),
    AppImplWeb   = require('./fAppImplWeb'),
    AppImplPlask = require('./fAppImplPlask'),
    Mouse        = require('../util/fMouse'),
    CameraBasic  = require('../graphics/fCameraBasic');


function Application()
{
    if(Application.__instance)throw new Error(kError.CLASS_IS_SINGLETON);

    var target  = Platform.getTarget();
    if(typeof target === 'undefined' )throw new Error(kError.WRONG_PLATFORM);

    this._appImpl = target == Platform.WEB   ? new AppImplWeb(arguments) :
                    target == Platform.PLASK ? new AppImplPlask(arguments) :
                    null;

    this.mouse  = new Mouse();
    this.kgl    = null;
    this.camera = null;

    Application.__instance = this;
}

Application.prototype.setup  = function(){throw new Error(kError.APP_NO_SETUP);};
Application.prototype.update = function(){throw new Error(kError.APP_NO_UPDATE);};

Application.prototype.setSize = function(width,height)
{
    var appImpl = this._appImpl;
        appImpl.setSize(width,height);

    if(!appImpl.isInitialized())appImpl.init(this);
};
Application.prototype.getWidth  = function(){return this._appImpl.getWidth();};
Application.prototype.getHeight = function(){return this._appImpl.getHeight();};

Application.prototype.setUpdate = function(bool){this._appImpl.setUpdate(bool);};



Application.prototype.setWindowTitle       = function(title){this._appImpl.setWindowTitle(title);};
Application.prototype.restrictMouseToFrame = function(bool) {this._appImpl.restrictMouseToFrame(bool);};

Application.prototype.setFullWindowFrame  = function(bool){return this._appImpl.setFullWindowFrame(bool);};
Application.prototype.setFullscreen       = function(bool){return this._appImpl.setFullscreen(true);};
Application.prototype.isFullscreen        = function()    {return this._appImpl.isFullscreen();};
Application.prototype.setBorderless       = function(bool){return this._appImpl.setBorderless(bool);};
Application.prototype.isBorderless        = function()    {return this._appImpl.isBorderless();};
Application.prototype.setDisplay          = function(num) {return this._appImpl.setDisplay(num);};
Application.prototype.getDisplay          = function()    {return this._appImpl.getDisplay();};

Application.prototype.setTargetFPS = function(fps){this._appImpl.setTargetFPS(fps);};


Application.prototype.isKeyDown          = function(){return this._appImpl.isKeyDown();};
Application.prototype.isMouseDown        = function(){return this._appImpl.isMouseDown();};
Application.prototype.isMouseMove        = function(){return this._appImpl.isMouseMove();};
Application.prototype.getKeyStr          = function(){return this._appImpl.getKeyStr();};
Application.prototype.getKeyCode         = function(){return this._appImpl.getKeyCode();};
Application.prototype.getMouseWheelDelta = function(){return this._appImpl.getMouseWheelDelta();};


Application.prototype.onKeyDown    = function(e){};
Application.prototype.onKeyUp      = function(e){};
Application.prototype.onMouseUp    = function(e){};
Application.prototype.onMouseDown  = function(e){};
Application.prototype.onMouseWheel = function(e){};
Application.prototype.onMouseMove  = function(e){};

Application.prototype.onWindowResize = function(e){};

Application.prototype.getFramesElapsed  = function(){return this._appImpl.getFramesElapsed();};
Application.prototype.getSecondsElapsed = function(){return this._appImpl.getSecondsElapsed();};
Application.prototype.getTime           = function(){return this._appImpl.getTime();};
Application.prototype.getTimeStart      = function(){return this._appImpl.getTimeStart();};
Application.prototype.getTimeNext       = function(){return this._appImpl.getTimeNext();};
Application.prototype.getTimeDelta      = function(){return this._appImpl.getTimeDelta();};

Application.prototype.getAspectRatioWindow = function(){return this._appImpl.getAspectRatio();};

Application.__instance = null;
Application.getInstance = function(){return Application.__instance;};

module.exports = Application;






},{"../graphics/fCameraBasic":16,"../system/fError":38,"../system/fPlatform":39,"../util/fMouse":41,"./fAppImplPlask":3,"./fAppImplWeb":4}],6:[function(require,module,exports){
/**
 *
 * glKit.js - A WebGL toolbox
 *
 * glKit.js is available under the terms of the MIT license.  The full text of the
 * MIT license is included below.
 *
 * MIT License
 * ===========
 *
 * Copyright (c) 2012 Henryk Wollik. All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */

module.exports =
{
    Math        : require('./math/fMath'),
    Vec2        : require('./math/fVec2'),
    Vec3        : require('./math/fVec3'),
    Vec4        : require('./math/fVec4'),
    Mat33       : require('./math/fMat33'),
    Mat44       : require('./math/fMat44'),
    Quaternion  : require('./math/fQuaternion'),


    MatGL        : require('./graphics/gl/fMatGL'),
    ProgLoader   : require('./graphics/gl/shader/fProgLoader'),
    ShaderLoader : require('./graphics/gl/shader/fShaderLoader'),
    CameraBasic  : require('./graphics/fCameraBasic'),

    Light            : require('./graphics/gl/fLight'),
    PointLight       : require('./graphics/gl/fPointLight'),
    DirectionalLight : require('./graphics/gl/fDirectionalLight'),
    SpotLight        : require('./graphics/gl/fSpotLight'),

    Material    : require('./graphics/gl/fMaterial'),
    Texture     : require('./graphics/gl/fTexture'),

    fGLUtil     : require('./graphics/util/fGLUtil'),
    fGL         : require('./graphics/fGL'),

    Mouse       : require('./util/fMouse'),
    Color       : require('./util/fColor'),
    Util        : require('./util/fUtil'),

    Platform    : require('./system/fPlatform'),

    Geom3d            : require('./geom/fGeom3d'),
    ParametricSurface : require('./geom/fParametricSurface'),
    ISOSurface        : require('./geom/fISOSurface'),
    ISOBand           : require('./geom/fISOBand'),
    LineBuffer2d      : require('./geom/fLineBuffer2d'),
    LineBuffer3d      : require('./geom/fLineBuffer3d'),
    Spline            : require('./geom/fSpline'),
    Line2dUtil        : require('./geom/fLine2dUtil'),
    Polygon2dUtil     : require('./geom/fPolygon2dUtil'),


    Application : require('./app/fApplication')

};


},{"./app/fApplication":5,"./geom/fGeom3d":7,"./geom/fISOBand":8,"./geom/fISOSurface":9,"./geom/fLine2dUtil":10,"./geom/fLineBuffer2d":11,"./geom/fLineBuffer3d":12,"./geom/fParametricSurface":13,"./geom/fPolygon2dUtil":14,"./geom/fSpline":15,"./graphics/fCameraBasic":16,"./graphics/fGL":17,"./graphics/gl/fDirectionalLight":18,"./graphics/gl/fLight":19,"./graphics/gl/fMatGL":20,"./graphics/gl/fMaterial":21,"./graphics/gl/fPointLight":22,"./graphics/gl/fSpotLight":23,"./graphics/gl/fTexture":24,"./graphics/gl/shader/fProgLoader":26,"./graphics/gl/shader/fShaderLoader":28,"./graphics/util/fGLUtil":29,"./math/fMat33":30,"./math/fMat44":31,"./math/fMath":32,"./math/fQuaternion":33,"./math/fVec2":34,"./math/fVec3":35,"./math/fVec4":36,"./system/fPlatform":39,"./util/fColor":40,"./util/fMouse":41,"./util/fUtil":42}],7:[function(require,module,exports){
function Geom3d()
{
    this.vertices  = null;
    this.normals   = null;
    this.colors    = null;
    this.indices   = null;
    this.texCoords = null;
}

//TODO merge
Geom3d.prototype.updateVertexNormals = function()
{
    var indices  = this.indices,
        vertices = this.vertices,
        normals  = this.normals;

    var i;
    var a, b, c;
    var e2x, e2y, e2z,
        e1x, e1y, e1z;

    var nx, ny, nz,
        vbx, vby, vbz,
        a0, a1, a2,
        b0, b1, b2,
        c0, c1, c2;

    i = 0;
    while( i < normals.length )
    {
        normals[i] = normals[i+1] = normals[i+2] = 0.0;
        i+=3;
    }

    i = 0;
    while( i < indices.length )
    {
        a = indices[i  ]*3;
        b = indices[i+1]*3;
        c = indices[i+2]*3;

        a0 = a;
        a1 = a+1;
        a2 = a+2;

        b0 = b;
        b1 = b+1;
        b2 = b+2;

        c0 = c;
        c1 = c+1;
        c2 = c+2;

        vbx = vertices[b0];
        vby = vertices[b1];
        vbz = vertices[b2];

        e1x = vertices[a0]-vbx;
        e1y = vertices[a1]-vby;
        e1z = vertices[a2]-vbz;

        e2x = vertices[c0]-vbx;
        e2y = vertices[c1]-vby;
        e2z = vertices[c2]-vbz;

        nx = e1y * e2z - e1z * e2y;
        ny = e1z * e2x - e1x * e2z;
        nz = e1x * e2y - e1y * e2x;

        normals[a0] += nx;
        normals[a1] += ny;
        normals[a2] += nz;

        normals[b0] += nx;
        normals[b1] += ny;
        normals[b2] += nz;

        normals[c0] += nx;
        normals[c1] += ny;
        normals[c2] += nz;

        i+=3;
    }

    var x, y, z, l;

    i = 0;
    while(i < normals.length)
    {

        x = normals[i  ];
        y = normals[i+1];
        z = normals[i+2];

        l = Math.sqrt(x*x+y*y+z*z);
        l = 1 / (l || 1);

        normals[i  ] *= l;
        normals[i+1] *= l;
        normals[i+2] *= l;

        i+=3;
    }

};


Geom3d.prototype.setVertex = function(index,v)
{
    index *= 3;
    var vertices = this.vertices;
    vertices[index  ] = v[0];
    vertices[index+1] = v[1];
    vertices[index+2] = v[2];
};

Geom3d.prototype.setVertex3f = function(index,x,y,z)
{
    index*=3;
    var vertices = this.vertices;
    vertices[index  ] = x;
    vertices[index+1] = y;
    vertices[index+2] = z;
};

Geom3d.prototype.setColor4f = function(index,r,g,b,a)
{
    index *= 4;
    var colors = this.colors;
    colors[index  ] = r;
    colors[index+1] = g;
    colors[index+2] = b;
    colors[index+3] = a;
};

Geom3d.prototype.setColor3f = function(index,r,g,b)
{
    index *= 4;
    var colors = this.colors;
    colors[index  ] = r;
    colors[index+1] = g;
    colors[index+2] = b;
};

Geom3d.prototype.setColor2f = function(index,k,a)
{
    index *= 4;
    var colors = this.colors;
    colors[index  ] = k;
    colors[index+1] = k;
    colors[index+2] = k;
    colors[index+3] = a;
};

Geom3d.prototype.setColor1f = function(index,k)
{
    index *= 4;
    var colors = this.colors;
    colors[index  ] = k;
    colors[index+1] = k;
    colors[index+2] = k;
};

Geom3d.prototype.setColor = function(index,color)
{
    index*=4;
    var colors = this.colors;
    colors[index  ] = color[0];
    colors[index+1] = color[1];
    colors[index+2] = color[2];
    colors[index+3] = color[3];
};

Geom3d.prototype.setTexCoord2f = function(index,u,v)
{
    index*=2;
    var texCoords = this.texCoords;
    texCoords[index  ] = u;
    texCoords[index+1] = v;
};

Geom3d.prototype.setTexCoord = function(index,v)
{
    index*=2;
    var texCoords = this.texCoords;
    texCoords[index  ] = v[0];
    texCoords[index+1] = v[1];
};


Geom3d.prototype._draw = function(gl)
{
    gl.drawElements(this.vertices,this.normals,this.colors,this.texCoords,this.indices,gl._drawMode);
};

module.exports = Geom3d;
},{}],8:[function(require,module,exports){
var Geom3d = require('./fGeom3d');

function ISOBand(sizeX,sizeZ,unitScaleX,unitScaleZ)
{
    this._vertSizeX  = null;
    this._vertSizeZ  = null;
    this._unitScaleX = 1;
    this._unitScaleZ = 1;

    switch(arguments.length)
    {
        case 1:
            this._vertSizeX = this._vertSizeZ = arguments[0];
            break;
        case 2:
            this._vertSizeX = arguments[0];
            this._vertSizeZ = arguments[1];
            break;
        case 3:
            this._vertSizeX = arguments[0];
            this._vertSizeZ = arguments[1];
            this._unitScaleX = this._unitScaleZ = arguments[2];
            break;
        case 4:
            this._vertSizeX  = arguments[0];
            this._vertSizeZ  = arguments[1];
            this._unitScaleX = arguments[2];
            this._unitScaleZ = arguments[3];
            break;
        default :
            this._vertSizeX = this._vertSizeZ = 3;
            break;
    }

    /*---------------------------------------------------------------------------------------------------------*/


    this._cellSizeX = this._vertSizeX - 1;
    this._cellSizeZ = this._vertSizeZ - 1;

    this._func     = function(x,y,arg0,arg1,arg2){return 0;};
    this._funcArg0 = 0;
    this._funcArg1 = 0;
    this._funcArg2 = 0;
    this._isoLevel = 0;

    this._interpolateValues = true;

    this._numTriangles = 0;

    //TODO CHECK MAX ELEMENT EXCEED
    this._verts = new Float32Array(this._vertSizeX * this._vertSizeZ * 4); // grid calculated norm values + function result value ...,x,y,z,v,...
    this._cells = new Array(this._cellSizeX * this._cellSizeZ);

    this._edges = new Float32Array((this._cellSizeZ * this._cellSizeX * 2 +
                                    this._cellSizeZ + this._cellSizeX) * 3);


    this._tempCellVerticesVals = new Float32Array(4);

    this._indices = [];

    /*
    //temp TODO remove
    this.__appUintTypeEnabled = Foam.Application.getInstance().gl.isUIntElementTypeAvailable();
    */

    /*---------------------------------------------------------------------------------------------------------*/

    this._genSurface();
}

/*---------------------------------------------------------------------------------------------------------*/

ISOBand.prototype = Object.create(Geom3d.prototype);

/*---------------------------------------------------------------------------------------------------------*/


//dont need this
ISOBand.prototype.setFunction = function(func,isoLevel)
{
    var funcArgsLength = func.length;

    if(funcArgsLength < 2)throw 'Function should satisfy function(x,y){}';
    if(funcArgsLength > 5)throw 'Function has to many arguments. Arguments length should not exceed 5. E.g function(x,y,arg0,arg1,arg2).';

    var funcString = func.toString(),
        funcArgs   = funcString.slice(funcString.indexOf('(') + 1, funcString.indexOf(')')).split(','),
        funcBody   = funcString.slice(funcString.indexOf('{') + 1, funcString.lastIndexOf('}'));

    this._func     = new Function(funcArgs[0], funcArgs[1],
        funcArgs[2] || 'arg0', funcArgs[3] || 'arg1', funcArgs[4] || 'arg2',
        funcBody);
    this._isoLevel = isoLevel || 0;


};

/*---------------------------------------------------------------------------------------------------------*/
// Setup points
/*---------------------------------------------------------------------------------------------------------*/

ISOBand.prototype._genSurface = function()
{
    var vertSizeX = this._vertSizeX,
        vertSizeZ = this._vertSizeZ;

    var cellSizeX = this._cellSizeX,
        cellSizeZ = this._cellSizeZ;

    var scaleX = this._unitScaleX,
        scaleZ = this._unitScaleZ;

    var verts = this._verts,
        vertsIndex,
        vertsIndexRowNext,
        cells = this._cells,
        cellsIndex;

    var i,j;

    i = -1;
    while(++i < vertSizeZ)
    {
        j = -1;
        while(++j < vertSizeX)
        {
            vertsIndex          = (vertSizeX * i + j)*4;
            verts[vertsIndex  ] = (-0.5 + (j/(vertSizeX - 1))) * scaleX;
            verts[vertsIndex+1] = 0;
            verts[vertsIndex+2] = (-0.5 + (i/(vertSizeZ - 1))) * scaleZ;
            verts[vertsIndex+3] = -1;

            if(i < cellSizeZ && j < cellSizeX)
            {
                vertsIndexRowNext = (vertSizeX * i + j + vertSizeX) * 4;

                cellsIndex        = cellSizeX * i + j;
                cells[cellsIndex] = [vertsIndex,
                                     vertsIndex + 4,
                                     vertsIndexRowNext + 4,
                                     vertsIndexRowNext ];

            }
        }
    }
};

/*---------------------------------------------------------------------------------------------------------*/
// apply function to data points
/*---------------------------------------------------------------------------------------------------------*/

ISOBand.prototype.applyFunction = function(arg0,arg1,arg2)
{
    var verts = this._verts,
        vertsIndex;

    var vertSizeX = this._vertSizeX,
        vertSizeZ = this._vertSizeZ;

    var i, j;

    i = -1;
    while(++i < vertSizeZ)
    {
        j = -1;
        while(++j < vertSizeX)
        {
            vertsIndex = (vertSizeX * i + j) * 4;
            verts[vertsIndex + 3] = this._func(verts[vertsIndex],verts[vertsIndex+2],arg0,arg1,arg2);
        }
    }

    this.march();
};

ISOBand.prototype.applyFunctionMult = function(arg0,arg1,arg2)
{
    var verts = this._verts,
        vertsIndex;

    var vertsSizeX = this._vertSizeX,
        vertsSizeZ = this._vertSizeZ;

    var i, j;

    i = -1;
    while(++i < vertsSizeZ)
    {
        j = -1;
        while(++j < vertsSizeX)
        {
            vertsIndex = (vertsSizeX * i + j) * 4;
            verts[vertsIndex + 3] *= this._func(verts[vertsIndex],verts[vertsIndex+2],arg0,arg1,arg2);
        }
    }

    this.march();
};

ISOBand.prototype.setData = function(data,width,height)
{

    var vertsSizeX = this._vertSizeX,
        vertsSizeZ = this._vertSizeZ;

    if(width > vertsSizeZ || height > vertsSizeX)
        throw 'Data exceeds buffer size. Should not exceed ' + vertsSizeZ + ' in width and ' + vertsSizeX + ' in height';

    var verts = this._verts;

    var i ,j;
    i = -1;
    while(++i < width)
    {
        j = -1;
        while(++j < height)
        {
            verts[(height * i + j) * 4 + 3] = data[height * i + j];
        }
    }
};



/*---------------------------------------------------------------------------------------------------------*/
// march
/*---------------------------------------------------------------------------------------------------------*/

ISOBand.prototype.march = function()
{
    //reset indices
    var indices = this._indices = [];

    var verts = this._verts;

    var i, j, k;

    var cells    = this._cells,
        indices  = this._indices;

    var cellSizeX = this._cellSizeX,
        cellSizeZ = this._cellSizeZ;

    var cellIndex,
        cell,
        cellState;

    //Cell vertex indices in global vertices
    var v0Index,  // 0 1
        v1Index,  // 3 2
        v2Index,
        v3Index;

    //Cell vertex values ...,x,y,z,VALUE,...
    var vVals = this._tempCellVerticesVals,
        v0Val,v1Val,v2Val,v3Val;

    //Topologic entry / lookup
    var entryTopLu,
        ISOBAND_TOP_LU     = ISOBand.TOP_TABLE;

    var entryTopLu0,
        entryTopLu1,
        entryTopLu2,
        entryTopLu3;

    var edgeIndexTop,
        edgeIndexRight,
        edgeIndexBottom,
        edgeIndexLeft,
        edgeIndexTemp;

    var edges = this._edges;


    //
    //  0 ------- 1
    //  |    0    |
    //  | 1       | 2
    //  |         |
    //  3 ------- 2
    //       3


    i = -1;
    while(++i < cellSizeZ)
    {
        j = -1;
        while(++j < cellSizeX)
        {
            cellIndex        = cellSizeX * i + j;
            cell             = cells[cellIndex];

            v0Index = cell[0];
            v1Index = cell[1];
            v2Index = cell[2];
            v3Index = cell[3];

            v0Val = vVals[0] = verts[v0Index + 3];
            v1Val = vVals[1] = verts[v1Index + 3];
            v2Val = vVals[2] = verts[v2Index + 3];
            v3Val = vVals[3] = verts[v3Index + 3];

            cellState = (v0Val > 0) << 3 |
                        (v1Val > 0) << 2 |
                        (v2Val > 0) << 1 |
                        (v3Val > 0);

            if(cellState == 0)continue;

            edgeIndexTop    = cellIndex + (cellSizeX + 1) * i;
            edgeIndexRight  = edgeIndexTop   + cellSizeX + 1;
            edgeIndexBottom = edgeIndexRight + cellSizeX;
            edgeIndexLeft   = edgeIndexRight - 1;

            entryTopLu = ISOBAND_TOP_LU[cellState];

            //cell upper left
            k = 0;
            if(i == 0 && j == 0)
            {

                while(k < entryTopLu.length)
                {
                    entryTopLu0 = entryTopLu[k  ];
                    entryTopLu1 = entryTopLu[k+1];
                    entryTopLu2 = entryTopLu[k+2];
                    entryTopLu3 = entryTopLu[k+3];

                    //get edge vertex 0 according to topological entry
                    //TODO collapse
                    edgeIndexTemp = entryTopLu0 == 0 ? edgeIndexTop :
                                    entryTopLu0 == 1 ? edgeIndexRight :
                                    entryTopLu0 == 2 ? edgeIndexBottom :
                                    edgeIndexLeft;

                    this._intrpl(cell[entryTopLu0],cell[entryTopLu1],edges,edgeIndexTemp * 3);
                    indices.push(edgeIndexTemp);

                    //get edge vertex 1 according to topological entry
                    //TODO collapse
                    edgeIndexTemp = entryTopLu2 == 0 ? edgeIndexTop :
                                    entryTopLu2 == 1 ? edgeIndexRight :
                                    entryTopLu2 == 2 ? edgeIndexBottom :
                                    edgeIndexLeft;

                    this._intrpl(cell[entryTopLu2],cell[entryTopLu3],edges,edgeIndexTemp * 3);
                    indices.push(edgeIndexTemp);

                    k += 4;
                }
            }

            //cells first row after upper left
            //TODO collapse
            if(i == 0 && j > 0)
            {

                while(k < entryTopLu.length)
                {
                    entryTopLu0 = entryTopLu[k  ];
                    entryTopLu1 = entryTopLu[k+1];
                    entryTopLu2 = entryTopLu[k+2];
                    entryTopLu3 = entryTopLu[k+3];

                    //check if edge is on adjacent left side, and push index of edge,
                    //if not, calculate edge, push index of new edge


                    //check first vertex is on left edge
                    if(entryTopLu0 == 3)
                    {
                        //assign previous calculated edge vertex from previous cell
                        indices.push(edgeIndexLeft);

                    }
                    else //calculate edge vertex
                    {
                        edgeIndexTemp = entryTopLu0 == 0 ? edgeIndexTop :
                                        entryTopLu0 == 1 ? edgeIndexRight :
                                        edgeIndexBottom;

                        this._intrpl(cell[entryTopLu0],cell[entryTopLu1],edges,edgeIndexTemp * 3);
                        indices.push(edgeIndexTemp);
                    }

                    //check second vertex is on left edge

                    if(entryTopLu2 == 3)
                    {
                        indices.push(edgeIndexLeft);
                    }
                    else //calculate edge vertex
                    {
                        edgeIndexTemp = entryTopLu2 == 0 ? edgeIndexTop :
                                        entryTopLu2 == 1 ? edgeIndexRight :
                                        edgeIndexBottom;

                        this._intrpl(cell[entryTopLu2],cell[entryTopLu3],edges,edgeIndexTemp * 3);
                        indices.push(edgeIndexTemp);
                    }


                    k += 4;
                }
            }

            //cells first column after upper left
            //TODO collapse
            if(i != 0 && j == 0)
            {

                while(k < entryTopLu.length)
                {

                    //check if edge is on adjacent top side, and push index of edge,
                    //if not, calculate edge, push index of new edge

                    entryTopLu0 = entryTopLu[k  ];
                    entryTopLu1 = entryTopLu[k+1];
                    entryTopLu2 = entryTopLu[k+2];
                    entryTopLu3 = entryTopLu[k+3];

                    //check first vertex is on top edge
                    if(entryTopLu0 == 0)
                    {
                        indices.push(edgeIndexTop);
                    }
                    else
                    {
                        edgeIndexTemp = entryTopLu0 == 1 ? edgeIndexRight :
                                        entryTopLu0 == 2 ? edgeIndexBottom :
                                        edgeIndexLeft;

                        this._intrpl(cell[entryTopLu0],cell[entryTopLu1],edges,edgeIndexTemp * 3);
                        indices.push(edgeIndexTemp)
                    }

                    //check first vertex is on top edge
                    if(entryTopLu2 == 0)
                    {
                        indices.push(edgeIndexTop);
                    }
                    else
                    {
                        edgeIndexTemp = entryTopLu2 == 1 ? edgeIndexRight :
                                        entryTopLu2 == 2 ? edgeIndexBottom :
                                        edgeIndexLeft;

                        this._intrpl(cell[entryTopLu2],cell[entryTopLu3],edges,edgeIndexTemp * 3);
                        indices.push(edgeIndexTemp)
                    }

                    k += 4;
                }

            }

            //check all other cells
            //TODO collapse
            if(i != 0 && j != 0)
            {

                //check if edge is on adjacent left side, and push index of edge,
                //if not, calculate edge, push index of new edge

                while(k < entryTopLu.length)
                {
                    entryTopLu0 = entryTopLu[k  ];
                    entryTopLu1 = entryTopLu[k+1];
                    entryTopLu2 = entryTopLu[k+2];
                    entryTopLu3 = entryTopLu[k+3];

                    //check first vertex is on left edge
                    if(entryTopLu0 == 3)
                    {
                        indices.push(edgeIndexLeft);
                    }
                    else if(entryTopLu0 == 0)//maybe upper cell?
                    {
                        indices.push(edgeIndexTop);
                    }
                    else //calculate edge vertex
                    {
                        edgeIndexTemp = entryTopLu0 == 1 ? edgeIndexRight : edgeIndexBottom;

                        this._intrpl(cell[entryTopLu0],cell[entryTopLu1],edges,edgeIndexTemp * 3);
                        indices.push(edgeIndexTemp);
                    }

                    //check second vertex is on left edge
                    if(entryTopLu2 == 3)
                    {
                        indices.push(edgeIndexLeft);
                    }
                    else if(entryTopLu2 == 0)//maybe upper cell?
                    {
                        indices.push(edgeIndexTop);
                    }
                    else //calculate edge vertex
                    {
                        edgeIndexTemp = entryTopLu2 == 1 ? edgeIndexRight : edgeIndexBottom;

                        this._intrpl(cell[entryTopLu2],cell[entryTopLu3],edges,edgeIndexTemp * 3);
                        indices.push(edgeIndexTemp);
                    }


                    k += 4;
                }
            }
        }
    }

    //temp
    this._indices = this.__appUintTypeEnabled ?  new Uint32Array(indices) :  new Uint16Array(indices);
};

//visual debug need isoline/isoband switch
ISOBand.prototype._draw = function(gl)
{
    var edges   = this._edges,
        colors  = gl.bufferColors(gl.getColorBuffer(),new Float32Array(edges.length/3*4)),
        indices =  this._indices;

     gl.drawElements(edges,null,colors,null,indices,gl.getDrawMode(),indices.length,0,gl.UNSIGNED_SHORT);
};


ISOBand.prototype._intrpl = function(index0,index1,out,offset)
{
    var verts = this._verts;

    var v0x = verts[index0  ],
        v0y = verts[index0+1],
        v0z = verts[index0+2],
        v0v = verts[index0+3];

    var v1x = verts[index1  ],
        v1y = verts[index1+1],
        v1z = verts[index1+2],
        v1v = verts[index1+3];


    if(v0v == 0)
    {
        out[offset+0] = v1x;
        out[offset+1] = v1y;
        out[offset+2] = v1z;

        return;
    }
    else if(v1v == 0)
    {
        out[offset+0] = v0x;
        out[offset+1] = v0y;
        out[offset+2] = v0z;

        return;
    }


    if(this._interpolateValues)
    {
        var v10v = v1v - v0v;

        out[offset+0] = -v0v * (v1x - v0x) / v10v + v0x;
        out[offset+1] = -v0v * (v1y - v0y) / v10v + v0y;
        out[offset+2] = -v0v * (v1z - v0z) / v10v + v0z;
    }
    else
    {
        out[offset+0] =  (v1x - v0x) * 0.5 + v0x;
        out[offset+1] =  (v1y - v0y) * 0.5 + v0y;
        out[offset+2] =  (v1z - v0z) * 0.5 + v0z;
    }
};


ISOBand.prototype.getVertices      = function(){return this._verts;};
ISOBand.prototype.getVerticesSizeX = function(){return this._vertSizeX;};
ISOBand.prototype.getVerticesSizeZ = function(){return this._vertSizeZ;};
ISOBand.prototype.getCells         = function(){return this._cells;};
ISOBand.prototype.getCellsSizeX    = function(){return this._cellSizeX;};
ISOBand.prototype.getCellsSizeZ    = function(){return this._cellSizeZ;};
ISOBand.prototype.getEdges         = function(){return this._edges;};
ISOBand.prototype.getIndices       = function(){return this._indices;};

/*---------------------------------------------------------------------------------------------------------*/
// TOPOLOGICAL
/*---------------------------------------------------------------------------------------------------------*/

//TODO merge
ISOBand.TOP_TABLE =
    [
        [],
        [ 2, 3, 3, 0],
        [ 1, 2, 2, 3],
        [ 1, 2, 3, 0],
        [ 0, 1, 1, 2],
        [ 0, 1, 1, 2, 2, 3, 3, 0],
        [ 0, 1, 2, 3],
        [ 0, 1, 3, 0],
        [ 0, 1, 3, 0],
        [ 0, 1, 2, 3],
        [ 0, 1, 1, 2, 2, 3, 3, 0],
        [ 0, 1, 1, 2],
        [ 1, 2, 3, 0],
        [ 1, 2, 2, 3],
        [ 2, 3, 3, 0],
        []
    ];

/*---------------------------------------------------------------------------------------------------------*/
// TRIANGE
/*---------------------------------------------------------------------------------------------------------*/

//TODO merge
ISOBand.TRI_TABLE =
    [
        [],
        [ 1, 0, 0, 3, 1, 1],
        [ 1, 0, 0, 2, 1, 1],
        [ 1, 0, 0, 2, 0, 3, 0, 3, 1, 1 ,1 ,0 ],
        [ 1, 0, 0, 1, 1, 1],
        [ 1, 0, 0, 1, 1, 1, 1, 1, 1, 2, 1, 3, 1, 2, 0, 3, 1, 3, 1, 3, 1, 0, 1, 1],
        [ 1, 0, 0, 1, 1, 1, 0, 1, 0, 2, 1, 1],
        [ 1, 0, 0, 1, 0, 2, 0, 2, 1, 1, 1, 0, 0, 2, 0, 3, 1, 1 ],
        [ 0, 0, 1, 0, 1, 1],
        [ 0, 0, 1, 0, 0, 3, 1, 0, 1, 1, 0, 3],
        [ 0, 0, 1, 0, 1, 3, 1, 0, 1, 1, 1, 3, 1, 1, 0, 2, 1, 2, 1, 2, 1, 3, 1, 1 ],
        [ 0, 0, 1, 0, 0, 3, 1, 0, 1, 1, 0, 3, 1, 1, 0, 2, 0, 3],
        [ 0, 0, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1],
        [ 0, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 3, 0, 0],
        [ 0, 0, 0, 1, 1, 1, 0, 1, 0, 2, 1, 0, 1, 0, 1, 1, 0, 1],
        [ 0, 0, 0, 1, 0, 3, 0, 1, 0, 2, 0, 3]
    ];


module.exports = ISOBand;

},{"./fGeom3d":7}],9:[function(require,module,exports){
var Vec3   = require('../math/fVec3'),
    Vec4   = require('../math/fVec4'),
    Geom3d = require('./fGeom3d');


//This is just an initial version
function ISOSurface(sizeX,sizeY,sizeZ)
{
    this._vertSizeX = null;
    this._vertSizeY = null;
    this._vertSizeZ = null;

    switch(arguments.length)
    {
        case 1:
            this._vertSizeX = this._vertSizeY = this._vertSizeZ = arguments[0];
            break;
        case 3:
            this._vertSizeX = arguments[0];
            this._vertSizeY = arguments[1];
            this._vertSizeZ = arguments[2];
            break;
        default :
            this._vertSizeX = this._vertSizeY = this._vertSizeZ = 3;
            break;
    }

    this._cubeSizeX = this._vertSizeX - 1;
    this._cubeSizeY = this._vertSizeY - 1;
    this._cubeSizeZ = this._vertSizeZ - 1;

    this._delayedClear = false;

    //TODO:FIX!!
    this._func      = function(x,y,z,arg0,arg1,arg2){return 0;};
    this._funcArg0  = 0;
    this._funcArg1  = 0;
    this._funcArg2  = 0;
    this._isoLevel  = 0;

    //TODO: unroll
    this._verts = new Array(this._vertSizeX*this._vertSizeY*this._vertSizeZ);
    this._cubes = new Array(this._cubeSizeX*this._cubeSizeY*this._cubeSizeZ);

    this._numTriangles = 0;

    var SIZE_OF_TRIANGLE   = 3,
        SIZE_OF_CUBE_EDGES = 12;
    var MAX_BUFFER_LEN     = this._cubes.length * 4;

    this._bVertices = new Float32Array((MAX_BUFFER_LEN)*SIZE_OF_TRIANGLE*Vec3.SIZE);
    this._bNormals  = new Float32Array((MAX_BUFFER_LEN)*SIZE_OF_TRIANGLE*Vec3.SIZE);
    this._bColors   = new Float32Array((MAX_BUFFER_LEN)*SIZE_OF_TRIANGLE*Vec4.SIZE);

    this._tempVertices = new Array(SIZE_OF_CUBE_EDGES*Vec3.SIZE);
    this._tempNormals  = new Array(SIZE_OF_CUBE_EDGES);

    this._scaleXYZ = [1,1,1];

    this._genSurface();

}

ISOSurface.prototype = Object.create(Geom3d.prototype);


/*---------------------------------------------------------------------------------------------------------*/
//
//
//           2 ------- 3    Vertex order
//          /|        /|
//         / |       / |
//        6 ------- 7  |
//        |  0 -----|- 1
//        | /       | /
//        |/        |/
//        4 ------- 5
//
//
//           2 ------> 3    March order
//              \
//                \
//        6 ------> 7
//           0 ------> 1
//             \
//               \
//        4 ------> 5
//
//


ISOSurface.prototype.update = function()
{

    /*---------------------------------------------------------------------------------------------------------*/

    var verts = this._verts;

    var cubeSizeX  = this._cubeSizeX,
        cubeSizeY  = this._cubeSizeY,
        cubeSizeZ  = this._cubeSizeZ,
        cubeSizeZY = cubeSizeZ * cubeSizeY;

    var cubes = this._cubes,
        cube;

    var marchIndex;

    var EDGE_TABLE = ISOSurface.EDGE_TABLE,
        TRI_TABLE  = ISOSurface.TRI_TABLE;

    var v0,v1,v2,v3,v4,v5,v6,v7;
    var val0,val1,val2,val3,val4,val5,val6,val7;

    var cubeIndex;
    var isoLevel = this._isoLevel;
    var bits;

    var bVertices   = this._bVertices,
        bNormals    = this._bNormals,
        bNormalsLen = bNormals.length,
        bVertIndex;

    var vertIndex0, vertIndex1, vertIndex2,
        vertIndex3, vertIndex4, vertIndex5,
        vertIndex6, vertIndex7, vertIndex8;

    var v0x,v0y,v0z,
        v1x,v1y,v1z,
        v2x,v2y,v2z;

    var e2x, e2y, e2z,
        e1x, e1y, e1z;

    var v0Index,
        v1Index,
        v2Index;

    var nx, ny, nz,
        vbx, vby, vbz;


    var i, j, k;

    this._numTriangles = 0;

    /*---------------------------------------------------------------------------------------------------------*/

    i = -1;
    while(++i<bNormalsLen)bNormals[i]=0.0;


    i = -1;
    while(++i < cubeSizeZ)
    {
        j = -1;
        while(++j < cubeSizeY)
        {
            k = -1;
            while(++k < cubeSizeX)
            {
                /*---------------------------------------------------------------------------------------------------------*/

                marchIndex = i * cubeSizeZY + j * cubeSizeZ + k;
                cube       = cubes[marchIndex];

                //access vertices of cube
                v0 = verts[cube[0]];
                v1 = verts[cube[1]];
                v2 = verts[cube[2]];
                v3 = verts[cube[3]];
                v4 = verts[cube[4]];
                v5 = verts[cube[5]];
                v6 = verts[cube[6]];
                v7 = verts[cube[7]];

                val0 = v0[3];
                val1 = v1[3];
                val2 = v2[3];
                val3 = v3[3];
                val4 = v4[3];
                val5 = v5[3];
                val6 = v6[3];
                val7 = v7[3];

                /*---------------------------------------------------------------------------------------------------------*/

                cubeIndex = 0;

                if(val0<isoLevel) cubeIndex |= 1;
                if(val1<isoLevel) cubeIndex |= 2;
                if(val2<isoLevel) cubeIndex |= 8;
                if(val3<isoLevel) cubeIndex |= 4;
                if(val4<isoLevel) cubeIndex |= 16;
                if(val5<isoLevel) cubeIndex |= 32;
                if(val6<isoLevel) cubeIndex |= 128;
                if(val7<isoLevel) cubeIndex |= 64;

                bits = EDGE_TABLE[cubeIndex];

                if(bits === 0)continue;

                /*---------------------------------------------------------------------------------------------------------*/

                var tempVertices = this._tempVertices,
                    tempNormals  = this._tempNormals;

                if (bits & 1)
                {
                    this._intrpl(v0, v1, tempVertices, 0);
                    this._normal(tempVertices,0,tempNormals,0);
                }
                if (bits & 2)
                {
                    this._intrpl(v1, v3, tempVertices, 1);
                    this._normal(tempVertices,1,tempNormals,1);
                }
                if (bits & 4)
                {
                    this._intrpl(v2, v3, tempVertices, 2);
                    this._normal(tempVertices,2,tempNormals,2);
                }
                if (bits & 8)
                {
                    this._intrpl(v0, v2, tempVertices, 3);
                    this._normal(tempVertices,3,tempNormals,3);
                }

                if (bits & 16)
                {
                    this._intrpl(v4, v5, tempVertices, 4);
                    this._normal(tempVertices,4,tempNormals,4);
                }
                if (bits & 32)
                {
                    this._intrpl(v5, v7, tempVertices, 5);
                    this._normal(tempVertices,5,tempNormals,5);
                }
                if (bits & 64)
                {
                    this._intrpl(v6, v7, tempVertices, 6);
                    this._normal(tempVertices,6,tempNormals,6);
                }
                if (bits & 128)
                {
                    this._intrpl(v4, v6, tempVertices, 7);
                    this._normal(tempVertices,7,tempNormals,7);
                }

                if (bits & 256)
                {
                    this._intrpl(v0, v4, tempVertices, 8);
                    this._normal(tempVertices,8,tempNormals,8);
                }
                if (bits & 512)
                {
                    this._intrpl(v1, v5, tempVertices, 9);
                    this._normal(tempVertices,9,tempNormals,9);
                }
                if (bits & 1024)
                {
                    this._intrpl(v3, v7, tempVertices, 10);
                    this._normal(tempVertices,10,tempNormals,10);
                }
                if (bits & 2048)
                {
                    this._intrpl(v2, v6, tempVertices, 11);
                    this._normal(tempVertices,11,tempNormals,11);
                }


                /*---------------------------------------------------------------------------------------------------------*/

                var l = 0;
                cubeIndex <<= 4;


                while(TRI_TABLE[cubeIndex + l] != -1)
                {
                    /*---------------------------------------------------------------------------------------------------------*/

                    //get indices of triangle vertices
                    v0Index = TRI_TABLE[cubeIndex + l    ] * 3;
                    v1Index = TRI_TABLE[cubeIndex + l + 1] * 3;
                    v2Index = TRI_TABLE[cubeIndex + l + 2] * 3;

                    bVertIndex = this._numTriangles * 9;

                    vertIndex0 = bVertIndex;
                    vertIndex1 = bVertIndex+1;
                    vertIndex2 = bVertIndex+2;
                    vertIndex3 = bVertIndex+3;
                    vertIndex4 = bVertIndex+4;
                    vertIndex5 = bVertIndex+5;
                    vertIndex6 = bVertIndex+6;
                    vertIndex7 = bVertIndex+7;
                    vertIndex8 = bVertIndex+8;

                    //store triangle vertices in 'global' vertex buffer + local caching
                    v0x = bVertices[vertIndex0] = tempVertices[v0Index];
                    v0y = bVertices[vertIndex1] = tempVertices[v0Index+1];
                    v0z = bVertices[vertIndex2] = tempVertices[v0Index+2];

                    v1x = bVertices[vertIndex3] = tempVertices[v1Index];
                    v1y = bVertices[vertIndex4] = tempVertices[v1Index+1];
                    v1z = bVertices[vertIndex5] = tempVertices[v1Index+2];

                    v2x = bVertices[vertIndex6] = tempVertices[v2Index];
                    v2y = bVertices[vertIndex7] = tempVertices[v2Index+1];
                    v2z = bVertices[vertIndex8] = tempVertices[v2Index+2];

                    /*---------------------------------------------------------------------------------------------------------*/

                    //calc face normals - per face - naive TODO:FIXME!
                    /*
                    vbx = v1x;
                    vby = v1y;
                    vbz = v1z;

                    e1x = v0x-vbx;
                    e1y = v0y-vby;
                    e1z = v0z-vbz;

                    e2x = v2x-vbx;
                    e2y = v2y-vby;
                    e2z = v2z-vbz;

                    nx = e1y * e2z - e1z * e2y;
                    ny = e1z * e2x - e1x * e2z;
                    nz = e1x * e2y - e1y * e2x;

                    bNormals[vertIndex0] += nx;
                    bNormals[vertIndex1] += ny;
                    bNormals[vertIndex2] += nz;
                    bNormals[vertIndex3] += nx;
                    bNormals[vertIndex4] += ny;
                    bNormals[vertIndex5] += nz;
                    bNormals[vertIndex6] += nx;
                    bNormals[vertIndex7] += ny;
                    bNormals[vertIndex8] += nz;

                    */

                    bNormals[vertIndex0] = tempNormals[v0Index  ];
                    bNormals[vertIndex1] = tempNormals[v0Index+1];
                    bNormals[vertIndex2] = tempNormals[v0Index+2];
                    bNormals[vertIndex3] = tempNormals[v1Index  ];
                    bNormals[vertIndex4] = tempNormals[v1Index+1];
                    bNormals[vertIndex5] = tempNormals[v1Index+2];
                    bNormals[vertIndex6] = tempNormals[v2Index  ];
                    bNormals[vertIndex7] = tempNormals[v2Index+1];
                    bNormals[vertIndex8] = tempNormals[v2Index+2];

                    /*---------------------------------------------------------------------------------------------------------*/

                    l+=3;
                    this._numTriangles++;
                }

                /*---------------------------------------------------------------------------------------------------------*/


            }
        }
    }
};


/*---------------------------------------------------------------------------------------------------------*/

ISOSurface.prototype._intrpl = function(v0,v1,vertList,index)
{
    index *= 3;

    var v0v = v0[3],
        v1v = v1[3];

    var isoLevel = this._isoLevel;

    if(Math.abs(isoLevel - v0v) < 0.00001)
    {
        vertList[index    ] = v0[0];
        vertList[index + 1] = v0[1];
        vertList[index + 2] = v0[2];
        return;
    }

    if(Math.abs(isoLevel - v1v) < 0.00001)
    {
        vertList[index    ] = v1[0];
        vertList[index + 1] = v1[1];
        vertList[index + 2] = v1[2];
        return;
    }

    if(Math.abs(v0v - v1v) < 0.00001)
    {
        vertList[index    ] = v1[0];
        vertList[index + 1] = v1[1];
        vertList[index + 2] = v1[2];
        return;
    }


    var intrpl  = (isoLevel - v0v) / (v1v - v0v);

    var v0x = v0[0],
        v0y = v0[1],
        v0z = v0[2];

    vertList[index    ] = v0x + (v1[0] - v0x) * intrpl;
    vertList[index + 1] = v0y + (v1[1] - v0y) * intrpl;
    vertList[index + 2] = v0z + (v1[2] - v0z) * intrpl;
};

/*---------------------------------------------------------------------------------------------------------*/

ISOSurface.prototype._normal = function(vertList,vertIndex,normList,normIndex)
{
    vertIndex *= 3;

    var x = vertList[vertIndex   ],
        y = vertList[vertIndex+1],
        z = vertList[vertIndex+2];

    var arg0 = this._funcArg0,
        arg1 = this._funcArg1,
        arg2 = this._funcArg2;

    var eps = 0.0003;

    var val = this._func(x,y,z,arg0,arg1,arg2);

    var nx = this._func(x + eps,y , z, arg0, arg1, arg2) - val,
        ny = this._func(x, y + eps, z, arg0, arg1, arg2) - val,
        nz = this._func(x, y, z + eps, arg0, arg1, arg2) - val,
        d  = 1 / Math.sqrt(nx*nx+ny*ny+nz*nz);


    normIndex *= 3;

    normList[normIndex]   = x*d*-1;
    normList[normIndex+1] = y*d*-1;
    normList[normIndex+2] = z*d*-1;

};

/*---------------------------------------------------------------------------------------------------------*/

ISOSurface.prototype.setCloseSides = function(bool){}

ISOSurface.prototype.setFunction = function(func,isoLevel)
{
    var funcArgsLength = func.length;

    if(funcArgsLength < 3)throw 'Function should satisfy function(x,y,z){}';
    if(funcArgsLength > 6)throw 'Function has to many arguments. Arguments length should not exceed 6. E.g function(x,y,z,arg0,arg1,arg2).';

    var funcString = func.toString(),
        funcArgs   = funcString.slice(funcString.indexOf('(') + 1, funcString.indexOf(')')).split(','),
        funcBody   = funcString.slice(funcString.indexOf('{') + 1, funcString.lastIndexOf('}'));

    this._func     = new Function(funcArgs[0], funcArgs[1], funcArgs[2],
                                  funcArgs[3] || 'arg0', funcArgs[4] || 'arg1', funcArgs[5] || 'arg2',
                                  funcBody);
    this._isoLevel = isoLevel || 0;
};

ISOSurface.prototype.setFunctionUnsafe = function(func,isoLevel)
{
    this._func     = func;
    this._isoLevel = isoLevel || 0;
};

ISOSurface.prototype.getFunction = function(){return this._func;};
ISOSurface.prototype.setISOLevel = function(isoLevel){this._isoLevel = isoLevel;};

ISOSurface.prototype.applyFunction   = function()         {this.applyFunction3f(0,0,0);};
ISOSurface.prototype.applyFunction1f = function(arg0)     {this.applyFunction3f(arg0,0,0);};
ISOSurface.prototype.applyFunction2f = function(arg0,arg1){this.applyFunction3f(arg0,arg1,0);};

ISOSurface.prototype.applyFunction3f = function(arg0,arg1,arg2)
{
    var vertSizeX  = this._vertSizeX,
        vertSizeY  = this._vertSizeY,
        vertSizeZ  = this._vertSizeZ,
        vertSizeYX = vertSizeY * vertSizeX;

    var verts = this._verts,
        vert, vertsIndex;

    var i, j, k;

    this._funcArg0 = arg0;
    this._funcArg1 = arg1;
    this._funcArg2 = arg2;

    i = -1;

    while(++i < vertSizeZ)
    {
        j = -1;
        while(++j < vertSizeY)
        {
            k = -1;
            while(++k < vertSizeX)
            {
                vertsIndex = i * vertSizeYX + j * vertSizeX + k;
                vert       = verts[vertsIndex];
                vert[3]    = this._func(vert[0],vert[1],vert[2],arg0,arg1,arg2);
            }
        }
    }
};

/*---------------------------------------------------------------------------------------------------------*/


ISOSurface.prototype._genSurface = function()
{
    var vertSizeX  = this._vertSizeX,
        vertSizeY  = this._vertSizeY,
        vertSizeZ  = this._vertSizeZ,
        vertSizeZY = vertSizeZ * vertSizeY,
        vertSizeXY = vertSizeX * vertSizeY;

    var verts = this._verts,
        vertsIndex;

    var cubeSizeX  = this._cubeSizeX,
        cubeSizeY  = this._cubeSizeY,
        cubeSizeZ  = this._cubeSizeZ,
        cubeSizeZY = cubeSizeY * cubeSizeZ;

    var cubes = this._cubes,
        cellsIndex;

    var scaleXYZ = this._scaleXYZ;

    var i, j, k;

    i = -1;

    while(++i < vertSizeZ)
    {
        j = -1;
        while(++j < vertSizeY)
        {
            k = -1;
            while(++k < vertSizeX)
            {
                vertsIndex        = i * vertSizeZY + j * vertSizeZ + k;

                verts[vertsIndex] = [(-0.5 + ( k / (vertSizeX - 1))) * scaleXYZ[0],
                                     (-0.5 + ( j / (vertSizeY - 1))) * scaleXYZ[1],
                                     (-0.5 + ( i / (vertSizeZ - 1))) * scaleXYZ[2],
                    -1];


                if(i < cubeSizeX && j < cubeSizeY && k  < cubeSizeZ)
                {
                    cellsIndex = i * cubeSizeZY + j * cubeSizeX + k;

                    cubes[cellsIndex] = [
                        vertsIndex,
                        vertsIndex + 1,
                        vertsIndex + vertSizeZ,
                        vertsIndex + vertSizeZ + 1,

                        vertsIndex + vertSizeXY,
                        vertsIndex + vertSizeXY + 1,
                        vertsIndex + vertSizeZ + vertSizeXY,
                        vertsIndex + vertSizeZ + vertSizeXY + 1
                    ];

                }
            }
        }
    }

};

/*---------------------------------------------------------------------------------------------------------*/

ISOSurface.prototype._draw = function(gl)
{
    gl.disableDefaultTexCoordsAttribArray();
    gl.enableDefaultNormalAttribArray();

    var _gl = gl.gl;

    var glArrayBuffer = _gl.ARRAY_BUFFER,
        glFloat       = _gl.FLOAT;

    var vertices = this._bVertices,
        normals  = this._bNormals,
        colors   = this._bColors;

    var vblen = vertices.byteLength,
        nblen = normals.byteLength,
        cblen = colors.byteLength;

    var offsetV = 0,
        offsetN = offsetV + vblen,
        offsetC = offsetN + nblen;

    _gl.bufferData(glArrayBuffer, vblen + nblen + cblen, _gl.DYNAMIC_DRAW);

    _gl.bufferSubData(glArrayBuffer, offsetV,  vertices);
    _gl.bufferSubData(glArrayBuffer, offsetN,  normals);
    _gl.bufferSubData(glArrayBuffer, offsetC,  colors);

    _gl.vertexAttribPointer(gl.getDefaultVertexAttrib(), 3, glFloat, false, 0, offsetV);
    _gl.vertexAttribPointer(gl.getDefaultNormalAttrib(), 3, glFloat, false, 0, offsetN);
    _gl.vertexAttribPointer(gl.getDefaultColorAttrib(),  4, glFloat, false, 0, offsetC);

    gl.setMatricesUniform();
    _gl.drawArrays(_gl.TRIANGLES,0,this._numTriangles * 3);
};

/*---------------------------------------------------------------------------------------------------------*/

ISOSurface.EDGE_TABLE = new Int32Array(
    [
        0x0  , 0x109, 0x203, 0x30a, 0x406, 0x50f, 0x605, 0x70c,
        0x80c, 0x905, 0xa0f, 0xb06, 0xc0a, 0xd03, 0xe09, 0xf00,
        0x190, 0x99 , 0x393, 0x29a, 0x596, 0x49f, 0x795, 0x69c,
        0x99c, 0x895, 0xb9f, 0xa96, 0xd9a, 0xc93, 0xf99, 0xe90,
        0x230, 0x339, 0x33 , 0x13a, 0x636, 0x73f, 0x435, 0x53c,
        0xa3c, 0xb35, 0x83f, 0x936, 0xe3a, 0xf33, 0xc39, 0xd30,
        0x3a0, 0x2a9, 0x1a3, 0xaa , 0x7a6, 0x6af, 0x5a5, 0x4ac,
        0xbac, 0xaa5, 0x9af, 0x8a6, 0xfaa, 0xea3, 0xda9, 0xca0,
        0x460, 0x569, 0x663, 0x76a, 0x66 , 0x16f, 0x265, 0x36c,
        0xc6c, 0xd65, 0xe6f, 0xf66, 0x86a, 0x963, 0xa69, 0xb60,
        0x5f0, 0x4f9, 0x7f3, 0x6fa, 0x1f6, 0xff , 0x3f5, 0x2fc,
        0xdfc, 0xcf5, 0xfff, 0xef6, 0x9fa, 0x8f3, 0xbf9, 0xaf0,
        0x650, 0x759, 0x453, 0x55a, 0x256, 0x35f, 0x55 , 0x15c,
        0xe5c, 0xf55, 0xc5f, 0xd56, 0xa5a, 0xb53, 0x859, 0x950,
        0x7c0, 0x6c9, 0x5c3, 0x4ca, 0x3c6, 0x2cf, 0x1c5, 0xcc ,
        0xfcc, 0xec5, 0xdcf, 0xcc6, 0xbca, 0xac3, 0x9c9, 0x8c0,
        0x8c0, 0x9c9, 0xac3, 0xbca, 0xcc6, 0xdcf, 0xec5, 0xfcc,
        0xcc , 0x1c5, 0x2cf, 0x3c6, 0x4ca, 0x5c3, 0x6c9, 0x7c0,
        0x950, 0x859, 0xb53, 0xa5a, 0xd56, 0xc5f, 0xf55, 0xe5c,
        0x15c, 0x55 , 0x35f, 0x256, 0x55a, 0x453, 0x759, 0x650,
        0xaf0, 0xbf9, 0x8f3, 0x9fa, 0xef6, 0xfff, 0xcf5, 0xdfc,
        0x2fc, 0x3f5, 0xff , 0x1f6, 0x6fa, 0x7f3, 0x4f9, 0x5f0,
        0xb60, 0xa69, 0x963, 0x86a, 0xf66, 0xe6f, 0xd65, 0xc6c,
        0x36c, 0x265, 0x16f, 0x66 , 0x76a, 0x663, 0x569, 0x460,
        0xca0, 0xda9, 0xea3, 0xfaa, 0x8a6, 0x9af, 0xaa5, 0xbac,
        0x4ac, 0x5a5, 0x6af, 0x7a6, 0xaa , 0x1a3, 0x2a9, 0x3a0,
        0xd30, 0xc39, 0xf33, 0xe3a, 0x936, 0x83f, 0xb35, 0xa3c,
        0x53c, 0x435, 0x73f, 0x636, 0x13a, 0x33 , 0x339, 0x230,
        0xe90, 0xf99, 0xc93, 0xd9a, 0xa96, 0xb9f, 0x895, 0x99c,
        0x69c, 0x795, 0x49f, 0x596, 0x29a, 0x393, 0x99 , 0x190,
        0xf00, 0xe09, 0xd03, 0xc0a, 0xb06, 0xa0f, 0x905, 0x80c,
        0x70c, 0x605, 0x50f, 0x406, 0x30a, 0x203, 0x109, 0x0
    ]);

ISOSurface.TRI_TABLE = new Int32Array(
    [
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        0, 8, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        0, 1, 9, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        1, 8, 3, 9, 8, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        1, 2, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        0, 8, 3, 1, 2, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        9, 2, 10, 0, 2, 9, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        2, 8, 3, 2, 10, 8, 10, 9, 8, -1, -1, -1, -1, -1, -1, -1,
        3, 11, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        0, 11, 2, 8, 11, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        1, 9, 0, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        1, 11, 2, 1, 9, 11, 9, 8, 11, -1, -1, -1, -1, -1, -1, -1,
        3, 10, 1, 11, 10, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        0, 10, 1, 0, 8, 10, 8, 11, 10, -1, -1, -1, -1, -1, -1, -1,
        3, 9, 0, 3, 11, 9, 11, 10, 9, -1, -1, -1, -1, -1, -1, -1,
        9, 8, 10, 10, 8, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        4, 7, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        4, 3, 0, 7, 3, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        0, 1, 9, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        4, 1, 9, 4, 7, 1, 7, 3, 1, -1, -1, -1, -1, -1, -1, -1,
        1, 2, 10, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        3, 4, 7, 3, 0, 4, 1, 2, 10, -1, -1, -1, -1, -1, -1, -1,
        9, 2, 10, 9, 0, 2, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1,
        2, 10, 9, 2, 9, 7, 2, 7, 3, 7, 9, 4, -1, -1, -1, -1,
        8, 4, 7, 3, 11, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        11, 4, 7, 11, 2, 4, 2, 0, 4, -1, -1, -1, -1, -1, -1, -1,
        9, 0, 1, 8, 4, 7, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1,
        4, 7, 11, 9, 4, 11, 9, 11, 2, 9, 2, 1, -1, -1, -1, -1,
        3, 10, 1, 3, 11, 10, 7, 8, 4, -1, -1, -1, -1, -1, -1, -1,
        1, 11, 10, 1, 4, 11, 1, 0, 4, 7, 11, 4, -1, -1, -1, -1,
        4, 7, 8, 9, 0, 11, 9, 11, 10, 11, 0, 3, -1, -1, -1, -1,
        4, 7, 11, 4, 11, 9, 9, 11, 10, -1, -1, -1, -1, -1, -1, -1,
        9, 5, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        9, 5, 4, 0, 8, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        0, 5, 4, 1, 5, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        8, 5, 4, 8, 3, 5, 3, 1, 5, -1, -1, -1, -1, -1, -1, -1,
        1, 2, 10, 9, 5, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        3, 0, 8, 1, 2, 10, 4, 9, 5, -1, -1, -1, -1, -1, -1, -1,
        5, 2, 10, 5, 4, 2, 4, 0, 2, -1, -1, -1, -1, -1, -1, -1,
        2, 10, 5, 3, 2, 5, 3, 5, 4, 3, 4, 8, -1, -1, -1, -1,
        9, 5, 4, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        0, 11, 2, 0, 8, 11, 4, 9, 5, -1, -1, -1, -1, -1, -1, -1,
        0, 5, 4, 0, 1, 5, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1,
        2, 1, 5, 2, 5, 8, 2, 8, 11, 4, 8, 5, -1, -1, -1, -1,
        10, 3, 11, 10, 1, 3, 9, 5, 4, -1, -1, -1, -1, -1, -1, -1,
        4, 9, 5, 0, 8, 1, 8, 10, 1, 8, 11, 10, -1, -1, -1, -1,
        5, 4, 0, 5, 0, 11, 5, 11, 10, 11, 0, 3, -1, -1, -1, -1,
        5, 4, 8, 5, 8, 10, 10, 8, 11, -1, -1, -1, -1, -1, -1, -1,
        9, 7, 8, 5, 7, 9, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        9, 3, 0, 9, 5, 3, 5, 7, 3, -1, -1, -1, -1, -1, -1, -1,
        0, 7, 8, 0, 1, 7, 1, 5, 7, -1, -1, -1, -1, -1, -1, -1,
        1, 5, 3, 3, 5, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        9, 7, 8, 9, 5, 7, 10, 1, 2, -1, -1, -1, -1, -1, -1, -1,
        10, 1, 2, 9, 5, 0, 5, 3, 0, 5, 7, 3, -1, -1, -1, -1,
        8, 0, 2, 8, 2, 5, 8, 5, 7, 10, 5, 2, -1, -1, -1, -1,
        2, 10, 5, 2, 5, 3, 3, 5, 7, -1, -1, -1, -1, -1, -1, -1,
        7, 9, 5, 7, 8, 9, 3, 11, 2, -1, -1, -1, -1, -1, -1, -1,
        9, 5, 7, 9, 7, 2, 9, 2, 0, 2, 7, 11, -1, -1, -1, -1,
        2, 3, 11, 0, 1, 8, 1, 7, 8, 1, 5, 7, -1, -1, -1, -1,
        11, 2, 1, 11, 1, 7, 7, 1, 5, -1, -1, -1, -1, -1, -1, -1,
        9, 5, 8, 8, 5, 7, 10, 1, 3, 10, 3, 11, -1, -1, -1, -1,
        5, 7, 0, 5, 0, 9, 7, 11, 0, 1, 0, 10, 11, 10, 0, -1,
        11, 10, 0, 11, 0, 3, 10, 5, 0, 8, 0, 7, 5, 7, 0, -1,
        11, 10, 5, 7, 11, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        10, 6, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        0, 8, 3, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        9, 0, 1, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        1, 8, 3, 1, 9, 8, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1,
        1, 6, 5, 2, 6, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        1, 6, 5, 1, 2, 6, 3, 0, 8, -1, -1, -1, -1, -1, -1, -1,
        9, 6, 5, 9, 0, 6, 0, 2, 6, -1, -1, -1, -1, -1, -1, -1,
        5, 9, 8, 5, 8, 2, 5, 2, 6, 3, 2, 8, -1, -1, -1, -1,
        2, 3, 11, 10, 6, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        11, 0, 8, 11, 2, 0, 10, 6, 5, -1, -1, -1, -1, -1, -1, -1,
        0, 1, 9, 2, 3, 11, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1,
        5, 10, 6, 1, 9, 2, 9, 11, 2, 9, 8, 11, -1, -1, -1, -1,
        6, 3, 11, 6, 5, 3, 5, 1, 3, -1, -1, -1, -1, -1, -1, -1,
        0, 8, 11, 0, 11, 5, 0, 5, 1, 5, 11, 6, -1, -1, -1, -1,
        3, 11, 6, 0, 3, 6, 0, 6, 5, 0, 5, 9, -1, -1, -1, -1,
        6, 5, 9, 6, 9, 11, 11, 9, 8, -1, -1, -1, -1, -1, -1, -1,
        5, 10, 6, 4, 7, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        4, 3, 0, 4, 7, 3, 6, 5, 10, -1, -1, -1, -1, -1, -1, -1,
        1, 9, 0, 5, 10, 6, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1,
        10, 6, 5, 1, 9, 7, 1, 7, 3, 7, 9, 4, -1, -1, -1, -1,
        6, 1, 2, 6, 5, 1, 4, 7, 8, -1, -1, -1, -1, -1, -1, -1,
        1, 2, 5, 5, 2, 6, 3, 0, 4, 3, 4, 7, -1, -1, -1, -1,
        8, 4, 7, 9, 0, 5, 0, 6, 5, 0, 2, 6, -1, -1, -1, -1,
        7, 3, 9, 7, 9, 4, 3, 2, 9, 5, 9, 6, 2, 6, 9, -1,
        3, 11, 2, 7, 8, 4, 10, 6, 5, -1, -1, -1, -1, -1, -1, -1,
        5, 10, 6, 4, 7, 2, 4, 2, 0, 2, 7, 11, -1, -1, -1, -1,
        0, 1, 9, 4, 7, 8, 2, 3, 11, 5, 10, 6, -1, -1, -1, -1,
        9, 2, 1, 9, 11, 2, 9, 4, 11, 7, 11, 4, 5, 10, 6, -1,
        8, 4, 7, 3, 11, 5, 3, 5, 1, 5, 11, 6, -1, -1, -1, -1,
        5, 1, 11, 5, 11, 6, 1, 0, 11, 7, 11, 4, 0, 4, 11, -1,
        0, 5, 9, 0, 6, 5, 0, 3, 6, 11, 6, 3, 8, 4, 7, -1,
        6, 5, 9, 6, 9, 11, 4, 7, 9, 7, 11, 9, -1, -1, -1, -1,
        10, 4, 9, 6, 4, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        4, 10, 6, 4, 9, 10, 0, 8, 3, -1, -1, -1, -1, -1, -1, -1,
        10, 0, 1, 10, 6, 0, 6, 4, 0, -1, -1, -1, -1, -1, -1, -1,
        8, 3, 1, 8, 1, 6, 8, 6, 4, 6, 1, 10, -1, -1, -1, -1,
        1, 4, 9, 1, 2, 4, 2, 6, 4, -1, -1, -1, -1, -1, -1, -1,
        3, 0, 8, 1, 2, 9, 2, 4, 9, 2, 6, 4, -1, -1, -1, -1,
        0, 2, 4, 4, 2, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        8, 3, 2, 8, 2, 4, 4, 2, 6, -1, -1, -1, -1, -1, -1, -1,
        10, 4, 9, 10, 6, 4, 11, 2, 3, -1, -1, -1, -1, -1, -1, -1,
        0, 8, 2, 2, 8, 11, 4, 9, 10, 4, 10, 6, -1, -1, -1, -1,
        3, 11, 2, 0, 1, 6, 0, 6, 4, 6, 1, 10, -1, -1, -1, -1,
        6, 4, 1, 6, 1, 10, 4, 8, 1, 2, 1, 11, 8, 11, 1, -1,
        9, 6, 4, 9, 3, 6, 9, 1, 3, 11, 6, 3, -1, -1, -1, -1,
        8, 11, 1, 8, 1, 0, 11, 6, 1, 9, 1, 4, 6, 4, 1, -1,
        3, 11, 6, 3, 6, 0, 0, 6, 4, -1, -1, -1, -1, -1, -1, -1,
        6, 4, 8, 11, 6, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        7, 10, 6, 7, 8, 10, 8, 9, 10, -1, -1, -1, -1, -1, -1, -1,
        0, 7, 3, 0, 10, 7, 0, 9, 10, 6, 7, 10, -1, -1, -1, -1,
        10, 6, 7, 1, 10, 7, 1, 7, 8, 1, 8, 0, -1, -1, -1, -1,
        10, 6, 7, 10, 7, 1, 1, 7, 3, -1, -1, -1, -1, -1, -1, -1,
        1, 2, 6, 1, 6, 8, 1, 8, 9, 8, 6, 7, -1, -1, -1, -1,
        2, 6, 9, 2, 9, 1, 6, 7, 9, 0, 9, 3, 7, 3, 9, -1,
        7, 8, 0, 7, 0, 6, 6, 0, 2, -1, -1, -1, -1, -1, -1, -1,
        7, 3, 2, 6, 7, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        2, 3, 11, 10, 6, 8, 10, 8, 9, 8, 6, 7, -1, -1, -1, -1,
        2, 0, 7, 2, 7, 11, 0, 9, 7, 6, 7, 10, 9, 10, 7, -1,
        1, 8, 0, 1, 7, 8, 1, 10, 7, 6, 7, 10, 2, 3, 11, -1,
        11, 2, 1, 11, 1, 7, 10, 6, 1, 6, 7, 1, -1, -1, -1, -1,
        8, 9, 6, 8, 6, 7, 9, 1, 6, 11, 6, 3, 1, 3, 6, -1,
        0, 9, 1, 11, 6, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        7, 8, 0, 7, 0, 6, 3, 11, 0, 11, 6, 0, -1, -1, -1, -1,
        7, 11, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        7, 6, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        3, 0, 8, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        0, 1, 9, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        8, 1, 9, 8, 3, 1, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1,
        10, 1, 2, 6, 11, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        1, 2, 10, 3, 0, 8, 6, 11, 7, -1, -1, -1, -1, -1, -1, -1,
        2, 9, 0, 2, 10, 9, 6, 11, 7, -1, -1, -1, -1, -1, -1, -1,
        6, 11, 7, 2, 10, 3, 10, 8, 3, 10, 9, 8, -1, -1, -1, -1,
        7, 2, 3, 6, 2, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        7, 0, 8, 7, 6, 0, 6, 2, 0, -1, -1, -1, -1, -1, -1, -1,
        2, 7, 6, 2, 3, 7, 0, 1, 9, -1, -1, -1, -1, -1, -1, -1,
        1, 6, 2, 1, 8, 6, 1, 9, 8, 8, 7, 6, -1, -1, -1, -1,
        10, 7, 6, 10, 1, 7, 1, 3, 7, -1, -1, -1, -1, -1, -1, -1,
        10, 7, 6, 1, 7, 10, 1, 8, 7, 1, 0, 8, -1, -1, -1, -1,
        0, 3, 7, 0, 7, 10, 0, 10, 9, 6, 10, 7, -1, -1, -1, -1,
        7, 6, 10, 7, 10, 8, 8, 10, 9, -1, -1, -1, -1, -1, -1, -1,
        6, 8, 4, 11, 8, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        3, 6, 11, 3, 0, 6, 0, 4, 6, -1, -1, -1, -1, -1, -1, -1,
        8, 6, 11, 8, 4, 6, 9, 0, 1, -1, -1, -1, -1, -1, -1, -1,
        9, 4, 6, 9, 6, 3, 9, 3, 1, 11, 3, 6, -1, -1, -1, -1,
        6, 8, 4, 6, 11, 8, 2, 10, 1, -1, -1, -1, -1, -1, -1, -1,
        1, 2, 10, 3, 0, 11, 0, 6, 11, 0, 4, 6, -1, -1, -1, -1,
        4, 11, 8, 4, 6, 11, 0, 2, 9, 2, 10, 9, -1, -1, -1, -1,
        10, 9, 3, 10, 3, 2, 9, 4, 3, 11, 3, 6, 4, 6, 3, -1,
        8, 2, 3, 8, 4, 2, 4, 6, 2, -1, -1, -1, -1, -1, -1, -1,
        0, 4, 2, 4, 6, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        1, 9, 0, 2, 3, 4, 2, 4, 6, 4, 3, 8, -1, -1, -1, -1,
        1, 9, 4, 1, 4, 2, 2, 4, 6, -1, -1, -1, -1, -1, -1, -1,
        8, 1, 3, 8, 6, 1, 8, 4, 6, 6, 10, 1, -1, -1, -1, -1,
        10, 1, 0, 10, 0, 6, 6, 0, 4, -1, -1, -1, -1, -1, -1, -1,
        4, 6, 3, 4, 3, 8, 6, 10, 3, 0, 3, 9, 10, 9, 3, -1,
        10, 9, 4, 6, 10, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        4, 9, 5, 7, 6, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        0, 8, 3, 4, 9, 5, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1,
        5, 0, 1, 5, 4, 0, 7, 6, 11, -1, -1, -1, -1, -1, -1, -1,
        11, 7, 6, 8, 3, 4, 3, 5, 4, 3, 1, 5, -1, -1, -1, -1,
        9, 5, 4, 10, 1, 2, 7, 6, 11, -1, -1, -1, -1, -1, -1, -1,
        6, 11, 7, 1, 2, 10, 0, 8, 3, 4, 9, 5, -1, -1, -1, -1,
        7, 6, 11, 5, 4, 10, 4, 2, 10, 4, 0, 2, -1, -1, -1, -1,
        3, 4, 8, 3, 5, 4, 3, 2, 5, 10, 5, 2, 11, 7, 6, -1,
        7, 2, 3, 7, 6, 2, 5, 4, 9, -1, -1, -1, -1, -1, -1, -1,
        9, 5, 4, 0, 8, 6, 0, 6, 2, 6, 8, 7, -1, -1, -1, -1,
        3, 6, 2, 3, 7, 6, 1, 5, 0, 5, 4, 0, -1, -1, -1, -1,
        6, 2, 8, 6, 8, 7, 2, 1, 8, 4, 8, 5, 1, 5, 8, -1,
        9, 5, 4, 10, 1, 6, 1, 7, 6, 1, 3, 7, -1, -1, -1, -1,
        1, 6, 10, 1, 7, 6, 1, 0, 7, 8, 7, 0, 9, 5, 4, -1,
        4, 0, 10, 4, 10, 5, 0, 3, 10, 6, 10, 7, 3, 7, 10, -1,
        7, 6, 10, 7, 10, 8, 5, 4, 10, 4, 8, 10, -1, -1, -1, -1,
        6, 9, 5, 6, 11, 9, 11, 8, 9, -1, -1, -1, -1, -1, -1, -1,
        3, 6, 11, 0, 6, 3, 0, 5, 6, 0, 9, 5, -1, -1, -1, -1,
        0, 11, 8, 0, 5, 11, 0, 1, 5, 5, 6, 11, -1, -1, -1, -1,
        6, 11, 3, 6, 3, 5, 5, 3, 1, -1, -1, -1, -1, -1, -1, -1,
        1, 2, 10, 9, 5, 11, 9, 11, 8, 11, 5, 6, -1, -1, -1, -1,
        0, 11, 3, 0, 6, 11, 0, 9, 6, 5, 6, 9, 1, 2, 10, -1,
        11, 8, 5, 11, 5, 6, 8, 0, 5, 10, 5, 2, 0, 2, 5, -1,
        6, 11, 3, 6, 3, 5, 2, 10, 3, 10, 5, 3, -1, -1, -1, -1,
        5, 8, 9, 5, 2, 8, 5, 6, 2, 3, 8, 2, -1, -1, -1, -1,
        9, 5, 6, 9, 6, 0, 0, 6, 2, -1, -1, -1, -1, -1, -1, -1,
        1, 5, 8, 1, 8, 0, 5, 6, 8, 3, 8, 2, 6, 2, 8, -1,
        1, 5, 6, 2, 1, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        1, 3, 6, 1, 6, 10, 3, 8, 6, 5, 6, 9, 8, 9, 6, -1,
        10, 1, 0, 10, 0, 6, 9, 5, 0, 5, 6, 0, -1, -1, -1, -1,
        0, 3, 8, 5, 6, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        10, 5, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        11, 5, 10, 7, 5, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        11, 5, 10, 11, 7, 5, 8, 3, 0, -1, -1, -1, -1, -1, -1, -1,
        5, 11, 7, 5, 10, 11, 1, 9, 0, -1, -1, -1, -1, -1, -1, -1,
        10, 7, 5, 10, 11, 7, 9, 8, 1, 8, 3, 1, -1, -1, -1, -1,
        11, 1, 2, 11, 7, 1, 7, 5, 1, -1, -1, -1, -1, -1, -1, -1,
        0, 8, 3, 1, 2, 7, 1, 7, 5, 7, 2, 11, -1, -1, -1, -1,
        9, 7, 5, 9, 2, 7, 9, 0, 2, 2, 11, 7, -1, -1, -1, -1,
        7, 5, 2, 7, 2, 11, 5, 9, 2, 3, 2, 8, 9, 8, 2, -1,
        2, 5, 10, 2, 3, 5, 3, 7, 5, -1, -1, -1, -1, -1, -1, -1,
        8, 2, 0, 8, 5, 2, 8, 7, 5, 10, 2, 5, -1, -1, -1, -1,
        9, 0, 1, 5, 10, 3, 5, 3, 7, 3, 10, 2, -1, -1, -1, -1,
        9, 8, 2, 9, 2, 1, 8, 7, 2, 10, 2, 5, 7, 5, 2, -1,
        1, 3, 5, 3, 7, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        0, 8, 7, 0, 7, 1, 1, 7, 5, -1, -1, -1, -1, -1, -1, -1,
        9, 0, 3, 9, 3, 5, 5, 3, 7, -1, -1, -1, -1, -1, -1, -1,
        9, 8, 7, 5, 9, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        5, 8, 4, 5, 10, 8, 10, 11, 8, -1, -1, -1, -1, -1, -1, -1,
        5, 0, 4, 5, 11, 0, 5, 10, 11, 11, 3, 0, -1, -1, -1, -1,
        0, 1, 9, 8, 4, 10, 8, 10, 11, 10, 4, 5, -1, -1, -1, -1,
        10, 11, 4, 10, 4, 5, 11, 3, 4, 9, 4, 1, 3, 1, 4, -1,
        2, 5, 1, 2, 8, 5, 2, 11, 8, 4, 5, 8, -1, -1, -1, -1,
        0, 4, 11, 0, 11, 3, 4, 5, 11, 2, 11, 1, 5, 1, 11, -1,
        0, 2, 5, 0, 5, 9, 2, 11, 5, 4, 5, 8, 11, 8, 5, -1,
        9, 4, 5, 2, 11, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        2, 5, 10, 3, 5, 2, 3, 4, 5, 3, 8, 4, -1, -1, -1, -1,
        5, 10, 2, 5, 2, 4, 4, 2, 0, -1, -1, -1, -1, -1, -1, -1,
        3, 10, 2, 3, 5, 10, 3, 8, 5, 4, 5, 8, 0, 1, 9, -1,
        5, 10, 2, 5, 2, 4, 1, 9, 2, 9, 4, 2, -1, -1, -1, -1,
        8, 4, 5, 8, 5, 3, 3, 5, 1, -1, -1, -1, -1, -1, -1, -1,
        0, 4, 5, 1, 0, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        8, 4, 5, 8, 5, 3, 9, 0, 5, 0, 3, 5, -1, -1, -1, -1,
        9, 4, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        4, 11, 7, 4, 9, 11, 9, 10, 11, -1, -1, -1, -1, -1, -1, -1,
        0, 8, 3, 4, 9, 7, 9, 11, 7, 9, 10, 11, -1, -1, -1, -1,
        1, 10, 11, 1, 11, 4, 1, 4, 0, 7, 4, 11, -1, -1, -1, -1,
        3, 1, 4, 3, 4, 8, 1, 10, 4, 7, 4, 11, 10, 11, 4, -1,
        4, 11, 7, 9, 11, 4, 9, 2, 11, 9, 1, 2, -1, -1, -1, -1,
        9, 7, 4, 9, 11, 7, 9, 1, 11, 2, 11, 1, 0, 8, 3, -1,
        11, 7, 4, 11, 4, 2, 2, 4, 0, -1, -1, -1, -1, -1, -1, -1,
        11, 7, 4, 11, 4, 2, 8, 3, 4, 3, 2, 4, -1, -1, -1, -1,
        2, 9, 10, 2, 7, 9, 2, 3, 7, 7, 4, 9, -1, -1, -1, -1,
        9, 10, 7, 9, 7, 4, 10, 2, 7, 8, 7, 0, 2, 0, 7, -1,
        3, 7, 10, 3, 10, 2, 7, 4, 10, 1, 10, 0, 4, 0, 10, -1,
        1, 10, 2, 8, 7, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        4, 9, 1, 4, 1, 7, 7, 1, 3, -1, -1, -1, -1, -1, -1, -1,
        4, 9, 1, 4, 1, 7, 0, 8, 1, 8, 7, 1, -1, -1, -1, -1,
        4, 0, 3, 7, 4, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        4, 8, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        9, 10, 8, 10, 11, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        3, 0, 9, 3, 9, 11, 11, 9, 10, -1, -1, -1, -1, -1, -1, -1,
        0, 1, 10, 0, 10, 8, 8, 10, 11, -1, -1, -1, -1, -1, -1, -1,
        3, 1, 10, 11, 3, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        1, 2, 11, 1, 11, 9, 9, 11, 8, -1, -1, -1, -1, -1, -1, -1,
        3, 0, 9, 3, 9, 11, 1, 2, 9, 2, 11, 9, -1, -1, -1, -1,
        0, 2, 11, 8, 0, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        3, 2, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        2, 3, 8, 2, 8, 10, 10, 8, 9, -1, -1, -1, -1, -1, -1, -1,
        9, 10, 2, 0, 9, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        2, 3, 8, 2, 8, 10, 0, 1, 8, 1, 10, 8, -1, -1, -1, -1,
        1, 10, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        1, 3, 8, 9, 1, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        0, 9, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        0, 3, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1
    ]);

module.exports = ISOSurface;
},{"../math/fVec3":35,"../math/fVec4":36,"./fGeom3d":7}],10:[function(require,module,exports){

module.exports =
{

    //TODO: clean up

    isPointLeft : function(x0,y0,x1,y1,x2,y2)
    {
        return ( x1 - x0 ) * ( y2 - y0 ) - (x2 - x0) * (y1 - y0);
    },

    //http://alienryderflex.com/intersect/
    isIntersectionf : function(ax,ay,bx,by,cx,cy,dx,dy,out)
    {
        var distAB,
            cos,
            sin,
            newX,
            posab;

        if (ax == bx && ay == by ||
            cx == dx && cy == dy)
            return false;

        bx -= ax;
        by -= ay;
        cx -= ax;
        cy -= ay;
        dx -= ax;
        dy -= ay;

        distAB = 1 / (Math.sqrt(bx*bx+by*by) || 1);

        cos  = bx * distAB;
        sin  = by * distAB;
        newX = cx * cos + cy * sin;
        cy   = cy * cos - cx * sin;
        cx   = newX;
        newX = dx * cos + dy * sin;
        dy   = dy * cos - dx * sin;
        dx   = newX;

        if (cy == dy) return false;

        posab  = dx + ( cx - dx ) * dy / ( dy - cy );

        if(out)
        {
            out[0] = ax + posab * cos;
            out[1] = ay + posab * sin;
        }

        return true;
    },

    isIntersection : function(l0,l1,out)
    {
        return this.isIntersectionf(l0[0],l0[1],l0[2],l0[3],l1[0],l0[1],l1[2],l1[3],out);
    } ,

    isSegmentIntersectionf : function(ax,ay,bx,by,cx,cy,dx,dy,out)
    {
        var distab,
            cos,
            sin,
            newX,
            posab;

        if (ax == bx && ay == by ||
            cx == dx && cy == dy)
            return false;

        if (ax==cx && ay==cy || bx==cx && by==cy
            ||  ax==dx && ay==dy || bx==dx && by==dy) {
            return false; }

        bx -= ax;
        by -= ay;
        cx -= ax;
        cy -= ay;
        dx -= ax;
        dy -= ay;

        distab= Math.sqrt(bx*bx+by*by);

        cos  = bx / distab;
        sin  = by / distab;
        newX = cx * cos + cy * sin;
        cy   = cy * cos - cx * sin;
        cx   = newX;
        newX = dx * cos + dy * sin;
        dy   = dy * cos - dx * sin;
        dx   = newX;

        if(cy < 0.0 && dy < 0.0 || cy >= 0.0 && dy >= 0.0)return false;

        posab  = dx + ( cx - dx ) * dy / ( dy - cy );

        if(posab < 0.0 || posab > distab)return false;

        if(out)
        {
            out[0] = ax + posab * cos;
            out[1] = ay + posab * sin;
        }

        return true;
    }


};
},{}],11:[function(require,module,exports){



function LineBuffer2d(kgl,size)
{
    this._gl      = kgl;

    this._vbo     = null;
    this.vertices = null;
    this.colors   = null;

    this._vertIndex = 0;
    this._colIndex  = 0;

    if(size)this.allocate(size);
}

/*---------------------------------------------------------------------------------------------------------*/

//probably shouldnt do this
LineBuffer2d.prototype.bind   = function()
{
    var kgl = this._gl,
        gl    = kgl.gl;

    kgl.disableDefaultNormalAttribArray();
    kgl.disableDefaultTexCoordsAttribArray();
    gl.bindBuffer(gl.ARRAY_BUFFER,this._vbo);
};

LineBuffer2d.prototype.unbind = function()
{
    var kgl = this._gl;

    kgl.enableDefaultNormalAttribArray();
    kgl.enableDefaultTexCoordsAttribArray();
    kgl.bindDefaultVBO();
};

LineBuffer2d.prototype.pushVertex3f = function(x,y,z)
{
    var vertices = this.vertices;

    //if(this._safeAllocate && this._vertIndex > vertices.length - 3)this.allocate(vertices.length * 1.1);

    vertices[this._vertIndex++] = x;
    vertices[this._vertIndex++] = y;
    vertices[this._vertIndex++] = z;
};

LineBuffer2d.prototype.pushColor4f = function(r,g,b,a)
{
    var colors = this.colors;

    colors[this._colIndex++] = r;
    colors[this._colIndex++] = g;
    colors[this._colIndex++] = b;
    colors[this._colIndex++] = a;
};

LineBuffer2d.prototype.setVertex3f = function(x,y,z,index3)
{
    index3*=3;
    var vertices = this.vertices;

    vertices[index3  ] = x;
    vertices[index3+1] = y;
    vertices[index3+2] = z;
};

LineBuffer2d.prototype.setColor4f = function(r,g,b,a,index4)
{
    index4*=4;
    var colors = this.colors;

    colors[index4  ] = r;
    colors[index4+1] = g;
    colors[index4+2] = b;
    colors[index4+3] = a;
};

LineBuffer2d.prototype.pushVertex    = function(v){this.pushVertex3f(v[0],v[1],v[2]);};
LineBuffer2d.prototype.pushColor     = function(c){this.pushColor4f(c[0],c[1],c[2],c[3]);};
LineBuffer2d.prototype.setVertex     = function(v,index){this.setVertex3f(v[0],v[1],v[2],index);};
LineBuffer2d.prototype.setColor      = function(c,index){this.setColor4f(c[0],c[1],c[2],c[3],index);};

/*---------------------------------------------------------------------------------------------------------*/

LineBuffer2d.prototype.buffer = function()
{
    var glkl          = this._gl,
        gl            = glkl.gl,
        glArrayBuffer = gl.ARRAY_BUFFER,
        glFloat       = gl.FLOAT;



    var vblen = this.vertices.byteLength,
        cblen = this.colors.byteLength;

    var offsetV = 0,
        offsetC = offsetV + vblen;

    gl.bufferData(glArrayBuffer,vblen + cblen, gl.DYNAMIC_DRAW);
    gl.bufferSubData(glArrayBuffer,offsetV,this.vertices);
    gl.bufferSubData(glArrayBuffer,offsetC,this.colors);
    gl.vertexAttribPointer(glkl.getDefaultVertexAttrib(),glkl.SIZE_OF_VERTEX,glFloat,false,0,offsetV);
    gl.vertexAttribPointer(glkl.getDefaultColorAttrib(), glkl.SIZE_OF_COLOR, glFloat,false,0,offsetC);
};

LineBuffer2d.prototype.draw = function(first,count)
{
    var kgl = this._gl,
        gl    = kgl.gl;

   kgl.setMatricesUniform();
   gl.drawArrays(kgl.getDrawMode(),
                 first || 0,
                 count || this.vertices.length / kgl.SIZE_OF_VERTEX);
};

/*---------------------------------------------------------------------------------------------------------*/

LineBuffer2d.prototype.reset = function()
{
    this._vertIndex = 0;
    this._colIndex  = 0;
};

LineBuffer2d.prototype.dispose  = function()
{
    this._gl.gl.deleteBuffer(this._vbo);
    this.vertices = null;
    this.colors   = null;
    this.reset();
};

LineBuffer2d.prototype.allocate = function(size)
{
    var kgl = this._gl,
        gl    = kgl.gl;

    //need to deleteBuffer, instead of reusing it, otherwise error, hm
    if(this._vbo){gl.deleteBuffer(this._vbo);}this._vbo = gl.createBuffer();
    this.vertices = this.vertices || new Float32Array(0);
    this.colors   = this.colors   || new Float32Array(0);

    var vertLen = this.vertices.length,
        colsLen = this.colors.length;

    if(vertLen < size)
    {
        var temp;

        temp = new Float32Array(size);
        temp.set(this.vertices);
        temp.set(new Float32Array(temp.length - vertLen),vertLen);
        this.vertices = temp;

        temp = new Float32Array(size / 3 * 4);
        temp.set(this.colors);
        temp.set(new Float32Array(temp.length - colsLen),colsLen);
        this.colors = temp;
  }
};

/*---------------------------------------------------------------------------------------------------------*/

LineBuffer2d.prototype.getSizeAllocated = function(){return this.vertices.length;};
LineBuffer2d.prototype.getSizePushed    = function(){return this._vertIndex;};

module.exports = LineBuffer2d;


},{}],12:[function(require,module,exports){
var Geom3d = require('./fGeom3d'),
    Mat44  = require('../math/fMat44'),
    Vec3   = require('../math/fVec3');

//TODO:
//Fix shared normals on caps
//


LineBuffer3d = function(points,numSegments,diameter,sliceSegmentFunc,closed)
{
    Geom3d.apply(this,arguments);

    numSegments = numSegments || 10;
    diameter    = diameter    || 0.25;

    this._closedCaps   = (typeof closed === 'undefined') ? true : closed;
    this._numSegments  = numSegments;

    //caches vertices transformed by slicesegfunc for diameter scaling
    //...,vnorm0x,vnorm0y,vnorm0z,vnorm0xScaled,,vnorm0yScaled,vnorm0zScaled,...
    this._verticesNorm = null;
    this.points        = null;

    this._sliceSegFunc = sliceSegmentFunc ||
                        (function(i,j,numPoints,numSegments)
                         {
                             var step  = Math.PI * 2 / numSegments,
                                 angle = step * j;

                             return [Math.cos(angle),Math.sin(angle)];
                         });

    this._initDiameter = diameter;

    this._tempVec0 = Vec3.make();
    this._bPoint0  = Vec3.make();
    this._bPoint1  = Vec3.make();
    this._bPoint01 = Vec3.make();
    this._axisY    = Vec3.AXIS_Y();

    /*---------------------------------------------------------------------------------------------------------*/

    if(points)this.setPoints(points);

};

LineBuffer3d.prototype = Object.create(Geom3d.prototype);

/*---------------------------------------------------------------------------------------------------------*/

LineBuffer3d.prototype.setPoints = function(arr)
{
    this.points = new Float32Array(arr);

    if(!(this.vertices && this.vertices.length == arr.length))
    {
        var numSegments = this._numSegments,
            numPoints   = this._numPoints = arr.length / 3;
        var len         = numPoints * numSegments * 3;

        this._verticesNorm = new Float32Array(len * 2);
        this.vertices      = new Float32Array(len);
        this.normals       = new Float32Array(len);
        this.colors        = new Float32Array(len / 3 * 4);

        this.setNumSegments(numSegments);
    }
};

/*---------------------------------------------------------------------------------------------------------*/

LineBuffer3d.prototype.applySliceSegmentFunc = function(func,baseDiameter)
{
    baseDiameter = baseDiameter || 0.25;

    var numPoints    = this._numPoints,
        numSegments  = this._numSegments,
        verticesNorm = this._verticesNorm;

    var funcRes;

    var index;
    var i, j, k;

    i = -1;
    while(++i < numPoints)
    {
        j = -1;
        index = i * numSegments;

        while(++j < numSegments)
        {
            k    = (index + j) * 3 * 2;

            funcRes = func(i,j,numPoints,numSegments);

            verticesNorm[k+0] = funcRes[0];
            verticesNorm[k+2] = funcRes[1];

            verticesNorm[k+3] = verticesNorm[k+0] * baseDiameter;
            verticesNorm[k+5] = verticesNorm[k+2] * baseDiameter;
        }
    }

    this._sliceSegFunc = func;

};

/*---------------------------------------------------------------------------------------------------------*/

LineBuffer3d.prototype.setPoint3f = function(index,x,y,z)
{
    index *= 3;

    var points = this.points;

    points[index  ] = x;
    points[index+1] = y;
    points[index+2] = z;
};

LineBuffer3d.prototype.setPoint = function(index,v)
{
    index *= 3;

    var points = this.points;

    points[index  ] = v[0];
    points[index+1] = v[1];
    points[index+2] = v[2];
};

LineBuffer3d.prototype.getPoint = function(index,out)
{
    out    = out || this._tempVec0;
    index *= 3;

    var points = this.points;

    out[0] = points[index  ];
    out[1] = points[index+1];
    out[2] = points[index+2];

    return out;
};

/*---------------------------------------------------------------------------------------------------------*/

LineBuffer3d.prototype.setUnitDiameter = function(value)
{
    var numSegments  = this._numSegments,
        verticesNorm = this._verticesNorm;

    var offset = numSegments * 3 * 2;

    var i = 0,
        l = this._numPoints * offset;

    while(i < l)
    {
        verticesNorm[i + 3] = verticesNorm[i + 0] * value;
        verticesNorm[i + 5] = verticesNorm[i + 2] * value;
        i+=6;
    }
};

LineBuffer3d.prototype.setDiameter = function(index,value)
{
    var numSegments  = this._numSegments,
        verticesNorm = this._verticesNorm;

    var offset = numSegments * 3 * 2;

    var i = index * offset,
        l = i + offset;

    while (i < l)
    {
        verticesNorm[i + 3] = verticesNorm[i + 0] * value;
        verticesNorm[i + 5] = verticesNorm[i + 2] * value;
        i += 6;
    }
};

//TODO: Cleanup / unroll ...
LineBuffer3d.prototype.setNumSegments = function(numSegments)
{
    numSegments = numSegments < 2 ? 2 : numSegments;

    var numPoints = this._numPoints;
    var indices   = this.indices = [];
    var texCoords;

    var i,j;
    var v0,v1,v2,v3;
    var nh,nv;
    var index, indexSeg, indexTex;
    var len;

    if(numSegments > 2)
    {

        len = numSegments - 1;

        i = -1;
        while (++i < numPoints - 1)
        {

            index = i * numSegments;
            j = -1;
            while (++j < len)
            {
                indexSeg = index + j;

                v0 = indexSeg;
                v1 = indexSeg + 1;
                v2 = indexSeg + numSegments + 1;
                v3 = indexSeg + numSegments;

                indices.push(v0,v1,v3,
                             v1,v2,v3);
            }


            v0 = index + len;
            v1 = index;
            v2 = index + len + 1;
            v3 = index + numSegments + len;

            indices.push(v0,v1,v3,
                         v1,v2,v3);

        }
    }
    else
    {
        i = -1;
        while(++i < numPoints - 1)
        {
            index = i * 2;
            indices.push(index,    index + 1,index + 2,
                         index + 1,index + 3,index + 2);

        }
    }

    len = numPoints * numSegments * 3 ;

    texCoords = this.texCoords = new Float32Array(len / 3 * 2);

    i = -1;
    while(++i < numPoints)
    {
        index = i * numSegments;
        nh    = i / (numPoints - 1);

        j = -1;
        while(++j < numSegments)
        {
            indexTex = (index + j) * 2;
            nv       = 1 - j / (numSegments - 1);

            texCoords[indexTex]   = nh;
            texCoords[indexTex+1] = nv;
        }
    }


    this.setCloseCaps(this._closedCaps);
    this.applySliceSegmentFunc(this._sliceSegFunc,this._initDiameter);
};

/*---------------------------------------------------------------------------------------------------------*/

LineBuffer3d.prototype.update = function()
{
    var numPoints   = this._numPoints,
        numSegments = this._numSegments;

    var points       = this.points,
        vertices     = this.vertices,
        verticesNorm = this._verticesNorm;

    var tempVec = this._tempVec0;

    var p0  = this._bPoint0,
        p1  = this._bPoint1,
        p01 = this._bPoint01,
        up  = this._axisY;

    var mat    = Mat44.make(),
        matRot = Mat44.make();

    var index,index3,index6;

    //direction from current point -> next point, prev point -> current point
    var dir01,dir_10;
    var angle,axis;

    //BEGIN - calculate first point
    Vec3.set3f(p0,points[0],points[1],points[2]);
    Vec3.set3f(p1,points[3],points[4],points[5]);

    dir01 = Vec3.safeNormalize(Vec3.subbed(p1,p0));
    angle = Math.acos(Vec3.dot(dir01,up));
    axis  = Vec3.safeNormalize(Vec3.cross(up,dir01));

    Mat44.identity(mat);
    mat[12] = p0[0];
    mat[13] = p0[1];
    mat[14] = p0[2];

    Mat44.makeRotationOnAxis(angle,axis[0],axis[1],axis[2],matRot);
    mat = Mat44.multPost(mat,matRot);

    j = -1;
    while(++j < numSegments)
    {
        index3 = j * 3;
        index6 = j * 6;

        tempVec[0] = verticesNorm[index6+3];
        tempVec[1] = verticesNorm[index6+4];
        tempVec[2] = verticesNorm[index6+5];

        Mat44.multVec3(mat,tempVec);

        vertices[index3  ] = tempVec[0];
        vertices[index3+1] = tempVec[1];
        vertices[index3+2] = tempVec[2];
    }
    //END - calculate first point


    //calc first prev dir
    Vec3.set3f(p0, points[3],points[4],points[5]);
    Vec3.set3f(p01,points[0],points[1],points[2]);
    dir_10 = Vec3.safeNormalize(Vec3.subbed(p0,p01));

    var i3;
    var i = 0;
    var j;
    while(++i < numPoints - 1)
    {
        //set current point
        i3 = i * 3;
        p0[0] = points[i3  ];
        p0[1] = points[i3+1];
        p0[2] = points[i3+2];

        //set next point
        i3 = (i + 1) * 3;
        p1[0] = points[i3  ];
        p1[1] = points[i3+1];
        p1[2] = points[i3+2];

        //calculate direction
        dir01  = Vec3.safeNormalize(Vec3.subbed(p1,p0));

        //interpolate with previous direction
        dir01[0] = dir01[0] * 0.5 + dir_10[0] * 0.5;
        dir01[1] = dir01[1] * 0.5 + dir_10[1] * 0.5;
        dir01[2] = dir01[2] * 0.5 + dir_10[2] * 0.5;

        //get dir angle + axis
        angle = Math.acos(Vec3.dot(dir01,up));
        axis  = Vec3.safeNormalize(Vec3.cross(up,dir01));

        //reset transformation matrix
        Mat44.identity(mat);

        //set translation
        mat[12] = p0[0];
        mat[13] = p0[1];
        mat[14] = p0[2];

        //set rotation
        Mat44.makeRotationOnAxis(angle,axis[0],axis[1],axis[2],matRot);

        //multiply matrices
        mat = Mat44.multPost(mat,matRot);

        j = -1;
        while(++j < numSegments)
        {
            index  = (i * numSegments + j);
            index3 = index * 3;
            index6 = index * 6;

            //lookup vertex
            tempVec[0] = verticesNorm[index6+3];
            tempVec[1] = verticesNorm[index6+4];
            tempVec[2] = verticesNorm[index6+5];

            //transform vertex copy by matrix
            Mat44.multVec3(mat,tempVec);

            //reassign transformed vertex
            vertices[index3  ] = tempVec[0];
            vertices[index3+1] = tempVec[1];
            vertices[index3+2] = tempVec[2];
        }

        //assign current direction to prev
        dir_10[0] = dir01[0];
        dir_10[1] = dir01[1];
        dir_10[2] = dir01[2];
    }

    var len = points.length;

    //BEGIN - calculate last point
    Vec3.set3f(p0,points[len - 6],points[len - 5],points[len - 4]);
    Vec3.set3f(p1,points[len - 3],points[len - 2],points[len - 1]);

    dir01 = Vec3.safeNormalize(Vec3.subbed(p1,p0));
    angle = Math.acos(Vec3.dot(dir01,up));
    axis  = Vec3.safeNormalize(Vec3.cross(up,dir01));

    Mat44.identity(mat);
    mat[12] = p1[0];
    mat[13] = p1[1];
    mat[14] = p1[2];

    Mat44.makeRotationOnAxis(angle,axis[0],axis[1],axis[2],matRot);
    mat = Mat44.multPost(mat,matRot);

    i  = (i * numSegments);

    j = -1;
    while(++j < numSegments)
    {
        index  = i + j;
        index3 = index * 3;
        index6 = index * 6;

        tempVec[0] = verticesNorm[index6+3];
        tempVec[1] = verticesNorm[index6+4];
        tempVec[2] = verticesNorm[index6+5];

        Mat44.multVec3(mat,tempVec);

        vertices[index3  ] = tempVec[0];
        vertices[index3+1] = tempVec[1];
        vertices[index3+2] = tempVec[2];
    }
    //END - calculate last point
};

/*---------------------------------------------------------------------------------------------------------*/

LineBuffer3d.prototype.setSegVTexCoordMapping = function(scale,offset){this.setSegTexCoordMapping(1,0,scale,offset || 0);};
LineBuffer3d.prototype.setSegHTexCoordMapping = function(scale,offset){this.setSegTexCoordMapping(scale,offset || 0,1,0);};

LineBuffer3d.prototype.setSegTexCoordMapping = function (scaleH, offsetH, scaleV, offsetV)
{
    var numPoints     = this._numPoints,
        numSegments   = this._numSegments,
        numSegments_1 = numSegments - 1;

    var texCoords = this.texCoords;
    var i, j, index, indexTex;
    var nh, nv;

    i = -1;
    while (++i < numPoints)
    {
        index = i * numSegments;
        nh = (i / (numPoints - 1)) * scaleH - offsetH;

        j = -1;
        while (++j < numSegments)
        {
            indexTex = (index + j) * 2;
            nv = (1 - j / numSegments_1) * scaleV - offsetV;

            texCoords[indexTex  ] = nh;
            texCoords[indexTex + 1] = nv;
        }
    }
};

/*---------------------------------------------------------------------------------------------------------*/

LineBuffer3d.prototype.setCloseCaps = function(bool)
{
    if(this._numSegments == 2)return;

    var indices = this.indices,
        temp    = new Array(this.indices.length);

    var i = -1;while(++i<temp.length)temp[i] = indices[i];

    var numPoints   = this._numPoints,
        numSegments = this._numSegments;
    var len;


    if(bool)
    {

        len = numSegments - 2;
        i = -1;while(++i < len)temp.push(0,i+1,i+2);

        var j;
        len += (numPoints - 1) * numSegments + 1;
        i   = j = len - numSegments + 1;
        while(++i < len)temp.push(j,i,i+1);
    }
    else
    {
        temp = temp.slice(0,indices.length - (numSegments - 2) * 2 * 3);
    }

    this.indices = new Uint16Array(temp);
    this.updateVertexNormals();
    this._closedCaps = bool;
};

/*---------------------------------------------------------------------------------------------------------*/

LineBuffer3d.prototype.getNumSegments = function(){return this._numSegments;};
LineBuffer3d.prototype.getNumPoints   = function(){return this._numPoints;};

/*---------------------------------------------------------------------------------------------------------*/

LineBuffer3d.prototype._draw = function(gl,count,offset)
{
    var indices = this.indices;
    gl.drawElements(this.vertices,this.normals,gl.bufferColors(gl.getColorBuffer(),this.colors),this.texCoords,indices,gl.getDrawMode(),count || indices.length, offset || 0 );
};

module.exports = LineBuffer3d;

},{"../math/fMat44":31,"../math/fVec3":35,"./fGeom3d":7}],13:[function(require,module,exports){
var Vec2   = require('../math/fVec2'),
    Vec3   = require('../math/fVec3'),
    Color  = require('../util/fColor'),
    Geom3d = require('./fGeom3d');

ParametricSurface = function(size)
{
    Geom3d.apply(this,null);

    this.funcX = function(u,v,t){return u;};
    this.funcY = function(u,v,t){return 0;};
    this.funcZ = function(u,v,t){return v;};
    this.ur    = [-1,1];
    this.vr    = [-1,1];
    this.size  = null;

    this.setSize(size);

};

ParametricSurface.prototype = Object.create(Geom3d.prototype);

ParametricSurface.prototype.setSize = function(size,unit)
{
    unit = unit || 1;

    this.size = size;

    var length  = size * size;

    this.vertices  = new Float32Array(length * Vec3.SIZE);
    this.normals   = new Float32Array(length * Vec3.SIZE);
    this.colors    = new Float32Array(length * Color.SIZE);
    this.texCoords = new Float32Array(length * Vec2.SIZE);

    var indices = [];

    var a, b, c, d;
    var i,j;

    i = -1;
    while(++i < size - 1)
    {
        j = -1;
        while(++j < size - 1)
        {
            a = j     + size * i;
            b = (j+1) + size * i;
            c = j     + size * (i+1);
            d = (j+1) + size * (i+1);

            indices.push(a,b,c);
            indices.push(b,d,c);
        }
    }

    this.indices = new Uint16Array(indices);

    this.updateVertexNormals();
};

ParametricSurface.prototype.setFunctions = function(funcX,funcY,funcZ,vr,ur)
{
    this.funcX = funcX;
    this.funcY = funcY;
    this.funcZ = funcZ;
    this.vr   = vr;
    this.ur   = ur;
};

ParametricSurface.prototype.applyFunctions = function()
{
    this.applyFunctionsWithArg(0);
};

//Override
ParametricSurface.prototype.applyFunctionsWithArg = function(arg)
{
    var size  = this.size;

    var funcX = this.funcX,
        funcY = this.funcY,
        funcZ = this.funcZ;

    var urLower = this.ur[0],
        urUpper = this.ur[1],
        vrLower = this.vr[0],
        vrUpper = this.vr[1];

    var i, j, u, v;

    var vertices = this.vertices;

    var index,indexVertices;

    var temp0 = urUpper - urLower,
        temp1 = vrUpper - vrLower,
        temp2 = size - 1;

    i = -1;
    while(++i < size)
    {
        j = -1;
        while(++j < size)
        {
            index = (j + size * i);
            indexVertices = index * 3;

            u = (urLower + temp0 * (j / temp2));
            v = (vrLower + temp1 * (i / temp2));

            vertices[indexVertices    ] = funcX(u,v,arg);
            vertices[indexVertices + 1] = funcY(u,v,arg);
            vertices[indexVertices + 2] = funcZ(u,v,arg);
        }
    }
};

ParametricSurface.prototype.pointOnSurface = function(u,v)
{
    return this.pointOnSurfaceWithArg(u,v,0);
};

ParametricSurface.prototype.pointOnSurfaceWithArg = function(u,v,arg)
{
    return Vec3.make(this.funcX(u,v,arg),
                     this.funcY(u,v,arg),
                     this.funcZ(u,v,arg));
};

module.exports = ParametricSurface;


},{"../math/fVec2":34,"../math/fVec3":35,"../util/fColor":40,"./fGeom3d":7}],14:[function(require,module,exports){
var kMath      = require('../math/fMath'),
    Line2dUtil = require('./fLine2dUtil');

module.exports =
{
    /*---------------------------------------------------------------------------------------------------------*/

    makeVertexCountFitted : function(polygon,count)
    {
        var diff    = polygon.length * 0.5 - count;

        return diff < 0 ? this.makeVertexCountIncreased(polygon, Math.abs(diff)) :
               diff > 0 ? this.makeVertexCountDecreased(polygon, diff) :
               polygon;
    },


    //TODO: modulo loop
    makeVertexCountIncreased : function(polygon,count)
    {
        count = (typeof count == 'undefined') ? 1 : count;

        var out = polygon.slice();
        if(count <= 0 )return polygon;

        var i = -1,j;
        var len;
        var max;

        var jc,jn;

        var x, y, mx, my;
        var dx,dy,d;

        var edgeSIndex,
            edgeEIndex;

        while(++i < count)
        {
            max = -Infinity;
            len = out.length * 0.5;

            edgeSIndex = edgeEIndex = 0;

            j = -1;
            while(++j < len - 1)
            {
                jc = j * 2;
                jn = (j + 1) * 2;

                dx = out[jn    ] - out[jc    ];
                dy = out[jn + 1] - out[jc + 1];
                d  = dx * dx + dy * dy;

                if(d > max){max = d;edgeSIndex = j;}
            }

            jc = j * 2;
            dx = out[0] - out[jc    ];
            dy = out[1] - out[jc + 1];
            d  = dx * dx + dy * dy;

            edgeSIndex = (d > max) ? j : edgeSIndex;
            edgeEIndex = edgeSIndex == len - 1 ? 0 : edgeSIndex + 1;

            edgeSIndex*= 2;
            edgeEIndex*= 2;

            x = out[edgeSIndex    ];
            y = out[edgeSIndex + 1];

            mx = x + (out[edgeEIndex    ] - x) * 0.5;
            my = y + (out[edgeEIndex + 1] - y) * 0.5;

            out.splice(edgeEIndex,0,mx,my);
        }

        return out;

    },


    //TODO: modulo loop
    makeVertexCountDecreased : function(polygon,count)
    {
        count = (typeof count == 'undefined') ? 1 : count;

        var out = polygon.slice();
        if((out.length * 0.5 - count) < 3 || count == 0)return out;

        var i = -1, j;
        var len;
        var min;

        var jc,jn;
        var dx,dy,d;

        var edgeSIndex,
            edgeEIndex;

        while(++i < count)
        {

            min = Infinity;
            len = out.length * 0.5;

            edgeSIndex = edgeEIndex = 0;

            j = -1;
            while(++j < len - 1)
            {
                jc = j * 2;
                jn = (j + 1) * 2;

                dx = out[jn    ] - out[jc    ];
                dy = out[jn + 1] - out[jc + 1];
                d  = dx * dx + dy * dy;

                if(d < min){min = d;edgeSIndex = j;}
            }

            jc = j * 2;
            dx = out[0] - out[jc    ];
            dy = out[1] - out[jc + 1];
            d  = dx * dx + dy * dy;

            edgeSIndex = (d < min) ? j : edgeSIndex;
            edgeEIndex = edgeSIndex == len - 1 ? 0 : edgeSIndex + 1;

            out.splice(edgeEIndex * 2,2);

        }

        return out;

    },

    /*---------------------------------------------------------------------------------------------------------*/


    makeEdgesSubdivided : function(polygon,count,out)
    {
        count = count || 1;

        var i, j, k;
        var i2,i4;

        var len;
        var x, y, mx, my;


        if(out)
        {
            out.length = polygon.length;
            i = -1;while(++i < polygon.length){out[i] = polygon[i];}
        }
        else out = polygon.slice();

        j = -1;
        while(++j < count)
        {

            len = out.length * 0.5 -1;
            i = -1;
            while(++i < len)
            {
                i2 = i * 2;
                i4 = (i * 2) * 2;
                x  = out[i4];
                y  = out[i4 + 1];

                i2 = i2 + 1;
                i4 = i2 * 2;
                mx = x + (out[i4    ] - x) * 0.5;
                my = y + (out[i4 + 1] - y) * 0.5;

                out.splice(i4,0,mx,my);
            }

            i2 = i   * 2;
            i4 = i2 * 2;

            x  = out[i4];
            y  = out[i4 + 1];
            mx = x + (out[0] - x) * 0.5;
            my = y + (out[1] - y) * 0.5;

            out.splice((i2 + 1) * 2,0,mx,my);
        }

        return out;
    },

    /*---------------------------------------------------------------------------------------------------------*/


    makeSmoothedLinear : function(polygon,count,out)
    {
        count = count || 1;

        var px,py,dx,dy;

        var i, j, k;

        var temp    = polygon.slice(),
            tempLen = temp.length;

        if(out)out.length = tempLen  * 2;
        else out = new Array(tempLen  * 2);

        j = -1;
        while(++j < count)
        {
            tempLen    = temp.length;
            out.length = tempLen * 2;

            i = 0;
            while(i < tempLen)
            {
                px = temp[i    ];
                py = temp[i + 1] ;
                k  = (i + 2) % tempLen;
                dx = temp[k    ] - px;
                dy = temp[k + 1] - py;

                k = i * 2;
                out[k  ] = px + dx * 0.25;
                out[k+1] = py + dy * 0.25;
                out[k+2] = px + dx * 0.75;
                out[k+3] = py + dy * 0.75;

                i+=2;
            }


            temp = out.slice();
        }

        return out;

    },

    /*---------------------------------------------------------------------------------------------------------*/

    makeOptHeading : function(polygon,tolerance)
    {
        if(polygon.length < 4)return polygon;

        tolerance = tolerance || kMath.EPSILON;

        var temp = [];

        var len = polygon.length / 2 - 1;

        var px = polygon[0],
            py = polygon[1],
            x, y;

        var ph = Math.atan2(polygon[3] - py,polygon[2] - px),
            ch;

        temp.push(px,py);

        var i = 0,i2;

        while(++i < len)
        {
            i2 = i * 2;
            x = polygon[i2  ];
            y = polygon[i2+1];

            i2 = (i + 1) * 2;
            ch = Math.atan2(polygon[i2+1] - y,
                            polygon[i2  ] - x);

            if(Math.abs(ph - ch) > tolerance)temp.push(x,y);

            px = x;
            py = y;
            ph = ch;
        }

        x = polygon[polygon.length - 2];
        y = polygon[polygon.length - 1];

        ch = Math.atan2(polygon[1] - y, polygon[0] - x);

        if(Math.abs(ph - ch) > tolerance)temp.push(x,y);

        return temp;
    },


    makeOptEdgeLength : function(polygon,edgeLength)
    {
        var temp = [];
        var len  = polygon.length * 0.5 - 1;

        var dx,dy;
        var px,py;
        var x, y;

        var index;

        var edgeLengthSq = edgeLength * edgeLength;

        px = polygon[0];
        py = polygon[1];

        temp.push(px,py);
        var i = 0;
        while(++i < len)
        {
            index = i * 2;

            x =  polygon[index  ];
            y =  polygon[index+1];

            dx = x - px;
            dy = y - py;

            if((dx * dx + dy * dy) >= edgeLengthSq)
            {
                px = x;
                py = y;

                temp.push(x,y);
            }
        }

        x = polygon[polygon.length-2];
        y = polygon[polygon.length-1];

        px = polygon[0];
        py = polygon[1];

        dx = x - px;
        dy = y - py;

        if((dx * dx + dy * dy) >= edgeLengthSq)temp.push(x,y);

        return temp;
    },

    /*---------------------------------------------------------------------------------------------------------*/


    //http://alienryderflex.com/polygon_perimeter/
    makePerimeter : function(polygon,out)
    {
        var TWO_PI   = Math.PI * 2,
            PI       = Math.PI;

        var corners  = polygon.length * 0.5;
        var MAX_SEGS = corners * 4;

        if(corners > MAX_SEGS) return null;

        out.length = 0;

        var segS = new Array(MAX_SEGS * 2),
            segE = new Array(MAX_SEGS * 2),
            segAngle   = new Array(MAX_SEGS);

        var intersects = new Array(2),
            intersectX,intersectY;

        var startX    = polygon[0],
            startY    = polygon[1],
            lastAngle = PI;

        var indexi,indexj,
            indexSeg,indexSegi,indexSegj,
            pix,piy,pjx,pjy;

        var a, b, c, d, e, f,
            angleDif, bestAngleDif;

        var i, j = corners - 1, segs = 0;

        i = -1;
        while(++i < corners)
        {
            indexi = i * 2;
            indexj = j * 2;

            pix = polygon[indexi  ];
            piy = polygon[indexi+1];
            pjx = polygon[indexj  ];
            pjy = polygon[indexj+1];

            if (pix != pjx || piy != pjy)
            {
                indexSeg = segs * 2;

                segS[indexSeg  ] = pix;
                segS[indexSeg+1] = piy;
                segE[indexSeg  ] = pjx;
                segE[indexSeg+1] = pjy;

                segs++;
            }

            j = i;

            if (piy > startY || piy == startY && pix < startX)
            {
                startX = pix;
                startY = piy;
            }
        }

        if (segs == 0) return false;

        var isSegmentIntersectionf = Line2dUtil.isSegmentIntersectionf;

        var segSxi,segSyi,
            segSxj,segSyj;

        var segExi,segEyi,
            segExj,segEyj;

        i = -1;
        while(++i < segs - 1)
        {
            indexSegi = i * 2;

            segSxi = segS[indexSegi  ];
            segSyi = segS[indexSegi+1];
            segExi = segE[indexSegi  ];
            segEyi = segE[indexSegi+1];

            j = i;
            while(++j < segs)
            {
                indexSegj = j * 2;

                segSxj = segS[indexSegj  ];
                segSyj = segS[indexSegj+1];
                segExj = segE[indexSegj  ];
                segEyj = segE[indexSegj+1];

                if (isSegmentIntersectionf(
                    segSxi,segSyi,segExi,segEyi,
                    segSxj,segSyj,segExj,segEyj,intersects))
                {

                    intersectX = intersects[0];
                    intersectY = intersects[1];

                    if ((intersectX != segSxi || intersectY != segSyi) &&
                        (intersectX != segExi || intersectY != segEyi))
                    {
                        if(segs == MAX_SEGS) return false;

                        indexSeg = segs * 2;

                        segS[indexSeg  ] = segSxi;
                        segS[indexSeg+1] = segSyi;
                        segE[indexSeg  ] = intersectX;
                        segE[indexSeg+1] = intersectY;

                        segs++;

                        segS[indexSegi  ] = intersectX;
                        segS[indexSegi+1] = intersectY;
                    }

                    if ((intersectX != segSxj || intersectY != segSyj) &&
                        (intersectX != segExj || intersectY != segEyj))
                    {
                        if(segs == MAX_SEGS) return false;

                        indexSeg = segs * 2;

                        segS[indexSeg  ] = segSxj;
                        segS[indexSeg+1] = segSyj;
                        segE[indexSeg  ] = intersectX;
                        segE[indexSeg+1] = intersectY;

                        segs++;

                        segS[indexSegj  ] = intersectX;
                        segS[indexSegj+1] = intersectY;
                    }
                }
            }
        }


        var segDiffx,
            segDiffy,
            segLen;

        i = -1;
        while(++i < segs)
        {
            indexSegi = i * 2;
            segDiffx = segE[indexSegi  ] - segS[indexSegi  ];
            segDiffy = segE[indexSegi+1] - segS[indexSegi+1];

            segLen   = Math.sqrt(segDiffx * segDiffx + segDiffy * segDiffy) || 1;

            segAngle[i] = (segDiffy >= 0.0) ?
                           Math.acos(segDiffx/segLen) :
                          (Math.acos(-segDiffx/segLen) + PI);

        }

        c = startX;
        d = startY;
        a = c - 1;
        b = d;
        e = 0;
        f = 0;

        corners = 1;

        out.push(c,d);

        while (true)
        {
            bestAngleDif = TWO_PI;

            for (i = 0; i < segs; i++)
            {
                indexSegi = i * 2;

                segSxi = segS[indexSegi  ];
                segSyi = segS[indexSegi+1];
                segExi = segE[indexSegi  ];
                segEyi = segE[indexSegi+1];


                if (segSxi == c && segSyi == d &&
                    (segExi !=a || segEyi != b))
                {
                    angleDif = lastAngle - segAngle[i];

                    while (angleDif >= TWO_PI) angleDif -= TWO_PI;
                    while (angleDif < 0      ) angleDif += TWO_PI;

                    if (angleDif < bestAngleDif)
                    {
                        bestAngleDif = angleDif;
                        e = segExi;
                        f = segEyi;
                    }
                }
                if (segExi == c && segEyi == d &&
                    (segSxi !=a || segSyi != b))
                {
                    angleDif = lastAngle - segAngle[i] + PI;

                    while (angleDif >= TWO_PI) angleDif -= TWO_PI;
                    while (angleDif <  0     ) angleDif += TWO_PI;

                    if (angleDif < bestAngleDif)
                    {
                        bestAngleDif = angleDif;
                        e = segSxi;
                        f = segSyi;
                    }
                }
            }

            if (corners > 1 &&
                c == out[0] && d == out[1] &&
                e == out[2] && f == out[3])
            {
                corners--;
                return true;
            }

            if (bestAngleDif == TWO_PI ||
                corners == MAX_SEGS)
            {
                return false;
            }

            corners++;
            out.push(e,f);

            lastAngle -= bestAngleDif + PI;

            a = c;
            b = d;
            c = e;
            d = f;
        }
    },

    /*---------------------------------------------------------------------------------------------------------*/


    //http://alienryderflex.com/polygon_inset/
    makeInset : function(polygon,distance)
    {
        if(polygon.length <= 2)return null;

        var num = polygon.length * 0.5 - 1;

        var sx = polygon[0],
            sy = polygon[1];

        var a, b,
            c = polygon[polygon.length - 2],
            d = polygon[polygon.length - 1],
            e = sx,
            f = sy;

        var index0,index1;

        var temp = new Array(2);

        var i = -1;
        while (++i < num)
        {
            a = c;
            b = d;
            c = e;
            d = f;

            index0 = i * 2;
            index1 = (i+1)*2;

            e = polygon[index1    ];
            f = polygon[index1 + 1];

            temp[0] = polygon[index0];
            temp[1] = polygon[index0 + 1];

            this.makeInsetCorner(a, b, c, d, e, f, distance, temp);
            polygon[index0    ] = temp[0];
            polygon[index0 + 1] = temp[1];
        }

        index0 = i * 2;

        temp[0] = polygon[index0    ];
        temp[1] = polygon[index0 + 1];

        this.makeInsetCorner(c, d, e, f, sx, sy, distance, temp);
        polygon[index0    ] = temp[0];
        polygon[index0 + 1] = temp[1];

        return polygon;
    },

    makeInsetCorner : function(a,b,c,d,e,f,distance,out)
    {
        var  c1 = c,
            d1 = d,
            c2 = c,
            d2 = d,
            dx1, dy1, dist1,
            dx2, dy2, dist2,
            insetX, insetY ;

        var EPSILON = 0.0001;

        dx1   = c - a;
        dy1   = d - b;
        dist1 = Math.sqrt(dx1*dx1+dy1*dy1);

        dx2   = e - c;
        dy2   = f - d;
        dist2 = Math.sqrt(dx2*dx2+dy2*dy2);

        if(dist1 < EPSILON || dist2  < EPSILON)return;

        dist1 = 1.0 / dist1;
        dist2 = 1.0 / dist2;

        insetX = dy1 * dist1 * distance;
        a     += insetX;
        c1    += insetX;

        insetY =-dx1 * dist1 * distance;
        b     += insetY;
        d1    += insetY;

        insetX = dy2 * dist2 * distance;
        e     += insetX;
        c2    += insetX;

        insetY =-dx2 * dist2 * distance;
        f     += insetY;
        d2    += insetY;

        if (c1 == c2 && d1==d2)
        {
            out[0] = c1;
            out[1] = d1;
            return; }

        var temp = new Array(2);

        if (Line2dUtil.isIntersectionf(a,b,c1,d1,c2,d2,e,f,temp))
        {
            out[0] = temp[0];
            out[1] = temp[1];
        }
    },

    /*---------------------------------------------------------------------------------------------------------*/

    isPointInPolygon : function(x,y,points)
    {
        var wn = 0;
        var len = points.length / 2;

        var index0,
            index1;


        var i = -1;
        while(++i < len - 1)
        {
            index0 = i * 2;
            index1 = (i + 1) * 2;

            if(points[index0+1] <= y)
            {
                if(points[index1+1] > y)
                {
                    if(Line2dUtil.isPointLeft(points[index0],points[index0 + 1],
                                              points[index1],points[index1 + 1],
                                              x,y)>0)++wn;
                }
            }
            else
            {
                if(points[index1+1] <= y)
                {
                    if(Line2dUtil.isPointLeft(points[index0],points[index0 + 1],
                                              points[index1],points[index1 + 1],
                                              x,y)<0)--wn;

                }
            }
        }

        return wn;

    },

    /*---------------------------------------------------------------------------------------------------------*/


    makeVerticesReversed : function(polygon){ return polygon.reverse();},


    makePolygon3dFloat32 : function(polygon,scale)
    {
        scale = scale || 1.0;

        var polyLen = polygon.length * 0.5,
            out     = new Float32Array(polyLen * 3);
        var index0,index1;

        var i = -1;
        while(++i < polyLen)
        {
            index0 = i * 3;
            index1 = i * 2;

            out[index0  ] = polygon[index1  ] * scale;
            out[index0+1] = 0.0;
            out[index0+2] = polygon[index1+1] * scale;
        }

        return out;
    }

    /*---------------------------------------------------------------------------------------------------------*/

    /*
    //Sutherland-Hodgman
    makeClippingSH : function(polygon,clippingPolygon)
    {
        var len0 = polygon.length * 0.5,
            len1 = clippingPolygon.length ;


        var Line2dUtil = Foam.Line2dUtil;

        var out = [];

        var clipEdgeSx,clipEdgeSy,
            clipEdgeEx,clipEdgeEy;

        var polyEdgeSx, polyEdgeSy,
            polyEdgeEx, polyEdgeEy;

        var polyVertIsOnLeft;

        console.log(clippingPolygon);

        var i, j;

        var i2, j2, i4;

        i = 0;
        while(i < len1)
        {
            clipEdgeSx = clippingPolygon[i  ];
            clipEdgeSy = clippingPolygon[i+1];

            i2 = (i + 2) % len1;
            clipEdgeEx = clippingPolygon[i2];
            clipEdgeEy = clippingPolygon[i2+1];


            i+=2;
        }
       // while(++i <)



        return out;

    },

    makeClippingV : function(polygon,clippingPolygon)
    {

    },

    makeScanFill : function(polygon)
    {

    }

    */




};
},{"../math/fMath":32,"./fLine2dUtil":10}],15:[function(require,module,exports){
var kMath = require('../math/fMath'),
    Vec3  = require('../math/fVec3'),
    Mat44 = require('../math/fMat44');

//TODO: Add close, smooth in out intrpl, pre post points
function Spline()
{
    this.points     = null;
    this.vertices   = null;

    this._detail    = 20;
    this._tension   = 0;
    this._bias      = 0;
    this._numPoints = null;
    this._numVerts  = null;

    this._tempVec0  = Vec3.make();
    this._tempVec1  = Vec3.make();
    this._tempMat0  = Mat44.make();
    this._tempMat1  = Mat44.make();
    this._tempMat2  = Mat44.make();

    this._axisY     = Vec3.AXIS_Y();
};

Spline.prototype.setPoint3f = function(index,x,y,z)
{
    var points = this.points;

    index*=3;
    points[index  ] = x;
    points[index+1] = y;
    points[index+2] = z;
};

Spline.prototype.setPoints =  function(arr)
{
    var num         = this._numPoints = arr.length / 3,
        numVerts    = this._numVerts  = (num - 1) * (this._detail - 1) + 1;

    this.points     = new Float32Array(arr);
    this.vertices   = new Float32Array(numVerts * 3);
};

Spline.prototype.update = function()
{
    var detail    = this._detail,
        detail_1  = detail - 1,
        points    = this.points,
        numPoints = this._numPoints,
        vertices  = this.vertices;

    var tension       = this._tension,
        bias          = this._bias,
        hermiteIntrpl = kMath.hermiteIntrpl;

    var i, j, t;
    var len = numPoints - 1;

    var index,index_1,index1,index2,
        vertIndex;

    var x, y, z;

    i = -1;
    while(++i < len)
    {
        index    = i;

        index1   = Math.min((index + 1),len) * 3;
        index2   = Math.min((index + 2),len) * 3;
        index_1  = Math.max(0,(index - 1))   * 3;
        index   *= 3;

        j = -1;
        while(++j < detail_1)
        {
            t = j / detail_1;

            x = hermiteIntrpl(points[index_1],
                              points[index  ],
                              points[index1 ],
                              points[index2 ],
                              t,tension,bias);

            y = hermiteIntrpl(points[index_1 + 1],
                              points[index   + 1],
                              points[index1  + 1],
                              points[index2  + 1],
                              t,tension,bias);

            z = hermiteIntrpl(points[index_1 + 2],
                              points[index   + 2],
                              points[index1  + 2],
                              points[index2  + 2],
                              t,tension,bias);

            vertIndex = (i * detail_1 + j) * 3;

            vertices[vertIndex  ] = x;
            vertices[vertIndex+1] = y;
            vertices[vertIndex+2] = z;
        }
    }

    var vertLen   = vertices.length,
        pointsLen = points.length;

    vertices[vertLen-3] = points[pointsLen-3];
    vertices[vertLen-2] = points[pointsLen-2];
    vertices[vertLen-1] = points[pointsLen-1];

};

Spline.prototype.setDetail  = function(detail) {this._detail  = detail;};
Spline.prototype.setTension = function(tension){this._tension = tension;};
Spline.prototype.setBias    = function(bias)   {this._bias    = bias;};

Spline.prototype.getNumPoints   = function(){return this._numPoints;};
Spline.prototype.getNumVertices = function(){return this._numVerts;};

Spline.prototype.getVec3OnPoints = function(val,out)
{
    out = out || this._tempVec0;

    var points    = this.points,
        numPoints = this._numPoints,
        len       = numPoints - 1;

    var index  = Math.floor(numPoints * val),
        index1 = Math.min(index + 1, len);

        index *= 3;
        index1*= 3;

    var localIntrpl    = (val % (1 / numPoints)) * numPoints,
        localIntrplInv = 1.0 - localIntrpl;

    out[0] = points[index  ] * localIntrplInv + points[index1  ] * localIntrpl;
    out[1] = points[index+1] * localIntrplInv + points[index1+1] * localIntrpl;
    out[2] = points[index+2] * localIntrplInv + points[index1+2] * localIntrpl;

    return out;

};

Spline.prototype.getVec3OnSpline = function(val,out)
{
    out = out || this._tempVec0;

    var vertices = this.vertices,
        numVerts = this._numVerts,
        len      = numVerts - 1;

    var index  = Math.min(Math.floor(numVerts * val),len),
        index1 = Math.min(index + 1,len);

    var localIntrpl    = (val % (1.0 / numVerts)) * numVerts,
        localIntrplInv = 1.0 - localIntrpl;

    index  *= 3;
    index1 *= 3;

    out[0] = vertices[index  ] * localIntrplInv + vertices[index1  ] * localIntrpl;
    out[1] = vertices[index+1] * localIntrplInv + vertices[index1+1] * localIntrpl;
    out[2] = vertices[index+2] * localIntrplInv + vertices[index1+2] * localIntrpl;

    return out;
};



//hm
Spline.prototype.getPointsLineLengthSq = function()
{
    var points    = this.points;

    var dx = 0,
        dy = 0,
        dz = 0;

    var i = points.length;
    while(i > 6)
    {
        dx += points[i-3] - points[i-6];
        dy += points[i-2] - points[i-5];
        dz += points[i-1] - points[i-4];

        i-=3;
    }

    return dx*dx+dy*dy+dz*dz;

};

Spline.prototype.getSplineLineLengthSq = function()
{
    var vertices = this.vertices;

    var dx = 0,
        dy = 0,
        dz = 0;

    var i = vertices.length;
    while(i > 6)
    {
        dx += vertices[i-3] - vertices[i-6];
        dy += vertices[i-2] - vertices[i-5];
        dz += vertices[i-1] - vertices[i-4];

        i-=3;
    }

    return dx*dx+dy*dy+dz*dz;
};

Spline.prototype.getPointsLineLength = function(){return Math.sqrt(this.getPointsLineLengthSq());};
Spline.prototype.getSplinePointsLength = function(){return Math.sqrt(this.getSplineLineLengthSq())};

module.exports = Spline;



},{"../math/fMat44":31,"../math/fMath":32,"../math/fVec3":35}],16:[function(require,module,exports){
var Vec3  = require('../math/fVec3'),
    Mat44 = require('../math/fMat44'),
    MatGL = require('./gl/fMatGL');

function CameraBasic()
{
    this.position = Vec3.make();
    this._target  = Vec3.make();
    this._up      = Vec3.AXIS_Y();

    this._fov  = 0;
    this._near = 0;
    this._far  = 0;

    this._aspectRatioLast = 0;

    this._modelViewMatrixUpdated  = false;
    this._projectionMatrixUpdated = false;

    this.projectionMatrix = Mat44.make();
    this.modelViewMatrix  = Mat44.make();
}

CameraBasic.prototype.setPerspective = function(fov,windowAspectRatio,near,far)
{
    this._fov  = fov;
    this._near = near;
    this._far  = far;

    this._aspectRatioLast = windowAspectRatio;

    this.updateProjectionMatrix();
};



CameraBasic.prototype.setTarget         = function(v)    {Vec3.set(this._target,v);this._modelViewMatrixUpdated = false;};
CameraBasic.prototype.setTarget3f       = function(x,y,z){Vec3.set3f(this._target,x,y,z);this._modelViewMatrixUpdated = false;};
CameraBasic.prototype.setPosition       = function(v)    {Vec3.set(this.position,v);this._modelViewMatrixUpdated = false;};
CameraBasic.prototype.setPosition3f     = function(x,y,z){Vec3.set3f(this.position,x,y,z);this._modelViewMatrixUpdated = false;};
CameraBasic.prototype.setUp             = function(v)    {Vec3.set(this._up,v);this._modelViewMatrixUpdated = false;};
CameraBasic.prototype.setUp3f           = function(x,y,z){ Vec3.set3f(this._up,x,y,z);this._modelViewMatrixUpdated = false;};

CameraBasic.prototype.setNear           = function(near)       {this._near = near;this._projectionMatrixUpdated = false;};
CameraBasic.prototype.setFar            = function(far)        {this._far  = far;this._projectionMatrixUpdated = false;};
CameraBasic.prototype.setFov            = function(fov)        {this._fov  = fov;this._projectionMatrixUpdated = false;};
CameraBasic.prototype.setAspectRatio    = function(aspectRatio){this._aspectRatioLast = aspectRatio;this._projectionMatrixUpdated = false;};

CameraBasic.prototype.updateModelViewMatrix   = function(){if(this._modelViewMatrixUpdated)return;MatGL.lookAt(this.modelViewMatrix,this.position,this._target,this._up); this._modelViewMatrixUpdated = true;};
CameraBasic.prototype.updateProjectionMatrix = function(){if(this._projectionMatrixUpdated)return;MatGL.perspective(this.projectionMatrix,this._fov,this._aspectRatioLast,this._near,this._far);this._projectionMatrixUpdated = true;};

CameraBasic.prototype.updateMatrices = function(){this.updateModelViewMatrix();this.updateProjectionMatrix();};

CameraBasic.prototype.toString = function(){return '{position= ' + Vec3.toString(this.position) +
                                                     ', target= ' + Vec3.toString(this._target) +
                                                     ', up= '     + Vec3.toString(this._up) + '}'};

module.exports = CameraBasic;



},{"../math/fMat44":31,"../math/fVec3":35,"./gl/fMatGL":20}],17:[function(require,module,exports){
var kError           = require('../system/fError'),
    ProgVertexShader = require('./gl/shader/fProgVertexShader'),
    ProgFragShader   = require('./gl/shader/fProgFragShader'),
    ProgLoader       = require('./gl/shader/fProgLoader'),
    ShaderLoader     = require('./gl/shader/fShaderLoader'),
    Platform         = require('../system/fPlatform'),
    Vec2             = require('../math/fVec2'),
    Vec3             = require('../math/fVec3'),
    Vec4             = require('../math/fVec4'),
    Mat33            = require('../math/fMat33'),
    Mat44            = require('../math/fMat44'),
    Color            = require('../util/fColor'),
    Texture          = require('./gl/fTexture');


function FGL(context3d,context2d)
{
    /*---------------------------------------------------------------------------------------------------------*/
    // Init
    /*---------------------------------------------------------------------------------------------------------*/

    var gl = this.gl = context3d;

    /*---------------------------------------------------------------------------------------------------------*/
    // create shaders/program + bind
    /*---------------------------------------------------------------------------------------------------------*/

    /*
    var progVertexShader = ShaderLoader.loadShaderFromString(gl, ProgVertexShader, gl.VERTEX_SHADER),
        progFragShader   = ShaderLoader.loadShaderFromString(gl, ((Platform.getTarget() == Platform.WEB) ?
                                                                  ShaderLoader.PrefixShaderWeb : '') +
                                                                  ProgFragShader, gl.FRAGMENT_SHADER);



    var programScene =  ProgLoader.loadProgram(gl,progVertexShader,progFragShader);
    */



    var platform = Platform.getTarget();

    var programScene = this._programScene = gl.createProgram();

    var progVertShader = gl.createShader(gl.VERTEX_SHADER),
        progFragShader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(progVertShader, ProgVertexShader);
    gl.compileShader(progVertShader);

    if(!gl.getShaderParameter(progVertShader,gl.COMPILE_STATUS))
        throw gl.getShaderInfoLog(progVertShader);

    gl.shaderSource(progFragShader, ((platform == Platform.WEB) ? ShaderLoader.PrefixShaderWeb : '') + ProgFragShader);
    gl.compileShader(progFragShader);

    if(!gl.getShaderParameter(progFragShader,gl.COMPILE_STATUS))
        throw gl.getShaderInfoLog(progFragShader);

    gl.bindAttribLocation(programScene,0,'aVertexPosition');

    gl.attachShader(programScene, progVertShader);
    gl.attachShader(programScene, progFragShader);
    gl.linkProgram( programScene);

    if(!gl.getProgramParameter(programScene,gl.LINK_STATUS))
        throw gl.getProgramInfoLog(programScene);

    gl.useProgram(programScene);



    /*---------------------------------------------------------------------------------------------------------*/
    // Bind & enable shader attributes & uniforms
    /*---------------------------------------------------------------------------------------------------------*/


    this._aVertexPosition   = gl.getAttribLocation(programScene,'aVertexPosition');
    this._aVertexNormal     = gl.getAttribLocation(programScene,'aVertexNormal');
    this._aVertexColor      = gl.getAttribLocation(programScene,'aVertexColor');
    this._aVertexTexCoord   = gl.getAttribLocation(programScene,'aVertexTexCoord');

    this._uModelViewMatrix  = gl.getUniformLocation(programScene,'uModelViewMatrix');
    this._uProjectionMatrix = gl.getUniformLocation(programScene,'uProjectionMatrix');
    this._uNormalMatrix     = gl.getUniformLocation(programScene,'uNormalMatrix');
    this._uTexImage         = gl.getUniformLocation(programScene,'uTexImage');

    this._uPointSize        = gl.getUniformLocation(programScene,'uPointSize');

    this._uUseLighting      = gl.getUniformLocation(programScene,'uUseLighting');
    this._uUseMaterial      = gl.getUniformLocation(programScene,'uUseMaterial');
    this._uUseTexture       = gl.getUniformLocation(programScene,'uUseTexture');

    this._uAmbient          = gl.getUniformLocation(programScene,'uAmbient');


    gl.enableVertexAttribArray(this._aVertexPosition);
    gl.enableVertexAttribArray(this._aVertexNormal);
    gl.enableVertexAttribArray(this._aVertexColor);
    gl.enableVertexAttribArray(this._aVertexTexCoord);

    /*---------------------------------------------------------------------------------------------------------*/
    // Set Shader initial values
    /*---------------------------------------------------------------------------------------------------------*/


    this.LIGHT_0    = 0;
    this.LIGHT_1    = 1;
    this.LIGHT_2    = 2;
    this.LIGHT_3    = 3;
    this.LIGHT_4    = 4;
    this.LIGHT_5    = 5;
    this.LIGHT_6    = 6;
    this.LIGHT_7    = 7;
    this.MAX_LIGHTS = 8;

    this.MODEL_PHONG       = 0;
    this.MODEL_ANTISOPTRIC = 1;
    this.MODEL_FRESNEL     = 2;
    this.MODEL_BLINN       = 3;
    this.MODEL_FLAT        = 4;




    var l = this.MAX_LIGHTS;



    var uLightPosition             = this._uLightPosition             = new Array(l),
        uLightAmbient              = this._uLightAmbient              = new Array(l),
        uLightDiffuse              = this._uLightDiffuse              = new Array(l),
        uLightSpecular             = this._uLightSpecular             = new Array(l),
        uLightAttenuationConstant  = this._uLightAttenuationConstant  = new Array(l),
        uLightAttenuationLinear    = this._uLightAttenuationLinear    = new Array(l),
        uLightAttenuationQuadratic = this._uLightAttenuationQuadratic = new Array(l);

    var light;

    var i = -1;
    while(++i < l)
    {
        light = 'uLights['+i+'].';


        uLightPosition[i]             = gl.getUniformLocation(programScene,light + 'position');
        uLightAmbient[i]              = gl.getUniformLocation(programScene,light + 'ambient');
        uLightDiffuse[i]              = gl.getUniformLocation(programScene,light + 'diffuse');
        uLightSpecular[i]             = gl.getUniformLocation(programScene,light + 'specular');

        uLightAttenuationConstant[i]  = gl.getUniformLocation(programScene,light + 'constantAttenuation');
        uLightAttenuationLinear[i]    = gl.getUniformLocation(programScene,light + 'linearAttenuation');
        uLightAttenuationQuadratic[i] = gl.getUniformLocation(programScene,light + 'quadraticAttenuation');

        gl.uniform4fv(uLightPosition[i], new Float32Array([0,0,0,0]));
        gl.uniform3fv(uLightAmbient[i],  new Float32Array([0,0,0]));
        gl.uniform3fv(uLightDiffuse[i],  new Float32Array([0,0,0]));

        gl.uniform1f(uLightAttenuationConstant[i], 1.0);
        gl.uniform1f(uLightAttenuationLinear[i],   0.0);
        gl.uniform1f(uLightAttenuationQuadratic[i],0.0);
    }

    this._uMaterialEmission  = gl.getUniformLocation(programScene,'uMaterial.emission');
    this._uMaterialAmbient   = gl.getUniformLocation(programScene,'uMaterial.ambient');
    this._uMaterialDiffuse   = gl.getUniformLocation(programScene,'uMaterial.diffuse');
    this._uMaterialSpecular  = gl.getUniformLocation(programScene,'uMaterial.specular');
    this._uMaterialShininess = gl.getUniformLocation(programScene,'uMaterial.shininess');

    gl.uniform4f(this._uMaterialEmission, 0.0,0.0,0.0,1.0);
    gl.uniform4f(this._uMaterialAmbient,  1.0,0.5,0.5,1.0);
    gl.uniform4f(this._uMaterialDiffuse,  0.0,0.0,0.0,1.0);
    gl.uniform4f(this._uMaterialSpecular, 0.0,0.0,0.0,1.0);
    gl.uniform1f(this._uMaterialShininess,10.0);


    this._tempLightPos = Vec4.make();

    gl.uniform1f(this._uUseMaterial, 0.0);
    gl.uniform1f(this._uUseLighting, 0.0);
    gl.uniform1f(this._uUseMaterial, 0.0);
    gl.uniform1f(this._uPointSize,   1.0);


    /*---------------------------------------------------------------------------------------------------------*/
    // Bind constants
    /*---------------------------------------------------------------------------------------------------------*/

    this.ACTIVE_ATTRIBUTES= 35721; this.ACTIVE_TEXTURE= 34016; this.ACTIVE_UNIFORMS= 35718; this.ALIASED_LINE_WIDTH_RANGE= 33902; this.ALIASED_POINT_SIZE_RANGE= 33901; this.ALPHA= 6406; this.ALPHA_BITS= 3413; this.ALWAYS= 519 ; this.ARRAY_BUFFER= 34962 ; this.ARRAY_BUFFER_BINDING= 34964 ; this.ATTACHED_SHADERS= 35717 ; this.BACK= 1029 ; this.BLEND= 3042 ; this.BLEND_COLOR= 32773 ; this.BLEND_DST_ALPHA= 32970 ; this.BLEND_DST_RGB= 32968 ; this.BLEND_EQUATION= 32777 ; this.BLEND_EQUATION_ALPHA= 34877 ; this.BLEND_EQUATION_RGB= 32777 ; this.BLEND_SRC_ALPHA= 32971 ; this.BLEND_SRC_RGB= 32969 ; this.BLUE_BITS= 3412 ; this.BOOL= 35670 ; this.BOOL_VEC2= 35671 ; this.BOOL_VEC3= 35672 ; this.BOOL_VEC4= 35673 ; this.BROWSER_DEFAULT_WEBGL= 37444 ; this.BUFFER_SIZE= 34660 ; this.BUFFER_USAGE= 34661 ; this.BYTE= 5120 ; this.CCW= 2305 ; this.CLAMP_TO_EDGE= 33071 ; this.COLOR_ATTACHMENT0= 36064 ; this.COLOR_BUFFER_BIT= 16384 ; this.COLOR_CLEAR_VALUE= 3106 ; this.COLOR_WRITEMASK= 3107 ; this.COMPILE_STATUS= 35713 ; this.COMPRESSED_TEXTURE_FORMATS= 34467 ; this.CONSTANT_ALPHA= 32771 ; this.CONSTANT_COLOR= 32769 ; this.CONTEXT_LOST_WEBGL= 37442 ; this.CULL_FACE= 2884 ; this.CULL_FACE_MODE= 2885 ; this.CURRENT_PROGRAM= 35725 ; this.CURRENT_VERTEX_ATTRIB= 34342 ; this.CW= 2304 ; this.DECR= 7683 ; this.DECR_WRAP= 34056 ; this.DELETE_STATUS= 35712 ; this.DEPTH_ATTACHMENT= 36096 ; this.DEPTH_BITS= 3414 ; this.DEPTH_BUFFER_BIT= 256 ; this.DEPTH_CLEAR_VALUE= 2931 ; this.DEPTH_COMPONENT= 6402 ; this.DEPTH_COMPONENT16= 33189 ; this.DEPTH_FUNC= 2932 ; this.DEPTH_RANGE= 2928 ; this.DEPTH_STENCIL= 34041 ; this.DEPTH_STENCIL_ATTACHMENT= 33306 ; this.DEPTH_TEST= 2929 ; this.DEPTH_WRITEMASK= 2930 ; this.DITHER= 3024 ; this.DONT_CARE= 4352 ; this.DST_ALPHA= 772 ; this.DST_COLOR= 774 ; this.DYNAMIC_DRAW= 35048 ; this.ELEMENT_ARRAY_BUFFER= 34963 ; this.ELEMENT_ARRAY_BUFFER_BINDING= 34965 ; this.EQUAL= 514 ; this.FASTEST= 4353 ; this.FLOAT= 5126 ; this.FLOAT_MAT2= 35674 ; this.FLOAT_MAT3= 35675 ; this.FLOAT_MAT4= 35676 ; this.FLOAT_VEC2= 35664 ; this.FLOAT_VEC3= 35665 ; this.FLOAT_VEC4= 35666 ; this.FRAGMENT_SHADER= 35632 ; this.FRAMEBUFFER= 36160 ; this.FRAMEBUFFER_ATTACHMENT_OBJECT_NAME= 36049 ; this.FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE= 36048 ; this.FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE= 36051 ; this.FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL= 36050 ; this.FRAMEBUFFER_BINDING= 36006 ; this.FRAMEBUFFER_COMPLETE= 36053 ; this.FRAMEBUFFER_INCOMPLETE_ATTACHMENT= 36054 ; this.FRAMEBUFFER_INCOMPLETE_DIMENSIONS= 36057 ; this.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT= 36055 ; this.FRAMEBUFFER_UNSUPPORTED= 36061 ; this.FRONT= 1028 ; this.FRONT_AND_BACK= 1032 ; this.FRONT_FACE= 2886 ; this.FUNC_ADD= 32774 ; this.FUNC_REVERSE_SUBTRACT= 32779 ; this.FUNC_SUBTRACT= 32778 ; this.GENERATE_MIPMAP_HINT= 33170 ; this.GEQUAL= 518 ; this.GREATER= 516 ; this.GREEN_BITS= 3411 ; this.HIGH_FLOAT= 36338 ; this.HIGH_INT= 36341 ; this.INCR= 7682 ; this.INCR_WRAP= 34055 ; this.INT= 5124 ; this.INT_VEC2= 35667 ; this.INT_VEC3= 35668 ; this.INT_VEC4= 35669 ; this.INVALID_ENUM= 1280 ; this.INVALID_FRAMEBUFFER_OPERATION= 1286 ; this.INVALID_OPERATION= 1282 ; this.INVALID_VALUE= 1281 ; this.INVERT= 5386 ; this.KEEP= 7680 ; this.LEQUAL= 515 ; this.LESS= 513 ; this.LINEAR= 9729 ; this.LINEAR_MIPMAP_LINEAR= 9987 ; this.LINEAR_MIPMAP_NEAREST= 9985 ; this.LINES= 1 ; this.LINE_LOOP= 2 ; this.LINE_STRIP= 3 ; this.LINE_WIDTH= 2849; this.LINK_STATUS= 35714; this.LOW_FLOAT= 36336 ; this.LOW_INT= 36339 ; this.LUMINANCE= 6409 ; this.LUMINANCE_ALPHA= 6410; this.MAX_COMBINED_TEXTURE_IMAGE_UNITS= 35661 ; this.MAX_CUBE_MAP_TEXTURE_SIZE= 34076 ; this.MAX_FRAGMENT_UNIFORM_VECTORS= 36349 ; this.MAX_RENDERBUFFER_SIZE= 34024 ; this.MAX_TEXTURE_IMAGE_UNITS= 34930 ; this.MAX_TEXTURE_SIZE= 3379 ; this. MAX_VARYING_VECTORS= 36348 ; this.MAX_VERTEX_ATTRIBS= 34921 ; this.MAX_VERTEX_TEXTURE_IMAGE_UNITS= 35660 ; this.MAX_VERTEX_UNIFORM_VECTORS= 36347 ; this.MAX_VIEWPORT_DIMS= 3386 ; this.MEDIUM_FLOAT= 36337 ; this.MEDIUM_INT= 36340 ; this.MIRRORED_REPEAT= 33648 ; this.NEAREST= 9728 ; this.NEAREST_MIPMAP_LINEAR= 9986 ; this.NEAREST_MIPMAP_NEAREST= 9984 ; this.NEVER= 512 ; this.NICEST= 4354 ; this.NONE= 0 ; this.NOTEQUAL= 517 ; this.NO_ERROR= 0 ; this.ONE= 1 ; this.ONE_MINUS_CONSTANT_ALPHA= 32772 ; this.ONE_MINUS_CONSTANT_COLOR= 32770 ; this.ONE_MINUS_DST_ALPHA= 773 ; this.ONE_MINUS_DST_COLOR= 775 ; this.ONE_MINUS_SRC_ALPHA= 771 ; this.ONE_MINUS_SRC_COLOR= 769 ; this.OUT_OF_MEMORY= 1285 ; this.PACK_ALIGNMENT= 3333 ; this.POINTS= 0 ; this.POLYGON_OFFSET_FACTOR= 32824 ; this.POLYGON_OFFSET_FILL= 32823 ; this.POLYGON_OFFSET_UNITS= 10752 ; this.RED_BITS= 3410 ; this.RENDERBUFFER= 36161 ; this.RENDERBUFFER_ALPHA_SIZE= 36179 ; this.RENDERBUFFER_BINDING= 36007 ; this.RENDERBUFFER_BLUE_SIZE= 36178 ; this.RENDERBUFFER_DEPTH_SIZE= 36180 ; this.RENDERBUFFER_GREEN_SIZE= 36177 ; this.RENDERBUFFER_HEIGHT= 36163 ; this.RENDERBUFFER_INTERNAL_FORMAT= 36164 ; this.RENDERBUFFER_RED_SIZE= 36176 ; this.RENDERBUFFER_STENCIL_SIZE= 36181 ; this.RENDERBUFFER_WIDTH= 36162 ; this.RENDERER= 7937 ; this.REPEAT= 10497 ; this.REPLACE= 7681 ; this.RGB= 6407 ; this.RGB5_A1= 32855 ; this.RGB565= 36194 ; this.RGBA= 6408 ; this.RGBA4= 32854 ; this.SAMPLER_2D= 35678 ; this.SAMPLER_CUBE= 35680 ; this.SAMPLES= 32937 ; this.SAMPLE_ALPHA_TO_COVERAGE= 32926 ; this.SAMPLE_BUFFERS= 32936 ; this.SAMPLE_COVERAGE= 32928 ; this.SAMPLE_COVERAGE_INVERT= 32939 ; this.SAMPLE_COVERAGE_VALUE= 32938 ; this.SCISSOR_BOX= 3088 ; this.SCISSOR_TEST= 3089 ; this.SHADER_TYPE= 35663 ; this.SHADING_LANGUAGE_VERSION= 35724 ; this.SHORT= 5122 ; this.SRC_ALPHA= 770 ; this.SRC_ALPHA_SATURATE= 776 ; this.SRC_COLOR= 768 ; this.STATIC_DRAW= 35044 ; this.STENCIL_ATTACHMENT= 36128 ; this.STENCIL_BACK_FAIL= 34817 ; this.STENCIL_BACK_FUNC= 34816 ; this.STENCIL_BACK_PASS_DEPTH_FAIL= 34818 ; this.STENCIL_BACK_PASS_DEPTH_PASS= 34819 ; this.STENCIL_BACK_REF= 36003 ; this.STENCIL_BACK_VALUE_MASK= 36004 ; this.STENCIL_BACK_WRITEMASK= 36005 ; this.STENCIL_BITS= 3415 ; this.STENCIL_BUFFER_BIT= 1024 ; this.STENCIL_CLEAR_VALUE= 2961 ; this.STENCIL_FAIL= 2964 ; this.STENCIL_FUNC= 2962 ; this.STENCIL_INDEX= 6401 ; this.STENCIL_INDEX8= 36168 ; this.STENCIL_PASS_DEPTH_FAIL= 2965 ; this.STENCIL_PASS_DEPTH_PASS= 2966 ; this.STENCIL_REF= 2967 ; this.STENCIL_TEST= 2960 ; this.STENCIL_VALUE_MASK= 2963 ; this.STENCIL_WRITEMASK= 2968 ; this.STREAM_DRAW= 35040 ; this.SUBPIXEL_BITS= 3408 ; this.TEXTURE= 5890 ; this.TEXTURE0= 33984 ; this.TEXTURE1= 33985 ; this.TEXTURE2= 33986 ; this.TEXTURE3= 33987 ; this.TEXTURE4= 33988 ; this.TEXTURE5= 33989 ; this.TEXTURE6= 33990 ; this.TEXTURE7= 33991 ; this.TEXTURE8= 33992 ; this.TEXTURE9= 33993 ; this.TEXTURE10= 33994 ; this.TEXTURE11= 33995 ; this.TEXTURE12= 33996 ; this.TEXTURE13= 33997 ; this.TEXTURE14= 33998 ; this.TEXTURE15= 33999 ; this.TEXTURE16= 34000 ; this.TEXTURE17= 34001 ; this.TEXTURE18= 34002 ; this.TEXTURE19= 34003 ; this.TEXTURE20= 34004 ; this.TEXTURE21= 34005 ; this.TEXTURE22= 34006 ; this.TEXTURE23= 34007 ; this.TEXTURE24= 34008 ; this.TEXTURE25= 34009 ; this.TEXTURE26= 34010 ; this.TEXTURE27= 34011 ; this.TEXTURE28= 34012 ; this.TEXTURE29= 34013 ; this.TEXTURE30= 34014 ; this.TEXTURE31= 34015 ; this.TEXTURE_2D= 3553 ; this.TEXTURE_BINDING_2D= 32873 ; this.TEXTURE_BINDING_CUBE_MAP= 34068 ; this.TEXTURE_CUBE_MAP= 34067 ; this.TEXTURE_CUBE_MAP_NEGATIVE_X= 34070 ; this.TEXTURE_CUBE_MAP_NEGATIVE_Y= 34072 ; this.TEXTURE_CUBE_MAP_NEGATIVE_Z= 34074 ; this.TEXTURE_CUBE_MAP_POSITIVE_X= 34069 ; this.TEXTURE_CUBE_MAP_POSITIVE_Y= 34071 ; this.TEXTURE_CUBE_MAP_POSITIVE_Z= 34073 ; this.TEXTURE_MAG_FILTER= 10240 ; this.TEXTURE_MIN_FILTER= 10241 ; this.TEXTURE_WRAP_S= 10242 ; this.TEXTURE_WRAP_T= 10243 ; this.TRIANGLES= 4 ; this.TRIANGLE_FAN= 6 ; this.TRIANGLE_STRIP= 5 ; this.UNPACK_ALIGNMENT= 3317 ; this.UNPACK_COLORSPACE_CONVERSION_WEBGL= 37443 ; this.UNPACK_FLIP_Y_WEBGL= 37440 ; this.UNPACK_PREMULTIPLY_ALPHA_WEBGL= 37441 ; this.UNSIGNED_BYTE= 5121 ; this.UNSIGNED_INT= 5125 ; this.UNSIGNED_SHORT= 5123 ; this.UNSIGNED_SHORT_4_4_4_4= 32819 ; this.UNSIGNED_SHORT_5_5_5_1= 32820 ; this.UNSIGNED_SHORT_5_6_5= 33635 ; this.VALIDATE_STATUS= 35715 ; this.VENDOR= 7936 ; this.VERSION= 7938 ; this.VERTEX_ATTRIB_ARRAY_BUFFER_BINDING= 34975 ; this.VERTEX_ATTRIB_ARRAY_ENABLED= 34338 ; this.VERTEX_ATTRIB_ARRAY_NORMALIZED= 34922 ; this.VERTEX_ATTRIB_ARRAY_POINTER= 34373 ; this.VERTEX_ATTRIB_ARRAY_SIZE= 34339 ; this.VERTEX_ATTRIB_ARRAY_STRIDE= 34340 ; this.VERTEX_ATTRIB_ARRAY_TYPE= 34341 ; this.VERTEX_SHADER= 35633 ; this.VIEWPORT= 2978 ; this.ZERO = 0 ;


    var SIZE_OF_VERTEX    = Vec3.SIZE,
        SIZE_OF_COLOR     = Color.SIZE,
        SIZE_OF_TEX_COORD = Vec2.SIZE;

    this.SIZE_OF_VERTEX    = SIZE_OF_VERTEX;
    this.SIZE_OF_NORMAL    = SIZE_OF_VERTEX;
    this.SIZE_OF_COLOR     = SIZE_OF_COLOR;
    this.SIZE_OF_TEX_COORD =  SIZE_OF_TEX_COORD;

    var SIZE_OF_FACE    = this.SIZE_OF_FACE   = SIZE_OF_VERTEX;

    var SIZE_OF_QUAD     = this.SIZE_OF_QUAD     = SIZE_OF_VERTEX * 4,
        SIZE_OF_TRIANGLE = this.SIZE_OF_TRIANGLE = SIZE_OF_VERTEX * 3,
        SIZE_OF_LINE     = this.SIZE_OF_LINE     = SIZE_OF_VERTEX * 2,
        SIZE_OF_POINT    = this.SIZE_OF_POINT    = SIZE_OF_VERTEX;

    var ELLIPSE_DETAIL_MAX = this.ELLIPSE_DETAIL_MAX = 30;
    this.ELLIPSE_DETAIL_MIN = 3;

    /*---------------------------------------------------------------------------------------------------------*/
    // Init shared buffers
    /*---------------------------------------------------------------------------------------------------------*/

    this.REPEAT        = gl.REPEAT;
    this.CLAMP         = gl.CLAMP;
    this.CLAMP_TO_EDGE = gl.CLAMP_TO_EDGE;

    this._texMode  = this.REPEAT;
    this._texSet   = false;

    this._texEmpty = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D,this._texEmpty);
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([1,1,1,1]));
    gl.uniform1f(this._uUseTexture,0.0);

    this._tex      = null;

    this._defaultVBO = gl.createBuffer();
    this._defaultIBO = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER,         this._defaultVBO);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._defaultIBO);

    /*---------------------------------------------------------------------------------------------------------*/
    // Init flags and caches
    /*---------------------------------------------------------------------------------------------------------*/

    this._bUseLighting         = false;
    this._bUseMaterial         = false;
    this._bUseTexture          = false;

    this._bUseBillboarding     = false;

    this._bUseDrawArrayBatch        = false;
    this._bUseDrawElementArrayBatch = false;
    this._drawFuncLast = null;

    this._bBatchVertices  = [];
    this._bBatchNormals   = [];
    this._bBatchColors    = [];
    this._bBatchTexCoords = [];
    this._bBatchIndices   = [];

    this._bBatchVerticesNum = 0;



    this._bBVecRight = Vec3.make();
    this._bBVecUp    = Vec3.make();
    this._bBVertices = new Float32Array(4 * 3);

    this._bBVec0 = Vec3.make();
    this._bBVec1 = Vec3.make();
    this._bBVec2 = Vec3.make();
    this._bBVec3 = Vec3.make();

    this._rectWidthLast    = 0;
    this._rectHeightLast   = 0;


    /*---------------------------------------------------------------------------------------------------------*/
    // Init Matrices
    /*---------------------------------------------------------------------------------------------------------*/

    this._camera    = null;

    this._mModeView = Mat44.make();
    this._mNormal   = Mat33.make();

    this._mTemp = Mat44.make();

    this._mStack = [];

    this._drawMode = this.LINES;

    /*---------------------------------------------------------------------------------------------------------*/
    // Init Buffers
    /*---------------------------------------------------------------------------------------------------------*/

    this._bEmpty3f = new Float32Array([0,0,0]);

    this._bColor4f   = Color.WHITE();
    this._bColorBg4f = Color.BLACK();

    this._bVertex   = null;
    this._bNormal   = null;
    this._bColor    = null;
    this._bTexCoord = null;
    this._bIndex    = null;

    this._bVertexPoint = new Float32Array(SIZE_OF_POINT);
    this._bColorPoint  = new Float32Array(SIZE_OF_COLOR);

    this._bVertexLine  = new Float32Array(SIZE_OF_LINE);
    this._bColorLine   = new Float32Array(2 * SIZE_OF_COLOR);

    this._bVertexTriangle          = new Float32Array(SIZE_OF_TRIANGLE);
    this._bNormalTriangle          = new Float32Array(SIZE_OF_TRIANGLE);
    this._bColorTriangle           = new Float32Array(3 * SIZE_OF_COLOR);
    this._bIndexTriangle           = new Uint16Array([0,1,2]);
    this._bTexCoordTriangleDefault = new Float32Array([0.0,0.0,1.0,0.0,1.0,1.0]);
    this._bTexCoordTriangle        = new Float32Array(this._bTexCoordTriangleDefault.length);

    this._bVertexQuad          = new Float32Array(SIZE_OF_QUAD);
    this._bNormalQuad          = new Float32Array(SIZE_OF_QUAD);
    this._bColorQuad           = new Float32Array(4 * SIZE_OF_COLOR);
    this._bIndexQuad           = new Uint16Array([0,1,2,1,2,3]);
    this._bTexCoordQuadDefault = new Float32Array([0.0,0.0,1.0,0.0,1.0,1.0,0.0,1.0]);
    this._bTexCoordQuad        = new Float32Array(this._bTexCoordQuadDefault.length);

    this._bVertexRect = new Float32Array(SIZE_OF_QUAD);
    this._bNormalRect = new Float32Array([0,1,0,0,1,0,0,1,0,0,1,0]);
    this._bColorRect  = new Float32Array(4 * SIZE_OF_COLOR);

    this._bVertexEllipse   = new Float32Array(SIZE_OF_VERTEX * ELLIPSE_DETAIL_MAX);
    this._bNormalEllipse   = new Float32Array(this._bVertexEllipse.length);
    this._bColorEllipse    = new Float32Array(SIZE_OF_COLOR  * ELLIPSE_DETAIL_MAX);
    this._bTexCoordEllipse = new Float32Array(SIZE_OF_TEX_COORD * ELLIPSE_DETAIL_MAX);

    this._bVertexCircle   = new Float32Array(SIZE_OF_VERTEX * ELLIPSE_DETAIL_MAX);
    this._bNormalCircle   = new Float32Array(this._bVertexCircle.length);
    this._bColorCircle    = new Float32Array(SIZE_OF_COLOR * ELLIPSE_DETAIL_MAX);
    this._bTexCoordCircle = new Float32Array(SIZE_OF_TEX_COORD * ELLIPSE_DETAIL_MAX);

    this._bVertexCube       = new Float32Array([-0.5,-0.5, 0.5,
                                                0.5,-0.5, 0.5,
                                                0.5, 0.5, 0.5,
                                                -0.5, 0.5, 0.5,
                                                -0.5,-0.5,-0.5,
                                                -0.5, 0.5,-0.5,
                                                  0.5, 0.5,-0.5, 0.5,-0.5,-0.5,-0.5, 0.5,-0.5,-0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5,-0.5,-0.5,-0.5,-0.5, 0.5,-0.5,-0.5, 0.5,-0.5, 0.5,-0.5,-0.5, 0.5,0.5,-0.5,-0.5, 0.5, 0.5,-0.5, 0.5, 0.5, 0.5, 0.5,-0.5, 0.5,-0.5,-0.5,-0.5,-0.5,-0.5, 0.5,-0.5, 0.5, 0.5,-0.5, 0.5,-0.5]);
    this._bVertexCubeScaled = new Float32Array(new Array(this._bVertexCube.length));
    this._bColorCube    = new Float32Array(this._bVertexCube.length / SIZE_OF_VERTEX * SIZE_OF_COLOR);
    this._bNormalCube   = new Float32Array([0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0] );
    this._bIndexCube    = new Uint16Array([  0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9,10, 8,10,11, 12,13,14,12,14,15, 16,17,18,16,18,19, 20,21,22,20,22,23]);
    this._bTexCoordCube = null;

    this._circleDetailLast = 10.0;
    this._sphereDetailLast = 10.0;
    this._sphereScaleLast  = -1;
    this._cubeScaleLast    = -1;

    this._bVertexSphere       = null;
    this._bVertexSphereScaled = null;
    this._bNormalSphere       = null;
    this._bColorSphere        = null;
    this._bIndexSphere        = null;
    this._bTexCoordsSphere    = null;

    this._bScreenCoords = [0,0];
    this._bPoint0       = [0,0,0];
    this._bPoint1       = [0,0,0];

    this._axisX = Vec3.AXIS_X();
    this._axisY = Vec3.AXIS_Y();
    this._axisZ = Vec3.AXIS_Z();

    this._lineBoxWidth  = 1;
    this._lineBoxHeight = 1;
    this._lineCylinderRadius = 0.5;

    this._genSphere();
    this._genCircle();

    /*---------------------------------------------------------------------------------------------------------*/
    // Init presets
    /*---------------------------------------------------------------------------------------------------------*/

    gl.enable(gl.BLEND);
    gl.enable(gl.DEPTH_TEST);

    this.ambient(Color.BLACK());

}

/*---------------------------------------------------------------------------------------------------------*/
// Light
/*---------------------------------------------------------------------------------------------------------*/

FGL.prototype.useLighting  = function(bool){this.gl.uniform1f(this._uUseLighting,bool ? 1.0 : 0.0);this._bUseLighting = bool;};
FGL.prototype.getLighting  = function()    {return this._bUseLighting;};

FGL.prototype.light = function(light)
{
    var id = light.getId(),
        gl = this.gl;

    var tempVec4    = this._tempLightPos;
        tempVec4[0] = light.position[0];
        tempVec4[1] = light.position[1];
        tempVec4[2] = light.position[2];
        tempVec4[3] = light.position[3];

    var lightPosEyeSpace = Mat44.multVec4(this._camera.modelViewMatrix,tempVec4);

    gl.uniform4fv(this._uLightPosition[id], lightPosEyeSpace);
    gl.uniform3fv(this._uLightAmbient[id],  light.ambient);
    gl.uniform3fv(this._uLightDiffuse[id],  light.diffuse);
    gl.uniform3fv(this._uLightSpecular[id], light.specular);

    gl.uniform1f(this._uLightAttenuationConstant[id],   light.constantAttentuation);
    gl.uniform1f(this._uLightAttenuationLinear[id],     light.linearAttentuation);
    gl.uniform1f(this._uLightAttenuationQuadratic[id],  light.quadricAttentuation);
};

//FIX ME
FGL.prototype.disableLight = function(light)
{
    var id = light.getId(),
        gl = this.gl;

    var bEmpty = this._bEmpty3f;

    gl.uniform3fv(this._uLightAmbient[id],  bEmpty);
    gl.uniform3fv(this._uLightDiffuse[id],  bEmpty);
    gl.uniform3fv(this._uLightSpecular[id], bEmpty);

    gl.uniform1f(this._uLightAttenuationConstant[id], 1.0);
    gl.uniform1f(this._uLightAttenuationLinear[id],   0.0);
    gl.uniform1f(this._uLightAttenuationQuadratic[id],0.0);
};

/*---------------------------------------------------------------------------------------------------------*/
// Texture
/*---------------------------------------------------------------------------------------------------------*/

//TODO: do it the plask way

FGL.prototype.useTexture  = function(bool){this.gl.uniform1f(this._uUseTexture, bool ? 1.0 : 0.0);this._bUseTexture = bool;};

FGL.prototype.loadTextureWithImage = function(img)
{
    var gl = this.gl,
        glTex = gl.createTexture();
    glTex.image = img;

    var tex = new Texture(glTex);
    this._bindTexImage(tex._tex);

    return tex;

};

FGL.prototype.loadTexture = function(src,texture,callback)
{
    var gl  = this.gl,
        glTex = gl.createTexture();
    glTex.image = new Image();

    glTex.image.addEventListener('load',function()
    {
        texture.setTexSource(this._bindTexImage(glTex));
        callback();
    });

    glTex.image.src = src;
};

FGL.prototype._bindTexImage = function(glTex)
{
    if(!glTex.image)throw ('Texture image is null.');

    var width  = glTex.image.width,
        height = glTex.image.height;

    if((width&(width-1)!=0))       {throw 'Texture image width is not power of 2.'; }
    else if((height&(height-1))!=0){throw 'Texture image height is not power of 2.';}

    var gl = this.gl;

    gl.bindTexture(gl.TEXTURE_2D,glTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, glTex.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.bindTexture(gl.TEXTURE_2D,null);


    return glTex;
};

FGL.prototype.texture = function(texture)
{
    var gl = this.gl;

    this._tex = texture._tex;
    gl.bindTexture(gl.TEXTURE_2D,this._tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, this._texMode );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, this._texMode );
    gl.uniform1i(this._uTexImage,0);
};

FGL.prototype.disableTextures = function()
{
    var gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D,this._texEmpty);
    gl.vertexAttribPointer(this._aVertexTexCoord,Vec2.SIZE,gl.FLOAT,false,0,0);
    gl.uniform1f(this._uUseTexture,0.0);
};

/*---------------------------------------------------------------------------------------------------------*/
// Material
/*---------------------------------------------------------------------------------------------------------*/

FGL.prototype.useMaterial = function(bool){this.gl.uniform1f(this._uUseMaterial,bool ? 1.0 : 0.0);this._bUseMaterial = bool;};

FGL.prototype.material = function(material)
{
    var gl = this.gl;

    //gl.uniform4fv(this._uMaterialEmission,  material.emission);
    gl.uniform4fv(this._uMaterialAmbient,   material.ambient);
    gl.uniform4fv(this._uMaterialDiffuse,   material.diffuse);
    gl.uniform4fv(this._uMaterialSpecular,  material.specular);
    gl.uniform1f( this._uMaterialShininess, material.shininess);
};

/*---------------------------------------------------------------------------------------------------------*/
// Camera
/*---------------------------------------------------------------------------------------------------------*/

FGL.prototype.setCamera = function(camera){this._camera = camera;};

/*---------------------------------------------------------------------------------------------------------*/
// Matrix stack
/*---------------------------------------------------------------------------------------------------------*/

FGL.prototype.loadIdentity = function(){this._mModelView = Mat44.identity(this._camera.modelViewMatrix);};
FGL.prototype.pushMatrix   = function(){this._mStack.push(Mat44.copy(this._mModelView));};
FGL.prototype.popMatrix    = function()
{
    var stack = this._mStack;

    if(stack.length == 0)throw ('Invalid pop!');
    this._mModelView = stack.pop();

    return this._mModelView;
};

FGL.prototype.setMatricesUniform = function()
{
    var gl = this.gl;

    gl.uniformMatrix4fv(this._uModelViewMatrix,false,this._mModelView);
    gl.uniformMatrix4fv(this._uProjectionMatrix,false,this._camera.projectionMatrix);

    if(!this._bUseLighting)return;

    Mat44.toMat33Inversed(this._mModelView,this._mNormal);
    Mat33.transpose(this._mNormal,this._mNormal);

    gl.uniformMatrix3fv(this._uNormalMatrix,false,this._mNormal);
};

/*---------------------------------------------------------------------------------------------------------*/
// Matrix stack transformations
/*---------------------------------------------------------------------------------------------------------*/

FGL.prototype.translate     = function(v)          {Mat44.multPost(this._mModelView,Mat44.makeTranslate(v[0],v[1],v[2],Mat44.identity(this._mTemp)),this._mModelView);};
FGL.prototype.translate3f   = function(x,y,z)      {Mat44.multPost(this._mModelView,Mat44.makeTranslate(x,y,z,Mat44.identity(this._mTemp)),this._mModelView);};
FGL.prototype.translateX    = function(x)          {Mat44.multPost(this._mModelView,Mat44.makeTranslate(x,0,0,Mat44.identity(this._mTemp)),this._mModelView);};
FGL.prototype.translateY    = function(y)          {Mat44.multPost(this._mModelView,Mat44.makeTranslate(0,y,0,Mat44.identity(this._mTemp)),this._mModelView);};
FGL.prototype.translateZ    = function(z)          {Mat44.multPost(this._mModelView,Mat44.makeTranslate(0,0,z,Mat44.identity(this._mTemp)),this._mModelView);};
FGL.prototype.scale         = function(v)          {Mat44.multPost(this._mModelView,Mat44.makeScale(v[0],v[1],v[2],Mat44.identity(this._mTemp)),this._mModelView);};
FGL.prototype.scale1f       = function(n)          {Mat44.multPost(this._mModelView,Mat44.makeScale(n,n,n,Mat44.identity(this._mTemp)),this._mModelView);};
FGL.prototype.scale3f       = function(x,y,z)      {Mat44.multPost(this._mModelView,Mat44.makeScale(x,y,z,Mat44.identity(this._mTemp)),this._mModelView);};
FGL.prototype.scaleX        = function(x)          {Mat44.multPost(this._mModelView,Mat44.makeScale(x,1,1,Mat44.identity(this._mTemp)),this._mModelView);};
FGL.prototype.scaleY        = function(y)          {Mat44.multPost(this._mModelView,Mat44.makeScale(1,y,1,Mat44.identity(this._mTemp)),this._mModelView);};
FGL.prototype.scaleZ        = function(z)          {Mat44.multPost(this._mModelView,Mat44.makeScale(1,1,z,Mat44.identity(this._mTemp)),this._mModelView);};
FGL.prototype.rotate        = function(v)          {Mat44.multPost(this._mModelView,Mat44.makeRotationXYZ(v[0],v[1],v[2],Mat44.identity(this._mTemp)),this._mModelView);};
FGL.prototype.rotate3f      = function(x,y,z)      {Mat44.multPost(this._mModelView,Mat44.makeRotationXYZ(x,y,z,Mat44.identity(this._mTemp)),this._mModelView);};
FGL.prototype.rotateX       = function(x)          {Mat44.multPost(this._mModelView,Mat44.makeRotationX(x,Mat44.identity(this._mTemp)),this._mModelView);};
FGL.prototype.rotateY       = function(y)          {Mat44.multPost(this._mModelView,Mat44.makeRotationY(y,Mat44.identity(this._mTemp)),this._mModelView);};
FGL.prototype.rotateZ       = function(z)          {Mat44.multPost(this._mModelView,Mat44.makeRotationZ(z,Mat44.identity(this._mTemp)),this._mModelView);};
FGL.prototype.rotateAxis    = function(angle,v)    {Mat44.multPost(this._mModelView,Mat44.makeRotationOnAxis(angle,v[0],v[1],v[2]),this._mModelView);};
FGL.prototype.rotateAxis3f  = function(angle,x,y,z){Mat44.multPost(this._mModelView,Mat44.makeRotationOnAxis(angle,x,y,z),this._mModelView);};

/*---------------------------------------------------------------------------------------------------------*/
// convenience draw
/*---------------------------------------------------------------------------------------------------------*/


FGL.prototype.drawElements = function(vertexFloat32Array,normalFloat32Array,colorFloat32Array,uvFloat32Array,indexArray,mode,count,offset,type,drawType)
{
    var gl = this.gl;

    this.bufferArrays(vertexFloat32Array,normalFloat32Array,colorFloat32Array,uvFloat32Array);
    this.setMatricesUniform();
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,indexArray,drawType || gl.DYNAMIC_DRAW);
    gl.drawElements(mode  || this.TRIANGLES,
                    count || indexArray.length,
                    type  || gl.UNSIGNED_SHORT,
                    offset || 0);
};


FGL.prototype.drawArrays = function(vertexFloat32Array,normalFloat32Array,colorFloat32Array,uvFloat32Array,mode,first,count)
{

    this.bufferArrays(vertexFloat32Array,normalFloat32Array,colorFloat32Array,uvFloat32Array);
    this.setMatricesUniform();
    this.gl.drawArrays(mode  || this._drawMode,
                       first || 0,
                       count || vertexFloat32Array.length / this.SIZE_OF_VERTEX);
};

FGL.prototype.drawGeometry = function(geom,count,offset) {geom._draw(this,count,offset);};

/*---------------------------------------------------------------------------------------------------------*/
// convenience filling default vbo
/*---------------------------------------------------------------------------------------------------------*/

FGL.prototype.bufferArrays = function(vertexFloat32Array,normalFloat32Array,colorFloat32Array,texCoordFloat32Array,glDrawMode)
{
    var na = normalFloat32Array   ? true : false,
        ca = colorFloat32Array    ? true : false,
        ta = texCoordFloat32Array ? true : false;

    var aVertexNormal   = this._aVertexNormal,
        aVertexColor    = this._aVertexColor,
        aVertexTexCoord = this._aVertexTexCoord;

    var gl            = this.gl,
        glArrayBuffer = gl.ARRAY_BUFFER,
        glFloat       = gl.FLOAT;

    glDrawMode = glDrawMode || gl.DYNAMIC_DRAW;

    var vblen =      vertexFloat32Array.byteLength,
        nblen = na ? normalFloat32Array.byteLength : 0,
        cblen = ca ? colorFloat32Array.byteLength   : 0,
        tblen = ta ? texCoordFloat32Array.byteLength : 0;

    var offsetV = 0,
        offsetN = offsetV + vblen,
        offsetC = offsetN + nblen,
        offsetT = offsetC + cblen;

    gl.bufferData(glArrayBuffer, vblen + nblen + cblen + tblen, glDrawMode);

    gl.bufferSubData(glArrayBuffer, offsetV, vertexFloat32Array);
    gl.vertexAttribPointer(this._aVertexPosition, this.SIZE_OF_VERTEX, glFloat, false, 0, offsetV);

    if(!na){ gl.disableVertexAttribArray(aVertexNormal);}
    else
    {
        gl.enableVertexAttribArray(aVertexNormal);
        gl.bufferSubData(glArrayBuffer,offsetN,normalFloat32Array);
        gl.vertexAttribPointer(aVertexNormal,this.SIZE_OF_NORMAL,glFloat,false,0,offsetN);
    }

    if(!ca){ gl.disableVertexAttribArray(aVertexColor); }
    {
        gl.enableVertexAttribArray(aVertexColor);
        gl.bufferSubData(glArrayBuffer, offsetC, colorFloat32Array);
        gl.vertexAttribPointer(aVertexColor, this.SIZE_OF_COLOR,  glFloat, false, 0, offsetC);
    }

    if(!ta){ gl.disableVertexAttribArray(aVertexTexCoord);}
    else
    {
        gl.enableVertexAttribArray(aVertexTexCoord);
        gl.bufferSubData(glArrayBuffer,offsetT,texCoordFloat32Array);
        gl.vertexAttribPointer(aVertexTexCoord,this.SIZE_OF_TEX_COORD,glFloat,false,0,offsetT);
    }
};


FGL.prototype.bufferColors = function(color,buffer)
{
    //if(this._bUseMaterial || this._bUseTexture)return null;

    //hm, fix me
    if(this._bUseMaterial || this._bUseTexture)return buffer;

    var i = 0;

    if(color.length == 4)
    {
        while(i < buffer.length)
        {
            buffer[i]  =color[0];
            buffer[i+1]=color[1];
            buffer[i+2]=color[2];
            buffer[i+3]=color[3];
            i+=4;
        }
    }
    else
    {
        if(color.length != buffer.length)
        {
            throw new Error(kError.COLORS_IN_WRONG_SIZE);
        }

        while(i < buffer.length)
        {
            buffer[i]   = color[i];
            buffer[i+1] = color[i+1];
            buffer[i+2] = color[i+2];
            buffer[i+3] = color[i+3];
            i+=4;
        }
    }

    return buffer;
};

FGL.prototype.bufferVertices = function(vertices,buffer)
{
    if(vertices.length != buffer.length)throw (kError.VERTICES_IN_WRONG_SIZE + buffer.length + '.');
    var i = -1;while(++i < buffer.length)buffer[i] = vertices[i];
    return buffer;
};

/*---------------------------------------------------------------------------------------------------------*/
// Helpers
/*---------------------------------------------------------------------------------------------------------*/


FGL.prototype._scaleVertices = function(vert0,scale,vert1)
{
    if(!scale)return vert0;
    var i = -1, l = vert0.length;while(++i < l)vert1[i] = vert0[i] * scale;return vert1;
};


/*---------------------------------------------------------------------------------------------------------*/
// Batch
/*---------------------------------------------------------------------------------------------------------*/

FGL.prototype._putComp = function(orig,target)
{

};

FGL.prototype.beginDrawArrayBatch = function()
{
    this._bUseDrawArrayBatch = true;


};

FGL.prototype.endDrawArrayBatch = function()
{
    this._bUseDrawArrayBatch = false;

};

FGL.prototype.drawArrayBatch = function()
{

};

FGL.prototype.beginDrawElementArrayBatch = function()
{
    this._bUseDrawElementArrayBatch = true;

    this._bBatchVertices.length = 0;

};

FGL.prototype.endDrawElementArrayBatch = function()
{
    this._bUseDrawElementArrayBatch = false;


};

FGL.prototype._pushElementArrayBatch = function(vertexFloat32Array,normalFloat32Array,colorFloat32Array,texCoordsFloat32Array,indexUint16Array)
{

    var transMatrix = this._mModelView;

    var offsetIndex = this._bBatchVertices.length / 3;
    var offset,length,index;

    var batchVertices        = this._bBatchVertices,
        batchVerticesOffset  = batchVertices.length;
        batchVertices.length+= vertexFloat32Array.length;

        offset = batchVerticesOffset;
        length = batchVertices.length;
        index  = 0;

    while(offset < length)
    {

        batchVertices[offset  ] = vertexFloat32Array[index  ];
        batchVertices[offset+1] = vertexFloat32Array[index+1];
        batchVertices[offset+2] = vertexFloat32Array[index+2];

        Mat44.multVec3AI(transMatrix,batchVertices,offset);

        offset+=3;
        index +=3;
    }


    if(normalFloat32Array   )this._putBatch(this._bBatchNormals,normalFloat32Array);
    if(colorFloat32Array    )this._putBatch(this._bBatchColors,colorFloat32Array);
    if(texCoordsFloat32Array)this._putBatch(this._bBatchTexCoords,texCoordsFloat32Array);


    var batchIndices        = this._bBatchIndices,
        batchIndicesOffset  = batchIndices.length;
        batchIndices.length+= indexUint16Array.length;

        offset = batchIndicesOffset;
        length = batchIndices.length;
        index  = 0;

    while(offset < length){batchIndices[offset] = indexUint16Array[index] + offsetIndex;offset++;index++;}

};

FGL.prototype.drawElementArrayBatch = function(batch)
{
    if(!batch){}

    this.drawElements(new Float32Array(this._bBatchVertices),
                      new Float32Array(this._bBatchNormals),
                      new Float32Array(this._bBatchColors),
                      new Float32Array(this._bBatchTexCoords),
                      new Uint16Array( this._bBatchIndices),
                      this.getDrawMode());
};

FGL.prototype._putBatch = function(batchArray,dataArray)
{
    var batchOffset   = batchArray.length;
    batchArray.length+= dataArray.length;

    var len = batchArray.length;
    var index = 0;

    while(batchOffset < len){batchArray[batchOffset++] = dataArray[index++];}
};




/*---------------------------------------------------------------------------------------------------------*/
// Convenience Methods color
/*---------------------------------------------------------------------------------------------------------*/

FGL.prototype.ambient   = function(color){this.gl.uniform3f(this._uAmbient,color[0],color[1],color[2]);};
FGL.prototype.ambient3f = function(r,g,b){this.gl.uniform3f(this._uAmbient,r,g,b);};
FGL.prototype.ambient1f = function(k)    {this.gl.uniform1f(this._uAmbient,k);};

FGL.prototype.color   = function(color)  {this._bColor = Color.set(this._bColor4f,color);};
FGL.prototype.color4f = function(r,g,b,a){this._bColor = Color.set4f(this._bColor4f,r,g,b,a);};
FGL.prototype.color3f = function(r,g,b)  {this._bColor = Color.set3f(this._bColor4f,r,g,b);};
FGL.prototype.color2f = function(k,a)    {this._bColor = Color.set2f(this._bColor4f,k,a);};
FGL.prototype.color1f = function(k)      {this._bColor = Color.set1f(this._bColor4f,k);};
FGL.prototype.colorfv = function(array)  {this._bColor = array;};

FGL.prototype.clearColor = function(color){this.clear4f(color[0],color[1],color[2],color[3]);};
FGL.prototype.clear      = function()     {this.clear4f(0,0,0,1);};
FGL.prototype.clear3f    = function(r,g,b){this.clear4f(r,g,b,1);};
FGL.prototype.clear2f    = function(k,a)  {this.clear4f(k,k,k,a);};
FGL.prototype.clear1f    = function(k)    {this.clear4f(k,k,k,1.0);};
FGL.prototype.clear4f   = function(r,g,b,a)
{
    var c  = Color.set4f(this._bColorBg4f,r,g,b,a);
    var gl = this.gl;
    gl.clearColor(c[0],c[1],c[2],c[3]);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
};


FGL.prototype.getColorBuffer = function(){return this._bColor;};
FGL.prototype.getClearBuffer = function(){return this._bColorBg4f;};

/*---------------------------------------------------------------------------------------------------------*/
// Methods draw properties
/*---------------------------------------------------------------------------------------------------------*/

FGL.prototype.drawMode = function(mode){this._drawMode = mode;};
FGL.prototype.getDrawMode = function(){return this._drawMode;};

FGL.prototype.sphereDetail = function(detail)
{
    if(detail == this._sphereDetailLast)return;
    this._sphereDetailLast = detail;
    this._genSphere();
};

FGL.prototype.circleDetail = function(detail)
{
    if(detail == this._circleDetailLast )return;
    this._circleDetailLast  = Math.max(this.ELLIPSE_DETAIL_MIN,Math.min(detail,this.ELLIPSE_DETAIL_MAX));
    this._cirlceVertexCount = this._circleDetailLast * 3;
    this._genCircle();
};

FGL.prototype.lineWidth = function(size){this.gl.lineWidth(size);};

FGL.prototype.useBillboard = function(bool){this._bUseBillboarding = bool;};
FGL.prototype.pointSize = function(value){this.gl.uniform1f(this._uPointSize,value);};


/*---------------------------------------------------------------------------------------------------------*/
// Methods draw primitives
/*---------------------------------------------------------------------------------------------------------*/

FGL.prototype.point = function(vector)
{
    if(vector.length == 0)return;

    var bColorPoint = this._bColorPoint,
        bColor      = this._bColor;

    bColorPoint[0] = bColor[0];
    bColorPoint[1] = bColor[1];
    bColorPoint[2] = bColor[2];
    bColorPoint[3] = bColor[3];

    var gl = this.gl,
        glArrayBuffer = gl.ARRAY_BUFFER,
        glFloat       = gl.FLOAT;

    var vblen = vector.byteLength,
        cblen = bColor.byteLength;

    var offsetV = 0,
        offsetC = vblen;

    gl.bufferData(glArrayBuffer,vblen + cblen,gl.STATIC_DRAW);

    gl.bufferSubData(glArrayBuffer, offsetV, vector);
    gl.bufferSubData(glArrayBuffer, offsetC, bColor);

    gl.disableVertexAttribArray(this._aVertexNormal);
    gl.disableVertexAttribArray(this._aVertexTexCoord);

    gl.vertexAttribPointer(this._aVertexPosition, this.SIZE_OF_VERTEX, glFloat, false, 0, offsetV);
    gl.vertexAttribPointer(this._aVertexColor,    this.SIZE_OF_COLOR,  glFloat, false, 0, offsetC);

    this.setMatricesUniform();
    gl.drawArrays(this._drawMode,0,1);

    gl.enableVertexAttribArray(this._aVertexNormal);
    gl.enableVertexAttribArray(this._aVertexTexCoord);

    this._drawFuncLast = this.point;
};

FGL.prototype.points = function(vertices,colors)
{
    if(vertices.length == 0)return;

    colors = colors || this.bufferColors(this._bColor4f,new Float32Array(vertices.length / 3 * 4));

    var gl            = this.gl,
        glArrayBuffer = gl.ARRAY_BUFFER,
        glFloat       = gl.FLOAT;

    var vblen = vertices.byteLength,
        cblen = colors.byteLength;

    var offsetV = 0,
        offsetC = vblen;

    gl.bufferData(glArrayBuffer,vblen + cblen,gl.STATIC_DRAW);

    gl.bufferSubData(glArrayBuffer, offsetV, vertices);
    gl.bufferSubData(glArrayBuffer, offsetC, colors);

    gl.disableVertexAttribArray(this._aVertexNormal);
    gl.disableVertexAttribArray(this._aVertexTexCoord);

    gl.vertexAttribPointer(this._aVertexPosition, this.SIZE_OF_VERTEX, glFloat, false, 0, offsetV);
    gl.vertexAttribPointer(this._aVertexColor,    this.SIZE_OF_COLOR,  glFloat, false, 0, offsetC);

    this.setMatricesUniform();
    gl.drawArrays(this._drawMode,0,vertices.length/3);

    gl.enableVertexAttribArray(this._aVertexNormal);
    gl.enableVertexAttribArray(this._aVertexTexCoord);

    this._drawFuncLast = this.points;
};

FGL.prototype.point3f = function(x,y,z){this._bVertexPoint[0] = x;this._bVertexPoint[1] = y;this._bVertexPoint[2] = z;this.point(this._bVertexPoint);};
FGL.prototype.point2f = function(x,y)  {this._bVertexPoint[0] = x;this._bVertexPoint[1] = y;this._bVertexPoint[2] = 0;this.point(this._bVertexPoint);};
FGL.prototype.pointv  = function(arr)  {this._bVertexPoint[0] = arr[0];this._bVertexPoint[1] = arr[1];this._bVertexPoint[2] = arr[2];this.point(this._bVertexPoint);};

/*---------------------------------------------------------------------------------------------------------*/

FGL.prototype.linef = function(x0,y0,z0,x1,y1,z1)
{
    var v = this._bVertexLine;
    v[0] = x0;v[1] = y0;v[2] = z0;
    v[3] = x1;v[4] = y1;v[5] = z1;

    this.drawArrays(v,null,this.bufferColors(this._bColor,this._bColorLine),null,this._drawMode);

    this._drawFuncLast = this.linef;
};

FGL.prototype.line  = function(vertices)
{
    if(vertices.length == 0)return;
    this.drawArrays(this.bufferArrays(vertices,this._bVertexLine),null,this.bufferColors(this._bColor,this._bColorLine),null,this._drawMode,0, 2);

    this._drawFuncLast = this.line;
};

FGL.prototype.linev = function(vertices)
{
    if(vertices.length == 0)return;
    var v = new Float32Array(vertices),
        l = vertices.length / this.SIZE_OF_VERTEX;
    this.drawArrays(v,null,this.bufferColors(this._bColor, new Float32Array(l*this.SIZE_OF_COLOR)),null,this._drawMode,0, l);

    this._drawFuncLast = this.linev;
};

FGL.prototype.line2fv = function(v0,v1){this.linef(v0[0],v0[1],v0[2],v1[0],v1[1],v1[2]);};

/*---------------------------------------------------------------------------------------------------------*/

FGL.prototype.quadf = function(x0,y0,z0,x1,y1,z1,x2,y2,z2,x3,y3,z3)
{
    var v = this._bVertexQuad;

    v[ 0] = x0;v[ 1] = y0;v[ 2] = z0;
    v[ 3] = x1;v[ 4] = y1;v[ 5] = z1;
    v[ 6] = x2;v[ 7] = y2;v[ 8] = z2;
    v[ 9] = x3;v[10] = y3;v[11] = z3;

    this.drawArrays(v,null,this.bufferColors(this._bColor,this._bColorQuad),null,this._drawMode,0,4);

    this._drawFuncLast = this.quadf;
};

FGL.prototype.quadv = function(v0,v1,v2,v3)
{
    this.quadf(v0[0],v0[1],v0[2],v1[0],v1[1],v1[2],v2[0],v2[1],v2[2],v3[0],v3[1],v3[2]);
};

FGL.prototype.quad = function(vertices,normals,texCoords)
{
    this.drawArrays(this.bufferArrays(vertices,this._bVertexQuad),normals,this.bufferColors(this._bColor,this._bColorQuad),texCoords,this._drawMode,0,4);

    this._drawFuncLast = this.quad;
};

/*---------------------------------------------------------------------------------------------------------*/

//TODO:cleanup
FGL.prototype.rect = function(width,height)
{
    height = height || width;

    var vertices = this._bVertexRect;

    if(this._bUseBillboarding)
    {
        //23
        //01

        var modelViewMatrix = this._mModelView;

        var vecRightX = modelViewMatrix[0],
            vecRightY = modelViewMatrix[4],
            vecRightZ = modelViewMatrix[8];

        var vecUpX = modelViewMatrix[1],
            vecUpY = modelViewMatrix[5],
            vecUpZ = modelViewMatrix[9];


        vertices[ 0] = (-vecRightX - vecUpX) * width;
        vertices[ 1] = (-vecRightY - vecUpY) * width;
        vertices[ 2] = (-vecRightZ - vecUpZ) * width;

        vertices[ 3] = (vecRightX - vecUpX) * width;
        vertices[ 4] = (vecRightY - vecUpY) * width;
        vertices[ 5] = (vecRightZ - vecUpZ) * width;

        vertices[ 6] = (vecRightX + vecUpX) * width;
        vertices[ 7] = (vecRightY + vecUpY) * width;
        vertices[ 8] = (vecRightZ + vecUpZ) * width;

        vertices[ 9] = (-vecRightX + vecUpX) * width;
        vertices[10] = (-vecRightY + vecUpY) * width;
        vertices[11] = (-vecRightZ + vecUpZ) * width;

    }
    else if(width != this._rectWidthLast || height != this._rectHeightLast)
    {
        vertices[0] = vertices[1] = vertices[2] = vertices[4] = vertices[5] = vertices[7] = vertices[9] = vertices[10] = 0;
        vertices[3] = vertices[6] = width; vertices[8] = vertices[11] = height;

        this._rectWidthLast  = width;
        this._rectHeightLast = height;
    }

    this.drawArrays(vertices,this._bNormalRect,this.bufferColors(this._bColor,this._bColorRect),this._bTexCoordQuadDefault,this._drawMode,0,4);

    this._drawFuncLast = this.rect;
};

/*---------------------------------------------------------------------------------------------------------*/

FGL.prototype.triangle = function(v0,v1,v2)
{
    var v = this._bVertexTriangle;
    v[0] = v0[0];v[1] = v0[1];v[2] = v0[2];
    v[3] = v1[0];v[4] = v1[1];v[5] = v1[2];
    v[6] = v2[0];v[7] = v2[1];v[8] = v2[2];

    this.drawArrays(v,null,this.bufferColors(this._bColor,this._bColorTriangle),null,this._drawMode,0,3);

    this._drawFuncLast = this.triangle;
};

FGL.prototype.trianglef = function(v0,v1,v2,v3,v4,v5,v6,v7,v8)
{
    var v = this._bVertexTriangle;
    v[0] = v0;v[1] = v1;v[2] = v2;
    v[3] = v3;v[4] = v4;v[5] = v5;
    v[6] = v6;v[7] = v7;v[8] = v8;

    this.drawArrays(v,null,this.bufferColors(this._bColor,this._bColorTriangle),null,this._drawMode,0,3);

    this._drawFuncLast = this.trianglef;
};

FGL.prototype.trianglev = function(vertices,normals,texCoords)
{
    this.drawArrays(this.bufferArrays(vertices,this._bVertexTriangle),normals,this.bufferColors(this._bColor,this._bColorTriangle),texCoords,this._drawMode,0,3);
    this._drawFuncLast = this.trianglev;
};

/*---------------------------------------------------------------------------------------------------------*/

FGL.prototype.circle3f = function(x,y,z,radius)
{
    radius = radius || 0.5;

    this.pushMatrix();
    this.translate3f(x,y,z);
    this.scale1f(radius);
    this.drawArrays(this._bVertexCircle,this._bNormalCircle,this.bufferColors(this._bColor,this._bColorCircle),this._bTexCoordCircle,this.getDrawMode(),0,this._circleDetailLast);
    this.popMatrix();

    this._drawFuncLast = this.linef;
};

FGL.prototype.cirlce2f = function(x,y,radius){this.circle3f(x,0,y,radius);};
FGL.prototype.circle = function(radius){this.circle3f(0,0,0,radius)};
FGL.prototype.circlev = function(v,radius){this.circle3f(v[0],v[1],v[2],radius);};
FGL.prototype.circles = function(centers,radii){};

/*---------------------------------------------------------------------------------------------------------*/
// Geometry gen
/*---------------------------------------------------------------------------------------------------------*/

FGL.prototype._genSphere = function()
{
    var segments = this._sphereDetailLast;

    var vertices  = [],
        normals   = [],
        texCoords = [],
        indices   = [];

    var theta,thetaSin,thetaCos;
    var phi,phiSin,phiCos;

    var x,y,z;
    var u,v;

    var i = -1,j;

    var index,
        indexVertices,
        indexNormals,
        indexTexCoords;

    while(++i <= segments)
    {
        theta = i * Math.PI / segments;
        thetaSin = Math.sin(theta);
        thetaCos = Math.cos(theta);

        j = -1;
        while(++j <= segments)
        {
            phi    = j * 2 * Math.PI / segments;
            phiSin = Math.sin(phi);
            phiCos = Math.cos(phi);

            x = phiCos * thetaSin;
            y = thetaCos;
            z = phiSin * thetaSin;

            index          = j + segments * i;
            indexVertices  = indexNormals = index * 3;
            indexTexCoords = index * 2;

            normals.push(x,y,z);
            vertices.push(x,y,z);

            u = 1 - j / segments;
            v = 1 - i / segments;

            texCoords.push(u,v);

        }


    }

    var index0,index1,index2;

    i = -1;
    while(++i < segments)
    {
        j = -1;
        while(++j < segments)
        {
            index0 = j + i * (segments + 1);
            index1 = index0 + segments + 1;
            index2 = index0 + 1;

            indices.push(index0,index1,index2);

            index2 = index0 + 1;
            index0 = index1;
            index1 = index0 + 1;

            indices.push(index0,index1,index2);
        }
    }

    this._bVertexSphere       = new Float32Array(vertices);
    this._bVertexSphereScaled = new Float32Array(vertices);
    this._bNormalSphere       = new Float32Array(normals);
    this._bColorSphere        = new Float32Array(segments * segments * 4);
    this._bTexCoordsSphere    = new Float32Array(indices);
    this._bIndexSphere        = new Uint16Array(indices);
};

FGL.prototype._genCircle = function()
{
    var cx = 0,
        cy = 0;

    var d = this._circleDetailLast,
        v = this._bVertexCircle,
        l = d * 3;

    var i = 0;

    var theta = 2 * Math.PI / d,
        c = Math.cos(theta),
        s = Math.sin(theta),
        t;

    var ox = 1,
        oy = 0;

    while(i < l)
    {
        v[i  ] = ox + cx;
        v[i+1] = 0;
        v[i+2] = oy + cy;

        t  = ox;
        ox = c * ox - s * oy;
        oy = s * t  + c * oy;

        i+=3;
    }
};

/*---------------------------------------------------------------------------------------------------------*/
// default vbo/ibo / shader attributes
/*---------------------------------------------------------------------------------------------------------*/

FGL.prototype.getDefaultVBO  = function(){return this._defaultVBO;};
FGL.prototype.getDefaultIBO  = function(){return this._defaultIBO;};
FGL.prototype.bindDefaultVBO = function(){this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this._defaultVBO);};
FGL.prototype.bindDefaultIBO = function(){this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER,this._defaultIBO);};

FGL.prototype.getDefaultVertexAttrib   = function(){return this._aVertexPosition;};
FGL.prototype.getDefaultNormalAttrib   = function(){return this._aVertexNormal;};
FGL.prototype.getDefaultColorAttrib    = function(){return this._aVertexColor;};
FGL.prototype.getDefaultTexCoordAttrib = function(){return this._aVertexTexCoord;};

FGL.prototype.enableDefaultVertexAttribArray     = function(){this.gl.enableVertexAttribArray(this._aVertexPosition);};
FGL.prototype.enableDefaultNormalAttribArray     = function(){this.gl.enableVertexAttribArray(this._aVertexNormal);};
FGL.prototype.enableDefaultColorAttribArray      = function(){this.gl.enableVertexAttribArray(this._aVertexColor);};
FGL.prototype.enableDefaultTexCoordsAttribArray  = function(){this.gl.enableVertexAttribArray(this._aVertexTexCoord);};

FGL.prototype.disableDefaultVertexAttribArray    = function(){this.gl.disableVertexAttribArray(this._aVertexPosition);};
FGL.prototype.disableDefaultNormalAttribArray    = function(){this.gl.disableVertexAttribArray(this._aVertexNormal);};
FGL.prototype.disableDefaultColorAttribArray     = function(){this.gl.disableVertexAttribArray(this._aVertexColor);};
FGL.prototype.disableDefaultTexCoordsAttribArray = function(){this.gl.disableVertexAttribArray(this._aVertexTexCoord);};

/*---------------------------------------------------------------------------------------------------------*/
// convenience draw
/*---------------------------------------------------------------------------------------------------------*/

//TODO:remove

FGL.prototype.box = function(width,height,depth)
{
    this.pushMatrix();
    this.scale3f(width,height,depth);
    this.drawElements(this._bVertexCube,this._bNormalCube,this.bufferColors(this._bColor,this._bColorCube),this._bTexCoordCube,this._bIndexCube,this._drawMode);
    this.popMatrix();

    this._drawFuncLast = this.box;
};

FGL.prototype.cube = function(size)
{
    size = size || 1;

    var cubeScaleLast    = this._cubeScaleLast,
        cubeVerticesLast = this._bVertexCubeScaled;

    if(this._bUseDrawElementArrayBatch)
    {
        this._pushElementArrayBatch((size == cubeScaleLast) ? cubeVerticesLast :
                                    this._scaleVertices(this._bVertexCube,size,cubeVerticesLast),
                                    this._bNormalCube,
                                    this.bufferColors(this._bColor,this._bColorCube),
                                    this._bTexCoordCube,
                                    this._bIndexCube);

    }
    else
    {
        this.drawElements((size == cubeScaleLast) ? cubeVerticesLast :
                          this._scaleVertices(this._bVertexCube,size,cubeVerticesLast),
                          this._bNormalCube,
                          this.bufferColors(this._bColor,this._bColorCube),
                          this._bTexCoordCube,
                          this._bIndexCube,
                          this._drawMode);

    }


    this._cubeScaleLast = size;
    this._drawFuncLast  = this.cube;

};

FGL.prototype.sphere = function(size)
{
    size = size || 1;

    var sphereScaleLast      = this._sphereScaleLast,
        sphereVerticesScaled = this._bVertexSphereScaled;

    if(this._bUseDrawElementArrayBatch)
    {
        this._pushElementArrayBatch((size == sphereScaleLast) ? sphereVerticesScaled :
                                    this._scaleVertices(this._bVertexSphere,size,sphereVerticesScaled),
                                    this._bNormalSphere,
                                    this.bufferColors(this._bColor,this._bColorSphere),
                                    this._bTexCoordsSphere,
                                    this._bIndexSphere);
    }
    else
    {
        this.drawElements((size == sphereScaleLast) ? sphereVerticesScaled :
                          this._scaleVertices(this._bVertexSphere,size,sphereVerticesScaled),
                          this._bNormalSphere,
                          this.bufferColors(this._bColor,this._bColorSphere),
                          this._bTexCoordsSphere,
                          this._bIndexSphere,
                          this._drawMode);

    }

    this._sphereScaleLast = size;
    this._drawFuncLast    = this.sphere;
};

//TODO: remove !!!!!!!!!!!!!!!

FGL.prototype.lineBox = function(v0,v1){this.lineBoxf(v0[0],v0[1],v0[2],v1[0],v1[1],v1[2]);};

FGL.prototype.lineBoxf = function(x0,y0,z0,x1,y1,z1)
{


    var p0 = this._bPoint0,
        p1 = this._bPoint1,
        up = this._axisY;

    Vec3.set3f(p0,x0,y0,z0);
    Vec3.set3f(p1,x1,y1,z1);

    var len = Vec3.distance(p0,p1),
        mid = Vec3.scale(Vec3.added(p0,p1),0.5),
        dir = Vec3.normalize(Vec3.subbed(p1,p0)),
        c   = Vec3.dot(dir,up);

    var angle = Math.acos(c),
        axis  = Vec3.normalize(Vec3.cross(up,dir));

    this.pushMatrix();
    this.translate(mid);
    this.rotateAxis(angle,axis);
    this.box(this._lineBoxWidth,len,this._lineBoxHeight);
    this.popMatrix();
};

/*---------------------------------------------------------------------------------------------------------*/
// convenience bindings gl
/*---------------------------------------------------------------------------------------------------------*/

FGL.prototype.enable                = function(id){this.gl.enable(id);};
FGL.prototype.disable               = function(id){this.gl.disable(id);};

FGL.prototype.blendColor            = function(r,g,b,a){this.gl.blendColor(r,g,b,a);};
FGL.prototype.blendEquation         = function(mode){this.gl.blendEquation(mode);};
FGL.prototype.blendEquationSeparate = function(sfactor,dfactor){this.gl.blendEquationSeparate(sfactor,dfactor);};
FGL.prototype.blendFunc             = function(sfactor,dfactor){this.gl.blendFunc(sfactor,dfactor);};
FGL.prototype.blendFuncSeparate     = function(srcRGB,dstRGB,srcAlpha,dstAlpha){this.gl.blendFuncSeparate(srcRGB,dstRGB,srcAlpha,dstAlpha);};
FGL.prototype.depthFunc             = function(func){this.gl.depthFunc(func);};
FGL.prototype.sampleCoverage        = function(value,invert){this.gl.sampleCoverage(value,invert);};
FGL.prototype.stencilFunc           = function(func,ref,mask){this.gl.stencilFunc(func,ref,mask);};
FGL.prototype.stencilFuncSeparate   = function(face,func,ref,mask){this.gl.stencilFuncSeparate(face,func,ref,mask);};
FGL.prototype.stencilOp             = function(fail,zfail,zpass){this.gl.stencilOp(fail,zfail,zpass);};
FGL.prototype.stencilOpSeparate     = function(face,fail,zfail,zpass){this.gl.stencilOpSeparate(face,fail,zfail,zpass);};

/*---------------------------------------------------------------------------------------------------------*/
// World -> Screen
/*---------------------------------------------------------------------------------------------------------*/

//TODO: Fix me
FGL.prototype.getScreenCoord3f = function(x,y,z)
{
    var mpm = Mat44.mult(this._camera.projectionMatrix,this._mModelView);
    var p3d = Mat44.multVec3(mpm,Vec3.make(x,y,z));

    var bsc = this._bScreenCoords;
    bsc[0] = (((p3d[0] + 1) * 0.5) * window.innerWidth);
    bsc[1] = (((1 - p3d[1]) * 0.5) * window.innerHeight);

    return bsc;
};

FGL.prototype.getScreenCoord = function(v)
{
    return this.getScreenCoord3f(v[0],v[1],v[1]);
};




FGL.prototype.getModelViewMatrix  = function(){return this._mModelView;};
FGL.prototype.getProjectionMatrix = function(){return this._camera.projectionMatrix;};







module.exports = FGL;
},{"../math/fMat33":30,"../math/fMat44":31,"../math/fVec2":34,"../math/fVec3":35,"../math/fVec4":36,"../system/fError":38,"../system/fPlatform":39,"../util/fColor":40,"./gl/fTexture":24,"./gl/shader/fProgFragShader":25,"./gl/shader/fProgLoader":26,"./gl/shader/fProgVertexShader":27,"./gl/shader/fShaderLoader":28}],18:[function(require,module,exports){
var Vec3  = require('../../math/fVec3'),
    Light = require('./fLight');

function DirectionalLight(id)
{
    Light.apply(this,arguments);
}

DirectionalLight.prototype = Object.create(Light.prototype);

DirectionalLight.prototype.setDirection   = function(v)    {Vec3.set(this.direction,v);};
DirectionalLight.prototype.setDirection3f = function(x,y,z){Vec3.set3f(this.direction,x,y,z);};

DirectionalLight.prototype.lookAt         = function(position,target)
{
    this.setPosition(position);
    this.setDirection(Vec3.normalize(Vec3.subbed(target,position)));
};

module.exports = DirectionalLight;
},{"../../math/fVec3":35,"./fLight":19}],19:[function(require,module,exports){
var Vec3 = require('../../math/fVec3'),
    Vec4 = require('../../math/fVec4');

function Light(id)
{
    this._id   = id;

    this.ambient  = new Float32Array([1,1,1]);
    this.diffuse  = new Float32Array([1,1,1]);
    this.specular = new Float32Array([1,1,1]);

    this.position             = Vec4.ZERO();
    this.direction            = null;
    this.spotExponent         = null;
    this.spotCutOff           = null;

    this.constantAttentuation = 1.0;
    this.linearAttentuation   = 0;
    this.quadricAttentuation  = 0.01;
}


Light.prototype.setAmbient     = function(color)  {this.ambient[0] = color[0];this.ambient[1] = color[1];this.ambient[2] = color[2];};
Light.prototype.setAmbient3f   = function(r,g,b)  {this.ambient[0] = r;this.ambient[1] = g;this.ambient[2] = b;};

Light.prototype.setDiffuse     = function(color)  {this.diffuse[0] = color[0];this.diffuse[1] = color[1];this.diffuse[2] = color[2];};
Light.prototype.setDiffuse3f   = function(r,g,b)  {this.diffuse[0] = r;this.diffuse[1] = g;this.diffuse[2] = b;};

Light.prototype.setSpecular    = function(color)  {this.specular[0] = color[0];this.specular[1] = color[1];this.specular[2] = color[2];};
Light.prototype.setSpecular3f  = function(r,g,b)  {this.specular[0] = r;this.specular[1] = g;this.specular[2] = b;};

Light.prototype.setPosition    = function(v)    {Vec4.set3f(this.position,v[0],v[1],v[2]);};
Light.prototype.setPosition3f  = function(x,y,z){Vec3.set3f(this.position,x,y,z);};

Light.prototype.getId = function(){return this._id;};

module.exports = Light;
},{"../../math/fVec3":35,"../../math/fVec4":36}],20:[function(require,module,exports){
var Mat44 = require('../../math/fMat44');

module.exports =
{
    perspective : function(m,fov,aspect,near,far)
    {
        var f  = 1.0 / Math.tan(fov*0.5),
            nf = 1.0 / (near-far);

        m[0] = f / aspect;
        m[1] = 0;
        m[2] = 0;
        m[3] = 0;
        m[4] = 0;
        m[5] = f;
        m[6] = 0;
        m[7] = 0;
        m[8] = 0;
        m[9] = 0;
        m[10] = (far + near) * nf;
        m[11] = -1;
        m[12] = 0;
        m[13] = 0;
        m[14] = (2 * far * near) * nf;
        m[15] = 0;

        return m;

    },

    frustum : function(m,left,right,bottom,top,near,far)
    {
        var rl = 1 / (right - left),
            tb = 1 / (top - bottom),
            nf = 1 / (near - far);


        m[ 0] = (near * 2) * rl;
        m[ 1] = 0;
        m[ 2] = 0;
        m[ 3] = 0;
        m[ 4] = 0;
        m[ 5] = (near * 2) * tb;
        m[ 6] = 0;
        m[ 7] = 0;
        m[ 8] = (right + left) * rl;
        m[ 9] = (top + bottom) * tb;
        m[10] = (far + near) * nf;
        m[11] = -1;
        m[12] = 0;
        m[13] = 0;
        m[14] = (far * near * 2) * nf;
        m[15] = 0;

        return m;
    },

    lookAt : function(m,eye,target,up)
    {
        var x0, x1, x2, y0, y1, y2, z0, z1, z2, len,
            eyex = eye[0],
            eyey = eye[1],
            eyez = eye[2],
            upx = up[0],
            upy = up[1],
            upz = up[2],
            targetx = target[0],
            tartety = target[1],
            targetz = target[2];

        if (Math.abs(eyex - targetx) < 0.000001 &&
            Math.abs(eyey - tartety) < 0.000001 &&
            Math.abs(eyez - targetz) < 0.000001) {
            return Mat44.identity(m);
        }

        z0 = eyex - targetx;
        z1 = eyey - tartety;
        z2 = eyez - targetz;

        len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
        z0 *= len;
        z1 *= len;
        z2 *= len;

        x0 = upy * z2 - upz * z1;
        x1 = upz * z0 - upx * z2;
        x2 = upx * z1 - upy * z0;
        len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
        if (!len) {
            x0 = 0;
            x1 = 0;
            x2 = 0;
        } else {
            len = 1 / len;
            x0 *= len;
            x1 *= len;
            x2 *= len;
        }

        y0 = z1 * x2 - z2 * x1;
        y1 = z2 * x0 - z0 * x2;
        y2 = z0 * x1 - z1 * x0;

        len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
        if (!len) {
            y0 = 0;
            y1 = 0;
            y2 = 0;
        } else {
            len = 1 / len;
            y0 *= len;
            y1 *= len;
            y2 *= len;
        }

        m[ 0] = x0;
        m[ 1] = y0;
        m[ 2] = z0;
        m[ 3] = 0;
        m[ 4] = x1;
        m[ 5] = y1;
        m[ 6] = z1;
        m[ 7] = 0;
        m[ 8] = x2;
        m[ 9] = y2;
        m[10] = z2;
        m[11] = 0;
        m[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
        m[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
        m[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
        m[15] = 1;

        return m;
    }
};
},{"../../math/fMat44":31}],21:[function(require,module,exports){
var Color = require('../../util/fColor');

function Material(ambient,diffuse,specular,shininess,emission)
{
    ambient   = ambient   || Color.make(1.0,0.5,0.5,1.0);
    diffuse   = diffuse   || Color.BLACK();
    specular  = specular  || Color.BLACK();
    shininess = shininess || 10.0;
    emission  = emission  || Color.BLACK;

    this.emission  = emission;
    this.ambient   = ambient;
    this.diffuse   = diffuse;
    this.specular  = specular;
    this.shininess = shininess;
}

Material.prototype.setEmission   = function(color)  {this.emission = color;};
Material.prototype.setEmission3f = function(r,g,b)  {this.emission[0] = r;this.emission[1] = g;this.emission[2] = b;};
Material.prototype.setEmission4f = function(r,g,b,a){this.emission[0] = r;this.emission[1] = g;this.emission[2] = b;this.emission[3] = a;};

Material.prototype.setAmbient   = function(color)  {this.ambient = color;};
Material.prototype.setAmbient3f = function(r,g,b)  {this.ambient[0] = r;this.ambient[1] = g;this.ambient[2] = b;};
Material.prototype.setAmbient4f = function(r,g,b,a){this.ambient[0] = r;this.ambient[1] = g;this.ambient[2] = b;this.ambient[3] = a;};

Material.prototype.setDiffuse   = function(color)  {this.diffuse = color;};
Material.prototype.setDiffuse3f = function(r,g,b)  {this.diffuse[0] = r;this.diffuse[1] = g;this.diffuse[2] = b;};
Material.prototype.setDiffuse4f = function(r,g,b,a){this.diffuse[0] = r;this.diffuse[1] = g;this.diffuse[2] = b;this.diffuse[3] = a;};

Material.prototype.setSpecular   = function(color)  {this.specular = color;};
Material.prototype.setSpecular3f = function(r,g,b)  {this.specular[0] = r;this.specular[1] = g;this.specular[2] = b;};
Material.prototype.setSpecular4f = function(r,g,b,a){this.specular[0] = r;this.specular[1] = g;this.specular[2] = b;this.specular[3] = a;};


Material.prototype.getEmission  = function(){return Color.copy(this.emission);};
Material.prototype.getAmbient   = function(){return Color.copy(this.ambient);};
Material.prototype.getDiffuse   = function(){return Color.copy(this.diffuse);};
Material.prototype.getSpecular  = function(){return Color.copy(this.specular);};
Material.prototype.getShininess = function(){return this.shininess;};

module.exports = Material;

},{"../../util/fColor":40}],22:[function(require,module,exports){
var Light = require('./fLight');

function PointLight(id)
{
    Light.apply(this,arguments);
}

PointLight.prototype = Object.create(Light.prototype);

module.exports = PointLight;
},{"./fLight":19}],23:[function(require,module,exports){
var DirectionalLight = require('./fDirectionalLight');

function SpotLight(id)
{
    DirectionalLight.apply(this,arguments);
}

SpotLight.prototype = Object.create(DirectionalLight.prototype);

SpotLight.prototype.setExponent = function(){};
SpotLight.prototype.setCutOff   = function(){};

module.exports = SpotLight;
},{"./fDirectionalLight":18}],24:[function(require,module,exports){

function Texture()
{
    this._tex = null;
    this._width = null;
    this._height = null;

    if(arguments.length == 1)this.setTexSource(arguments[0]);
}

Texture.prototype.setTexSource = function(glTex)
{
    var tex = this._tex = glTex;
    this._width  = tex.image.width;
    this._height = tex.image.height;
};

Texture.prototype.getWidth  = function(){return this._width;};
Texture.prototype.getHeight = function(){return this._height;};

module.exports = Texture;
},{}],25:[function(require,module,exports){
module.exports ="varying vec4 vVertexPosition;varying vec3 vVertexNormal;varying vec4 vVertexColor;varying vec2 vVertexTexCoord;uniform float uUseLighting;uniform float uUseMaterial;uniform float uUseTexture;uniform mat3 uNormalMatrix;uniform vec3 uAmbient;uniform sampler2D uTexImage;const int MAX_LIGHTS = 8;struct Light{ vec4 position; vec3 ambient; vec3 diffuse; vec3 specular; vec4 halfVector; vec3 spotDirection; float spotExponent; float spotCutoff; float spotCosCutoff; float constantAttenuation; float linearAttenuation; float quadraticAttenuation;};struct Material{ vec4 emission; vec4 ambient; vec4 diffuse; vec4 specular; float shininess;};struct ColorComponent{ vec4 ambient; vec4 diffuse; vec4 specular; float shininess;};vec4 phongModel(vec4 position, vec3 normal, ColorComponent color, Light light){ vec3 diff = light.position.xyz - position.xyz; vec3 s = normalize(diff); vec3 v = normalize(-position.xyz); vec3 r = reflect(-s, normal); float sDotN = max(dot(s, normal), 0.0); float dist = length(diff.xyz); float att = 1.0 / (light.constantAttenuation + light.linearAttenuation * dist + light.quadraticAttenuation * dist * dist); vec3 ambient = uAmbient * light.ambient * color.ambient.rgb; vec3 diffuse = light.diffuse * color.diffuse.rgb * sDotN ; vec3 specular = ((sDotN > 0.0) ? light.specular * pow(max(dot(r, v), 0.0), color.shininess) : vec3(0.0)); return vec4(ambient*att+ diffuse*att + specular*att,color.ambient.a);}uniform Light uLights[8];uniform Material uMaterial;void main(void){ float useLightingInv = 1.0 - uUseLighting; float useMaterialInv = 1.0 - uUseMaterial; float useTextureInv = 1.0 - uUseTexture; vec3 tVertexNormal = (gl_FrontFacing ? -1.0 : 1.0) * normalize(uNormalMatrix * vVertexNormal); vec4 vertexColor = vVertexColor * useMaterialInv; vec4 textureColor = texture2D(uTexImage,vVertexTexCoord); vec4 resultColor = vertexColor * useTextureInv + textureColor * uUseTexture; ColorComponent color = ColorComponent(uMaterial.ambient * uUseMaterial + resultColor, uMaterial.diffuse * uUseMaterial + resultColor, uMaterial.specular * uUseMaterial + resultColor, uMaterial.shininess * uUseMaterial + useMaterialInv); vec4 lightingColor = vec4(0,0,0,0); for(int i = 0;i < MAX_LIGHTS;i++) { lightingColor+=phongModel(vVertexPosition,tVertexNormal,color,uLights[i]); } gl_FragColor = uUseLighting * lightingColor + useLightingInv * (vVertexColor * useTextureInv + textureColor * uUseTexture);}";
},{}],26:[function(require,module,exports){
module.exports =
{
    loadProgram : function(gl,vertexShader,fragmentShader)
    {
        var program = gl.createProgram();

        gl.attachShader(program,vertexShader);
        gl.attachShader(program,fragmentShader);
        gl.linkProgram(program);

        if(!gl.getProgramParameter(program,gl.LINK_STATUS))
        {
            gl.deleteProgram(program);
            program = null;
        }

        return program;
    }
};
},{}],27:[function(require,module,exports){
module.exports ="attribute vec3 aVertexPosition;attribute vec3 aVertexNormal;attribute vec4 aVertexColor;attribute vec2 aVertexTexCoord;varying vec4 vVertexPosition;varying vec3 vVertexNormal;varying vec4 vVertexColor;varying vec2 vVertexTexCoord;uniform mat4 uModelViewMatrix;uniform mat4 uProjectionMatrix;uniform float uPointSize;void main(void){ vVertexPosition = uModelViewMatrix * vec4(aVertexPosition, 1.0); vVertexNormal = aVertexNormal; vVertexColor = aVertexColor; vVertexTexCoord = aVertexTexCoord; gl_Position = uProjectionMatrix * vVertexPosition; gl_PointSize = uPointSize;}";
},{}],28:[function(require,module,exports){
module.exports =
{
    PrefixShaderWeb : 'precision mediump float;',

    loadShaderFromString : function(gl,sourceString,type)
    {
        var shader = gl.createShader(type);

        gl.shaderSource(shader,sourceString);
        gl.compileShader(shader);

        if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))
        {
            throw gl.getShaderInfoLog(shader);
        }

        return shader;
    }


};
},{}],29:[function(require,module,exports){
var Vec3  = require('../../math/fVec3'),
    Color = require('../../util/fColor');

var fGLUtil = {};

fGLUtil.__gridSizeLast = -1;
fGLUtil.__gridUnitLast = -1;



fGLUtil.drawGrid = function(kgl,size,unit)
{
    unit = unit || 1;

    var i  = -1,
        sh = size * 0.5 * unit;

    var ui;

    while(++i < size + 1)
    {
        ui = unit * i;

        kgl.linef(-sh,0,-sh + ui,sh,0,-sh+ui);
        kgl.linef(-sh+ui,0,-sh,-sh+ui,0,sh);
    }
};

fGLUtil.drawAxes = function(kgl,unit)
{
    kgl.color3f(1,0,0);
    kgl.linef(0,0,0,unit,0,0);
    kgl.color3f(0,1,0);
    kgl.linef(0,0,0,0,unit,0);
    kgl.color3f(0,0,1);
    kgl.linef(0,0,0,0,0,unit);
};

fGLUtil.drawGridCube = function(kgl,size,unit)
{
    unit = unit || 1;

    var sh  = size * 0.5 * unit,
        pih = Math.PI * 0.5;

    kgl.pushMatrix();
    kgl.translate3f(0,-sh,0);
    this.drawGrid(kgl,size,unit);
    kgl.popMatrix();

    kgl.pushMatrix();
    kgl.translate3f(0,sh,0);
    kgl.rotate3f(0,pih,0);
    this.drawGrid(kgl,size,unit);
    kgl.popMatrix();

    kgl.pushMatrix();
    kgl.translate3f(0,0,-sh);
    kgl.rotate3f(pih,0,0);
    this.drawGrid(kgl,size,unit);
    kgl.popMatrix();

    kgl.pushMatrix();
    kgl.translate3f(0,0,sh);
    kgl.rotate3f(pih,0,0);
    this.drawGrid(kgl,size,unit);
    kgl.popMatrix();

    kgl.pushMatrix();
    kgl.translate3f(sh,0,0);
    kgl.rotate3f(pih,0,pih);
    this.drawGrid(kgl,size,unit);
    kgl.popMatrix();

    kgl.pushMatrix();
    kgl.translate3f(-sh,0,0);
    kgl.rotate3f(pih,0,pih);
    this.drawGrid(kgl,size,unit);
    kgl.popMatrix();

};


fGLUtil.pyramid = function(kgl,size)
{
    kgl.pushMatrix();
    kgl.scale3f(size,size,size);
    kgl.drawElements(this.__bVertexPyramid,this.__bNormalPyramid,kgl.bufferColors(kgl._bColor,this.__bColorPyramid),null,this.__bIndexPyramid,kgl._drawMode);
    kgl.popMatrix();
};



fGLUtil.octahedron = function(kgl,size)
{
    kgl.pushMatrix();
    kgl.scale3f(size,size,size);
    kgl.drawElements(this.__bVertexOctahedron, this.__bNormalOctahedron,kgl.bufferColors(kgl._bColor, this.__bColorOctahedron),null, this.__bIndexOctahedron,kgl._drawMode);
    kgl.popMatrix();
};

/*
var fGLUtil =
{

    drawGrid : function(gl,size,unit)
    {
        unit = unit || 1;

        var i  = -1,
            sh = size * 0.5 * unit;

        var ui;

        while(++i < size + 1)
        {
            ui = unit * i;

            gl.linef(-sh,0,-sh + ui,sh,0,-sh+ui);
            gl.linef(-sh+ui,0,-sh,-sh+ui,0,sh);
        }

    },

    drawGridCube : function(gl,size,unit)
    {
        unit = unit || 1;

        var sh  = size * 0.5 * unit,
            pih = Math.PI * 0.5;

        gl.pushMatrix();
        gl.translate3f(0,-sh,0);
        this.drawGrid(gl,size,unit);
        gl.popMatrix();

        gl.pushMatrix();
        gl.translate3f(0,sh,0);
        gl.rotate3f(0,pih,0);
        this.drawGrid(gl,size,unit);
        gl.popMatrix();

        gl.pushMatrix();
        gl.translate3f(0,0,-sh);
        gl.rotate3f(pih,0,0);
        this.drawGrid(gl,size,unit);
        gl.popMatrix();

        gl.pushMatrix();
        gl.translate3f(0,0,sh);
        gl.rotate3f(pih,0,0);
        this.drawGrid(gl,size,unit);
        gl.popMatrix();

        gl.pushMatrix();
        gl.translate3f(sh,0,0);
        gl.rotate3f(pih,0,pih);
        this.drawGrid(gl,size,unit);
        gl.popMatrix();

        gl.pushMatrix();
        gl.translate3f(-sh,0,0);
        gl.rotate3f(pih,0,pih);
        this.drawGrid(gl,size,unit);
        gl.popMatrix();

    },


    drawAxes : function(gl,unit)
    {
        gl.color3f(1,0,0);
        gl.linef(0,0,0,unit,0,0);
        gl.color3f(0,1,0);
        gl.linef(0,0,0,0,unit,0);
        gl.color3f(0,0,1);
        gl.linef(0,0,0,0,0,unit);
    },


    //temp
    drawVectorf : function(gl,x0,y0,z0,x1,y1,z1)
    {
       

        var p0 = gl._bPoint0,
            p1 = gl._bPoint1,
            up = gl._axisY;

        Vec3.set3f(p0,x0,y0,z0);
        Vec3.set3f(p1,x1,y1,z1);

        var pw = gl._lineBoxWidth,
            ph = gl._lineBoxHeight,
            pd = gl._drawMode;

        var len = Vec3.distance(p0,p1),
            mid = Vec3.scale(Vec3.added(p0,p1),0.5),
            dir = Vec3.normalize(Vec3.subbed(p1,p0)),
            c   = Vec3.dot(dir,up);

        var angle = Math.acos(c),
            axis  = Vec3.normalize(Vec3.cross(up,dir));


        gl.drawMode(gl.LINES);

        gl.linef(x0,y0,z0,x1,y1,z1);

        gl.drawMode(gl.TRIANGLES);
        gl.pushMatrix();
        gl.translate(p1);
        gl.rotateAxis(angle,axis);
        this.pyramid(gl,0.025);
        gl.popMatrix();

        gl.lineSize(pw,ph);
        gl.drawMode(pd);
    },

    drawVector : function(gl,v0,v1)
    {
       this.drawVectorf(gl,v0[0],v0[1],v0[2],v1[0],v1[1],v1[2]);
    },

    pyramid : function(gl,size)
    {
        gl.pushMatrix();
        gl.scale3f(size,size,size);
        gl.drawElements(this.__bVertexPyramid,this.__bNormalPyramid,gl.fillColorBuffer(gl._bColor,this.__bColorPyramid),null,this.__bIndexPyramid,gl._drawMode);
        gl.popMatrix();
    },



    octahedron : function(gl,size)
    {
        gl.pushMatrix();
        gl.scale3f(size,size,size);
        gl.drawElements(this.__bVertexOctahedron, this.__bNormalOctahedron,gl.fillColorBuffer(gl._bColor, this.__bColorOctahedron),null, this.__bIndexOctahedron,gl._drawMode);
        gl.popMatrix();
    }
};
*/

fGLUtil.__bVertexOctahedron = new Float32Array([-0.707,0,0, 0,0.707,0, 0,0,-0.707, 0,0,0.707, 0,-0.707,0, 0.707,0,0]);
fGLUtil.__bNormalOctahedron = new Float32Array([1, -1.419496076238147e-9, 1.419496076238147e-9, -1.419496076238147e-9, -1, 1.419496076238147e-9, -1.419496076238147e-9, -1.419496076238147e-9, 1, 1.419496076238147e-9, 1.419496076238147e-9, -1, -1.419496076238147e-9, 1, 1.419496076238147e-9, -1, -1.419496076238147e-9, 1.419496076238147e-9]);
fGLUtil.__bColorOctahedron  = new Float32Array(fGLUtil.__bVertexOctahedron.length / Vec3.SIZE * Color.SIZE);
fGLUtil.__bIndexOctahedron  = new Uint16Array([3,4,5,3,5,1,3,1,0,3,0,4,4,0,2,4,2,5,2,0,1,5,2,1]);
fGLUtil.__bVertexPyramid    = new Float32Array([ 0.0,1.0,0.0,-1.0,-1.0,1.0,1.0,-1.0,1.0,0.0,1.0,0.0,1.0,-1.0,1.0,1.0,-1.0,-1.0,0.0,1.0,0.0,1.0,-1.0,-1.0,-1.0,-1.0,-1.0,0.0,1.0,0.0,-1.0,-1.0,-1.0,-1.0,-1.0,1.0,-1.0,-1.0,1.0,1.0,-1.0,1.0,1.0,-1.0,-1.0,-1.0,-1.0,-1.0]);
fGLUtil.__bNormalPyramid    = new Float32Array([0, -0.4472135901451111, -0.8944271802902222, 0, -0.4472135901451111, -0.8944271802902222, 0, -0.4472135901451111, -0.8944271802902222, -0.8944271802902222, -0.4472135901451111, 0, -0.8944271802902222, -0.4472135901451111, 0, -0.8944271802902222, -0.4472135901451111, 0, 0, -0.4472135901451111, 0.8944271802902222, 0, -0.4472135901451111, 0.8944271802902222, 0, -0.4472135901451111, 0.8944271802902222, 0.8944271802902222, -0.4472135901451111, 0, 0.8944271802902222, -0.4472135901451111, 0, 0.8944271802902222, -0.4472135901451111, 0, 0, 0, 0, 0, -1, 0, 0, 0, 0, 0, 1, 0]);
fGLUtil.__bColorPyramid     = new Float32Array(fGLUtil.__bVertexPyramid.length / Vec3.SIZE * Color.SIZE);
fGLUtil.__bIndexPyramid     = new Uint16Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,12,13,14,12,15,14]);

module.exports = fGLUtil;
},{"../../math/fVec3":35,"../../util/fColor":40}],30:[function(require,module,exports){

//for node debug
var Mat33 =
{
    make : function()
    {
        return new Float32Array([1,0,0,
                                 0,1,0,
                                 0,0,1]);
    },

    transpose : function(out,a)
    {

        if (out === a) {
            var a01 = a[1], a02 = a[2], a12 = a[5];
            out[1] = a[3];
            out[2] = a[6];
            out[3] = a01;
            out[5] = a[7];
            out[6] = a02;
            out[7] = a12;
        } else {
            out[0] = a[0];
            out[1] = a[3];
            out[2] = a[6];
            out[3] = a[1];
            out[4] = a[4];
            out[5] = a[7];
            out[6] = a[2];
            out[7] = a[5];
            out[8] = a[8];
        }

        return out;
    }

};

module.exports = Mat33;
},{}],31:[function(require,module,exports){
var kMath = require('./fMath'),
    Mat33 = require('./fMat33');

//for node debug
var Mat44 =
{
    make : function()
    {
        return new Float32Array([ 1, 0, 0, 0,
                                  0, 1, 0, 0,
                                  0, 0, 1, 0,
                                  0, 0, 0, 1 ]);
    },

    identity : function(m)
    {
        m[ 0] = 1; m[ 1] = m[ 2] = m[ 3] = 0;
        m[ 5] = 1; m[ 4] = m[ 6] = m[ 7] = 0;
        m[10] = 1; m[ 8] = m[ 9] = m[11] = 0;
        m[15] = 1; m[12] = m[13] = m[14] = 0;

        return m;
    },

    copy : function(m)
    {
        return new Float32Array(m);
    },

    makeScale : function(sx,sy,sz,m)
    {
        m = m || this.make();

        m[0]  = sx;
        m[5]  = sy;
        m[10] = sz;

        return m;
    },

    makeTranslate : function(tx,ty,tz,m)
    {
        m = m || this.make();

        m[12] = tx;
        m[13] = ty;
        m[14] = tz;

        return m;
    },

    makeRotationX : function(a,m)
    {
        m = m || this.make();

        var sin = Math.sin(a),
            cos = Math.cos(a);

        m[5]  = cos;
        m[6]  = -sin;
        m[9]  = sin;
        m[10] = cos;

        return m;
    },

    makeRotationY : function(a,m)
    {
        m = m || this.make();

        var sin = Math.sin(a),
            cos = Math.cos(a);

        m[0] = cos;
        m[2] = sin;
        m[8] = -sin;
        m[10]= cos;

        return m;
    },

    makeRotationZ : function(a,m)
    {
        m = m || this.make();

        var sin = Math.sin(a),
            cos = Math.cos(a);

        m[0] = cos;
        m[1] = sin;
        m[4] = -sin;
        m[5] = cos;

        return m;
    },

    makeRotationXYZ : function(ax,ay,az,m)
    {
        m = m || this.make();

        var cosx = Math.cos(ax),
            sinx = Math.sin(ax),
            cosy = Math.cos(ay),
            siny = Math.sin(ay),
            cosz = Math.cos(az),
            sinz = Math.sin(az);

        m[ 0] =  cosy*cosz;
        m[ 1] = -cosx*sinz+sinx*siny*cosz;
        m[ 2] =  sinx*sinz+cosx*siny*cosz;

        m[ 4] =  cosy*sinz;
        m[ 5] =  cosx*cosz+sinx*siny*sinz;
        m[ 6] = -sinx*cosz+cosx*siny*sinz;

        m[ 8] = -siny;
        m[ 9] =  sinx*cosy;
        m[10] =  cosx*cosy;


        return m;
    },

    //temp from glMatrix
    makeRotationOnAxis : function(rot,x,y,z,out)
    {
        var len = Math.sqrt(x * x + y * y + z * z);

        if(Math.sqrt(x * x + y * y + z * z) < kMath.EPSILON) { return null; }

        var s, c, t,
            a00, a01, a02, a03,
            a10, a11, a12, a13,
            a20, a21, a22, a23,
            b00, b01, b02,
            b10, b11, b12,
            b20, b21, b22;


        len = 1 / len;
        x *= len;
        y *= len;
        z *= len;

        s = Math.sin(rot);
        c = Math.cos(rot);
        t = 1 - c;

        out = out || Mat44.make();

        a00 = 1; a01 = 0; a02 = 0; a03 = 0;
        a10 = 0; a11 = 1; a12 = 0; a13 = 0;
        a20 = 0; a21 = 0; a22 = 1; a23 = 0;

        b00 = x * x * t + c; b01 = y * x * t + z * s; b02 = z * x * t - y * s;
        b10 = x * y * t - z * s; b11 = y * y * t + c; b12 = z * y * t + x * s;
        b20 = x * z * t + y * s; b21 = y * z * t - x * s; b22 = z * z * t + c;

        out[0 ] = a00 * b00 + a10 * b01 + a20 * b02;
        out[1 ] = a01 * b00 + a11 * b01 + a21 * b02;
        out[2 ] = a02 * b00 + a12 * b01 + a22 * b02;
        out[3 ] = a03 * b00 + a13 * b01 + a23 * b02;
        out[4 ] = a00 * b10 + a10 * b11 + a20 * b12;
        out[5 ] = a01 * b10 + a11 * b11 + a21 * b12;
        out[6 ] = a02 * b10 + a12 * b11 + a22 * b12;
        out[7 ] = a03 * b10 + a13 * b11 + a23 * b12;
        out[8 ] = a00 * b20 + a10 * b21 + a20 * b22;
        out[9 ] = a01 * b20 + a11 * b21 + a21 * b22;
        out[10] = a02 * b20 + a12 * b21 + a22 * b22;
        out[11] = a03 * b20 + a13 * b21 + a23 * b22;

        return out;
},

    multPre : function(m0,m1,m)
    {
        m = m || this.make();

        var m000 = m0[ 0],m001 = m0[ 1],m002 = m0[ 2],m003 = m0[ 3],
            m004 = m0[ 4],m005 = m0[ 5],m006 = m0[ 6],m007 = m0[ 7],
            m008 = m0[ 8],m009 = m0[ 9],m010 = m0[10],m011 = m0[11],
            m012 = m0[12],m013 = m0[13],m014 = m0[14],m015 = m0[15];

        var m100 = m1[ 0],m101 = m1[ 1],m102 = m1[ 2],m103 = m1[ 3],
            m104 = m1[ 4],m105 = m1[ 5],m106 = m1[ 6],m107 = m1[ 7],
            m108 = m1[ 8],m109 = m1[ 9],m110 = m1[10],m111 = m1[11],
            m112 = m1[12],m113 = m1[13],m114 = m1[14],m115 = m1[15];

        m[ 0] = m000*m100 + m001*m104 + m002*m108 + m003*m112;
        m[ 1] = m000*m101 + m001*m105 + m002*m109 + m003*m113;
        m[ 2] = m000*m102 + m001*m106 + m002*m110 + m003*m114;
        m[ 3] = m000*m103 + m001*m107 + m002*m111 + m003*m115;

        m[ 4] = m004*m100 + m005*m104 + m006*m108 + m007*m112;
        m[ 5] = m004*m101 + m005*m105 + m006*m109 + m007*m113;
        m[ 6] = m004*m102 + m005*m106 + m006*m110 + m007*m114;
        m[ 7] = m004*m103 + m005*m107 + m006*m111 + m007*m115;

        m[ 8] = m008*m100 + m009*m104 + m010*m108 + m011*m112;
        m[ 9] = m008*m101 + m009*m105 + m010*m109 + m011*m113;
        m[10] = m008*m102 + m009*m106 + m010*m110 + m011*m114;
        m[11] = m008*m103 + m009*m107 + m010*m111 + m011*m115;

        m[12] = m012*m100 + m013*m104 + m014*m108 + m015*m112;
        m[13] = m012*m101 + m013*m105 + m014*m109 + m015*m113;
        m[14] = m012*m102 + m013*m106 + m014*m110 + m015*m114;
        m[15] = m012*m103 + m013*m107 + m014*m111 + m015*m115;




        return m;
    },

    mult : function(m0,m1,m)
    {
        return this.multPre(m0,m1);
    },

    multPost : function(m0,m1,m)
    {
        return this.multPre(m1,m0,m);
    },

    inverted : function(m)
    {
        var inv = this.make();
        inv[0] =   m[5] * m[10] * m[15] - m[5] * m[11] * m[14] - m[9] * m[6] * m[15]
            + m[9] * m[7] * m[14] + m[13] * m[6] * m[11] - m[13] * m[7] * m[10];
        inv[4] =  -m[4] * m[10] * m[15] + m[4] * m[11] * m[14] + m[8] * m[6] * m[15] +
            m[8] * m[7] * m[14] - m[12] * m[6] * m[11] + m[12] * m[7] * m[10];
        inv[8] =   m[4] * m[9] * m[15] - m[4] * m[11] * m[13] - m[8] * m[5] * m[15]
            + m[8] * m[7] * m[13] + m[12] * m[5] * m[11] - m[12] * m[7] * m[9];
        inv[12] = -m[4] * m[9] * m[14] + m[4] * m[10] * m[13] + m[8] * m[5] * m[14] +
            m[8] * m[6] * m[13] - m[12] * m[5] * m[10] + m[12] * m[6] * m[9];
        inv[1] =  -m[1] * m[10] * m[15] + m[1] * m[11] * m[14] + m[9] * m[2] * m[15] +
            m[9] * m[3] * m[14] - m[13] * m[2] * m[11] + m[13] * m[3] * m[10];
        inv[5] =  m[0] * m[10] * m[15] - m[0] * m[11] * m[14] - m[8] * m[2] * m[15]
            + m[8] * m[3] * m[14] + m[12] * m[2] * m[11] - m[12] * m[3] * m[10];
        inv[9] = -m[0] * m[9] * m[15] + m[0] * m[11] * m[13] + m[8] * m[1] * m[15]
            - m[8] * m[3] * m[13] - m[12] * m[1] * m[11] + m[12] * m[3] * m[9];
        inv[13] = m[0] * m[9] * m[14] - m[0] * m[10] * m[13] - m[8] * m[1] * m[14]
            + m[8] * m[2] * m[13] + m[12] * m[1] * m[10] - m[12] * m[2] * m[9];
        inv[2] = m[1] * m[6] * m[15] - m[1] * m[7] * m[14] - m[5] * m[2] * m[15]
            + m[5] * m[3] * m[14] + m[13] * m[2] * m[7] - m[13] * m[3] * m[6];
        inv[6] = -m[0] * m[6] * m[15] + m[0] * m[7] * m[14] + m[4] * m[2] * m[15]
            - m[4] * m[3] * m[14] - m[12] * m[2] * m[7] + m[12] * m[3] * m[6];
        inv[10] = m[0] * m[5] * m[15] - m[0] * m[7] * m[13] - m[4] * m[1] * m[15]
            + m[4] * m[3] * m[13] + m[12] * m[1] * m[7] - m[12] * m[3] * m[5];
        inv[14] = -m[0] * m[5] * m[14] + m[0] * m[6] * m[13] + m[4] * m[1] * m[14]
            - m[4] * m[2] * m[13] - m[12] * m[1] * m[6] + m[12] * m[2] * m[5];
        inv[3] = -m[1] * m[6] * m[11] + m[1] * m[7] * m[10] + m[5] * m[2] * m[11]
            - m[5] * m[3] * m[10] - m[9] * m[2] * m[7] + m[9] * m[3] * m[6];
        inv[7] = m[0] * m[6] * m[11] - m[0] * m[7] * m[10] - m[4] * m[2] * m[11]
            + m[4] * m[3] * m[10] + m[8] * m[2] * m[7] - m[8] * m[3] * m[6];
        inv[11] = -m[0] * m[5] * m[11] + m[0] * m[7] * m[9] + m[4] * m[1] * m[11]
            - m[4] * m[3] * m[9] - m[8] * m[1] * m[7] + m[8] * m[3] * m[5];
        inv[15] = m[0] * m[5] * m[10] - m[0] * m[6] * m[9] - m[4] * m[1] * m[10]
            + m[4] * m[2] * m[9] + m[8] * m[1] * m[6] - m[8] * m[2] * m[5];
        var det = m[0]*inv[0] + m[1]*inv[4] + m[2]*inv[8] + m[3]*inv[12];
        if( det == 0 )
        {
            return null;
        }
        det = 1.0 / det;
        var mo = this.make();
        for( var i=0; i<16; ++i )
        {
            mo[i] = inv[i] * det;
        }
        return mo;
    },

    transposed : function(m)
    {
        var mo = this.make();

        mo[0 ] = m[0 ];
        mo[1 ] = m[4 ];
        mo[2 ] = m[8 ];
        mo[3 ] = m[12];

        mo[4 ] = m[1 ];
        mo[5 ] = m[5 ];
        mo[6 ] = m[9 ];
        mo[7 ] = m[13];

        mo[8 ] = m[2 ];
        mo[9 ] = m[6 ];
        mo[10] = m[10];
        mo[11] = m[14];

        mo[12] = m[3 ];
        mo[13] = m[7 ];
        mo[14] = m[11];
        mo[15] = m[15];

        return mo;
    },

    toMat33Inversed : function(mat44,mat33)
    {
        var a00 = mat44[0], a01 = mat44[1], a02 = mat44[2];
        var a10 = mat44[4], a11 = mat44[5], a12 = mat44[6];
        var a20 = mat44[8], a21 = mat44[9], a22 = mat44[10];

        var b01 = a22*a11-a12*a21;
        var b11 = -a22*a10+a12*a20;
        var b21 = a21*a10-a11*a20;

        var d = a00*b01 + a01*b11 + a02*b21;
        if (!d) { return null; }
        var id = 1/d;


        if(!mat33) { mat33 = Mat33.make(); }

        mat33[0] = b01*id;
        mat33[1] = (-a22*a01 + a02*a21)*id;
        mat33[2] = (a12*a01 - a02*a11)*id;
        mat33[3] = b11*id;
        mat33[4] = (a22*a00 - a02*a20)*id;
        mat33[5] = (-a12*a00 + a02*a10)*id;
        mat33[6] = b21*id;
        mat33[7] = (-a21*a00 + a01*a20)*id;
        mat33[8] = (a11*a00 - a01*a10)*id;

        return mat33;


    },

    multVec3 : function(m,v)
    {
        var x = v[0],
            y = v[1],
            z = v[2];

        v[0] = m[ 0] * x + m[ 4] * y + m[ 8] * z + m[12];
        v[1] = m[ 1] * x + m[ 5] * y + m[ 9] * z + m[13];
        v[2] = m[ 2] * x + m[ 6] * y + m[10] * z + m[14];

        return v;
    },

    mutlVec3A : function(m,a,i)
    {
        i *= 3;

        var x = a[i  ],
            y = a[i+1],
            z = a[i+2];

        a[i  ] = m[ 0] * x + m[ 4] * y + m[ 8] * z + m[12];
        a[i+1] = m[ 1] * x + m[ 5] * y + m[ 9] * z + m[13];
        a[i+2] = m[ 2] * x + m[ 6] * y + m[10] * z + m[14];
    },

    multVec3AI : function(m,a,i)
    {
        var x = a[i  ],
            y = a[i+1],
            z = a[i+2];

        a[i  ] = m[ 0] * x + m[ 4] * y + m[ 8] * z + m[12];
        a[i+1] = m[ 1] * x + m[ 5] * y + m[ 9] * z + m[13];
        a[i+2] = m[ 2] * x + m[ 6] * y + m[10] * z + m[14];
    },

    multVec4 : function(m,v)
    {
        var x = v[0],
            y = v[1],
            z = v[2],
            w = v[3];

        v[0] = m[ 0] * x + m[ 4] * y + m[ 8] * z + m[12] * w;
        v[1] = m[ 1] * x + m[ 5] * y + m[ 9] * z + m[13] * w;
        v[2] = m[ 2] * x + m[ 6] * y + m[10] * z + m[14] * w;
        v[3] = m[ 3] * x + m[ 7] * y + m[11] * z + m[15] * w;

        return v;


    },

    multVec4A : function(m,a,i)
    {
        i *= 3;

        var x = a[i  ],
            y = a[i+1],
            z = a[i+2],
            w = a[i+3];

        a[i  ] = m[ 0] * x + m[ 4] * y + m[ 8] * z + m[12] * w;
        a[i+1] = m[ 1] * x + m[ 5] * y + m[ 9] * z + m[13] * w;
        a[i+2] = m[ 2] * x + m[ 6] * y + m[10] * z + m[14] * w;
        a[i+3] = m[ 3] * x + m[ 7] * y + m[11] * z + m[15] * w;

    },

    multVec4AI : function(m,a,i)
    {
        var x = a[i  ],
            y = a[i+1],
            z = a[i+2],
            w = a[i+3];

        a[i  ] = m[ 0] * x + m[ 4] * y + m[ 8] * z + m[12] * w;
        a[i+1] = m[ 1] * x + m[ 5] * y + m[ 9] * z + m[13] * w;
        a[i+2] = m[ 2] * x + m[ 6] * y + m[10] * z + m[14] * w;
        a[i+3] = m[ 3] * x + m[ 7] * y + m[11] * z + m[15] * w;

    },

    isFloatEqual : function(m0,m1)
    {
        var i = -1;
        while(++i<16)
        {
            if(!kMath.isFloatEqual(m0[i],m1[i]))return false;
        }
        return true;

    },

    toString : function(m)
    {
        return '[' + m[ 0] + ', ' + m[ 1] + ', ' + m[ 2] + ', ' + m[ 3] + ',\n' +
            ' ' + m[ 4] + ', ' + m[ 5] + ', ' + m[ 6] + ', ' + m[ 7] + ',\n' +
            ' ' + m[ 8] + ', ' + m[ 9] + ', ' + m[10] + ', ' + m[11] + ',\n' +
            ' ' + m[12] + ', ' + m[13] + ', ' + m[14] + ', ' + m[15] + ']';
    }
};

module.exports = Mat44;
},{"./fMat33":30,"./fMath":32}],32:[function(require,module,exports){
var kMath =
{
    PI          : Math.PI,
    HALF_PI     : Math.PI * 0.5,
    QUARTER_PI  : Math.PI * 0.25,
    TWO_PI      : Math.PI * 2,
    EPSILON     : 0.0001,

    lerp        : function(a,b,v){return (a*(1-v))+(b*v);},
    cosIntrpl   : function(a,b,v){v = (1 - Math.cos(v * Math.PI)) * 0.5;return (a * (1-v) + b * v);},
    cubicIntrpl : function(a,b,c,d,v)
    {
        var a0,b0,c0,d0,vv;

        vv = v * v;
        a0 = d - c - a + b;
        b0 = a - b - a0;
        c0 = c - a;
        d0 = b;

        return a0*v*vv+b0*vv+c0*v+d0;
    },

    hermiteIntrpl : function(a,b,c,d,v,tension,bias)
    {
        var v0, v1, v2, v3,
            a0, b0, c0, d0;

        tension = (1.0 - tension) * 0.5;

        var biasp = 1 + bias,
            biasn = 1 - bias;

        v2  = v * v;
        v3  = v2 * v;

        v0  = (b - a) * biasp * tension;
        v0 += (c - b) * biasn * tension;
        v1  = (c - b) * biasp * tension;
        v1 += (d - c) * biasn * tension;

        a0  = 2 * v3 - 3 * v2 + 1;
        b0  = v3 - 2 * v2 + v;
        c0  = v3 - v2;
        d0  = -2 * v3 + 3 * v2;

        return a0 * b + b0 * v0 + c0 * v1 + d0 * c;
    },

    randomFloat : function()
    {
        var r;

        switch (arguments.length)
        {
            case 0: r = Math.random();break;
            case 1: r = Math.random() * arguments[0];break;
            case 2: r = arguments[0] + (arguments[1]-arguments[0]) * Math.random();break;
        }

        return r;
    },

    randomInteger : function()
    {
        var r;

        switch (arguments.length)
        {
            case 0: r = 0.5 + Math.random();break;
            case 1: r = 0.5 + Math.random()*arguments[0];break;
            case 2: r = arguments[0] + ( 1 + arguments[1] - arguments[0]) * Math.random();break;
        }

        return Math.floor(r);
    },

    constrain : function()
    {
        var r;

        switch (arguments.length)
        {
            case 2: arguments[0] = (arguments[0] > arguments[1]) ? arguments[1] : arguments[0];break;
            case 3: arguments[0] = (arguments[0] > arguments[2]) ? arguments[2] : (arguments[0] < arguments[1]) ? arguments[1] :arguments[0];break;
        }

        return arguments[0];
    },

    normalize             : function(value,start,end){return (value - start) / (end - start);},
    map                   : function(value,inStart,inEnd,outStart,outEnd){return outStart + (outEnd - outStart) * normalize(value,inStart,inEnd);},
    sin                   : function(value){return Math.sin(value);},
    cos                   : function(value){return Math.cos(value);},
    clamp                 : function(value,min,max){return Math.max(min,Math.min(max,value));},
    saw                   : function(n){return 2 * (n  - Math.floor(0.5 + n ));},
    tri                   : function(n){return 1-4*Math.abs(0.5-this.frac(0.5*n+0.25));},
    rect                  : function(n){var a = Math.abs(n);return (a > 0.5) ? 0 : (a == 0.5) ? 0.5 : (a < 0.5) ? 1 : -1;},
    frac                  : function(n){return n - Math.floor(n);},
    sgn                   : function(n){return n/Math.abs(n);},
    abs                   : function(n){return Math.abs(n);},
    min                   : function(n){return Math.min(n);},
    max                   : function(n){return Math.max(n);},
    atan                  : function(n){return Math.atan(n);},
    atan2                 : function(y,x){return Math.atan2(y,x);},
    round                 : function(n){return Math.round(n);},
    floor                 : function(n){return Math.floor(n);},
    tan                   : function(n){return Math.tan(n);},
    rad2deg               : function(radians){return radians * (180 / Math.PI);},
    deg2rad               : function(degree){return degree * (Math.PI / 180); },
    sqrt                  : function(value){return Math.sqrt(value);},
    GreatestCommonDivisor : function(a,b){return (b == 0) ? a : this.GreatestCommonDivisor(b, a % b);},
    isFloatEqual          : function(a,b){return (Math.abs(a-b)<this.EPSILON);},
    isPowerOfTwo          : function(a){return (a&(a-1))==0;},
    swap                  : function(a,b){var t = a;a = b; b = a;},
    pow                   : function(x,y){return Math.pow(x,y);},
    log                   : function(n){return Math.log(n);},
    cosh                  : function(n){return (Math.pow(Math.E,n) + Math.pow(Math.E,-n))*0.5;},
    exp                   : function(n){return Math.exp(n);},
    stepSmooth            : function(n){return n*n*(3-2*n);},
    stepSmoothSquared     : function(n){return this.stepSmooth(n) * this.stepSmooth(n);},
    stepSmoothInvSquared  : function(n){return 1-(1-this.stepSmooth(n))*(1-this.stepSmooth(n));},
    stepSmoothCubed       : function(n){return this.stepSmooth(n)*this.stepSmooth(n)*this.stepSmooth(n)*this.stepSmooth(n);},
    stepSmoothInvCubed    : function(n){return 1-(1-this.stepSmooth(n))*(1-this.stepSmooth(n))*(1-this.stepSmooth(n))*(1-this.stepSmooth(n));},
    stepSquared           : function(n){return n*n;},
    stepInvSquared        : function(n){return 1-(1-n)*(1-n);},
    stepCubed             : function(n){return n*n*n*n;},
    stepInvCubed          : function(n){return 1-(1-n)*(1-n)*(1-n)*(1-n);},
    catmullrom            : function(a,b,c,d,i){ return a * ((-i + 2) * i - 1) * i * 0.5 +
                                                        b * (((3 * i - 5) * i) * i + 2) * 0.5 +
                                                        c * ((-3 * i + 4) * i + 1) * i * 0.5 +
                                                        d * ((i - 1) * i * i) * 0.5;}
};


module.exports = kMath;
},{}],33:[function(require,module,exports){
var Quaternion =
{
    make     : function(n,v){return new Float32Array([n, v[0],v[1],v[2]]);},
    make4f   : function(n,x,y,z){return new Float32Array([n,x,y,z]);},
    zero     : function(){return new Float32Array([0,0,0,0]);},
    set      : function(q0,q1)
    {
        q0[0] = q1[0];
        q0[1] = q1[1];
        q0[2] = q1[2];
        q0[3] = q1[3];
    },

    set4f    : function(q,n,x,y,z)
    {
        q[0] = n;
        q[1] = x;
        q[2] = y;
        q[3] = z;

    },

    copy     : function(q){return new Float32Array(q);},

    length   : function(q){var n = q[0],x = q[1],y = q[2],z = q[3]; return Math.sqrt(n*n+x*x+y*y+z*z);},
    vector   : function(q){return new Float32Array(q[1],q[2],q[3]);},
    scalar   : function(q){return q[0];},



    add : function(q0,q1)
    {
        q0[0] = q0[0] + q1[0];
        q0[1] = q0[1] + q1[1];
        q0[2] = q0[2] + q1[2];
        q0[3] = q0[3] + q1[3];
    },

    sub : function(q0,q1)
    {
        q0[0] = q0[0] - q1[0];
        q0[1] = q0[1] - q1[1];
        q0[2] = q0[2] - q1[2];
        q0[3] = q0[3] - q1[3];
    },

    scale : function(q,n)
    {
        q[0] *= n;
        q[1] *= n;
        q[2] *= n;
        q[3] *= n;
    },

    conjugate : function(q)
    {
        q[1]*=-1;
        q[2]*=-1;
        q[3]*=-1;
    },

    mult : function(q0,q1)
    {
        var n0 = q0[0],
            x0 = q0[1],
            y0 = q0[2],
            z0 = q0[3],
            n1 = q1[0],
            x1 = q1[1],
            y1 = q1[2],
            z1 = q1[3];

        q0[0] = n0 * n1 - x0 * x1 - y0 * y1 - z0 * z1;
        q0[1] = n0 * x1 - x0 * n1 - y0 * z1 - z0 * y1;
        q0[2] = n0 * y1 - y0 * n1 - z0 * x1 - x0 * z1;
        q0[3] = n0 * z1 - z0 * n1 - x0 * y1 - y0 * z1;
    },

    multVec : function(q,v)
    {
        var qn = q[0],
            qx = q[1],
            qy = q[2],
            qz = q[3];

        var x = v[0],
            y = v[1],
            z = v[2];

        q[0] = -(qx*x + qy*y + qz*z);
        q[1] = qn * x + qy * z - qz * y;
        q[2] = qn * y + qz * x - qx * z;
        q[3] = qn * z + qx * y - qy * x;
    },

    angle : function(q)
    {
        return 2 * acos(q[0]);
    },

    axis : function(q)
    {
        var x = q[0],
            y = q[1],
            z = q[2];

        var l = Math.sqrt(x*x + y*y + z*z);

        return l != 0 ? new Float32Array([x/l,y/l,z/l]) : new Float32Array([0,0,0]);
    },

    //TODO: INLINE ALL!!

    rotate : function(q0,q1)
    {
        this.set(q0,this.mult(this.mult(this.copy(q0),q1),
                    this.conjugate(this.copy(q0))));
    },

    rotateVec : function(q,v)
    {
        var t = this.zero();
        this.set(t,this.multVec3(this.multVec3(this.copy(q),v),this.conjugate(this.copy(q))));
    },

    fromAngles : function(ax,ay,az)
    {
        var q = this.zero();

        var cyaw,cpitch,croll,syaw,spitch,sroll;
        var cyawcpitch,syawspitch,cyawspitch,syawcpitch;

        cyaw   = Math.cos(az * 0.5);
        cpitch = Math.cos(ay * 0.5);
        croll  = Math.cos(ax * 0.5);
        syaw   = Math.sin(az * 0.5);
        spitch = Math.sin(ay * 0.5);
        sroll  = Math.sin(ax * 0.5);

        cyawcpitch = cyaw * cpitch;
        syawspitch = syaw * spitch;
        cyawspitch = cyaw * spitch;
        syawcpitch = syaw * cpitch;

        return new Float32Array([ cyawcpitch * croll + syawspitch * sroll,
                                  cyawcpitch * sroll - syawspitch * croll,
                                  cyawspitch * croll + syawcpitch * sroll,
                                  syawcpitch * croll - cyawspitch * sroll ]);

    },

    anglesFrom : function(q)
    {
        var qn = q[0],
            qx = q[1],
            qy = q[2],
            qz = q[3];

        var r11,r21,r31,r32,r33,r12,r13;
        var q00,q11,q22,q33;
        var temp;
        var v = new Float32Array(3);

        q00 = qn * qn;
        q11 = qx * qx;
        q22 = qy * qy;
        q33 = qz * qz;

        r11 = q00 + q11 - q22 - q33;
        r21 = 2 * ( qx + qy + qn * qz);
        r31 = 2 * ( qx * qz - qn * qy);
        r32 = 2 * ( qy * qz + qn * qx);
        r33 = q00 - q11 - q22 + q33;

        temp = Math.abs(r31);
        if(temp > 0.999999)
        {
            r12 = 2 * (qx * qy - qn * qz);
            r13 = 2 * (qx * qz - qn * qy);

            v[0] = 0.0;
            v[1] = (-(Math.PI * 0.5) *  r32 / temp);
            v[2] = Math.atan2(-r12,-r31*r13);
            return v;
        }

        v[0] = Math.atan2(r32,r33);
        v[1] = Math.asin(-31);
        v[2] = Math.atan2(r21,r11);
        return v;
   }
};

module.exports = Quaternion;
},{}],34:[function(require,module,exports){
var Vec2 =
{
    SIZE : 2,

    make : function()
    {
        return new Float32Array([0,0]);
    }
};

module.exports = Vec2;
},{}],35:[function(require,module,exports){
var Vec3 =
{
    SIZE   : 3,
    ZERO   : function(){return new Float32Array([0,0,0])},
    AXIS_X : function(){return new Float32Array([1,0,0])},
    AXIS_Y : function(){return new Float32Array([0,1,0])},
    AXIS_Z : function(){return new Float32Array([0,0,1])},

    make : function(x,y,z)
    {
        return new Float32Array([ x || 0.0,
            y || 0.0,
            z || 0.0]);
    },

    set : function(v0,v1)
    {
        v0[0] = v1[0];
        v0[1] = v1[1];
        v0[2] = v1[2];

        return v0;
    },

    set3f :  function(v,x,y,z)
    {
        v[0] = x;
        v[1] = y;
        v[2] = z;

        return v;
    },

    copy :  function(v)
    {
        return new Float32Array(v);
    },

    add : function(v0,v1)
    {
        v0[0] += v1[0];
        v0[1] += v1[1];
        v0[2] += v1[2];

        return v0;
    },

    sub : function(v0,v1)
    {
        v0[0] -= v1[0];
        v0[1] -= v1[1];
        v0[2] -= v1[2];

        return v0;
    },

    scale : function(v,n)
    {
        v[0]*=n;
        v[1]*=n;
        v[2]*=n;

        return v;
    },

    dot : function(v0,v1)
    {
        return v0[0]*v1[0] + v0[1]*v1[1] + v0[2]*v1[2];
    },

    cross: function(v0,v1)
    {
        var x0 = v0[0],
            y0 = v0[1],
            z0 = v0[2],
            x1 = v1[0],
            y1 = v1[1],
            z1 = v1[2];

        return new Float32Array([y0 * z1 - y1 * z0,
                                 z0 * x1 - z1 * x0,
                                 x0 * y1 - x1 * y0]);
    },

    lerp : function(v0,v1,f)
    {
        var x0 = v0[0],
            y0 = v0[1],
            z0 = v0[2];

        v0[0] = x0 * (1.0 - f) + v1[0] * f;
        v0[1] = y0 * (1.0 - f) + v1[1] * f;
        v0[2] = z0 * (1.0 - f) + v1[2] * f;


    },

    lerped : function(v0,v1,f)
    {
        return this.lerp(this.copy(v0),v1,f);
    },



    lerp3f : function(v,x,y,z,f)
    {
        var vx = v[0],
            vy = v[1],
            vz = v[2];

        v[0] = vx * (1.0 - f) + x * f;
        v[1] = vy * (1.0 - f) + y * f;
        v[2] = vz * (1.0 - f) + z * f;
    },


    length : function(v)
    {
        var x = v[0],
            y = v[1],
            z = v[2];

        return Math.sqrt(x*x+y*y+z*z);
    },

    lengthSq :  function(v)
    {
        var x = v[0],
            y = v[1],
            z = v[2];

        return x*x+y*y+z*z;
    },

    safeNormalize : function(v)
    {
        var x = v[0],
            y = v[1],
            z = v[2];

        var d = Math.sqrt(x*x+y*y+z*z);
        d = d || 1;

        var l  = 1/d;

        v[0] *= l;
        v[1] *= l;
        v[2] *= l;

        return v;
    },

    normalize : function(v)
    {
        var x = v[0],
            y = v[1],
            z = v[2];

        var l  = 1/Math.sqrt(x*x+y*y+z*z);

        v[0] *= l;
        v[1] *= l;
        v[2] *= l;

        return v;
    },

    distance : function(v0,v1)
    {
        var x = v0[0] - v1[0],
            y = v0[1] - v1[1],
            z = v0[2] - v1[2];

        return Math.sqrt(x*x+y*y+z*z);
    },

    distance3f : function(v,x,y,z)
    {
        return Math.sqrt(v[0] * x + v[1] * y + v[2] * z);
    },

    distanceSq : function(v0,v1)
    {
        var x = v0[0] - v1[0],
            y = v0[1] - v1[1],
            z = v0[2] - v1[2];

        return x*x+y*y+z*z;
    },

    distanceSq3f : function(v,x,y,z)
    {
        return v[0] * x + v[1] * y + v[2] * z;
    },

    limit : function(v,n)
    {
        var x = v[0],
            y = v[1],
            z = v[2];

        var dsq = x*x + y*y + z*z,
            lsq = n * n;

        if((dsq > lsq) && lsq > 0)
        {
            var nd = n/Math.sqrt(dsq);

            v[0] *= nd;
            v[1] *= nd;
            v[2] *= nd;
        }

        return v;
    },

    invert : function(v)
    {
        v[0]*=-1;
        v[1]*=-1;
        v[2]*=-1;

        return v;
    },

    added  : function(v0,v1)
    {
        return this.add(this.copy(v0),v1);
    },

    subbed : function(v0,v1)
    {
        return this.sub(this.copy(v0),v1);
    },

    scaled : function(v,n)
    {
        return this.scale(this.copy(v),n);
    },

    normalized : function(v)
    {
        return this.normalize(this.copy(v));
    },

    toString : function(v)
    {
        return '[' + v[0] + ',' + v[1] + ',' + v[2] + ']';
    }

};

module.exports = Vec3;




},{}],36:[function(require,module,exports){

//TODO:FINISH
var Vec4 =
{
    SIZE : 4,
    ZERO : function(){return new Float32Array([0,0,0,1.0])},

    make : function(x,y,z,w)
    {
        return new Float32Array([ x || 0.0,
            y || 0.0,
            z || 0.0,
            w || 1.0]);
    },

    fromVec3 : function(v)
    {
        return new Float32Array([ v[0], v[1], v[2] , 1.0]);
    },

    set : function(v0,v1)
    {
        v0[0] = v1[0];
        v0[1] = v1[1];
        v0[2] = v1[2];
        v0[3] = v1[3];

        return v0;
    },

    set3f :  function(v,x,y,z)
    {
        v[0] = x;
        v[1] = y;
        v[2] = z;

        return v;
    },

    set4f : function(v,x,y,z,w)
    {
        v[0] = x;
        v[1] = y;
        v[2] = z;
        v[3] = w;

        return v;

    },

    copy :  function(v)
    {
        return new Float32Array(v);
    },

    add : function(v0,v1)
    {
        v0[0] += v1[0];
        v0[1] += v1[1];
        v0[2] += v1[2];
        v0[3] += v1[3];

        return v0;
    },

    sub : function(v0,v1)
    {
        v0[0] -= v1[0];
        v0[1] -= v1[1];
        v0[2] -= v1[2];
        v0[3] -= v1[3];

        return v0;
    },

    scale : function(v,n)
    {
        v[0]*=n;
        v[1]*=n;
        v[2]*=n;
        v[3]*=n;

        return v;
    },

    dot : function(v0,v1)
    {
        return v0[0]*v1[0] + v0[1]*v1[1] + v0[2]*v1[2];
    },

    cross: function(v0,v1)
    {
        var x0 = v0[0],
            y0 = v0[1],
            z0 = v0[2],
            x1 = v1[0],
            y1 = v1[1],
            z1 = v1[2];

        return new Float32Array([y0*z1-y1*z0,z0*x1-z1*x0,x0*y1-x1*y0]);
    },

    slerp : function(v0,v1,f)
    {
        var x0 = v0[0],
            y0 = v0[1],
            z0 = v0[2],
            x1 = v1[0],
            y1 = v1[1],
            z1 = v1[2];

        var d = Math.max(-1.0,Math.min((x0*x1 + y0*y1 + z0*z1),1.0)),
            t = Math.acos(d) * f;

        var x = x0 - (x1 * d),
            y = y0 - (y1 * d),
            z = z0 - (z1 * d);

        var l = 1/Math.sqrt(x*x+y*y+z*z);

        x*=l;
        y*=l;
        z*=l;

        var ct = Math.cos(t),
            st = Math.sin(t);

        var xo = x0 * ct + x * st,
            yo = y0 * ct + y * st,
            zo = z0 * ct + z * st;

        return new Float32Array([xo,yo,zo]);
    },

    length : function(v)
    {
        var x = v[0],
            y = v[1],
            z = v[2],
            w = v[3];

        return Math.sqrt(x*x+y*y+z*z+w*w);
    },

    lengthSq :  function(v)
    {
        var x = v[0],
            y = v[1],
            z = v[2],
            w = v[3];

        return x*x+y*y+z*z+w*w;
    },

    normalize : function(v)
    {
        var x = v[0],
            y = v[1],
            z = v[2],
            w = v[3];

        var l  = 1/Math.sqrt(x*x+y*y+z*z+w*w);

        v[0] *= l;
        v[1] *= l;
        v[2] *= l;
        v[3] *= l;

        return v;
    },

    distance : function(v0,v1)
    {
        var x = v0[0] - v1[0],
            y = v0[1] - v1[1],
            z = v0[2] - v1[2];

        return Math.sqrt(x*x+y*y+z*z);
    },

    distanceSq : function(v0,v1)
    {
        var x = v0[0] - v1[0],
            y = v0[1] - v1[1],
            z = v0[2] - v1[2];

        return x*x+y*y+z*z;
    },

    limit : function(v,n)
    {
        var x = v[0],
            y = v[1],
            z = v[2];

        var dsq = x*x + y*y + z*z,
            lsq = n * n;

        if((dsq > lsq) && lsq > 0)
        {
            var nd = n/Math.sqrt(dsq);

            v[0] *= nd;
            v[1] *= nd;
            v[2] *= nd;
        }

        return v;
    },

    invert : function(v)
    {
        v[0]*=-1;
        v[1]*=-1;
        v[2]*=-1;

        return v;
    },

    added  : function(v0,v1)
    {
        return this.add(this.copy(v0),v1);
    },

    subbed : function(v0,v1)
    {
        return this.sub(this.copy(v0),v1);
    },

    scaled : function(v,n)
    {
        return this.scale(this.copy(v),n);
    },

    normalized : function(v)
    {
        return this.normalize(this.copy(v));
    },

    toString : function(v)
    {
        return '[' + v[0] + ',' + v[1] + ',' + v[2] + ']';
    }

};

module.exports = Vec4;
},{}],37:[function(require,module,exports){
module.exports =
{
    APP_WIDTH  : 800,
    APP_HEIGHT : 600,

    APP_FPS : 30,

    APP_PLASK_WINDOW_TITLE : '',
    APP_PLASK_TYPE  : '3d',
    APP_PLASK_VSYNC : 'false',
    APP_PLASK_MULTISAMPLE : true,

    CAMERA_FOV : 45,
    CAMERA_NEAR : 0.1,
    CAMERA_FAR  : 100

};
},{}],38:[function(require,module,exports){
module.exports =
{
    METHOD_NOT_IMPLEMENTED: 'Method not implemented in target platform.',
    CLASS_IS_SINGLETON:     'Application is singleton. Get via getInstance().',
    APP_NO_SETUP:           'No setup method added to app.',
    APP_NO_UPDATE :         'No update method added to app.',
    PLASK_WINDOW_SIZE_SET:  'Plask window size can only be set on startup.',
    WRONG_PLATFORM:         'Wrong Platform.',
    VERTICES_IN_WRONG_SIZE: 'Vertices array has wrong length. Should be ',
    COLORS_IN_WRONG_SIZE:   'Color array length not equal to number of vertices.'
};
},{}],39:[function(require,module,exports){
var Platform = {WEB:0,PLASK:1};
    Platform._target = null;

Platform.getTarget  = function()
{
    if(!this._target)this._target = (typeof window !== 'undefined' && typeof document !== 'undefined') ? this.WEB :
                                    (typeof require == "function" && require) ? this.PLASK :
                                     null;
    return this._target;
};

module.exports = Platform;
},{}],40:[function(require,module,exports){
module.exports =
{
    SIZE  : 4,

    BLACK : function(){return new Float32Array([0,0,0,1])},
    WHITE : function(){return new Float32Array([1,1,1,1])},
    RED   : function(){return new Float32Array([1,0,0,1])},
    GREEN : function(){return new Float32Array([0,1,0,1])},
    BLUE  : function(){return new Float32Array([0,0,1,1])},

    make : function(r,g,b,a){return new Float32Array([ r,g,b,a]);},
    copy : function(c){return this.make(c[0],c[1],c[2],c[3]);},

    set : function(c0,c1)
    {
        c0[0] = c1[0];
        c0[1] = c1[1];
        c0[2] = c1[2];
        c0[3] = c1[3];

        return c0;
    },

    set4f : function(c,r,g,b,a)
    {
        c[0] = r;
        c[1] = g;
        c[2] = b;
        c[3] = a;

        return c;
    },

    set3f : function(c,r,g,b)
    {
        c[0] = r;
        c[1] = g;
        c[2] = b;
        c[3] = 1.0;

        return c;
    },

    set2f : function(c,k,a)
    {
        c[0] = c[1] = c[2] = k;
        c[3] = a;

        return c;
    },

    set1f : function(c,k)
    {
        c[0] = c[1] = c[2] = k;
        c[3] = 1.0;

        return c;
    },

    set4i    : function(c,r,g,b,a){return this.set4f(c,r/255.0,g/255.0,b/255.0,a);},
    set3i    : function(c,r,g,b)  {return this.set3f(c,r/255.0,g/255.0,b/255.0);},
    set2i    : function(c,k,a)    {return this.set2f(c,k/255.0,a);},
    set1i    : function(c,k)      {return this.set1f(c,k/255.0);},
    toArray  : function(c)        {return c.toArray();},
    toString : function(c)        {return '['+c[0]+','+c[1]+','+c[2]+','+c[3]+']';},

    interpolated : function(c0,c1,f)
    {
        var c  = new Float32Array(4),
            fi = 1.0 - f;

        c[0] = c0[0] * fi + c1[0] * f;
        c[1] = c0[1] * fi + c1[1] * f;
        c[2] = c0[2] * fi + c1[2] * f;
        c[3] = c0[3] * fi + c1[3] * f;

        return c;
    }

};
},{}],41:[function(require,module,exports){
var Vec2   = require('../math/fVec2'),
    kError = require('../system/fError');

function Mouse()
{
    if(Mouse.__instance)throw new Error(kError.CLASS_IS_SINGLETON);

    this._position     = Vec2.make();
    this._positionLast = Vec2.make();

    Mouse.__instance = this;
}

Mouse.prototype.getPosition     = function(){return this._position;};
Mouse.prototype.getPositionLast = function(){return this._positionLast;};
Mouse.prototype.getX            = function(){return this._position[0];};
Mouse.prototype.getY            = function(){return this._position[1];};
Mouse.prototype.getXLast        = function(){return this._positionLast[0];};
Mouse.prototype.getYLast        = function(){return this._positionLast[1];};

Mouse.__instance = null;
Mouse.getInstance = function(){return Mouse._instance;};

module.exports = Mouse;
},{"../math/fVec2":34,"../system/fError":38}],42:[function(require,module,exports){
module.exports =
{
    toArray : function(float32Array){return Array.prototype.slice.call(float32Array);}
};
},{}],43:[function(require,module,exports){

},{}]},{},[1])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvYXV0b21hdC9XZWJzdG9ybVByb2plY3RzL2ZvYW0vZXhhbXBsZXMvMDlfTGluZUJ1ZmZlcjNkL2FwcC5qcyIsIi9Vc2Vycy9hdXRvbWF0L1dlYnN0b3JtUHJvamVjdHMvZm9hbS9zcmMvZm9hbS9hcHAvZkFwcEltcGwuanMiLCIvVXNlcnMvYXV0b21hdC9XZWJzdG9ybVByb2plY3RzL2ZvYW0vc3JjL2ZvYW0vYXBwL2ZBcHBJbXBsUGxhc2suanMiLCIvVXNlcnMvYXV0b21hdC9XZWJzdG9ybVByb2plY3RzL2ZvYW0vc3JjL2ZvYW0vYXBwL2ZBcHBJbXBsV2ViLmpzIiwiL1VzZXJzL2F1dG9tYXQvV2Vic3Rvcm1Qcm9qZWN0cy9mb2FtL3NyYy9mb2FtL2FwcC9mQXBwbGljYXRpb24uanMiLCIvVXNlcnMvYXV0b21hdC9XZWJzdG9ybVByb2plY3RzL2ZvYW0vc3JjL2ZvYW0vZm9hbS5qcyIsIi9Vc2Vycy9hdXRvbWF0L1dlYnN0b3JtUHJvamVjdHMvZm9hbS9zcmMvZm9hbS9nZW9tL2ZHZW9tM2QuanMiLCIvVXNlcnMvYXV0b21hdC9XZWJzdG9ybVByb2plY3RzL2ZvYW0vc3JjL2ZvYW0vZ2VvbS9mSVNPQmFuZC5qcyIsIi9Vc2Vycy9hdXRvbWF0L1dlYnN0b3JtUHJvamVjdHMvZm9hbS9zcmMvZm9hbS9nZW9tL2ZJU09TdXJmYWNlLmpzIiwiL1VzZXJzL2F1dG9tYXQvV2Vic3Rvcm1Qcm9qZWN0cy9mb2FtL3NyYy9mb2FtL2dlb20vZkxpbmUyZFV0aWwuanMiLCIvVXNlcnMvYXV0b21hdC9XZWJzdG9ybVByb2plY3RzL2ZvYW0vc3JjL2ZvYW0vZ2VvbS9mTGluZUJ1ZmZlcjJkLmpzIiwiL1VzZXJzL2F1dG9tYXQvV2Vic3Rvcm1Qcm9qZWN0cy9mb2FtL3NyYy9mb2FtL2dlb20vZkxpbmVCdWZmZXIzZC5qcyIsIi9Vc2Vycy9hdXRvbWF0L1dlYnN0b3JtUHJvamVjdHMvZm9hbS9zcmMvZm9hbS9nZW9tL2ZQYXJhbWV0cmljU3VyZmFjZS5qcyIsIi9Vc2Vycy9hdXRvbWF0L1dlYnN0b3JtUHJvamVjdHMvZm9hbS9zcmMvZm9hbS9nZW9tL2ZQb2x5Z29uMmRVdGlsLmpzIiwiL1VzZXJzL2F1dG9tYXQvV2Vic3Rvcm1Qcm9qZWN0cy9mb2FtL3NyYy9mb2FtL2dlb20vZlNwbGluZS5qcyIsIi9Vc2Vycy9hdXRvbWF0L1dlYnN0b3JtUHJvamVjdHMvZm9hbS9zcmMvZm9hbS9ncmFwaGljcy9mQ2FtZXJhQmFzaWMuanMiLCIvVXNlcnMvYXV0b21hdC9XZWJzdG9ybVByb2plY3RzL2ZvYW0vc3JjL2ZvYW0vZ3JhcGhpY3MvZkdMLmpzIiwiL1VzZXJzL2F1dG9tYXQvV2Vic3Rvcm1Qcm9qZWN0cy9mb2FtL3NyYy9mb2FtL2dyYXBoaWNzL2dsL2ZEaXJlY3Rpb25hbExpZ2h0LmpzIiwiL1VzZXJzL2F1dG9tYXQvV2Vic3Rvcm1Qcm9qZWN0cy9mb2FtL3NyYy9mb2FtL2dyYXBoaWNzL2dsL2ZMaWdodC5qcyIsIi9Vc2Vycy9hdXRvbWF0L1dlYnN0b3JtUHJvamVjdHMvZm9hbS9zcmMvZm9hbS9ncmFwaGljcy9nbC9mTWF0R0wuanMiLCIvVXNlcnMvYXV0b21hdC9XZWJzdG9ybVByb2plY3RzL2ZvYW0vc3JjL2ZvYW0vZ3JhcGhpY3MvZ2wvZk1hdGVyaWFsLmpzIiwiL1VzZXJzL2F1dG9tYXQvV2Vic3Rvcm1Qcm9qZWN0cy9mb2FtL3NyYy9mb2FtL2dyYXBoaWNzL2dsL2ZQb2ludExpZ2h0LmpzIiwiL1VzZXJzL2F1dG9tYXQvV2Vic3Rvcm1Qcm9qZWN0cy9mb2FtL3NyYy9mb2FtL2dyYXBoaWNzL2dsL2ZTcG90TGlnaHQuanMiLCIvVXNlcnMvYXV0b21hdC9XZWJzdG9ybVByb2plY3RzL2ZvYW0vc3JjL2ZvYW0vZ3JhcGhpY3MvZ2wvZlRleHR1cmUuanMiLCIvVXNlcnMvYXV0b21hdC9XZWJzdG9ybVByb2plY3RzL2ZvYW0vc3JjL2ZvYW0vZ3JhcGhpY3MvZ2wvc2hhZGVyL2ZQcm9nRnJhZ1NoYWRlci5qcyIsIi9Vc2Vycy9hdXRvbWF0L1dlYnN0b3JtUHJvamVjdHMvZm9hbS9zcmMvZm9hbS9ncmFwaGljcy9nbC9zaGFkZXIvZlByb2dMb2FkZXIuanMiLCIvVXNlcnMvYXV0b21hdC9XZWJzdG9ybVByb2plY3RzL2ZvYW0vc3JjL2ZvYW0vZ3JhcGhpY3MvZ2wvc2hhZGVyL2ZQcm9nVmVydGV4U2hhZGVyLmpzIiwiL1VzZXJzL2F1dG9tYXQvV2Vic3Rvcm1Qcm9qZWN0cy9mb2FtL3NyYy9mb2FtL2dyYXBoaWNzL2dsL3NoYWRlci9mU2hhZGVyTG9hZGVyLmpzIiwiL1VzZXJzL2F1dG9tYXQvV2Vic3Rvcm1Qcm9qZWN0cy9mb2FtL3NyYy9mb2FtL2dyYXBoaWNzL3V0aWwvZkdMVXRpbC5qcyIsIi9Vc2Vycy9hdXRvbWF0L1dlYnN0b3JtUHJvamVjdHMvZm9hbS9zcmMvZm9hbS9tYXRoL2ZNYXQzMy5qcyIsIi9Vc2Vycy9hdXRvbWF0L1dlYnN0b3JtUHJvamVjdHMvZm9hbS9zcmMvZm9hbS9tYXRoL2ZNYXQ0NC5qcyIsIi9Vc2Vycy9hdXRvbWF0L1dlYnN0b3JtUHJvamVjdHMvZm9hbS9zcmMvZm9hbS9tYXRoL2ZNYXRoLmpzIiwiL1VzZXJzL2F1dG9tYXQvV2Vic3Rvcm1Qcm9qZWN0cy9mb2FtL3NyYy9mb2FtL21hdGgvZlF1YXRlcm5pb24uanMiLCIvVXNlcnMvYXV0b21hdC9XZWJzdG9ybVByb2plY3RzL2ZvYW0vc3JjL2ZvYW0vbWF0aC9mVmVjMi5qcyIsIi9Vc2Vycy9hdXRvbWF0L1dlYnN0b3JtUHJvamVjdHMvZm9hbS9zcmMvZm9hbS9tYXRoL2ZWZWMzLmpzIiwiL1VzZXJzL2F1dG9tYXQvV2Vic3Rvcm1Qcm9qZWN0cy9mb2FtL3NyYy9mb2FtL21hdGgvZlZlYzQuanMiLCIvVXNlcnMvYXV0b21hdC9XZWJzdG9ybVByb2plY3RzL2ZvYW0vc3JjL2ZvYW0vc3lzdGVtL2ZEZWZhdWx0LmpzIiwiL1VzZXJzL2F1dG9tYXQvV2Vic3Rvcm1Qcm9qZWN0cy9mb2FtL3NyYy9mb2FtL3N5c3RlbS9mRXJyb3IuanMiLCIvVXNlcnMvYXV0b21hdC9XZWJzdG9ybVByb2plY3RzL2ZvYW0vc3JjL2ZvYW0vc3lzdGVtL2ZQbGF0Zm9ybS5qcyIsIi9Vc2Vycy9hdXRvbWF0L1dlYnN0b3JtUHJvamVjdHMvZm9hbS9zcmMvZm9hbS91dGlsL2ZDb2xvci5qcyIsIi9Vc2Vycy9hdXRvbWF0L1dlYnN0b3JtUHJvamVjdHMvZm9hbS9zcmMvZm9hbS91dGlsL2ZNb3VzZS5qcyIsIi9Vc2Vycy9hdXRvbWF0L1dlYnN0b3JtUHJvamVjdHMvZm9hbS9zcmMvZm9hbS91dGlsL2ZVdGlsLmpzIiwiL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvX2VtcHR5LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbG9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0NUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0aEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdjBCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5TkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzE4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDak1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoUUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdFBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7O0FDSEEiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgRm9hbSA9IHJlcXVpcmUoJy4uLy4uL3NyYy9mb2FtL2ZvYW0uanMnKTtcblxuZnVuY3Rpb24gQXBwKClcbntcbiAgICBGb2FtLkFwcGxpY2F0aW9uLmFwcGx5KHRoaXMsYXJndW1lbnRzKTtcblxuICAgIHRoaXMuc2V0RnVsbFdpbmRvd0ZyYW1lKHRydWUpO1xuXG4gICAgdGhpcy5zZXRUYXJnZXRGUFMoNjApO1xuICAgIHRoaXMuc2V0U2l6ZSg0MDI0LDEwMDApO1xufVxuXG5BcHAucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShGb2FtLkFwcGxpY2F0aW9uLnByb3RvdHlwZSk7XG5cbkFwcC5wcm90b3R5cGUuc2V0dXAgPSBmdW5jdGlvbigpXG57XG4gICAgdGhpcy5fem9vbSA9IDE7XG5cbiAgICB2YXIgbGlnaHQwID0gdGhpcy5fbGlnaHQwID0gbmV3IEZvYW0uTGlnaHQodGhpcy5rZ2wuTElHSFRfMCk7XG4gICAgbGlnaHQwLnNldEFtYmllbnQzZigwLDAsMCk7XG4gICAgbGlnaHQwLnNldERpZmZ1c2UzZigwLjgsMC44LDAuOCk7XG4gICAgbGlnaHQwLnNldFNwZWN1bGFyM2YoMSwxLDEpO1xuICAgIGxpZ2h0MC5zZXRQb3NpdGlvbjNmKDEsMSwxKTtcblxuICAgIHZhciBtYXRlcmlhbCA9IHRoaXMuX21hdGVyaWFsMCA9IG5ldyBGb2FtLk1hdGVyaWFsKCk7XG4gICAgbWF0ZXJpYWwuc2V0RGlmZnVzZTNmKDAuNywwLjEsMC4yKTtcbiAgICBtYXRlcmlhbC5zZXRBbWJpZW50M2YoMC43LDAuMSwwLjcpO1xuICAgIG1hdGVyaWFsLnNldFNwZWN1bGFyM2YoMSwxLDEpO1xuICAgIG1hdGVyaWFsLnNoaW5pbmVzcyA9IDEwMC4wO1xuXG5cbiAgICB2YXIgc3BsaW5lTnVtUG9pbnRzID0gMTAwO1xuICAgIHZhciBzcGxpbmVQb2ludHMgPSBuZXcgQXJyYXkoc3BsaW5lTnVtUG9pbnRzICogMyk7XG4gICAgdmFyIGkgPSAtMSxuO1xuICAgIHdoaWxlKCsraSA8IHNwbGluZU51bVBvaW50cylcbiAgICB7XG4gICAgICAgIG4gPSBpIC8gKHNwbGluZU51bVBvaW50cyAtIDEpO1xuICAgICAgICBzcGxpbmVQb2ludHNbaSAqIDMgICAgXSA9IE1hdGguY29zKE1hdGguUEkgKiBuICogMTApOy8vKC0wLjUgK24pICogNDsvL01hdGguY29zKE1hdGguUEkgKiBuICogMTApO1xuICAgICAgICBzcGxpbmVQb2ludHNbaSAqIDMgKyAxXSA9ICgtMC41ICsgbikgKiA0Oy8vMDsvLygtMC41ICsgbikgKiA0O1xuICAgICAgICBzcGxpbmVQb2ludHNbaSAqIDMgKyAyXSA9IE1hdGguc2luKE1hdGguUEkgKiBuICogMTApOy8vMDsvL01hdGguc2luKE1hdGguUEkgKiBuICogMTApO1xuICAgIH1cbiAgICB2YXIgc3BsaW5lID0gdGhpcy5fc3BsaW5lID0gbmV3IEZvYW0uU3BsaW5lKCk7XG4gICAgc3BsaW5lLnNldERldGFpbCg0KTtcbiAgICBzcGxpbmUuc2V0UG9pbnRzKHNwbGluZVBvaW50cyk7XG4gICAgc3BsaW5lLnVwZGF0ZSgpO1xuXG4gICAgdmFyIG51bUJ1ZmZlclBvaW50cyA9IDEwMDtcbiAgICB2YXIgbGluZUJ1ZmZlciA9IHRoaXMuX2xpbmVCdWZmZXIwID0gbmV3IEZvYW0uTGluZUJ1ZmZlcjNkKG5ldyBBcnJheShudW1CdWZmZXJQb2ludHMgKiAzKSwxNiwwLjM1LG51bGwsdHJ1ZSk7XG5cblxufTtcblxuQXBwLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbigpXG57XG4gICAgdmFyIGdsICAgICAgICA9IHRoaXMua2dsLFxuICAgICAgICBjYW0gICAgICAgPSB0aGlzLmNhbWVyYSxcbiAgICAgICAgdGltZSAgICAgID0gdGhpcy5nZXRTZWNvbmRzRWxhcHNlZCgpLFxuICAgICAgICB0aW1lRGVsdGEgPSB0aGlzLmdldFRpbWVEZWx0YSgpO1xuXG4gICAgdmFyIGxpZ2h0MCA9IHRoaXMuX2xpZ2h0MDtcblxuICAgIHZhciB6b29tID0gdGhpcy5fem9vbSA9IEZvYW0uTWF0aC5sZXJwKHRoaXMuX3pvb20sIDEgKyB0aGlzLmdldE1vdXNlV2hlZWxEZWx0YSgpICogMC4yNSwgdGltZURlbHRhICogMC4wMDI1KTtcblxuXG4gICAgZ2wuY2xlYXIzZigwLjEsMC4xLDAuMSk7XG4gICAgZ2wubG9hZElkZW50aXR5KCk7XG5cbiAgICBnbC5kcmF3TW9kZShnbC5MSU5FUyk7XG5cbiAgICB2YXIgY2FtUm90WCxjYW1Sb3RZO1xuXG4gICAgaWYodGhpcy5pc01vdXNlRG93bigpKVxuICAgIHtcbiAgICAgICAgY2FtUm90WCA9ICggLTEgKyB0aGlzLm1vdXNlLmdldFgoKSAvIHRoaXMuZ2V0V2lkdGgoKSAqIDIuMCApICogTWF0aC5QSTtcbiAgICAgICAgY2FtUm90WSA9ICggLTEgKyB0aGlzLm1vdXNlLmdldFkoKSAvIHRoaXMuZ2V0SGVpZ2h0KCkgKiAyLjApICogTWF0aC5QSSAqIDAuNTtcblxuICAgICAgICBGb2FtLlZlYzMubGVycDNmKGNhbS5wb3NpdGlvbixcbiAgICAgICAgICAgIE1hdGguY29zKGNhbVJvdFgpICogem9vbSxcbiAgICAgICAgICAgIE1hdGguc2luKGNhbVJvdFkpICogem9vbSxcbiAgICAgICAgICAgIE1hdGguc2luKGNhbVJvdFgpICogem9vbSxcbiAgICAgICAgICAgIHRpbWVEZWx0YSAqIDAuMjUpO1xuICAgIH1cbiAgICBlbHNlXG4gICAge1xuXG4gICAgICAgIGNhbS5zZXRQb3NpdGlvbjNmKDQgKiB6b29tLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDApO1xuXG4gICAgfVxuXG4gICAgY2FtLnNldFRhcmdldDNmKDAsMCwwKTtcbiAgICBjYW0udXBkYXRlTWF0cmljZXMoKTtcblxuICAgIGdsLmRyYXdNb2RlKGdsLkxJTkVfTE9PUCk7XG5cbiAgICAvL3RoaXMuZHJhd1N5c3RlbSgpO1xuXG4gICAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG5cbiAgICB2YXIgc3BsaW5lICAgICAgICAgID0gdGhpcy5fc3BsaW5lLFxuICAgICAgICBzcGxpbmVOdW1Qb2ludHMgPSBzcGxpbmUuZ2V0TnVtUG9pbnRzKCksXG4gICAgICAgIHNwbGluZVBvaW50cyAgICA9IHNwbGluZS5wb2ludHM7XG5cblxuXG4gICAgZ2wuY29sb3IxZigxKTtcbiAgICBnbC5kcmF3TW9kZShnbC5MSU5FX1NUUklQKTtcbiAgICBnbC5wb2ludFNpemUoMSk7XG5cbiAgICBnbC5saW5ldihzcGxpbmUudmVydGljZXMpO1xuICAgIGdsLmNvbG9yM2YoMSwxLDEpO1xuICAgIGdsLmRyYXdNb2RlKGdsLkxJTkVfU1RSSVApO1xuICAgIGdsLnBvaW50U2l6ZSgzKTtcbiAgICBnbC5kcmF3TW9kZShnbC5QT0lOVFMpO1xuICAgIC8vZ2wucG9pbnRzKHNwbGluZS52ZXJ0aWNlcyk7XG4gICAgZ2wuY29sb3IzZigxLDAsMSk7XG4gICAgZ2wucG9pbnRTaXplKDEwKTtcblxuXG4gICAgdmFyIHI7XG5cbiAgICB2YXIgaSA9IC0xLG47XG5cblxuXG5cblxuXG5cblxuICAgIGdsLnVzZUxpZ2h0aW5nKHRydWUpO1xuICAgIGdsLnVzZU1hdGVyaWFsKHRydWUpO1xuXG4gICAgZ2wubGlnaHQobGlnaHQwKTtcbiAgICBnbC5tYXRlcmlhbCh0aGlzLl9tYXRlcmlhbDApO1xuXG4gICAgdmFyIGxpbmVCdWZmZXIwID0gdGhpcy5fbGluZUJ1ZmZlcjAsXG4gICAgICAgIGxpbmVCdWZmZXIxID0gdGhpcy5fbGluZUJ1ZmZlcjE7XG4gICAgdmFyIGxlbiAgICAgICAgPSBsaW5lQnVmZmVyMC5nZXROdW1Qb2ludHMoKTtcblxuICAgIHZhciBpbnRycGw7XG4gICAgdmFyIHZlYyA9IEZvYW0uVmVjMy5tYWtlKCk7XG4gICAgdmFyIGludHJwbEJhc2UsXG4gICAgICAgIGludHJwbFNjYWxlZDtcblxuICAgIHZhciBzY2FsZSA9IDAuNzU7XG5cbiAgICBpID0gLTE7XG4gICAgd2hpbGUgKCsraSA8IGxlbilcbiAgICB7XG4gICAgICAgIG4gPSBpIC8gKGxlbiAtIDEpO1xuXG4gICAgICAgIHNjYWxlID0gMC43NTtcbiAgICAgICAgaW50cnBsQmFzZSAgID0gKDAuNSArIEZvYW0uTWF0aC5zYXcodGltZSAqIDAuMTUpICogMC41KTtcbiAgICAgICAgaW50cnBsU2NhbGVkID0gaW50cnBsQmFzZSAqICgxICsgc2NhbGUpIC0gc2NhbGU7XG4gICAgICAgIGludHJwbCA9IE1hdGgubWF4KDAsIE1hdGgubWluKG4gKiBzY2FsZSArIGludHJwbFNjYWxlZCwgMSkpO1xuICAgICAgICBsaW5lQnVmZmVyMC5zZXRQb2ludChpLCBzcGxpbmUuZ2V0VmVjM09uU3BsaW5lKGludHJwbCwgdmVjKSk7XG5cblxuXG4gICAgfVxuXG4gICAgbGluZUJ1ZmZlcjAudXBkYXRlKCk7XG4gICAgbGluZUJ1ZmZlcjAudXBkYXRlVmVydGV4Tm9ybWFscygpO1xuXG4gICAgZ2wuZHJhd0dlb21ldHJ5KGxpbmVCdWZmZXIwKTtcbiAgICAvL2dsLmRyYXdHZW9tZXRyeShsaW5lQnVmZmVyMSk7XG5cbiAgICBnbC51c2VNYXRlcmlhbChmYWxzZSk7XG4gICAgZ2wudXNlTGlnaHRpbmcoZmFsc2UpO1xuXG4gICAgZ2wuZHJhd01vZGUoZ2wuUE9JTlRTKTtcbiAgICBnbC5jb2xvcjNmKDEsMCwxKTtcbiAgICBnbC5wb2ludFNpemUoMik7XG4gICAgZ2wucG9pbnRzKGxpbmVCdWZmZXIwLnZlcnRpY2VzKTtcblxuICAgIGdsLmRyYXdNb2RlKGdsLkxJTkVTKTtcbiAgICAvLyBnbC5saW5ldihsaW5lQnVmZmVyLnZlcnRpY2VzKTtcbiAgICBnbC5kcmF3R2VvbWV0cnkobGluZUJ1ZmZlcjApO1xufTtcblxuQXBwLnByb3RvdHlwZS5kcmF3U3lzdGVtID0gIGZ1bmN0aW9uKClcbntcbiAgICB2YXIga2dsID0gdGhpcy5rZ2w7XG5cbiAgICBrZ2wuY29sb3IxZigwLjEwKTtcbiAgICBGb2FtLmZHTFV0aWwuZHJhd0dyaWRDdWJlKGtnbCw3MCwxKTtcblxuICAgIGtnbC5jb2xvcjFmKDAuMDc1KTtcbiAgICBrZ2wucHVzaE1hdHJpeCgpO1xuICAgIHtcbiAgICAgICAga2dsLnRyYW5zbGF0ZTNmKDAsLTAuMDEsMCk7XG4gICAgICAgIEZvYW0uZkdMVXRpbC5kcmF3R3JpZChrZ2wsNzAsMSk7XG4gICAgfVxuICAgIGtnbC5wb3BNYXRyaXgoKTtcbn07XG5cbnZhciBhcHAgPSBuZXcgQXBwKCk7XG4iLCJ2YXIgRGVmYXVsdCA9IHJlcXVpcmUoJy4uL3N5c3RlbS9mRGVmYXVsdCcpLFxuICAgIGdsa0Vycm9yICA9IHJlcXVpcmUoJy4uL3N5c3RlbS9mRXJyb3InKTtcblxuZnVuY3Rpb24gQXBwSW1wbCgpXG57XG4gICAgdGhpcy5fY29udGV4dDNkID0gbnVsbDtcbiAgICB0aGlzLl9jb250ZXh0MmQgPSBudWxsO1xuXG4gICAgdGhpcy5fd2luZG93VGl0bGUgICAgICAgPSAwO1xuICAgIHRoaXMuX2lzRnVsbFdpbmRvd0ZyYW1lID0gZmFsc2U7XG4gICAgdGhpcy5faXNGdWxsc2NyZWVuICAgICAgPSBmYWxzZTtcbiAgICB0aGlzLl9pc0JvcmRlcmxlc3MgICAgICA9IGZhbHNlO1xuICAgIHRoaXMuX2Rpc3BsYXlJZCAgICAgICAgID0gMDtcblxuICAgIHRoaXMuX2tleURvd24gICA9IGZhbHNlO1xuICAgIHRoaXMuX2tleVN0ciAgICA9ICcnO1xuICAgIHRoaXMuX2tleUNvZGUgICA9ICcnO1xuXG4gICAgdGhpcy5fbW91c2VEb3duICAgICAgID0gZmFsc2U7XG4gICAgdGhpcy5fbW91c2VNb3ZlICAgICAgID0gZmFsc2U7XG4gICAgdGhpcy5fbW91c2VXaGVlbERlbHRhID0gMC4wO1xuXG4gICAgdGhpcy5fbW91c2VNb3ZlICAgPSBmYWxzZTtcbiAgICB0aGlzLl9tb3VzZUJvdW5kcyA9IHRydWU7XG5cbiAgICB0aGlzLl90YXJnZXRGUFMgICAgID0gRGVmYXVsdC5BUFBfRlBTO1xuICAgIHRoaXMuX2JVcGRhdGUgICAgICAgPSB0cnVlO1xuXG4gICAgdGhpcy5fZnJhbWVzICAgICAgICA9IDA7XG4gICAgdGhpcy5fZnJhbWV0aW1lICAgICA9IDA7XG4gICAgdGhpcy5fZnJhbWVudW0gICAgICA9IDA7XG4gICAgdGhpcy5fdGltZSAgICAgICAgICA9IDA7XG4gICAgdGhpcy5fdGltZVN0YXJ0ICAgICA9IC0xO1xuICAgIHRoaXMuX3RpbWVOZXh0ICAgICAgPSAwO1xuICAgIHRoaXMuX3RpbWVJbnRlcnZhbCAgPSB0aGlzLl90YXJnZXRGUFMgLyAxMDAwLjA7XG4gICAgdGhpcy5fdGltZURlbHRhICAgICA9IDA7XG5cbiAgICB0aGlzLl93aWR0aCAgPSAtMTtcbiAgICB0aGlzLl9oZWlnaHQgPSAtMTtcbiAgICB0aGlzLl9yYXRpbyAgPSAtMTtcblxuICAgIHRoaXMuX2lzSW5pdGlhbGl6ZWQgPSBmYWxzZTtcbn1cblxuQXBwSW1wbC5wcm90b3R5cGUuaXNJbml0aWFsaXplZCA9IGZ1bmN0aW9uKCkgICAge3JldHVybiB0aGlzLl9pc0luaXRpYWxpemVkO307XG5cbkFwcEltcGwucHJvdG90eXBlLnNldFVwZGF0ZSAgICAgPSBmdW5jdGlvbihib29sKXt0aGlzLl9iVXBkYXRlID0gYm9vbDt9O1xuXG5BcHBJbXBsLnByb3RvdHlwZS5pbml0ICAgID0gZnVuY3Rpb24oYXBwT2JqKSAgICAgIHt0aHJvdyBuZXcgRXJyb3IoZ2xrRXJyb3IuTUVUSE9EX05PVF9JTVBMRU1FTlRFRCk7fTtcbkFwcEltcGwucHJvdG90eXBlLnNldFNpemUgPSBmdW5jdGlvbih3aWR0aCxoZWlnaHQpe3Rocm93IG5ldyBFcnJvcihnbGtFcnJvci5NRVRIT0RfTk9UX0lNUExFTUVOVEVEKTt9O1xuXG5BcHBJbXBsLnByb3RvdHlwZS5zZXRGdWxsV2luZG93RnJhbWUgPSBmdW5jdGlvbihib29sKXt0aHJvdyBuZXcgRXJyb3IoZ2xrRXJyb3IuTUVUSE9EX05PVF9JTVBMRU1FTlRFRCk7fTtcbkFwcEltcGwucHJvdG90eXBlLmlzRnVsbFdpbmRvd0ZyYW1lICA9IGZ1bmN0aW9uKCkgICAge3JldHVybiB0aGlzLl9pc0Z1bGxXaW5kb3dGcmFtZTt9O1xuXG5BcHBJbXBsLnByb3RvdHlwZS5zZXRGdWxsc2NyZWVuID0gZnVuY3Rpb24oYm9vbCl7cmV0dXJuIGZhbHNlO307XG5BcHBJbXBsLnByb3RvdHlwZS5pc0Z1bGxzY3JlZW4gID0gZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5faXNGdWxsc2NyZWVuO307XG5cbkFwcEltcGwucHJvdG90eXBlLnNldEJvcmRlcmxlc3MgPSBmdW5jdGlvbihib29sKXtyZXR1cm4gZmFsc2U7fTtcbkFwcEltcGwucHJvdG90eXBlLmlzQm9yZGVybGVzcyAgPSBmdW5jdGlvbigpe3JldHVybiB0aGlzLl9pc0JvcmRlcmxlc3M7fVxuXG5BcHBJbXBsLnByb3RvdHlwZS5zZXREaXNwbGF5ID0gZnVuY3Rpb24obnVtKXtyZXR1cm4gZmFsc2U7fTtcbkFwcEltcGwucHJvdG90eXBlLmdldERpc3BsYXkgPSBmdW5jdGlvbigpe3JldHVybiB0aGlzLl9kaXNwbGF5SWQ7fVxuXG5cbkFwcEltcGwucHJvdG90eXBlLmdldFdpZHRoICA9IGZ1bmN0aW9uKCkgICAgICAgICAgICB7cmV0dXJuIHRoaXMuX3dpZHRoO307XG5BcHBJbXBsLnByb3RvdHlwZS5nZXRIZWlnaHQgPSBmdW5jdGlvbigpICAgICAgICAgICAge3JldHVybiB0aGlzLl9oZWlnaHQ7fTtcbkFwcEltcGwucHJvdG90eXBlLmdldEFzcGVjdFJhdGlvV2luZG93ID0gZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fcmF0aW87fTtcblxuQXBwSW1wbC5wcm90b3R5cGUuc2V0VGFyZ2V0RlBTID0gZnVuY3Rpb24oZnBzKXt0aGlzLl90YXJnZXRGUFMgPSBmcHM7dGhpcy5fdGltZUludGVydmFsICA9IHRoaXMuX3RhcmdldEZQUyAvIDEwMDAuMDt9O1xuQXBwSW1wbC5wcm90b3R5cGUuZ2V0VGFyZ2V0RlBTID0gZnVuY3Rpb24oKSAgIHtyZXR1cm4gdGhpcy5fdGFyZ2V0RlBTO307XG5cbkFwcEltcGwucHJvdG90eXBlLnNldFdpbmRvd1RpdGxlICAgICAgID0gZnVuY3Rpb24odGl0bGUpe3RoaXMuX3dpbmRvd1RpdGxlID0gdGl0bGU7fTtcbkFwcEltcGwucHJvdG90eXBlLnJlc3RyaWN0TW91c2VUb0ZyYW1lID0gZnVuY3Rpb24oYm9vbCkge3RoaXMuX21vdXNlQm91bmRzID0gYm9vbDt9O1xuXG5BcHBJbXBsLnByb3RvdHlwZS5nZXRGcmFtZXNFbGFwc2VkICA9IGZ1bmN0aW9uKCl7dGhyb3cgbmV3IEVycm9yKGdsa0Vycm9yLk1FVEhPRF9OT1RfSU1QTEVNRU5URUQpO307XG5BcHBJbXBsLnByb3RvdHlwZS5nZXRTZWNvbmRzRWxhcHNlZCA9IGZ1bmN0aW9uKCl7dGhyb3cgbmV3IEVycm9yKGdsa0Vycm9yLk1FVEhPRF9OT1RfSU1QTEVNRU5URUQpO307XG5BcHBJbXBsLnByb3RvdHlwZS5nZXRUaW1lICAgICAgICAgICA9IGZ1bmN0aW9uKCl7dGhyb3cgbmV3IEVycm9yKGdsa0Vycm9yLk1FVEhPRF9OT1RfSU1QTEVNRU5URUQpO307XG5BcHBJbXBsLnByb3RvdHlwZS5nZXRUaW1lU3RhcnQgICAgICA9IGZ1bmN0aW9uKCl7dGhyb3cgbmV3IEVycm9yKGdsa0Vycm9yLk1FVEhPRF9OT1RfSU1QTEVNRU5URUQpO307XG5BcHBJbXBsLnByb3RvdHlwZS5nZXRUaW1lTmV4dCAgICAgICA9IGZ1bmN0aW9uKCl7dGhyb3cgbmV3IEVycm9yKGdsa0Vycm9yLk1FVEhPRF9OT1RfSU1QTEVNRU5URUQpO307XG5BcHBJbXBsLnByb3RvdHlwZS5nZXRUaW1lRGVsdGEgICAgICA9IGZ1bmN0aW9uKCl7dGhyb3cgbmV3IEVycm9yKGdsa0Vycm9yLk1FVEhPRF9OT1RfSU1QTEVNRU5URUQpO307XG5cbkFwcEltcGwucHJvdG90eXBlLmlzS2V5RG93biAgICAgICAgICA9IGZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX2tleURvd247fTtcbkFwcEltcGwucHJvdG90eXBlLmlzTW91c2VEb3duICAgICAgICA9IGZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX21vdXNlRG93bjt9O1xuQXBwSW1wbC5wcm90b3R5cGUuaXNNb3VzZU1vdmUgICAgICAgID0gZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fbW91c2VNb3ZlO307XG5BcHBJbXBsLnByb3RvdHlwZS5nZXRLZXlDb2RlICAgICAgICAgPSBmdW5jdGlvbigpe3JldHVybiB0aGlzLl9rZXlDb2RlO307XG5BcHBJbXBsLnByb3RvdHlwZS5nZXRLZXlTdHIgICAgICAgICAgPSBmdW5jdGlvbigpe3JldHVybiB0aGlzLl9rZXlTdHI7fTtcbkFwcEltcGwucHJvdG90eXBlLmdldE1vdXNlV2hlZWxEZWx0YSA9IGZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX21vdXNlV2hlZWxEZWx0YTt9O1xuXG5cbkFwcEltcGwucHJvdG90eXBlLnNldE1vdXNlTGlzdGVuZXJUYXJnZXQgPSBmdW5jdGlvbihvYmope3JldHVybiBmYWxzZTt9O1xuQXBwSW1wbC5wcm90b3R5cGUuc2V0S2V5TGlzdGVuZXJUYXJnZXQgICA9IGZ1bmN0aW9uKG9iail7cmV0dXJuIGZhbHNlO307XG5BcHBJbXBsLnByb3RvdHlwZS5nZXRQYXJlbnQgICAgICAgICAgICAgID0gZnVuY3Rpb24oKSAgIHtyZXR1cm4gZmFsc2U7fTtcbkFwcEltcGwucHJvdG90eXBlLnNldFBhcmVudCAgICAgICAgICAgICAgPSBmdW5jdGlvbihvYmope3JldHVybiBmYWxzZTt9O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFwcEltcGw7IiwidmFyIERlZmF1bHQgICAgID0gcmVxdWlyZSgnLi4vc3lzdGVtL2ZEZWZhdWx0JyksXG4gICAga0Vycm9yICAgICAgPSByZXF1aXJlKCcuLi9zeXN0ZW0vZkVycm9yJyksXG4gICAga0dMICAgICAgICAgPSByZXF1aXJlKCcuLi9ncmFwaGljcy9mR0wnKSxcbiAgICBBcHBJbXBsICAgICA9IHJlcXVpcmUoJy4vZkFwcEltcGwnKSxcbiAgICBDYW1lcmFCYXNpYyA9IHJlcXVpcmUoJy4uL2dyYXBoaWNzL2ZDYW1lcmFCYXNpYycpLFxuICAgIHBsYXNrICAgICAgID0gcmVxdWlyZSgncGxhc2snKTtcblxuZnVuY3Rpb24gQXBwSW1wbFBsYXNrKClcbntcbiAgICBBcHBJbXBsLmFwcGx5KHRoaXMsYXJndW1lbnRzKTtcbn1cblxuQXBwSW1wbFBsYXNrLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQXBwSW1wbC5wcm90b3R5cGUpO1xuXG5BcHBJbXBsUGxhc2sucHJvdG90eXBlLnNldFNpemUgPSBmdW5jdGlvbih3aWR0aCxoZWlnaHQpXG57XG4gICAgaWYodGhpcy5faXNJbml0aWFsaXplZCl0aHJvdyBuZXcgRXJyb3Ioa0Vycm9yLlBMQVNLX1dJTkRPV19TSVpFX1NFVCk7XG5cbiAgICB0aGlzLl93aWR0aCAgPSB3aWR0aDtcbiAgICB0aGlzLl9oZWlnaHQgPSBoZWlnaHQ7XG4gICAgdGhpcy5fcmF0aW8gID0gd2lkdGggLyBoZWlnaHQ7XG59O1xuXG4vL1RPRE86IEZpeCB0aW1lIGRlbHRhLCBkb3VibGUgbWVhc3VyaW5nIG9mIHRpbWUgaW4gZ2VuZXJhbFxuXG5BcHBJbXBsUGxhc2sucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbihhcHBPYmopXG57XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBtb3VzZTtcbiAgICB2YXIgcHJldlRpbWUgPSAwLFxuICAgICAgICB0aW1lRGVsdGEsXG4gICAgICAgIHRpbWU7XG5cblxuICAgIGZ1bmN0aW9uIHVwZGF0ZU1vdXNlKHgseSlcbiAgICB7XG4gICAgICAgIGFwcE9iai5tb3VzZS5fcG9zaXRpb25MYXN0WzBdID0gYXBwT2JqLm1vdXNlLl9wb3NpdGlvblswXTtcbiAgICAgICAgYXBwT2JqLm1vdXNlLl9wb3NpdGlvbkxhc3RbMV0gPSBhcHBPYmoubW91c2UuX3Bvc2l0aW9uWzFdO1xuXG4gICAgICAgIGlmKHNlbGYuX21vdXNlQm91bmRzKVxuICAgICAgICB7XG4gICAgICAgICAgICBhcHBPYmoubW91c2UuX3Bvc2l0aW9uWzBdID0gTWF0aC5tYXgoMCxNYXRoLm1pbih4LHNlbGYuX3dpZHRoKSk7XG4gICAgICAgICAgICBhcHBPYmoubW91c2UuX3Bvc2l0aW9uWzFdID0gTWF0aC5tYXgoMCxNYXRoLm1pbih5LHNlbGYuX2hlaWdodCkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAge1xuICAgICAgICAgICAgYXBwT2JqLm1vdXNlLl9wb3NpdGlvblswXSA9IHg7XG4gICAgICAgICAgICBhcHBPYmoubW91c2UuX3Bvc2l0aW9uWzFdID0geTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHBsYXNrLnNpbXBsZVdpbmRvdyh7XG5cbiAgICAgICAgc2V0dGluZ3M6XG4gICAgICAgIHtcbiAgICAgICAgICAgIHdpZHRoOiAgICAgICBzZWxmLl93aWR0aCAgfHwgRGVmYXVsdC5BUFBfV0lEVEgsXG4gICAgICAgICAgICBoZWlnaHQ6ICAgICAgc2VsZi5faGVpZ2h0IHx8IERlZmF1bHQuQVBQX0hFSUdIVCxcbiAgICAgICAgICAgIHR5cGU6ICAgICAgICBEZWZhdWx0LkFQUF9QTEFTS19UWVBFLFxuICAgICAgICAgICAgdnN5bmM6ICAgICAgIERlZmF1bHQuQVBQX1BMQVNLX1ZTWU5DLFxuICAgICAgICAgICAgbXVsdGlzYW1wbGU6IERlZmF1bHQuQVBQX1BMQVNLX01VTFRJU0FNUExFLFxuICAgICAgICAgICAgYm9yZGVybGVzczogIHNlbGYuX2lzQm9yZGVybGVzcyxcbiAgICAgICAgICAgIGZ1bGxzY3JlZW46ICBzZWxmLl9pc0Z1bGxzY3JlZW4sXG4gICAgICAgICAgICB0aXRsZTogICAgICAgc2VsZi5fd2luZG93VGl0bGUgfHwgRGVmYXVsdC5BUFBfUExBU0tfV0lORE9XX1RJVExFXG4gICAgICAgIH0sXG5cbiAgICAgICAgaW5pdDpmdW5jdGlvbigpXG4gICAgICAgIHtcbiAgICAgICAgICAgIGFwcE9iai5rZ2wgICAgPSBuZXcga0dMKHRoaXMuZ2wsbnVsbCk7XG4gICAgICAgICAgICBhcHBPYmouY2FtZXJhID0gbmV3IENhbWVyYUJhc2ljKCk7XG4gICAgICAgICAgICBhcHBPYmoua2dsLnNldENhbWVyYShhcHBPYmouY2FtZXJhKTtcbiAgICAgICAgICAgIGFwcE9iai5jYW1lcmEuc2V0UGVyc3BlY3RpdmUoRGVmYXVsdC5DQU1FUkFfRk9WLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLl9yYXRpbyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgRGVmYXVsdC5DQU1FUkFfTkVBUixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgRGVmYXVsdC5DQU1FUkFfRkFSKTtcblxuICAgICAgICAgICAgYXBwT2JqLmNhbWVyYS5zZXRUYXJnZXQzZigwLDAsMCk7XG4gICAgICAgICAgICBhcHBPYmouY2FtZXJhLnVwZGF0ZU1hdHJpY2VzKCk7XG5cbiAgICAgICAgICAgIGlmKHNlbGYuX2JVcGRhdGUpdGhpcy5mcmFtZXJhdGUoc2VsZi5fdGFyZ2V0RlBTKTtcbiAgICAgICAgICAgIGFwcE9iai5zZXR1cCgpO1xuXG4gICAgICAgICAgICBzZWxmLl90aW1lU3RhcnQgPSBEYXRlLm5vdygpO1xuICAgICAgICAgICAgc2VsZi5fdGltZU5leHQgID0gRGF0ZS5ub3coKTtcblxuICAgICAgICAgICAgdGhpcy5vbignbW91c2VNb3ZlZCcsXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24oZSlcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZU1vdXNlKGUueCwgZS55KTtcbiAgICAgICAgICAgICAgICAgICAgYXBwT2JqLm9uTW91c2VNb3ZlKGUpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLm9uKCdsZWZ0TW91c2VEcmFnZ2VkJyxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbihlKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlTW91c2UoZS54LCBlLnkpO1xuICAgICAgICAgICAgICAgICAgICBhcHBPYmoub25Nb3VzZU1vdmUoZSk7XG5cbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5vbignbGVmdE1vdXNlRG93bicsXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24oZSlcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX21vdXNlRG93biA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGFwcE9iai5vbk1vdXNlRG93bihlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICB0aGlzLm9uKCdsZWZ0TW91c2VVcCcsXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24oZSlcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX21vdXNlRG93biA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBhcHBPYmoub25Nb3VzZVVwKGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIHRoaXMub24oJ3Njcm9sbFdoZWVsJyxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbihlKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fbW91c2VXaGVlbERlbHRhICs9IE1hdGgubWF4KC0xLE1hdGgubWluKDEsZS5keSkpICogLTE7XG4gICAgICAgICAgICAgICAgICAgIGFwcE9iai5vbk1vdXNlV2hlZWwoZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgdGhpcy5vbigna2V5VXAnLFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uKGUpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLl9rZXlEb3duID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX2tleVN0ciAgPSBlLnN0cjtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fa2V5Q29kZSA9IGUua2V5Q29kZTtcbiAgICAgICAgICAgICAgICAgICAgYXBwT2JqLm9uS2V5VXAoZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgdGhpcy5vbigna2V5RG93bicsXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24oZSlcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX2tleURvd24gPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLl9rZXlTdHIgID0gZS5zdHI7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX2tleUNvZGUgPSBlLmtleUNvZGU7XG4gICAgICAgICAgICAgICAgICAgIGFwcE9iai5vbktleURvd24oZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgc2VsZi5faXNJbml0aWFsaXplZCA9IHRydWU7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZHJhdzpmdW5jdGlvbigpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHNlbGYuX2ZyYW1lbnVtICA9IHRoaXMuZnJhbWVudW07XG4gICAgICAgICAgICB0aW1lICAgICAgICAgICAgPSBzZWxmLl9mcmFtZXRpbWUgPSB0aGlzLmZyYW1ldGltZTtcblxuICAgICAgICAgICAgbW91c2UgICAgICAgICAgID0gYXBwT2JqLm1vdXNlO1xuICAgICAgICAgICAgc2VsZi5fbW91c2VNb3ZlID0gbW91c2UuX3Bvc2l0aW9uWzBdICE9IG1vdXNlLl9wb3NpdGlvbkxhc3RbMF0gfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vdXNlLl9wb3NpdGlvblsxXSAhPSBtb3VzZS5fcG9zaXRpb25MYXN0WzFdO1xuXG5cbiAgICAgICAgICAgIC8vZWggam8sIFRPRE86IGNoZWNrXG4gICAgICAgICAgICBzZWxmLl90aW1lRGVsdGEgPSBNYXRoLm1pbigodGltZSAtIHByZXZUaW1lKSoxMCwxKTtcbiAgICAgICAgICAgIGFwcE9iai51cGRhdGUoKTtcbiAgICAgICAgICAgIHByZXZUaW1lID0gdGltZTtcblxuICAgICAgICB9fSk7XG59O1xuXG5BcHBJbXBsUGxhc2sucHJvdG90eXBlLmdldFNlY29uZHNFbGFwc2VkID0gZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fZnJhbWV0aW1lO307XG5BcHBJbXBsUGxhc2sucHJvdG90eXBlLmdldEZyYW1lc0VsYXBzZWQgID0gZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fZnJhbWVudW07fTtcbkFwcEltcGxQbGFzay5wcm90b3R5cGUuZ2V0VGltZURlbHRhICAgICAgPSBmdW5jdGlvbigpe3JldHVybiB0aGlzLl90aW1lRGVsdGE7fTtcbkFwcEltcGxQbGFzay5wcm90b3R5cGUuZ2V0VGltZVN0YXJ0ICAgICAgPSBmdW5jdGlvbigpe3JldHVybiB0aGlzLl90aW1lU3RhcnQ7fTtcblxuQXBwSW1wbFBsYXNrLnByb3RvdHlwZS5zZXRGdWxsV2luZG93RnJhbWUgPSBmdW5jdGlvbihib29sKXt0aGlzLl9pc0Z1bGxXaW5kb3dGcmFtZSA9IGJvb2w7cmV0dXJuIHRydWU7fTtcbkFwcEltcGxQbGFzay5wcm90b3R5cGUuc2V0RnVsbHNjcmVlbiAgICAgID0gZnVuY3Rpb24oYm9vbCl7dGhpcy5faXNGdWxsc2NyZWVuID0gYm9vbDtyZXR1cm4gdHJ1ZTt9O1xuQXBwSW1wbFBsYXNrLnByb3RvdHlwZS5zZXRCb3JkZXJsZXNzICAgICAgPSBmdW5jdGlvbihib29sKXt0aGlzLl9pc0JvcmRlcmxlc3MgPSBib29sO3JldHVybiB0cnVlO307XG5cblxubW9kdWxlLmV4cG9ydHMgPSBBcHBJbXBsUGxhc2s7XG5cblxuXG4iLCJ2YXIgRGVmYXVsdCAgICAgPSByZXF1aXJlKCcuLi9zeXN0ZW0vZkRlZmF1bHQnKSxcbiAgICBBcHBJbXBsICAgICA9IHJlcXVpcmUoJy4vZkFwcEltcGwnKSxcbiAgICBrR0wgICAgICAgICA9IHJlcXVpcmUoJy4uL2dyYXBoaWNzL2ZHTCcpLFxuICAgIENhbWVyYUJhc2ljID0gcmVxdWlyZSgnLi4vZ3JhcGhpY3MvZkNhbWVyYUJhc2ljJyk7XG5cbmZ1bmN0aW9uIEFwcEltcGxXZWIoKVxue1xuICAgIEFwcEltcGwuYXBwbHkodGhpcyxhcmd1bWVudHMpO1xuXG4gICAgdmFyIGNhbnZhczNkID0gdGhpcy5fY2FudmFzM2QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICAgICAgY2FudmFzM2Quc2V0QXR0cmlidXRlKCd0YWJpbmRleCcsJzAnKTtcbiAgICAgICAgY2FudmFzM2QuZm9jdXMoKTtcblxuICAgIHRoaXMuX2NvbnRleHQzZCA9IGNhbnZhczNkLmdldENvbnRleHQoJ3dlYmtpdC0zZCcpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgY2FudmFzM2QuZ2V0Q29udGV4dChcIndlYmdsXCIpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgY2FudmFzM2QuZ2V0Q29udGV4dChcImV4cGVyaW1lbnRhbC13ZWJnbFwiKTtcblxuICAgIHZhciBjYW52YXMyZCA9IHRoaXMuX2NhbnZhczJkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG5cbiAgICB0aGlzLl9wYXJlbnQgICAgICAgICAgID0gbnVsbDtcbiAgICB0aGlzLl9tb3VzZUV2ZW50VGFyZ2V0ID0gY2FudmFzM2Q7XG4gICAgdGhpcy5fa2V5RXZlbnRUYXJnZXQgICA9IGNhbnZhczNkO1xuXG4gICAgdGhpcy5fY29udGV4dDJkID0gY2FudmFzMmQuZ2V0Q29udGV4dCgnMmQnKTtcblxuICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93Lm1velJlcXVlc3RBbmltYXRpb25GcmFtZTtcblxufVxuXG5BcHBJbXBsV2ViLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQXBwSW1wbC5wcm90b3R5cGUpO1xuXG5BcHBJbXBsV2ViLnByb3RvdHlwZS5nZXRQYXJlbnQgPSBmdW5jdGlvbigpICAge3JldHVybiB0aGlzLl9jb250ZXh0M2QucGFyZW50Tm9kZTt9O1xuQXBwSW1wbFdlYi5wcm90b3R5cGUuc2V0UGFyZW50ID0gZnVuY3Rpb24ob2JqKXt0aGlzLl9wYXJlbnQgPSBvYmo7fTtcblxuXG5BcHBJbXBsV2ViLnByb3RvdHlwZS5zZXRTaXplID0gZnVuY3Rpb24od2lkdGgsaGVpZ2h0KVxue1xuICAgIGlmKHRoaXMuX2lzRnVsbFdpbmRvd0ZyYW1lKXt3aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoOyBoZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7fVxuICAgIGlmKHdpZHRoID09IHRoaXMuX3dpZHRoICYmIGhlaWdodCA9PSB0aGlzLl9oZWlnaHQpcmV0dXJuO1xuXG4gICAgdGhpcy5fd2lkdGggID0gd2lkdGg7XG4gICAgdGhpcy5faGVpZ2h0ID0gaGVpZ2h0O1xuICAgIHRoaXMuX3JhdGlvICA9IHdpZHRoIC8gaGVpZ2h0O1xuXG4gICAgaWYoIXRoaXMuX2lzSW5pdGlhbGl6ZWQpIHJldHVybjtcblxuICAgIHRoaXMuX3VwZGF0ZUNhbnZhczNkU2l6ZSgpO1xufTtcblxuQXBwSW1wbFdlYi5wcm90b3R5cGUuX2luaXQgPSBmdW5jdGlvbihhcHBPYmopXG57XG4gICAgdmFyIHNlbGYgICA9IHRoaXM7XG4gICAgdmFyIG1vdXNlICA9IGFwcE9iai5tb3VzZTtcbiAgICB2YXIgY2FudmFzID0gdGhpcy5fY2FudmFzM2Q7XG5cbiAgICBkb2N1bWVudC50aXRsZSA9IHRoaXMuX3dpbmRvd1RpdGxlIHx8IGRvY3VtZW50LnRpdGxlO1xuXG4gICAgaWYoIXRoaXMuX3BhcmVudClkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGNhbnZhcyk7XG4gICAgZWxzZSB0aGlzLl9wYXJlbnQuYXBwZW5kQ2hpbGQoY2FudmFzKTtcblxuICAgIHRoaXMuX3VwZGF0ZUNhbnZhczNkU2l6ZSgpO1xuXG4gICAgdmFyIG1vdXNlRXZlbnRUYXJnZXQgPSB0aGlzLl9tb3VzZUV2ZW50VGFyZ2V0LFxuICAgICAgICBrZXlFdmVudFRhcmdldCAgID0gdGhpcy5fa2V5RXZlbnRUYXJnZXQ7XG5cblxuICAgIGFwcE9iai5rZ2wgPSBuZXcga0dMKHRoaXMuX2NvbnRleHQzZCx0aGlzLl9jb250ZXh0MmQpO1xuICAgIGFwcE9iai5rZ2wuZ2wudmlld3BvcnQoMCwwLHRoaXMuX3dpZHRoLHRoaXMuX2hlaWdodCk7XG5cbiAgICBhcHBPYmouY2FtZXJhID0gbmV3IENhbWVyYUJhc2ljKCk7XG4gICAgYXBwT2JqLmtnbC5zZXRDYW1lcmEoYXBwT2JqLmNhbWVyYSk7XG4gICAgYXBwT2JqLmNhbWVyYS5zZXRQZXJzcGVjdGl2ZShEZWZhdWx0LkNBTUVSQV9GT1YsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLl9yYXRpbyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIERlZmF1bHQuQ0FNRVJBX05FQVIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBEZWZhdWx0LkNBTUVSQV9GQVIpO1xuICAgIGFwcE9iai5jYW1lcmEuc2V0VGFyZ2V0M2YoMCwwLDApO1xuICAgIGFwcE9iai5jYW1lcmEudXBkYXRlTWF0cmljZXMoKTtcblxuICAgIGFwcE9iai5zZXR1cCgpO1xuXG4gICAgbW91c2VFdmVudFRhcmdldC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLFxuICAgICAgICBmdW5jdGlvbihlKVxuICAgICAgICB7XG4gICAgICAgICAgICBtb3VzZS5fcG9zaXRpb25MYXN0WzBdID0gbW91c2UuX3Bvc2l0aW9uWzBdO1xuICAgICAgICAgICAgbW91c2UuX3Bvc2l0aW9uTGFzdFsxXSA9IG1vdXNlLl9wb3NpdGlvblsxXTtcblxuICAgICAgICAgICAgbW91c2UuX3Bvc2l0aW9uWzBdID0gZS5wYWdlWDtcbiAgICAgICAgICAgIG1vdXNlLl9wb3NpdGlvblsxXSA9IGUucGFnZVk7XG5cbiAgICAgICAgICAgIGFwcE9iai5vbk1vdXNlTW92ZShlKTtcblxuICAgICAgICB9KTtcblxuICAgIG1vdXNlRXZlbnRUYXJnZXQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJyxcbiAgICAgICAgZnVuY3Rpb24oZSlcbiAgICAgICAge1xuICAgICAgICAgICAgc2VsZi5fbW91c2VEb3duID0gdHJ1ZTtcbiAgICAgICAgICAgIGFwcE9iai5vbk1vdXNlRG93bihlKTtcblxuICAgICAgICB9KTtcblxuICAgIG1vdXNlRXZlbnRUYXJnZXQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsXG4gICAgICAgIGZ1bmN0aW9uKGUpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHNlbGYuX21vdXNlRG93biA9IGZhbHNlO1xuICAgICAgICAgICAgYXBwT2JqLm9uTW91c2VVcChlKTtcblxuICAgICAgICB9KTtcblxuICAgIG1vdXNlRXZlbnRUYXJnZXQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V3aGVlbCcsXG4gICAgICAgIGZ1bmN0aW9uKGUpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHNlbGYuX21vdXNlV2hlZWxEZWx0YSArPSBNYXRoLm1heCgtMSxNYXRoLm1pbigxLCBlLndoZWVsRGVsdGEpKSAqIC0xO1xuICAgICAgICAgICAgYXBwT2JqLm9uTW91c2VXaGVlbChlKTtcbiAgICAgICAgfSk7XG5cblxuICAgIGtleUV2ZW50VGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLFxuICAgICAgICBmdW5jdGlvbihlKVxuICAgICAgICB7XG4gICAgICAgICAgICBzZWxmLl9rZXlEb3duID0gdHJ1ZTtcbiAgICAgICAgICAgIHNlbGYuX2tleUNvZGUgPSBlLmtleUNvZGU7XG4gICAgICAgICAgICBzZWxmLl9rZXlTdHIgID0gU3RyaW5nLmZyb21DaGFyQ29kZShlLmtleUNvZGUpOy8vbm90IHJlbGlhYmxlO1xuICAgICAgICAgICAgYXBwT2JqLm9uS2V5RG93bihlKTtcblxuICAgICAgICB9KTtcblxuICAgIGtleUV2ZW50VGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJyxcbiAgICAgICAgZnVuY3Rpb24oZSlcbiAgICAgICAge1xuICAgICAgICAgICAgc2VsZi5fa2V5RG93biA9IGZhbHNlO1xuICAgICAgICAgICAgc2VsZi5fa2V5Q29kZSA9IGUua2V5Q29kZTtcbiAgICAgICAgICAgIHNlbGYuX2tleVN0ciAgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGUua2V5Q29kZSk7XG4gICAgICAgICAgICBhcHBPYmoub25LZXlVcChlKTtcblxuICAgICAgICB9KTtcblxuXG4gICAgdmFyIGZ1bGxXaW5kb3dGcmFtZSA9IHRoaXMuX2lzRnVsbFdpbmRvd0ZyYW1lO1xuICAgIHZhciBjYW1lcmE7XG4gICAgdmFyIGdsO1xuXG4gICAgdmFyIHdpbmRvd1dpZHRoLFxuICAgICAgICB3aW5kb3dIZWlnaHQ7XG5cbiAgICBmdW5jdGlvbiB1cGRhdGVDYW1lcmFSYXRpbygpXG4gICAge1xuICAgICAgICBjYW1lcmEgPSBhcHBPYmouY2FtZXJhO1xuICAgICAgICBjYW1lcmEuc2V0QXNwZWN0UmF0aW8oc2VsZi5fcmF0aW8pO1xuICAgICAgICBjYW1lcmEudXBkYXRlUHJvamVjdGlvbk1hdHJpeCgpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHVwZGF0ZVZpZXdwb3J0R0woKVxuICAgIHtcbiAgICAgICAgZ2wgPSBhcHBPYmoua2dsO1xuICAgICAgICBnbC5nbC52aWV3cG9ydCgwLDAsc2VsZi5fd2lkdGgsc2VsZi5faGVpZ2h0KTtcbiAgICAgICAgZ2wuY2xlYXJDb2xvcihnbC5nZXRDbGVhckJ1ZmZlcigpKTtcbiAgICB9XG5cblxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLFxuICAgICAgICBmdW5jdGlvbihlKVxuICAgICAgICB7XG4gICAgICAgICAgICB3aW5kb3dXaWR0aCAgPSB3aW5kb3cuaW5uZXJXaWR0aDtcbiAgICAgICAgICAgIHdpbmRvd0hlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcblxuICAgICAgICAgICAgaWYoZnVsbFdpbmRvd0ZyYW1lKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHNlbGYuc2V0U2l6ZSh3aW5kb3dXaWR0aCx3aW5kb3dIZWlnaHQpO1xuXG4gICAgICAgICAgICAgICAgdXBkYXRlQ2FtZXJhUmF0aW8oKTtcbiAgICAgICAgICAgICAgICB1cGRhdGVWaWV3cG9ydEdMKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGFwcE9iai5vbldpbmRvd1Jlc2l6ZShlKTtcblxuICAgICAgICAgICAgaWYoIWZ1bGxXaW5kb3dGcmFtZSAmJiAoc2VsZi5fd2lkdGggPT0gd2luZG93V2lkdGggJiYgc2VsZi5faGVpZ2h0ID09IHdpbmRvd0hlaWdodCkpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdXBkYXRlQ2FtZXJhUmF0aW8oKTtcbiAgICAgICAgICAgICAgICB1cGRhdGVWaWV3cG9ydEdMKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgaWYodGhpcy5fYlVwZGF0ZSlcbiAgICB7XG4gICAgICAgIHZhciB0aW1lLCB0aW1lRGVsdGE7XG4gICAgICAgIHZhciB0aW1lSW50ZXJ2YWwgPSB0aGlzLl90aW1lSW50ZXJ2YWw7XG4gICAgICAgIHZhciB0aW1lTmV4dDtcblxuICAgICAgICBmdW5jdGlvbiB1cGRhdGUoKVxuICAgICAgICB7XG4gICAgICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodXBkYXRlLG51bGwpO1xuXG4gICAgICAgICAgICB0aW1lICAgICAgPSBzZWxmLl90aW1lID0gRGF0ZS5ub3coKTtcbiAgICAgICAgICAgIHRpbWVEZWx0YSA9IHRpbWUgLSBzZWxmLl90aW1lTmV4dDtcblxuICAgICAgICAgICAgc2VsZi5fdGltZURlbHRhID0gTWF0aC5taW4odGltZURlbHRhIC8gdGltZUludGVydmFsLCAxKTtcblxuICAgICAgICAgICAgaWYodGltZURlbHRhID4gdGltZUludGVydmFsKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRpbWVOZXh0ID0gc2VsZi5fdGltZU5leHQgPSB0aW1lIC0gKHRpbWVEZWx0YSAlIHRpbWVJbnRlcnZhbCk7XG5cbiAgICAgICAgICAgICAgICBhcHBPYmoudXBkYXRlKCk7XG5cbiAgICAgICAgICAgICAgICBzZWxmLl90aW1lRWxhcHNlZCA9ICh0aW1lTmV4dCAtIHNlbGYuX3RpbWVTdGFydCkgLyAxMDAwLjA7XG4gICAgICAgICAgICAgICAgc2VsZi5fZnJhbWVudW0rKztcbiAgICAgICAgICAgIH1cblxuXG5cbiAgICAgICAgfVxuXG4gICAgICAgIHVwZGF0ZSgpO1xuXG4gICAgfVxuICAgIGVsc2UgYXBwT2JqLnVwZGF0ZSgpO1xuXG4gICAgdGhpcy5fcGFyZW50ID0gbnVsbDtcbiAgICB0aGlzLl9pc0luaXRpYWxpemVkID0gdHJ1ZTtcblxufTtcblxuXG5BcHBJbXBsV2ViLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oYXBwT2JqKVxue1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsZnVuY3Rpb24oKXtzZWxmLl9pbml0KGFwcE9iaik7fSk7XG59O1xuXG5BcHBJbXBsV2ViLnByb3RvdHlwZS5fdXBkYXRlQ2FudmFzM2RTaXplID0gZnVuY3Rpb24oKVxue1xuICAgIHZhciBjYW52YXMgPSB0aGlzLl9jYW52YXMzZCxcbiAgICAgICAgd2lkdGggID0gdGhpcy5fd2lkdGgsXG4gICAgICAgIGhlaWdodCA9IHRoaXMuX2hlaWdodDtcblxuICAgICAgICBjYW52YXMuc3R5bGUud2lkdGggID0gd2lkdGggICsgJ3B4JztcbiAgICAgICAgY2FudmFzLnN0eWxlLmhlaWdodCA9IGhlaWdodCArICdweCc7XG4gICAgICAgIGNhbnZhcy53aWR0aCAgICAgICAgPSB3aWR0aDtcbiAgICAgICAgY2FudmFzLmhlaWdodCAgICAgICA9IGhlaWdodDtcbn07XG5cbkFwcEltcGxXZWIucHJvdG90eXBlLmdldFNlY29uZHNFbGFwc2VkID0gZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fdGltZUVsYXBzZWQ7fTtcbkFwcEltcGxXZWIucHJvdG90eXBlLmdldFRpbWVEZWx0YSAgICAgID0gZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fdGltZURlbHRhO307XG5cbkFwcEltcGxXZWIucHJvdG90eXBlLnNldE1vdXNlTGlzdGVuZXJUYXJnZXQgPSBmdW5jdGlvbihvYmope3RoaXMuX21vdXNlRXZlbnRUYXJnZXQgPSBvYmo7fTtcbkFwcEltcGxXZWIucHJvdG90eXBlLnNldEtleUxpc3RlbmVyVGFyZ2V0ICAgPSBmdW5jdGlvbihvYmope3RoaXMuX2tleUV2ZW50VGFyZ2V0ID0gb2JqO307XG5BcHBJbXBsV2ViLnByb3RvdHlwZS5zZXRGdWxsV2luZG93RnJhbWUgICAgID0gZnVuY3Rpb24oYm9vbCl7dGhpcy5faXNGdWxsV2luZG93RnJhbWUgPSBib29sO3JldHVybiB0cnVlO307XG5cblxubW9kdWxlLmV4cG9ydHMgPSBBcHBJbXBsV2ViO1xuXG4iLCJ2YXIga0Vycm9yICAgICAgID0gcmVxdWlyZSgnLi4vc3lzdGVtL2ZFcnJvcicpLFxuICAgIFBsYXRmb3JtICAgICA9IHJlcXVpcmUoJy4uL3N5c3RlbS9mUGxhdGZvcm0nKSxcbiAgICBBcHBJbXBsV2ViICAgPSByZXF1aXJlKCcuL2ZBcHBJbXBsV2ViJyksXG4gICAgQXBwSW1wbFBsYXNrID0gcmVxdWlyZSgnLi9mQXBwSW1wbFBsYXNrJyksXG4gICAgTW91c2UgICAgICAgID0gcmVxdWlyZSgnLi4vdXRpbC9mTW91c2UnKSxcbiAgICBDYW1lcmFCYXNpYyAgPSByZXF1aXJlKCcuLi9ncmFwaGljcy9mQ2FtZXJhQmFzaWMnKTtcblxuXG5mdW5jdGlvbiBBcHBsaWNhdGlvbigpXG57XG4gICAgaWYoQXBwbGljYXRpb24uX19pbnN0YW5jZSl0aHJvdyBuZXcgRXJyb3Ioa0Vycm9yLkNMQVNTX0lTX1NJTkdMRVRPTik7XG5cbiAgICB2YXIgdGFyZ2V0ICA9IFBsYXRmb3JtLmdldFRhcmdldCgpO1xuICAgIGlmKHR5cGVvZiB0YXJnZXQgPT09ICd1bmRlZmluZWQnICl0aHJvdyBuZXcgRXJyb3Ioa0Vycm9yLldST05HX1BMQVRGT1JNKTtcblxuICAgIHRoaXMuX2FwcEltcGwgPSB0YXJnZXQgPT0gUGxhdGZvcm0uV0VCICAgPyBuZXcgQXBwSW1wbFdlYihhcmd1bWVudHMpIDpcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0ID09IFBsYXRmb3JtLlBMQVNLID8gbmV3IEFwcEltcGxQbGFzayhhcmd1bWVudHMpIDpcbiAgICAgICAgICAgICAgICAgICAgbnVsbDtcblxuICAgIHRoaXMubW91c2UgID0gbmV3IE1vdXNlKCk7XG4gICAgdGhpcy5rZ2wgICAgPSBudWxsO1xuICAgIHRoaXMuY2FtZXJhID0gbnVsbDtcblxuICAgIEFwcGxpY2F0aW9uLl9faW5zdGFuY2UgPSB0aGlzO1xufVxuXG5BcHBsaWNhdGlvbi5wcm90b3R5cGUuc2V0dXAgID0gZnVuY3Rpb24oKXt0aHJvdyBuZXcgRXJyb3Ioa0Vycm9yLkFQUF9OT19TRVRVUCk7fTtcbkFwcGxpY2F0aW9uLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbigpe3Rocm93IG5ldyBFcnJvcihrRXJyb3IuQVBQX05PX1VQREFURSk7fTtcblxuQXBwbGljYXRpb24ucHJvdG90eXBlLnNldFNpemUgPSBmdW5jdGlvbih3aWR0aCxoZWlnaHQpXG57XG4gICAgdmFyIGFwcEltcGwgPSB0aGlzLl9hcHBJbXBsO1xuICAgICAgICBhcHBJbXBsLnNldFNpemUod2lkdGgsaGVpZ2h0KTtcblxuICAgIGlmKCFhcHBJbXBsLmlzSW5pdGlhbGl6ZWQoKSlhcHBJbXBsLmluaXQodGhpcyk7XG59O1xuQXBwbGljYXRpb24ucHJvdG90eXBlLmdldFdpZHRoICA9IGZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX2FwcEltcGwuZ2V0V2lkdGgoKTt9O1xuQXBwbGljYXRpb24ucHJvdG90eXBlLmdldEhlaWdodCA9IGZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX2FwcEltcGwuZ2V0SGVpZ2h0KCk7fTtcblxuQXBwbGljYXRpb24ucHJvdG90eXBlLnNldFVwZGF0ZSA9IGZ1bmN0aW9uKGJvb2wpe3RoaXMuX2FwcEltcGwuc2V0VXBkYXRlKGJvb2wpO307XG5cblxuXG5BcHBsaWNhdGlvbi5wcm90b3R5cGUuc2V0V2luZG93VGl0bGUgICAgICAgPSBmdW5jdGlvbih0aXRsZSl7dGhpcy5fYXBwSW1wbC5zZXRXaW5kb3dUaXRsZSh0aXRsZSk7fTtcbkFwcGxpY2F0aW9uLnByb3RvdHlwZS5yZXN0cmljdE1vdXNlVG9GcmFtZSA9IGZ1bmN0aW9uKGJvb2wpIHt0aGlzLl9hcHBJbXBsLnJlc3RyaWN0TW91c2VUb0ZyYW1lKGJvb2wpO307XG5cbkFwcGxpY2F0aW9uLnByb3RvdHlwZS5zZXRGdWxsV2luZG93RnJhbWUgID0gZnVuY3Rpb24oYm9vbCl7cmV0dXJuIHRoaXMuX2FwcEltcGwuc2V0RnVsbFdpbmRvd0ZyYW1lKGJvb2wpO307XG5BcHBsaWNhdGlvbi5wcm90b3R5cGUuc2V0RnVsbHNjcmVlbiAgICAgICA9IGZ1bmN0aW9uKGJvb2wpe3JldHVybiB0aGlzLl9hcHBJbXBsLnNldEZ1bGxzY3JlZW4odHJ1ZSk7fTtcbkFwcGxpY2F0aW9uLnByb3RvdHlwZS5pc0Z1bGxzY3JlZW4gICAgICAgID0gZnVuY3Rpb24oKSAgICB7cmV0dXJuIHRoaXMuX2FwcEltcGwuaXNGdWxsc2NyZWVuKCk7fTtcbkFwcGxpY2F0aW9uLnByb3RvdHlwZS5zZXRCb3JkZXJsZXNzICAgICAgID0gZnVuY3Rpb24oYm9vbCl7cmV0dXJuIHRoaXMuX2FwcEltcGwuc2V0Qm9yZGVybGVzcyhib29sKTt9O1xuQXBwbGljYXRpb24ucHJvdG90eXBlLmlzQm9yZGVybGVzcyAgICAgICAgPSBmdW5jdGlvbigpICAgIHtyZXR1cm4gdGhpcy5fYXBwSW1wbC5pc0JvcmRlcmxlc3MoKTt9O1xuQXBwbGljYXRpb24ucHJvdG90eXBlLnNldERpc3BsYXkgICAgICAgICAgPSBmdW5jdGlvbihudW0pIHtyZXR1cm4gdGhpcy5fYXBwSW1wbC5zZXREaXNwbGF5KG51bSk7fTtcbkFwcGxpY2F0aW9uLnByb3RvdHlwZS5nZXREaXNwbGF5ICAgICAgICAgID0gZnVuY3Rpb24oKSAgICB7cmV0dXJuIHRoaXMuX2FwcEltcGwuZ2V0RGlzcGxheSgpO307XG5cbkFwcGxpY2F0aW9uLnByb3RvdHlwZS5zZXRUYXJnZXRGUFMgPSBmdW5jdGlvbihmcHMpe3RoaXMuX2FwcEltcGwuc2V0VGFyZ2V0RlBTKGZwcyk7fTtcblxuXG5BcHBsaWNhdGlvbi5wcm90b3R5cGUuaXNLZXlEb3duICAgICAgICAgID0gZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fYXBwSW1wbC5pc0tleURvd24oKTt9O1xuQXBwbGljYXRpb24ucHJvdG90eXBlLmlzTW91c2VEb3duICAgICAgICA9IGZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX2FwcEltcGwuaXNNb3VzZURvd24oKTt9O1xuQXBwbGljYXRpb24ucHJvdG90eXBlLmlzTW91c2VNb3ZlICAgICAgICA9IGZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX2FwcEltcGwuaXNNb3VzZU1vdmUoKTt9O1xuQXBwbGljYXRpb24ucHJvdG90eXBlLmdldEtleVN0ciAgICAgICAgICA9IGZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX2FwcEltcGwuZ2V0S2V5U3RyKCk7fTtcbkFwcGxpY2F0aW9uLnByb3RvdHlwZS5nZXRLZXlDb2RlICAgICAgICAgPSBmdW5jdGlvbigpe3JldHVybiB0aGlzLl9hcHBJbXBsLmdldEtleUNvZGUoKTt9O1xuQXBwbGljYXRpb24ucHJvdG90eXBlLmdldE1vdXNlV2hlZWxEZWx0YSA9IGZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX2FwcEltcGwuZ2V0TW91c2VXaGVlbERlbHRhKCk7fTtcblxuXG5BcHBsaWNhdGlvbi5wcm90b3R5cGUub25LZXlEb3duICAgID0gZnVuY3Rpb24oZSl7fTtcbkFwcGxpY2F0aW9uLnByb3RvdHlwZS5vbktleVVwICAgICAgPSBmdW5jdGlvbihlKXt9O1xuQXBwbGljYXRpb24ucHJvdG90eXBlLm9uTW91c2VVcCAgICA9IGZ1bmN0aW9uKGUpe307XG5BcHBsaWNhdGlvbi5wcm90b3R5cGUub25Nb3VzZURvd24gID0gZnVuY3Rpb24oZSl7fTtcbkFwcGxpY2F0aW9uLnByb3RvdHlwZS5vbk1vdXNlV2hlZWwgPSBmdW5jdGlvbihlKXt9O1xuQXBwbGljYXRpb24ucHJvdG90eXBlLm9uTW91c2VNb3ZlICA9IGZ1bmN0aW9uKGUpe307XG5cbkFwcGxpY2F0aW9uLnByb3RvdHlwZS5vbldpbmRvd1Jlc2l6ZSA9IGZ1bmN0aW9uKGUpe307XG5cbkFwcGxpY2F0aW9uLnByb3RvdHlwZS5nZXRGcmFtZXNFbGFwc2VkICA9IGZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX2FwcEltcGwuZ2V0RnJhbWVzRWxhcHNlZCgpO307XG5BcHBsaWNhdGlvbi5wcm90b3R5cGUuZ2V0U2Vjb25kc0VsYXBzZWQgPSBmdW5jdGlvbigpe3JldHVybiB0aGlzLl9hcHBJbXBsLmdldFNlY29uZHNFbGFwc2VkKCk7fTtcbkFwcGxpY2F0aW9uLnByb3RvdHlwZS5nZXRUaW1lICAgICAgICAgICA9IGZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX2FwcEltcGwuZ2V0VGltZSgpO307XG5BcHBsaWNhdGlvbi5wcm90b3R5cGUuZ2V0VGltZVN0YXJ0ICAgICAgPSBmdW5jdGlvbigpe3JldHVybiB0aGlzLl9hcHBJbXBsLmdldFRpbWVTdGFydCgpO307XG5BcHBsaWNhdGlvbi5wcm90b3R5cGUuZ2V0VGltZU5leHQgICAgICAgPSBmdW5jdGlvbigpe3JldHVybiB0aGlzLl9hcHBJbXBsLmdldFRpbWVOZXh0KCk7fTtcbkFwcGxpY2F0aW9uLnByb3RvdHlwZS5nZXRUaW1lRGVsdGEgICAgICA9IGZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX2FwcEltcGwuZ2V0VGltZURlbHRhKCk7fTtcblxuQXBwbGljYXRpb24ucHJvdG90eXBlLmdldEFzcGVjdFJhdGlvV2luZG93ID0gZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fYXBwSW1wbC5nZXRBc3BlY3RSYXRpbygpO307XG5cbkFwcGxpY2F0aW9uLl9faW5zdGFuY2UgPSBudWxsO1xuQXBwbGljYXRpb24uZ2V0SW5zdGFuY2UgPSBmdW5jdGlvbigpe3JldHVybiBBcHBsaWNhdGlvbi5fX2luc3RhbmNlO307XG5cbm1vZHVsZS5leHBvcnRzID0gQXBwbGljYXRpb247XG5cblxuXG5cblxuIiwiLyoqXG4gKlxuICogZ2xLaXQuanMgLSBBIFdlYkdMIHRvb2xib3hcbiAqXG4gKiBnbEtpdC5qcyBpcyBhdmFpbGFibGUgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBNSVQgbGljZW5zZS4gIFRoZSBmdWxsIHRleHQgb2YgdGhlXG4gKiBNSVQgbGljZW5zZSBpcyBpbmNsdWRlZCBiZWxvdy5cbiAqXG4gKiBNSVQgTGljZW5zZVxuICogPT09PT09PT09PT1cbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTIgSGVucnlrIFdvbGxpay4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4gKiBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4gKiBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4gKiB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4gKiBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbiAqIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4gKlxuICogVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW4gYWxsXG4gKiBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuICpcbiAqIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbiAqIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuICogRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4gKiBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4gKiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuICogT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEVcbiAqIFNPRlRXQVJFLlxuICpcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9XG57XG4gICAgTWF0aCAgICAgICAgOiByZXF1aXJlKCcuL21hdGgvZk1hdGgnKSxcbiAgICBWZWMyICAgICAgICA6IHJlcXVpcmUoJy4vbWF0aC9mVmVjMicpLFxuICAgIFZlYzMgICAgICAgIDogcmVxdWlyZSgnLi9tYXRoL2ZWZWMzJyksXG4gICAgVmVjNCAgICAgICAgOiByZXF1aXJlKCcuL21hdGgvZlZlYzQnKSxcbiAgICBNYXQzMyAgICAgICA6IHJlcXVpcmUoJy4vbWF0aC9mTWF0MzMnKSxcbiAgICBNYXQ0NCAgICAgICA6IHJlcXVpcmUoJy4vbWF0aC9mTWF0NDQnKSxcbiAgICBRdWF0ZXJuaW9uICA6IHJlcXVpcmUoJy4vbWF0aC9mUXVhdGVybmlvbicpLFxuXG5cbiAgICBNYXRHTCAgICAgICAgOiByZXF1aXJlKCcuL2dyYXBoaWNzL2dsL2ZNYXRHTCcpLFxuICAgIFByb2dMb2FkZXIgICA6IHJlcXVpcmUoJy4vZ3JhcGhpY3MvZ2wvc2hhZGVyL2ZQcm9nTG9hZGVyJyksXG4gICAgU2hhZGVyTG9hZGVyIDogcmVxdWlyZSgnLi9ncmFwaGljcy9nbC9zaGFkZXIvZlNoYWRlckxvYWRlcicpLFxuICAgIENhbWVyYUJhc2ljICA6IHJlcXVpcmUoJy4vZ3JhcGhpY3MvZkNhbWVyYUJhc2ljJyksXG5cbiAgICBMaWdodCAgICAgICAgICAgIDogcmVxdWlyZSgnLi9ncmFwaGljcy9nbC9mTGlnaHQnKSxcbiAgICBQb2ludExpZ2h0ICAgICAgIDogcmVxdWlyZSgnLi9ncmFwaGljcy9nbC9mUG9pbnRMaWdodCcpLFxuICAgIERpcmVjdGlvbmFsTGlnaHQgOiByZXF1aXJlKCcuL2dyYXBoaWNzL2dsL2ZEaXJlY3Rpb25hbExpZ2h0JyksXG4gICAgU3BvdExpZ2h0ICAgICAgICA6IHJlcXVpcmUoJy4vZ3JhcGhpY3MvZ2wvZlNwb3RMaWdodCcpLFxuXG4gICAgTWF0ZXJpYWwgICAgOiByZXF1aXJlKCcuL2dyYXBoaWNzL2dsL2ZNYXRlcmlhbCcpLFxuICAgIFRleHR1cmUgICAgIDogcmVxdWlyZSgnLi9ncmFwaGljcy9nbC9mVGV4dHVyZScpLFxuXG4gICAgZkdMVXRpbCAgICAgOiByZXF1aXJlKCcuL2dyYXBoaWNzL3V0aWwvZkdMVXRpbCcpLFxuICAgIGZHTCAgICAgICAgIDogcmVxdWlyZSgnLi9ncmFwaGljcy9mR0wnKSxcblxuICAgIE1vdXNlICAgICAgIDogcmVxdWlyZSgnLi91dGlsL2ZNb3VzZScpLFxuICAgIENvbG9yICAgICAgIDogcmVxdWlyZSgnLi91dGlsL2ZDb2xvcicpLFxuICAgIFV0aWwgICAgICAgIDogcmVxdWlyZSgnLi91dGlsL2ZVdGlsJyksXG5cbiAgICBQbGF0Zm9ybSAgICA6IHJlcXVpcmUoJy4vc3lzdGVtL2ZQbGF0Zm9ybScpLFxuXG4gICAgR2VvbTNkICAgICAgICAgICAgOiByZXF1aXJlKCcuL2dlb20vZkdlb20zZCcpLFxuICAgIFBhcmFtZXRyaWNTdXJmYWNlIDogcmVxdWlyZSgnLi9nZW9tL2ZQYXJhbWV0cmljU3VyZmFjZScpLFxuICAgIElTT1N1cmZhY2UgICAgICAgIDogcmVxdWlyZSgnLi9nZW9tL2ZJU09TdXJmYWNlJyksXG4gICAgSVNPQmFuZCAgICAgICAgICAgOiByZXF1aXJlKCcuL2dlb20vZklTT0JhbmQnKSxcbiAgICBMaW5lQnVmZmVyMmQgICAgICA6IHJlcXVpcmUoJy4vZ2VvbS9mTGluZUJ1ZmZlcjJkJyksXG4gICAgTGluZUJ1ZmZlcjNkICAgICAgOiByZXF1aXJlKCcuL2dlb20vZkxpbmVCdWZmZXIzZCcpLFxuICAgIFNwbGluZSAgICAgICAgICAgIDogcmVxdWlyZSgnLi9nZW9tL2ZTcGxpbmUnKSxcbiAgICBMaW5lMmRVdGlsICAgICAgICA6IHJlcXVpcmUoJy4vZ2VvbS9mTGluZTJkVXRpbCcpLFxuICAgIFBvbHlnb24yZFV0aWwgICAgIDogcmVxdWlyZSgnLi9nZW9tL2ZQb2x5Z29uMmRVdGlsJyksXG5cblxuICAgIEFwcGxpY2F0aW9uIDogcmVxdWlyZSgnLi9hcHAvZkFwcGxpY2F0aW9uJylcblxufTtcblxuIiwiZnVuY3Rpb24gR2VvbTNkKClcbntcbiAgICB0aGlzLnZlcnRpY2VzICA9IG51bGw7XG4gICAgdGhpcy5ub3JtYWxzICAgPSBudWxsO1xuICAgIHRoaXMuY29sb3JzICAgID0gbnVsbDtcbiAgICB0aGlzLmluZGljZXMgICA9IG51bGw7XG4gICAgdGhpcy50ZXhDb29yZHMgPSBudWxsO1xufVxuXG4vL1RPRE8gbWVyZ2Vcbkdlb20zZC5wcm90b3R5cGUudXBkYXRlVmVydGV4Tm9ybWFscyA9IGZ1bmN0aW9uKClcbntcbiAgICB2YXIgaW5kaWNlcyAgPSB0aGlzLmluZGljZXMsXG4gICAgICAgIHZlcnRpY2VzID0gdGhpcy52ZXJ0aWNlcyxcbiAgICAgICAgbm9ybWFscyAgPSB0aGlzLm5vcm1hbHM7XG5cbiAgICB2YXIgaTtcbiAgICB2YXIgYSwgYiwgYztcbiAgICB2YXIgZTJ4LCBlMnksIGUyeixcbiAgICAgICAgZTF4LCBlMXksIGUxejtcblxuICAgIHZhciBueCwgbnksIG56LFxuICAgICAgICB2YngsIHZieSwgdmJ6LFxuICAgICAgICBhMCwgYTEsIGEyLFxuICAgICAgICBiMCwgYjEsIGIyLFxuICAgICAgICBjMCwgYzEsIGMyO1xuXG4gICAgaSA9IDA7XG4gICAgd2hpbGUoIGkgPCBub3JtYWxzLmxlbmd0aCApXG4gICAge1xuICAgICAgICBub3JtYWxzW2ldID0gbm9ybWFsc1tpKzFdID0gbm9ybWFsc1tpKzJdID0gMC4wO1xuICAgICAgICBpKz0zO1xuICAgIH1cblxuICAgIGkgPSAwO1xuICAgIHdoaWxlKCBpIDwgaW5kaWNlcy5sZW5ndGggKVxuICAgIHtcbiAgICAgICAgYSA9IGluZGljZXNbaSAgXSozO1xuICAgICAgICBiID0gaW5kaWNlc1tpKzFdKjM7XG4gICAgICAgIGMgPSBpbmRpY2VzW2krMl0qMztcblxuICAgICAgICBhMCA9IGE7XG4gICAgICAgIGExID0gYSsxO1xuICAgICAgICBhMiA9IGErMjtcblxuICAgICAgICBiMCA9IGI7XG4gICAgICAgIGIxID0gYisxO1xuICAgICAgICBiMiA9IGIrMjtcblxuICAgICAgICBjMCA9IGM7XG4gICAgICAgIGMxID0gYysxO1xuICAgICAgICBjMiA9IGMrMjtcblxuICAgICAgICB2YnggPSB2ZXJ0aWNlc1tiMF07XG4gICAgICAgIHZieSA9IHZlcnRpY2VzW2IxXTtcbiAgICAgICAgdmJ6ID0gdmVydGljZXNbYjJdO1xuXG4gICAgICAgIGUxeCA9IHZlcnRpY2VzW2EwXS12Yng7XG4gICAgICAgIGUxeSA9IHZlcnRpY2VzW2ExXS12Ynk7XG4gICAgICAgIGUxeiA9IHZlcnRpY2VzW2EyXS12Yno7XG5cbiAgICAgICAgZTJ4ID0gdmVydGljZXNbYzBdLXZieDtcbiAgICAgICAgZTJ5ID0gdmVydGljZXNbYzFdLXZieTtcbiAgICAgICAgZTJ6ID0gdmVydGljZXNbYzJdLXZiejtcblxuICAgICAgICBueCA9IGUxeSAqIGUyeiAtIGUxeiAqIGUyeTtcbiAgICAgICAgbnkgPSBlMXogKiBlMnggLSBlMXggKiBlMno7XG4gICAgICAgIG56ID0gZTF4ICogZTJ5IC0gZTF5ICogZTJ4O1xuXG4gICAgICAgIG5vcm1hbHNbYTBdICs9IG54O1xuICAgICAgICBub3JtYWxzW2ExXSArPSBueTtcbiAgICAgICAgbm9ybWFsc1thMl0gKz0gbno7XG5cbiAgICAgICAgbm9ybWFsc1tiMF0gKz0gbng7XG4gICAgICAgIG5vcm1hbHNbYjFdICs9IG55O1xuICAgICAgICBub3JtYWxzW2IyXSArPSBuejtcblxuICAgICAgICBub3JtYWxzW2MwXSArPSBueDtcbiAgICAgICAgbm9ybWFsc1tjMV0gKz0gbnk7XG4gICAgICAgIG5vcm1hbHNbYzJdICs9IG56O1xuXG4gICAgICAgIGkrPTM7XG4gICAgfVxuXG4gICAgdmFyIHgsIHksIHosIGw7XG5cbiAgICBpID0gMDtcbiAgICB3aGlsZShpIDwgbm9ybWFscy5sZW5ndGgpXG4gICAge1xuXG4gICAgICAgIHggPSBub3JtYWxzW2kgIF07XG4gICAgICAgIHkgPSBub3JtYWxzW2krMV07XG4gICAgICAgIHogPSBub3JtYWxzW2krMl07XG5cbiAgICAgICAgbCA9IE1hdGguc3FydCh4KngreSp5K3oqeik7XG4gICAgICAgIGwgPSAxIC8gKGwgfHwgMSk7XG5cbiAgICAgICAgbm9ybWFsc1tpICBdICo9IGw7XG4gICAgICAgIG5vcm1hbHNbaSsxXSAqPSBsO1xuICAgICAgICBub3JtYWxzW2krMl0gKj0gbDtcblxuICAgICAgICBpKz0zO1xuICAgIH1cblxufTtcblxuXG5HZW9tM2QucHJvdG90eXBlLnNldFZlcnRleCA9IGZ1bmN0aW9uKGluZGV4LHYpXG57XG4gICAgaW5kZXggKj0gMztcbiAgICB2YXIgdmVydGljZXMgPSB0aGlzLnZlcnRpY2VzO1xuICAgIHZlcnRpY2VzW2luZGV4ICBdID0gdlswXTtcbiAgICB2ZXJ0aWNlc1tpbmRleCsxXSA9IHZbMV07XG4gICAgdmVydGljZXNbaW5kZXgrMl0gPSB2WzJdO1xufTtcblxuR2VvbTNkLnByb3RvdHlwZS5zZXRWZXJ0ZXgzZiA9IGZ1bmN0aW9uKGluZGV4LHgseSx6KVxue1xuICAgIGluZGV4Kj0zO1xuICAgIHZhciB2ZXJ0aWNlcyA9IHRoaXMudmVydGljZXM7XG4gICAgdmVydGljZXNbaW5kZXggIF0gPSB4O1xuICAgIHZlcnRpY2VzW2luZGV4KzFdID0geTtcbiAgICB2ZXJ0aWNlc1tpbmRleCsyXSA9IHo7XG59O1xuXG5HZW9tM2QucHJvdG90eXBlLnNldENvbG9yNGYgPSBmdW5jdGlvbihpbmRleCxyLGcsYixhKVxue1xuICAgIGluZGV4ICo9IDQ7XG4gICAgdmFyIGNvbG9ycyA9IHRoaXMuY29sb3JzO1xuICAgIGNvbG9yc1tpbmRleCAgXSA9IHI7XG4gICAgY29sb3JzW2luZGV4KzFdID0gZztcbiAgICBjb2xvcnNbaW5kZXgrMl0gPSBiO1xuICAgIGNvbG9yc1tpbmRleCszXSA9IGE7XG59O1xuXG5HZW9tM2QucHJvdG90eXBlLnNldENvbG9yM2YgPSBmdW5jdGlvbihpbmRleCxyLGcsYilcbntcbiAgICBpbmRleCAqPSA0O1xuICAgIHZhciBjb2xvcnMgPSB0aGlzLmNvbG9ycztcbiAgICBjb2xvcnNbaW5kZXggIF0gPSByO1xuICAgIGNvbG9yc1tpbmRleCsxXSA9IGc7XG4gICAgY29sb3JzW2luZGV4KzJdID0gYjtcbn07XG5cbkdlb20zZC5wcm90b3R5cGUuc2V0Q29sb3IyZiA9IGZ1bmN0aW9uKGluZGV4LGssYSlcbntcbiAgICBpbmRleCAqPSA0O1xuICAgIHZhciBjb2xvcnMgPSB0aGlzLmNvbG9ycztcbiAgICBjb2xvcnNbaW5kZXggIF0gPSBrO1xuICAgIGNvbG9yc1tpbmRleCsxXSA9IGs7XG4gICAgY29sb3JzW2luZGV4KzJdID0gaztcbiAgICBjb2xvcnNbaW5kZXgrM10gPSBhO1xufTtcblxuR2VvbTNkLnByb3RvdHlwZS5zZXRDb2xvcjFmID0gZnVuY3Rpb24oaW5kZXgsaylcbntcbiAgICBpbmRleCAqPSA0O1xuICAgIHZhciBjb2xvcnMgPSB0aGlzLmNvbG9ycztcbiAgICBjb2xvcnNbaW5kZXggIF0gPSBrO1xuICAgIGNvbG9yc1tpbmRleCsxXSA9IGs7XG4gICAgY29sb3JzW2luZGV4KzJdID0gaztcbn07XG5cbkdlb20zZC5wcm90b3R5cGUuc2V0Q29sb3IgPSBmdW5jdGlvbihpbmRleCxjb2xvcilcbntcbiAgICBpbmRleCo9NDtcbiAgICB2YXIgY29sb3JzID0gdGhpcy5jb2xvcnM7XG4gICAgY29sb3JzW2luZGV4ICBdID0gY29sb3JbMF07XG4gICAgY29sb3JzW2luZGV4KzFdID0gY29sb3JbMV07XG4gICAgY29sb3JzW2luZGV4KzJdID0gY29sb3JbMl07XG4gICAgY29sb3JzW2luZGV4KzNdID0gY29sb3JbM107XG59O1xuXG5HZW9tM2QucHJvdG90eXBlLnNldFRleENvb3JkMmYgPSBmdW5jdGlvbihpbmRleCx1LHYpXG57XG4gICAgaW5kZXgqPTI7XG4gICAgdmFyIHRleENvb3JkcyA9IHRoaXMudGV4Q29vcmRzO1xuICAgIHRleENvb3Jkc1tpbmRleCAgXSA9IHU7XG4gICAgdGV4Q29vcmRzW2luZGV4KzFdID0gdjtcbn07XG5cbkdlb20zZC5wcm90b3R5cGUuc2V0VGV4Q29vcmQgPSBmdW5jdGlvbihpbmRleCx2KVxue1xuICAgIGluZGV4Kj0yO1xuICAgIHZhciB0ZXhDb29yZHMgPSB0aGlzLnRleENvb3JkcztcbiAgICB0ZXhDb29yZHNbaW5kZXggIF0gPSB2WzBdO1xuICAgIHRleENvb3Jkc1tpbmRleCsxXSA9IHZbMV07XG59O1xuXG5cbkdlb20zZC5wcm90b3R5cGUuX2RyYXcgPSBmdW5jdGlvbihnbClcbntcbiAgICBnbC5kcmF3RWxlbWVudHModGhpcy52ZXJ0aWNlcyx0aGlzLm5vcm1hbHMsdGhpcy5jb2xvcnMsdGhpcy50ZXhDb29yZHMsdGhpcy5pbmRpY2VzLGdsLl9kcmF3TW9kZSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEdlb20zZDsiLCJ2YXIgR2VvbTNkID0gcmVxdWlyZSgnLi9mR2VvbTNkJyk7XG5cbmZ1bmN0aW9uIElTT0JhbmQoc2l6ZVgsc2l6ZVosdW5pdFNjYWxlWCx1bml0U2NhbGVaKVxue1xuICAgIHRoaXMuX3ZlcnRTaXplWCAgPSBudWxsO1xuICAgIHRoaXMuX3ZlcnRTaXplWiAgPSBudWxsO1xuICAgIHRoaXMuX3VuaXRTY2FsZVggPSAxO1xuICAgIHRoaXMuX3VuaXRTY2FsZVogPSAxO1xuXG4gICAgc3dpdGNoKGFyZ3VtZW50cy5sZW5ndGgpXG4gICAge1xuICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICB0aGlzLl92ZXJ0U2l6ZVggPSB0aGlzLl92ZXJ0U2l6ZVogPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgdGhpcy5fdmVydFNpemVYID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgdGhpcy5fdmVydFNpemVaID0gYXJndW1lbnRzWzFdO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIHRoaXMuX3ZlcnRTaXplWCA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgIHRoaXMuX3ZlcnRTaXplWiA9IGFyZ3VtZW50c1sxXTtcbiAgICAgICAgICAgIHRoaXMuX3VuaXRTY2FsZVggPSB0aGlzLl91bml0U2NhbGVaID0gYXJndW1lbnRzWzJdO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgIHRoaXMuX3ZlcnRTaXplWCAgPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICB0aGlzLl92ZXJ0U2l6ZVogID0gYXJndW1lbnRzWzFdO1xuICAgICAgICAgICAgdGhpcy5fdW5pdFNjYWxlWCA9IGFyZ3VtZW50c1syXTtcbiAgICAgICAgICAgIHRoaXMuX3VuaXRTY2FsZVogPSBhcmd1bWVudHNbM107XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdCA6XG4gICAgICAgICAgICB0aGlzLl92ZXJ0U2l6ZVggPSB0aGlzLl92ZXJ0U2l6ZVogPSAzO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG5cbiAgICB0aGlzLl9jZWxsU2l6ZVggPSB0aGlzLl92ZXJ0U2l6ZVggLSAxO1xuICAgIHRoaXMuX2NlbGxTaXplWiA9IHRoaXMuX3ZlcnRTaXplWiAtIDE7XG5cbiAgICB0aGlzLl9mdW5jICAgICA9IGZ1bmN0aW9uKHgseSxhcmcwLGFyZzEsYXJnMil7cmV0dXJuIDA7fTtcbiAgICB0aGlzLl9mdW5jQXJnMCA9IDA7XG4gICAgdGhpcy5fZnVuY0FyZzEgPSAwO1xuICAgIHRoaXMuX2Z1bmNBcmcyID0gMDtcbiAgICB0aGlzLl9pc29MZXZlbCA9IDA7XG5cbiAgICB0aGlzLl9pbnRlcnBvbGF0ZVZhbHVlcyA9IHRydWU7XG5cbiAgICB0aGlzLl9udW1UcmlhbmdsZXMgPSAwO1xuXG4gICAgLy9UT0RPIENIRUNLIE1BWCBFTEVNRU5UIEVYQ0VFRFxuICAgIHRoaXMuX3ZlcnRzID0gbmV3IEZsb2F0MzJBcnJheSh0aGlzLl92ZXJ0U2l6ZVggKiB0aGlzLl92ZXJ0U2l6ZVogKiA0KTsgLy8gZ3JpZCBjYWxjdWxhdGVkIG5vcm0gdmFsdWVzICsgZnVuY3Rpb24gcmVzdWx0IHZhbHVlIC4uLix4LHkseix2LC4uLlxuICAgIHRoaXMuX2NlbGxzID0gbmV3IEFycmF5KHRoaXMuX2NlbGxTaXplWCAqIHRoaXMuX2NlbGxTaXplWik7XG5cbiAgICB0aGlzLl9lZGdlcyA9IG5ldyBGbG9hdDMyQXJyYXkoKHRoaXMuX2NlbGxTaXplWiAqIHRoaXMuX2NlbGxTaXplWCAqIDIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fY2VsbFNpemVaICsgdGhpcy5fY2VsbFNpemVYKSAqIDMpO1xuXG5cbiAgICB0aGlzLl90ZW1wQ2VsbFZlcnRpY2VzVmFscyA9IG5ldyBGbG9hdDMyQXJyYXkoNCk7XG5cbiAgICB0aGlzLl9pbmRpY2VzID0gW107XG5cbiAgICAvKlxuICAgIC8vdGVtcCBUT0RPIHJlbW92ZVxuICAgIHRoaXMuX19hcHBVaW50VHlwZUVuYWJsZWQgPSBGb2FtLkFwcGxpY2F0aW9uLmdldEluc3RhbmNlKCkuZ2wuaXNVSW50RWxlbWVudFR5cGVBdmFpbGFibGUoKTtcbiAgICAqL1xuXG4gICAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4gICAgdGhpcy5fZ2VuU3VyZmFjZSgpO1xufVxuXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbklTT0JhbmQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShHZW9tM2QucHJvdG90eXBlKTtcblxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG5cbi8vZG9udCBuZWVkIHRoaXNcbklTT0JhbmQucHJvdG90eXBlLnNldEZ1bmN0aW9uID0gZnVuY3Rpb24oZnVuYyxpc29MZXZlbClcbntcbiAgICB2YXIgZnVuY0FyZ3NMZW5ndGggPSBmdW5jLmxlbmd0aDtcblxuICAgIGlmKGZ1bmNBcmdzTGVuZ3RoIDwgMil0aHJvdyAnRnVuY3Rpb24gc2hvdWxkIHNhdGlzZnkgZnVuY3Rpb24oeCx5KXt9JztcbiAgICBpZihmdW5jQXJnc0xlbmd0aCA+IDUpdGhyb3cgJ0Z1bmN0aW9uIGhhcyB0byBtYW55IGFyZ3VtZW50cy4gQXJndW1lbnRzIGxlbmd0aCBzaG91bGQgbm90IGV4Y2VlZCA1LiBFLmcgZnVuY3Rpb24oeCx5LGFyZzAsYXJnMSxhcmcyKS4nO1xuXG4gICAgdmFyIGZ1bmNTdHJpbmcgPSBmdW5jLnRvU3RyaW5nKCksXG4gICAgICAgIGZ1bmNBcmdzICAgPSBmdW5jU3RyaW5nLnNsaWNlKGZ1bmNTdHJpbmcuaW5kZXhPZignKCcpICsgMSwgZnVuY1N0cmluZy5pbmRleE9mKCcpJykpLnNwbGl0KCcsJyksXG4gICAgICAgIGZ1bmNCb2R5ICAgPSBmdW5jU3RyaW5nLnNsaWNlKGZ1bmNTdHJpbmcuaW5kZXhPZigneycpICsgMSwgZnVuY1N0cmluZy5sYXN0SW5kZXhPZignfScpKTtcblxuICAgIHRoaXMuX2Z1bmMgICAgID0gbmV3IEZ1bmN0aW9uKGZ1bmNBcmdzWzBdLCBmdW5jQXJnc1sxXSxcbiAgICAgICAgZnVuY0FyZ3NbMl0gfHwgJ2FyZzAnLCBmdW5jQXJnc1szXSB8fCAnYXJnMScsIGZ1bmNBcmdzWzRdIHx8ICdhcmcyJyxcbiAgICAgICAgZnVuY0JvZHkpO1xuICAgIHRoaXMuX2lzb0xldmVsID0gaXNvTGV2ZWwgfHwgMDtcblxuXG59O1xuXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4vLyBTZXR1cCBwb2ludHNcbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuSVNPQmFuZC5wcm90b3R5cGUuX2dlblN1cmZhY2UgPSBmdW5jdGlvbigpXG57XG4gICAgdmFyIHZlcnRTaXplWCA9IHRoaXMuX3ZlcnRTaXplWCxcbiAgICAgICAgdmVydFNpemVaID0gdGhpcy5fdmVydFNpemVaO1xuXG4gICAgdmFyIGNlbGxTaXplWCA9IHRoaXMuX2NlbGxTaXplWCxcbiAgICAgICAgY2VsbFNpemVaID0gdGhpcy5fY2VsbFNpemVaO1xuXG4gICAgdmFyIHNjYWxlWCA9IHRoaXMuX3VuaXRTY2FsZVgsXG4gICAgICAgIHNjYWxlWiA9IHRoaXMuX3VuaXRTY2FsZVo7XG5cbiAgICB2YXIgdmVydHMgPSB0aGlzLl92ZXJ0cyxcbiAgICAgICAgdmVydHNJbmRleCxcbiAgICAgICAgdmVydHNJbmRleFJvd05leHQsXG4gICAgICAgIGNlbGxzID0gdGhpcy5fY2VsbHMsXG4gICAgICAgIGNlbGxzSW5kZXg7XG5cbiAgICB2YXIgaSxqO1xuXG4gICAgaSA9IC0xO1xuICAgIHdoaWxlKCsraSA8IHZlcnRTaXplWilcbiAgICB7XG4gICAgICAgIGogPSAtMTtcbiAgICAgICAgd2hpbGUoKytqIDwgdmVydFNpemVYKVxuICAgICAgICB7XG4gICAgICAgICAgICB2ZXJ0c0luZGV4ICAgICAgICAgID0gKHZlcnRTaXplWCAqIGkgKyBqKSo0O1xuICAgICAgICAgICAgdmVydHNbdmVydHNJbmRleCAgXSA9ICgtMC41ICsgKGovKHZlcnRTaXplWCAtIDEpKSkgKiBzY2FsZVg7XG4gICAgICAgICAgICB2ZXJ0c1t2ZXJ0c0luZGV4KzFdID0gMDtcbiAgICAgICAgICAgIHZlcnRzW3ZlcnRzSW5kZXgrMl0gPSAoLTAuNSArIChpLyh2ZXJ0U2l6ZVogLSAxKSkpICogc2NhbGVaO1xuICAgICAgICAgICAgdmVydHNbdmVydHNJbmRleCszXSA9IC0xO1xuXG4gICAgICAgICAgICBpZihpIDwgY2VsbFNpemVaICYmIGogPCBjZWxsU2l6ZVgpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdmVydHNJbmRleFJvd05leHQgPSAodmVydFNpemVYICogaSArIGogKyB2ZXJ0U2l6ZVgpICogNDtcblxuICAgICAgICAgICAgICAgIGNlbGxzSW5kZXggICAgICAgID0gY2VsbFNpemVYICogaSArIGo7XG4gICAgICAgICAgICAgICAgY2VsbHNbY2VsbHNJbmRleF0gPSBbdmVydHNJbmRleCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2ZXJ0c0luZGV4ICsgNCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2ZXJ0c0luZGV4Um93TmV4dCArIDQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmVydHNJbmRleFJvd05leHQgXTtcblxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufTtcblxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuLy8gYXBwbHkgZnVuY3Rpb24gdG8gZGF0YSBwb2ludHNcbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuSVNPQmFuZC5wcm90b3R5cGUuYXBwbHlGdW5jdGlvbiA9IGZ1bmN0aW9uKGFyZzAsYXJnMSxhcmcyKVxue1xuICAgIHZhciB2ZXJ0cyA9IHRoaXMuX3ZlcnRzLFxuICAgICAgICB2ZXJ0c0luZGV4O1xuXG4gICAgdmFyIHZlcnRTaXplWCA9IHRoaXMuX3ZlcnRTaXplWCxcbiAgICAgICAgdmVydFNpemVaID0gdGhpcy5fdmVydFNpemVaO1xuXG4gICAgdmFyIGksIGo7XG5cbiAgICBpID0gLTE7XG4gICAgd2hpbGUoKytpIDwgdmVydFNpemVaKVxuICAgIHtcbiAgICAgICAgaiA9IC0xO1xuICAgICAgICB3aGlsZSgrK2ogPCB2ZXJ0U2l6ZVgpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHZlcnRzSW5kZXggPSAodmVydFNpemVYICogaSArIGopICogNDtcbiAgICAgICAgICAgIHZlcnRzW3ZlcnRzSW5kZXggKyAzXSA9IHRoaXMuX2Z1bmModmVydHNbdmVydHNJbmRleF0sdmVydHNbdmVydHNJbmRleCsyXSxhcmcwLGFyZzEsYXJnMik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLm1hcmNoKCk7XG59O1xuXG5JU09CYW5kLnByb3RvdHlwZS5hcHBseUZ1bmN0aW9uTXVsdCA9IGZ1bmN0aW9uKGFyZzAsYXJnMSxhcmcyKVxue1xuICAgIHZhciB2ZXJ0cyA9IHRoaXMuX3ZlcnRzLFxuICAgICAgICB2ZXJ0c0luZGV4O1xuXG4gICAgdmFyIHZlcnRzU2l6ZVggPSB0aGlzLl92ZXJ0U2l6ZVgsXG4gICAgICAgIHZlcnRzU2l6ZVogPSB0aGlzLl92ZXJ0U2l6ZVo7XG5cbiAgICB2YXIgaSwgajtcblxuICAgIGkgPSAtMTtcbiAgICB3aGlsZSgrK2kgPCB2ZXJ0c1NpemVaKVxuICAgIHtcbiAgICAgICAgaiA9IC0xO1xuICAgICAgICB3aGlsZSgrK2ogPCB2ZXJ0c1NpemVYKVxuICAgICAgICB7XG4gICAgICAgICAgICB2ZXJ0c0luZGV4ID0gKHZlcnRzU2l6ZVggKiBpICsgaikgKiA0O1xuICAgICAgICAgICAgdmVydHNbdmVydHNJbmRleCArIDNdICo9IHRoaXMuX2Z1bmModmVydHNbdmVydHNJbmRleF0sdmVydHNbdmVydHNJbmRleCsyXSxhcmcwLGFyZzEsYXJnMik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLm1hcmNoKCk7XG59O1xuXG5JU09CYW5kLnByb3RvdHlwZS5zZXREYXRhID0gZnVuY3Rpb24oZGF0YSx3aWR0aCxoZWlnaHQpXG57XG5cbiAgICB2YXIgdmVydHNTaXplWCA9IHRoaXMuX3ZlcnRTaXplWCxcbiAgICAgICAgdmVydHNTaXplWiA9IHRoaXMuX3ZlcnRTaXplWjtcblxuICAgIGlmKHdpZHRoID4gdmVydHNTaXplWiB8fCBoZWlnaHQgPiB2ZXJ0c1NpemVYKVxuICAgICAgICB0aHJvdyAnRGF0YSBleGNlZWRzIGJ1ZmZlciBzaXplLiBTaG91bGQgbm90IGV4Y2VlZCAnICsgdmVydHNTaXplWiArICcgaW4gd2lkdGggYW5kICcgKyB2ZXJ0c1NpemVYICsgJyBpbiBoZWlnaHQnO1xuXG4gICAgdmFyIHZlcnRzID0gdGhpcy5fdmVydHM7XG5cbiAgICB2YXIgaSAsajtcbiAgICBpID0gLTE7XG4gICAgd2hpbGUoKytpIDwgd2lkdGgpXG4gICAge1xuICAgICAgICBqID0gLTE7XG4gICAgICAgIHdoaWxlKCsraiA8IGhlaWdodClcbiAgICAgICAge1xuICAgICAgICAgICAgdmVydHNbKGhlaWdodCAqIGkgKyBqKSAqIDQgKyAzXSA9IGRhdGFbaGVpZ2h0ICogaSArIGpdO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuXG5cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbi8vIG1hcmNoXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbklTT0JhbmQucHJvdG90eXBlLm1hcmNoID0gZnVuY3Rpb24oKVxue1xuICAgIC8vcmVzZXQgaW5kaWNlc1xuICAgIHZhciBpbmRpY2VzID0gdGhpcy5faW5kaWNlcyA9IFtdO1xuXG4gICAgdmFyIHZlcnRzID0gdGhpcy5fdmVydHM7XG5cbiAgICB2YXIgaSwgaiwgaztcblxuICAgIHZhciBjZWxscyAgICA9IHRoaXMuX2NlbGxzLFxuICAgICAgICBpbmRpY2VzICA9IHRoaXMuX2luZGljZXM7XG5cbiAgICB2YXIgY2VsbFNpemVYID0gdGhpcy5fY2VsbFNpemVYLFxuICAgICAgICBjZWxsU2l6ZVogPSB0aGlzLl9jZWxsU2l6ZVo7XG5cbiAgICB2YXIgY2VsbEluZGV4LFxuICAgICAgICBjZWxsLFxuICAgICAgICBjZWxsU3RhdGU7XG5cbiAgICAvL0NlbGwgdmVydGV4IGluZGljZXMgaW4gZ2xvYmFsIHZlcnRpY2VzXG4gICAgdmFyIHYwSW5kZXgsICAvLyAwIDFcbiAgICAgICAgdjFJbmRleCwgIC8vIDMgMlxuICAgICAgICB2MkluZGV4LFxuICAgICAgICB2M0luZGV4O1xuXG4gICAgLy9DZWxsIHZlcnRleCB2YWx1ZXMgLi4uLHgseSx6LFZBTFVFLC4uLlxuICAgIHZhciB2VmFscyA9IHRoaXMuX3RlbXBDZWxsVmVydGljZXNWYWxzLFxuICAgICAgICB2MFZhbCx2MVZhbCx2MlZhbCx2M1ZhbDtcblxuICAgIC8vVG9wb2xvZ2ljIGVudHJ5IC8gbG9va3VwXG4gICAgdmFyIGVudHJ5VG9wTHUsXG4gICAgICAgIElTT0JBTkRfVE9QX0xVICAgICA9IElTT0JhbmQuVE9QX1RBQkxFO1xuXG4gICAgdmFyIGVudHJ5VG9wTHUwLFxuICAgICAgICBlbnRyeVRvcEx1MSxcbiAgICAgICAgZW50cnlUb3BMdTIsXG4gICAgICAgIGVudHJ5VG9wTHUzO1xuXG4gICAgdmFyIGVkZ2VJbmRleFRvcCxcbiAgICAgICAgZWRnZUluZGV4UmlnaHQsXG4gICAgICAgIGVkZ2VJbmRleEJvdHRvbSxcbiAgICAgICAgZWRnZUluZGV4TGVmdCxcbiAgICAgICAgZWRnZUluZGV4VGVtcDtcblxuICAgIHZhciBlZGdlcyA9IHRoaXMuX2VkZ2VzO1xuXG5cbiAgICAvL1xuICAgIC8vICAwIC0tLS0tLS0gMVxuICAgIC8vICB8ICAgIDAgICAgfFxuICAgIC8vICB8IDEgICAgICAgfCAyXG4gICAgLy8gIHwgICAgICAgICB8XG4gICAgLy8gIDMgLS0tLS0tLSAyXG4gICAgLy8gICAgICAgM1xuXG5cbiAgICBpID0gLTE7XG4gICAgd2hpbGUoKytpIDwgY2VsbFNpemVaKVxuICAgIHtcbiAgICAgICAgaiA9IC0xO1xuICAgICAgICB3aGlsZSgrK2ogPCBjZWxsU2l6ZVgpXG4gICAgICAgIHtcbiAgICAgICAgICAgIGNlbGxJbmRleCAgICAgICAgPSBjZWxsU2l6ZVggKiBpICsgajtcbiAgICAgICAgICAgIGNlbGwgICAgICAgICAgICAgPSBjZWxsc1tjZWxsSW5kZXhdO1xuXG4gICAgICAgICAgICB2MEluZGV4ID0gY2VsbFswXTtcbiAgICAgICAgICAgIHYxSW5kZXggPSBjZWxsWzFdO1xuICAgICAgICAgICAgdjJJbmRleCA9IGNlbGxbMl07XG4gICAgICAgICAgICB2M0luZGV4ID0gY2VsbFszXTtcblxuICAgICAgICAgICAgdjBWYWwgPSB2VmFsc1swXSA9IHZlcnRzW3YwSW5kZXggKyAzXTtcbiAgICAgICAgICAgIHYxVmFsID0gdlZhbHNbMV0gPSB2ZXJ0c1t2MUluZGV4ICsgM107XG4gICAgICAgICAgICB2MlZhbCA9IHZWYWxzWzJdID0gdmVydHNbdjJJbmRleCArIDNdO1xuICAgICAgICAgICAgdjNWYWwgPSB2VmFsc1szXSA9IHZlcnRzW3YzSW5kZXggKyAzXTtcblxuICAgICAgICAgICAgY2VsbFN0YXRlID0gKHYwVmFsID4gMCkgPDwgMyB8XG4gICAgICAgICAgICAgICAgICAgICAgICAodjFWYWwgPiAwKSA8PCAyIHxcbiAgICAgICAgICAgICAgICAgICAgICAgICh2MlZhbCA+IDApIDw8IDEgfFxuICAgICAgICAgICAgICAgICAgICAgICAgKHYzVmFsID4gMCk7XG5cbiAgICAgICAgICAgIGlmKGNlbGxTdGF0ZSA9PSAwKWNvbnRpbnVlO1xuXG4gICAgICAgICAgICBlZGdlSW5kZXhUb3AgICAgPSBjZWxsSW5kZXggKyAoY2VsbFNpemVYICsgMSkgKiBpO1xuICAgICAgICAgICAgZWRnZUluZGV4UmlnaHQgID0gZWRnZUluZGV4VG9wICAgKyBjZWxsU2l6ZVggKyAxO1xuICAgICAgICAgICAgZWRnZUluZGV4Qm90dG9tID0gZWRnZUluZGV4UmlnaHQgKyBjZWxsU2l6ZVg7XG4gICAgICAgICAgICBlZGdlSW5kZXhMZWZ0ICAgPSBlZGdlSW5kZXhSaWdodCAtIDE7XG5cbiAgICAgICAgICAgIGVudHJ5VG9wTHUgPSBJU09CQU5EX1RPUF9MVVtjZWxsU3RhdGVdO1xuXG4gICAgICAgICAgICAvL2NlbGwgdXBwZXIgbGVmdFxuICAgICAgICAgICAgayA9IDA7XG4gICAgICAgICAgICBpZihpID09IDAgJiYgaiA9PSAwKVxuICAgICAgICAgICAge1xuXG4gICAgICAgICAgICAgICAgd2hpbGUoayA8IGVudHJ5VG9wTHUubGVuZ3RoKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgZW50cnlUb3BMdTAgPSBlbnRyeVRvcEx1W2sgIF07XG4gICAgICAgICAgICAgICAgICAgIGVudHJ5VG9wTHUxID0gZW50cnlUb3BMdVtrKzFdO1xuICAgICAgICAgICAgICAgICAgICBlbnRyeVRvcEx1MiA9IGVudHJ5VG9wTHVbaysyXTtcbiAgICAgICAgICAgICAgICAgICAgZW50cnlUb3BMdTMgPSBlbnRyeVRvcEx1W2srM107XG5cbiAgICAgICAgICAgICAgICAgICAgLy9nZXQgZWRnZSB2ZXJ0ZXggMCBhY2NvcmRpbmcgdG8gdG9wb2xvZ2ljYWwgZW50cnlcbiAgICAgICAgICAgICAgICAgICAgLy9UT0RPIGNvbGxhcHNlXG4gICAgICAgICAgICAgICAgICAgIGVkZ2VJbmRleFRlbXAgPSBlbnRyeVRvcEx1MCA9PSAwID8gZWRnZUluZGV4VG9wIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVudHJ5VG9wTHUwID09IDEgPyBlZGdlSW5kZXhSaWdodCA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnRyeVRvcEx1MCA9PSAyID8gZWRnZUluZGV4Qm90dG9tIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVkZ2VJbmRleExlZnQ7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5faW50cnBsKGNlbGxbZW50cnlUb3BMdTBdLGNlbGxbZW50cnlUb3BMdTFdLGVkZ2VzLGVkZ2VJbmRleFRlbXAgKiAzKTtcbiAgICAgICAgICAgICAgICAgICAgaW5kaWNlcy5wdXNoKGVkZ2VJbmRleFRlbXApO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vZ2V0IGVkZ2UgdmVydGV4IDEgYWNjb3JkaW5nIHRvIHRvcG9sb2dpY2FsIGVudHJ5XG4gICAgICAgICAgICAgICAgICAgIC8vVE9ETyBjb2xsYXBzZVxuICAgICAgICAgICAgICAgICAgICBlZGdlSW5kZXhUZW1wID0gZW50cnlUb3BMdTIgPT0gMCA/IGVkZ2VJbmRleFRvcCA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnRyeVRvcEx1MiA9PSAxID8gZWRnZUluZGV4UmlnaHQgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZW50cnlUb3BMdTIgPT0gMiA/IGVkZ2VJbmRleEJvdHRvbSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlZGdlSW5kZXhMZWZ0O1xuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2ludHJwbChjZWxsW2VudHJ5VG9wTHUyXSxjZWxsW2VudHJ5VG9wTHUzXSxlZGdlcyxlZGdlSW5kZXhUZW1wICogMyk7XG4gICAgICAgICAgICAgICAgICAgIGluZGljZXMucHVzaChlZGdlSW5kZXhUZW1wKTtcblxuICAgICAgICAgICAgICAgICAgICBrICs9IDQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvL2NlbGxzIGZpcnN0IHJvdyBhZnRlciB1cHBlciBsZWZ0XG4gICAgICAgICAgICAvL1RPRE8gY29sbGFwc2VcbiAgICAgICAgICAgIGlmKGkgPT0gMCAmJiBqID4gMClcbiAgICAgICAgICAgIHtcblxuICAgICAgICAgICAgICAgIHdoaWxlKGsgPCBlbnRyeVRvcEx1Lmxlbmd0aClcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGVudHJ5VG9wTHUwID0gZW50cnlUb3BMdVtrICBdO1xuICAgICAgICAgICAgICAgICAgICBlbnRyeVRvcEx1MSA9IGVudHJ5VG9wTHVbaysxXTtcbiAgICAgICAgICAgICAgICAgICAgZW50cnlUb3BMdTIgPSBlbnRyeVRvcEx1W2srMl07XG4gICAgICAgICAgICAgICAgICAgIGVudHJ5VG9wTHUzID0gZW50cnlUb3BMdVtrKzNdO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vY2hlY2sgaWYgZWRnZSBpcyBvbiBhZGphY2VudCBsZWZ0IHNpZGUsIGFuZCBwdXNoIGluZGV4IG9mIGVkZ2UsXG4gICAgICAgICAgICAgICAgICAgIC8vaWYgbm90LCBjYWxjdWxhdGUgZWRnZSwgcHVzaCBpbmRleCBvZiBuZXcgZWRnZVxuXG5cbiAgICAgICAgICAgICAgICAgICAgLy9jaGVjayBmaXJzdCB2ZXJ0ZXggaXMgb24gbGVmdCBlZGdlXG4gICAgICAgICAgICAgICAgICAgIGlmKGVudHJ5VG9wTHUwID09IDMpXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vYXNzaWduIHByZXZpb3VzIGNhbGN1bGF0ZWQgZWRnZSB2ZXJ0ZXggZnJvbSBwcmV2aW91cyBjZWxsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmRpY2VzLnB1c2goZWRnZUluZGV4TGVmdCk7XG5cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIC8vY2FsY3VsYXRlIGVkZ2UgdmVydGV4XG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVkZ2VJbmRleFRlbXAgPSBlbnRyeVRvcEx1MCA9PSAwID8gZWRnZUluZGV4VG9wIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnRyeVRvcEx1MCA9PSAxID8gZWRnZUluZGV4UmlnaHQgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVkZ2VJbmRleEJvdHRvbTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5faW50cnBsKGNlbGxbZW50cnlUb3BMdTBdLGNlbGxbZW50cnlUb3BMdTFdLGVkZ2VzLGVkZ2VJbmRleFRlbXAgKiAzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZGljZXMucHVzaChlZGdlSW5kZXhUZW1wKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vY2hlY2sgc2Vjb25kIHZlcnRleCBpcyBvbiBsZWZ0IGVkZ2VcblxuICAgICAgICAgICAgICAgICAgICBpZihlbnRyeVRvcEx1MiA9PSAzKVxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbmRpY2VzLnB1c2goZWRnZUluZGV4TGVmdCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSAvL2NhbGN1bGF0ZSBlZGdlIHZlcnRleFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlZGdlSW5kZXhUZW1wID0gZW50cnlUb3BMdTIgPT0gMCA/IGVkZ2VJbmRleFRvcCA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZW50cnlUb3BMdTIgPT0gMSA/IGVkZ2VJbmRleFJpZ2h0IDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlZGdlSW5kZXhCb3R0b207XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2ludHJwbChjZWxsW2VudHJ5VG9wTHUyXSxjZWxsW2VudHJ5VG9wTHUzXSxlZGdlcyxlZGdlSW5kZXhUZW1wICogMyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbmRpY2VzLnB1c2goZWRnZUluZGV4VGVtcCk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuXG4gICAgICAgICAgICAgICAgICAgIGsgKz0gNDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vY2VsbHMgZmlyc3QgY29sdW1uIGFmdGVyIHVwcGVyIGxlZnRcbiAgICAgICAgICAgIC8vVE9ETyBjb2xsYXBzZVxuICAgICAgICAgICAgaWYoaSAhPSAwICYmIGogPT0gMClcbiAgICAgICAgICAgIHtcblxuICAgICAgICAgICAgICAgIHdoaWxlKGsgPCBlbnRyeVRvcEx1Lmxlbmd0aClcbiAgICAgICAgICAgICAgICB7XG5cbiAgICAgICAgICAgICAgICAgICAgLy9jaGVjayBpZiBlZGdlIGlzIG9uIGFkamFjZW50IHRvcCBzaWRlLCBhbmQgcHVzaCBpbmRleCBvZiBlZGdlLFxuICAgICAgICAgICAgICAgICAgICAvL2lmIG5vdCwgY2FsY3VsYXRlIGVkZ2UsIHB1c2ggaW5kZXggb2YgbmV3IGVkZ2VcblxuICAgICAgICAgICAgICAgICAgICBlbnRyeVRvcEx1MCA9IGVudHJ5VG9wTHVbayAgXTtcbiAgICAgICAgICAgICAgICAgICAgZW50cnlUb3BMdTEgPSBlbnRyeVRvcEx1W2srMV07XG4gICAgICAgICAgICAgICAgICAgIGVudHJ5VG9wTHUyID0gZW50cnlUb3BMdVtrKzJdO1xuICAgICAgICAgICAgICAgICAgICBlbnRyeVRvcEx1MyA9IGVudHJ5VG9wTHVbayszXTtcblxuICAgICAgICAgICAgICAgICAgICAvL2NoZWNrIGZpcnN0IHZlcnRleCBpcyBvbiB0b3AgZWRnZVxuICAgICAgICAgICAgICAgICAgICBpZihlbnRyeVRvcEx1MCA9PSAwKVxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbmRpY2VzLnB1c2goZWRnZUluZGV4VG9wKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVkZ2VJbmRleFRlbXAgPSBlbnRyeVRvcEx1MCA9PSAxID8gZWRnZUluZGV4UmlnaHQgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVudHJ5VG9wTHUwID09IDIgPyBlZGdlSW5kZXhCb3R0b20gOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVkZ2VJbmRleExlZnQ7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2ludHJwbChjZWxsW2VudHJ5VG9wTHUwXSxjZWxsW2VudHJ5VG9wTHUxXSxlZGdlcyxlZGdlSW5kZXhUZW1wICogMyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbmRpY2VzLnB1c2goZWRnZUluZGV4VGVtcClcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vY2hlY2sgZmlyc3QgdmVydGV4IGlzIG9uIHRvcCBlZGdlXG4gICAgICAgICAgICAgICAgICAgIGlmKGVudHJ5VG9wTHUyID09IDApXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZGljZXMucHVzaChlZGdlSW5kZXhUb3ApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgZWRnZUluZGV4VGVtcCA9IGVudHJ5VG9wTHUyID09IDEgPyBlZGdlSW5kZXhSaWdodCA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZW50cnlUb3BMdTIgPT0gMiA/IGVkZ2VJbmRleEJvdHRvbSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWRnZUluZGV4TGVmdDtcblxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5faW50cnBsKGNlbGxbZW50cnlUb3BMdTJdLGNlbGxbZW50cnlUb3BMdTNdLGVkZ2VzLGVkZ2VJbmRleFRlbXAgKiAzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZGljZXMucHVzaChlZGdlSW5kZXhUZW1wKVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgayArPSA0O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvL2NoZWNrIGFsbCBvdGhlciBjZWxsc1xuICAgICAgICAgICAgLy9UT0RPIGNvbGxhcHNlXG4gICAgICAgICAgICBpZihpICE9IDAgJiYgaiAhPSAwKVxuICAgICAgICAgICAge1xuXG4gICAgICAgICAgICAgICAgLy9jaGVjayBpZiBlZGdlIGlzIG9uIGFkamFjZW50IGxlZnQgc2lkZSwgYW5kIHB1c2ggaW5kZXggb2YgZWRnZSxcbiAgICAgICAgICAgICAgICAvL2lmIG5vdCwgY2FsY3VsYXRlIGVkZ2UsIHB1c2ggaW5kZXggb2YgbmV3IGVkZ2VcblxuICAgICAgICAgICAgICAgIHdoaWxlKGsgPCBlbnRyeVRvcEx1Lmxlbmd0aClcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGVudHJ5VG9wTHUwID0gZW50cnlUb3BMdVtrICBdO1xuICAgICAgICAgICAgICAgICAgICBlbnRyeVRvcEx1MSA9IGVudHJ5VG9wTHVbaysxXTtcbiAgICAgICAgICAgICAgICAgICAgZW50cnlUb3BMdTIgPSBlbnRyeVRvcEx1W2srMl07XG4gICAgICAgICAgICAgICAgICAgIGVudHJ5VG9wTHUzID0gZW50cnlUb3BMdVtrKzNdO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vY2hlY2sgZmlyc3QgdmVydGV4IGlzIG9uIGxlZnQgZWRnZVxuICAgICAgICAgICAgICAgICAgICBpZihlbnRyeVRvcEx1MCA9PSAzKVxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbmRpY2VzLnB1c2goZWRnZUluZGV4TGVmdCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZihlbnRyeVRvcEx1MCA9PSAwKS8vbWF5YmUgdXBwZXIgY2VsbD9cbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5kaWNlcy5wdXNoKGVkZ2VJbmRleFRvcCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSAvL2NhbGN1bGF0ZSBlZGdlIHZlcnRleFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlZGdlSW5kZXhUZW1wID0gZW50cnlUb3BMdTAgPT0gMSA/IGVkZ2VJbmRleFJpZ2h0IDogZWRnZUluZGV4Qm90dG9tO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9pbnRycGwoY2VsbFtlbnRyeVRvcEx1MF0sY2VsbFtlbnRyeVRvcEx1MV0sZWRnZXMsZWRnZUluZGV4VGVtcCAqIDMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5kaWNlcy5wdXNoKGVkZ2VJbmRleFRlbXApO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy9jaGVjayBzZWNvbmQgdmVydGV4IGlzIG9uIGxlZnQgZWRnZVxuICAgICAgICAgICAgICAgICAgICBpZihlbnRyeVRvcEx1MiA9PSAzKVxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbmRpY2VzLnB1c2goZWRnZUluZGV4TGVmdCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZihlbnRyeVRvcEx1MiA9PSAwKS8vbWF5YmUgdXBwZXIgY2VsbD9cbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5kaWNlcy5wdXNoKGVkZ2VJbmRleFRvcCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSAvL2NhbGN1bGF0ZSBlZGdlIHZlcnRleFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlZGdlSW5kZXhUZW1wID0gZW50cnlUb3BMdTIgPT0gMSA/IGVkZ2VJbmRleFJpZ2h0IDogZWRnZUluZGV4Qm90dG9tO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9pbnRycGwoY2VsbFtlbnRyeVRvcEx1Ml0sY2VsbFtlbnRyeVRvcEx1M10sZWRnZXMsZWRnZUluZGV4VGVtcCAqIDMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5kaWNlcy5wdXNoKGVkZ2VJbmRleFRlbXApO1xuICAgICAgICAgICAgICAgICAgICB9XG5cblxuICAgICAgICAgICAgICAgICAgICBrICs9IDQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy90ZW1wXG4gICAgdGhpcy5faW5kaWNlcyA9IHRoaXMuX19hcHBVaW50VHlwZUVuYWJsZWQgPyAgbmV3IFVpbnQzMkFycmF5KGluZGljZXMpIDogIG5ldyBVaW50MTZBcnJheShpbmRpY2VzKTtcbn07XG5cbi8vdmlzdWFsIGRlYnVnIG5lZWQgaXNvbGluZS9pc29iYW5kIHN3aXRjaFxuSVNPQmFuZC5wcm90b3R5cGUuX2RyYXcgPSBmdW5jdGlvbihnbClcbntcbiAgICB2YXIgZWRnZXMgICA9IHRoaXMuX2VkZ2VzLFxuICAgICAgICBjb2xvcnMgID0gZ2wuYnVmZmVyQ29sb3JzKGdsLmdldENvbG9yQnVmZmVyKCksbmV3IEZsb2F0MzJBcnJheShlZGdlcy5sZW5ndGgvMyo0KSksXG4gICAgICAgIGluZGljZXMgPSAgdGhpcy5faW5kaWNlcztcblxuICAgICBnbC5kcmF3RWxlbWVudHMoZWRnZXMsbnVsbCxjb2xvcnMsbnVsbCxpbmRpY2VzLGdsLmdldERyYXdNb2RlKCksaW5kaWNlcy5sZW5ndGgsMCxnbC5VTlNJR05FRF9TSE9SVCk7XG59O1xuXG5cbklTT0JhbmQucHJvdG90eXBlLl9pbnRycGwgPSBmdW5jdGlvbihpbmRleDAsaW5kZXgxLG91dCxvZmZzZXQpXG57XG4gICAgdmFyIHZlcnRzID0gdGhpcy5fdmVydHM7XG5cbiAgICB2YXIgdjB4ID0gdmVydHNbaW5kZXgwICBdLFxuICAgICAgICB2MHkgPSB2ZXJ0c1tpbmRleDArMV0sXG4gICAgICAgIHYweiA9IHZlcnRzW2luZGV4MCsyXSxcbiAgICAgICAgdjB2ID0gdmVydHNbaW5kZXgwKzNdO1xuXG4gICAgdmFyIHYxeCA9IHZlcnRzW2luZGV4MSAgXSxcbiAgICAgICAgdjF5ID0gdmVydHNbaW5kZXgxKzFdLFxuICAgICAgICB2MXogPSB2ZXJ0c1tpbmRleDErMl0sXG4gICAgICAgIHYxdiA9IHZlcnRzW2luZGV4MSszXTtcblxuXG4gICAgaWYodjB2ID09IDApXG4gICAge1xuICAgICAgICBvdXRbb2Zmc2V0KzBdID0gdjF4O1xuICAgICAgICBvdXRbb2Zmc2V0KzFdID0gdjF5O1xuICAgICAgICBvdXRbb2Zmc2V0KzJdID0gdjF6O1xuXG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZWxzZSBpZih2MXYgPT0gMClcbiAgICB7XG4gICAgICAgIG91dFtvZmZzZXQrMF0gPSB2MHg7XG4gICAgICAgIG91dFtvZmZzZXQrMV0gPSB2MHk7XG4gICAgICAgIG91dFtvZmZzZXQrMl0gPSB2MHo7XG5cbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuXG4gICAgaWYodGhpcy5faW50ZXJwb2xhdGVWYWx1ZXMpXG4gICAge1xuICAgICAgICB2YXIgdjEwdiA9IHYxdiAtIHYwdjtcblxuICAgICAgICBvdXRbb2Zmc2V0KzBdID0gLXYwdiAqICh2MXggLSB2MHgpIC8gdjEwdiArIHYweDtcbiAgICAgICAgb3V0W29mZnNldCsxXSA9IC12MHYgKiAodjF5IC0gdjB5KSAvIHYxMHYgKyB2MHk7XG4gICAgICAgIG91dFtvZmZzZXQrMl0gPSAtdjB2ICogKHYxeiAtIHYweikgLyB2MTB2ICsgdjB6O1xuICAgIH1cbiAgICBlbHNlXG4gICAge1xuICAgICAgICBvdXRbb2Zmc2V0KzBdID0gICh2MXggLSB2MHgpICogMC41ICsgdjB4O1xuICAgICAgICBvdXRbb2Zmc2V0KzFdID0gICh2MXkgLSB2MHkpICogMC41ICsgdjB5O1xuICAgICAgICBvdXRbb2Zmc2V0KzJdID0gICh2MXogLSB2MHopICogMC41ICsgdjB6O1xuICAgIH1cbn07XG5cblxuSVNPQmFuZC5wcm90b3R5cGUuZ2V0VmVydGljZXMgICAgICA9IGZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX3ZlcnRzO307XG5JU09CYW5kLnByb3RvdHlwZS5nZXRWZXJ0aWNlc1NpemVYID0gZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fdmVydFNpemVYO307XG5JU09CYW5kLnByb3RvdHlwZS5nZXRWZXJ0aWNlc1NpemVaID0gZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fdmVydFNpemVaO307XG5JU09CYW5kLnByb3RvdHlwZS5nZXRDZWxscyAgICAgICAgID0gZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fY2VsbHM7fTtcbklTT0JhbmQucHJvdG90eXBlLmdldENlbGxzU2l6ZVggICAgPSBmdW5jdGlvbigpe3JldHVybiB0aGlzLl9jZWxsU2l6ZVg7fTtcbklTT0JhbmQucHJvdG90eXBlLmdldENlbGxzU2l6ZVogICAgPSBmdW5jdGlvbigpe3JldHVybiB0aGlzLl9jZWxsU2l6ZVo7fTtcbklTT0JhbmQucHJvdG90eXBlLmdldEVkZ2VzICAgICAgICAgPSBmdW5jdGlvbigpe3JldHVybiB0aGlzLl9lZGdlczt9O1xuSVNPQmFuZC5wcm90b3R5cGUuZ2V0SW5kaWNlcyAgICAgICA9IGZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX2luZGljZXM7fTtcblxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuLy8gVE9QT0xPR0lDQUxcbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuLy9UT0RPIG1lcmdlXG5JU09CYW5kLlRPUF9UQUJMRSA9XG4gICAgW1xuICAgICAgICBbXSxcbiAgICAgICAgWyAyLCAzLCAzLCAwXSxcbiAgICAgICAgWyAxLCAyLCAyLCAzXSxcbiAgICAgICAgWyAxLCAyLCAzLCAwXSxcbiAgICAgICAgWyAwLCAxLCAxLCAyXSxcbiAgICAgICAgWyAwLCAxLCAxLCAyLCAyLCAzLCAzLCAwXSxcbiAgICAgICAgWyAwLCAxLCAyLCAzXSxcbiAgICAgICAgWyAwLCAxLCAzLCAwXSxcbiAgICAgICAgWyAwLCAxLCAzLCAwXSxcbiAgICAgICAgWyAwLCAxLCAyLCAzXSxcbiAgICAgICAgWyAwLCAxLCAxLCAyLCAyLCAzLCAzLCAwXSxcbiAgICAgICAgWyAwLCAxLCAxLCAyXSxcbiAgICAgICAgWyAxLCAyLCAzLCAwXSxcbiAgICAgICAgWyAxLCAyLCAyLCAzXSxcbiAgICAgICAgWyAyLCAzLCAzLCAwXSxcbiAgICAgICAgW11cbiAgICBdO1xuXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4vLyBUUklBTkdFXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbi8vVE9ETyBtZXJnZVxuSVNPQmFuZC5UUklfVEFCTEUgPVxuICAgIFtcbiAgICAgICAgW10sXG4gICAgICAgIFsgMSwgMCwgMCwgMywgMSwgMV0sXG4gICAgICAgIFsgMSwgMCwgMCwgMiwgMSwgMV0sXG4gICAgICAgIFsgMSwgMCwgMCwgMiwgMCwgMywgMCwgMywgMSwgMSAsMSAsMCBdLFxuICAgICAgICBbIDEsIDAsIDAsIDEsIDEsIDFdLFxuICAgICAgICBbIDEsIDAsIDAsIDEsIDEsIDEsIDEsIDEsIDEsIDIsIDEsIDMsIDEsIDIsIDAsIDMsIDEsIDMsIDEsIDMsIDEsIDAsIDEsIDFdLFxuICAgICAgICBbIDEsIDAsIDAsIDEsIDEsIDEsIDAsIDEsIDAsIDIsIDEsIDFdLFxuICAgICAgICBbIDEsIDAsIDAsIDEsIDAsIDIsIDAsIDIsIDEsIDEsIDEsIDAsIDAsIDIsIDAsIDMsIDEsIDEgXSxcbiAgICAgICAgWyAwLCAwLCAxLCAwLCAxLCAxXSxcbiAgICAgICAgWyAwLCAwLCAxLCAwLCAwLCAzLCAxLCAwLCAxLCAxLCAwLCAzXSxcbiAgICAgICAgWyAwLCAwLCAxLCAwLCAxLCAzLCAxLCAwLCAxLCAxLCAxLCAzLCAxLCAxLCAwLCAyLCAxLCAyLCAxLCAyLCAxLCAzLCAxLCAxIF0sXG4gICAgICAgIFsgMCwgMCwgMSwgMCwgMCwgMywgMSwgMCwgMSwgMSwgMCwgMywgMSwgMSwgMCwgMiwgMCwgM10sXG4gICAgICAgIFsgMCwgMCwgMCwgMSwgMSwgMSwgMCwgMSwgMSwgMCwgMSwgMV0sXG4gICAgICAgIFsgMCwgMCwgMCwgMSwgMSwgMCwgMSwgMCwgMSwgMSwgMCwgMCwgMSwgMSwgMCwgMywgMCwgMF0sXG4gICAgICAgIFsgMCwgMCwgMCwgMSwgMSwgMSwgMCwgMSwgMCwgMiwgMSwgMCwgMSwgMCwgMSwgMSwgMCwgMV0sXG4gICAgICAgIFsgMCwgMCwgMCwgMSwgMCwgMywgMCwgMSwgMCwgMiwgMCwgM11cbiAgICBdO1xuXG5cbm1vZHVsZS5leHBvcnRzID0gSVNPQmFuZDtcbiIsInZhciBWZWMzICAgPSByZXF1aXJlKCcuLi9tYXRoL2ZWZWMzJyksXG4gICAgVmVjNCAgID0gcmVxdWlyZSgnLi4vbWF0aC9mVmVjNCcpLFxuICAgIEdlb20zZCA9IHJlcXVpcmUoJy4vZkdlb20zZCcpO1xuXG5cbi8vVGhpcyBpcyBqdXN0IGFuIGluaXRpYWwgdmVyc2lvblxuZnVuY3Rpb24gSVNPU3VyZmFjZShzaXplWCxzaXplWSxzaXplWilcbntcbiAgICB0aGlzLl92ZXJ0U2l6ZVggPSBudWxsO1xuICAgIHRoaXMuX3ZlcnRTaXplWSA9IG51bGw7XG4gICAgdGhpcy5fdmVydFNpemVaID0gbnVsbDtcblxuICAgIHN3aXRjaChhcmd1bWVudHMubGVuZ3RoKVxuICAgIHtcbiAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgdGhpcy5fdmVydFNpemVYID0gdGhpcy5fdmVydFNpemVZID0gdGhpcy5fdmVydFNpemVaID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIHRoaXMuX3ZlcnRTaXplWCA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgIHRoaXMuX3ZlcnRTaXplWSA9IGFyZ3VtZW50c1sxXTtcbiAgICAgICAgICAgIHRoaXMuX3ZlcnRTaXplWiA9IGFyZ3VtZW50c1syXTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0IDpcbiAgICAgICAgICAgIHRoaXMuX3ZlcnRTaXplWCA9IHRoaXMuX3ZlcnRTaXplWSA9IHRoaXMuX3ZlcnRTaXplWiA9IDM7XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICB0aGlzLl9jdWJlU2l6ZVggPSB0aGlzLl92ZXJ0U2l6ZVggLSAxO1xuICAgIHRoaXMuX2N1YmVTaXplWSA9IHRoaXMuX3ZlcnRTaXplWSAtIDE7XG4gICAgdGhpcy5fY3ViZVNpemVaID0gdGhpcy5fdmVydFNpemVaIC0gMTtcblxuICAgIHRoaXMuX2RlbGF5ZWRDbGVhciA9IGZhbHNlO1xuXG4gICAgLy9UT0RPOkZJWCEhXG4gICAgdGhpcy5fZnVuYyAgICAgID0gZnVuY3Rpb24oeCx5LHosYXJnMCxhcmcxLGFyZzIpe3JldHVybiAwO307XG4gICAgdGhpcy5fZnVuY0FyZzAgID0gMDtcbiAgICB0aGlzLl9mdW5jQXJnMSAgPSAwO1xuICAgIHRoaXMuX2Z1bmNBcmcyICA9IDA7XG4gICAgdGhpcy5faXNvTGV2ZWwgID0gMDtcblxuICAgIC8vVE9ETzogdW5yb2xsXG4gICAgdGhpcy5fdmVydHMgPSBuZXcgQXJyYXkodGhpcy5fdmVydFNpemVYKnRoaXMuX3ZlcnRTaXplWSp0aGlzLl92ZXJ0U2l6ZVopO1xuICAgIHRoaXMuX2N1YmVzID0gbmV3IEFycmF5KHRoaXMuX2N1YmVTaXplWCp0aGlzLl9jdWJlU2l6ZVkqdGhpcy5fY3ViZVNpemVaKTtcblxuICAgIHRoaXMuX251bVRyaWFuZ2xlcyA9IDA7XG5cbiAgICB2YXIgU0laRV9PRl9UUklBTkdMRSAgID0gMyxcbiAgICAgICAgU0laRV9PRl9DVUJFX0VER0VTID0gMTI7XG4gICAgdmFyIE1BWF9CVUZGRVJfTEVOICAgICA9IHRoaXMuX2N1YmVzLmxlbmd0aCAqIDQ7XG5cbiAgICB0aGlzLl9iVmVydGljZXMgPSBuZXcgRmxvYXQzMkFycmF5KChNQVhfQlVGRkVSX0xFTikqU0laRV9PRl9UUklBTkdMRSpWZWMzLlNJWkUpO1xuICAgIHRoaXMuX2JOb3JtYWxzICA9IG5ldyBGbG9hdDMyQXJyYXkoKE1BWF9CVUZGRVJfTEVOKSpTSVpFX09GX1RSSUFOR0xFKlZlYzMuU0laRSk7XG4gICAgdGhpcy5fYkNvbG9ycyAgID0gbmV3IEZsb2F0MzJBcnJheSgoTUFYX0JVRkZFUl9MRU4pKlNJWkVfT0ZfVFJJQU5HTEUqVmVjNC5TSVpFKTtcblxuICAgIHRoaXMuX3RlbXBWZXJ0aWNlcyA9IG5ldyBBcnJheShTSVpFX09GX0NVQkVfRURHRVMqVmVjMy5TSVpFKTtcbiAgICB0aGlzLl90ZW1wTm9ybWFscyAgPSBuZXcgQXJyYXkoU0laRV9PRl9DVUJFX0VER0VTKTtcblxuICAgIHRoaXMuX3NjYWxlWFlaID0gWzEsMSwxXTtcblxuICAgIHRoaXMuX2dlblN1cmZhY2UoKTtcblxufVxuXG5JU09TdXJmYWNlLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoR2VvbTNkLnByb3RvdHlwZSk7XG5cblxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuLy9cbi8vXG4vLyAgICAgICAgICAgMiAtLS0tLS0tIDMgICAgVmVydGV4IG9yZGVyXG4vLyAgICAgICAgICAvfCAgICAgICAgL3xcbi8vICAgICAgICAgLyB8ICAgICAgIC8gfFxuLy8gICAgICAgIDYgLS0tLS0tLSA3ICB8XG4vLyAgICAgICAgfCAgMCAtLS0tLXwtIDFcbi8vICAgICAgICB8IC8gICAgICAgfCAvXG4vLyAgICAgICAgfC8gICAgICAgIHwvXG4vLyAgICAgICAgNCAtLS0tLS0tIDVcbi8vXG4vL1xuLy8gICAgICAgICAgIDIgLS0tLS0tPiAzICAgIE1hcmNoIG9yZGVyXG4vLyAgICAgICAgICAgICAgXFxcbi8vICAgICAgICAgICAgICAgIFxcXG4vLyAgICAgICAgNiAtLS0tLS0+IDdcbi8vICAgICAgICAgICAwIC0tLS0tLT4gMVxuLy8gICAgICAgICAgICAgXFxcbi8vICAgICAgICAgICAgICAgXFxcbi8vICAgICAgICA0IC0tLS0tLT4gNVxuLy9cbi8vXG5cblxuSVNPU3VyZmFjZS5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oKVxue1xuXG4gICAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4gICAgdmFyIHZlcnRzID0gdGhpcy5fdmVydHM7XG5cbiAgICB2YXIgY3ViZVNpemVYICA9IHRoaXMuX2N1YmVTaXplWCxcbiAgICAgICAgY3ViZVNpemVZICA9IHRoaXMuX2N1YmVTaXplWSxcbiAgICAgICAgY3ViZVNpemVaICA9IHRoaXMuX2N1YmVTaXplWixcbiAgICAgICAgY3ViZVNpemVaWSA9IGN1YmVTaXplWiAqIGN1YmVTaXplWTtcblxuICAgIHZhciBjdWJlcyA9IHRoaXMuX2N1YmVzLFxuICAgICAgICBjdWJlO1xuXG4gICAgdmFyIG1hcmNoSW5kZXg7XG5cbiAgICB2YXIgRURHRV9UQUJMRSA9IElTT1N1cmZhY2UuRURHRV9UQUJMRSxcbiAgICAgICAgVFJJX1RBQkxFICA9IElTT1N1cmZhY2UuVFJJX1RBQkxFO1xuXG4gICAgdmFyIHYwLHYxLHYyLHYzLHY0LHY1LHY2LHY3O1xuICAgIHZhciB2YWwwLHZhbDEsdmFsMix2YWwzLHZhbDQsdmFsNSx2YWw2LHZhbDc7XG5cbiAgICB2YXIgY3ViZUluZGV4O1xuICAgIHZhciBpc29MZXZlbCA9IHRoaXMuX2lzb0xldmVsO1xuICAgIHZhciBiaXRzO1xuXG4gICAgdmFyIGJWZXJ0aWNlcyAgID0gdGhpcy5fYlZlcnRpY2VzLFxuICAgICAgICBiTm9ybWFscyAgICA9IHRoaXMuX2JOb3JtYWxzLFxuICAgICAgICBiTm9ybWFsc0xlbiA9IGJOb3JtYWxzLmxlbmd0aCxcbiAgICAgICAgYlZlcnRJbmRleDtcblxuICAgIHZhciB2ZXJ0SW5kZXgwLCB2ZXJ0SW5kZXgxLCB2ZXJ0SW5kZXgyLFxuICAgICAgICB2ZXJ0SW5kZXgzLCB2ZXJ0SW5kZXg0LCB2ZXJ0SW5kZXg1LFxuICAgICAgICB2ZXJ0SW5kZXg2LCB2ZXJ0SW5kZXg3LCB2ZXJ0SW5kZXg4O1xuXG4gICAgdmFyIHYweCx2MHksdjB6LFxuICAgICAgICB2MXgsdjF5LHYxeixcbiAgICAgICAgdjJ4LHYyeSx2Mno7XG5cbiAgICB2YXIgZTJ4LCBlMnksIGUyeixcbiAgICAgICAgZTF4LCBlMXksIGUxejtcblxuICAgIHZhciB2MEluZGV4LFxuICAgICAgICB2MUluZGV4LFxuICAgICAgICB2MkluZGV4O1xuXG4gICAgdmFyIG54LCBueSwgbnosXG4gICAgICAgIHZieCwgdmJ5LCB2Yno7XG5cblxuICAgIHZhciBpLCBqLCBrO1xuXG4gICAgdGhpcy5fbnVtVHJpYW5nbGVzID0gMDtcblxuICAgIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAgIGkgPSAtMTtcbiAgICB3aGlsZSgrK2k8Yk5vcm1hbHNMZW4pYk5vcm1hbHNbaV09MC4wO1xuXG5cbiAgICBpID0gLTE7XG4gICAgd2hpbGUoKytpIDwgY3ViZVNpemVaKVxuICAgIHtcbiAgICAgICAgaiA9IC0xO1xuICAgICAgICB3aGlsZSgrK2ogPCBjdWJlU2l6ZVkpXG4gICAgICAgIHtcbiAgICAgICAgICAgIGsgPSAtMTtcbiAgICAgICAgICAgIHdoaWxlKCsrayA8IGN1YmVTaXplWClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgICAgICAgICAgICAgICBtYXJjaEluZGV4ID0gaSAqIGN1YmVTaXplWlkgKyBqICogY3ViZVNpemVaICsgaztcbiAgICAgICAgICAgICAgICBjdWJlICAgICAgID0gY3ViZXNbbWFyY2hJbmRleF07XG5cbiAgICAgICAgICAgICAgICAvL2FjY2VzcyB2ZXJ0aWNlcyBvZiBjdWJlXG4gICAgICAgICAgICAgICAgdjAgPSB2ZXJ0c1tjdWJlWzBdXTtcbiAgICAgICAgICAgICAgICB2MSA9IHZlcnRzW2N1YmVbMV1dO1xuICAgICAgICAgICAgICAgIHYyID0gdmVydHNbY3ViZVsyXV07XG4gICAgICAgICAgICAgICAgdjMgPSB2ZXJ0c1tjdWJlWzNdXTtcbiAgICAgICAgICAgICAgICB2NCA9IHZlcnRzW2N1YmVbNF1dO1xuICAgICAgICAgICAgICAgIHY1ID0gdmVydHNbY3ViZVs1XV07XG4gICAgICAgICAgICAgICAgdjYgPSB2ZXJ0c1tjdWJlWzZdXTtcbiAgICAgICAgICAgICAgICB2NyA9IHZlcnRzW2N1YmVbN11dO1xuXG4gICAgICAgICAgICAgICAgdmFsMCA9IHYwWzNdO1xuICAgICAgICAgICAgICAgIHZhbDEgPSB2MVszXTtcbiAgICAgICAgICAgICAgICB2YWwyID0gdjJbM107XG4gICAgICAgICAgICAgICAgdmFsMyA9IHYzWzNdO1xuICAgICAgICAgICAgICAgIHZhbDQgPSB2NFszXTtcbiAgICAgICAgICAgICAgICB2YWw1ID0gdjVbM107XG4gICAgICAgICAgICAgICAgdmFsNiA9IHY2WzNdO1xuICAgICAgICAgICAgICAgIHZhbDcgPSB2N1szXTtcblxuICAgICAgICAgICAgICAgIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAgICAgICAgICAgICAgIGN1YmVJbmRleCA9IDA7XG5cbiAgICAgICAgICAgICAgICBpZih2YWwwPGlzb0xldmVsKSBjdWJlSW5kZXggfD0gMTtcbiAgICAgICAgICAgICAgICBpZih2YWwxPGlzb0xldmVsKSBjdWJlSW5kZXggfD0gMjtcbiAgICAgICAgICAgICAgICBpZih2YWwyPGlzb0xldmVsKSBjdWJlSW5kZXggfD0gODtcbiAgICAgICAgICAgICAgICBpZih2YWwzPGlzb0xldmVsKSBjdWJlSW5kZXggfD0gNDtcbiAgICAgICAgICAgICAgICBpZih2YWw0PGlzb0xldmVsKSBjdWJlSW5kZXggfD0gMTY7XG4gICAgICAgICAgICAgICAgaWYodmFsNTxpc29MZXZlbCkgY3ViZUluZGV4IHw9IDMyO1xuICAgICAgICAgICAgICAgIGlmKHZhbDY8aXNvTGV2ZWwpIGN1YmVJbmRleCB8PSAxMjg7XG4gICAgICAgICAgICAgICAgaWYodmFsNzxpc29MZXZlbCkgY3ViZUluZGV4IHw9IDY0O1xuXG4gICAgICAgICAgICAgICAgYml0cyA9IEVER0VfVEFCTEVbY3ViZUluZGV4XTtcblxuICAgICAgICAgICAgICAgIGlmKGJpdHMgPT09IDApY29udGludWU7XG5cbiAgICAgICAgICAgICAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgICAgICAgICAgICAgICB2YXIgdGVtcFZlcnRpY2VzID0gdGhpcy5fdGVtcFZlcnRpY2VzLFxuICAgICAgICAgICAgICAgICAgICB0ZW1wTm9ybWFscyAgPSB0aGlzLl90ZW1wTm9ybWFscztcblxuICAgICAgICAgICAgICAgIGlmIChiaXRzICYgMSlcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2ludHJwbCh2MCwgdjEsIHRlbXBWZXJ0aWNlcywgMCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX25vcm1hbCh0ZW1wVmVydGljZXMsMCx0ZW1wTm9ybWFscywwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGJpdHMgJiAyKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5faW50cnBsKHYxLCB2MywgdGVtcFZlcnRpY2VzLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fbm9ybWFsKHRlbXBWZXJ0aWNlcywxLHRlbXBOb3JtYWxzLDEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoYml0cyAmIDQpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9pbnRycGwodjIsIHYzLCB0ZW1wVmVydGljZXMsIDIpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9ub3JtYWwodGVtcFZlcnRpY2VzLDIsdGVtcE5vcm1hbHMsMik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChiaXRzICYgOClcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2ludHJwbCh2MCwgdjIsIHRlbXBWZXJ0aWNlcywgMyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX25vcm1hbCh0ZW1wVmVydGljZXMsMyx0ZW1wTm9ybWFscywzKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoYml0cyAmIDE2KVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5faW50cnBsKHY0LCB2NSwgdGVtcFZlcnRpY2VzLCA0KTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fbm9ybWFsKHRlbXBWZXJ0aWNlcyw0LHRlbXBOb3JtYWxzLDQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoYml0cyAmIDMyKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5faW50cnBsKHY1LCB2NywgdGVtcFZlcnRpY2VzLCA1KTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fbm9ybWFsKHRlbXBWZXJ0aWNlcyw1LHRlbXBOb3JtYWxzLDUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoYml0cyAmIDY0KVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5faW50cnBsKHY2LCB2NywgdGVtcFZlcnRpY2VzLCA2KTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fbm9ybWFsKHRlbXBWZXJ0aWNlcyw2LHRlbXBOb3JtYWxzLDYpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoYml0cyAmIDEyOClcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2ludHJwbCh2NCwgdjYsIHRlbXBWZXJ0aWNlcywgNyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX25vcm1hbCh0ZW1wVmVydGljZXMsNyx0ZW1wTm9ybWFscyw3KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoYml0cyAmIDI1NilcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2ludHJwbCh2MCwgdjQsIHRlbXBWZXJ0aWNlcywgOCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX25vcm1hbCh0ZW1wVmVydGljZXMsOCx0ZW1wTm9ybWFscyw4KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGJpdHMgJiA1MTIpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9pbnRycGwodjEsIHY1LCB0ZW1wVmVydGljZXMsIDkpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9ub3JtYWwodGVtcFZlcnRpY2VzLDksdGVtcE5vcm1hbHMsOSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChiaXRzICYgMTAyNClcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2ludHJwbCh2MywgdjcsIHRlbXBWZXJ0aWNlcywgMTApO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9ub3JtYWwodGVtcFZlcnRpY2VzLDEwLHRlbXBOb3JtYWxzLDEwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGJpdHMgJiAyMDQ4KVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5faW50cnBsKHYyLCB2NiwgdGVtcFZlcnRpY2VzLCAxMSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX25vcm1hbCh0ZW1wVmVydGljZXMsMTEsdGVtcE5vcm1hbHMsMTEpO1xuICAgICAgICAgICAgICAgIH1cblxuXG4gICAgICAgICAgICAgICAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4gICAgICAgICAgICAgICAgdmFyIGwgPSAwO1xuICAgICAgICAgICAgICAgIGN1YmVJbmRleCA8PD0gNDtcblxuXG4gICAgICAgICAgICAgICAgd2hpbGUoVFJJX1RBQkxFW2N1YmVJbmRleCArIGxdICE9IC0xKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4gICAgICAgICAgICAgICAgICAgIC8vZ2V0IGluZGljZXMgb2YgdHJpYW5nbGUgdmVydGljZXNcbiAgICAgICAgICAgICAgICAgICAgdjBJbmRleCA9IFRSSV9UQUJMRVtjdWJlSW5kZXggKyBsICAgIF0gKiAzO1xuICAgICAgICAgICAgICAgICAgICB2MUluZGV4ID0gVFJJX1RBQkxFW2N1YmVJbmRleCArIGwgKyAxXSAqIDM7XG4gICAgICAgICAgICAgICAgICAgIHYySW5kZXggPSBUUklfVEFCTEVbY3ViZUluZGV4ICsgbCArIDJdICogMztcblxuICAgICAgICAgICAgICAgICAgICBiVmVydEluZGV4ID0gdGhpcy5fbnVtVHJpYW5nbGVzICogOTtcblxuICAgICAgICAgICAgICAgICAgICB2ZXJ0SW5kZXgwID0gYlZlcnRJbmRleDtcbiAgICAgICAgICAgICAgICAgICAgdmVydEluZGV4MSA9IGJWZXJ0SW5kZXgrMTtcbiAgICAgICAgICAgICAgICAgICAgdmVydEluZGV4MiA9IGJWZXJ0SW5kZXgrMjtcbiAgICAgICAgICAgICAgICAgICAgdmVydEluZGV4MyA9IGJWZXJ0SW5kZXgrMztcbiAgICAgICAgICAgICAgICAgICAgdmVydEluZGV4NCA9IGJWZXJ0SW5kZXgrNDtcbiAgICAgICAgICAgICAgICAgICAgdmVydEluZGV4NSA9IGJWZXJ0SW5kZXgrNTtcbiAgICAgICAgICAgICAgICAgICAgdmVydEluZGV4NiA9IGJWZXJ0SW5kZXgrNjtcbiAgICAgICAgICAgICAgICAgICAgdmVydEluZGV4NyA9IGJWZXJ0SW5kZXgrNztcbiAgICAgICAgICAgICAgICAgICAgdmVydEluZGV4OCA9IGJWZXJ0SW5kZXgrODtcblxuICAgICAgICAgICAgICAgICAgICAvL3N0b3JlIHRyaWFuZ2xlIHZlcnRpY2VzIGluICdnbG9iYWwnIHZlcnRleCBidWZmZXIgKyBsb2NhbCBjYWNoaW5nXG4gICAgICAgICAgICAgICAgICAgIHYweCA9IGJWZXJ0aWNlc1t2ZXJ0SW5kZXgwXSA9IHRlbXBWZXJ0aWNlc1t2MEluZGV4XTtcbiAgICAgICAgICAgICAgICAgICAgdjB5ID0gYlZlcnRpY2VzW3ZlcnRJbmRleDFdID0gdGVtcFZlcnRpY2VzW3YwSW5kZXgrMV07XG4gICAgICAgICAgICAgICAgICAgIHYweiA9IGJWZXJ0aWNlc1t2ZXJ0SW5kZXgyXSA9IHRlbXBWZXJ0aWNlc1t2MEluZGV4KzJdO1xuXG4gICAgICAgICAgICAgICAgICAgIHYxeCA9IGJWZXJ0aWNlc1t2ZXJ0SW5kZXgzXSA9IHRlbXBWZXJ0aWNlc1t2MUluZGV4XTtcbiAgICAgICAgICAgICAgICAgICAgdjF5ID0gYlZlcnRpY2VzW3ZlcnRJbmRleDRdID0gdGVtcFZlcnRpY2VzW3YxSW5kZXgrMV07XG4gICAgICAgICAgICAgICAgICAgIHYxeiA9IGJWZXJ0aWNlc1t2ZXJ0SW5kZXg1XSA9IHRlbXBWZXJ0aWNlc1t2MUluZGV4KzJdO1xuXG4gICAgICAgICAgICAgICAgICAgIHYyeCA9IGJWZXJ0aWNlc1t2ZXJ0SW5kZXg2XSA9IHRlbXBWZXJ0aWNlc1t2MkluZGV4XTtcbiAgICAgICAgICAgICAgICAgICAgdjJ5ID0gYlZlcnRpY2VzW3ZlcnRJbmRleDddID0gdGVtcFZlcnRpY2VzW3YySW5kZXgrMV07XG4gICAgICAgICAgICAgICAgICAgIHYyeiA9IGJWZXJ0aWNlc1t2ZXJ0SW5kZXg4XSA9IHRlbXBWZXJ0aWNlc1t2MkluZGV4KzJdO1xuXG4gICAgICAgICAgICAgICAgICAgIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAgICAgICAgICAgICAgICAgICAvL2NhbGMgZmFjZSBub3JtYWxzIC0gcGVyIGZhY2UgLSBuYWl2ZSBUT0RPOkZJWE1FIVxuICAgICAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgICAgICB2YnggPSB2MXg7XG4gICAgICAgICAgICAgICAgICAgIHZieSA9IHYxeTtcbiAgICAgICAgICAgICAgICAgICAgdmJ6ID0gdjF6O1xuXG4gICAgICAgICAgICAgICAgICAgIGUxeCA9IHYweC12Yng7XG4gICAgICAgICAgICAgICAgICAgIGUxeSA9IHYweS12Ynk7XG4gICAgICAgICAgICAgICAgICAgIGUxeiA9IHYwei12Yno7XG5cbiAgICAgICAgICAgICAgICAgICAgZTJ4ID0gdjJ4LXZieDtcbiAgICAgICAgICAgICAgICAgICAgZTJ5ID0gdjJ5LXZieTtcbiAgICAgICAgICAgICAgICAgICAgZTJ6ID0gdjJ6LXZiejtcblxuICAgICAgICAgICAgICAgICAgICBueCA9IGUxeSAqIGUyeiAtIGUxeiAqIGUyeTtcbiAgICAgICAgICAgICAgICAgICAgbnkgPSBlMXogKiBlMnggLSBlMXggKiBlMno7XG4gICAgICAgICAgICAgICAgICAgIG56ID0gZTF4ICogZTJ5IC0gZTF5ICogZTJ4O1xuXG4gICAgICAgICAgICAgICAgICAgIGJOb3JtYWxzW3ZlcnRJbmRleDBdICs9IG54O1xuICAgICAgICAgICAgICAgICAgICBiTm9ybWFsc1t2ZXJ0SW5kZXgxXSArPSBueTtcbiAgICAgICAgICAgICAgICAgICAgYk5vcm1hbHNbdmVydEluZGV4Ml0gKz0gbno7XG4gICAgICAgICAgICAgICAgICAgIGJOb3JtYWxzW3ZlcnRJbmRleDNdICs9IG54O1xuICAgICAgICAgICAgICAgICAgICBiTm9ybWFsc1t2ZXJ0SW5kZXg0XSArPSBueTtcbiAgICAgICAgICAgICAgICAgICAgYk5vcm1hbHNbdmVydEluZGV4NV0gKz0gbno7XG4gICAgICAgICAgICAgICAgICAgIGJOb3JtYWxzW3ZlcnRJbmRleDZdICs9IG54O1xuICAgICAgICAgICAgICAgICAgICBiTm9ybWFsc1t2ZXJ0SW5kZXg3XSArPSBueTtcbiAgICAgICAgICAgICAgICAgICAgYk5vcm1hbHNbdmVydEluZGV4OF0gKz0gbno7XG5cbiAgICAgICAgICAgICAgICAgICAgKi9cblxuICAgICAgICAgICAgICAgICAgICBiTm9ybWFsc1t2ZXJ0SW5kZXgwXSA9IHRlbXBOb3JtYWxzW3YwSW5kZXggIF07XG4gICAgICAgICAgICAgICAgICAgIGJOb3JtYWxzW3ZlcnRJbmRleDFdID0gdGVtcE5vcm1hbHNbdjBJbmRleCsxXTtcbiAgICAgICAgICAgICAgICAgICAgYk5vcm1hbHNbdmVydEluZGV4Ml0gPSB0ZW1wTm9ybWFsc1t2MEluZGV4KzJdO1xuICAgICAgICAgICAgICAgICAgICBiTm9ybWFsc1t2ZXJ0SW5kZXgzXSA9IHRlbXBOb3JtYWxzW3YxSW5kZXggIF07XG4gICAgICAgICAgICAgICAgICAgIGJOb3JtYWxzW3ZlcnRJbmRleDRdID0gdGVtcE5vcm1hbHNbdjFJbmRleCsxXTtcbiAgICAgICAgICAgICAgICAgICAgYk5vcm1hbHNbdmVydEluZGV4NV0gPSB0ZW1wTm9ybWFsc1t2MUluZGV4KzJdO1xuICAgICAgICAgICAgICAgICAgICBiTm9ybWFsc1t2ZXJ0SW5kZXg2XSA9IHRlbXBOb3JtYWxzW3YySW5kZXggIF07XG4gICAgICAgICAgICAgICAgICAgIGJOb3JtYWxzW3ZlcnRJbmRleDddID0gdGVtcE5vcm1hbHNbdjJJbmRleCsxXTtcbiAgICAgICAgICAgICAgICAgICAgYk5vcm1hbHNbdmVydEluZGV4OF0gPSB0ZW1wTm9ybWFsc1t2MkluZGV4KzJdO1xuXG4gICAgICAgICAgICAgICAgICAgIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAgICAgICAgICAgICAgICAgICBsKz0zO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9udW1UcmlhbmdsZXMrKztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cblxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufTtcblxuXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbklTT1N1cmZhY2UucHJvdG90eXBlLl9pbnRycGwgPSBmdW5jdGlvbih2MCx2MSx2ZXJ0TGlzdCxpbmRleClcbntcbiAgICBpbmRleCAqPSAzO1xuXG4gICAgdmFyIHYwdiA9IHYwWzNdLFxuICAgICAgICB2MXYgPSB2MVszXTtcblxuICAgIHZhciBpc29MZXZlbCA9IHRoaXMuX2lzb0xldmVsO1xuXG4gICAgaWYoTWF0aC5hYnMoaXNvTGV2ZWwgLSB2MHYpIDwgMC4wMDAwMSlcbiAgICB7XG4gICAgICAgIHZlcnRMaXN0W2luZGV4ICAgIF0gPSB2MFswXTtcbiAgICAgICAgdmVydExpc3RbaW5kZXggKyAxXSA9IHYwWzFdO1xuICAgICAgICB2ZXJ0TGlzdFtpbmRleCArIDJdID0gdjBbMl07XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZihNYXRoLmFicyhpc29MZXZlbCAtIHYxdikgPCAwLjAwMDAxKVxuICAgIHtcbiAgICAgICAgdmVydExpc3RbaW5kZXggICAgXSA9IHYxWzBdO1xuICAgICAgICB2ZXJ0TGlzdFtpbmRleCArIDFdID0gdjFbMV07XG4gICAgICAgIHZlcnRMaXN0W2luZGV4ICsgMl0gPSB2MVsyXTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmKE1hdGguYWJzKHYwdiAtIHYxdikgPCAwLjAwMDAxKVxuICAgIHtcbiAgICAgICAgdmVydExpc3RbaW5kZXggICAgXSA9IHYxWzBdO1xuICAgICAgICB2ZXJ0TGlzdFtpbmRleCArIDFdID0gdjFbMV07XG4gICAgICAgIHZlcnRMaXN0W2luZGV4ICsgMl0gPSB2MVsyXTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuXG4gICAgdmFyIGludHJwbCAgPSAoaXNvTGV2ZWwgLSB2MHYpIC8gKHYxdiAtIHYwdik7XG5cbiAgICB2YXIgdjB4ID0gdjBbMF0sXG4gICAgICAgIHYweSA9IHYwWzFdLFxuICAgICAgICB2MHogPSB2MFsyXTtcblxuICAgIHZlcnRMaXN0W2luZGV4ICAgIF0gPSB2MHggKyAodjFbMF0gLSB2MHgpICogaW50cnBsO1xuICAgIHZlcnRMaXN0W2luZGV4ICsgMV0gPSB2MHkgKyAodjFbMV0gLSB2MHkpICogaW50cnBsO1xuICAgIHZlcnRMaXN0W2luZGV4ICsgMl0gPSB2MHogKyAodjFbMl0gLSB2MHopICogaW50cnBsO1xufTtcblxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG5JU09TdXJmYWNlLnByb3RvdHlwZS5fbm9ybWFsID0gZnVuY3Rpb24odmVydExpc3QsdmVydEluZGV4LG5vcm1MaXN0LG5vcm1JbmRleClcbntcbiAgICB2ZXJ0SW5kZXggKj0gMztcblxuICAgIHZhciB4ID0gdmVydExpc3RbdmVydEluZGV4ICAgXSxcbiAgICAgICAgeSA9IHZlcnRMaXN0W3ZlcnRJbmRleCsxXSxcbiAgICAgICAgeiA9IHZlcnRMaXN0W3ZlcnRJbmRleCsyXTtcblxuICAgIHZhciBhcmcwID0gdGhpcy5fZnVuY0FyZzAsXG4gICAgICAgIGFyZzEgPSB0aGlzLl9mdW5jQXJnMSxcbiAgICAgICAgYXJnMiA9IHRoaXMuX2Z1bmNBcmcyO1xuXG4gICAgdmFyIGVwcyA9IDAuMDAwMztcblxuICAgIHZhciB2YWwgPSB0aGlzLl9mdW5jKHgseSx6LGFyZzAsYXJnMSxhcmcyKTtcblxuICAgIHZhciBueCA9IHRoaXMuX2Z1bmMoeCArIGVwcyx5ICwgeiwgYXJnMCwgYXJnMSwgYXJnMikgLSB2YWwsXG4gICAgICAgIG55ID0gdGhpcy5fZnVuYyh4LCB5ICsgZXBzLCB6LCBhcmcwLCBhcmcxLCBhcmcyKSAtIHZhbCxcbiAgICAgICAgbnogPSB0aGlzLl9mdW5jKHgsIHksIHogKyBlcHMsIGFyZzAsIGFyZzEsIGFyZzIpIC0gdmFsLFxuICAgICAgICBkICA9IDEgLyBNYXRoLnNxcnQobngqbngrbnkqbnkrbnoqbnopO1xuXG5cbiAgICBub3JtSW5kZXggKj0gMztcblxuICAgIG5vcm1MaXN0W25vcm1JbmRleF0gICA9IHgqZCotMTtcbiAgICBub3JtTGlzdFtub3JtSW5kZXgrMV0gPSB5KmQqLTE7XG4gICAgbm9ybUxpc3Rbbm9ybUluZGV4KzJdID0geipkKi0xO1xuXG59O1xuXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbklTT1N1cmZhY2UucHJvdG90eXBlLnNldENsb3NlU2lkZXMgPSBmdW5jdGlvbihib29sKXt9XG5cbklTT1N1cmZhY2UucHJvdG90eXBlLnNldEZ1bmN0aW9uID0gZnVuY3Rpb24oZnVuYyxpc29MZXZlbClcbntcbiAgICB2YXIgZnVuY0FyZ3NMZW5ndGggPSBmdW5jLmxlbmd0aDtcblxuICAgIGlmKGZ1bmNBcmdzTGVuZ3RoIDwgMyl0aHJvdyAnRnVuY3Rpb24gc2hvdWxkIHNhdGlzZnkgZnVuY3Rpb24oeCx5LHope30nO1xuICAgIGlmKGZ1bmNBcmdzTGVuZ3RoID4gNil0aHJvdyAnRnVuY3Rpb24gaGFzIHRvIG1hbnkgYXJndW1lbnRzLiBBcmd1bWVudHMgbGVuZ3RoIHNob3VsZCBub3QgZXhjZWVkIDYuIEUuZyBmdW5jdGlvbih4LHkseixhcmcwLGFyZzEsYXJnMikuJztcblxuICAgIHZhciBmdW5jU3RyaW5nID0gZnVuYy50b1N0cmluZygpLFxuICAgICAgICBmdW5jQXJncyAgID0gZnVuY1N0cmluZy5zbGljZShmdW5jU3RyaW5nLmluZGV4T2YoJygnKSArIDEsIGZ1bmNTdHJpbmcuaW5kZXhPZignKScpKS5zcGxpdCgnLCcpLFxuICAgICAgICBmdW5jQm9keSAgID0gZnVuY1N0cmluZy5zbGljZShmdW5jU3RyaW5nLmluZGV4T2YoJ3snKSArIDEsIGZ1bmNTdHJpbmcubGFzdEluZGV4T2YoJ30nKSk7XG5cbiAgICB0aGlzLl9mdW5jICAgICA9IG5ldyBGdW5jdGlvbihmdW5jQXJnc1swXSwgZnVuY0FyZ3NbMV0sIGZ1bmNBcmdzWzJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmNBcmdzWzNdIHx8ICdhcmcwJywgZnVuY0FyZ3NbNF0gfHwgJ2FyZzEnLCBmdW5jQXJnc1s1XSB8fCAnYXJnMicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZnVuY0JvZHkpO1xuICAgIHRoaXMuX2lzb0xldmVsID0gaXNvTGV2ZWwgfHwgMDtcbn07XG5cbklTT1N1cmZhY2UucHJvdG90eXBlLnNldEZ1bmN0aW9uVW5zYWZlID0gZnVuY3Rpb24oZnVuYyxpc29MZXZlbClcbntcbiAgICB0aGlzLl9mdW5jICAgICA9IGZ1bmM7XG4gICAgdGhpcy5faXNvTGV2ZWwgPSBpc29MZXZlbCB8fCAwO1xufTtcblxuSVNPU3VyZmFjZS5wcm90b3R5cGUuZ2V0RnVuY3Rpb24gPSBmdW5jdGlvbigpe3JldHVybiB0aGlzLl9mdW5jO307XG5JU09TdXJmYWNlLnByb3RvdHlwZS5zZXRJU09MZXZlbCA9IGZ1bmN0aW9uKGlzb0xldmVsKXt0aGlzLl9pc29MZXZlbCA9IGlzb0xldmVsO307XG5cbklTT1N1cmZhY2UucHJvdG90eXBlLmFwcGx5RnVuY3Rpb24gICA9IGZ1bmN0aW9uKCkgICAgICAgICB7dGhpcy5hcHBseUZ1bmN0aW9uM2YoMCwwLDApO307XG5JU09TdXJmYWNlLnByb3RvdHlwZS5hcHBseUZ1bmN0aW9uMWYgPSBmdW5jdGlvbihhcmcwKSAgICAge3RoaXMuYXBwbHlGdW5jdGlvbjNmKGFyZzAsMCwwKTt9O1xuSVNPU3VyZmFjZS5wcm90b3R5cGUuYXBwbHlGdW5jdGlvbjJmID0gZnVuY3Rpb24oYXJnMCxhcmcxKXt0aGlzLmFwcGx5RnVuY3Rpb24zZihhcmcwLGFyZzEsMCk7fTtcblxuSVNPU3VyZmFjZS5wcm90b3R5cGUuYXBwbHlGdW5jdGlvbjNmID0gZnVuY3Rpb24oYXJnMCxhcmcxLGFyZzIpXG57XG4gICAgdmFyIHZlcnRTaXplWCAgPSB0aGlzLl92ZXJ0U2l6ZVgsXG4gICAgICAgIHZlcnRTaXplWSAgPSB0aGlzLl92ZXJ0U2l6ZVksXG4gICAgICAgIHZlcnRTaXplWiAgPSB0aGlzLl92ZXJ0U2l6ZVosXG4gICAgICAgIHZlcnRTaXplWVggPSB2ZXJ0U2l6ZVkgKiB2ZXJ0U2l6ZVg7XG5cbiAgICB2YXIgdmVydHMgPSB0aGlzLl92ZXJ0cyxcbiAgICAgICAgdmVydCwgdmVydHNJbmRleDtcblxuICAgIHZhciBpLCBqLCBrO1xuXG4gICAgdGhpcy5fZnVuY0FyZzAgPSBhcmcwO1xuICAgIHRoaXMuX2Z1bmNBcmcxID0gYXJnMTtcbiAgICB0aGlzLl9mdW5jQXJnMiA9IGFyZzI7XG5cbiAgICBpID0gLTE7XG5cbiAgICB3aGlsZSgrK2kgPCB2ZXJ0U2l6ZVopXG4gICAge1xuICAgICAgICBqID0gLTE7XG4gICAgICAgIHdoaWxlKCsraiA8IHZlcnRTaXplWSlcbiAgICAgICAge1xuICAgICAgICAgICAgayA9IC0xO1xuICAgICAgICAgICAgd2hpbGUoKytrIDwgdmVydFNpemVYKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHZlcnRzSW5kZXggPSBpICogdmVydFNpemVZWCArIGogKiB2ZXJ0U2l6ZVggKyBrO1xuICAgICAgICAgICAgICAgIHZlcnQgICAgICAgPSB2ZXJ0c1t2ZXJ0c0luZGV4XTtcbiAgICAgICAgICAgICAgICB2ZXJ0WzNdICAgID0gdGhpcy5fZnVuYyh2ZXJ0WzBdLHZlcnRbMV0sdmVydFsyXSxhcmcwLGFyZzEsYXJnMik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cblxuSVNPU3VyZmFjZS5wcm90b3R5cGUuX2dlblN1cmZhY2UgPSBmdW5jdGlvbigpXG57XG4gICAgdmFyIHZlcnRTaXplWCAgPSB0aGlzLl92ZXJ0U2l6ZVgsXG4gICAgICAgIHZlcnRTaXplWSAgPSB0aGlzLl92ZXJ0U2l6ZVksXG4gICAgICAgIHZlcnRTaXplWiAgPSB0aGlzLl92ZXJ0U2l6ZVosXG4gICAgICAgIHZlcnRTaXplWlkgPSB2ZXJ0U2l6ZVogKiB2ZXJ0U2l6ZVksXG4gICAgICAgIHZlcnRTaXplWFkgPSB2ZXJ0U2l6ZVggKiB2ZXJ0U2l6ZVk7XG5cbiAgICB2YXIgdmVydHMgPSB0aGlzLl92ZXJ0cyxcbiAgICAgICAgdmVydHNJbmRleDtcblxuICAgIHZhciBjdWJlU2l6ZVggID0gdGhpcy5fY3ViZVNpemVYLFxuICAgICAgICBjdWJlU2l6ZVkgID0gdGhpcy5fY3ViZVNpemVZLFxuICAgICAgICBjdWJlU2l6ZVogID0gdGhpcy5fY3ViZVNpemVaLFxuICAgICAgICBjdWJlU2l6ZVpZID0gY3ViZVNpemVZICogY3ViZVNpemVaO1xuXG4gICAgdmFyIGN1YmVzID0gdGhpcy5fY3ViZXMsXG4gICAgICAgIGNlbGxzSW5kZXg7XG5cbiAgICB2YXIgc2NhbGVYWVogPSB0aGlzLl9zY2FsZVhZWjtcblxuICAgIHZhciBpLCBqLCBrO1xuXG4gICAgaSA9IC0xO1xuXG4gICAgd2hpbGUoKytpIDwgdmVydFNpemVaKVxuICAgIHtcbiAgICAgICAgaiA9IC0xO1xuICAgICAgICB3aGlsZSgrK2ogPCB2ZXJ0U2l6ZVkpXG4gICAgICAgIHtcbiAgICAgICAgICAgIGsgPSAtMTtcbiAgICAgICAgICAgIHdoaWxlKCsrayA8IHZlcnRTaXplWClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB2ZXJ0c0luZGV4ICAgICAgICA9IGkgKiB2ZXJ0U2l6ZVpZICsgaiAqIHZlcnRTaXplWiArIGs7XG5cbiAgICAgICAgICAgICAgICB2ZXJ0c1t2ZXJ0c0luZGV4XSA9IFsoLTAuNSArICggayAvICh2ZXJ0U2l6ZVggLSAxKSkpICogc2NhbGVYWVpbMF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKC0wLjUgKyAoIGogLyAodmVydFNpemVZIC0gMSkpKSAqIHNjYWxlWFlaWzFdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICgtMC41ICsgKCBpIC8gKHZlcnRTaXplWiAtIDEpKSkgKiBzY2FsZVhZWlsyXSxcbiAgICAgICAgICAgICAgICAgICAgLTFdO1xuXG5cbiAgICAgICAgICAgICAgICBpZihpIDwgY3ViZVNpemVYICYmIGogPCBjdWJlU2l6ZVkgJiYgayAgPCBjdWJlU2l6ZVopXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBjZWxsc0luZGV4ID0gaSAqIGN1YmVTaXplWlkgKyBqICogY3ViZVNpemVYICsgaztcblxuICAgICAgICAgICAgICAgICAgICBjdWJlc1tjZWxsc0luZGV4XSA9IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZlcnRzSW5kZXgsXG4gICAgICAgICAgICAgICAgICAgICAgICB2ZXJ0c0luZGV4ICsgMSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZlcnRzSW5kZXggKyB2ZXJ0U2l6ZVosXG4gICAgICAgICAgICAgICAgICAgICAgICB2ZXJ0c0luZGV4ICsgdmVydFNpemVaICsgMSxcblxuICAgICAgICAgICAgICAgICAgICAgICAgdmVydHNJbmRleCArIHZlcnRTaXplWFksXG4gICAgICAgICAgICAgICAgICAgICAgICB2ZXJ0c0luZGV4ICsgdmVydFNpemVYWSArIDEsXG4gICAgICAgICAgICAgICAgICAgICAgICB2ZXJ0c0luZGV4ICsgdmVydFNpemVaICsgdmVydFNpemVYWSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZlcnRzSW5kZXggKyB2ZXJ0U2l6ZVogKyB2ZXJ0U2l6ZVhZICsgMVxuICAgICAgICAgICAgICAgICAgICBdO1xuXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG59O1xuXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbklTT1N1cmZhY2UucHJvdG90eXBlLl9kcmF3ID0gZnVuY3Rpb24oZ2wpXG57XG4gICAgZ2wuZGlzYWJsZURlZmF1bHRUZXhDb29yZHNBdHRyaWJBcnJheSgpO1xuICAgIGdsLmVuYWJsZURlZmF1bHROb3JtYWxBdHRyaWJBcnJheSgpO1xuXG4gICAgdmFyIF9nbCA9IGdsLmdsO1xuXG4gICAgdmFyIGdsQXJyYXlCdWZmZXIgPSBfZ2wuQVJSQVlfQlVGRkVSLFxuICAgICAgICBnbEZsb2F0ICAgICAgID0gX2dsLkZMT0FUO1xuXG4gICAgdmFyIHZlcnRpY2VzID0gdGhpcy5fYlZlcnRpY2VzLFxuICAgICAgICBub3JtYWxzICA9IHRoaXMuX2JOb3JtYWxzLFxuICAgICAgICBjb2xvcnMgICA9IHRoaXMuX2JDb2xvcnM7XG5cbiAgICB2YXIgdmJsZW4gPSB2ZXJ0aWNlcy5ieXRlTGVuZ3RoLFxuICAgICAgICBuYmxlbiA9IG5vcm1hbHMuYnl0ZUxlbmd0aCxcbiAgICAgICAgY2JsZW4gPSBjb2xvcnMuYnl0ZUxlbmd0aDtcblxuICAgIHZhciBvZmZzZXRWID0gMCxcbiAgICAgICAgb2Zmc2V0TiA9IG9mZnNldFYgKyB2YmxlbixcbiAgICAgICAgb2Zmc2V0QyA9IG9mZnNldE4gKyBuYmxlbjtcblxuICAgIF9nbC5idWZmZXJEYXRhKGdsQXJyYXlCdWZmZXIsIHZibGVuICsgbmJsZW4gKyBjYmxlbiwgX2dsLkRZTkFNSUNfRFJBVyk7XG5cbiAgICBfZ2wuYnVmZmVyU3ViRGF0YShnbEFycmF5QnVmZmVyLCBvZmZzZXRWLCAgdmVydGljZXMpO1xuICAgIF9nbC5idWZmZXJTdWJEYXRhKGdsQXJyYXlCdWZmZXIsIG9mZnNldE4sICBub3JtYWxzKTtcbiAgICBfZ2wuYnVmZmVyU3ViRGF0YShnbEFycmF5QnVmZmVyLCBvZmZzZXRDLCAgY29sb3JzKTtcblxuICAgIF9nbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKGdsLmdldERlZmF1bHRWZXJ0ZXhBdHRyaWIoKSwgMywgZ2xGbG9hdCwgZmFsc2UsIDAsIG9mZnNldFYpO1xuICAgIF9nbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKGdsLmdldERlZmF1bHROb3JtYWxBdHRyaWIoKSwgMywgZ2xGbG9hdCwgZmFsc2UsIDAsIG9mZnNldE4pO1xuICAgIF9nbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKGdsLmdldERlZmF1bHRDb2xvckF0dHJpYigpLCAgNCwgZ2xGbG9hdCwgZmFsc2UsIDAsIG9mZnNldEMpO1xuXG4gICAgZ2wuc2V0TWF0cmljZXNVbmlmb3JtKCk7XG4gICAgX2dsLmRyYXdBcnJheXMoX2dsLlRSSUFOR0xFUywwLHRoaXMuX251bVRyaWFuZ2xlcyAqIDMpO1xufTtcblxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG5JU09TdXJmYWNlLkVER0VfVEFCTEUgPSBuZXcgSW50MzJBcnJheShcbiAgICBbXG4gICAgICAgIDB4MCAgLCAweDEwOSwgMHgyMDMsIDB4MzBhLCAweDQwNiwgMHg1MGYsIDB4NjA1LCAweDcwYyxcbiAgICAgICAgMHg4MGMsIDB4OTA1LCAweGEwZiwgMHhiMDYsIDB4YzBhLCAweGQwMywgMHhlMDksIDB4ZjAwLFxuICAgICAgICAweDE5MCwgMHg5OSAsIDB4MzkzLCAweDI5YSwgMHg1OTYsIDB4NDlmLCAweDc5NSwgMHg2OWMsXG4gICAgICAgIDB4OTljLCAweDg5NSwgMHhiOWYsIDB4YTk2LCAweGQ5YSwgMHhjOTMsIDB4Zjk5LCAweGU5MCxcbiAgICAgICAgMHgyMzAsIDB4MzM5LCAweDMzICwgMHgxM2EsIDB4NjM2LCAweDczZiwgMHg0MzUsIDB4NTNjLFxuICAgICAgICAweGEzYywgMHhiMzUsIDB4ODNmLCAweDkzNiwgMHhlM2EsIDB4ZjMzLCAweGMzOSwgMHhkMzAsXG4gICAgICAgIDB4M2EwLCAweDJhOSwgMHgxYTMsIDB4YWEgLCAweDdhNiwgMHg2YWYsIDB4NWE1LCAweDRhYyxcbiAgICAgICAgMHhiYWMsIDB4YWE1LCAweDlhZiwgMHg4YTYsIDB4ZmFhLCAweGVhMywgMHhkYTksIDB4Y2EwLFxuICAgICAgICAweDQ2MCwgMHg1NjksIDB4NjYzLCAweDc2YSwgMHg2NiAsIDB4MTZmLCAweDI2NSwgMHgzNmMsXG4gICAgICAgIDB4YzZjLCAweGQ2NSwgMHhlNmYsIDB4ZjY2LCAweDg2YSwgMHg5NjMsIDB4YTY5LCAweGI2MCxcbiAgICAgICAgMHg1ZjAsIDB4NGY5LCAweDdmMywgMHg2ZmEsIDB4MWY2LCAweGZmICwgMHgzZjUsIDB4MmZjLFxuICAgICAgICAweGRmYywgMHhjZjUsIDB4ZmZmLCAweGVmNiwgMHg5ZmEsIDB4OGYzLCAweGJmOSwgMHhhZjAsXG4gICAgICAgIDB4NjUwLCAweDc1OSwgMHg0NTMsIDB4NTVhLCAweDI1NiwgMHgzNWYsIDB4NTUgLCAweDE1YyxcbiAgICAgICAgMHhlNWMsIDB4ZjU1LCAweGM1ZiwgMHhkNTYsIDB4YTVhLCAweGI1MywgMHg4NTksIDB4OTUwLFxuICAgICAgICAweDdjMCwgMHg2YzksIDB4NWMzLCAweDRjYSwgMHgzYzYsIDB4MmNmLCAweDFjNSwgMHhjYyAsXG4gICAgICAgIDB4ZmNjLCAweGVjNSwgMHhkY2YsIDB4Y2M2LCAweGJjYSwgMHhhYzMsIDB4OWM5LCAweDhjMCxcbiAgICAgICAgMHg4YzAsIDB4OWM5LCAweGFjMywgMHhiY2EsIDB4Y2M2LCAweGRjZiwgMHhlYzUsIDB4ZmNjLFxuICAgICAgICAweGNjICwgMHgxYzUsIDB4MmNmLCAweDNjNiwgMHg0Y2EsIDB4NWMzLCAweDZjOSwgMHg3YzAsXG4gICAgICAgIDB4OTUwLCAweDg1OSwgMHhiNTMsIDB4YTVhLCAweGQ1NiwgMHhjNWYsIDB4ZjU1LCAweGU1YyxcbiAgICAgICAgMHgxNWMsIDB4NTUgLCAweDM1ZiwgMHgyNTYsIDB4NTVhLCAweDQ1MywgMHg3NTksIDB4NjUwLFxuICAgICAgICAweGFmMCwgMHhiZjksIDB4OGYzLCAweDlmYSwgMHhlZjYsIDB4ZmZmLCAweGNmNSwgMHhkZmMsXG4gICAgICAgIDB4MmZjLCAweDNmNSwgMHhmZiAsIDB4MWY2LCAweDZmYSwgMHg3ZjMsIDB4NGY5LCAweDVmMCxcbiAgICAgICAgMHhiNjAsIDB4YTY5LCAweDk2MywgMHg4NmEsIDB4ZjY2LCAweGU2ZiwgMHhkNjUsIDB4YzZjLFxuICAgICAgICAweDM2YywgMHgyNjUsIDB4MTZmLCAweDY2ICwgMHg3NmEsIDB4NjYzLCAweDU2OSwgMHg0NjAsXG4gICAgICAgIDB4Y2EwLCAweGRhOSwgMHhlYTMsIDB4ZmFhLCAweDhhNiwgMHg5YWYsIDB4YWE1LCAweGJhYyxcbiAgICAgICAgMHg0YWMsIDB4NWE1LCAweDZhZiwgMHg3YTYsIDB4YWEgLCAweDFhMywgMHgyYTksIDB4M2EwLFxuICAgICAgICAweGQzMCwgMHhjMzksIDB4ZjMzLCAweGUzYSwgMHg5MzYsIDB4ODNmLCAweGIzNSwgMHhhM2MsXG4gICAgICAgIDB4NTNjLCAweDQzNSwgMHg3M2YsIDB4NjM2LCAweDEzYSwgMHgzMyAsIDB4MzM5LCAweDIzMCxcbiAgICAgICAgMHhlOTAsIDB4Zjk5LCAweGM5MywgMHhkOWEsIDB4YTk2LCAweGI5ZiwgMHg4OTUsIDB4OTljLFxuICAgICAgICAweDY5YywgMHg3OTUsIDB4NDlmLCAweDU5NiwgMHgyOWEsIDB4MzkzLCAweDk5ICwgMHgxOTAsXG4gICAgICAgIDB4ZjAwLCAweGUwOSwgMHhkMDMsIDB4YzBhLCAweGIwNiwgMHhhMGYsIDB4OTA1LCAweDgwYyxcbiAgICAgICAgMHg3MGMsIDB4NjA1LCAweDUwZiwgMHg0MDYsIDB4MzBhLCAweDIwMywgMHgxMDksIDB4MFxuICAgIF0pO1xuXG5JU09TdXJmYWNlLlRSSV9UQUJMRSA9IG5ldyBJbnQzMkFycmF5KFxuICAgIFtcbiAgICAgICAgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsXG4gICAgICAgIDAsIDgsIDMsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICAwLCAxLCA5LCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgMSwgOCwgMywgOSwgOCwgMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsXG4gICAgICAgIDEsIDIsIDEwLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgMCwgOCwgMywgMSwgMiwgMTAsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICA5LCAyLCAxMCwgMCwgMiwgOSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsXG4gICAgICAgIDIsIDgsIDMsIDIsIDEwLCA4LCAxMCwgOSwgOCwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsXG4gICAgICAgIDMsIDExLCAyLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgMCwgMTEsIDIsIDgsIDExLCAwLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgMSwgOSwgMCwgMiwgMywgMTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICAxLCAxMSwgMiwgMSwgOSwgMTEsIDksIDgsIDExLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgMywgMTAsIDEsIDExLCAxMCwgMywgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsXG4gICAgICAgIDAsIDEwLCAxLCAwLCA4LCAxMCwgOCwgMTEsIDEwLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgMywgOSwgMCwgMywgMTEsIDksIDExLCAxMCwgOSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsXG4gICAgICAgIDksIDgsIDEwLCAxMCwgOCwgMTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICA0LCA3LCA4LCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgNCwgMywgMCwgNywgMywgNCwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsXG4gICAgICAgIDAsIDEsIDksIDgsIDQsIDcsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICA0LCAxLCA5LCA0LCA3LCAxLCA3LCAzLCAxLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgMSwgMiwgMTAsIDgsIDQsIDcsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICAzLCA0LCA3LCAzLCAwLCA0LCAxLCAyLCAxMCwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsXG4gICAgICAgIDksIDIsIDEwLCA5LCAwLCAyLCA4LCA0LCA3LCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgMiwgMTAsIDksIDIsIDksIDcsIDIsIDcsIDMsIDcsIDksIDQsIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICA4LCA0LCA3LCAzLCAxMSwgMiwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsXG4gICAgICAgIDExLCA0LCA3LCAxMSwgMiwgNCwgMiwgMCwgNCwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsXG4gICAgICAgIDksIDAsIDEsIDgsIDQsIDcsIDIsIDMsIDExLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgNCwgNywgMTEsIDksIDQsIDExLCA5LCAxMSwgMiwgOSwgMiwgMSwgLTEsIC0xLCAtMSwgLTEsXG4gICAgICAgIDMsIDEwLCAxLCAzLCAxMSwgMTAsIDcsIDgsIDQsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICAxLCAxMSwgMTAsIDEsIDQsIDExLCAxLCAwLCA0LCA3LCAxMSwgNCwgLTEsIC0xLCAtMSwgLTEsXG4gICAgICAgIDQsIDcsIDgsIDksIDAsIDExLCA5LCAxMSwgMTAsIDExLCAwLCAzLCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgNCwgNywgMTEsIDQsIDExLCA5LCA5LCAxMSwgMTAsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICA5LCA1LCA0LCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgOSwgNSwgNCwgMCwgOCwgMywgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsXG4gICAgICAgIDAsIDUsIDQsIDEsIDUsIDAsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICA4LCA1LCA0LCA4LCAzLCA1LCAzLCAxLCA1LCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgMSwgMiwgMTAsIDksIDUsIDQsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICAzLCAwLCA4LCAxLCAyLCAxMCwgNCwgOSwgNSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsXG4gICAgICAgIDUsIDIsIDEwLCA1LCA0LCAyLCA0LCAwLCAyLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgMiwgMTAsIDUsIDMsIDIsIDUsIDMsIDUsIDQsIDMsIDQsIDgsIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICA5LCA1LCA0LCAyLCAzLCAxMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsXG4gICAgICAgIDAsIDExLCAyLCAwLCA4LCAxMSwgNCwgOSwgNSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsXG4gICAgICAgIDAsIDUsIDQsIDAsIDEsIDUsIDIsIDMsIDExLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgMiwgMSwgNSwgMiwgNSwgOCwgMiwgOCwgMTEsIDQsIDgsIDUsIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICAxMCwgMywgMTEsIDEwLCAxLCAzLCA5LCA1LCA0LCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgNCwgOSwgNSwgMCwgOCwgMSwgOCwgMTAsIDEsIDgsIDExLCAxMCwgLTEsIC0xLCAtMSwgLTEsXG4gICAgICAgIDUsIDQsIDAsIDUsIDAsIDExLCA1LCAxMSwgMTAsIDExLCAwLCAzLCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgNSwgNCwgOCwgNSwgOCwgMTAsIDEwLCA4LCAxMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsXG4gICAgICAgIDksIDcsIDgsIDUsIDcsIDksIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICA5LCAzLCAwLCA5LCA1LCAzLCA1LCA3LCAzLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgMCwgNywgOCwgMCwgMSwgNywgMSwgNSwgNywgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsXG4gICAgICAgIDEsIDUsIDMsIDMsIDUsIDcsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICA5LCA3LCA4LCA5LCA1LCA3LCAxMCwgMSwgMiwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsXG4gICAgICAgIDEwLCAxLCAyLCA5LCA1LCAwLCA1LCAzLCAwLCA1LCA3LCAzLCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgOCwgMCwgMiwgOCwgMiwgNSwgOCwgNSwgNywgMTAsIDUsIDIsIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICAyLCAxMCwgNSwgMiwgNSwgMywgMywgNSwgNywgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsXG4gICAgICAgIDcsIDksIDUsIDcsIDgsIDksIDMsIDExLCAyLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgOSwgNSwgNywgOSwgNywgMiwgOSwgMiwgMCwgMiwgNywgMTEsIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICAyLCAzLCAxMSwgMCwgMSwgOCwgMSwgNywgOCwgMSwgNSwgNywgLTEsIC0xLCAtMSwgLTEsXG4gICAgICAgIDExLCAyLCAxLCAxMSwgMSwgNywgNywgMSwgNSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsXG4gICAgICAgIDksIDUsIDgsIDgsIDUsIDcsIDEwLCAxLCAzLCAxMCwgMywgMTEsIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICA1LCA3LCAwLCA1LCAwLCA5LCA3LCAxMSwgMCwgMSwgMCwgMTAsIDExLCAxMCwgMCwgLTEsXG4gICAgICAgIDExLCAxMCwgMCwgMTEsIDAsIDMsIDEwLCA1LCAwLCA4LCAwLCA3LCA1LCA3LCAwLCAtMSxcbiAgICAgICAgMTEsIDEwLCA1LCA3LCAxMSwgNSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsXG4gICAgICAgIDEwLCA2LCA1LCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgMCwgOCwgMywgNSwgMTAsIDYsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICA5LCAwLCAxLCA1LCAxMCwgNiwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsXG4gICAgICAgIDEsIDgsIDMsIDEsIDksIDgsIDUsIDEwLCA2LCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgMSwgNiwgNSwgMiwgNiwgMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsXG4gICAgICAgIDEsIDYsIDUsIDEsIDIsIDYsIDMsIDAsIDgsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICA5LCA2LCA1LCA5LCAwLCA2LCAwLCAyLCA2LCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgNSwgOSwgOCwgNSwgOCwgMiwgNSwgMiwgNiwgMywgMiwgOCwgLTEsIC0xLCAtMSwgLTEsXG4gICAgICAgIDIsIDMsIDExLCAxMCwgNiwgNSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsXG4gICAgICAgIDExLCAwLCA4LCAxMSwgMiwgMCwgMTAsIDYsIDUsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICAwLCAxLCA5LCAyLCAzLCAxMSwgNSwgMTAsIDYsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICA1LCAxMCwgNiwgMSwgOSwgMiwgOSwgMTEsIDIsIDksIDgsIDExLCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgNiwgMywgMTEsIDYsIDUsIDMsIDUsIDEsIDMsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICAwLCA4LCAxMSwgMCwgMTEsIDUsIDAsIDUsIDEsIDUsIDExLCA2LCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgMywgMTEsIDYsIDAsIDMsIDYsIDAsIDYsIDUsIDAsIDUsIDksIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICA2LCA1LCA5LCA2LCA5LCAxMSwgMTEsIDksIDgsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICA1LCAxMCwgNiwgNCwgNywgOCwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsXG4gICAgICAgIDQsIDMsIDAsIDQsIDcsIDMsIDYsIDUsIDEwLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgMSwgOSwgMCwgNSwgMTAsIDYsIDgsIDQsIDcsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICAxMCwgNiwgNSwgMSwgOSwgNywgMSwgNywgMywgNywgOSwgNCwgLTEsIC0xLCAtMSwgLTEsXG4gICAgICAgIDYsIDEsIDIsIDYsIDUsIDEsIDQsIDcsIDgsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICAxLCAyLCA1LCA1LCAyLCA2LCAzLCAwLCA0LCAzLCA0LCA3LCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgOCwgNCwgNywgOSwgMCwgNSwgMCwgNiwgNSwgMCwgMiwgNiwgLTEsIC0xLCAtMSwgLTEsXG4gICAgICAgIDcsIDMsIDksIDcsIDksIDQsIDMsIDIsIDksIDUsIDksIDYsIDIsIDYsIDksIC0xLFxuICAgICAgICAzLCAxMSwgMiwgNywgOCwgNCwgMTAsIDYsIDUsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICA1LCAxMCwgNiwgNCwgNywgMiwgNCwgMiwgMCwgMiwgNywgMTEsIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICAwLCAxLCA5LCA0LCA3LCA4LCAyLCAzLCAxMSwgNSwgMTAsIDYsIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICA5LCAyLCAxLCA5LCAxMSwgMiwgOSwgNCwgMTEsIDcsIDExLCA0LCA1LCAxMCwgNiwgLTEsXG4gICAgICAgIDgsIDQsIDcsIDMsIDExLCA1LCAzLCA1LCAxLCA1LCAxMSwgNiwgLTEsIC0xLCAtMSwgLTEsXG4gICAgICAgIDUsIDEsIDExLCA1LCAxMSwgNiwgMSwgMCwgMTEsIDcsIDExLCA0LCAwLCA0LCAxMSwgLTEsXG4gICAgICAgIDAsIDUsIDksIDAsIDYsIDUsIDAsIDMsIDYsIDExLCA2LCAzLCA4LCA0LCA3LCAtMSxcbiAgICAgICAgNiwgNSwgOSwgNiwgOSwgMTEsIDQsIDcsIDksIDcsIDExLCA5LCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgMTAsIDQsIDksIDYsIDQsIDEwLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgNCwgMTAsIDYsIDQsIDksIDEwLCAwLCA4LCAzLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgMTAsIDAsIDEsIDEwLCA2LCAwLCA2LCA0LCAwLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgOCwgMywgMSwgOCwgMSwgNiwgOCwgNiwgNCwgNiwgMSwgMTAsIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICAxLCA0LCA5LCAxLCAyLCA0LCAyLCA2LCA0LCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgMywgMCwgOCwgMSwgMiwgOSwgMiwgNCwgOSwgMiwgNiwgNCwgLTEsIC0xLCAtMSwgLTEsXG4gICAgICAgIDAsIDIsIDQsIDQsIDIsIDYsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICA4LCAzLCAyLCA4LCAyLCA0LCA0LCAyLCA2LCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgMTAsIDQsIDksIDEwLCA2LCA0LCAxMSwgMiwgMywgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsXG4gICAgICAgIDAsIDgsIDIsIDIsIDgsIDExLCA0LCA5LCAxMCwgNCwgMTAsIDYsIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICAzLCAxMSwgMiwgMCwgMSwgNiwgMCwgNiwgNCwgNiwgMSwgMTAsIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICA2LCA0LCAxLCA2LCAxLCAxMCwgNCwgOCwgMSwgMiwgMSwgMTEsIDgsIDExLCAxLCAtMSxcbiAgICAgICAgOSwgNiwgNCwgOSwgMywgNiwgOSwgMSwgMywgMTEsIDYsIDMsIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICA4LCAxMSwgMSwgOCwgMSwgMCwgMTEsIDYsIDEsIDksIDEsIDQsIDYsIDQsIDEsIC0xLFxuICAgICAgICAzLCAxMSwgNiwgMywgNiwgMCwgMCwgNiwgNCwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsXG4gICAgICAgIDYsIDQsIDgsIDExLCA2LCA4LCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgNywgMTAsIDYsIDcsIDgsIDEwLCA4LCA5LCAxMCwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsXG4gICAgICAgIDAsIDcsIDMsIDAsIDEwLCA3LCAwLCA5LCAxMCwgNiwgNywgMTAsIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICAxMCwgNiwgNywgMSwgMTAsIDcsIDEsIDcsIDgsIDEsIDgsIDAsIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICAxMCwgNiwgNywgMTAsIDcsIDEsIDEsIDcsIDMsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICAxLCAyLCA2LCAxLCA2LCA4LCAxLCA4LCA5LCA4LCA2LCA3LCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgMiwgNiwgOSwgMiwgOSwgMSwgNiwgNywgOSwgMCwgOSwgMywgNywgMywgOSwgLTEsXG4gICAgICAgIDcsIDgsIDAsIDcsIDAsIDYsIDYsIDAsIDIsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICA3LCAzLCAyLCA2LCA3LCAyLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgMiwgMywgMTEsIDEwLCA2LCA4LCAxMCwgOCwgOSwgOCwgNiwgNywgLTEsIC0xLCAtMSwgLTEsXG4gICAgICAgIDIsIDAsIDcsIDIsIDcsIDExLCAwLCA5LCA3LCA2LCA3LCAxMCwgOSwgMTAsIDcsIC0xLFxuICAgICAgICAxLCA4LCAwLCAxLCA3LCA4LCAxLCAxMCwgNywgNiwgNywgMTAsIDIsIDMsIDExLCAtMSxcbiAgICAgICAgMTEsIDIsIDEsIDExLCAxLCA3LCAxMCwgNiwgMSwgNiwgNywgMSwgLTEsIC0xLCAtMSwgLTEsXG4gICAgICAgIDgsIDksIDYsIDgsIDYsIDcsIDksIDEsIDYsIDExLCA2LCAzLCAxLCAzLCA2LCAtMSxcbiAgICAgICAgMCwgOSwgMSwgMTEsIDYsIDcsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICA3LCA4LCAwLCA3LCAwLCA2LCAzLCAxMSwgMCwgMTEsIDYsIDAsIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICA3LCAxMSwgNiwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsXG4gICAgICAgIDcsIDYsIDExLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgMywgMCwgOCwgMTEsIDcsIDYsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICAwLCAxLCA5LCAxMSwgNywgNiwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsXG4gICAgICAgIDgsIDEsIDksIDgsIDMsIDEsIDExLCA3LCA2LCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgMTAsIDEsIDIsIDYsIDExLCA3LCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgMSwgMiwgMTAsIDMsIDAsIDgsIDYsIDExLCA3LCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgMiwgOSwgMCwgMiwgMTAsIDksIDYsIDExLCA3LCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgNiwgMTEsIDcsIDIsIDEwLCAzLCAxMCwgOCwgMywgMTAsIDksIDgsIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICA3LCAyLCAzLCA2LCAyLCA3LCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgNywgMCwgOCwgNywgNiwgMCwgNiwgMiwgMCwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsXG4gICAgICAgIDIsIDcsIDYsIDIsIDMsIDcsIDAsIDEsIDksIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICAxLCA2LCAyLCAxLCA4LCA2LCAxLCA5LCA4LCA4LCA3LCA2LCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgMTAsIDcsIDYsIDEwLCAxLCA3LCAxLCAzLCA3LCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgMTAsIDcsIDYsIDEsIDcsIDEwLCAxLCA4LCA3LCAxLCAwLCA4LCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgMCwgMywgNywgMCwgNywgMTAsIDAsIDEwLCA5LCA2LCAxMCwgNywgLTEsIC0xLCAtMSwgLTEsXG4gICAgICAgIDcsIDYsIDEwLCA3LCAxMCwgOCwgOCwgMTAsIDksIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICA2LCA4LCA0LCAxMSwgOCwgNiwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsXG4gICAgICAgIDMsIDYsIDExLCAzLCAwLCA2LCAwLCA0LCA2LCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgOCwgNiwgMTEsIDgsIDQsIDYsIDksIDAsIDEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICA5LCA0LCA2LCA5LCA2LCAzLCA5LCAzLCAxLCAxMSwgMywgNiwgLTEsIC0xLCAtMSwgLTEsXG4gICAgICAgIDYsIDgsIDQsIDYsIDExLCA4LCAyLCAxMCwgMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsXG4gICAgICAgIDEsIDIsIDEwLCAzLCAwLCAxMSwgMCwgNiwgMTEsIDAsIDQsIDYsIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICA0LCAxMSwgOCwgNCwgNiwgMTEsIDAsIDIsIDksIDIsIDEwLCA5LCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgMTAsIDksIDMsIDEwLCAzLCAyLCA5LCA0LCAzLCAxMSwgMywgNiwgNCwgNiwgMywgLTEsXG4gICAgICAgIDgsIDIsIDMsIDgsIDQsIDIsIDQsIDYsIDIsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICAwLCA0LCAyLCA0LCA2LCAyLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgMSwgOSwgMCwgMiwgMywgNCwgMiwgNCwgNiwgNCwgMywgOCwgLTEsIC0xLCAtMSwgLTEsXG4gICAgICAgIDEsIDksIDQsIDEsIDQsIDIsIDIsIDQsIDYsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICA4LCAxLCAzLCA4LCA2LCAxLCA4LCA0LCA2LCA2LCAxMCwgMSwgLTEsIC0xLCAtMSwgLTEsXG4gICAgICAgIDEwLCAxLCAwLCAxMCwgMCwgNiwgNiwgMCwgNCwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsXG4gICAgICAgIDQsIDYsIDMsIDQsIDMsIDgsIDYsIDEwLCAzLCAwLCAzLCA5LCAxMCwgOSwgMywgLTEsXG4gICAgICAgIDEwLCA5LCA0LCA2LCAxMCwgNCwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsXG4gICAgICAgIDQsIDksIDUsIDcsIDYsIDExLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgMCwgOCwgMywgNCwgOSwgNSwgMTEsIDcsIDYsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICA1LCAwLCAxLCA1LCA0LCAwLCA3LCA2LCAxMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsXG4gICAgICAgIDExLCA3LCA2LCA4LCAzLCA0LCAzLCA1LCA0LCAzLCAxLCA1LCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgOSwgNSwgNCwgMTAsIDEsIDIsIDcsIDYsIDExLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgNiwgMTEsIDcsIDEsIDIsIDEwLCAwLCA4LCAzLCA0LCA5LCA1LCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgNywgNiwgMTEsIDUsIDQsIDEwLCA0LCAyLCAxMCwgNCwgMCwgMiwgLTEsIC0xLCAtMSwgLTEsXG4gICAgICAgIDMsIDQsIDgsIDMsIDUsIDQsIDMsIDIsIDUsIDEwLCA1LCAyLCAxMSwgNywgNiwgLTEsXG4gICAgICAgIDcsIDIsIDMsIDcsIDYsIDIsIDUsIDQsIDksIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICA5LCA1LCA0LCAwLCA4LCA2LCAwLCA2LCAyLCA2LCA4LCA3LCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgMywgNiwgMiwgMywgNywgNiwgMSwgNSwgMCwgNSwgNCwgMCwgLTEsIC0xLCAtMSwgLTEsXG4gICAgICAgIDYsIDIsIDgsIDYsIDgsIDcsIDIsIDEsIDgsIDQsIDgsIDUsIDEsIDUsIDgsIC0xLFxuICAgICAgICA5LCA1LCA0LCAxMCwgMSwgNiwgMSwgNywgNiwgMSwgMywgNywgLTEsIC0xLCAtMSwgLTEsXG4gICAgICAgIDEsIDYsIDEwLCAxLCA3LCA2LCAxLCAwLCA3LCA4LCA3LCAwLCA5LCA1LCA0LCAtMSxcbiAgICAgICAgNCwgMCwgMTAsIDQsIDEwLCA1LCAwLCAzLCAxMCwgNiwgMTAsIDcsIDMsIDcsIDEwLCAtMSxcbiAgICAgICAgNywgNiwgMTAsIDcsIDEwLCA4LCA1LCA0LCAxMCwgNCwgOCwgMTAsIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICA2LCA5LCA1LCA2LCAxMSwgOSwgMTEsIDgsIDksIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICAzLCA2LCAxMSwgMCwgNiwgMywgMCwgNSwgNiwgMCwgOSwgNSwgLTEsIC0xLCAtMSwgLTEsXG4gICAgICAgIDAsIDExLCA4LCAwLCA1LCAxMSwgMCwgMSwgNSwgNSwgNiwgMTEsIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICA2LCAxMSwgMywgNiwgMywgNSwgNSwgMywgMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsXG4gICAgICAgIDEsIDIsIDEwLCA5LCA1LCAxMSwgOSwgMTEsIDgsIDExLCA1LCA2LCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgMCwgMTEsIDMsIDAsIDYsIDExLCAwLCA5LCA2LCA1LCA2LCA5LCAxLCAyLCAxMCwgLTEsXG4gICAgICAgIDExLCA4LCA1LCAxMSwgNSwgNiwgOCwgMCwgNSwgMTAsIDUsIDIsIDAsIDIsIDUsIC0xLFxuICAgICAgICA2LCAxMSwgMywgNiwgMywgNSwgMiwgMTAsIDMsIDEwLCA1LCAzLCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgNSwgOCwgOSwgNSwgMiwgOCwgNSwgNiwgMiwgMywgOCwgMiwgLTEsIC0xLCAtMSwgLTEsXG4gICAgICAgIDksIDUsIDYsIDksIDYsIDAsIDAsIDYsIDIsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICAxLCA1LCA4LCAxLCA4LCAwLCA1LCA2LCA4LCAzLCA4LCAyLCA2LCAyLCA4LCAtMSxcbiAgICAgICAgMSwgNSwgNiwgMiwgMSwgNiwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsXG4gICAgICAgIDEsIDMsIDYsIDEsIDYsIDEwLCAzLCA4LCA2LCA1LCA2LCA5LCA4LCA5LCA2LCAtMSxcbiAgICAgICAgMTAsIDEsIDAsIDEwLCAwLCA2LCA5LCA1LCAwLCA1LCA2LCAwLCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgMCwgMywgOCwgNSwgNiwgMTAsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICAxMCwgNSwgNiwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsXG4gICAgICAgIDExLCA1LCAxMCwgNywgNSwgMTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICAxMSwgNSwgMTAsIDExLCA3LCA1LCA4LCAzLCAwLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgNSwgMTEsIDcsIDUsIDEwLCAxMSwgMSwgOSwgMCwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsXG4gICAgICAgIDEwLCA3LCA1LCAxMCwgMTEsIDcsIDksIDgsIDEsIDgsIDMsIDEsIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICAxMSwgMSwgMiwgMTEsIDcsIDEsIDcsIDUsIDEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICAwLCA4LCAzLCAxLCAyLCA3LCAxLCA3LCA1LCA3LCAyLCAxMSwgLTEsIC0xLCAtMSwgLTEsXG4gICAgICAgIDksIDcsIDUsIDksIDIsIDcsIDksIDAsIDIsIDIsIDExLCA3LCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgNywgNSwgMiwgNywgMiwgMTEsIDUsIDksIDIsIDMsIDIsIDgsIDksIDgsIDIsIC0xLFxuICAgICAgICAyLCA1LCAxMCwgMiwgMywgNSwgMywgNywgNSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsXG4gICAgICAgIDgsIDIsIDAsIDgsIDUsIDIsIDgsIDcsIDUsIDEwLCAyLCA1LCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgOSwgMCwgMSwgNSwgMTAsIDMsIDUsIDMsIDcsIDMsIDEwLCAyLCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgOSwgOCwgMiwgOSwgMiwgMSwgOCwgNywgMiwgMTAsIDIsIDUsIDcsIDUsIDIsIC0xLFxuICAgICAgICAxLCAzLCA1LCAzLCA3LCA1LCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgMCwgOCwgNywgMCwgNywgMSwgMSwgNywgNSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsXG4gICAgICAgIDksIDAsIDMsIDksIDMsIDUsIDUsIDMsIDcsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICA5LCA4LCA3LCA1LCA5LCA3LCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgNSwgOCwgNCwgNSwgMTAsIDgsIDEwLCAxMSwgOCwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsXG4gICAgICAgIDUsIDAsIDQsIDUsIDExLCAwLCA1LCAxMCwgMTEsIDExLCAzLCAwLCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgMCwgMSwgOSwgOCwgNCwgMTAsIDgsIDEwLCAxMSwgMTAsIDQsIDUsIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICAxMCwgMTEsIDQsIDEwLCA0LCA1LCAxMSwgMywgNCwgOSwgNCwgMSwgMywgMSwgNCwgLTEsXG4gICAgICAgIDIsIDUsIDEsIDIsIDgsIDUsIDIsIDExLCA4LCA0LCA1LCA4LCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgMCwgNCwgMTEsIDAsIDExLCAzLCA0LCA1LCAxMSwgMiwgMTEsIDEsIDUsIDEsIDExLCAtMSxcbiAgICAgICAgMCwgMiwgNSwgMCwgNSwgOSwgMiwgMTEsIDUsIDQsIDUsIDgsIDExLCA4LCA1LCAtMSxcbiAgICAgICAgOSwgNCwgNSwgMiwgMTEsIDMsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICAyLCA1LCAxMCwgMywgNSwgMiwgMywgNCwgNSwgMywgOCwgNCwgLTEsIC0xLCAtMSwgLTEsXG4gICAgICAgIDUsIDEwLCAyLCA1LCAyLCA0LCA0LCAyLCAwLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgMywgMTAsIDIsIDMsIDUsIDEwLCAzLCA4LCA1LCA0LCA1LCA4LCAwLCAxLCA5LCAtMSxcbiAgICAgICAgNSwgMTAsIDIsIDUsIDIsIDQsIDEsIDksIDIsIDksIDQsIDIsIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICA4LCA0LCA1LCA4LCA1LCAzLCAzLCA1LCAxLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgMCwgNCwgNSwgMSwgMCwgNSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsXG4gICAgICAgIDgsIDQsIDUsIDgsIDUsIDMsIDksIDAsIDUsIDAsIDMsIDUsIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICA5LCA0LCA1LCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgNCwgMTEsIDcsIDQsIDksIDExLCA5LCAxMCwgMTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICAwLCA4LCAzLCA0LCA5LCA3LCA5LCAxMSwgNywgOSwgMTAsIDExLCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgMSwgMTAsIDExLCAxLCAxMSwgNCwgMSwgNCwgMCwgNywgNCwgMTEsIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICAzLCAxLCA0LCAzLCA0LCA4LCAxLCAxMCwgNCwgNywgNCwgMTEsIDEwLCAxMSwgNCwgLTEsXG4gICAgICAgIDQsIDExLCA3LCA5LCAxMSwgNCwgOSwgMiwgMTEsIDksIDEsIDIsIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICA5LCA3LCA0LCA5LCAxMSwgNywgOSwgMSwgMTEsIDIsIDExLCAxLCAwLCA4LCAzLCAtMSxcbiAgICAgICAgMTEsIDcsIDQsIDExLCA0LCAyLCAyLCA0LCAwLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgMTEsIDcsIDQsIDExLCA0LCAyLCA4LCAzLCA0LCAzLCAyLCA0LCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgMiwgOSwgMTAsIDIsIDcsIDksIDIsIDMsIDcsIDcsIDQsIDksIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICA5LCAxMCwgNywgOSwgNywgNCwgMTAsIDIsIDcsIDgsIDcsIDAsIDIsIDAsIDcsIC0xLFxuICAgICAgICAzLCA3LCAxMCwgMywgMTAsIDIsIDcsIDQsIDEwLCAxLCAxMCwgMCwgNCwgMCwgMTAsIC0xLFxuICAgICAgICAxLCAxMCwgMiwgOCwgNywgNCwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsXG4gICAgICAgIDQsIDksIDEsIDQsIDEsIDcsIDcsIDEsIDMsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICA0LCA5LCAxLCA0LCAxLCA3LCAwLCA4LCAxLCA4LCA3LCAxLCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgNCwgMCwgMywgNywgNCwgMywgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsXG4gICAgICAgIDQsIDgsIDcsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICA5LCAxMCwgOCwgMTAsIDExLCA4LCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgMywgMCwgOSwgMywgOSwgMTEsIDExLCA5LCAxMCwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsXG4gICAgICAgIDAsIDEsIDEwLCAwLCAxMCwgOCwgOCwgMTAsIDExLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgMywgMSwgMTAsIDExLCAzLCAxMCwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsXG4gICAgICAgIDEsIDIsIDExLCAxLCAxMSwgOSwgOSwgMTEsIDgsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICAzLCAwLCA5LCAzLCA5LCAxMSwgMSwgMiwgOSwgMiwgMTEsIDksIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICAwLCAyLCAxMSwgOCwgMCwgMTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICAzLCAyLCAxMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsXG4gICAgICAgIDIsIDMsIDgsIDIsIDgsIDEwLCAxMCwgOCwgOSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsXG4gICAgICAgIDksIDEwLCAyLCAwLCA5LCAyLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgMiwgMywgOCwgMiwgOCwgMTAsIDAsIDEsIDgsIDEsIDEwLCA4LCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgMSwgMTAsIDIsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICAxLCAzLCA4LCA5LCAxLCA4LCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSxcbiAgICAgICAgMCwgOSwgMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsXG4gICAgICAgIDAsIDMsIDgsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLFxuICAgICAgICAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsIC0xLCAtMVxuICAgIF0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IElTT1N1cmZhY2U7IiwiXG5tb2R1bGUuZXhwb3J0cyA9XG57XG5cbiAgICAvL1RPRE86IGNsZWFuIHVwXG5cbiAgICBpc1BvaW50TGVmdCA6IGZ1bmN0aW9uKHgwLHkwLHgxLHkxLHgyLHkyKVxuICAgIHtcbiAgICAgICAgcmV0dXJuICggeDEgLSB4MCApICogKCB5MiAtIHkwICkgLSAoeDIgLSB4MCkgKiAoeTEgLSB5MCk7XG4gICAgfSxcblxuICAgIC8vaHR0cDovL2FsaWVucnlkZXJmbGV4LmNvbS9pbnRlcnNlY3QvXG4gICAgaXNJbnRlcnNlY3Rpb25mIDogZnVuY3Rpb24oYXgsYXksYngsYnksY3gsY3ksZHgsZHksb3V0KVxuICAgIHtcbiAgICAgICAgdmFyIGRpc3RBQixcbiAgICAgICAgICAgIGNvcyxcbiAgICAgICAgICAgIHNpbixcbiAgICAgICAgICAgIG5ld1gsXG4gICAgICAgICAgICBwb3NhYjtcblxuICAgICAgICBpZiAoYXggPT0gYnggJiYgYXkgPT0gYnkgfHxcbiAgICAgICAgICAgIGN4ID09IGR4ICYmIGN5ID09IGR5KVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgIGJ4IC09IGF4O1xuICAgICAgICBieSAtPSBheTtcbiAgICAgICAgY3ggLT0gYXg7XG4gICAgICAgIGN5IC09IGF5O1xuICAgICAgICBkeCAtPSBheDtcbiAgICAgICAgZHkgLT0gYXk7XG5cbiAgICAgICAgZGlzdEFCID0gMSAvIChNYXRoLnNxcnQoYngqYngrYnkqYnkpIHx8IDEpO1xuXG4gICAgICAgIGNvcyAgPSBieCAqIGRpc3RBQjtcbiAgICAgICAgc2luICA9IGJ5ICogZGlzdEFCO1xuICAgICAgICBuZXdYID0gY3ggKiBjb3MgKyBjeSAqIHNpbjtcbiAgICAgICAgY3kgICA9IGN5ICogY29zIC0gY3ggKiBzaW47XG4gICAgICAgIGN4ICAgPSBuZXdYO1xuICAgICAgICBuZXdYID0gZHggKiBjb3MgKyBkeSAqIHNpbjtcbiAgICAgICAgZHkgICA9IGR5ICogY29zIC0gZHggKiBzaW47XG4gICAgICAgIGR4ICAgPSBuZXdYO1xuXG4gICAgICAgIGlmIChjeSA9PSBkeSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgIHBvc2FiICA9IGR4ICsgKCBjeCAtIGR4ICkgKiBkeSAvICggZHkgLSBjeSApO1xuXG4gICAgICAgIGlmKG91dClcbiAgICAgICAge1xuICAgICAgICAgICAgb3V0WzBdID0gYXggKyBwb3NhYiAqIGNvcztcbiAgICAgICAgICAgIG91dFsxXSA9IGF5ICsgcG9zYWIgKiBzaW47XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LFxuXG4gICAgaXNJbnRlcnNlY3Rpb24gOiBmdW5jdGlvbihsMCxsMSxvdXQpXG4gICAge1xuICAgICAgICByZXR1cm4gdGhpcy5pc0ludGVyc2VjdGlvbmYobDBbMF0sbDBbMV0sbDBbMl0sbDBbM10sbDFbMF0sbDBbMV0sbDFbMl0sbDFbM10sb3V0KTtcbiAgICB9ICxcblxuICAgIGlzU2VnbWVudEludGVyc2VjdGlvbmYgOiBmdW5jdGlvbihheCxheSxieCxieSxjeCxjeSxkeCxkeSxvdXQpXG4gICAge1xuICAgICAgICB2YXIgZGlzdGFiLFxuICAgICAgICAgICAgY29zLFxuICAgICAgICAgICAgc2luLFxuICAgICAgICAgICAgbmV3WCxcbiAgICAgICAgICAgIHBvc2FiO1xuXG4gICAgICAgIGlmIChheCA9PSBieCAmJiBheSA9PSBieSB8fFxuICAgICAgICAgICAgY3ggPT0gZHggJiYgY3kgPT0gZHkpXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgaWYgKGF4PT1jeCAmJiBheT09Y3kgfHwgYng9PWN4ICYmIGJ5PT1jeVxuICAgICAgICAgICAgfHwgIGF4PT1keCAmJiBheT09ZHkgfHwgYng9PWR4ICYmIGJ5PT1keSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlOyB9XG5cbiAgICAgICAgYnggLT0gYXg7XG4gICAgICAgIGJ5IC09IGF5O1xuICAgICAgICBjeCAtPSBheDtcbiAgICAgICAgY3kgLT0gYXk7XG4gICAgICAgIGR4IC09IGF4O1xuICAgICAgICBkeSAtPSBheTtcblxuICAgICAgICBkaXN0YWI9IE1hdGguc3FydChieCpieCtieSpieSk7XG5cbiAgICAgICAgY29zICA9IGJ4IC8gZGlzdGFiO1xuICAgICAgICBzaW4gID0gYnkgLyBkaXN0YWI7XG4gICAgICAgIG5ld1ggPSBjeCAqIGNvcyArIGN5ICogc2luO1xuICAgICAgICBjeSAgID0gY3kgKiBjb3MgLSBjeCAqIHNpbjtcbiAgICAgICAgY3ggICA9IG5ld1g7XG4gICAgICAgIG5ld1ggPSBkeCAqIGNvcyArIGR5ICogc2luO1xuICAgICAgICBkeSAgID0gZHkgKiBjb3MgLSBkeCAqIHNpbjtcbiAgICAgICAgZHggICA9IG5ld1g7XG5cbiAgICAgICAgaWYoY3kgPCAwLjAgJiYgZHkgPCAwLjAgfHwgY3kgPj0gMC4wICYmIGR5ID49IDAuMClyZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgcG9zYWIgID0gZHggKyAoIGN4IC0gZHggKSAqIGR5IC8gKCBkeSAtIGN5ICk7XG5cbiAgICAgICAgaWYocG9zYWIgPCAwLjAgfHwgcG9zYWIgPiBkaXN0YWIpcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgIGlmKG91dClcbiAgICAgICAge1xuICAgICAgICAgICAgb3V0WzBdID0gYXggKyBwb3NhYiAqIGNvcztcbiAgICAgICAgICAgIG91dFsxXSA9IGF5ICsgcG9zYWIgKiBzaW47XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cblxufTsiLCJcblxuXG5mdW5jdGlvbiBMaW5lQnVmZmVyMmQoa2dsLHNpemUpXG57XG4gICAgdGhpcy5fZ2wgICAgICA9IGtnbDtcblxuICAgIHRoaXMuX3ZibyAgICAgPSBudWxsO1xuICAgIHRoaXMudmVydGljZXMgPSBudWxsO1xuICAgIHRoaXMuY29sb3JzICAgPSBudWxsO1xuXG4gICAgdGhpcy5fdmVydEluZGV4ID0gMDtcbiAgICB0aGlzLl9jb2xJbmRleCAgPSAwO1xuXG4gICAgaWYoc2l6ZSl0aGlzLmFsbG9jYXRlKHNpemUpO1xufVxuXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbi8vcHJvYmFibHkgc2hvdWxkbnQgZG8gdGhpc1xuTGluZUJ1ZmZlcjJkLnByb3RvdHlwZS5iaW5kICAgPSBmdW5jdGlvbigpXG57XG4gICAgdmFyIGtnbCA9IHRoaXMuX2dsLFxuICAgICAgICBnbCAgICA9IGtnbC5nbDtcblxuICAgIGtnbC5kaXNhYmxlRGVmYXVsdE5vcm1hbEF0dHJpYkFycmF5KCk7XG4gICAga2dsLmRpc2FibGVEZWZhdWx0VGV4Q29vcmRzQXR0cmliQXJyYXkoKTtcbiAgICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUix0aGlzLl92Ym8pO1xufTtcblxuTGluZUJ1ZmZlcjJkLnByb3RvdHlwZS51bmJpbmQgPSBmdW5jdGlvbigpXG57XG4gICAgdmFyIGtnbCA9IHRoaXMuX2dsO1xuXG4gICAga2dsLmVuYWJsZURlZmF1bHROb3JtYWxBdHRyaWJBcnJheSgpO1xuICAgIGtnbC5lbmFibGVEZWZhdWx0VGV4Q29vcmRzQXR0cmliQXJyYXkoKTtcbiAgICBrZ2wuYmluZERlZmF1bHRWQk8oKTtcbn07XG5cbkxpbmVCdWZmZXIyZC5wcm90b3R5cGUucHVzaFZlcnRleDNmID0gZnVuY3Rpb24oeCx5LHopXG57XG4gICAgdmFyIHZlcnRpY2VzID0gdGhpcy52ZXJ0aWNlcztcblxuICAgIC8vaWYodGhpcy5fc2FmZUFsbG9jYXRlICYmIHRoaXMuX3ZlcnRJbmRleCA+IHZlcnRpY2VzLmxlbmd0aCAtIDMpdGhpcy5hbGxvY2F0ZSh2ZXJ0aWNlcy5sZW5ndGggKiAxLjEpO1xuXG4gICAgdmVydGljZXNbdGhpcy5fdmVydEluZGV4KytdID0geDtcbiAgICB2ZXJ0aWNlc1t0aGlzLl92ZXJ0SW5kZXgrK10gPSB5O1xuICAgIHZlcnRpY2VzW3RoaXMuX3ZlcnRJbmRleCsrXSA9IHo7XG59O1xuXG5MaW5lQnVmZmVyMmQucHJvdG90eXBlLnB1c2hDb2xvcjRmID0gZnVuY3Rpb24ocixnLGIsYSlcbntcbiAgICB2YXIgY29sb3JzID0gdGhpcy5jb2xvcnM7XG5cbiAgICBjb2xvcnNbdGhpcy5fY29sSW5kZXgrK10gPSByO1xuICAgIGNvbG9yc1t0aGlzLl9jb2xJbmRleCsrXSA9IGc7XG4gICAgY29sb3JzW3RoaXMuX2NvbEluZGV4KytdID0gYjtcbiAgICBjb2xvcnNbdGhpcy5fY29sSW5kZXgrK10gPSBhO1xufTtcblxuTGluZUJ1ZmZlcjJkLnByb3RvdHlwZS5zZXRWZXJ0ZXgzZiA9IGZ1bmN0aW9uKHgseSx6LGluZGV4MylcbntcbiAgICBpbmRleDMqPTM7XG4gICAgdmFyIHZlcnRpY2VzID0gdGhpcy52ZXJ0aWNlcztcblxuICAgIHZlcnRpY2VzW2luZGV4MyAgXSA9IHg7XG4gICAgdmVydGljZXNbaW5kZXgzKzFdID0geTtcbiAgICB2ZXJ0aWNlc1tpbmRleDMrMl0gPSB6O1xufTtcblxuTGluZUJ1ZmZlcjJkLnByb3RvdHlwZS5zZXRDb2xvcjRmID0gZnVuY3Rpb24ocixnLGIsYSxpbmRleDQpXG57XG4gICAgaW5kZXg0Kj00O1xuICAgIHZhciBjb2xvcnMgPSB0aGlzLmNvbG9ycztcblxuICAgIGNvbG9yc1tpbmRleDQgIF0gPSByO1xuICAgIGNvbG9yc1tpbmRleDQrMV0gPSBnO1xuICAgIGNvbG9yc1tpbmRleDQrMl0gPSBiO1xuICAgIGNvbG9yc1tpbmRleDQrM10gPSBhO1xufTtcblxuTGluZUJ1ZmZlcjJkLnByb3RvdHlwZS5wdXNoVmVydGV4ICAgID0gZnVuY3Rpb24odil7dGhpcy5wdXNoVmVydGV4M2YodlswXSx2WzFdLHZbMl0pO307XG5MaW5lQnVmZmVyMmQucHJvdG90eXBlLnB1c2hDb2xvciAgICAgPSBmdW5jdGlvbihjKXt0aGlzLnB1c2hDb2xvcjRmKGNbMF0sY1sxXSxjWzJdLGNbM10pO307XG5MaW5lQnVmZmVyMmQucHJvdG90eXBlLnNldFZlcnRleCAgICAgPSBmdW5jdGlvbih2LGluZGV4KXt0aGlzLnNldFZlcnRleDNmKHZbMF0sdlsxXSx2WzJdLGluZGV4KTt9O1xuTGluZUJ1ZmZlcjJkLnByb3RvdHlwZS5zZXRDb2xvciAgICAgID0gZnVuY3Rpb24oYyxpbmRleCl7dGhpcy5zZXRDb2xvcjRmKGNbMF0sY1sxXSxjWzJdLGNbM10saW5kZXgpO307XG5cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuTGluZUJ1ZmZlcjJkLnByb3RvdHlwZS5idWZmZXIgPSBmdW5jdGlvbigpXG57XG4gICAgdmFyIGdsa2wgICAgICAgICAgPSB0aGlzLl9nbCxcbiAgICAgICAgZ2wgICAgICAgICAgICA9IGdsa2wuZ2wsXG4gICAgICAgIGdsQXJyYXlCdWZmZXIgPSBnbC5BUlJBWV9CVUZGRVIsXG4gICAgICAgIGdsRmxvYXQgICAgICAgPSBnbC5GTE9BVDtcblxuXG5cbiAgICB2YXIgdmJsZW4gPSB0aGlzLnZlcnRpY2VzLmJ5dGVMZW5ndGgsXG4gICAgICAgIGNibGVuID0gdGhpcy5jb2xvcnMuYnl0ZUxlbmd0aDtcblxuICAgIHZhciBvZmZzZXRWID0gMCxcbiAgICAgICAgb2Zmc2V0QyA9IG9mZnNldFYgKyB2YmxlbjtcblxuICAgIGdsLmJ1ZmZlckRhdGEoZ2xBcnJheUJ1ZmZlcix2YmxlbiArIGNibGVuLCBnbC5EWU5BTUlDX0RSQVcpO1xuICAgIGdsLmJ1ZmZlclN1YkRhdGEoZ2xBcnJheUJ1ZmZlcixvZmZzZXRWLHRoaXMudmVydGljZXMpO1xuICAgIGdsLmJ1ZmZlclN1YkRhdGEoZ2xBcnJheUJ1ZmZlcixvZmZzZXRDLHRoaXMuY29sb3JzKTtcbiAgICBnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKGdsa2wuZ2V0RGVmYXVsdFZlcnRleEF0dHJpYigpLGdsa2wuU0laRV9PRl9WRVJURVgsZ2xGbG9hdCxmYWxzZSwwLG9mZnNldFYpO1xuICAgIGdsLnZlcnRleEF0dHJpYlBvaW50ZXIoZ2xrbC5nZXREZWZhdWx0Q29sb3JBdHRyaWIoKSwgZ2xrbC5TSVpFX09GX0NPTE9SLCBnbEZsb2F0LGZhbHNlLDAsb2Zmc2V0Qyk7XG59O1xuXG5MaW5lQnVmZmVyMmQucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihmaXJzdCxjb3VudClcbntcbiAgICB2YXIga2dsID0gdGhpcy5fZ2wsXG4gICAgICAgIGdsICAgID0ga2dsLmdsO1xuXG4gICBrZ2wuc2V0TWF0cmljZXNVbmlmb3JtKCk7XG4gICBnbC5kcmF3QXJyYXlzKGtnbC5nZXREcmF3TW9kZSgpLFxuICAgICAgICAgICAgICAgICBmaXJzdCB8fCAwLFxuICAgICAgICAgICAgICAgICBjb3VudCB8fCB0aGlzLnZlcnRpY2VzLmxlbmd0aCAvIGtnbC5TSVpFX09GX1ZFUlRFWCk7XG59O1xuXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbkxpbmVCdWZmZXIyZC5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbigpXG57XG4gICAgdGhpcy5fdmVydEluZGV4ID0gMDtcbiAgICB0aGlzLl9jb2xJbmRleCAgPSAwO1xufTtcblxuTGluZUJ1ZmZlcjJkLnByb3RvdHlwZS5kaXNwb3NlICA9IGZ1bmN0aW9uKClcbntcbiAgICB0aGlzLl9nbC5nbC5kZWxldGVCdWZmZXIodGhpcy5fdmJvKTtcbiAgICB0aGlzLnZlcnRpY2VzID0gbnVsbDtcbiAgICB0aGlzLmNvbG9ycyAgID0gbnVsbDtcbiAgICB0aGlzLnJlc2V0KCk7XG59O1xuXG5MaW5lQnVmZmVyMmQucHJvdG90eXBlLmFsbG9jYXRlID0gZnVuY3Rpb24oc2l6ZSlcbntcbiAgICB2YXIga2dsID0gdGhpcy5fZ2wsXG4gICAgICAgIGdsICAgID0ga2dsLmdsO1xuXG4gICAgLy9uZWVkIHRvIGRlbGV0ZUJ1ZmZlciwgaW5zdGVhZCBvZiByZXVzaW5nIGl0LCBvdGhlcndpc2UgZXJyb3IsIGhtXG4gICAgaWYodGhpcy5fdmJvKXtnbC5kZWxldGVCdWZmZXIodGhpcy5fdmJvKTt9dGhpcy5fdmJvID0gZ2wuY3JlYXRlQnVmZmVyKCk7XG4gICAgdGhpcy52ZXJ0aWNlcyA9IHRoaXMudmVydGljZXMgfHwgbmV3IEZsb2F0MzJBcnJheSgwKTtcbiAgICB0aGlzLmNvbG9ycyAgID0gdGhpcy5jb2xvcnMgICB8fCBuZXcgRmxvYXQzMkFycmF5KDApO1xuXG4gICAgdmFyIHZlcnRMZW4gPSB0aGlzLnZlcnRpY2VzLmxlbmd0aCxcbiAgICAgICAgY29sc0xlbiA9IHRoaXMuY29sb3JzLmxlbmd0aDtcblxuICAgIGlmKHZlcnRMZW4gPCBzaXplKVxuICAgIHtcbiAgICAgICAgdmFyIHRlbXA7XG5cbiAgICAgICAgdGVtcCA9IG5ldyBGbG9hdDMyQXJyYXkoc2l6ZSk7XG4gICAgICAgIHRlbXAuc2V0KHRoaXMudmVydGljZXMpO1xuICAgICAgICB0ZW1wLnNldChuZXcgRmxvYXQzMkFycmF5KHRlbXAubGVuZ3RoIC0gdmVydExlbiksdmVydExlbik7XG4gICAgICAgIHRoaXMudmVydGljZXMgPSB0ZW1wO1xuXG4gICAgICAgIHRlbXAgPSBuZXcgRmxvYXQzMkFycmF5KHNpemUgLyAzICogNCk7XG4gICAgICAgIHRlbXAuc2V0KHRoaXMuY29sb3JzKTtcbiAgICAgICAgdGVtcC5zZXQobmV3IEZsb2F0MzJBcnJheSh0ZW1wLmxlbmd0aCAtIGNvbHNMZW4pLGNvbHNMZW4pO1xuICAgICAgICB0aGlzLmNvbG9ycyA9IHRlbXA7XG4gIH1cbn07XG5cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuTGluZUJ1ZmZlcjJkLnByb3RvdHlwZS5nZXRTaXplQWxsb2NhdGVkID0gZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy52ZXJ0aWNlcy5sZW5ndGg7fTtcbkxpbmVCdWZmZXIyZC5wcm90b3R5cGUuZ2V0U2l6ZVB1c2hlZCAgICA9IGZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX3ZlcnRJbmRleDt9O1xuXG5tb2R1bGUuZXhwb3J0cyA9IExpbmVCdWZmZXIyZDtcblxuIiwidmFyIEdlb20zZCA9IHJlcXVpcmUoJy4vZkdlb20zZCcpLFxuICAgIE1hdDQ0ICA9IHJlcXVpcmUoJy4uL21hdGgvZk1hdDQ0JyksXG4gICAgVmVjMyAgID0gcmVxdWlyZSgnLi4vbWF0aC9mVmVjMycpO1xuXG4vL1RPRE86XG4vL0ZpeCBzaGFyZWQgbm9ybWFscyBvbiBjYXBzXG4vL1xuXG5cbkxpbmVCdWZmZXIzZCA9IGZ1bmN0aW9uKHBvaW50cyxudW1TZWdtZW50cyxkaWFtZXRlcixzbGljZVNlZ21lbnRGdW5jLGNsb3NlZClcbntcbiAgICBHZW9tM2QuYXBwbHkodGhpcyxhcmd1bWVudHMpO1xuXG4gICAgbnVtU2VnbWVudHMgPSBudW1TZWdtZW50cyB8fCAxMDtcbiAgICBkaWFtZXRlciAgICA9IGRpYW1ldGVyICAgIHx8IDAuMjU7XG5cbiAgICB0aGlzLl9jbG9zZWRDYXBzICAgPSAodHlwZW9mIGNsb3NlZCA9PT0gJ3VuZGVmaW5lZCcpID8gdHJ1ZSA6IGNsb3NlZDtcbiAgICB0aGlzLl9udW1TZWdtZW50cyAgPSBudW1TZWdtZW50cztcblxuICAgIC8vY2FjaGVzIHZlcnRpY2VzIHRyYW5zZm9ybWVkIGJ5IHNsaWNlc2VnZnVuYyBmb3IgZGlhbWV0ZXIgc2NhbGluZ1xuICAgIC8vLi4uLHZub3JtMHgsdm5vcm0weSx2bm9ybTB6LHZub3JtMHhTY2FsZWQsLHZub3JtMHlTY2FsZWQsdm5vcm0welNjYWxlZCwuLi5cbiAgICB0aGlzLl92ZXJ0aWNlc05vcm0gPSBudWxsO1xuICAgIHRoaXMucG9pbnRzICAgICAgICA9IG51bGw7XG5cbiAgICB0aGlzLl9zbGljZVNlZ0Z1bmMgPSBzbGljZVNlZ21lbnRGdW5jIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAoZnVuY3Rpb24oaSxqLG51bVBvaW50cyxudW1TZWdtZW50cylcbiAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzdGVwICA9IE1hdGguUEkgKiAyIC8gbnVtU2VnbWVudHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmdsZSA9IHN0ZXAgKiBqO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbTWF0aC5jb3MoYW5nbGUpLE1hdGguc2luKGFuZ2xlKV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICB0aGlzLl9pbml0RGlhbWV0ZXIgPSBkaWFtZXRlcjtcblxuICAgIHRoaXMuX3RlbXBWZWMwID0gVmVjMy5tYWtlKCk7XG4gICAgdGhpcy5fYlBvaW50MCAgPSBWZWMzLm1ha2UoKTtcbiAgICB0aGlzLl9iUG9pbnQxICA9IFZlYzMubWFrZSgpO1xuICAgIHRoaXMuX2JQb2ludDAxID0gVmVjMy5tYWtlKCk7XG4gICAgdGhpcy5fYXhpc1kgICAgPSBWZWMzLkFYSVNfWSgpO1xuXG4gICAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4gICAgaWYocG9pbnRzKXRoaXMuc2V0UG9pbnRzKHBvaW50cyk7XG5cbn07XG5cbkxpbmVCdWZmZXIzZC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEdlb20zZC5wcm90b3R5cGUpO1xuXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbkxpbmVCdWZmZXIzZC5wcm90b3R5cGUuc2V0UG9pbnRzID0gZnVuY3Rpb24oYXJyKVxue1xuICAgIHRoaXMucG9pbnRzID0gbmV3IEZsb2F0MzJBcnJheShhcnIpO1xuXG4gICAgaWYoISh0aGlzLnZlcnRpY2VzICYmIHRoaXMudmVydGljZXMubGVuZ3RoID09IGFyci5sZW5ndGgpKVxuICAgIHtcbiAgICAgICAgdmFyIG51bVNlZ21lbnRzID0gdGhpcy5fbnVtU2VnbWVudHMsXG4gICAgICAgICAgICBudW1Qb2ludHMgICA9IHRoaXMuX251bVBvaW50cyA9IGFyci5sZW5ndGggLyAzO1xuICAgICAgICB2YXIgbGVuICAgICAgICAgPSBudW1Qb2ludHMgKiBudW1TZWdtZW50cyAqIDM7XG5cbiAgICAgICAgdGhpcy5fdmVydGljZXNOb3JtID0gbmV3IEZsb2F0MzJBcnJheShsZW4gKiAyKTtcbiAgICAgICAgdGhpcy52ZXJ0aWNlcyAgICAgID0gbmV3IEZsb2F0MzJBcnJheShsZW4pO1xuICAgICAgICB0aGlzLm5vcm1hbHMgICAgICAgPSBuZXcgRmxvYXQzMkFycmF5KGxlbik7XG4gICAgICAgIHRoaXMuY29sb3JzICAgICAgICA9IG5ldyBGbG9hdDMyQXJyYXkobGVuIC8gMyAqIDQpO1xuXG4gICAgICAgIHRoaXMuc2V0TnVtU2VnbWVudHMobnVtU2VnbWVudHMpO1xuICAgIH1cbn07XG5cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuTGluZUJ1ZmZlcjNkLnByb3RvdHlwZS5hcHBseVNsaWNlU2VnbWVudEZ1bmMgPSBmdW5jdGlvbihmdW5jLGJhc2VEaWFtZXRlcilcbntcbiAgICBiYXNlRGlhbWV0ZXIgPSBiYXNlRGlhbWV0ZXIgfHwgMC4yNTtcblxuICAgIHZhciBudW1Qb2ludHMgICAgPSB0aGlzLl9udW1Qb2ludHMsXG4gICAgICAgIG51bVNlZ21lbnRzICA9IHRoaXMuX251bVNlZ21lbnRzLFxuICAgICAgICB2ZXJ0aWNlc05vcm0gPSB0aGlzLl92ZXJ0aWNlc05vcm07XG5cbiAgICB2YXIgZnVuY1JlcztcblxuICAgIHZhciBpbmRleDtcbiAgICB2YXIgaSwgaiwgaztcblxuICAgIGkgPSAtMTtcbiAgICB3aGlsZSgrK2kgPCBudW1Qb2ludHMpXG4gICAge1xuICAgICAgICBqID0gLTE7XG4gICAgICAgIGluZGV4ID0gaSAqIG51bVNlZ21lbnRzO1xuXG4gICAgICAgIHdoaWxlKCsraiA8IG51bVNlZ21lbnRzKVxuICAgICAgICB7XG4gICAgICAgICAgICBrICAgID0gKGluZGV4ICsgaikgKiAzICogMjtcblxuICAgICAgICAgICAgZnVuY1JlcyA9IGZ1bmMoaSxqLG51bVBvaW50cyxudW1TZWdtZW50cyk7XG5cbiAgICAgICAgICAgIHZlcnRpY2VzTm9ybVtrKzBdID0gZnVuY1Jlc1swXTtcbiAgICAgICAgICAgIHZlcnRpY2VzTm9ybVtrKzJdID0gZnVuY1Jlc1sxXTtcblxuICAgICAgICAgICAgdmVydGljZXNOb3JtW2srM10gPSB2ZXJ0aWNlc05vcm1bayswXSAqIGJhc2VEaWFtZXRlcjtcbiAgICAgICAgICAgIHZlcnRpY2VzTm9ybVtrKzVdID0gdmVydGljZXNOb3JtW2srMl0gKiBiYXNlRGlhbWV0ZXI7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLl9zbGljZVNlZ0Z1bmMgPSBmdW5jO1xuXG59O1xuXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbkxpbmVCdWZmZXIzZC5wcm90b3R5cGUuc2V0UG9pbnQzZiA9IGZ1bmN0aW9uKGluZGV4LHgseSx6KVxue1xuICAgIGluZGV4ICo9IDM7XG5cbiAgICB2YXIgcG9pbnRzID0gdGhpcy5wb2ludHM7XG5cbiAgICBwb2ludHNbaW5kZXggIF0gPSB4O1xuICAgIHBvaW50c1tpbmRleCsxXSA9IHk7XG4gICAgcG9pbnRzW2luZGV4KzJdID0gejtcbn07XG5cbkxpbmVCdWZmZXIzZC5wcm90b3R5cGUuc2V0UG9pbnQgPSBmdW5jdGlvbihpbmRleCx2KVxue1xuICAgIGluZGV4ICo9IDM7XG5cbiAgICB2YXIgcG9pbnRzID0gdGhpcy5wb2ludHM7XG5cbiAgICBwb2ludHNbaW5kZXggIF0gPSB2WzBdO1xuICAgIHBvaW50c1tpbmRleCsxXSA9IHZbMV07XG4gICAgcG9pbnRzW2luZGV4KzJdID0gdlsyXTtcbn07XG5cbkxpbmVCdWZmZXIzZC5wcm90b3R5cGUuZ2V0UG9pbnQgPSBmdW5jdGlvbihpbmRleCxvdXQpXG57XG4gICAgb3V0ICAgID0gb3V0IHx8IHRoaXMuX3RlbXBWZWMwO1xuICAgIGluZGV4ICo9IDM7XG5cbiAgICB2YXIgcG9pbnRzID0gdGhpcy5wb2ludHM7XG5cbiAgICBvdXRbMF0gPSBwb2ludHNbaW5kZXggIF07XG4gICAgb3V0WzFdID0gcG9pbnRzW2luZGV4KzFdO1xuICAgIG91dFsyXSA9IHBvaW50c1tpbmRleCsyXTtcblxuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbkxpbmVCdWZmZXIzZC5wcm90b3R5cGUuc2V0VW5pdERpYW1ldGVyID0gZnVuY3Rpb24odmFsdWUpXG57XG4gICAgdmFyIG51bVNlZ21lbnRzICA9IHRoaXMuX251bVNlZ21lbnRzLFxuICAgICAgICB2ZXJ0aWNlc05vcm0gPSB0aGlzLl92ZXJ0aWNlc05vcm07XG5cbiAgICB2YXIgb2Zmc2V0ID0gbnVtU2VnbWVudHMgKiAzICogMjtcblxuICAgIHZhciBpID0gMCxcbiAgICAgICAgbCA9IHRoaXMuX251bVBvaW50cyAqIG9mZnNldDtcblxuICAgIHdoaWxlKGkgPCBsKVxuICAgIHtcbiAgICAgICAgdmVydGljZXNOb3JtW2kgKyAzXSA9IHZlcnRpY2VzTm9ybVtpICsgMF0gKiB2YWx1ZTtcbiAgICAgICAgdmVydGljZXNOb3JtW2kgKyA1XSA9IHZlcnRpY2VzTm9ybVtpICsgMl0gKiB2YWx1ZTtcbiAgICAgICAgaSs9NjtcbiAgICB9XG59O1xuXG5MaW5lQnVmZmVyM2QucHJvdG90eXBlLnNldERpYW1ldGVyID0gZnVuY3Rpb24oaW5kZXgsdmFsdWUpXG57XG4gICAgdmFyIG51bVNlZ21lbnRzICA9IHRoaXMuX251bVNlZ21lbnRzLFxuICAgICAgICB2ZXJ0aWNlc05vcm0gPSB0aGlzLl92ZXJ0aWNlc05vcm07XG5cbiAgICB2YXIgb2Zmc2V0ID0gbnVtU2VnbWVudHMgKiAzICogMjtcblxuICAgIHZhciBpID0gaW5kZXggKiBvZmZzZXQsXG4gICAgICAgIGwgPSBpICsgb2Zmc2V0O1xuXG4gICAgd2hpbGUgKGkgPCBsKVxuICAgIHtcbiAgICAgICAgdmVydGljZXNOb3JtW2kgKyAzXSA9IHZlcnRpY2VzTm9ybVtpICsgMF0gKiB2YWx1ZTtcbiAgICAgICAgdmVydGljZXNOb3JtW2kgKyA1XSA9IHZlcnRpY2VzTm9ybVtpICsgMl0gKiB2YWx1ZTtcbiAgICAgICAgaSArPSA2O1xuICAgIH1cbn07XG5cbi8vVE9ETzogQ2xlYW51cCAvIHVucm9sbCAuLi5cbkxpbmVCdWZmZXIzZC5wcm90b3R5cGUuc2V0TnVtU2VnbWVudHMgPSBmdW5jdGlvbihudW1TZWdtZW50cylcbntcbiAgICBudW1TZWdtZW50cyA9IG51bVNlZ21lbnRzIDwgMiA/IDIgOiBudW1TZWdtZW50cztcblxuICAgIHZhciBudW1Qb2ludHMgPSB0aGlzLl9udW1Qb2ludHM7XG4gICAgdmFyIGluZGljZXMgICA9IHRoaXMuaW5kaWNlcyA9IFtdO1xuICAgIHZhciB0ZXhDb29yZHM7XG5cbiAgICB2YXIgaSxqO1xuICAgIHZhciB2MCx2MSx2Mix2MztcbiAgICB2YXIgbmgsbnY7XG4gICAgdmFyIGluZGV4LCBpbmRleFNlZywgaW5kZXhUZXg7XG4gICAgdmFyIGxlbjtcblxuICAgIGlmKG51bVNlZ21lbnRzID4gMilcbiAgICB7XG5cbiAgICAgICAgbGVuID0gbnVtU2VnbWVudHMgLSAxO1xuXG4gICAgICAgIGkgPSAtMTtcbiAgICAgICAgd2hpbGUgKCsraSA8IG51bVBvaW50cyAtIDEpXG4gICAgICAgIHtcblxuICAgICAgICAgICAgaW5kZXggPSBpICogbnVtU2VnbWVudHM7XG4gICAgICAgICAgICBqID0gLTE7XG4gICAgICAgICAgICB3aGlsZSAoKytqIDwgbGVuKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGluZGV4U2VnID0gaW5kZXggKyBqO1xuXG4gICAgICAgICAgICAgICAgdjAgPSBpbmRleFNlZztcbiAgICAgICAgICAgICAgICB2MSA9IGluZGV4U2VnICsgMTtcbiAgICAgICAgICAgICAgICB2MiA9IGluZGV4U2VnICsgbnVtU2VnbWVudHMgKyAxO1xuICAgICAgICAgICAgICAgIHYzID0gaW5kZXhTZWcgKyBudW1TZWdtZW50cztcblxuICAgICAgICAgICAgICAgIGluZGljZXMucHVzaCh2MCx2MSx2MyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdjEsdjIsdjMpO1xuICAgICAgICAgICAgfVxuXG5cbiAgICAgICAgICAgIHYwID0gaW5kZXggKyBsZW47XG4gICAgICAgICAgICB2MSA9IGluZGV4O1xuICAgICAgICAgICAgdjIgPSBpbmRleCArIGxlbiArIDE7XG4gICAgICAgICAgICB2MyA9IGluZGV4ICsgbnVtU2VnbWVudHMgKyBsZW47XG5cbiAgICAgICAgICAgIGluZGljZXMucHVzaCh2MCx2MSx2MyxcbiAgICAgICAgICAgICAgICAgICAgICAgICB2MSx2Mix2Myk7XG5cbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlXG4gICAge1xuICAgICAgICBpID0gLTE7XG4gICAgICAgIHdoaWxlKCsraSA8IG51bVBvaW50cyAtIDEpXG4gICAgICAgIHtcbiAgICAgICAgICAgIGluZGV4ID0gaSAqIDI7XG4gICAgICAgICAgICBpbmRpY2VzLnB1c2goaW5kZXgsICAgIGluZGV4ICsgMSxpbmRleCArIDIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXggKyAxLGluZGV4ICsgMyxpbmRleCArIDIpO1xuXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBsZW4gPSBudW1Qb2ludHMgKiBudW1TZWdtZW50cyAqIDMgO1xuXG4gICAgdGV4Q29vcmRzID0gdGhpcy50ZXhDb29yZHMgPSBuZXcgRmxvYXQzMkFycmF5KGxlbiAvIDMgKiAyKTtcblxuICAgIGkgPSAtMTtcbiAgICB3aGlsZSgrK2kgPCBudW1Qb2ludHMpXG4gICAge1xuICAgICAgICBpbmRleCA9IGkgKiBudW1TZWdtZW50cztcbiAgICAgICAgbmggICAgPSBpIC8gKG51bVBvaW50cyAtIDEpO1xuXG4gICAgICAgIGogPSAtMTtcbiAgICAgICAgd2hpbGUoKytqIDwgbnVtU2VnbWVudHMpXG4gICAgICAgIHtcbiAgICAgICAgICAgIGluZGV4VGV4ID0gKGluZGV4ICsgaikgKiAyO1xuICAgICAgICAgICAgbnYgICAgICAgPSAxIC0gaiAvIChudW1TZWdtZW50cyAtIDEpO1xuXG4gICAgICAgICAgICB0ZXhDb29yZHNbaW5kZXhUZXhdICAgPSBuaDtcbiAgICAgICAgICAgIHRleENvb3Jkc1tpbmRleFRleCsxXSA9IG52O1xuICAgICAgICB9XG4gICAgfVxuXG5cbiAgICB0aGlzLnNldENsb3NlQ2Fwcyh0aGlzLl9jbG9zZWRDYXBzKTtcbiAgICB0aGlzLmFwcGx5U2xpY2VTZWdtZW50RnVuYyh0aGlzLl9zbGljZVNlZ0Z1bmMsdGhpcy5faW5pdERpYW1ldGVyKTtcbn07XG5cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuTGluZUJ1ZmZlcjNkLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbigpXG57XG4gICAgdmFyIG51bVBvaW50cyAgID0gdGhpcy5fbnVtUG9pbnRzLFxuICAgICAgICBudW1TZWdtZW50cyA9IHRoaXMuX251bVNlZ21lbnRzO1xuXG4gICAgdmFyIHBvaW50cyAgICAgICA9IHRoaXMucG9pbnRzLFxuICAgICAgICB2ZXJ0aWNlcyAgICAgPSB0aGlzLnZlcnRpY2VzLFxuICAgICAgICB2ZXJ0aWNlc05vcm0gPSB0aGlzLl92ZXJ0aWNlc05vcm07XG5cbiAgICB2YXIgdGVtcFZlYyA9IHRoaXMuX3RlbXBWZWMwO1xuXG4gICAgdmFyIHAwICA9IHRoaXMuX2JQb2ludDAsXG4gICAgICAgIHAxICA9IHRoaXMuX2JQb2ludDEsXG4gICAgICAgIHAwMSA9IHRoaXMuX2JQb2ludDAxLFxuICAgICAgICB1cCAgPSB0aGlzLl9heGlzWTtcblxuICAgIHZhciBtYXQgICAgPSBNYXQ0NC5tYWtlKCksXG4gICAgICAgIG1hdFJvdCA9IE1hdDQ0Lm1ha2UoKTtcblxuICAgIHZhciBpbmRleCxpbmRleDMsaW5kZXg2O1xuXG4gICAgLy9kaXJlY3Rpb24gZnJvbSBjdXJyZW50IHBvaW50IC0+IG5leHQgcG9pbnQsIHByZXYgcG9pbnQgLT4gY3VycmVudCBwb2ludFxuICAgIHZhciBkaXIwMSxkaXJfMTA7XG4gICAgdmFyIGFuZ2xlLGF4aXM7XG5cbiAgICAvL0JFR0lOIC0gY2FsY3VsYXRlIGZpcnN0IHBvaW50XG4gICAgVmVjMy5zZXQzZihwMCxwb2ludHNbMF0scG9pbnRzWzFdLHBvaW50c1syXSk7XG4gICAgVmVjMy5zZXQzZihwMSxwb2ludHNbM10scG9pbnRzWzRdLHBvaW50c1s1XSk7XG5cbiAgICBkaXIwMSA9IFZlYzMuc2FmZU5vcm1hbGl6ZShWZWMzLnN1YmJlZChwMSxwMCkpO1xuICAgIGFuZ2xlID0gTWF0aC5hY29zKFZlYzMuZG90KGRpcjAxLHVwKSk7XG4gICAgYXhpcyAgPSBWZWMzLnNhZmVOb3JtYWxpemUoVmVjMy5jcm9zcyh1cCxkaXIwMSkpO1xuXG4gICAgTWF0NDQuaWRlbnRpdHkobWF0KTtcbiAgICBtYXRbMTJdID0gcDBbMF07XG4gICAgbWF0WzEzXSA9IHAwWzFdO1xuICAgIG1hdFsxNF0gPSBwMFsyXTtcblxuICAgIE1hdDQ0Lm1ha2VSb3RhdGlvbk9uQXhpcyhhbmdsZSxheGlzWzBdLGF4aXNbMV0sYXhpc1syXSxtYXRSb3QpO1xuICAgIG1hdCA9IE1hdDQ0Lm11bHRQb3N0KG1hdCxtYXRSb3QpO1xuXG4gICAgaiA9IC0xO1xuICAgIHdoaWxlKCsraiA8IG51bVNlZ21lbnRzKVxuICAgIHtcbiAgICAgICAgaW5kZXgzID0gaiAqIDM7XG4gICAgICAgIGluZGV4NiA9IGogKiA2O1xuXG4gICAgICAgIHRlbXBWZWNbMF0gPSB2ZXJ0aWNlc05vcm1baW5kZXg2KzNdO1xuICAgICAgICB0ZW1wVmVjWzFdID0gdmVydGljZXNOb3JtW2luZGV4Nis0XTtcbiAgICAgICAgdGVtcFZlY1syXSA9IHZlcnRpY2VzTm9ybVtpbmRleDYrNV07XG5cbiAgICAgICAgTWF0NDQubXVsdFZlYzMobWF0LHRlbXBWZWMpO1xuXG4gICAgICAgIHZlcnRpY2VzW2luZGV4MyAgXSA9IHRlbXBWZWNbMF07XG4gICAgICAgIHZlcnRpY2VzW2luZGV4MysxXSA9IHRlbXBWZWNbMV07XG4gICAgICAgIHZlcnRpY2VzW2luZGV4MysyXSA9IHRlbXBWZWNbMl07XG4gICAgfVxuICAgIC8vRU5EIC0gY2FsY3VsYXRlIGZpcnN0IHBvaW50XG5cblxuICAgIC8vY2FsYyBmaXJzdCBwcmV2IGRpclxuICAgIFZlYzMuc2V0M2YocDAsIHBvaW50c1szXSxwb2ludHNbNF0scG9pbnRzWzVdKTtcbiAgICBWZWMzLnNldDNmKHAwMSxwb2ludHNbMF0scG9pbnRzWzFdLHBvaW50c1syXSk7XG4gICAgZGlyXzEwID0gVmVjMy5zYWZlTm9ybWFsaXplKFZlYzMuc3ViYmVkKHAwLHAwMSkpO1xuXG4gICAgdmFyIGkzO1xuICAgIHZhciBpID0gMDtcbiAgICB2YXIgajtcbiAgICB3aGlsZSgrK2kgPCBudW1Qb2ludHMgLSAxKVxuICAgIHtcbiAgICAgICAgLy9zZXQgY3VycmVudCBwb2ludFxuICAgICAgICBpMyA9IGkgKiAzO1xuICAgICAgICBwMFswXSA9IHBvaW50c1tpMyAgXTtcbiAgICAgICAgcDBbMV0gPSBwb2ludHNbaTMrMV07XG4gICAgICAgIHAwWzJdID0gcG9pbnRzW2kzKzJdO1xuXG4gICAgICAgIC8vc2V0IG5leHQgcG9pbnRcbiAgICAgICAgaTMgPSAoaSArIDEpICogMztcbiAgICAgICAgcDFbMF0gPSBwb2ludHNbaTMgIF07XG4gICAgICAgIHAxWzFdID0gcG9pbnRzW2kzKzFdO1xuICAgICAgICBwMVsyXSA9IHBvaW50c1tpMysyXTtcblxuICAgICAgICAvL2NhbGN1bGF0ZSBkaXJlY3Rpb25cbiAgICAgICAgZGlyMDEgID0gVmVjMy5zYWZlTm9ybWFsaXplKFZlYzMuc3ViYmVkKHAxLHAwKSk7XG5cbiAgICAgICAgLy9pbnRlcnBvbGF0ZSB3aXRoIHByZXZpb3VzIGRpcmVjdGlvblxuICAgICAgICBkaXIwMVswXSA9IGRpcjAxWzBdICogMC41ICsgZGlyXzEwWzBdICogMC41O1xuICAgICAgICBkaXIwMVsxXSA9IGRpcjAxWzFdICogMC41ICsgZGlyXzEwWzFdICogMC41O1xuICAgICAgICBkaXIwMVsyXSA9IGRpcjAxWzJdICogMC41ICsgZGlyXzEwWzJdICogMC41O1xuXG4gICAgICAgIC8vZ2V0IGRpciBhbmdsZSArIGF4aXNcbiAgICAgICAgYW5nbGUgPSBNYXRoLmFjb3MoVmVjMy5kb3QoZGlyMDEsdXApKTtcbiAgICAgICAgYXhpcyAgPSBWZWMzLnNhZmVOb3JtYWxpemUoVmVjMy5jcm9zcyh1cCxkaXIwMSkpO1xuXG4gICAgICAgIC8vcmVzZXQgdHJhbnNmb3JtYXRpb24gbWF0cml4XG4gICAgICAgIE1hdDQ0LmlkZW50aXR5KG1hdCk7XG5cbiAgICAgICAgLy9zZXQgdHJhbnNsYXRpb25cbiAgICAgICAgbWF0WzEyXSA9IHAwWzBdO1xuICAgICAgICBtYXRbMTNdID0gcDBbMV07XG4gICAgICAgIG1hdFsxNF0gPSBwMFsyXTtcblxuICAgICAgICAvL3NldCByb3RhdGlvblxuICAgICAgICBNYXQ0NC5tYWtlUm90YXRpb25PbkF4aXMoYW5nbGUsYXhpc1swXSxheGlzWzFdLGF4aXNbMl0sbWF0Um90KTtcblxuICAgICAgICAvL211bHRpcGx5IG1hdHJpY2VzXG4gICAgICAgIG1hdCA9IE1hdDQ0Lm11bHRQb3N0KG1hdCxtYXRSb3QpO1xuXG4gICAgICAgIGogPSAtMTtcbiAgICAgICAgd2hpbGUoKytqIDwgbnVtU2VnbWVudHMpXG4gICAgICAgIHtcbiAgICAgICAgICAgIGluZGV4ICA9IChpICogbnVtU2VnbWVudHMgKyBqKTtcbiAgICAgICAgICAgIGluZGV4MyA9IGluZGV4ICogMztcbiAgICAgICAgICAgIGluZGV4NiA9IGluZGV4ICogNjtcblxuICAgICAgICAgICAgLy9sb29rdXAgdmVydGV4XG4gICAgICAgICAgICB0ZW1wVmVjWzBdID0gdmVydGljZXNOb3JtW2luZGV4NiszXTtcbiAgICAgICAgICAgIHRlbXBWZWNbMV0gPSB2ZXJ0aWNlc05vcm1baW5kZXg2KzRdO1xuICAgICAgICAgICAgdGVtcFZlY1syXSA9IHZlcnRpY2VzTm9ybVtpbmRleDYrNV07XG5cbiAgICAgICAgICAgIC8vdHJhbnNmb3JtIHZlcnRleCBjb3B5IGJ5IG1hdHJpeFxuICAgICAgICAgICAgTWF0NDQubXVsdFZlYzMobWF0LHRlbXBWZWMpO1xuXG4gICAgICAgICAgICAvL3JlYXNzaWduIHRyYW5zZm9ybWVkIHZlcnRleFxuICAgICAgICAgICAgdmVydGljZXNbaW5kZXgzICBdID0gdGVtcFZlY1swXTtcbiAgICAgICAgICAgIHZlcnRpY2VzW2luZGV4MysxXSA9IHRlbXBWZWNbMV07XG4gICAgICAgICAgICB2ZXJ0aWNlc1tpbmRleDMrMl0gPSB0ZW1wVmVjWzJdO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9hc3NpZ24gY3VycmVudCBkaXJlY3Rpb24gdG8gcHJldlxuICAgICAgICBkaXJfMTBbMF0gPSBkaXIwMVswXTtcbiAgICAgICAgZGlyXzEwWzFdID0gZGlyMDFbMV07XG4gICAgICAgIGRpcl8xMFsyXSA9IGRpcjAxWzJdO1xuICAgIH1cblxuICAgIHZhciBsZW4gPSBwb2ludHMubGVuZ3RoO1xuXG4gICAgLy9CRUdJTiAtIGNhbGN1bGF0ZSBsYXN0IHBvaW50XG4gICAgVmVjMy5zZXQzZihwMCxwb2ludHNbbGVuIC0gNl0scG9pbnRzW2xlbiAtIDVdLHBvaW50c1tsZW4gLSA0XSk7XG4gICAgVmVjMy5zZXQzZihwMSxwb2ludHNbbGVuIC0gM10scG9pbnRzW2xlbiAtIDJdLHBvaW50c1tsZW4gLSAxXSk7XG5cbiAgICBkaXIwMSA9IFZlYzMuc2FmZU5vcm1hbGl6ZShWZWMzLnN1YmJlZChwMSxwMCkpO1xuICAgIGFuZ2xlID0gTWF0aC5hY29zKFZlYzMuZG90KGRpcjAxLHVwKSk7XG4gICAgYXhpcyAgPSBWZWMzLnNhZmVOb3JtYWxpemUoVmVjMy5jcm9zcyh1cCxkaXIwMSkpO1xuXG4gICAgTWF0NDQuaWRlbnRpdHkobWF0KTtcbiAgICBtYXRbMTJdID0gcDFbMF07XG4gICAgbWF0WzEzXSA9IHAxWzFdO1xuICAgIG1hdFsxNF0gPSBwMVsyXTtcblxuICAgIE1hdDQ0Lm1ha2VSb3RhdGlvbk9uQXhpcyhhbmdsZSxheGlzWzBdLGF4aXNbMV0sYXhpc1syXSxtYXRSb3QpO1xuICAgIG1hdCA9IE1hdDQ0Lm11bHRQb3N0KG1hdCxtYXRSb3QpO1xuXG4gICAgaSAgPSAoaSAqIG51bVNlZ21lbnRzKTtcblxuICAgIGogPSAtMTtcbiAgICB3aGlsZSgrK2ogPCBudW1TZWdtZW50cylcbiAgICB7XG4gICAgICAgIGluZGV4ICA9IGkgKyBqO1xuICAgICAgICBpbmRleDMgPSBpbmRleCAqIDM7XG4gICAgICAgIGluZGV4NiA9IGluZGV4ICogNjtcblxuICAgICAgICB0ZW1wVmVjWzBdID0gdmVydGljZXNOb3JtW2luZGV4NiszXTtcbiAgICAgICAgdGVtcFZlY1sxXSA9IHZlcnRpY2VzTm9ybVtpbmRleDYrNF07XG4gICAgICAgIHRlbXBWZWNbMl0gPSB2ZXJ0aWNlc05vcm1baW5kZXg2KzVdO1xuXG4gICAgICAgIE1hdDQ0Lm11bHRWZWMzKG1hdCx0ZW1wVmVjKTtcblxuICAgICAgICB2ZXJ0aWNlc1tpbmRleDMgIF0gPSB0ZW1wVmVjWzBdO1xuICAgICAgICB2ZXJ0aWNlc1tpbmRleDMrMV0gPSB0ZW1wVmVjWzFdO1xuICAgICAgICB2ZXJ0aWNlc1tpbmRleDMrMl0gPSB0ZW1wVmVjWzJdO1xuICAgIH1cbiAgICAvL0VORCAtIGNhbGN1bGF0ZSBsYXN0IHBvaW50XG59O1xuXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbkxpbmVCdWZmZXIzZC5wcm90b3R5cGUuc2V0U2VnVlRleENvb3JkTWFwcGluZyA9IGZ1bmN0aW9uKHNjYWxlLG9mZnNldCl7dGhpcy5zZXRTZWdUZXhDb29yZE1hcHBpbmcoMSwwLHNjYWxlLG9mZnNldCB8fCAwKTt9O1xuTGluZUJ1ZmZlcjNkLnByb3RvdHlwZS5zZXRTZWdIVGV4Q29vcmRNYXBwaW5nID0gZnVuY3Rpb24oc2NhbGUsb2Zmc2V0KXt0aGlzLnNldFNlZ1RleENvb3JkTWFwcGluZyhzY2FsZSxvZmZzZXQgfHwgMCwxLDApO307XG5cbkxpbmVCdWZmZXIzZC5wcm90b3R5cGUuc2V0U2VnVGV4Q29vcmRNYXBwaW5nID0gZnVuY3Rpb24gKHNjYWxlSCwgb2Zmc2V0SCwgc2NhbGVWLCBvZmZzZXRWKVxue1xuICAgIHZhciBudW1Qb2ludHMgICAgID0gdGhpcy5fbnVtUG9pbnRzLFxuICAgICAgICBudW1TZWdtZW50cyAgID0gdGhpcy5fbnVtU2VnbWVudHMsXG4gICAgICAgIG51bVNlZ21lbnRzXzEgPSBudW1TZWdtZW50cyAtIDE7XG5cbiAgICB2YXIgdGV4Q29vcmRzID0gdGhpcy50ZXhDb29yZHM7XG4gICAgdmFyIGksIGosIGluZGV4LCBpbmRleFRleDtcbiAgICB2YXIgbmgsIG52O1xuXG4gICAgaSA9IC0xO1xuICAgIHdoaWxlICgrK2kgPCBudW1Qb2ludHMpXG4gICAge1xuICAgICAgICBpbmRleCA9IGkgKiBudW1TZWdtZW50cztcbiAgICAgICAgbmggPSAoaSAvIChudW1Qb2ludHMgLSAxKSkgKiBzY2FsZUggLSBvZmZzZXRIO1xuXG4gICAgICAgIGogPSAtMTtcbiAgICAgICAgd2hpbGUgKCsraiA8IG51bVNlZ21lbnRzKVxuICAgICAgICB7XG4gICAgICAgICAgICBpbmRleFRleCA9IChpbmRleCArIGopICogMjtcbiAgICAgICAgICAgIG52ID0gKDEgLSBqIC8gbnVtU2VnbWVudHNfMSkgKiBzY2FsZVYgLSBvZmZzZXRWO1xuXG4gICAgICAgICAgICB0ZXhDb29yZHNbaW5kZXhUZXggIF0gPSBuaDtcbiAgICAgICAgICAgIHRleENvb3Jkc1tpbmRleFRleCArIDFdID0gbnY7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbkxpbmVCdWZmZXIzZC5wcm90b3R5cGUuc2V0Q2xvc2VDYXBzID0gZnVuY3Rpb24oYm9vbClcbntcbiAgICBpZih0aGlzLl9udW1TZWdtZW50cyA9PSAyKXJldHVybjtcblxuICAgIHZhciBpbmRpY2VzID0gdGhpcy5pbmRpY2VzLFxuICAgICAgICB0ZW1wICAgID0gbmV3IEFycmF5KHRoaXMuaW5kaWNlcy5sZW5ndGgpO1xuXG4gICAgdmFyIGkgPSAtMTt3aGlsZSgrK2k8dGVtcC5sZW5ndGgpdGVtcFtpXSA9IGluZGljZXNbaV07XG5cbiAgICB2YXIgbnVtUG9pbnRzICAgPSB0aGlzLl9udW1Qb2ludHMsXG4gICAgICAgIG51bVNlZ21lbnRzID0gdGhpcy5fbnVtU2VnbWVudHM7XG4gICAgdmFyIGxlbjtcblxuXG4gICAgaWYoYm9vbClcbiAgICB7XG5cbiAgICAgICAgbGVuID0gbnVtU2VnbWVudHMgLSAyO1xuICAgICAgICBpID0gLTE7d2hpbGUoKytpIDwgbGVuKXRlbXAucHVzaCgwLGkrMSxpKzIpO1xuXG4gICAgICAgIHZhciBqO1xuICAgICAgICBsZW4gKz0gKG51bVBvaW50cyAtIDEpICogbnVtU2VnbWVudHMgKyAxO1xuICAgICAgICBpICAgPSBqID0gbGVuIC0gbnVtU2VnbWVudHMgKyAxO1xuICAgICAgICB3aGlsZSgrK2kgPCBsZW4pdGVtcC5wdXNoKGosaSxpKzEpO1xuICAgIH1cbiAgICBlbHNlXG4gICAge1xuICAgICAgICB0ZW1wID0gdGVtcC5zbGljZSgwLGluZGljZXMubGVuZ3RoIC0gKG51bVNlZ21lbnRzIC0gMikgKiAyICogMyk7XG4gICAgfVxuXG4gICAgdGhpcy5pbmRpY2VzID0gbmV3IFVpbnQxNkFycmF5KHRlbXApO1xuICAgIHRoaXMudXBkYXRlVmVydGV4Tm9ybWFscygpO1xuICAgIHRoaXMuX2Nsb3NlZENhcHMgPSBib29sO1xufTtcblxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG5MaW5lQnVmZmVyM2QucHJvdG90eXBlLmdldE51bVNlZ21lbnRzID0gZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fbnVtU2VnbWVudHM7fTtcbkxpbmVCdWZmZXIzZC5wcm90b3R5cGUuZ2V0TnVtUG9pbnRzICAgPSBmdW5jdGlvbigpe3JldHVybiB0aGlzLl9udW1Qb2ludHM7fTtcblxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG5MaW5lQnVmZmVyM2QucHJvdG90eXBlLl9kcmF3ID0gZnVuY3Rpb24oZ2wsY291bnQsb2Zmc2V0KVxue1xuICAgIHZhciBpbmRpY2VzID0gdGhpcy5pbmRpY2VzO1xuICAgIGdsLmRyYXdFbGVtZW50cyh0aGlzLnZlcnRpY2VzLHRoaXMubm9ybWFscyxnbC5idWZmZXJDb2xvcnMoZ2wuZ2V0Q29sb3JCdWZmZXIoKSx0aGlzLmNvbG9ycyksdGhpcy50ZXhDb29yZHMsaW5kaWNlcyxnbC5nZXREcmF3TW9kZSgpLGNvdW50IHx8IGluZGljZXMubGVuZ3RoLCBvZmZzZXQgfHwgMCApO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBMaW5lQnVmZmVyM2Q7XG4iLCJ2YXIgVmVjMiAgID0gcmVxdWlyZSgnLi4vbWF0aC9mVmVjMicpLFxuICAgIFZlYzMgICA9IHJlcXVpcmUoJy4uL21hdGgvZlZlYzMnKSxcbiAgICBDb2xvciAgPSByZXF1aXJlKCcuLi91dGlsL2ZDb2xvcicpLFxuICAgIEdlb20zZCA9IHJlcXVpcmUoJy4vZkdlb20zZCcpO1xuXG5QYXJhbWV0cmljU3VyZmFjZSA9IGZ1bmN0aW9uKHNpemUpXG57XG4gICAgR2VvbTNkLmFwcGx5KHRoaXMsbnVsbCk7XG5cbiAgICB0aGlzLmZ1bmNYID0gZnVuY3Rpb24odSx2LHQpe3JldHVybiB1O307XG4gICAgdGhpcy5mdW5jWSA9IGZ1bmN0aW9uKHUsdix0KXtyZXR1cm4gMDt9O1xuICAgIHRoaXMuZnVuY1ogPSBmdW5jdGlvbih1LHYsdCl7cmV0dXJuIHY7fTtcbiAgICB0aGlzLnVyICAgID0gWy0xLDFdO1xuICAgIHRoaXMudnIgICAgPSBbLTEsMV07XG4gICAgdGhpcy5zaXplICA9IG51bGw7XG5cbiAgICB0aGlzLnNldFNpemUoc2l6ZSk7XG5cbn07XG5cblBhcmFtZXRyaWNTdXJmYWNlLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoR2VvbTNkLnByb3RvdHlwZSk7XG5cblBhcmFtZXRyaWNTdXJmYWNlLnByb3RvdHlwZS5zZXRTaXplID0gZnVuY3Rpb24oc2l6ZSx1bml0KVxue1xuICAgIHVuaXQgPSB1bml0IHx8IDE7XG5cbiAgICB0aGlzLnNpemUgPSBzaXplO1xuXG4gICAgdmFyIGxlbmd0aCAgPSBzaXplICogc2l6ZTtcblxuICAgIHRoaXMudmVydGljZXMgID0gbmV3IEZsb2F0MzJBcnJheShsZW5ndGggKiBWZWMzLlNJWkUpO1xuICAgIHRoaXMubm9ybWFscyAgID0gbmV3IEZsb2F0MzJBcnJheShsZW5ndGggKiBWZWMzLlNJWkUpO1xuICAgIHRoaXMuY29sb3JzICAgID0gbmV3IEZsb2F0MzJBcnJheShsZW5ndGggKiBDb2xvci5TSVpFKTtcbiAgICB0aGlzLnRleENvb3JkcyA9IG5ldyBGbG9hdDMyQXJyYXkobGVuZ3RoICogVmVjMi5TSVpFKTtcblxuICAgIHZhciBpbmRpY2VzID0gW107XG5cbiAgICB2YXIgYSwgYiwgYywgZDtcbiAgICB2YXIgaSxqO1xuXG4gICAgaSA9IC0xO1xuICAgIHdoaWxlKCsraSA8IHNpemUgLSAxKVxuICAgIHtcbiAgICAgICAgaiA9IC0xO1xuICAgICAgICB3aGlsZSgrK2ogPCBzaXplIC0gMSlcbiAgICAgICAge1xuICAgICAgICAgICAgYSA9IGogICAgICsgc2l6ZSAqIGk7XG4gICAgICAgICAgICBiID0gKGorMSkgKyBzaXplICogaTtcbiAgICAgICAgICAgIGMgPSBqICAgICArIHNpemUgKiAoaSsxKTtcbiAgICAgICAgICAgIGQgPSAoaisxKSArIHNpemUgKiAoaSsxKTtcblxuICAgICAgICAgICAgaW5kaWNlcy5wdXNoKGEsYixjKTtcbiAgICAgICAgICAgIGluZGljZXMucHVzaChiLGQsYyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmluZGljZXMgPSBuZXcgVWludDE2QXJyYXkoaW5kaWNlcyk7XG5cbiAgICB0aGlzLnVwZGF0ZVZlcnRleE5vcm1hbHMoKTtcbn07XG5cblBhcmFtZXRyaWNTdXJmYWNlLnByb3RvdHlwZS5zZXRGdW5jdGlvbnMgPSBmdW5jdGlvbihmdW5jWCxmdW5jWSxmdW5jWix2cix1cilcbntcbiAgICB0aGlzLmZ1bmNYID0gZnVuY1g7XG4gICAgdGhpcy5mdW5jWSA9IGZ1bmNZO1xuICAgIHRoaXMuZnVuY1ogPSBmdW5jWjtcbiAgICB0aGlzLnZyICAgPSB2cjtcbiAgICB0aGlzLnVyICAgPSB1cjtcbn07XG5cblBhcmFtZXRyaWNTdXJmYWNlLnByb3RvdHlwZS5hcHBseUZ1bmN0aW9ucyA9IGZ1bmN0aW9uKClcbntcbiAgICB0aGlzLmFwcGx5RnVuY3Rpb25zV2l0aEFyZygwKTtcbn07XG5cbi8vT3ZlcnJpZGVcblBhcmFtZXRyaWNTdXJmYWNlLnByb3RvdHlwZS5hcHBseUZ1bmN0aW9uc1dpdGhBcmcgPSBmdW5jdGlvbihhcmcpXG57XG4gICAgdmFyIHNpemUgID0gdGhpcy5zaXplO1xuXG4gICAgdmFyIGZ1bmNYID0gdGhpcy5mdW5jWCxcbiAgICAgICAgZnVuY1kgPSB0aGlzLmZ1bmNZLFxuICAgICAgICBmdW5jWiA9IHRoaXMuZnVuY1o7XG5cbiAgICB2YXIgdXJMb3dlciA9IHRoaXMudXJbMF0sXG4gICAgICAgIHVyVXBwZXIgPSB0aGlzLnVyWzFdLFxuICAgICAgICB2ckxvd2VyID0gdGhpcy52clswXSxcbiAgICAgICAgdnJVcHBlciA9IHRoaXMudnJbMV07XG5cbiAgICB2YXIgaSwgaiwgdSwgdjtcblxuICAgIHZhciB2ZXJ0aWNlcyA9IHRoaXMudmVydGljZXM7XG5cbiAgICB2YXIgaW5kZXgsaW5kZXhWZXJ0aWNlcztcblxuICAgIHZhciB0ZW1wMCA9IHVyVXBwZXIgLSB1ckxvd2VyLFxuICAgICAgICB0ZW1wMSA9IHZyVXBwZXIgLSB2ckxvd2VyLFxuICAgICAgICB0ZW1wMiA9IHNpemUgLSAxO1xuXG4gICAgaSA9IC0xO1xuICAgIHdoaWxlKCsraSA8IHNpemUpXG4gICAge1xuICAgICAgICBqID0gLTE7XG4gICAgICAgIHdoaWxlKCsraiA8IHNpemUpXG4gICAgICAgIHtcbiAgICAgICAgICAgIGluZGV4ID0gKGogKyBzaXplICogaSk7XG4gICAgICAgICAgICBpbmRleFZlcnRpY2VzID0gaW5kZXggKiAzO1xuXG4gICAgICAgICAgICB1ID0gKHVyTG93ZXIgKyB0ZW1wMCAqIChqIC8gdGVtcDIpKTtcbiAgICAgICAgICAgIHYgPSAodnJMb3dlciArIHRlbXAxICogKGkgLyB0ZW1wMikpO1xuXG4gICAgICAgICAgICB2ZXJ0aWNlc1tpbmRleFZlcnRpY2VzICAgIF0gPSBmdW5jWCh1LHYsYXJnKTtcbiAgICAgICAgICAgIHZlcnRpY2VzW2luZGV4VmVydGljZXMgKyAxXSA9IGZ1bmNZKHUsdixhcmcpO1xuICAgICAgICAgICAgdmVydGljZXNbaW5kZXhWZXJ0aWNlcyArIDJdID0gZnVuY1oodSx2LGFyZyk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5QYXJhbWV0cmljU3VyZmFjZS5wcm90b3R5cGUucG9pbnRPblN1cmZhY2UgPSBmdW5jdGlvbih1LHYpXG57XG4gICAgcmV0dXJuIHRoaXMucG9pbnRPblN1cmZhY2VXaXRoQXJnKHUsdiwwKTtcbn07XG5cblBhcmFtZXRyaWNTdXJmYWNlLnByb3RvdHlwZS5wb2ludE9uU3VyZmFjZVdpdGhBcmcgPSBmdW5jdGlvbih1LHYsYXJnKVxue1xuICAgIHJldHVybiBWZWMzLm1ha2UodGhpcy5mdW5jWCh1LHYsYXJnKSxcbiAgICAgICAgICAgICAgICAgICAgIHRoaXMuZnVuY1kodSx2LGFyZyksXG4gICAgICAgICAgICAgICAgICAgICB0aGlzLmZ1bmNaKHUsdixhcmcpKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gUGFyYW1ldHJpY1N1cmZhY2U7XG5cbiIsInZhciBrTWF0aCAgICAgID0gcmVxdWlyZSgnLi4vbWF0aC9mTWF0aCcpLFxuICAgIExpbmUyZFV0aWwgPSByZXF1aXJlKCcuL2ZMaW5lMmRVdGlsJyk7XG5cbm1vZHVsZS5leHBvcnRzID1cbntcbiAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgICBtYWtlVmVydGV4Q291bnRGaXR0ZWQgOiBmdW5jdGlvbihwb2x5Z29uLGNvdW50KVxuICAgIHtcbiAgICAgICAgdmFyIGRpZmYgICAgPSBwb2x5Z29uLmxlbmd0aCAqIDAuNSAtIGNvdW50O1xuXG4gICAgICAgIHJldHVybiBkaWZmIDwgMCA/IHRoaXMubWFrZVZlcnRleENvdW50SW5jcmVhc2VkKHBvbHlnb24sIE1hdGguYWJzKGRpZmYpKSA6XG4gICAgICAgICAgICAgICBkaWZmID4gMCA/IHRoaXMubWFrZVZlcnRleENvdW50RGVjcmVhc2VkKHBvbHlnb24sIGRpZmYpIDpcbiAgICAgICAgICAgICAgIHBvbHlnb247XG4gICAgfSxcblxuXG4gICAgLy9UT0RPOiBtb2R1bG8gbG9vcFxuICAgIG1ha2VWZXJ0ZXhDb3VudEluY3JlYXNlZCA6IGZ1bmN0aW9uKHBvbHlnb24sY291bnQpXG4gICAge1xuICAgICAgICBjb3VudCA9ICh0eXBlb2YgY291bnQgPT0gJ3VuZGVmaW5lZCcpID8gMSA6IGNvdW50O1xuXG4gICAgICAgIHZhciBvdXQgPSBwb2x5Z29uLnNsaWNlKCk7XG4gICAgICAgIGlmKGNvdW50IDw9IDAgKXJldHVybiBwb2x5Z29uO1xuXG4gICAgICAgIHZhciBpID0gLTEsajtcbiAgICAgICAgdmFyIGxlbjtcbiAgICAgICAgdmFyIG1heDtcblxuICAgICAgICB2YXIgamMsam47XG5cbiAgICAgICAgdmFyIHgsIHksIG14LCBteTtcbiAgICAgICAgdmFyIGR4LGR5LGQ7XG5cbiAgICAgICAgdmFyIGVkZ2VTSW5kZXgsXG4gICAgICAgICAgICBlZGdlRUluZGV4O1xuXG4gICAgICAgIHdoaWxlKCsraSA8IGNvdW50KVxuICAgICAgICB7XG4gICAgICAgICAgICBtYXggPSAtSW5maW5pdHk7XG4gICAgICAgICAgICBsZW4gPSBvdXQubGVuZ3RoICogMC41O1xuXG4gICAgICAgICAgICBlZGdlU0luZGV4ID0gZWRnZUVJbmRleCA9IDA7XG5cbiAgICAgICAgICAgIGogPSAtMTtcbiAgICAgICAgICAgIHdoaWxlKCsraiA8IGxlbiAtIDEpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgamMgPSBqICogMjtcbiAgICAgICAgICAgICAgICBqbiA9IChqICsgMSkgKiAyO1xuXG4gICAgICAgICAgICAgICAgZHggPSBvdXRbam4gICAgXSAtIG91dFtqYyAgICBdO1xuICAgICAgICAgICAgICAgIGR5ID0gb3V0W2puICsgMV0gLSBvdXRbamMgKyAxXTtcbiAgICAgICAgICAgICAgICBkICA9IGR4ICogZHggKyBkeSAqIGR5O1xuXG4gICAgICAgICAgICAgICAgaWYoZCA+IG1heCl7bWF4ID0gZDtlZGdlU0luZGV4ID0gajt9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGpjID0gaiAqIDI7XG4gICAgICAgICAgICBkeCA9IG91dFswXSAtIG91dFtqYyAgICBdO1xuICAgICAgICAgICAgZHkgPSBvdXRbMV0gLSBvdXRbamMgKyAxXTtcbiAgICAgICAgICAgIGQgID0gZHggKiBkeCArIGR5ICogZHk7XG5cbiAgICAgICAgICAgIGVkZ2VTSW5kZXggPSAoZCA+IG1heCkgPyBqIDogZWRnZVNJbmRleDtcbiAgICAgICAgICAgIGVkZ2VFSW5kZXggPSBlZGdlU0luZGV4ID09IGxlbiAtIDEgPyAwIDogZWRnZVNJbmRleCArIDE7XG5cbiAgICAgICAgICAgIGVkZ2VTSW5kZXgqPSAyO1xuICAgICAgICAgICAgZWRnZUVJbmRleCo9IDI7XG5cbiAgICAgICAgICAgIHggPSBvdXRbZWRnZVNJbmRleCAgICBdO1xuICAgICAgICAgICAgeSA9IG91dFtlZGdlU0luZGV4ICsgMV07XG5cbiAgICAgICAgICAgIG14ID0geCArIChvdXRbZWRnZUVJbmRleCAgICBdIC0geCkgKiAwLjU7XG4gICAgICAgICAgICBteSA9IHkgKyAob3V0W2VkZ2VFSW5kZXggKyAxXSAtIHkpICogMC41O1xuXG4gICAgICAgICAgICBvdXQuc3BsaWNlKGVkZ2VFSW5kZXgsMCxteCxteSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gb3V0O1xuXG4gICAgfSxcblxuXG4gICAgLy9UT0RPOiBtb2R1bG8gbG9vcFxuICAgIG1ha2VWZXJ0ZXhDb3VudERlY3JlYXNlZCA6IGZ1bmN0aW9uKHBvbHlnb24sY291bnQpXG4gICAge1xuICAgICAgICBjb3VudCA9ICh0eXBlb2YgY291bnQgPT0gJ3VuZGVmaW5lZCcpID8gMSA6IGNvdW50O1xuXG4gICAgICAgIHZhciBvdXQgPSBwb2x5Z29uLnNsaWNlKCk7XG4gICAgICAgIGlmKChvdXQubGVuZ3RoICogMC41IC0gY291bnQpIDwgMyB8fCBjb3VudCA9PSAwKXJldHVybiBvdXQ7XG5cbiAgICAgICAgdmFyIGkgPSAtMSwgajtcbiAgICAgICAgdmFyIGxlbjtcbiAgICAgICAgdmFyIG1pbjtcblxuICAgICAgICB2YXIgamMsam47XG4gICAgICAgIHZhciBkeCxkeSxkO1xuXG4gICAgICAgIHZhciBlZGdlU0luZGV4LFxuICAgICAgICAgICAgZWRnZUVJbmRleDtcblxuICAgICAgICB3aGlsZSgrK2kgPCBjb3VudClcbiAgICAgICAge1xuXG4gICAgICAgICAgICBtaW4gPSBJbmZpbml0eTtcbiAgICAgICAgICAgIGxlbiA9IG91dC5sZW5ndGggKiAwLjU7XG5cbiAgICAgICAgICAgIGVkZ2VTSW5kZXggPSBlZGdlRUluZGV4ID0gMDtcblxuICAgICAgICAgICAgaiA9IC0xO1xuICAgICAgICAgICAgd2hpbGUoKytqIDwgbGVuIC0gMSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBqYyA9IGogKiAyO1xuICAgICAgICAgICAgICAgIGpuID0gKGogKyAxKSAqIDI7XG5cbiAgICAgICAgICAgICAgICBkeCA9IG91dFtqbiAgICBdIC0gb3V0W2pjICAgIF07XG4gICAgICAgICAgICAgICAgZHkgPSBvdXRbam4gKyAxXSAtIG91dFtqYyArIDFdO1xuICAgICAgICAgICAgICAgIGQgID0gZHggKiBkeCArIGR5ICogZHk7XG5cbiAgICAgICAgICAgICAgICBpZihkIDwgbWluKXttaW4gPSBkO2VkZ2VTSW5kZXggPSBqO31cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgamMgPSBqICogMjtcbiAgICAgICAgICAgIGR4ID0gb3V0WzBdIC0gb3V0W2pjICAgIF07XG4gICAgICAgICAgICBkeSA9IG91dFsxXSAtIG91dFtqYyArIDFdO1xuICAgICAgICAgICAgZCAgPSBkeCAqIGR4ICsgZHkgKiBkeTtcblxuICAgICAgICAgICAgZWRnZVNJbmRleCA9IChkIDwgbWluKSA/IGogOiBlZGdlU0luZGV4O1xuICAgICAgICAgICAgZWRnZUVJbmRleCA9IGVkZ2VTSW5kZXggPT0gbGVuIC0gMSA/IDAgOiBlZGdlU0luZGV4ICsgMTtcblxuICAgICAgICAgICAgb3V0LnNwbGljZShlZGdlRUluZGV4ICogMiwyKTtcblxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG91dDtcblxuICAgIH0sXG5cbiAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cblxuICAgIG1ha2VFZGdlc1N1YmRpdmlkZWQgOiBmdW5jdGlvbihwb2x5Z29uLGNvdW50LG91dClcbiAgICB7XG4gICAgICAgIGNvdW50ID0gY291bnQgfHwgMTtcblxuICAgICAgICB2YXIgaSwgaiwgaztcbiAgICAgICAgdmFyIGkyLGk0O1xuXG4gICAgICAgIHZhciBsZW47XG4gICAgICAgIHZhciB4LCB5LCBteCwgbXk7XG5cblxuICAgICAgICBpZihvdXQpXG4gICAgICAgIHtcbiAgICAgICAgICAgIG91dC5sZW5ndGggPSBwb2x5Z29uLmxlbmd0aDtcbiAgICAgICAgICAgIGkgPSAtMTt3aGlsZSgrK2kgPCBwb2x5Z29uLmxlbmd0aCl7b3V0W2ldID0gcG9seWdvbltpXTt9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBvdXQgPSBwb2x5Z29uLnNsaWNlKCk7XG5cbiAgICAgICAgaiA9IC0xO1xuICAgICAgICB3aGlsZSgrK2ogPCBjb3VudClcbiAgICAgICAge1xuXG4gICAgICAgICAgICBsZW4gPSBvdXQubGVuZ3RoICogMC41IC0xO1xuICAgICAgICAgICAgaSA9IC0xO1xuICAgICAgICAgICAgd2hpbGUoKytpIDwgbGVuKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGkyID0gaSAqIDI7XG4gICAgICAgICAgICAgICAgaTQgPSAoaSAqIDIpICogMjtcbiAgICAgICAgICAgICAgICB4ICA9IG91dFtpNF07XG4gICAgICAgICAgICAgICAgeSAgPSBvdXRbaTQgKyAxXTtcblxuICAgICAgICAgICAgICAgIGkyID0gaTIgKyAxO1xuICAgICAgICAgICAgICAgIGk0ID0gaTIgKiAyO1xuICAgICAgICAgICAgICAgIG14ID0geCArIChvdXRbaTQgICAgXSAtIHgpICogMC41O1xuICAgICAgICAgICAgICAgIG15ID0geSArIChvdXRbaTQgKyAxXSAtIHkpICogMC41O1xuXG4gICAgICAgICAgICAgICAgb3V0LnNwbGljZShpNCwwLG14LG15KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaTIgPSBpICAgKiAyO1xuICAgICAgICAgICAgaTQgPSBpMiAqIDI7XG5cbiAgICAgICAgICAgIHggID0gb3V0W2k0XTtcbiAgICAgICAgICAgIHkgID0gb3V0W2k0ICsgMV07XG4gICAgICAgICAgICBteCA9IHggKyAob3V0WzBdIC0geCkgKiAwLjU7XG4gICAgICAgICAgICBteSA9IHkgKyAob3V0WzFdIC0geSkgKiAwLjU7XG5cbiAgICAgICAgICAgIG91dC5zcGxpY2UoKGkyICsgMSkgKiAyLDAsbXgsbXkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG91dDtcbiAgICB9LFxuXG4gICAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG5cbiAgICBtYWtlU21vb3RoZWRMaW5lYXIgOiBmdW5jdGlvbihwb2x5Z29uLGNvdW50LG91dClcbiAgICB7XG4gICAgICAgIGNvdW50ID0gY291bnQgfHwgMTtcblxuICAgICAgICB2YXIgcHgscHksZHgsZHk7XG5cbiAgICAgICAgdmFyIGksIGosIGs7XG5cbiAgICAgICAgdmFyIHRlbXAgICAgPSBwb2x5Z29uLnNsaWNlKCksXG4gICAgICAgICAgICB0ZW1wTGVuID0gdGVtcC5sZW5ndGg7XG5cbiAgICAgICAgaWYob3V0KW91dC5sZW5ndGggPSB0ZW1wTGVuICAqIDI7XG4gICAgICAgIGVsc2Ugb3V0ID0gbmV3IEFycmF5KHRlbXBMZW4gICogMik7XG5cbiAgICAgICAgaiA9IC0xO1xuICAgICAgICB3aGlsZSgrK2ogPCBjb3VudClcbiAgICAgICAge1xuICAgICAgICAgICAgdGVtcExlbiAgICA9IHRlbXAubGVuZ3RoO1xuICAgICAgICAgICAgb3V0Lmxlbmd0aCA9IHRlbXBMZW4gKiAyO1xuXG4gICAgICAgICAgICBpID0gMDtcbiAgICAgICAgICAgIHdoaWxlKGkgPCB0ZW1wTGVuKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHB4ID0gdGVtcFtpICAgIF07XG4gICAgICAgICAgICAgICAgcHkgPSB0ZW1wW2kgKyAxXSA7XG4gICAgICAgICAgICAgICAgayAgPSAoaSArIDIpICUgdGVtcExlbjtcbiAgICAgICAgICAgICAgICBkeCA9IHRlbXBbayAgICBdIC0gcHg7XG4gICAgICAgICAgICAgICAgZHkgPSB0ZW1wW2sgKyAxXSAtIHB5O1xuXG4gICAgICAgICAgICAgICAgayA9IGkgKiAyO1xuICAgICAgICAgICAgICAgIG91dFtrICBdID0gcHggKyBkeCAqIDAuMjU7XG4gICAgICAgICAgICAgICAgb3V0W2srMV0gPSBweSArIGR5ICogMC4yNTtcbiAgICAgICAgICAgICAgICBvdXRbaysyXSA9IHB4ICsgZHggKiAwLjc1O1xuICAgICAgICAgICAgICAgIG91dFtrKzNdID0gcHkgKyBkeSAqIDAuNzU7XG5cbiAgICAgICAgICAgICAgICBpKz0yO1xuICAgICAgICAgICAgfVxuXG5cbiAgICAgICAgICAgIHRlbXAgPSBvdXQuc2xpY2UoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBvdXQ7XG5cbiAgICB9LFxuXG4gICAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4gICAgbWFrZU9wdEhlYWRpbmcgOiBmdW5jdGlvbihwb2x5Z29uLHRvbGVyYW5jZSlcbiAgICB7XG4gICAgICAgIGlmKHBvbHlnb24ubGVuZ3RoIDwgNClyZXR1cm4gcG9seWdvbjtcblxuICAgICAgICB0b2xlcmFuY2UgPSB0b2xlcmFuY2UgfHwga01hdGguRVBTSUxPTjtcblxuICAgICAgICB2YXIgdGVtcCA9IFtdO1xuXG4gICAgICAgIHZhciBsZW4gPSBwb2x5Z29uLmxlbmd0aCAvIDIgLSAxO1xuXG4gICAgICAgIHZhciBweCA9IHBvbHlnb25bMF0sXG4gICAgICAgICAgICBweSA9IHBvbHlnb25bMV0sXG4gICAgICAgICAgICB4LCB5O1xuXG4gICAgICAgIHZhciBwaCA9IE1hdGguYXRhbjIocG9seWdvblszXSAtIHB5LHBvbHlnb25bMl0gLSBweCksXG4gICAgICAgICAgICBjaDtcblxuICAgICAgICB0ZW1wLnB1c2gocHgscHkpO1xuXG4gICAgICAgIHZhciBpID0gMCxpMjtcblxuICAgICAgICB3aGlsZSgrK2kgPCBsZW4pXG4gICAgICAgIHtcbiAgICAgICAgICAgIGkyID0gaSAqIDI7XG4gICAgICAgICAgICB4ID0gcG9seWdvbltpMiAgXTtcbiAgICAgICAgICAgIHkgPSBwb2x5Z29uW2kyKzFdO1xuXG4gICAgICAgICAgICBpMiA9IChpICsgMSkgKiAyO1xuICAgICAgICAgICAgY2ggPSBNYXRoLmF0YW4yKHBvbHlnb25baTIrMV0gLSB5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvbHlnb25baTIgIF0gLSB4KTtcblxuICAgICAgICAgICAgaWYoTWF0aC5hYnMocGggLSBjaCkgPiB0b2xlcmFuY2UpdGVtcC5wdXNoKHgseSk7XG5cbiAgICAgICAgICAgIHB4ID0geDtcbiAgICAgICAgICAgIHB5ID0geTtcbiAgICAgICAgICAgIHBoID0gY2g7XG4gICAgICAgIH1cblxuICAgICAgICB4ID0gcG9seWdvbltwb2x5Z29uLmxlbmd0aCAtIDJdO1xuICAgICAgICB5ID0gcG9seWdvbltwb2x5Z29uLmxlbmd0aCAtIDFdO1xuXG4gICAgICAgIGNoID0gTWF0aC5hdGFuMihwb2x5Z29uWzFdIC0geSwgcG9seWdvblswXSAtIHgpO1xuXG4gICAgICAgIGlmKE1hdGguYWJzKHBoIC0gY2gpID4gdG9sZXJhbmNlKXRlbXAucHVzaCh4LHkpO1xuXG4gICAgICAgIHJldHVybiB0ZW1wO1xuICAgIH0sXG5cblxuICAgIG1ha2VPcHRFZGdlTGVuZ3RoIDogZnVuY3Rpb24ocG9seWdvbixlZGdlTGVuZ3RoKVxuICAgIHtcbiAgICAgICAgdmFyIHRlbXAgPSBbXTtcbiAgICAgICAgdmFyIGxlbiAgPSBwb2x5Z29uLmxlbmd0aCAqIDAuNSAtIDE7XG5cbiAgICAgICAgdmFyIGR4LGR5O1xuICAgICAgICB2YXIgcHgscHk7XG4gICAgICAgIHZhciB4LCB5O1xuXG4gICAgICAgIHZhciBpbmRleDtcblxuICAgICAgICB2YXIgZWRnZUxlbmd0aFNxID0gZWRnZUxlbmd0aCAqIGVkZ2VMZW5ndGg7XG5cbiAgICAgICAgcHggPSBwb2x5Z29uWzBdO1xuICAgICAgICBweSA9IHBvbHlnb25bMV07XG5cbiAgICAgICAgdGVtcC5wdXNoKHB4LHB5KTtcbiAgICAgICAgdmFyIGkgPSAwO1xuICAgICAgICB3aGlsZSgrK2kgPCBsZW4pXG4gICAgICAgIHtcbiAgICAgICAgICAgIGluZGV4ID0gaSAqIDI7XG5cbiAgICAgICAgICAgIHggPSAgcG9seWdvbltpbmRleCAgXTtcbiAgICAgICAgICAgIHkgPSAgcG9seWdvbltpbmRleCsxXTtcblxuICAgICAgICAgICAgZHggPSB4IC0gcHg7XG4gICAgICAgICAgICBkeSA9IHkgLSBweTtcblxuICAgICAgICAgICAgaWYoKGR4ICogZHggKyBkeSAqIGR5KSA+PSBlZGdlTGVuZ3RoU3EpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcHggPSB4O1xuICAgICAgICAgICAgICAgIHB5ID0geTtcblxuICAgICAgICAgICAgICAgIHRlbXAucHVzaCh4LHkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgeCA9IHBvbHlnb25bcG9seWdvbi5sZW5ndGgtMl07XG4gICAgICAgIHkgPSBwb2x5Z29uW3BvbHlnb24ubGVuZ3RoLTFdO1xuXG4gICAgICAgIHB4ID0gcG9seWdvblswXTtcbiAgICAgICAgcHkgPSBwb2x5Z29uWzFdO1xuXG4gICAgICAgIGR4ID0geCAtIHB4O1xuICAgICAgICBkeSA9IHkgLSBweTtcblxuICAgICAgICBpZigoZHggKiBkeCArIGR5ICogZHkpID49IGVkZ2VMZW5ndGhTcSl0ZW1wLnB1c2goeCx5KTtcblxuICAgICAgICByZXR1cm4gdGVtcDtcbiAgICB9LFxuXG4gICAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG5cbiAgICAvL2h0dHA6Ly9hbGllbnJ5ZGVyZmxleC5jb20vcG9seWdvbl9wZXJpbWV0ZXIvXG4gICAgbWFrZVBlcmltZXRlciA6IGZ1bmN0aW9uKHBvbHlnb24sb3V0KVxuICAgIHtcbiAgICAgICAgdmFyIFRXT19QSSAgID0gTWF0aC5QSSAqIDIsXG4gICAgICAgICAgICBQSSAgICAgICA9IE1hdGguUEk7XG5cbiAgICAgICAgdmFyIGNvcm5lcnMgID0gcG9seWdvbi5sZW5ndGggKiAwLjU7XG4gICAgICAgIHZhciBNQVhfU0VHUyA9IGNvcm5lcnMgKiA0O1xuXG4gICAgICAgIGlmKGNvcm5lcnMgPiBNQVhfU0VHUykgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgb3V0Lmxlbmd0aCA9IDA7XG5cbiAgICAgICAgdmFyIHNlZ1MgPSBuZXcgQXJyYXkoTUFYX1NFR1MgKiAyKSxcbiAgICAgICAgICAgIHNlZ0UgPSBuZXcgQXJyYXkoTUFYX1NFR1MgKiAyKSxcbiAgICAgICAgICAgIHNlZ0FuZ2xlICAgPSBuZXcgQXJyYXkoTUFYX1NFR1MpO1xuXG4gICAgICAgIHZhciBpbnRlcnNlY3RzID0gbmV3IEFycmF5KDIpLFxuICAgICAgICAgICAgaW50ZXJzZWN0WCxpbnRlcnNlY3RZO1xuXG4gICAgICAgIHZhciBzdGFydFggICAgPSBwb2x5Z29uWzBdLFxuICAgICAgICAgICAgc3RhcnRZICAgID0gcG9seWdvblsxXSxcbiAgICAgICAgICAgIGxhc3RBbmdsZSA9IFBJO1xuXG4gICAgICAgIHZhciBpbmRleGksaW5kZXhqLFxuICAgICAgICAgICAgaW5kZXhTZWcsaW5kZXhTZWdpLGluZGV4U2VnaixcbiAgICAgICAgICAgIHBpeCxwaXkscGp4LHBqeTtcblxuICAgICAgICB2YXIgYSwgYiwgYywgZCwgZSwgZixcbiAgICAgICAgICAgIGFuZ2xlRGlmLCBiZXN0QW5nbGVEaWY7XG5cbiAgICAgICAgdmFyIGksIGogPSBjb3JuZXJzIC0gMSwgc2VncyA9IDA7XG5cbiAgICAgICAgaSA9IC0xO1xuICAgICAgICB3aGlsZSgrK2kgPCBjb3JuZXJzKVxuICAgICAgICB7XG4gICAgICAgICAgICBpbmRleGkgPSBpICogMjtcbiAgICAgICAgICAgIGluZGV4aiA9IGogKiAyO1xuXG4gICAgICAgICAgICBwaXggPSBwb2x5Z29uW2luZGV4aSAgXTtcbiAgICAgICAgICAgIHBpeSA9IHBvbHlnb25baW5kZXhpKzFdO1xuICAgICAgICAgICAgcGp4ID0gcG9seWdvbltpbmRleGogIF07XG4gICAgICAgICAgICBwankgPSBwb2x5Z29uW2luZGV4aisxXTtcblxuICAgICAgICAgICAgaWYgKHBpeCAhPSBwanggfHwgcGl5ICE9IHBqeSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpbmRleFNlZyA9IHNlZ3MgKiAyO1xuXG4gICAgICAgICAgICAgICAgc2VnU1tpbmRleFNlZyAgXSA9IHBpeDtcbiAgICAgICAgICAgICAgICBzZWdTW2luZGV4U2VnKzFdID0gcGl5O1xuICAgICAgICAgICAgICAgIHNlZ0VbaW5kZXhTZWcgIF0gPSBwang7XG4gICAgICAgICAgICAgICAgc2VnRVtpbmRleFNlZysxXSA9IHBqeTtcblxuICAgICAgICAgICAgICAgIHNlZ3MrKztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaiA9IGk7XG5cbiAgICAgICAgICAgIGlmIChwaXkgPiBzdGFydFkgfHwgcGl5ID09IHN0YXJ0WSAmJiBwaXggPCBzdGFydFgpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgc3RhcnRYID0gcGl4O1xuICAgICAgICAgICAgICAgIHN0YXJ0WSA9IHBpeTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzZWdzID09IDApIHJldHVybiBmYWxzZTtcblxuICAgICAgICB2YXIgaXNTZWdtZW50SW50ZXJzZWN0aW9uZiA9IExpbmUyZFV0aWwuaXNTZWdtZW50SW50ZXJzZWN0aW9uZjtcblxuICAgICAgICB2YXIgc2VnU3hpLHNlZ1N5aSxcbiAgICAgICAgICAgIHNlZ1N4aixzZWdTeWo7XG5cbiAgICAgICAgdmFyIHNlZ0V4aSxzZWdFeWksXG4gICAgICAgICAgICBzZWdFeGosc2VnRXlqO1xuXG4gICAgICAgIGkgPSAtMTtcbiAgICAgICAgd2hpbGUoKytpIDwgc2VncyAtIDEpXG4gICAgICAgIHtcbiAgICAgICAgICAgIGluZGV4U2VnaSA9IGkgKiAyO1xuXG4gICAgICAgICAgICBzZWdTeGkgPSBzZWdTW2luZGV4U2VnaSAgXTtcbiAgICAgICAgICAgIHNlZ1N5aSA9IHNlZ1NbaW5kZXhTZWdpKzFdO1xuICAgICAgICAgICAgc2VnRXhpID0gc2VnRVtpbmRleFNlZ2kgIF07XG4gICAgICAgICAgICBzZWdFeWkgPSBzZWdFW2luZGV4U2VnaSsxXTtcblxuICAgICAgICAgICAgaiA9IGk7XG4gICAgICAgICAgICB3aGlsZSgrK2ogPCBzZWdzKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGluZGV4U2VnaiA9IGogKiAyO1xuXG4gICAgICAgICAgICAgICAgc2VnU3hqID0gc2VnU1tpbmRleFNlZ2ogIF07XG4gICAgICAgICAgICAgICAgc2VnU3lqID0gc2VnU1tpbmRleFNlZ2orMV07XG4gICAgICAgICAgICAgICAgc2VnRXhqID0gc2VnRVtpbmRleFNlZ2ogIF07XG4gICAgICAgICAgICAgICAgc2VnRXlqID0gc2VnRVtpbmRleFNlZ2orMV07XG5cbiAgICAgICAgICAgICAgICBpZiAoaXNTZWdtZW50SW50ZXJzZWN0aW9uZihcbiAgICAgICAgICAgICAgICAgICAgc2VnU3hpLHNlZ1N5aSxzZWdFeGksc2VnRXlpLFxuICAgICAgICAgICAgICAgICAgICBzZWdTeGosc2VnU3lqLHNlZ0V4aixzZWdFeWosaW50ZXJzZWN0cykpXG4gICAgICAgICAgICAgICAge1xuXG4gICAgICAgICAgICAgICAgICAgIGludGVyc2VjdFggPSBpbnRlcnNlY3RzWzBdO1xuICAgICAgICAgICAgICAgICAgICBpbnRlcnNlY3RZID0gaW50ZXJzZWN0c1sxXTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoKGludGVyc2VjdFggIT0gc2VnU3hpIHx8IGludGVyc2VjdFkgIT0gc2VnU3lpKSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgKGludGVyc2VjdFggIT0gc2VnRXhpIHx8IGludGVyc2VjdFkgIT0gc2VnRXlpKSlcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYoc2VncyA9PSBNQVhfU0VHUykgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmRleFNlZyA9IHNlZ3MgKiAyO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWdTW2luZGV4U2VnICBdID0gc2VnU3hpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VnU1tpbmRleFNlZysxXSA9IHNlZ1N5aTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlZ0VbaW5kZXhTZWcgIF0gPSBpbnRlcnNlY3RYO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VnRVtpbmRleFNlZysxXSA9IGludGVyc2VjdFk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHNlZ3MrKztcblxuICAgICAgICAgICAgICAgICAgICAgICAgc2VnU1tpbmRleFNlZ2kgIF0gPSBpbnRlcnNlY3RYO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VnU1tpbmRleFNlZ2krMV0gPSBpbnRlcnNlY3RZO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKChpbnRlcnNlY3RYICE9IHNlZ1N4aiB8fCBpbnRlcnNlY3RZICE9IHNlZ1N5aikgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIChpbnRlcnNlY3RYICE9IHNlZ0V4aiB8fCBpbnRlcnNlY3RZICE9IHNlZ0V5aikpXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKHNlZ3MgPT0gTUFYX1NFR1MpIHJldHVybiBmYWxzZTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXhTZWcgPSBzZWdzICogMjtcblxuICAgICAgICAgICAgICAgICAgICAgICAgc2VnU1tpbmRleFNlZyAgXSA9IHNlZ1N4ajtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlZ1NbaW5kZXhTZWcrMV0gPSBzZWdTeWo7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWdFW2luZGV4U2VnICBdID0gaW50ZXJzZWN0WDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlZ0VbaW5kZXhTZWcrMV0gPSBpbnRlcnNlY3RZO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWdzKys7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHNlZ1NbaW5kZXhTZWdqICBdID0gaW50ZXJzZWN0WDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlZ1NbaW5kZXhTZWdqKzFdID0gaW50ZXJzZWN0WTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG5cbiAgICAgICAgdmFyIHNlZ0RpZmZ4LFxuICAgICAgICAgICAgc2VnRGlmZnksXG4gICAgICAgICAgICBzZWdMZW47XG5cbiAgICAgICAgaSA9IC0xO1xuICAgICAgICB3aGlsZSgrK2kgPCBzZWdzKVxuICAgICAgICB7XG4gICAgICAgICAgICBpbmRleFNlZ2kgPSBpICogMjtcbiAgICAgICAgICAgIHNlZ0RpZmZ4ID0gc2VnRVtpbmRleFNlZ2kgIF0gLSBzZWdTW2luZGV4U2VnaSAgXTtcbiAgICAgICAgICAgIHNlZ0RpZmZ5ID0gc2VnRVtpbmRleFNlZ2krMV0gLSBzZWdTW2luZGV4U2VnaSsxXTtcblxuICAgICAgICAgICAgc2VnTGVuICAgPSBNYXRoLnNxcnQoc2VnRGlmZnggKiBzZWdEaWZmeCArIHNlZ0RpZmZ5ICogc2VnRGlmZnkpIHx8IDE7XG5cbiAgICAgICAgICAgIHNlZ0FuZ2xlW2ldID0gKHNlZ0RpZmZ5ID49IDAuMCkgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgTWF0aC5hY29zKHNlZ0RpZmZ4L3NlZ0xlbikgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAoTWF0aC5hY29zKC1zZWdEaWZmeC9zZWdMZW4pICsgUEkpO1xuXG4gICAgICAgIH1cblxuICAgICAgICBjID0gc3RhcnRYO1xuICAgICAgICBkID0gc3RhcnRZO1xuICAgICAgICBhID0gYyAtIDE7XG4gICAgICAgIGIgPSBkO1xuICAgICAgICBlID0gMDtcbiAgICAgICAgZiA9IDA7XG5cbiAgICAgICAgY29ybmVycyA9IDE7XG5cbiAgICAgICAgb3V0LnB1c2goYyxkKTtcblxuICAgICAgICB3aGlsZSAodHJ1ZSlcbiAgICAgICAge1xuICAgICAgICAgICAgYmVzdEFuZ2xlRGlmID0gVFdPX1BJO1xuXG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgc2VnczsgaSsrKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGluZGV4U2VnaSA9IGkgKiAyO1xuXG4gICAgICAgICAgICAgICAgc2VnU3hpID0gc2VnU1tpbmRleFNlZ2kgIF07XG4gICAgICAgICAgICAgICAgc2VnU3lpID0gc2VnU1tpbmRleFNlZ2krMV07XG4gICAgICAgICAgICAgICAgc2VnRXhpID0gc2VnRVtpbmRleFNlZ2kgIF07XG4gICAgICAgICAgICAgICAgc2VnRXlpID0gc2VnRVtpbmRleFNlZ2krMV07XG5cblxuICAgICAgICAgICAgICAgIGlmIChzZWdTeGkgPT0gYyAmJiBzZWdTeWkgPT0gZCAmJlxuICAgICAgICAgICAgICAgICAgICAoc2VnRXhpICE9YSB8fCBzZWdFeWkgIT0gYikpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBhbmdsZURpZiA9IGxhc3RBbmdsZSAtIHNlZ0FuZ2xlW2ldO1xuXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIChhbmdsZURpZiA+PSBUV09fUEkpIGFuZ2xlRGlmIC09IFRXT19QSTtcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgKGFuZ2xlRGlmIDwgMCAgICAgICkgYW5nbGVEaWYgKz0gVFdPX1BJO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChhbmdsZURpZiA8IGJlc3RBbmdsZURpZilcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgYmVzdEFuZ2xlRGlmID0gYW5nbGVEaWY7XG4gICAgICAgICAgICAgICAgICAgICAgICBlID0gc2VnRXhpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZiA9IHNlZ0V5aTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoc2VnRXhpID09IGMgJiYgc2VnRXlpID09IGQgJiZcbiAgICAgICAgICAgICAgICAgICAgKHNlZ1N4aSAhPWEgfHwgc2VnU3lpICE9IGIpKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgYW5nbGVEaWYgPSBsYXN0QW5nbGUgLSBzZWdBbmdsZVtpXSArIFBJO1xuXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIChhbmdsZURpZiA+PSBUV09fUEkpIGFuZ2xlRGlmIC09IFRXT19QSTtcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgKGFuZ2xlRGlmIDwgIDAgICAgICkgYW5nbGVEaWYgKz0gVFdPX1BJO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChhbmdsZURpZiA8IGJlc3RBbmdsZURpZilcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgYmVzdEFuZ2xlRGlmID0gYW5nbGVEaWY7XG4gICAgICAgICAgICAgICAgICAgICAgICBlID0gc2VnU3hpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZiA9IHNlZ1N5aTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGNvcm5lcnMgPiAxICYmXG4gICAgICAgICAgICAgICAgYyA9PSBvdXRbMF0gJiYgZCA9PSBvdXRbMV0gJiZcbiAgICAgICAgICAgICAgICBlID09IG91dFsyXSAmJiBmID09IG91dFszXSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjb3JuZXJzLS07XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChiZXN0QW5nbGVEaWYgPT0gVFdPX1BJIHx8XG4gICAgICAgICAgICAgICAgY29ybmVycyA9PSBNQVhfU0VHUylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvcm5lcnMrKztcbiAgICAgICAgICAgIG91dC5wdXNoKGUsZik7XG5cbiAgICAgICAgICAgIGxhc3RBbmdsZSAtPSBiZXN0QW5nbGVEaWYgKyBQSTtcblxuICAgICAgICAgICAgYSA9IGM7XG4gICAgICAgICAgICBiID0gZDtcbiAgICAgICAgICAgIGMgPSBlO1xuICAgICAgICAgICAgZCA9IGY7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG5cbiAgICAvL2h0dHA6Ly9hbGllbnJ5ZGVyZmxleC5jb20vcG9seWdvbl9pbnNldC9cbiAgICBtYWtlSW5zZXQgOiBmdW5jdGlvbihwb2x5Z29uLGRpc3RhbmNlKVxuICAgIHtcbiAgICAgICAgaWYocG9seWdvbi5sZW5ndGggPD0gMilyZXR1cm4gbnVsbDtcblxuICAgICAgICB2YXIgbnVtID0gcG9seWdvbi5sZW5ndGggKiAwLjUgLSAxO1xuXG4gICAgICAgIHZhciBzeCA9IHBvbHlnb25bMF0sXG4gICAgICAgICAgICBzeSA9IHBvbHlnb25bMV07XG5cbiAgICAgICAgdmFyIGEsIGIsXG4gICAgICAgICAgICBjID0gcG9seWdvbltwb2x5Z29uLmxlbmd0aCAtIDJdLFxuICAgICAgICAgICAgZCA9IHBvbHlnb25bcG9seWdvbi5sZW5ndGggLSAxXSxcbiAgICAgICAgICAgIGUgPSBzeCxcbiAgICAgICAgICAgIGYgPSBzeTtcblxuICAgICAgICB2YXIgaW5kZXgwLGluZGV4MTtcblxuICAgICAgICB2YXIgdGVtcCA9IG5ldyBBcnJheSgyKTtcblxuICAgICAgICB2YXIgaSA9IC0xO1xuICAgICAgICB3aGlsZSAoKytpIDwgbnVtKVxuICAgICAgICB7XG4gICAgICAgICAgICBhID0gYztcbiAgICAgICAgICAgIGIgPSBkO1xuICAgICAgICAgICAgYyA9IGU7XG4gICAgICAgICAgICBkID0gZjtcblxuICAgICAgICAgICAgaW5kZXgwID0gaSAqIDI7XG4gICAgICAgICAgICBpbmRleDEgPSAoaSsxKSoyO1xuXG4gICAgICAgICAgICBlID0gcG9seWdvbltpbmRleDEgICAgXTtcbiAgICAgICAgICAgIGYgPSBwb2x5Z29uW2luZGV4MSArIDFdO1xuXG4gICAgICAgICAgICB0ZW1wWzBdID0gcG9seWdvbltpbmRleDBdO1xuICAgICAgICAgICAgdGVtcFsxXSA9IHBvbHlnb25baW5kZXgwICsgMV07XG5cbiAgICAgICAgICAgIHRoaXMubWFrZUluc2V0Q29ybmVyKGEsIGIsIGMsIGQsIGUsIGYsIGRpc3RhbmNlLCB0ZW1wKTtcbiAgICAgICAgICAgIHBvbHlnb25baW5kZXgwICAgIF0gPSB0ZW1wWzBdO1xuICAgICAgICAgICAgcG9seWdvbltpbmRleDAgKyAxXSA9IHRlbXBbMV07XG4gICAgICAgIH1cblxuICAgICAgICBpbmRleDAgPSBpICogMjtcblxuICAgICAgICB0ZW1wWzBdID0gcG9seWdvbltpbmRleDAgICAgXTtcbiAgICAgICAgdGVtcFsxXSA9IHBvbHlnb25baW5kZXgwICsgMV07XG5cbiAgICAgICAgdGhpcy5tYWtlSW5zZXRDb3JuZXIoYywgZCwgZSwgZiwgc3gsIHN5LCBkaXN0YW5jZSwgdGVtcCk7XG4gICAgICAgIHBvbHlnb25baW5kZXgwICAgIF0gPSB0ZW1wWzBdO1xuICAgICAgICBwb2x5Z29uW2luZGV4MCArIDFdID0gdGVtcFsxXTtcblxuICAgICAgICByZXR1cm4gcG9seWdvbjtcbiAgICB9LFxuXG4gICAgbWFrZUluc2V0Q29ybmVyIDogZnVuY3Rpb24oYSxiLGMsZCxlLGYsZGlzdGFuY2Usb3V0KVxuICAgIHtcbiAgICAgICAgdmFyICBjMSA9IGMsXG4gICAgICAgICAgICBkMSA9IGQsXG4gICAgICAgICAgICBjMiA9IGMsXG4gICAgICAgICAgICBkMiA9IGQsXG4gICAgICAgICAgICBkeDEsIGR5MSwgZGlzdDEsXG4gICAgICAgICAgICBkeDIsIGR5MiwgZGlzdDIsXG4gICAgICAgICAgICBpbnNldFgsIGluc2V0WSA7XG5cbiAgICAgICAgdmFyIEVQU0lMT04gPSAwLjAwMDE7XG5cbiAgICAgICAgZHgxICAgPSBjIC0gYTtcbiAgICAgICAgZHkxICAgPSBkIC0gYjtcbiAgICAgICAgZGlzdDEgPSBNYXRoLnNxcnQoZHgxKmR4MStkeTEqZHkxKTtcblxuICAgICAgICBkeDIgICA9IGUgLSBjO1xuICAgICAgICBkeTIgICA9IGYgLSBkO1xuICAgICAgICBkaXN0MiA9IE1hdGguc3FydChkeDIqZHgyK2R5MipkeTIpO1xuXG4gICAgICAgIGlmKGRpc3QxIDwgRVBTSUxPTiB8fCBkaXN0MiAgPCBFUFNJTE9OKXJldHVybjtcblxuICAgICAgICBkaXN0MSA9IDEuMCAvIGRpc3QxO1xuICAgICAgICBkaXN0MiA9IDEuMCAvIGRpc3QyO1xuXG4gICAgICAgIGluc2V0WCA9IGR5MSAqIGRpc3QxICogZGlzdGFuY2U7XG4gICAgICAgIGEgICAgICs9IGluc2V0WDtcbiAgICAgICAgYzEgICAgKz0gaW5zZXRYO1xuXG4gICAgICAgIGluc2V0WSA9LWR4MSAqIGRpc3QxICogZGlzdGFuY2U7XG4gICAgICAgIGIgICAgICs9IGluc2V0WTtcbiAgICAgICAgZDEgICAgKz0gaW5zZXRZO1xuXG4gICAgICAgIGluc2V0WCA9IGR5MiAqIGRpc3QyICogZGlzdGFuY2U7XG4gICAgICAgIGUgICAgICs9IGluc2V0WDtcbiAgICAgICAgYzIgICAgKz0gaW5zZXRYO1xuXG4gICAgICAgIGluc2V0WSA9LWR4MiAqIGRpc3QyICogZGlzdGFuY2U7XG4gICAgICAgIGYgICAgICs9IGluc2V0WTtcbiAgICAgICAgZDIgICAgKz0gaW5zZXRZO1xuXG4gICAgICAgIGlmIChjMSA9PSBjMiAmJiBkMT09ZDIpXG4gICAgICAgIHtcbiAgICAgICAgICAgIG91dFswXSA9IGMxO1xuICAgICAgICAgICAgb3V0WzFdID0gZDE7XG4gICAgICAgICAgICByZXR1cm47IH1cblxuICAgICAgICB2YXIgdGVtcCA9IG5ldyBBcnJheSgyKTtcblxuICAgICAgICBpZiAoTGluZTJkVXRpbC5pc0ludGVyc2VjdGlvbmYoYSxiLGMxLGQxLGMyLGQyLGUsZix0ZW1wKSlcbiAgICAgICAge1xuICAgICAgICAgICAgb3V0WzBdID0gdGVtcFswXTtcbiAgICAgICAgICAgIG91dFsxXSA9IHRlbXBbMV07XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4gICAgaXNQb2ludEluUG9seWdvbiA6IGZ1bmN0aW9uKHgseSxwb2ludHMpXG4gICAge1xuICAgICAgICB2YXIgd24gPSAwO1xuICAgICAgICB2YXIgbGVuID0gcG9pbnRzLmxlbmd0aCAvIDI7XG5cbiAgICAgICAgdmFyIGluZGV4MCxcbiAgICAgICAgICAgIGluZGV4MTtcblxuXG4gICAgICAgIHZhciBpID0gLTE7XG4gICAgICAgIHdoaWxlKCsraSA8IGxlbiAtIDEpXG4gICAgICAgIHtcbiAgICAgICAgICAgIGluZGV4MCA9IGkgKiAyO1xuICAgICAgICAgICAgaW5kZXgxID0gKGkgKyAxKSAqIDI7XG5cbiAgICAgICAgICAgIGlmKHBvaW50c1tpbmRleDArMV0gPD0geSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpZihwb2ludHNbaW5kZXgxKzFdID4geSlcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGlmKExpbmUyZFV0aWwuaXNQb2ludExlZnQocG9pbnRzW2luZGV4MF0scG9pbnRzW2luZGV4MCArIDFdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvaW50c1tpbmRleDFdLHBvaW50c1tpbmRleDEgKyAxXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4LHkpPjApKyt3bjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaWYocG9pbnRzW2luZGV4MSsxXSA8PSB5KVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgaWYoTGluZTJkVXRpbC5pc1BvaW50TGVmdChwb2ludHNbaW5kZXgwXSxwb2ludHNbaW5kZXgwICsgMV0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9pbnRzW2luZGV4MV0scG9pbnRzW2luZGV4MSArIDFdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHgseSk8MCktLXduO1xuXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHduO1xuXG4gICAgfSxcblxuICAgIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuXG4gICAgbWFrZVZlcnRpY2VzUmV2ZXJzZWQgOiBmdW5jdGlvbihwb2x5Z29uKXsgcmV0dXJuIHBvbHlnb24ucmV2ZXJzZSgpO30sXG5cblxuICAgIG1ha2VQb2x5Z29uM2RGbG9hdDMyIDogZnVuY3Rpb24ocG9seWdvbixzY2FsZSlcbiAgICB7XG4gICAgICAgIHNjYWxlID0gc2NhbGUgfHwgMS4wO1xuXG4gICAgICAgIHZhciBwb2x5TGVuID0gcG9seWdvbi5sZW5ndGggKiAwLjUsXG4gICAgICAgICAgICBvdXQgICAgID0gbmV3IEZsb2F0MzJBcnJheShwb2x5TGVuICogMyk7XG4gICAgICAgIHZhciBpbmRleDAsaW5kZXgxO1xuXG4gICAgICAgIHZhciBpID0gLTE7XG4gICAgICAgIHdoaWxlKCsraSA8IHBvbHlMZW4pXG4gICAgICAgIHtcbiAgICAgICAgICAgIGluZGV4MCA9IGkgKiAzO1xuICAgICAgICAgICAgaW5kZXgxID0gaSAqIDI7XG5cbiAgICAgICAgICAgIG91dFtpbmRleDAgIF0gPSBwb2x5Z29uW2luZGV4MSAgXSAqIHNjYWxlO1xuICAgICAgICAgICAgb3V0W2luZGV4MCsxXSA9IDAuMDtcbiAgICAgICAgICAgIG91dFtpbmRleDArMl0gPSBwb2x5Z29uW2luZGV4MSsxXSAqIHNjYWxlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG91dDtcbiAgICB9XG5cbiAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgICAvKlxuICAgIC8vU3V0aGVybGFuZC1Ib2RnbWFuXG4gICAgbWFrZUNsaXBwaW5nU0ggOiBmdW5jdGlvbihwb2x5Z29uLGNsaXBwaW5nUG9seWdvbilcbiAgICB7XG4gICAgICAgIHZhciBsZW4wID0gcG9seWdvbi5sZW5ndGggKiAwLjUsXG4gICAgICAgICAgICBsZW4xID0gY2xpcHBpbmdQb2x5Z29uLmxlbmd0aCA7XG5cblxuICAgICAgICB2YXIgTGluZTJkVXRpbCA9IEZvYW0uTGluZTJkVXRpbDtcblxuICAgICAgICB2YXIgb3V0ID0gW107XG5cbiAgICAgICAgdmFyIGNsaXBFZGdlU3gsY2xpcEVkZ2VTeSxcbiAgICAgICAgICAgIGNsaXBFZGdlRXgsY2xpcEVkZ2VFeTtcblxuICAgICAgICB2YXIgcG9seUVkZ2VTeCwgcG9seUVkZ2VTeSxcbiAgICAgICAgICAgIHBvbHlFZGdlRXgsIHBvbHlFZGdlRXk7XG5cbiAgICAgICAgdmFyIHBvbHlWZXJ0SXNPbkxlZnQ7XG5cbiAgICAgICAgY29uc29sZS5sb2coY2xpcHBpbmdQb2x5Z29uKTtcblxuICAgICAgICB2YXIgaSwgajtcblxuICAgICAgICB2YXIgaTIsIGoyLCBpNDtcblxuICAgICAgICBpID0gMDtcbiAgICAgICAgd2hpbGUoaSA8IGxlbjEpXG4gICAgICAgIHtcbiAgICAgICAgICAgIGNsaXBFZGdlU3ggPSBjbGlwcGluZ1BvbHlnb25baSAgXTtcbiAgICAgICAgICAgIGNsaXBFZGdlU3kgPSBjbGlwcGluZ1BvbHlnb25baSsxXTtcblxuICAgICAgICAgICAgaTIgPSAoaSArIDIpICUgbGVuMTtcbiAgICAgICAgICAgIGNsaXBFZGdlRXggPSBjbGlwcGluZ1BvbHlnb25baTJdO1xuICAgICAgICAgICAgY2xpcEVkZ2VFeSA9IGNsaXBwaW5nUG9seWdvbltpMisxXTtcblxuXG4gICAgICAgICAgICBpKz0yO1xuICAgICAgICB9XG4gICAgICAgLy8gd2hpbGUoKytpIDwpXG5cblxuXG4gICAgICAgIHJldHVybiBvdXQ7XG5cbiAgICB9LFxuXG4gICAgbWFrZUNsaXBwaW5nViA6IGZ1bmN0aW9uKHBvbHlnb24sY2xpcHBpbmdQb2x5Z29uKVxuICAgIHtcblxuICAgIH0sXG5cbiAgICBtYWtlU2NhbkZpbGwgOiBmdW5jdGlvbihwb2x5Z29uKVxuICAgIHtcblxuICAgIH1cblxuICAgICovXG5cblxuXG5cbn07IiwidmFyIGtNYXRoID0gcmVxdWlyZSgnLi4vbWF0aC9mTWF0aCcpLFxuICAgIFZlYzMgID0gcmVxdWlyZSgnLi4vbWF0aC9mVmVjMycpLFxuICAgIE1hdDQ0ID0gcmVxdWlyZSgnLi4vbWF0aC9mTWF0NDQnKTtcblxuLy9UT0RPOiBBZGQgY2xvc2UsIHNtb290aCBpbiBvdXQgaW50cnBsLCBwcmUgcG9zdCBwb2ludHNcbmZ1bmN0aW9uIFNwbGluZSgpXG57XG4gICAgdGhpcy5wb2ludHMgICAgID0gbnVsbDtcbiAgICB0aGlzLnZlcnRpY2VzICAgPSBudWxsO1xuXG4gICAgdGhpcy5fZGV0YWlsICAgID0gMjA7XG4gICAgdGhpcy5fdGVuc2lvbiAgID0gMDtcbiAgICB0aGlzLl9iaWFzICAgICAgPSAwO1xuICAgIHRoaXMuX251bVBvaW50cyA9IG51bGw7XG4gICAgdGhpcy5fbnVtVmVydHMgID0gbnVsbDtcblxuICAgIHRoaXMuX3RlbXBWZWMwICA9IFZlYzMubWFrZSgpO1xuICAgIHRoaXMuX3RlbXBWZWMxICA9IFZlYzMubWFrZSgpO1xuICAgIHRoaXMuX3RlbXBNYXQwICA9IE1hdDQ0Lm1ha2UoKTtcbiAgICB0aGlzLl90ZW1wTWF0MSAgPSBNYXQ0NC5tYWtlKCk7XG4gICAgdGhpcy5fdGVtcE1hdDIgID0gTWF0NDQubWFrZSgpO1xuXG4gICAgdGhpcy5fYXhpc1kgICAgID0gVmVjMy5BWElTX1koKTtcbn07XG5cblNwbGluZS5wcm90b3R5cGUuc2V0UG9pbnQzZiA9IGZ1bmN0aW9uKGluZGV4LHgseSx6KVxue1xuICAgIHZhciBwb2ludHMgPSB0aGlzLnBvaW50cztcblxuICAgIGluZGV4Kj0zO1xuICAgIHBvaW50c1tpbmRleCAgXSA9IHg7XG4gICAgcG9pbnRzW2luZGV4KzFdID0geTtcbiAgICBwb2ludHNbaW5kZXgrMl0gPSB6O1xufTtcblxuU3BsaW5lLnByb3RvdHlwZS5zZXRQb2ludHMgPSAgZnVuY3Rpb24oYXJyKVxue1xuICAgIHZhciBudW0gICAgICAgICA9IHRoaXMuX251bVBvaW50cyA9IGFyci5sZW5ndGggLyAzLFxuICAgICAgICBudW1WZXJ0cyAgICA9IHRoaXMuX251bVZlcnRzICA9IChudW0gLSAxKSAqICh0aGlzLl9kZXRhaWwgLSAxKSArIDE7XG5cbiAgICB0aGlzLnBvaW50cyAgICAgPSBuZXcgRmxvYXQzMkFycmF5KGFycik7XG4gICAgdGhpcy52ZXJ0aWNlcyAgID0gbmV3IEZsb2F0MzJBcnJheShudW1WZXJ0cyAqIDMpO1xufTtcblxuU3BsaW5lLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbigpXG57XG4gICAgdmFyIGRldGFpbCAgICA9IHRoaXMuX2RldGFpbCxcbiAgICAgICAgZGV0YWlsXzEgID0gZGV0YWlsIC0gMSxcbiAgICAgICAgcG9pbnRzICAgID0gdGhpcy5wb2ludHMsXG4gICAgICAgIG51bVBvaW50cyA9IHRoaXMuX251bVBvaW50cyxcbiAgICAgICAgdmVydGljZXMgID0gdGhpcy52ZXJ0aWNlcztcblxuICAgIHZhciB0ZW5zaW9uICAgICAgID0gdGhpcy5fdGVuc2lvbixcbiAgICAgICAgYmlhcyAgICAgICAgICA9IHRoaXMuX2JpYXMsXG4gICAgICAgIGhlcm1pdGVJbnRycGwgPSBrTWF0aC5oZXJtaXRlSW50cnBsO1xuXG4gICAgdmFyIGksIGosIHQ7XG4gICAgdmFyIGxlbiA9IG51bVBvaW50cyAtIDE7XG5cbiAgICB2YXIgaW5kZXgsaW5kZXhfMSxpbmRleDEsaW5kZXgyLFxuICAgICAgICB2ZXJ0SW5kZXg7XG5cbiAgICB2YXIgeCwgeSwgejtcblxuICAgIGkgPSAtMTtcbiAgICB3aGlsZSgrK2kgPCBsZW4pXG4gICAge1xuICAgICAgICBpbmRleCAgICA9IGk7XG5cbiAgICAgICAgaW5kZXgxICAgPSBNYXRoLm1pbigoaW5kZXggKyAxKSxsZW4pICogMztcbiAgICAgICAgaW5kZXgyICAgPSBNYXRoLm1pbigoaW5kZXggKyAyKSxsZW4pICogMztcbiAgICAgICAgaW5kZXhfMSAgPSBNYXRoLm1heCgwLChpbmRleCAtIDEpKSAgICogMztcbiAgICAgICAgaW5kZXggICAqPSAzO1xuXG4gICAgICAgIGogPSAtMTtcbiAgICAgICAgd2hpbGUoKytqIDwgZGV0YWlsXzEpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHQgPSBqIC8gZGV0YWlsXzE7XG5cbiAgICAgICAgICAgIHggPSBoZXJtaXRlSW50cnBsKHBvaW50c1tpbmRleF8xXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvaW50c1tpbmRleCAgXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvaW50c1tpbmRleDEgXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvaW50c1tpbmRleDIgXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHQsdGVuc2lvbixiaWFzKTtcblxuICAgICAgICAgICAgeSA9IGhlcm1pdGVJbnRycGwocG9pbnRzW2luZGV4XzEgKyAxXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvaW50c1tpbmRleCAgICsgMV0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb2ludHNbaW5kZXgxICArIDFdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9pbnRzW2luZGV4MiAgKyAxXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHQsdGVuc2lvbixiaWFzKTtcblxuICAgICAgICAgICAgeiA9IGhlcm1pdGVJbnRycGwocG9pbnRzW2luZGV4XzEgKyAyXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvaW50c1tpbmRleCAgICsgMl0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb2ludHNbaW5kZXgxICArIDJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9pbnRzW2luZGV4MiAgKyAyXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHQsdGVuc2lvbixiaWFzKTtcblxuICAgICAgICAgICAgdmVydEluZGV4ID0gKGkgKiBkZXRhaWxfMSArIGopICogMztcblxuICAgICAgICAgICAgdmVydGljZXNbdmVydEluZGV4ICBdID0geDtcbiAgICAgICAgICAgIHZlcnRpY2VzW3ZlcnRJbmRleCsxXSA9IHk7XG4gICAgICAgICAgICB2ZXJ0aWNlc1t2ZXJ0SW5kZXgrMl0gPSB6O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdmFyIHZlcnRMZW4gICA9IHZlcnRpY2VzLmxlbmd0aCxcbiAgICAgICAgcG9pbnRzTGVuID0gcG9pbnRzLmxlbmd0aDtcblxuICAgIHZlcnRpY2VzW3ZlcnRMZW4tM10gPSBwb2ludHNbcG9pbnRzTGVuLTNdO1xuICAgIHZlcnRpY2VzW3ZlcnRMZW4tMl0gPSBwb2ludHNbcG9pbnRzTGVuLTJdO1xuICAgIHZlcnRpY2VzW3ZlcnRMZW4tMV0gPSBwb2ludHNbcG9pbnRzTGVuLTFdO1xuXG59O1xuXG5TcGxpbmUucHJvdG90eXBlLnNldERldGFpbCAgPSBmdW5jdGlvbihkZXRhaWwpIHt0aGlzLl9kZXRhaWwgID0gZGV0YWlsO307XG5TcGxpbmUucHJvdG90eXBlLnNldFRlbnNpb24gPSBmdW5jdGlvbih0ZW5zaW9uKXt0aGlzLl90ZW5zaW9uID0gdGVuc2lvbjt9O1xuU3BsaW5lLnByb3RvdHlwZS5zZXRCaWFzICAgID0gZnVuY3Rpb24oYmlhcykgICB7dGhpcy5fYmlhcyAgICA9IGJpYXM7fTtcblxuU3BsaW5lLnByb3RvdHlwZS5nZXROdW1Qb2ludHMgICA9IGZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX251bVBvaW50czt9O1xuU3BsaW5lLnByb3RvdHlwZS5nZXROdW1WZXJ0aWNlcyA9IGZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX251bVZlcnRzO307XG5cblNwbGluZS5wcm90b3R5cGUuZ2V0VmVjM09uUG9pbnRzID0gZnVuY3Rpb24odmFsLG91dClcbntcbiAgICBvdXQgPSBvdXQgfHwgdGhpcy5fdGVtcFZlYzA7XG5cbiAgICB2YXIgcG9pbnRzICAgID0gdGhpcy5wb2ludHMsXG4gICAgICAgIG51bVBvaW50cyA9IHRoaXMuX251bVBvaW50cyxcbiAgICAgICAgbGVuICAgICAgID0gbnVtUG9pbnRzIC0gMTtcblxuICAgIHZhciBpbmRleCAgPSBNYXRoLmZsb29yKG51bVBvaW50cyAqIHZhbCksXG4gICAgICAgIGluZGV4MSA9IE1hdGgubWluKGluZGV4ICsgMSwgbGVuKTtcblxuICAgICAgICBpbmRleCAqPSAzO1xuICAgICAgICBpbmRleDEqPSAzO1xuXG4gICAgdmFyIGxvY2FsSW50cnBsICAgID0gKHZhbCAlICgxIC8gbnVtUG9pbnRzKSkgKiBudW1Qb2ludHMsXG4gICAgICAgIGxvY2FsSW50cnBsSW52ID0gMS4wIC0gbG9jYWxJbnRycGw7XG5cbiAgICBvdXRbMF0gPSBwb2ludHNbaW5kZXggIF0gKiBsb2NhbEludHJwbEludiArIHBvaW50c1tpbmRleDEgIF0gKiBsb2NhbEludHJwbDtcbiAgICBvdXRbMV0gPSBwb2ludHNbaW5kZXgrMV0gKiBsb2NhbEludHJwbEludiArIHBvaW50c1tpbmRleDErMV0gKiBsb2NhbEludHJwbDtcbiAgICBvdXRbMl0gPSBwb2ludHNbaW5kZXgrMl0gKiBsb2NhbEludHJwbEludiArIHBvaW50c1tpbmRleDErMl0gKiBsb2NhbEludHJwbDtcblxuICAgIHJldHVybiBvdXQ7XG5cbn07XG5cblNwbGluZS5wcm90b3R5cGUuZ2V0VmVjM09uU3BsaW5lID0gZnVuY3Rpb24odmFsLG91dClcbntcbiAgICBvdXQgPSBvdXQgfHwgdGhpcy5fdGVtcFZlYzA7XG5cbiAgICB2YXIgdmVydGljZXMgPSB0aGlzLnZlcnRpY2VzLFxuICAgICAgICBudW1WZXJ0cyA9IHRoaXMuX251bVZlcnRzLFxuICAgICAgICBsZW4gICAgICA9IG51bVZlcnRzIC0gMTtcblxuICAgIHZhciBpbmRleCAgPSBNYXRoLm1pbihNYXRoLmZsb29yKG51bVZlcnRzICogdmFsKSxsZW4pLFxuICAgICAgICBpbmRleDEgPSBNYXRoLm1pbihpbmRleCArIDEsbGVuKTtcblxuICAgIHZhciBsb2NhbEludHJwbCAgICA9ICh2YWwgJSAoMS4wIC8gbnVtVmVydHMpKSAqIG51bVZlcnRzLFxuICAgICAgICBsb2NhbEludHJwbEludiA9IDEuMCAtIGxvY2FsSW50cnBsO1xuXG4gICAgaW5kZXggICo9IDM7XG4gICAgaW5kZXgxICo9IDM7XG5cbiAgICBvdXRbMF0gPSB2ZXJ0aWNlc1tpbmRleCAgXSAqIGxvY2FsSW50cnBsSW52ICsgdmVydGljZXNbaW5kZXgxICBdICogbG9jYWxJbnRycGw7XG4gICAgb3V0WzFdID0gdmVydGljZXNbaW5kZXgrMV0gKiBsb2NhbEludHJwbEludiArIHZlcnRpY2VzW2luZGV4MSsxXSAqIGxvY2FsSW50cnBsO1xuICAgIG91dFsyXSA9IHZlcnRpY2VzW2luZGV4KzJdICogbG9jYWxJbnRycGxJbnYgKyB2ZXJ0aWNlc1tpbmRleDErMl0gKiBsb2NhbEludHJwbDtcblxuICAgIHJldHVybiBvdXQ7XG59O1xuXG5cblxuLy9obVxuU3BsaW5lLnByb3RvdHlwZS5nZXRQb2ludHNMaW5lTGVuZ3RoU3EgPSBmdW5jdGlvbigpXG57XG4gICAgdmFyIHBvaW50cyAgICA9IHRoaXMucG9pbnRzO1xuXG4gICAgdmFyIGR4ID0gMCxcbiAgICAgICAgZHkgPSAwLFxuICAgICAgICBkeiA9IDA7XG5cbiAgICB2YXIgaSA9IHBvaW50cy5sZW5ndGg7XG4gICAgd2hpbGUoaSA+IDYpXG4gICAge1xuICAgICAgICBkeCArPSBwb2ludHNbaS0zXSAtIHBvaW50c1tpLTZdO1xuICAgICAgICBkeSArPSBwb2ludHNbaS0yXSAtIHBvaW50c1tpLTVdO1xuICAgICAgICBkeiArPSBwb2ludHNbaS0xXSAtIHBvaW50c1tpLTRdO1xuXG4gICAgICAgIGktPTM7XG4gICAgfVxuXG4gICAgcmV0dXJuIGR4KmR4K2R5KmR5K2R6KmR6O1xuXG59O1xuXG5TcGxpbmUucHJvdG90eXBlLmdldFNwbGluZUxpbmVMZW5ndGhTcSA9IGZ1bmN0aW9uKClcbntcbiAgICB2YXIgdmVydGljZXMgPSB0aGlzLnZlcnRpY2VzO1xuXG4gICAgdmFyIGR4ID0gMCxcbiAgICAgICAgZHkgPSAwLFxuICAgICAgICBkeiA9IDA7XG5cbiAgICB2YXIgaSA9IHZlcnRpY2VzLmxlbmd0aDtcbiAgICB3aGlsZShpID4gNilcbiAgICB7XG4gICAgICAgIGR4ICs9IHZlcnRpY2VzW2ktM10gLSB2ZXJ0aWNlc1tpLTZdO1xuICAgICAgICBkeSArPSB2ZXJ0aWNlc1tpLTJdIC0gdmVydGljZXNbaS01XTtcbiAgICAgICAgZHogKz0gdmVydGljZXNbaS0xXSAtIHZlcnRpY2VzW2ktNF07XG5cbiAgICAgICAgaS09MztcbiAgICB9XG5cbiAgICByZXR1cm4gZHgqZHgrZHkqZHkrZHoqZHo7XG59O1xuXG5TcGxpbmUucHJvdG90eXBlLmdldFBvaW50c0xpbmVMZW5ndGggPSBmdW5jdGlvbigpe3JldHVybiBNYXRoLnNxcnQodGhpcy5nZXRQb2ludHNMaW5lTGVuZ3RoU3EoKSk7fTtcblNwbGluZS5wcm90b3R5cGUuZ2V0U3BsaW5lUG9pbnRzTGVuZ3RoID0gZnVuY3Rpb24oKXtyZXR1cm4gTWF0aC5zcXJ0KHRoaXMuZ2V0U3BsaW5lTGluZUxlbmd0aFNxKCkpfTtcblxubW9kdWxlLmV4cG9ydHMgPSBTcGxpbmU7XG5cblxuIiwidmFyIFZlYzMgID0gcmVxdWlyZSgnLi4vbWF0aC9mVmVjMycpLFxuICAgIE1hdDQ0ID0gcmVxdWlyZSgnLi4vbWF0aC9mTWF0NDQnKSxcbiAgICBNYXRHTCA9IHJlcXVpcmUoJy4vZ2wvZk1hdEdMJyk7XG5cbmZ1bmN0aW9uIENhbWVyYUJhc2ljKClcbntcbiAgICB0aGlzLnBvc2l0aW9uID0gVmVjMy5tYWtlKCk7XG4gICAgdGhpcy5fdGFyZ2V0ICA9IFZlYzMubWFrZSgpO1xuICAgIHRoaXMuX3VwICAgICAgPSBWZWMzLkFYSVNfWSgpO1xuXG4gICAgdGhpcy5fZm92ICA9IDA7XG4gICAgdGhpcy5fbmVhciA9IDA7XG4gICAgdGhpcy5fZmFyICA9IDA7XG5cbiAgICB0aGlzLl9hc3BlY3RSYXRpb0xhc3QgPSAwO1xuXG4gICAgdGhpcy5fbW9kZWxWaWV3TWF0cml4VXBkYXRlZCAgPSBmYWxzZTtcbiAgICB0aGlzLl9wcm9qZWN0aW9uTWF0cml4VXBkYXRlZCA9IGZhbHNlO1xuXG4gICAgdGhpcy5wcm9qZWN0aW9uTWF0cml4ID0gTWF0NDQubWFrZSgpO1xuICAgIHRoaXMubW9kZWxWaWV3TWF0cml4ICA9IE1hdDQ0Lm1ha2UoKTtcbn1cblxuQ2FtZXJhQmFzaWMucHJvdG90eXBlLnNldFBlcnNwZWN0aXZlID0gZnVuY3Rpb24oZm92LHdpbmRvd0FzcGVjdFJhdGlvLG5lYXIsZmFyKVxue1xuICAgIHRoaXMuX2ZvdiAgPSBmb3Y7XG4gICAgdGhpcy5fbmVhciA9IG5lYXI7XG4gICAgdGhpcy5fZmFyICA9IGZhcjtcblxuICAgIHRoaXMuX2FzcGVjdFJhdGlvTGFzdCA9IHdpbmRvd0FzcGVjdFJhdGlvO1xuXG4gICAgdGhpcy51cGRhdGVQcm9qZWN0aW9uTWF0cml4KCk7XG59O1xuXG5cblxuQ2FtZXJhQmFzaWMucHJvdG90eXBlLnNldFRhcmdldCAgICAgICAgID0gZnVuY3Rpb24odikgICAge1ZlYzMuc2V0KHRoaXMuX3RhcmdldCx2KTt0aGlzLl9tb2RlbFZpZXdNYXRyaXhVcGRhdGVkID0gZmFsc2U7fTtcbkNhbWVyYUJhc2ljLnByb3RvdHlwZS5zZXRUYXJnZXQzZiAgICAgICA9IGZ1bmN0aW9uKHgseSx6KXtWZWMzLnNldDNmKHRoaXMuX3RhcmdldCx4LHkseik7dGhpcy5fbW9kZWxWaWV3TWF0cml4VXBkYXRlZCA9IGZhbHNlO307XG5DYW1lcmFCYXNpYy5wcm90b3R5cGUuc2V0UG9zaXRpb24gICAgICAgPSBmdW5jdGlvbih2KSAgICB7VmVjMy5zZXQodGhpcy5wb3NpdGlvbix2KTt0aGlzLl9tb2RlbFZpZXdNYXRyaXhVcGRhdGVkID0gZmFsc2U7fTtcbkNhbWVyYUJhc2ljLnByb3RvdHlwZS5zZXRQb3NpdGlvbjNmICAgICA9IGZ1bmN0aW9uKHgseSx6KXtWZWMzLnNldDNmKHRoaXMucG9zaXRpb24seCx5LHopO3RoaXMuX21vZGVsVmlld01hdHJpeFVwZGF0ZWQgPSBmYWxzZTt9O1xuQ2FtZXJhQmFzaWMucHJvdG90eXBlLnNldFVwICAgICAgICAgICAgID0gZnVuY3Rpb24odikgICAge1ZlYzMuc2V0KHRoaXMuX3VwLHYpO3RoaXMuX21vZGVsVmlld01hdHJpeFVwZGF0ZWQgPSBmYWxzZTt9O1xuQ2FtZXJhQmFzaWMucHJvdG90eXBlLnNldFVwM2YgICAgICAgICAgID0gZnVuY3Rpb24oeCx5LHopeyBWZWMzLnNldDNmKHRoaXMuX3VwLHgseSx6KTt0aGlzLl9tb2RlbFZpZXdNYXRyaXhVcGRhdGVkID0gZmFsc2U7fTtcblxuQ2FtZXJhQmFzaWMucHJvdG90eXBlLnNldE5lYXIgICAgICAgICAgID0gZnVuY3Rpb24obmVhcikgICAgICAge3RoaXMuX25lYXIgPSBuZWFyO3RoaXMuX3Byb2plY3Rpb25NYXRyaXhVcGRhdGVkID0gZmFsc2U7fTtcbkNhbWVyYUJhc2ljLnByb3RvdHlwZS5zZXRGYXIgICAgICAgICAgICA9IGZ1bmN0aW9uKGZhcikgICAgICAgIHt0aGlzLl9mYXIgID0gZmFyO3RoaXMuX3Byb2plY3Rpb25NYXRyaXhVcGRhdGVkID0gZmFsc2U7fTtcbkNhbWVyYUJhc2ljLnByb3RvdHlwZS5zZXRGb3YgICAgICAgICAgICA9IGZ1bmN0aW9uKGZvdikgICAgICAgIHt0aGlzLl9mb3YgID0gZm92O3RoaXMuX3Byb2plY3Rpb25NYXRyaXhVcGRhdGVkID0gZmFsc2U7fTtcbkNhbWVyYUJhc2ljLnByb3RvdHlwZS5zZXRBc3BlY3RSYXRpbyAgICA9IGZ1bmN0aW9uKGFzcGVjdFJhdGlvKXt0aGlzLl9hc3BlY3RSYXRpb0xhc3QgPSBhc3BlY3RSYXRpbzt0aGlzLl9wcm9qZWN0aW9uTWF0cml4VXBkYXRlZCA9IGZhbHNlO307XG5cbkNhbWVyYUJhc2ljLnByb3RvdHlwZS51cGRhdGVNb2RlbFZpZXdNYXRyaXggICA9IGZ1bmN0aW9uKCl7aWYodGhpcy5fbW9kZWxWaWV3TWF0cml4VXBkYXRlZClyZXR1cm47TWF0R0wubG9va0F0KHRoaXMubW9kZWxWaWV3TWF0cml4LHRoaXMucG9zaXRpb24sdGhpcy5fdGFyZ2V0LHRoaXMuX3VwKTsgdGhpcy5fbW9kZWxWaWV3TWF0cml4VXBkYXRlZCA9IHRydWU7fTtcbkNhbWVyYUJhc2ljLnByb3RvdHlwZS51cGRhdGVQcm9qZWN0aW9uTWF0cml4ID0gZnVuY3Rpb24oKXtpZih0aGlzLl9wcm9qZWN0aW9uTWF0cml4VXBkYXRlZClyZXR1cm47TWF0R0wucGVyc3BlY3RpdmUodGhpcy5wcm9qZWN0aW9uTWF0cml4LHRoaXMuX2Zvdix0aGlzLl9hc3BlY3RSYXRpb0xhc3QsdGhpcy5fbmVhcix0aGlzLl9mYXIpO3RoaXMuX3Byb2plY3Rpb25NYXRyaXhVcGRhdGVkID0gdHJ1ZTt9O1xuXG5DYW1lcmFCYXNpYy5wcm90b3R5cGUudXBkYXRlTWF0cmljZXMgPSBmdW5jdGlvbigpe3RoaXMudXBkYXRlTW9kZWxWaWV3TWF0cml4KCk7dGhpcy51cGRhdGVQcm9qZWN0aW9uTWF0cml4KCk7fTtcblxuQ2FtZXJhQmFzaWMucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKXtyZXR1cm4gJ3twb3NpdGlvbj0gJyArIFZlYzMudG9TdHJpbmcodGhpcy5wb3NpdGlvbikgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnLCB0YXJnZXQ9ICcgKyBWZWMzLnRvU3RyaW5nKHRoaXMuX3RhcmdldCkgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnLCB1cD0gJyAgICAgKyBWZWMzLnRvU3RyaW5nKHRoaXMuX3VwKSArICd9J307XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FtZXJhQmFzaWM7XG5cblxuIiwidmFyIGtFcnJvciAgICAgICAgICAgPSByZXF1aXJlKCcuLi9zeXN0ZW0vZkVycm9yJyksXG4gICAgUHJvZ1ZlcnRleFNoYWRlciA9IHJlcXVpcmUoJy4vZ2wvc2hhZGVyL2ZQcm9nVmVydGV4U2hhZGVyJyksXG4gICAgUHJvZ0ZyYWdTaGFkZXIgICA9IHJlcXVpcmUoJy4vZ2wvc2hhZGVyL2ZQcm9nRnJhZ1NoYWRlcicpLFxuICAgIFByb2dMb2FkZXIgICAgICAgPSByZXF1aXJlKCcuL2dsL3NoYWRlci9mUHJvZ0xvYWRlcicpLFxuICAgIFNoYWRlckxvYWRlciAgICAgPSByZXF1aXJlKCcuL2dsL3NoYWRlci9mU2hhZGVyTG9hZGVyJyksXG4gICAgUGxhdGZvcm0gICAgICAgICA9IHJlcXVpcmUoJy4uL3N5c3RlbS9mUGxhdGZvcm0nKSxcbiAgICBWZWMyICAgICAgICAgICAgID0gcmVxdWlyZSgnLi4vbWF0aC9mVmVjMicpLFxuICAgIFZlYzMgICAgICAgICAgICAgPSByZXF1aXJlKCcuLi9tYXRoL2ZWZWMzJyksXG4gICAgVmVjNCAgICAgICAgICAgICA9IHJlcXVpcmUoJy4uL21hdGgvZlZlYzQnKSxcbiAgICBNYXQzMyAgICAgICAgICAgID0gcmVxdWlyZSgnLi4vbWF0aC9mTWF0MzMnKSxcbiAgICBNYXQ0NCAgICAgICAgICAgID0gcmVxdWlyZSgnLi4vbWF0aC9mTWF0NDQnKSxcbiAgICBDb2xvciAgICAgICAgICAgID0gcmVxdWlyZSgnLi4vdXRpbC9mQ29sb3InKSxcbiAgICBUZXh0dXJlICAgICAgICAgID0gcmVxdWlyZSgnLi9nbC9mVGV4dHVyZScpO1xuXG5cbmZ1bmN0aW9uIEZHTChjb250ZXh0M2QsY29udGV4dDJkKVxue1xuICAgIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbiAgICAvLyBJbml0XG4gICAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4gICAgdmFyIGdsID0gdGhpcy5nbCA9IGNvbnRleHQzZDtcblxuICAgIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbiAgICAvLyBjcmVhdGUgc2hhZGVycy9wcm9ncmFtICsgYmluZFxuICAgIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAgIC8qXG4gICAgdmFyIHByb2dWZXJ0ZXhTaGFkZXIgPSBTaGFkZXJMb2FkZXIubG9hZFNoYWRlckZyb21TdHJpbmcoZ2wsIFByb2dWZXJ0ZXhTaGFkZXIsIGdsLlZFUlRFWF9TSEFERVIpLFxuICAgICAgICBwcm9nRnJhZ1NoYWRlciAgID0gU2hhZGVyTG9hZGVyLmxvYWRTaGFkZXJGcm9tU3RyaW5nKGdsLCAoKFBsYXRmb3JtLmdldFRhcmdldCgpID09IFBsYXRmb3JtLldFQikgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU2hhZGVyTG9hZGVyLlByZWZpeFNoYWRlcldlYiA6ICcnKSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBQcm9nRnJhZ1NoYWRlciwgZ2wuRlJBR01FTlRfU0hBREVSKTtcblxuXG5cbiAgICB2YXIgcHJvZ3JhbVNjZW5lID0gIFByb2dMb2FkZXIubG9hZFByb2dyYW0oZ2wscHJvZ1ZlcnRleFNoYWRlcixwcm9nRnJhZ1NoYWRlcik7XG4gICAgKi9cblxuXG5cbiAgICB2YXIgcGxhdGZvcm0gPSBQbGF0Zm9ybS5nZXRUYXJnZXQoKTtcblxuICAgIHZhciBwcm9ncmFtU2NlbmUgPSB0aGlzLl9wcm9ncmFtU2NlbmUgPSBnbC5jcmVhdGVQcm9ncmFtKCk7XG5cbiAgICB2YXIgcHJvZ1ZlcnRTaGFkZXIgPSBnbC5jcmVhdGVTaGFkZXIoZ2wuVkVSVEVYX1NIQURFUiksXG4gICAgICAgIHByb2dGcmFnU2hhZGVyID0gZ2wuY3JlYXRlU2hhZGVyKGdsLkZSQUdNRU5UX1NIQURFUik7XG5cbiAgICBnbC5zaGFkZXJTb3VyY2UocHJvZ1ZlcnRTaGFkZXIsIFByb2dWZXJ0ZXhTaGFkZXIpO1xuICAgIGdsLmNvbXBpbGVTaGFkZXIocHJvZ1ZlcnRTaGFkZXIpO1xuXG4gICAgaWYoIWdsLmdldFNoYWRlclBhcmFtZXRlcihwcm9nVmVydFNoYWRlcixnbC5DT01QSUxFX1NUQVRVUykpXG4gICAgICAgIHRocm93IGdsLmdldFNoYWRlckluZm9Mb2cocHJvZ1ZlcnRTaGFkZXIpO1xuXG4gICAgZ2wuc2hhZGVyU291cmNlKHByb2dGcmFnU2hhZGVyLCAoKHBsYXRmb3JtID09IFBsYXRmb3JtLldFQikgPyBTaGFkZXJMb2FkZXIuUHJlZml4U2hhZGVyV2ViIDogJycpICsgUHJvZ0ZyYWdTaGFkZXIpO1xuICAgIGdsLmNvbXBpbGVTaGFkZXIocHJvZ0ZyYWdTaGFkZXIpO1xuXG4gICAgaWYoIWdsLmdldFNoYWRlclBhcmFtZXRlcihwcm9nRnJhZ1NoYWRlcixnbC5DT01QSUxFX1NUQVRVUykpXG4gICAgICAgIHRocm93IGdsLmdldFNoYWRlckluZm9Mb2cocHJvZ0ZyYWdTaGFkZXIpO1xuXG4gICAgZ2wuYmluZEF0dHJpYkxvY2F0aW9uKHByb2dyYW1TY2VuZSwwLCdhVmVydGV4UG9zaXRpb24nKTtcblxuICAgIGdsLmF0dGFjaFNoYWRlcihwcm9ncmFtU2NlbmUsIHByb2dWZXJ0U2hhZGVyKTtcbiAgICBnbC5hdHRhY2hTaGFkZXIocHJvZ3JhbVNjZW5lLCBwcm9nRnJhZ1NoYWRlcik7XG4gICAgZ2wubGlua1Byb2dyYW0oIHByb2dyYW1TY2VuZSk7XG5cbiAgICBpZighZ2wuZ2V0UHJvZ3JhbVBhcmFtZXRlcihwcm9ncmFtU2NlbmUsZ2wuTElOS19TVEFUVVMpKVxuICAgICAgICB0aHJvdyBnbC5nZXRQcm9ncmFtSW5mb0xvZyhwcm9ncmFtU2NlbmUpO1xuXG4gICAgZ2wudXNlUHJvZ3JhbShwcm9ncmFtU2NlbmUpO1xuXG5cblxuICAgIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbiAgICAvLyBCaW5kICYgZW5hYmxlIHNoYWRlciBhdHRyaWJ1dGVzICYgdW5pZm9ybXNcbiAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cblxuICAgIHRoaXMuX2FWZXJ0ZXhQb3NpdGlvbiAgID0gZ2wuZ2V0QXR0cmliTG9jYXRpb24ocHJvZ3JhbVNjZW5lLCdhVmVydGV4UG9zaXRpb24nKTtcbiAgICB0aGlzLl9hVmVydGV4Tm9ybWFsICAgICA9IGdsLmdldEF0dHJpYkxvY2F0aW9uKHByb2dyYW1TY2VuZSwnYVZlcnRleE5vcm1hbCcpO1xuICAgIHRoaXMuX2FWZXJ0ZXhDb2xvciAgICAgID0gZ2wuZ2V0QXR0cmliTG9jYXRpb24ocHJvZ3JhbVNjZW5lLCdhVmVydGV4Q29sb3InKTtcbiAgICB0aGlzLl9hVmVydGV4VGV4Q29vcmQgICA9IGdsLmdldEF0dHJpYkxvY2F0aW9uKHByb2dyYW1TY2VuZSwnYVZlcnRleFRleENvb3JkJyk7XG5cbiAgICB0aGlzLl91TW9kZWxWaWV3TWF0cml4ICA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbihwcm9ncmFtU2NlbmUsJ3VNb2RlbFZpZXdNYXRyaXgnKTtcbiAgICB0aGlzLl91UHJvamVjdGlvbk1hdHJpeCA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbihwcm9ncmFtU2NlbmUsJ3VQcm9qZWN0aW9uTWF0cml4Jyk7XG4gICAgdGhpcy5fdU5vcm1hbE1hdHJpeCAgICAgPSBnbC5nZXRVbmlmb3JtTG9jYXRpb24ocHJvZ3JhbVNjZW5lLCd1Tm9ybWFsTWF0cml4Jyk7XG4gICAgdGhpcy5fdVRleEltYWdlICAgICAgICAgPSBnbC5nZXRVbmlmb3JtTG9jYXRpb24ocHJvZ3JhbVNjZW5lLCd1VGV4SW1hZ2UnKTtcblxuICAgIHRoaXMuX3VQb2ludFNpemUgICAgICAgID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHByb2dyYW1TY2VuZSwndVBvaW50U2l6ZScpO1xuXG4gICAgdGhpcy5fdVVzZUxpZ2h0aW5nICAgICAgPSBnbC5nZXRVbmlmb3JtTG9jYXRpb24ocHJvZ3JhbVNjZW5lLCd1VXNlTGlnaHRpbmcnKTtcbiAgICB0aGlzLl91VXNlTWF0ZXJpYWwgICAgICA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbihwcm9ncmFtU2NlbmUsJ3VVc2VNYXRlcmlhbCcpO1xuICAgIHRoaXMuX3VVc2VUZXh0dXJlICAgICAgID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHByb2dyYW1TY2VuZSwndVVzZVRleHR1cmUnKTtcblxuICAgIHRoaXMuX3VBbWJpZW50ICAgICAgICAgID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHByb2dyYW1TY2VuZSwndUFtYmllbnQnKTtcblxuXG4gICAgZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkodGhpcy5fYVZlcnRleFBvc2l0aW9uKTtcbiAgICBnbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheSh0aGlzLl9hVmVydGV4Tm9ybWFsKTtcbiAgICBnbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheSh0aGlzLl9hVmVydGV4Q29sb3IpO1xuICAgIGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KHRoaXMuX2FWZXJ0ZXhUZXhDb29yZCk7XG5cbiAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4gICAgLy8gU2V0IFNoYWRlciBpbml0aWFsIHZhbHVlc1xuICAgIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuXG4gICAgdGhpcy5MSUdIVF8wICAgID0gMDtcbiAgICB0aGlzLkxJR0hUXzEgICAgPSAxO1xuICAgIHRoaXMuTElHSFRfMiAgICA9IDI7XG4gICAgdGhpcy5MSUdIVF8zICAgID0gMztcbiAgICB0aGlzLkxJR0hUXzQgICAgPSA0O1xuICAgIHRoaXMuTElHSFRfNSAgICA9IDU7XG4gICAgdGhpcy5MSUdIVF82ICAgID0gNjtcbiAgICB0aGlzLkxJR0hUXzcgICAgPSA3O1xuICAgIHRoaXMuTUFYX0xJR0hUUyA9IDg7XG5cbiAgICB0aGlzLk1PREVMX1BIT05HICAgICAgID0gMDtcbiAgICB0aGlzLk1PREVMX0FOVElTT1BUUklDID0gMTtcbiAgICB0aGlzLk1PREVMX0ZSRVNORUwgICAgID0gMjtcbiAgICB0aGlzLk1PREVMX0JMSU5OICAgICAgID0gMztcbiAgICB0aGlzLk1PREVMX0ZMQVQgICAgICAgID0gNDtcblxuXG5cblxuICAgIHZhciBsID0gdGhpcy5NQVhfTElHSFRTO1xuXG5cblxuICAgIHZhciB1TGlnaHRQb3NpdGlvbiAgICAgICAgICAgICA9IHRoaXMuX3VMaWdodFBvc2l0aW9uICAgICAgICAgICAgID0gbmV3IEFycmF5KGwpLFxuICAgICAgICB1TGlnaHRBbWJpZW50ICAgICAgICAgICAgICA9IHRoaXMuX3VMaWdodEFtYmllbnQgICAgICAgICAgICAgID0gbmV3IEFycmF5KGwpLFxuICAgICAgICB1TGlnaHREaWZmdXNlICAgICAgICAgICAgICA9IHRoaXMuX3VMaWdodERpZmZ1c2UgICAgICAgICAgICAgID0gbmV3IEFycmF5KGwpLFxuICAgICAgICB1TGlnaHRTcGVjdWxhciAgICAgICAgICAgICA9IHRoaXMuX3VMaWdodFNwZWN1bGFyICAgICAgICAgICAgID0gbmV3IEFycmF5KGwpLFxuICAgICAgICB1TGlnaHRBdHRlbnVhdGlvbkNvbnN0YW50ICA9IHRoaXMuX3VMaWdodEF0dGVudWF0aW9uQ29uc3RhbnQgID0gbmV3IEFycmF5KGwpLFxuICAgICAgICB1TGlnaHRBdHRlbnVhdGlvbkxpbmVhciAgICA9IHRoaXMuX3VMaWdodEF0dGVudWF0aW9uTGluZWFyICAgID0gbmV3IEFycmF5KGwpLFxuICAgICAgICB1TGlnaHRBdHRlbnVhdGlvblF1YWRyYXRpYyA9IHRoaXMuX3VMaWdodEF0dGVudWF0aW9uUXVhZHJhdGljID0gbmV3IEFycmF5KGwpO1xuXG4gICAgdmFyIGxpZ2h0O1xuXG4gICAgdmFyIGkgPSAtMTtcbiAgICB3aGlsZSgrK2kgPCBsKVxuICAgIHtcbiAgICAgICAgbGlnaHQgPSAndUxpZ2h0c1snK2krJ10uJztcblxuXG4gICAgICAgIHVMaWdodFBvc2l0aW9uW2ldICAgICAgICAgICAgID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHByb2dyYW1TY2VuZSxsaWdodCArICdwb3NpdGlvbicpO1xuICAgICAgICB1TGlnaHRBbWJpZW50W2ldICAgICAgICAgICAgICA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbihwcm9ncmFtU2NlbmUsbGlnaHQgKyAnYW1iaWVudCcpO1xuICAgICAgICB1TGlnaHREaWZmdXNlW2ldICAgICAgICAgICAgICA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbihwcm9ncmFtU2NlbmUsbGlnaHQgKyAnZGlmZnVzZScpO1xuICAgICAgICB1TGlnaHRTcGVjdWxhcltpXSAgICAgICAgICAgICA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbihwcm9ncmFtU2NlbmUsbGlnaHQgKyAnc3BlY3VsYXInKTtcblxuICAgICAgICB1TGlnaHRBdHRlbnVhdGlvbkNvbnN0YW50W2ldICA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbihwcm9ncmFtU2NlbmUsbGlnaHQgKyAnY29uc3RhbnRBdHRlbnVhdGlvbicpO1xuICAgICAgICB1TGlnaHRBdHRlbnVhdGlvbkxpbmVhcltpXSAgICA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbihwcm9ncmFtU2NlbmUsbGlnaHQgKyAnbGluZWFyQXR0ZW51YXRpb24nKTtcbiAgICAgICAgdUxpZ2h0QXR0ZW51YXRpb25RdWFkcmF0aWNbaV0gPSBnbC5nZXRVbmlmb3JtTG9jYXRpb24ocHJvZ3JhbVNjZW5lLGxpZ2h0ICsgJ3F1YWRyYXRpY0F0dGVudWF0aW9uJyk7XG5cbiAgICAgICAgZ2wudW5pZm9ybTRmdih1TGlnaHRQb3NpdGlvbltpXSwgbmV3IEZsb2F0MzJBcnJheShbMCwwLDAsMF0pKTtcbiAgICAgICAgZ2wudW5pZm9ybTNmdih1TGlnaHRBbWJpZW50W2ldLCAgbmV3IEZsb2F0MzJBcnJheShbMCwwLDBdKSk7XG4gICAgICAgIGdsLnVuaWZvcm0zZnYodUxpZ2h0RGlmZnVzZVtpXSwgIG5ldyBGbG9hdDMyQXJyYXkoWzAsMCwwXSkpO1xuXG4gICAgICAgIGdsLnVuaWZvcm0xZih1TGlnaHRBdHRlbnVhdGlvbkNvbnN0YW50W2ldLCAxLjApO1xuICAgICAgICBnbC51bmlmb3JtMWYodUxpZ2h0QXR0ZW51YXRpb25MaW5lYXJbaV0sICAgMC4wKTtcbiAgICAgICAgZ2wudW5pZm9ybTFmKHVMaWdodEF0dGVudWF0aW9uUXVhZHJhdGljW2ldLDAuMCk7XG4gICAgfVxuXG4gICAgdGhpcy5fdU1hdGVyaWFsRW1pc3Npb24gID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHByb2dyYW1TY2VuZSwndU1hdGVyaWFsLmVtaXNzaW9uJyk7XG4gICAgdGhpcy5fdU1hdGVyaWFsQW1iaWVudCAgID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHByb2dyYW1TY2VuZSwndU1hdGVyaWFsLmFtYmllbnQnKTtcbiAgICB0aGlzLl91TWF0ZXJpYWxEaWZmdXNlICAgPSBnbC5nZXRVbmlmb3JtTG9jYXRpb24ocHJvZ3JhbVNjZW5lLCd1TWF0ZXJpYWwuZGlmZnVzZScpO1xuICAgIHRoaXMuX3VNYXRlcmlhbFNwZWN1bGFyICA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbihwcm9ncmFtU2NlbmUsJ3VNYXRlcmlhbC5zcGVjdWxhcicpO1xuICAgIHRoaXMuX3VNYXRlcmlhbFNoaW5pbmVzcyA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbihwcm9ncmFtU2NlbmUsJ3VNYXRlcmlhbC5zaGluaW5lc3MnKTtcblxuICAgIGdsLnVuaWZvcm00Zih0aGlzLl91TWF0ZXJpYWxFbWlzc2lvbiwgMC4wLDAuMCwwLjAsMS4wKTtcbiAgICBnbC51bmlmb3JtNGYodGhpcy5fdU1hdGVyaWFsQW1iaWVudCwgIDEuMCwwLjUsMC41LDEuMCk7XG4gICAgZ2wudW5pZm9ybTRmKHRoaXMuX3VNYXRlcmlhbERpZmZ1c2UsICAwLjAsMC4wLDAuMCwxLjApO1xuICAgIGdsLnVuaWZvcm00Zih0aGlzLl91TWF0ZXJpYWxTcGVjdWxhciwgMC4wLDAuMCwwLjAsMS4wKTtcbiAgICBnbC51bmlmb3JtMWYodGhpcy5fdU1hdGVyaWFsU2hpbmluZXNzLDEwLjApO1xuXG5cbiAgICB0aGlzLl90ZW1wTGlnaHRQb3MgPSBWZWM0Lm1ha2UoKTtcblxuICAgIGdsLnVuaWZvcm0xZih0aGlzLl91VXNlTWF0ZXJpYWwsIDAuMCk7XG4gICAgZ2wudW5pZm9ybTFmKHRoaXMuX3VVc2VMaWdodGluZywgMC4wKTtcbiAgICBnbC51bmlmb3JtMWYodGhpcy5fdVVzZU1hdGVyaWFsLCAwLjApO1xuICAgIGdsLnVuaWZvcm0xZih0aGlzLl91UG9pbnRTaXplLCAgIDEuMCk7XG5cblxuICAgIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbiAgICAvLyBCaW5kIGNvbnN0YW50c1xuICAgIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAgIHRoaXMuQUNUSVZFX0FUVFJJQlVURVM9IDM1NzIxOyB0aGlzLkFDVElWRV9URVhUVVJFPSAzNDAxNjsgdGhpcy5BQ1RJVkVfVU5JRk9STVM9IDM1NzE4OyB0aGlzLkFMSUFTRURfTElORV9XSURUSF9SQU5HRT0gMzM5MDI7IHRoaXMuQUxJQVNFRF9QT0lOVF9TSVpFX1JBTkdFPSAzMzkwMTsgdGhpcy5BTFBIQT0gNjQwNjsgdGhpcy5BTFBIQV9CSVRTPSAzNDEzOyB0aGlzLkFMV0FZUz0gNTE5IDsgdGhpcy5BUlJBWV9CVUZGRVI9IDM0OTYyIDsgdGhpcy5BUlJBWV9CVUZGRVJfQklORElORz0gMzQ5NjQgOyB0aGlzLkFUVEFDSEVEX1NIQURFUlM9IDM1NzE3IDsgdGhpcy5CQUNLPSAxMDI5IDsgdGhpcy5CTEVORD0gMzA0MiA7IHRoaXMuQkxFTkRfQ09MT1I9IDMyNzczIDsgdGhpcy5CTEVORF9EU1RfQUxQSEE9IDMyOTcwIDsgdGhpcy5CTEVORF9EU1RfUkdCPSAzMjk2OCA7IHRoaXMuQkxFTkRfRVFVQVRJT049IDMyNzc3IDsgdGhpcy5CTEVORF9FUVVBVElPTl9BTFBIQT0gMzQ4NzcgOyB0aGlzLkJMRU5EX0VRVUFUSU9OX1JHQj0gMzI3NzcgOyB0aGlzLkJMRU5EX1NSQ19BTFBIQT0gMzI5NzEgOyB0aGlzLkJMRU5EX1NSQ19SR0I9IDMyOTY5IDsgdGhpcy5CTFVFX0JJVFM9IDM0MTIgOyB0aGlzLkJPT0w9IDM1NjcwIDsgdGhpcy5CT09MX1ZFQzI9IDM1NjcxIDsgdGhpcy5CT09MX1ZFQzM9IDM1NjcyIDsgdGhpcy5CT09MX1ZFQzQ9IDM1NjczIDsgdGhpcy5CUk9XU0VSX0RFRkFVTFRfV0VCR0w9IDM3NDQ0IDsgdGhpcy5CVUZGRVJfU0laRT0gMzQ2NjAgOyB0aGlzLkJVRkZFUl9VU0FHRT0gMzQ2NjEgOyB0aGlzLkJZVEU9IDUxMjAgOyB0aGlzLkNDVz0gMjMwNSA7IHRoaXMuQ0xBTVBfVE9fRURHRT0gMzMwNzEgOyB0aGlzLkNPTE9SX0FUVEFDSE1FTlQwPSAzNjA2NCA7IHRoaXMuQ09MT1JfQlVGRkVSX0JJVD0gMTYzODQgOyB0aGlzLkNPTE9SX0NMRUFSX1ZBTFVFPSAzMTA2IDsgdGhpcy5DT0xPUl9XUklURU1BU0s9IDMxMDcgOyB0aGlzLkNPTVBJTEVfU1RBVFVTPSAzNTcxMyA7IHRoaXMuQ09NUFJFU1NFRF9URVhUVVJFX0ZPUk1BVFM9IDM0NDY3IDsgdGhpcy5DT05TVEFOVF9BTFBIQT0gMzI3NzEgOyB0aGlzLkNPTlNUQU5UX0NPTE9SPSAzMjc2OSA7IHRoaXMuQ09OVEVYVF9MT1NUX1dFQkdMPSAzNzQ0MiA7IHRoaXMuQ1VMTF9GQUNFPSAyODg0IDsgdGhpcy5DVUxMX0ZBQ0VfTU9ERT0gMjg4NSA7IHRoaXMuQ1VSUkVOVF9QUk9HUkFNPSAzNTcyNSA7IHRoaXMuQ1VSUkVOVF9WRVJURVhfQVRUUklCPSAzNDM0MiA7IHRoaXMuQ1c9IDIzMDQgOyB0aGlzLkRFQ1I9IDc2ODMgOyB0aGlzLkRFQ1JfV1JBUD0gMzQwNTYgOyB0aGlzLkRFTEVURV9TVEFUVVM9IDM1NzEyIDsgdGhpcy5ERVBUSF9BVFRBQ0hNRU5UPSAzNjA5NiA7IHRoaXMuREVQVEhfQklUUz0gMzQxNCA7IHRoaXMuREVQVEhfQlVGRkVSX0JJVD0gMjU2IDsgdGhpcy5ERVBUSF9DTEVBUl9WQUxVRT0gMjkzMSA7IHRoaXMuREVQVEhfQ09NUE9ORU5UPSA2NDAyIDsgdGhpcy5ERVBUSF9DT01QT05FTlQxNj0gMzMxODkgOyB0aGlzLkRFUFRIX0ZVTkM9IDI5MzIgOyB0aGlzLkRFUFRIX1JBTkdFPSAyOTI4IDsgdGhpcy5ERVBUSF9TVEVOQ0lMPSAzNDA0MSA7IHRoaXMuREVQVEhfU1RFTkNJTF9BVFRBQ0hNRU5UPSAzMzMwNiA7IHRoaXMuREVQVEhfVEVTVD0gMjkyOSA7IHRoaXMuREVQVEhfV1JJVEVNQVNLPSAyOTMwIDsgdGhpcy5ESVRIRVI9IDMwMjQgOyB0aGlzLkRPTlRfQ0FSRT0gNDM1MiA7IHRoaXMuRFNUX0FMUEhBPSA3NzIgOyB0aGlzLkRTVF9DT0xPUj0gNzc0IDsgdGhpcy5EWU5BTUlDX0RSQVc9IDM1MDQ4IDsgdGhpcy5FTEVNRU5UX0FSUkFZX0JVRkZFUj0gMzQ5NjMgOyB0aGlzLkVMRU1FTlRfQVJSQVlfQlVGRkVSX0JJTkRJTkc9IDM0OTY1IDsgdGhpcy5FUVVBTD0gNTE0IDsgdGhpcy5GQVNURVNUPSA0MzUzIDsgdGhpcy5GTE9BVD0gNTEyNiA7IHRoaXMuRkxPQVRfTUFUMj0gMzU2NzQgOyB0aGlzLkZMT0FUX01BVDM9IDM1Njc1IDsgdGhpcy5GTE9BVF9NQVQ0PSAzNTY3NiA7IHRoaXMuRkxPQVRfVkVDMj0gMzU2NjQgOyB0aGlzLkZMT0FUX1ZFQzM9IDM1NjY1IDsgdGhpcy5GTE9BVF9WRUM0PSAzNTY2NiA7IHRoaXMuRlJBR01FTlRfU0hBREVSPSAzNTYzMiA7IHRoaXMuRlJBTUVCVUZGRVI9IDM2MTYwIDsgdGhpcy5GUkFNRUJVRkZFUl9BVFRBQ0hNRU5UX09CSkVDVF9OQU1FPSAzNjA0OSA7IHRoaXMuRlJBTUVCVUZGRVJfQVRUQUNITUVOVF9PQkpFQ1RfVFlQRT0gMzYwNDggOyB0aGlzLkZSQU1FQlVGRkVSX0FUVEFDSE1FTlRfVEVYVFVSRV9DVUJFX01BUF9GQUNFPSAzNjA1MSA7IHRoaXMuRlJBTUVCVUZGRVJfQVRUQUNITUVOVF9URVhUVVJFX0xFVkVMPSAzNjA1MCA7IHRoaXMuRlJBTUVCVUZGRVJfQklORElORz0gMzYwMDYgOyB0aGlzLkZSQU1FQlVGRkVSX0NPTVBMRVRFPSAzNjA1MyA7IHRoaXMuRlJBTUVCVUZGRVJfSU5DT01QTEVURV9BVFRBQ0hNRU5UPSAzNjA1NCA7IHRoaXMuRlJBTUVCVUZGRVJfSU5DT01QTEVURV9ESU1FTlNJT05TPSAzNjA1NyA7IHRoaXMuRlJBTUVCVUZGRVJfSU5DT01QTEVURV9NSVNTSU5HX0FUVEFDSE1FTlQ9IDM2MDU1IDsgdGhpcy5GUkFNRUJVRkZFUl9VTlNVUFBPUlRFRD0gMzYwNjEgOyB0aGlzLkZST05UPSAxMDI4IDsgdGhpcy5GUk9OVF9BTkRfQkFDSz0gMTAzMiA7IHRoaXMuRlJPTlRfRkFDRT0gMjg4NiA7IHRoaXMuRlVOQ19BREQ9IDMyNzc0IDsgdGhpcy5GVU5DX1JFVkVSU0VfU1VCVFJBQ1Q9IDMyNzc5IDsgdGhpcy5GVU5DX1NVQlRSQUNUPSAzMjc3OCA7IHRoaXMuR0VORVJBVEVfTUlQTUFQX0hJTlQ9IDMzMTcwIDsgdGhpcy5HRVFVQUw9IDUxOCA7IHRoaXMuR1JFQVRFUj0gNTE2IDsgdGhpcy5HUkVFTl9CSVRTPSAzNDExIDsgdGhpcy5ISUdIX0ZMT0FUPSAzNjMzOCA7IHRoaXMuSElHSF9JTlQ9IDM2MzQxIDsgdGhpcy5JTkNSPSA3NjgyIDsgdGhpcy5JTkNSX1dSQVA9IDM0MDU1IDsgdGhpcy5JTlQ9IDUxMjQgOyB0aGlzLklOVF9WRUMyPSAzNTY2NyA7IHRoaXMuSU5UX1ZFQzM9IDM1NjY4IDsgdGhpcy5JTlRfVkVDND0gMzU2NjkgOyB0aGlzLklOVkFMSURfRU5VTT0gMTI4MCA7IHRoaXMuSU5WQUxJRF9GUkFNRUJVRkZFUl9PUEVSQVRJT049IDEyODYgOyB0aGlzLklOVkFMSURfT1BFUkFUSU9OPSAxMjgyIDsgdGhpcy5JTlZBTElEX1ZBTFVFPSAxMjgxIDsgdGhpcy5JTlZFUlQ9IDUzODYgOyB0aGlzLktFRVA9IDc2ODAgOyB0aGlzLkxFUVVBTD0gNTE1IDsgdGhpcy5MRVNTPSA1MTMgOyB0aGlzLkxJTkVBUj0gOTcyOSA7IHRoaXMuTElORUFSX01JUE1BUF9MSU5FQVI9IDk5ODcgOyB0aGlzLkxJTkVBUl9NSVBNQVBfTkVBUkVTVD0gOTk4NSA7IHRoaXMuTElORVM9IDEgOyB0aGlzLkxJTkVfTE9PUD0gMiA7IHRoaXMuTElORV9TVFJJUD0gMyA7IHRoaXMuTElORV9XSURUSD0gMjg0OTsgdGhpcy5MSU5LX1NUQVRVUz0gMzU3MTQ7IHRoaXMuTE9XX0ZMT0FUPSAzNjMzNiA7IHRoaXMuTE9XX0lOVD0gMzYzMzkgOyB0aGlzLkxVTUlOQU5DRT0gNjQwOSA7IHRoaXMuTFVNSU5BTkNFX0FMUEhBPSA2NDEwOyB0aGlzLk1BWF9DT01CSU5FRF9URVhUVVJFX0lNQUdFX1VOSVRTPSAzNTY2MSA7IHRoaXMuTUFYX0NVQkVfTUFQX1RFWFRVUkVfU0laRT0gMzQwNzYgOyB0aGlzLk1BWF9GUkFHTUVOVF9VTklGT1JNX1ZFQ1RPUlM9IDM2MzQ5IDsgdGhpcy5NQVhfUkVOREVSQlVGRkVSX1NJWkU9IDM0MDI0IDsgdGhpcy5NQVhfVEVYVFVSRV9JTUFHRV9VTklUUz0gMzQ5MzAgOyB0aGlzLk1BWF9URVhUVVJFX1NJWkU9IDMzNzkgOyB0aGlzLiBNQVhfVkFSWUlOR19WRUNUT1JTPSAzNjM0OCA7IHRoaXMuTUFYX1ZFUlRFWF9BVFRSSUJTPSAzNDkyMSA7IHRoaXMuTUFYX1ZFUlRFWF9URVhUVVJFX0lNQUdFX1VOSVRTPSAzNTY2MCA7IHRoaXMuTUFYX1ZFUlRFWF9VTklGT1JNX1ZFQ1RPUlM9IDM2MzQ3IDsgdGhpcy5NQVhfVklFV1BPUlRfRElNUz0gMzM4NiA7IHRoaXMuTUVESVVNX0ZMT0FUPSAzNjMzNyA7IHRoaXMuTUVESVVNX0lOVD0gMzYzNDAgOyB0aGlzLk1JUlJPUkVEX1JFUEVBVD0gMzM2NDggOyB0aGlzLk5FQVJFU1Q9IDk3MjggOyB0aGlzLk5FQVJFU1RfTUlQTUFQX0xJTkVBUj0gOTk4NiA7IHRoaXMuTkVBUkVTVF9NSVBNQVBfTkVBUkVTVD0gOTk4NCA7IHRoaXMuTkVWRVI9IDUxMiA7IHRoaXMuTklDRVNUPSA0MzU0IDsgdGhpcy5OT05FPSAwIDsgdGhpcy5OT1RFUVVBTD0gNTE3IDsgdGhpcy5OT19FUlJPUj0gMCA7IHRoaXMuT05FPSAxIDsgdGhpcy5PTkVfTUlOVVNfQ09OU1RBTlRfQUxQSEE9IDMyNzcyIDsgdGhpcy5PTkVfTUlOVVNfQ09OU1RBTlRfQ09MT1I9IDMyNzcwIDsgdGhpcy5PTkVfTUlOVVNfRFNUX0FMUEhBPSA3NzMgOyB0aGlzLk9ORV9NSU5VU19EU1RfQ09MT1I9IDc3NSA7IHRoaXMuT05FX01JTlVTX1NSQ19BTFBIQT0gNzcxIDsgdGhpcy5PTkVfTUlOVVNfU1JDX0NPTE9SPSA3NjkgOyB0aGlzLk9VVF9PRl9NRU1PUlk9IDEyODUgOyB0aGlzLlBBQ0tfQUxJR05NRU5UPSAzMzMzIDsgdGhpcy5QT0lOVFM9IDAgOyB0aGlzLlBPTFlHT05fT0ZGU0VUX0ZBQ1RPUj0gMzI4MjQgOyB0aGlzLlBPTFlHT05fT0ZGU0VUX0ZJTEw9IDMyODIzIDsgdGhpcy5QT0xZR09OX09GRlNFVF9VTklUUz0gMTA3NTIgOyB0aGlzLlJFRF9CSVRTPSAzNDEwIDsgdGhpcy5SRU5ERVJCVUZGRVI9IDM2MTYxIDsgdGhpcy5SRU5ERVJCVUZGRVJfQUxQSEFfU0laRT0gMzYxNzkgOyB0aGlzLlJFTkRFUkJVRkZFUl9CSU5ESU5HPSAzNjAwNyA7IHRoaXMuUkVOREVSQlVGRkVSX0JMVUVfU0laRT0gMzYxNzggOyB0aGlzLlJFTkRFUkJVRkZFUl9ERVBUSF9TSVpFPSAzNjE4MCA7IHRoaXMuUkVOREVSQlVGRkVSX0dSRUVOX1NJWkU9IDM2MTc3IDsgdGhpcy5SRU5ERVJCVUZGRVJfSEVJR0hUPSAzNjE2MyA7IHRoaXMuUkVOREVSQlVGRkVSX0lOVEVSTkFMX0ZPUk1BVD0gMzYxNjQgOyB0aGlzLlJFTkRFUkJVRkZFUl9SRURfU0laRT0gMzYxNzYgOyB0aGlzLlJFTkRFUkJVRkZFUl9TVEVOQ0lMX1NJWkU9IDM2MTgxIDsgdGhpcy5SRU5ERVJCVUZGRVJfV0lEVEg9IDM2MTYyIDsgdGhpcy5SRU5ERVJFUj0gNzkzNyA7IHRoaXMuUkVQRUFUPSAxMDQ5NyA7IHRoaXMuUkVQTEFDRT0gNzY4MSA7IHRoaXMuUkdCPSA2NDA3IDsgdGhpcy5SR0I1X0ExPSAzMjg1NSA7IHRoaXMuUkdCNTY1PSAzNjE5NCA7IHRoaXMuUkdCQT0gNjQwOCA7IHRoaXMuUkdCQTQ9IDMyODU0IDsgdGhpcy5TQU1QTEVSXzJEPSAzNTY3OCA7IHRoaXMuU0FNUExFUl9DVUJFPSAzNTY4MCA7IHRoaXMuU0FNUExFUz0gMzI5MzcgOyB0aGlzLlNBTVBMRV9BTFBIQV9UT19DT1ZFUkFHRT0gMzI5MjYgOyB0aGlzLlNBTVBMRV9CVUZGRVJTPSAzMjkzNiA7IHRoaXMuU0FNUExFX0NPVkVSQUdFPSAzMjkyOCA7IHRoaXMuU0FNUExFX0NPVkVSQUdFX0lOVkVSVD0gMzI5MzkgOyB0aGlzLlNBTVBMRV9DT1ZFUkFHRV9WQUxVRT0gMzI5MzggOyB0aGlzLlNDSVNTT1JfQk9YPSAzMDg4IDsgdGhpcy5TQ0lTU09SX1RFU1Q9IDMwODkgOyB0aGlzLlNIQURFUl9UWVBFPSAzNTY2MyA7IHRoaXMuU0hBRElOR19MQU5HVUFHRV9WRVJTSU9OPSAzNTcyNCA7IHRoaXMuU0hPUlQ9IDUxMjIgOyB0aGlzLlNSQ19BTFBIQT0gNzcwIDsgdGhpcy5TUkNfQUxQSEFfU0FUVVJBVEU9IDc3NiA7IHRoaXMuU1JDX0NPTE9SPSA3NjggOyB0aGlzLlNUQVRJQ19EUkFXPSAzNTA0NCA7IHRoaXMuU1RFTkNJTF9BVFRBQ0hNRU5UPSAzNjEyOCA7IHRoaXMuU1RFTkNJTF9CQUNLX0ZBSUw9IDM0ODE3IDsgdGhpcy5TVEVOQ0lMX0JBQ0tfRlVOQz0gMzQ4MTYgOyB0aGlzLlNURU5DSUxfQkFDS19QQVNTX0RFUFRIX0ZBSUw9IDM0ODE4IDsgdGhpcy5TVEVOQ0lMX0JBQ0tfUEFTU19ERVBUSF9QQVNTPSAzNDgxOSA7IHRoaXMuU1RFTkNJTF9CQUNLX1JFRj0gMzYwMDMgOyB0aGlzLlNURU5DSUxfQkFDS19WQUxVRV9NQVNLPSAzNjAwNCA7IHRoaXMuU1RFTkNJTF9CQUNLX1dSSVRFTUFTSz0gMzYwMDUgOyB0aGlzLlNURU5DSUxfQklUUz0gMzQxNSA7IHRoaXMuU1RFTkNJTF9CVUZGRVJfQklUPSAxMDI0IDsgdGhpcy5TVEVOQ0lMX0NMRUFSX1ZBTFVFPSAyOTYxIDsgdGhpcy5TVEVOQ0lMX0ZBSUw9IDI5NjQgOyB0aGlzLlNURU5DSUxfRlVOQz0gMjk2MiA7IHRoaXMuU1RFTkNJTF9JTkRFWD0gNjQwMSA7IHRoaXMuU1RFTkNJTF9JTkRFWDg9IDM2MTY4IDsgdGhpcy5TVEVOQ0lMX1BBU1NfREVQVEhfRkFJTD0gMjk2NSA7IHRoaXMuU1RFTkNJTF9QQVNTX0RFUFRIX1BBU1M9IDI5NjYgOyB0aGlzLlNURU5DSUxfUkVGPSAyOTY3IDsgdGhpcy5TVEVOQ0lMX1RFU1Q9IDI5NjAgOyB0aGlzLlNURU5DSUxfVkFMVUVfTUFTSz0gMjk2MyA7IHRoaXMuU1RFTkNJTF9XUklURU1BU0s9IDI5NjggOyB0aGlzLlNUUkVBTV9EUkFXPSAzNTA0MCA7IHRoaXMuU1VCUElYRUxfQklUUz0gMzQwOCA7IHRoaXMuVEVYVFVSRT0gNTg5MCA7IHRoaXMuVEVYVFVSRTA9IDMzOTg0IDsgdGhpcy5URVhUVVJFMT0gMzM5ODUgOyB0aGlzLlRFWFRVUkUyPSAzMzk4NiA7IHRoaXMuVEVYVFVSRTM9IDMzOTg3IDsgdGhpcy5URVhUVVJFND0gMzM5ODggOyB0aGlzLlRFWFRVUkU1PSAzMzk4OSA7IHRoaXMuVEVYVFVSRTY9IDMzOTkwIDsgdGhpcy5URVhUVVJFNz0gMzM5OTEgOyB0aGlzLlRFWFRVUkU4PSAzMzk5MiA7IHRoaXMuVEVYVFVSRTk9IDMzOTkzIDsgdGhpcy5URVhUVVJFMTA9IDMzOTk0IDsgdGhpcy5URVhUVVJFMTE9IDMzOTk1IDsgdGhpcy5URVhUVVJFMTI9IDMzOTk2IDsgdGhpcy5URVhUVVJFMTM9IDMzOTk3IDsgdGhpcy5URVhUVVJFMTQ9IDMzOTk4IDsgdGhpcy5URVhUVVJFMTU9IDMzOTk5IDsgdGhpcy5URVhUVVJFMTY9IDM0MDAwIDsgdGhpcy5URVhUVVJFMTc9IDM0MDAxIDsgdGhpcy5URVhUVVJFMTg9IDM0MDAyIDsgdGhpcy5URVhUVVJFMTk9IDM0MDAzIDsgdGhpcy5URVhUVVJFMjA9IDM0MDA0IDsgdGhpcy5URVhUVVJFMjE9IDM0MDA1IDsgdGhpcy5URVhUVVJFMjI9IDM0MDA2IDsgdGhpcy5URVhUVVJFMjM9IDM0MDA3IDsgdGhpcy5URVhUVVJFMjQ9IDM0MDA4IDsgdGhpcy5URVhUVVJFMjU9IDM0MDA5IDsgdGhpcy5URVhUVVJFMjY9IDM0MDEwIDsgdGhpcy5URVhUVVJFMjc9IDM0MDExIDsgdGhpcy5URVhUVVJFMjg9IDM0MDEyIDsgdGhpcy5URVhUVVJFMjk9IDM0MDEzIDsgdGhpcy5URVhUVVJFMzA9IDM0MDE0IDsgdGhpcy5URVhUVVJFMzE9IDM0MDE1IDsgdGhpcy5URVhUVVJFXzJEPSAzNTUzIDsgdGhpcy5URVhUVVJFX0JJTkRJTkdfMkQ9IDMyODczIDsgdGhpcy5URVhUVVJFX0JJTkRJTkdfQ1VCRV9NQVA9IDM0MDY4IDsgdGhpcy5URVhUVVJFX0NVQkVfTUFQPSAzNDA2NyA7IHRoaXMuVEVYVFVSRV9DVUJFX01BUF9ORUdBVElWRV9YPSAzNDA3MCA7IHRoaXMuVEVYVFVSRV9DVUJFX01BUF9ORUdBVElWRV9ZPSAzNDA3MiA7IHRoaXMuVEVYVFVSRV9DVUJFX01BUF9ORUdBVElWRV9aPSAzNDA3NCA7IHRoaXMuVEVYVFVSRV9DVUJFX01BUF9QT1NJVElWRV9YPSAzNDA2OSA7IHRoaXMuVEVYVFVSRV9DVUJFX01BUF9QT1NJVElWRV9ZPSAzNDA3MSA7IHRoaXMuVEVYVFVSRV9DVUJFX01BUF9QT1NJVElWRV9aPSAzNDA3MyA7IHRoaXMuVEVYVFVSRV9NQUdfRklMVEVSPSAxMDI0MCA7IHRoaXMuVEVYVFVSRV9NSU5fRklMVEVSPSAxMDI0MSA7IHRoaXMuVEVYVFVSRV9XUkFQX1M9IDEwMjQyIDsgdGhpcy5URVhUVVJFX1dSQVBfVD0gMTAyNDMgOyB0aGlzLlRSSUFOR0xFUz0gNCA7IHRoaXMuVFJJQU5HTEVfRkFOPSA2IDsgdGhpcy5UUklBTkdMRV9TVFJJUD0gNSA7IHRoaXMuVU5QQUNLX0FMSUdOTUVOVD0gMzMxNyA7IHRoaXMuVU5QQUNLX0NPTE9SU1BBQ0VfQ09OVkVSU0lPTl9XRUJHTD0gMzc0NDMgOyB0aGlzLlVOUEFDS19GTElQX1lfV0VCR0w9IDM3NDQwIDsgdGhpcy5VTlBBQ0tfUFJFTVVMVElQTFlfQUxQSEFfV0VCR0w9IDM3NDQxIDsgdGhpcy5VTlNJR05FRF9CWVRFPSA1MTIxIDsgdGhpcy5VTlNJR05FRF9JTlQ9IDUxMjUgOyB0aGlzLlVOU0lHTkVEX1NIT1JUPSA1MTIzIDsgdGhpcy5VTlNJR05FRF9TSE9SVF80XzRfNF80PSAzMjgxOSA7IHRoaXMuVU5TSUdORURfU0hPUlRfNV81XzVfMT0gMzI4MjAgOyB0aGlzLlVOU0lHTkVEX1NIT1JUXzVfNl81PSAzMzYzNSA7IHRoaXMuVkFMSURBVEVfU1RBVFVTPSAzNTcxNSA7IHRoaXMuVkVORE9SPSA3OTM2IDsgdGhpcy5WRVJTSU9OPSA3OTM4IDsgdGhpcy5WRVJURVhfQVRUUklCX0FSUkFZX0JVRkZFUl9CSU5ESU5HPSAzNDk3NSA7IHRoaXMuVkVSVEVYX0FUVFJJQl9BUlJBWV9FTkFCTEVEPSAzNDMzOCA7IHRoaXMuVkVSVEVYX0FUVFJJQl9BUlJBWV9OT1JNQUxJWkVEPSAzNDkyMiA7IHRoaXMuVkVSVEVYX0FUVFJJQl9BUlJBWV9QT0lOVEVSPSAzNDM3MyA7IHRoaXMuVkVSVEVYX0FUVFJJQl9BUlJBWV9TSVpFPSAzNDMzOSA7IHRoaXMuVkVSVEVYX0FUVFJJQl9BUlJBWV9TVFJJREU9IDM0MzQwIDsgdGhpcy5WRVJURVhfQVRUUklCX0FSUkFZX1RZUEU9IDM0MzQxIDsgdGhpcy5WRVJURVhfU0hBREVSPSAzNTYzMyA7IHRoaXMuVklFV1BPUlQ9IDI5NzggOyB0aGlzLlpFUk8gPSAwIDtcblxuXG4gICAgdmFyIFNJWkVfT0ZfVkVSVEVYICAgID0gVmVjMy5TSVpFLFxuICAgICAgICBTSVpFX09GX0NPTE9SICAgICA9IENvbG9yLlNJWkUsXG4gICAgICAgIFNJWkVfT0ZfVEVYX0NPT1JEID0gVmVjMi5TSVpFO1xuXG4gICAgdGhpcy5TSVpFX09GX1ZFUlRFWCAgICA9IFNJWkVfT0ZfVkVSVEVYO1xuICAgIHRoaXMuU0laRV9PRl9OT1JNQUwgICAgPSBTSVpFX09GX1ZFUlRFWDtcbiAgICB0aGlzLlNJWkVfT0ZfQ09MT1IgICAgID0gU0laRV9PRl9DT0xPUjtcbiAgICB0aGlzLlNJWkVfT0ZfVEVYX0NPT1JEID0gIFNJWkVfT0ZfVEVYX0NPT1JEO1xuXG4gICAgdmFyIFNJWkVfT0ZfRkFDRSAgICA9IHRoaXMuU0laRV9PRl9GQUNFICAgPSBTSVpFX09GX1ZFUlRFWDtcblxuICAgIHZhciBTSVpFX09GX1FVQUQgICAgID0gdGhpcy5TSVpFX09GX1FVQUQgICAgID0gU0laRV9PRl9WRVJURVggKiA0LFxuICAgICAgICBTSVpFX09GX1RSSUFOR0xFID0gdGhpcy5TSVpFX09GX1RSSUFOR0xFID0gU0laRV9PRl9WRVJURVggKiAzLFxuICAgICAgICBTSVpFX09GX0xJTkUgICAgID0gdGhpcy5TSVpFX09GX0xJTkUgICAgID0gU0laRV9PRl9WRVJURVggKiAyLFxuICAgICAgICBTSVpFX09GX1BPSU5UICAgID0gdGhpcy5TSVpFX09GX1BPSU5UICAgID0gU0laRV9PRl9WRVJURVg7XG5cbiAgICB2YXIgRUxMSVBTRV9ERVRBSUxfTUFYID0gdGhpcy5FTExJUFNFX0RFVEFJTF9NQVggPSAzMDtcbiAgICB0aGlzLkVMTElQU0VfREVUQUlMX01JTiA9IDM7XG5cbiAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4gICAgLy8gSW5pdCBzaGFyZWQgYnVmZmVyc1xuICAgIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAgIHRoaXMuUkVQRUFUICAgICAgICA9IGdsLlJFUEVBVDtcbiAgICB0aGlzLkNMQU1QICAgICAgICAgPSBnbC5DTEFNUDtcbiAgICB0aGlzLkNMQU1QX1RPX0VER0UgPSBnbC5DTEFNUF9UT19FREdFO1xuXG4gICAgdGhpcy5fdGV4TW9kZSAgPSB0aGlzLlJFUEVBVDtcbiAgICB0aGlzLl90ZXhTZXQgICA9IGZhbHNlO1xuXG4gICAgdGhpcy5fdGV4RW1wdHkgPSBnbC5jcmVhdGVUZXh0dXJlKCk7XG4gICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCx0aGlzLl90ZXhFbXB0eSk7XG4gICAgZ2wudGV4SW1hZ2UyRCggZ2wuVEVYVFVSRV8yRCwgMCwgZ2wuUkdCQSwgMSwgMSwgMCwgZ2wuUkdCQSwgZ2wuVU5TSUdORURfQllURSwgbmV3IFVpbnQ4QXJyYXkoWzEsMSwxLDFdKSk7XG4gICAgZ2wudW5pZm9ybTFmKHRoaXMuX3VVc2VUZXh0dXJlLDAuMCk7XG5cbiAgICB0aGlzLl90ZXggICAgICA9IG51bGw7XG5cbiAgICB0aGlzLl9kZWZhdWx0VkJPID0gZ2wuY3JlYXRlQnVmZmVyKCk7XG4gICAgdGhpcy5fZGVmYXVsdElCTyA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xuXG4gICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsICAgICAgICAgdGhpcy5fZGVmYXVsdFZCTyk7XG4gICAgZ2wuYmluZEJ1ZmZlcihnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgdGhpcy5fZGVmYXVsdElCTyk7XG5cbiAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4gICAgLy8gSW5pdCBmbGFncyBhbmQgY2FjaGVzXG4gICAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4gICAgdGhpcy5fYlVzZUxpZ2h0aW5nICAgICAgICAgPSBmYWxzZTtcbiAgICB0aGlzLl9iVXNlTWF0ZXJpYWwgICAgICAgICA9IGZhbHNlO1xuICAgIHRoaXMuX2JVc2VUZXh0dXJlICAgICAgICAgID0gZmFsc2U7XG5cbiAgICB0aGlzLl9iVXNlQmlsbGJvYXJkaW5nICAgICA9IGZhbHNlO1xuXG4gICAgdGhpcy5fYlVzZURyYXdBcnJheUJhdGNoICAgICAgICA9IGZhbHNlO1xuICAgIHRoaXMuX2JVc2VEcmF3RWxlbWVudEFycmF5QmF0Y2ggPSBmYWxzZTtcbiAgICB0aGlzLl9kcmF3RnVuY0xhc3QgPSBudWxsO1xuXG4gICAgdGhpcy5fYkJhdGNoVmVydGljZXMgID0gW107XG4gICAgdGhpcy5fYkJhdGNoTm9ybWFscyAgID0gW107XG4gICAgdGhpcy5fYkJhdGNoQ29sb3JzICAgID0gW107XG4gICAgdGhpcy5fYkJhdGNoVGV4Q29vcmRzID0gW107XG4gICAgdGhpcy5fYkJhdGNoSW5kaWNlcyAgID0gW107XG5cbiAgICB0aGlzLl9iQmF0Y2hWZXJ0aWNlc051bSA9IDA7XG5cblxuXG4gICAgdGhpcy5fYkJWZWNSaWdodCA9IFZlYzMubWFrZSgpO1xuICAgIHRoaXMuX2JCVmVjVXAgICAgPSBWZWMzLm1ha2UoKTtcbiAgICB0aGlzLl9iQlZlcnRpY2VzID0gbmV3IEZsb2F0MzJBcnJheSg0ICogMyk7XG5cbiAgICB0aGlzLl9iQlZlYzAgPSBWZWMzLm1ha2UoKTtcbiAgICB0aGlzLl9iQlZlYzEgPSBWZWMzLm1ha2UoKTtcbiAgICB0aGlzLl9iQlZlYzIgPSBWZWMzLm1ha2UoKTtcbiAgICB0aGlzLl9iQlZlYzMgPSBWZWMzLm1ha2UoKTtcblxuICAgIHRoaXMuX3JlY3RXaWR0aExhc3QgICAgPSAwO1xuICAgIHRoaXMuX3JlY3RIZWlnaHRMYXN0ICAgPSAwO1xuXG5cbiAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4gICAgLy8gSW5pdCBNYXRyaWNlc1xuICAgIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAgIHRoaXMuX2NhbWVyYSAgICA9IG51bGw7XG5cbiAgICB0aGlzLl9tTW9kZVZpZXcgPSBNYXQ0NC5tYWtlKCk7XG4gICAgdGhpcy5fbU5vcm1hbCAgID0gTWF0MzMubWFrZSgpO1xuXG4gICAgdGhpcy5fbVRlbXAgPSBNYXQ0NC5tYWtlKCk7XG5cbiAgICB0aGlzLl9tU3RhY2sgPSBbXTtcblxuICAgIHRoaXMuX2RyYXdNb2RlID0gdGhpcy5MSU5FUztcblxuICAgIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbiAgICAvLyBJbml0IEJ1ZmZlcnNcbiAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgICB0aGlzLl9iRW1wdHkzZiA9IG5ldyBGbG9hdDMyQXJyYXkoWzAsMCwwXSk7XG5cbiAgICB0aGlzLl9iQ29sb3I0ZiAgID0gQ29sb3IuV0hJVEUoKTtcbiAgICB0aGlzLl9iQ29sb3JCZzRmID0gQ29sb3IuQkxBQ0soKTtcblxuICAgIHRoaXMuX2JWZXJ0ZXggICA9IG51bGw7XG4gICAgdGhpcy5fYk5vcm1hbCAgID0gbnVsbDtcbiAgICB0aGlzLl9iQ29sb3IgICAgPSBudWxsO1xuICAgIHRoaXMuX2JUZXhDb29yZCA9IG51bGw7XG4gICAgdGhpcy5fYkluZGV4ICAgID0gbnVsbDtcblxuICAgIHRoaXMuX2JWZXJ0ZXhQb2ludCA9IG5ldyBGbG9hdDMyQXJyYXkoU0laRV9PRl9QT0lOVCk7XG4gICAgdGhpcy5fYkNvbG9yUG9pbnQgID0gbmV3IEZsb2F0MzJBcnJheShTSVpFX09GX0NPTE9SKTtcblxuICAgIHRoaXMuX2JWZXJ0ZXhMaW5lICA9IG5ldyBGbG9hdDMyQXJyYXkoU0laRV9PRl9MSU5FKTtcbiAgICB0aGlzLl9iQ29sb3JMaW5lICAgPSBuZXcgRmxvYXQzMkFycmF5KDIgKiBTSVpFX09GX0NPTE9SKTtcblxuICAgIHRoaXMuX2JWZXJ0ZXhUcmlhbmdsZSAgICAgICAgICA9IG5ldyBGbG9hdDMyQXJyYXkoU0laRV9PRl9UUklBTkdMRSk7XG4gICAgdGhpcy5fYk5vcm1hbFRyaWFuZ2xlICAgICAgICAgID0gbmV3IEZsb2F0MzJBcnJheShTSVpFX09GX1RSSUFOR0xFKTtcbiAgICB0aGlzLl9iQ29sb3JUcmlhbmdsZSAgICAgICAgICAgPSBuZXcgRmxvYXQzMkFycmF5KDMgKiBTSVpFX09GX0NPTE9SKTtcbiAgICB0aGlzLl9iSW5kZXhUcmlhbmdsZSAgICAgICAgICAgPSBuZXcgVWludDE2QXJyYXkoWzAsMSwyXSk7XG4gICAgdGhpcy5fYlRleENvb3JkVHJpYW5nbGVEZWZhdWx0ID0gbmV3IEZsb2F0MzJBcnJheShbMC4wLDAuMCwxLjAsMC4wLDEuMCwxLjBdKTtcbiAgICB0aGlzLl9iVGV4Q29vcmRUcmlhbmdsZSAgICAgICAgPSBuZXcgRmxvYXQzMkFycmF5KHRoaXMuX2JUZXhDb29yZFRyaWFuZ2xlRGVmYXVsdC5sZW5ndGgpO1xuXG4gICAgdGhpcy5fYlZlcnRleFF1YWQgICAgICAgICAgPSBuZXcgRmxvYXQzMkFycmF5KFNJWkVfT0ZfUVVBRCk7XG4gICAgdGhpcy5fYk5vcm1hbFF1YWQgICAgICAgICAgPSBuZXcgRmxvYXQzMkFycmF5KFNJWkVfT0ZfUVVBRCk7XG4gICAgdGhpcy5fYkNvbG9yUXVhZCAgICAgICAgICAgPSBuZXcgRmxvYXQzMkFycmF5KDQgKiBTSVpFX09GX0NPTE9SKTtcbiAgICB0aGlzLl9iSW5kZXhRdWFkICAgICAgICAgICA9IG5ldyBVaW50MTZBcnJheShbMCwxLDIsMSwyLDNdKTtcbiAgICB0aGlzLl9iVGV4Q29vcmRRdWFkRGVmYXVsdCA9IG5ldyBGbG9hdDMyQXJyYXkoWzAuMCwwLjAsMS4wLDAuMCwxLjAsMS4wLDAuMCwxLjBdKTtcbiAgICB0aGlzLl9iVGV4Q29vcmRRdWFkICAgICAgICA9IG5ldyBGbG9hdDMyQXJyYXkodGhpcy5fYlRleENvb3JkUXVhZERlZmF1bHQubGVuZ3RoKTtcblxuICAgIHRoaXMuX2JWZXJ0ZXhSZWN0ID0gbmV3IEZsb2F0MzJBcnJheShTSVpFX09GX1FVQUQpO1xuICAgIHRoaXMuX2JOb3JtYWxSZWN0ID0gbmV3IEZsb2F0MzJBcnJheShbMCwxLDAsMCwxLDAsMCwxLDAsMCwxLDBdKTtcbiAgICB0aGlzLl9iQ29sb3JSZWN0ICA9IG5ldyBGbG9hdDMyQXJyYXkoNCAqIFNJWkVfT0ZfQ09MT1IpO1xuXG4gICAgdGhpcy5fYlZlcnRleEVsbGlwc2UgICA9IG5ldyBGbG9hdDMyQXJyYXkoU0laRV9PRl9WRVJURVggKiBFTExJUFNFX0RFVEFJTF9NQVgpO1xuICAgIHRoaXMuX2JOb3JtYWxFbGxpcHNlICAgPSBuZXcgRmxvYXQzMkFycmF5KHRoaXMuX2JWZXJ0ZXhFbGxpcHNlLmxlbmd0aCk7XG4gICAgdGhpcy5fYkNvbG9yRWxsaXBzZSAgICA9IG5ldyBGbG9hdDMyQXJyYXkoU0laRV9PRl9DT0xPUiAgKiBFTExJUFNFX0RFVEFJTF9NQVgpO1xuICAgIHRoaXMuX2JUZXhDb29yZEVsbGlwc2UgPSBuZXcgRmxvYXQzMkFycmF5KFNJWkVfT0ZfVEVYX0NPT1JEICogRUxMSVBTRV9ERVRBSUxfTUFYKTtcblxuICAgIHRoaXMuX2JWZXJ0ZXhDaXJjbGUgICA9IG5ldyBGbG9hdDMyQXJyYXkoU0laRV9PRl9WRVJURVggKiBFTExJUFNFX0RFVEFJTF9NQVgpO1xuICAgIHRoaXMuX2JOb3JtYWxDaXJjbGUgICA9IG5ldyBGbG9hdDMyQXJyYXkodGhpcy5fYlZlcnRleENpcmNsZS5sZW5ndGgpO1xuICAgIHRoaXMuX2JDb2xvckNpcmNsZSAgICA9IG5ldyBGbG9hdDMyQXJyYXkoU0laRV9PRl9DT0xPUiAqIEVMTElQU0VfREVUQUlMX01BWCk7XG4gICAgdGhpcy5fYlRleENvb3JkQ2lyY2xlID0gbmV3IEZsb2F0MzJBcnJheShTSVpFX09GX1RFWF9DT09SRCAqIEVMTElQU0VfREVUQUlMX01BWCk7XG5cbiAgICB0aGlzLl9iVmVydGV4Q3ViZSAgICAgICA9IG5ldyBGbG9hdDMyQXJyYXkoWy0wLjUsLTAuNSwgMC41LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgMC41LC0wLjUsIDAuNSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDAuNSwgMC41LCAwLjUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAtMC41LCAwLjUsIDAuNSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC0wLjUsLTAuNSwtMC41LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLTAuNSwgMC41LC0wLjUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDAuNSwgMC41LC0wLjUsIDAuNSwtMC41LC0wLjUsLTAuNSwgMC41LC0wLjUsLTAuNSwgMC41LCAwLjUsIDAuNSwgMC41LCAwLjUsIDAuNSwgMC41LC0wLjUsLTAuNSwtMC41LC0wLjUsIDAuNSwtMC41LC0wLjUsIDAuNSwtMC41LCAwLjUsLTAuNSwtMC41LCAwLjUsMC41LC0wLjUsLTAuNSwgMC41LCAwLjUsLTAuNSwgMC41LCAwLjUsIDAuNSwgMC41LC0wLjUsIDAuNSwtMC41LC0wLjUsLTAuNSwtMC41LC0wLjUsIDAuNSwtMC41LCAwLjUsIDAuNSwtMC41LCAwLjUsLTAuNV0pO1xuICAgIHRoaXMuX2JWZXJ0ZXhDdWJlU2NhbGVkID0gbmV3IEZsb2F0MzJBcnJheShuZXcgQXJyYXkodGhpcy5fYlZlcnRleEN1YmUubGVuZ3RoKSk7XG4gICAgdGhpcy5fYkNvbG9yQ3ViZSAgICA9IG5ldyBGbG9hdDMyQXJyYXkodGhpcy5fYlZlcnRleEN1YmUubGVuZ3RoIC8gU0laRV9PRl9WRVJURVggKiBTSVpFX09GX0NPTE9SKTtcbiAgICB0aGlzLl9iTm9ybWFsQ3ViZSAgID0gbmV3IEZsb2F0MzJBcnJheShbMCwgMCwgLTEsIDAsIDAsIC0xLCAwLCAwLCAtMSwgMCwgMCwgLTEsIDAsIDAsIDEsIDAsIDAsIDEsIDAsIDAsIDEsIDAsIDAsIDEsIDAsIC0xLCAwLCAwLCAtMSwgMCwgMCwgLTEsIDAsIDAsIC0xLCAwLCAwLCAxLCAwLCAwLCAxLCAwLCAwLCAxLCAwLCAwLCAxLCAwLCAtMSwgMCwgMCwgLTEsIDAsIDAsIC0xLCAwLCAwLCAtMSwgMCwgMCwgMSwgMCwgMCwgMSwgMCwgMCwgMSwgMCwgMCwgMSwgMCwgMF0gKTtcbiAgICB0aGlzLl9iSW5kZXhDdWJlICAgID0gbmV3IFVpbnQxNkFycmF5KFsgIDAsIDEsIDIsIDAsIDIsIDMsIDQsIDUsIDYsIDQsIDYsIDcsIDgsIDksMTAsIDgsMTAsMTEsIDEyLDEzLDE0LDEyLDE0LDE1LCAxNiwxNywxOCwxNiwxOCwxOSwgMjAsMjEsMjIsMjAsMjIsMjNdKTtcbiAgICB0aGlzLl9iVGV4Q29vcmRDdWJlID0gbnVsbDtcblxuICAgIHRoaXMuX2NpcmNsZURldGFpbExhc3QgPSAxMC4wO1xuICAgIHRoaXMuX3NwaGVyZURldGFpbExhc3QgPSAxMC4wO1xuICAgIHRoaXMuX3NwaGVyZVNjYWxlTGFzdCAgPSAtMTtcbiAgICB0aGlzLl9jdWJlU2NhbGVMYXN0ICAgID0gLTE7XG5cbiAgICB0aGlzLl9iVmVydGV4U3BoZXJlICAgICAgID0gbnVsbDtcbiAgICB0aGlzLl9iVmVydGV4U3BoZXJlU2NhbGVkID0gbnVsbDtcbiAgICB0aGlzLl9iTm9ybWFsU3BoZXJlICAgICAgID0gbnVsbDtcbiAgICB0aGlzLl9iQ29sb3JTcGhlcmUgICAgICAgID0gbnVsbDtcbiAgICB0aGlzLl9iSW5kZXhTcGhlcmUgICAgICAgID0gbnVsbDtcbiAgICB0aGlzLl9iVGV4Q29vcmRzU3BoZXJlICAgID0gbnVsbDtcblxuICAgIHRoaXMuX2JTY3JlZW5Db29yZHMgPSBbMCwwXTtcbiAgICB0aGlzLl9iUG9pbnQwICAgICAgID0gWzAsMCwwXTtcbiAgICB0aGlzLl9iUG9pbnQxICAgICAgID0gWzAsMCwwXTtcblxuICAgIHRoaXMuX2F4aXNYID0gVmVjMy5BWElTX1goKTtcbiAgICB0aGlzLl9heGlzWSA9IFZlYzMuQVhJU19ZKCk7XG4gICAgdGhpcy5fYXhpc1ogPSBWZWMzLkFYSVNfWigpO1xuXG4gICAgdGhpcy5fbGluZUJveFdpZHRoICA9IDE7XG4gICAgdGhpcy5fbGluZUJveEhlaWdodCA9IDE7XG4gICAgdGhpcy5fbGluZUN5bGluZGVyUmFkaXVzID0gMC41O1xuXG4gICAgdGhpcy5fZ2VuU3BoZXJlKCk7XG4gICAgdGhpcy5fZ2VuQ2lyY2xlKCk7XG5cbiAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4gICAgLy8gSW5pdCBwcmVzZXRzXG4gICAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4gICAgZ2wuZW5hYmxlKGdsLkJMRU5EKTtcbiAgICBnbC5lbmFibGUoZ2wuREVQVEhfVEVTVCk7XG5cbiAgICB0aGlzLmFtYmllbnQoQ29sb3IuQkxBQ0soKSk7XG5cbn1cblxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuLy8gTGlnaHRcbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuRkdMLnByb3RvdHlwZS51c2VMaWdodGluZyAgPSBmdW5jdGlvbihib29sKXt0aGlzLmdsLnVuaWZvcm0xZih0aGlzLl91VXNlTGlnaHRpbmcsYm9vbCA/IDEuMCA6IDAuMCk7dGhpcy5fYlVzZUxpZ2h0aW5nID0gYm9vbDt9O1xuRkdMLnByb3RvdHlwZS5nZXRMaWdodGluZyAgPSBmdW5jdGlvbigpICAgIHtyZXR1cm4gdGhpcy5fYlVzZUxpZ2h0aW5nO307XG5cbkZHTC5wcm90b3R5cGUubGlnaHQgPSBmdW5jdGlvbihsaWdodClcbntcbiAgICB2YXIgaWQgPSBsaWdodC5nZXRJZCgpLFxuICAgICAgICBnbCA9IHRoaXMuZ2w7XG5cbiAgICB2YXIgdGVtcFZlYzQgICAgPSB0aGlzLl90ZW1wTGlnaHRQb3M7XG4gICAgICAgIHRlbXBWZWM0WzBdID0gbGlnaHQucG9zaXRpb25bMF07XG4gICAgICAgIHRlbXBWZWM0WzFdID0gbGlnaHQucG9zaXRpb25bMV07XG4gICAgICAgIHRlbXBWZWM0WzJdID0gbGlnaHQucG9zaXRpb25bMl07XG4gICAgICAgIHRlbXBWZWM0WzNdID0gbGlnaHQucG9zaXRpb25bM107XG5cbiAgICB2YXIgbGlnaHRQb3NFeWVTcGFjZSA9IE1hdDQ0Lm11bHRWZWM0KHRoaXMuX2NhbWVyYS5tb2RlbFZpZXdNYXRyaXgsdGVtcFZlYzQpO1xuXG4gICAgZ2wudW5pZm9ybTRmdih0aGlzLl91TGlnaHRQb3NpdGlvbltpZF0sIGxpZ2h0UG9zRXllU3BhY2UpO1xuICAgIGdsLnVuaWZvcm0zZnYodGhpcy5fdUxpZ2h0QW1iaWVudFtpZF0sICBsaWdodC5hbWJpZW50KTtcbiAgICBnbC51bmlmb3JtM2Z2KHRoaXMuX3VMaWdodERpZmZ1c2VbaWRdLCAgbGlnaHQuZGlmZnVzZSk7XG4gICAgZ2wudW5pZm9ybTNmdih0aGlzLl91TGlnaHRTcGVjdWxhcltpZF0sIGxpZ2h0LnNwZWN1bGFyKTtcblxuICAgIGdsLnVuaWZvcm0xZih0aGlzLl91TGlnaHRBdHRlbnVhdGlvbkNvbnN0YW50W2lkXSwgICBsaWdodC5jb25zdGFudEF0dGVudHVhdGlvbik7XG4gICAgZ2wudW5pZm9ybTFmKHRoaXMuX3VMaWdodEF0dGVudWF0aW9uTGluZWFyW2lkXSwgICAgIGxpZ2h0LmxpbmVhckF0dGVudHVhdGlvbik7XG4gICAgZ2wudW5pZm9ybTFmKHRoaXMuX3VMaWdodEF0dGVudWF0aW9uUXVhZHJhdGljW2lkXSwgIGxpZ2h0LnF1YWRyaWNBdHRlbnR1YXRpb24pO1xufTtcblxuLy9GSVggTUVcbkZHTC5wcm90b3R5cGUuZGlzYWJsZUxpZ2h0ID0gZnVuY3Rpb24obGlnaHQpXG57XG4gICAgdmFyIGlkID0gbGlnaHQuZ2V0SWQoKSxcbiAgICAgICAgZ2wgPSB0aGlzLmdsO1xuXG4gICAgdmFyIGJFbXB0eSA9IHRoaXMuX2JFbXB0eTNmO1xuXG4gICAgZ2wudW5pZm9ybTNmdih0aGlzLl91TGlnaHRBbWJpZW50W2lkXSwgIGJFbXB0eSk7XG4gICAgZ2wudW5pZm9ybTNmdih0aGlzLl91TGlnaHREaWZmdXNlW2lkXSwgIGJFbXB0eSk7XG4gICAgZ2wudW5pZm9ybTNmdih0aGlzLl91TGlnaHRTcGVjdWxhcltpZF0sIGJFbXB0eSk7XG5cbiAgICBnbC51bmlmb3JtMWYodGhpcy5fdUxpZ2h0QXR0ZW51YXRpb25Db25zdGFudFtpZF0sIDEuMCk7XG4gICAgZ2wudW5pZm9ybTFmKHRoaXMuX3VMaWdodEF0dGVudWF0aW9uTGluZWFyW2lkXSwgICAwLjApO1xuICAgIGdsLnVuaWZvcm0xZih0aGlzLl91TGlnaHRBdHRlbnVhdGlvblF1YWRyYXRpY1tpZF0sMC4wKTtcbn07XG5cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbi8vIFRleHR1cmVcbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuLy9UT0RPOiBkbyBpdCB0aGUgcGxhc2sgd2F5XG5cbkZHTC5wcm90b3R5cGUudXNlVGV4dHVyZSAgPSBmdW5jdGlvbihib29sKXt0aGlzLmdsLnVuaWZvcm0xZih0aGlzLl91VXNlVGV4dHVyZSwgYm9vbCA/IDEuMCA6IDAuMCk7dGhpcy5fYlVzZVRleHR1cmUgPSBib29sO307XG5cbkZHTC5wcm90b3R5cGUubG9hZFRleHR1cmVXaXRoSW1hZ2UgPSBmdW5jdGlvbihpbWcpXG57XG4gICAgdmFyIGdsID0gdGhpcy5nbCxcbiAgICAgICAgZ2xUZXggPSBnbC5jcmVhdGVUZXh0dXJlKCk7XG4gICAgZ2xUZXguaW1hZ2UgPSBpbWc7XG5cbiAgICB2YXIgdGV4ID0gbmV3IFRleHR1cmUoZ2xUZXgpO1xuICAgIHRoaXMuX2JpbmRUZXhJbWFnZSh0ZXguX3RleCk7XG5cbiAgICByZXR1cm4gdGV4O1xuXG59O1xuXG5GR0wucHJvdG90eXBlLmxvYWRUZXh0dXJlID0gZnVuY3Rpb24oc3JjLHRleHR1cmUsY2FsbGJhY2spXG57XG4gICAgdmFyIGdsICA9IHRoaXMuZ2wsXG4gICAgICAgIGdsVGV4ID0gZ2wuY3JlYXRlVGV4dHVyZSgpO1xuICAgIGdsVGV4LmltYWdlID0gbmV3IEltYWdlKCk7XG5cbiAgICBnbFRleC5pbWFnZS5hZGRFdmVudExpc3RlbmVyKCdsb2FkJyxmdW5jdGlvbigpXG4gICAge1xuICAgICAgICB0ZXh0dXJlLnNldFRleFNvdXJjZSh0aGlzLl9iaW5kVGV4SW1hZ2UoZ2xUZXgpKTtcbiAgICAgICAgY2FsbGJhY2soKTtcbiAgICB9KTtcblxuICAgIGdsVGV4LmltYWdlLnNyYyA9IHNyYztcbn07XG5cbkZHTC5wcm90b3R5cGUuX2JpbmRUZXhJbWFnZSA9IGZ1bmN0aW9uKGdsVGV4KVxue1xuICAgIGlmKCFnbFRleC5pbWFnZSl0aHJvdyAoJ1RleHR1cmUgaW1hZ2UgaXMgbnVsbC4nKTtcblxuICAgIHZhciB3aWR0aCAgPSBnbFRleC5pbWFnZS53aWR0aCxcbiAgICAgICAgaGVpZ2h0ID0gZ2xUZXguaW1hZ2UuaGVpZ2h0O1xuXG4gICAgaWYoKHdpZHRoJih3aWR0aC0xKSE9MCkpICAgICAgIHt0aHJvdyAnVGV4dHVyZSBpbWFnZSB3aWR0aCBpcyBub3QgcG93ZXIgb2YgMi4nOyB9XG4gICAgZWxzZSBpZigoaGVpZ2h0JihoZWlnaHQtMSkpIT0wKXt0aHJvdyAnVGV4dHVyZSBpbWFnZSBoZWlnaHQgaXMgbm90IHBvd2VyIG9mIDIuJzt9XG5cbiAgICB2YXIgZ2wgPSB0aGlzLmdsO1xuXG4gICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCxnbFRleCk7XG4gICAgZ2wudGV4SW1hZ2UyRChnbC5URVhUVVJFXzJELCAwLCBnbC5SR0JBLCBnbC5SR0JBLCBnbC5VTlNJR05FRF9CWVRFLCBnbFRleC5pbWFnZSk7XG4gICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX1dSQVBfUywgZ2wuQ0xBTVBfVE9fRURHRSk7XG4gICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX1dSQVBfVCwgZ2wuQ0xBTVBfVE9fRURHRSk7XG4gICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01BR19GSUxURVIsIGdsLkxJTkVBUik7XG4gICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01JTl9GSUxURVIsIGdsLkxJTkVBUik7XG4gICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCxudWxsKTtcblxuXG4gICAgcmV0dXJuIGdsVGV4O1xufTtcblxuRkdMLnByb3RvdHlwZS50ZXh0dXJlID0gZnVuY3Rpb24odGV4dHVyZSlcbntcbiAgICB2YXIgZ2wgPSB0aGlzLmdsO1xuXG4gICAgdGhpcy5fdGV4ID0gdGV4dHVyZS5fdGV4O1xuICAgIGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsdGhpcy5fdGV4KTtcbiAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfV1JBUF9TLCB0aGlzLl90ZXhNb2RlICk7XG4gICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX1dSQVBfVCwgdGhpcy5fdGV4TW9kZSApO1xuICAgIGdsLnVuaWZvcm0xaSh0aGlzLl91VGV4SW1hZ2UsMCk7XG59O1xuXG5GR0wucHJvdG90eXBlLmRpc2FibGVUZXh0dXJlcyA9IGZ1bmN0aW9uKClcbntcbiAgICB2YXIgZ2wgPSB0aGlzLmdsO1xuICAgIGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsdGhpcy5fdGV4RW1wdHkpO1xuICAgIGdsLnZlcnRleEF0dHJpYlBvaW50ZXIodGhpcy5fYVZlcnRleFRleENvb3JkLFZlYzIuU0laRSxnbC5GTE9BVCxmYWxzZSwwLDApO1xuICAgIGdsLnVuaWZvcm0xZih0aGlzLl91VXNlVGV4dHVyZSwwLjApO1xufTtcblxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuLy8gTWF0ZXJpYWxcbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuRkdMLnByb3RvdHlwZS51c2VNYXRlcmlhbCA9IGZ1bmN0aW9uKGJvb2wpe3RoaXMuZ2wudW5pZm9ybTFmKHRoaXMuX3VVc2VNYXRlcmlhbCxib29sID8gMS4wIDogMC4wKTt0aGlzLl9iVXNlTWF0ZXJpYWwgPSBib29sO307XG5cbkZHTC5wcm90b3R5cGUubWF0ZXJpYWwgPSBmdW5jdGlvbihtYXRlcmlhbClcbntcbiAgICB2YXIgZ2wgPSB0aGlzLmdsO1xuXG4gICAgLy9nbC51bmlmb3JtNGZ2KHRoaXMuX3VNYXRlcmlhbEVtaXNzaW9uLCAgbWF0ZXJpYWwuZW1pc3Npb24pO1xuICAgIGdsLnVuaWZvcm00ZnYodGhpcy5fdU1hdGVyaWFsQW1iaWVudCwgICBtYXRlcmlhbC5hbWJpZW50KTtcbiAgICBnbC51bmlmb3JtNGZ2KHRoaXMuX3VNYXRlcmlhbERpZmZ1c2UsICAgbWF0ZXJpYWwuZGlmZnVzZSk7XG4gICAgZ2wudW5pZm9ybTRmdih0aGlzLl91TWF0ZXJpYWxTcGVjdWxhciwgIG1hdGVyaWFsLnNwZWN1bGFyKTtcbiAgICBnbC51bmlmb3JtMWYoIHRoaXMuX3VNYXRlcmlhbFNoaW5pbmVzcywgbWF0ZXJpYWwuc2hpbmluZXNzKTtcbn07XG5cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbi8vIENhbWVyYVxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG5GR0wucHJvdG90eXBlLnNldENhbWVyYSA9IGZ1bmN0aW9uKGNhbWVyYSl7dGhpcy5fY2FtZXJhID0gY2FtZXJhO307XG5cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbi8vIE1hdHJpeCBzdGFja1xuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG5GR0wucHJvdG90eXBlLmxvYWRJZGVudGl0eSA9IGZ1bmN0aW9uKCl7dGhpcy5fbU1vZGVsVmlldyA9IE1hdDQ0LmlkZW50aXR5KHRoaXMuX2NhbWVyYS5tb2RlbFZpZXdNYXRyaXgpO307XG5GR0wucHJvdG90eXBlLnB1c2hNYXRyaXggICA9IGZ1bmN0aW9uKCl7dGhpcy5fbVN0YWNrLnB1c2goTWF0NDQuY29weSh0aGlzLl9tTW9kZWxWaWV3KSk7fTtcbkZHTC5wcm90b3R5cGUucG9wTWF0cml4ICAgID0gZnVuY3Rpb24oKVxue1xuICAgIHZhciBzdGFjayA9IHRoaXMuX21TdGFjaztcblxuICAgIGlmKHN0YWNrLmxlbmd0aCA9PSAwKXRocm93ICgnSW52YWxpZCBwb3AhJyk7XG4gICAgdGhpcy5fbU1vZGVsVmlldyA9IHN0YWNrLnBvcCgpO1xuXG4gICAgcmV0dXJuIHRoaXMuX21Nb2RlbFZpZXc7XG59O1xuXG5GR0wucHJvdG90eXBlLnNldE1hdHJpY2VzVW5pZm9ybSA9IGZ1bmN0aW9uKClcbntcbiAgICB2YXIgZ2wgPSB0aGlzLmdsO1xuXG4gICAgZ2wudW5pZm9ybU1hdHJpeDRmdih0aGlzLl91TW9kZWxWaWV3TWF0cml4LGZhbHNlLHRoaXMuX21Nb2RlbFZpZXcpO1xuICAgIGdsLnVuaWZvcm1NYXRyaXg0ZnYodGhpcy5fdVByb2plY3Rpb25NYXRyaXgsZmFsc2UsdGhpcy5fY2FtZXJhLnByb2plY3Rpb25NYXRyaXgpO1xuXG4gICAgaWYoIXRoaXMuX2JVc2VMaWdodGluZylyZXR1cm47XG5cbiAgICBNYXQ0NC50b01hdDMzSW52ZXJzZWQodGhpcy5fbU1vZGVsVmlldyx0aGlzLl9tTm9ybWFsKTtcbiAgICBNYXQzMy50cmFuc3Bvc2UodGhpcy5fbU5vcm1hbCx0aGlzLl9tTm9ybWFsKTtcblxuICAgIGdsLnVuaWZvcm1NYXRyaXgzZnYodGhpcy5fdU5vcm1hbE1hdHJpeCxmYWxzZSx0aGlzLl9tTm9ybWFsKTtcbn07XG5cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbi8vIE1hdHJpeCBzdGFjayB0cmFuc2Zvcm1hdGlvbnNcbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuRkdMLnByb3RvdHlwZS50cmFuc2xhdGUgICAgID0gZnVuY3Rpb24odikgICAgICAgICAge01hdDQ0Lm11bHRQb3N0KHRoaXMuX21Nb2RlbFZpZXcsTWF0NDQubWFrZVRyYW5zbGF0ZSh2WzBdLHZbMV0sdlsyXSxNYXQ0NC5pZGVudGl0eSh0aGlzLl9tVGVtcCkpLHRoaXMuX21Nb2RlbFZpZXcpO307XG5GR0wucHJvdG90eXBlLnRyYW5zbGF0ZTNmICAgPSBmdW5jdGlvbih4LHkseikgICAgICB7TWF0NDQubXVsdFBvc3QodGhpcy5fbU1vZGVsVmlldyxNYXQ0NC5tYWtlVHJhbnNsYXRlKHgseSx6LE1hdDQ0LmlkZW50aXR5KHRoaXMuX21UZW1wKSksdGhpcy5fbU1vZGVsVmlldyk7fTtcbkZHTC5wcm90b3R5cGUudHJhbnNsYXRlWCAgICA9IGZ1bmN0aW9uKHgpICAgICAgICAgIHtNYXQ0NC5tdWx0UG9zdCh0aGlzLl9tTW9kZWxWaWV3LE1hdDQ0Lm1ha2VUcmFuc2xhdGUoeCwwLDAsTWF0NDQuaWRlbnRpdHkodGhpcy5fbVRlbXApKSx0aGlzLl9tTW9kZWxWaWV3KTt9O1xuRkdMLnByb3RvdHlwZS50cmFuc2xhdGVZICAgID0gZnVuY3Rpb24oeSkgICAgICAgICAge01hdDQ0Lm11bHRQb3N0KHRoaXMuX21Nb2RlbFZpZXcsTWF0NDQubWFrZVRyYW5zbGF0ZSgwLHksMCxNYXQ0NC5pZGVudGl0eSh0aGlzLl9tVGVtcCkpLHRoaXMuX21Nb2RlbFZpZXcpO307XG5GR0wucHJvdG90eXBlLnRyYW5zbGF0ZVogICAgPSBmdW5jdGlvbih6KSAgICAgICAgICB7TWF0NDQubXVsdFBvc3QodGhpcy5fbU1vZGVsVmlldyxNYXQ0NC5tYWtlVHJhbnNsYXRlKDAsMCx6LE1hdDQ0LmlkZW50aXR5KHRoaXMuX21UZW1wKSksdGhpcy5fbU1vZGVsVmlldyk7fTtcbkZHTC5wcm90b3R5cGUuc2NhbGUgICAgICAgICA9IGZ1bmN0aW9uKHYpICAgICAgICAgIHtNYXQ0NC5tdWx0UG9zdCh0aGlzLl9tTW9kZWxWaWV3LE1hdDQ0Lm1ha2VTY2FsZSh2WzBdLHZbMV0sdlsyXSxNYXQ0NC5pZGVudGl0eSh0aGlzLl9tVGVtcCkpLHRoaXMuX21Nb2RlbFZpZXcpO307XG5GR0wucHJvdG90eXBlLnNjYWxlMWYgICAgICAgPSBmdW5jdGlvbihuKSAgICAgICAgICB7TWF0NDQubXVsdFBvc3QodGhpcy5fbU1vZGVsVmlldyxNYXQ0NC5tYWtlU2NhbGUobixuLG4sTWF0NDQuaWRlbnRpdHkodGhpcy5fbVRlbXApKSx0aGlzLl9tTW9kZWxWaWV3KTt9O1xuRkdMLnByb3RvdHlwZS5zY2FsZTNmICAgICAgID0gZnVuY3Rpb24oeCx5LHopICAgICAge01hdDQ0Lm11bHRQb3N0KHRoaXMuX21Nb2RlbFZpZXcsTWF0NDQubWFrZVNjYWxlKHgseSx6LE1hdDQ0LmlkZW50aXR5KHRoaXMuX21UZW1wKSksdGhpcy5fbU1vZGVsVmlldyk7fTtcbkZHTC5wcm90b3R5cGUuc2NhbGVYICAgICAgICA9IGZ1bmN0aW9uKHgpICAgICAgICAgIHtNYXQ0NC5tdWx0UG9zdCh0aGlzLl9tTW9kZWxWaWV3LE1hdDQ0Lm1ha2VTY2FsZSh4LDEsMSxNYXQ0NC5pZGVudGl0eSh0aGlzLl9tVGVtcCkpLHRoaXMuX21Nb2RlbFZpZXcpO307XG5GR0wucHJvdG90eXBlLnNjYWxlWSAgICAgICAgPSBmdW5jdGlvbih5KSAgICAgICAgICB7TWF0NDQubXVsdFBvc3QodGhpcy5fbU1vZGVsVmlldyxNYXQ0NC5tYWtlU2NhbGUoMSx5LDEsTWF0NDQuaWRlbnRpdHkodGhpcy5fbVRlbXApKSx0aGlzLl9tTW9kZWxWaWV3KTt9O1xuRkdMLnByb3RvdHlwZS5zY2FsZVogICAgICAgID0gZnVuY3Rpb24oeikgICAgICAgICAge01hdDQ0Lm11bHRQb3N0KHRoaXMuX21Nb2RlbFZpZXcsTWF0NDQubWFrZVNjYWxlKDEsMSx6LE1hdDQ0LmlkZW50aXR5KHRoaXMuX21UZW1wKSksdGhpcy5fbU1vZGVsVmlldyk7fTtcbkZHTC5wcm90b3R5cGUucm90YXRlICAgICAgICA9IGZ1bmN0aW9uKHYpICAgICAgICAgIHtNYXQ0NC5tdWx0UG9zdCh0aGlzLl9tTW9kZWxWaWV3LE1hdDQ0Lm1ha2VSb3RhdGlvblhZWih2WzBdLHZbMV0sdlsyXSxNYXQ0NC5pZGVudGl0eSh0aGlzLl9tVGVtcCkpLHRoaXMuX21Nb2RlbFZpZXcpO307XG5GR0wucHJvdG90eXBlLnJvdGF0ZTNmICAgICAgPSBmdW5jdGlvbih4LHkseikgICAgICB7TWF0NDQubXVsdFBvc3QodGhpcy5fbU1vZGVsVmlldyxNYXQ0NC5tYWtlUm90YXRpb25YWVooeCx5LHosTWF0NDQuaWRlbnRpdHkodGhpcy5fbVRlbXApKSx0aGlzLl9tTW9kZWxWaWV3KTt9O1xuRkdMLnByb3RvdHlwZS5yb3RhdGVYICAgICAgID0gZnVuY3Rpb24oeCkgICAgICAgICAge01hdDQ0Lm11bHRQb3N0KHRoaXMuX21Nb2RlbFZpZXcsTWF0NDQubWFrZVJvdGF0aW9uWCh4LE1hdDQ0LmlkZW50aXR5KHRoaXMuX21UZW1wKSksdGhpcy5fbU1vZGVsVmlldyk7fTtcbkZHTC5wcm90b3R5cGUucm90YXRlWSAgICAgICA9IGZ1bmN0aW9uKHkpICAgICAgICAgIHtNYXQ0NC5tdWx0UG9zdCh0aGlzLl9tTW9kZWxWaWV3LE1hdDQ0Lm1ha2VSb3RhdGlvblkoeSxNYXQ0NC5pZGVudGl0eSh0aGlzLl9tVGVtcCkpLHRoaXMuX21Nb2RlbFZpZXcpO307XG5GR0wucHJvdG90eXBlLnJvdGF0ZVogICAgICAgPSBmdW5jdGlvbih6KSAgICAgICAgICB7TWF0NDQubXVsdFBvc3QodGhpcy5fbU1vZGVsVmlldyxNYXQ0NC5tYWtlUm90YXRpb25aKHosTWF0NDQuaWRlbnRpdHkodGhpcy5fbVRlbXApKSx0aGlzLl9tTW9kZWxWaWV3KTt9O1xuRkdMLnByb3RvdHlwZS5yb3RhdGVBeGlzICAgID0gZnVuY3Rpb24oYW5nbGUsdikgICAge01hdDQ0Lm11bHRQb3N0KHRoaXMuX21Nb2RlbFZpZXcsTWF0NDQubWFrZVJvdGF0aW9uT25BeGlzKGFuZ2xlLHZbMF0sdlsxXSx2WzJdKSx0aGlzLl9tTW9kZWxWaWV3KTt9O1xuRkdMLnByb3RvdHlwZS5yb3RhdGVBeGlzM2YgID0gZnVuY3Rpb24oYW5nbGUseCx5LHope01hdDQ0Lm11bHRQb3N0KHRoaXMuX21Nb2RlbFZpZXcsTWF0NDQubWFrZVJvdGF0aW9uT25BeGlzKGFuZ2xlLHgseSx6KSx0aGlzLl9tTW9kZWxWaWV3KTt9O1xuXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4vLyBjb252ZW5pZW5jZSBkcmF3XG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cblxuRkdMLnByb3RvdHlwZS5kcmF3RWxlbWVudHMgPSBmdW5jdGlvbih2ZXJ0ZXhGbG9hdDMyQXJyYXksbm9ybWFsRmxvYXQzMkFycmF5LGNvbG9yRmxvYXQzMkFycmF5LHV2RmxvYXQzMkFycmF5LGluZGV4QXJyYXksbW9kZSxjb3VudCxvZmZzZXQsdHlwZSxkcmF3VHlwZSlcbntcbiAgICB2YXIgZ2wgPSB0aGlzLmdsO1xuXG4gICAgdGhpcy5idWZmZXJBcnJheXModmVydGV4RmxvYXQzMkFycmF5LG5vcm1hbEZsb2F0MzJBcnJheSxjb2xvckZsb2F0MzJBcnJheSx1dkZsb2F0MzJBcnJheSk7XG4gICAgdGhpcy5zZXRNYXRyaWNlc1VuaWZvcm0oKTtcbiAgICBnbC5idWZmZXJEYXRhKGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLGluZGV4QXJyYXksZHJhd1R5cGUgfHwgZ2wuRFlOQU1JQ19EUkFXKTtcbiAgICBnbC5kcmF3RWxlbWVudHMobW9kZSAgfHwgdGhpcy5UUklBTkdMRVMsXG4gICAgICAgICAgICAgICAgICAgIGNvdW50IHx8IGluZGV4QXJyYXkubGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICB0eXBlICB8fCBnbC5VTlNJR05FRF9TSE9SVCxcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0IHx8IDApO1xufTtcblxuXG5GR0wucHJvdG90eXBlLmRyYXdBcnJheXMgPSBmdW5jdGlvbih2ZXJ0ZXhGbG9hdDMyQXJyYXksbm9ybWFsRmxvYXQzMkFycmF5LGNvbG9yRmxvYXQzMkFycmF5LHV2RmxvYXQzMkFycmF5LG1vZGUsZmlyc3QsY291bnQpXG57XG5cbiAgICB0aGlzLmJ1ZmZlckFycmF5cyh2ZXJ0ZXhGbG9hdDMyQXJyYXksbm9ybWFsRmxvYXQzMkFycmF5LGNvbG9yRmxvYXQzMkFycmF5LHV2RmxvYXQzMkFycmF5KTtcbiAgICB0aGlzLnNldE1hdHJpY2VzVW5pZm9ybSgpO1xuICAgIHRoaXMuZ2wuZHJhd0FycmF5cyhtb2RlICB8fCB0aGlzLl9kcmF3TW9kZSxcbiAgICAgICAgICAgICAgICAgICAgICAgZmlyc3QgfHwgMCxcbiAgICAgICAgICAgICAgICAgICAgICAgY291bnQgfHwgdmVydGV4RmxvYXQzMkFycmF5Lmxlbmd0aCAvIHRoaXMuU0laRV9PRl9WRVJURVgpO1xufTtcblxuRkdMLnByb3RvdHlwZS5kcmF3R2VvbWV0cnkgPSBmdW5jdGlvbihnZW9tLGNvdW50LG9mZnNldCkge2dlb20uX2RyYXcodGhpcyxjb3VudCxvZmZzZXQpO307XG5cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbi8vIGNvbnZlbmllbmNlIGZpbGxpbmcgZGVmYXVsdCB2Ym9cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuRkdMLnByb3RvdHlwZS5idWZmZXJBcnJheXMgPSBmdW5jdGlvbih2ZXJ0ZXhGbG9hdDMyQXJyYXksbm9ybWFsRmxvYXQzMkFycmF5LGNvbG9yRmxvYXQzMkFycmF5LHRleENvb3JkRmxvYXQzMkFycmF5LGdsRHJhd01vZGUpXG57XG4gICAgdmFyIG5hID0gbm9ybWFsRmxvYXQzMkFycmF5ICAgPyB0cnVlIDogZmFsc2UsXG4gICAgICAgIGNhID0gY29sb3JGbG9hdDMyQXJyYXkgICAgPyB0cnVlIDogZmFsc2UsXG4gICAgICAgIHRhID0gdGV4Q29vcmRGbG9hdDMyQXJyYXkgPyB0cnVlIDogZmFsc2U7XG5cbiAgICB2YXIgYVZlcnRleE5vcm1hbCAgID0gdGhpcy5fYVZlcnRleE5vcm1hbCxcbiAgICAgICAgYVZlcnRleENvbG9yICAgID0gdGhpcy5fYVZlcnRleENvbG9yLFxuICAgICAgICBhVmVydGV4VGV4Q29vcmQgPSB0aGlzLl9hVmVydGV4VGV4Q29vcmQ7XG5cbiAgICB2YXIgZ2wgICAgICAgICAgICA9IHRoaXMuZ2wsXG4gICAgICAgIGdsQXJyYXlCdWZmZXIgPSBnbC5BUlJBWV9CVUZGRVIsXG4gICAgICAgIGdsRmxvYXQgICAgICAgPSBnbC5GTE9BVDtcblxuICAgIGdsRHJhd01vZGUgPSBnbERyYXdNb2RlIHx8IGdsLkRZTkFNSUNfRFJBVztcblxuICAgIHZhciB2YmxlbiA9ICAgICAgdmVydGV4RmxvYXQzMkFycmF5LmJ5dGVMZW5ndGgsXG4gICAgICAgIG5ibGVuID0gbmEgPyBub3JtYWxGbG9hdDMyQXJyYXkuYnl0ZUxlbmd0aCA6IDAsXG4gICAgICAgIGNibGVuID0gY2EgPyBjb2xvckZsb2F0MzJBcnJheS5ieXRlTGVuZ3RoICAgOiAwLFxuICAgICAgICB0YmxlbiA9IHRhID8gdGV4Q29vcmRGbG9hdDMyQXJyYXkuYnl0ZUxlbmd0aCA6IDA7XG5cbiAgICB2YXIgb2Zmc2V0ViA9IDAsXG4gICAgICAgIG9mZnNldE4gPSBvZmZzZXRWICsgdmJsZW4sXG4gICAgICAgIG9mZnNldEMgPSBvZmZzZXROICsgbmJsZW4sXG4gICAgICAgIG9mZnNldFQgPSBvZmZzZXRDICsgY2JsZW47XG5cbiAgICBnbC5idWZmZXJEYXRhKGdsQXJyYXlCdWZmZXIsIHZibGVuICsgbmJsZW4gKyBjYmxlbiArIHRibGVuLCBnbERyYXdNb2RlKTtcblxuICAgIGdsLmJ1ZmZlclN1YkRhdGEoZ2xBcnJheUJ1ZmZlciwgb2Zmc2V0ViwgdmVydGV4RmxvYXQzMkFycmF5KTtcbiAgICBnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKHRoaXMuX2FWZXJ0ZXhQb3NpdGlvbiwgdGhpcy5TSVpFX09GX1ZFUlRFWCwgZ2xGbG9hdCwgZmFsc2UsIDAsIG9mZnNldFYpO1xuXG4gICAgaWYoIW5hKXsgZ2wuZGlzYWJsZVZlcnRleEF0dHJpYkFycmF5KGFWZXJ0ZXhOb3JtYWwpO31cbiAgICBlbHNlXG4gICAge1xuICAgICAgICBnbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheShhVmVydGV4Tm9ybWFsKTtcbiAgICAgICAgZ2wuYnVmZmVyU3ViRGF0YShnbEFycmF5QnVmZmVyLG9mZnNldE4sbm9ybWFsRmxvYXQzMkFycmF5KTtcbiAgICAgICAgZ2wudmVydGV4QXR0cmliUG9pbnRlcihhVmVydGV4Tm9ybWFsLHRoaXMuU0laRV9PRl9OT1JNQUwsZ2xGbG9hdCxmYWxzZSwwLG9mZnNldE4pO1xuICAgIH1cblxuICAgIGlmKCFjYSl7IGdsLmRpc2FibGVWZXJ0ZXhBdHRyaWJBcnJheShhVmVydGV4Q29sb3IpOyB9XG4gICAge1xuICAgICAgICBnbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheShhVmVydGV4Q29sb3IpO1xuICAgICAgICBnbC5idWZmZXJTdWJEYXRhKGdsQXJyYXlCdWZmZXIsIG9mZnNldEMsIGNvbG9yRmxvYXQzMkFycmF5KTtcbiAgICAgICAgZ2wudmVydGV4QXR0cmliUG9pbnRlcihhVmVydGV4Q29sb3IsIHRoaXMuU0laRV9PRl9DT0xPUiwgIGdsRmxvYXQsIGZhbHNlLCAwLCBvZmZzZXRDKTtcbiAgICB9XG5cbiAgICBpZighdGEpeyBnbC5kaXNhYmxlVmVydGV4QXR0cmliQXJyYXkoYVZlcnRleFRleENvb3JkKTt9XG4gICAgZWxzZVxuICAgIHtcbiAgICAgICAgZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkoYVZlcnRleFRleENvb3JkKTtcbiAgICAgICAgZ2wuYnVmZmVyU3ViRGF0YShnbEFycmF5QnVmZmVyLG9mZnNldFQsdGV4Q29vcmRGbG9hdDMyQXJyYXkpO1xuICAgICAgICBnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKGFWZXJ0ZXhUZXhDb29yZCx0aGlzLlNJWkVfT0ZfVEVYX0NPT1JELGdsRmxvYXQsZmFsc2UsMCxvZmZzZXRUKTtcbiAgICB9XG59O1xuXG5cbkZHTC5wcm90b3R5cGUuYnVmZmVyQ29sb3JzID0gZnVuY3Rpb24oY29sb3IsYnVmZmVyKVxue1xuICAgIC8vaWYodGhpcy5fYlVzZU1hdGVyaWFsIHx8IHRoaXMuX2JVc2VUZXh0dXJlKXJldHVybiBudWxsO1xuXG4gICAgLy9obSwgZml4IG1lXG4gICAgaWYodGhpcy5fYlVzZU1hdGVyaWFsIHx8IHRoaXMuX2JVc2VUZXh0dXJlKXJldHVybiBidWZmZXI7XG5cbiAgICB2YXIgaSA9IDA7XG5cbiAgICBpZihjb2xvci5sZW5ndGggPT0gNClcbiAgICB7XG4gICAgICAgIHdoaWxlKGkgPCBidWZmZXIubGVuZ3RoKVxuICAgICAgICB7XG4gICAgICAgICAgICBidWZmZXJbaV0gID1jb2xvclswXTtcbiAgICAgICAgICAgIGJ1ZmZlcltpKzFdPWNvbG9yWzFdO1xuICAgICAgICAgICAgYnVmZmVyW2krMl09Y29sb3JbMl07XG4gICAgICAgICAgICBidWZmZXJbaSszXT1jb2xvclszXTtcbiAgICAgICAgICAgIGkrPTQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZVxuICAgIHtcbiAgICAgICAgaWYoY29sb3IubGVuZ3RoICE9IGJ1ZmZlci5sZW5ndGgpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihrRXJyb3IuQ09MT1JTX0lOX1dST05HX1NJWkUpO1xuICAgICAgICB9XG5cbiAgICAgICAgd2hpbGUoaSA8IGJ1ZmZlci5sZW5ndGgpXG4gICAgICAgIHtcbiAgICAgICAgICAgIGJ1ZmZlcltpXSAgID0gY29sb3JbaV07XG4gICAgICAgICAgICBidWZmZXJbaSsxXSA9IGNvbG9yW2krMV07XG4gICAgICAgICAgICBidWZmZXJbaSsyXSA9IGNvbG9yW2krMl07XG4gICAgICAgICAgICBidWZmZXJbaSszXSA9IGNvbG9yW2krM107XG4gICAgICAgICAgICBpKz00O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGJ1ZmZlcjtcbn07XG5cbkZHTC5wcm90b3R5cGUuYnVmZmVyVmVydGljZXMgPSBmdW5jdGlvbih2ZXJ0aWNlcyxidWZmZXIpXG57XG4gICAgaWYodmVydGljZXMubGVuZ3RoICE9IGJ1ZmZlci5sZW5ndGgpdGhyb3cgKGtFcnJvci5WRVJUSUNFU19JTl9XUk9OR19TSVpFICsgYnVmZmVyLmxlbmd0aCArICcuJyk7XG4gICAgdmFyIGkgPSAtMTt3aGlsZSgrK2kgPCBidWZmZXIubGVuZ3RoKWJ1ZmZlcltpXSA9IHZlcnRpY2VzW2ldO1xuICAgIHJldHVybiBidWZmZXI7XG59O1xuXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4vLyBIZWxwZXJzXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cblxuRkdMLnByb3RvdHlwZS5fc2NhbGVWZXJ0aWNlcyA9IGZ1bmN0aW9uKHZlcnQwLHNjYWxlLHZlcnQxKVxue1xuICAgIGlmKCFzY2FsZSlyZXR1cm4gdmVydDA7XG4gICAgdmFyIGkgPSAtMSwgbCA9IHZlcnQwLmxlbmd0aDt3aGlsZSgrK2kgPCBsKXZlcnQxW2ldID0gdmVydDBbaV0gKiBzY2FsZTtyZXR1cm4gdmVydDE7XG59O1xuXG5cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbi8vIEJhdGNoXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbkZHTC5wcm90b3R5cGUuX3B1dENvbXAgPSBmdW5jdGlvbihvcmlnLHRhcmdldClcbntcblxufTtcblxuRkdMLnByb3RvdHlwZS5iZWdpbkRyYXdBcnJheUJhdGNoID0gZnVuY3Rpb24oKVxue1xuICAgIHRoaXMuX2JVc2VEcmF3QXJyYXlCYXRjaCA9IHRydWU7XG5cblxufTtcblxuRkdMLnByb3RvdHlwZS5lbmREcmF3QXJyYXlCYXRjaCA9IGZ1bmN0aW9uKClcbntcbiAgICB0aGlzLl9iVXNlRHJhd0FycmF5QmF0Y2ggPSBmYWxzZTtcblxufTtcblxuRkdMLnByb3RvdHlwZS5kcmF3QXJyYXlCYXRjaCA9IGZ1bmN0aW9uKClcbntcblxufTtcblxuRkdMLnByb3RvdHlwZS5iZWdpbkRyYXdFbGVtZW50QXJyYXlCYXRjaCA9IGZ1bmN0aW9uKClcbntcbiAgICB0aGlzLl9iVXNlRHJhd0VsZW1lbnRBcnJheUJhdGNoID0gdHJ1ZTtcblxuICAgIHRoaXMuX2JCYXRjaFZlcnRpY2VzLmxlbmd0aCA9IDA7XG5cbn07XG5cbkZHTC5wcm90b3R5cGUuZW5kRHJhd0VsZW1lbnRBcnJheUJhdGNoID0gZnVuY3Rpb24oKVxue1xuICAgIHRoaXMuX2JVc2VEcmF3RWxlbWVudEFycmF5QmF0Y2ggPSBmYWxzZTtcblxuXG59O1xuXG5GR0wucHJvdG90eXBlLl9wdXNoRWxlbWVudEFycmF5QmF0Y2ggPSBmdW5jdGlvbih2ZXJ0ZXhGbG9hdDMyQXJyYXksbm9ybWFsRmxvYXQzMkFycmF5LGNvbG9yRmxvYXQzMkFycmF5LHRleENvb3Jkc0Zsb2F0MzJBcnJheSxpbmRleFVpbnQxNkFycmF5KVxue1xuXG4gICAgdmFyIHRyYW5zTWF0cml4ID0gdGhpcy5fbU1vZGVsVmlldztcblxuICAgIHZhciBvZmZzZXRJbmRleCA9IHRoaXMuX2JCYXRjaFZlcnRpY2VzLmxlbmd0aCAvIDM7XG4gICAgdmFyIG9mZnNldCxsZW5ndGgsaW5kZXg7XG5cbiAgICB2YXIgYmF0Y2hWZXJ0aWNlcyAgICAgICAgPSB0aGlzLl9iQmF0Y2hWZXJ0aWNlcyxcbiAgICAgICAgYmF0Y2hWZXJ0aWNlc09mZnNldCAgPSBiYXRjaFZlcnRpY2VzLmxlbmd0aDtcbiAgICAgICAgYmF0Y2hWZXJ0aWNlcy5sZW5ndGgrPSB2ZXJ0ZXhGbG9hdDMyQXJyYXkubGVuZ3RoO1xuXG4gICAgICAgIG9mZnNldCA9IGJhdGNoVmVydGljZXNPZmZzZXQ7XG4gICAgICAgIGxlbmd0aCA9IGJhdGNoVmVydGljZXMubGVuZ3RoO1xuICAgICAgICBpbmRleCAgPSAwO1xuXG4gICAgd2hpbGUob2Zmc2V0IDwgbGVuZ3RoKVxuICAgIHtcblxuICAgICAgICBiYXRjaFZlcnRpY2VzW29mZnNldCAgXSA9IHZlcnRleEZsb2F0MzJBcnJheVtpbmRleCAgXTtcbiAgICAgICAgYmF0Y2hWZXJ0aWNlc1tvZmZzZXQrMV0gPSB2ZXJ0ZXhGbG9hdDMyQXJyYXlbaW5kZXgrMV07XG4gICAgICAgIGJhdGNoVmVydGljZXNbb2Zmc2V0KzJdID0gdmVydGV4RmxvYXQzMkFycmF5W2luZGV4KzJdO1xuXG4gICAgICAgIE1hdDQ0Lm11bHRWZWMzQUkodHJhbnNNYXRyaXgsYmF0Y2hWZXJ0aWNlcyxvZmZzZXQpO1xuXG4gICAgICAgIG9mZnNldCs9MztcbiAgICAgICAgaW5kZXggKz0zO1xuICAgIH1cblxuXG4gICAgaWYobm9ybWFsRmxvYXQzMkFycmF5ICAgKXRoaXMuX3B1dEJhdGNoKHRoaXMuX2JCYXRjaE5vcm1hbHMsbm9ybWFsRmxvYXQzMkFycmF5KTtcbiAgICBpZihjb2xvckZsb2F0MzJBcnJheSAgICApdGhpcy5fcHV0QmF0Y2godGhpcy5fYkJhdGNoQ29sb3JzLGNvbG9yRmxvYXQzMkFycmF5KTtcbiAgICBpZih0ZXhDb29yZHNGbG9hdDMyQXJyYXkpdGhpcy5fcHV0QmF0Y2godGhpcy5fYkJhdGNoVGV4Q29vcmRzLHRleENvb3Jkc0Zsb2F0MzJBcnJheSk7XG5cblxuICAgIHZhciBiYXRjaEluZGljZXMgICAgICAgID0gdGhpcy5fYkJhdGNoSW5kaWNlcyxcbiAgICAgICAgYmF0Y2hJbmRpY2VzT2Zmc2V0ICA9IGJhdGNoSW5kaWNlcy5sZW5ndGg7XG4gICAgICAgIGJhdGNoSW5kaWNlcy5sZW5ndGgrPSBpbmRleFVpbnQxNkFycmF5Lmxlbmd0aDtcblxuICAgICAgICBvZmZzZXQgPSBiYXRjaEluZGljZXNPZmZzZXQ7XG4gICAgICAgIGxlbmd0aCA9IGJhdGNoSW5kaWNlcy5sZW5ndGg7XG4gICAgICAgIGluZGV4ICA9IDA7XG5cbiAgICB3aGlsZShvZmZzZXQgPCBsZW5ndGgpe2JhdGNoSW5kaWNlc1tvZmZzZXRdID0gaW5kZXhVaW50MTZBcnJheVtpbmRleF0gKyBvZmZzZXRJbmRleDtvZmZzZXQrKztpbmRleCsrO31cblxufTtcblxuRkdMLnByb3RvdHlwZS5kcmF3RWxlbWVudEFycmF5QmF0Y2ggPSBmdW5jdGlvbihiYXRjaClcbntcbiAgICBpZighYmF0Y2gpe31cblxuICAgIHRoaXMuZHJhd0VsZW1lbnRzKG5ldyBGbG9hdDMyQXJyYXkodGhpcy5fYkJhdGNoVmVydGljZXMpLFxuICAgICAgICAgICAgICAgICAgICAgIG5ldyBGbG9hdDMyQXJyYXkodGhpcy5fYkJhdGNoTm9ybWFscyksXG4gICAgICAgICAgICAgICAgICAgICAgbmV3IEZsb2F0MzJBcnJheSh0aGlzLl9iQmF0Y2hDb2xvcnMpLFxuICAgICAgICAgICAgICAgICAgICAgIG5ldyBGbG9hdDMyQXJyYXkodGhpcy5fYkJhdGNoVGV4Q29vcmRzKSxcbiAgICAgICAgICAgICAgICAgICAgICBuZXcgVWludDE2QXJyYXkoIHRoaXMuX2JCYXRjaEluZGljZXMpLFxuICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ2V0RHJhd01vZGUoKSk7XG59O1xuXG5GR0wucHJvdG90eXBlLl9wdXRCYXRjaCA9IGZ1bmN0aW9uKGJhdGNoQXJyYXksZGF0YUFycmF5KVxue1xuICAgIHZhciBiYXRjaE9mZnNldCAgID0gYmF0Y2hBcnJheS5sZW5ndGg7XG4gICAgYmF0Y2hBcnJheS5sZW5ndGgrPSBkYXRhQXJyYXkubGVuZ3RoO1xuXG4gICAgdmFyIGxlbiA9IGJhdGNoQXJyYXkubGVuZ3RoO1xuICAgIHZhciBpbmRleCA9IDA7XG5cbiAgICB3aGlsZShiYXRjaE9mZnNldCA8IGxlbil7YmF0Y2hBcnJheVtiYXRjaE9mZnNldCsrXSA9IGRhdGFBcnJheVtpbmRleCsrXTt9XG59O1xuXG5cblxuXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4vLyBDb252ZW5pZW5jZSBNZXRob2RzIGNvbG9yXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbkZHTC5wcm90b3R5cGUuYW1iaWVudCAgID0gZnVuY3Rpb24oY29sb3Ipe3RoaXMuZ2wudW5pZm9ybTNmKHRoaXMuX3VBbWJpZW50LGNvbG9yWzBdLGNvbG9yWzFdLGNvbG9yWzJdKTt9O1xuRkdMLnByb3RvdHlwZS5hbWJpZW50M2YgPSBmdW5jdGlvbihyLGcsYil7dGhpcy5nbC51bmlmb3JtM2YodGhpcy5fdUFtYmllbnQscixnLGIpO307XG5GR0wucHJvdG90eXBlLmFtYmllbnQxZiA9IGZ1bmN0aW9uKGspICAgIHt0aGlzLmdsLnVuaWZvcm0xZih0aGlzLl91QW1iaWVudCxrKTt9O1xuXG5GR0wucHJvdG90eXBlLmNvbG9yICAgPSBmdW5jdGlvbihjb2xvcikgIHt0aGlzLl9iQ29sb3IgPSBDb2xvci5zZXQodGhpcy5fYkNvbG9yNGYsY29sb3IpO307XG5GR0wucHJvdG90eXBlLmNvbG9yNGYgPSBmdW5jdGlvbihyLGcsYixhKXt0aGlzLl9iQ29sb3IgPSBDb2xvci5zZXQ0Zih0aGlzLl9iQ29sb3I0ZixyLGcsYixhKTt9O1xuRkdMLnByb3RvdHlwZS5jb2xvcjNmID0gZnVuY3Rpb24ocixnLGIpICB7dGhpcy5fYkNvbG9yID0gQ29sb3Iuc2V0M2YodGhpcy5fYkNvbG9yNGYscixnLGIpO307XG5GR0wucHJvdG90eXBlLmNvbG9yMmYgPSBmdW5jdGlvbihrLGEpICAgIHt0aGlzLl9iQ29sb3IgPSBDb2xvci5zZXQyZih0aGlzLl9iQ29sb3I0ZixrLGEpO307XG5GR0wucHJvdG90eXBlLmNvbG9yMWYgPSBmdW5jdGlvbihrKSAgICAgIHt0aGlzLl9iQ29sb3IgPSBDb2xvci5zZXQxZih0aGlzLl9iQ29sb3I0ZixrKTt9O1xuRkdMLnByb3RvdHlwZS5jb2xvcmZ2ID0gZnVuY3Rpb24oYXJyYXkpICB7dGhpcy5fYkNvbG9yID0gYXJyYXk7fTtcblxuRkdMLnByb3RvdHlwZS5jbGVhckNvbG9yID0gZnVuY3Rpb24oY29sb3Ipe3RoaXMuY2xlYXI0Zihjb2xvclswXSxjb2xvclsxXSxjb2xvclsyXSxjb2xvclszXSk7fTtcbkZHTC5wcm90b3R5cGUuY2xlYXIgICAgICA9IGZ1bmN0aW9uKCkgICAgIHt0aGlzLmNsZWFyNGYoMCwwLDAsMSk7fTtcbkZHTC5wcm90b3R5cGUuY2xlYXIzZiAgICA9IGZ1bmN0aW9uKHIsZyxiKXt0aGlzLmNsZWFyNGYocixnLGIsMSk7fTtcbkZHTC5wcm90b3R5cGUuY2xlYXIyZiAgICA9IGZ1bmN0aW9uKGssYSkgIHt0aGlzLmNsZWFyNGYoayxrLGssYSk7fTtcbkZHTC5wcm90b3R5cGUuY2xlYXIxZiAgICA9IGZ1bmN0aW9uKGspICAgIHt0aGlzLmNsZWFyNGYoayxrLGssMS4wKTt9O1xuRkdMLnByb3RvdHlwZS5jbGVhcjRmICAgPSBmdW5jdGlvbihyLGcsYixhKVxue1xuICAgIHZhciBjICA9IENvbG9yLnNldDRmKHRoaXMuX2JDb2xvckJnNGYscixnLGIsYSk7XG4gICAgdmFyIGdsID0gdGhpcy5nbDtcbiAgICBnbC5jbGVhckNvbG9yKGNbMF0sY1sxXSxjWzJdLGNbM10pO1xuICAgIGdsLmNsZWFyKGdsLkNPTE9SX0JVRkZFUl9CSVQgfCBnbC5ERVBUSF9CVUZGRVJfQklUKTtcbn07XG5cblxuRkdMLnByb3RvdHlwZS5nZXRDb2xvckJ1ZmZlciA9IGZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX2JDb2xvcjt9O1xuRkdMLnByb3RvdHlwZS5nZXRDbGVhckJ1ZmZlciA9IGZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX2JDb2xvckJnNGY7fTtcblxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuLy8gTWV0aG9kcyBkcmF3IHByb3BlcnRpZXNcbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuRkdMLnByb3RvdHlwZS5kcmF3TW9kZSA9IGZ1bmN0aW9uKG1vZGUpe3RoaXMuX2RyYXdNb2RlID0gbW9kZTt9O1xuRkdMLnByb3RvdHlwZS5nZXREcmF3TW9kZSA9IGZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX2RyYXdNb2RlO307XG5cbkZHTC5wcm90b3R5cGUuc3BoZXJlRGV0YWlsID0gZnVuY3Rpb24oZGV0YWlsKVxue1xuICAgIGlmKGRldGFpbCA9PSB0aGlzLl9zcGhlcmVEZXRhaWxMYXN0KXJldHVybjtcbiAgICB0aGlzLl9zcGhlcmVEZXRhaWxMYXN0ID0gZGV0YWlsO1xuICAgIHRoaXMuX2dlblNwaGVyZSgpO1xufTtcblxuRkdMLnByb3RvdHlwZS5jaXJjbGVEZXRhaWwgPSBmdW5jdGlvbihkZXRhaWwpXG57XG4gICAgaWYoZGV0YWlsID09IHRoaXMuX2NpcmNsZURldGFpbExhc3QgKXJldHVybjtcbiAgICB0aGlzLl9jaXJjbGVEZXRhaWxMYXN0ICA9IE1hdGgubWF4KHRoaXMuRUxMSVBTRV9ERVRBSUxfTUlOLE1hdGgubWluKGRldGFpbCx0aGlzLkVMTElQU0VfREVUQUlMX01BWCkpO1xuICAgIHRoaXMuX2NpcmxjZVZlcnRleENvdW50ID0gdGhpcy5fY2lyY2xlRGV0YWlsTGFzdCAqIDM7XG4gICAgdGhpcy5fZ2VuQ2lyY2xlKCk7XG59O1xuXG5GR0wucHJvdG90eXBlLmxpbmVXaWR0aCA9IGZ1bmN0aW9uKHNpemUpe3RoaXMuZ2wubGluZVdpZHRoKHNpemUpO307XG5cbkZHTC5wcm90b3R5cGUudXNlQmlsbGJvYXJkID0gZnVuY3Rpb24oYm9vbCl7dGhpcy5fYlVzZUJpbGxib2FyZGluZyA9IGJvb2w7fTtcbkZHTC5wcm90b3R5cGUucG9pbnRTaXplID0gZnVuY3Rpb24odmFsdWUpe3RoaXMuZ2wudW5pZm9ybTFmKHRoaXMuX3VQb2ludFNpemUsdmFsdWUpO307XG5cblxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuLy8gTWV0aG9kcyBkcmF3IHByaW1pdGl2ZXNcbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuRkdMLnByb3RvdHlwZS5wb2ludCA9IGZ1bmN0aW9uKHZlY3RvcilcbntcbiAgICBpZih2ZWN0b3IubGVuZ3RoID09IDApcmV0dXJuO1xuXG4gICAgdmFyIGJDb2xvclBvaW50ID0gdGhpcy5fYkNvbG9yUG9pbnQsXG4gICAgICAgIGJDb2xvciAgICAgID0gdGhpcy5fYkNvbG9yO1xuXG4gICAgYkNvbG9yUG9pbnRbMF0gPSBiQ29sb3JbMF07XG4gICAgYkNvbG9yUG9pbnRbMV0gPSBiQ29sb3JbMV07XG4gICAgYkNvbG9yUG9pbnRbMl0gPSBiQ29sb3JbMl07XG4gICAgYkNvbG9yUG9pbnRbM10gPSBiQ29sb3JbM107XG5cbiAgICB2YXIgZ2wgPSB0aGlzLmdsLFxuICAgICAgICBnbEFycmF5QnVmZmVyID0gZ2wuQVJSQVlfQlVGRkVSLFxuICAgICAgICBnbEZsb2F0ICAgICAgID0gZ2wuRkxPQVQ7XG5cbiAgICB2YXIgdmJsZW4gPSB2ZWN0b3IuYnl0ZUxlbmd0aCxcbiAgICAgICAgY2JsZW4gPSBiQ29sb3IuYnl0ZUxlbmd0aDtcblxuICAgIHZhciBvZmZzZXRWID0gMCxcbiAgICAgICAgb2Zmc2V0QyA9IHZibGVuO1xuXG4gICAgZ2wuYnVmZmVyRGF0YShnbEFycmF5QnVmZmVyLHZibGVuICsgY2JsZW4sZ2wuU1RBVElDX0RSQVcpO1xuXG4gICAgZ2wuYnVmZmVyU3ViRGF0YShnbEFycmF5QnVmZmVyLCBvZmZzZXRWLCB2ZWN0b3IpO1xuICAgIGdsLmJ1ZmZlclN1YkRhdGEoZ2xBcnJheUJ1ZmZlciwgb2Zmc2V0QywgYkNvbG9yKTtcblxuICAgIGdsLmRpc2FibGVWZXJ0ZXhBdHRyaWJBcnJheSh0aGlzLl9hVmVydGV4Tm9ybWFsKTtcbiAgICBnbC5kaXNhYmxlVmVydGV4QXR0cmliQXJyYXkodGhpcy5fYVZlcnRleFRleENvb3JkKTtcblxuICAgIGdsLnZlcnRleEF0dHJpYlBvaW50ZXIodGhpcy5fYVZlcnRleFBvc2l0aW9uLCB0aGlzLlNJWkVfT0ZfVkVSVEVYLCBnbEZsb2F0LCBmYWxzZSwgMCwgb2Zmc2V0Vik7XG4gICAgZ2wudmVydGV4QXR0cmliUG9pbnRlcih0aGlzLl9hVmVydGV4Q29sb3IsICAgIHRoaXMuU0laRV9PRl9DT0xPUiwgIGdsRmxvYXQsIGZhbHNlLCAwLCBvZmZzZXRDKTtcblxuICAgIHRoaXMuc2V0TWF0cmljZXNVbmlmb3JtKCk7XG4gICAgZ2wuZHJhd0FycmF5cyh0aGlzLl9kcmF3TW9kZSwwLDEpO1xuXG4gICAgZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkodGhpcy5fYVZlcnRleE5vcm1hbCk7XG4gICAgZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkodGhpcy5fYVZlcnRleFRleENvb3JkKTtcblxuICAgIHRoaXMuX2RyYXdGdW5jTGFzdCA9IHRoaXMucG9pbnQ7XG59O1xuXG5GR0wucHJvdG90eXBlLnBvaW50cyA9IGZ1bmN0aW9uKHZlcnRpY2VzLGNvbG9ycylcbntcbiAgICBpZih2ZXJ0aWNlcy5sZW5ndGggPT0gMClyZXR1cm47XG5cbiAgICBjb2xvcnMgPSBjb2xvcnMgfHwgdGhpcy5idWZmZXJDb2xvcnModGhpcy5fYkNvbG9yNGYsbmV3IEZsb2F0MzJBcnJheSh2ZXJ0aWNlcy5sZW5ndGggLyAzICogNCkpO1xuXG4gICAgdmFyIGdsICAgICAgICAgICAgPSB0aGlzLmdsLFxuICAgICAgICBnbEFycmF5QnVmZmVyID0gZ2wuQVJSQVlfQlVGRkVSLFxuICAgICAgICBnbEZsb2F0ICAgICAgID0gZ2wuRkxPQVQ7XG5cbiAgICB2YXIgdmJsZW4gPSB2ZXJ0aWNlcy5ieXRlTGVuZ3RoLFxuICAgICAgICBjYmxlbiA9IGNvbG9ycy5ieXRlTGVuZ3RoO1xuXG4gICAgdmFyIG9mZnNldFYgPSAwLFxuICAgICAgICBvZmZzZXRDID0gdmJsZW47XG5cbiAgICBnbC5idWZmZXJEYXRhKGdsQXJyYXlCdWZmZXIsdmJsZW4gKyBjYmxlbixnbC5TVEFUSUNfRFJBVyk7XG5cbiAgICBnbC5idWZmZXJTdWJEYXRhKGdsQXJyYXlCdWZmZXIsIG9mZnNldFYsIHZlcnRpY2VzKTtcbiAgICBnbC5idWZmZXJTdWJEYXRhKGdsQXJyYXlCdWZmZXIsIG9mZnNldEMsIGNvbG9ycyk7XG5cbiAgICBnbC5kaXNhYmxlVmVydGV4QXR0cmliQXJyYXkodGhpcy5fYVZlcnRleE5vcm1hbCk7XG4gICAgZ2wuZGlzYWJsZVZlcnRleEF0dHJpYkFycmF5KHRoaXMuX2FWZXJ0ZXhUZXhDb29yZCk7XG5cbiAgICBnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKHRoaXMuX2FWZXJ0ZXhQb3NpdGlvbiwgdGhpcy5TSVpFX09GX1ZFUlRFWCwgZ2xGbG9hdCwgZmFsc2UsIDAsIG9mZnNldFYpO1xuICAgIGdsLnZlcnRleEF0dHJpYlBvaW50ZXIodGhpcy5fYVZlcnRleENvbG9yLCAgICB0aGlzLlNJWkVfT0ZfQ09MT1IsICBnbEZsb2F0LCBmYWxzZSwgMCwgb2Zmc2V0Qyk7XG5cbiAgICB0aGlzLnNldE1hdHJpY2VzVW5pZm9ybSgpO1xuICAgIGdsLmRyYXdBcnJheXModGhpcy5fZHJhd01vZGUsMCx2ZXJ0aWNlcy5sZW5ndGgvMyk7XG5cbiAgICBnbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheSh0aGlzLl9hVmVydGV4Tm9ybWFsKTtcbiAgICBnbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheSh0aGlzLl9hVmVydGV4VGV4Q29vcmQpO1xuXG4gICAgdGhpcy5fZHJhd0Z1bmNMYXN0ID0gdGhpcy5wb2ludHM7XG59O1xuXG5GR0wucHJvdG90eXBlLnBvaW50M2YgPSBmdW5jdGlvbih4LHkseil7dGhpcy5fYlZlcnRleFBvaW50WzBdID0geDt0aGlzLl9iVmVydGV4UG9pbnRbMV0gPSB5O3RoaXMuX2JWZXJ0ZXhQb2ludFsyXSA9IHo7dGhpcy5wb2ludCh0aGlzLl9iVmVydGV4UG9pbnQpO307XG5GR0wucHJvdG90eXBlLnBvaW50MmYgPSBmdW5jdGlvbih4LHkpICB7dGhpcy5fYlZlcnRleFBvaW50WzBdID0geDt0aGlzLl9iVmVydGV4UG9pbnRbMV0gPSB5O3RoaXMuX2JWZXJ0ZXhQb2ludFsyXSA9IDA7dGhpcy5wb2ludCh0aGlzLl9iVmVydGV4UG9pbnQpO307XG5GR0wucHJvdG90eXBlLnBvaW50diAgPSBmdW5jdGlvbihhcnIpICB7dGhpcy5fYlZlcnRleFBvaW50WzBdID0gYXJyWzBdO3RoaXMuX2JWZXJ0ZXhQb2ludFsxXSA9IGFyclsxXTt0aGlzLl9iVmVydGV4UG9pbnRbMl0gPSBhcnJbMl07dGhpcy5wb2ludCh0aGlzLl9iVmVydGV4UG9pbnQpO307XG5cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuRkdMLnByb3RvdHlwZS5saW5lZiA9IGZ1bmN0aW9uKHgwLHkwLHowLHgxLHkxLHoxKVxue1xuICAgIHZhciB2ID0gdGhpcy5fYlZlcnRleExpbmU7XG4gICAgdlswXSA9IHgwO3ZbMV0gPSB5MDt2WzJdID0gejA7XG4gICAgdlszXSA9IHgxO3ZbNF0gPSB5MTt2WzVdID0gejE7XG5cbiAgICB0aGlzLmRyYXdBcnJheXModixudWxsLHRoaXMuYnVmZmVyQ29sb3JzKHRoaXMuX2JDb2xvcix0aGlzLl9iQ29sb3JMaW5lKSxudWxsLHRoaXMuX2RyYXdNb2RlKTtcblxuICAgIHRoaXMuX2RyYXdGdW5jTGFzdCA9IHRoaXMubGluZWY7XG59O1xuXG5GR0wucHJvdG90eXBlLmxpbmUgID0gZnVuY3Rpb24odmVydGljZXMpXG57XG4gICAgaWYodmVydGljZXMubGVuZ3RoID09IDApcmV0dXJuO1xuICAgIHRoaXMuZHJhd0FycmF5cyh0aGlzLmJ1ZmZlckFycmF5cyh2ZXJ0aWNlcyx0aGlzLl9iVmVydGV4TGluZSksbnVsbCx0aGlzLmJ1ZmZlckNvbG9ycyh0aGlzLl9iQ29sb3IsdGhpcy5fYkNvbG9yTGluZSksbnVsbCx0aGlzLl9kcmF3TW9kZSwwLCAyKTtcblxuICAgIHRoaXMuX2RyYXdGdW5jTGFzdCA9IHRoaXMubGluZTtcbn07XG5cbkZHTC5wcm90b3R5cGUubGluZXYgPSBmdW5jdGlvbih2ZXJ0aWNlcylcbntcbiAgICBpZih2ZXJ0aWNlcy5sZW5ndGggPT0gMClyZXR1cm47XG4gICAgdmFyIHYgPSBuZXcgRmxvYXQzMkFycmF5KHZlcnRpY2VzKSxcbiAgICAgICAgbCA9IHZlcnRpY2VzLmxlbmd0aCAvIHRoaXMuU0laRV9PRl9WRVJURVg7XG4gICAgdGhpcy5kcmF3QXJyYXlzKHYsbnVsbCx0aGlzLmJ1ZmZlckNvbG9ycyh0aGlzLl9iQ29sb3IsIG5ldyBGbG9hdDMyQXJyYXkobCp0aGlzLlNJWkVfT0ZfQ09MT1IpKSxudWxsLHRoaXMuX2RyYXdNb2RlLDAsIGwpO1xuXG4gICAgdGhpcy5fZHJhd0Z1bmNMYXN0ID0gdGhpcy5saW5ldjtcbn07XG5cbkZHTC5wcm90b3R5cGUubGluZTJmdiA9IGZ1bmN0aW9uKHYwLHYxKXt0aGlzLmxpbmVmKHYwWzBdLHYwWzFdLHYwWzJdLHYxWzBdLHYxWzFdLHYxWzJdKTt9O1xuXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbkZHTC5wcm90b3R5cGUucXVhZGYgPSBmdW5jdGlvbih4MCx5MCx6MCx4MSx5MSx6MSx4Mix5Mix6Mix4Myx5Myx6MylcbntcbiAgICB2YXIgdiA9IHRoaXMuX2JWZXJ0ZXhRdWFkO1xuXG4gICAgdlsgMF0gPSB4MDt2WyAxXSA9IHkwO3ZbIDJdID0gejA7XG4gICAgdlsgM10gPSB4MTt2WyA0XSA9IHkxO3ZbIDVdID0gejE7XG4gICAgdlsgNl0gPSB4Mjt2WyA3XSA9IHkyO3ZbIDhdID0gejI7XG4gICAgdlsgOV0gPSB4Mzt2WzEwXSA9IHkzO3ZbMTFdID0gejM7XG5cbiAgICB0aGlzLmRyYXdBcnJheXModixudWxsLHRoaXMuYnVmZmVyQ29sb3JzKHRoaXMuX2JDb2xvcix0aGlzLl9iQ29sb3JRdWFkKSxudWxsLHRoaXMuX2RyYXdNb2RlLDAsNCk7XG5cbiAgICB0aGlzLl9kcmF3RnVuY0xhc3QgPSB0aGlzLnF1YWRmO1xufTtcblxuRkdMLnByb3RvdHlwZS5xdWFkdiA9IGZ1bmN0aW9uKHYwLHYxLHYyLHYzKVxue1xuICAgIHRoaXMucXVhZGYodjBbMF0sdjBbMV0sdjBbMl0sdjFbMF0sdjFbMV0sdjFbMl0sdjJbMF0sdjJbMV0sdjJbMl0sdjNbMF0sdjNbMV0sdjNbMl0pO1xufTtcblxuRkdMLnByb3RvdHlwZS5xdWFkID0gZnVuY3Rpb24odmVydGljZXMsbm9ybWFscyx0ZXhDb29yZHMpXG57XG4gICAgdGhpcy5kcmF3QXJyYXlzKHRoaXMuYnVmZmVyQXJyYXlzKHZlcnRpY2VzLHRoaXMuX2JWZXJ0ZXhRdWFkKSxub3JtYWxzLHRoaXMuYnVmZmVyQ29sb3JzKHRoaXMuX2JDb2xvcix0aGlzLl9iQ29sb3JRdWFkKSx0ZXhDb29yZHMsdGhpcy5fZHJhd01vZGUsMCw0KTtcblxuICAgIHRoaXMuX2RyYXdGdW5jTGFzdCA9IHRoaXMucXVhZDtcbn07XG5cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuLy9UT0RPOmNsZWFudXBcbkZHTC5wcm90b3R5cGUucmVjdCA9IGZ1bmN0aW9uKHdpZHRoLGhlaWdodClcbntcbiAgICBoZWlnaHQgPSBoZWlnaHQgfHwgd2lkdGg7XG5cbiAgICB2YXIgdmVydGljZXMgPSB0aGlzLl9iVmVydGV4UmVjdDtcblxuICAgIGlmKHRoaXMuX2JVc2VCaWxsYm9hcmRpbmcpXG4gICAge1xuICAgICAgICAvLzIzXG4gICAgICAgIC8vMDFcblxuICAgICAgICB2YXIgbW9kZWxWaWV3TWF0cml4ID0gdGhpcy5fbU1vZGVsVmlldztcblxuICAgICAgICB2YXIgdmVjUmlnaHRYID0gbW9kZWxWaWV3TWF0cml4WzBdLFxuICAgICAgICAgICAgdmVjUmlnaHRZID0gbW9kZWxWaWV3TWF0cml4WzRdLFxuICAgICAgICAgICAgdmVjUmlnaHRaID0gbW9kZWxWaWV3TWF0cml4WzhdO1xuXG4gICAgICAgIHZhciB2ZWNVcFggPSBtb2RlbFZpZXdNYXRyaXhbMV0sXG4gICAgICAgICAgICB2ZWNVcFkgPSBtb2RlbFZpZXdNYXRyaXhbNV0sXG4gICAgICAgICAgICB2ZWNVcFogPSBtb2RlbFZpZXdNYXRyaXhbOV07XG5cblxuICAgICAgICB2ZXJ0aWNlc1sgMF0gPSAoLXZlY1JpZ2h0WCAtIHZlY1VwWCkgKiB3aWR0aDtcbiAgICAgICAgdmVydGljZXNbIDFdID0gKC12ZWNSaWdodFkgLSB2ZWNVcFkpICogd2lkdGg7XG4gICAgICAgIHZlcnRpY2VzWyAyXSA9ICgtdmVjUmlnaHRaIC0gdmVjVXBaKSAqIHdpZHRoO1xuXG4gICAgICAgIHZlcnRpY2VzWyAzXSA9ICh2ZWNSaWdodFggLSB2ZWNVcFgpICogd2lkdGg7XG4gICAgICAgIHZlcnRpY2VzWyA0XSA9ICh2ZWNSaWdodFkgLSB2ZWNVcFkpICogd2lkdGg7XG4gICAgICAgIHZlcnRpY2VzWyA1XSA9ICh2ZWNSaWdodFogLSB2ZWNVcFopICogd2lkdGg7XG5cbiAgICAgICAgdmVydGljZXNbIDZdID0gKHZlY1JpZ2h0WCArIHZlY1VwWCkgKiB3aWR0aDtcbiAgICAgICAgdmVydGljZXNbIDddID0gKHZlY1JpZ2h0WSArIHZlY1VwWSkgKiB3aWR0aDtcbiAgICAgICAgdmVydGljZXNbIDhdID0gKHZlY1JpZ2h0WiArIHZlY1VwWikgKiB3aWR0aDtcblxuICAgICAgICB2ZXJ0aWNlc1sgOV0gPSAoLXZlY1JpZ2h0WCArIHZlY1VwWCkgKiB3aWR0aDtcbiAgICAgICAgdmVydGljZXNbMTBdID0gKC12ZWNSaWdodFkgKyB2ZWNVcFkpICogd2lkdGg7XG4gICAgICAgIHZlcnRpY2VzWzExXSA9ICgtdmVjUmlnaHRaICsgdmVjVXBaKSAqIHdpZHRoO1xuXG4gICAgfVxuICAgIGVsc2UgaWYod2lkdGggIT0gdGhpcy5fcmVjdFdpZHRoTGFzdCB8fCBoZWlnaHQgIT0gdGhpcy5fcmVjdEhlaWdodExhc3QpXG4gICAge1xuICAgICAgICB2ZXJ0aWNlc1swXSA9IHZlcnRpY2VzWzFdID0gdmVydGljZXNbMl0gPSB2ZXJ0aWNlc1s0XSA9IHZlcnRpY2VzWzVdID0gdmVydGljZXNbN10gPSB2ZXJ0aWNlc1s5XSA9IHZlcnRpY2VzWzEwXSA9IDA7XG4gICAgICAgIHZlcnRpY2VzWzNdID0gdmVydGljZXNbNl0gPSB3aWR0aDsgdmVydGljZXNbOF0gPSB2ZXJ0aWNlc1sxMV0gPSBoZWlnaHQ7XG5cbiAgICAgICAgdGhpcy5fcmVjdFdpZHRoTGFzdCAgPSB3aWR0aDtcbiAgICAgICAgdGhpcy5fcmVjdEhlaWdodExhc3QgPSBoZWlnaHQ7XG4gICAgfVxuXG4gICAgdGhpcy5kcmF3QXJyYXlzKHZlcnRpY2VzLHRoaXMuX2JOb3JtYWxSZWN0LHRoaXMuYnVmZmVyQ29sb3JzKHRoaXMuX2JDb2xvcix0aGlzLl9iQ29sb3JSZWN0KSx0aGlzLl9iVGV4Q29vcmRRdWFkRGVmYXVsdCx0aGlzLl9kcmF3TW9kZSwwLDQpO1xuXG4gICAgdGhpcy5fZHJhd0Z1bmNMYXN0ID0gdGhpcy5yZWN0O1xufTtcblxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG5GR0wucHJvdG90eXBlLnRyaWFuZ2xlID0gZnVuY3Rpb24odjAsdjEsdjIpXG57XG4gICAgdmFyIHYgPSB0aGlzLl9iVmVydGV4VHJpYW5nbGU7XG4gICAgdlswXSA9IHYwWzBdO3ZbMV0gPSB2MFsxXTt2WzJdID0gdjBbMl07XG4gICAgdlszXSA9IHYxWzBdO3ZbNF0gPSB2MVsxXTt2WzVdID0gdjFbMl07XG4gICAgdls2XSA9IHYyWzBdO3ZbN10gPSB2MlsxXTt2WzhdID0gdjJbMl07XG5cbiAgICB0aGlzLmRyYXdBcnJheXModixudWxsLHRoaXMuYnVmZmVyQ29sb3JzKHRoaXMuX2JDb2xvcix0aGlzLl9iQ29sb3JUcmlhbmdsZSksbnVsbCx0aGlzLl9kcmF3TW9kZSwwLDMpO1xuXG4gICAgdGhpcy5fZHJhd0Z1bmNMYXN0ID0gdGhpcy50cmlhbmdsZTtcbn07XG5cbkZHTC5wcm90b3R5cGUudHJpYW5nbGVmID0gZnVuY3Rpb24odjAsdjEsdjIsdjMsdjQsdjUsdjYsdjcsdjgpXG57XG4gICAgdmFyIHYgPSB0aGlzLl9iVmVydGV4VHJpYW5nbGU7XG4gICAgdlswXSA9IHYwO3ZbMV0gPSB2MTt2WzJdID0gdjI7XG4gICAgdlszXSA9IHYzO3ZbNF0gPSB2NDt2WzVdID0gdjU7XG4gICAgdls2XSA9IHY2O3ZbN10gPSB2Nzt2WzhdID0gdjg7XG5cbiAgICB0aGlzLmRyYXdBcnJheXModixudWxsLHRoaXMuYnVmZmVyQ29sb3JzKHRoaXMuX2JDb2xvcix0aGlzLl9iQ29sb3JUcmlhbmdsZSksbnVsbCx0aGlzLl9kcmF3TW9kZSwwLDMpO1xuXG4gICAgdGhpcy5fZHJhd0Z1bmNMYXN0ID0gdGhpcy50cmlhbmdsZWY7XG59O1xuXG5GR0wucHJvdG90eXBlLnRyaWFuZ2xldiA9IGZ1bmN0aW9uKHZlcnRpY2VzLG5vcm1hbHMsdGV4Q29vcmRzKVxue1xuICAgIHRoaXMuZHJhd0FycmF5cyh0aGlzLmJ1ZmZlckFycmF5cyh2ZXJ0aWNlcyx0aGlzLl9iVmVydGV4VHJpYW5nbGUpLG5vcm1hbHMsdGhpcy5idWZmZXJDb2xvcnModGhpcy5fYkNvbG9yLHRoaXMuX2JDb2xvclRyaWFuZ2xlKSx0ZXhDb29yZHMsdGhpcy5fZHJhd01vZGUsMCwzKTtcbiAgICB0aGlzLl9kcmF3RnVuY0xhc3QgPSB0aGlzLnRyaWFuZ2xldjtcbn07XG5cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuRkdMLnByb3RvdHlwZS5jaXJjbGUzZiA9IGZ1bmN0aW9uKHgseSx6LHJhZGl1cylcbntcbiAgICByYWRpdXMgPSByYWRpdXMgfHwgMC41O1xuXG4gICAgdGhpcy5wdXNoTWF0cml4KCk7XG4gICAgdGhpcy50cmFuc2xhdGUzZih4LHkseik7XG4gICAgdGhpcy5zY2FsZTFmKHJhZGl1cyk7XG4gICAgdGhpcy5kcmF3QXJyYXlzKHRoaXMuX2JWZXJ0ZXhDaXJjbGUsdGhpcy5fYk5vcm1hbENpcmNsZSx0aGlzLmJ1ZmZlckNvbG9ycyh0aGlzLl9iQ29sb3IsdGhpcy5fYkNvbG9yQ2lyY2xlKSx0aGlzLl9iVGV4Q29vcmRDaXJjbGUsdGhpcy5nZXREcmF3TW9kZSgpLDAsdGhpcy5fY2lyY2xlRGV0YWlsTGFzdCk7XG4gICAgdGhpcy5wb3BNYXRyaXgoKTtcblxuICAgIHRoaXMuX2RyYXdGdW5jTGFzdCA9IHRoaXMubGluZWY7XG59O1xuXG5GR0wucHJvdG90eXBlLmNpcmxjZTJmID0gZnVuY3Rpb24oeCx5LHJhZGl1cyl7dGhpcy5jaXJjbGUzZih4LDAseSxyYWRpdXMpO307XG5GR0wucHJvdG90eXBlLmNpcmNsZSA9IGZ1bmN0aW9uKHJhZGl1cyl7dGhpcy5jaXJjbGUzZigwLDAsMCxyYWRpdXMpfTtcbkZHTC5wcm90b3R5cGUuY2lyY2xldiA9IGZ1bmN0aW9uKHYscmFkaXVzKXt0aGlzLmNpcmNsZTNmKHZbMF0sdlsxXSx2WzJdLHJhZGl1cyk7fTtcbkZHTC5wcm90b3R5cGUuY2lyY2xlcyA9IGZ1bmN0aW9uKGNlbnRlcnMscmFkaWkpe307XG5cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbi8vIEdlb21ldHJ5IGdlblxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG5GR0wucHJvdG90eXBlLl9nZW5TcGhlcmUgPSBmdW5jdGlvbigpXG57XG4gICAgdmFyIHNlZ21lbnRzID0gdGhpcy5fc3BoZXJlRGV0YWlsTGFzdDtcblxuICAgIHZhciB2ZXJ0aWNlcyAgPSBbXSxcbiAgICAgICAgbm9ybWFscyAgID0gW10sXG4gICAgICAgIHRleENvb3JkcyA9IFtdLFxuICAgICAgICBpbmRpY2VzICAgPSBbXTtcblxuICAgIHZhciB0aGV0YSx0aGV0YVNpbix0aGV0YUNvcztcbiAgICB2YXIgcGhpLHBoaVNpbixwaGlDb3M7XG5cbiAgICB2YXIgeCx5LHo7XG4gICAgdmFyIHUsdjtcblxuICAgIHZhciBpID0gLTEsajtcblxuICAgIHZhciBpbmRleCxcbiAgICAgICAgaW5kZXhWZXJ0aWNlcyxcbiAgICAgICAgaW5kZXhOb3JtYWxzLFxuICAgICAgICBpbmRleFRleENvb3JkcztcblxuICAgIHdoaWxlKCsraSA8PSBzZWdtZW50cylcbiAgICB7XG4gICAgICAgIHRoZXRhID0gaSAqIE1hdGguUEkgLyBzZWdtZW50cztcbiAgICAgICAgdGhldGFTaW4gPSBNYXRoLnNpbih0aGV0YSk7XG4gICAgICAgIHRoZXRhQ29zID0gTWF0aC5jb3ModGhldGEpO1xuXG4gICAgICAgIGogPSAtMTtcbiAgICAgICAgd2hpbGUoKytqIDw9IHNlZ21lbnRzKVxuICAgICAgICB7XG4gICAgICAgICAgICBwaGkgICAgPSBqICogMiAqIE1hdGguUEkgLyBzZWdtZW50cztcbiAgICAgICAgICAgIHBoaVNpbiA9IE1hdGguc2luKHBoaSk7XG4gICAgICAgICAgICBwaGlDb3MgPSBNYXRoLmNvcyhwaGkpO1xuXG4gICAgICAgICAgICB4ID0gcGhpQ29zICogdGhldGFTaW47XG4gICAgICAgICAgICB5ID0gdGhldGFDb3M7XG4gICAgICAgICAgICB6ID0gcGhpU2luICogdGhldGFTaW47XG5cbiAgICAgICAgICAgIGluZGV4ICAgICAgICAgID0gaiArIHNlZ21lbnRzICogaTtcbiAgICAgICAgICAgIGluZGV4VmVydGljZXMgID0gaW5kZXhOb3JtYWxzID0gaW5kZXggKiAzO1xuICAgICAgICAgICAgaW5kZXhUZXhDb29yZHMgPSBpbmRleCAqIDI7XG5cbiAgICAgICAgICAgIG5vcm1hbHMucHVzaCh4LHkseik7XG4gICAgICAgICAgICB2ZXJ0aWNlcy5wdXNoKHgseSx6KTtcblxuICAgICAgICAgICAgdSA9IDEgLSBqIC8gc2VnbWVudHM7XG4gICAgICAgICAgICB2ID0gMSAtIGkgLyBzZWdtZW50cztcblxuICAgICAgICAgICAgdGV4Q29vcmRzLnB1c2godSx2KTtcblxuICAgICAgICB9XG5cblxuICAgIH1cblxuICAgIHZhciBpbmRleDAsaW5kZXgxLGluZGV4MjtcblxuICAgIGkgPSAtMTtcbiAgICB3aGlsZSgrK2kgPCBzZWdtZW50cylcbiAgICB7XG4gICAgICAgIGogPSAtMTtcbiAgICAgICAgd2hpbGUoKytqIDwgc2VnbWVudHMpXG4gICAgICAgIHtcbiAgICAgICAgICAgIGluZGV4MCA9IGogKyBpICogKHNlZ21lbnRzICsgMSk7XG4gICAgICAgICAgICBpbmRleDEgPSBpbmRleDAgKyBzZWdtZW50cyArIDE7XG4gICAgICAgICAgICBpbmRleDIgPSBpbmRleDAgKyAxO1xuXG4gICAgICAgICAgICBpbmRpY2VzLnB1c2goaW5kZXgwLGluZGV4MSxpbmRleDIpO1xuXG4gICAgICAgICAgICBpbmRleDIgPSBpbmRleDAgKyAxO1xuICAgICAgICAgICAgaW5kZXgwID0gaW5kZXgxO1xuICAgICAgICAgICAgaW5kZXgxID0gaW5kZXgwICsgMTtcblxuICAgICAgICAgICAgaW5kaWNlcy5wdXNoKGluZGV4MCxpbmRleDEsaW5kZXgyKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuX2JWZXJ0ZXhTcGhlcmUgICAgICAgPSBuZXcgRmxvYXQzMkFycmF5KHZlcnRpY2VzKTtcbiAgICB0aGlzLl9iVmVydGV4U3BoZXJlU2NhbGVkID0gbmV3IEZsb2F0MzJBcnJheSh2ZXJ0aWNlcyk7XG4gICAgdGhpcy5fYk5vcm1hbFNwaGVyZSAgICAgICA9IG5ldyBGbG9hdDMyQXJyYXkobm9ybWFscyk7XG4gICAgdGhpcy5fYkNvbG9yU3BoZXJlICAgICAgICA9IG5ldyBGbG9hdDMyQXJyYXkoc2VnbWVudHMgKiBzZWdtZW50cyAqIDQpO1xuICAgIHRoaXMuX2JUZXhDb29yZHNTcGhlcmUgICAgPSBuZXcgRmxvYXQzMkFycmF5KGluZGljZXMpO1xuICAgIHRoaXMuX2JJbmRleFNwaGVyZSAgICAgICAgPSBuZXcgVWludDE2QXJyYXkoaW5kaWNlcyk7XG59O1xuXG5GR0wucHJvdG90eXBlLl9nZW5DaXJjbGUgPSBmdW5jdGlvbigpXG57XG4gICAgdmFyIGN4ID0gMCxcbiAgICAgICAgY3kgPSAwO1xuXG4gICAgdmFyIGQgPSB0aGlzLl9jaXJjbGVEZXRhaWxMYXN0LFxuICAgICAgICB2ID0gdGhpcy5fYlZlcnRleENpcmNsZSxcbiAgICAgICAgbCA9IGQgKiAzO1xuXG4gICAgdmFyIGkgPSAwO1xuXG4gICAgdmFyIHRoZXRhID0gMiAqIE1hdGguUEkgLyBkLFxuICAgICAgICBjID0gTWF0aC5jb3ModGhldGEpLFxuICAgICAgICBzID0gTWF0aC5zaW4odGhldGEpLFxuICAgICAgICB0O1xuXG4gICAgdmFyIG94ID0gMSxcbiAgICAgICAgb3kgPSAwO1xuXG4gICAgd2hpbGUoaSA8IGwpXG4gICAge1xuICAgICAgICB2W2kgIF0gPSBveCArIGN4O1xuICAgICAgICB2W2krMV0gPSAwO1xuICAgICAgICB2W2krMl0gPSBveSArIGN5O1xuXG4gICAgICAgIHQgID0gb3g7XG4gICAgICAgIG94ID0gYyAqIG94IC0gcyAqIG95O1xuICAgICAgICBveSA9IHMgKiB0ICArIGMgKiBveTtcblxuICAgICAgICBpKz0zO1xuICAgIH1cbn07XG5cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbi8vIGRlZmF1bHQgdmJvL2libyAvIHNoYWRlciBhdHRyaWJ1dGVzXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbkZHTC5wcm90b3R5cGUuZ2V0RGVmYXVsdFZCTyAgPSBmdW5jdGlvbigpe3JldHVybiB0aGlzLl9kZWZhdWx0VkJPO307XG5GR0wucHJvdG90eXBlLmdldERlZmF1bHRJQk8gID0gZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fZGVmYXVsdElCTzt9O1xuRkdMLnByb3RvdHlwZS5iaW5kRGVmYXVsdFZCTyA9IGZ1bmN0aW9uKCl7dGhpcy5nbC5iaW5kQnVmZmVyKHRoaXMuZ2wuQVJSQVlfQlVGRkVSLHRoaXMuX2RlZmF1bHRWQk8pO307XG5GR0wucHJvdG90eXBlLmJpbmREZWZhdWx0SUJPID0gZnVuY3Rpb24oKXt0aGlzLmdsLmJpbmRCdWZmZXIodGhpcy5nbC5FTEVNRU5UX0FSUkFZX0JVRkZFUix0aGlzLl9kZWZhdWx0SUJPKTt9O1xuXG5GR0wucHJvdG90eXBlLmdldERlZmF1bHRWZXJ0ZXhBdHRyaWIgICA9IGZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX2FWZXJ0ZXhQb3NpdGlvbjt9O1xuRkdMLnByb3RvdHlwZS5nZXREZWZhdWx0Tm9ybWFsQXR0cmliICAgPSBmdW5jdGlvbigpe3JldHVybiB0aGlzLl9hVmVydGV4Tm9ybWFsO307XG5GR0wucHJvdG90eXBlLmdldERlZmF1bHRDb2xvckF0dHJpYiAgICA9IGZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX2FWZXJ0ZXhDb2xvcjt9O1xuRkdMLnByb3RvdHlwZS5nZXREZWZhdWx0VGV4Q29vcmRBdHRyaWIgPSBmdW5jdGlvbigpe3JldHVybiB0aGlzLl9hVmVydGV4VGV4Q29vcmQ7fTtcblxuRkdMLnByb3RvdHlwZS5lbmFibGVEZWZhdWx0VmVydGV4QXR0cmliQXJyYXkgICAgID0gZnVuY3Rpb24oKXt0aGlzLmdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KHRoaXMuX2FWZXJ0ZXhQb3NpdGlvbik7fTtcbkZHTC5wcm90b3R5cGUuZW5hYmxlRGVmYXVsdE5vcm1hbEF0dHJpYkFycmF5ICAgICA9IGZ1bmN0aW9uKCl7dGhpcy5nbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheSh0aGlzLl9hVmVydGV4Tm9ybWFsKTt9O1xuRkdMLnByb3RvdHlwZS5lbmFibGVEZWZhdWx0Q29sb3JBdHRyaWJBcnJheSAgICAgID0gZnVuY3Rpb24oKXt0aGlzLmdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KHRoaXMuX2FWZXJ0ZXhDb2xvcik7fTtcbkZHTC5wcm90b3R5cGUuZW5hYmxlRGVmYXVsdFRleENvb3Jkc0F0dHJpYkFycmF5ICA9IGZ1bmN0aW9uKCl7dGhpcy5nbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheSh0aGlzLl9hVmVydGV4VGV4Q29vcmQpO307XG5cbkZHTC5wcm90b3R5cGUuZGlzYWJsZURlZmF1bHRWZXJ0ZXhBdHRyaWJBcnJheSAgICA9IGZ1bmN0aW9uKCl7dGhpcy5nbC5kaXNhYmxlVmVydGV4QXR0cmliQXJyYXkodGhpcy5fYVZlcnRleFBvc2l0aW9uKTt9O1xuRkdMLnByb3RvdHlwZS5kaXNhYmxlRGVmYXVsdE5vcm1hbEF0dHJpYkFycmF5ICAgID0gZnVuY3Rpb24oKXt0aGlzLmdsLmRpc2FibGVWZXJ0ZXhBdHRyaWJBcnJheSh0aGlzLl9hVmVydGV4Tm9ybWFsKTt9O1xuRkdMLnByb3RvdHlwZS5kaXNhYmxlRGVmYXVsdENvbG9yQXR0cmliQXJyYXkgICAgID0gZnVuY3Rpb24oKXt0aGlzLmdsLmRpc2FibGVWZXJ0ZXhBdHRyaWJBcnJheSh0aGlzLl9hVmVydGV4Q29sb3IpO307XG5GR0wucHJvdG90eXBlLmRpc2FibGVEZWZhdWx0VGV4Q29vcmRzQXR0cmliQXJyYXkgPSBmdW5jdGlvbigpe3RoaXMuZ2wuZGlzYWJsZVZlcnRleEF0dHJpYkFycmF5KHRoaXMuX2FWZXJ0ZXhUZXhDb29yZCk7fTtcblxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuLy8gY29udmVuaWVuY2UgZHJhd1xuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4vL1RPRE86cmVtb3ZlXG5cbkZHTC5wcm90b3R5cGUuYm94ID0gZnVuY3Rpb24od2lkdGgsaGVpZ2h0LGRlcHRoKVxue1xuICAgIHRoaXMucHVzaE1hdHJpeCgpO1xuICAgIHRoaXMuc2NhbGUzZih3aWR0aCxoZWlnaHQsZGVwdGgpO1xuICAgIHRoaXMuZHJhd0VsZW1lbnRzKHRoaXMuX2JWZXJ0ZXhDdWJlLHRoaXMuX2JOb3JtYWxDdWJlLHRoaXMuYnVmZmVyQ29sb3JzKHRoaXMuX2JDb2xvcix0aGlzLl9iQ29sb3JDdWJlKSx0aGlzLl9iVGV4Q29vcmRDdWJlLHRoaXMuX2JJbmRleEN1YmUsdGhpcy5fZHJhd01vZGUpO1xuICAgIHRoaXMucG9wTWF0cml4KCk7XG5cbiAgICB0aGlzLl9kcmF3RnVuY0xhc3QgPSB0aGlzLmJveDtcbn07XG5cbkZHTC5wcm90b3R5cGUuY3ViZSA9IGZ1bmN0aW9uKHNpemUpXG57XG4gICAgc2l6ZSA9IHNpemUgfHwgMTtcblxuICAgIHZhciBjdWJlU2NhbGVMYXN0ICAgID0gdGhpcy5fY3ViZVNjYWxlTGFzdCxcbiAgICAgICAgY3ViZVZlcnRpY2VzTGFzdCA9IHRoaXMuX2JWZXJ0ZXhDdWJlU2NhbGVkO1xuXG4gICAgaWYodGhpcy5fYlVzZURyYXdFbGVtZW50QXJyYXlCYXRjaClcbiAgICB7XG4gICAgICAgIHRoaXMuX3B1c2hFbGVtZW50QXJyYXlCYXRjaCgoc2l6ZSA9PSBjdWJlU2NhbGVMYXN0KSA/IGN1YmVWZXJ0aWNlc0xhc3QgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2NhbGVWZXJ0aWNlcyh0aGlzLl9iVmVydGV4Q3ViZSxzaXplLGN1YmVWZXJ0aWNlc0xhc3QpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fYk5vcm1hbEN1YmUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmJ1ZmZlckNvbG9ycyh0aGlzLl9iQ29sb3IsdGhpcy5fYkNvbG9yQ3ViZSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9iVGV4Q29vcmRDdWJlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fYkluZGV4Q3ViZSk7XG5cbiAgICB9XG4gICAgZWxzZVxuICAgIHtcbiAgICAgICAgdGhpcy5kcmF3RWxlbWVudHMoKHNpemUgPT0gY3ViZVNjYWxlTGFzdCkgPyBjdWJlVmVydGljZXNMYXN0IDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2NhbGVWZXJ0aWNlcyh0aGlzLl9iVmVydGV4Q3ViZSxzaXplLGN1YmVWZXJ0aWNlc0xhc3QpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9iTm9ybWFsQ3ViZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5idWZmZXJDb2xvcnModGhpcy5fYkNvbG9yLHRoaXMuX2JDb2xvckN1YmUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9iVGV4Q29vcmRDdWJlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9iSW5kZXhDdWJlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9kcmF3TW9kZSk7XG5cbiAgICB9XG5cblxuICAgIHRoaXMuX2N1YmVTY2FsZUxhc3QgPSBzaXplO1xuICAgIHRoaXMuX2RyYXdGdW5jTGFzdCAgPSB0aGlzLmN1YmU7XG5cbn07XG5cbkZHTC5wcm90b3R5cGUuc3BoZXJlID0gZnVuY3Rpb24oc2l6ZSlcbntcbiAgICBzaXplID0gc2l6ZSB8fCAxO1xuXG4gICAgdmFyIHNwaGVyZVNjYWxlTGFzdCAgICAgID0gdGhpcy5fc3BoZXJlU2NhbGVMYXN0LFxuICAgICAgICBzcGhlcmVWZXJ0aWNlc1NjYWxlZCA9IHRoaXMuX2JWZXJ0ZXhTcGhlcmVTY2FsZWQ7XG5cbiAgICBpZih0aGlzLl9iVXNlRHJhd0VsZW1lbnRBcnJheUJhdGNoKVxuICAgIHtcbiAgICAgICAgdGhpcy5fcHVzaEVsZW1lbnRBcnJheUJhdGNoKChzaXplID09IHNwaGVyZVNjYWxlTGFzdCkgPyBzcGhlcmVWZXJ0aWNlc1NjYWxlZCA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9zY2FsZVZlcnRpY2VzKHRoaXMuX2JWZXJ0ZXhTcGhlcmUsc2l6ZSxzcGhlcmVWZXJ0aWNlc1NjYWxlZCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9iTm9ybWFsU3BoZXJlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5idWZmZXJDb2xvcnModGhpcy5fYkNvbG9yLHRoaXMuX2JDb2xvclNwaGVyZSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9iVGV4Q29vcmRzU3BoZXJlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fYkluZGV4U3BoZXJlKTtcbiAgICB9XG4gICAgZWxzZVxuICAgIHtcbiAgICAgICAgdGhpcy5kcmF3RWxlbWVudHMoKHNpemUgPT0gc3BoZXJlU2NhbGVMYXN0KSA/IHNwaGVyZVZlcnRpY2VzU2NhbGVkIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2NhbGVWZXJ0aWNlcyh0aGlzLl9iVmVydGV4U3BoZXJlLHNpemUsc3BoZXJlVmVydGljZXNTY2FsZWQpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9iTm9ybWFsU3BoZXJlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmJ1ZmZlckNvbG9ycyh0aGlzLl9iQ29sb3IsdGhpcy5fYkNvbG9yU3BoZXJlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fYlRleENvb3Jkc1NwaGVyZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fYkluZGV4U3BoZXJlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9kcmF3TW9kZSk7XG5cbiAgICB9XG5cbiAgICB0aGlzLl9zcGhlcmVTY2FsZUxhc3QgPSBzaXplO1xuICAgIHRoaXMuX2RyYXdGdW5jTGFzdCAgICA9IHRoaXMuc3BoZXJlO1xufTtcblxuLy9UT0RPOiByZW1vdmUgISEhISEhISEhISEhISEhXG5cbkZHTC5wcm90b3R5cGUubGluZUJveCA9IGZ1bmN0aW9uKHYwLHYxKXt0aGlzLmxpbmVCb3hmKHYwWzBdLHYwWzFdLHYwWzJdLHYxWzBdLHYxWzFdLHYxWzJdKTt9O1xuXG5GR0wucHJvdG90eXBlLmxpbmVCb3hmID0gZnVuY3Rpb24oeDAseTAsejAseDEseTEsejEpXG57XG5cblxuICAgIHZhciBwMCA9IHRoaXMuX2JQb2ludDAsXG4gICAgICAgIHAxID0gdGhpcy5fYlBvaW50MSxcbiAgICAgICAgdXAgPSB0aGlzLl9heGlzWTtcblxuICAgIFZlYzMuc2V0M2YocDAseDAseTAsejApO1xuICAgIFZlYzMuc2V0M2YocDEseDEseTEsejEpO1xuXG4gICAgdmFyIGxlbiA9IFZlYzMuZGlzdGFuY2UocDAscDEpLFxuICAgICAgICBtaWQgPSBWZWMzLnNjYWxlKFZlYzMuYWRkZWQocDAscDEpLDAuNSksXG4gICAgICAgIGRpciA9IFZlYzMubm9ybWFsaXplKFZlYzMuc3ViYmVkKHAxLHAwKSksXG4gICAgICAgIGMgICA9IFZlYzMuZG90KGRpcix1cCk7XG5cbiAgICB2YXIgYW5nbGUgPSBNYXRoLmFjb3MoYyksXG4gICAgICAgIGF4aXMgID0gVmVjMy5ub3JtYWxpemUoVmVjMy5jcm9zcyh1cCxkaXIpKTtcblxuICAgIHRoaXMucHVzaE1hdHJpeCgpO1xuICAgIHRoaXMudHJhbnNsYXRlKG1pZCk7XG4gICAgdGhpcy5yb3RhdGVBeGlzKGFuZ2xlLGF4aXMpO1xuICAgIHRoaXMuYm94KHRoaXMuX2xpbmVCb3hXaWR0aCxsZW4sdGhpcy5fbGluZUJveEhlaWdodCk7XG4gICAgdGhpcy5wb3BNYXRyaXgoKTtcbn07XG5cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbi8vIGNvbnZlbmllbmNlIGJpbmRpbmdzIGdsXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbkZHTC5wcm90b3R5cGUuZW5hYmxlICAgICAgICAgICAgICAgID0gZnVuY3Rpb24oaWQpe3RoaXMuZ2wuZW5hYmxlKGlkKTt9O1xuRkdMLnByb3RvdHlwZS5kaXNhYmxlICAgICAgICAgICAgICAgPSBmdW5jdGlvbihpZCl7dGhpcy5nbC5kaXNhYmxlKGlkKTt9O1xuXG5GR0wucHJvdG90eXBlLmJsZW5kQ29sb3IgICAgICAgICAgICA9IGZ1bmN0aW9uKHIsZyxiLGEpe3RoaXMuZ2wuYmxlbmRDb2xvcihyLGcsYixhKTt9O1xuRkdMLnByb3RvdHlwZS5ibGVuZEVxdWF0aW9uICAgICAgICAgPSBmdW5jdGlvbihtb2RlKXt0aGlzLmdsLmJsZW5kRXF1YXRpb24obW9kZSk7fTtcbkZHTC5wcm90b3R5cGUuYmxlbmRFcXVhdGlvblNlcGFyYXRlID0gZnVuY3Rpb24oc2ZhY3RvcixkZmFjdG9yKXt0aGlzLmdsLmJsZW5kRXF1YXRpb25TZXBhcmF0ZShzZmFjdG9yLGRmYWN0b3IpO307XG5GR0wucHJvdG90eXBlLmJsZW5kRnVuYyAgICAgICAgICAgICA9IGZ1bmN0aW9uKHNmYWN0b3IsZGZhY3Rvcil7dGhpcy5nbC5ibGVuZEZ1bmMoc2ZhY3RvcixkZmFjdG9yKTt9O1xuRkdMLnByb3RvdHlwZS5ibGVuZEZ1bmNTZXBhcmF0ZSAgICAgPSBmdW5jdGlvbihzcmNSR0IsZHN0UkdCLHNyY0FscGhhLGRzdEFscGhhKXt0aGlzLmdsLmJsZW5kRnVuY1NlcGFyYXRlKHNyY1JHQixkc3RSR0Isc3JjQWxwaGEsZHN0QWxwaGEpO307XG5GR0wucHJvdG90eXBlLmRlcHRoRnVuYyAgICAgICAgICAgICA9IGZ1bmN0aW9uKGZ1bmMpe3RoaXMuZ2wuZGVwdGhGdW5jKGZ1bmMpO307XG5GR0wucHJvdG90eXBlLnNhbXBsZUNvdmVyYWdlICAgICAgICA9IGZ1bmN0aW9uKHZhbHVlLGludmVydCl7dGhpcy5nbC5zYW1wbGVDb3ZlcmFnZSh2YWx1ZSxpbnZlcnQpO307XG5GR0wucHJvdG90eXBlLnN0ZW5jaWxGdW5jICAgICAgICAgICA9IGZ1bmN0aW9uKGZ1bmMscmVmLG1hc2spe3RoaXMuZ2wuc3RlbmNpbEZ1bmMoZnVuYyxyZWYsbWFzayk7fTtcbkZHTC5wcm90b3R5cGUuc3RlbmNpbEZ1bmNTZXBhcmF0ZSAgID0gZnVuY3Rpb24oZmFjZSxmdW5jLHJlZixtYXNrKXt0aGlzLmdsLnN0ZW5jaWxGdW5jU2VwYXJhdGUoZmFjZSxmdW5jLHJlZixtYXNrKTt9O1xuRkdMLnByb3RvdHlwZS5zdGVuY2lsT3AgICAgICAgICAgICAgPSBmdW5jdGlvbihmYWlsLHpmYWlsLHpwYXNzKXt0aGlzLmdsLnN0ZW5jaWxPcChmYWlsLHpmYWlsLHpwYXNzKTt9O1xuRkdMLnByb3RvdHlwZS5zdGVuY2lsT3BTZXBhcmF0ZSAgICAgPSBmdW5jdGlvbihmYWNlLGZhaWwsemZhaWwsenBhc3Mpe3RoaXMuZ2wuc3RlbmNpbE9wU2VwYXJhdGUoZmFjZSxmYWlsLHpmYWlsLHpwYXNzKTt9O1xuXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4vLyBXb3JsZCAtPiBTY3JlZW5cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuLy9UT0RPOiBGaXggbWVcbkZHTC5wcm90b3R5cGUuZ2V0U2NyZWVuQ29vcmQzZiA9IGZ1bmN0aW9uKHgseSx6KVxue1xuICAgIHZhciBtcG0gPSBNYXQ0NC5tdWx0KHRoaXMuX2NhbWVyYS5wcm9qZWN0aW9uTWF0cml4LHRoaXMuX21Nb2RlbFZpZXcpO1xuICAgIHZhciBwM2QgPSBNYXQ0NC5tdWx0VmVjMyhtcG0sVmVjMy5tYWtlKHgseSx6KSk7XG5cbiAgICB2YXIgYnNjID0gdGhpcy5fYlNjcmVlbkNvb3JkcztcbiAgICBic2NbMF0gPSAoKChwM2RbMF0gKyAxKSAqIDAuNSkgKiB3aW5kb3cuaW5uZXJXaWR0aCk7XG4gICAgYnNjWzFdID0gKCgoMSAtIHAzZFsxXSkgKiAwLjUpICogd2luZG93LmlubmVySGVpZ2h0KTtcblxuICAgIHJldHVybiBic2M7XG59O1xuXG5GR0wucHJvdG90eXBlLmdldFNjcmVlbkNvb3JkID0gZnVuY3Rpb24odilcbntcbiAgICByZXR1cm4gdGhpcy5nZXRTY3JlZW5Db29yZDNmKHZbMF0sdlsxXSx2WzFdKTtcbn07XG5cblxuXG5cbkZHTC5wcm90b3R5cGUuZ2V0TW9kZWxWaWV3TWF0cml4ICA9IGZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX21Nb2RlbFZpZXc7fTtcbkZHTC5wcm90b3R5cGUuZ2V0UHJvamVjdGlvbk1hdHJpeCA9IGZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX2NhbWVyYS5wcm9qZWN0aW9uTWF0cml4O307XG5cblxuXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gRkdMOyIsInZhciBWZWMzICA9IHJlcXVpcmUoJy4uLy4uL21hdGgvZlZlYzMnKSxcbiAgICBMaWdodCA9IHJlcXVpcmUoJy4vZkxpZ2h0Jyk7XG5cbmZ1bmN0aW9uIERpcmVjdGlvbmFsTGlnaHQoaWQpXG57XG4gICAgTGlnaHQuYXBwbHkodGhpcyxhcmd1bWVudHMpO1xufVxuXG5EaXJlY3Rpb25hbExpZ2h0LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoTGlnaHQucHJvdG90eXBlKTtcblxuRGlyZWN0aW9uYWxMaWdodC5wcm90b3R5cGUuc2V0RGlyZWN0aW9uICAgPSBmdW5jdGlvbih2KSAgICB7VmVjMy5zZXQodGhpcy5kaXJlY3Rpb24sdik7fTtcbkRpcmVjdGlvbmFsTGlnaHQucHJvdG90eXBlLnNldERpcmVjdGlvbjNmID0gZnVuY3Rpb24oeCx5LHope1ZlYzMuc2V0M2YodGhpcy5kaXJlY3Rpb24seCx5LHopO307XG5cbkRpcmVjdGlvbmFsTGlnaHQucHJvdG90eXBlLmxvb2tBdCAgICAgICAgID0gZnVuY3Rpb24ocG9zaXRpb24sdGFyZ2V0KVxue1xuICAgIHRoaXMuc2V0UG9zaXRpb24ocG9zaXRpb24pO1xuICAgIHRoaXMuc2V0RGlyZWN0aW9uKFZlYzMubm9ybWFsaXplKFZlYzMuc3ViYmVkKHRhcmdldCxwb3NpdGlvbikpKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRGlyZWN0aW9uYWxMaWdodDsiLCJ2YXIgVmVjMyA9IHJlcXVpcmUoJy4uLy4uL21hdGgvZlZlYzMnKSxcbiAgICBWZWM0ID0gcmVxdWlyZSgnLi4vLi4vbWF0aC9mVmVjNCcpO1xuXG5mdW5jdGlvbiBMaWdodChpZClcbntcbiAgICB0aGlzLl9pZCAgID0gaWQ7XG5cbiAgICB0aGlzLmFtYmllbnQgID0gbmV3IEZsb2F0MzJBcnJheShbMSwxLDFdKTtcbiAgICB0aGlzLmRpZmZ1c2UgID0gbmV3IEZsb2F0MzJBcnJheShbMSwxLDFdKTtcbiAgICB0aGlzLnNwZWN1bGFyID0gbmV3IEZsb2F0MzJBcnJheShbMSwxLDFdKTtcblxuICAgIHRoaXMucG9zaXRpb24gICAgICAgICAgICAgPSBWZWM0LlpFUk8oKTtcbiAgICB0aGlzLmRpcmVjdGlvbiAgICAgICAgICAgID0gbnVsbDtcbiAgICB0aGlzLnNwb3RFeHBvbmVudCAgICAgICAgID0gbnVsbDtcbiAgICB0aGlzLnNwb3RDdXRPZmYgICAgICAgICAgID0gbnVsbDtcblxuICAgIHRoaXMuY29uc3RhbnRBdHRlbnR1YXRpb24gPSAxLjA7XG4gICAgdGhpcy5saW5lYXJBdHRlbnR1YXRpb24gICA9IDA7XG4gICAgdGhpcy5xdWFkcmljQXR0ZW50dWF0aW9uICA9IDAuMDE7XG59XG5cblxuTGlnaHQucHJvdG90eXBlLnNldEFtYmllbnQgICAgID0gZnVuY3Rpb24oY29sb3IpICB7dGhpcy5hbWJpZW50WzBdID0gY29sb3JbMF07dGhpcy5hbWJpZW50WzFdID0gY29sb3JbMV07dGhpcy5hbWJpZW50WzJdID0gY29sb3JbMl07fTtcbkxpZ2h0LnByb3RvdHlwZS5zZXRBbWJpZW50M2YgICA9IGZ1bmN0aW9uKHIsZyxiKSAge3RoaXMuYW1iaWVudFswXSA9IHI7dGhpcy5hbWJpZW50WzFdID0gZzt0aGlzLmFtYmllbnRbMl0gPSBiO307XG5cbkxpZ2h0LnByb3RvdHlwZS5zZXREaWZmdXNlICAgICA9IGZ1bmN0aW9uKGNvbG9yKSAge3RoaXMuZGlmZnVzZVswXSA9IGNvbG9yWzBdO3RoaXMuZGlmZnVzZVsxXSA9IGNvbG9yWzFdO3RoaXMuZGlmZnVzZVsyXSA9IGNvbG9yWzJdO307XG5MaWdodC5wcm90b3R5cGUuc2V0RGlmZnVzZTNmICAgPSBmdW5jdGlvbihyLGcsYikgIHt0aGlzLmRpZmZ1c2VbMF0gPSByO3RoaXMuZGlmZnVzZVsxXSA9IGc7dGhpcy5kaWZmdXNlWzJdID0gYjt9O1xuXG5MaWdodC5wcm90b3R5cGUuc2V0U3BlY3VsYXIgICAgPSBmdW5jdGlvbihjb2xvcikgIHt0aGlzLnNwZWN1bGFyWzBdID0gY29sb3JbMF07dGhpcy5zcGVjdWxhclsxXSA9IGNvbG9yWzFdO3RoaXMuc3BlY3VsYXJbMl0gPSBjb2xvclsyXTt9O1xuTGlnaHQucHJvdG90eXBlLnNldFNwZWN1bGFyM2YgID0gZnVuY3Rpb24ocixnLGIpICB7dGhpcy5zcGVjdWxhclswXSA9IHI7dGhpcy5zcGVjdWxhclsxXSA9IGc7dGhpcy5zcGVjdWxhclsyXSA9IGI7fTtcblxuTGlnaHQucHJvdG90eXBlLnNldFBvc2l0aW9uICAgID0gZnVuY3Rpb24odikgICAge1ZlYzQuc2V0M2YodGhpcy5wb3NpdGlvbix2WzBdLHZbMV0sdlsyXSk7fTtcbkxpZ2h0LnByb3RvdHlwZS5zZXRQb3NpdGlvbjNmICA9IGZ1bmN0aW9uKHgseSx6KXtWZWMzLnNldDNmKHRoaXMucG9zaXRpb24seCx5LHopO307XG5cbkxpZ2h0LnByb3RvdHlwZS5nZXRJZCA9IGZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX2lkO307XG5cbm1vZHVsZS5leHBvcnRzID0gTGlnaHQ7IiwidmFyIE1hdDQ0ID0gcmVxdWlyZSgnLi4vLi4vbWF0aC9mTWF0NDQnKTtcblxubW9kdWxlLmV4cG9ydHMgPVxue1xuICAgIHBlcnNwZWN0aXZlIDogZnVuY3Rpb24obSxmb3YsYXNwZWN0LG5lYXIsZmFyKVxuICAgIHtcbiAgICAgICAgdmFyIGYgID0gMS4wIC8gTWF0aC50YW4oZm92KjAuNSksXG4gICAgICAgICAgICBuZiA9IDEuMCAvIChuZWFyLWZhcik7XG5cbiAgICAgICAgbVswXSA9IGYgLyBhc3BlY3Q7XG4gICAgICAgIG1bMV0gPSAwO1xuICAgICAgICBtWzJdID0gMDtcbiAgICAgICAgbVszXSA9IDA7XG4gICAgICAgIG1bNF0gPSAwO1xuICAgICAgICBtWzVdID0gZjtcbiAgICAgICAgbVs2XSA9IDA7XG4gICAgICAgIG1bN10gPSAwO1xuICAgICAgICBtWzhdID0gMDtcbiAgICAgICAgbVs5XSA9IDA7XG4gICAgICAgIG1bMTBdID0gKGZhciArIG5lYXIpICogbmY7XG4gICAgICAgIG1bMTFdID0gLTE7XG4gICAgICAgIG1bMTJdID0gMDtcbiAgICAgICAgbVsxM10gPSAwO1xuICAgICAgICBtWzE0XSA9ICgyICogZmFyICogbmVhcikgKiBuZjtcbiAgICAgICAgbVsxNV0gPSAwO1xuXG4gICAgICAgIHJldHVybiBtO1xuXG4gICAgfSxcblxuICAgIGZydXN0dW0gOiBmdW5jdGlvbihtLGxlZnQscmlnaHQsYm90dG9tLHRvcCxuZWFyLGZhcilcbiAgICB7XG4gICAgICAgIHZhciBybCA9IDEgLyAocmlnaHQgLSBsZWZ0KSxcbiAgICAgICAgICAgIHRiID0gMSAvICh0b3AgLSBib3R0b20pLFxuICAgICAgICAgICAgbmYgPSAxIC8gKG5lYXIgLSBmYXIpO1xuXG5cbiAgICAgICAgbVsgMF0gPSAobmVhciAqIDIpICogcmw7XG4gICAgICAgIG1bIDFdID0gMDtcbiAgICAgICAgbVsgMl0gPSAwO1xuICAgICAgICBtWyAzXSA9IDA7XG4gICAgICAgIG1bIDRdID0gMDtcbiAgICAgICAgbVsgNV0gPSAobmVhciAqIDIpICogdGI7XG4gICAgICAgIG1bIDZdID0gMDtcbiAgICAgICAgbVsgN10gPSAwO1xuICAgICAgICBtWyA4XSA9IChyaWdodCArIGxlZnQpICogcmw7XG4gICAgICAgIG1bIDldID0gKHRvcCArIGJvdHRvbSkgKiB0YjtcbiAgICAgICAgbVsxMF0gPSAoZmFyICsgbmVhcikgKiBuZjtcbiAgICAgICAgbVsxMV0gPSAtMTtcbiAgICAgICAgbVsxMl0gPSAwO1xuICAgICAgICBtWzEzXSA9IDA7XG4gICAgICAgIG1bMTRdID0gKGZhciAqIG5lYXIgKiAyKSAqIG5mO1xuICAgICAgICBtWzE1XSA9IDA7XG5cbiAgICAgICAgcmV0dXJuIG07XG4gICAgfSxcblxuICAgIGxvb2tBdCA6IGZ1bmN0aW9uKG0sZXllLHRhcmdldCx1cClcbiAgICB7XG4gICAgICAgIHZhciB4MCwgeDEsIHgyLCB5MCwgeTEsIHkyLCB6MCwgejEsIHoyLCBsZW4sXG4gICAgICAgICAgICBleWV4ID0gZXllWzBdLFxuICAgICAgICAgICAgZXlleSA9IGV5ZVsxXSxcbiAgICAgICAgICAgIGV5ZXogPSBleWVbMl0sXG4gICAgICAgICAgICB1cHggPSB1cFswXSxcbiAgICAgICAgICAgIHVweSA9IHVwWzFdLFxuICAgICAgICAgICAgdXB6ID0gdXBbMl0sXG4gICAgICAgICAgICB0YXJnZXR4ID0gdGFyZ2V0WzBdLFxuICAgICAgICAgICAgdGFydGV0eSA9IHRhcmdldFsxXSxcbiAgICAgICAgICAgIHRhcmdldHogPSB0YXJnZXRbMl07XG5cbiAgICAgICAgaWYgKE1hdGguYWJzKGV5ZXggLSB0YXJnZXR4KSA8IDAuMDAwMDAxICYmXG4gICAgICAgICAgICBNYXRoLmFicyhleWV5IC0gdGFydGV0eSkgPCAwLjAwMDAwMSAmJlxuICAgICAgICAgICAgTWF0aC5hYnMoZXlleiAtIHRhcmdldHopIDwgMC4wMDAwMDEpIHtcbiAgICAgICAgICAgIHJldHVybiBNYXQ0NC5pZGVudGl0eShtKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHowID0gZXlleCAtIHRhcmdldHg7XG4gICAgICAgIHoxID0gZXlleSAtIHRhcnRldHk7XG4gICAgICAgIHoyID0gZXlleiAtIHRhcmdldHo7XG5cbiAgICAgICAgbGVuID0gMSAvIE1hdGguc3FydCh6MCAqIHowICsgejEgKiB6MSArIHoyICogejIpO1xuICAgICAgICB6MCAqPSBsZW47XG4gICAgICAgIHoxICo9IGxlbjtcbiAgICAgICAgejIgKj0gbGVuO1xuXG4gICAgICAgIHgwID0gdXB5ICogejIgLSB1cHogKiB6MTtcbiAgICAgICAgeDEgPSB1cHogKiB6MCAtIHVweCAqIHoyO1xuICAgICAgICB4MiA9IHVweCAqIHoxIC0gdXB5ICogejA7XG4gICAgICAgIGxlbiA9IE1hdGguc3FydCh4MCAqIHgwICsgeDEgKiB4MSArIHgyICogeDIpO1xuICAgICAgICBpZiAoIWxlbikge1xuICAgICAgICAgICAgeDAgPSAwO1xuICAgICAgICAgICAgeDEgPSAwO1xuICAgICAgICAgICAgeDIgPSAwO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGVuID0gMSAvIGxlbjtcbiAgICAgICAgICAgIHgwICo9IGxlbjtcbiAgICAgICAgICAgIHgxICo9IGxlbjtcbiAgICAgICAgICAgIHgyICo9IGxlbjtcbiAgICAgICAgfVxuXG4gICAgICAgIHkwID0gejEgKiB4MiAtIHoyICogeDE7XG4gICAgICAgIHkxID0gejIgKiB4MCAtIHowICogeDI7XG4gICAgICAgIHkyID0gejAgKiB4MSAtIHoxICogeDA7XG5cbiAgICAgICAgbGVuID0gTWF0aC5zcXJ0KHkwICogeTAgKyB5MSAqIHkxICsgeTIgKiB5Mik7XG4gICAgICAgIGlmICghbGVuKSB7XG4gICAgICAgICAgICB5MCA9IDA7XG4gICAgICAgICAgICB5MSA9IDA7XG4gICAgICAgICAgICB5MiA9IDA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZW4gPSAxIC8gbGVuO1xuICAgICAgICAgICAgeTAgKj0gbGVuO1xuICAgICAgICAgICAgeTEgKj0gbGVuO1xuICAgICAgICAgICAgeTIgKj0gbGVuO1xuICAgICAgICB9XG5cbiAgICAgICAgbVsgMF0gPSB4MDtcbiAgICAgICAgbVsgMV0gPSB5MDtcbiAgICAgICAgbVsgMl0gPSB6MDtcbiAgICAgICAgbVsgM10gPSAwO1xuICAgICAgICBtWyA0XSA9IHgxO1xuICAgICAgICBtWyA1XSA9IHkxO1xuICAgICAgICBtWyA2XSA9IHoxO1xuICAgICAgICBtWyA3XSA9IDA7XG4gICAgICAgIG1bIDhdID0geDI7XG4gICAgICAgIG1bIDldID0geTI7XG4gICAgICAgIG1bMTBdID0gejI7XG4gICAgICAgIG1bMTFdID0gMDtcbiAgICAgICAgbVsxMl0gPSAtKHgwICogZXlleCArIHgxICogZXlleSArIHgyICogZXlleik7XG4gICAgICAgIG1bMTNdID0gLSh5MCAqIGV5ZXggKyB5MSAqIGV5ZXkgKyB5MiAqIGV5ZXopO1xuICAgICAgICBtWzE0XSA9IC0oejAgKiBleWV4ICsgejEgKiBleWV5ICsgejIgKiBleWV6KTtcbiAgICAgICAgbVsxNV0gPSAxO1xuXG4gICAgICAgIHJldHVybiBtO1xuICAgIH1cbn07IiwidmFyIENvbG9yID0gcmVxdWlyZSgnLi4vLi4vdXRpbC9mQ29sb3InKTtcblxuZnVuY3Rpb24gTWF0ZXJpYWwoYW1iaWVudCxkaWZmdXNlLHNwZWN1bGFyLHNoaW5pbmVzcyxlbWlzc2lvbilcbntcbiAgICBhbWJpZW50ICAgPSBhbWJpZW50ICAgfHwgQ29sb3IubWFrZSgxLjAsMC41LDAuNSwxLjApO1xuICAgIGRpZmZ1c2UgICA9IGRpZmZ1c2UgICB8fCBDb2xvci5CTEFDSygpO1xuICAgIHNwZWN1bGFyICA9IHNwZWN1bGFyICB8fCBDb2xvci5CTEFDSygpO1xuICAgIHNoaW5pbmVzcyA9IHNoaW5pbmVzcyB8fCAxMC4wO1xuICAgIGVtaXNzaW9uICA9IGVtaXNzaW9uICB8fCBDb2xvci5CTEFDSztcblxuICAgIHRoaXMuZW1pc3Npb24gID0gZW1pc3Npb247XG4gICAgdGhpcy5hbWJpZW50ICAgPSBhbWJpZW50O1xuICAgIHRoaXMuZGlmZnVzZSAgID0gZGlmZnVzZTtcbiAgICB0aGlzLnNwZWN1bGFyICA9IHNwZWN1bGFyO1xuICAgIHRoaXMuc2hpbmluZXNzID0gc2hpbmluZXNzO1xufVxuXG5NYXRlcmlhbC5wcm90b3R5cGUuc2V0RW1pc3Npb24gICA9IGZ1bmN0aW9uKGNvbG9yKSAge3RoaXMuZW1pc3Npb24gPSBjb2xvcjt9O1xuTWF0ZXJpYWwucHJvdG90eXBlLnNldEVtaXNzaW9uM2YgPSBmdW5jdGlvbihyLGcsYikgIHt0aGlzLmVtaXNzaW9uWzBdID0gcjt0aGlzLmVtaXNzaW9uWzFdID0gZzt0aGlzLmVtaXNzaW9uWzJdID0gYjt9O1xuTWF0ZXJpYWwucHJvdG90eXBlLnNldEVtaXNzaW9uNGYgPSBmdW5jdGlvbihyLGcsYixhKXt0aGlzLmVtaXNzaW9uWzBdID0gcjt0aGlzLmVtaXNzaW9uWzFdID0gZzt0aGlzLmVtaXNzaW9uWzJdID0gYjt0aGlzLmVtaXNzaW9uWzNdID0gYTt9O1xuXG5NYXRlcmlhbC5wcm90b3R5cGUuc2V0QW1iaWVudCAgID0gZnVuY3Rpb24oY29sb3IpICB7dGhpcy5hbWJpZW50ID0gY29sb3I7fTtcbk1hdGVyaWFsLnByb3RvdHlwZS5zZXRBbWJpZW50M2YgPSBmdW5jdGlvbihyLGcsYikgIHt0aGlzLmFtYmllbnRbMF0gPSByO3RoaXMuYW1iaWVudFsxXSA9IGc7dGhpcy5hbWJpZW50WzJdID0gYjt9O1xuTWF0ZXJpYWwucHJvdG90eXBlLnNldEFtYmllbnQ0ZiA9IGZ1bmN0aW9uKHIsZyxiLGEpe3RoaXMuYW1iaWVudFswXSA9IHI7dGhpcy5hbWJpZW50WzFdID0gZzt0aGlzLmFtYmllbnRbMl0gPSBiO3RoaXMuYW1iaWVudFszXSA9IGE7fTtcblxuTWF0ZXJpYWwucHJvdG90eXBlLnNldERpZmZ1c2UgICA9IGZ1bmN0aW9uKGNvbG9yKSAge3RoaXMuZGlmZnVzZSA9IGNvbG9yO307XG5NYXRlcmlhbC5wcm90b3R5cGUuc2V0RGlmZnVzZTNmID0gZnVuY3Rpb24ocixnLGIpICB7dGhpcy5kaWZmdXNlWzBdID0gcjt0aGlzLmRpZmZ1c2VbMV0gPSBnO3RoaXMuZGlmZnVzZVsyXSA9IGI7fTtcbk1hdGVyaWFsLnByb3RvdHlwZS5zZXREaWZmdXNlNGYgPSBmdW5jdGlvbihyLGcsYixhKXt0aGlzLmRpZmZ1c2VbMF0gPSByO3RoaXMuZGlmZnVzZVsxXSA9IGc7dGhpcy5kaWZmdXNlWzJdID0gYjt0aGlzLmRpZmZ1c2VbM10gPSBhO307XG5cbk1hdGVyaWFsLnByb3RvdHlwZS5zZXRTcGVjdWxhciAgID0gZnVuY3Rpb24oY29sb3IpICB7dGhpcy5zcGVjdWxhciA9IGNvbG9yO307XG5NYXRlcmlhbC5wcm90b3R5cGUuc2V0U3BlY3VsYXIzZiA9IGZ1bmN0aW9uKHIsZyxiKSAge3RoaXMuc3BlY3VsYXJbMF0gPSByO3RoaXMuc3BlY3VsYXJbMV0gPSBnO3RoaXMuc3BlY3VsYXJbMl0gPSBiO307XG5NYXRlcmlhbC5wcm90b3R5cGUuc2V0U3BlY3VsYXI0ZiA9IGZ1bmN0aW9uKHIsZyxiLGEpe3RoaXMuc3BlY3VsYXJbMF0gPSByO3RoaXMuc3BlY3VsYXJbMV0gPSBnO3RoaXMuc3BlY3VsYXJbMl0gPSBiO3RoaXMuc3BlY3VsYXJbM10gPSBhO307XG5cblxuTWF0ZXJpYWwucHJvdG90eXBlLmdldEVtaXNzaW9uICA9IGZ1bmN0aW9uKCl7cmV0dXJuIENvbG9yLmNvcHkodGhpcy5lbWlzc2lvbik7fTtcbk1hdGVyaWFsLnByb3RvdHlwZS5nZXRBbWJpZW50ICAgPSBmdW5jdGlvbigpe3JldHVybiBDb2xvci5jb3B5KHRoaXMuYW1iaWVudCk7fTtcbk1hdGVyaWFsLnByb3RvdHlwZS5nZXREaWZmdXNlICAgPSBmdW5jdGlvbigpe3JldHVybiBDb2xvci5jb3B5KHRoaXMuZGlmZnVzZSk7fTtcbk1hdGVyaWFsLnByb3RvdHlwZS5nZXRTcGVjdWxhciAgPSBmdW5jdGlvbigpe3JldHVybiBDb2xvci5jb3B5KHRoaXMuc3BlY3VsYXIpO307XG5NYXRlcmlhbC5wcm90b3R5cGUuZ2V0U2hpbmluZXNzID0gZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5zaGluaW5lc3M7fTtcblxubW9kdWxlLmV4cG9ydHMgPSBNYXRlcmlhbDtcbiIsInZhciBMaWdodCA9IHJlcXVpcmUoJy4vZkxpZ2h0Jyk7XG5cbmZ1bmN0aW9uIFBvaW50TGlnaHQoaWQpXG57XG4gICAgTGlnaHQuYXBwbHkodGhpcyxhcmd1bWVudHMpO1xufVxuXG5Qb2ludExpZ2h0LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoTGlnaHQucHJvdG90eXBlKTtcblxubW9kdWxlLmV4cG9ydHMgPSBQb2ludExpZ2h0OyIsInZhciBEaXJlY3Rpb25hbExpZ2h0ID0gcmVxdWlyZSgnLi9mRGlyZWN0aW9uYWxMaWdodCcpO1xuXG5mdW5jdGlvbiBTcG90TGlnaHQoaWQpXG57XG4gICAgRGlyZWN0aW9uYWxMaWdodC5hcHBseSh0aGlzLGFyZ3VtZW50cyk7XG59XG5cblNwb3RMaWdodC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKERpcmVjdGlvbmFsTGlnaHQucHJvdG90eXBlKTtcblxuU3BvdExpZ2h0LnByb3RvdHlwZS5zZXRFeHBvbmVudCA9IGZ1bmN0aW9uKCl7fTtcblNwb3RMaWdodC5wcm90b3R5cGUuc2V0Q3V0T2ZmICAgPSBmdW5jdGlvbigpe307XG5cbm1vZHVsZS5leHBvcnRzID0gU3BvdExpZ2h0OyIsIlxuZnVuY3Rpb24gVGV4dHVyZSgpXG57XG4gICAgdGhpcy5fdGV4ID0gbnVsbDtcbiAgICB0aGlzLl93aWR0aCA9IG51bGw7XG4gICAgdGhpcy5faGVpZ2h0ID0gbnVsbDtcblxuICAgIGlmKGFyZ3VtZW50cy5sZW5ndGggPT0gMSl0aGlzLnNldFRleFNvdXJjZShhcmd1bWVudHNbMF0pO1xufVxuXG5UZXh0dXJlLnByb3RvdHlwZS5zZXRUZXhTb3VyY2UgPSBmdW5jdGlvbihnbFRleClcbntcbiAgICB2YXIgdGV4ID0gdGhpcy5fdGV4ID0gZ2xUZXg7XG4gICAgdGhpcy5fd2lkdGggID0gdGV4LmltYWdlLndpZHRoO1xuICAgIHRoaXMuX2hlaWdodCA9IHRleC5pbWFnZS5oZWlnaHQ7XG59O1xuXG5UZXh0dXJlLnByb3RvdHlwZS5nZXRXaWR0aCAgPSBmdW5jdGlvbigpe3JldHVybiB0aGlzLl93aWR0aDt9O1xuVGV4dHVyZS5wcm90b3R5cGUuZ2V0SGVpZ2h0ID0gZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5faGVpZ2h0O307XG5cbm1vZHVsZS5leHBvcnRzID0gVGV4dHVyZTsiLCJtb2R1bGUuZXhwb3J0cyA9XCJ2YXJ5aW5nIHZlYzQgdlZlcnRleFBvc2l0aW9uO3ZhcnlpbmcgdmVjMyB2VmVydGV4Tm9ybWFsO3ZhcnlpbmcgdmVjNCB2VmVydGV4Q29sb3I7dmFyeWluZyB2ZWMyIHZWZXJ0ZXhUZXhDb29yZDt1bmlmb3JtIGZsb2F0IHVVc2VMaWdodGluZzt1bmlmb3JtIGZsb2F0IHVVc2VNYXRlcmlhbDt1bmlmb3JtIGZsb2F0IHVVc2VUZXh0dXJlO3VuaWZvcm0gbWF0MyB1Tm9ybWFsTWF0cml4O3VuaWZvcm0gdmVjMyB1QW1iaWVudDt1bmlmb3JtIHNhbXBsZXIyRCB1VGV4SW1hZ2U7Y29uc3QgaW50IE1BWF9MSUdIVFMgPSA4O3N0cnVjdCBMaWdodHsgdmVjNCBwb3NpdGlvbjsgdmVjMyBhbWJpZW50OyB2ZWMzIGRpZmZ1c2U7IHZlYzMgc3BlY3VsYXI7IHZlYzQgaGFsZlZlY3RvcjsgdmVjMyBzcG90RGlyZWN0aW9uOyBmbG9hdCBzcG90RXhwb25lbnQ7IGZsb2F0IHNwb3RDdXRvZmY7IGZsb2F0IHNwb3RDb3NDdXRvZmY7IGZsb2F0IGNvbnN0YW50QXR0ZW51YXRpb247IGZsb2F0IGxpbmVhckF0dGVudWF0aW9uOyBmbG9hdCBxdWFkcmF0aWNBdHRlbnVhdGlvbjt9O3N0cnVjdCBNYXRlcmlhbHsgdmVjNCBlbWlzc2lvbjsgdmVjNCBhbWJpZW50OyB2ZWM0IGRpZmZ1c2U7IHZlYzQgc3BlY3VsYXI7IGZsb2F0IHNoaW5pbmVzczt9O3N0cnVjdCBDb2xvckNvbXBvbmVudHsgdmVjNCBhbWJpZW50OyB2ZWM0IGRpZmZ1c2U7IHZlYzQgc3BlY3VsYXI7IGZsb2F0IHNoaW5pbmVzczt9O3ZlYzQgcGhvbmdNb2RlbCh2ZWM0IHBvc2l0aW9uLCB2ZWMzIG5vcm1hbCwgQ29sb3JDb21wb25lbnQgY29sb3IsIExpZ2h0IGxpZ2h0KXsgdmVjMyBkaWZmID0gbGlnaHQucG9zaXRpb24ueHl6IC0gcG9zaXRpb24ueHl6OyB2ZWMzIHMgPSBub3JtYWxpemUoZGlmZik7IHZlYzMgdiA9IG5vcm1hbGl6ZSgtcG9zaXRpb24ueHl6KTsgdmVjMyByID0gcmVmbGVjdCgtcywgbm9ybWFsKTsgZmxvYXQgc0RvdE4gPSBtYXgoZG90KHMsIG5vcm1hbCksIDAuMCk7IGZsb2F0IGRpc3QgPSBsZW5ndGgoZGlmZi54eXopOyBmbG9hdCBhdHQgPSAxLjAgLyAobGlnaHQuY29uc3RhbnRBdHRlbnVhdGlvbiArIGxpZ2h0LmxpbmVhckF0dGVudWF0aW9uICogZGlzdCArIGxpZ2h0LnF1YWRyYXRpY0F0dGVudWF0aW9uICogZGlzdCAqIGRpc3QpOyB2ZWMzIGFtYmllbnQgPSB1QW1iaWVudCAqIGxpZ2h0LmFtYmllbnQgKiBjb2xvci5hbWJpZW50LnJnYjsgdmVjMyBkaWZmdXNlID0gbGlnaHQuZGlmZnVzZSAqIGNvbG9yLmRpZmZ1c2UucmdiICogc0RvdE4gOyB2ZWMzIHNwZWN1bGFyID0gKChzRG90TiA+IDAuMCkgPyBsaWdodC5zcGVjdWxhciAqIHBvdyhtYXgoZG90KHIsIHYpLCAwLjApLCBjb2xvci5zaGluaW5lc3MpIDogdmVjMygwLjApKTsgcmV0dXJuIHZlYzQoYW1iaWVudCphdHQrIGRpZmZ1c2UqYXR0ICsgc3BlY3VsYXIqYXR0LGNvbG9yLmFtYmllbnQuYSk7fXVuaWZvcm0gTGlnaHQgdUxpZ2h0c1s4XTt1bmlmb3JtIE1hdGVyaWFsIHVNYXRlcmlhbDt2b2lkIG1haW4odm9pZCl7IGZsb2F0IHVzZUxpZ2h0aW5nSW52ID0gMS4wIC0gdVVzZUxpZ2h0aW5nOyBmbG9hdCB1c2VNYXRlcmlhbEludiA9IDEuMCAtIHVVc2VNYXRlcmlhbDsgZmxvYXQgdXNlVGV4dHVyZUludiA9IDEuMCAtIHVVc2VUZXh0dXJlOyB2ZWMzIHRWZXJ0ZXhOb3JtYWwgPSAoZ2xfRnJvbnRGYWNpbmcgPyAtMS4wIDogMS4wKSAqIG5vcm1hbGl6ZSh1Tm9ybWFsTWF0cml4ICogdlZlcnRleE5vcm1hbCk7IHZlYzQgdmVydGV4Q29sb3IgPSB2VmVydGV4Q29sb3IgKiB1c2VNYXRlcmlhbEludjsgdmVjNCB0ZXh0dXJlQ29sb3IgPSB0ZXh0dXJlMkQodVRleEltYWdlLHZWZXJ0ZXhUZXhDb29yZCk7IHZlYzQgcmVzdWx0Q29sb3IgPSB2ZXJ0ZXhDb2xvciAqIHVzZVRleHR1cmVJbnYgKyB0ZXh0dXJlQ29sb3IgKiB1VXNlVGV4dHVyZTsgQ29sb3JDb21wb25lbnQgY29sb3IgPSBDb2xvckNvbXBvbmVudCh1TWF0ZXJpYWwuYW1iaWVudCAqIHVVc2VNYXRlcmlhbCArIHJlc3VsdENvbG9yLCB1TWF0ZXJpYWwuZGlmZnVzZSAqIHVVc2VNYXRlcmlhbCArIHJlc3VsdENvbG9yLCB1TWF0ZXJpYWwuc3BlY3VsYXIgKiB1VXNlTWF0ZXJpYWwgKyByZXN1bHRDb2xvciwgdU1hdGVyaWFsLnNoaW5pbmVzcyAqIHVVc2VNYXRlcmlhbCArIHVzZU1hdGVyaWFsSW52KTsgdmVjNCBsaWdodGluZ0NvbG9yID0gdmVjNCgwLDAsMCwwKTsgZm9yKGludCBpID0gMDtpIDwgTUFYX0xJR0hUUztpKyspIHsgbGlnaHRpbmdDb2xvcis9cGhvbmdNb2RlbCh2VmVydGV4UG9zaXRpb24sdFZlcnRleE5vcm1hbCxjb2xvcix1TGlnaHRzW2ldKTsgfSBnbF9GcmFnQ29sb3IgPSB1VXNlTGlnaHRpbmcgKiBsaWdodGluZ0NvbG9yICsgdXNlTGlnaHRpbmdJbnYgKiAodlZlcnRleENvbG9yICogdXNlVGV4dHVyZUludiArIHRleHR1cmVDb2xvciAqIHVVc2VUZXh0dXJlKTt9XCI7IiwibW9kdWxlLmV4cG9ydHMgPVxue1xuICAgIGxvYWRQcm9ncmFtIDogZnVuY3Rpb24oZ2wsdmVydGV4U2hhZGVyLGZyYWdtZW50U2hhZGVyKVxuICAgIHtcbiAgICAgICAgdmFyIHByb2dyYW0gPSBnbC5jcmVhdGVQcm9ncmFtKCk7XG5cbiAgICAgICAgZ2wuYXR0YWNoU2hhZGVyKHByb2dyYW0sdmVydGV4U2hhZGVyKTtcbiAgICAgICAgZ2wuYXR0YWNoU2hhZGVyKHByb2dyYW0sZnJhZ21lbnRTaGFkZXIpO1xuICAgICAgICBnbC5saW5rUHJvZ3JhbShwcm9ncmFtKTtcblxuICAgICAgICBpZighZ2wuZ2V0UHJvZ3JhbVBhcmFtZXRlcihwcm9ncmFtLGdsLkxJTktfU1RBVFVTKSlcbiAgICAgICAge1xuICAgICAgICAgICAgZ2wuZGVsZXRlUHJvZ3JhbShwcm9ncmFtKTtcbiAgICAgICAgICAgIHByb2dyYW0gPSBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHByb2dyYW07XG4gICAgfVxufTsiLCJtb2R1bGUuZXhwb3J0cyA9XCJhdHRyaWJ1dGUgdmVjMyBhVmVydGV4UG9zaXRpb247YXR0cmlidXRlIHZlYzMgYVZlcnRleE5vcm1hbDthdHRyaWJ1dGUgdmVjNCBhVmVydGV4Q29sb3I7YXR0cmlidXRlIHZlYzIgYVZlcnRleFRleENvb3JkO3ZhcnlpbmcgdmVjNCB2VmVydGV4UG9zaXRpb247dmFyeWluZyB2ZWMzIHZWZXJ0ZXhOb3JtYWw7dmFyeWluZyB2ZWM0IHZWZXJ0ZXhDb2xvcjt2YXJ5aW5nIHZlYzIgdlZlcnRleFRleENvb3JkO3VuaWZvcm0gbWF0NCB1TW9kZWxWaWV3TWF0cml4O3VuaWZvcm0gbWF0NCB1UHJvamVjdGlvbk1hdHJpeDt1bmlmb3JtIGZsb2F0IHVQb2ludFNpemU7dm9pZCBtYWluKHZvaWQpeyB2VmVydGV4UG9zaXRpb24gPSB1TW9kZWxWaWV3TWF0cml4ICogdmVjNChhVmVydGV4UG9zaXRpb24sIDEuMCk7IHZWZXJ0ZXhOb3JtYWwgPSBhVmVydGV4Tm9ybWFsOyB2VmVydGV4Q29sb3IgPSBhVmVydGV4Q29sb3I7IHZWZXJ0ZXhUZXhDb29yZCA9IGFWZXJ0ZXhUZXhDb29yZDsgZ2xfUG9zaXRpb24gPSB1UHJvamVjdGlvbk1hdHJpeCAqIHZWZXJ0ZXhQb3NpdGlvbjsgZ2xfUG9pbnRTaXplID0gdVBvaW50U2l6ZTt9XCI7IiwibW9kdWxlLmV4cG9ydHMgPVxue1xuICAgIFByZWZpeFNoYWRlcldlYiA6ICdwcmVjaXNpb24gbWVkaXVtcCBmbG9hdDsnLFxuXG4gICAgbG9hZFNoYWRlckZyb21TdHJpbmcgOiBmdW5jdGlvbihnbCxzb3VyY2VTdHJpbmcsdHlwZSlcbiAgICB7XG4gICAgICAgIHZhciBzaGFkZXIgPSBnbC5jcmVhdGVTaGFkZXIodHlwZSk7XG5cbiAgICAgICAgZ2wuc2hhZGVyU291cmNlKHNoYWRlcixzb3VyY2VTdHJpbmcpO1xuICAgICAgICBnbC5jb21waWxlU2hhZGVyKHNoYWRlcik7XG5cbiAgICAgICAgaWYoIWdsLmdldFNoYWRlclBhcmFtZXRlcihzaGFkZXIsZ2wuQ09NUElMRV9TVEFUVVMpKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aHJvdyBnbC5nZXRTaGFkZXJJbmZvTG9nKHNoYWRlcik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gc2hhZGVyO1xuICAgIH1cblxuXG59OyIsInZhciBWZWMzICA9IHJlcXVpcmUoJy4uLy4uL21hdGgvZlZlYzMnKSxcbiAgICBDb2xvciA9IHJlcXVpcmUoJy4uLy4uL3V0aWwvZkNvbG9yJyk7XG5cbnZhciBmR0xVdGlsID0ge307XG5cbmZHTFV0aWwuX19ncmlkU2l6ZUxhc3QgPSAtMTtcbmZHTFV0aWwuX19ncmlkVW5pdExhc3QgPSAtMTtcblxuXG5cbmZHTFV0aWwuZHJhd0dyaWQgPSBmdW5jdGlvbihrZ2wsc2l6ZSx1bml0KVxue1xuICAgIHVuaXQgPSB1bml0IHx8IDE7XG5cbiAgICB2YXIgaSAgPSAtMSxcbiAgICAgICAgc2ggPSBzaXplICogMC41ICogdW5pdDtcblxuICAgIHZhciB1aTtcblxuICAgIHdoaWxlKCsraSA8IHNpemUgKyAxKVxuICAgIHtcbiAgICAgICAgdWkgPSB1bml0ICogaTtcblxuICAgICAgICBrZ2wubGluZWYoLXNoLDAsLXNoICsgdWksc2gsMCwtc2grdWkpO1xuICAgICAgICBrZ2wubGluZWYoLXNoK3VpLDAsLXNoLC1zaCt1aSwwLHNoKTtcbiAgICB9XG59O1xuXG5mR0xVdGlsLmRyYXdBeGVzID0gZnVuY3Rpb24oa2dsLHVuaXQpXG57XG4gICAga2dsLmNvbG9yM2YoMSwwLDApO1xuICAgIGtnbC5saW5lZigwLDAsMCx1bml0LDAsMCk7XG4gICAga2dsLmNvbG9yM2YoMCwxLDApO1xuICAgIGtnbC5saW5lZigwLDAsMCwwLHVuaXQsMCk7XG4gICAga2dsLmNvbG9yM2YoMCwwLDEpO1xuICAgIGtnbC5saW5lZigwLDAsMCwwLDAsdW5pdCk7XG59O1xuXG5mR0xVdGlsLmRyYXdHcmlkQ3ViZSA9IGZ1bmN0aW9uKGtnbCxzaXplLHVuaXQpXG57XG4gICAgdW5pdCA9IHVuaXQgfHwgMTtcblxuICAgIHZhciBzaCAgPSBzaXplICogMC41ICogdW5pdCxcbiAgICAgICAgcGloID0gTWF0aC5QSSAqIDAuNTtcblxuICAgIGtnbC5wdXNoTWF0cml4KCk7XG4gICAga2dsLnRyYW5zbGF0ZTNmKDAsLXNoLDApO1xuICAgIHRoaXMuZHJhd0dyaWQoa2dsLHNpemUsdW5pdCk7XG4gICAga2dsLnBvcE1hdHJpeCgpO1xuXG4gICAga2dsLnB1c2hNYXRyaXgoKTtcbiAgICBrZ2wudHJhbnNsYXRlM2YoMCxzaCwwKTtcbiAgICBrZ2wucm90YXRlM2YoMCxwaWgsMCk7XG4gICAgdGhpcy5kcmF3R3JpZChrZ2wsc2l6ZSx1bml0KTtcbiAgICBrZ2wucG9wTWF0cml4KCk7XG5cbiAgICBrZ2wucHVzaE1hdHJpeCgpO1xuICAgIGtnbC50cmFuc2xhdGUzZigwLDAsLXNoKTtcbiAgICBrZ2wucm90YXRlM2YocGloLDAsMCk7XG4gICAgdGhpcy5kcmF3R3JpZChrZ2wsc2l6ZSx1bml0KTtcbiAgICBrZ2wucG9wTWF0cml4KCk7XG5cbiAgICBrZ2wucHVzaE1hdHJpeCgpO1xuICAgIGtnbC50cmFuc2xhdGUzZigwLDAsc2gpO1xuICAgIGtnbC5yb3RhdGUzZihwaWgsMCwwKTtcbiAgICB0aGlzLmRyYXdHcmlkKGtnbCxzaXplLHVuaXQpO1xuICAgIGtnbC5wb3BNYXRyaXgoKTtcblxuICAgIGtnbC5wdXNoTWF0cml4KCk7XG4gICAga2dsLnRyYW5zbGF0ZTNmKHNoLDAsMCk7XG4gICAga2dsLnJvdGF0ZTNmKHBpaCwwLHBpaCk7XG4gICAgdGhpcy5kcmF3R3JpZChrZ2wsc2l6ZSx1bml0KTtcbiAgICBrZ2wucG9wTWF0cml4KCk7XG5cbiAgICBrZ2wucHVzaE1hdHJpeCgpO1xuICAgIGtnbC50cmFuc2xhdGUzZigtc2gsMCwwKTtcbiAgICBrZ2wucm90YXRlM2YocGloLDAscGloKTtcbiAgICB0aGlzLmRyYXdHcmlkKGtnbCxzaXplLHVuaXQpO1xuICAgIGtnbC5wb3BNYXRyaXgoKTtcblxufTtcblxuXG5mR0xVdGlsLnB5cmFtaWQgPSBmdW5jdGlvbihrZ2wsc2l6ZSlcbntcbiAgICBrZ2wucHVzaE1hdHJpeCgpO1xuICAgIGtnbC5zY2FsZTNmKHNpemUsc2l6ZSxzaXplKTtcbiAgICBrZ2wuZHJhd0VsZW1lbnRzKHRoaXMuX19iVmVydGV4UHlyYW1pZCx0aGlzLl9fYk5vcm1hbFB5cmFtaWQsa2dsLmJ1ZmZlckNvbG9ycyhrZ2wuX2JDb2xvcix0aGlzLl9fYkNvbG9yUHlyYW1pZCksbnVsbCx0aGlzLl9fYkluZGV4UHlyYW1pZCxrZ2wuX2RyYXdNb2RlKTtcbiAgICBrZ2wucG9wTWF0cml4KCk7XG59O1xuXG5cblxuZkdMVXRpbC5vY3RhaGVkcm9uID0gZnVuY3Rpb24oa2dsLHNpemUpXG57XG4gICAga2dsLnB1c2hNYXRyaXgoKTtcbiAgICBrZ2wuc2NhbGUzZihzaXplLHNpemUsc2l6ZSk7XG4gICAga2dsLmRyYXdFbGVtZW50cyh0aGlzLl9fYlZlcnRleE9jdGFoZWRyb24sIHRoaXMuX19iTm9ybWFsT2N0YWhlZHJvbixrZ2wuYnVmZmVyQ29sb3JzKGtnbC5fYkNvbG9yLCB0aGlzLl9fYkNvbG9yT2N0YWhlZHJvbiksbnVsbCwgdGhpcy5fX2JJbmRleE9jdGFoZWRyb24sa2dsLl9kcmF3TW9kZSk7XG4gICAga2dsLnBvcE1hdHJpeCgpO1xufTtcblxuLypcbnZhciBmR0xVdGlsID1cbntcblxuICAgIGRyYXdHcmlkIDogZnVuY3Rpb24oZ2wsc2l6ZSx1bml0KVxuICAgIHtcbiAgICAgICAgdW5pdCA9IHVuaXQgfHwgMTtcblxuICAgICAgICB2YXIgaSAgPSAtMSxcbiAgICAgICAgICAgIHNoID0gc2l6ZSAqIDAuNSAqIHVuaXQ7XG5cbiAgICAgICAgdmFyIHVpO1xuXG4gICAgICAgIHdoaWxlKCsraSA8IHNpemUgKyAxKVxuICAgICAgICB7XG4gICAgICAgICAgICB1aSA9IHVuaXQgKiBpO1xuXG4gICAgICAgICAgICBnbC5saW5lZigtc2gsMCwtc2ggKyB1aSxzaCwwLC1zaCt1aSk7XG4gICAgICAgICAgICBnbC5saW5lZigtc2grdWksMCwtc2gsLXNoK3VpLDAsc2gpO1xuICAgICAgICB9XG5cbiAgICB9LFxuXG4gICAgZHJhd0dyaWRDdWJlIDogZnVuY3Rpb24oZ2wsc2l6ZSx1bml0KVxuICAgIHtcbiAgICAgICAgdW5pdCA9IHVuaXQgfHwgMTtcblxuICAgICAgICB2YXIgc2ggID0gc2l6ZSAqIDAuNSAqIHVuaXQsXG4gICAgICAgICAgICBwaWggPSBNYXRoLlBJICogMC41O1xuXG4gICAgICAgIGdsLnB1c2hNYXRyaXgoKTtcbiAgICAgICAgZ2wudHJhbnNsYXRlM2YoMCwtc2gsMCk7XG4gICAgICAgIHRoaXMuZHJhd0dyaWQoZ2wsc2l6ZSx1bml0KTtcbiAgICAgICAgZ2wucG9wTWF0cml4KCk7XG5cbiAgICAgICAgZ2wucHVzaE1hdHJpeCgpO1xuICAgICAgICBnbC50cmFuc2xhdGUzZigwLHNoLDApO1xuICAgICAgICBnbC5yb3RhdGUzZigwLHBpaCwwKTtcbiAgICAgICAgdGhpcy5kcmF3R3JpZChnbCxzaXplLHVuaXQpO1xuICAgICAgICBnbC5wb3BNYXRyaXgoKTtcblxuICAgICAgICBnbC5wdXNoTWF0cml4KCk7XG4gICAgICAgIGdsLnRyYW5zbGF0ZTNmKDAsMCwtc2gpO1xuICAgICAgICBnbC5yb3RhdGUzZihwaWgsMCwwKTtcbiAgICAgICAgdGhpcy5kcmF3R3JpZChnbCxzaXplLHVuaXQpO1xuICAgICAgICBnbC5wb3BNYXRyaXgoKTtcblxuICAgICAgICBnbC5wdXNoTWF0cml4KCk7XG4gICAgICAgIGdsLnRyYW5zbGF0ZTNmKDAsMCxzaCk7XG4gICAgICAgIGdsLnJvdGF0ZTNmKHBpaCwwLDApO1xuICAgICAgICB0aGlzLmRyYXdHcmlkKGdsLHNpemUsdW5pdCk7XG4gICAgICAgIGdsLnBvcE1hdHJpeCgpO1xuXG4gICAgICAgIGdsLnB1c2hNYXRyaXgoKTtcbiAgICAgICAgZ2wudHJhbnNsYXRlM2Yoc2gsMCwwKTtcbiAgICAgICAgZ2wucm90YXRlM2YocGloLDAscGloKTtcbiAgICAgICAgdGhpcy5kcmF3R3JpZChnbCxzaXplLHVuaXQpO1xuICAgICAgICBnbC5wb3BNYXRyaXgoKTtcblxuICAgICAgICBnbC5wdXNoTWF0cml4KCk7XG4gICAgICAgIGdsLnRyYW5zbGF0ZTNmKC1zaCwwLDApO1xuICAgICAgICBnbC5yb3RhdGUzZihwaWgsMCxwaWgpO1xuICAgICAgICB0aGlzLmRyYXdHcmlkKGdsLHNpemUsdW5pdCk7XG4gICAgICAgIGdsLnBvcE1hdHJpeCgpO1xuXG4gICAgfSxcblxuXG4gICAgZHJhd0F4ZXMgOiBmdW5jdGlvbihnbCx1bml0KVxuICAgIHtcbiAgICAgICAgZ2wuY29sb3IzZigxLDAsMCk7XG4gICAgICAgIGdsLmxpbmVmKDAsMCwwLHVuaXQsMCwwKTtcbiAgICAgICAgZ2wuY29sb3IzZigwLDEsMCk7XG4gICAgICAgIGdsLmxpbmVmKDAsMCwwLDAsdW5pdCwwKTtcbiAgICAgICAgZ2wuY29sb3IzZigwLDAsMSk7XG4gICAgICAgIGdsLmxpbmVmKDAsMCwwLDAsMCx1bml0KTtcbiAgICB9LFxuXG5cbiAgICAvL3RlbXBcbiAgICBkcmF3VmVjdG9yZiA6IGZ1bmN0aW9uKGdsLHgwLHkwLHowLHgxLHkxLHoxKVxuICAgIHtcbiAgICAgICBcblxuICAgICAgICB2YXIgcDAgPSBnbC5fYlBvaW50MCxcbiAgICAgICAgICAgIHAxID0gZ2wuX2JQb2ludDEsXG4gICAgICAgICAgICB1cCA9IGdsLl9heGlzWTtcblxuICAgICAgICBWZWMzLnNldDNmKHAwLHgwLHkwLHowKTtcbiAgICAgICAgVmVjMy5zZXQzZihwMSx4MSx5MSx6MSk7XG5cbiAgICAgICAgdmFyIHB3ID0gZ2wuX2xpbmVCb3hXaWR0aCxcbiAgICAgICAgICAgIHBoID0gZ2wuX2xpbmVCb3hIZWlnaHQsXG4gICAgICAgICAgICBwZCA9IGdsLl9kcmF3TW9kZTtcblxuICAgICAgICB2YXIgbGVuID0gVmVjMy5kaXN0YW5jZShwMCxwMSksXG4gICAgICAgICAgICBtaWQgPSBWZWMzLnNjYWxlKFZlYzMuYWRkZWQocDAscDEpLDAuNSksXG4gICAgICAgICAgICBkaXIgPSBWZWMzLm5vcm1hbGl6ZShWZWMzLnN1YmJlZChwMSxwMCkpLFxuICAgICAgICAgICAgYyAgID0gVmVjMy5kb3QoZGlyLHVwKTtcblxuICAgICAgICB2YXIgYW5nbGUgPSBNYXRoLmFjb3MoYyksXG4gICAgICAgICAgICBheGlzICA9IFZlYzMubm9ybWFsaXplKFZlYzMuY3Jvc3ModXAsZGlyKSk7XG5cblxuICAgICAgICBnbC5kcmF3TW9kZShnbC5MSU5FUyk7XG5cbiAgICAgICAgZ2wubGluZWYoeDAseTAsejAseDEseTEsejEpO1xuXG4gICAgICAgIGdsLmRyYXdNb2RlKGdsLlRSSUFOR0xFUyk7XG4gICAgICAgIGdsLnB1c2hNYXRyaXgoKTtcbiAgICAgICAgZ2wudHJhbnNsYXRlKHAxKTtcbiAgICAgICAgZ2wucm90YXRlQXhpcyhhbmdsZSxheGlzKTtcbiAgICAgICAgdGhpcy5weXJhbWlkKGdsLDAuMDI1KTtcbiAgICAgICAgZ2wucG9wTWF0cml4KCk7XG5cbiAgICAgICAgZ2wubGluZVNpemUocHcscGgpO1xuICAgICAgICBnbC5kcmF3TW9kZShwZCk7XG4gICAgfSxcblxuICAgIGRyYXdWZWN0b3IgOiBmdW5jdGlvbihnbCx2MCx2MSlcbiAgICB7XG4gICAgICAgdGhpcy5kcmF3VmVjdG9yZihnbCx2MFswXSx2MFsxXSx2MFsyXSx2MVswXSx2MVsxXSx2MVsyXSk7XG4gICAgfSxcblxuICAgIHB5cmFtaWQgOiBmdW5jdGlvbihnbCxzaXplKVxuICAgIHtcbiAgICAgICAgZ2wucHVzaE1hdHJpeCgpO1xuICAgICAgICBnbC5zY2FsZTNmKHNpemUsc2l6ZSxzaXplKTtcbiAgICAgICAgZ2wuZHJhd0VsZW1lbnRzKHRoaXMuX19iVmVydGV4UHlyYW1pZCx0aGlzLl9fYk5vcm1hbFB5cmFtaWQsZ2wuZmlsbENvbG9yQnVmZmVyKGdsLl9iQ29sb3IsdGhpcy5fX2JDb2xvclB5cmFtaWQpLG51bGwsdGhpcy5fX2JJbmRleFB5cmFtaWQsZ2wuX2RyYXdNb2RlKTtcbiAgICAgICAgZ2wucG9wTWF0cml4KCk7XG4gICAgfSxcblxuXG5cbiAgICBvY3RhaGVkcm9uIDogZnVuY3Rpb24oZ2wsc2l6ZSlcbiAgICB7XG4gICAgICAgIGdsLnB1c2hNYXRyaXgoKTtcbiAgICAgICAgZ2wuc2NhbGUzZihzaXplLHNpemUsc2l6ZSk7XG4gICAgICAgIGdsLmRyYXdFbGVtZW50cyh0aGlzLl9fYlZlcnRleE9jdGFoZWRyb24sIHRoaXMuX19iTm9ybWFsT2N0YWhlZHJvbixnbC5maWxsQ29sb3JCdWZmZXIoZ2wuX2JDb2xvciwgdGhpcy5fX2JDb2xvck9jdGFoZWRyb24pLG51bGwsIHRoaXMuX19iSW5kZXhPY3RhaGVkcm9uLGdsLl9kcmF3TW9kZSk7XG4gICAgICAgIGdsLnBvcE1hdHJpeCgpO1xuICAgIH1cbn07XG4qL1xuXG5mR0xVdGlsLl9fYlZlcnRleE9jdGFoZWRyb24gPSBuZXcgRmxvYXQzMkFycmF5KFstMC43MDcsMCwwLCAwLDAuNzA3LDAsIDAsMCwtMC43MDcsIDAsMCwwLjcwNywgMCwtMC43MDcsMCwgMC43MDcsMCwwXSk7XG5mR0xVdGlsLl9fYk5vcm1hbE9jdGFoZWRyb24gPSBuZXcgRmxvYXQzMkFycmF5KFsxLCAtMS40MTk0OTYwNzYyMzgxNDdlLTksIDEuNDE5NDk2MDc2MjM4MTQ3ZS05LCAtMS40MTk0OTYwNzYyMzgxNDdlLTksIC0xLCAxLjQxOTQ5NjA3NjIzODE0N2UtOSwgLTEuNDE5NDk2MDc2MjM4MTQ3ZS05LCAtMS40MTk0OTYwNzYyMzgxNDdlLTksIDEsIDEuNDE5NDk2MDc2MjM4MTQ3ZS05LCAxLjQxOTQ5NjA3NjIzODE0N2UtOSwgLTEsIC0xLjQxOTQ5NjA3NjIzODE0N2UtOSwgMSwgMS40MTk0OTYwNzYyMzgxNDdlLTksIC0xLCAtMS40MTk0OTYwNzYyMzgxNDdlLTksIDEuNDE5NDk2MDc2MjM4MTQ3ZS05XSk7XG5mR0xVdGlsLl9fYkNvbG9yT2N0YWhlZHJvbiAgPSBuZXcgRmxvYXQzMkFycmF5KGZHTFV0aWwuX19iVmVydGV4T2N0YWhlZHJvbi5sZW5ndGggLyBWZWMzLlNJWkUgKiBDb2xvci5TSVpFKTtcbmZHTFV0aWwuX19iSW5kZXhPY3RhaGVkcm9uICA9IG5ldyBVaW50MTZBcnJheShbMyw0LDUsMyw1LDEsMywxLDAsMywwLDQsNCwwLDIsNCwyLDUsMiwwLDEsNSwyLDFdKTtcbmZHTFV0aWwuX19iVmVydGV4UHlyYW1pZCAgICA9IG5ldyBGbG9hdDMyQXJyYXkoWyAwLjAsMS4wLDAuMCwtMS4wLC0xLjAsMS4wLDEuMCwtMS4wLDEuMCwwLjAsMS4wLDAuMCwxLjAsLTEuMCwxLjAsMS4wLC0xLjAsLTEuMCwwLjAsMS4wLDAuMCwxLjAsLTEuMCwtMS4wLC0xLjAsLTEuMCwtMS4wLDAuMCwxLjAsMC4wLC0xLjAsLTEuMCwtMS4wLC0xLjAsLTEuMCwxLjAsLTEuMCwtMS4wLDEuMCwxLjAsLTEuMCwxLjAsMS4wLC0xLjAsLTEuMCwtMS4wLC0xLjAsLTEuMF0pO1xuZkdMVXRpbC5fX2JOb3JtYWxQeXJhbWlkICAgID0gbmV3IEZsb2F0MzJBcnJheShbMCwgLTAuNDQ3MjEzNTkwMTQ1MTExMSwgLTAuODk0NDI3MTgwMjkwMjIyMiwgMCwgLTAuNDQ3MjEzNTkwMTQ1MTExMSwgLTAuODk0NDI3MTgwMjkwMjIyMiwgMCwgLTAuNDQ3MjEzNTkwMTQ1MTExMSwgLTAuODk0NDI3MTgwMjkwMjIyMiwgLTAuODk0NDI3MTgwMjkwMjIyMiwgLTAuNDQ3MjEzNTkwMTQ1MTExMSwgMCwgLTAuODk0NDI3MTgwMjkwMjIyMiwgLTAuNDQ3MjEzNTkwMTQ1MTExMSwgMCwgLTAuODk0NDI3MTgwMjkwMjIyMiwgLTAuNDQ3MjEzNTkwMTQ1MTExMSwgMCwgMCwgLTAuNDQ3MjEzNTkwMTQ1MTExMSwgMC44OTQ0MjcxODAyOTAyMjIyLCAwLCAtMC40NDcyMTM1OTAxNDUxMTExLCAwLjg5NDQyNzE4MDI5MDIyMjIsIDAsIC0wLjQ0NzIxMzU5MDE0NTExMTEsIDAuODk0NDI3MTgwMjkwMjIyMiwgMC44OTQ0MjcxODAyOTAyMjIyLCAtMC40NDcyMTM1OTAxNDUxMTExLCAwLCAwLjg5NDQyNzE4MDI5MDIyMjIsIC0wLjQ0NzIxMzU5MDE0NTExMTEsIDAsIDAuODk0NDI3MTgwMjkwMjIyMiwgLTAuNDQ3MjEzNTkwMTQ1MTExMSwgMCwgMCwgMCwgMCwgMCwgLTEsIDAsIDAsIDAsIDAsIDAsIDEsIDBdKTtcbmZHTFV0aWwuX19iQ29sb3JQeXJhbWlkICAgICA9IG5ldyBGbG9hdDMyQXJyYXkoZkdMVXRpbC5fX2JWZXJ0ZXhQeXJhbWlkLmxlbmd0aCAvIFZlYzMuU0laRSAqIENvbG9yLlNJWkUpO1xuZkdMVXRpbC5fX2JJbmRleFB5cmFtaWQgICAgID0gbmV3IFVpbnQxNkFycmF5KFswLCAxLCAyLCAzLCA0LCA1LCA2LCA3LCA4LCA5LCAxMCwgMTEsMTIsMTMsMTQsMTIsMTUsMTRdKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmR0xVdGlsOyIsIlxuLy9mb3Igbm9kZSBkZWJ1Z1xudmFyIE1hdDMzID1cbntcbiAgICBtYWtlIDogZnVuY3Rpb24oKVxuICAgIHtcbiAgICAgICAgcmV0dXJuIG5ldyBGbG9hdDMyQXJyYXkoWzEsMCwwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgMCwxLDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAwLDAsMV0pO1xuICAgIH0sXG5cbiAgICB0cmFuc3Bvc2UgOiBmdW5jdGlvbihvdXQsYSlcbiAgICB7XG5cbiAgICAgICAgaWYgKG91dCA9PT0gYSkge1xuICAgICAgICAgICAgdmFyIGEwMSA9IGFbMV0sIGEwMiA9IGFbMl0sIGExMiA9IGFbNV07XG4gICAgICAgICAgICBvdXRbMV0gPSBhWzNdO1xuICAgICAgICAgICAgb3V0WzJdID0gYVs2XTtcbiAgICAgICAgICAgIG91dFszXSA9IGEwMTtcbiAgICAgICAgICAgIG91dFs1XSA9IGFbN107XG4gICAgICAgICAgICBvdXRbNl0gPSBhMDI7XG4gICAgICAgICAgICBvdXRbN10gPSBhMTI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvdXRbMF0gPSBhWzBdO1xuICAgICAgICAgICAgb3V0WzFdID0gYVszXTtcbiAgICAgICAgICAgIG91dFsyXSA9IGFbNl07XG4gICAgICAgICAgICBvdXRbM10gPSBhWzFdO1xuICAgICAgICAgICAgb3V0WzRdID0gYVs0XTtcbiAgICAgICAgICAgIG91dFs1XSA9IGFbN107XG4gICAgICAgICAgICBvdXRbNl0gPSBhWzJdO1xuICAgICAgICAgICAgb3V0WzddID0gYVs1XTtcbiAgICAgICAgICAgIG91dFs4XSA9IGFbOF07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gb3V0O1xuICAgIH1cblxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBNYXQzMzsiLCJ2YXIga01hdGggPSByZXF1aXJlKCcuL2ZNYXRoJyksXG4gICAgTWF0MzMgPSByZXF1aXJlKCcuL2ZNYXQzMycpO1xuXG4vL2ZvciBub2RlIGRlYnVnXG52YXIgTWF0NDQgPVxue1xuICAgIG1ha2UgOiBmdW5jdGlvbigpXG4gICAge1xuICAgICAgICByZXR1cm4gbmV3IEZsb2F0MzJBcnJheShbIDEsIDAsIDAsIDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgMCwgMSwgMCwgMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAwLCAwLCAxLCAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDAsIDAsIDAsIDEgXSk7XG4gICAgfSxcblxuICAgIGlkZW50aXR5IDogZnVuY3Rpb24obSlcbiAgICB7XG4gICAgICAgIG1bIDBdID0gMTsgbVsgMV0gPSBtWyAyXSA9IG1bIDNdID0gMDtcbiAgICAgICAgbVsgNV0gPSAxOyBtWyA0XSA9IG1bIDZdID0gbVsgN10gPSAwO1xuICAgICAgICBtWzEwXSA9IDE7IG1bIDhdID0gbVsgOV0gPSBtWzExXSA9IDA7XG4gICAgICAgIG1bMTVdID0gMTsgbVsxMl0gPSBtWzEzXSA9IG1bMTRdID0gMDtcblxuICAgICAgICByZXR1cm4gbTtcbiAgICB9LFxuXG4gICAgY29weSA6IGZ1bmN0aW9uKG0pXG4gICAge1xuICAgICAgICByZXR1cm4gbmV3IEZsb2F0MzJBcnJheShtKTtcbiAgICB9LFxuXG4gICAgbWFrZVNjYWxlIDogZnVuY3Rpb24oc3gsc3ksc3osbSlcbiAgICB7XG4gICAgICAgIG0gPSBtIHx8IHRoaXMubWFrZSgpO1xuXG4gICAgICAgIG1bMF0gID0gc3g7XG4gICAgICAgIG1bNV0gID0gc3k7XG4gICAgICAgIG1bMTBdID0gc3o7XG5cbiAgICAgICAgcmV0dXJuIG07XG4gICAgfSxcblxuICAgIG1ha2VUcmFuc2xhdGUgOiBmdW5jdGlvbih0eCx0eSx0eixtKVxuICAgIHtcbiAgICAgICAgbSA9IG0gfHwgdGhpcy5tYWtlKCk7XG5cbiAgICAgICAgbVsxMl0gPSB0eDtcbiAgICAgICAgbVsxM10gPSB0eTtcbiAgICAgICAgbVsxNF0gPSB0ejtcblxuICAgICAgICByZXR1cm4gbTtcbiAgICB9LFxuXG4gICAgbWFrZVJvdGF0aW9uWCA6IGZ1bmN0aW9uKGEsbSlcbiAgICB7XG4gICAgICAgIG0gPSBtIHx8IHRoaXMubWFrZSgpO1xuXG4gICAgICAgIHZhciBzaW4gPSBNYXRoLnNpbihhKSxcbiAgICAgICAgICAgIGNvcyA9IE1hdGguY29zKGEpO1xuXG4gICAgICAgIG1bNV0gID0gY29zO1xuICAgICAgICBtWzZdICA9IC1zaW47XG4gICAgICAgIG1bOV0gID0gc2luO1xuICAgICAgICBtWzEwXSA9IGNvcztcblxuICAgICAgICByZXR1cm4gbTtcbiAgICB9LFxuXG4gICAgbWFrZVJvdGF0aW9uWSA6IGZ1bmN0aW9uKGEsbSlcbiAgICB7XG4gICAgICAgIG0gPSBtIHx8IHRoaXMubWFrZSgpO1xuXG4gICAgICAgIHZhciBzaW4gPSBNYXRoLnNpbihhKSxcbiAgICAgICAgICAgIGNvcyA9IE1hdGguY29zKGEpO1xuXG4gICAgICAgIG1bMF0gPSBjb3M7XG4gICAgICAgIG1bMl0gPSBzaW47XG4gICAgICAgIG1bOF0gPSAtc2luO1xuICAgICAgICBtWzEwXT0gY29zO1xuXG4gICAgICAgIHJldHVybiBtO1xuICAgIH0sXG5cbiAgICBtYWtlUm90YXRpb25aIDogZnVuY3Rpb24oYSxtKVxuICAgIHtcbiAgICAgICAgbSA9IG0gfHwgdGhpcy5tYWtlKCk7XG5cbiAgICAgICAgdmFyIHNpbiA9IE1hdGguc2luKGEpLFxuICAgICAgICAgICAgY29zID0gTWF0aC5jb3MoYSk7XG5cbiAgICAgICAgbVswXSA9IGNvcztcbiAgICAgICAgbVsxXSA9IHNpbjtcbiAgICAgICAgbVs0XSA9IC1zaW47XG4gICAgICAgIG1bNV0gPSBjb3M7XG5cbiAgICAgICAgcmV0dXJuIG07XG4gICAgfSxcblxuICAgIG1ha2VSb3RhdGlvblhZWiA6IGZ1bmN0aW9uKGF4LGF5LGF6LG0pXG4gICAge1xuICAgICAgICBtID0gbSB8fCB0aGlzLm1ha2UoKTtcblxuICAgICAgICB2YXIgY29zeCA9IE1hdGguY29zKGF4KSxcbiAgICAgICAgICAgIHNpbnggPSBNYXRoLnNpbihheCksXG4gICAgICAgICAgICBjb3N5ID0gTWF0aC5jb3MoYXkpLFxuICAgICAgICAgICAgc2lueSA9IE1hdGguc2luKGF5KSxcbiAgICAgICAgICAgIGNvc3ogPSBNYXRoLmNvcyhheiksXG4gICAgICAgICAgICBzaW56ID0gTWF0aC5zaW4oYXopO1xuXG4gICAgICAgIG1bIDBdID0gIGNvc3kqY29zejtcbiAgICAgICAgbVsgMV0gPSAtY29zeCpzaW56K3Npbngqc2lueSpjb3N6O1xuICAgICAgICBtWyAyXSA9ICBzaW54KnNpbnorY29zeCpzaW55KmNvc3o7XG5cbiAgICAgICAgbVsgNF0gPSAgY29zeSpzaW56O1xuICAgICAgICBtWyA1XSA9ICBjb3N4KmNvc3orc2lueCpzaW55KnNpbno7XG4gICAgICAgIG1bIDZdID0gLXNpbngqY29zeitjb3N4KnNpbnkqc2luejtcblxuICAgICAgICBtWyA4XSA9IC1zaW55O1xuICAgICAgICBtWyA5XSA9ICBzaW54KmNvc3k7XG4gICAgICAgIG1bMTBdID0gIGNvc3gqY29zeTtcblxuXG4gICAgICAgIHJldHVybiBtO1xuICAgIH0sXG5cbiAgICAvL3RlbXAgZnJvbSBnbE1hdHJpeFxuICAgIG1ha2VSb3RhdGlvbk9uQXhpcyA6IGZ1bmN0aW9uKHJvdCx4LHkseixvdXQpXG4gICAge1xuICAgICAgICB2YXIgbGVuID0gTWF0aC5zcXJ0KHggKiB4ICsgeSAqIHkgKyB6ICogeik7XG5cbiAgICAgICAgaWYoTWF0aC5zcXJ0KHggKiB4ICsgeSAqIHkgKyB6ICogeikgPCBrTWF0aC5FUFNJTE9OKSB7IHJldHVybiBudWxsOyB9XG5cbiAgICAgICAgdmFyIHMsIGMsIHQsXG4gICAgICAgICAgICBhMDAsIGEwMSwgYTAyLCBhMDMsXG4gICAgICAgICAgICBhMTAsIGExMSwgYTEyLCBhMTMsXG4gICAgICAgICAgICBhMjAsIGEyMSwgYTIyLCBhMjMsXG4gICAgICAgICAgICBiMDAsIGIwMSwgYjAyLFxuICAgICAgICAgICAgYjEwLCBiMTEsIGIxMixcbiAgICAgICAgICAgIGIyMCwgYjIxLCBiMjI7XG5cblxuICAgICAgICBsZW4gPSAxIC8gbGVuO1xuICAgICAgICB4ICo9IGxlbjtcbiAgICAgICAgeSAqPSBsZW47XG4gICAgICAgIHogKj0gbGVuO1xuXG4gICAgICAgIHMgPSBNYXRoLnNpbihyb3QpO1xuICAgICAgICBjID0gTWF0aC5jb3Mocm90KTtcbiAgICAgICAgdCA9IDEgLSBjO1xuXG4gICAgICAgIG91dCA9IG91dCB8fCBNYXQ0NC5tYWtlKCk7XG5cbiAgICAgICAgYTAwID0gMTsgYTAxID0gMDsgYTAyID0gMDsgYTAzID0gMDtcbiAgICAgICAgYTEwID0gMDsgYTExID0gMTsgYTEyID0gMDsgYTEzID0gMDtcbiAgICAgICAgYTIwID0gMDsgYTIxID0gMDsgYTIyID0gMTsgYTIzID0gMDtcblxuICAgICAgICBiMDAgPSB4ICogeCAqIHQgKyBjOyBiMDEgPSB5ICogeCAqIHQgKyB6ICogczsgYjAyID0geiAqIHggKiB0IC0geSAqIHM7XG4gICAgICAgIGIxMCA9IHggKiB5ICogdCAtIHogKiBzOyBiMTEgPSB5ICogeSAqIHQgKyBjOyBiMTIgPSB6ICogeSAqIHQgKyB4ICogcztcbiAgICAgICAgYjIwID0geCAqIHogKiB0ICsgeSAqIHM7IGIyMSA9IHkgKiB6ICogdCAtIHggKiBzOyBiMjIgPSB6ICogeiAqIHQgKyBjO1xuXG4gICAgICAgIG91dFswIF0gPSBhMDAgKiBiMDAgKyBhMTAgKiBiMDEgKyBhMjAgKiBiMDI7XG4gICAgICAgIG91dFsxIF0gPSBhMDEgKiBiMDAgKyBhMTEgKiBiMDEgKyBhMjEgKiBiMDI7XG4gICAgICAgIG91dFsyIF0gPSBhMDIgKiBiMDAgKyBhMTIgKiBiMDEgKyBhMjIgKiBiMDI7XG4gICAgICAgIG91dFszIF0gPSBhMDMgKiBiMDAgKyBhMTMgKiBiMDEgKyBhMjMgKiBiMDI7XG4gICAgICAgIG91dFs0IF0gPSBhMDAgKiBiMTAgKyBhMTAgKiBiMTEgKyBhMjAgKiBiMTI7XG4gICAgICAgIG91dFs1IF0gPSBhMDEgKiBiMTAgKyBhMTEgKiBiMTEgKyBhMjEgKiBiMTI7XG4gICAgICAgIG91dFs2IF0gPSBhMDIgKiBiMTAgKyBhMTIgKiBiMTEgKyBhMjIgKiBiMTI7XG4gICAgICAgIG91dFs3IF0gPSBhMDMgKiBiMTAgKyBhMTMgKiBiMTEgKyBhMjMgKiBiMTI7XG4gICAgICAgIG91dFs4IF0gPSBhMDAgKiBiMjAgKyBhMTAgKiBiMjEgKyBhMjAgKiBiMjI7XG4gICAgICAgIG91dFs5IF0gPSBhMDEgKiBiMjAgKyBhMTEgKiBiMjEgKyBhMjEgKiBiMjI7XG4gICAgICAgIG91dFsxMF0gPSBhMDIgKiBiMjAgKyBhMTIgKiBiMjEgKyBhMjIgKiBiMjI7XG4gICAgICAgIG91dFsxMV0gPSBhMDMgKiBiMjAgKyBhMTMgKiBiMjEgKyBhMjMgKiBiMjI7XG5cbiAgICAgICAgcmV0dXJuIG91dDtcbn0sXG5cbiAgICBtdWx0UHJlIDogZnVuY3Rpb24obTAsbTEsbSlcbiAgICB7XG4gICAgICAgIG0gPSBtIHx8IHRoaXMubWFrZSgpO1xuXG4gICAgICAgIHZhciBtMDAwID0gbTBbIDBdLG0wMDEgPSBtMFsgMV0sbTAwMiA9IG0wWyAyXSxtMDAzID0gbTBbIDNdLFxuICAgICAgICAgICAgbTAwNCA9IG0wWyA0XSxtMDA1ID0gbTBbIDVdLG0wMDYgPSBtMFsgNl0sbTAwNyA9IG0wWyA3XSxcbiAgICAgICAgICAgIG0wMDggPSBtMFsgOF0sbTAwOSA9IG0wWyA5XSxtMDEwID0gbTBbMTBdLG0wMTEgPSBtMFsxMV0sXG4gICAgICAgICAgICBtMDEyID0gbTBbMTJdLG0wMTMgPSBtMFsxM10sbTAxNCA9IG0wWzE0XSxtMDE1ID0gbTBbMTVdO1xuXG4gICAgICAgIHZhciBtMTAwID0gbTFbIDBdLG0xMDEgPSBtMVsgMV0sbTEwMiA9IG0xWyAyXSxtMTAzID0gbTFbIDNdLFxuICAgICAgICAgICAgbTEwNCA9IG0xWyA0XSxtMTA1ID0gbTFbIDVdLG0xMDYgPSBtMVsgNl0sbTEwNyA9IG0xWyA3XSxcbiAgICAgICAgICAgIG0xMDggPSBtMVsgOF0sbTEwOSA9IG0xWyA5XSxtMTEwID0gbTFbMTBdLG0xMTEgPSBtMVsxMV0sXG4gICAgICAgICAgICBtMTEyID0gbTFbMTJdLG0xMTMgPSBtMVsxM10sbTExNCA9IG0xWzE0XSxtMTE1ID0gbTFbMTVdO1xuXG4gICAgICAgIG1bIDBdID0gbTAwMCptMTAwICsgbTAwMSptMTA0ICsgbTAwMiptMTA4ICsgbTAwMyptMTEyO1xuICAgICAgICBtWyAxXSA9IG0wMDAqbTEwMSArIG0wMDEqbTEwNSArIG0wMDIqbTEwOSArIG0wMDMqbTExMztcbiAgICAgICAgbVsgMl0gPSBtMDAwKm0xMDIgKyBtMDAxKm0xMDYgKyBtMDAyKm0xMTAgKyBtMDAzKm0xMTQ7XG4gICAgICAgIG1bIDNdID0gbTAwMCptMTAzICsgbTAwMSptMTA3ICsgbTAwMiptMTExICsgbTAwMyptMTE1O1xuXG4gICAgICAgIG1bIDRdID0gbTAwNCptMTAwICsgbTAwNSptMTA0ICsgbTAwNiptMTA4ICsgbTAwNyptMTEyO1xuICAgICAgICBtWyA1XSA9IG0wMDQqbTEwMSArIG0wMDUqbTEwNSArIG0wMDYqbTEwOSArIG0wMDcqbTExMztcbiAgICAgICAgbVsgNl0gPSBtMDA0Km0xMDIgKyBtMDA1Km0xMDYgKyBtMDA2Km0xMTAgKyBtMDA3Km0xMTQ7XG4gICAgICAgIG1bIDddID0gbTAwNCptMTAzICsgbTAwNSptMTA3ICsgbTAwNiptMTExICsgbTAwNyptMTE1O1xuXG4gICAgICAgIG1bIDhdID0gbTAwOCptMTAwICsgbTAwOSptMTA0ICsgbTAxMCptMTA4ICsgbTAxMSptMTEyO1xuICAgICAgICBtWyA5XSA9IG0wMDgqbTEwMSArIG0wMDkqbTEwNSArIG0wMTAqbTEwOSArIG0wMTEqbTExMztcbiAgICAgICAgbVsxMF0gPSBtMDA4Km0xMDIgKyBtMDA5Km0xMDYgKyBtMDEwKm0xMTAgKyBtMDExKm0xMTQ7XG4gICAgICAgIG1bMTFdID0gbTAwOCptMTAzICsgbTAwOSptMTA3ICsgbTAxMCptMTExICsgbTAxMSptMTE1O1xuXG4gICAgICAgIG1bMTJdID0gbTAxMiptMTAwICsgbTAxMyptMTA0ICsgbTAxNCptMTA4ICsgbTAxNSptMTEyO1xuICAgICAgICBtWzEzXSA9IG0wMTIqbTEwMSArIG0wMTMqbTEwNSArIG0wMTQqbTEwOSArIG0wMTUqbTExMztcbiAgICAgICAgbVsxNF0gPSBtMDEyKm0xMDIgKyBtMDEzKm0xMDYgKyBtMDE0Km0xMTAgKyBtMDE1Km0xMTQ7XG4gICAgICAgIG1bMTVdID0gbTAxMiptMTAzICsgbTAxMyptMTA3ICsgbTAxNCptMTExICsgbTAxNSptMTE1O1xuXG5cblxuXG4gICAgICAgIHJldHVybiBtO1xuICAgIH0sXG5cbiAgICBtdWx0IDogZnVuY3Rpb24obTAsbTEsbSlcbiAgICB7XG4gICAgICAgIHJldHVybiB0aGlzLm11bHRQcmUobTAsbTEpO1xuICAgIH0sXG5cbiAgICBtdWx0UG9zdCA6IGZ1bmN0aW9uKG0wLG0xLG0pXG4gICAge1xuICAgICAgICByZXR1cm4gdGhpcy5tdWx0UHJlKG0xLG0wLG0pO1xuICAgIH0sXG5cbiAgICBpbnZlcnRlZCA6IGZ1bmN0aW9uKG0pXG4gICAge1xuICAgICAgICB2YXIgaW52ID0gdGhpcy5tYWtlKCk7XG4gICAgICAgIGludlswXSA9ICAgbVs1XSAqIG1bMTBdICogbVsxNV0gLSBtWzVdICogbVsxMV0gKiBtWzE0XSAtIG1bOV0gKiBtWzZdICogbVsxNV1cbiAgICAgICAgICAgICsgbVs5XSAqIG1bN10gKiBtWzE0XSArIG1bMTNdICogbVs2XSAqIG1bMTFdIC0gbVsxM10gKiBtWzddICogbVsxMF07XG4gICAgICAgIGludls0XSA9ICAtbVs0XSAqIG1bMTBdICogbVsxNV0gKyBtWzRdICogbVsxMV0gKiBtWzE0XSArIG1bOF0gKiBtWzZdICogbVsxNV0gK1xuICAgICAgICAgICAgbVs4XSAqIG1bN10gKiBtWzE0XSAtIG1bMTJdICogbVs2XSAqIG1bMTFdICsgbVsxMl0gKiBtWzddICogbVsxMF07XG4gICAgICAgIGludls4XSA9ICAgbVs0XSAqIG1bOV0gKiBtWzE1XSAtIG1bNF0gKiBtWzExXSAqIG1bMTNdIC0gbVs4XSAqIG1bNV0gKiBtWzE1XVxuICAgICAgICAgICAgKyBtWzhdICogbVs3XSAqIG1bMTNdICsgbVsxMl0gKiBtWzVdICogbVsxMV0gLSBtWzEyXSAqIG1bN10gKiBtWzldO1xuICAgICAgICBpbnZbMTJdID0gLW1bNF0gKiBtWzldICogbVsxNF0gKyBtWzRdICogbVsxMF0gKiBtWzEzXSArIG1bOF0gKiBtWzVdICogbVsxNF0gK1xuICAgICAgICAgICAgbVs4XSAqIG1bNl0gKiBtWzEzXSAtIG1bMTJdICogbVs1XSAqIG1bMTBdICsgbVsxMl0gKiBtWzZdICogbVs5XTtcbiAgICAgICAgaW52WzFdID0gIC1tWzFdICogbVsxMF0gKiBtWzE1XSArIG1bMV0gKiBtWzExXSAqIG1bMTRdICsgbVs5XSAqIG1bMl0gKiBtWzE1XSArXG4gICAgICAgICAgICBtWzldICogbVszXSAqIG1bMTRdIC0gbVsxM10gKiBtWzJdICogbVsxMV0gKyBtWzEzXSAqIG1bM10gKiBtWzEwXTtcbiAgICAgICAgaW52WzVdID0gIG1bMF0gKiBtWzEwXSAqIG1bMTVdIC0gbVswXSAqIG1bMTFdICogbVsxNF0gLSBtWzhdICogbVsyXSAqIG1bMTVdXG4gICAgICAgICAgICArIG1bOF0gKiBtWzNdICogbVsxNF0gKyBtWzEyXSAqIG1bMl0gKiBtWzExXSAtIG1bMTJdICogbVszXSAqIG1bMTBdO1xuICAgICAgICBpbnZbOV0gPSAtbVswXSAqIG1bOV0gKiBtWzE1XSArIG1bMF0gKiBtWzExXSAqIG1bMTNdICsgbVs4XSAqIG1bMV0gKiBtWzE1XVxuICAgICAgICAgICAgLSBtWzhdICogbVszXSAqIG1bMTNdIC0gbVsxMl0gKiBtWzFdICogbVsxMV0gKyBtWzEyXSAqIG1bM10gKiBtWzldO1xuICAgICAgICBpbnZbMTNdID0gbVswXSAqIG1bOV0gKiBtWzE0XSAtIG1bMF0gKiBtWzEwXSAqIG1bMTNdIC0gbVs4XSAqIG1bMV0gKiBtWzE0XVxuICAgICAgICAgICAgKyBtWzhdICogbVsyXSAqIG1bMTNdICsgbVsxMl0gKiBtWzFdICogbVsxMF0gLSBtWzEyXSAqIG1bMl0gKiBtWzldO1xuICAgICAgICBpbnZbMl0gPSBtWzFdICogbVs2XSAqIG1bMTVdIC0gbVsxXSAqIG1bN10gKiBtWzE0XSAtIG1bNV0gKiBtWzJdICogbVsxNV1cbiAgICAgICAgICAgICsgbVs1XSAqIG1bM10gKiBtWzE0XSArIG1bMTNdICogbVsyXSAqIG1bN10gLSBtWzEzXSAqIG1bM10gKiBtWzZdO1xuICAgICAgICBpbnZbNl0gPSAtbVswXSAqIG1bNl0gKiBtWzE1XSArIG1bMF0gKiBtWzddICogbVsxNF0gKyBtWzRdICogbVsyXSAqIG1bMTVdXG4gICAgICAgICAgICAtIG1bNF0gKiBtWzNdICogbVsxNF0gLSBtWzEyXSAqIG1bMl0gKiBtWzddICsgbVsxMl0gKiBtWzNdICogbVs2XTtcbiAgICAgICAgaW52WzEwXSA9IG1bMF0gKiBtWzVdICogbVsxNV0gLSBtWzBdICogbVs3XSAqIG1bMTNdIC0gbVs0XSAqIG1bMV0gKiBtWzE1XVxuICAgICAgICAgICAgKyBtWzRdICogbVszXSAqIG1bMTNdICsgbVsxMl0gKiBtWzFdICogbVs3XSAtIG1bMTJdICogbVszXSAqIG1bNV07XG4gICAgICAgIGludlsxNF0gPSAtbVswXSAqIG1bNV0gKiBtWzE0XSArIG1bMF0gKiBtWzZdICogbVsxM10gKyBtWzRdICogbVsxXSAqIG1bMTRdXG4gICAgICAgICAgICAtIG1bNF0gKiBtWzJdICogbVsxM10gLSBtWzEyXSAqIG1bMV0gKiBtWzZdICsgbVsxMl0gKiBtWzJdICogbVs1XTtcbiAgICAgICAgaW52WzNdID0gLW1bMV0gKiBtWzZdICogbVsxMV0gKyBtWzFdICogbVs3XSAqIG1bMTBdICsgbVs1XSAqIG1bMl0gKiBtWzExXVxuICAgICAgICAgICAgLSBtWzVdICogbVszXSAqIG1bMTBdIC0gbVs5XSAqIG1bMl0gKiBtWzddICsgbVs5XSAqIG1bM10gKiBtWzZdO1xuICAgICAgICBpbnZbN10gPSBtWzBdICogbVs2XSAqIG1bMTFdIC0gbVswXSAqIG1bN10gKiBtWzEwXSAtIG1bNF0gKiBtWzJdICogbVsxMV1cbiAgICAgICAgICAgICsgbVs0XSAqIG1bM10gKiBtWzEwXSArIG1bOF0gKiBtWzJdICogbVs3XSAtIG1bOF0gKiBtWzNdICogbVs2XTtcbiAgICAgICAgaW52WzExXSA9IC1tWzBdICogbVs1XSAqIG1bMTFdICsgbVswXSAqIG1bN10gKiBtWzldICsgbVs0XSAqIG1bMV0gKiBtWzExXVxuICAgICAgICAgICAgLSBtWzRdICogbVszXSAqIG1bOV0gLSBtWzhdICogbVsxXSAqIG1bN10gKyBtWzhdICogbVszXSAqIG1bNV07XG4gICAgICAgIGludlsxNV0gPSBtWzBdICogbVs1XSAqIG1bMTBdIC0gbVswXSAqIG1bNl0gKiBtWzldIC0gbVs0XSAqIG1bMV0gKiBtWzEwXVxuICAgICAgICAgICAgKyBtWzRdICogbVsyXSAqIG1bOV0gKyBtWzhdICogbVsxXSAqIG1bNl0gLSBtWzhdICogbVsyXSAqIG1bNV07XG4gICAgICAgIHZhciBkZXQgPSBtWzBdKmludlswXSArIG1bMV0qaW52WzRdICsgbVsyXSppbnZbOF0gKyBtWzNdKmludlsxMl07XG4gICAgICAgIGlmKCBkZXQgPT0gMCApXG4gICAgICAgIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGRldCA9IDEuMCAvIGRldDtcbiAgICAgICAgdmFyIG1vID0gdGhpcy5tYWtlKCk7XG4gICAgICAgIGZvciggdmFyIGk9MDsgaTwxNjsgKytpIClcbiAgICAgICAge1xuICAgICAgICAgICAgbW9baV0gPSBpbnZbaV0gKiBkZXQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1vO1xuICAgIH0sXG5cbiAgICB0cmFuc3Bvc2VkIDogZnVuY3Rpb24obSlcbiAgICB7XG4gICAgICAgIHZhciBtbyA9IHRoaXMubWFrZSgpO1xuXG4gICAgICAgIG1vWzAgXSA9IG1bMCBdO1xuICAgICAgICBtb1sxIF0gPSBtWzQgXTtcbiAgICAgICAgbW9bMiBdID0gbVs4IF07XG4gICAgICAgIG1vWzMgXSA9IG1bMTJdO1xuXG4gICAgICAgIG1vWzQgXSA9IG1bMSBdO1xuICAgICAgICBtb1s1IF0gPSBtWzUgXTtcbiAgICAgICAgbW9bNiBdID0gbVs5IF07XG4gICAgICAgIG1vWzcgXSA9IG1bMTNdO1xuXG4gICAgICAgIG1vWzggXSA9IG1bMiBdO1xuICAgICAgICBtb1s5IF0gPSBtWzYgXTtcbiAgICAgICAgbW9bMTBdID0gbVsxMF07XG4gICAgICAgIG1vWzExXSA9IG1bMTRdO1xuXG4gICAgICAgIG1vWzEyXSA9IG1bMyBdO1xuICAgICAgICBtb1sxM10gPSBtWzcgXTtcbiAgICAgICAgbW9bMTRdID0gbVsxMV07XG4gICAgICAgIG1vWzE1XSA9IG1bMTVdO1xuXG4gICAgICAgIHJldHVybiBtbztcbiAgICB9LFxuXG4gICAgdG9NYXQzM0ludmVyc2VkIDogZnVuY3Rpb24obWF0NDQsbWF0MzMpXG4gICAge1xuICAgICAgICB2YXIgYTAwID0gbWF0NDRbMF0sIGEwMSA9IG1hdDQ0WzFdLCBhMDIgPSBtYXQ0NFsyXTtcbiAgICAgICAgdmFyIGExMCA9IG1hdDQ0WzRdLCBhMTEgPSBtYXQ0NFs1XSwgYTEyID0gbWF0NDRbNl07XG4gICAgICAgIHZhciBhMjAgPSBtYXQ0NFs4XSwgYTIxID0gbWF0NDRbOV0sIGEyMiA9IG1hdDQ0WzEwXTtcblxuICAgICAgICB2YXIgYjAxID0gYTIyKmExMS1hMTIqYTIxO1xuICAgICAgICB2YXIgYjExID0gLWEyMiphMTArYTEyKmEyMDtcbiAgICAgICAgdmFyIGIyMSA9IGEyMSphMTAtYTExKmEyMDtcblxuICAgICAgICB2YXIgZCA9IGEwMCpiMDEgKyBhMDEqYjExICsgYTAyKmIyMTtcbiAgICAgICAgaWYgKCFkKSB7IHJldHVybiBudWxsOyB9XG4gICAgICAgIHZhciBpZCA9IDEvZDtcblxuXG4gICAgICAgIGlmKCFtYXQzMykgeyBtYXQzMyA9IE1hdDMzLm1ha2UoKTsgfVxuXG4gICAgICAgIG1hdDMzWzBdID0gYjAxKmlkO1xuICAgICAgICBtYXQzM1sxXSA9ICgtYTIyKmEwMSArIGEwMiphMjEpKmlkO1xuICAgICAgICBtYXQzM1syXSA9IChhMTIqYTAxIC0gYTAyKmExMSkqaWQ7XG4gICAgICAgIG1hdDMzWzNdID0gYjExKmlkO1xuICAgICAgICBtYXQzM1s0XSA9IChhMjIqYTAwIC0gYTAyKmEyMCkqaWQ7XG4gICAgICAgIG1hdDMzWzVdID0gKC1hMTIqYTAwICsgYTAyKmExMCkqaWQ7XG4gICAgICAgIG1hdDMzWzZdID0gYjIxKmlkO1xuICAgICAgICBtYXQzM1s3XSA9ICgtYTIxKmEwMCArIGEwMSphMjApKmlkO1xuICAgICAgICBtYXQzM1s4XSA9IChhMTEqYTAwIC0gYTAxKmExMCkqaWQ7XG5cbiAgICAgICAgcmV0dXJuIG1hdDMzO1xuXG5cbiAgICB9LFxuXG4gICAgbXVsdFZlYzMgOiBmdW5jdGlvbihtLHYpXG4gICAge1xuICAgICAgICB2YXIgeCA9IHZbMF0sXG4gICAgICAgICAgICB5ID0gdlsxXSxcbiAgICAgICAgICAgIHogPSB2WzJdO1xuXG4gICAgICAgIHZbMF0gPSBtWyAwXSAqIHggKyBtWyA0XSAqIHkgKyBtWyA4XSAqIHogKyBtWzEyXTtcbiAgICAgICAgdlsxXSA9IG1bIDFdICogeCArIG1bIDVdICogeSArIG1bIDldICogeiArIG1bMTNdO1xuICAgICAgICB2WzJdID0gbVsgMl0gKiB4ICsgbVsgNl0gKiB5ICsgbVsxMF0gKiB6ICsgbVsxNF07XG5cbiAgICAgICAgcmV0dXJuIHY7XG4gICAgfSxcblxuICAgIG11dGxWZWMzQSA6IGZ1bmN0aW9uKG0sYSxpKVxuICAgIHtcbiAgICAgICAgaSAqPSAzO1xuXG4gICAgICAgIHZhciB4ID0gYVtpICBdLFxuICAgICAgICAgICAgeSA9IGFbaSsxXSxcbiAgICAgICAgICAgIHogPSBhW2krMl07XG5cbiAgICAgICAgYVtpICBdID0gbVsgMF0gKiB4ICsgbVsgNF0gKiB5ICsgbVsgOF0gKiB6ICsgbVsxMl07XG4gICAgICAgIGFbaSsxXSA9IG1bIDFdICogeCArIG1bIDVdICogeSArIG1bIDldICogeiArIG1bMTNdO1xuICAgICAgICBhW2krMl0gPSBtWyAyXSAqIHggKyBtWyA2XSAqIHkgKyBtWzEwXSAqIHogKyBtWzE0XTtcbiAgICB9LFxuXG4gICAgbXVsdFZlYzNBSSA6IGZ1bmN0aW9uKG0sYSxpKVxuICAgIHtcbiAgICAgICAgdmFyIHggPSBhW2kgIF0sXG4gICAgICAgICAgICB5ID0gYVtpKzFdLFxuICAgICAgICAgICAgeiA9IGFbaSsyXTtcblxuICAgICAgICBhW2kgIF0gPSBtWyAwXSAqIHggKyBtWyA0XSAqIHkgKyBtWyA4XSAqIHogKyBtWzEyXTtcbiAgICAgICAgYVtpKzFdID0gbVsgMV0gKiB4ICsgbVsgNV0gKiB5ICsgbVsgOV0gKiB6ICsgbVsxM107XG4gICAgICAgIGFbaSsyXSA9IG1bIDJdICogeCArIG1bIDZdICogeSArIG1bMTBdICogeiArIG1bMTRdO1xuICAgIH0sXG5cbiAgICBtdWx0VmVjNCA6IGZ1bmN0aW9uKG0sdilcbiAgICB7XG4gICAgICAgIHZhciB4ID0gdlswXSxcbiAgICAgICAgICAgIHkgPSB2WzFdLFxuICAgICAgICAgICAgeiA9IHZbMl0sXG4gICAgICAgICAgICB3ID0gdlszXTtcblxuICAgICAgICB2WzBdID0gbVsgMF0gKiB4ICsgbVsgNF0gKiB5ICsgbVsgOF0gKiB6ICsgbVsxMl0gKiB3O1xuICAgICAgICB2WzFdID0gbVsgMV0gKiB4ICsgbVsgNV0gKiB5ICsgbVsgOV0gKiB6ICsgbVsxM10gKiB3O1xuICAgICAgICB2WzJdID0gbVsgMl0gKiB4ICsgbVsgNl0gKiB5ICsgbVsxMF0gKiB6ICsgbVsxNF0gKiB3O1xuICAgICAgICB2WzNdID0gbVsgM10gKiB4ICsgbVsgN10gKiB5ICsgbVsxMV0gKiB6ICsgbVsxNV0gKiB3O1xuXG4gICAgICAgIHJldHVybiB2O1xuXG5cbiAgICB9LFxuXG4gICAgbXVsdFZlYzRBIDogZnVuY3Rpb24obSxhLGkpXG4gICAge1xuICAgICAgICBpICo9IDM7XG5cbiAgICAgICAgdmFyIHggPSBhW2kgIF0sXG4gICAgICAgICAgICB5ID0gYVtpKzFdLFxuICAgICAgICAgICAgeiA9IGFbaSsyXSxcbiAgICAgICAgICAgIHcgPSBhW2krM107XG5cbiAgICAgICAgYVtpICBdID0gbVsgMF0gKiB4ICsgbVsgNF0gKiB5ICsgbVsgOF0gKiB6ICsgbVsxMl0gKiB3O1xuICAgICAgICBhW2krMV0gPSBtWyAxXSAqIHggKyBtWyA1XSAqIHkgKyBtWyA5XSAqIHogKyBtWzEzXSAqIHc7XG4gICAgICAgIGFbaSsyXSA9IG1bIDJdICogeCArIG1bIDZdICogeSArIG1bMTBdICogeiArIG1bMTRdICogdztcbiAgICAgICAgYVtpKzNdID0gbVsgM10gKiB4ICsgbVsgN10gKiB5ICsgbVsxMV0gKiB6ICsgbVsxNV0gKiB3O1xuXG4gICAgfSxcblxuICAgIG11bHRWZWM0QUkgOiBmdW5jdGlvbihtLGEsaSlcbiAgICB7XG4gICAgICAgIHZhciB4ID0gYVtpICBdLFxuICAgICAgICAgICAgeSA9IGFbaSsxXSxcbiAgICAgICAgICAgIHogPSBhW2krMl0sXG4gICAgICAgICAgICB3ID0gYVtpKzNdO1xuXG4gICAgICAgIGFbaSAgXSA9IG1bIDBdICogeCArIG1bIDRdICogeSArIG1bIDhdICogeiArIG1bMTJdICogdztcbiAgICAgICAgYVtpKzFdID0gbVsgMV0gKiB4ICsgbVsgNV0gKiB5ICsgbVsgOV0gKiB6ICsgbVsxM10gKiB3O1xuICAgICAgICBhW2krMl0gPSBtWyAyXSAqIHggKyBtWyA2XSAqIHkgKyBtWzEwXSAqIHogKyBtWzE0XSAqIHc7XG4gICAgICAgIGFbaSszXSA9IG1bIDNdICogeCArIG1bIDddICogeSArIG1bMTFdICogeiArIG1bMTVdICogdztcblxuICAgIH0sXG5cbiAgICBpc0Zsb2F0RXF1YWwgOiBmdW5jdGlvbihtMCxtMSlcbiAgICB7XG4gICAgICAgIHZhciBpID0gLTE7XG4gICAgICAgIHdoaWxlKCsraTwxNilcbiAgICAgICAge1xuICAgICAgICAgICAgaWYoIWtNYXRoLmlzRmxvYXRFcXVhbChtMFtpXSxtMVtpXSkpcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuXG4gICAgfSxcblxuICAgIHRvU3RyaW5nIDogZnVuY3Rpb24obSlcbiAgICB7XG4gICAgICAgIHJldHVybiAnWycgKyBtWyAwXSArICcsICcgKyBtWyAxXSArICcsICcgKyBtWyAyXSArICcsICcgKyBtWyAzXSArICcsXFxuJyArXG4gICAgICAgICAgICAnICcgKyBtWyA0XSArICcsICcgKyBtWyA1XSArICcsICcgKyBtWyA2XSArICcsICcgKyBtWyA3XSArICcsXFxuJyArXG4gICAgICAgICAgICAnICcgKyBtWyA4XSArICcsICcgKyBtWyA5XSArICcsICcgKyBtWzEwXSArICcsICcgKyBtWzExXSArICcsXFxuJyArXG4gICAgICAgICAgICAnICcgKyBtWzEyXSArICcsICcgKyBtWzEzXSArICcsICcgKyBtWzE0XSArICcsICcgKyBtWzE1XSArICddJztcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1hdDQ0OyIsInZhciBrTWF0aCA9XG57XG4gICAgUEkgICAgICAgICAgOiBNYXRoLlBJLFxuICAgIEhBTEZfUEkgICAgIDogTWF0aC5QSSAqIDAuNSxcbiAgICBRVUFSVEVSX1BJICA6IE1hdGguUEkgKiAwLjI1LFxuICAgIFRXT19QSSAgICAgIDogTWF0aC5QSSAqIDIsXG4gICAgRVBTSUxPTiAgICAgOiAwLjAwMDEsXG5cbiAgICBsZXJwICAgICAgICA6IGZ1bmN0aW9uKGEsYix2KXtyZXR1cm4gKGEqKDEtdikpKyhiKnYpO30sXG4gICAgY29zSW50cnBsICAgOiBmdW5jdGlvbihhLGIsdil7diA9ICgxIC0gTWF0aC5jb3ModiAqIE1hdGguUEkpKSAqIDAuNTtyZXR1cm4gKGEgKiAoMS12KSArIGIgKiB2KTt9LFxuICAgIGN1YmljSW50cnBsIDogZnVuY3Rpb24oYSxiLGMsZCx2KVxuICAgIHtcbiAgICAgICAgdmFyIGEwLGIwLGMwLGQwLHZ2O1xuXG4gICAgICAgIHZ2ID0gdiAqIHY7XG4gICAgICAgIGEwID0gZCAtIGMgLSBhICsgYjtcbiAgICAgICAgYjAgPSBhIC0gYiAtIGEwO1xuICAgICAgICBjMCA9IGMgLSBhO1xuICAgICAgICBkMCA9IGI7XG5cbiAgICAgICAgcmV0dXJuIGEwKnYqdnYrYjAqdnYrYzAqditkMDtcbiAgICB9LFxuXG4gICAgaGVybWl0ZUludHJwbCA6IGZ1bmN0aW9uKGEsYixjLGQsdix0ZW5zaW9uLGJpYXMpXG4gICAge1xuICAgICAgICB2YXIgdjAsIHYxLCB2MiwgdjMsXG4gICAgICAgICAgICBhMCwgYjAsIGMwLCBkMDtcblxuICAgICAgICB0ZW5zaW9uID0gKDEuMCAtIHRlbnNpb24pICogMC41O1xuXG4gICAgICAgIHZhciBiaWFzcCA9IDEgKyBiaWFzLFxuICAgICAgICAgICAgYmlhc24gPSAxIC0gYmlhcztcblxuICAgICAgICB2MiAgPSB2ICogdjtcbiAgICAgICAgdjMgID0gdjIgKiB2O1xuXG4gICAgICAgIHYwICA9IChiIC0gYSkgKiBiaWFzcCAqIHRlbnNpb247XG4gICAgICAgIHYwICs9IChjIC0gYikgKiBiaWFzbiAqIHRlbnNpb247XG4gICAgICAgIHYxICA9IChjIC0gYikgKiBiaWFzcCAqIHRlbnNpb247XG4gICAgICAgIHYxICs9IChkIC0gYykgKiBiaWFzbiAqIHRlbnNpb247XG5cbiAgICAgICAgYTAgID0gMiAqIHYzIC0gMyAqIHYyICsgMTtcbiAgICAgICAgYjAgID0gdjMgLSAyICogdjIgKyB2O1xuICAgICAgICBjMCAgPSB2MyAtIHYyO1xuICAgICAgICBkMCAgPSAtMiAqIHYzICsgMyAqIHYyO1xuXG4gICAgICAgIHJldHVybiBhMCAqIGIgKyBiMCAqIHYwICsgYzAgKiB2MSArIGQwICogYztcbiAgICB9LFxuXG4gICAgcmFuZG9tRmxvYXQgOiBmdW5jdGlvbigpXG4gICAge1xuICAgICAgICB2YXIgcjtcblxuICAgICAgICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpXG4gICAgICAgIHtcbiAgICAgICAgICAgIGNhc2UgMDogciA9IE1hdGgucmFuZG9tKCk7YnJlYWs7XG4gICAgICAgICAgICBjYXNlIDE6IHIgPSBNYXRoLnJhbmRvbSgpICogYXJndW1lbnRzWzBdO2JyZWFrO1xuICAgICAgICAgICAgY2FzZSAyOiByID0gYXJndW1lbnRzWzBdICsgKGFyZ3VtZW50c1sxXS1hcmd1bWVudHNbMF0pICogTWF0aC5yYW5kb20oKTticmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByO1xuICAgIH0sXG5cbiAgICByYW5kb21JbnRlZ2VyIDogZnVuY3Rpb24oKVxuICAgIHtcbiAgICAgICAgdmFyIHI7XG5cbiAgICAgICAgc3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKVxuICAgICAgICB7XG4gICAgICAgICAgICBjYXNlIDA6IHIgPSAwLjUgKyBNYXRoLnJhbmRvbSgpO2JyZWFrO1xuICAgICAgICAgICAgY2FzZSAxOiByID0gMC41ICsgTWF0aC5yYW5kb20oKSphcmd1bWVudHNbMF07YnJlYWs7XG4gICAgICAgICAgICBjYXNlIDI6IHIgPSBhcmd1bWVudHNbMF0gKyAoIDEgKyBhcmd1bWVudHNbMV0gLSBhcmd1bWVudHNbMF0pICogTWF0aC5yYW5kb20oKTticmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBNYXRoLmZsb29yKHIpO1xuICAgIH0sXG5cbiAgICBjb25zdHJhaW4gOiBmdW5jdGlvbigpXG4gICAge1xuICAgICAgICB2YXIgcjtcblxuICAgICAgICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpXG4gICAgICAgIHtcbiAgICAgICAgICAgIGNhc2UgMjogYXJndW1lbnRzWzBdID0gKGFyZ3VtZW50c1swXSA+IGFyZ3VtZW50c1sxXSkgPyBhcmd1bWVudHNbMV0gOiBhcmd1bWVudHNbMF07YnJlYWs7XG4gICAgICAgICAgICBjYXNlIDM6IGFyZ3VtZW50c1swXSA9IChhcmd1bWVudHNbMF0gPiBhcmd1bWVudHNbMl0pID8gYXJndW1lbnRzWzJdIDogKGFyZ3VtZW50c1swXSA8IGFyZ3VtZW50c1sxXSkgPyBhcmd1bWVudHNbMV0gOmFyZ3VtZW50c1swXTticmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBhcmd1bWVudHNbMF07XG4gICAgfSxcblxuICAgIG5vcm1hbGl6ZSAgICAgICAgICAgICA6IGZ1bmN0aW9uKHZhbHVlLHN0YXJ0LGVuZCl7cmV0dXJuICh2YWx1ZSAtIHN0YXJ0KSAvIChlbmQgLSBzdGFydCk7fSxcbiAgICBtYXAgICAgICAgICAgICAgICAgICAgOiBmdW5jdGlvbih2YWx1ZSxpblN0YXJ0LGluRW5kLG91dFN0YXJ0LG91dEVuZCl7cmV0dXJuIG91dFN0YXJ0ICsgKG91dEVuZCAtIG91dFN0YXJ0KSAqIG5vcm1hbGl6ZSh2YWx1ZSxpblN0YXJ0LGluRW5kKTt9LFxuICAgIHNpbiAgICAgICAgICAgICAgICAgICA6IGZ1bmN0aW9uKHZhbHVlKXtyZXR1cm4gTWF0aC5zaW4odmFsdWUpO30sXG4gICAgY29zICAgICAgICAgICAgICAgICAgIDogZnVuY3Rpb24odmFsdWUpe3JldHVybiBNYXRoLmNvcyh2YWx1ZSk7fSxcbiAgICBjbGFtcCAgICAgICAgICAgICAgICAgOiBmdW5jdGlvbih2YWx1ZSxtaW4sbWF4KXtyZXR1cm4gTWF0aC5tYXgobWluLE1hdGgubWluKG1heCx2YWx1ZSkpO30sXG4gICAgc2F3ICAgICAgICAgICAgICAgICAgIDogZnVuY3Rpb24obil7cmV0dXJuIDIgKiAobiAgLSBNYXRoLmZsb29yKDAuNSArIG4gKSk7fSxcbiAgICB0cmkgICAgICAgICAgICAgICAgICAgOiBmdW5jdGlvbihuKXtyZXR1cm4gMS00Kk1hdGguYWJzKDAuNS10aGlzLmZyYWMoMC41Km4rMC4yNSkpO30sXG4gICAgcmVjdCAgICAgICAgICAgICAgICAgIDogZnVuY3Rpb24obil7dmFyIGEgPSBNYXRoLmFicyhuKTtyZXR1cm4gKGEgPiAwLjUpID8gMCA6IChhID09IDAuNSkgPyAwLjUgOiAoYSA8IDAuNSkgPyAxIDogLTE7fSxcbiAgICBmcmFjICAgICAgICAgICAgICAgICAgOiBmdW5jdGlvbihuKXtyZXR1cm4gbiAtIE1hdGguZmxvb3Iobik7fSxcbiAgICBzZ24gICAgICAgICAgICAgICAgICAgOiBmdW5jdGlvbihuKXtyZXR1cm4gbi9NYXRoLmFicyhuKTt9LFxuICAgIGFicyAgICAgICAgICAgICAgICAgICA6IGZ1bmN0aW9uKG4pe3JldHVybiBNYXRoLmFicyhuKTt9LFxuICAgIG1pbiAgICAgICAgICAgICAgICAgICA6IGZ1bmN0aW9uKG4pe3JldHVybiBNYXRoLm1pbihuKTt9LFxuICAgIG1heCAgICAgICAgICAgICAgICAgICA6IGZ1bmN0aW9uKG4pe3JldHVybiBNYXRoLm1heChuKTt9LFxuICAgIGF0YW4gICAgICAgICAgICAgICAgICA6IGZ1bmN0aW9uKG4pe3JldHVybiBNYXRoLmF0YW4obik7fSxcbiAgICBhdGFuMiAgICAgICAgICAgICAgICAgOiBmdW5jdGlvbih5LHgpe3JldHVybiBNYXRoLmF0YW4yKHkseCk7fSxcbiAgICByb3VuZCAgICAgICAgICAgICAgICAgOiBmdW5jdGlvbihuKXtyZXR1cm4gTWF0aC5yb3VuZChuKTt9LFxuICAgIGZsb29yICAgICAgICAgICAgICAgICA6IGZ1bmN0aW9uKG4pe3JldHVybiBNYXRoLmZsb29yKG4pO30sXG4gICAgdGFuICAgICAgICAgICAgICAgICAgIDogZnVuY3Rpb24obil7cmV0dXJuIE1hdGgudGFuKG4pO30sXG4gICAgcmFkMmRlZyAgICAgICAgICAgICAgIDogZnVuY3Rpb24ocmFkaWFucyl7cmV0dXJuIHJhZGlhbnMgKiAoMTgwIC8gTWF0aC5QSSk7fSxcbiAgICBkZWcycmFkICAgICAgICAgICAgICAgOiBmdW5jdGlvbihkZWdyZWUpe3JldHVybiBkZWdyZWUgKiAoTWF0aC5QSSAvIDE4MCk7IH0sXG4gICAgc3FydCAgICAgICAgICAgICAgICAgIDogZnVuY3Rpb24odmFsdWUpe3JldHVybiBNYXRoLnNxcnQodmFsdWUpO30sXG4gICAgR3JlYXRlc3RDb21tb25EaXZpc29yIDogZnVuY3Rpb24oYSxiKXtyZXR1cm4gKGIgPT0gMCkgPyBhIDogdGhpcy5HcmVhdGVzdENvbW1vbkRpdmlzb3IoYiwgYSAlIGIpO30sXG4gICAgaXNGbG9hdEVxdWFsICAgICAgICAgIDogZnVuY3Rpb24oYSxiKXtyZXR1cm4gKE1hdGguYWJzKGEtYik8dGhpcy5FUFNJTE9OKTt9LFxuICAgIGlzUG93ZXJPZlR3byAgICAgICAgICA6IGZ1bmN0aW9uKGEpe3JldHVybiAoYSYoYS0xKSk9PTA7fSxcbiAgICBzd2FwICAgICAgICAgICAgICAgICAgOiBmdW5jdGlvbihhLGIpe3ZhciB0ID0gYTthID0gYjsgYiA9IGE7fSxcbiAgICBwb3cgICAgICAgICAgICAgICAgICAgOiBmdW5jdGlvbih4LHkpe3JldHVybiBNYXRoLnBvdyh4LHkpO30sXG4gICAgbG9nICAgICAgICAgICAgICAgICAgIDogZnVuY3Rpb24obil7cmV0dXJuIE1hdGgubG9nKG4pO30sXG4gICAgY29zaCAgICAgICAgICAgICAgICAgIDogZnVuY3Rpb24obil7cmV0dXJuIChNYXRoLnBvdyhNYXRoLkUsbikgKyBNYXRoLnBvdyhNYXRoLkUsLW4pKSowLjU7fSxcbiAgICBleHAgICAgICAgICAgICAgICAgICAgOiBmdW5jdGlvbihuKXtyZXR1cm4gTWF0aC5leHAobik7fSxcbiAgICBzdGVwU21vb3RoICAgICAgICAgICAgOiBmdW5jdGlvbihuKXtyZXR1cm4gbipuKigzLTIqbik7fSxcbiAgICBzdGVwU21vb3RoU3F1YXJlZCAgICAgOiBmdW5jdGlvbihuKXtyZXR1cm4gdGhpcy5zdGVwU21vb3RoKG4pICogdGhpcy5zdGVwU21vb3RoKG4pO30sXG4gICAgc3RlcFNtb290aEludlNxdWFyZWQgIDogZnVuY3Rpb24obil7cmV0dXJuIDEtKDEtdGhpcy5zdGVwU21vb3RoKG4pKSooMS10aGlzLnN0ZXBTbW9vdGgobikpO30sXG4gICAgc3RlcFNtb290aEN1YmVkICAgICAgIDogZnVuY3Rpb24obil7cmV0dXJuIHRoaXMuc3RlcFNtb290aChuKSp0aGlzLnN0ZXBTbW9vdGgobikqdGhpcy5zdGVwU21vb3RoKG4pKnRoaXMuc3RlcFNtb290aChuKTt9LFxuICAgIHN0ZXBTbW9vdGhJbnZDdWJlZCAgICA6IGZ1bmN0aW9uKG4pe3JldHVybiAxLSgxLXRoaXMuc3RlcFNtb290aChuKSkqKDEtdGhpcy5zdGVwU21vb3RoKG4pKSooMS10aGlzLnN0ZXBTbW9vdGgobikpKigxLXRoaXMuc3RlcFNtb290aChuKSk7fSxcbiAgICBzdGVwU3F1YXJlZCAgICAgICAgICAgOiBmdW5jdGlvbihuKXtyZXR1cm4gbipuO30sXG4gICAgc3RlcEludlNxdWFyZWQgICAgICAgIDogZnVuY3Rpb24obil7cmV0dXJuIDEtKDEtbikqKDEtbik7fSxcbiAgICBzdGVwQ3ViZWQgICAgICAgICAgICAgOiBmdW5jdGlvbihuKXtyZXR1cm4gbipuKm4qbjt9LFxuICAgIHN0ZXBJbnZDdWJlZCAgICAgICAgICA6IGZ1bmN0aW9uKG4pe3JldHVybiAxLSgxLW4pKigxLW4pKigxLW4pKigxLW4pO30sXG4gICAgY2F0bXVsbHJvbSAgICAgICAgICAgIDogZnVuY3Rpb24oYSxiLGMsZCxpKXsgcmV0dXJuIGEgKiAoKC1pICsgMikgKiBpIC0gMSkgKiBpICogMC41ICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYiAqICgoKDMgKiBpIC0gNSkgKiBpKSAqIGkgKyAyKSAqIDAuNSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGMgKiAoKC0zICogaSArIDQpICogaSArIDEpICogaSAqIDAuNSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGQgKiAoKGkgLSAxKSAqIGkgKiBpKSAqIDAuNTt9XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0ga01hdGg7IiwidmFyIFF1YXRlcm5pb24gPVxue1xuICAgIG1ha2UgICAgIDogZnVuY3Rpb24obix2KXtyZXR1cm4gbmV3IEZsb2F0MzJBcnJheShbbiwgdlswXSx2WzFdLHZbMl1dKTt9LFxuICAgIG1ha2U0ZiAgIDogZnVuY3Rpb24obix4LHkseil7cmV0dXJuIG5ldyBGbG9hdDMyQXJyYXkoW24seCx5LHpdKTt9LFxuICAgIHplcm8gICAgIDogZnVuY3Rpb24oKXtyZXR1cm4gbmV3IEZsb2F0MzJBcnJheShbMCwwLDAsMF0pO30sXG4gICAgc2V0ICAgICAgOiBmdW5jdGlvbihxMCxxMSlcbiAgICB7XG4gICAgICAgIHEwWzBdID0gcTFbMF07XG4gICAgICAgIHEwWzFdID0gcTFbMV07XG4gICAgICAgIHEwWzJdID0gcTFbMl07XG4gICAgICAgIHEwWzNdID0gcTFbM107XG4gICAgfSxcblxuICAgIHNldDRmICAgIDogZnVuY3Rpb24ocSxuLHgseSx6KVxuICAgIHtcbiAgICAgICAgcVswXSA9IG47XG4gICAgICAgIHFbMV0gPSB4O1xuICAgICAgICBxWzJdID0geTtcbiAgICAgICAgcVszXSA9IHo7XG5cbiAgICB9LFxuXG4gICAgY29weSAgICAgOiBmdW5jdGlvbihxKXtyZXR1cm4gbmV3IEZsb2F0MzJBcnJheShxKTt9LFxuXG4gICAgbGVuZ3RoICAgOiBmdW5jdGlvbihxKXt2YXIgbiA9IHFbMF0seCA9IHFbMV0seSA9IHFbMl0seiA9IHFbM107IHJldHVybiBNYXRoLnNxcnQobipuK3gqeCt5Knkreip6KTt9LFxuICAgIHZlY3RvciAgIDogZnVuY3Rpb24ocSl7cmV0dXJuIG5ldyBGbG9hdDMyQXJyYXkocVsxXSxxWzJdLHFbM10pO30sXG4gICAgc2NhbGFyICAgOiBmdW5jdGlvbihxKXtyZXR1cm4gcVswXTt9LFxuXG5cblxuICAgIGFkZCA6IGZ1bmN0aW9uKHEwLHExKVxuICAgIHtcbiAgICAgICAgcTBbMF0gPSBxMFswXSArIHExWzBdO1xuICAgICAgICBxMFsxXSA9IHEwWzFdICsgcTFbMV07XG4gICAgICAgIHEwWzJdID0gcTBbMl0gKyBxMVsyXTtcbiAgICAgICAgcTBbM10gPSBxMFszXSArIHExWzNdO1xuICAgIH0sXG5cbiAgICBzdWIgOiBmdW5jdGlvbihxMCxxMSlcbiAgICB7XG4gICAgICAgIHEwWzBdID0gcTBbMF0gLSBxMVswXTtcbiAgICAgICAgcTBbMV0gPSBxMFsxXSAtIHExWzFdO1xuICAgICAgICBxMFsyXSA9IHEwWzJdIC0gcTFbMl07XG4gICAgICAgIHEwWzNdID0gcTBbM10gLSBxMVszXTtcbiAgICB9LFxuXG4gICAgc2NhbGUgOiBmdW5jdGlvbihxLG4pXG4gICAge1xuICAgICAgICBxWzBdICo9IG47XG4gICAgICAgIHFbMV0gKj0gbjtcbiAgICAgICAgcVsyXSAqPSBuO1xuICAgICAgICBxWzNdICo9IG47XG4gICAgfSxcblxuICAgIGNvbmp1Z2F0ZSA6IGZ1bmN0aW9uKHEpXG4gICAge1xuICAgICAgICBxWzFdKj0tMTtcbiAgICAgICAgcVsyXSo9LTE7XG4gICAgICAgIHFbM10qPS0xO1xuICAgIH0sXG5cbiAgICBtdWx0IDogZnVuY3Rpb24ocTAscTEpXG4gICAge1xuICAgICAgICB2YXIgbjAgPSBxMFswXSxcbiAgICAgICAgICAgIHgwID0gcTBbMV0sXG4gICAgICAgICAgICB5MCA9IHEwWzJdLFxuICAgICAgICAgICAgejAgPSBxMFszXSxcbiAgICAgICAgICAgIG4xID0gcTFbMF0sXG4gICAgICAgICAgICB4MSA9IHExWzFdLFxuICAgICAgICAgICAgeTEgPSBxMVsyXSxcbiAgICAgICAgICAgIHoxID0gcTFbM107XG5cbiAgICAgICAgcTBbMF0gPSBuMCAqIG4xIC0geDAgKiB4MSAtIHkwICogeTEgLSB6MCAqIHoxO1xuICAgICAgICBxMFsxXSA9IG4wICogeDEgLSB4MCAqIG4xIC0geTAgKiB6MSAtIHowICogeTE7XG4gICAgICAgIHEwWzJdID0gbjAgKiB5MSAtIHkwICogbjEgLSB6MCAqIHgxIC0geDAgKiB6MTtcbiAgICAgICAgcTBbM10gPSBuMCAqIHoxIC0gejAgKiBuMSAtIHgwICogeTEgLSB5MCAqIHoxO1xuICAgIH0sXG5cbiAgICBtdWx0VmVjIDogZnVuY3Rpb24ocSx2KVxuICAgIHtcbiAgICAgICAgdmFyIHFuID0gcVswXSxcbiAgICAgICAgICAgIHF4ID0gcVsxXSxcbiAgICAgICAgICAgIHF5ID0gcVsyXSxcbiAgICAgICAgICAgIHF6ID0gcVszXTtcblxuICAgICAgICB2YXIgeCA9IHZbMF0sXG4gICAgICAgICAgICB5ID0gdlsxXSxcbiAgICAgICAgICAgIHogPSB2WzJdO1xuXG4gICAgICAgIHFbMF0gPSAtKHF4KnggKyBxeSp5ICsgcXoqeik7XG4gICAgICAgIHFbMV0gPSBxbiAqIHggKyBxeSAqIHogLSBxeiAqIHk7XG4gICAgICAgIHFbMl0gPSBxbiAqIHkgKyBxeiAqIHggLSBxeCAqIHo7XG4gICAgICAgIHFbM10gPSBxbiAqIHogKyBxeCAqIHkgLSBxeSAqIHg7XG4gICAgfSxcblxuICAgIGFuZ2xlIDogZnVuY3Rpb24ocSlcbiAgICB7XG4gICAgICAgIHJldHVybiAyICogYWNvcyhxWzBdKTtcbiAgICB9LFxuXG4gICAgYXhpcyA6IGZ1bmN0aW9uKHEpXG4gICAge1xuICAgICAgICB2YXIgeCA9IHFbMF0sXG4gICAgICAgICAgICB5ID0gcVsxXSxcbiAgICAgICAgICAgIHogPSBxWzJdO1xuXG4gICAgICAgIHZhciBsID0gTWF0aC5zcXJ0KHgqeCArIHkqeSArIHoqeik7XG5cbiAgICAgICAgcmV0dXJuIGwgIT0gMCA/IG5ldyBGbG9hdDMyQXJyYXkoW3gvbCx5L2wsei9sXSkgOiBuZXcgRmxvYXQzMkFycmF5KFswLDAsMF0pO1xuICAgIH0sXG5cbiAgICAvL1RPRE86IElOTElORSBBTEwhIVxuXG4gICAgcm90YXRlIDogZnVuY3Rpb24ocTAscTEpXG4gICAge1xuICAgICAgICB0aGlzLnNldChxMCx0aGlzLm11bHQodGhpcy5tdWx0KHRoaXMuY29weShxMCkscTEpLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbmp1Z2F0ZSh0aGlzLmNvcHkocTApKSkpO1xuICAgIH0sXG5cbiAgICByb3RhdGVWZWMgOiBmdW5jdGlvbihxLHYpXG4gICAge1xuICAgICAgICB2YXIgdCA9IHRoaXMuemVybygpO1xuICAgICAgICB0aGlzLnNldCh0LHRoaXMubXVsdFZlYzModGhpcy5tdWx0VmVjMyh0aGlzLmNvcHkocSksdiksdGhpcy5jb25qdWdhdGUodGhpcy5jb3B5KHEpKSkpO1xuICAgIH0sXG5cbiAgICBmcm9tQW5nbGVzIDogZnVuY3Rpb24oYXgsYXksYXopXG4gICAge1xuICAgICAgICB2YXIgcSA9IHRoaXMuemVybygpO1xuXG4gICAgICAgIHZhciBjeWF3LGNwaXRjaCxjcm9sbCxzeWF3LHNwaXRjaCxzcm9sbDtcbiAgICAgICAgdmFyIGN5YXdjcGl0Y2gsc3lhd3NwaXRjaCxjeWF3c3BpdGNoLHN5YXdjcGl0Y2g7XG5cbiAgICAgICAgY3lhdyAgID0gTWF0aC5jb3MoYXogKiAwLjUpO1xuICAgICAgICBjcGl0Y2ggPSBNYXRoLmNvcyhheSAqIDAuNSk7XG4gICAgICAgIGNyb2xsICA9IE1hdGguY29zKGF4ICogMC41KTtcbiAgICAgICAgc3lhdyAgID0gTWF0aC5zaW4oYXogKiAwLjUpO1xuICAgICAgICBzcGl0Y2ggPSBNYXRoLnNpbihheSAqIDAuNSk7XG4gICAgICAgIHNyb2xsICA9IE1hdGguc2luKGF4ICogMC41KTtcblxuICAgICAgICBjeWF3Y3BpdGNoID0gY3lhdyAqIGNwaXRjaDtcbiAgICAgICAgc3lhd3NwaXRjaCA9IHN5YXcgKiBzcGl0Y2g7XG4gICAgICAgIGN5YXdzcGl0Y2ggPSBjeWF3ICogc3BpdGNoO1xuICAgICAgICBzeWF3Y3BpdGNoID0gc3lhdyAqIGNwaXRjaDtcblxuICAgICAgICByZXR1cm4gbmV3IEZsb2F0MzJBcnJheShbIGN5YXdjcGl0Y2ggKiBjcm9sbCArIHN5YXdzcGl0Y2ggKiBzcm9sbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjeWF3Y3BpdGNoICogc3JvbGwgLSBzeWF3c3BpdGNoICogY3JvbGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3lhd3NwaXRjaCAqIGNyb2xsICsgc3lhd2NwaXRjaCAqIHNyb2xsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN5YXdjcGl0Y2ggKiBjcm9sbCAtIGN5YXdzcGl0Y2ggKiBzcm9sbCBdKTtcblxuICAgIH0sXG5cbiAgICBhbmdsZXNGcm9tIDogZnVuY3Rpb24ocSlcbiAgICB7XG4gICAgICAgIHZhciBxbiA9IHFbMF0sXG4gICAgICAgICAgICBxeCA9IHFbMV0sXG4gICAgICAgICAgICBxeSA9IHFbMl0sXG4gICAgICAgICAgICBxeiA9IHFbM107XG5cbiAgICAgICAgdmFyIHIxMSxyMjEscjMxLHIzMixyMzMscjEyLHIxMztcbiAgICAgICAgdmFyIHEwMCxxMTEscTIyLHEzMztcbiAgICAgICAgdmFyIHRlbXA7XG4gICAgICAgIHZhciB2ID0gbmV3IEZsb2F0MzJBcnJheSgzKTtcblxuICAgICAgICBxMDAgPSBxbiAqIHFuO1xuICAgICAgICBxMTEgPSBxeCAqIHF4O1xuICAgICAgICBxMjIgPSBxeSAqIHF5O1xuICAgICAgICBxMzMgPSBxeiAqIHF6O1xuXG4gICAgICAgIHIxMSA9IHEwMCArIHExMSAtIHEyMiAtIHEzMztcbiAgICAgICAgcjIxID0gMiAqICggcXggKyBxeSArIHFuICogcXopO1xuICAgICAgICByMzEgPSAyICogKCBxeCAqIHF6IC0gcW4gKiBxeSk7XG4gICAgICAgIHIzMiA9IDIgKiAoIHF5ICogcXogKyBxbiAqIHF4KTtcbiAgICAgICAgcjMzID0gcTAwIC0gcTExIC0gcTIyICsgcTMzO1xuXG4gICAgICAgIHRlbXAgPSBNYXRoLmFicyhyMzEpO1xuICAgICAgICBpZih0ZW1wID4gMC45OTk5OTkpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHIxMiA9IDIgKiAocXggKiBxeSAtIHFuICogcXopO1xuICAgICAgICAgICAgcjEzID0gMiAqIChxeCAqIHF6IC0gcW4gKiBxeSk7XG5cbiAgICAgICAgICAgIHZbMF0gPSAwLjA7XG4gICAgICAgICAgICB2WzFdID0gKC0oTWF0aC5QSSAqIDAuNSkgKiAgcjMyIC8gdGVtcCk7XG4gICAgICAgICAgICB2WzJdID0gTWF0aC5hdGFuMigtcjEyLC1yMzEqcjEzKTtcbiAgICAgICAgICAgIHJldHVybiB2O1xuICAgICAgICB9XG5cbiAgICAgICAgdlswXSA9IE1hdGguYXRhbjIocjMyLHIzMyk7XG4gICAgICAgIHZbMV0gPSBNYXRoLmFzaW4oLTMxKTtcbiAgICAgICAgdlsyXSA9IE1hdGguYXRhbjIocjIxLHIxMSk7XG4gICAgICAgIHJldHVybiB2O1xuICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBRdWF0ZXJuaW9uOyIsInZhciBWZWMyID1cbntcbiAgICBTSVpFIDogMixcblxuICAgIG1ha2UgOiBmdW5jdGlvbigpXG4gICAge1xuICAgICAgICByZXR1cm4gbmV3IEZsb2F0MzJBcnJheShbMCwwXSk7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBWZWMyOyIsInZhciBWZWMzID1cbntcbiAgICBTSVpFICAgOiAzLFxuICAgIFpFUk8gICA6IGZ1bmN0aW9uKCl7cmV0dXJuIG5ldyBGbG9hdDMyQXJyYXkoWzAsMCwwXSl9LFxuICAgIEFYSVNfWCA6IGZ1bmN0aW9uKCl7cmV0dXJuIG5ldyBGbG9hdDMyQXJyYXkoWzEsMCwwXSl9LFxuICAgIEFYSVNfWSA6IGZ1bmN0aW9uKCl7cmV0dXJuIG5ldyBGbG9hdDMyQXJyYXkoWzAsMSwwXSl9LFxuICAgIEFYSVNfWiA6IGZ1bmN0aW9uKCl7cmV0dXJuIG5ldyBGbG9hdDMyQXJyYXkoWzAsMCwxXSl9LFxuXG4gICAgbWFrZSA6IGZ1bmN0aW9uKHgseSx6KVxuICAgIHtcbiAgICAgICAgcmV0dXJuIG5ldyBGbG9hdDMyQXJyYXkoWyB4IHx8IDAuMCxcbiAgICAgICAgICAgIHkgfHwgMC4wLFxuICAgICAgICAgICAgeiB8fCAwLjBdKTtcbiAgICB9LFxuXG4gICAgc2V0IDogZnVuY3Rpb24odjAsdjEpXG4gICAge1xuICAgICAgICB2MFswXSA9IHYxWzBdO1xuICAgICAgICB2MFsxXSA9IHYxWzFdO1xuICAgICAgICB2MFsyXSA9IHYxWzJdO1xuXG4gICAgICAgIHJldHVybiB2MDtcbiAgICB9LFxuXG4gICAgc2V0M2YgOiAgZnVuY3Rpb24odix4LHkseilcbiAgICB7XG4gICAgICAgIHZbMF0gPSB4O1xuICAgICAgICB2WzFdID0geTtcbiAgICAgICAgdlsyXSA9IHo7XG5cbiAgICAgICAgcmV0dXJuIHY7XG4gICAgfSxcblxuICAgIGNvcHkgOiAgZnVuY3Rpb24odilcbiAgICB7XG4gICAgICAgIHJldHVybiBuZXcgRmxvYXQzMkFycmF5KHYpO1xuICAgIH0sXG5cbiAgICBhZGQgOiBmdW5jdGlvbih2MCx2MSlcbiAgICB7XG4gICAgICAgIHYwWzBdICs9IHYxWzBdO1xuICAgICAgICB2MFsxXSArPSB2MVsxXTtcbiAgICAgICAgdjBbMl0gKz0gdjFbMl07XG5cbiAgICAgICAgcmV0dXJuIHYwO1xuICAgIH0sXG5cbiAgICBzdWIgOiBmdW5jdGlvbih2MCx2MSlcbiAgICB7XG4gICAgICAgIHYwWzBdIC09IHYxWzBdO1xuICAgICAgICB2MFsxXSAtPSB2MVsxXTtcbiAgICAgICAgdjBbMl0gLT0gdjFbMl07XG5cbiAgICAgICAgcmV0dXJuIHYwO1xuICAgIH0sXG5cbiAgICBzY2FsZSA6IGZ1bmN0aW9uKHYsbilcbiAgICB7XG4gICAgICAgIHZbMF0qPW47XG4gICAgICAgIHZbMV0qPW47XG4gICAgICAgIHZbMl0qPW47XG5cbiAgICAgICAgcmV0dXJuIHY7XG4gICAgfSxcblxuICAgIGRvdCA6IGZ1bmN0aW9uKHYwLHYxKVxuICAgIHtcbiAgICAgICAgcmV0dXJuIHYwWzBdKnYxWzBdICsgdjBbMV0qdjFbMV0gKyB2MFsyXSp2MVsyXTtcbiAgICB9LFxuXG4gICAgY3Jvc3M6IGZ1bmN0aW9uKHYwLHYxKVxuICAgIHtcbiAgICAgICAgdmFyIHgwID0gdjBbMF0sXG4gICAgICAgICAgICB5MCA9IHYwWzFdLFxuICAgICAgICAgICAgejAgPSB2MFsyXSxcbiAgICAgICAgICAgIHgxID0gdjFbMF0sXG4gICAgICAgICAgICB5MSA9IHYxWzFdLFxuICAgICAgICAgICAgejEgPSB2MVsyXTtcblxuICAgICAgICByZXR1cm4gbmV3IEZsb2F0MzJBcnJheShbeTAgKiB6MSAtIHkxICogejAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB6MCAqIHgxIC0gejEgKiB4MCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHgwICogeTEgLSB4MSAqIHkwXSk7XG4gICAgfSxcblxuICAgIGxlcnAgOiBmdW5jdGlvbih2MCx2MSxmKVxuICAgIHtcbiAgICAgICAgdmFyIHgwID0gdjBbMF0sXG4gICAgICAgICAgICB5MCA9IHYwWzFdLFxuICAgICAgICAgICAgejAgPSB2MFsyXTtcblxuICAgICAgICB2MFswXSA9IHgwICogKDEuMCAtIGYpICsgdjFbMF0gKiBmO1xuICAgICAgICB2MFsxXSA9IHkwICogKDEuMCAtIGYpICsgdjFbMV0gKiBmO1xuICAgICAgICB2MFsyXSA9IHowICogKDEuMCAtIGYpICsgdjFbMl0gKiBmO1xuXG5cbiAgICB9LFxuXG4gICAgbGVycGVkIDogZnVuY3Rpb24odjAsdjEsZilcbiAgICB7XG4gICAgICAgIHJldHVybiB0aGlzLmxlcnAodGhpcy5jb3B5KHYwKSx2MSxmKTtcbiAgICB9LFxuXG5cblxuICAgIGxlcnAzZiA6IGZ1bmN0aW9uKHYseCx5LHosZilcbiAgICB7XG4gICAgICAgIHZhciB2eCA9IHZbMF0sXG4gICAgICAgICAgICB2eSA9IHZbMV0sXG4gICAgICAgICAgICB2eiA9IHZbMl07XG5cbiAgICAgICAgdlswXSA9IHZ4ICogKDEuMCAtIGYpICsgeCAqIGY7XG4gICAgICAgIHZbMV0gPSB2eSAqICgxLjAgLSBmKSArIHkgKiBmO1xuICAgICAgICB2WzJdID0gdnogKiAoMS4wIC0gZikgKyB6ICogZjtcbiAgICB9LFxuXG5cbiAgICBsZW5ndGggOiBmdW5jdGlvbih2KVxuICAgIHtcbiAgICAgICAgdmFyIHggPSB2WzBdLFxuICAgICAgICAgICAgeSA9IHZbMV0sXG4gICAgICAgICAgICB6ID0gdlsyXTtcblxuICAgICAgICByZXR1cm4gTWF0aC5zcXJ0KHgqeCt5Knkreip6KTtcbiAgICB9LFxuXG4gICAgbGVuZ3RoU3EgOiAgZnVuY3Rpb24odilcbiAgICB7XG4gICAgICAgIHZhciB4ID0gdlswXSxcbiAgICAgICAgICAgIHkgPSB2WzFdLFxuICAgICAgICAgICAgeiA9IHZbMl07XG5cbiAgICAgICAgcmV0dXJuIHgqeCt5Knkreip6O1xuICAgIH0sXG5cbiAgICBzYWZlTm9ybWFsaXplIDogZnVuY3Rpb24odilcbiAgICB7XG4gICAgICAgIHZhciB4ID0gdlswXSxcbiAgICAgICAgICAgIHkgPSB2WzFdLFxuICAgICAgICAgICAgeiA9IHZbMl07XG5cbiAgICAgICAgdmFyIGQgPSBNYXRoLnNxcnQoeCp4K3kqeSt6KnopO1xuICAgICAgICBkID0gZCB8fCAxO1xuXG4gICAgICAgIHZhciBsICA9IDEvZDtcblxuICAgICAgICB2WzBdICo9IGw7XG4gICAgICAgIHZbMV0gKj0gbDtcbiAgICAgICAgdlsyXSAqPSBsO1xuXG4gICAgICAgIHJldHVybiB2O1xuICAgIH0sXG5cbiAgICBub3JtYWxpemUgOiBmdW5jdGlvbih2KVxuICAgIHtcbiAgICAgICAgdmFyIHggPSB2WzBdLFxuICAgICAgICAgICAgeSA9IHZbMV0sXG4gICAgICAgICAgICB6ID0gdlsyXTtcblxuICAgICAgICB2YXIgbCAgPSAxL01hdGguc3FydCh4KngreSp5K3oqeik7XG5cbiAgICAgICAgdlswXSAqPSBsO1xuICAgICAgICB2WzFdICo9IGw7XG4gICAgICAgIHZbMl0gKj0gbDtcblxuICAgICAgICByZXR1cm4gdjtcbiAgICB9LFxuXG4gICAgZGlzdGFuY2UgOiBmdW5jdGlvbih2MCx2MSlcbiAgICB7XG4gICAgICAgIHZhciB4ID0gdjBbMF0gLSB2MVswXSxcbiAgICAgICAgICAgIHkgPSB2MFsxXSAtIHYxWzFdLFxuICAgICAgICAgICAgeiA9IHYwWzJdIC0gdjFbMl07XG5cbiAgICAgICAgcmV0dXJuIE1hdGguc3FydCh4KngreSp5K3oqeik7XG4gICAgfSxcblxuICAgIGRpc3RhbmNlM2YgOiBmdW5jdGlvbih2LHgseSx6KVxuICAgIHtcbiAgICAgICAgcmV0dXJuIE1hdGguc3FydCh2WzBdICogeCArIHZbMV0gKiB5ICsgdlsyXSAqIHopO1xuICAgIH0sXG5cbiAgICBkaXN0YW5jZVNxIDogZnVuY3Rpb24odjAsdjEpXG4gICAge1xuICAgICAgICB2YXIgeCA9IHYwWzBdIC0gdjFbMF0sXG4gICAgICAgICAgICB5ID0gdjBbMV0gLSB2MVsxXSxcbiAgICAgICAgICAgIHogPSB2MFsyXSAtIHYxWzJdO1xuXG4gICAgICAgIHJldHVybiB4KngreSp5K3oqejtcbiAgICB9LFxuXG4gICAgZGlzdGFuY2VTcTNmIDogZnVuY3Rpb24odix4LHkseilcbiAgICB7XG4gICAgICAgIHJldHVybiB2WzBdICogeCArIHZbMV0gKiB5ICsgdlsyXSAqIHo7XG4gICAgfSxcblxuICAgIGxpbWl0IDogZnVuY3Rpb24odixuKVxuICAgIHtcbiAgICAgICAgdmFyIHggPSB2WzBdLFxuICAgICAgICAgICAgeSA9IHZbMV0sXG4gICAgICAgICAgICB6ID0gdlsyXTtcblxuICAgICAgICB2YXIgZHNxID0geCp4ICsgeSp5ICsgeip6LFxuICAgICAgICAgICAgbHNxID0gbiAqIG47XG5cbiAgICAgICAgaWYoKGRzcSA+IGxzcSkgJiYgbHNxID4gMClcbiAgICAgICAge1xuICAgICAgICAgICAgdmFyIG5kID0gbi9NYXRoLnNxcnQoZHNxKTtcblxuICAgICAgICAgICAgdlswXSAqPSBuZDtcbiAgICAgICAgICAgIHZbMV0gKj0gbmQ7XG4gICAgICAgICAgICB2WzJdICo9IG5kO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHY7XG4gICAgfSxcblxuICAgIGludmVydCA6IGZ1bmN0aW9uKHYpXG4gICAge1xuICAgICAgICB2WzBdKj0tMTtcbiAgICAgICAgdlsxXSo9LTE7XG4gICAgICAgIHZbMl0qPS0xO1xuXG4gICAgICAgIHJldHVybiB2O1xuICAgIH0sXG5cbiAgICBhZGRlZCAgOiBmdW5jdGlvbih2MCx2MSlcbiAgICB7XG4gICAgICAgIHJldHVybiB0aGlzLmFkZCh0aGlzLmNvcHkodjApLHYxKTtcbiAgICB9LFxuXG4gICAgc3ViYmVkIDogZnVuY3Rpb24odjAsdjEpXG4gICAge1xuICAgICAgICByZXR1cm4gdGhpcy5zdWIodGhpcy5jb3B5KHYwKSx2MSk7XG4gICAgfSxcblxuICAgIHNjYWxlZCA6IGZ1bmN0aW9uKHYsbilcbiAgICB7XG4gICAgICAgIHJldHVybiB0aGlzLnNjYWxlKHRoaXMuY29weSh2KSxuKTtcbiAgICB9LFxuXG4gICAgbm9ybWFsaXplZCA6IGZ1bmN0aW9uKHYpXG4gICAge1xuICAgICAgICByZXR1cm4gdGhpcy5ub3JtYWxpemUodGhpcy5jb3B5KHYpKTtcbiAgICB9LFxuXG4gICAgdG9TdHJpbmcgOiBmdW5jdGlvbih2KVxuICAgIHtcbiAgICAgICAgcmV0dXJuICdbJyArIHZbMF0gKyAnLCcgKyB2WzFdICsgJywnICsgdlsyXSArICddJztcbiAgICB9XG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gVmVjMztcblxuXG5cbiIsIlxuLy9UT0RPOkZJTklTSFxudmFyIFZlYzQgPVxue1xuICAgIFNJWkUgOiA0LFxuICAgIFpFUk8gOiBmdW5jdGlvbigpe3JldHVybiBuZXcgRmxvYXQzMkFycmF5KFswLDAsMCwxLjBdKX0sXG5cbiAgICBtYWtlIDogZnVuY3Rpb24oeCx5LHosdylcbiAgICB7XG4gICAgICAgIHJldHVybiBuZXcgRmxvYXQzMkFycmF5KFsgeCB8fCAwLjAsXG4gICAgICAgICAgICB5IHx8IDAuMCxcbiAgICAgICAgICAgIHogfHwgMC4wLFxuICAgICAgICAgICAgdyB8fCAxLjBdKTtcbiAgICB9LFxuXG4gICAgZnJvbVZlYzMgOiBmdW5jdGlvbih2KVxuICAgIHtcbiAgICAgICAgcmV0dXJuIG5ldyBGbG9hdDMyQXJyYXkoWyB2WzBdLCB2WzFdLCB2WzJdICwgMS4wXSk7XG4gICAgfSxcblxuICAgIHNldCA6IGZ1bmN0aW9uKHYwLHYxKVxuICAgIHtcbiAgICAgICAgdjBbMF0gPSB2MVswXTtcbiAgICAgICAgdjBbMV0gPSB2MVsxXTtcbiAgICAgICAgdjBbMl0gPSB2MVsyXTtcbiAgICAgICAgdjBbM10gPSB2MVszXTtcblxuICAgICAgICByZXR1cm4gdjA7XG4gICAgfSxcblxuICAgIHNldDNmIDogIGZ1bmN0aW9uKHYseCx5LHopXG4gICAge1xuICAgICAgICB2WzBdID0geDtcbiAgICAgICAgdlsxXSA9IHk7XG4gICAgICAgIHZbMl0gPSB6O1xuXG4gICAgICAgIHJldHVybiB2O1xuICAgIH0sXG5cbiAgICBzZXQ0ZiA6IGZ1bmN0aW9uKHYseCx5LHosdylcbiAgICB7XG4gICAgICAgIHZbMF0gPSB4O1xuICAgICAgICB2WzFdID0geTtcbiAgICAgICAgdlsyXSA9IHo7XG4gICAgICAgIHZbM10gPSB3O1xuXG4gICAgICAgIHJldHVybiB2O1xuXG4gICAgfSxcblxuICAgIGNvcHkgOiAgZnVuY3Rpb24odilcbiAgICB7XG4gICAgICAgIHJldHVybiBuZXcgRmxvYXQzMkFycmF5KHYpO1xuICAgIH0sXG5cbiAgICBhZGQgOiBmdW5jdGlvbih2MCx2MSlcbiAgICB7XG4gICAgICAgIHYwWzBdICs9IHYxWzBdO1xuICAgICAgICB2MFsxXSArPSB2MVsxXTtcbiAgICAgICAgdjBbMl0gKz0gdjFbMl07XG4gICAgICAgIHYwWzNdICs9IHYxWzNdO1xuXG4gICAgICAgIHJldHVybiB2MDtcbiAgICB9LFxuXG4gICAgc3ViIDogZnVuY3Rpb24odjAsdjEpXG4gICAge1xuICAgICAgICB2MFswXSAtPSB2MVswXTtcbiAgICAgICAgdjBbMV0gLT0gdjFbMV07XG4gICAgICAgIHYwWzJdIC09IHYxWzJdO1xuICAgICAgICB2MFszXSAtPSB2MVszXTtcblxuICAgICAgICByZXR1cm4gdjA7XG4gICAgfSxcblxuICAgIHNjYWxlIDogZnVuY3Rpb24odixuKVxuICAgIHtcbiAgICAgICAgdlswXSo9bjtcbiAgICAgICAgdlsxXSo9bjtcbiAgICAgICAgdlsyXSo9bjtcbiAgICAgICAgdlszXSo9bjtcblxuICAgICAgICByZXR1cm4gdjtcbiAgICB9LFxuXG4gICAgZG90IDogZnVuY3Rpb24odjAsdjEpXG4gICAge1xuICAgICAgICByZXR1cm4gdjBbMF0qdjFbMF0gKyB2MFsxXSp2MVsxXSArIHYwWzJdKnYxWzJdO1xuICAgIH0sXG5cbiAgICBjcm9zczogZnVuY3Rpb24odjAsdjEpXG4gICAge1xuICAgICAgICB2YXIgeDAgPSB2MFswXSxcbiAgICAgICAgICAgIHkwID0gdjBbMV0sXG4gICAgICAgICAgICB6MCA9IHYwWzJdLFxuICAgICAgICAgICAgeDEgPSB2MVswXSxcbiAgICAgICAgICAgIHkxID0gdjFbMV0sXG4gICAgICAgICAgICB6MSA9IHYxWzJdO1xuXG4gICAgICAgIHJldHVybiBuZXcgRmxvYXQzMkFycmF5KFt5MCp6MS15MSp6MCx6MCp4MS16MSp4MCx4MCp5MS14MSp5MF0pO1xuICAgIH0sXG5cbiAgICBzbGVycCA6IGZ1bmN0aW9uKHYwLHYxLGYpXG4gICAge1xuICAgICAgICB2YXIgeDAgPSB2MFswXSxcbiAgICAgICAgICAgIHkwID0gdjBbMV0sXG4gICAgICAgICAgICB6MCA9IHYwWzJdLFxuICAgICAgICAgICAgeDEgPSB2MVswXSxcbiAgICAgICAgICAgIHkxID0gdjFbMV0sXG4gICAgICAgICAgICB6MSA9IHYxWzJdO1xuXG4gICAgICAgIHZhciBkID0gTWF0aC5tYXgoLTEuMCxNYXRoLm1pbigoeDAqeDEgKyB5MCp5MSArIHowKnoxKSwxLjApKSxcbiAgICAgICAgICAgIHQgPSBNYXRoLmFjb3MoZCkgKiBmO1xuXG4gICAgICAgIHZhciB4ID0geDAgLSAoeDEgKiBkKSxcbiAgICAgICAgICAgIHkgPSB5MCAtICh5MSAqIGQpLFxuICAgICAgICAgICAgeiA9IHowIC0gKHoxICogZCk7XG5cbiAgICAgICAgdmFyIGwgPSAxL01hdGguc3FydCh4KngreSp5K3oqeik7XG5cbiAgICAgICAgeCo9bDtcbiAgICAgICAgeSo9bDtcbiAgICAgICAgeio9bDtcblxuICAgICAgICB2YXIgY3QgPSBNYXRoLmNvcyh0KSxcbiAgICAgICAgICAgIHN0ID0gTWF0aC5zaW4odCk7XG5cbiAgICAgICAgdmFyIHhvID0geDAgKiBjdCArIHggKiBzdCxcbiAgICAgICAgICAgIHlvID0geTAgKiBjdCArIHkgKiBzdCxcbiAgICAgICAgICAgIHpvID0gejAgKiBjdCArIHogKiBzdDtcblxuICAgICAgICByZXR1cm4gbmV3IEZsb2F0MzJBcnJheShbeG8seW8sem9dKTtcbiAgICB9LFxuXG4gICAgbGVuZ3RoIDogZnVuY3Rpb24odilcbiAgICB7XG4gICAgICAgIHZhciB4ID0gdlswXSxcbiAgICAgICAgICAgIHkgPSB2WzFdLFxuICAgICAgICAgICAgeiA9IHZbMl0sXG4gICAgICAgICAgICB3ID0gdlszXTtcblxuICAgICAgICByZXR1cm4gTWF0aC5zcXJ0KHgqeCt5Knkreip6K3cqdyk7XG4gICAgfSxcblxuICAgIGxlbmd0aFNxIDogIGZ1bmN0aW9uKHYpXG4gICAge1xuICAgICAgICB2YXIgeCA9IHZbMF0sXG4gICAgICAgICAgICB5ID0gdlsxXSxcbiAgICAgICAgICAgIHogPSB2WzJdLFxuICAgICAgICAgICAgdyA9IHZbM107XG5cbiAgICAgICAgcmV0dXJuIHgqeCt5Knkreip6K3cqdztcbiAgICB9LFxuXG4gICAgbm9ybWFsaXplIDogZnVuY3Rpb24odilcbiAgICB7XG4gICAgICAgIHZhciB4ID0gdlswXSxcbiAgICAgICAgICAgIHkgPSB2WzFdLFxuICAgICAgICAgICAgeiA9IHZbMl0sXG4gICAgICAgICAgICB3ID0gdlszXTtcblxuICAgICAgICB2YXIgbCAgPSAxL01hdGguc3FydCh4KngreSp5K3oqeit3KncpO1xuXG4gICAgICAgIHZbMF0gKj0gbDtcbiAgICAgICAgdlsxXSAqPSBsO1xuICAgICAgICB2WzJdICo9IGw7XG4gICAgICAgIHZbM10gKj0gbDtcblxuICAgICAgICByZXR1cm4gdjtcbiAgICB9LFxuXG4gICAgZGlzdGFuY2UgOiBmdW5jdGlvbih2MCx2MSlcbiAgICB7XG4gICAgICAgIHZhciB4ID0gdjBbMF0gLSB2MVswXSxcbiAgICAgICAgICAgIHkgPSB2MFsxXSAtIHYxWzFdLFxuICAgICAgICAgICAgeiA9IHYwWzJdIC0gdjFbMl07XG5cbiAgICAgICAgcmV0dXJuIE1hdGguc3FydCh4KngreSp5K3oqeik7XG4gICAgfSxcblxuICAgIGRpc3RhbmNlU3EgOiBmdW5jdGlvbih2MCx2MSlcbiAgICB7XG4gICAgICAgIHZhciB4ID0gdjBbMF0gLSB2MVswXSxcbiAgICAgICAgICAgIHkgPSB2MFsxXSAtIHYxWzFdLFxuICAgICAgICAgICAgeiA9IHYwWzJdIC0gdjFbMl07XG5cbiAgICAgICAgcmV0dXJuIHgqeCt5Knkreip6O1xuICAgIH0sXG5cbiAgICBsaW1pdCA6IGZ1bmN0aW9uKHYsbilcbiAgICB7XG4gICAgICAgIHZhciB4ID0gdlswXSxcbiAgICAgICAgICAgIHkgPSB2WzFdLFxuICAgICAgICAgICAgeiA9IHZbMl07XG5cbiAgICAgICAgdmFyIGRzcSA9IHgqeCArIHkqeSArIHoqeixcbiAgICAgICAgICAgIGxzcSA9IG4gKiBuO1xuXG4gICAgICAgIGlmKChkc3EgPiBsc3EpICYmIGxzcSA+IDApXG4gICAgICAgIHtcbiAgICAgICAgICAgIHZhciBuZCA9IG4vTWF0aC5zcXJ0KGRzcSk7XG5cbiAgICAgICAgICAgIHZbMF0gKj0gbmQ7XG4gICAgICAgICAgICB2WzFdICo9IG5kO1xuICAgICAgICAgICAgdlsyXSAqPSBuZDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB2O1xuICAgIH0sXG5cbiAgICBpbnZlcnQgOiBmdW5jdGlvbih2KVxuICAgIHtcbiAgICAgICAgdlswXSo9LTE7XG4gICAgICAgIHZbMV0qPS0xO1xuICAgICAgICB2WzJdKj0tMTtcblxuICAgICAgICByZXR1cm4gdjtcbiAgICB9LFxuXG4gICAgYWRkZWQgIDogZnVuY3Rpb24odjAsdjEpXG4gICAge1xuICAgICAgICByZXR1cm4gdGhpcy5hZGQodGhpcy5jb3B5KHYwKSx2MSk7XG4gICAgfSxcblxuICAgIHN1YmJlZCA6IGZ1bmN0aW9uKHYwLHYxKVxuICAgIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3ViKHRoaXMuY29weSh2MCksdjEpO1xuICAgIH0sXG5cbiAgICBzY2FsZWQgOiBmdW5jdGlvbih2LG4pXG4gICAge1xuICAgICAgICByZXR1cm4gdGhpcy5zY2FsZSh0aGlzLmNvcHkodiksbik7XG4gICAgfSxcblxuICAgIG5vcm1hbGl6ZWQgOiBmdW5jdGlvbih2KVxuICAgIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubm9ybWFsaXplKHRoaXMuY29weSh2KSk7XG4gICAgfSxcblxuICAgIHRvU3RyaW5nIDogZnVuY3Rpb24odilcbiAgICB7XG4gICAgICAgIHJldHVybiAnWycgKyB2WzBdICsgJywnICsgdlsxXSArICcsJyArIHZbMl0gKyAnXSc7XG4gICAgfVxuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFZlYzQ7IiwibW9kdWxlLmV4cG9ydHMgPVxue1xuICAgIEFQUF9XSURUSCAgOiA4MDAsXG4gICAgQVBQX0hFSUdIVCA6IDYwMCxcblxuICAgIEFQUF9GUFMgOiAzMCxcblxuICAgIEFQUF9QTEFTS19XSU5ET1dfVElUTEUgOiAnJyxcbiAgICBBUFBfUExBU0tfVFlQRSAgOiAnM2QnLFxuICAgIEFQUF9QTEFTS19WU1lOQyA6ICdmYWxzZScsXG4gICAgQVBQX1BMQVNLX01VTFRJU0FNUExFIDogdHJ1ZSxcblxuICAgIENBTUVSQV9GT1YgOiA0NSxcbiAgICBDQU1FUkFfTkVBUiA6IDAuMSxcbiAgICBDQU1FUkFfRkFSICA6IDEwMFxuXG59OyIsIm1vZHVsZS5leHBvcnRzID1cbntcbiAgICBNRVRIT0RfTk9UX0lNUExFTUVOVEVEOiAnTWV0aG9kIG5vdCBpbXBsZW1lbnRlZCBpbiB0YXJnZXQgcGxhdGZvcm0uJyxcbiAgICBDTEFTU19JU19TSU5HTEVUT046ICAgICAnQXBwbGljYXRpb24gaXMgc2luZ2xldG9uLiBHZXQgdmlhIGdldEluc3RhbmNlKCkuJyxcbiAgICBBUFBfTk9fU0VUVVA6ICAgICAgICAgICAnTm8gc2V0dXAgbWV0aG9kIGFkZGVkIHRvIGFwcC4nLFxuICAgIEFQUF9OT19VUERBVEUgOiAgICAgICAgICdObyB1cGRhdGUgbWV0aG9kIGFkZGVkIHRvIGFwcC4nLFxuICAgIFBMQVNLX1dJTkRPV19TSVpFX1NFVDogICdQbGFzayB3aW5kb3cgc2l6ZSBjYW4gb25seSBiZSBzZXQgb24gc3RhcnR1cC4nLFxuICAgIFdST05HX1BMQVRGT1JNOiAgICAgICAgICdXcm9uZyBQbGF0Zm9ybS4nLFxuICAgIFZFUlRJQ0VTX0lOX1dST05HX1NJWkU6ICdWZXJ0aWNlcyBhcnJheSBoYXMgd3JvbmcgbGVuZ3RoLiBTaG91bGQgYmUgJyxcbiAgICBDT0xPUlNfSU5fV1JPTkdfU0laRTogICAnQ29sb3IgYXJyYXkgbGVuZ3RoIG5vdCBlcXVhbCB0byBudW1iZXIgb2YgdmVydGljZXMuJ1xufTsiLCJ2YXIgUGxhdGZvcm0gPSB7V0VCOjAsUExBU0s6MX07XG4gICAgUGxhdGZvcm0uX3RhcmdldCA9IG51bGw7XG5cblBsYXRmb3JtLmdldFRhcmdldCAgPSBmdW5jdGlvbigpXG57XG4gICAgaWYoIXRoaXMuX3RhcmdldCl0aGlzLl90YXJnZXQgPSAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJykgPyB0aGlzLldFQiA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAodHlwZW9mIHJlcXVpcmUgPT0gXCJmdW5jdGlvblwiICYmIHJlcXVpcmUpID8gdGhpcy5QTEFTSyA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVsbDtcbiAgICByZXR1cm4gdGhpcy5fdGFyZ2V0O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBQbGF0Zm9ybTsiLCJtb2R1bGUuZXhwb3J0cyA9XG57XG4gICAgU0laRSAgOiA0LFxuXG4gICAgQkxBQ0sgOiBmdW5jdGlvbigpe3JldHVybiBuZXcgRmxvYXQzMkFycmF5KFswLDAsMCwxXSl9LFxuICAgIFdISVRFIDogZnVuY3Rpb24oKXtyZXR1cm4gbmV3IEZsb2F0MzJBcnJheShbMSwxLDEsMV0pfSxcbiAgICBSRUQgICA6IGZ1bmN0aW9uKCl7cmV0dXJuIG5ldyBGbG9hdDMyQXJyYXkoWzEsMCwwLDFdKX0sXG4gICAgR1JFRU4gOiBmdW5jdGlvbigpe3JldHVybiBuZXcgRmxvYXQzMkFycmF5KFswLDEsMCwxXSl9LFxuICAgIEJMVUUgIDogZnVuY3Rpb24oKXtyZXR1cm4gbmV3IEZsb2F0MzJBcnJheShbMCwwLDEsMV0pfSxcblxuICAgIG1ha2UgOiBmdW5jdGlvbihyLGcsYixhKXtyZXR1cm4gbmV3IEZsb2F0MzJBcnJheShbIHIsZyxiLGFdKTt9LFxuICAgIGNvcHkgOiBmdW5jdGlvbihjKXtyZXR1cm4gdGhpcy5tYWtlKGNbMF0sY1sxXSxjWzJdLGNbM10pO30sXG5cbiAgICBzZXQgOiBmdW5jdGlvbihjMCxjMSlcbiAgICB7XG4gICAgICAgIGMwWzBdID0gYzFbMF07XG4gICAgICAgIGMwWzFdID0gYzFbMV07XG4gICAgICAgIGMwWzJdID0gYzFbMl07XG4gICAgICAgIGMwWzNdID0gYzFbM107XG5cbiAgICAgICAgcmV0dXJuIGMwO1xuICAgIH0sXG5cbiAgICBzZXQ0ZiA6IGZ1bmN0aW9uKGMscixnLGIsYSlcbiAgICB7XG4gICAgICAgIGNbMF0gPSByO1xuICAgICAgICBjWzFdID0gZztcbiAgICAgICAgY1syXSA9IGI7XG4gICAgICAgIGNbM10gPSBhO1xuXG4gICAgICAgIHJldHVybiBjO1xuICAgIH0sXG5cbiAgICBzZXQzZiA6IGZ1bmN0aW9uKGMscixnLGIpXG4gICAge1xuICAgICAgICBjWzBdID0gcjtcbiAgICAgICAgY1sxXSA9IGc7XG4gICAgICAgIGNbMl0gPSBiO1xuICAgICAgICBjWzNdID0gMS4wO1xuXG4gICAgICAgIHJldHVybiBjO1xuICAgIH0sXG5cbiAgICBzZXQyZiA6IGZ1bmN0aW9uKGMsayxhKVxuICAgIHtcbiAgICAgICAgY1swXSA9IGNbMV0gPSBjWzJdID0gaztcbiAgICAgICAgY1szXSA9IGE7XG5cbiAgICAgICAgcmV0dXJuIGM7XG4gICAgfSxcblxuICAgIHNldDFmIDogZnVuY3Rpb24oYyxrKVxuICAgIHtcbiAgICAgICAgY1swXSA9IGNbMV0gPSBjWzJdID0gaztcbiAgICAgICAgY1szXSA9IDEuMDtcblxuICAgICAgICByZXR1cm4gYztcbiAgICB9LFxuXG4gICAgc2V0NGkgICAgOiBmdW5jdGlvbihjLHIsZyxiLGEpe3JldHVybiB0aGlzLnNldDRmKGMsci8yNTUuMCxnLzI1NS4wLGIvMjU1LjAsYSk7fSxcbiAgICBzZXQzaSAgICA6IGZ1bmN0aW9uKGMscixnLGIpICB7cmV0dXJuIHRoaXMuc2V0M2YoYyxyLzI1NS4wLGcvMjU1LjAsYi8yNTUuMCk7fSxcbiAgICBzZXQyaSAgICA6IGZ1bmN0aW9uKGMsayxhKSAgICB7cmV0dXJuIHRoaXMuc2V0MmYoYyxrLzI1NS4wLGEpO30sXG4gICAgc2V0MWkgICAgOiBmdW5jdGlvbihjLGspICAgICAge3JldHVybiB0aGlzLnNldDFmKGMsay8yNTUuMCk7fSxcbiAgICB0b0FycmF5ICA6IGZ1bmN0aW9uKGMpICAgICAgICB7cmV0dXJuIGMudG9BcnJheSgpO30sXG4gICAgdG9TdHJpbmcgOiBmdW5jdGlvbihjKSAgICAgICAge3JldHVybiAnWycrY1swXSsnLCcrY1sxXSsnLCcrY1syXSsnLCcrY1szXSsnXSc7fSxcblxuICAgIGludGVycG9sYXRlZCA6IGZ1bmN0aW9uKGMwLGMxLGYpXG4gICAge1xuICAgICAgICB2YXIgYyAgPSBuZXcgRmxvYXQzMkFycmF5KDQpLFxuICAgICAgICAgICAgZmkgPSAxLjAgLSBmO1xuXG4gICAgICAgIGNbMF0gPSBjMFswXSAqIGZpICsgYzFbMF0gKiBmO1xuICAgICAgICBjWzFdID0gYzBbMV0gKiBmaSArIGMxWzFdICogZjtcbiAgICAgICAgY1syXSA9IGMwWzJdICogZmkgKyBjMVsyXSAqIGY7XG4gICAgICAgIGNbM10gPSBjMFszXSAqIGZpICsgYzFbM10gKiBmO1xuXG4gICAgICAgIHJldHVybiBjO1xuICAgIH1cblxufTsiLCJ2YXIgVmVjMiAgID0gcmVxdWlyZSgnLi4vbWF0aC9mVmVjMicpLFxuICAgIGtFcnJvciA9IHJlcXVpcmUoJy4uL3N5c3RlbS9mRXJyb3InKTtcblxuZnVuY3Rpb24gTW91c2UoKVxue1xuICAgIGlmKE1vdXNlLl9faW5zdGFuY2UpdGhyb3cgbmV3IEVycm9yKGtFcnJvci5DTEFTU19JU19TSU5HTEVUT04pO1xuXG4gICAgdGhpcy5fcG9zaXRpb24gICAgID0gVmVjMi5tYWtlKCk7XG4gICAgdGhpcy5fcG9zaXRpb25MYXN0ID0gVmVjMi5tYWtlKCk7XG5cbiAgICBNb3VzZS5fX2luc3RhbmNlID0gdGhpcztcbn1cblxuTW91c2UucHJvdG90eXBlLmdldFBvc2l0aW9uICAgICA9IGZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX3Bvc2l0aW9uO307XG5Nb3VzZS5wcm90b3R5cGUuZ2V0UG9zaXRpb25MYXN0ID0gZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fcG9zaXRpb25MYXN0O307XG5Nb3VzZS5wcm90b3R5cGUuZ2V0WCAgICAgICAgICAgID0gZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fcG9zaXRpb25bMF07fTtcbk1vdXNlLnByb3RvdHlwZS5nZXRZICAgICAgICAgICAgPSBmdW5jdGlvbigpe3JldHVybiB0aGlzLl9wb3NpdGlvblsxXTt9O1xuTW91c2UucHJvdG90eXBlLmdldFhMYXN0ICAgICAgICA9IGZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX3Bvc2l0aW9uTGFzdFswXTt9O1xuTW91c2UucHJvdG90eXBlLmdldFlMYXN0ICAgICAgICA9IGZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX3Bvc2l0aW9uTGFzdFsxXTt9O1xuXG5Nb3VzZS5fX2luc3RhbmNlID0gbnVsbDtcbk1vdXNlLmdldEluc3RhbmNlID0gZnVuY3Rpb24oKXtyZXR1cm4gTW91c2UuX2luc3RhbmNlO307XG5cbm1vZHVsZS5leHBvcnRzID0gTW91c2U7IiwibW9kdWxlLmV4cG9ydHMgPVxue1xuICAgIHRvQXJyYXkgOiBmdW5jdGlvbihmbG9hdDMyQXJyYXkpe3JldHVybiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChmbG9hdDMyQXJyYXkpO31cbn07IixudWxsXX0=
;