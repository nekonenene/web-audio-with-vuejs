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
    value: 20,
    opts: {
      height: 16,
      dotSize: 18,
    },
  },
  watch: {
    value: function (val) {
      console.log(val);
    },
  },
  methods: {
  },
});
