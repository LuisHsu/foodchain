FROM node:14

RUN groupmod -n foodchain node \
    && usermod node -l foodchain -d /foodchain -m

COPY ./backend/ /foodchain/

COPY ./frontend/ /frontend

RUN cd /frontend && npm install && npm run build -- -o /foodchain/public && cd /foodchain && rm -rf /frontend

RUN cd /foodchain && npm install

USER foodchain

WORKDIR /foodchain

CMD ["npm", "start"]