# Terraform Guide

## Mục đích
Thư mục `terraform/` cung cấp một mẫu Terraform đơn giản để demo tiêu chí Terraform/Ansible.

## Cách hoạt động
- Terraform theo dõi checksum của file `docker-compose.yml`.
- Khi chạy `terraform apply`, Terraform sẽ gọi lệnh `docker compose up -d --build` ở thư mục gốc project.
- Mẫu này phù hợp để demo tự động hóa deploy ở mức đơn giản, dễ giải thích.

## Cách dùng
```bash
cd terraform
terraform init
terraform apply
```

## Lưu ý
- Máy chạy Terraform cần có Docker và Docker Compose.
- Đây là mẫu cơ bản; nếu muốn dùng đúng kiểu hạ tầng cloud, có thể mở rộng sang AWS, Azure hoặc DigitalOcean.
