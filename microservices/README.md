# Microservices

## List of microservices

- get-article: Given an article primary key (firstPublished), return the corresponding article
- get-article-catalog: Return a list of article metadata (catalog)
- create-article: Given a raw article content in JSON, upload the article to databases. This will also update the article catelog at the same time.
- update-article: Given an existing article primary key (firstPublished) and new article contents, update corresponding article in database
- update-article-catalog: Schedually to extract all article in lastest content, then update article catalog databases
- collect-article-reader-count: Collect click stream from end user
- sum-article-reader-count: Sum click rate
- pharse-markdown: Pharse Markdown article file into JSON format
