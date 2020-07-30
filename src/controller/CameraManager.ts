
import * as THREE from "three";
import { MathExt } from "../util/MathExt";
import { PresentData } from "../model/PresentData";
import { CameraMotion } from "../model/CameraMotion";
import { Util } from "../util/Util";
import { Ref } from "../core/Ref";

export class CameraManager
{
    private _camera :THREE.PerspectiveCamera;
    private _motion :CameraMotion;

    private _target :THREE.Vector3;
    private _up :THREE.Vector3;

    private _tx    :number = 0;
    private _ty    :number = 0;
    private _ratex :number = 0;
    private _ratey :number = 0;


    constructor (camera :THREE.PerspectiveCamera)
    {
        this._camera = camera;
        this._target = new THREE.Vector3();
        this._up = new THREE.Vector3();

        this._motion = new CameraMotion();

        this._initEvents();
    }

    private _initEvents ()
    {
        var isMobile = Util.checkMobile();

        if (! isMobile)
        {
            document.getElementById("view").addEventListener("mousemove",  (e) => this._touchmove(e));
            document.getElementById("view").addEventListener("mouseleave", (e) => this._touchend(e));
        }
        else
        {
            document.getElementById("view").addEventListener("touchmove", (e) => this._touchmove(e));
            document.getElementById("view").addEventListener("touchend",  (e) => this._touchend(e));
        }
    }

    private _touchmove (e)
    {
        var mx = 0;
        var my = 0;

        if (e.touches)
        {
            mx = e.touches[0].clientX;
            my = e.touches[0].clientY;
        }
        else
        {
            mx = e.clientX;
            my = e.clientY;
        }
        this._tx = 2 * mx / Ref.stw - 1;
        this._ty = 2 * my / Ref.sth - 1;
    }
    private _touchend (e)
    {
        this._tx = 0;
        this._ty = 0;
    }

    public setup (motion :CameraMotion)
    {
        this._motion = motion;
    }

    public update (data :PresentData)
    {
        var camera = this._camera;

        this._ratex += (this._tx - this._ratex) / 10;
        this._ratey += (this._ty - this._ratey) / 10;

        if (this._motion)
        {
            var now = data.now;
            
            var pos = this._calcCameraPos(now);
            camera.position.set(pos.x, pos.y, pos.z);
            
            this._target = this._calcTargetPos(now);
            this._up     = this._calcUpPos(now);

            camera.up.set(this._up.x, this._up.y, this._up.z);
            camera.lookAt(this._target);
        }
    }

    private _calcCameraPos (now :number)
    {
        if (! this._motion) return new THREE.Vector3(0, 0, 0);

        var m   = this._motion;
        var lat = MathExt.toRad(m.lat);
        var lng = MathExt.toRad(m.lng);
        if (0 < m.latMov) lat += MathExt.toRad(Math.sin(now / (1000 * m.latMovSpeed)) * m.latMov);
        if (0 < m.lngMov) lng += MathExt.toRad(Math.sin(now / (1000 * m.lngMovSpeed)) * m.lngMov);
        
        var r = m.distance;
        if (0 < m.distanceMov) r += Math.sin(now / (1000 * m.distanceMovSpeed)) * m.distanceMov;

        var x = - r * Math.cos(lat) * Math.cos(lng) - this._ratex * 4;
        var y =   r * Math.sin(lat)                 + this._ratey * 4;
        var z =   r * Math.cos(lat) * Math.sin(lng);

        return new THREE.Vector3(x, y, z);
    }
    private _calcTargetPos (now :number)
    {
        if (! this._motion) return new THREE.Vector3(0, 0, 0);

        var m   = this._motion;
        var tx = m.targetPos.x + this._ratex * 6;
        var ty = m.targetPos.y - this._ratey * 6;
        var tz = m.targetPos.z;
        if (0 < m.targetMov.x) tx += Math.sin(now / (1000 * m.targetMovSpeed.x)) * m.targetMov.x;
        if (0 < m.targetMov.y) ty += Math.sin(now / (1000 * m.targetMovSpeed.y)) * m.targetMov.y;
        if (0 < m.targetMov.z) tz += Math.sin(now / (1000 * m.targetMovSpeed.z)) * m.targetMov.z;

        return new THREE.Vector3(tx, ty, tz);
    }
    private _calcUpPos (now :number)
    {
        if (! this._motion) return new THREE.Vector3(0, 0, 0);

        var m   = this._motion;
        var ux = m.camup.x;
        var uy = m.camup.y;
        var uz = m.camup.z;
        if (0 < m.camupMov.x) ux += Math.sin(now / (1000 * m.camupMovSpeed.x)) * m.camupMov.x;
        if (0 < m.camupMov.y) uy += Math.sin(now / (1000 * m.camupMovSpeed.y)) * m.camupMov.y;
        if (0 < m.camupMov.z) uz += Math.sin(now / (1000 * m.camupMovSpeed.z)) * m.camupMov.z;

        return new THREE.Vector3(ux, uy, uz);
    }

    

    public getCameraPos (now :number = -1)
    {
        if (0 <= now) return this._calcCameraPos(now);
        return this._camera.position;
    }
    public getTargetPos (now :number = -1)
    {
        if (0 <= now) return this._calcTargetPos(now);
        return this._target;
    }
    public getUpPos (now :number = -1)
    {
        if (0 <= now) return this._calcUpPos(now);
        return this._up;
    }
}