import {NumberUtil} from "../../utils/NumberUtil";

export class Orientation {

  static anglePerRadian: number = 180 / Math.PI;


  /**
   * 角度,以3点钟方向为0度
   */
  angle: number;

  /**
   * 弧度,以3点钟方向为0度
   */
  getRadian(): number {
    return NumberUtil.resolved(this.angle / Orientation.anglePerRadian);
  }

  copy(): Orientation {
    return new Orientation(this.angle);
  }

  /**
   * 确保角度在0-360度之内
   */
  normalize() {
    if (0 <= this.angle && this.angle <= 360) {
      return;
    }
    let ang = this.angle % 360;
    if (ang < 0) {
      this.angle = 360 - ang;
    } else {
      this.angle = ang;
    }
  }

  /**
   * 以指定步长转向目标角度
   * @param target 目标角度
   * @param rotateAngleStep 转动的角速度 必须>0
   */
  rotateToTarget(target: Orientation, rotateAngleStep: number) {
    this.normalize();
    target.normalize();
    //还需要移动的偏移量
    let move = target.angle - this.angle;
    //切换到更近的转动方向
    if (move > 180) {
      move -= 360;
    }

    //符号化
    const signifyingAngle = move > 0 ? rotateAngleStep : -rotateAngleStep;
    //单次转动的角度小于偏移量，则只转动指定的角度
    if (rotateAngleStep <= Math.abs(move)) {
      this.angle += signifyingAngle;
    } else {
      //直接设定到目标角度
      this.angle = target.angle;
    }
    this.normalize();
  }

  constructor(angle: number) {
    this.angle = angle;
  }
}
