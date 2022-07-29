class MyError extends Error {
  status: number;
  
  constructor(message, status: number) {
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

export class ArticleCatalogNotFoundError extends MyError{
  constructor() {
    super(`Article catalog was not found.`, 404);
  }
}

export class ArticleNotFoundError extends MyError{
  constructor(firstPublished) {
    super(`Article ${firstPublished} was not found.`, 404);
  }
}

export class ArticleUploadError extends MyError{
  constructor(firstPublished) {
    super(`Article ${firstPublished} was failed to upload.`, 500);
  }
}

export class ArticleCatalogUploadError extends MyError{
  constructor() {
    super(`Article catalog was failed to upload.`, 500);
  }
}