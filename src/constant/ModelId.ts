
export class ModelId
{
    public static CANNNA :number = 0;
    public static MIKU   :number = 1;
    public static RIN    :number = 2;
    public static LEN    :number = 3;
    public static LUKA   :number = 4;

    
    public static getModelPath (id :number)
    {
        var paths = ["box_canna/box_canna.pmd", "box_miku/box_miku.pmd", "box_rin/box_rin.pmd", "box_len/box_len.pmd", "box_luka/box_luka.pmd"];
        return "models/" + paths[id];
    }
}