export default class Tile extends Laya.Sprite {
    constructor() {
        super();
        this._tilePosX = -1;
        this._tilePosY = -1;
        this.tileLeft = null;
        this.tileRight = null;
        this.tileUp = null;
        this.tileDown = null;
    }

    onEnable() {
        //盒子等级
        this.level = Math.round(Math.random() * 5) + 1;
        //等级文本对象引用
        this._text = this.getChildByName("levelTxt");
        this._text.text = this.level + "";
    }
    onDisable() {
        //盒子被移除时，回收盒子到对象池，方便下次复用，减少对象创建开销。
        Laya.Pool.recover("dropBox", this);
    }

    showMove() {
        const boxWidth = 100;
        let toX = box.tilePosX * boxWidth;
        let toY = box.tilePosY * boxWidth;
        Laya.Tween.to(box,{x : toX, y: toY}, 200);
    }
    tilePos(x,y) {
        this.tilePosX = x;
        this.tilePosY = y;
    }

    get tilePosX() {
        return this._tilePosX;
    }
    set tilePosX(x) {
        this._tilePosX = x;
    }

    get tilePosY() {
        return this._tilePosY;
    }
    set tilePosY(y) {
        this._tilePosY = y;
    }

    toString() {
        return "tilePosX:"+this.tilePosX+" tilePosY:"+this.tilePosY;
    }
}
