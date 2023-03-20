import ArticleMetadata from "./ArticleMetadata"
import PlainArticle from "./PlainArticle"

export default class Article extends ArticleMetadata {
  body: {
    [key: string]: string;
  }[];

  constructor(plainArticle: PlainArticle){
    const now: number = Date.now();
    super(
      plainArticle["firstPublished"] ? plainArticle["firstPublished"] : now,
      now,
      plainArticle["title"],
      plainArticle["subtitle"],
      plainArticle["type"],
      1,
      0,
      plainArticle["tags"],
      plainArticle["series"]
    )
    this.body = plainArticle["body"];
  }
}