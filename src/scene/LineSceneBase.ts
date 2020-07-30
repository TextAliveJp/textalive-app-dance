import * as THREE from "three";

import { SceneBase } from "./SceneBase";
import { PresentData } from "../model/PresentData";
import { MathExt } from "../util/MathExt";
import { CameraMotion } from "../model/CameraMotion";
import { Line } from "../object/Line";
import { MotionId } from "../controller/MotionManager";
import { Ref } from "../core/Ref";

/**
 * ラインのシーンのベース
 */
export class LineSceneBase extends SceneBase
{
    protected _lines :Line[] = [];
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
            for (var i = 0; i < this._total; i ++) this._lines[i].changeColor(this._getColor());
            break;
        }
    }

    protected _getColor ()
    {
        return Ref.parameter.colors[MathExt.randInt(0, 3)];
        // return 0xff0000 + MathExt.randInt(0x3300, 0x9900) + MathExt.randInt(0xaa, 0xee);
    }
    
    public show (seed :number = 0)
    {
        super.show(seed);
    }

    public hide ()
    {
        for (var i = 0; i < this._total; i ++) this._lines[i].hide();
        super.hide();
    }
}