import {Position} from "../entities/basic/Position";
import {Orientation} from "../entities/basic/Orientation";
import {NumberUtil} from "./NumberUtil";

export class CoordinatesUtil {
  /**
   * 从坐标开始，往一个方向移动指定距离，返回移动后的坐标
   * @param position 原始坐标点
   * @param orientation 目标方向角
   * @param step 移动的步长
   */
  static move(position: Position, orientation: Orientation, step: number): Position {

    //这个x和y还指的是普通的坐标轴(向右为x正方向，向上为y正方向)
    let xMove = Math.cos(orientation.getRadian()) * step;
    xMove = NumberUtil.resolved(xMove);

    let yMove = Math.sin(orientation.getRadian()) * step;
    yMove = NumberUtil.resolved(yMove);

    //现在要转换成游戏内的坐标轴(以向右为x轴正方向，向下为y轴正方向)
    yMove = -yMove;

    return new Position(position.x + xMove, position.y + yMove);
  }

  /**
   * 从坐标开始移动
   * @param position 原始坐标点
   * @param speedX
   * @param speedY
   */
  static moveBySpeed(position: Position, speedX: number, speedY: number): Position {
    return new Position(position.x + speedX, position.y + speedY);
  }


  /**
   * 确保在0-360度之内
   * @param orientation
   */
  static copyNormalizedOrientation(orientation: Orientation): Orientation {
    const orientation1 = new Orientation(orientation.angle);
    orientation1.normalize();
    return orientation1;
  }
}
