export default class Tile extends Laya.Sprite {
    constructor() {
        super();
        this.tilePosX = -1;
        this.tilePosY = -1;
        Laya.stage.on("move",this, this.onMove);
        Laya.stage.on("onPos",this, this.onPos);
        this.tileLeft = null;
        this.tileRight = null;
        this.tileUp = null;
        this.tileDown = null;
    }

    onMove(direction) {
    }

    onPos(newBox) {
        // if(newBox == this) return;
        // if(newBox.tilePosX != this.tilePosX && newBox.tilePosY != this.tilePosY) return;

        // if(newBox.tilePosX == this.tilePosX && newBox.tilePosY <= 0 && !this.tileUp) {
        //     this.tileUp = newBox;
        //     newBox.tileDown = this;
        // }
        // if(newBox.tilePosX == this.tilePosX && newBox.tilePosY > 5 && !this.tileDown) {
        //     this.tileDown = newBox;
        //     newBox.tileUp = this;
        // }
        // if(newBox.tilePosY == this.tilePosY && newBox.tilePosX <= 0 && !this.tileLeft) {
        //     this.tileLeft = newBox;
        //     newBox.tileRight = this;
        // }
        // if(newBox.tilePosY == this.tilePosY && newBox.tilePosX > 5 && !this.tileRight) {
        //     this.tileRight = newBox;
        //     newBox.tileLeft = this;
        // }

        // if(newBox.tilePosX == this.tilePosX) {
        //     this.insertH();
        // }
        // if(newBox.tilePosY == this.tilePosY) {
        //     this.insertV();
        // }
    }

    insertH(tile) {
        if(tile.tilePosX > this.tilePosX) {
            let current = this;
            while(tile.tilePosX > current.tilePosX){
                current = current.tileRight;
            }
            let right = current.tileRight;
            current.right = tile;
            tile.left = current;
            tile.right = right;
        }
        if(tile.tilePosX < this.tilePosX) {
            let current = this;
            while(tile.tilePosX < current.tilePosX) {
                current = current.tileLeft;
            }
        }
    }
    insertV(tile) {
    }

    tilePos(x,y) {
        this.tilePosX = x;
        this.tilePosY = y;
        console.info("tilePosX", this.tilePosX , "tilePosY", this.tilePosY);
    }

    toString() {
        return "tilePosX:"+this.tilePosX+" tilePosY:"+this.tilePosY;
    }
}
