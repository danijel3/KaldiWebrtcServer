FROM debian:testing
MAINTAINER Danijel Koržinek <danijel.korzinek@pja.edu.pl>

RUN apt-get update && \
            apt-get install -y python3 python3-pip git &&\
            apt-get clean && apt-get autoclean

RUN pip install aiortc aiohttp

RUN git clone https://github.com/danijel3/KaldiWebrtcServer /server

ENTRYPOINT ["python3","/server/server.py","--servers","/server/servers.json"]