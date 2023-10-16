import { _decorator, Component, Node } from 'cc';
import {FSMManager} from "./FSMManager";

export class FSMState {
    //状态id
    StateId:number;
    //状态拥有者
    component:Component;
    //所属状态机
    fsmManager:FSMManager;

    constructor(stateId:number,component:Component,fsmManager:FSMManager) {
        this.StateId = stateId;
        this.component = component;
        this.fsmManager = fsmManager;
    }

    //进入状态
    OnEnter(){

    }

    //状态更新中
    OnUpdate(){

    }
}

