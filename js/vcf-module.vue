<template lang="pug">
.container
  .row.d-flex.align-items-center
    .col-md-3
      .form-group
        label.bmd-label-floating Filter type
        select.form-control(v-model="filterType" v-on:change="loadNodesSettings()")
          option(value="allpass") allpass
          option(value="lowpass") lowpass
          option(value="highpass") highpass
          option(value="bandpass") bandpass
          option(value="notch") notch
    .col-md-9
      .row
        .col-md-2
          | freq
        .col-md-10
          vue-slider(v-model="freq" @callback="loadNodesSettings()" :height="sliderOpts.height" :dot-size="sliderOpts.dotSize" :tooltip-dir="sliderOpts.tipPosition" :min="minFreq" :max="maxFreq" :interval="0.01")
      .row
        .col-md-2
          | Q
        .col-md-10
          vue-slider(v-model="q" @callback="loadNodesSettings()" :height="sliderOpts.height" :dot-size="sliderOpts.dotSize" :tooltip-dir="sliderOpts.tipPosition" :min="minQ" :max="maxQ" :interval="0.01")
</template>

<script>
import VueSlider from 'vue-slider-component';
import Const from './constants';

export default {
  name: 'VcfModule',
  components: {
    'vue-slider': VueSlider,
  },
  props: {
    initialFilterType: {
      type: String,
      default: 'allpass',
    },
    initialFreq: {
      type: Number,
      default: Const.FILTER_FREQ_MAX,
    },
    minFreq: {
      type: Number,
      default: Const.FILTER_FREQ_MIN,
    },
    maxFreq: {
      type: Number,
      default: Const.FILTER_FREQ_MAX,
    },
    initialQ: {
      type: Number,
      default: 1,
    },
    minQ: {
      type: Number,
      default: Const.FILTER_Q_MIN,
    },
    maxQ: {
      type: Number,
      default: Const.FILTER_Q_MAX,
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
      filterNode: null,
      filterType: this.initialFilterType,
      freq: this.initialFreq,
      q: this.initialQ,
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

      this.createNodes(audioContext);
      this.connectNodes(destination);
      this.doneSetup = true;

      this.loadNodesSettings();
    },
    createNodes: function (audioContext = this.audioContext) {
      this.filterNode = audioContext.createBiquadFilter();
    },
    connectNodes: function (destination = this.destination) {
      this.filterNode.connect(destination);
    },
    loadNodesSettings: function () {
      if (!this.doneSetup) return;

      this.filterNode.type = this.filterType;
      this.filterNode.frequency.value = this.freq;
      this.filterNode.Q.value = this.q;
    },
  },
};
</script>
