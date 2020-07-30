import { PlayerManager } from "../controller/PlayerManager";
import { ThreeManager } from "../controller/ThreeManager";
import { Parameter } from "../model/Parameter";

/**
 * グローバル参照
 */
export class Ref
{
    public static stw :number = 1280;
    public static sth :number =  720;

    public static isDebug     :boolean = false;
    public static enabledWarn :boolean = false;

    public static player :PlayerManager;
    public static three  :ThreeManager;

    public static parameter :Parameter = new Parameter();
}