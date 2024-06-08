# Use the official Node.js 14 image as the base image
FROM node:lts-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the app source code to the working directory
COPY . .

# Expose the port on which the app will run
# EXPOSE 3000

# Start the app
CMD [ "npm", "start" ]
