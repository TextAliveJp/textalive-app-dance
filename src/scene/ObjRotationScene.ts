import * as THREE from "three";

import { PresentData } from "../model/PresentData";
import { MathExt } from "../util/MathExt";
import { CameraMotion } from "../model/CameraMotion";
import { MaterialUtil } from "../util/MaterialUtil";
import { MotionId } from "../controller/MotionManager";
import { ObjSceneBase } from "./ObjSceneBase";

export class ObjRotationScene extends ObjSceneBase
{
    private _posys    :number[] = [];
    private _radiuses :number[] = [];

    private _offsetRads :number[] = [];
    
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


        this._total = 72;

        for (var i = 0; i < this._total; i ++)
        {
            var obj = this._getRandom();
            obj.scale = MathExt.rand(0.5, 2.4); // MathExt.rand(0.6, 2.0);
            
            var dmax = 25, dmin = 2;
            var py = MathExt.rand(dmin, dmax);
            py = (MathExt.random() < 0.5) ? py : -py;

            var radius = MathExt.rand(6, 36);

            this._radiuses[i] = radius;
            this._posys[i]    = py;

            this._offsetRads[i] = MathExt.rand(0, Math.PI * 2);

            this._objs[i] = obj;
        }
    }

    public update (data :PresentData)
    {
        super.update(data);
        
        for (var i = 0; i < this._total; i ++)
        {
            var radius = this._radiuses[i] + Math.sin((data.now + i * 97) / 543) * 2;
            var rad = (data.now + i * 97) / (432 + i * 7) + this._offsetRads[i];

            var px = Math.cos(rad) * radius;
            var pz = Math.sin(rad) * radius;
            
            this._objs[i].x = px;
            this._objs[i].z = pz;
            this._objs[i].y = this._posys[i] + Math.sin((data.now + i * 111) / 600) * 3;
            
            this._objs[i].rotationX = (data.now + i * 111) / 432;
            this._objs[i].rotationZ = (data.now + i * 123) / 489;
        }
    }

}