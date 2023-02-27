FROM debian:testing-slim

RUN apt update \
    && apt upgrade -y \
    && apt install -y --no-install-recommends \
        nodejs npm curl \
    && apt clean \
    && rm -rf /var/lib/apt/lists/*

COPY . /app
WORKDIR /app

RUN npm install
EXPOSE 5000

CMD ["npm", "run", "server"]
HEALTHCHECK --interval=5s --timeout=3s --start-period=10s --retries=3 CMD curl -f http://localhost:5000/ || exit 1
