import * as THREE from "three";

import { SceneBase } from "./SceneBase";
import { PresentData } from "../model/PresentData";
import { MathExt } from "../util/MathExt";
import { CameraMotion } from "../model/CameraMotion";
import { Line } from "../object/Line";
import { MotionId } from "../controller/MotionManager";
import { LineSceneBase } from "./LineSceneBase";

export class LineScene extends LineSceneBase
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


        this._total = 80;
        for (var i = 0; i < this._total; i ++)
        {
            var line :Line;
            if (this._lines[i]) line = this._lines[i];
            else                line = new Line(this._parent);
            
            var points = [], l = 3;
            for (var j = 0; j < l; j ++)
            {
                var y = (j - (l + 1) / 2) * MathExt.rand(8, 32);
                var b = 2.0;
                points[j] = new THREE.Vector3(MathExt.rand(-b, b), y, MathExt.rand(-b, b));
            }

            line.create({points: points, color: this._getColor(), 
                division: 8, width: MathExt.rand(0.8, 1.2), dashRatio: MathExt.rand(0.6, 0.9), 
                widthCallback: function(p){ return 0.5 + p * 2; }
            });

            var d = 25;
            line.x = MathExt.rand(-d, d);
            line.y = MathExt.rand(-d, d) + 5;
            line.z = MathExt.rand(-d, d);

            line.show();
            this._lines[i] = line;
        }
    }

    public update (data :PresentData)
    {
        super.update(data);
        
        for (var i = 0; i < this._total; i ++)
        {
            this._lines[i].progress = (data.now + i * 93) / 600;
            this._lines[i].y = (((data.now + i * 155) % 5000) / 5000) * 120 - 60;
        }
    }
}