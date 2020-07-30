/**
 * セグメントデータ
 */
export class SegData
{
    public startTime :number;
    public endTime :number;
    public state :number;

    public get duration () { return this.endTime - this.startTime; }

    constructor (startTime :number, state :number = 0)
    {
        this.startTime = startTime;
        this.state     = state;
    }
}