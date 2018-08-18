export default Object.freeze({
  // 指定秒数をこの値で割ることで、timeConstant として用いる値に直す
  // 参考: https://developer.mozilla.org/en-US/docs/Web/API/AudioParam/setTargetAtTime
  DIV_TO_TIME_CONSTANT: 5,

  // Gain としてユーザーが指定できる値
  // AudioParam における maxValue = 3.4028234663852886 * (10 ** 38) とは異なる
  GAIN_MIN: 0.0,
  GAIN_MAX: 1.0,

  // Filter freq としてユーザーが指定できる値
  FILTER_FREQ_MIN: 0.0,
  FILTER_FREQ_MAX: 8000.0,
});
