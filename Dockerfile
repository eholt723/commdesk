# Stage 1: build the React frontend
FROM node:20-alpine AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Stage 2: compile the TypeScript backend
FROM node:20-alpine AS server-build
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci
COPY server/ ./
RUN npm run build

# Stage 3: production image
FROM node:20-alpine AS production
WORKDIR /app

# Copy compiled server
COPY --from=server-build /app/server/dist ./dist
COPY --from=server-build /app/server/node_modules ./node_modules
COPY server/package.json ./

# Copy built client into public/ so Express can serve it
COPY --from=client-build /app/client/dist ./public

ENV NODE_ENV=production
# HF Spaces requires port 7860
ENV PORT=7860

EXPOSE 7860

CMD ["node", "dist/index.js"]
