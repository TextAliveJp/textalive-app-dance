import * as THREE from "three";

import { SceneBase } from "./SceneBase";
import { PresentData } from "../model/PresentData";
import { MathExt } from "../util/MathExt";
import { CameraMotion } from "../model/CameraMotion";
import { PrimTorus, PrimTetrahedron, PrimCube, PrimSphere, PrimBase } from "../object/Primitive";
import { MaterialUtil } from "../util/MaterialUtil";
import { MotionId } from "../controller/MotionManager";
import { Ref } from "../core/Ref";

/**
 * プリミティブオブジェクトのシーンのベース
 */
export class ObjSceneBase extends SceneBase
{
    protected _objs  :PrimBase[] = [];
    protected _total :number = 0;

    constructor (parent :THREE.Object3D)
    {
        super(parent);
        Ref.player.addParameterUpdateListener((name, value) => this._parameterUpdate(name, value));
    }
    
    private _parameterUpdate (name, value)
    {
        if (! this._isActive) return;
        
        switch (name)
        {
        case "Color1":
        case "Color2":
        case "Color3":
        case "Color4":
            for (var i = 0; i < this._total; i ++)
            {
                this._objs[i].mesh.material = MaterialUtil.getToon(this._getColor(), 3);
                this._objs[i].mesh.material["needsUpdate"] = true;
            }
            break;
        }
    }

    private _getColor ()
    {
        return Ref.parameter.colors[MathExt.randInt(0, 3)];
    }

    protected _getRandom ()
    {
        var mat = MaterialUtil.getToon(this._getColor(), 3);

        var parent = this._parent;
        var obj :PrimBase;

        var type = MathExt.randInt(0, 3);
        switch (type)
        {
        case 0:
            obj = new PrimCube(parent, mat, 2, 2, 2);
            break;
        case 1:
            obj = new PrimSphere(parent, mat, 1, 12, 10);
            break;
        case 2:
            obj = new PrimTorus(parent, mat, 1, 0.3, 8, MathExt.randInt(3, 6));
            break;
        case 3:
            obj = new PrimTetrahedron(parent, mat, 1, 0);
            break;
        }
        return obj;
    }
    
    public show (seed :number = 0)
    {
        this._kill();
        super.show(seed);
    }

    public hide ()
    {
        this._kill();
        super.hide();
    }

    protected _kill ()
    {
        for (var i = 0; i < this._total; i ++)
        {
            var obj = this._objs[i];
            obj.parent.remove(obj.mesh);
            this._objs[i] = null;
            delete this._objs[i];
        }
        this._objs  = [];
        this._total = 0;
    }
}