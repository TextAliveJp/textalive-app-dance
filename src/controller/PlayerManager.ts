import dat from "dat.gui";
import { Player } from "textalive-api";
import { Video, Char, Phrase, Color } from "textalive-graphics";

import { SegData } from "../model/SegData";
import { Ref } from "../core/Ref";
import { PresentData } from "../model/PresentData";
import { CharData } from "../model/CharData";
import { LyricData } from "../model/LyricData";


export class PlayerManager
{
    private _player  :Player;
    private _video   :Video;
    private _segList :SegData[];
    private _segLen  :number;

    private _lyric :LyricData;
    private _presentData :PresentData;

    private _listeners :any[] = [];


    private _position   :number = 0;
    private _updateTime :number = -1;


    private _bpm :number = 120;
    // 0.0 - 0.5
    private _beatOffset :number = 0.5;

    public get bpm () { return this._bpm; }
    public get beatOffset () { return this._beatOffset; }


    public get video   () { return this._video; }
    public get lyric   () { return this._lyric; }
    public get segList () { return this._segList; }
    public get segLen  () { return this._segLen; }


    constructor () {}

    public init ()
    {
        this._presentData = new PresentData();

        if (Ref.isDebug)
        {
            this._initDebug();
        }
        else
        {
            var player = this._player = new Player({
                app: {
                    appAuthor: "daniwell",
                    appName: "Dance",
                    parameters: [
                        {
                            title: "フォントのスタイル",
                            name: "FontStyle",
                            className: "Select",
                            params: [
                                [0, "サンセリフ (ゴシック体)"],
                                [1, "セリフ (明朝体)"],
                            ],
                            initialValue: 0,
                        },
                        {
                            title: "モデル",
                            name: "Model",
                            className: "Select",
                            params: [
                                [0, "かんな"],
                                [1, "初音ミク"],
                                [2, "鏡音リン"],
                                [3, "鏡音レン"],
                                [4, "巡音ルカ"],
                            ],
                            initialValue: 0,
                        },
                        
                        {
                            title: "ねこみみ",
                            name: "Nekomimi",
                            className: "Check",
                            initialValue: true,
                        },
                        {
                            title: "テキスト色",
                            name: "FontColor",
                            className: "Color",
                            initialValue: "#333344"
                        },
                        {
                            title: "色１",
                            name: "Color1",
                            className: "Color",
                            initialValue: "#ff66cc"
                        },
                        {
                            title: "色２",
                            name: "Color2",
                            className: "Color",
                            initialValue: "#ffaabb"
                        },
                        {
                            title: "色３",
                            name: "Color3",
                            className: "Color",
                            initialValue: "#ffbb44"
                        },
                        {
                            title: "色４",
                            name: "Color4",
                            className: "Color",
                            initialValue: "#ff9966"
                        },
                        {
                            title: "背景色",
                            name: "BgColor",
                            className: "Color",
                            initialValue: "#eeeef9"
                        },
                        {
                            title: "乱数のシード",
                            name: "Seed",
                            className: "Slider",
                            params: [1, 1000],
                            initialValue: 1,
                        },
                    ]
                },
                mediaElement: document.querySelector("#media"),
                fontFamilies: []
            });
            
            player.addListener({
                onAppReady  : (app) => this._onAppReady(app),
                onVideoReady: (v) => this._onVideoReady(v),
                onPlay : () => this._onPlay(),
                onPause: () => this._onPause(),
                onStop : () => this._onStop(),
                onMediaSeek : (pos) => this._onMediaSeek(pos),
                onTimeUpdate: (pos) => this._onTimeUpdate(pos),
                onThrottledTimeUpdate: (pos) => this._onThrottledTimeUpdate(pos),
                onAppParameterUpdate: (name, value) => this._onAppParameterUpdate(name, value),
                onAppMediaChange: (url) => this._onAppMediaChange(url),
            });
        }

        this._update();

        return this;
    }

    public getSegId (now :number)
    {
        for (var i = 0, l = this._segLen; i < l; i ++)
        {
            if (now < this._segList[i].endTime) return i;
        }
        return this._segLen - 1;
    }
    public findBeat (now :number)
    {
        if (Ref.isDebug)
        {
            var b = this.__getBeat(now);
            if (0 < b.index) b.previous = this.__getBeat(now, -1);
            b.next = this.__getBeat(now,  1);
            return b;
        }

        var beat = this._player.findBeat(now);
        if (! beat)
        {
            var beats = this._player.data.songMap.beats;
            for (var i = 0, l = beats.length; i < l; i ++)
            {
                if (now <= beats[i].endTime) return beats[i];
            }
            return beats[l-1];
        }
        return beat;
    }
    
    private _ready ()
    {
        Ref.three.ready();
        
        this._animate(0);
        setTimeout(() => this._animate(0), 100);
    }
    private _animate (now :number)
    {
        if (isNaN(now)) return;

        this._presentData.update(now);
        Ref.three.update(this._presentData);
    }

    
    // ----------------------------------------------------------------------------- for Debug
    private __bpm    :number = 120;
    private __segtim :number = 3000;
    private __seglen :number = 10;
    private __beat   :number = 4;
    private __stime  :number = 0;

    private _initDebug ()
    {
        this._bpm    = this.__bpm;
        this._segLen = this.__seglen;

        this._segList = [];
        for (var i = 0; i < this.__seglen; i ++)
        {
            var seg = new SegData(i * this.__segtim, i % 4);
            seg.endTime = (i + 1) * this.__segtim;
            this._segList.push(seg);
        }
        
        var pid = 0;
        var plen =  5;
        var clen = 10;
        var time = 1000, duration = 300, pduration = 1000;
        for (var i = 0; i < plen; i ++)
        {
            for (var j = 0; j < clen; j ++)
            {
                var c :any = {startTime: time, endTime: time + duration, duration: duration, text: String.fromCharCode(12354 + Math.floor(Math.random() * 82))};
                var cd = new CharData(c, pid);
                this._lyric.add(cd);

                time += duration;
            }
            time += pduration;
            pid ++;
        }

        this._ready();

        this.__stime = Date.now();
        this.__update();
    }
    private __update ()
    {
        var dt = Date.now() - this.__stime;
        this._animate(dt);
        
        window.requestAnimationFrame(() => this.__update());
    }
    private __getBeat (now, offset :number = 0)
    {
        var interval = 60000 / this.__bpm;
        var n = now / interval + offset;

        var b :any = {};
        b.index     = Math.floor(n);
        b.startTime = interval * b.index;
        b.endTime   = b.startTime + interval;
        b.duration  = interval;
        b.length    = this.__beat;
        b.position  = b.index % b.length + 1;

        return b;
    }
    // ----------------------------------------------------------------------------- 
    
    

    private _onAppReady(app: any)
    {
        console.log("app:", app);
        
        if (! app.managed)
        {
            this._initDatGui();
            
            // 再生コントロール表示
            document.getElementById("footer").style.display = "block";
            document.getElementById("bt_play")  .addEventListener("click", () => this._player.requestPlay());
            document.getElementById("bt_pause") .addEventListener("click", () => this._player.requestPause());
            document.getElementById("bt_rewind").addEventListener("click", () => this._player.requestMediaSeek(0));
        }
        if (! app.songUrl)
        {
            this._player.createFromSongUrl("https://www.youtube.com/watch?v=KdNHFKTKX2s");
        }
    }
    
    private _onVideoReady (v: Video) 
    {
        console.log("video:", v);


        this._video = v;

        var beats    = this._player.data.songMap.beats;
        var average = 0;
        for (var i = 0; i < beats.length; i ++) average += beats[i].duration
        average /= beats.length;

        this._bpm = Math.round(60000 / average);



        var segments = this._player.data.songMap.segments;
        var segList = [new SegData(0, 0), new SegData(v.duration, 0)];

        for (var i = 0; i < segments.length; i ++)
        {
            for (var j = 0; j < segments[i].segments.length;j ++)
            {
                var seg = segments[i].segments[j];
                var useStart = true;
                var useEnd   = true;

                for (var n = 0; n < segList.length; n ++)
                {
                    var ds = Math.abs(segList[n].startTime - seg.startTime);
                    var de = Math.abs(segList[n].startTime - seg.endTime);
                    
                    if (ds < 2000) { useStart = false; if (segments[i].chorus) segList[n].state = 1; }
                    if (de < 2000) { useEnd   = false; if (segments[i].chorus) segList[n].state = 3; }
                }
                if (useStart) segList.push(new SegData(seg.startTime, (segments[i].chorus)?1:0));
                if (useEnd)   segList.push(new SegData(seg.endTime,   (segments[i].chorus)?3:0));
            }
        }
        segList.sort(function (a, b) { return a.startTime - b.startTime; });
        
        for (var i = 0; i < segList.length - 1; i ++)
        {
            switch (segList[i].state)
            {
            case 1:
            case 2:
                if (segList[i+1].state == 0) segList[i+1].state = 2;
                break;
            }
            segList[i].endTime = segList[i+1].startTime;
        }
        segList.pop();
        this._segList = segList;
        this._segLen  = segList.length;


        this._lyric = new LyricData();

        if (v.firstPhrase)
        {
            var pid = 0;
            var p = v.firstPhrase;
            while (p)
            {
                var c = p.firstChar;
                for (var i = 0, l = p.charCount; i < l; i ++)
                {
                    var cd = new CharData(c, pid);
                    this._lyric.add(cd);
                    c = c.next as Char;
                }
                pid ++;
                p = p.next as Phrase;
            }
        }

        this._ready();
    }

    private _update ()
    {
        if (this._player && this._player.isPlaying && 0 < this._updateTime)
        {
            var t = (Date.now() - this._updateTime)  +this._position;
            this._animate(t);
        }
        window.requestAnimationFrame(() => this._update());
    }

    private _contorlChange (playing)
    {
        if (playing)
        {
            document.getElementById("bt_play") .style.display = "none";
            document.getElementById("bt_pause").style.display = "inline";
        }
        else
        {
            document.getElementById("bt_play") .style.display = "inline";
            document.getElementById("bt_pause").style.display = "none";
        }
    }

    private _onPlay ()
    {
        this._contorlChange(true);
        this._updateTime = Date.now();
        console.log("play");
    }
    private _onPause ()
    {
        this._contorlChange(false);
        console.log("pause");
    }
    private _onStop ()
    {
        this._contorlChange(false);
        console.log("stop");
    }
    private _onMediaSeek (position :number)
    {
        // console.log("seek", position);
    }
    private _onTimeUpdate (position :number)
    {
        this._position   = position;
        this._updateTime = Date.now();

        this._animate(position);
    }
    private _onThrottledTimeUpdate (position :number)
    {

    }
    private _onAppMediaChange (url :string)
    {
        this._player.requestMediaSeek(0);
        this._player.requestPause();
    }
    /** パラメータの更新 */
    private _onAppParameterUpdate (name, value)
    {
        // console.log(name, value);

        switch (name)
        {
        case "FontStyle":
            var fontName;
            switch (parseInt(value))
            {
            case 1:  fontName = "serif";      break;
            default: fontName = "sans-serif"; break;
            }

            Ref.parameter.fontName = value = fontName;
            break;
        case "FontColor":
            Ref.parameter.fontColor = value = this._getColorNumber(value);
            break;
        case "BgColor":
            Ref.parameter.bgColor = value = this._getColorNumber(value);
            break;
        case "Color1":
        case "Color2":
        case "Color3":
        case "Color4":
            var n = parseInt(name.replace("Color", "")) - 1;
            Ref.parameter.colors[n] = value = this._getColorNumber(value);
            break;
        case "Model"   : Ref.parameter.modelId  = value = parseInt(value); break;
        case "Nekomimi": Ref.parameter.nekomimi = value = Boolean(value); break;
        case "Seed"    : Ref.parameter.seed     = value = parseInt(value); break;
        }
        for (var i = 0, l = this._listeners.length; i < l; i ++) this._listeners[i](name, value);
    }

    private _getColorNumber (value)
    {
        // Color Class
        if (value.rgb) return value.value;
        // Object {r:0, g:0, g0}
        if (0 <= value.r) return value.r * 256 * 256 + value.g * 256 + value.b;
        // Number or String
        return (isNaN(value)) ? parseInt(value.replace("#", ""), 16) : value;
    }

    public addParameterUpdateListener (listener)
    {
        this._listeners.push(listener);
    }

    // dat.GUI
    private _initDatGui ()
    {
        var params = {
            FontStyle: 0,
            Model:     Ref.parameter.modelId,
            Nekomimi:  Ref.parameter.nekomimi,
            FontColor: Ref.parameter.fontColor,
            Color1:    Ref.parameter.colors[0],
            Color2:    Ref.parameter.colors[1],
            Color3:    Ref.parameter.colors[2],
            Color4:    Ref.parameter.colors[3],
            BgColor:   Ref.parameter.bgColor,
            Seed:      Ref.parameter.seed,
        }
        var gui :any = new dat.GUI(null);
        gui.add(params, 'FontStyle', { "Sans-serif": 0, "Serif": 1 } )
            .onFinishChange((value :number) => this._onAppParameterUpdate("FontStyle", value));
        // gui.add(params, 'Model', 0, 4).step(1)
        gui.add(params, 'Model', { "かんな": 0, "初音ミク": 1, "鏡音リン": 2, "鏡音レン": 3, "巡音ルカ": 4 } )
            .onFinishChange((value :number) => this._onAppParameterUpdate("Model", value));
        gui.add(params, 'Nekomimi')
            .onFinishChange((value :number) => this._onAppParameterUpdate("Nekomimi", value));
        gui.addColor(params, 'FontColor')
            .onFinishChange((value :number) => this._onAppParameterUpdate("FontColor", value));
        gui.addColor(params, 'Color1')
            .onFinishChange((value :number) => this._onAppParameterUpdate("Color1", value));
        gui.addColor(params, 'Color2')
            .onFinishChange((value :number) => this._onAppParameterUpdate("Color2", value));
        gui.addColor(params, 'Color3')
            .onFinishChange((value :number) => this._onAppParameterUpdate("Color3", value));
        gui.addColor(params, 'Color4')
            .onFinishChange((value :number) => this._onAppParameterUpdate("Color4", value));
        gui.addColor(params, 'BgColor')
            .onFinishChange((value :number) => this._onAppParameterUpdate("BgColor", value));
        gui.add(params, 'Seed', 1, 10000).step(1)
            .onFinishChange((value :number) => this._onAppParameterUpdate("Seed", value));
        gui.close();

        // dat.GUI 最前面
        var style = document.createElement('style');
        style.append(".dg.ac { z-index: 1000 !important; }");
        document.head.appendChild(style);
    }
}
