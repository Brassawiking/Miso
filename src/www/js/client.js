import { gl } from './rendering/glCanvas.js'
import { ui } from './rendering/uiLayer.js'
import { keyboard, prevKeyboard, mouse, prevMouse, updatePrevInput} from './system/input.js'
import { createLoop_StartScreen } from './logic/loops/StartScreen.js'
import { Stats } from './external/stats.js'

const stats = new Stats()
stats.showPanel(1)

document.body.appendChild(gl.canvas)
document.body.appendChild(ui)
document.body.appendChild(stats.dom)

// Internal resolution
const updateResolution = () => {
  const fixedResolution = false
  gl.canvas.width = fixedResolution ? 800 : gl.canvas.clientWidth
  gl.canvas.height = fixedResolution ? 600 : gl.canvas.clientHeight
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
}
updateResolution()
window.addEventListener('resize', updateResolution)

const data = {}

let currentLoop
const setCurrentLoop = (createLoop) => {
  currentLoop = createLoop({
    gl,
    ui, 
    keyboard,
    prevKeyboard,
    mouse,
    prevMouse,
    data  
  })
}

setCurrentLoop(createLoop_StartScreen)

stats.begin()
let prevT = performance.now()
requestAnimationFrame (function update(t) {
  stats.end()
  stats.begin()

  const createNextLoop = currentLoop({ t, dt: t-prevT })
  if (createNextLoop) {
    setCurrentLoop(createNextLoop)
  }
  updatePrevInput()
  prevT = t
  
  requestAnimationFrame(update)
})
