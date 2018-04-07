// Use it like this:  
// const synth = require('pluggable-synth')
// But this is the test so include index
const pluggableSynth = require('./index')
const audioCtx = new AudioContext(); 

// This is just for this test synth
const adsrGain = require('adsr-gain-node')

// Helper function to get ADSR 
function getADSR (velocity) {

    let adsr = new adsrGain(audioCtx);
    adsr.setOptions({
        attackAmp: 0.001, 
        decayAmp: 0.1,
        sustainAmp: velocity,
        releaseAmp: 0.001,
        attackTime: 0.01,
        decayTime: 0.1,
        sustainTime: 1.0, 
        releaseTime: 2.0,
        autoRelease: false
    });
    return adsr
}


/**
 * A very simple example synth object
 * The synth which is going to be connected to the piano.
 * Implement a `start` and a `stop` method 
 */
function testSynth () {

    this.start = function (freq, options, velocity) {

        // If midi options are present use velocity from options
        if (options) {
            velocity = options.velocity
        } else {
            velocity = 0.3
        }

        this.oscillator = audioCtx.createOscillator();
        this.oscillator.type = 'square';
        this.oscillator.frequency.value = freq; // value in hertz

        this.adsr = getADSR(velocity);
        this.gainNode = this.adsr.getGainNode(audioCtx.currentTime);

        this.oscillator.connect(this.gainNode);
        this.gainNode.connect(audioCtx.destination);
        this.oscillator.start();
    }

    this.stop = function () {
        this.oscillator.stop(this.adsr.releaseTimeNow());
        this.adsr.releaseNow();
    }
}

document.addEventListener('DOMContentLoaded', function(){ 

    var elemID = 'piano-container'
    var p = new pluggableSynth(elemID, {
        octaves: 3, 
        octaveBegin: 3    
    })
    
    // Draws the piano
    p.createPiano()

    // Set synth to test synth above
    p.synth = testSynth
    
    // enable keyboard events
    p.enableKeyboardEvents()
    
    // Enable mouse events
    p.enableMouseEvents()
    
    // All midi tones will be played, but only 3 octaves is visible
    // You can specify input port, but defaults to 1 
    p.enableMidiEvents(1)

})
