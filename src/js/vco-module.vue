<template lang="pug">
.container
  .row
    .col-md-3
      .form-group
        label.bmd-label-floating waveform
        select.form-control(v-model="waveform" v-on:change="loadNodesSettings()")
          option(value="sine") sine
          option(value="square") square
          option(value="triangle") tri
          option(value="sawtooth") saw
    .col-md-9
      .row
        .col-md-2
          | vol
        .col-md-10
          vue-slider(v-model="volume" @callback="loadNodesSettings()" :height="sliderOpts.height" :dot-size="sliderOpts.dotSize" :tooltip-dir="sliderOpts.tipPosition")
      .row
        .col-md-2
          | detune
        .col-md-10
          vue-slider(v-model="detune" @callback="loadNodesSettings()" :height="sliderOpts.height" :dot-size="sliderOpts.dotSize" :tooltip-dir="sliderOpts.tipPosition" :min="-100" :max="100")
</template>

<script>
import VueSlider from 'vue-slider-component';

export default {
  name: 'VcoModule',
  components: {
    'vue-slider': VueSlider,
  },
  props: {
    initialWaveform: {
      type: String,
      default: 'sine',
    },
    initialVolume: {
      type: Number,
      default: 50,
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
      oscNode: null,
      switchGainNode: null,
      gainNode: null,
      waveform: this.initialWaveform,
      detune: 0,
      freq: 440,
      volume: this.initialVolume,
      sliderOpts: {
        height: this.sliderHeight,
        dotSize: this.sliderDotSize,
        tipPosition: this.sliderTipPosition,
      },
      doneSetup: false,
      isPlaying: false,
    };
  },
  watch: {
    isPlaying: function (val) {
      if (!this.doneSetup) return;

      if (val) {
        this.switchGainNode.gain.value = 1.0;
      } else {
        this.switchGainNode.gain.value = 0.0;
      };
    },
  },
  created: function () {
  },
  methods: {
    setupNodes: function (audioContext = this.audioContext, destination = this.destination) {
      this.audioContext = audioContext;
      this.destination = destination;

      this.createNodes(audioContext);
      this.connectNodes(destination);
      this.doneSetup = true;
    },
    createNodes: function (audioContext = this.audioContext) {
      this.oscNode = audioContext.createOscillator();
      this.oscNode.start();

      this.switchGainNode = audioContext.createGain();
      this.switchGainNode.gain.value = 0.0;

      this.gainNode = audioContext.createGain();
    },
    connectNodes: function (destination = this.destination) {
      this.oscNode
        .connect(this.switchGainNode)
        .connect(this.gainNode)
        .connect(destination);
    },
    loadNodesSettings: function () {
      if (!this.doneSetup) return;

      this.oscNode.type = this.waveform;
      this.oscNode.detune.value = this.detune;
      this.oscNode.frequency.value = this.freq;

      this.gainNode.gain.value = this.volume / 100.0;
    },
    playOrStop: function () {
      if (!this.doneSetup) return;

      if (this.isPlaying) {
        this.switchGainNode.gain.value = 0.0;
        this.isPlaying = false;
      } else {
        this.loadNodesSettings();
        this.switchGainNode.gain.value = 1.0;
        this.isPlaying = true;
      }
    },
  },
};
</script>
