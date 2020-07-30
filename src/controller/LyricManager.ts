import { PresentData } from "../model/PresentData";
import { Ref } from "../core/Ref";
import { LyricPlane } from "../object/LyricPlane";
import { CameraManager } from "./CameraManager";

export class LyricManager
{
    private _scene  :THREE.Scene;
    private _lyrics :LyricPlane[] = [];
    private _cameraMng :CameraManager;

    constructor (scene :THREE.Scene, cameraMng :CameraManager)
    {
        this._scene = scene;
        this._cameraMng = cameraMng;
    }

    public init ()
    {
        var ly = Ref.player.lyric;
        var list = ly.list;

        for (var i = 0; i < ly.total; i ++)
        {
            if (! this._lyrics[i])
            {
                this._lyrics[i] = new LyricPlane();
            }
            var d = list[i];

            this._lyrics[i].init(d, this._scene, this._cameraMng);
        }
    }

    public update (data :PresentData)
    {
        var ly = Ref.player.lyric;
        var list = ly.list;

        for (var i = 0; i < ly.total; i ++)
        {
            var lplane = this._lyrics[i];
            lplane.update(data);
        }
    }
}