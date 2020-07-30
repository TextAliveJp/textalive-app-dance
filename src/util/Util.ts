import { MathExt } from "./MathExt";

export class Util
{
    /** 配列のシャッフル */
    public static arrayShuffle (ar :any[], useXorshift :boolean = false)
    {
        var l = ar.length;
        for (var i = 0; i < l; i ++)
        {
            var r = (useXorshift) ? MathExt.randInt(0, l - 1) : Math.floor(Math.random() * l);
            var t = ar[i];
            ar[i] = ar[r];
            ar[r] = t;
        }
    }
    
    /** モバイルかどうか */
    public static checkMobile ()
    {
        var ua = navigator.userAgent;
        return (0 <= ua.indexOf('iPhone') || 0 <= ua.indexOf('iPod') || (0 <= ua.indexOf('iPad')) || (0 < ua.indexOf("Mac OS") && document.ontouchstart !== undefined) || 
            0 <= ua.indexOf('Android') || 0 <= ua.indexOf('BlackBerry') || 0 <= ua.indexOf('Windows Phone'));
    }
}