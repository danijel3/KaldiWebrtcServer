# About the Docker setup

There are 3 basic image categories:

* all the Kaldi programs compiled and ready to use stored as *danijel3/kaldi-onlinefork*
* the above image plus a model, for example *danijel3/kaldi-onlinefork:aspire* (there can be many different models)
* the web server (which inludes the HTTP and the WebRTC server as described in this repo) stored as *danijel3/kaldi-webrtc*

To run the server you need the last two images: the model+Kaldi and the webrtc server. They need to be connected to each 
other through a common network. You can have many Kaldi instances, but need only one webrtc server.

## Making your own Kaldi+model image

You can use the sample given in the [model](model) directory. To prepare the image you only need to create a *model* 
subirectory there (so *model/model*) and put two subdirectories inside:
* model (ie. *model/model/model*) is for the online acoustic model and contains the following files (usually you get
this folder by running the *steps/online/prepare_online_decoding.sh* script):
	* final.mdl
	* tree 
	* conf subdirectory
	* ivectror_extractor subdirectory
* graph is for the language model, ie HCLG transducer, with the following files:
	* HCLG.fst
	* words.txt

The model configuration files need to be modified so that the paths inside all point to as if the model dir is stored in the
root dir, eg:
* /model/model/ivector_extractor/final.mat
* /model/model/conf/splice.conf
* /model/model/conf/online_cmvn.conf 

Once you create such a folder, you can build the image by running the following command: `docker build -t mymodel .`

(You can change the `mymodel` tag to anything you prefer)

To test the image, you can run it on its own: `docker run --rm -p 5050:5050 mymodel`

Once it's running you can feed it some data using netcat: `nc localhost:5050 < audio.raw`

More instructions on how to use the online decoder with netcat is available at the bottom of 
[this](https://github.com/danijel3/kaldi/blob/master/src/doc/online_decoding.dox) document.