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
        
        function calcPosLittle(nextName) {
            let tp = mapSize-1;
            let next = box[nextName];
            while(next) {
                next = next[nextName];
                tp -= 1;
            }
            return tp;
        }
        function calcPosGreater(nextName) {
            let tp = 0;
            let next = box[nextName];
            while(next) {
                next = next[nextName];
                tp += 1;
            }
            return tp;
        }

        function move(boxes, funcName, callback) {

            for(let box of boxes) {
                let tobeMove = box;
                while(tobeMove) {
                    callback(tobeMove,this.mapSize);
                    tobeMove = tobeMove[funcName];
                }
            }
        }
        let callback = this.onMove.bind(box,direction);
        
        if ("right"==direction) {
            calcPosLittle.call(box,"tileRight");
            move(this.rightTiles,"tileLeft",callback);
        } else if ("left"==direction) {
            calcPosGreater.call(box,"tileLeft");
            move(this.leftTiles,"tileRight",callback);
        } else if ("down"==direction) {
            calcPosLittle.call(box,"tileDown")
            move(this.bottomTiles,"tileUp",callback);
        } else {
            calcPosGreater.call(box,"tileUp");
            move(this.topTiles,"tileDown",callback);
        }
    }
    onMove(direction,mapSize) {
        let box = this;

        box.showMove();
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
            tileY = 2; // todo remove after debug
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
            tileX = 2; // todo remove after debug
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
    }

    onStageClick(e) {
        //停止事件冒泡，提高性能，当然也可以不要
        e.stopPropagation();
    }

}
