FROM node:18-slim

# Install Chromium dependencies
RUN apt-get update && apt-get install -y \
  ca-certificates fonts-liberation libappindicator3-1 \
  libasound2 libatk-bridge2.0-0 libatk1.0-0 libcups2 \
  libdbus-1-3 libgdk-pixbuf2.0-0 libnspr4 libnss3 \
  libx11-xcb1 libxcomposite1 libxdamage1 libxrandr2 \
  xdg-utils wget libgbm1 \
  --no-install-recommends && \
  rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /

COPY package.json ./
RUN npm install

COPY . .

CMD ["node", "snapshot.js"]
