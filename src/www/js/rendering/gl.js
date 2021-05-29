export const gl =  document.createElement('canvas').getContext('webgl2', {
  preserveDrawingBuffer: true,
  alpha: false,
  //desynchronized: true,
  //powerPreference: 'high-performance'
})