import { keyboard, prevKeyboard, mouse, prevMouse, updatePrevInput} from './system/input.js'
import { createLoop_StartScreen } from './logic/loops/StartScreen.js'
import { Stats } from './external/stats.js'

const data = {
  settings: {
    resolution: {
      fixed: false,
      width: 800,
      height: 600,
    }
  }
}

const gl = createGL(data)
const ui = createUI()
const stats = createStats()
let currentLoop

init()
async function init() {
  await setCurrentLoop(createLoop_StartScreen)

  stats.begin()
  let prevT = performance.now()
  requestAnimationFrame (async function update(t) {
    stats.end()
    stats.begin()
  
    const createNextLoop = currentLoop({ 
      t: t / 1000, 
      dt: (t-prevT) / 1000 
    })
    if (createNextLoop) {
      await setCurrentLoop(createNextLoop)
    }
    updatePrevInput()
    prevT = t
    
    requestAnimationFrame(update)
  })
  
}

function createGL(data) {
  const canvas = document.body.appendChild(document.createElement('canvas'))
  canvas.classList.add('glCanvas')
  
  const gl = canvas.getContext('webgl2', {
    preserveDrawingBuffer: true,
    alpha: false,
    //desynchronized: true,
    //powerPreference: 'high-performance'
  })

  // Internal resolution
  const updateResolution = () => {
    const resolution = data.settings.resolution
    gl.canvas.width = resolution.fixed ? resolution.width : gl.canvas.clientWidth
    gl.canvas.height = resolution.fixed ? resolution.height : gl.canvas.clientHeight
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
  }
  updateResolution()
  window.addEventListener('resize', updateResolution)

  window.gl = gl
  return gl
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
    gl,
    ui, 
    keyboard,
    prevKeyboard,
    mouse,
    prevMouse,
    data  
  })
} 