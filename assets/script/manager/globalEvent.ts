import {EventTarget} from "cc";

export const global = new EventTarget();

//全局事件派发
export class GlobalEvent {
    private static _instance: GlobalEvent = null;

    public static getInstance(): GlobalEvent {
        if (!this._instance) {
            this._instance = new GlobalEvent();
        }
        return this._instance;
    }

    private static _eventTarget: EventTarget = new EventTarget();

    public static on(type: string, callback, target: any) {
        this._eventTarget.on(type, callback, target);
    }

    public static off(type: string, callback, target: any) {
        this._eventTarget.off(type, callback, target);
    }

    public static emit(type: string, arg1?: any, arg2?: any, arg3?: any, arg4?: any, arg5?: any) {
        this._eventTarget.emit(type, arg1, arg2, arg3, arg4, arg5);
    }

    //这个函数无法删除当前 EventTarget 的所有事件监听器，也无法删除 target 参数所注册的所有事件监听器。
    //这个函数只能删除 target 参数在当前 EventTarget 上注册的所有事件监听器。

    public static removeAll(target) {
        this._eventTarget.targetOff(target);
    }
}


