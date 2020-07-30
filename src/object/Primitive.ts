import * as THREE from "three";
import { Assets } from "../util/Assets";

// _____________________________________________________________________ ObjectBase
//
export class ObjectBase
{
    protected _parent :THREE.Object3D;
    protected _target :THREE.Object3D;

    constructor (target :THREE.Object3D = null, parent :THREE.Object3D = null)
    {
        if (! target) target = new THREE.Object3D();
        this._target = target;
        if (parent)
        {
            this._parent = parent;
            this._parent.add(this._target);
        }
        else this._parent = target.parent;
    }
    /** 位置セット */
    public setPosVec (v :THREE.Vector3) :ObjectBase {
        this.x = v.x; this.y = v.y; this.z = v.z;
        return this;
    }
    /** 位置セット */
    public setPos (x :number, y :number, z :number) :ObjectBase {
        this.x = x; this.y = y; this.z = z;
        return this;
    }
    /** 回転セット */
    public setRot (x :number, y :number, z :number) :ObjectBase {
        this.rotationX = x; this.rotationY = y; this.rotationZ = z;
        return this;
    }
    public getPos () :THREE.Vector3 { return this._target.position.clone(); }
    public getRot () :THREE.Euler   { return this._target.rotation; }
    /** 2D (screen) 座標取得 */
    public get2D (camera :THREE.Camera, offset :THREE.Vector3 = null, stw :number = 1280, sth :number = 720) :THREE.Vector2
    {
        var cw = stw * 0.5;
        var ch = sth * 0.5;

        var vec = this._target.position.clone();
        if (offset) vec.add(offset);
        vec.project(camera);
        vec.x = Math.round((  vec.x + 1) * cw);
        vec.y = Math.round((- vec.y + 1) * ch);            
        
        return new THREE.Vector2(vec.x, vec.y);
    }

    public get parent    () :THREE.Object3D { return this._parent; }
    public get target    () :THREE.Object3D { return this._target; }

    public get x         () :number { return this._target.position.x; }
    public get y         () :number { return this._target.position.y; }
    public get z         () :number { return this._target.position.z; }
    public get rotationX () :number { return this._target.rotation.x; }
    public get rotationY () :number { return this._target.rotation.y; }
    public get rotationZ () :number { return this._target.rotation.z; }

    public get scale     () :number { return this._target.scale.x; }
    public get scaleX    () :number { return this._target.scale.x; }
    public get scaleY    () :number { return this._target.scale.y; }
    public get scaleZ    () :number { return this._target.scale.z; }
    public get visible   () :boolean{ return this._target.visible; }
    
    public set x         (val :number) { this._target.position.x = val; }
    public set y         (val :number) { this._target.position.y = val; }
    public set z         (val :number) { this._target.position.z = val; }
    public set rotationX (val :number) { this._target.rotation.x = val; }
    public set rotationY (val :number) { this._target.rotation.y = val; }
    public set rotationZ (val :number) { this._target.rotation.z = val; }

    public set scale     (val :number) { val = this._checkScale(val); this._target.scale.set(val, val, val); }
    public set scaleX    (val :number) { val = this._checkScale(val); this._target.scale.x = val; }
    public set scaleY    (val :number) { val = this._checkScale(val); this._target.scale.y = val; }
    public set scaleZ    (val :number) { val = this._checkScale(val); this._target.scale.z = val; }
    public set visible   (val :boolean){ this._target.visible = val; }

    /// scale: 0 にならないように調整
    private _checkScale (val :number) :number
    {
        if (val == 0) val = 0.001;
        return val;
    }

    public get renderOrder () :number { return this._target.renderOrder; }
    public set renderOrder (val :number) { this._target.renderOrder = val; }
}

// _____________________________________________________________________ PrimBase
//
export class PrimBase extends ObjectBase
{
    protected _mesh     :THREE.Mesh;
    protected _geometry :THREE.BufferGeometry;
    protected _material :THREE.Material|THREE.Material[];
    protected _map      :THREE.Texture;
    protected _color    :THREE.Color;

    protected _matTotal :number;

    constructor (mesh :THREE.Mesh|THREE.Sprite, parent :THREE.Object3D = null)
    {
        super(mesh, parent);
        
        if (mesh.geometry)
        {
            try { this._mesh = mesh as THREE.Mesh; } catch (e) {}
        }
        if (mesh.geometry) this._geometry = mesh.geometry as THREE.BufferGeometry;
        if (mesh.material)
        {
            this._material = mesh.material;
            this._matTotal = this._material["length"];

            if (! this._matTotal)
            {
                this._map   = this._material["map"];
                this._color = this._material["color"];
                this._matTotal = 1;
            }
        }
    }
    /** 中心位置の移動 */
    public centerTrans (x :number = 0, y :number = 0, z :number = 0)
    {
        if (this._geometry) this._geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(x, y, z));
    }

    /** テクスチャの更新 */
    public updateTexture (tex :THREE.Texture, addictiveBlending :boolean = false)
    {
        if (1 < this._matTotal)
        {
            for (var i = 0; i < this._matTotal; i ++)
                this._updateTexture(this._material[i], tex, addictiveBlending);
        }
        else
        {
            this._updateTexture(this._material as THREE.Material, tex, addictiveBlending);
        }
    }
    private _updateTexture (mat :THREE.Material, tex :THREE.Texture, addictiveBlending :boolean = false)
    {
        mat["map"] = tex;
        mat.needsUpdate = true;
        this._map = mat["map"];

        if (addictiveBlending) mat.blending = THREE.AdditiveBlending;
        else                   mat.blending = THREE.NormalBlending;
    }

    public get mesh     () :THREE.Mesh { return this._mesh; }
    public get geometry () :THREE.BufferGeometry { return this._geometry; }
    public get material () :THREE.Material|THREE.Material[] { return this._material; }

    public get texOffsetX () :number { return this._map.offset.x; }
    public get texOffsetY () :number { return this._map.offset.y; }
    public set texOffsetX (val :number) { this._map.offset.x = val; }
    public set texOffsetY (val :number) { this._map.offset.y = val; }

    public get texRepeatX () :number { return this._map.repeat.x; }
    public get texRepeatY () :number { return this._map.repeat.y; }
    public set texRepeatX (val :number) { this._map.repeat.x = val; }
    public set texRepeatY (val :number) { this._map.repeat.y = val; }

    public get color () :number { return this._color.getHex(); }
    public set color (val :number) { this._color.setHex(val); }
}

// _____________________________________________________________________ PrimSprite
//
export class PrimSprite extends PrimBase
{
    protected _sprite   :THREE.Sprite;

    constructor (parent :THREE.Object3D, mat :THREE.SpriteMaterial)
    {
        var sp = new THREE.Sprite(mat);
        super(sp, parent);
        this._sprite = sp;
    }
    public get sprite   () :THREE.Sprite { return this._sprite; }
    public get material () :THREE.SpriteMaterial { return this._sprite.material; }

    public get rotation () :number { return this._sprite.material.rotation; }
    public set rotation (val :number) { this._sprite.material.rotation = val; }
}


// _____________________________________________________________________ PrimPlane
//
export class PrimPlane extends PrimBase
{
    protected _mesh :THREE.Mesh;
    constructor (parent :THREE.Object3D, mat :THREE.Material,
                    w :number = 1, h :number = 1, segw :number = 1, segh :number = 1, useAssets :boolean = true)
    {
        var key = ["Plane", w, h, segw, segh].join("_");
        var geo  = (Assets.get(key) && useAssets) ? Assets.get(key) : Assets.add(key, new THREE.PlaneBufferGeometry(w, h, segw, segh));
        var mesh = new THREE.Mesh(geo, mat);
        super(mesh, parent);
        this._mesh = mesh;
    }
}

// _____________________________________________________________________ PrimCube
//
export class PrimCube extends PrimBase
{
    protected _mesh :THREE.Mesh;
    constructor (parent :THREE.Object3D, mat :THREE.Material | THREE.Material[],
                    w :number, h :number, d :number, segw :number = 1, segh :number = 1, segd :number = 1, useAssets :boolean = true)
    {
        var key = ["Cube", w, h, d, segw, segh, segd].join("_");
        var geo = (Assets.get(key) && useAssets) ? Assets.get(key) : Assets.add(key, new THREE.BoxBufferGeometry(w, h, d, segw, segh, segd));
        var mesh = new THREE.Mesh(geo, mat);
        super(mesh, parent);
        this._mesh = mesh;
    }
}

// _____________________________________________________________________ PrimSphere
//
export class PrimSphere extends PrimBase
{
    protected _mesh :THREE.Mesh;
    constructor (parent :THREE.Object3D, mat :THREE.Material,
                    radius :number, segw :number = 8, segh :number = 6, useAssets :boolean = true)
    {
        var key = ["Sphere", radius, segw, segh].join("_");
        var geo = (Assets.get(key) && useAssets) ? Assets.get(key) : Assets.add(key, new THREE.SphereBufferGeometry(radius, segw, segh));
        var mesh = new THREE.Mesh(geo, mat);
        super(mesh, parent);
        this._mesh = mesh;
    }
}

// _____________________________________________________________________ PrimCylinder
//
export class PrimCylinder extends PrimBase
{
    protected _mesh :THREE.Mesh;
    constructor (parent :THREE.Object3D, mat :THREE.Material,
        radiusTop :number, radiusBottom :number, h :number, segw = 8, segh = 1, openEnded :boolean = false, useAssets :boolean = true)
    {
        var key = ["Cylinder", radiusTop, radiusBottom, h, segw, segh].join("_");
        var geo = (Assets.get(key) && useAssets) ? Assets.get(key) : Assets.add(key, new THREE.CylinderBufferGeometry(radiusTop, radiusBottom, h, segw, segh, openEnded));
        var mesh = new THREE.Mesh(geo, mat);
        super(mesh, parent);
        this._mesh = mesh;
    }
}

// _____________________________________________________________________ PrimRing
//
export class PrimRing extends PrimBase
{
    protected _mesh :THREE.Mesh;
    constructor (parent :THREE.Object3D, mat :THREE.Material,
        radiusIn :number, radiusOut :number, segt :number = 8, segp :number = 1, useAssets :boolean = true)
    {
        var key = ["Ring", radiusIn, radiusOut, segt, segp].join("_");
        var geo = (Assets.get(key) && useAssets) ? Assets.get(key) : Assets.add(key, new THREE.RingBufferGeometry(radiusIn, radiusOut, segt, segp));
        var mesh = new THREE.Mesh(geo, mat);
        super(mesh, parent);
        this._mesh = mesh;
    }
}

// _____________________________________________________________________ PrimTorus
//
export class PrimTorus extends PrimBase
{
    protected _mesh :THREE.Mesh;
    constructor (parent :THREE.Object3D, mat :THREE.Material,
        radius :number, tube :number = 2, segt :number = 8, segr :number = 8, useAssets :boolean = true)
    {
        var key = ["Torus", radius, tube, segr, segt].join("_");
        var geo = (Assets.get(key) && useAssets) ? Assets.get(key) : Assets.add(key, new THREE.TorusBufferGeometry(radius, tube, segr, segt));
        var mesh = new THREE.Mesh(geo, mat);
        super(mesh, parent);
        this._mesh = mesh;
    }
}

// _____________________________________________________________________ PrimTetrahedron
//
export class PrimTetrahedron extends PrimBase
{
    protected _mesh :THREE.Mesh;
    constructor (parent :THREE.Object3D, mat :THREE.Material,
        radius :number, detail :number = 0, useAssets :boolean = true)
    {
        var key = ["Tetrahedron", radius, detail].join("_");
        var geo = (Assets.get(key) && useAssets) ? Assets.get(key) : Assets.add(key, new THREE.TetrahedronBufferGeometry(radius, detail));
        var mesh = new THREE.Mesh(geo, mat);
        super(mesh, parent);
        this._mesh = mesh;
    }
}