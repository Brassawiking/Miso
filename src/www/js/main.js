import { gl } from './rendering/glCanvas.js'
import { keyboard, prevKeyboard, mouse, prevMouse, updatePrevInput} from './system/input.js'
import { output } from './system/output.js'
import { createLoop_EditingLand } from './loops/EditingLand.js'
import { Stats } from './external/stats.js'

const stats = new Stats()
stats.showPanel(1)
document.body.appendChild(stats.dom)

// Internal resolution
gl.canvas.width = 800
gl.canvas.height = 600
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

const loop_EditingLand = createLoop_EditingLand({ 
  gl, 
  output,
  keyboard,
  prevKeyboard,
  mouse,
  prevMouse
})

requestAnimationFrame (function update(t) {
  stats.begin()

  loop_EditingLand({ t })
  updatePrevInput()

  stats.end()
  requestAnimationFrame(update)
})