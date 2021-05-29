import { keyboard, prevKeyboard, mouse, prevMouse, updatePrevInput} from './system/input.js'
import { createLoop_StartScreen } from './logic/loops/StartScreen.js'
import { Stats } from './external/stats.js'
import { gl } from './rendering/gl.js'

const data = {
  settings: {
    resolution: {
      fixed: false,
      width: 1280,
      height: 720,
    }
  }
}

initGL(data)
const ui = createUI()
const stats = createStats()
let currentLoop
init()

async function init() {
  await setCurrentLoop(createLoop_StartScreen)

  stats.begin()
  let prevTime = performance.now()
  requestAnimationFrame (async function update(time) {
    stats.end()
    stats.begin()
  
    try {
      const createNextLoop = currentLoop({ 
        time: time / 1000, 
        deltaTime: (time-prevTime) / 1000 
      })
      if (createNextLoop) {
        await setCurrentLoop(createNextLoop)
      }
    } catch (error) {
      console.error(error)
      alert(`ERROR: ${error}`)
    }
    updatePrevInput()
    prevTime = time
    
    requestAnimationFrame(update)
  })
}

function initGL(data) {
  document.body.appendChild(gl.canvas)
  gl.canvas.classList.add('glCanvas')
  
  const updateResolution = () => {
    const resolution = data.settings.resolution
    gl.canvas.width = resolution.fixed ? resolution.width : gl.canvas.clientWidth
    gl.canvas.height = resolution.fixed ? resolution.height : gl.canvas.clientHeight
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
  }
  updateResolution()
  window.addEventListener('resize', updateResolution)
}

function createUI() {
  return document.body.appendChild(document.createElement('miso-ui'))
}

function createStats() {
  const stats = new Stats()
  stats.showPanel(1)
  document.body.appendChild(stats.dom)
  stats.dom.classList.add('stats')
  return stats  
}

async function setCurrentLoop(createLoop) {
  currentLoop = await createLoop({
    ui, 
    keyboard,
    prevKeyboard,
    mouse,
    prevMouse,
    data  
  })
} 