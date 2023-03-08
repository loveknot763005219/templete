import { _decorator, Prefab, Node, instantiate, NodePool } from "cc";
const { ccclass, property } = _decorator;

@ccclass("PoolManager")
export class PoolManager {


    //节点对象池
    private _nodePool: any = {}
    //预制体
    private _cachePrefab: any = {}

    private static _instance: PoolManager;


    static get instance() {
        if (this._instance) {
            return this._instance;
        }

        this._instance = new PoolManager();
        return this._instance;
    }

    /**
     * 根据预设从对象池中获取对应节点
     */
    public get(prefab: Prefab, parent: Node) {
        let name = prefab.name;
        //@ts-ignore
        if (!prefab.position) {
            //@ts-ignore
            name = prefab.data.name;
        }

        this._cachePrefab[name] = prefab;
        let node:Node = null;
        if (this._nodePool.hasOwnProperty(name)) {
            //已有对应的对象池
            let pool = this._nodePool[name];
            if (pool.size() > 0) {
                node = pool.get();
            } else {
                node = instantiate(prefab);
            }
        } else {
            //没有对应对象池，创建他！
            let pool = new NodePool();
            this._nodePool[name] = pool;

            node = instantiate(prefab);
        }

        node.parent = parent;
        node.active = true;
        return node;
    }

    /**
     * 将对应节点放回对象池中
     */
    public put(node: Node) {
        if (!node) {
            return;
        }
        let name = node.name;
        let pool = null;
        if (this._nodePool.hasOwnProperty(name)) {
            //已有对应的对象池
            pool = this._nodePool[name];
        } else {
            //没有对应对象池，创建他！
            pool = new NodePool();
            this._nodePool[name] = pool;
        }

        pool.put(node);
    }

    /**
     * 根据名称，清除对应对象池
     */
    public clearPool(name: string) {
        if (this._nodePool.hasOwnProperty(name)) {
            let pool = this._nodePool[name];
            pool.clear();
        }
    }

    /**
    * 预生成对象池
    * @param prefab 
    * @param nodeNum 
    * 使用——PoolManager.instance.prePool(prefab, 40);
    */
    public init(prefab: Prefab, nodeNum: number) {
        const name = prefab.name;

        if(this._nodePool[name])return console.log('已有对象池');
        let pool = new NodePool();
        this._nodePool[name] = pool;

        for (let i = 0; i < nodeNum; i++) {
            const node = instantiate(prefab);
            pool.put(node);
        }
    }
}
