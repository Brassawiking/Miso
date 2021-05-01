import { v3, m4, linePlaneIntersectionPoint } from './math.js'

import { Sky } from './renders/Sky.js'
import { Sea } from './renders/Sea.js'
import { TestModel } from './renders/TestModel.js'
import { Terrain } from './renders/Terrain.js'
import { TerrainMarker } from './renders/TerrainMarker.js'
import { Camera } from './camera.js'

import Stats from './external/stats.js'

const stats = new Stats()
stats.showPanel(1)
document.body.appendChild(stats.dom)

const canvas = document.createElement('canvas')
Object.assign(canvas.style, {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh'
})
document.body.appendChild(canvas)

const output = document.createElement('output')
Object.assign(output.style, {
  position: 'fixed',
  top: 0,
  right: 0,
  color: '#fff',
  background: 'rgba(0, 0, 0, 0.3)',
  padding: '10px',
  textAlign: 'right',
  fontFamily: '"Gothic A1", sans-serif'
})
document.body.appendChild(output)

const gl = canvas.getContext('webgl2', {
  preserveDrawingBuffer: true,
  alpha: false
  //desynchronized: true,
  //powerPreference: 'high-performance'
})
window.gl = gl

const extensions = [
  gl.getExtension('OES_texture_float_linear')
]
console.log('EXTENSIONS:', extensions)

// Internal resolution
canvas.width = 800
canvas.height = 600
gl.viewport(0, 0, canvas.width, canvas.height)

// window.addEventListener('resize', e => {
//   canvas.width = canvas.clientWidth
//   canvas.height = canvas.clientHeight
//   gl.viewport(0, 0, canvas.width, canvas.height)  
// })

gl.enable(gl.DEPTH_TEST)
gl.depthFunc(gl.LESS)

gl.enable(gl.BLEND)
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

const landSize = 64
const land = createLand(landSize)

const sky = new Sky(gl)
const sea = new Sea(gl)
const testModel = new TestModel(gl)
const terrain = new Terrain(gl, landSize)
const terrainMarker = new TerrainMarker(gl)
const camera = new Camera()

const state = {}
let playerPosition = [0, 0, 0]
let markerPosition = [0, 0, 0]
let cameraOrbitDistance = 10
let cameraOrbitHorisontal = 0
let cameraOrbitVertical = Math.PI / 6

let landTypes = [
  'dirt',
  'grass',
  'sand'
]
let currentLandType = 0

const MOUSE_ACTION_RAISE = 'raise'
const MOUSE_ACTION_LOWER = 'lower'
const MOUSE_ACTION_PAINT = 'paint'
let currentMouseAction = MOUSE_ACTION_RAISE

const keyboard = {}
document.addEventListener('keydown', e => { keyboard[e.key.toUpperCase()] = true; })
document.addEventListener('keyup', e => { keyboard[e.key.toUpperCase()] = false })
window.keyboard = keyboard

const mouse = { x: 0, y: 0, buttons: [] }
document.addEventListener('contextmenu', e => { e.preventDefault() })
document.addEventListener('mousedown', e => { mouse.buttons[e.button] = true })
document.addEventListener('mouseup', e => { mouse.buttons[e.button] = false })
document.addEventListener('mousemove', e => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1
  mouse.y = (1 - (e.clientY / window.innerHeight)) * 2 - 1
})

let prevKeyboard = jsonCopy(keyboard)
let prevMouse = jsonCopy(mouse)
requestAnimationFrame (function render(t) {
  stats.begin()

  runLogic(t)

  gl.clear(gl.DEPTH_BUFFER_BIT)

  sky.render(gl, t)
  terrain.render(gl, t, camera.matrix, land)
  terrainMarker.render(gl, t, camera.matrix, markerPosition, [1, 0, 0])
  //testModel.render(gl, t, camera.matrix, playerPosition)
 
  sea.render(gl, t, camera.matrix)
 
  output.innerHTML = `
    Land type: ${landTypes[currentLandType].toUpperCase()}<br/>
    Marker position: ${markerPosition[0]}, ${markerPosition[2]}<br/>
    Mouse action: ${currentMouseAction.toUpperCase()}
  `.trim()
  
  prevKeyboard = jsonCopy(keyboard)
  prevMouse = jsonCopy(mouse)

  stats.end()
  requestAnimationFrame(render)
})

function runLogic(t) {
  const speed = 0.2
  
  if (keyboard.D) {
    playerPosition[0] += speed
  }
  if (keyboard.A) {
    playerPosition[0] -= speed
  }
  if (keyboard.W) {
    playerPosition[2] += speed
  }
  if (keyboard.S) {
    playerPosition[2] -= speed
  }
  if (keyboard.E) {
    playerPosition[1] += speed
  }
  if (keyboard.Q) {
    playerPosition[1] -= speed
  }

  if (mouse.buttons[2]) {
    if (!prevMouse.buttons[2]) {
      state.orbitMoveStart = {
        mouseX: mouse.x,
        mouseY: mouse.y,
        orbitH: cameraOrbitHorisontal,
        orbitV: cameraOrbitVertical
      }
    }

    const orbitSpeed = 1.5;
    cameraOrbitHorisontal = state.orbitMoveStart.orbitH - (mouse.x - state.orbitMoveStart.mouseX) * orbitSpeed
    cameraOrbitVertical = clamp(
      state.orbitMoveStart.orbitV - (mouse.y - state.orbitMoveStart.mouseY) * orbitSpeed,
      -Math.PI / 2,
      Math.PI / 2
    )
  }
  
  updateCamera(t, playerPosition)

  const planeIntersection = linePlaneIntersectionPoint(
    v3.add(camera.z, v3.add(v3.multiply(camera.x, mouse.x * camera.aspect), v3.multiply(camera.y, mouse.y))),
    camera.position,
    [0, 1, 0],
    [0, 0, 0]
  )

  if (planeIntersection) {
    markerPosition = [
      clamp(Math.round(planeIntersection[0]), 0, landSize - 1),
      0, 
      clamp(Math.round(planeIntersection[2]), 0, landSize - 1),
    ]
  }

  if (keyboard[1]) {
    currentMouseAction = MOUSE_ACTION_RAISE
  }
  if (keyboard[2]) {
    currentMouseAction = MOUSE_ACTION_LOWER
  }
  if (keyboard[3]) {
    currentMouseAction = MOUSE_ACTION_PAINT
  }

  const landPoint = land.points[markerPosition[2] * land.size + markerPosition[0]]
  const heightDelta = 0.1
  if (keyboard.ARROWUP || (mouse.buttons[0] && currentMouseAction === MOUSE_ACTION_RAISE)) {
    landPoint.height += heightDelta
  }
  if (keyboard.ARROWDOWN || (mouse.buttons[0] && currentMouseAction === MOUSE_ACTION_LOWER)) {
    landPoint.height -= heightDelta
  }
  if (keyboard.DELETE) {
    landPoint.height = 0
  }
  if (keyboard.ARROWLEFT && !prevKeyboard.ARROWLEFT) {
    currentLandType = Math.max(currentLandType - 1, 0)
  }
  if (keyboard.ARROWRIGHT && !prevKeyboard.ARROWRIGHT) {
    currentLandType = Math.min(currentLandType + 1, landTypes.length - 1)
  }
  if (keyboard[' '] || (mouse.buttons[0] && currentMouseAction === MOUSE_ACTION_PAINT)) {
    landPoint.type = landTypes[currentLandType]
  }
}

function updateCamera(t, playerPosition) {
  camera.near = 1
  camera.far = 1000
  camera.aspect = canvas.clientWidth / canvas.clientHeight
  camera.target = playerPosition

  let offset = [
    cameraOrbitDistance * Math.sin(cameraOrbitHorisontal) * Math.cos(cameraOrbitVertical), 
    cameraOrbitDistance * Math.sin(cameraOrbitVertical),
    -cameraOrbitDistance * Math.cos(cameraOrbitHorisontal) * Math.cos(cameraOrbitVertical),
  ]

  camera.position = v3.add(playerPosition, offset)
  camera.update()
}

function createLand(size) {
  const land = {
    size: size,
    points: []
  }

  for (let y = 0; y < size; ++y) {
    for (let x = 0; x < size; ++x) {
      land.points.push({
        height: 0,
        type: 'grass'
      })
    }  
  }

  return land
}

function jsonCopy (obj) {
  return JSON.parse(JSON.stringify(obj))
}

function clamp (value, min, max) {
  return Math.min(Math.max(value, min), max)
}