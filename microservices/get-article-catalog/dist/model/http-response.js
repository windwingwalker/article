"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTTPResponse = void 0;
class HTTPResponse {
    constructor(statusCode, body) {
        this.headers = { 'Content-type': 'application/json' };
        this.statusCode = statusCode;
        this.body = body;
    }
}
exports.HTTPResponse = HTTPResponse;
//# sourceMappingURL=http-response.js.map