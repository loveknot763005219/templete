import {_decorator, Component, math, Node, UIOpacity, UITransform, Vec3, Vec2,v2} from 'cc';
import {ClientEvent} from "../manager/clientEvent";
import {Constant} from "../manager/constant";


const {ccclass, property} = _decorator;

//遥控杆

@ccclass('stick')
export class Stick extends Component {

    @property({type: Node, displayName: '中心点'})
    point: Node = null;

    @property({type: Node, displayName: '中心点'})
    background:Node = null;

    private _touching = false;

    start() {

    }

    onEnable() {

        this.background.on(Node.EventType.TOUCH_START, this._touchStart, this);
        this.background.on(Node.EventType.TOUCH_MOVE, this._touchMove, this);
        this.background.on(Node.EventType.TOUCH_CANCEL, this._touchCancel, this);
        this.background.on(Node.EventType.TOUCH_END, this._touchend, this);
    }

    onDisable() {
        this.background.off(Node.EventType.TOUCH_START, this._touchStart, this);
        this.background.off(Node.EventType.TOUCH_MOVE, this._touchMove, this);
        this.background.off(Node.EventType.TOUCH_CANCEL, this._touchCancel, this);
        this.background.off(Node.EventType.TOUCH_END, this._touchend, this);
    }


    private _touchStart(event) {
        this._touching = true;
        this.node.getComponent(UIOpacity).opacity = 255;
        let parent = this.node.parent.getComponent(UITransform);
        let vec2 = event.getUILocation();
        let x = vec2.x - parent.width/2;
        let y = vec2.y - parent.height/2;

        this.node.setPosition(x,y);
    }

    private _touchMove(event) {
        let position = this.point.getPosition().add(event.getDelta());
        let pos = new Vec2(position.x, position.y);
        this._touching = true;
        let width = this.node.getComponent(UITransform).width;
        let l = pos.length();

        if (l > width / 2) {
            //向量长度
            let a = (width / 2) / l;
            pos.multiplyScalar(a)
        }
        this.point.setPosition(pos.x,pos.y);
    }

    private _touchCancel() {
        this.hide();
    }

    private _touchend() {
        this.hide();
    }

    private hide() {
        this._touching = false;
        this.point.setPosition(0, 0);
        this.node.getComponent(UIOpacity).opacity = 0;
        ClientEvent.dispatchEvent(Constant.EVENT_NAME.PLAYER_STAND);
    }

    update(deltaTime: number) {
        if(this._touching){
            ClientEvent.dispatchEvent(Constant.EVENT_NAME.PLAYER_MOVE,this.point.getPosition());
        }
    }

    mag(value: Vec2) {
        return Math.sqrt(value.x * value.x + value.y * value.y);
    }
}

