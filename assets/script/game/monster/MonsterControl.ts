import {_decorator, BoxCollider2D, Component, instantiate, math, Node, Prefab, UITransform, Vec3} from 'cc';
import QuadtreeRect from "./Quadtree";
import Simulator from "../RVO/Simulator";
import {PoolManager} from "../../manager/poolManager";
import {MonsterBase} from "./MonsterBase";

const {ccclass, property} = _decorator;

@ccclass('MonsterControl')
export class MonsterControl extends Component {

    private prefab: Prefab;
    //四叉树
    private _quadtree: QuadtreeRect;

    _waitCreateQueue = [];//等待创建怪物的队列


    start() {

    }

    update(deltaTime: number) {
        this.updateQuadtree();
        Simulator.Instance.doStep();
        // if (!ggConfig.framingInitMonster) return;
        if (this._waitCreateQueue.length > 0) {
            // console.log("分帧生成", this._waitCreateQueue);
            let max = 1;
            let count = this._waitCreateQueue.length > max ? max : this._waitCreateQueue.length;
            while (count) {
                let data = this._waitCreateQueue.shift();
                this.createMonster(data);
                count--;
            }
        }
    }

    /**
     * 创建怪物
     */
    createMonster(data) {
        let node: Node = instantiate(this.prefab);
        this.node.addChild(node);
        node.setPosition(0, 0);
        let monster = node.getComponent(MonsterBase);
        monster.init(data);
    }

    /**
     * 更新四叉树
     */
    updateQuadtree() {
        //角色位置
        let rp = new Vec3(0, 0, 0);
        let ui = this.node.getComponent(UITransform);
        this._quadtree = new QuadtreeRect({
            x: rp.x - ui.width / 2,
            y: rp.y - ui.height / 2,
            width: ui.width,
            height: ui.height
        })

        for (let i = 0; i < this.node.children.length; i++) {
            let enemy = this.node.children[i];
            let collider = enemy.getComponent(BoxCollider2D);
            let rect = collider.worldAABB;
            if (Math.abs((rp.x - rect.x - rect.width / 2)) > ui.width / 2) continue;
            if (Math.abs((rp.y - rect.y - rect.height / 2)) > ui.height / 2) continue;
            this._quadtree.insert(rect);

        }
    }

    /**
     * 获取当前四叉树
     */
    getCurMonsterQuadtree(): QuadtreeRect {
        return this._quadtree;
    }

    removeAllMonsters() {
        let some = 50;
        let fun = () => {
            console.log("分帧移除");
            let mt = this.getMonsterTotal();
            console.log("mt", mt);
            if (mt) {
                if (mt >= some) this.removeSomeMonsters(some);
                else this.removeSomeMonsters(mt);
            } else {
                this.unschedule(fun);
            }
        }
        this.schedule(fun, 1 / 60);
    }

    /**
     * @description: 移除指定数量monster
     * @param {*} total 单次移除总数
     * @total 550+： 耗时：18s  some：5
     * @total 550+： 耗时：23s  some：1
     */
    removeSomeMonsters(total) {
        let all = this.getAllMonster();
        // console.log("all",all);
        while (total) {
            let child = all[total - 1];
            child.removeFromParent();
            //放入对象池
            // plm.putToJunkyard(child);
            total--;
        }
    }

    getAllMonster() {
        return this.node.children;
    }

    getMonsterTotal() {
        return this.node.children.length;
    }
}

