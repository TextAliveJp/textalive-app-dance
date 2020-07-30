import * as THREE from "three";

import { PrimCylinder, PrimTorus } from "../object/Primitive";
import { MathExt } from "../util/MathExt";
import { MaterialUtil } from "../util/MaterialUtil";
import { Ref } from "../core/Ref";

export class ModelStand
{
    private _torus    :PrimTorus;
    private _cylinder :PrimCylinder;

    private _mat :THREE.MeshToonMaterial;

    constructor (parent :THREE.Object3D)
    {
        var mat = this._mat = MaterialUtil.getToon(0xccccdd, 3);
        this._updateColor();

        var obj1 = new PrimTorus(parent, mat, 5, 0.15, 6, 4);
        obj1.rotationX = MathExt.toRad(90);
        obj1.y = - 0.3;

        var obj2 = new PrimCylinder(parent, mat, 3, 3, 0.2, 6, 1);
        obj2.y = - 0.2;
        obj2.rotationY = MathExt.toRad(360/10);
        
        var obj3 = new PrimCylinder(parent, mat, 1.4, 1.4, 0.1, 24, 1);
        obj3.y = - 0.05;

        this._torus    = obj1;
        this._cylinder = obj2;
        
        Ref.player.addParameterUpdateListener((name, value) => this._parameterUpdate(name, value));
    }
    
    private _parameterUpdate (name, value)
    {
        if (name == "BgColor") this._updateColor();
    }

    private _updateColor ()
    {
        this._mat.color.set(Ref.parameter.bgColor);
        var col = this._mat.color;

        var r = (0.1 < col.r) ? col.r-0.1:col.r+0.1;
        var g = (0.1 < col.g) ? col.g-0.1:col.g+0.1;
        var b = (0.1 < col.b) ? col.b-0.1:col.b+0.1;
        
        this._mat.color.setRGB(r, g, b);
    }

    public update (now :number)
    {
        this._torus   .rotationZ = now / 1000;
        this._cylinder.rotationY = now / 1000 + MathExt.toRad(360/10);
    }

}