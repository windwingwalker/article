import chai from 'chai';
import Article from '../src/models/Article';
import ArticleCatalog from '../src/models/ArticleCatalog';
import PlainArticle from '../src/models/PlainArticle';
import { drainArticleReaderCounts, ReaderCountQueue, ArticleStore } from '../src/viewCounter';

const makeArticle = (firstPublished: number, lastModified: number, views: number): Article => {
  const plainArticle = new PlainArticle();
  plainArticle.firstPublished = firstPublished;
  plainArticle.title = `Article ${firstPublished}`;
  plainArticle.subtitle = 'Subtitle';
  plainArticle.type = 'post';
  plainArticle.tags = ['test'];
  plainArticle.series = '';
  plainArticle.body = [{ p: 'body' }];

  const article = new Article(plainArticle);
  article.lastModified = lastModified;
  article.views = views;
  return article;
}

class FakeQueue implements ReaderCountQueue {
  private batches: string[][];
  deletedMessageIds: string[] = [];

  constructor(batches: string[][]) {
    this.batches = batches;
  }

  async receive(): Promise<{ id: string; firstPublished: string }[]> {
    const batch = this.batches.shift() || [];
    return batch.map((firstPublished, index) => ({
      id: `${firstPublished}-${index}`,
      firstPublished,
    }));
  }

  async delete(ids: string[]): Promise<void> {
    this.deletedMessageIds.push(...ids);
  }
}

class FakeStore implements ArticleStore {
  articles: Record<string, Article>;
  catalog: ArticleCatalog;
  writtenArticles: Article[] = [];
  writtenCatalogs: ArticleCatalog[] = [];
  failOnPutArticle = false;

  constructor(articles: Record<string, Article>, catalog: ArticleCatalog) {
    this.articles = articles;
    this.catalog = catalog;
  }

  async getArticle(firstPublished: string): Promise<Article> {
    return this.articles[firstPublished];
  }

  async putArticle(article: Article): Promise<void> {
    if (this.failOnPutArticle) throw new Error('put article failed');
    this.articles[article.firstPublished.toString()] = article;
    this.writtenArticles.push(article);
  }

  async getArticleCatalog(): Promise<ArticleCatalog> {
    return this.catalog;
  }

  async putArticleCatalog(articleCatalog: ArticleCatalog): Promise<void> {
    this.catalog = articleCatalog;
    this.writtenCatalogs.push(articleCatalog);
  }
}

describe('viewCounter.drainArticleReaderCounts()', () => {
  it('drains all available queue records and writes summed views to article storage', async () => {
    const firstArticle = makeArticle(100, 200, 7);
    const secondArticle = makeArticle(101, 201, 1);
    const catalog: ArticleCatalog = {
      id: 1,
      lastModified: 201,
      count: 2,
      body: [firstArticle, secondArticle],
    };
    const queue = new FakeQueue([['100', '101', '100'], ['100'], []]);
    const store = new FakeStore({ '100': firstArticle, '101': secondArticle }, catalog);

    const result = await drainArticleReaderCounts(queue, store);

    chai.expect(result).to.deep.equal({
      received: 4,
      updatedArticles: 2,
      incrementsByFirstPublished: {
        '100': 3,
        '101': 1,
      },
    });
    chai.expect(store.articles['100'].views).to.equal(10);
    chai.expect(store.articles['101'].views).to.equal(2);
    chai.expect(store.catalog.body[0].views).to.equal(10);
    chai.expect(store.catalog.body[1].views).to.equal(2);
    chai.expect(store.writtenArticles.length).to.equal(2);
    chai.expect(store.writtenCatalogs.length).to.equal(1);
    chai.expect(queue.deletedMessageIds.length).to.equal(4);
  });

  it('does not write storage when the queue is empty', async () => {
    const article = makeArticle(100, 200, 7);
    const catalog: ArticleCatalog = {
      id: 1,
      lastModified: 200,
      count: 1,
      body: [article],
    };
    const queue = new FakeQueue([[]]);
    const store = new FakeStore({ '100': article }, catalog);

    const result = await drainArticleReaderCounts(queue, store);

    chai.expect(result.received).to.equal(0);
    chai.expect(store.writtenArticles.length).to.equal(0);
    chai.expect(store.writtenCatalogs.length).to.equal(0);
  });

  it('does not delete queue records when storage writes fail', async () => {
    const article = makeArticle(100, 200, 7);
    const catalog: ArticleCatalog = {
      id: 1,
      lastModified: 200,
      count: 1,
      body: [article],
    };
    const queue = new FakeQueue([['100'], []]);
    const store = new FakeStore({ '100': article }, catalog);
    store.failOnPutArticle = true;

    try {
      await drainArticleReaderCounts(queue, store);
      throw new Error('expected drain to fail');
    } catch (err) {
      chai.expect(err.message).to.equal('put article failed');
    }

    chai.expect(queue.deletedMessageIds.length).to.equal(0);
  });
});
