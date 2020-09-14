import * as THREE from "three";
import { Ease } from "../util/Ease";

import { CharData } from "../model/CharData";
import { PresentData } from "../model/PresentData";
import { PrimPlane } from "./Primitive";
import { TextureUtil } from "../util/TextureUtil";
import { Ref } from "../core/Ref";
import { CameraManager } from "../controller/CameraManager";
import { MathExt } from "../util/MathExt";
import { Line } from "./Line";

/**
 * 歌詞平面 ＋ ライン
 */
export class LyricPlane
{
    private _scene :THREE.Scene;

    private _plane :PrimPlane;
    private _cdata :CharData;
    private _cameraMng :CameraManager;

    private _mat :THREE.MeshBasicMaterial;

    private _line :Line;

    constructor ()
    {
        Ref.player.addParameterUpdateListener((name, value) => this._parameterUpdate(name, value));
    }
    public init (data :CharData, scene :THREE.Scene, cameraMng :CameraManager)
    {
        this._scene = scene;
        
        if (! this._mat)
        {
            var mat = this._mat = new THREE.MeshBasicMaterial({map: TextureUtil.getText(data.text, Ref.parameter.fontName), 
                color: Ref.parameter.fontColor, side: THREE.DoubleSide, transparent: true});
            mat.depthTest = false;
            
            this._plane = new PrimPlane(scene, mat, 1, 1);
        }
        this._plane.visible = false;

        this._cdata = data;
        this._cameraMng = cameraMng;

        ///
        this._mat.map = TextureUtil.getText(data.text, Ref.parameter.fontName);
        this._mat.needsUpdate = true;
        ///

        if (this._line) this._line.dispose();
        this._line = null;
    }

    private _parameterUpdate (name, value)
    {
        if (name == "FontStyle")
        {
            this._mat.map = TextureUtil.getText(this._cdata.text, Ref.parameter.fontName);
            this._mat.needsUpdate = true;
        }
        if (name == "FontColor")
        {
            this._mat.color.set(Ref.parameter.fontColor);
            if (this._line) this._line.changeColor(Ref.parameter.fontColor);
        }
    }

    private _calcCameraPos (now :number, p0 :THREE.Vector3, p1 :THREE.Vector3, data :CharData = null)
    {
        var d = data;
        if (! data) d = this._cdata;

        MathExt.seed = d.startTime + Ref.parameter.seed;

        var rand    = (min, max) => MathExt.rand(min, max);
        var randInt = (min, max) => MathExt.randInt(min, max);
        
        var ts = 1 - d.progressHead(now);
        var te =     d.progressTail(now);

        var tp = d.progress(now);

        var k = 0.3;
        var x = (p1.x - p0.x) * k + p0.x + rand(-2, 2) + tp * rand(-2, 2) + rand(-2, 2) * Math.sin(now / randInt(387, 787));
        var z = (p1.z - p0.z) * k + p0.z + rand(-2, 2) + tp * rand(-2, 2) + rand(-2, 2) * Math.sin(now / randInt(387, 787));
        var y = (p1.y - p0.y) * k + p0.y - Ease.easeInQuart(ts) * 25 + Ease.easeInQuart(te) * 25 + tp * 12 - 6;

        return new THREE.Vector3(x, y, z);
    }
    
    private _createLine (now :number)
    {
        if (! this._cdata.next) return;

        var d = this._cdata;

        var off0 = - 600;
        var off1 = - 100;

        d.options.start = d.endTime        + off0;
        d.options.end   = d.next.startTime + off1;
        d.options.dtime = d.options.end - d.options.start;

        if (now < d.options.start || d.options.end <= now || 2000 <= d.options.dtime) return;


        var tn = d.options.start;
        var p0 = this._cameraMng.getCameraPos(tn);
        var p1 = this._cameraMng.getTargetPos(tn);
        var pos0 = this._calcCameraPos(tn, p0, p1);

        tn = d.options.end;
        p0 = this._cameraMng.getCameraPos(tn);
        p1 = this._cameraMng.getTargetPos(tn);
        var pos1 = this._calcCameraPos(tn, p0, p1, d.next);

        var dp = pos1.clone().sub(pos0);

        var dist = 4, l = 3;
        var points = [pos0];
        for (var i = 0; i < l; i++)
        {
            points.push(new THREE.Vector3(
                MathExt.rand(-dist, dist) + pos0.x + dp.x * i / l,
                MathExt.rand(-dist, dist) + pos0.y + dp.y * i / l,
                MathExt.rand(-dist, dist) + pos0.z + dp.z * i / l,
                ));
        }
        points.push(pos1);
        
        
        this._line = new Line(this._scene);
        this._line.create({points: points, color: Ref.parameter.fontColor, division:48, width: 0.35, dashRatio: 0.70 });
    }

    public update (data :PresentData)
    {
        var p = this._plane;
        var d = this._cdata;
        if (d.startTime - d.head <= data.now && data.now < d.endTime + d.tail)
        {
            p.visible = true;

            var now = data.now;

            var p0 = this._cameraMng.getCameraPos();
            var p1 = this._cameraMng.getTargetPos();
            var up = this._cameraMng.getUpPos();

            var pos = this._calcCameraPos(now, p0, p1);
            
            p.setPos(pos.x, pos.y, pos.z);
            p.target.up.set(up.x, up.y, up.z);
            p.target.lookAt(p0);
            
            p.rotationX += MathExt.rand(-0.5, 0.5) * Math.sin(now / MathExt.randInt(387, 787));
            p.rotationZ += MathExt.rand(-0.5, 0.5) * Math.sin(now / MathExt.randInt(387, 787));

            p.scale = Ease.easeOutBack(this._cdata.progressHead(now, 2000)) * 1.35; /// scale


            if (! this._line) this._createLine(now);
            
            if (this._line)
            {
                if (d.next && d.options.start <= now && now < d.options.end)
                {
                    this._line.show();

                    var prog = Math.min(((now - d.options.start) / d.options.dtime), 1); // Ease.easeInOutSine
                    this._line.progress = prog;
                }
                else this._line.hide();
            }
        }
        else
        {
            p.visible = false;
            if (this._line) this._line.hide();
        }
    }
}