import HTTPResponse from "./models/HTTPResponse";
import { getAPIResource, getLambdaEventSource } from "./functions"
import { getArticleCatalogService, getArticleService, postArticleReaderCountService, putArticleCatalogService, putArticleService, scheduledPutArticleCatalogService, sumArticleReaderCountService } from "./services";

export const lambdaHandler = async (event, context) => {
  var httpResponse: HTTPResponse = null;
  try {
    const source: string = getLambdaEventSource(event)
    console.info("Invoked by source: " + source)

    if (source == "api-get") {
      var resource: string = getAPIResource(event)

      if (resource == "/article") {
        httpResponse = await getArticleService(event)
      } else if (resource == "/article-catalog") {
        httpResponse = await getArticleCatalogService()
      } else {
        throw new Error("Operation not found");
      }
    } else if (source == "api-put") {
      var resource: string = getAPIResource(event)

      if (resource == "/article") {
        httpResponse = await putArticleService(event)
      } else if (resource == "/article-catalog") {
        httpResponse = await putArticleCatalogService(event)
      } else {
        throw new Error("Operation not found");
      }
    } else if (source == "api-post") {
      httpResponse = await postArticleReaderCountService(event)
    } else if (source == "sqs") {
      httpResponse = await sumArticleReaderCountService(event)
    } else if (source == "cron") {
      httpResponse = await scheduledPutArticleCatalogService()
    } else {
      throw new Error("Operation not found");
    }
  } catch (err) {
    console.error(err);
    httpResponse = new HTTPResponse(err["status"], {"Error Message: ": err["message"]})
  } finally {
    console.info("Program exit with:\nStatus code: " + httpResponse["statusCode"] + "\nBody: "+ httpResponse["body"]);
    return httpResponse;
  }
};
