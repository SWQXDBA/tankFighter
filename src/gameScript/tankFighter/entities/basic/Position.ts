/**
 * 表示一个坐标，以向右为x轴正方向，向下为y轴正方向
 */
import {NumberUtil} from "../../utils/NumberUtil";

export class Position {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  copy(): Position {
    return new Position(this.x, this.y);
  }

  /**
   * 靠近另一个坐标，一般用于draw时追赶logicPosition
   *
   * @param target 另一个坐标
   * @param percent 移动的百分比 100则return other
   */
  closeTo(target: Position, percent: number): Position {

    if (percent >= 100) {
      return new Position(
        target.x, target.y
      );
    }

    if (Position.distance(target, this) < 10) {
      percent *= 2;
    }
    if (Position.distance(target, this) < 5) {
      return new Position(
        target.x, target.y
      );
    }
    let newX: number;
    let newY: number;


    //保证最少移动1帧
    let xMove = (target.x - this.x) * percent / 100
    if (xMove < 1&&xMove>0) {
      xMove = 1;
    }
    if (xMove >-1&&xMove<0) {
      xMove = -1;
    }
    let yMove = (target.y - this.y) * percent / 100
    if (yMove < 1&&yMove>0) {
      yMove = 1;
    }
    if (yMove >-1&&yMove<0) {
      yMove = -1;
    }
    newX = this.x + xMove;
    newY = this.y + yMove;



    //直接移动到目标地点
    if (Math.abs(this.x - target.x) <= 2) {
      newX = target.x;
    }

    if (Math.abs(this.y - target.y)<= 2) {
      newY = target.y;
    }
    return new Position(
      NumberUtil.resolved(newX),  NumberUtil.resolved(newY)
    );
  }

  static distance(one: Position, other: Position): number {
    return Math.sqrt(
      Math.pow((other.y - one.y), 2) +
      Math.pow((other.x - one.x), 2)
    );
  }
}
