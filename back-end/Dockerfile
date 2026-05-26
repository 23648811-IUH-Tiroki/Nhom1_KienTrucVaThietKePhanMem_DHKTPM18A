# Dockerfile cho backend (Node.js + Express)
# Giải thích (tiếng Việt):
# 1. Dùng image node nhẹ để cài dependencies và chạy ứng dụng.
# 2. Sao chép package.json trước để tận dụng layer cache cho npm install.
# 3. Thiết lập NODE_ENV=production để chạy ở chế độ production.
# 4. Mở cổng 5000 (mặc định backend chạy ở 5000).

FROM node:20

# Tạo thư mục làm việc

WORKDIR /app

# Sao chép file package để cài dependency trước
COPY package*.json ./

# Cài dependencies (dùng --omit=dev để giảm kích thước image)
RUN npm ci --omit=dev

# Sao chép toàn bộ source vào image
COPY . .

# Thiết lập biến môi trường production
ENV NODE_ENV=production

# Expose port ứng dụng
EXPOSE 5000

# Lệnh chạy ứng dụng
CMD ["npm", "start"]
