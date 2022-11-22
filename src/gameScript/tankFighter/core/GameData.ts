export class GameData {

  gameId: number|undefined

  /**
   * 游戏开始时的时间戳
   */
  basicTimeStamp: number = Date.now();
  currentFrame: number = 0;

  /**
   * 自游戏开始已经度过的时间戳
   */
  getPassedTimeStamp(): number {
    return Date.now() - this.basicTimeStamp;
  }
}


