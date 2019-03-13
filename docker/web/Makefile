all: build

build:
	docker build -t danijel3/kaldi-webrtc .

remove:
	docker rmi danijel3/kaldi-webrtc

rebuild: remove build

upload:
	docker push danijel3/kaldi-webrtc
