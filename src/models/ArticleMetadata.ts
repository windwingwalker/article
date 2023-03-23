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

  constructor(
    firstPublished: number, 
    lastModified: number, 
    title: string,
    subtitle: string,
    type: string,
    edition: number,
    views: number,
    tags: string[],
    series: string
    ){
    this.firstPublished = firstPublished
    this.lastModified = lastModified
    this.title = title
    this.subtitle = subtitle
    this.type = type
    this.edition = edition
    this.views = views
    this.tags = tags
    this.series = series
  }
}
