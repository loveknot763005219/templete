import {__private, sys} from "cc";


export function modal(content: string, yes: string, no: string = null) {
    return new Promise((resolve, reject) => {
        if (sys.platform === __private._pal_system_info_enum_type_platform__Platform.DESKTOP_BROWSER) {
        // if (cc.sys.platform === cc.sys.Platform.DESKTOP_BROWSER) {

            if (no) {
                let result = window.confirm(content);
                resolve(result);
            } else {
                window.alert(content);
                resolve(true);
            }
        } else if (sys.platform === __private._pal_system_info_enum_type_platform__Platform.WECHAT_GAME) {
            let showCancel: boolean = false;
            if (no) {
                showCancel = true;
            }
            window["wx"].showModal({
                title: "提示",
                content: content,
                showCancel: showCancel,
                success(res) {
                    if (res.confirm) {
                        console.log("用户点击确定");
                        resolve(true);
                    } else if (res.cancel) {
                        console.log("用户点击取消");
                        resolve(false);
                    }
                },
            });
        } else {
            console.error("没实现的模态框", sys[sys.platform], sys.platform);
            // resolve(true);
        }
    });
}
