import * as THREE from "three";
import { MMDLoader } from "three/examples/jsm/loaders/MMDLoader";

import { BoneName, MotionManager } from "./MotionManager";
import { PresentData } from "../model/PresentData";
import { TextureUtil } from "../util/TextureUtil";
import { ModelStand } from "../object/ModelStand";
import { Ref } from "../core/Ref";
import { MorphId } from "../constant/MorphId";
import { MathExt } from "../util/MathExt";
import { ModelId } from "../constant/ModelId";


export class MMDManager
{
    private _modelId :number = -1;
    private _parent  :THREE.Object3D;

    private _mesh      :THREE.SkinnedMesh;
    private _motionMng :MotionManager;
    
    private _loadedFlags   :boolean[] = [];
    private _meshList      :THREE.SkinnedMesh[] = [];
    private _motionMngList :MotionManager[]     = [];

    private _motionId :number = -1;

    private _modelStand :ModelStand;


    constructor (parent :THREE.Object3D)
    {
        this._parent = parent;
        this._modelStand = new ModelStand(parent);

        Ref.player.addParameterUpdateListener((name, value) => this._parameterUpdate(name, value));
    }

    private _parameterUpdate (name, value)
    {
        if (name == "Model") this.load(value);
    }

    public load (modelId :number) :MMDManager
    {
        if (this._modelId == modelId) return;

        this._modelId  = modelId;

        if (this._loadedFlags[modelId])
        {
            if (this._meshList[modelId])
            {
                for (var i = 0; i < 5; i ++) if (i != this._modelId && this._meshList[i]) this._meshList[i].visible = false;
                
                this._mesh      = this._meshList[modelId];
                this._motionMng = this._motionMngList[modelId];
                this._mesh.visible = true;

                this._motionMng.change(this._motionId);
            }
        }
        else
        {
            this._loadedFlags[modelId] = true;

            var path = ModelId.getModelPath(modelId);
            var loader = new MMDLoader();
            loader.load(path, (object) => this._complete(object, modelId), (xhr) => this._progress(xhr, modelId), (evt) => this._error(evt, modelId));
        }

        return this;
    }

    public update (data :PresentData)
    {
        if (! this._motionMng) return;

        var prog = data.beatProgress + data.beat.index + Ref.player.beatOffset;
        this._motionMng.update(prog, data.now);

        this._modelStand.update(data.now);

        this._updateMorph(data);
        this._lipSync(data);
    }

    private _updateMorph (data :PresentData)
    {
        /// ねこみみ
        this._mesh.morphTargetInfluences[MorphId.NEKOMIMI] = (Ref.parameter.nekomimi) ? 1 : 0;

        /// まばたき
        MathExt.seed = data.beat.index + data.beat.startTime + Ref.parameter.seed;
        if (MathExt.random() < 0.08)
        {
            var dt = data.now - data.beat.startTime;
            var m = 1 - Math.min(Math.abs((dt / 150) - 1), 1);

            this._mesh.morphTargetInfluences[MorphId.MABATAKI] = m;
        }
    }

    // 歌詞に合わせた口の動き（モーフ）
    private _lipSync (data :PresentData)
    {
        var ly = Ref.player.lyric;
        var list = ly.list;

        for (var i = MorphId.LIP_A; i <= MorphId.LIP_A + 5; i ++) this._mesh.morphTargetInfluences[i] = 0;
        for (var i = 0; i < ly.total; i ++)
        {
            var d = list[i];
            
            if (data && d.startTime <= data.now && data.now < d.endTime - 100)
            {
                var id = MorphId.getLipId(d.text, d.startTime);
                this._mesh.morphTargetInfluences[id] = 1;
                break;
            }
        }
    }

    public changeMotion (motionId :number)
    {
        this._motionId = motionId;
        if (this._motionMng) this._motionMng.change(this._motionId);
    }

    private _complete (object, modelId)
    {
        var mesh :THREE.SkinnedMesh = object;
        
        var mats :any = mesh.material;
        for (var i = 0; i < mats.length; i ++)
        {
            var m :THREE.MeshPhongMaterial = mats[i];
            var mp = new THREE.MeshToonMaterial({map: m.map, skinning: true, morphTargets: true, transparent: true,
                gradientMap: TextureUtil.getTone(5), side: THREE.DoubleSide, shininess: 0}); // specular: 0xff0000

            mesh.material[i] = mp;
        }
        this._parent.add(mesh);

        var motionMng = new MotionManager(mesh, new BoneName(modelId));

        this._meshList[modelId] = mesh;
        this._motionMngList[modelId] = motionMng;

        if (modelId == this._modelId)
        {
            for (var i = 0; i < 5; i ++) if (i != this._modelId && this._meshList[i]) this._meshList[i].visible = false;
            
            this._mesh = mesh;
            this._motionMng = motionMng;
            this._motionMng.change(this._motionId);
        }
        else
        {
            mesh.visible = false;
        }
    }
    private _progress (xhr, modelId)
    {
        
    }
    private _error (evt, modelId)
    {
        setTimeout(() => this._retry(modelId), 2000);
    }

    private _retry (modelId)
    {
        var path = ModelId.getModelPath(modelId);
        var loader = new MMDLoader();
        loader.load(path, (object) => this._complete(object, modelId), (xhr) => this._progress(xhr, modelId), (evt) => this._error(evt, modelId));
    }
}
