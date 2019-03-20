FROM debian:testing
MAINTAINER Danijel Koržinek <danijel.korzinek@pja.edu.pl>

RUN apt-get update && \
		apt-get install -y g++ zlib1g-dev make automake libtool-bin git autoconf gawk unzip && \
		apt-get install -y subversion libatlas-base-dev bzip2 wget python2.7 python3 python3-pip sox && \
		apt-get -y autoremove && apt-get -y clean && apt-get -y autoclean && rm -rf /var/lib/apt/lists/* && \
		ln -s -f bash /bin/sh && ln -s -f /usr/bin/python2.7 /usr/bin/python2

RUN git clone https://github.com/kaldi-asr/kaldi /kaldi && \
		cd /kaldi/tools && make && find -name *.o -delete && \
		cd /kaldi/src && ./configure && \
		sed -i "s/-g /-O3 /g" /kaldi/src/kaldi.mk && \
		cd /kaldi/src && make -j8 depend && make -j8 && \
		cd / && cp /kaldi/src/online2bin/online2-tcp-nnet3-decode-faster /usr/bin && \
		cp -a /kaldi/tools/openfst/lib/libfst.so* /usr/lib/x86_64-linux-gnu && \
		rm -rf /kaldi

ENTRYPOINT ["/bin/bash","-c"]