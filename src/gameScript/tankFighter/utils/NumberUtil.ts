export class NumberUtil{
   static resolved(n:number):number{
       return  Math.round(n)
    }
  /**
   * 以特定步长靠近另一个数字
   * @param v 初始数值
   * @param step 步长 是一个非负数
   * @param target 目标数值
   */
 static  closeToNumber(v:number,step:number,target:number):number{
    if(v<target){
      v+=step
      if(v>target){
        v = target
      }
    }else{
      v-=step
      if(v<target){
        v = target
      }
    }
    return v
  }
}
