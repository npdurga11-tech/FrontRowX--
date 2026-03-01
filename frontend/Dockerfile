FROM node:18-alpine

WORKDIR /app

# Copy package files first for better layer caching
COPY package.json ./

# Install all dependencies (including devDependencies for Tailwind)
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

EXPOSE 3000

# CI=false prevents warnings from being treated as errors
ENV CI=false

CMD ["npm", "start"]
