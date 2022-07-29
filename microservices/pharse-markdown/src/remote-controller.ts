import { HTTPResponse } from "../../../model/http-response"
import { PlainArticle } from "../../../model/model";
import pharseMarkdown from './utils'
// import { ArticleNotFoundError } from "./error";

exports.lambdaHandler = async (event, context) => {
  try {
    const rawArticle = event["body"];
    const plainArticle: PlainArticle = pharseMarkdown(rawArticle)
    return new HTTPResponse(200, JSON.stringify(plainArticle));
  } catch (err) {
    console.error(err);
    return new HTTPResponse(err["status"], JSON.stringify({"Error Message: ": err["message"]}));
  }
};
