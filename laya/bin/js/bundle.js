(function () {
    'use strict';

    // import Bullet from "./Bullet";
    /**
     * 游戏控制脚本。定义了几个dropBox，bullet等变量，能够在IDE显示及设置该变量
     * 更多类型定义，请参考官方文档
     */
    class GameControl extends Laya.Script {
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
            //点击提示文字，开始游戏
            this.tipLbll.on(Laya.Event.CLICK, this, this.onTipClick);
        }

        onTipClick(e) {
            this.tipLbll.visible = false;
            this._score = 0;
            this.scoreLbl.text = "";
            this._control.startGame();
        }

        /**增加分数 */
        addScore(value) {
            this._score += value;
            this.scoreLbl.changeText("分数：" + this._score);
            //随着分数越高，难度增大
            if (this._control.createBoxInterval > 600 && this._score % 20 == 0) this._control.createBoxInterval -= 20;
        }

        /**停止游戏 */
        stopGame() {
            this.tipLbll.visible = true;
            this.tipLbll.text = "游戏结束了，点击屏幕重新开始";
            this._control.stopGame();
        }
    }

    /**
     * 掉落盒子脚本，实现盒子碰撞及回收流程
     */
    class DropBox extends Laya.Script {
        constructor() { super(); }
        onEnable() {
            /**获得组件引用，避免每次获取组件带来不必要的查询开销 */
            this._rig = this.owner.getComponent(Laya.RigidBody);
            //盒子等级
            this.level = Math.round(Math.random() * 5) + 1;
            //等级文本对象引用
            this._text = this.owner.getChildByName("levelTxt");
            this._text.text = this.level + "";
            this.tilePosX = -1;
            this.tilePosY = -1;
            this.tileLeft = null;
            this.tileRight = null;
            this.tileUp = null;
            this.tileDown = null;
            Laya.stage.on("move",this, this.onMove);
            Laya.stage.on("create",this, this.onCreate);
        }

        onMove(direction) {
            alert(direction);
        }

        onCreate(dropBox) {
            alert("create"+dropBox);
        }
        tilePos(x,y) {
            this.tilePosX = x;
            this.tilePosY = y;
        }

        onUpdate() {
            //让持续盒子旋转
            // this.owner.rotation++;
        }

        onTriggerEnter(other, self, contact) {
            var owner = this.owner;
            if (other.label === "buttle") {
                //碰撞到子弹后，增加积分，播放声音特效
                if (this.level > 1) {
                    this.level--;
                    this._text.changeText(this.level + "");
                    owner.getComponent(Laya.RigidBody).setVelocity({ x: 0, y: -10 });
                    Laya.SoundManager.playSound("sound/hit.wav");
                } else {
                    if (owner.parent) {
                        let effect = Laya.Pool.getItemByCreateFun("effect", this.createEffect, this);
                        effect.pos(owner.x, owner.y);
                        owner.parent.addChild(effect);
                        effect.play(0, true);
                        owner.removeSelf();
                        Laya.SoundManager.playSound("sound/destroy.wav");
                    }
                }
                GameUI.instance.addScore(1);
            } else if (other.label === "ground") {
                //只要有一个盒子碰到地板，则停止游戏
                owner.removeSelf();
                GameUI.instance.stopGame();
            }
        }

        /**使用对象池创建爆炸动画 */
        createEffect() {
            let ani = new Laya.Animation();
            ani.loadAnimation("test/TestAni.ani");
            ani.on(Laya.Event.COMPLETE, null, recover);
            function recover() {
                ani.removeSelf();
                Laya.Pool.recover("effect", ani);
            }
            return ani;
        }

        onDisable() {
            //盒子被移除时，回收盒子到对象池，方便下次复用，减少对象创建开销。
            Laya.Pool.recover("dropBox", this.owner);
        }
    }

    /**This class is automatically generated by LayaAirIDE, please do not make any modifications. */

    class GameConfig {
        static init() {
            //注册Script或者Runtime引用
            let reg = Laya.ClassUtils.regClass;
    		reg("script/GameUI.js",GameUI);
    		reg("script/GameControl.js",GameControl);
    		reg("script/DropBox.js",DropBox);
        }
    }
    GameConfig.width = 1200;
    GameConfig.height = 1200;
    GameConfig.scaleMode ="fixedwidth";
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
