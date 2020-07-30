import * as THREE from "three";
import { PresentData } from "../model/PresentData";
import { CameraManager } from "../controller/CameraManager";
import { MMDManager } from "../controller/MMDManager";
import { MathExt } from "../util/MathExt";
import { CameraMotion } from "../model/CameraMotion";

/**
 * 各シーン（カット）のベース
 */
export class SceneBase
{
    protected _parent :THREE.Object3D;
    
    protected _cameraMng :CameraManager;
    protected _mmdMng    :MMDManager;

    protected _seed :number = 0;

    protected _isActive :boolean = false;

    constructor (parent :THREE.Object3D)
    {
        this._parent = parent;
    }

    public init (cameraMng :CameraManager, mmdMng :MMDManager)
    {
        this._cameraMng = cameraMng;
        this._mmdMng    = mmdMng;

        return this;
    }

    public show (seed :number = null)
    {
        this._isActive = true;

        if (isNaN(seed)) seed = this._seed;
        MathExt.seed = this._seed = seed;
    }
    public hide ()
    {
        this._isActive = false;
    }

    public update (data :PresentData)
    {
        this._cameraMng.update(data);
        this._mmdMng.update(data);
    }

    protected _getRandomCameraMotion ()
    {
        return new CameraMotion()
        .setupLatLng(MathExt.rand(-10, 40), MathExt.rand(-40, 40) + 90, MathExt.rand(10, 30), MathExt.rand(10, 30), MathExt.rand(1, 1.8), MathExt.rand(1, 1.8))
        .setupDistance(MathExt.rand(32, 50), 10, MathExt.rand(1, 2.5))
        .setupTarget(0, 5, 0, 1, 1, 1, 1, 2, 3)
        .setupCamUp(MathExt.rand(-1, 1), MathExt.rand(0, 1), 0)
    }
}