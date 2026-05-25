import chai from 'chai';
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import Article from '../src/models/Article';
import PlainArticle from '../src/models/PlainArticle';
import { R2ArticleStore } from '../src/r2ArticleStore';

class FakeS3Client {
  commands: any[] = [];
  objects: Record<string, string> = {};

  async send(command: any): Promise<any> {
    this.commands.push(command);

    if (command instanceof PutObjectCommand) {
      this.objects[command.input.Key] = command.input.Body as string;
      return {};
    }

    if (command instanceof GetObjectCommand) {
      const body = this.objects[command.input.Key];
      return {
        Body: {
          transformToString: async () => body,
        },
      };
    }

    throw new Error('unexpected command');
  }
}

const makeArticle = (): Article => {
  const plainArticle = new PlainArticle();
  plainArticle.firstPublished = 100;
  plainArticle.title = 'R2 article';
  plainArticle.subtitle = 'Subtitle';
  plainArticle.type = 'post';
  plainArticle.tags = ['r2'];
  plainArticle.series = '';
  plainArticle.body = [{ p: 'body' }];

  const article = new Article(plainArticle);
  article.lastModified = 200;
  return article;
}

describe('R2ArticleStore', () => {
  it('writes immutable version and latest article objects', async () => {
    const client = new FakeS3Client();
    const store = new R2ArticleStore(client as any, 'article-bucket');
    const article = makeArticle();

    await store.putArticle(article);

    chai.expect(client.commands.map((command) => command.input.Key)).to.deep.equal([
      'articles/100/versions/200.json',
      'articles/100/latest.json',
    ]);
    chai.expect(JSON.parse(client.objects['articles/100/latest.json']).title).to.equal('R2 article');
  });

  it('reads the latest article object by firstPublished', async () => {
    const client = new FakeS3Client();
    const store = new R2ArticleStore(client as any, 'article-bucket');
    const article = makeArticle();
    client.objects['articles/100/latest.json'] = JSON.stringify(article);

    const result = await store.getArticle('100');

    chai.expect(result.firstPublished).to.equal(100);
    chai.expect(client.commands[0].input.Key).to.equal('articles/100/latest.json');
  });
});
