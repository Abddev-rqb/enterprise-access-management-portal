variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "ap-south-1"
}

variable "project_name" {
  description = "Project name used for AWS resource names"
  type        = string
  default     = "enterprise-access-management-portal"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.micro"
}

variable "key_name" {
  description = "AWS key pair name to create"
  type        = string
  default     = "accessportal-key"
}

variable "public_key_path" {
  description = "Local path to SSH public key"
  type        = string
  default     = "~/.ssh/accessportal-key.pub"
}

variable "allowed_ssh_cidr" {
  description = "CIDR allowed to SSH and access backend demo port"
  type        = string
}

variable "github_repo_url" {
  description = "GitHub repository URL to clone on EC2"
  type        = string
}

variable "app_directory" {
  description = "Application directory on EC2"
  type        = string
  default     = "/home/ubuntu/enterprise-access-management-portal"
}
