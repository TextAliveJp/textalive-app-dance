import * as THREE from "three";
import { Assets } from "./Assets";
import { TextureUtil } from "./TextureUtil";

export class MaterialUtil
{
    public static getToon (color :number, gradientSize :number = 5)
    {
        var key = "mat_" + color + "_" + gradientSize;
        if (Assets.get(key)) return Assets.get(key);

        var mat = new THREE.MeshToonMaterial({color: color, gradientMap: TextureUtil.getTone(gradientSize), shininess: 0});
        Assets.add(key, mat);
        return mat;
    }
}