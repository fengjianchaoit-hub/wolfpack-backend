# 多阶段构建
FROM maven:3.9-eclipse-temurin-17-alpine AS builder

WORKDIR /build
COPY pom.xml .
COPY wolfpack-common/pom.xml wolfpack-common/
COPY wolfpack-api/pom.xml wolfpack-api/
COPY wolfpack-service/pom.xml wolfpack-service/
COPY wolfpack-admin/pom.xml wolfpack-admin/

# 下载依赖
RUN mvn dependency:go-offline -B

# 复制源码
COPY wolfpack-common/src wolfpack-common/src
COPY wolfpack-api/src wolfpack-api/src
COPY wolfpack-service/src wolfpack-service/src
COPY wolfpack-admin/src wolfpack-admin/src

# 打包
RUN mvn clean package -DskipTests -B

# 运行时镜像
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# 安装必要工具（包括 PostgreSQL 客户端用于等待脚本）
RUN apk add --no-cache curl postgresql-client

# 复制等待脚本
COPY wait-for-postgres.sh /wait-for-postgres.sh
RUN chmod +x /wait-for-postgres.sh

# 复制jar包
COPY --from=builder /build/wolfpack-admin/target/*.jar app.jar

# 暴露端口
EXPOSE 8080

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/api/v1/dashboard/health || exit 1

# 启动命令（先等 PostgreSQL 再启动应用）
ENTRYPOINT ["/wait-for-postgres.sh", "postgres", "5432", "java", "-jar", "-Djava.security.egd=file:/dev/./urandom", "app.jar"]