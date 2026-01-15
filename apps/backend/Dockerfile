FROM golang:1.23-alpine

WORKDIR /app

# Optimization: Disable CGO for static build and lower memory usage (Crucial for free tier)
ENV CGO_ENABLED=0
ENV GOOS=linux

# Install curl for Temporal CLI download
RUN apk add --no-cache curl

# Install Temporal CLI
RUN curl -sSf https://temporal.download/cli.sh | sh && \
    mv /root/.temporalio/bin/temporal /usr/local/bin/temporal

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN go build -o /usr/local/bin/backend-api ./cmd/api

COPY start.sh .
RUN chmod +x start.sh

CMD ["./start.sh"]
