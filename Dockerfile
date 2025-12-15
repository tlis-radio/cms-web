# Multi-stage build for Next.js
FROM node:24.0.1-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy source and build
COPY . .

ARG NEXT_PUBLIC_DIRECTUS_URL
ARG NEXT_PUBLIC_ANALYTICS_ID
ARG NEXT_PUBLIC_ANALYTICS_URL
ARG NEXT_PUBLIC_SITE_URL

ENV NEXT_PUBLIC_DIRECTUS_URL=$NEXT_PUBLIC_DIRECTUS_URL \
    NEXT_PUBLIC_ANALYTICS_ID=$NEXT_PUBLIC_ANALYTICS_ID \
    NEXT_PUBLIC_ANALYTICS_URL=$NEXT_PUBLIC_ANALYTICS_URL \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL


RUN npm run build

# Remove dev deps to keep node_modules lean for final image
RUN npm prune --production


FROM node:24.0.1-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy only what is needed to run the app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./next.config.mjs

EXPOSE 3000
CMD ["npm", "run", "start"]