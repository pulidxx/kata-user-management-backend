resource "aws_security_group" "function_sg" {
  name        = "${var.project_name}-lambda-sg"
  description = "Controls network access for Lambda compute functions"
  vpc_id      = aws_vpc.app_network.id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }

  tags = {
    Name        = "${var.project_name}-lambda-sg"
    Service     = "Lambda"
    Environment = "production"
  }
}

resource "aws_security_group" "db_sg" {
  name        = "${var.project_name}-db-sg"
  description = "Controls database access for PostgreSQL RDS instance"
  vpc_id      = aws_vpc.app_network.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.function_sg.id]
    description     = "PostgreSQL access from Lambda functions"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }

  tags = {
    Name        = "${var.project_name}-db-sg"
    Service     = "RDS"
    Environment = "production"
  }
}
