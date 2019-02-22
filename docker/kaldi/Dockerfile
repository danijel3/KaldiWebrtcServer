FROM debian:testing
MAINTAINER Danijel Koržinek <danijel.korzinek@pja.edu.pl>

RUN apt-get update && \
            apt-get install -y g++ zlib1g-dev make automake libtool-bin git autoconf gawk unzip && \
            apt-get install -y subversion libatlas-base-dev bzip2 wget python2.7 python3 python3-pip sox && \
            apt-get clean && apt-get autoclean && rm -rf /var/lib/apt/lists/* && \
            ln -s -f bash /bin/sh && ln -s -f /usr/bin/python2.7 /usr/bin/python2

RUN git clone https://github.com/danijel3/kaldi /kaldi

RUN cd /kaldi/tools && make && find -name *.o -delete

RUN cd /kaldi/src && ./configure --shared

RUN sed -i "s/-g /-Ofast -fomit-frame-pointer -funroll-loops/g" /kaldi/src/kaldi.mk

RUN cd /kaldi/src && make -j8 depend && make -j8 && find -name *.o -delete

RUN apt-get -y autoremove && apt-get -y clean && apt-get -y autoclean

ENTRYPOINT ["/bin/bash","-c"]