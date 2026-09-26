# ---- Backend Dockerfile ----
FROM node:20-alpine

# Install dependencies for native modules (sqlite3, bcryptjs bindings)
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files and install production deps
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source code
COPY . .

# Ensure uploads directory exists
RUN mkdir -p uploads

EXPOSE 5000

CMD ["node", "server.js"]
