import argparse
import json
from pathlib import Path

from aiohttp import web
from aiohttp.web_exceptions import HTTPServiceUnavailable
from aiortc import RTCSessionDescription, RTCPeerConnection

from kaldi import KaldiSink, kaldi_server_queue

ROOT = Path(__file__).parent

audio_debug_file = None

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

    kaldi = KaldiSink(pc, kaldi_server, audio_debug_file)

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

    return web.Response(
        content_type='application/json',
        text=json.dumps({
            'sdp': pc.localDescription.sdp,
            'type': pc.localDescription.type
        }))


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--servers', help='Server configuration JSON')
    parser.add_argument('--audio-debug', help='Filename to store raw audio being sent to Kaldi.')

    args = parser.parse_args()

    if args.audio_debug:
        audio_debug_file = open(args.audio_debug, 'wb')

    app = web.Application()
    app.router.add_get('/', index)
    app.router.add_post('/offer', offer)
    app.router.add_static('/static/', path=ROOT / 'static', name='static')

    kaldi_server_queue.load(args.servers)

    web.run_app(app, port=8080)
