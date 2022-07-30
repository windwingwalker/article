"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArticleCatalogUploadError = exports.ArticleUploadError = exports.ArticleNotFoundError = exports.ArticleCatalogNotFoundError = void 0;
class MyError extends Error {
    constructor(message, status) {
        super(message);
        // Ensure the name of this error is the same as the class name
        this.name = this.constructor.name;
        // This clips the constructor invocation from the stack trace.
        // It's not absolutely essential, but it does make the stack trace a little nicer.
        //  @see Node.js reference (bottom)
        Error.captureStackTrace(this, this.constructor);
        this.status = status;
    }
}
class ArticleCatalogNotFoundError extends MyError {
    constructor() {
        super(`Article catalog was not found.`, 404);
    }
}
exports.ArticleCatalogNotFoundError = ArticleCatalogNotFoundError;
class ArticleNotFoundError extends MyError {
    constructor(firstPublished) {
        super(`Article ${firstPublished} was not found.`, 404);
    }
}
exports.ArticleNotFoundError = ArticleNotFoundError;
class ArticleUploadError extends MyError {
    constructor(firstPublished) {
        super(`Article ${firstPublished} was failed to upload.`, 500);
    }
}
exports.ArticleUploadError = ArticleUploadError;
class ArticleCatalogUploadError extends MyError {
    constructor() {
        super(`Article catalog was failed to upload.`, 500);
    }
}
exports.ArticleCatalogUploadError = ArticleCatalogUploadError;
//# sourceMappingURL=error.js.map