import Article from "./Article";

export default class ArticleMetadata {
  firstPublished: number;
  lastModified: number;
  title: string;
  subtitle: string;
  type: string;
  edition: number;
  views: number;
  tags: string[];
  series: string;

  constructor(...args: unknown[]) {
    if (args.length === 1 && args[0] instanceof Article) {
      const article = args[0] as Article;
      this.firstPublished = article["firstPublished"];
      this.lastModified = article["lastModified"];
      this.title = article["title"];
      this.subtitle = article["subtitle"];
      this.type = article["type"];
      this.edition = article["edition"];
      this.views = article["views"];
      this.tags = article["tags"];
      this.series = article["series"];
    } else {
      this.firstPublished = args[0] as number;
      this.lastModified = args[1] as number;
      this.title = args[2] as string;
      this.subtitle = args[3] as string;
      this.type = args[4] as string;
      this.edition = args[5] as number;
      this.views = args[6] as number;
      this.tags = args[7] as string[];
      this.series = args[8] as string;
    }
  }
}
