import Vue from 'vue';
import VueSlider from 'vue-slider-component';
import VcoModule from './vco-module.vue';
import VcfModule from './vcf-module.vue';

const vm = new Vue({
  el: '#app',
  components: {
    'vue-slider': VueSlider,
    'vco-module': VcoModule,
    'vcf-module': VcfModule,
  },
  data: {
    masterVolume: 60,
    opts: {
      height: 16,
      dotSize: 18,
    },
    audioContext: null,
    vco1: null,
    vco2: null,
    masterFilter: null,
    masterGain: {
      obj: null,
      volume: 80,
    },
    masterPanner: {
      obj: null,
      pan: 0,
    },
    isPlaying: false,
    pushingMidiNotes: [],
  },
  computed: {
    currentVolume: function () {
      return `Master Volume: ${this.masterGain.volume}`;
    },
  },
  watch: {
    pushingMidiNotes: function (val) {
      if (val.length !== 0) {
        this.changeFreqByMidiNoteNum(val[0]);
      }

      if (!this.isPlaying) {
        this.playOSC(); // Play!
      } else if (this.isPlaying && val.length === 0) {
        this.playOSC(); // STOP
      }
    },
  },
  created: function () {
    this.createAudioContext();
    this.setupNodes();
    this.addGlobalKeyListener();
  },
  mounted: function () {
    this.setupChildComponents();
  },
  methods: {
    getNewAudioContext: function () {
      try {
        return new AudioContext();
      } catch (e) {
        alert('Sorry, Web Audio API is not supported in this browser');
        return null;
      }
    },
    createAudioContext: function () {
      this.audioContext = this.getNewAudioContext();
    },
    setupNodes: function () {
      this.createNodes();
      this.connectNodes();
      this.loadNodesSettings();
    },
    createNodes: function () {
      this.masterGain.obj = this.audioContext.createGain();
      this.masterPanner.obj = this.audioContext.createStereoPanner();
    },
    connectNodes: function () {
      // MasterFilter -> MasterGain -> MasterPanner -> Output
      this.masterGain.obj
        .connect(this.masterPanner.obj)
        .connect(this.audioContext.destination);
    },
    loadNodesSettings: function () {
      this.masterGain.obj.gain.value = this.masterGain.volume / 100.0;
      this.masterPanner.obj.pan.value = this.masterPanner.pan / 100.0;
    },
    setupChildComponents: function () {
      // refs を取得するために、 mounted 内でおこなうのがポイント
      this.vco1 = this.$refs.vco1;
      this.vco2 = this.$refs.vco2;
      this.masterFilter = this.$refs.masterFilter;

      this.masterFilter.setup(this.audioContext, this.masterGain.obj);
      this.vco1.setup(this.audioContext, this.masterFilter.filterNode);
      this.vco2.setup(this.audioContext, this.masterFilter.filterNode);
    },
    playOSC: function () {
      this.isPlaying = !this.isPlaying;
      this.vco1.playOrStop();
      this.vco2.playOrStop();
    },
    addGlobalKeyListener: function () {
      document.onkeydown = this.whenKeyDown;
      document.onkeyup = this.whenKeyUp;
    },
    whenKeyDown: function (ev) {
      const pushedKey = ev.key;
      const midiNoteNum = this.keyToMidiNote(pushedKey);
      if (midiNoteNum == null) return;

      if (this.pushingMidiNotes.indexOf(midiNoteNum) === -1) {
        this.pushingMidiNotes.unshift(midiNoteNum);
      }
    },
    whenKeyUp: function (ev) {
      const pushedKey = ev.key;
      const midiNoteNum = this.keyToMidiNote(pushedKey);
      if (midiNoteNum == null) return;

      this.pushingMidiNotes = this.pushingMidiNotes.filter(key => key !== midiNoteNum);
    },
    changeFreqByMidiNoteNum: function (midiNoteNum) {
      if (midiNoteNum == null) return;

      const referenceFreq = 440.0;
      const midiNoteNumOfA4 = 69;

      const freq = referenceFreq * (2 ** ((midiNoteNum - midiNoteNumOfA4) / 12));

      this.vco1.freq = freq;
      this.vco2.freq = freq;
    },
    keyToMidiNote: function (key) {
      const assignMap = {
        z: 60, s: 61, x: 62, d: 63, c: 64, v: 65, g: 66, b: 67, h: 68, n: 69, j: 70, m: 71, ',': 72, l: 73, '.': 74, ';': 75, '/': 76, _: 77,
      };

      return assignMap[key];
    },
  },
});
