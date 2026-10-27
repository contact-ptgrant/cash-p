# Use official lightweight Node.js image
FROM node:18-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package.json package-lock.json* ./

# Install production dependencies
RUN npm ci --production

# Copy the rest of the application source code
COPY . .

# Expose the port the app runs on (Render uses process.env.PORT)
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]
