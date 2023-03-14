//字节小玩法API
import {Util} from "../utils/util";
import {Log} from "../utils/Log";

declare var tt: any;
//测试地址
const baseUrl: string = ''
//正式地址
/*const baseUrl:string = ''*/


// 请求头参数
let user_id = 0;
let sessid = '';
let api = 'a_1525857942'
let version = "2.0.0"

let security_key = '*&^%$&#@$%#%'


//网络状态
let status = {
    code: 1,
    msg: ''
}

export class TTPlatform {
    private static _instance: TTPlatform;

    public static getInstance(): TTPlatform {
        if (!this._instance) {
            this._instance = new TTPlatform();
        }
        return this._instance;
    }

    private room_id;


    setStatus(code, msg = '') {
        status.code = code;
        status.msg = msg
    }


    //抖音登录
    public login() {
        return new Promise((resolve, reject)=>{
            tt.login({
                force:true,
                success(res){
                    Log.l('login 调用成功',res)
                    resolve(res);
                },
                fail(e){
                    reject(e)
                }
            })
        })
    }


    //判断小程序的 API、回调、参数、组件、Page 或 Component 实例的属性和方法等是否在当前版本可用。
    //https://developer.open-douyin.com/docs/resource/zh-CN/mini-app/develop/api/foundation/tt-can-i-use/
    public canIUse(str: string) {
        return tt.canIUse(str);
    }

    //调用该 API 可以获取用户临时的登录凭证。
    //https://developer.open-douyin.com/docs/resource/zh-CN/mini-app/develop/api/open-interface/log-in/tt-login/
    /*public login(callback: Function) {
        tt.login({
            force: true,
            success(res) {
                Log.l(`login 调用成功${res.code} ${res.anonymousCode}`);
                //服务器登录
                callback && callback(res);

            },
            fail(res) {
                Log.l(`login 调用失败`);
            },
        })
    }*/

    //显示灰色背景的 loading 提示框。该提示框不会主动隐藏。
    //https://developer.open-douyin.com/docs/resource/zh-CN/mini-app/develop/api/interface/interfeedback/tt-show-loading/
    /*public showLoading() {
        tt.showLoading({
            title: "请求中，请稍后...",
        })
    }*/

    //隐藏 loading 提示框。
    //https://developer.open-douyin.com/docs/resource/zh-CN/mini-app/develop/api/interface/interfeedback/tt-hide-loading
    /*public hideLoading() {
        tt.hideLoading({
            noConflict: true,
        })
    }*/

    //高潜用户上报
    public reportActive() {

        return new Promise((resolve, reject)=>{
            tt.checkIndividualPlayer({
                complete(res){
                    Log.l('上报成功',res)
                    resolve(res);
                }
            })
        })

    }


    //获取当前用户基础信息。 -- getLiveUserInfo
    //https://developer.open-douyin.com/docs/resource/zh-CN/mini-app/develop/api/live/tt-get-live-user-info/
    public getLiveUserInfo(){
        return new Promise((resolve, reject)=>{
            tt.getLiveUserInfo({
                success(res){
                    Log.l('获取玩家信息', res)
                    resolve(res)
                },
                fail(e){
                    Log.l('获取玩家信息', e)
                    reject(e)
                }
            })
        })
    }

    //获取直播间基础信息。 -- getRoomInfo
    //https://developer.open-douyin.com/docs/resource/zh-CN/mini-app/develop/api/live/tt-get-room-info/
    public getRoomInfo(){
        return new Promise((resolve, reject)=>{
            tt.getRoomInfo({
                success(res){
                    Log.l('获取房间信息', res)
                    resolve(res)
                },
                fail(e){
                    Log.l('获取房间信息', e)
                    reject(e)
                }
            })
        })
    }






    //获取房间id
    public getRoomId() {

        if (this.room_id) {
            Log.l(this.room_id, '已经有房间号');
            return this.room_id;
        }

        return null;
    }



    //直播间调用抖币支付能力，本文档介绍终端接口定义，详细支付流程可参考支付流程
    //https://microapp.bytedance.com/docs/zh-CN/interaction/develop/api/live/pay-diamonds-v3/
    public payV3(num, tag, orderId) {

        if (!num || !tag || !orderId) return;

        num = Number(num)
        tag = String(tag)
        orderId = String(orderId)

        Log.l(" 支付数量：" + num + " 支付标签：" + tag + " orderId：" + orderId);

        return new Promise((resolve, reject)=>{
            tt.payDiamondsV3({
                diamonds: num,
                tag: tag,
                orderId,
                success(res) {
                    Log.l("抖币支付成功：", res);

                    resolve(res);
                },
                fail(err) {
                    Log.l("抖币支付数据异常：", err);
                    reject(err)
                },
            });
        })


    }

    /**
     * 获取当前加密用户的昵称数据
     * @param src
     * @param fontsize
     * @param color
     * https://microapp.bytedance.com/docs/zh-CN/interaction/develop/api/live/base-user-info/draw-live-open-nick-name
     */
    public drawOpenNickName(src, fontsize, color) {
        return new Promise((resolve, reject)=>{
            tt.drawOpenNickName({
                src,
                fontsize,
                color,
                success: (res) => {
                    Log.l(`宽:${res.width}, 高:${res.height}`);
                    resolve(res)
                },
                fail: (e) => {
                    Log.l(`绘制昵称错误，错误码:${e.errCode}`);
                    reject(e)
                },
            });
        })

    }

    /**
     * 账号多设备登录时唤起重新登录弹窗
     * 显示模态弹窗。用于同步用户重要信息，并要求用户进行确认，或执行特定操作以决策下一步骤。
     * https://developer.open-douyin.com/docs/resource/zh-CN/mini-app/develop/api/interface/interfeedback/tt-show-modal/
     */
    public showModal(title:string,content:string,confirmColor:string,cancelColor:string,showCancel:boolean = false) {
        tt.showModal({
            title: title,
            content: content,
            confirmColor: confirmColor,
            cancelColor: cancelColor,
            showCancel: showCancel,
            success(res) {
                Log.l("用户点击了" + (res.confirm ? "确定" : "取消"));
            },
            fail(err) {
                Log.l(`showModal 调用失败`, err);
            },
        })
    }



    /**
     * 向开发者提供查询自有玩法的用户收藏行为信息
     * https://microapp.bytedance.com/docs/zh-CN/interaction/develop/api/live/favorite/tt-isFavoriteGame
     */
    public isFavoriteGame() {
        tt.isFavoriteGame({
            success(res) {
                Log.l('当前用户是否收藏当前玩法', res);
            },
            fail(res) {
                Log.l('调用失败 ', res);
            },
        })
    }


    /**
     * 开发者可以调用能力，在玩法内自定义 UI，引导用户收藏对应玩法。可通过收藏的返回结果设计运营活动
     * https://microapp.bytedance.com/docs/zh-CN/interaction/develop/api/live/favorite/tt-addToFavorites
     */
    public addToFavorites() {
        return new Promise((resolve, reject)=>{
            tt.addToFavorites({
                success: (res) => {
                    Log.l('收藏成功', res);
                    resolve(res);
                },
                fail: (err) => {
                    Log.l('收藏失败', err);
                    reject(err)
                }
            })
        })

    }

    //服务器请求
    public request(url: string, params:{}) {
        const default_sign = {
            sign_time: Math.floor(new Date().getTime() / 1000),
            api,
            version,
        }


        let code = {
            ...params,
            user_id,
            sessid,
        }

        let temp = {
            ...default_sign,
            ...code,
            security_key
        }

        let signRet = Util.getSign(temp)

        //拼接参数
        let data = {
            ...code,
            ...default_sign,
            sign: signRet,
        }


        return new Promise((resolve, reject)=>{
            tt.request({
                url: baseUrl + url,
                data: data,
                header: {
                    "content-type": "application/x-www-form-urlencoded", // 此处指定content-type类型，请确保传入的data 中的 key 和 value 都必须是string。
                },
                method: "POST",
                dataType: "json",
                responseType: "text",
                success(res) {
                    Log.l("网络请求成功", res.data, url);
                    resolve(res);
                },
                fail(e) {
                    Log.l("网络请求失败", e,url);
                    reject(e);
                }
            })
        })



    }

}

