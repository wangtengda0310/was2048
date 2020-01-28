// import Bullet from "./Bullet";
/**
 * 游戏控制脚本。定义了几个dropBox，bullet等变量，能够在IDE显示及设置该变量
 * 更多类型定义，请参考官方文档
 */
export default class GameControl extends Laya.Script {
    /** @prop {name:dropBox,tips:"掉落容器预制体对象",type:Prefab}*/

    constructor() { super(); }
    onEnable() {
        //是否已经开始游戏
        this._started = false;
        //子弹和盒子所在的容器对象
        this._gameBox = this.owner.getChildByName("gameBox");
        this.all = [];
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
        if (Math.abs(x) - Math.abs(y) > 0) {
            if (this.debugDrag) {
                Laya.stage.graphics.drawLine(this.dragX, this.dragY, this.dragX + x, this.dragY, "#ff0000");
            }
            if (x > 0) {
                this.createMultiBoxes(3, 'left');
                this.moveAll('right');
            } else {
                this.createMultiBoxes(3, 'right');
                this.moveAll('left');
            }
        } else {
            if (this.debugDrag) {
                Laya.stage.graphics.drawLine(this.dragX, this.dragY, this.dragX, this.dragY + y, "#ff0000");
            }
            if (y > 0) {
                this.createMultiBoxes(3, 'top');
                this.moveAll('down');
            } else {
                this.createMultiBoxes(3, 'bottom');
                this.moveAll('up');
            }
        }
    }

    moveAll(direction) {
        Laya.stage.event("move",direction);
        let all = this.all;

        if ('left' == direction) {
        } else if ('right' == direction) {
        } else if ('up' == direction) {
        } else {
        }
    }

    createMultiBoxes(count, birthPlace) {
        for(let i = 0; i< count; i++) {
            this.createBox(birthPlace);
        }

    }

    createBox(birthPlace) {
        let boxWidth = 100;
        //使用对象池创建盒子
        let box = Laya.Pool.getItemByCreateFun("dropBox", this.dropBox.create, this.dropBox);
        console.log(box);
        if ('left' == birthPlace) {
            let tileY = Math.floor(Math.random() * (Laya.stage.height / boxWidth - 2));
            box.pos(0, tileY * boxWidth + boxWidth);
        } else if ('right' == birthPlace) {
            let tileX = 11;
            let tileY = Math.floor(Math.random() * (Laya.stage.height / boxWidth - 2));
            box.pos(Laya.stage.width - boxWidth * 1, tileY * boxWidth + boxWidth);
        } else if ('top' == birthPlace) {
            let tileX = Math.floor(Math.random() * (Laya.stage.width / boxWidth - 2));
            box.pos(tileX * boxWidth + boxWidth, 0);
        } else  {
            let tileX = Math.floor(Math.random() * (Laya.stage.width / boxWidth - 2));
            let tileY = 11;
            box.pos(tileX * boxWidth + boxWidth, Laya.stage.height - boxWidth);
        }
        this._gameBox.addChild(box);
        this.all.push(box);

        Laya.stage.event("create", box);

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
