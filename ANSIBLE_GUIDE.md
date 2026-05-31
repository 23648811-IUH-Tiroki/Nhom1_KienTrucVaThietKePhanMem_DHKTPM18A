# Ansible Guide

## Mục đích
Bộ file trong thư mục `ansible/` là mẫu deploy đơn giản cho project PetShop.

## Cách hoạt động
- `ansible/inventory.ini` khai báo server đích.
- `ansible/deploy.yml` copy toàn bộ source code lên server.
- Playbook chạy `docker compose up -d --build` để khởi động toàn bộ hệ thống.

## Điều kiện trước khi chạy
- Server đã cài Docker.
- Server đã cài Docker Compose plugin hoặc có lệnh `docker-compose`.
- Máy chạy Ansible có quyền SSH vào server.

## Cách dùng
1. Sửa `ansible/inventory.ini` và thay `your-server-ip` bằng IP thật.
2. Chạy playbook từ thư mục gốc project:

```bash
ansible-playbook -i ansible/inventory.ini ansible/deploy.yml
```

## Ghi chú
- Đây là mẫu đơn giản, phù hợp để demo phần Terraform/Ansible trong báo cáo.
- Nếu muốn triển khai chuẩn hơn, có thể thêm bước cài Docker tự động hoặc tách riêng biến môi trường `.env`.
