(function () {
    'use strict';

    // import Bullet from "./Bullet";
    /**
     * 游戏控制脚本。定义了几个dropBox，bullet等变量，能够在IDE显示及设置该变量
     * 更多类型定义，请参考官方文档
     */
    class GameControl extends Laya.Script {
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
                calcPosLittle.call(box,"tileDown");
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

    /**
     * 本示例采用非脚本的方式实现，而使用继承页面基类，实现页面逻辑。在IDE里面设置场景的Runtime属性即可和场景进行关联
     * 相比脚本方式，继承式页面类，可以直接使用页面定义的属性（通过IDE内var属性定义），比如this.tipLbll，this.scoreLbl，具有代码提示效果
     * 建议：如果是页面级的逻辑，需要频繁访问页面内多个元素，使用继承式写法，如果是独立小模块，功能单一，建议用脚本方式实现，比如子弹脚本。
     */
    class GameUI extends Laya.Scene {
        constructor() {
            super();
            //设置单例的引用方式，方便其他类引用
            GameUI.instance = this;
            //关闭多点触控，否则就无敌了
            Laya.MouseManager.multiTouchEnabled = false;
            //加载场景文件
            this.loadScene("test/TestScene.scene");
        }

        onEnable() {
            //戏控制脚本引用，避免每次获取组件带来不必要的性能开销
            this._control = this.getComponent(GameControl);
        }

    }

    class Tile extends Laya.Sprite {
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

    /**This class is automatically generated by LayaAirIDE, please do not make any modifications. */

    class GameConfig {
        static init() {
            //注册Script或者Runtime引用
            let reg = Laya.ClassUtils.regClass;
    		reg("script/GameUI.js",GameUI);
    		reg("script/GameControl.js",GameControl);
    		reg("script/Tile.js",Tile);
        }
    }
    GameConfig.width = 1000;
    GameConfig.height = 1000;
    GameConfig.scaleMode ="showall";
    GameConfig.screenMode = "none";
    GameConfig.alignV = "middle";
    GameConfig.alignH = "center";
    GameConfig.startScene = "test/TestScene.scene";
    GameConfig.sceneRoot = "";
    GameConfig.debug = false;
    GameConfig.stat = false;
    GameConfig.physicsDebug = false;
    GameConfig.exportSceneToJson = true;

    GameConfig.init();

    class Main {
    	constructor() {
    		//根据IDE设置初始化引擎		
    		if (window["Laya3D"]) Laya3D.init(GameConfig.width, GameConfig.height);
    		else Laya.init(GameConfig.width, GameConfig.height, Laya["WebGL"]);
    		Laya["Physics"] && Laya["Physics"].enable();
    		Laya["DebugPanel"] && Laya["DebugPanel"].enable();
    		Laya.stage.scaleMode = GameConfig.scaleMode;
    		Laya.stage.screenMode = GameConfig.screenMode;
    		Laya.stage.alignV = GameConfig.alignV;
    		Laya.stage.alignH = GameConfig.alignH;
    		//兼容微信不支持加载scene后缀场景
    		Laya.URL.exportSceneToJson = GameConfig.exportSceneToJson;

    		//打开调试面板（通过IDE设置调试模式，或者url地址增加debug=true参数，均可打开调试面板）
    		if (GameConfig.debug || Laya.Utils.getQueryString("debug") == "true") Laya.enableDebugPanel();
    		if (GameConfig.physicsDebug && Laya["PhysicsDebugDraw"]) Laya["PhysicsDebugDraw"].enable();
    		if (GameConfig.stat) Laya.Stat.show();
    		Laya.alertGlobalError = true;

    		//激活资源版本控制，version.json由IDE发布功能自动生成，如果没有也不影响后续流程
    		Laya.ResourceVersion.enable("version.json", Laya.Handler.create(this, this.onVersionLoaded), Laya.ResourceVersion.FILENAME_VERSION);
    	}

    	onVersionLoaded() {
    		//激活大小图映射，加载小图的时候，如果发现小图在大图合集里面，则优先加载大图合集，而不是小图
    		Laya.AtlasInfoManager.enable("fileconfig.json", Laya.Handler.create(this, this.onConfigLoaded));
    	}

    	onConfigLoaded() {
    		//加载IDE指定的场景
    		GameConfig.startScene && Laya.Scene.open(GameConfig.startScene);
    	}
    }
    //激活启动类
    new Main();

}());
//# sourceMappingURL=bundle.js.map
