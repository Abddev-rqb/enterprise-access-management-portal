output "ec2_public_ip" {
  description = "Public IP address of the EC2 instance"
  value       = aws_instance.accessportal_ec2.public_ip
}

output "frontend_url" {
  description = "Frontend application URL"
  value       = "http://${aws_instance.accessportal_ec2.public_ip}"
}

output "frontend_demo_port_url" {
  description = "Frontend application URL using demo port"
  value       = "http://${aws_instance.accessportal_ec2.public_ip}:3000"
}

output "backend_api_url" {
  description = "Backend API URL"
  value       = "http://${aws_instance.accessportal_ec2.public_ip}:8080/api"
}

output "ssh_command" {
  description = "SSH command for EC2"
  value       = "ssh -i ~/.ssh/accessportal-key ubuntu@${aws_instance.accessportal_ec2.public_ip}"
}
