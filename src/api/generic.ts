import Any = jasmine.Any;

export class AjaxResult<T> {
  code: number;
  msg: string | undefined;
  data: T | undefined;


  constructor(code: number) {
    this.code = code;
  }
}

export const doGet: (url: string) => Promise<AjaxResult<any>> = (url: string) => {
  return fetch(url).then(t => t.json());
};
export const doPost: (url: string, params: Any) => Promise<AjaxResult<any>> = (url: string, params: Object) => {
  const param = new URLSearchParams();
  const params1 = params as Map<any, any>;
  params1.forEach((k,v)=>{
    param.append(k, v);
  })

  return fetch(url, {
    method: "POST",
    body: param
  }).then(t => t.json());
};
