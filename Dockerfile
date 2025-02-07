# 🟢 Base Stage
FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat g++ cmake tar make
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN npm ci

# 🟢 Build Stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . . 

ENV NEXT_TELEMETRY_DISABLED 1

# Pass environment variables at build time
ARG OSC_ACCESS_TOKEN
ENV OSC_ACCESS_TOKEN=$OSC_ACCESS_TOKEN

ARG AWS_ACCESS_KEY
ENV AWS_ACCESS_KEY=$AWS_ACCESS_KEY

ARG AWS_SECRET_ACCESS_KEY
ENV AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY

ARG AWS_URL
ENV AWS_URL=$AWS_URL

ARG AWS_SSL
ENV AWS_SSL=$AWS_SSL

ARG AWS_URL_OUT
ENV AWS_URL_OUT=$AWS_URL_OUT

ARG AWS_ACCESS_KEY_OUT
ENV AWS_ACCESS_KEY_OUT=$AWS_ACCESS_KEY_OUT

ARG AWS_SECRET_ACCESS_KEY_OUT
ENV AWS_SECRET_ACCESS_KEY_OUT=$AWS_SECRET_ACCESS_KEY_OUT

ARG MINIO_ACCESS_KEY
ENV MINIO_ACCESS_KEY=$MINIO_ACCESS_KEY

ARG MINIO_SECRET_ACCESS_KEY
ENV MINIO_SECRET_ACCESS_KEY=$MINIO_SECRET_ACCESS_KEY

# Build the Next.js app
RUN npm run build

# 🟢 Production Stage (Nginx to Serve Static Files)
FROM nginx:stable-alpine3.17 AS production
WORKDIR /usr/share/nginx/html

# Copy Next.js static build output to Nginx serving directory
COPY --from=builder /app/.next/static /usr/share/nginx/html/static
COPY --from=builder /app/public /usr/share/nginx/html/public

# Copy a custom Nginx config if needed
COPY ./nginx.conf /etc/nginx/nginx.conf

# Add entrypoint script and give execution permission
COPY ./entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 8080

# Set entrypoint for custom startup behavior
ENTRYPOINT ["/entrypoint.sh"]

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
