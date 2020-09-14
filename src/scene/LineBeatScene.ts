import * as THREE from "three";
import { Ease } from "../util/Ease";

import { SceneBase } from "./SceneBase";
import { PresentData } from "../model/PresentData";
import { MathExt } from "../util/MathExt";
import { CameraMotion } from "../model/CameraMotion";
import { Line } from "../object/Line";
import { MotionId } from "../controller/MotionManager";
import { LineSceneBase } from "./LineSceneBase";
import { Ref } from "../core/Ref";

export class LineBeatScene extends LineSceneBase
{

    constructor (parent :THREE.Object3D)
    {
        super(parent);
    }

    public show (seed :number = 0)
    {
        super.show(seed);

        
        /// Camera
        this._cameraMng.setup(this._getRandomCameraMotion());

        /// MMD
        this._mmdMng.changeMotion(MotionId.getRandom());


        this._total = 16;
        for (var i = 0; i < this._total; i ++)
        {
            var line :Line;
            if (this._lines[i]) line = this._lines[i];
            else                line = new Line(this._parent);
            
            var points = [], l = MathExt.randInt(5, 13);
            var drad = MathExt.toRad(360 / (l-1));

            var radius = MathExt.rand(6, 32);

            for (var j = 0; j < l; j ++)
            {
                var rad = drad * j;
                var x = Math.cos(rad) * radius;
                var z = Math.sin(rad) * radius;
                var y = 0; // MathExt.rand(4, 10);
                points[j] = new THREE.Vector3(x, y, z);
            }

            line.create({points: points, color: this._getColor(), 
                division: l, width: MathExt.rand(1.2, 5.6), dashRatio: MathExt.rand(0.6, 0.9), 
                widthCallback: function(p){ return 1; }
            });

            var dmax = 30, dmin = 3;
            var ly = MathExt.rand(dmin, dmax);
            line.x = line.z = 0;
            line.y = (MathExt.random() < 0.5) ? ly + 5:- ly + 5;
            line.rotationY = MathExt.rand(0, MathExt.toRad(360));

            line.show();
            this._lines[i] = line;
        }
    }

    public update (data :PresentData)
    {
        super.update(data);

        var prog = data.beatProgress + Ref.player.beatOffset;
        var progress = prog % 1;
        if (data.beat.duration <= 600 && data.beat.length % 2 == 0)
        {
            var pos = data.beat.position;
            if (0 < Ref.player.beatOffset && prog < 1) pos += 1;
            
            progress = (progress + pos % 2) / 2;
        }

        for (var i = 0; i < this._total; i ++)
        {
            this._lines[i].progress = Ease.easeInOutSine(progress);
        }
    }
}