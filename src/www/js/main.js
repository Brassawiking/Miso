import { gl } from './rendering/glCanvas.js'
import { keyboard, prevKeyboard, mouse, prevMouse, updatePrevInput} from './system/input.js'
import { output } from './system/output.js'
import { createLoop_EditingLand } from './logic/loops/EditingLand.js'
import { Stats } from './external/stats.js'

const stats = new Stats()
stats.showPanel(1)
document.body.appendChild(stats.dom)

// Internal resolution
gl.canvas.width = 800
gl.canvas.height = 600
// gl.canvas.width = gl.canvas.clientWidth
// gl.canvas.height = gl.canvas.clientHeight
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

let currentLoop
const setCurrentLoop = (createLoop) => {
  currentLoop = createLoop({
    gl, 
    output,
    keyboard,
    prevKeyboard,
    mouse,
    prevMouse  
  })
}

setCurrentLoop(createLoop_EditingLand)
requestAnimationFrame (function update(t) {
  stats.begin()

  const createNextLoop = currentLoop({ t })
  if (createNextLoop) {
    setCurrentLoop(createNextLoop)
  }
  updatePrevInput()

  stats.end()
  requestAnimationFrame(update)
})
