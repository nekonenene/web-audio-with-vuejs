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
      type: 'square',
      freq: 440,
    },
    osc2: {
      obj: null,
      type: 'sine',
      freq: 440,
    },
    gain1: {
      obj: null,
      volume: 50,
    },
    gain2: {
      obj: null,
      volume: 50,
    },
    masterFilter: null,
    masterGain: {
      obj: null,
      volume: 80,
    },
    masterPanner: null,
    isPlaying: false,
  },
  created: function () {
    this.createAudioContext();
  },
  watch: {
  },
  computed: {
    currentVolume: function () {
      return `Master Volume: ${this.masterGain.volume}`;
    },
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
      this.reflectNodesSettings();
    },
    createNodes: function () {
      // stop させると再度 start できないので、基本的に毎回作り直す
      this.osc1.obj = this.audioContext.createOscillator();
      this.osc2.obj = this.audioContext.createOscillator();

      this.masterFilter = this.audioContext.createBiquadFilter();

      this.gain1.obj = this.audioContext.createGain();
      this.gain2.obj = this.audioContext.createGain();
      this.masterGain.obj = this.audioContext.createGain();

      this.masterPanner = this.audioContext.createStereoPanner();
    },
    connectNodes: function() {
      // OSC1 -> Gain1 -> MasterFilter
      this.osc1.obj.connect(this.gain1.obj);
      this.gain1.obj.connect(this.masterGain.obj);

      // OSC2 -> Gain2 -> MasterFilter
      this.osc2.obj.connect(this.gain2.obj);
      this.gain2.obj.connect(this.masterGain.obj);

      // MasterFilter -> MasterGain -> MasterPanner -> Output
      // this.masterFilter.connect(this.masterGain.obj);
      this.masterGain.obj.connect(this.masterPanner);
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

      this.gain1.obj.gain.value = this.gain1.volume / 100.0;
      this.gain2.obj.gain.value = this.gain2.volume / 100.0;
      this.masterGain.obj.gain.value = this.masterGain.volume / 100.0;
    },
    playOSC: function () {
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
  },
});
