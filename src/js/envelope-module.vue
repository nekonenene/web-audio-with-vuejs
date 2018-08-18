<template lang="pug">
.container
  .row
    .col-md-6
      .row
        .col-md-3
          | attack
        .col-md-9
          vue-slider(v-model="attack" :height="sliderOpts.height" :dot-size="sliderOpts.dotSize" :tooltip-dir="sliderOpts.tipPosition" :max="maxAttack" :interval="0.01")
    .col-md-6
      .row
        .col-md-3
          | decay
        .col-md-9
          vue-slider(v-model="decay" :height="sliderOpts.height" :dot-size="sliderOpts.dotSize" :tooltip-dir="sliderOpts.tipPosition" :max="maxDecay" :interval="0.01")
  .row
    .col-md-6
      .row
        .col-md-3
          | sustain
        .col-md-9
          vue-slider(v-model="sustain" :height="sliderOpts.height" :dot-size="sliderOpts.dotSize" :tooltip-dir="sliderOpts.tipPosition" :max="maxSustain" :interval="0.01")
    .col-md-6
      .row
        .col-md-3
          | release
        .col-md-9
          vue-slider(v-model="release" :height="sliderOpts.height" :dot-size="sliderOpts.dotSize" :tooltip-dir="sliderOpts.tipPosition" :max="maxRelease" :interval="0.01")
</template>

<script>
import VueSlider from 'vue-slider-component';
import Const from './constants.js';

export default {
  name: 'EnvelopeModule',
  components: {
    'vue-slider': VueSlider,
  },
  props: {
    initialAttack: {
      type: Number,
      default: 0,
    },
    initialDecay: {
      type: Number,
      default: 0,
    },
    initialSustain: {
      type: Number,
      default: 1,
    },
    initialRelease: {
      type: Number,
      default: 0.01,
    },
    maxAttack: {
      type: Number,
      default: 2.0,
    },
    maxDecay: {
      type: Number,
      default: 2.0,
    },
    maxSustain: {
      type: Number,
      default: 1.0,
    },
    maxRelease: {
      type: Number,
      default: 2.0,
    },
    sliderHeight: {
      type: Number,
      default: 16,
    },
    sliderDotSize: {
      type: Number,
      default: 18,
    },
    sliderTipPosition: {
      type: [String, Array],
      default: 'right',
    },
  },
  mixins: [ Const ],
  data () {
    return {
      audioContext: null,
      destination: null,
      gainNode: null,
      attack: this.initialAttack,
      decay: this.initialDecay,
      sustain: this.initialSustain,
      release: this.initialRelease,
      sliderOpts: {
        height: this.sliderHeight,
        dotSize: this.sliderDotSize,
        tipPosition: this.sliderTipPosition,
      },
      doneSetup: false,
    };
  },
  created: function () {
  },
  methods: {
    setup: function (audioContext = this.audioContext, destination = this.destination) {
      this.audioContext = audioContext;
      this.destination = destination;

      this.gainNode = audioContext.createGain();
      this.gainNode.gain.value = Const.GAIN_MIN;
      this.gainNode.connect(destination);

      this.doneSetup = true;
    },
    whenNoteOn: function () {
      if (!this.doneSetup) return;

      const currentTime = this.audioContext.currentTime;
      const attackEndAt = currentTime + this.attack;
      const gain = this.gainNode.gain;

      gain.cancelScheduledValues(currentTime);
      gain.setValueAtTime(gain.value, currentTime);

      // 与えられた時間(attackEndAt)に gain が 1.0 になるように線形増加
      gain.linearRampToValueAtTime(Const.GAIN_MAX, attackEndAt);
      // sustain の値になるよう、 attackEndAt から decay 時間かけて曲線変動
      if (this.decay === 0) {
        gain.setTargetAtTime(this.sustain, attackEndAt, 0);
      } else if (this.decay > 0) {
        gain.setTargetAtTime(this.sustain, attackEndAt, this.decay / Const.DIV_TO_TIME_CONSTANT);
        // なぜか setValueCurveAtTime に cancelScheduledValues が効かないのでコメントアウト
        // gain.setValueCurveAtTime(new Float32Array([1.0, this.sustain]), attackEndAt, this.decay);
      }
    },
    whenNoteOff: function () {
      if (!this.doneSetup) return;

      const currentTime = this.audioContext.currentTime;
      const releaseEndAt = currentTime + this.release;
      const gain = this.gainNode.gain;

      gain.cancelScheduledValues(currentTime);
      gain.setValueAtTime(gain.value, currentTime);

      // gain が 0 になるよう、 currentTime から release 時間かけて曲線変動
      if (this.release === 0) {
        gain.setTargetAtTime(Const.GAIN_MIN, currentTime, 0);
      } else if (this.release > 0) {
        gain.setTargetAtTime(Const.GAIN_MIN, currentTime, this.release / Const.DIV_TO_TIME_CONSTANT);
        // なぜか setValueCurveAtTime に cancelScheduledValues が効かないのでコメントアウト
        // gain.setValueCurveAtTime(new Float32Array([gain.value, 0.0]), currentTime, this.release);
      }
    },
  },
};
</script>
