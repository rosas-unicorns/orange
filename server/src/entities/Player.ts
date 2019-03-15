export class Player {
    name: string;
    x: number;
    y: number;
    z: number;

    constructor (data: any) {
        this.name = data.name;
        this.x = data.x;
        this.y = data.y;
        this.z = data.z;
    }
}
