import {Position} from "./Position";
import {IEntity} from "./IEntity";
import {Orientation} from "./Orientation";


export abstract class AbstractEntity implements IEntity{
    /**
     * 逻辑位置
     */
    logicPosition:Position

    /**
     * 绘制的位置，需要不断追上逻辑位置
     */
    drawPosition:Position

    /**
     * 逻辑朝向
     */
    logicOrientation:Orientation


    /**
     * 绘制朝向需要不断追上逻辑朝向
     */
    drawOrientation:Orientation


    constructor(logicPosition: Position, logicOrientation: Orientation) {
        this.logicPosition = logicPosition.copy();
        this.drawPosition = logicPosition.copy();
        this.logicOrientation = logicOrientation.copy();
        this.drawOrientation = logicOrientation.copy()


    }

    beforeRemove(): void{}

     init(): void{}

     update(): void{}


}
