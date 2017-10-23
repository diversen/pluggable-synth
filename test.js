// Use it like this:  
// const synth = require('pluggable-synth')
// But this is the test
const pluggableSynth = require('./index')
const audioCtx = new AudioContext(); 
const masterGain = audioCtx.createGain();
masterGain.gain.value = 0.1;

/**
 * A simple test synth
 * The synth which is going to be connected to the piano
 * must have a `start` and a `stop` method 
 */
function testSynth () {

    this.start = function (freq, options) {
        this.oscillator = audioCtx.createOscillator();
        this.oscillator.type = 'square';
        this.oscillator.frequency.value = freq; // value in hertz
        this.oscillator.connect(masterGain);
        masterGain.connect(audioCtx.destination);
        this.oscillator.start();
    }

    this.stop = function () {
        this.oscillator.stop();
    }
}

var testSynth2 = require('./synth') 

$(document).ready(function () {

    var elemID = 'piano-container'
    var p = new pluggableSynth(elemID, {
        octaves: 2,
        octaveBegin: 3    
    })
    
    // Draws piano
    p.createPiano()

    // Set synth
    p.synth = testSynth2
    
    // Enable one octave of keyboard
    p.enableKeyboardEvents()
    
    // All midi tones will be played, but only two octaves is visiable
    p.enableMidiEvents()

})