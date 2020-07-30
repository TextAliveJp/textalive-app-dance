import { ModelId } from "../constant/ModelId";

export class Parameter
{
    public fontName  :string = "sans-serif";
    public fontColor :number = 0x333344;

    public colors  :number[] = [0xff66cc, 0xffaabb, 0xffbb44, 0xff9966]; // 0xff33aa, 0xff99aa, 0xff33ee, 0xff6633
    public bgColor :number = 0xeeeef9;

    public modelId  :number  = ModelId.CANNNA;
    public nekomimi :boolean = true;
    public seed     :number = 1;
}