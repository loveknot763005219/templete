//是否显示打印
const show = true;

export class Log {
    public static l(message?: any, ...optionalParams: any[]){
        if(!show)return;
        console.log(message, ...optionalParams);
    }

    public static w(message?: any, ...optionalParams: any[]){
        if(!show)return;
        console.warn(message, ...optionalParams);
    }

    public static e(message?: any, ...optionalParams: any[]){
        if(!show)return;
        console.error(message, ...optionalParams);
    }
}

