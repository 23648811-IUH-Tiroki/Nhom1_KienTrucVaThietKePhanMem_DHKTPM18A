# Hướng dẫn triển khai (Deployment)

Tài liệu này mô tả các bước cơ bản để triển khai ứng dụng (back-end + front-end) có sẵn trong repository.

## Yêu cầu
- Server: Linux (Ubuntu 20.04+) hoặc Windows Server
- Docker & Docker Compose (phiên bản mới)
- Node.js (chỉ cần để build local nếu không dùng Docker)
- Nginx (nếu dùng reverse proxy)

## Cấu trúc liên quan
- Back-end: `back-end/` (có `Dockerfile`, `server/`)
- Front-end: `front-end/` (có `Dockerfile`, build bằng Vite)
- Docker Compose: `docker-compose.yml`

## Biến môi trường chính
- Back-end: `PORT`, `MONGO_URI`, `REDIS_URL`, `JWT_SECRET`, `NODE_ENV`, ... (xem `back-end/server/configs` và file `.env` mẫu nếu có)
- Front-end: `VITE_API_BASE_URL` hoặc tương tự để trỏ tới API

Đặt các biến này trong file `.env` trên server hoặc cấu hình secrets trong hệ thống CI/CD.

### Mẫu file `.env` cho production và staging
Tôi đã thêm hai file mẫu ở gốc repo để bạn chỉnh giá trị và sao chép:

- `./.env.sample.prod` — mẫu cho production
- `./.env.sample.staging` — mẫu cho staging

Hướng dẫn nhanh:

1. Sao chép mẫu phù hợp:

```bash
cp .env.sample.prod .env    # production
cp .env.sample.staging .env # staging
```

2. Mở `.env` và điền các giá trị thực tế (MONGO_URI, JWT_SECRET, ...).

3. Với Docker Compose, đặt file `.env` ở thư mục gốc (nơi chứa `docker-compose.yml`) để Docker tự load.

4. Với front-end (nếu build không bằng Docker), bạn có thể tạo `front-end/.env` hoặc `front-end/.env.production` chứa `VITE_API_BASE_URL` trước khi chạy `npm run build`.

### Lưu trữ secrets
- Trên server, ưu tiên dùng secrets manager hoặc biến môi trường hệ thống thay vì commit `.env`.
- Trên CI/CD, khai báo biến bí mật trong pipeline settings (GitHub Secrets / Jenkins Credentials / GitLab CI variables).


## Triển khai nhanh bằng Docker Compose (trong server)
1. Copy repo hoặc pull từ Git:

```bash
git clone <repo-url> /var/www/myapp
cd /var/www/myapp
git checkout <branch>
```

2. Tạo file `.env` ở thư mục gốc với các biến cần thiết.

3. Build và chạy:

```bash
docker-compose build
docker-compose up -d --remove-orphans
```

4. Kiểm tra logs:

```bash
docker-compose logs -f
```

5. Dừng/rollback:

```bash
docker-compose down
docker-compose up -d --force-recreate --no-deps <service_name>
```

## Triển khai front-end (nếu không dùng Docker)
1. Vào `front-end/`:

```bash
cd front-end
npm ci
npm run build
```

2. Cấu hình Nginx phục vụ `dist/` (ví dụ block server cơ bản):

```nginx
server {
  listen 80;
  server_name example.com;

  root /var/www/myapp/front-end/dist;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location /api/ {
    proxy_pass http://127.0.0.1:3000/; # backend
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
}
```

## Triển khai back-end (nếu không dùng Docker)
1. Vào `back-end/` và cài phụ thuộc:

```bash
cd back-end
npm ci
```

2. Thiết lập `.env` với `MONGO_URI`, `JWT_SECRET`, ...

3. Chạy bằng `pm2` (gợi ý):

```bash
npm run build # nếu có bước build
pm2 start server/server.js --name myapp-backend
pm2 save
```

## CI/CD (gợi ý)
Repo có `Jenkinsfile` — nếu dùng Jenkins, tạo pipeline sử dụng file này để build image, chạy test, push image, và deploy lên server.

Tôi đã thêm một số file hỗ trợ deploy production:

- `docker-compose.prod.yml` — cấu hình stack production (backend, frontend, mongo, redis, proxy/nginx). Sửa `image` trong file nếu bạn muốn sử dụng images từ registry.
- `deploy/nginx.prod.conf` — cấu hình Nginx để serve frontend và proxy `/api` tới backend.
- `.github/workflows/deploy.yml` — ví dụ workflow GitHub Actions để build image và deploy lên server qua SSH.

### Secrets / biến môi trường cần thiết cho CI/CD
- `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN` — để push image (nếu dùng Docker Hub) hoặc thay bằng Registry tương ứng.
- `SERVER_HOST`, `SERVER_USER`, `SERVER_SSH_KEY`, `SERVER_SSH_PORT` — để GitHub Actions SSH vào server và chạy `docker-compose`.

### Triển khai production bước-1 (thủ công trên server)
1. Clone repo vào server (nơi sẽ chạy Docker Compose):

```bash
git clone <repo-url> /var/www/myapp
cd /var/www/myapp
git checkout main
```

2. Tạo file `.env` từ mẫu:

```bash
cp .env.sample.prod .env
# chỉnh các giá trị trong .env
```

3. Build và chạy stack production:

```bash
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d --remove-orphans
```

4. Kiểm tra:

```bash
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs -f proxy
```

### Triển khai production bằng GitHub Actions (tự động)
1. Thêm các secret vào repository settings (GitHub): `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`, `SERVER_HOST`, `SERVER_USER`, `SERVER_SSH_KEY`, `SERVER_SSH_PORT`.
2. Push lên nhánh `main` — workflow `.github/workflows/deploy.yml` sẽ chạy, build image, push và SSH vào server để cập nhật stack.

### Gợi ý bảo mật
- Không commit file `.env` có secret. Chỉ commit các mẫu `.env.sample.*`.
- Trên server, sử dụng user ít quyền và SSH key chỉ cho CI.


## Kiểm tra sau deploy
- Kiểm tra container: `docker ps`
- Kiểm tra logs: `docker logs -f <container>` hoặc `docker-compose logs -f`
- Kiểm tra endpoint: `curl -I https://example.com/health` hoặc endpoint health tương ứng

## Rollback nhanh
- Nếu dùng Docker images với tag: deploy lại image cũ trong compose và `docker-compose up -d`
- Nếu không: revert Git branch, redeploy, hoặc khởi động service từ PM2 với version trước

## Lưu ý & lỗi hay gặp
- Thiếu biến môi trường -> 500/không khởi động được
- Port bị chiếm -> kiểm tra `ss -ltnp` hoặc `Get-Process` trên Windows
- Lỗi CORS cho front-end -> kiểm tra config server và biến `VITE_API_BASE_URL`

---
Nếu bạn muốn, tôi có thể:
- Tùy chỉnh file này cho môi trường cụ thể (production/staging).
- Thêm ví dụ cấu hình `docker-compose.prod.yml` hoặc pipeline Jenkins/GitHub Actions.
