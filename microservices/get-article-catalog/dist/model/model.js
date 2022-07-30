"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Article = exports.PlainArticle = void 0;
class PlainArticle {
}
exports.PlainArticle = PlainArticle;
class Article {
    constructor(data) {
        this.firstPublished = data["firstPublished"] ? data["firstPublished"] : Date.now();
        this.lastModified = Date.now();
        this.title = data["title"];
        this.subtitle = data["subtitle"];
        this.type = data["type"];
        this.edition = 1;
        this.views = 0;
        this.series = data["series"];
        this.tags = data["tags"];
        this.body = data["body"];
    }
}
exports.Article = Article;
//# sourceMappingURL=model.js.map