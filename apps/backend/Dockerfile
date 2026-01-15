FROM golang:1.23-alpine

WORKDIR /app

# Optimization: Disable CGO for static build and lower memory usage (Crucial for free tier)
ENV CGO_ENABLED=0
ENV GOOS=linux

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN go build -o /usr/local/bin/backend-api ./cmd/api

CMD ["/usr/local/bin/backend-api"]
