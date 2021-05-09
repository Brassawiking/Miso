import { gl } from './rendering/glCanvas.js'
import { ui } from './rendering/uiLayer.js'
import { keyboard, prevKeyboard, mouse, prevMouse, updatePrevInput} from './system/input.js'
import { output } from './system/output.js'
import { createLoop_EditingLand } from './logic/loops/EditingLand.js'
import { Stats } from './external/stats.js'

const stats = new Stats()
stats.showPanel(1)

document.body.appendChild(gl.canvas)
//document.body.appendChild(stats.dom)
document.body.appendChild(output)
document.body.appendChild(ui)

// Internal resolution
const updateResolution = () => {
  const fixedResolution = false
  gl.canvas.width = fixedResolution ? 800 : gl.canvas.clientWidth
  gl.canvas.height = fixedResolution ? 600 : gl.canvas.clientHeight
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
}
updateResolution()
window.addEventListener('resize', updateResolution)

let currentLoop
const setCurrentLoop = (createLoop) => {
  currentLoop = createLoop({
    gl,
    ui, 
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
