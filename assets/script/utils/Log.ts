
// 0测试服 1正式服 2预发布服
const SERVER_MODE:number = 0;

//是否显示打印
let show = true;
show = SERVER_MODE === 0

export class Log {
    public static debug(message?: any, ...optionalParams: any[]){
        if(!show)return;
        console.log(message, ...optionalParams);
    }

    public static warn(message?: any, ...optionalParams: any[]){
        if(!show)return;
        console.warn(message, ...optionalParams);
    }

    public static error(message?: any, ...optionalParams: any[]){
        if(!show)return;
        console.error(message, ...optionalParams);


    }
}

