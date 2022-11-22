import {Component} from "@angular/core";
import {Game} from "../../gameScript/tankFighter/core/Game";



@Component({
  selector: 'app-root',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent {
  changeXY = (x:number,y:number,x2:number,y2:number)=>{
    if(x!=this.blockX){
      this.blockX = x;
    }

    if(y!=this.blockY){
      this.blockY = y
    }

    if(x2!=this.blockX2){
      this.blockX2 = x2;
    }

    if(y2!=this.blockY2){
      this.blockY2 = y2
    }
  }

  constructor() {

  }
  blockX = 0
  blockY = 0
  getX = ():string=>{
    return this.blockX+'px'
  }
  getY = ():string=>{
    return this.blockY+'px'
  }

  blockX2 = 0
  blockY2 = 0
  getX2 = ():string=>{
    return this.blockX2+'px'
  }
  getY2 = ():string=>{
    return this.blockY2+'px'
  }
  title = 'untitled1';
}
