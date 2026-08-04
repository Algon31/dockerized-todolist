# uses a lightwieght nodejs for installing dependencies
FROM node:18-alpine AS build

# Set working directory for the build stage
WORKDIR /app

# Copy the package files for dependency installation
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all files for the build process
COPY . .

ARG VITE_API_URL=http://localhost:3001
ENV VITE_API_URL=$VITE_API_URL

# Build the frontend app for production
RUN npm run build

# Start a new stage using nginx for serving static files
FROM nginx:stable-alpine

# Copy build output from previous stage to nginx public folder
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 for nginx web server
EXPOSE 80

# Start nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
