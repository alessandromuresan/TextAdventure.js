const { workerData, parentPort } = require('worker_threads');
const playSound = require('play-sound');

console.log('workerData:');
console.log(workerData);

const player = playSound({});

const mplayerParameters = ['-volume', workerData.volume];

if (workerData.loop) {
    mplayerParameters.push('-loop');
    mplayerParameters.push('0');
}

player.play(workerData.soundFile, { mplayer: mplayerParameters }, (err: any) => {

    if (err) {
        throw err;
    }
});

parentPort.postMessage({ success: true });
