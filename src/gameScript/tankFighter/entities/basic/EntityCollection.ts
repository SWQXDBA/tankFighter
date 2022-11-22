import {Tank} from "../gameEntity/Tank";
import {Position} from "./Position";
import {Orientation} from "./Orientation";
import {NumberUtil} from "../../utils/NumberUtil";
import {Game} from "../../core/Game";

export class EntityCollection{

  game:Game

  constructor(game:Game) {
    this.tanks.push(new Tank(new Position(0,0),new Orientation(0),100,0,game))
    this.game = game
  }
    /**
     * 进行一次逻辑更新
     */
    updateEntities(){
      this.tanks.forEach((tank)=>{
        tank.update()
      })
    }

    /**
     * 更新一次绘制属性 让绘制属性追上逻辑属性
     */
    updateEntitiesDraw(){
      this.tanks.forEach((tank)=>{

        //延迟过大
        if(NumberUtil.resolved(Position.distance(tank.drawPosition,tank.logicPosition))>=tank.maxSpeed*this.game.getGameSpeed()){
          tank.drawPosition = tank.logicPosition.copy()
        }else{
          //当Game.logicFramePerSeconds越小时，
          tank.drawPosition = tank.drawPosition.closeTo(tank.logicPosition,this.game.getGameSpeed()/2)
        }


      })
    }
    tanks:Array<Tank> = new Array<Tank>()
}
