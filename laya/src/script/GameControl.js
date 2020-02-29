// import Bullet from "./Bullet";
/**
 * 游戏控制脚本。定义了几个dropBox，bullet等变量，能够在IDE显示及设置该变量
 * 更多类型定义，请参考官方文档
 */
export default class GameControl extends Laya.Script {
    /** @prop {name:dropBox,tips:"掉落容器预制体对象",type:Prefab}*/

    constructor() {
        super();
        this.all = [];
        this.topTiles = [];
        this.leftTiles = [];
        this.rightTiles = [];
        this.bottomTiles = [];
        this.mapSize = 10;
    }
    onEnable() {
        //是否已经开始游戏
        this._started = false;
        //子弹和盒子所在的容器对象
        this._gameBox = this.owner.getChildByName("gameBox");
    }

    onUpdate() {
    }

    onMouseDown(e) {
        this.dragX = e.stageX;
        this.dragY = e.stageY;
    }

    onMouseUp(e) {
        let x = e.stageX - this.dragX;
        let y = e.stageY - this.dragY;
        const createCount = 1;
        this.debugDrag = true;
        if (Math.abs(x) - Math.abs(y) > 0) {
            if (this.debugDrag) {
                Laya.stage.graphics.drawLine(this.dragX, this.dragY, this.dragX + x, this.dragY, "#ff0000");
            }
            if (x > 0) {
                this.createMultiBoxes(createCount, 'left');
                this.moveAll('right');
            } else {
                this.createMultiBoxes(createCount, 'right');
                this.moveAll('left');
            }
        } else {
            if (this.debugDrag) {
                Laya.stage.graphics.drawLine(this.dragX, this.dragY, this.dragX, this.dragY + y, "#ff0000");
            }
            if (y > 0) {
                this.createMultiBoxes(createCount, 'top');
                this.moveAll('down');
            } else {
                this.createMultiBoxes(createCount, 'bottom');
                this.moveAll('up');
            }
        }
    }

    moveAll(direction) {
        Laya.stage.event("move",direction);
        
        let boxes;
        if ("right"==direction) {
            boxes = this.rightTiles;
            for(let box of boxes) {
                let tobeMove = box;
                while(tobeMove) {
                    this.onMove(tobeMove, direction);
                    tobeMove = tobeMove.tileLeft;
                }
            }
        } else if ("left"==direction) {
            boxes = this.leftTiles;
            for(let box of boxes) {
                let tobeMove = box;
                while(tobeMove) {
                    this.onMove(tobeMove, direction);
                    tobeMove = tobeMove.tileRight;
                }
            }
        } else if ("down"==direction) {
            boxes = this.bottomTiles;
            for(let box of boxes) {
                let tobeMove = box;
                while(tobeMove) {
                    this.onMove(tobeMove, direction);
                    tobeMove = tobeMove.tileUp;
                }
            }
        } else {
            boxes = this.topTiles;
            for(let box of boxes) {
                let tobeMove = box;
                while(tobeMove) {
                    this.onMove(tobeMove, direction);
                    tobeMove = tobeMove.tileDown;
                }
            }
        }
    }

    onMove(box, direction) {
        const boxWidth = 100;
        const mapSize = this.mapSize;

        let toX = box.x, toY = box.y;
        if ("right"==direction) {
            box.tilePosX = mapSize;
            let right = box.tileRight;
            while(right) {
                right = right.tileRight;
                box.tilePosX -= 1;
            }
            toX = box.tilePosX * boxWidth;
        } else if ("left"==direction) {
            box.tilePosX = 1;
            let left = box.tileLeft;
            while(left) {
                left = left.tileLeft;
                box.tilePosX += 1;
            }
            toX = box.tilePosX * boxWidth;
        } else if ("down"==direction) {
            box.tilePosY = mapSize-1;
            let down = box.tileDown;
            while(down) {
                down = down.tileDown;
                box.tilePosY -= 1;
            }
            toY = box.tilePosY * boxWidth;
        } else {
            let up = box.tileUp;
            box.tilePosY = 1;
            while(up) {
                up = up.tileUp;
                box.tilePosY += 1;
            }
            toY = box.tilePosY * boxWidth;
        }

        Laya.stage.event("onPos", box);
        Laya.Tween.to(box,{x : toX, y: toY}, 200);
    }

    createMultiBoxes(count, birthRegion) {
        for(let i = 0; i< count; i++) {
            this.createBox(birthRegion);
        }

    }

    createBox(birthRegion) {
        let boxWidth = 100;
        //使用对象池创建盒子
        let box = Laya.Pool.getItemByCreateFun("dropBox", this.dropBox.create, this.dropBox);
        let tileX, tileY;
        if ('left' == birthRegion) {
            tileX = -1;
            tileY = Math.floor(Math.random() * (Laya.stage.height / boxWidth - 2));
            box.pos(tileX, tileY * boxWidth + boxWidth);

            let originLeft = this.leftTiles[tileY];
            if(!originLeft) {
                this.leftTiles[tileY] = box;
                this.rightTiles[tileY] = box;
            } else {
                box.tileRight = originLeft;
                originLeft.tileLeft = box;
                this.leftTiles[tileY] = box;
            }
        } else if ('right' == birthRegion) {
            tileX = this.mapSize;
            tileY = Math.floor(Math.random() * (Laya.stage.height / boxWidth - 2));
            box.pos(Laya.stage.width - boxWidth * 1, tileY * boxWidth + boxWidth);

            let originRight = this.rightTiles[tileY];
            if(!originRight) {
                this.rightTiles[tileY] = box;
                this.leftTiles[tileY] = box;
            } else {
                box.tileLeft = originRight;
                originRight.tileRight = box;
                this.rightTiles[tileY] = box;
            }
        } else if ('top' == birthRegion) {
            tileX = Math.floor(Math.random() * (Laya.stage.width / boxWidth - 2));
            tileY = -1;
            box.pos(tileX * boxWidth + boxWidth, tileY);

            let originTop = this.topTiles[tileX];
            if(!originTop) {
                this.topTiles[tileX] = box;
                this.bottomTiles[tileX] = box;
            } else {
                box.tileDown = originTop;
                originTop.tileUp = box;
                this.topTiles[tileX] = box;
            }
        } else  {
            tileX = Math.floor(Math.random() * (Laya.stage.width / boxWidth - 2));
            tileY = this.mapSize;
            box.pos(tileX * boxWidth + boxWidth, Laya.stage.height - boxWidth);

            let originBottom = this.bottomTiles[tileX];
            if(!originBottom) {
                this.topTiles[tileX] = box;
                this.bottomTiles[tileX] = box;
            } else {
                box.tileUp = originBottom;
                originBottom.tileDown = box;
                this.bottomTiles[tileX] = box;
            }
        }
        box.tilePos(tileX, tileY); // TODO constructor
        this._gameBox.addChild(box);
        Laya.stage.event("onPos", box);
    }

    onStageClick(e) {
        //停止事件冒泡，提高性能，当然也可以不要
        e.stopPropagation();
    }

    /**开始游戏，通过激活本脚本方式开始游戏*/
    startGame() {
        if (!this._started) {
            this._started = true;
            this.enabled = true;
        }
    }

    /**结束游戏，通过非激活本脚本停止游戏 */
    stopGame() {
        this._started = false;
        this.enabled = false;
        this._gameBox.removeChildren();
    }
}
