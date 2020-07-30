// import THREE from "three";
import * as THREE from "three";
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

import { Ref } from "../core/Ref";
import { MathExt } from "../util/MathExt";
import { SceneManager } from "./SceneManager";
import { PresentData } from "../model/PresentData";

export class ThreeManager
{
    private _view :HTMLElement;

    private _renderer :THREE.WebGLRenderer;
    private _scene    :THREE.Scene;
    private _camera   :THREE.PerspectiveCamera;

    private _sceneMng  :SceneManager;


    private _pass    :RenderPass;
    private _passRGB :ShaderPass;
    private _comp    :EffectComposer;


    constructor ()
    {
        var w = document.documentElement.clientWidth;
        var h = document.documentElement.clientHeight;

        var camera = new THREE.PerspectiveCamera(45, w / h, 0.01, 100);
        
        // Sceme / Renderer / Camera
        var col   = Ref.parameter.bgColor;
        var scene = new THREE.Scene();
        scene.background = new THREE.Color(col);
        scene.fog = new THREE.Fog(col, 50, 80);


        var container = this._view = document.getElementById("view");
        var renderer = new THREE.WebGLRenderer( { antialias: true, alpha: false } );
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(w, h);
        renderer.shadowMap.enabled = true;
        container.appendChild(renderer.domElement);

        this._renderer = renderer;
        this._scene    = scene;
        this._camera   = camera;


        // Light
        var ambientLight = new THREE.AmbientLight(0x444444);
        scene.add( ambientLight );
        
        var directionalLight = new THREE.DirectionalLight(0xcccccc, 1.0);
        directionalLight.position.set(1, 0, 1);
        scene.add(directionalLight);

        // Light Helper
        // scene.add(new THREE.DirectionalLightHelper(directionalLight, 3, 0xff0000));

        
        this._passRGB = new ShaderPass(this.RGBShiftShader);

        this._pass = new RenderPass(scene, camera);
        this._comp = new EffectComposer(renderer);
        this._comp.passes = [this._pass];
    }

    public getSize (pos :THREE.Vector3)
    {
        var camera = this._camera;
        var asp  = Ref.stw / Ref.sth;
        var dx   = camera.position.x - pos.x;
        var dy   = camera.position.y - pos.y;
        var dz   = camera.position.z - pos.z;
        var dist = Math.sqrt( dx * dx + dy * dy + dz * dz );
        var size = dist * Math.tan(MathExt.toRad(camera.fov / 2)) * 2.0;
        return {w: asp * size, h: size};
    }

    public ready ()
    {
        if (! this._sceneMng)
        {
            this._sceneMng = new SceneManager(this._scene, this._camera);
            this._sceneMng.load(Ref.parameter.modelId);
            Ref.player.addParameterUpdateListener((name, value) => this._parameterUpdate(name, value));
        }
        this._sceneMng.ready();
    }

    // RGB Effect (for transition)
    private _updateEffect (data :PresentData)
    {
        var duration = 200;
        var shift = 0;
        var dt = data.now - data.segData.startTime
        if (dt < 0 || duration < dt) dt = data.segData.endTime - data.now;

        if (0 <= dt && dt <= duration)
        {
            var s = Math.floor((1 - dt / duration) * 5);
            shift = s / 50;
            MathExt.seed = s * (data.segData.startTime + Ref.parameter.seed + 12345) + 123;
        }

        if (shift <= 0)
        {
            this._pass.renderToScreen = true;
            this._comp.passes = [this._pass];
        }
        else
        {
            this._pass.renderToScreen    = false;
            this._passRGB.renderToScreen = true;
            this._comp.passes = [this._pass, this._passRGB];
    
            var p = this._passRGB;
            p.uniforms["shiftR"].value.set((MathExt.random() < 0.5)?shift:-shift, (MathExt.random() < 0.5)?shift:-shift);
            p.uniforms["shiftG"].value.set((MathExt.random() < 0.5)?shift:-shift, (MathExt.random() < 0.5)?shift:-shift);
            p.uniforms["shiftB"].value.set((MathExt.random() < 0.5)?shift:-shift, (MathExt.random() < 0.5)?shift:-shift);
        }
    }

    public update (data :PresentData)
    {
        // fade in / fade out
        if (data.segId == 0 || data.segId == Ref.player.segLen - 1)
        {
            var a = 1, duration = Math.min(2000, data.segData.duration);
            switch (data.segId)
            {
            case 0:  a = Math.min((data.now - data.segData.startTime) / duration, 1); break;
            default: a = Math.min((data.segData.endTime - data.now)   / duration, 1); break;
            }
            this._view.style.opacity = a.toString();
        }
        else
        {
            this._view.style.opacity = "1";
        }


        // Scene
        this._sceneMng.update(data);

        // Effect
        this._updateEffect(data);

        this._comp.render();
    }
    public resize ()
    {
        var w = Ref.stw;
        var h = Ref.sth;
        
        if (w < h) this._camera.fov = 56;
        else       this._camera.fov = 45;

        this._camera.aspect = w / h;
        this._camera.updateProjectionMatrix();
        
        this._renderer.setSize(w, h);
        this._comp.setSize(w, h);
        this._comp.render();
    }

    private _parameterUpdate (name, value)
    {
        if (name == "BgColor")
        {
            var col = Ref.parameter.bgColor;
            this._scene.fog.color.set(col);
            this._scene.background["set"](col);

            var hex = col.toString(16);
            for (var i = 0, l = 6 - hex.length; i < l; i ++) hex = "0" + hex;
            document.body.style.backgroundColor = "#" + hex;
        }
    }

    /** RGBShiftShader */
    private RGBShiftShader = 
    {
        uniforms: {
            "tDiffuse": { type: 't', value: null },
            "shiftR": { type: "v2", value: new THREE.Vector2(0.0, 0.0) },
            "shiftG": { type: "v2", value: new THREE.Vector2(0.0, 0.0) },
            "shiftB": { type: "v2", value: new THREE.Vector2(0.0, 0.0) }
        },

        vertexShader: [
            "varying vec2 vUv;",
            "void main() {",
                "vUv = uv;",
                "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

            "}"

        ].join( "\n" ),

        fragmentShader: [
            "uniform sampler2D tDiffuse;",
            "varying vec2 vUv;",

            "uniform vec2 shiftR;",
            "uniform vec2 shiftG;",
            "uniform vec2 shiftB;",

            "void main() {",
                // "vec4 tex = texture2D( tDiffuse, vUv );",
                "float r = texture2D(tDiffuse, vUv + shiftR).x;",
                "float g = texture2D(tDiffuse, vUv + shiftG).y;",
                "float b = texture2D(tDiffuse, vUv + shiftB).z;",
                "vec4 tex = vec4(r,g,b,gl_FragColor.w);",

                "gl_FragColor = tex;",
                
            "}",
        ].join( "\n" )
    };
}
