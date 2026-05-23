#!/bin/bash
set -e

LOG_FILE="/var/log/accessportal-user-data.log"
exec > >(tee -a $LOG_FILE) 2>&1

echo "Starting Enterprise Access Management Portal EC2 setup..."

apt-get update -y
apt-get install -y ca-certificates curl gnupg git unzip

install -m 0755 -d /etc/apt/keyrings

curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" \
  > /etc/apt/sources.list.d/docker.list

apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

usermod -aG docker ubuntu

if [ ! -d "${app_directory}/.git" ]; then
  git clone ${github_repo_url} ${app_directory}
else
  cd ${app_directory}
  git pull origin main || git pull origin master
fi

cd ${app_directory}

docker compose down || true
docker compose up --build -d

echo "Docker containers:"
docker compose ps

echo "Enterprise Access Management Portal setup completed."
