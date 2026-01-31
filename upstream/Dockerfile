FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps --omit=dev

# Copy application code
COPY . .

# Expose port
EXPOSE 4000

# Start application
CMD ["node", "index.js"]
