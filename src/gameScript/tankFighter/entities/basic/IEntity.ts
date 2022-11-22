export interface IEntity{
    /**
     * 当初始化后调用
     */
    init():void

    /**
     * 于每次逻辑帧中更新
     */
    update():void

    /**
     * 删除前调用
     */
    beforeRemove():void
}