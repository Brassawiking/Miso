const canvas = document.createElement('canvas')
Object.assign(canvas.style, {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh'
})

export const gl = canvas.getContext('webgl2', {
  preserveDrawingBuffer: true,
  alpha: false,
  //desynchronized: true,
  //powerPreference: 'high-performance'
})
window.gl = gl

