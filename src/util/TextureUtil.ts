import * as THREE from "three";
import { Assets } from "./Assets";

export class TextureUtil
{
    private static _can :HTMLCanvasElement;
    private static _ctx :CanvasRenderingContext2D;


    private static _initCanvas (size :number, sizeH :number = -1)
    {
        if (! this._can)
        {
            this._can = document.createElement("canvas");
            this._ctx = this._can.getContext("2d");
        }

        if (0 < sizeH)
        {
            this._can.width  = size;
            this._can.height = sizeH;
            this._ctx.clearRect(0, 0, size, sizeH);
        }
        else
        {
            this._can.width = this._can.height = size;
            this._ctx.clearRect(0, 0, size, size);
        }
    }
    
    public static getTone (size :number = 5)
    {
        var key = "tone_" + size;
        if (Assets.get(key)) return Assets.get(key);

        this._initCanvas(size, 1);
        var can = this._can;
        var ctx = this._ctx;

        for (var i = 0; i < size; i ++)
        {
            var c :string = Math.ceil((i / (size - 1)) * 105 + 150).toString(16);
            if (c.length < 2) c = "0" + c;

            ctx.fillStyle = "#" + c + c + c;
            ctx.fillRect(i, 0, 1, 1);
        }
        ctx.fill();

        var tex = new THREE.Texture(ctx.getImageData(0, 0, size, 1) as any);
		tex.minFilter = THREE.NearestFilter;
        tex.magFilter = THREE.NearestFilter;
        tex.needsUpdate = true;

        Assets.add(key, tex);
        return tex;
    }

    public static getText (tx = "あ", font = "sans-serif")
    {
        var key = "tex_ly_" + tx + "_" + font;
        if (Assets.get(key)) return Assets.get(key);


        var sc = 2;
        var size :number = 256 * sc;
        
        this._initCanvas(size);

        var fontSize = 240 * sc;

        var can = this._can;
        var ctx = this._ctx;
        
        ctx.globalCompositeOperation = "source-over";
        ctx.clearRect(0, 0, size, size);

        ctx.textAlign = "center";
        
        ctx.fillStyle = "#ffffff"; // 色は Material 側で変える
        ctx.font = "bold " + fontSize + "px " + font;
        ctx.fillText(tx, size / 2, size / 2 + fontSize * 0.37);

        /*
        document.body.appendChild(can);
        can.style.position = "fixed";
        can.style.top = "0"; can.style.left = "0";
        can.style.zIndex = "1000";
        //*/

        var tex = new THREE.Texture(ctx.getImageData(0, 0, size, size) as any);
        tex.needsUpdate = true;
        
        Assets.add(key, tex);
        return tex;
    }
}