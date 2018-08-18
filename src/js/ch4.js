import Vue from 'vue';
import VueSlider from 'vue-slider-component';
import VcoModule from './vco-module.vue';
import VcfModule from './vcf-module.vue';

new Vue({
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
  },
  computed: {
    currentVolume: function () {
      return `Master Volume: ${this.masterGain.volume}`;
    },
  },
  watch: {
  },
  created: function () {
    this.createAudioContext();
    this.setupNodes();
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
  },
});
