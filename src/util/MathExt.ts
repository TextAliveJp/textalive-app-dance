
export class MathExt
{
    /** Xorshift 乱数生成用のシード */
    public static seed :number = 0;
    
    /** Xorshift 乱数生成 [0-1] */
    public static random (seed = null)
    {
        var x :number = this.seed; if (seed != null) x = seed;
        x = x ^ (x << 13); x = x ^ (x >> 17); x = x ^ (x << 15); this.seed = x;
        return x / 4294967296 + 0.5;
    }
    /** Xorshift min - max の範囲で乱数生成 (整数) */
    public static randInt (min, max, seed = null)
    {
        return Math.floor(this.rand(min, max + 1, seed));
    }
    /** Xorshift min - max の範囲で乱数生成 */
    public static rand (min, max, seed = null)
    {
        return this.random(seed) * (max - min) + min;
    }
    
    /** 度からラジアンに変換 */
    public static toRad (deg)
    {
        return deg * Math.PI / 180;
    }
    /** ラジアンから度に変換 */
    public static toDeg (rad)
    {
        return rad * 180 / Math.PI;
    }
}