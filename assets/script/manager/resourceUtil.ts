import {
    _decorator,
    Prefab,
    Node,
    SpriteComponent,
    SpriteFrame,
    ImageAsset,
    resources,
    error,
    Texture2D,
    instantiate,
    isValid,
    find,
    TextAsset,
    JsonAsset,
    AudioClip
} from "cc";
import {Constant} from "./constant";
import {Log} from "../utils/log";
const { ccclass } = _decorator;

@ccclass("ResourceUtil")
export class ResourceUtil {
        /**
     * 加载资源
     * @param url   资源路径
     * @param type  资源类型
     * @param cb    回调
     * @method loadRes
     */
    public static loadRes (url: string, type: any, cb: Function = ()=>{}) {
        resources.load(url, (err: any, res: any)=>{
            if (err) {
                Log.error(err.message || err);
                cb(err, res);
                return;
            }

            cb && cb(null, res);
        })
    }

    /**
     * 加载预制体 普通 粒子  帧动画
     * @param path 路径
     */
    public static loadPrefab(path:string){
        return new Promise((resolve, reject)=>{
            this.loadRes(path,Prefab,(err:any,prefab:Prefab)=>{
                if(err){
                    Log.error('prefab load failed',path);
                    reject();
                    return
                }
                resolve && resolve(prefab);
            })
        })
    }


    /**
     * 设置精灵图片
     * @param path 图片路径
     * @param sprite 要设置的精灵
     * @param cb 回调
     */
    public static setSpriteFrame(path:string,sprite:SpriteComponent,cb:Function){
        this.loadRes(path,SpriteFrame,(err:any,spriteFrame:SpriteFrame)=>{
            if(err){
                Log.error('spriteFrame load failed');
                cb(err);
                return;
            }
            if(sprite && sprite.isValid){
                sprite.spriteFrame = spriteFrame;
                cb(null)
            }
        })
    }

    /**
     * 加载音效资源
     * @param path 路径
     */
    public static loadAudioClip(path:string){
        return new Promise((resolve, reject)=>{
            this.loadRes(path,AudioClip,(err:any,audio:AudioClip)=>{
                if(err){
                    Log.error('audio load failed');
                    reject && resolve(err);
                    return;
                }
                resolve && resolve(audio);
            })
        })
    }

    /**
     * 加载贴图资源
     * @param path 路径
     */
    public static loadSpriteFrame(path){
        return new Promise((resolve, reject)=>{
            this.loadRes(path,SpriteFrame,(err:any,spriteFrame:SpriteFrame)=>{
                if(err){
                    Log.error('load spriteFrame failed');
                    reject && reject(err);
                    return;
                }
                resolve && resolve(spriteFrame);
            })
        })
    }

    /**
     * 获取贴图资源
     * @param path 贴图路径
     * @returns 
     */
    public static loadSpriteFrameRes(path: string) {
        return new Promise((resolve, reject)=>{
            this.loadRes(path, SpriteFrame, (err: any, img: ImageAsset)=>{
                if (err) {
                    Log.error('spriteFrame load failed!', path, err);
                    reject && reject();
                    return;
                }

                let texture = new Texture2D();
                texture.image = img;

                let sf = new SpriteFrame();
                sf.texture = texture;
    
                resolve && resolve(sf);
            })
        })
    }

    /**
     * 创建ui界面
     * @param path ui路径
     * @param cb 回调函数
     * @param parent 父节点
     */
    public static createUI (path: string, cb?: Function, parent?: Node) {
        this.loadPrefab(path).then((prefab:Prefab)=> {
            let node: Node = instantiate(prefab)
            node.setPosition(0, 0, 0);
            if (!parent) {
                parent = find(Constant.UI) as Node;
            }
            parent.addChild(node);
            cb && cb(null, node);
        });
    }

    /**
     * 获取文本数据
     * @param fileName 文件名
     * @param cb  回调函数
     */
    public static getTextData (fileName:string, cb: Function) {
        this.loadRes("data/" + fileName,  null, function (err: any, content: TextAsset) {
            if (err) {
                Log.error(err.message || err);
                return;
            }

            let text: string = content.text;
            cb(err, text);
        });
    }

}
