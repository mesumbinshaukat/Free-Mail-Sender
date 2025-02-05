# Use Node.js 18 Alpine as base image
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy all files
COPY . .

# Start the app
CMD ["npm", "start"]