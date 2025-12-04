FROM node:24

WORKDIR /app

RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*


COPY package.json ./
COPY . .
COPY prisma ./prisma

RUN npm install
RUN npx prisma generate


COPY entrypoint.sh .

RUN chmod +x entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["./entrypoint.sh"]
CMD ["npm", "run", "dev"]

