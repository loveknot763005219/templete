import {_decorator, Component, dragonBones, math, Node, Vec3} from 'cc';
import {ClientEvent} from "../manager/clientEvent";
import {Constant} from "../manager/constant";
import * as cc from "cc";
const { ccclass, property } = _decorator;

@ccclass('player')
export class Player extends Component {

    @property({type: dragonBones.ArmatureDisplay, tooltip: '龙骨', displayName: "龙骨"})
    dragon: dragonBones.ArmatureDisplay = null;

    private _speed:number = 5

    private _direction

    protected onEnable(): void {
        ClientEvent.on(Constant.EVENT_NAME.PLAYER_MOVE,this._move,this);
    }

    protected onDisable(): void {
        ClientEvent.off(Constant.EVENT_NAME.PLAYER_MOVE,this._move,this);
    }

    _move(vec:Vec3){

        this.changeDragon(vec,'walk');
        this.node.setPosition(this.node.position.add(vec.normalize().multiplyScalar(this._speed)))
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

        this._direction = this.getToward(vec);
        if (this.dragon.armatureName != this._direction) {
            this.dragon.armatureName = this._direction;
        }
        if (this.dragon.animationName != str) {
            this.dragon.playAnimation(str, -1);
        }


    }

    start() {

    }

    update(deltaTime: number) {
        
    }
}

