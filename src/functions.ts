import Article from "./models/Article";
import ArticleCatalog from "./models/ArticleCatalog";
import PlainArticle from "./models/PlainArticle";
import ArticleMetadata from "./models/ArticleMetadata";
import { ArticleNotFoundError, ArticleCatalogNotFoundError, ArticleCatalogUploadError, ArticleUploadError } from "./models/error";

export const pharseMarkdown = (file: string) => {
  var handlingBody = false;
  const fileRawArray: Array<string> = file.split("\n");
  var res: PlainArticle = new PlainArticle();
  res["body"] = [];

  for (const element of fileRawArray) {
    if (handlingBody){
      if (element == ""){
        continue
      }else if (element.slice(0, 3) == "###"){
        var content = element.slice(4, element.length + 1)
        res["body"].push({"h3": content})
      }else if (element.slice(0, 2) == "##"){
        var content = element.slice(3, element.length + 1)
        res["body"].push({"h2": content})
      }else if (element.slice(0, 1) == "#"){
        var content = element.slice(2, element.length + 1)
        res["body"].push({"h1": content})
      }else{
        var content = element.slice(0, element.length + 1)
        res["body"].push({"p": content})
      }
    } else {
      if (element == ""){
        continue
      } else if (element.slice(0, 2) == "##"){
        var content = element.slice(3, element.length + 1)
        res["subtitle"] = content;
      } else if (element.slice(0, 1) == "#"){
        var content = element.slice(2, element.length + 1)
        res["title"] = content;
      } else if (element.slice(0, 3) == "---") {
        handlingBody = true
        continue;
      } else if (element.slice(0, 7) == "- type:"){
        res["type"] = element.slice(8, element.length + 1)
      } else if (element.slice(0, 17) == "- firstPublished:"){
        res["firstPublished"] = +element.slice(18, element.length + 1)
      } else if (element.slice(0, 7) == "- tags:"){
        var tagString = element.slice(8, element.length + 1)
        var tagList = tagString.split(",").map(item => item.trim())
        res["tags"] = tagList
      } else if (element.slice(0, 9) == "- series:"){
        res["series"] = element.slice(10, element.length + 1)
      }
    }
  }
  return res;
}

export const getAPIResource = (event: any): string => {
  return event["resource"]
}

export const getLambdaEventSource = (event: any): string => {
  if (event["httpMethod"] && event["httpMethod"] == "GET")
    return "api-get"
  else if (event["httpMethod"] && event["httpMethod"] == "POST")
    return "api-post"
  else if (event["httpMethod"] && event["httpMethod"] == "PUT")
    return "api-put"
  else if (event["httpMethod"] && event["httpMethod"] == "DELETE")
    return "api-delete"
  else if (event["Records"] && event["Records"][0]["eventSource"] == "aws:s3")
    return "s3"
  else if (event["Records"] && event["Records"][0]["eventSource"] == "aws:dynamodb")
    return "dynamodb"
  else if (event["Records"] && event["Records"][0]["eventSource"] == "aws:sqs")
    return "sqs"
  else if (event["source"] && event["source"] == "aws.events" && event["detail-type"] == "Scheduled Event")
    return "cron"
  else
    throw new Error("Unknown invocation source");
}

export const rewriteArticleCatalog = (articleCatalog: ArticleCatalog, article: Article, articleIndex: number): ArticleCatalog => {

  const articleMetadata: ArticleMetadata = new ArticleMetadata(
    article["firstPublished"],
    article["lastModified"],
    article["title"],
    article["subtitle"],
    article["type"],
    article["edition"],
    article["views"],
    article["tags"],
    article["series"]
  );

  if (articleIndex == -1){ // Add new article metadata
    var filoArticles: ArticleMetadata[] = articleCatalog["body"]
    var fifoArticles: ArticleMetadata[] = filoArticles.reverse();

    fifoArticles.push(articleMetadata);

    filoArticles = fifoArticles.reverse();

    articleCatalog["body"] = filoArticles;
    articleCatalog["count"]++;

  }else{ //Update existing article metadata
    articleCatalog["body"][articleIndex] = articleMetadata;
    
  }
  articleCatalog["lastModified"] = article["lastModified"];
  return articleCatalog;

}

export const articleIsExisted = (articleCatalog: ArticleCatalog, article: Article): number => {
  /* return value -1 means article is not existed
   * else return index of the article in database
   * latest article is 0
   */ 

  for (var i = 0; i < articleCatalog["body"].length; i++){
    if (articleCatalog["body"][i]["firstPublished"] == article["firstPublished"]){
      return i;
    }
  }
  return -1;
}

export const rewriteArticle = (articleCatalog: ArticleCatalog, article: Article, index: number): Article => {
  article["edition"] = articleCatalog["body"][index]["edition"] != null ? articleCatalog["body"][index]["edition"] + 1 : article["edition"];
  article["views"] = articleCatalog["body"][index]["views"] != null ? articleCatalog["body"][index]["views"] : article["views"];
  return article;
}