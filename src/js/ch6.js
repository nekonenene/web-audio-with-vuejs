import Vue from 'vue';
import VueSlider from 'vue-slider-component';
import VcoModule from './vco-module.vue';
import VcfModule from './vcf-module.vue';
import AdsrModule from './envelope-module.vue';
import Const from './constants';

new Vue({
  el: '#app',
  components: {
    'vue-slider': VueSlider,
    'vco-module': VcoModule,
    'vcf-module': VcfModule,
    'adsr-module': AdsrModule,
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
    masterAdsr: null,
    masterFilter: null,
    masterGain: {
      obj: null,
      volume: 80,
    },
    masterPanner: {
      obj: null,
      pan: 0,
    },
    canPlay: false,
    pushingKeys: [],
  },
  computed: {
    currentVolume: function () {
      return `Master Volume: ${this.masterGain.volume}`;
    },
  },
  watch: {
    pushingKeys: function (keys) {
      if (keys.length !== 0) {
        const zKeyNoteNum = Const.C4_NOTE_NUM + keys[0].oct * 12;
        const midiNoteNum = this.keyCodeToMidiNote(keys[0].keyCode, zKeyNoteNum);
        this.changeFreqByMidiNoteNum(midiNoteNum);

        this.masterAdsr.whenNoteOn(this.audioContext);
      } else {
        this.masterAdsr.whenNoteOff(this.audioContext);
      }
    },
  },
  created: function () {
    this.createAudioContext();
    this.setupNodes();
    this.addGlobalKeyListener();
  },
  mounted: function () {
    this.setupChildComponents();

    this.switchCanPlay();
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
      this.masterAdsr = this.$refs.masterAdsr;
      this.masterFilter = this.$refs.masterFilter;

      this.masterFilter.setup(this.audioContext, this.masterGain.obj);
      this.masterAdsr.setup(this.audioContext, this.masterFilter.filterNode);
      this.vco1.setup(this.audioContext, this.masterAdsr.gainNode);
      this.vco2.setup(this.audioContext, this.masterAdsr.gainNode);
    },
    switchCanPlay: function () {
      this.vco1.playOrStop();
      this.vco2.playOrStop();
      this.canPlay = !this.canPlay;
    },
    addGlobalKeyListener: function () {
      document.onkeydown = this.whenKeyDown;
      document.onkeyup = this.whenKeyUp;
    },
    whenKeyDown: function (ev) {
      const pushedKeyCode = ev.code;
      const midiNoteNum = this.keyCodeToMidiNote(pushedKeyCode);
      if (midiNoteNum == null) return;

      if (!this.pushingKeys.find(key => key.keyCode === pushedKeyCode)) {
        this.pushingKeys.unshift({
          keyCode: pushedKeyCode,
          oct: (ev.shiftKey ? 1 : 0) + (ev.ctrlKey ? -1 : 0) + (ev.altKey ? -1 : 0),
        });
      }
    },
    whenKeyUp: function (ev) {
      const pushedKeyCode = ev.code;
      const midiNoteNum = this.keyCodeToMidiNote(pushedKeyCode);
      if (midiNoteNum == null) return;

      this.pushingKeys = this.pushingKeys.filter(key => key.keyCode !== pushedKeyCode);
    },
    changeFreqByMidiNoteNum: function (midiNoteNum) {
      if (midiNoteNum == null) return;

      const referenceFreq = 440.0;
      const midiNoteNumOfA4 = 69;

      const freq = referenceFreq * (2 ** ((midiNoteNum - midiNoteNumOfA4) / 12));

      this.vco1.freq = freq;
      this.vco2.freq = freq;
    },
    changeFreqOctave: function (oct) {
      this.vco1.freq = this.vco1.freq * (2 ** oct);
      this.vco2.freq = this.vco2.freq * (2 ** oct);
    },
    /**
     * 入力キーをMIDIノート番号に変換
     *
     * @param keyCode 押されたキー。 event.key から取得
     * @param startNum Zキーに割り当てるノート番号。デフォルトは 60 (C4)
     */
    keyCodeToMidiNote: function (keyCode, startNum = Const.C4_NOTE_NUM) {
      const assignMap = {
        KeyZ: 0,
        KeyS: 1,
        KeyX: 2,
        KeyD: 3,
        KeyC: 4,
        KeyV: 5,
        KeyG: 6,
        KeyB: 7,
        KeyH: 8,
        KeyN: 9,
        KeyJ: 10,
        KeyM: 11,
        Comma: 12,
        KeyL: 13,
        Period: 14,
        Semicolon: 15,
        Slash: 16,
        IntlRo: 17,
      };

      const idx = assignMap[keyCode];
      if (idx == null) {
        return null;
      }

      return startNum + idx;
    },
  },
});
