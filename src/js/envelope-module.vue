<template lang="pug">
.container
  .row
    .col-md-6
      .row
        .col-md-3
          | attack
        .col-md-9
          vue-slider(v-model="attack" :height="sliderOpts.height" :dot-size="sliderOpts.dotSize" :tooltip-dir="sliderOpts.tipPosition" :max="2" :interval="0.01")
    .col-md-6
      .row
        .col-md-3
          | decay
        .col-md-9
          vue-slider(v-model="decay" :height="sliderOpts.height" :dot-size="sliderOpts.dotSize" :tooltip-dir="sliderOpts.tipPosition" :max="2" :interval="0.01")
  .row
    .col-md-6
      .row
        .col-md-3
          | sustain
        .col-md-9
          vue-slider(v-model="sustain" :height="sliderOpts.height" :dot-size="sliderOpts.dotSize" :tooltip-dir="sliderOpts.tipPosition" :max="1" :interval="0.01")
    .col-md-6
      .row
        .col-md-3
          | release
        .col-md-9
          vue-slider(v-model="release" :height="sliderOpts.height" :dot-size="sliderOpts.dotSize" :tooltip-dir="sliderOpts.tipPosition" :max="2" :interval="0.01")
</template>

<script>
import VueSlider from 'vue-slider-component';

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
      this.gainNode.gain.value = 0.0;
      this.gainNode.connect(destination);

      this.doneSetup = true;
    },
    whenNoteOn: function () {
      if (!this.doneSetup) return;

      const currentTime = this.audioContext.currentTime;
      const attackEndAt = currentTime + this.attack;

      console.log(currentTime);

      this.gainNode.gain.cancelScheduledValues(currentTime);
      this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, currentTime);

      // 与えられた時間(attackEndAt)に gain が 1.0 になるように線形増加
      this.gainNode.gain.linearRampToValueAtTime(1.0, attackEndAt);
      // sustain の値になるよう、 attackEndAt から decay 時間かけて曲線変動
      if (this.decay === 0) {
        this.gainNode.gain.setTargetAtTime(this.sustain, attackEndAt, 0);
      } else if (this.decay > 0) {
        this.gainNode.gain.setValueCurveAtTime(new Float32Array([1.0, this.sustain]), attackEndAt, this.decay);
      }
    },
    whenNoteOff: function () {
      if (!this.doneSetup) return;

      const currentTime = this.audioContext.currentTime;
      const releaseEndAt = currentTime + this.release;

      this.gainNode.gain.cancelScheduledValues(currentTime);
      this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, currentTime);

      // gain が 0 になるよう、 currentTime から release 時間かけて曲線変動
      if (this.release === 0) {
        this.gainNode.gain.setTargetAtTime(this.sustain, currentTime, 0);
      } else if (this.release > 0) {
        this.gainNode.gain.setValueCurveAtTime(new Float32Array([this.gainNode.gain.value, 0.0]), currentTime, this.release);
      }
    },
  },
};
</script>
