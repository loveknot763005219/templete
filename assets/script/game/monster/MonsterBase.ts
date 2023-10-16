import {_decorator, Component, Node} from 'cc';
import Simulator from "../RVO/Simulator";
import Vector2 from "../RVO/Vector2";
import RVOMath from "../RVO/RVOMath";

const {ccclass, property} = _decorator;

@ccclass('MonsterBase')
export class MonsterBase extends Component {
    //血量
    private _hp: number;
    //属性
    private prop: MonsterProperty;
    //智能体id
    private _agentId:number = -1;

    public get hp() {
        return this._hp;
    }

    public set hp(val: number) {
        if (val > this.prop.maxHp) {
            val = this.prop.maxHp;
        } else if (val < 0) {
            val = 0;
        }
        this._hp = val;
    }

    ////////////////////初始化怪物数值
    init(data: MonsterProperty = {maxHp: 100, atk: 10, speed: 30, interval: 1}) {
        this.prop = data;
        //添加代理
        this._agentId = Simulator.Instance.addAgent(this.node.getPosition());
    }

    removeAgent() {
        // console.log("移除代理");
        Simulator.Instance.delAgentBySid(this._agentId);
    }

    protected update(dt: number): void {
        this.move();
        this.updateSpriteDirection();
    }

    move() {
        if (this._agentId > -1) {
            let pos: Vector2 = Simulator.Instance.getAgentPosition(this._agentId);
            // let vel: Vector2 = Simulator.Instance.getAgentPrefVelocity(this._sid);
            if (!Number.isNaN(pos.x) && !Number.isNaN(pos.y)) {
                this.node.setWorldPosition(pos.x, pos.y, 0);
            } else {
                console.log(`sid=${this._agentId}的对象PosX=${pos.x},PosY=${pos.y}`);
            }
        }
        this.updatePrefVelocity();
    }

    updatePrefVelocity() {
        //获取角色位置
        let targetPos = this.getTargetPos();
        if (targetPos != null) {
            let curPos = Simulator.Instance.getAgentPosition(this._agentId);
            let goalVector = Vector2.subtract(targetPos, curPos);
            if (RVOMath.absSq(goalVector) > 1) {
                // goalVector = RVOMath.normalize(goalVector);
                let tempV2 = RVOMath.normalize(goalVector);
                // goalVector = Vector2.multiply2(10,tempV2);
                let times = this.getMonsterCurMoveSpeed() / 100;
                goalVector = Vector2.multiply2(10 * times, tempV2);
                //击退逻辑
                /*if (this._waitRepel) {
                    times = this._backDis / 100 * 10;
                    goalVector = Vector2.multiply2(10 * times, tempV2);
                    goalVector.x *= -1;
                    goalVector.y *= -1;
                    this._waitRepel = false;
                }*/
            }
            Simulator.Instance.setAgentPrefVelocity(this._agentId, goalVector);

            //由于完美对称，稍微扰动一下以避免死锁,但是不注释坐标始终会有变化
            // let angle = Math.random() * 2.0 * Math.PI;
            // let dist = Math.random() * 0.1;
            // Simulator.Instance.setAgentPrefVelocity(this._sid, Vector2.addition(Simulator.Instance.getAgentPrefVelocity(this._sid),
            //     Vector2.multiply2(dist, new Vector2(Math.cos(angle), Math.sin(angle)))));
        }
    }

    //更新sprite朝向
    updateSpriteDirection() {
        if (this.isStrongControlled()) return;
        // let x = em.dispatch("getHeroWorldPos").x - this.node.getWorldPosition().x;
        let x = this.getTargetPos().x - this.node.getWorldPosition().x;
        let scale = this.node.getScale();

        if (x > 0) this.node.setScale(-Math.abs(scale.x), scale.y, scale.z);
        else if (x < 0) this.node.setScale(Math.abs(scale.x), scale.y, scale.z);
    }

    /**
     * @description: 是否是强控状态 强控包括：麻痹、冻结
     * 强控状态 无法移动 无法造成伤害
     */
    isStrongControlled() {
        return false;
    }

    /**
     * 获取怪物当前速度
     */
    getMonsterCurMoveSpeed(){
        return this.prop.speed;
    }

    /**
     * 获取目标位置
     */
    getTargetPos(){
        return new Vector2(0,0)
    }
}

//怪物属性
class MonsterProperty {
    maxHp: number;
    atk: number;
    speed: number;
    interval: number;
}

class SpecialMonsterStatus {
    _waitRepel = {};
}

