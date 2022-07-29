export class HTTPResponse{
  statusCode: number;
  body: string;
  headers: object = {'Content-type': 'application/json'}

  constructor(statusCode: number, body: string){
    this.statusCode = statusCode;
    this.body = body;
  }
}