# ---- deps/builder stage ----
FROM node:22-alpine AS deps
WORKDIR /app

# Install only what's needed for runtime (no dev deps)
COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force

# Copy app source (no .env)
COPY . .

# ---- runtime stage (distroless: tiny, no shell, non-root) ----
FROM gcr.io/distroless/nodejs20-debian12 AS runner
WORKDIR /app

# Environment hardening
ENV NODE_ENV=production
# Distroless runs as nonroot by default; be explicit:
USER nonroot:nonroot

# Copy node_modules and app code from builder
COPY --from=deps /app/node_modules ./node_modules
COPY --chown=nonroot:nonroot . .

# App port
EXPOSE 3000

# Default: run the API
ENTRYPOINT ["node", "app.js"]
# To run the seeder, override at runtime:
# docker run --rm --env MONGO_URI=... --entrypoint node <image> seed.js
