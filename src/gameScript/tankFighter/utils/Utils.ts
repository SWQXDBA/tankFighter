export class Utils{
    static async  sleep(mills:number):Promise<void>{
        return new Promise((resolve => {
            setTimeout(resolve,mills)
        }))
    }
}