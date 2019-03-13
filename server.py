import argparse
import json
import logging
import sys
from pathlib import Path

from aiohttp import web
from aiohttp.web_exceptions import HTTPServiceUnavailable
from aiortc import RTCSessionDescription, RTCPeerConnection

from kaldi import KaldiSink, kaldi_server_queue

ROOT = Path(__file__).parent

root = logging.getLogger()
root.setLevel(logging.INFO)

handler = logging.StreamHandler(sys.stdout)
handler.setLevel(logging.INFO)
formatter = logging.Formatter('[%(asctime)s] %(name)s <%(levelname)s> %(message)s')
handler.setFormatter(formatter)
root.addHandler(handler)


async def index(request):
    content = open(str(ROOT / 'static' / 'index.html')).read()
    return web.Response(content_type='text/html', text=content)


async def offer(request):
    kaldi_server = await kaldi_server_queue.get()
    if not kaldi_server:
        raise HTTPServiceUnavailable()

    params = await request.json()
    offer = RTCSessionDescription(
        sdp=params['sdp'],
        type=params['type'])

    pc = RTCPeerConnection()

    kaldi = KaldiSink(pc, kaldi_server)

    @pc.on('datachannel')
    async def on_datachannel(channel):
        await kaldi.set_text_channel(channel)

    @pc.on('iceconnectionstatechange')
    async def on_iceconnectionstatechange():
        if pc.iceConnectionState == 'failed':
            await pc.close()

    @pc.on('track')
    async def on_track(track):
        if track.kind == 'audio':
            await kaldi.set_audio_track(track)

        @track.on('ended')
        async def on_ended():
            await kaldi.stop()

    await pc.setRemoteDescription(offer)
    answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)

    await kaldi.start()

    return web.Response(
        content_type='application/json',
        text=json.dumps({
            'sdp': pc.localDescription.sdp,
            'type': pc.localDescription.type
        }))


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--servers', help='Server configuration JSON')

    args = parser.parse_args()

    app = web.Application()
    app.router.add_get('/', index)
    app.router.add_post('/offer', offer)
    app.router.add_static('/static/', path=ROOT / 'static', name='static')

    kaldi_server_queue.load(args.servers)

    web.run_app(app, port=8080)
