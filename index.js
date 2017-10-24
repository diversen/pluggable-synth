const noteParser = require('note-parser')
const keyboardTones = require('./keyboard-tones.js');
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

        this.toggleKey(note)
        let freq = this.getFrequency(note);
        let synth = new this.synth();

        synth.start(freq, options);
        keys[note] = synth;
    },

    synthStop: function (note) {

        this.toggleKey(note)
        let synth = keys[note]
        synth.stop()
        delete keys[note]
    },

    // Enable only one octave on keyboard
    enableKeyboardEvents: function () {
        document.addEventListener("keydown", (e) => {

            var k = e.code;
            let note = keyboardTones[k] + this.options.octaveBegin

            if (k in keyboardTones && !(note in keys)) {
                this.synthStart(note);
            }
        });

        document.addEventListener("keyup", (e) => {
            let octave = this.options.octaveBegin
            var k = e.code;
            let note = keyboardTones[k] + octave;
            if (k in keyboardTones && (note in keys)) {
                this.synthStop(note)
            }
        });
    },
    
    // Enable mousedown and mouseup
    enableMouseEvents: function () {
        
        document.addEventListener("mousedown", (e) => {
            
            var note = e.srcElement.dataset.note;
            if (!note) {
                return;
            }

            this.synthStart(note);
        });

        document.addEventListener("mouseup", (e) => {

            var note = e.srcElement.dataset.note;
            if (note in keys) {
                this.synthStop(note)
            }
        });

        document.addEventListener("mouseout", (e) => {
            
            var note = e.srcElement.dataset.note;
            if (!note) {
                return;
            }
            
            if (note in keys) {
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
