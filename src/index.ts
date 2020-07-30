
import { ThreeManager } from "./controller/ThreeManager";
import { PlayerManager } from "./controller/PlayerManager";
import { Ref } from "./core/Ref";

class Main
{
    private _player :PlayerManager;
    private _three  :ThreeManager;

    constructor () {}
    
    public initialize ()
    {
        if (! Ref.enabledWarn) console.warn = function(){};

        this._three = Ref.three = new ThreeManager();
        
        this._player = Ref.player = new PlayerManager();
        this._player.init();

        this._resize();
        window.addEventListener("resize", () => this._resize());
    }

    private _resize ()
    {
        Ref.stw = document.documentElement.clientWidth;
        Ref.sth = document.documentElement.clientHeight;

        this._three.resize();
    }
}

new Main().initialize();