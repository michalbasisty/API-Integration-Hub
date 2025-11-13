FROM golang:1.21-alpine AS builder

WORKDIR /app

# Copy source code first
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -o ai-service main.go

# Runtime stage
FROM alpine:latest

WORKDIR /app

# Install ca-certificates for HTTPS
RUN apk --no-cache add ca-certificates

# Copy binary from builder
COPY --from=builder /app/ai-service .

EXPOSE 8001

CMD ["./ai-service"]
