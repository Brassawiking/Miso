import { v3, linePlaneIntersectionPoint, clamp } from '../../common/math.js'
import { Camera } from '../entities/Camera.js'
import { createScene_EditingLand } from '../../rendering/scenes/EditingLand.js'
import { createLoop_GameOver } from './GameOver.js'

export function createLoop_EditingLand ({ 
  gl, 
  output,
  keyboard,
  prevKeyboard,
  mouse,
  prevMouse 
}) {
  const landSize = 64
  const land = createLand(landSize)
  const camera = new Camera()
    
  const state = {}
  let playerPosition = [0, 0, 0]
  let markerPosition = [0, 0, 0]
  let cameraOrbitDistance = 10
  let cameraOrbitHorisontal = 0
  let cameraOrbitVertical = Math.PI / 6
  
  let landTypes = [
    'sand',
    'dirt',
    'grass'
  ]
  let currentLandType = 0
  
  const MOUSE_ACTION_RAISE = 'raise'
  const MOUSE_ACTION_LOWER = 'lower'
  const MOUSE_ACTION_PAINT = 'paint'
  let currentMouseAction = MOUSE_ACTION_RAISE
 
  const scene_EditingLand = createScene_EditingLand(gl, landSize)

  return ({t}) => {
    logic(t)
    scene_EditingLand({
      cameraView: camera.matrix,
      time: t,
      markerPosition,
      playerPosition,
      heightMap: land.points.map(x => x.height),
      colorMap: land.points.flatMap(x => {
        switch(x.type) {
          case 'grass': return [86, 176, 0]
          case 'dirt': return [118, 85, 43]
          case 'sand': return [246, 228, 173]
          default: return [255, 255, 255]
        }
      })
    })
   
    output.innerHTML = `
      <table style="width: 100%;">
        <tr><th style="text-align: left;"> Mouse action </th><td> ${currentMouseAction.toUpperCase()} </td><tr>
        <tr><th style="text-align: left;"> Land type </th><td> ${landTypes[currentLandType].toUpperCase()} </td><tr>
        <tr><th style="text-align: left;"> Marker position </th><td> ${markerPosition[0]}, ${markerPosition[2]} </td><tr>
      </table>
      <br/>

      <table style="width: 100%;">
        <tr><th colspan="2" style="text-align: center;"> ----- Controls ----- </th><tr>
        <tr><th style="text-align: left;"> WASDEQ </th><td> Move camera </td><tr>
        <tr><th style="text-align: left;"> Up/Down </th><td> Raise/Lower land </td><tr>
        <tr><th style="text-align: left;"> Left/Right </th><td> Change land type </td><tr>
        <tr><th style="text-align: left;"> Space </th><td> Paint land type </td><tr>
        <tr><th style="text-align: left;"> Delete </th><td> Reset land </td><tr>
        <tr><th style="text-align: left;"> Mouse left </th><td> Mouse action </td><tr>
        <tr><th style="text-align: left;"> Mouse right </th><td> Rotate camera </td><tr>
        <tr><th style="text-align: left;"> 1/2/3 </th><td> Switch mouse action </td><tr>
        <tr><th style="text-align: left;"> K </th><td> Go to game over </td><tr>
      </table>
    `.trim()

    if (keyboard.K && !prevKeyboard.K) {
      return createLoop_GameOver
    }
  }

  function logic(t) {
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
    
    updateCamera(playerPosition)
  
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
      landPoint.type = 'grass'
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

  function updateCamera(playerPosition) {
    camera.near = 1
    camera.far = 1000
    camera.aspect = gl.canvas.clientWidth / gl.canvas.clientHeight
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
}