import { SceneBase } from "../scene/SceneBase";
import { PresentData } from "../model/PresentData";
import { LineScene } from "../scene/LineScene";
import { MathExt } from "../util/MathExt";
import { Ref } from "../core/Ref";
import { CameraManager } from "./CameraManager";
import { MMDManager } from "./MMDManager";
import { LyricManager } from "./LyricManager";
import { LineRotationScene } from "../scene/LineRotationScene";
import { LineBeatScene } from "../scene/LineBeatScene";
import { ObjScene } from "../scene/ObjScene";
import { ObjRotationScene } from "../scene/ObjRotationScene";
import { ObjBeatScene } from "../scene/ObjBeatScene";

export class SceneManager
{
    private _nowId    :number = -1;
    private _scenes   :SceneBase[];
    private _sceneIds :number[] = [];

    private _scene  :THREE.Scene;
    private _camera :THREE.PerspectiveCamera;

    private _cameraMng :CameraManager;
    private _mmdMng    :MMDManager;
    private _lyricMng  :LyricManager;

    private _data :PresentData;
    

    constructor (scene :THREE.Scene, camera :THREE.PerspectiveCamera)
    {
        this._scene  = scene;
        this._camera = camera;

        Ref.player.addParameterUpdateListener((name, value) => this._parameterUpdate(name, value));
    }

    public load (modelId :number)
    {
        if (! this._cameraMng)
        {
            this._cameraMng = new CameraManager(this._camera);
            this._mmdMng    = new MMDManager(this._scene);
            this._lyricMng  = new LyricManager(this._scene, this._cameraMng);
        }  
        this._mmdMng.load(modelId);
    }

    public ready ()
    {
        if (! this._scenes)
        {
            this._scenes = [
                new LineScene        (this._scene).init(this._cameraMng, this._mmdMng), 
                new LineRotationScene(this._scene).init(this._cameraMng, this._mmdMng), 
                new LineBeatScene    (this._scene).init(this._cameraMng, this._mmdMng), 
                new ObjScene         (this._scene).init(this._cameraMng, this._mmdMng), 
                new ObjRotationScene (this._scene).init(this._cameraMng, this._mmdMng), 
                new ObjBeatScene     (this._scene).init(this._cameraMng, this._mmdMng), 
            ];
        }

        this._lyricMng.init();
        
        this._initSceneIds();
    }

    private _initSceneIds ()
    {
        if (0 <= this._nowId) this._scenes[this._nowId].hide();
        this._nowId = -1;

        var seed :number;
        if (Ref.player.video) seed = Ref.player.video.duration + Ref.parameter.seed;
        else                  seed = 12345 + Ref.parameter.seed;
        MathExt.seed = seed;


        var len = this._scenes.length;
        var l = Ref.player.segList.length;
        for (var i = 0; i < l; i ++)
        {
            var id = MathExt.randInt(0, len-1);
            if (1 <= i && this._sceneIds[i-1] == id) // 2 回連続しない
            {
                id ++;
                if (len <= id) id = 0;
            }
            this._sceneIds[i] = id;
        }
    }

    private _parameterUpdate (name, value)
    {
        if (name == "Seed")
        {
            if (0 <= this._nowId)
            {
                this._initSceneIds();
                this._scenes[this._nowId].show(this._calcSeed());
            }
        }
    }

    public update (data :PresentData)
    {
        this._data = data;

        var id = this._sceneIds[data.segId];
        if (id != this._nowId)
        {
            if (0 <= this._nowId) this._scenes[this._nowId].hide();
            this._nowId = id;

            if (0 <= this._nowId) this._scenes[this._nowId].show(this._calcSeed());
        }

        this._scenes[this._nowId].update(data);

        this._lyricMng.update(data);
    }

    private _calcSeed ()
    {
        if (! this._data) return Ref.parameter.seed + 12345;
        return Math.floor(this._data.segData.startTime + this._data.segData.endTime * 0.5 + Ref.parameter.seed + 12345);
    }
}