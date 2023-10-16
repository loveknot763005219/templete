import { _decorator, Component, Node } from 'cc';
import {FSMState} from "./FSMState";

export class FSMManager {
    //状态列表
    StateList:FSMState[] = [];
    //当前状态id
    CurrentIndex:number = -1;

    //改变状态
    ChangeState(StateId:number){
        this.CurrentIndex = StateId;
        this.StateList[this.CurrentIndex].OnEnter();
    }

    //更新调用
    OnUpdate(){
        if(this.CurrentIndex != -1){
            this.StateList[this.CurrentIndex].OnUpdate();
        }
    }

}

