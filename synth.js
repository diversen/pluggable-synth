const toneFrequency = require('tone-frequency');
const adsrGainNode = require('adsr-gain-node');

let audioCtx = new AudioContext(); 
let masterGain = audioCtx.createGain();

masterGain.gain.setTargetAtTime(0.3, audioCtx.currentTime, 0.0)
// masterGain.gain.value = 0.3;
masterGain.connect(audioCtx.destination);

function getBeatingOsc(audioCtx, freq, velocity) {

    this.osc1 = audioCtx.createOscillator();
    this.osc1.type = 'square';

    this.osc2 = audioCtx.createOscillator();
    this.osc2.type = 'square';
    
    this.osc3 = audioCtx.createOscillator();
    this.osc3.type = 'square';

    let synthGain = new adsrGainNode(audioCtx);
    
    if (velocity === undefined) {
        velocity = 0.3
    } 
    
    
    synthGain.setOptions({
        initGain: 0.1, // Init gain on note
        maxGain: velocity, // Max gain on note
        attackTime: 1.0, // AttackTime. gain.init to gain.max in attackTime
        sustainTime: 0.2, // Sustain note in time
        releaseTime: 0.5 // Approximated end time. Calculated with secondsToTimeConstant()
    
    });
    
    this.gain = synthGain.getGainNode(audioCtx.currentTime);

    // this.osc1.frequency.value = freq // e.g. 400
    this.osc1.frequency.setValueAtTime(freq, audioCtx.currentTime)
    // this.osc2.frequency.value = freq + (freq*0.01) // Add a little
    this.osc2.frequency.setValueAtTime(freq, audioCtx.currentTime)

    this.osc1.connect(this.gain);
    this.osc2.connect(this.gain);
    this.gain.connect(masterGain);

    this.start = function() {
        this.osc1.start();
        this.osc2.start();
        this.osc3.start();
    }

    this.disconnect = function () {

        let length = audioCtx.currentTime + synthGain.getTotalLength();
        this.osc1.stop(length);
        this.osc2.stop(length);
        this.osc3.stop(length);
    }
}

function getMultiBeatingOsc () {

    this.start = function(freq, options) {

        let velocity = 0.3
        if (options) {
            velocity = options.velocity
        }

        toneFrequency.base = freq;
        this.synth1 = new getBeatingOsc(audioCtx, freq, velocity)
    
        let lowFreq = toneFrequency.getToneStep(+7)
        this.synth2 = new getBeatingOsc(audioCtx, lowFreq*2, velocity)
    
        let highFreq = toneFrequency.getToneStep(+12)
        this.synth3 = new getBeatingOsc(audioCtx, lowFreq*3, velocity)

        this.synth1.start();
        this.synth2.start();
        this.synth3.start();
    }

    this.stop = function () {
        this.synth1.disconnect();
        this.synth2.disconnect();
        //this.synth3.disconnect();
    }
}

module.exports = getMultiBeatingOsc
