# Terraform mẫu cho project PetShop
# Giải thích (tiếng Việt):
# - Mẫu này không tạo hạ tầng cloud phức tạp để giữ cho bài làm đơn giản.
# - Khi `terraform apply`, nó sẽ kiểm tra thay đổi của file `docker-compose.yml`.
# - Nếu có thay đổi, Terraform sẽ chạy `docker compose up -d --build` trong thư mục gốc project.
# - Đây là cách demo đơn giản cho tiêu chí Terraform/Ansible trong báo cáo.

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    null = {
      source  = "hashicorp/null"
      version = "~> 3.2"
    }
  }
}

variable "project_root" {
  description = "Đường dẫn tới thư mục gốc của project"
  type        = string
  default     = ".."
}

variable "deploy_command" {
  description = "Lệnh deploy sẽ chạy khi Terraform apply"
  type        = string
  default     = "docker compose up -d --build"
}

locals {
  compose_file = "${var.project_root}/docker-compose.yml"
}

resource "null_resource" "deploy_petshop" {
  triggers = {
    compose_checksum = fileexists(local.compose_file) ? filesha256(local.compose_file) : "missing"
  }

  provisioner "local-exec" {
    command     = var.deploy_command
    working_dir = var.project_root
  }
}

output "terraform_note" {
  value = "Terraform đã được cấu hình để chạy deploy bằng docker compose khi áp dụng."
}
