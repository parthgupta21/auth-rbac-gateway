FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps --omit=dev

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Start application with tracing
CMD ["node", "-r", "./src/tracing.js", "src/server.js"]
