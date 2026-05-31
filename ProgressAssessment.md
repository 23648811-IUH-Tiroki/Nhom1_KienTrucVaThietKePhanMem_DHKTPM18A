# Progress Assessment

Đánh giá tình trạng thực hiện theo tiêu chí (điểm tối đa như file yêu cầu)

1. Link Gitlab (0.5) — Thiếu
- Trạng thái: Thiếu
- Ghi chú: Không tìm thấy liên kết GitLab trong README hoặc tài liệu.

2. Tài liệu Google Drive (0.5) — Thiếu
- Trạng thái: Thiếu
- Ghi chú: Không tìm thấy link Google Drive chứa slide / hình ảnh.

3. Mô tả dự án (Hình ảnh hệ thống) (0.75) — Một phần
- Trạng thái: Có sơ đồ kiến trúc dự án (partial)
- Bằng chứng: [ARCHITECTURE_DIAGRAM.md](ARCHITECTURE_DIAGRAM.md#L1-L260)
- Ghi chú: Có file mô tả kiến trúc nhưng không có API Gateway độc lập; hiện backend là Express server.

4. JSON Web Token (JWT) (0.5) — Hoàn thành
- Trạng thái: Hoàn thành
- Bằng chứng: Backend tạo `accessToken` khi login: [back-end/server/controllers/authController.js](back-end/server/controllers/authController.js#L64-L76)

5. Redis (CRUD 1 đối tượng) (0.5) — Hoàn thành
- Trạng thái: Hoàn thành
- Bằng chứng: `redisClient` config và các thao tác `set/get/del` được dùng trong controllers, ví dụ: [back-end/server/controllers/authController.js](back-end/server/controllers/authController.js#L12-L16) và [back-end/server/configs/redisClient.js](back-end/server/configs/redisClient.js#L1-L40)

6. Retry 3-5s (API call 1 service) (0.5) — Hoàn thành
- Trạng thái: Hoàn thành
- Ghi chú: Đã thêm cơ chế retry/backoff cho cuộc gọi AI (OpenRouter). Thực hiện tối đa 3 lần với delay 3–5s (có jitter). Nếu tất cả lần thử đều thất bại, trả về lỗi 500.
- Bằng chứng: [back-end/server/controllers/AIController.js](back-end/server/controllers/AIController.js#L1-L160)

7. Rate Limiter Client (0.5) — Hoàn thành
- Trạng thái: Hoàn thành
- Ghi chú: Đã bổ sung client-side rate limiter trong `axiosInstance` giới hạn `5` requests mỗi `1` phút cho mỗi scope (method+path). Khi vượt ngưỡng, client sẽ khóa cục bộ, hiển thị toast và chặn các request tiếp theo trong cửa sổ 1 phút.
- Bằng chứng client: [front-end/src/utils/axiosInstance.js](front-end/src/utils/axiosInstance.js#L1-L220)
- Bằng chứng server: [back-end/server/middleware/rateLimiter.js](back-end/server/middleware/rateLimiter.js#L1-L40)

8. Docker All Services (0.5) — Hoàn thành
- Trạng thái: Hoàn thành
- Ghi chú: Thêm `Dockerfile` cho `back-end` và `front-end`. Backend chạy trên Node 18; frontend được build bằng Vite và serve bằng Nginx.
- Bằng chứng:
  - [back-end/Dockerfile](back-end/Dockerfile)
  - [front-end/Dockerfile](front-end/Dockerfile)

9. Docker Compose (0.5) — Hoàn thành
- Trạng thái: Hoàn thành
- Ghi chú: Thêm `docker-compose.yml` để chạy `mongo`, `redis`, `backend`, `frontend` (frontend được serve qua nginx, map host:5173 -> container:80).
- Bằng chứng: [docker-compose.yml](docker-compose.yml)

10. Jenkins (1.0) — Hoàn thành
- Trạng thái: Hoàn thành
- Ghi chú: Đã thêm `Jenkinsfile` để Jenkins chạy pipeline gồm checkout, cài dependency, test backend, build frontend và archive artifact. Đồng thời bổ sung tài liệu hướng dẫn chạy Jenkins.
- Bằng chứng:
  - [Jenkinsfile](Jenkinsfile)
  - [JENKINS_GUIDE.md](JENKINS_GUIDE.md)

11. Gitlab CI/CD (1.0) — Hoàn thành
- Trạng thái: Hoàn thành
- Ghi chú: Thêm file `.gitlab-ci.yml` mẫu. Pipeline cài dependency cho backend/frontend, chạy test (nếu có), build frontend, và có job tùy chọn để build & push Docker images lên GitLab Container Registry (nếu cấu hình biến môi trường/credentials).
- Bằng chứng: [.gitlab-ci.yml](.gitlab-ci.yml)

12. Agile-Scrum (0.75) — Hoàn thành
- Trạng thái: Hoàn thành
- Ghi chú: Đã bổ sung bộ tài liệu Agile tối thiểu gồm roadmap, sprint, backlog và retrospective để thể hiện quy trình Scrum.
- Bằng chứng:
  - [AGILE_ROADMAP.md](AGILE_ROADMAP.md)
  - [AGILE_SPRINT_1.md](AGILE_SPRINT_1.md)
  - [AGILE_BACKLOG.md](AGILE_BACKLOG.md)
  - [AGILE_RETRO.md](AGILE_RETRO.md)

13. Deploy (0.5) — Thiếu
- Trạng thái: Thiếu
- Ghi chú: Không có link hoặc script triển khai trên Internet (no hosting info).

14. Rate Limiter Server (0.5) — Hoàn thành
- Trạng thái: Hoàn thành
- Bằng chứng: Rate limiter và login limiter có triển khai server-side.
  - [back-end/server/middleware/rateLimiter.js](back-end/server/middleware/rateLimiter.js#L1-L40)
  - [back-end/server/middleware/loginLimiter.js](back-end/server/middleware/loginLimiter.js#L1-L120)

15. Terraform hoặc Ansible (0.5) — Hoàn thành
- Trạng thái: Hoàn thành
- Ghi chú: Đã thay mẫu deploy sang Terraform. Terraform theo dõi `docker-compose.yml` và chạy `docker compose up -d --build` khi áp dụng.
- Bằng chứng:
  - [terraform/main.tf](terraform/main.tf)
  - [terraform/README.md](terraform/README.md)

---

## Tổng kết
- Điểm tối đa: 8.5 (theo tiêu chí)
- Trạng thái hiện tại: Có nhiều phần backend đã hoàn thành (JWT, Redis, Rate-Limiter server), nhưng thiếu các phần DevOps/CI/CD/Docker/Deployment và tài liệu liên quan (GitLab link, Google Drive, Agile artifacts).

## Gợi ý hành động tiếp theo (tôi có thể làm giúp)
- Thêm retry/backoff cho `AIController` hoặc global axios (3 retry, 3–5s).  
- Thêm `docker-compose.yml` mẫu để chạy `backend`, `frontend`, `mongo`, `redis`.  
- Thêm `.gitlab-ci.yml` mẫu hoặc `Jenkinsfile` cơ bản.  
- Tạo file `ProgressAssessment.md` (this file) — đã tạo.


*File được tạo tự động bởi công cụ đánh giá.*
