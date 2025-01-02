FROM node:lts-alpine

# Install typescript and ts-node globally
RUN npm install -g typescript tsx

WORKDIR /app

# Copy the entire workspace
COPY . .

# Install dependencies at root level
RUN yarn install

# Expose WebSocket port (default 3001)
EXPOSE 3001

# Start the server using tsx
CMD ["tsx", "watch", "--clear-screen=false", "packages/sourcery-ws/src/server.ts"]
