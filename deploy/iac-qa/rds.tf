resource "aws_db_subnet_group" "database_subnet_group" {
  name       = "${var.project_name}-db-subnet-group"
  subnet_ids = [aws_subnet.private_subnet_az1.id, aws_subnet.private_subnet_az2.id]

  tags = {
    Name        = "${var.project_name}-db-subnet-group"
    Environment = "qa"
  }
}

resource "aws_db_instance" "postgresql_db" {
  identifier             = "${var.project_name}-db"
  engine                 = "postgres"
  engine_version         = "17.4"
  instance_class         = var.db_instance_class
  allocated_storage      = var.db_allocated_storage
  storage_type           = "gp2"
  db_name                = var.db_name
  username               = var.db_username
  password               = var.db_password
  db_subnet_group_name   = aws_db_subnet_group.database_subnet_group.name
  vpc_security_group_ids = [aws_security_group.db_sg.id]
  publicly_accessible    = false
  skip_final_snapshot    = true

  tags = {
    Name        = "${var.project_name}-db"
    Engine      = "PostgreSQL"
    Environment = "qa"
  }
}
