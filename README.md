# Article

## Background
This is a microservice of an application. The application consists of operations of an article, such as create an article, get an article, etc.

## Repository strusture
- README.md: This file, stating the basic information of the whole repository
- LICENSE.md: Just a license
- functions/: 

## List of applied AWS services
- Elastic Container Registry (ECR)
- Lambda
- API Gateway
- EventBridge
- SQS
- CloudWatch

## Microservices of the application
- get-article: Given an article primary key (firstPublished), return the corresponding article
- get-article-catalog: Return a list of article metadata
- create-article: Given a raw article content in JSON, upload the article to databases. This will also update the article catelog at the same time.
- update-article: Given an existing article primary key (firstPublished) and new article contents, update databases
- update-article-catalog: Given a new article catelog, update its databases
- collect-article-reader-count: 
- sum-article-reader-count: 
- pharse-markdown: 
