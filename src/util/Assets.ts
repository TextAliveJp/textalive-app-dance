
export class Assets
{
    private static _data :object = {};

    public static get (key :string)
    {
        return this._data[key];
    }
    public static add (key :string, value :any)
    {
        this._data[key] = value;
        return value;
    }
}