import * as THREE from "three";

import { SceneBase } from "./SceneBase";
import { PresentData } from "../model/PresentData";
import { MathExt } from "../util/MathExt";
import { CameraMotion } from "../model/CameraMotion";
import { Line } from "../object/Line";
import { MotionId } from "../controller/MotionManager";
import { LineSceneBase } from "./LineSceneBase";

export class LineRotationScene extends LineSceneBase
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


        this._total = 32;
        for (var i = 0; i < this._total; i ++)
        {
            var line :Line;
            if (this._lines[i]) line = this._lines[i];
            else                line = new Line(this._parent);
            
            var points = [], l = 13;
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
                division: 36, width: MathExt.rand(0.8, 1.2), dashRatio: MathExt.rand(0.6, 0.9), 
                widthCallback: function(p){ return 1; }
            });

            var d = 30;
            line.x = line.z = 0;
            line.y = MathExt.rand(-d, d) + 5;
            line.rotationY = MathExt.rand(0, MathExt.toRad(360));

            line.show();
            this._lines[i] = line;
        }
    }

    public update (data :PresentData)
    {
        super.update(data);
        
        for (var i = 0; i < this._total; i ++)
        {
            this._lines[i].progress  = (data.now + i * 95) / (400 + i * 10);
            this._lines[i].rotationY = (data.now + i * 111) / 500;
            // this._lines[i].y = (((data.now + i * 155) % 4000) / 4000) * 100 - 50;
        }
    }
}