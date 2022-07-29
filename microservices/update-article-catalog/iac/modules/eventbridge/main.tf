resource "aws_cloudwatch_event_rule" "default" {
    name                = var.ms_name
    description         = "Fires at 3am UTC+8 daily"
    schedule_expression = "cron(0 21 * * ? *)"
}

resource "aws_cloudwatch_event_target" "default" {
    rule                = aws_cloudwatch_event_rule.default.name
    target_id           = var.ms_name
    arn                 = var.function_arn
}

resource "aws_lambda_permission" "default" {
    statement_id        = "AllowExecutionFromCloudWatch"
    action              = "lambda:InvokeFunction"
    function_name       = var.ms_name
    principal           = "events.amazonaws.com"
    source_arn          = aws_cloudwatch_event_rule.default.arn
}