//是否显示打印
const show = true;

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

