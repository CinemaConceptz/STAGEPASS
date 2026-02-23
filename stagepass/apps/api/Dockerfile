# Use Node.js LTS
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm install

# Copy source code
COPY . .

# Build the application
# Note: For this MVP skeleton, we might not have a build script in API yet,
# so we ensure it exists or skip. 
RUN npm run build --if-present

# Production stage
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app ./

# Expose port
EXPOSE 8080

# Start command
CMD ["npm", "start"]