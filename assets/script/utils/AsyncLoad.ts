import { modal } from "./modal";
import * as cc from "cc";
import {assetManager} from "cc";
import {Log} from "./log";

/**
     * 加载bundle
     * @param name bundle名
     * @param forceRetry
     * @param retryCounter
     * @returns
     */
export async function loadBundle(name: string, forceRetry = true, retryCounter = new RetryCounter()): Promise<cc.AssetManager.Bundle> {
    try {
        let res = getBundle(name);
        if (!res) {
            res = await _loadBundle(name);
        }
        return res;
    } catch (e) {
        Log.error("加载bundle失败", name, e);
        if (retryCounter.restTime) {
            retryCounter.restTime--;
            await waitSysTime(retryCounter.retryInterval);
            return await loadBundle(name, forceRetry, retryCounter);
        } else if (forceRetry) {
            await modal("资源加载失败，点击可重试", "重试");
            return await loadBundle(name, forceRetry, retryCounter);
        } else {
            return null;
        }
    }
}

/**
     * 获取加载好的bundle
     * @param name bundle名
     * @returns
     */
export function getBundle(name: string) {
    return assetManager.getBundle(name);
}

function _loadBundle(name: string): Promise<cc.AssetManager.Bundle> {
    return new Promise((resolve, reject) => {
        assetManager.loadBundle(name, (err, bundle: cc.AssetManager.Bundle) => {
            if (err) {
                reject(err);
                return;
            }

            resolve(bundle);
        });
    });
}

export class RetryCounter {
    restTime = 2; //重试次数 2 次
    retryInterval = 3; //重试间隔 3 秒
}

/**
 * 等待系统时间
 * @param seconds
 * @returns
 */
export function waitSysTime(seconds: number): Promise<void> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, seconds * 1000);
    });
}