all: build

build:
	docker build -t danijel3/kaldi-onlinefork:aspire .

remove:
	docker rmi danijel3/kaldi-onlinefork:aspire

rebuild: remove build

upload:
	docker push danijel3/kaldi-onlinefork:aspire
