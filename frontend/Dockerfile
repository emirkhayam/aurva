# Dockerfile for AURVA Frontend (Public Website)
FROM nginx:alpine

# Copy static files
COPY *.html /usr/share/nginx/html/
COPY fontawesome /usr/share/nginx/html/fontawesome

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
