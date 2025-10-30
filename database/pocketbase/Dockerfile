FROM alpine:latest

WORKDIR /app

# Copy everything from the current directory
COPY . .

# Make PocketBase executable
RUN chmod +x pocketbase

# Expose port
EXPOSE 8090

# Run PocketBase
CMD ["./pocketbase", "serve", "--http=0.0.0.0:8090"]