// peer connection
var pc = null;
var dc = null, dcInterval = null;

transcriptionOutput = document.getElementById('output');
start_btn = document.getElementById('start');
stop_btn = document.getElementById('stop');


var lastTrans = document.createElement('span');
lastTrans.innerText = '...';
lastTrans.classList.add('partial');
transcriptionOutput.appendChild(lastTrans);
var imcompleteTrans = '';


function btn_show_stop() {
    start_btn.classList.add('d-none');
    stop_btn.classList.remove('d-none');
}

function btn_show_start() {
    stop_btn.classList.add('d-none');
    start_btn.classList.remove('d-none');
}


function negotiate() {
    return pc.createOffer().then(function (offer) {
        return pc.setLocalDescription(offer);
    }).then(function () {
        return new Promise(function (resolve) {
            if (pc.iceGatheringState === 'complete') {
                resolve();
            } else {
                function checkState() {
                    if (pc.iceGatheringState === 'complete') {
                        pc.removeEventListener('icegatheringstatechange', checkState);
                        resolve();
                    }
                }

                pc.addEventListener('icegatheringstatechange', checkState);
            }
        });
    }).then(function () {
        var offer = pc.localDescription;
        console.log(offer.sdp);
        return fetch('/offer', {
            body: JSON.stringify({
                sdp: offer.sdp,
                type: offer.type,
            }),
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'POST'
        });
    }).then(function (response) {
        return response.json();
    }).then(function (answer) {
        console.log(answer.sdp);
        return pc.setRemoteDescription(answer);
    }).catch(function (e) {
        console.log(e);
        btn_show_start();
    });
}

function start() {
    btn_show_stop();

    var config = {
        sdpSemantics: 'unified-plan'
    };

    pc = new RTCPeerConnection(config);

    var parameters = {};

    dc = pc.createDataChannel('chat', parameters);
    dc.onclose = function () {
        clearInterval(dcInterval);
        console.log('Closed data channel');
        btn_show_start();
    };
    dc.onopen = function () {
        console.log('Opened data channel');
    };
    dc.onmessage = function (evt) {
        var msg = evt.data;
        if (msg.endsWith('\n')) {
            lastTrans.innerText = imcompleteTrans + msg.substring(0, msg.left - 1);
            lastTrans.classList.remove('partial');
            lastTrans = document.createElement('span');
            lastTrans.classList.add('partial');
            lastTrans.innerText = '...';
            transcriptionOutput.appendChild(lastTrans);

            imcompleteTrans = '';
        } else if (msg.endsWith('\r')) {
            lastTrans.innerText = imcompleteTrans + msg.substring(0, msg.left - 1) + '...';
            imcompleteTrans = '';
        } else {
            imcompleteTrans += msg;
        }
    };


    var constraints = {
        audio: true,
        video: false
    };

    navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
        stream.getTracks().forEach(function (track) {
            pc.addTrack(track, stream);
        });
        return negotiate();
    }, function (err) {
        console.log('Could not acquire media: ' + err);
        btn_show_start();
    });
}

function stop() {
    // close data channel
    if (dc) {
        dc.close();
    }

    // close transceivers
    if (pc.getTransceivers) {
        pc.getTransceivers().forEach(function (transceiver) {
            if (transceiver.stop) {
                transceiver.stop();
            }
        });
    }

    // close local audio / video
    pc.getSenders().forEach(function (sender) {
        sender.track.stop();
    });

    // close peer connection
    setTimeout(function () {
        pc.close();
    }, 500);
}

// function sdpFilterCodec(kind, codec, realSdp) {
//     var allowed = [];
//     var rtxRegex = new RegExp('a=fmtp:(\\d+) apt=(\\d+)\r$');
//     var codecRegex = new RegExp('a=rtpmap:([0-9]+) ' + escapeRegExp(codec));
//     var videoRegex = new RegExp('(m=' + kind + ' .*?)( ([0-9]+))*\\s*$');
//
//     var lines = realSdp.split('\n');
//
//     var isKind = false;
//     for (var i = 0; i < lines.length; i++) {
//         if (lines[i].startsWith('m=' + kind + ' ')) {
//             isKind = true;
//         } else if (lines[i].startsWith('m=')) {
//             isKind = false;
//         }
//
//         if (isKind) {
//             var match = lines[i].match(codecRegex);
//             if (match) {
//                 allowed.push(parseInt(match[1]));
//             }
//
//             match = lines[i].match(rtxRegex);
//             if (match && allowed.includes(parseInt(match[2]))) {
//                 allowed.push(parseInt(match[1]));
//             }
//         }
//     }
//
//     var skipRegex = 'a=(fmtp|rtcp-fb|rtpmap):([0-9]+)';
//     var sdp = '';
//
//     isKind = false;
//     for (var i = 0; i < lines.length; i++) {
//         if (lines[i].startsWith('m=' + kind + ' ')) {
//             isKind = true;
//         } else if (lines[i].startsWith('m=')) {
//             isKind = false;
//         }
//
//         if (isKind) {
//             var skipMatch = lines[i].match(skipRegex);
//             if (skipMatch && !allowed.includes(parseInt(skipMatch[2]))) {
//                 continue;
//             } else if (lines[i].match(videoRegex)) {
//                 sdp += lines[i].replace(videoRegex, '$1 ' + allowed.join(' ')) + '\n';
//             } else {
//                 sdp += lines[i] + '\n';
//             }
//         } else {
//             sdp += lines[i] + '\n';
//         }
//     }
//
//     return sdp;
// }
//
// function escapeRegExp(string) {
//     return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
// }
