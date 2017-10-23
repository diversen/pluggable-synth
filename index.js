const noteParser = require('note-parser')
const octave1 = require('./keyboard-tones.js').octave1;
const jsCssPiano = require('js-css-piano');
const webmidi = require('webmidi')


var keys = {};

jsCssPiano.prototype = {

    getFrequency: function (note) {
        note = note.replace('s', '#');
        let res = noteParser.parse(note)
        let freq = res.freq;
        return freq;
    },

    synth: function () {
        console.log('set a synth')
    },

    toggleKey: function (note) {
        let selector = '#' + this.elemID + " > .piano li[data-note='" + note + "']"
        let elem = document.querySelector(selector)
        if (!elem) {
            return
        }
        elem.classList.toggle('active');
    },

    synthStart: function (note, options) {
        note = note.toLowerCase()
        this.toggleKey(note)
        let freq = this.getFrequency(note);
        let synth = new this.synth();

        synth.start(freq, options);
        keys[note] = synth;
    },

    synthStop: function (note) {
        note = note.toLowerCase()
        this.toggleKey(note)
        let synth = keys[note]
        synth.stop()
        delete keys[note]
    },

    // Enable one or two octaves on keyboard
    enableKeyboardEvents: function () {
        document.addEventListener("keydown", (e) => {

            var k = e.key;
            let note = octave1[k] + this.options.octaveBegin

            if (k in octave1 && !(note in keys)) {
                this.synthStart(note);
            }
        });

        document.addEventListener("keyup", (e) => {

            let octave = this.options.octaveBegin
            var k = e.key;
            let note = octave1[k] + octave;
            if (k in octave1 && (note in keys)) {
                this.synthStop(note)
            }
        });
    },

    // Enable midi keyboard
    enableMidiEvents: function (port) {
        if (port == undefined) {
            port = 1
        }

        webmidi.enable( (err) => {

            if (err) {
                console.log("WebMidi could not be enabled." + err);
                return false;
            }

            if ( !(port in webmidi.inputs)) {
               console.log('Modi port does not exists ' + port)
               return false;
            }

            // Port is ok
            var midiInput = webmidi.inputs[port];
            midiInput.addListener('noteon', "all", (e) => {

                let octave = parseInt(e.note.octave)
                let note = e.note.name + octave
                note = note.replace('#', 's')

                if (!(note in keys)) {
                    this.synthStart(note, e);
                }
            });

            midiInput.addListener('noteoff', "all", (e) => {
                let octave = parseInt(e.note.octave);
                let note = e.note.name + octave;

                note = note.replace('#', 's')

                this.synthStop(note)

            });
        })
    },
}

module.exports = jsCssPiano;
