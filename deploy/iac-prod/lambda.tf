locals {
  function_environment_config = {
    DB_HOST             = aws_db_instance.postgresql_db.address
    DB_PORT             = tostring(aws_db_instance.postgresql_db.port)
    DB_NAME             = var.db_name
    DB_USERNAME         = var.db_username
    DB_PASSWORD         = var.db_password
    DB_SSL              = "true"
    DB_SYNC             = "false"
    NODE_ENV            = "production"
    JWT_SECRET          = var.jwt_secret
    SENDGRID_API_KEY    = var.sendgrid_api_key
    SENDGRID_FROM_EMAIL = var.sendgrid_from_email
  }
}

resource "aws_lambda_function" "backend_function" {
  filename         = "../../dist/user-management.zip"
  function_name    = "${var.project_name}-api"
  role             = aws_iam_role.function_exec_role.arn
  handler          = "src/handler.handler"
  source_code_hash = filebase64sha256("../../dist/user-management.zip")
  runtime          = var.lambda_runtime
  timeout          = 30
  memory_size      = 512

  vpc_config {
    subnet_ids         = [aws_subnet.private_subnet_az1.id, aws_subnet.private_subnet_az2.id]
    security_group_ids = [aws_security_group.function_sg.id]
  }

  environment {
    variables = local.function_environment_config
  }

  tags = {
    Name        = "${var.project_name}-api"
    Runtime     = var.lambda_runtime
    Environment = "production"
  }

  depends_on = [
    aws_iam_role_policy_attachment.function_vpc_policy,
    aws_iam_role_policy_attachment.function_logs_policy
  ]
}

resource "aws_cloudwatch_log_group" "function_logs" {
  name              = "/aws/lambda/${aws_lambda_function.backend_function.function_name}"
  retention_in_days = 7

  tags = {
    Environment = "production"
  }
}

resource "aws_lambda_permission" "apigw_invoke" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.backend_function.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http_api.execution_arn}/*/*"
}
