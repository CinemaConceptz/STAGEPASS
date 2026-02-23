# Use Node.js LTS
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm install

# Copy source code
COPY . .

# Build the Next.js application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built artifacts
COPY --from=builder /app/.next ./.next
# Only copy public if it exists (using wildcard hack or just ensure it exists)
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

# Expose port
EXPOSE 3000

# Start command
CMD ["npm", "start"]