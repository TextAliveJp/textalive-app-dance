import { IChar } from "textalive-app-api";

/**
 * 文字データ
 */
export class CharData
{
    public id :number;
    public phraseId :number;

    public startTime :number;
    public endTime   :number;
    public duration  :number;
    public text      :string;

    public head :number = 800;
    public tail :number = 800;

    public options :any = {};

    public next :CharData = null;
    public prev :CharData = null;

    constructor (c :IChar, phraseId :number = 0)
    {
        this.phraseId = phraseId;
        
        this.startTime = c.startTime;
        this.endTime   = c.endTime;
        this.text      = c.text;

        if (c.next && c.next.startTime - this.endTime < 500) this.endTime = c.next.startTime;
        else this.endTime += 500;
        
        this.duration = this.endTime - this.startTime;
    }

    public progressHead (now :number, durationOffset :number = 0)
    {
        return Math.min((now - (this.startTime - this.head)) / (this.head + durationOffset), 1);
    }
    public progressTail (now :number, durationOffset :number = 0)
    {
        return 1 - Math.min(((this.endTime + this.tail) - now) / (this.tail + durationOffset), 1);
    }
    public progress (now :number)
    {
        var total = this.duration + this.head + this.tail;
        var start = this.startTime - this.head;
        return (now - start) / total;
    }
}