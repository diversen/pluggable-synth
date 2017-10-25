// Use it like this:  
// const synth = require('pluggable-synth')
// But this is the test so include index
const pluggableSynth = require('./index')

const audioCtx = new AudioContext(); 
const masterGain = audioCtx.createGain();
masterGain.gain.value = 0.1;

/**
 * A very simple example synth object
 * The synth which is going to be connected to the piano.
 * Implement a `start` and a `stop` method 
 * 
 * 
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

// Use a more interesting synth
var testSynth2 = require('./synth') 

$(document).ready(function () {

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
