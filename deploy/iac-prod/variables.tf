variable "aws_region" {
  description = "Target AWS region for infrastructure deployment"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Application project identifier"
  type        = string
  default     = "user-management-apuli13-prod"
}

variable "jwt_secret" {
  description = "Secret key for JWT token signing and validation"
  type        = string
  sensitive   = true
}

variable "db_name" {
  description = "PostgreSQL database identifier"
  type        = string
  default     = "crm_apuli13_prod_db"
}

variable "db_username" {
  description = "PostgreSQL admin username"
  type        = string
  default     = "apuli13"
  sensitive   = true
}

variable "db_password" {
  description = "PostgreSQL admin password"
  type        = string
  default     = "Password1!"
  sensitive   = true
}

variable "db_instance_class" {
  description = "RDS compute instance type"
  type        = string
  default     = "db.t3.micro"
}

variable "db_allocated_storage" {
  description = "Database storage capacity in gigabytes"
  type        = number
  default     = 20
}

variable "vpc_cidr" {
  description = "Virtual network CIDR range"
  type        = string
  default     = "10.0.0.0/16"
}

variable "lambda_runtime" {
  description = "Lambda function execution environment"
  type        = string
  default     = "nodejs22.x"
}

variable "sendgrid_api_key" {
  description = "SendGrid authentication token for email delivery"
  type        = string
  sensitive   = true
}

variable "sendgrid_from_email" {
  description = "Email address used as sender in outbound messages"
  type        = string
  sensitive   = true
}
