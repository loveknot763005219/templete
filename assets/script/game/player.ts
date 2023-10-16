import {_decorator, Component, dragonBones, math, Node, Vec3, view, find, UITransform} from 'cc';
import {ClientEvent} from "../manager/clientEvent";
import {Constant} from "../manager/constant";

const {ccclass, property} = _decorator;

@ccclass('player')
export class Player extends Component {

    @property({type: dragonBones.ArmatureDisplay, tooltip: '龙骨', displayName: "龙骨"})
    dragon: dragonBones.ArmatureDisplay = null;

    private _speed: number = 5

    private _direction;
    //相机
    private camera: Node = null;
    //地图
    private background: Node = null;
    //摇杆
    private stick: Node = null;

    //边界
    private area = {width: 0, height: 0}


    onLoad() {
        let canvas = find('Canvas');
        this.camera = canvas.getChildByName('Camera');
        this.background = canvas.getChildByName('background')
        this.stick = canvas.getChildByName('bar');
        this.area = this.background.getComponent(UITransform);

    }

    protected onEnable(): void {
        this.check();
        ClientEvent.on(Constant.EVENT_NAME.PLAYER_MOVE, this._move, this);
        ClientEvent.on(Constant.EVENT_NAME.PLAYER_STAND, this._stand, this);
    }

    protected onDisable(): void {
        ClientEvent.off(Constant.EVENT_NAME.PLAYER_MOVE, this._move, this);
        ClientEvent.off(Constant.EVENT_NAME.PLAYER_STAND, this._stand, this);
    }

    _move(vec: Vec3) {
        this.check();
        this.changeDragon(vec, 'walk');

        const position = this.node.getPosition();
        const ui = this.node.getComponent(UITransform);
        let del = vec.normalize().multiplyScalar(this._speed);


        if (Math.abs(position.x + del.x) > this.area.width / 2) {
            if(del.x * position.x > 0){
                //同向
                del.x = 0;
            }
        } else {

        }

        if (position.y + del.y + ui.height > this.area.height / 2 || position.y + del.y < -this.area.height / 2) {
            if(position.y * del.y > 0){
                del.y = 0;
            }
        }

        this.node.setPosition(this.node.position.add(del))
    }

    _stand() {
        this.changeDragon(null, 'stand');
    }

    /**
     * 获取朝向
     */
    getToward(vec): string {

        let str = "";
        let angle = Math.atan2(vec.y, vec.x) * 180 / Math.PI;
        if (angle > 45 && angle <= 135) {
            str = "back";
        } else if (angle > -45 && angle <= 45) {
            str = "right";
        } else if (angle > -135 && angle <= -45) {
            str = "front";
        } else {
            str = "left";
        }


        return str;
    }

    /**
     * 改变龙骨朝向
     * @param vec
     * @param str
     */
    changeDragon(vec: Vec3, str: string) {

        if (vec) {
            this._direction = this.getToward(vec);
        }
        if (this.dragon.armatureName != this._direction) {
            this.dragon.armatureName = this._direction;
        }
        if (this.dragon.animationName != str) {
            this.dragon.playAnimation(str, -1);
        }


    }

    /**
     * 镜头校准
     */
    check() {
        //摄像机移动
        //获取屏幕尺寸
        const canvas = view.getDesignResolutionSize()
        const background = this.background.getComponent(UITransform);
        const role = this.node.getPosition();

        let mh = (background.height - canvas.height) / 2;
        let mw = (background.width - canvas.width) / 2;

        let x = role.x > mw ? mw : Math.abs(role.x) > mw ? -mw : role.x;
        let y = role.y > mh ? mh : Math.abs(role.y) > mh ? -mh : role.y;

        this.camera.setPosition(x, y);
        this.stick.setPosition(x, y);

    }
}

