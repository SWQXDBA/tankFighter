import {Routes} from "@angular/router";
import {GameComponent} from "../game/game.component";
import {AppComponent} from "./app.component";


export const appRoutes: Routes = [
  {
    path: "game",
    component: GameComponent
  },
  {
    path: "home",
    component: AppComponent
  }
  ,
  {
    path: "",
    pathMatch: "full",
    redirectTo: "home"
  }
  ,
  {
    path: "**",
    redirectTo: "home"
  }
];
