
export class MorphId
{
    public static LIP_A :number =  9;
    public static LIP_I :number = 10;
    public static LIP_U :number = 11;
    public static LIP_E :number = 12;
    public static LIP_O :number = 13;

    public static MABATAKI :number = 1;
    public static NEKOMIMI :number = 18;


    private static _txToIdObj;
    
    public static getLipId (tx :string, offset :number = 0)
    {
        if (! this._txToIdObj) // 初期化
        {
            var obj = {};
            var str = "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゐゆゑよわいうえをがぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽアイウエオカキクケコサシスセソタチツテトナニヌネノマミムメモヤヰユヱヨワイウエヲガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポ";
            for (var i = 0, l = str.length; i < l; i ++) obj[str.charAt(i)] = (i % 5) + this.LIP_A;
            this._txToIdObj = obj;
        }

        if (this._txToIdObj[tx]) return this._txToIdObj[tx];

        var id = Math.floor(tx.charCodeAt(0) + offset) % 5 + MorphId.LIP_A;
        return id;
    }
}
