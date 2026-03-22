FROM node:20-alpine

WORKDIR /app

# Install backend dependencies first for better caching
COPY backend/package.json backend/package-lock.json* ./backend/
RUN cd backend && npm install --omit=dev

# Copy app source
COPY backend ./backend
COPY frontend ./frontend

ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

CMD ["node", "backend/server.js"]

