//字节小玩法API
import {Util} from "../utils/util";
import {Log} from "../utils/Log";

declare var tt: any;
//测试地址
const baseUrl: string = 'https://game-dev.crosscp.com/RD-xuyuan'
//正式地址
/*const baseUrl:string = 'https://xuyuanv2.jwetech.com'*/


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


    //抖音登录,服务器登录成功后切主页面
    public startLogin() {
        let self = this;
        tt.login({
            force: true,
            success(res) {
                Log.l(`login 调用成功${res.code} ${res.anonymousCode}`);
                self.request(urls.login, {openudid: res.code, user_type: 10}, (msg) => {
                    if (parseInt(msg.cmd) == 10000 && msg.iRet == 1) {

                    }
                },false)
            },
            fail(err) {
                Log.l(`login 调用失败`, err);
            },
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
    public ReportActive() {

        let self = this;

        try {
            tt.checkIndividualPlayer({
                complete(checkRes) {

                    Log.l("========checkIndividualPlayer=============", checkRes)

                    let active = 0
                    if (checkRes && checkRes.errCode === 0 && checkRes.IsIndividualPlayer) {
                        active = 1
                    }

                    self.modify(0, active)
                }
            })
        } catch (e) {
            Log.l("========checkIndividualPlayer err=============", e.toString())
            self.modify(0)
        }

    }


    // 用户更新信息
    //获取当前用户基础信息。 -- getLiveUserInfo
    //https://developer.open-douyin.com/docs/resource/zh-CN/mini-app/develop/api/live/tt-get-live-user-info/
    //获取直播间基础信息。 -- getRoomInfo
    //https://developer.open-douyin.com/docs/resource/zh-CN/mini-app/develop/api/live/tt-get-room-info/
    private modify(startMode = 0, active = 0) {
        let params = {};
        let self = this;
        try {
            tt.getLiveUserInfo({
                success: function (res) {
                    Log.l('获取玩家信息', res)
                    params = res.userInfo;
                    tt.getRoomInfo({
                        success: (roomData) => {
                            Log.l("获取房间号成功", roomData);
                            self.room_id = roomData.roomInfo.roomID;
                            params['room_id'] = self.room_id;

                            params["startMode"] = startMode || 0;
                            params["active"] = active
                            delete params['openUID'];


                            Log.l("=========modify params", params);

                            self.request(urls.modify, params)
                        },
                        fail: (res) => {
                            Log.l('获取房间号失败', res);
                        }
                    });
                },
                fail(e) {
                    Log.l('getUserInfo error', e)
                },
            });

        } catch (err) {
            Log.l('modify err', err);
        }


    }




    //获取房间id
    public getRoomId() {

        if (this.room_id) {
            Log.l(this.room_id, '已经有房间号');
            return this.room_id;
        }

        Log.l('未获取room_id');
    }



    //直播间调用抖币支付能力，本文档介绍终端接口定义，详细支付流程可参考支付流程
    //https://microapp.bytedance.com/docs/zh-CN/interaction/develop/api/live/pay-diamonds-v3/
    public payV3(num, tag, orderId, callback: Function) {

        if (!num || !tag || !orderId) return;

        num = Number(num)
        tag = String(tag)
        orderId = String(orderId)

        if (!num || !tag || !orderId) return;

        Log.l(" 支付数量：" + num + " 支付标签：" + tag + " orderId：" + orderId);

        try {
            tt.payDiamondsV3({
                diamonds: num,
                tag: tag,
                orderId,
                success(res) {
                    Log.l("抖币支付成功：", res);

                    callback && callback(res);
                },
                fail(err) {
                    Log.l("抖币支付数据异常：", err);
                },
            });
        } catch (err) {
            Log.l("p_orderid cf", err);
        }

    }

    /**
     * 获取当前加密用户的昵称数据
     * @param src
     * @param fontsize
     * @param color
     * https://microapp.bytedance.com/docs/zh-CN/interaction/develop/api/live/base-user-info/draw-live-open-nick-name
     */
    public get_ou_name(src, fontsize, color) {
        tt.drawOpenNickName({
            src,
            fontsize,
            color,
            success: (res) => {
                Log.l(`宽:${res.width}, 高:${res.height}`);

            },
            fail: (res) => {
                Log.l(`绘制昵称错误，错误码:${res.errCode}`);
            },
        });
    }

    /**
     * 账号多设备登录时唤起重新登录弹窗
     * 显示模态弹窗。用于同步用户重要信息，并要求用户进行确认，或执行特定操作以决策下一步骤。
     * https://developer.open-douyin.com/docs/resource/zh-CN/mini-app/develop/api/interface/interfeedback/tt-show-modal/
     */
    public reLogin() {
        tt.showModal({
            title: "登录提醒",
            content: "当前账号已在其他设备登录，是否重新登录",
            confirmColor: "#000000",
            cancelColor: "#000000",
            success(res) {
                Log.l("用户点击了" + (res.confirm ? "确定" : "取消"));
                if (res.confirm) {
                    Log.l('重新登录')
                    TTPlatform.getInstance().startLogin();
                } else {

                }
            },
            fail(err) {
                Log.l(`showModal 调用失败`, err);
            },
        })
    }

    /**
     * 紧急停服提示
     * @param tip 提示文字
     */
    public toastTip(tip: string) {
        tt.showModal({
            title: "",
            content: tip,
            confirmColor: "#000000",
            cancelColor: "#000000",
            showCancel: false,
            success(res) {
                Log.l("用户点击了" + (res.confirm ? "确定" : "取消"));
            },
            fail(err) {
                Log.l(`showModal 调用失败`, err);
            },
        });
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
    public addToFavorites(callback?: Function) {
        tt.addToFavorites({
            success: (res) => {
                Log.l('收藏成功', res);
                callback && callback(res)
            },
            fail: (err) => {
                Log.l('收藏失败', err);
            }
        })
    }

    //服务器请求
    public request(url: string, params, callback?: Function, showLoading: boolean = true) {
        const default_sign = {
            sign_time: Math.floor(new Date().getTime() / 1000),
            api,
            version,
        }


        let data = {
            ...params,
            user_id,
            sessid,
        }

        let temp = {
            ...default_sign,
            ...data,
            security_key
        }

        let signRet = Util.getSign(temp)

        //拼接参数
        let data2 = {
            ...data,
            ...default_sign,
            sign: signRet,
        }

        if (showLoading) {
            tt.showLoading({
                title: "请求中，请稍后...",
            });
        }

        tt.request({
            url: baseUrl + url,
            data: data2,
            header: {
                "content-type": "application/x-www-form-urlencoded", // 此处指定content-type类型，请确保传入的data 中的 key 和 value 都必须是string。
            },
            method: "POST",
            dataType: "json",
            responseType: "text",
            success(res) {
                Log.l("新接口网络请求成功", res.data, url);

                if (showLoading) {
                    tt.hideLoading({noConflict: true});
                }

                // const data = res.data && res.data.data;


                try {
                    if (parseInt(res.data.cmd) == 10000) {
                        Log.l("记录登录信息");
                        let info = res.data.data
                        user_id = info.user_id
                        sessid = info.sessid
                    }
                } catch (err) {
                    Log.l(err);
                }

                if (parseInt(res.data.iRet) !== 1) {

                    status = {
                        code: res.data.iRet,
                        msg: res.data.sMsg
                    }

                    switch (parseInt(res.data.iRet)) {
                        case -100:
                            //兼容处理多端登录
                            TTPlatform.getInstance().reLogin();
                            return;
                        case -300:
                            //紧急停服
                            TTPlatform.getInstance().toastTip(res.data.sMsg || "网络繁忙");
                            return;
                        default:
                            break;
                    }
                } else {
                    callback && callback(res.data)
                }


            },
            fail(e) {
                if (showLoading) {
                    tt.hideLoading({noConflict: true});
                }
                Log.l("网络请求失败", e,url);
            }
        })

    }

}

export class urls {
    //许愿弹幕 res.data
    public static barrage = "/main/wish/barrage";
    //服务器登录
    public static login = "/main/login/index";
    //自动登录 todo 没用到
    public static auto = "/main/login/auto";
    //更新用户信息
    public static modify = "/main/user/modify";
    //todo 支付预下单  没用到  res.data
    public static pay = "/main/wish/pay";
    //支付预下单 res.data  this
    public static prepay = "/main/wish/prepay";
    //res.data  this
    public static query = "/main/property/query";
    //查询平台订单 res.data
    public static deliver = "/main/wish/deliver";
    //获取盒子信息 res.data  this
    public static box_info = "/main/user/box-info";
    //开盒 res.data  this
    public static open_box = "/main/property/open-box";
    //获取碎片数量需求 res.data
    public static need_tatter = "/main/play/need-tatter";
    //碎片收集玩法 res.data
    public static collect_play = "/main/play/collect-play";
    //许愿记录 res.data
    public static wish_history = "/main/wish/history";
    //中奖记录 res.data
    public static property_history = "/main/property/history";
    //通知后台，今天已经弹了收藏界面 res.data
    public static collect = "/main/wish/collect";
    //领取收藏奖励 res.data  this
    public static collect_award = "/main/play/collect-award";
    //关闭公告版上报 todo 没用到
    public static notice = "/main/play/notice";
    //查询是否展示碎片已满提示气泡 res.data
    public static collect_tips = "/main/play/collect-tips";
    //为我许愿 todo 没用到 res.data
    public static author_wish_sort = "/main/wish/anchor-wish-sort";
    //错误上报 todo 没用到
    public static error_report = "/main/data/report";
}