import Vue from 'vue';
import VueSlider from 'vue-slider-component';

const vm = new Vue({
  el: '#app',
  components: {
    'vue-slider': VueSlider,
  },
  data: {
    masterVolume: 60,
    opts: {
      height: 16,
      dotSize: 18,
    },
    audioContext: null,
    osc1: {
      obj: null,
      type: 'triangle',
      freq: 440,
    },
    osc2: {
      obj: null,
      type: 'sine',
      freq: 448,
    },
    filter1: null,
    filter2: null,
    gain1: null,
    gain2: null,
    masterFilter: null,
    masterGain: null,
    masterPanner: null,
    isPlaying: false,
  },
  created: function () {
    this.createAudioContext();
  },
  watch: {
    masterVolume: function (val) {
      this.setMasterVolume(val);
    },
  },
  computed: {
    currentVolume: function () {
      // console.log(this.masterVolume);
      return `Master Volume: ${this.masterVolume}`;
    },
  },
  methods: {
    getNewAudioContext: function () {
      try {
        // Fix up for prefixing
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
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
      this.reflectNodesSettings();
    },
    createNodes: function () {
      // stop させると再度 start できないので、基本的に毎回作り直す
      this.osc1.obj = this.audioContext.createOscillator();
      this.osc2.obj = this.audioContext.createOscillator();

      this.filter1 = this.audioContext.createBiquadFilter();
      this.filter2 = this.audioContext.createBiquadFilter();
      this.masterFilter = this.audioContext.createBiquadFilter();

      this.gain1 = this.audioContext.createGain();
      this.gain2 = this.audioContext.createGain();
      this.masterGain = this.audioContext.createGain();

      this.masterPanner = this.audioContext.createStereoPanner();
    },
    connectNodes: function() {
      // OSC1 -> Filter1 -> Gain1 -> MasterFilter
      this.osc1.obj.connect(this.filter1);
      this.filter1.connect(this.gain1);
      this.gain1.connect(this.masterFilter);

      // OSC2 -> Filter2 -> Gain2 -> MasterFilter
      this.osc2.obj.connect(this.filter2);
      this.filter2.connect(this.gain2);
      this.gain2.connect(this.masterFilter);

      // MasterFilter -> MasterGain -> MasterPanner -> Output
      this.masterFilter.connect(this.masterGain);
      this.masterGain.connect(this.masterPanner);
      this.masterPanner.connect(this.audioContext.destination);
    },
    reflectNodesSettings: function () {
      /**
       * 波形:
       *  "sine" : サイン波
       *  "square" : 矩形波
       *  "sawtooth":鋸歯状波
       *  "triangle":三角波
       */
      this.osc1.obj.type = this.osc1.type;
      this.osc1.obj.frequency.value = this.osc1.freq;

      this.osc2.obj.type = this.osc2.type;
      this.osc2.obj.frequency.value = this.osc2.freq;
    },
    playOSC: function (freq = 440.0, type = "sine", with_gain = false) {
      if (this.isPlaying) {
        this.isPlaying = false;
        // オシレーター動作
        this.osc1.obj.stop();
        this.osc2.obj.stop();
      } else {
        this.setupNodes();

        this.isPlaying = true;
        // オシレーター動作
        this.osc1.obj.start();
        this.osc2.obj.start();
      }
    },
    setMasterVolume: function (vol) {
      this.masterGain = this.masterGain || this.audioContext.createGain();
      this.masterGain.gain.value = vol / 100.0;
    },
  },
});
