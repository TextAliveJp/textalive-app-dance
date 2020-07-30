import { CharData } from "./CharData";

/**
 * 歌詞データ
 */
export class LyricData
{
    private _dataList :CharData[];
    private _total :number;

    public get list  () :CharData[] { return this._dataList; }
    public get total () :number     { return this._total; }
    

    constructor ()
    {
        this._dataList = [];
        this._total = 0;
    }

    public add (cd :CharData)
    {
        cd.id = this._total;
        this._dataList.push(cd);

        if (0 < this._total)
        {
            var pcd = this._dataList[this._total-1];
            cd.prev = pcd;
            pcd.next = cd;
        }
        this._total ++;
    }

    public getList (now :number)
    {
        var list = [];
        for (var i = 0; i < this._total; i ++)
        {
            var d = this._dataList[i];
            
            if (d.startTime - d.head <= now && now <= d.endTime + d.tail)
            {
                list.push(d);
            }
        }
        return list;
    }
}