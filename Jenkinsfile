// Jenkinsfile cho project PetShop
// - Pipeline này cài dependency cho backend và frontend.
// - Backend có sẵn lệnh `npm test`, nên pipeline sẽ chạy test backend trước.
// - Frontend hiện chưa có test script riêng, nên pipeline chỉ build bằng Vite.
// - Nếu Jenkins agent có Docker, có thể mở rộng thêm stage build/push image.

pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    environment {
        BACKEND_DIR = 'back-end'
        FRONTEND_DIR = 'front-end'
    }

    stages {
        stage('Checkout') {
            steps {
                // Lấy mã nguồn từ nhánh đang build
                checkout scm
            }
        }

        stage('Install Backend') {
            steps {
                dir(env.BACKEND_DIR) {
                    // Cài dependency cho backend
                    sh 'npm ci'
                }
            }
        }

        stage('Install Frontend') {
            steps {
                dir(env.FRONTEND_DIR) {
                    // Cài dependency cho frontend
                    sh 'npm ci'
                }
            }
        }

        stage('Test Backend') {
            steps {
                dir(env.BACKEND_DIR) {
                    // Chạy test backend. Nếu chưa có test case thì stage này có thể báo UNSTABLE.
                    catchError(buildResult: 'UNSTABLE', stageResult: 'UNSTABLE') {
                        sh 'npm test'
                    }
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir(env.FRONTEND_DIR) {
                    // Build frontend ra thư mục dist
                    sh 'npm run build'
                }
            }
        }

        stage('Archive Artifacts') {
            steps {
                // Lưu lại file build của frontend để tải về hoặc deploy tiếp
                archiveArtifacts artifacts: 'front-end/dist/**/*', allowEmptyArchive: true, fingerprint: true
            }
        }

        stage('Docker Build Preview') {
            when {
                anyOf {
                    branch 'main'
                    branch 'master'
                }
            }
            steps {
                script {
                    // Stage này chỉ là ví dụ. Cần Docker trên Jenkins agent mới chạy được.
                    echo 'Nếu Jenkins agent có Docker, có thể build image ở đây.'
                }
            }
        }
    }

    post {
        always {
            // Dọn workspace sau khi pipeline kết thúc để tránh ảnh hưởng build sau
            cleanWs()
        }
        success {
            echo 'Jenkins pipeline đã chạy thành công.'
        }
        unstable {
            echo 'Pipeline chạy được nhưng có stage test chưa đạt hoặc chưa có đủ test case.'
        }
        failure {
            echo 'Pipeline thất bại. Hãy kiểm tra log của stage bị lỗi.'
        }
    }
}
