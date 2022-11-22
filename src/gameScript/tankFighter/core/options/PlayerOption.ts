import {KeyBoardState} from "../KeyBoardState";

export class PlayerOption {
  hasChange: boolean;
  keyBoardState: KeyBoardState;
  gameOver:Boolean;


  constructor(hasChange: boolean, keyBoardState: KeyBoardState, gameOver: Boolean) {
    this.hasChange = hasChange;
    this.keyBoardState = keyBoardState;
    this.gameOver = gameOver;
  }
}
