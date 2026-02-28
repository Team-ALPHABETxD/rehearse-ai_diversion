# ---------- Build Stage ----------
FROM node:20-alpine AS builder

WORKDIR /server

COPY package*.json ./
RUN npm install

COPY . .
CMD ["npm", "run", "start:dev"]

# ---------- Production Stage ----------
# FROM node:20-alpine

# WORKDIR /app

# COPY package*.json ./
# RUN npm install --only=production

# COPY --from=builder /app/dist ./dist

# EXPOSE 3000

# CMD ["node", "dist/main.js"]