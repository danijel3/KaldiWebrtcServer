all: build

build:
	docker build -t danijel3/kaldi-online-tcp:aspire .

remove:
	docker rmi danijel3/kaldi-online-tcp:aspire

rebuild: remove build

upload:
	docker push danijel3/kaldi-online-tcp:aspire
