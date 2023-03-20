export default class PlainArticle{
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