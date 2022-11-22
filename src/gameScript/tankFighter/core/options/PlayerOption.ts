import {KeyBoardState} from "../KeyBoardState";

export class PlayerOption{
  hasChange:boolean
    keyBoardState:KeyBoardState

    constructor(hasChange:boolean,keyBoardState: KeyBoardState) {
        this.keyBoardState = keyBoardState;
        this.hasChange = hasChange
    }
}
