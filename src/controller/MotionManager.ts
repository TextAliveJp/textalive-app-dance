import * as THREE from "three";
import { CCDIKSolver } from "three/examples/jsm/animation/CCDIKSolver";

import { Ease } from "../util/Ease";
import { MathExt } from "../util/MathExt";
import { ModelId } from "../constant/ModelId";
import { Ref } from "../core/Ref";


// _____________________________________________________________________ BoneName
//
export class BoneName
{
    public CENTER     :number = 0;
    public UPPER_BODY :number = 2;
    public NECK       :number = 3;
    public HEAD       :number = 4;
    public HEAD_TOP   :number = 5;
    
    public L_SHOULDER :number = 6;
    public L_ARM      :number = 7;
    public L_ELBOW    :number = 8;

    public R_SHOULDER :number = 11;
    public R_ARM      :number = 12;
    public R_ELBOW    :number = 13;

    public LOWER_BODY :number = 16;

    public L_FOOT_IK :number = 26;
    public R_FOOT_IK :number = 30;

    public L_HAIR1 :number = 26;
    public R_HAIR1 :number = 27;
    public L_HAIR2 :number = 28;
    public R_HAIR2 :number = 29;
    // public L_HAIR3 :number = 30;
    // public R_HAIR3 :number = 31;

    // not use 角度初期化用
    public _L_FOOT  :number = 18;
    public _L_KNEE  :number = 19;
    public _L_ANKLE :number = 20;
    public _R_FOOT  :number = 22;
    public _R_KNEE  :number = 23;
    public _R_ANKLE :number = 24;

    public list :number[] = [];

    private _modelId :number;
    public get modelId () { return this._modelId; }

    constructor (modelId :number)
    {
        this._modelId = modelId;
        
        switch (modelId)
        {
        case ModelId.MIKU:
            this.L_FOOT_IK = 34;
            this.R_FOOT_IK = 38;
            break;
        case ModelId.RIN:
            this.L_FOOT_IK = 30;
            this.R_FOOT_IK = 34;
            break;
        default:
            this.L_FOOT_IK = 26;
            this.R_FOOT_IK = 30;
            break;
        }

        this.list = [
            this.CENTER, this.UPPER_BODY, this.NECK, this.HEAD, 
            this.L_SHOULDER, this.L_ARM, this.L_ELBOW, 
            this.R_SHOULDER, this.R_ARM, this.R_ELBOW,
            this.LOWER_BODY, this.L_FOOT_IK, this.R_FOOT_IK,
            this._L_FOOT, this._L_KNEE, this._L_ANKLE, this._R_FOOT, this._R_KNEE, this._R_ANKLE, 
        ];
        switch (modelId)
        {
        case ModelId.MIKU:
            this.list.push(this.L_HAIR1, this.R_HAIR1, this.L_HAIR2, this.R_HAIR2);
            break;
        }
    }
}

// _____________________________________________________________________ BoneBase
//
class BoneBase
{
    public useRot :boolean = false;
    public usePos :boolean = false;

    public rotations :THREE.Vector3[] = [];
    public positions :THREE.Vector3[] = [];

    public isHalfRot :boolean = false;
    public isHalfPos :boolean = false;

    constructor ()
    {

    }
    public addRotations (list :any[], isHalf :boolean = false)
    {
        this.useRot    = true;
        this.isHalfRot = isHalf;
        this.rotations = this._convertList(list);
    }
    public addPositions (list :any[], isHalf :boolean = false)
    {
        this.usePos    = true;
        this.isHalfPos = isHalf;
        this.positions = this._convertList(list);
    }
    public reset ()
    {
        this.useRot = this.usePos = false;
        this.rotations = [];
        this.positions = [];
    }

    private _convertList (list :any[])
    {
        /// bpm に応じてスケール
        var sc = 1 - ((Ref.player.bpm - 150) / 50) * 0.5;
        sc = (1.0 < sc) ? 1.0 : sc;
        sc = (sc < 0.5) ? 0.5 : sc;

        for (var i = 0, l = list.length; i < l; i ++)
        {
            if (3 <= list[i].length) list[i] = new THREE.Vector3(list[i][0] * sc, list[i][1] * sc, list[i][2] * sc);
        }
        return list;
    }
}

// _____________________________________________________________________ MotionBase
//
class MotionBase
{
    public rate :number = 0;

    protected _boneName :BoneName;

    protected _bones :BoneBase[] = [];

    public rotation :THREE.Vector3;

    constructor (boneName :BoneName)
    {
        this._boneName = boneName;
        for (var i = 0, l = boneName.list.length; i < l; i ++)
        {
            var b = new BoneBase();
            this._bones[boneName.list[i]] = b;
        }
        this.rotation = new THREE.Vector3();
    }
    public init ()
    {

    }

    public update (p :number)
    {
        var listRot = [], listPos = [];

        var bn = this._boneName;
        for (var i = 0, l = bn.list.length; i < l; i ++)
        {
            var id = bn.list[i];
            var b = this._bones[id];
            if (b.useRot)
            {
                listRot[id] = this._calc(b, p, true);
            }
            if (b.usePos)
            {
                listPos[id] = this._calc(b, p, false);
            } 
        }
        return [listRot, listPos];
    }

    private _calc (b :BoneBase, p :number, isRotation :boolean = true)
    {
        var vecs   = (isRotation) ? b.rotations : b.positions;
        var isHalf = (isRotation) ? b.isHalfRot : b.isHalfPos;
        
        var n0 :number, n1 :number, prog :number;
        var easeFunc :Function;
        var len = vecs.length;

        //
        if (p < 0) p = p % len + len;

        if (! isHalf)
        {
            n0 = Math.floor(p) % len;

            prog = p % 1;
            easeFunc = (x) => Ease.easeInOutCubic(x);
        }
        else
        {
            n0 = Math.floor(p * 2) % len;

            prog = p % 1;
            if (prog < 0.5) easeFunc = (x) => Ease.easeInCubic(x);
            else            easeFunc = (x) => Ease.easeOutCubic(x);
            prog = (prog * 2) % 1;
        }
        n1 = (n0 + 1 < len) ? n0 + 1 : 0;

        var dx = vecs[n1].x - vecs[n0].x;
        var dy = vecs[n1].y - vecs[n0].y;
        var dz = vecs[n1].z - vecs[n0].z;

        var v = new THREE.Vector3();
        v.x = vecs[n0].x + easeFunc(prog) * dx;
        v.y = vecs[n0].y + easeFunc(prog) * dy;
        v.z = vecs[n0].z + easeFunc(prog) * dz;

        return v;
    }
}

// _____________________________________________________________________ MotionPatapata
//
class MotionPatapata extends MotionBase
{
    public init ()
    {
        var tr = MathExt.toRad;
        var bn = this._boneName;

        this._bones[bn.CENTER].addPositions([[0, 0, 0], [0, -0.6, 0]], true);
        
        this._bones[bn.NECK].addRotations([[tr(-10), 0, 0], [tr(5), 0, 0]], true);
        
        this._bones[bn.UPPER_BODY].addRotations([[0, tr(-20), 0], [0, tr(20), 0]], false);

        this._bones[bn.L_SHOULDER].addRotations([[0, 0, tr( 25)], [0, 0, tr(-30)]], true);
        this._bones[bn.R_SHOULDER].addRotations([[0, 0, tr(-25)], [0, 0, tr( 30)]], true);

        /*
        // y 軸回転
        var deg = MathExt.rand(40, 80);
        if (MathExt.random() < 0.5) deg = - deg;
        this.rotation.set(0, tr(deg), 0);
        */
        
        if (bn.modelId == ModelId.MIKU)
        {
            this._bones[bn.R_HAIR1].addRotations([[0, 0, tr(-30)], [0, 0, tr( 10)]], true);
            this._bones[bn.L_HAIR1].addRotations([[0, 0, tr( 30)], [0, 0, tr(-10)]], true);
        }
    }
}

// _____________________________________________________________________ MotionTest
//
class MotionSayuu extends MotionBase
{
    public init ()
    {
        var tr = MathExt.toRad;
        var bn = this._boneName;
        
        this._bones[bn.CENTER].addPositions([[0, 0, 0], [0, -1, 0]], true);
        this._bones[bn.CENTER].addRotations([[0, 0, tr(-20)], [0, 0, tr(20)]]);

        this._bones[bn.NECK].addRotations([[0, 0, tr(-30)], [0, 0, tr(30)]]);
        
        this._bones[bn.L_SHOULDER].addRotations([[0, 0, tr(-25)]]);
        this._bones[bn.R_SHOULDER].addRotations([[0, 0, tr( 25)]]);

        if (bn.modelId == ModelId.MIKU)
        {
            this._bones[bn.R_HAIR1].addRotations([[0, 0, tr(-40)], [0, 0, tr(10)]]);
            this._bones[bn.R_HAIR2].addRotations([[0, 0, tr(-30)], [0, 0, tr( 0)]]);
            this._bones[bn.L_HAIR1].addRotations([[0, 0, tr(-10)], [0, 0, tr(40)]]);
            this._bones[bn.L_HAIR2].addRotations([[0, 0, tr(  0)], [0, 0, tr(30)]]);
        }
    }
}

// _____________________________________________________________________ MotionZengo
//
class MotionZengo extends MotionBase
{
    public init ()
    {
        var tr = MathExt.toRad;
        var bn = this._boneName;
        
        this._bones[bn.CENTER].addPositions([[0, 0, 0], [0, -1, 0]], true);
        this._bones[bn.CENTER].addRotations([[tr(20), 0, 0], [tr(-20), 0, 0]]);

        this._bones[bn.NECK].addRotations([[tr(30), 0, 0], [tr(-30), 0, 0]]);
        
        this._bones[bn.L_SHOULDER].addRotations([[tr(30), 0, tr(-25)], [tr(-30), 0, tr(-25)]]);
        this._bones[bn.R_SHOULDER].addRotations([[tr(30), 0, tr( 25)], [tr(-30), 0, tr( 25)]]);
        this._bones[bn.L_ELBOW].addRotations([[tr(0), 0, 0], [tr(-60), tr(-30), 0]]);
        this._bones[bn.R_ELBOW].addRotations([[tr(0), 0, 0], [tr(-60), tr( 30), 0]]);

        if (bn.modelId == ModelId.MIKU)
        {
            this._bones[bn.R_HAIR1].addRotations([[tr( 30), 0, 0], [tr(0), 0, 0]]);
            this._bones[bn.R_HAIR2].addRotations([[tr( 10), 0, 0], [tr(-20), 0, 0]]);
            this._bones[bn.L_HAIR1].addRotations([[tr( 30), 0, 0], [tr(0), 0, 0]]);
            this._bones[bn.L_HAIR2].addRotations([[tr( 10), 0, 0], [tr(-20), 0, 0]]);
        }
    }
}

// _____________________________________________________________________ MotionHineri
//
class MotionHineri extends MotionBase
{
    public init ()
    {
        var tr = MathExt.toRad;
        var bn = this._boneName;

        this._bones[bn.CENTER].addPositions([[0, 0, 0], [0, -1, 0]], true);
        this._bones[bn.CENTER].addRotations([[0, tr(35), 0], [0, tr(-35), 0]]);
        
        this._bones[bn.NECK].addRotations([[tr(20), 0, 0], [tr(-20), 0, 0]], true);
        this._bones[bn.HEAD].addRotations([[0, tr(-20), 0], [0, tr(20), 0]]);

        this._bones[bn.L_SHOULDER].addRotations([[tr( 20), 0, 0], [tr(-60), 0, 0]]);
        this._bones[bn.R_SHOULDER].addRotations([[tr(-60), 0, 0], [tr( 20), 0, 0]]);
        this._bones[bn.L_ELBOW].addRotations([[tr(-60), tr(-30), 0]]);
        this._bones[bn.R_ELBOW].addRotations([[tr(-60), tr( 30), 0]]);
        

        if (bn.modelId == ModelId.MIKU)
        {
            this._bones[bn.R_HAIR1].addRotations([[0, 0, tr(-40)], [0, 0, tr(10)]]);
            this._bones[bn.R_HAIR2].addRotations([[0, 0, tr(-30)], [0, 0, tr( 0)]]);
            this._bones[bn.L_HAIR1].addRotations([[0, 0, tr(-10)], [0, 0, tr(40)]]);
            this._bones[bn.L_HAIR2].addRotations([[0, 0, tr(  0)], [0, 0, tr(30)]]);
        }
    }
}

// _____________________________________________________________________ MotionWow
//
class MotionWow extends MotionBase
{
    public init ()
    {
        var tr = MathExt.toRad;
        var bn = this._boneName;

        this._bones[bn.CENTER].addPositions([[0, 0, 0], [0, -1, 0]], true);
        this._bones[bn.CENTER].addRotations([[tr(10), 0, 0], [tr(-10), 0, 0]]);
        
        this._bones[bn.NECK].addRotations([[tr(-20), 0, 0], [tr(-30), 0, 0]]);
        this._bones[bn.UPPER_BODY].addRotations([[0, 0, 0], [tr(-10), 0, 0]]);

        this._bones[bn.L_SHOULDER].addRotations([[0, tr(-20), tr( 30)], [0, tr(-10), tr( 20)]]);
        this._bones[bn.R_SHOULDER].addRotations([[0, tr( 20), tr(-30)], [0, tr( 10), tr(-20)]]);

        this._bones[bn.L_ELBOW].addRotations([[0, tr(-30), tr( 30)], [0, tr( 20), tr(-20)]], true);
        this._bones[bn.R_ELBOW].addRotations([[0, tr( 30), tr(-30)], [0, tr(-20), tr( 20)]], true);

        this._bones[bn.R_FOOT_IK].addPositions([[-0.3, 0, 0]]);
        this._bones[bn.L_FOOT_IK].addPositions([[ 0.3, 0, 0]]);

    }
}


// _____________________________________________________________________ MotionId
//
export class MotionId
{
    public static PATAPATA :number = 0;
    public static SAYUU    :number = 1;
    public static ZENGO    :number = 2;
    public static HINERI   :number = 3;
    public static WOW      :number = 4;

    public static getRandom ()
    {
        return MathExt.randInt(0, 4);
    }
}

// _____________________________________________________________________ MotionManager
//
export class MotionManager
{
    private _mesh :THREE.SkinnedMesh;
    private _ikSolver :CCDIKSolver;


    private _boneName :BoneName;
    private _motions  :MotionBase[] = [];
    private _motionId :number = -1;

    private _defRotations :THREE.Euler  [] = [];
    private _defPositions :THREE.Vector3[] = [];

    constructor (mesh :THREE.SkinnedMesh, boneName :BoneName)
    {
        this._mesh = mesh;
        this._ikSolver = new CCDIKSolver(mesh, mesh.geometry["userData"].MMD.iks);

        this._boneName = boneName;
        this._motions[MotionId.PATAPATA] = new MotionPatapata(boneName);
        this._motions[MotionId.SAYUU]    = new MotionSayuu(boneName);
        this._motions[MotionId.ZENGO]    = new MotionZengo(boneName);
        this._motions[MotionId.HINERI]   = new MotionHineri(boneName);
        this._motions[MotionId.WOW]      = new MotionWow(boneName);

        

        var bn = this._boneName;
        for (var i = 0, l = bn.list.length; i < l; i ++)
        {
            var id = bn.list[i];
            var b = this._mesh.skeleton.bones[id];
            this._defRotations[id] = b.rotation.clone();
            this._defPositions[id] = b.position.clone();
        }
        this.change(0);
    }

    public change (motionId :number)
    {
        if (this._motionId == motionId) return;
        
        if (0 <= this._motionId && this._motions[this._motionId]) this._motions[this._motionId].rate = 0;
        this._motionId = motionId;
        if (0 <= this._motionId && this._motions[this._motionId])
        {
            this._motions[this._motionId].init();
            this._motions[this._motionId].rate = 1;
        }
    }

    public update (p :number, now :number)
    {
        var list = [];

        this._mesh.rotation.set(0, 0, 0);

        var l = this._motions.length;
        for (var i = 0; i < l; i ++)
        {
            var m = this._motions[i];
            if (0 < m.rate)
            {
                list.push(m.update(p));

                this._mesh.rotation.x += m.rotation.x * now / 1000;
                this._mesh.rotation.y += m.rotation.y * now / 1000;
                this._mesh.rotation.z += m.rotation.z * now / 1000;
            }
        }
        var len = list.length;

        var bones = this._mesh.skeleton.bones;
        
        var bn = this._boneName;
        for (var i = 0, l = bn.list.length; i < l; i ++)
        {
            var id = bn.list[i];
            var b = bones[id];

            // 初期化
            b.rotation.set(this._defRotations[id].x, this._defRotations[id].y, this._defRotations[id].z);
            b.position.set(this._defPositions[id].x, this._defPositions[id].y, this._defPositions[id].z);

            for (var j = 0; j < len; j ++)
            {
                var a = list[j];
                if (a[0][id])
                {
                    b.rotation.x += a[0][id].x;
                    b.rotation.y += a[0][id].y;
                    b.rotation.z += a[0][id].z;
                }
                if (a[1][id])
                {
                    b.position.x += a[1][id].x;
                    b.position.y += a[1][id].y;
                    b.position.z += a[1][id].z;
                }
            }
        }
        this._mesh.updateMatrixWorld(true);
        this._ikSolver.update();
    }
}
