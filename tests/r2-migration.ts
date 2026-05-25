import chai from 'chai';
import Article from '../src/models/Article';
import ArticleCatalog from '../src/models/ArticleCatalog';
import PlainArticle from '../src/models/PlainArticle';
import { buildR2MigrationObjects, compareDynamoAndR2Latest } from '../src/r2Migration';

const makeArticle = (firstPublished: number, lastModified: number, views = 0): Article => {
  const plainArticle = new PlainArticle();
  plainArticle.firstPublished = firstPublished;
  plainArticle.title = `Article ${firstPublished}.${lastModified}`;
  plainArticle.subtitle = 'Subtitle';
  plainArticle.type = 'post';
  plainArticle.tags = ['migration'];
  plainArticle.series = '';
  plainArticle.body = [{ p: 'body' }];

  const article = new Article(plainArticle);
  article.lastModified = lastModified;
  article.views = views;
  return article;
}

describe('r2Migration.buildR2MigrationObjects()', () => {
  it('writes every version and points latest at the largest lastModified per article', () => {
    const oldVersion = makeArticle(100, 200);
    const newVersion = makeArticle(100, 300, 3);
    const otherArticle = makeArticle(101, 250, 1);
    const catalog: ArticleCatalog = {
      id: 1,
      lastModified: 300,
      count: 2,
      body: [newVersion, otherArticle],
    };

    const objects = buildR2MigrationObjects([oldVersion, otherArticle, newVersion], catalog);

    chai.expect(objects.map((object) => object.key)).to.deep.equal([
      'articles/100/versions/200.json',
      'articles/100/versions/300.json',
      'articles/101/versions/250.json',
      'articles/100/latest.json',
      'articles/101/latest.json',
      'catalog/latest.json',
    ]);
    chai.expect(JSON.parse(objects[3].body).lastModified).to.equal(300);
  });
});

describe('r2Migration.compareDynamoAndR2Latest()', () => {
  it('reports clean comparison when latest articles and catalog match', () => {
    const latest = makeArticle(100, 300);
    const catalog: ArticleCatalog = {
      id: 1,
      lastModified: 300,
      count: 1,
      body: [latest],
    };

    const result = compareDynamoAndR2Latest([makeArticle(100, 200), latest], { '100': latest }, catalog, catalog);

    chai.expect(result.ok).to.equal(true);
    chai.expect(result.differences).to.deep.equal([]);
  });

  it('reports missing and mismatched R2 latest objects', () => {
    const expected = makeArticle(100, 300);
    const stale = makeArticle(100, 200);
    const missing = makeArticle(101, 250);
    const catalog: ArticleCatalog = {
      id: 1,
      lastModified: 300,
      count: 2,
      body: [expected, missing],
    };

    const result = compareDynamoAndR2Latest([expected, stale, missing], { '100': stale }, catalog, {
      ...catalog,
      count: 1,
    });

    chai.expect(result.ok).to.equal(false);
    chai.expect(result.differences).to.deep.include({
      key: 'articles/100/latest.json',
      reason: 'latest-mismatch',
    });
    chai.expect(result.differences).to.deep.include({
      key: 'articles/101/latest.json',
      reason: 'missing-r2-latest',
    });
    chai.expect(result.differences).to.deep.include({
      key: 'catalog/latest.json',
      reason: 'catalog-mismatch',
    });
  });
});
