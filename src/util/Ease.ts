
export class Ease
{
    private static _c1 = 1.70158;
    private static _c2 = Ease._c1 * 1.525;
    private static _c3 = Ease._c1 + 1;
    private static _c4 = (2 * Math.PI) / 3;
    private static _c5 = (2 * Math.PI) / 4.5;

    public static easeInQuad (x :number)
	{
		return x * x;
	}
	public static easeOutQuad (x :number)
	{
		return 1 - (1 - x) * (1 - x);
	}
	public static easeInOutQuad (x :number)
	{
		return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
	}
	public static easeInCubic (x :number)
	{
		return x * x * x;
	}
	public static easeOutCubic (x :number)
	{
		return 1 - Math.pow(1 - x, 3);
	}
	public static easeInOutCubic (x :number)
	{
		return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
	}
	public static easeInQuart (x :number)
	{
		return x * x * x * x;
	}
	public static easeOutQuart (x :number)
	{
		return 1 - Math.pow(1 - x, 4);
	}
	public static easeInOutQuart (x :number)
	{
		return x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2;
	}
	public static easeInQuint (x :number)
	{
		return x * x * x * x * x;
	}
	public static easeOutQuint (x :number)
	{
		return 1 - Math.pow(1 - x, 5);
	}
	public static easeInOutQuint (x :number)
	{
		return x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2;
	}
	public static easeInSine (x :number)
	{
		return 1 - Math.cos((x * Math.PI) / 2);
	}
	public static easeOutSine (x :number)
	{
		return Math.sin((x * Math.PI) / 2);
	}
	public static easeInOutSine (x :number)
	{
		return -(Math.cos(Math.PI * x) - 1) / 2;
	}
	public static easeInExpo (x :number)
	{
		return x === 0 ? 0 : Math.pow(2, 10 * x - 10);
	}
	public static easeOutExpo (x :number)
	{
		return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
	}
	public static easeInOutExpo (x :number)
	{
		return x === 0 ? 0 : x === 1 ? 1 : x < 0.5 ? Math.pow(2, 20 * x - 10) / 2 : (2 - Math.pow(2, -20 * x + 10)) / 2;
	}
	public static easeInCirc (x :number)
	{
		return 1 - Math.sqrt(1 - Math.pow(x, 2));
	}
	public static easeOutCirc (x :number)
	{
		return Math.sqrt(1 - Math.pow(x - 1, 2));
	}
	public static easeInOutCirc (x :number)
	{
		return x < 0.5 ? (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2 : (Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2;
	}
	public static easeInBack (x :number)
	{
		return this._c3 * x * x * x - this._c1 * x * x;
	}
	public static easeOutBack (x :number)
	{
		return 1 + this._c3 * Math.pow(x - 1, 3) + this._c1 * Math.pow(x - 1, 2);
	}
	public static easeInOutBack (x :number)
	{
		return x < 0.5 ? (Math.pow(2 * x, 2) * ((this._c2 + 1) * 2 * x - this._c2)) / 2 : (Math.pow(2 * x - 2, 2) * ((this._c2 + 1) * (x * 2 - 2) + this._c2) + 2) / 2;
	}
	public static easeInElastic (x :number)
	{
		return x === 0 ? 0 : x === 1 ? 1 : -Math.pow(2, 10 * x - 10) * Math.sin((x * 10 - 10.75) * this._c4);
	}
	public static easeOutElastic (x :number)
	{
		return x === 0 ? 0 : x === 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * this._c4) + 1;
	}
	public static easeInOutElastic (x :number)
	{
		return x === 0 ? 0 : x === 1 ? 1 : x < 0.5 ? -(Math.pow(2, 20 * x - 10) * Math.sin((20 * x - 11.125) * this._c5)) / 2 : (Math.pow(2, -20 * x + 10) * Math.sin((20 * x - 11.125) * this._c5)) / 2 + 1;
    }
    private static _bounceOut (x :number)
	{
        const n1 = 7.5625;
        const d1 = 2.75;

        if (x < 1 / d1)
            return n1 * x * x;
        else if (x < 2 / d1)
            return n1 * (x -= 1.5 / d1) * x + 0.75;
        else if (x < 2.5 / d1)
            return n1 * (x -= 2.25 / d1) * x + 0.9375;
        else
            return n1 * (x -= 2.625 / d1) * x + 0.984375;
    }
	public static easeInBounce (x :number)
	{
		return 1 - this._bounceOut(1 - x);
	}
	public static easeOutBounce (x :number)
	{
        return this._bounceOut(x);
    }
	public static easeInOutBounce (x :number)
	{
		return x < 0.5 ? (1 - this._bounceOut(1 - 2 * x)) / 2 : (1 + this._bounceOut(2 * x - 1)) / 2;
	}
}