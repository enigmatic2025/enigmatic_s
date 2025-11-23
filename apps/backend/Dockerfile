FROM golang:1.23-alpine

WORKDIR /app

COPY go.mod ./
# COPY go.sum ./ # Uncomment when we have dependencies
# RUN go mod download

COPY . .

RUN go mod tidy
RUN go build -o /usr/local/bin/backend-api ./cmd/api

CMD ["/usr/local/bin/backend-api"]
