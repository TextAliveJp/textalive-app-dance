import * as THREE from "three";
import { MeshLine, MeshLineMaterial } from "three.meshline/src/THREE.MeshLine";

export class Line
{
    private _parent :THREE.Object3D;
    private _line   :THREE.Mesh;
    
    /** 0.5 ~ 1.0 */
    private _dashArray :number;

    private _material :any;


    public get mesh () :THREE.Mesh { return this._line; }

    public get x         () :number { return this._line.position.x; }
    public get y         () :number { return this._line.position.y; }
    public get z         () :number { return this._line.position.z; }
    public get rotationX () :number { return this._line.rotation.x; }
    public get rotationY () :number { return this._line.rotation.y; }
    public get rotationZ () :number { return this._line.rotation.z; }
    
    public set x         (val :number) { this._line.position.x = val; }
    public set y         (val :number) { this._line.position.y = val; }
    public set z         (val :number) { this._line.position.z = val; }
    public set rotationX (val :number) { this._line.rotation.x = val; }
    public set rotationY (val :number) { this._line.rotation.y = val; }
    public set rotationZ (val :number) { this._line.rotation.z = val; }

    
    public get dashOffset ()
    {
        if (! this._line) return -1;
        var uni = this._line.material["uniforms"];
        return uni.dashOffset.value;
    }
    public set dashOffset(val :number)
    {
        if (! this._line) return;
        var uni = this._line.material["uniforms"];
        uni.dashOffset.value = val;
    }
    public set progress (val :number)
    {
        this.dashOffset = - this._dashArray * val;
    }

    constructor (parent :THREE.Object3D)
    {
        this._parent = parent;
    }

    public changeColor (color :number|string)
    {
        if (this._material) this._material.color.set(color);
    }

    public create (params :{points ?:THREE.Vector3[], color ?:number|string, width ?:number, division ?:number, 
        widthCallback ?:Function, dashArray ?:number, dashRatio ?:number})
    {
        this.dispose();

        if (! params.color)    params.color    = 0x0;
        if (! params.width)    params.width    = 2.0;
        if (! params.division) params.division = 64;
        if (! params.widthCallback) params.widthCallback = function(p) { return 4 * p * (1 - p); };

        if (isNaN(params.dashRatio)) params.dashRatio  = 0.9;
        if (isNaN(params.dashArray)) params.dashArray  = (1 - params.dashRatio) * 2 + 1.0;

        this._dashArray = params.dashArray;


        var points :THREE.Vector3[] = params.points;

        var pts = new THREE.CatmullRomCurve3(points).getPoints(params.division);
        // pts = new THREE.SplineCurve(points as any).getPoints(params.division);
        
        var linePoints = new THREE.Geometry().setFromPoints(pts);
        
        var line = new MeshLine();
        line.setGeometry(linePoints, params.widthCallback);
        
        var material = new MeshLineMaterial({
            transparent: true,
            lineWidth: params.width,
            color: new THREE.Color(params.color),
            opacity: 1,

            dashOffset: 0.0,
            dashArray:  params.dashArray,
            dashRatio:  params.dashRatio,

            sizeAttenuation: true,
            depthWrite: false,
            side: THREE.DoubleSide,
            fog: true,
        });
        this._material = material;

        var lineMesh :THREE.Mesh = this._line = new THREE.Mesh(line.geometry, material as any);
        this._parent.add(lineMesh);
        return lineMesh;
    }
    public show ()
    {
        this._line.visible = true;
    }
    public hide ()
    {
        this._line.visible = false;
    }
    public dispose ()
    {
        if (this._line)
        {
            this._line.material = null;
            this._line.geometry.dispose();
            this._line.geometry = null;
            this._parent.remove(this._line);
            this._line = null;
        }
    }
}