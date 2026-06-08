locals {
  lambda_env_vars = {
    DB_HOST     = aws_db_instance.postgres.address
    DB_PORT     = tostring(aws_db_instance.postgres.port)
    DB_NAME     = var.db_name
    DB_USERNAME = var.db_username
    DB_PASSWORD = var.db_password
    DB_SSL      = "true"
    DB_SYNC     = "false"
    NODE_ENV    = "development"
    JWT_SECRET  = var.jwt_secret
  }
}

resource "aws_lambda_function" "api" {
  filename         = "../dist/user-management.zip"
  function_name    = "${var.project_name}-api"
  role             = aws_iam_role.lambda_role.arn
  handler          = "src/handler.handler"
  source_code_hash = filebase64sha256("../dist/user-management.zip")
  runtime          = var.lambda_runtime
  timeout          = 30
  memory_size      = 512

  vpc_config {
    subnet_ids         = [aws_subnet.private_1.id, aws_subnet.private_2.id]
    security_group_ids = [aws_security_group.lambda.id]
  }

  environment {
    variables = local.lambda_env_vars
  }

  tags = {
    Name = "${var.project_name}-api"
  }

  depends_on = [
    aws_iam_role_policy_attachment.lambda_vpc_execution,
    aws_iam_role_policy_attachment.lambda_basic_execution
  ]
}

resource "aws_cloudwatch_log_group" "api" {
  name              = "/aws/lambda/${aws_lambda_function.api.function_name}"
  retention_in_days = 7
}

resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}
