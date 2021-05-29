import { gl } from './rendering/gl.js'
import { ui } from './rendering/ui.js'
import { Stats } from './external/stats.js'
import { updatePrevInput } from './system/input.js'
import { createLoop_StartScreen } from './logic/loops/StartScreen.js'

const data = {
  settings: {
    resolution: {
      fixed: false,
      width: 1280,
      height: 720,
    }
  }
}

init()
async function init() {
  initGL(data)
  initUI()
  const stats = initStats()

  stats.begin()
  let prevTime = performance.now()
  let currentLoop = await initLoop(createLoop_StartScreen)
  requestAnimationFrame (async function update(time) {
    stats.end()
    stats.begin()
  
    try {
      const createNextLoop = currentLoop({ 
        time: time / 1000, 
        deltaTime: (time-prevTime) / 1000 
      })
      if (createNextLoop) {
        currentLoop = await initLoop(createNextLoop)
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

function initUI() {
  document.body.appendChild(ui)
}

function initStats() {
  const stats = new Stats()
  stats.showPanel(1)
  document.body.appendChild(stats.dom)
  stats.dom.classList.add('stats')
  return stats  
}

async function initLoop(createLoop) {
  return await createLoop({
    data  
  })
} 