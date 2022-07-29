resource "aws_resourcegroups_group" "default" {
  name = var.project_name

  resource_query {
    query = <<JSON
{
  "ResourceTypeFilters": [
    "AWS::Lambda::Function",
    "AWS::DynamoDB::Table",
    "AWS::Logs::LogGroup",
    "AWS::SQS::Queue",
    "AWS::Events::Rule",
    "AWS::ApiGateway::RestApi",
    "AWS::ApiGateway::Stage"
  ],
  "TagFilters": [
    {
      "Key": "Project",
      "Values": ["${var.project_name}"]
    }
  ]
}
JSON
  }
}