# Dockerfile cho frontend (Vite + React) - multi-stage build
# 1. Giai đoạn build: dùng node để cài dependency và build production (vite build).
# 2. Giai đoạn production: copy output `dist` vào nginx để phục vụ tệp tĩnh.
# 3. Nginx sẽ serve nội dung trên cổng 80; docker-compose map cổng 80 -> host 5173.

FROM node:20 AS build
WORKDIR /app

# Cài dependencies và build
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Giai đoạn production: dùng nginx để phục vụ tệp tĩnh
FROM nginx:stable-alpine

# Xóa cấu hình default nếu cần (sử dụng cấu hình mặc định cho đơn giản)
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
