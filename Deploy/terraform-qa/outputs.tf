output "api_gateway_url" {
  description = "API Gateway endpoint URL"
  value       = aws_apigatewayv2_api.main.api_endpoint
}

output "database_endpoint" {
  description = "RDS database endpoint"
  value       = aws_db_instance.postgres.address
}
