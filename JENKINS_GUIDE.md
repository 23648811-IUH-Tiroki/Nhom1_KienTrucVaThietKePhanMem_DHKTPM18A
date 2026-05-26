# Jenkins Guide

## Mục đích
File `Jenkinsfile` được thêm vào để Jenkins có thể chạy pipeline cho project PetShop.

## Pipeline đang làm gì
- Checkout source code.
- Cài dependency cho `back-end` và `front-end`.
- Chạy test backend bằng `npm test`.
- Build frontend bằng `npm run build`.
- Lưu artifact của frontend trong thư mục `front-end/dist`.

## Yêu cầu môi trường
- Jenkins agent có sẵn `Node.js` và `npm`.
- Nếu muốn mở rộng stage Docker, Jenkins agent cần có Docker.

## Cách dùng
1. Tạo job trên Jenkins dạng Pipeline.
2. Chọn source code từ repository này.
3. Jenkins sẽ tự đọc `Jenkinsfile` ở root project.
4. Chạy build để kiểm tra pipeline.

## Lưu ý
- Stage test backend được cấu hình `UNSTABLE` nếu chưa có test case đầy đủ.
- Frontend hiện chưa có test script riêng nên chỉ build.
- Có thể mở rộng thêm stage deploy nếu bạn đã có server hoặc môi trường chạy thực tế.
