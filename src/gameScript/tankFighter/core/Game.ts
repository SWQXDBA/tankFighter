import {GameData} from "./GameData";
import {FrameOption} from "./options/FrameOption";

import {PlayerOption} from "./options/PlayerOption";
import {KeyboardType} from "./Enums";
import {Utils} from "../utils/Utils";
import {EntityCollection} from "../entities/basic/EntityCollection";
import {KeyBoardState} from "./KeyBoardState";
import {NumberUtil} from "../utils/NumberUtil";

export class Game {
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
   * frameOptions中下标为0的元素代表的帧的实际帧号
   */
  firstFrameOptionId: number = 0;

  /**
   * 用来存储同步帧,假设syncFrameInterval=0 那么syncFrameOptions[0].id = 0,syncFrameOptions[1].id = 3 以此类推
   */
  syncFrameOptions: Array<FrameOption> = new Array<FrameOption>();

  /**
   * 下一次触发更新的时间戳
   */
  nextLogicFrameUpdateTime: number = 0;

  entityCollection: EntityCollection = new EntityCollection(this);

  /**
   * 收集的玩家操作，用于发送下一个同步帧
   */
  nextSyncOption: PlayerOption|undefined

  keyBoardState: KeyBoardState = new KeyBoardState();

  /**
   * 当前同步帧中，玩家是否有操作变化
   */
  hasChange:boolean = false
  testAction:(x:number,y:number,x2:number,y2:number)=>void

  constructor(serverSocketUrl: string,action:(x:number,y:number,x2:number,y2:number)=>void) {
    this.serverSocketUrl = serverSocketUrl;
    this.testAction = action
  }

  async start() {
    console.log("game started");
    //  this.connectToServer();
    this.listenFromServer();
    this.registerKeyListener();
    await this.startLoops();
    setInterval(()=>{
      console.log(this.gameData.currentFrame,this.drawFrame)
    },1000)
  }

  connectToServer() {
    this.connection = new WebSocket(this.serverSocketUrl);
  }

  registerKeyListener() {
    document.addEventListener("keydown", (evt: KeyboardEvent) => {
      this.handlePlayerOption(KeyboardType.KEYDOWN, evt);
    });

    document.addEventListener("keyup", (evt: KeyboardEvent) => {
      this.handlePlayerOption(KeyboardType.KEYUP, evt);
    });
  }

  listenFromServer() {

  }

  sendSyncFrameOptionToServer() {
    let option = new PlayerOption(this.hasChange,this.keyBoardState)
    let testId = this.gameData.currentFrame;
    while (!this.isSyncFrame(testId)) {
      testId++;
    }
    const nextSyncFrameId = testId;

    this.hasChange = false

    //mock
    let o = new FrameOption();
    o.options.set(0, option);

    let firstId = this.firstFrameOptionId;
    let index = (nextSyncFrameId - firstId) / this.syncFrameInterval;

    if (this.syncFrameOptions.length === index) {
      this.syncFrameOptions.push(o);
    }


  }

  /**
   * 启动循环
   */
  async startLoops() {
    await this.logicLoop();
    this.drawLoop();
  }

  logicLoop = async () => {
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

  drawLoop = () => {
    this.entityCollection.updateEntitiesDraw();
    this.draw();
    window.requestAnimationFrame(this.drawLoop);
  };

  drawFrame:number = 0
  draw() {
    this.drawFrame++
    const tank = this.entityCollection.tanks[0];
    this.testAction(tank.drawPosition.x,tank.drawPosition.y,tank.logicPosition.x,tank.logicPosition.y)
  }

  updateLogic() {

    this.entityCollection.updateEntities();

  }

  isSyncFrame(frameId: number): boolean {
    return (frameId % this.syncFrameInterval) == 0;
  }

  async getSyncFrameOption(syncFrameId: number): Promise<FrameOption> {

    while (true) {
      await Utils.sleep(5);

      let firstId = this.firstFrameOptionId;
      let index = (syncFrameId - firstId) / this.syncFrameInterval;
      if (this.syncFrameOptions.length - 1 >= index) {

        return this.syncFrameOptions[index];
      }
    }

  }


  shouldUpdateLogic(): boolean {
    return this.nextLogicFrameUpdateTime <= this.gameData.getPassedTimeStamp();
  }

  logicFrameInterval(): number {
    return NumberUtil.resolved(1000 / this.logicFramePerSeconds);
  }

  /**
   * 进行同步帧操作
   */
  async doSyncFrameOptions() {

    this.sendSyncFrameOptionToServer();
    const frameOption = await this.getSyncFrameOption(this.gameData.currentFrame);
    const playerOption = frameOption.options.get(0);


    const tank = this.entityCollection.tanks[0];
    tank.playerKeyBoardState = playerOption!.keyBoardState




  }

  handlePlayerOption(type: KeyboardType, evt: KeyboardEvent) {


    let changed = false

    if (type == KeyboardType.KEYDOWN) {
      switch (evt.key){
        case 'a':
          if(!this.keyBoardState.aPress){
            changed = true
            this.keyBoardState.aPress = true
          }
          break
        case 's':
          if(!this.keyBoardState.sPress){
            changed = true
            this.keyBoardState.sPress = true
          }
          break
        case 'd':
          if(!this.keyBoardState.dPress){
            changed = true
            this.keyBoardState.dPress = true
          }
          break
        case 'w':
          if(!this.keyBoardState.wPress){
            changed = true
            this.keyBoardState.wPress = true
          }
          break
      }

    } else {
      switch (evt.key){
        case 'a':
          if(this.keyBoardState.aPress){
            changed = true
            this.keyBoardState.aPress = false
          }
          break
        case 's':
          if(this.keyBoardState.sPress){
            changed = true
            this.keyBoardState.sPress = false
          }
          break
        case 'd':
          if(this.keyBoardState.dPress){
            changed = true
            this.keyBoardState.dPress = false
          }
          break
        case 'w':
          if(this.keyBoardState.wPress){
            changed = true
            this.keyBoardState.wPress = false
          }
          break
      }

    }
    this.hasChange = changed




  }
   getGameSpeed():number{
    return this.logicFramePerSeconds
  }

}
