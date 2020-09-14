import * as THREE from "three";
import { Ease } from "../util/Ease";

import { PresentData } from "../model/PresentData";
import { MathExt } from "../util/MathExt";
import { CameraMotion } from "../model/CameraMotion";
import { MotionId } from "../controller/MotionManager";
import { ObjSceneBase } from "./ObjSceneBase";
import { Ref } from "../core/Ref";

export class ObjBeatScene extends ObjSceneBase
{
    private _positions   :THREE.Vector3[] = [];
    private _posDiffPres :THREE.Vector3[] = [];
    private _posDiffNows :THREE.Vector3[] = [];
    private _scales :number[] = [];
    

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
            this._scales[i] = MathExt.rand(0.6, 2.8);
            
            var dmax = 25, dmin = 3;
            var px = MathExt.rand(dmin, dmax);
            var py = MathExt.rand(dmin, dmax);
            var pz = MathExt.rand(dmin, dmax);
            px = (MathExt.random() < 0.5) ? px : -px;
            py = (MathExt.random() < 0.5) ? py : -py;
            pz = (MathExt.random() < 0.5) ? pz : -pz;

            if (! this._positions[i])
            {
                this._positions[i]   = new THREE.Vector3();
                this._posDiffPres[i] = new THREE.Vector3();
                this._posDiffNows[i] = new THREE.Vector3();
            }
            this._positions[i].set(px, py, pz);

            this._objs[i] = obj;
        }
    }
    
    public update (data :PresentData)
    {
        super.update(data);

        var off   = 0.45;
        var prog  = data.beatProgress + Ref.player.beatOffset + off;
        var tprog = prog % 1;

        var tbeat = data.beat;;
        if (0 < Ref.player.beatOffset + off && prog < 1 && tbeat.previous) tbeat = tbeat.previous;


        this._calcPositions(this._posDiffPres, (tbeat.previous) ? tbeat.previous.startTime + 12345 : 12345);
        this._calcPositions(this._posDiffNows, tbeat.startTime + 12345);


        var prog1 = Ease.easeOutBack(Math.min(tprog * 1.5, 1));
        var prog0 = 1 - prog1;

        var progRot = Ease.easeOutBack(tprog);
        var index = tbeat.index;


        var progSc = prog0;
        
        for (var i = 0; i < this._total; i ++)
        {
            var obj = this._objs;
            var pos = this._positions;

            var prePos = this._posDiffPres[i];
            var nowPos = this._posDiffNows[i];

            obj[i].x = pos[i].x + prePos.x * prog0 + nowPos.x * prog1;
            obj[i].y = pos[i].y + prePos.y * prog0 + nowPos.y * prog1;
            obj[i].z = pos[i].z + prePos.z * prog0 + nowPos.z * prog1;

            obj[i].rotationX = (progRot + index) * (0.611 + i * 0.0023);
            obj[i].rotationY = (progRot + index) * (0.639 + i * 0.0011);
            
            obj[i].scale = this._scales[i] + progSc * 1.0;
        }
    }

    private _calcPositions (poses :THREE.Vector3[], seed :number)
    {
        MathExt.seed = seed;

        var d = 3;
        for (var i = 0; i < this._total; i ++)
        {
            var p = poses[i];
            p.set(MathExt.rand(-d, d), MathExt.rand(-d, d), MathExt.rand(-d, d));
        }
    }
}