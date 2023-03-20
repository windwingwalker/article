export default class HTTPResponse{
  statusCode: number;
  body: string;
  headers: object = {'Content-type': 'application/json'}

  constructor(statusCode: number, body: object | string){
    this.statusCode = statusCode;
    this.body = JSON.stringify(body);
  }
}