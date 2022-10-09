# Article

## Background
This **repository** stores everything of an application. The **application** is one of the back-end application of my blog. The application consists of **microservices**, each microservice represent an operation about articles.  

## Repository strusture
- `README.md`: This file, stating the basic information of the whole repository.
- `LICENSE.md`: Just a license.
- `microservices/`: Store source code of each microservices.
- `iac/`: Store the infrastructure as code shared across microservices. Currently Terraform. 
- `article-inventory/`: Store the published articles in markdown format.
- `model/`: Store the data model shared across microservices. 
- `.gitignore`: Just `.gitignore`.

## List of applied AWS services
- ECR
- Lambda
- API Gateway
- EventBridge
- SQS
- AWS Backup
- CloudWatch Log
- CloudWatch Metrics
- DynamoDB
- Cognito User Pool
- LightSail

## Microservices of the application
- get-article: Given an article primary key (firstPublished), return the corresponding article
- get-article-catalog: Return a list of article metadata (catalog)
- create-article: Given a raw article content in JSON, upload the article to databases. This will also update the article catelog at the same time.
- update-article: Given an existing article primary key (firstPublished) and new article contents, update corresponding article in database
- update-article-catalog: Schedually to extract all article in lastest content, then update article catalog databases
- collect-article-reader-count: Collect click stream from end user
- sum-article-reader-count: Sum click rate
- pharse-markdown: Pharse Markdown article file into JSON format
