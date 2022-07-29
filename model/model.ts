export type StatusCode = number;

export interface ArticleCatalog{
  id: number;
  lastModified: number;
  count: number;
  body: ArticleMetadata[];
}

export interface ArticleMetadata{
  firstPublished: number;
  lastModified: number;
  title: string;
  subtitle: string;
  type: string;
  edition: number;
  views: number;
  tags: string[];
  series: string;
}

export class PlainArticle{
  firstPublished?: number;
  title: string;
  subtitle: string;
  type: string;
  tags: string[];
  series: string;
  body: {
    [key: string]: string;
  }[];
}

export class Article{
  firstPublished: number;
  lastModified: number;
  title: string;
  subtitle: string;
  type: string;
  edition: number;
  views: number;
  tags: string[];
  series: string;
  body: {
    [key: string]: string;
  }[];

  constructor(data: PlainArticle){
    this.firstPublished = data["firstPublished"] ? data["firstPublished"] : Date.now();
    this.lastModified = Date.now();
    this.title = data["title"];
    this.subtitle = data["subtitle"];
    this.type = data["type"];
    this.edition = 1;
    this.views = 0;
    this.series = data["series"];
    this.tags = data["tags"]
    this.body = data["body"];
  }
}