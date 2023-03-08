/**
 * 等待 x 秒，
 * @param seconds 秒数，0代表下一帧
 * @param caller 用哪个组件调用 schedule，默认使用 canvas
 * @returns
 */
import * as cc from "cc";
import {Canvas, Component, utils,find} from "cc";


export function asyncWaitSeconds(seconds: number, caller?: Component): Promise<void> {
    return new Promise((resolve) => {
        let curCaller = caller || find('Canvas').getComponent(Canvas);
        curCaller.scheduleOnce(() => {
            resolve();
        }, seconds);
    });
}

/**
 * 等待 cc.Animation 动画播完
 * @param anim
 * @param clipName
 * @returns
 */
export function asyncWaitPlayAnim(anim: cc.Animation, clipName: string = null): Promise<void> {
    return new Promise((resolve) => {
        anim.play(clipName);
        anim.once(cc.Animation.EventType.FINISHED, function () {
            resolve();
        });
    });

}
