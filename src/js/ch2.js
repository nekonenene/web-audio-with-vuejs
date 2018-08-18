import Vue from 'vue';
import VueSlider from 'vue-slider-component';

const getAudioContext = () => {
  try {
    // Fix up for prefixing
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    return new AudioContext();
  } catch (e) {
    alert('Sorry, Web Audio API is not supported in this browser');
    return null;
  }
};

new Vue({
  el: '#app',
  components: {
    'vue-slider': VueSlider,
  },
  data: {
    volume: 60,
    opts: {
      height: 16,
      dotSize: 18,
    },
    audioContext: null,
    oscMain: null,
    gainMain: null,
    playBtnTxt: 'Play',
  },
  computed: {
    currentVolume: function () {
      // console.log(this.volume);
      return `Volume: ${this.volume}`;
    },
  },
  watch: {
    volume: function (val) {
      this.setVolume(val);
    },
    oscMain: function () {
      if (this.oscMain == null) {
        this.playBtnTxt = 'Play';
      } else {
        this.playBtnTxt = 'Stop';
      }
    },
  },
  created: function () {
    this.audioContext = getAudioContext();
  },
  methods: {
    playOSC: function (freq = 440.0, type = 'sine') {
      if (this.oscMain != null) {
        this.oscMain.stop();
        this.oscMain = null;
        return;
      }

      this.oscMain = this.audioContext.createOscillator();

      /**
       * 波形:
       *  "sine" : サイン波
       *  "square" : 矩形波
       *  "sawtooth":鋸歯状波
       *  "triangle":三角波
       */
      this.oscMain.type = type;
      // オシレーターの周波数を決定
      this.oscMain.frequency.value = freq;

      this.gainMain = this.gainMain || this.audioContext.createGain();
      this.gainMain.gain.value = this.volume / 100.0;

      // オシレーターをゲインにつなぎ、ゲインを最終出力に接続
      this.oscMain.connect(this.gainMain);
      this.gainMain.connect(this.audioContext.destination);

      // オシレーター動作
      this.oscMain.start();
    },
    setVolume: function (vol) {
      this.gainMain = this.gainMain || this.audioContext.createGain();
      this.gainMain.gain.value = vol / 100.0;
    },
  },
});
