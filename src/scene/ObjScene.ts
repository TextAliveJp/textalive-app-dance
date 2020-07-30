import * as THREE from "three";

import { PresentData } from "../model/PresentData";
import { MathExt } from "../util/MathExt";
import { CameraMotion } from "../model/CameraMotion";
import { MaterialUtil } from "../util/MaterialUtil";
import { MotionId } from "../controller/MotionManager";
import { ObjSceneBase } from "./ObjSceneBase";

export class ObjScene extends ObjSceneBase
{
    private _positions :THREE.Vector3[] = [];
    
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


        this._total = 72; // 130

        for (var i = 0; i < this._total; i ++)
        {
            var obj = this._getRandom();
            obj.scale = MathExt.rand(1.2, 2.8); // MathExt.rand(0.6, 2.0);
            
            var dmax = 25, dmin = 2;
            var px = MathExt.rand(dmin, dmax);
            var pz = MathExt.rand(dmin, dmax);
            obj.x = px = (MathExt.random() < 0.5) ? px : -px;
            obj.z = pz = (MathExt.random() < 0.5) ? pz : -pz;

            if (! this._positions[i]) this._positions[i] = new THREE.Vector3();
            this._positions[i].set(px, 0, pz);

            this._objs[i] = obj;
        }
    }

    public update (data :PresentData)
    {
        super.update(data);
        
        for (var i = 0; i < this._total; i ++)
        {
            var interval = 3600; // + i * 2;
            this._objs[i].y = (((data.now + i * 155) % interval) / interval) * 140 - 70;

            this._objs[i].x = this._positions[i].x + Math.sin((data.now + i * 123) / 500) * 2;
            this._objs[i].z = this._positions[i].z + Math.sin((data.now + i * 111) / 600) * 2;
            
            this._objs[i].rotationX = (data.now + i * 111) / 432;
            this._objs[i].rotationZ = (data.now + i * 123) / 489;
        }
    }
}