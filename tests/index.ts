import { pharseMarkdown } from "../src/functions";
import chai from 'chai';
import * as fs from 'fs';
import validArticleInJson from "./valid-article.json";
import invalidArticleInJson from "./invalid-article.json";
import headingArticleInJson from "./heading-article.json";

describe('functions/index.pharseMarkdown()', () => {
  it('successfully pharsed', () => {
    const validArtilce = fs.readFileSync('./tests/valid-article.txt', 'utf8');
    chai.expect(pharseMarkdown(validArtilce)).to.deep.equal(validArticleInJson);
  });
  it('failed pharsed', () => {
    const validArtilce = fs.readFileSync('./tests/valid-article.txt', 'utf8');
    const invalidArtilce = fs.readFileSync('./tests/invalid-article.txt', 'utf8');
    chai.expect(pharseMarkdown(validArtilce)).to.not.deep.equal(invalidArticleInJson);
    chai.expect(pharseMarkdown(invalidArtilce)).to.not.deep.equal(validArticleInJson);
  });

  it('pharsed heading levels', () => {
    const headingArticle = fs.readFileSync('./tests/heading-article.txt', 'utf8');
    chai.expect(pharseMarkdown(headingArticle)).to.deep.equal(headingArticleInJson);
  });
});





 