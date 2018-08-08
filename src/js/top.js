import Vue from 'vue';
import VueSlider from 'vue-slider-component';

window.onload = () => {
  $('.output').html('出力部<br>');
  console.log('hoge');
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
  },
  watch: {
    value1: function (val) {
      // console.log(val);
    },
  },
  computed: {
    xxx: function () {
      // console.log(this.value1);
      return `value1: ${this.value1}`
    },
  },
  methods: {
  },
});
