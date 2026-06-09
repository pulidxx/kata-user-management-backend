output "api_gateway_url" {
  description = "HTTP API Gateway endpoint URL for application access"
  value       = aws_apigatewayv2_api.http_api.api_endpoint
}

output "database_endpoint" {
  description = "PostgreSQL database connection endpoint"
  value       = aws_db_instance.postgresql_db.address
}
