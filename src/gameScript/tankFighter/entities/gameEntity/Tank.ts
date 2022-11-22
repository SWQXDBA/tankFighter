import {AbstractEntity} from "../basic/AbstractEntity";
import {Orientation} from "../basic/Orientation";
import {CoordinatesUtil} from "../../utils/CoordinatesUtil";
import {Position} from "../basic/Position";
import {KeyBoardState} from "../../core/KeyBoardState";
import {NumberUtil} from "../../utils/NumberUtil";
import {Game} from "../../core/Game";

export class Tank extends AbstractEntity {
  /**
   * hit point
   */
  hp: number;

  /**
   * 所属玩家id
   */
  ownerId: number;

  /**
   * 移动速度X轴 当每秒逻辑帧为30时，每一个逻辑帧移动的像素点个数
   */
  speedX: number = 0;

  /**
   * 移动速度Y轴 当每秒逻辑帧为30时，每一个逻辑帧移动的像素点个数。详见move()
   */
  speedY: number = 0;

  /**
   * 最大速度
   */
  maxSpeed: number = 16;

  /**
   * 加速度 每一帧中变化的速度值 用于加速或者减速
   */
  accelerationOfSpeed: number = 4;

  /**
   * 旋转速度 单位为角度
   */
  rotateAngleSpeed: number = 10;

  playerKeyBoardState:KeyBoardState = new KeyBoardState()

  game:Game
  constructor(logicPosition: Position, logicOrientation: Orientation, hp: number, ownerId: number,game:Game) {
    super(logicPosition, logicOrientation);
    this.hp = hp;
    this.ownerId = ownerId;
    this.game = game
  }

  override update() {
    super.update();
    this.changeSpeed()
    this.move();

  }

  move() {
    if (this.speedX === 0&&this.speedY===0) {
      return;
    }
    this.logicPosition = CoordinatesUtil.moveBySpeed(this.logicPosition, this.speedX*30/this.game.getGameSpeed(), this.speedY*30/this.game.getGameSpeed());
  }
  changeSpeed(){
    let spdx:number

    const modify = 3
    /**
     * 这里/modify是为了加强速度抑制器手感，如果想快速减速，应该按反方向键急停
     */
    if(this.playerKeyBoardState.aPress==this.playerKeyBoardState.dPress){
      spdx = NumberUtil.closeToNumber(this.speedX,this.accelerationOfSpeed/modify,0)
    }else{
      //向右加速
      if(this.playerKeyBoardState.dPress){
        spdx = NumberUtil.closeToNumber(this.speedX , this.accelerationOfSpeed,this.maxSpeed)

        //向左加速
      }else{
        spdx = NumberUtil.closeToNumber(this.speedX , this.accelerationOfSpeed, -this.maxSpeed)
      }
    }


    let spdy:number
    if(this.playerKeyBoardState.wPress==this.playerKeyBoardState.sPress){
      spdy = NumberUtil.closeToNumber(this.speedY,this.accelerationOfSpeed/modify,0)
    }else{
      //向上加速
      if(this.playerKeyBoardState.wPress){
        spdy = NumberUtil.closeToNumber(this.speedY , this.accelerationOfSpeed,-this.maxSpeed)

        //向下加速
      }else{
        spdy = NumberUtil.closeToNumber(this.speedY , this.accelerationOfSpeed, this.maxSpeed)
      }
    }



    //保证斜向速度看起来正常
    const speedXY = Math.sqrt(spdx*spdx+spdy*spdy)
    if (this.maxSpeed<speedXY) {
      const reducePercent = (speedXY-this.maxSpeed)/this.maxSpeed
      spdx*=(1-reducePercent)
      spdy*=(1-reducePercent)
    }
    this.speedX = NumberUtil.resolved(spdx)
    this.speedY = NumberUtil.resolved(spdy)
  }



}
