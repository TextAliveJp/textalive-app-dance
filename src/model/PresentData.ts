import { Ref } from "../core/Ref";
import { SegData } from "./SegData";
import { Beat } from "textalive-api/dist/player/loaders/songle/SongleParser";

/**
 * 現在時刻のデータ
 */
export class PresentData
{
    public now     :number;
    public segId   :number;
    public segData :SegData;
    public beat    :Beat;
    public beatProgress :number;

    constructor (now :number = -1)
    {
        this.update(now);
    }

    public update (now :number)
    {
        if (now < 0) return;

        var p = Ref.player;
        
        this.now     = now;
        this.segId   = p.getSegId(now);
        this.segData = p.segList[this.segId];
        this.beat    = p.findBeat(now);

        this.beatProgress = (now - this.beat.startTime) / this.beat.duration; // + beat.index;
    }
}
