import {AudioManager} from './audioManager';
import {
    _decorator,
    Component,
    Node,
    Prefab,
    AnimationComponent,
    Animation,
    ParticleSystem,
    ParticleSystemComponent,
    Vec3,
    find,
    isValid,
    AnimationState,
    AnimationClip,
    UITransformComponent,
    Vec2
} from 'cc';
import {PoolManager} from './poolManager';
import {ResourceUtil} from './resourceUtil';
import {Constant} from "./constant";
import {Log} from "../utils/log";


const {ccclass, property} = _decorator;

@ccclass('EffectManager')
export class EffectManager extends Component {
    private _ndParent: Node = null!;
    public get ndParent(): Node {
        if (!this._ndParent) {
            this._ndParent = find(Constant.EFFECT) as Node;
        }

        return this._ndParent
    }

    static _instance: EffectManager;

    static get instance() {
        if (this._instance) {
            return this._instance;
        }

        this._instance = new EffectManager();
        return this._instance;
    }


    /**
     * 播放动画
     * @param {string} path 动画节点路径
     * @param {string} aniName
     * @param {vec3} worPos 世界坐标
     * @param {boolean} isLoop 是否循环
     * @param {boolean} isRecycle 是否回收
     * @param {number} [scale=1] 缩放倍数
     * @param {Function} [callback=()=>{}] 回调函数
     */
    public playAni(path: string, aniName: string, worPos: Vec3 = new Vec3(), isLoop: boolean = false, isRecycle: boolean = false, scale: number = 1, callback: Function = () => {
    }) {
        //todo 路径处理
        let childName: string = path.split("/")[1];
        let ndEffect: Node | null = this.ndParent.getChildByName(childName);

        let cb = () => {
            ndEffect?.setScale(new Vec3(scale, scale, scale));
            ndEffect?.setWorldPosition(worPos);
            let ani: Animation = ndEffect?.getComponent(Animation) as Animation;
            ani.play(aniName);
            let aniState: AnimationState = ani.getState(aniName) as AnimationState;
            if (aniState) {
                if (isLoop) {
                    aniState.wrapMode = AnimationClip.WrapMode.Loop;
                } else {
                    aniState.wrapMode = AnimationClip.WrapMode.Normal;
                }
            }

            ani.once(Animation.EventType.FINISHED, () => {
                callback && callback();
                if (isRecycle && ndEffect) {
                    PoolManager.instance.put(ndEffect);
                }
            })
        }

        if (!ndEffect) {
            ResourceUtil.loadPrefab(path).then((prefab: unknown) => {
                ndEffect = PoolManager.instance.get(prefab as Prefab, this.ndParent) as Node;
                ndEffect.setScale(new Vec3(scale, scale, scale));
                ndEffect.setWorldPosition(worPos);
                cb();
            })
        } else {
            Log.error('没有动画节点')
            cb();
        }
    }

    /**
     * 移除特效
     * @param {string} name  特效名称
     * @param {Node}} ndParent 特效父节点
     */
    public removeEffect(name: string, ndParent: Node = this.ndParent) {
        let ndEffect: Node | null = ndParent.getChildByName(name);
        if (ndEffect) {
            let arrAni: Animation[] = ndEffect.getComponentsInChildren(Animation);
            arrAni.forEach((element: Animation) => {
                element.stop();
            })

            let arrParticle: [] = ndEffect?.getComponentsInChildren(ParticleSystem) as any;
            arrParticle.forEach((element: ParticleSystem) => {
                element?.clear();
                element?.stop();
            })
            PoolManager.instance.put(ndEffect);
        }
    }

    /**
     * 播放粒子特效
     * @param {string} path 特效路径
     * @param {vec3}worPos 特效世界坐标
     * @param {number} [recycleTime=0] 特效节点回收时间，如果为0，则使用默认duration
     * @param  {number} [scale=1] 缩放倍数
     * @param {vec3} eulerAngles 特效角度
     * @param {Function} [callback=()=>{}] 回调函数
     */
    public playParticle(path: string, worPos: Vec3, recycleTime: number = 0, scale: number = 1, eulerAngles?: Vec3, callback?: Function) {
        ResourceUtil.loadPrefab(path).then((prefab: any) => {
            let ndEffect: Node = PoolManager.instance.get(prefab as Prefab, this.ndParent) as Node;
            ndEffect.setScale(new Vec3(scale, scale, scale));
            ndEffect.setWorldPosition(worPos);

            if (eulerAngles) {
                ndEffect.eulerAngles = eulerAngles;
            }

            let maxDuration: number = 0;

            let arrParticle: ParticleSystem[] = ndEffect.getComponentsInChildren(ParticleSystem);
            arrParticle.forEach((item: ParticleSystem) => {
                item.simulationSpeed = 1;
                item?.clear();
                item?.stop();
                item?.play()

                let duration: number = item.duration;
                maxDuration = duration > maxDuration ? duration : maxDuration;
            })

            let seconds: number = recycleTime && recycleTime > 0 ? recycleTime : maxDuration;

            setTimeout(() => {
                if (ndEffect.parent) {
                    callback && callback();
                    PoolManager.instance.put(ndEffect);
                }
            }, seconds * 1000)
        })
    }

    /**
     * 播放节点下面的动画和粒子
     *
     * @param {Node} targetNode 特效挂载节点
     * @param {string} effectPath 特效路径
     * @param {boolean} [isPlayAni=true] 是否播放动画
     * @param {boolean} [isPlayParticle=true] 是否播放特效
     * @param {number} [recycleTime=0] 特效节点回收时间，如果为0，则使用默认duration
     * @param {number} [scale=1] 缩放倍数
     * @param {Vec3} [pos=new Vec3()] 位移
     * @param {Function} [callback=()=>{}] 回调函数
     * @returns
     * @memberof EffectManager
     */
    public playEffect(targetNode: Node, effectPath: string, isPlayAni: boolean = true, isPlayParticle: boolean = true, recycleTime: number = 0, scale: number = 1, pos: Vec3 = new Vec3(), eulerAngles?: Vec3, callback?: Function) {
        if (!targetNode.parent) {//父节点被回收的时候不播放
            return;
        }

        ResourceUtil.loadPrefab(effectPath).then((prefab: any) => {
            let ndEffect: Node = PoolManager.instance.get(prefab as Prefab, targetNode) as Node;
            ndEffect.setScale(new Vec3(scale, scale, scale));
            ndEffect.setPosition(pos);
            if (eulerAngles) {
                ndEffect.eulerAngles = eulerAngles;
            }
            let maxDuration: number = 0;

            if (isPlayAni) {
                let arrAni: Animation[] = ndEffect.getComponentsInChildren(Animation);

                arrAni.forEach((element: Animation, idx: number) => {
                    element?.play();

                    let aniName = element?.defaultClip?.name;
                    if (aniName) {
                        let aniState = element.getState(aniName);
                        if (aniState) {
                            let duration = aniState.duration;
                            maxDuration = duration > maxDuration ? duration : maxDuration;

                            aniState.speed = 1;
                        }
                    }
                })
            }

            //前提时节点下面粒子与动效并存

            /*if (isPlayParticle) {
                let arrParticle: ParticleSystem[]= ndEffect.getComponentsInChildren(ParticleSystem);
                arrParticle.forEach((element:ParticleSystem)=>{
                    element.simulationSpeed = 1;
                    element?.clear();
                    element?.stop();
                    element?.play()
    
                    let duration: number= element.duration;
                    maxDuration = duration > maxDuration ? duration : maxDuration;
                })
            }*/

            let seconds: number = recycleTime && recycleTime > 0 ? recycleTime : maxDuration;

            setTimeout(() => {
                if (ndEffect.parent) {
                    callback && callback();
                    PoolManager.instance.put(ndEffect);
                }
            }, seconds * 1000)
        })
    }
}
