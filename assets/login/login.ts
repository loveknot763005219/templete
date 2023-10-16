import {_decorator, assetManager, Component, director, Node} from 'cc';
import {Constant} from "../script/manager/constant";
import {LocalConfig} from "../script/manager/localConfig";


const {ccclass, property} = _decorator;

@ccclass('login')
export class login extends Component {
    start() {

        Constant.LOGIN_TIME = Date.now();
        let bundleRoot = ['resources', 'main']
        let arr = [];
        if (window['tt']) {
            bundleRoot.forEach((item: string) => {
                let p = new Promise((resolve, reject) => {
                    assetManager.loadBundle(item, (err, bundle) => {
                        if (err) {
                            reject(err);
                            return
                        }
                        resolve(bundle);
                    })
                })
                arr.push(p);

                Promise.all(arr).then(() => {
                    this.enter();
                })
            })
        }else {
            this.enter();
        }

        LocalConfig.instance.loadConfig(()=>{

        })
    }

    enter() {
        director.preloadScene('game', () => {
            director.loadScene('game')
        })
    }

    update(deltaTime: number) {

    }
}

