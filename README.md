# Kaldi WebRTC server demo

![](demo.gif)

This is a demonstration of realtime online speech recognition using the [Kaldi](https://kaldi-asr.org) 
speech recognition toolkit. 

It uses WebRTC to communicate between the server and the browser. It sends audio from the 
user's microphone using the WebRTC audio track and sends text from the server to the browser using the WebRTC datachannel
(most commonly used for sending chat messages).

The server program is written in Python. It uses aiohttp to display the web-page and serve other static data (javascript,
CSS. images). For WebRTC functionality it uses the excellent [aiortc](https://github.com/aiortc/aiortc) library. The 
system requires only one Python server running, but supports multiple Kaldi instances in the background. Once it receives
a request from the browser it opens a connection to the Kaldi engine and keeps forwarding audio and text between Kaldi
and the user's browser.

# Usage

The easiest way to use this program is with Docker, as described below. The following section explains how the program
available here works.

The server loads a JSON configuration file as an argument to the program. The configuration file defines the hosts and
ports of the Kaldi engines, as well as their samplerate (different models can have different sample rates).

In the future, I plan to add the option to include different types of engines (eg. for different languages) that can be 
picked from the website.

After loading the configuration, the server creates a queue and simply takes engines from the queue as they are requested.
If the queue gets exhausted, an error 500 is returned. Simply put, you need as many engines runnning, as the number of
concurrent browser sessions you intend to support.

## Kaldi

This server relies on the connection with the `online2-tcp-nnet3-decode-faster` program. If you want to install it on 
your own, please follow the official instructions for installing Kaldi. You can find a brief version of that in 
[docker/kaldi/Dockerfile](docker/kaldi/Dockerfile).

## Docker

This is the simplest way of setting up and testing this project. I have created a couple of Docker images with all the
neccessary components and uploaded them to docker hub. In order to use them, you don't need to copy anything from this
repository. You just need to have Docker installed and run the commands as described below.

In addition to Docker, you will need to have the `docker-compose` program installed. This program allows to easily start
several containers at once simply by changing the configuration in a yml file. A sample is provided in 
[docker/docker-compose.yml](docker/docker-compose.yml).

To run the server, simply copy the [docker/docker-compose.yml](docker/docker-compose.yml) and the required 
[docker/servers.json](docker/servers.json) files into a folder of your choice and run: `docker-compose up -d`

First time you run it, the program will download the images from Dockerhub so it may take a little while. Once it's running,
you can run `docker-compose logs -f` to monitor the logs of the running servers.

At any time you can run `docker-compose stop` to temporarily shutdown and `docker-compose start` to restart the service.
Finally, you can run `docker-compose down` to stop and remove the containers altogether.

If you want to set up more Kaldi engines, you need to edit both the `docker-compose.yml` and `servers.json` files.

More details on the dockerfiles is provided in [this](docker/README.md) document. 
