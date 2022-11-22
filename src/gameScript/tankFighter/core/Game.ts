import {GameData} from "./GameData";
import {SyncFrame} from "./options/SyncFrame";

import {PlayerOption} from "./options/PlayerOption";
import {KeyboardType} from "./Enums";
import {Utils} from "../utils/Utils";
import {EntityCollection} from "../entities/basic/EntityCollection";
import {KeyBoardState} from "./KeyBoardState";
import {NumberUtil} from "../utils/NumberUtil";
import {
  ClientFrameMessage,
  ClientMessageJsonBox,
  ClientMessageType,
  GameInitMessage,
  InitMessage,
  ServerMessageJsonBox,
  ServerMessageType,
  SyncFrameMessage
} from "./Messages";

export class Game {

  playerId: number | undefined;

  gameId: number;

  connection: WebSocket | undefined;

  serverSocketUrl: string;

  gameData: GameData = new GameData();

  /**
   * 每秒有多少逻辑帧
   */
  logicFramePerSeconds = 30;

  /**
   * 每多少个逻辑帧是一个同步帧
   */
  syncFrameInterval = 3;


  /**
   * 用来存储同步帧,假设syncFrameInterval=0 那么syncFrameOptions[0].id = 0,syncFrameOptions[1].id = 3 以此类推
   */
  syncFrameOptions: Array<SyncFrame> = new Array<SyncFrame>();

  /**
   * 下一次触发更新的时间戳
   */
  nextLogicFrameUpdateTime: number = 0;

  entityCollection: EntityCollection = new EntityCollection(this);

  /**
   * 收集的玩家操作，用于发送下一个同步帧
   */
  nextSyncOption: PlayerOption | undefined;

  keyBoardState: KeyBoardState = new KeyBoardState();

  isGameOver = false;

  /**
   * 当前同步帧中，玩家是否有操作变化
   */
  hasChange: boolean = false;
  testAction: (x: number, y: number, x2: number, y2: number) => void;

  constructor(serverSocketUrl: string, gameId: number, action: (x: number, y: number, x2: number, y2: number) => void) {
    this.serverSocketUrl = serverSocketUrl;
    this.testAction = action;
    this.gameId = gameId;
  }

  async start() {
    console.log("game started");
    this.connectToServer();
    this.listenFromServer();
    this.registerKeyboardListener();
    await this.startLoops();
    setInterval(() => {
      console.log(this.gameData.currentFrame, this.drawFrame);
    }, 1000);
  }

  private connectToServer() {
    this.connection = new WebSocket(this.serverSocketUrl);
  }

  private registerKeyboardListener() {
    document.addEventListener("keydown", (evt: KeyboardEvent) => {
      this.handlePlayerOption(KeyboardType.KEYDOWN, evt);
    });

    document.addEventListener("keyup", (evt: KeyboardEvent) => {
      this.handlePlayerOption(KeyboardType.KEYUP, evt);
    });
  }

  private listenFromServer() {
    const conn = this.connection;
    if (conn != null) {
      conn.onopen = (e: Event) => {
        this.sendInitMessage();
      };
      conn.onmessage = (s) => {
        this.handlerServerMessage(s.data);
      };
    }
  }

  private handlerServerMessage(serverMessage: ServerMessageJsonBox) {
    if (serverMessage.messageType == ServerMessageType.GAME_INIT) {

      const gameInitMessage = JSON.parse(serverMessage.contextJson!) as GameInitMessage;
      this.playerId = gameInitMessage.playerId;

    } else if (serverMessage.messageType == ServerMessageType.SYNC_FRAME) {

      const syncMessage = JSON.parse(serverMessage.contextJson!) as SyncFrameMessage;
      this.putSyncFrame(syncMessage.frame!);

    }
  }

  private sendInitMessage() {
    const initMessage = new InitMessage();
    initMessage.gameId = this.gameId;

    const box = new ClientMessageJsonBox();
    box.messageType = ClientMessageType.CLIENT_INIT;
    box.contextJson = JSON.stringify(initMessage);

    this.connection?.send(JSON.stringify(box));
  }

  private sendSyncFrameOptionToServer() {

    const msg = new ClientFrameMessage();
    msg.gameId = this.gameId;
    msg.frameIndex = this.gameData.currentFrame;
    msg.option = new PlayerOption(this.hasChange, this.keyBoardState, this.isGameOver);


    const box = new ClientMessageJsonBox();
    box.messageType = ClientMessageType.SYNC_FRAME;
    box.contextJson = JSON.stringify(msg);

    this.connection?.send(JSON.stringify(box));

    this.hasChange = false;


  }

  /**
   * 启动循环
   */
  private async startLoops() {
    await this.logicLoop();
    this.drawLoop();
  }

  private logicLoop = async () => {
    if (this.shouldUpdateLogic()) {
      this.nextLogicFrameUpdateTime += this.logicFrameInterval();
      if (this.isSyncFrame(this.gameData.currentFrame)) {
        await this.doSyncFrameOptions();
      }
      this.updateLogic();
      this.gameData.currentFrame++;
    }

    const waitTime = this.nextLogicFrameUpdateTime - this.gameData.getPassedTimeStamp();

    /**
     * 最少间隔10ms 释放时间片
     */
    setTimeout(this.logicLoop, waitTime <= 0 ? 1 : waitTime);
  };

  private drawLoop = () => {
    this.entityCollection.updateEntitiesDraw();
    this.draw();
    window.requestAnimationFrame(this.drawLoop);
  };

  drawFrame: number = 0;

  private draw() {
    this.drawFrame++;
    const tank = this.entityCollection.tanks[0];
    this.testAction(tank.drawPosition.x, tank.drawPosition.y, tank.logicPosition.x, tank.logicPosition.y);
  }

  private updateLogic() {

    this.entityCollection.updateEntities();

  }

  private isSyncFrame(frameId: number): boolean {
    return (frameId % this.syncFrameInterval) == 0;
  }

  /**
   * 获取下一个同步帧
   * @param syncFrameId
   * @private
   */
  private async fullWaitSyncFrameOption(syncFrameId: number): Promise<SyncFrame> {

    let tryCount = 0;
    while (true) {
      let index = this.getIndexOfSyncFrameArray(syncFrameId);
      if (this.syncFrameOptions.length - 1 >= index) {
        return this.syncFrameOptions[index];
      }

      //可能认为是自己的同步帧没有发送成功 再发送一次
      if (tryCount % 10 == 0) {
        this.sendSyncFrameOptionToServer();
      }
      tryCount++;
      await Utils.sleep(5);
    }

  }

  private getIndexOfSyncFrameArray(syncFrameIndex: number): number {

    return (syncFrameIndex - this.firstFrameOptionId()) / this.syncFrameInterval;
  }

  private putSyncFrame(f: SyncFrame) {
    const index = this.getIndexOfSyncFrameArray(f.frameIndex!!);
    this.syncFrameOptions[index] = f;
  }

  private shouldUpdateLogic(): boolean {
    return this.nextLogicFrameUpdateTime <= this.gameData.getPassedTimeStamp();
  }

  private logicFrameInterval(): number {
    return NumberUtil.resolved(1000 / this.logicFramePerSeconds);
  }

  /**
   * 进行同步帧操作
   */
  private async doSyncFrameOptions() {

    this.sendSyncFrameOptionToServer();
    const syncFrame = await this.fullWaitSyncFrameOption(this.gameData.currentFrame);

    this.entityCollection.updateEntitiesControl(syncFrame.options);

    /**
     * 滑动接收窗口
     */
    while (this.firstFrameOptionId() < syncFrame.frameIndex!) {
      this.syncFrameOptions.shift();
    }


  }

  private firstFrameOptionId(): number {
    return this.syncFrameOptions[0]!.frameIndex!;
  }

  private handlePlayerOption(type: KeyboardType, evt: KeyboardEvent) {


    let changed = false;

    if (type == KeyboardType.KEYDOWN) {
      switch (evt.key) {
        case "a":
          if (!this.keyBoardState.aPress) {
            changed = true;
            this.keyBoardState.aPress = true;
          }
          break;
        case "s":
          if (!this.keyBoardState.sPress) {
            changed = true;
            this.keyBoardState.sPress = true;
          }
          break;
        case "d":
          if (!this.keyBoardState.dPress) {
            changed = true;
            this.keyBoardState.dPress = true;
          }
          break;
        case "w":
          if (!this.keyBoardState.wPress) {
            changed = true;
            this.keyBoardState.wPress = true;
          }
          break;
      }

    } else {
      switch (evt.key) {
        case "a":
          if (this.keyBoardState.aPress) {
            changed = true;
            this.keyBoardState.aPress = false;
          }
          break;
        case "s":
          if (this.keyBoardState.sPress) {
            changed = true;
            this.keyBoardState.sPress = false;
          }
          break;
        case "d":
          if (this.keyBoardState.dPress) {
            changed = true;
            this.keyBoardState.dPress = false;
          }
          break;
        case "w":
          if (this.keyBoardState.wPress) {
            changed = true;
            this.keyBoardState.wPress = false;
          }
          break;
      }

    }
    this.hasChange = changed;


  }

  getGameSpeed(): number {
    return this.logicFramePerSeconds;
  }

}
