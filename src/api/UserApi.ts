import {Urls} from "./ApiUrl";
import {AjaxResult, fetchToJson} from "./generic";

export class LoginReq {
  username: string;
  password: string;

  constructor(username: string, password: string) {
    this.username = username;
    this.password = password;
  }
}

export class RegisterReq {
  username: string;
  password: string;

  constructor(username: string, password: string) {
    this.username = username;
    this.password = password;
  }
}

export const Login: (req: LoginReq) => Promise<AjaxResult<boolean>> = (req: LoginReq) => {
  return fetchToJson(Urls.login).then(r=>{
    return r as AjaxResult<boolean>
  })
}

