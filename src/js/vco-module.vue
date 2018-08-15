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
    audioContext: {
      type: AudioContext,
      default: null,
    },
    initialWaveform: {
      type: String,
      default: 'sine',
    },
    initialVolume: {
      type: Number,
      default: 50,
    },
    destination: {
      type: AudioDestinationNode,
      default: null,
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
      oscNode: null,
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
      isPlaying: false,
    };
  },
  created: function () {
    this.createNodes();
  },
  methods: {
    setupNodes: function () {
      this.createNodes();
      this.connectNodes();
      this.loadNodesSettings();
    },
    createNodes: function () {
      this.oscNode = this.audioContext.createOscillator();
      this.gainNode = this.audioContext.createGain();
    },
    connectNodes: function () {
      // OSC -> Gain -> Dest
      this.oscNode
        .connect(this.gainNode)
        .connect(this.destination);
    },
    loadNodesSettings: function () {
      this.oscNode.type = this.waveform;
      this.oscNode.detune.value = this.detune;
      this.oscNode.frequency.value = this.freq;

      this.gainNode.gain.value = this.volume / 100.0;
    },
    playOSC: function () {
      if (this.isPlaying) {
        this.oscNode.stop();

        this.isPlaying = false;
      } else {
        this.setupNodes();
        this.oscNode.start();

        this.isPlaying = true;
      }
    },
  },
};
</script>
