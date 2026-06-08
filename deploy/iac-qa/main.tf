terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.98"
    }
  }

  backend "s3" {
    bucket         = "user-management-apuli13-qa-tf-state"
    key            = "terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "user-management-apuli13-qa-terraform-locks"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region
}

data "aws_availability_zones" "available" {
  state = "available"
}
