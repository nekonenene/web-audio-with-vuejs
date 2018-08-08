import Vue from 'vue';
import VueSlider from 'vue-slider-component';

window.onload = () => {
  $('.output').html('出力部<br>');
  console.log('hoge');
};

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

const vm = new Vue({
  el: '#app',
  components: {
    'vue-slider': VueSlider,
  },
  data: {
    value1: 20,
    value2: 40,
    opts: {
      height: 16,
      dotSize: 18,
    },
    audioContext: null,
    oscNode: null,
    playBtnTxt: "Play",
  },
  created: function () {
    this.audioContext = getAudioContext();
  },
  watch: {
    value1: function (val) {
      // console.log(val);
      this.playOSC(440.0);
    },
    oscNode: function () {
      if (this.oscNode == null) {
        this.playBtnTxt = "Play";
      } else {
        this.playBtnTxt = "Stop";
      }
    },
  },
  computed: {
    xxx: function () {
      // console.log(this.value1);
      return `value1: ${this.value1}`
    },
  },
  methods: {
    playOSC: function (freq = 440.0, type = "sine") {
      if (this.oscNode != null) {
        this.oscNode.stop();
        this.oscNode = null;
        return;
      }

      this.oscNode = this.audioContext.createOscillator();

      /**
       * 波形:
       *  "sine" : サイン波
       *  "square" : 矩形波
       *  "sawtooth":鋸歯状波
       *  "triangle":三角波
       */
      this.oscNode.type = type;
      // オシレーターの周波数を決定
      this.oscNode.frequency.value = freq;
      // オシレーターを最終出力に接続
      this.oscNode.connect(this.audioContext.destination);
      // オシレーター動作
      this.oscNode.start();
    },
  },
});
