import { v3, linePlaneIntersectionPoint, clamp } from '../../common/math.js'
import { Camera } from '../entities/Camera.js'
import { createScene_World } from '../../rendering/scenes/World.js'

export function createLoop_MainGame ({ 
  gl,
  ui,  
  output,
  keyboard,
  prevKeyboard,
  mouse,
  prevMouse 
}) {
  const landSize = 256
  const maxPropCount = 1500

  const user = {
    name: 'Brassawiking'
  }

  const world = {
    lands: {}
  }
  window.world = world

  const camera = new Camera()

  const state = {}
  let gravity = false
  let playerPosition = [0, 0, 0]
  let markerPosition = [0, 0, 0]
  let cameraOrbitDistance = 6
  let cameraOrbitHorisontal = 0
  let cameraOrbitVertical = Math.PI / 5
  
  let prevPropText
  let propText

  const actionTypes = [
    'raise',
    'lower',
    'paint',
    'prop',
    'reset'
  ]
  let currentActionType = actionTypes[0]

  const landTypes = [
    'sand',
    'dirt',
    'grass'
  ]
  let currentLandType = landTypes[0]

  const propTypes = [
    '',
    'tree',
    'stone_tablet',
  ]
  let currentPropType = propTypes[0]
  let brushSize = 1
 
  const scene_World = createScene_World(gl, landSize)

  ui.innerHTML = `
    <style>
      .toolbar {
        position: absolute;
        top: 10px;
        left: 100px;
        max-width: calc(100vw - 200px);
        font-family: "Gothic A1", sans-serif;
        font-size: 14px;
      }
      .toolbar label {
        margin: 2px; 10px;
        display: inline-block;
      }
      .toolbar select {
        border-radius: 5px;
        border: none;
        padding: 5px;
        background: rgba(0, 0, 0, 0.3);
        color: #fff;
      }
    </style>
    <div class="toolbar" onmousedown="event.stopPropagation()" onkeydown="event.stopPropagation()">
      <label>
        Mouse: 
        <select class="js-action-type" tabindex="-1"></select>
      </label>
      <label>
        Land [Q / Z / X]: 
        <select class="js-land-type" tabindex="-1"></select>
      </label>
      <label>
        Prop [E / C / V]: 
        <select class="js-prop-type" tabindex="-1"></select>
      </label>
      <label>
        Gravity [G]:
        <input class="js-gravity" type="checkbox" tabindex="-1"/>
      </label>
    </div>

    <style>
      .propText {
        position: absolute; 
        margin: 0;
        padding: 20px;
        left: 20px; 
        bottom: 20px;
        background: rgba(0, 0, 0, 0.3);
        border-radius: 5px;
        color: #fff;
        font-family: "Gothic A1", sans-serif;
      }
    </style>

    <div class="propText"></div>

    <style>
      .menu {
        position: absolute; 
        margin: 0;
        padding: 0;
        right: 15px; 
        top: 20px;
        background: rgba(0, 0, 0, 0.3);
        border-radius: 9999px;
        padding: 0px 10px;
      }
      .menu li {
        cursor: pointer;
        display: flex;
        margin: 10px 0;
        border-radius: 100%;
        border: 1px solid #fff;
        height: 45px;
        width: 45px;
        box-sizing:border-box;
        color: #fff;
        align-items: center;
        justify-content: center;

        font-size: 14px;
        font-family: "Gothic A1", sans-serif;
        font-weight: bold;
      }
      .menu li:hover {        
        background: rgba(1, 1, 1, 0.3);
      }
      .menu li.selected {
        background: #fff;
        border-color: #fff;
        color: #343a4a;
      }

    </style>
    <ul class="menu" onmousedown="event.stopPropagation()">
      <li onclick="ui_inventory.hidden = !ui_inventory.hidden; this.classList.toggle('selected')">Inv</li>
      <li>Char</li>
      <li>Help</li>
    </ul>

    <style>
      [hidden] {
        display: none !important;
      }

      .inventory {
        position: absolute; 
        margin: 0;
        padding: 0;
        left: 20px; 
        right: 100px; 
        top: 20px;
        bottom: 20px;
        background: rgba(0, 0, 0, 0.3);
        border-radius: 5px;
        color: #fff;
        padding: 20px;
        font-family: "Gothic A1", sans-serif;

        display: flex;
        flex-direction: column;
      }

      .inventory h1 {
        font-family: inherit;
        font-weight: 100;
        margin: 0px;
        font-size: 44px;
      }

      .inventory .grid {
        flex: 1 1 0px;
        display: grid;
        grid-template-columns: repeat(24, 1fr);
        grid-template-rows: repeat(12, 1fr);
        gap: 2px;
        overflow: hidden;
      }

      .inventory .slot {
        overflow: hidden;
        border-radius: 4px;
        border: 1px solid #777;
        background: linear-gradient(142deg, rgba(2,0,36,1) 0%, rgba(52,58,74,1) 100%);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .inventory .slot:hover {
        background: #343a4a;
      }

      .inventory .slot img {
        max-width: 100%;
        max-height: 100%;
      }
    </style>
    <div id="ui_inventory" class="inventory" onmousedown="event.stopPropagation()" hidden>
      <h1>Inventory</h1>
      <div class="grid">
        ${
          Array(24 * 1).fill('<div class="slot"> <img src="https://i.pinimg.com/originals/40/ed/8e/40ed8e381cf0876d77b540144c1247e0.png"/> </div>').join('')
        }
        ${
          Array(24 * 1).fill('<div class="slot"> <img src="https://i.pinimg.com/originals/3b/37/86/3b37860fb69293ef99bba496fe9cb1d5.png"/> </div>').join('')
        }
        ${
          Array(24 * 10).fill('<div class="slot"> </div>').join('')
        }
      </div>
    </div>
  `

  const ui_actionType = ui.querySelector('.js-action-type')
  actionTypes.forEach((mouseAction, index) => { 
    ui_actionType.add(new Option(`[${index+1}] ${mouseAction.toUpperCase()}`, mouseAction)) 
  })
  ui_actionType.addEventListener('input', e => { 
    currentActionType = e.target.value
    e.target.blur()
  })

  const ui_landType = ui.querySelector('.js-land-type')
  landTypes.forEach(landType => { ui_landType.add(new Option(landType.toUpperCase(), landType)) })
  ui_landType.addEventListener('input', e => { 
    currentLandType = e.target.value
    e.target.blur()
  })

  const ui_propType = ui.querySelector('.js-prop-type')
  propTypes.forEach(propType => { ui_propType.add(new Option(propType.toUpperCase() || '(remove prop)', propType)) })
  ui_propType.addEventListener('input', e => { 
    currentPropType = e.target.value
    e.target.blur()
  })

  const ui_gravity = ui.querySelector('.js-gravity')
  ui_gravity.addEventListener('input', e => { 
    gravity = e.target.checked 
    e.target.blur()
  })

  return ({t, dt}) => {
    logic(t, dt)

    ui_landType.value = currentLandType
    ui_propType.value = currentPropType
    ui_actionType.value = currentActionType
    ui_gravity.checked = gravity

    const ui_propText = ui.querySelector('.propText')
    if (prevPropText !== propText) {
      ui_propText.hidden = !propText
      ui_propText.innerHTML = propText
      prevPropText = propText
    }

    const worldLandX = Math.floor(playerPosition[0] / landSize)
    const worldLandY = Math.floor(playerPosition[2] / landSize)
    const activeLand = getOrCreateLand(worldLandX, worldLandY)
    const lands = [
      getOrCreateLand(activeLand.x-1, activeLand.y+1),
      getOrCreateLand(activeLand.x-1, activeLand.y),
      getOrCreateLand(activeLand.x-1, activeLand.y-1),

      getOrCreateLand(activeLand.x, activeLand.y+1),
      activeLand,
      getOrCreateLand(activeLand.x, activeLand.y-1),

      getOrCreateLand(activeLand.x+1, activeLand.y+1),
      getOrCreateLand(activeLand.x+1, activeLand.y),
      getOrCreateLand(activeLand.x+1, activeLand.y-1),
    ]

    scene_World({
      cameraView: camera.matrix,
      time: t,
      markerPosition,
      brushSize,
      playerPosition,
      lands
    })

    lands.forEach(land => {
      land.heightMapDirty = false
      land.colorMapDirty = false
    })
     
    const outputContent = `
      <table style="width: 100%;">
        <tr><th style="text-align: left;"> Brush size </th><td> ${(brushSize-1)*2 + 1} </td><tr>
        <tr><th style="text-align: left;"> Marker position </th><td> ${markerPosition[0]}, ${markerPosition[2]} </td><tr>
        <tr><th style="text-align: left;"> Prop count </th><td> ${activeLand.propCount} / ${maxPropCount} </td><tr>
      </table>
      <br/>

      <table style="width: 100%;">
        <tr><th colspan="2" style="text-align: center;"> ----- Controls ----- </th><tr>
        <tr><th style="text-align: left;"> WASD </th><td> Move </td><tr>
        <tr><th style="text-align: left;"> Shift / Control </th><td> Fly up / down </td><tr>
        <tr><th style="text-align: left;"> Up / Down </th><td> Land height </td><tr>
        <tr><th style="text-align: left;"> Left / Right </th><td> Brush size </td><tr>
        <tr><th style="text-align: left;"> Mouse left </th><td> Action </td><tr>
        <tr><th style="text-align: left;"> Mouse right </th><td> Rotate camera </td><tr>
        <tr><th style="text-align: left;"> Mouse wheel </th><td> Zoom </td><tr>
        <tr><th style="text-align: left;"> Space </th><td> Edit prop </td><tr>
        <tr><th style="text-align: left;"> Delete </th><td> Reset land </td><tr>
        <tr><th style="text-align: left;"> [A / B / C / ...] </th><td> Shortcuts </td><tr>
      </table>
    `.trim()

    if (outputContent !== state.prevOutputContent) {
      output.innerHTML = outputContent
      state.prevOutputContent = outputContent
    }
  }

  function logic(t, dt) {
    const speed = 10.5 * dt / 1000;
    if (keyboard.D) {
      playerPosition = v3.add(playerPosition, v3.multiply(v3.normalize([camera.x[0], 0, camera.x[2]]), speed))
    }
    if (keyboard.A) {
      playerPosition = v3.subtract(playerPosition, v3.multiply(v3.normalize([camera.x[0], 0, camera.x[2]]), speed))
    }
    if (keyboard.W) {
      playerPosition = v3.add(playerPosition, v3.multiply(v3.normalize([camera.z[0], 0, camera.z[2]]), speed))
    }
    if (keyboard.S) {
      playerPosition = v3.subtract(playerPosition, v3.multiply(v3.normalize([camera.z[0], 0, camera.z[2]]), speed))
    }
    if (keyboard.SHIFT) {
      playerPosition[1] += speed
    }
    if (keyboard.CONTROL) {
      playerPosition[1] -= speed
    }

    const worldLandX = Math.floor(playerPosition[0] / landSize)
    const worldLandY = Math.floor(playerPosition[2] / landSize)
    const activeLand = getOrCreateLand(worldLandX, worldLandY)

    if (keyboard.G && !prevKeyboard.G) {
      gravity = !gravity
    }
    if (gravity) {
      const x = Math.floor(playerPosition[0] - activeLand.x * landSize)
      const y = Math.floor(playerPosition[2] - activeLand.y * landSize)
      playerPosition = v3.add(playerPosition, [
        0, 
        (activeLand.points[y * activeLand.size + x].height - playerPosition[1]) / 10, 
        0
      ])
    }

    const zoomSpeed = 0.1
    if (mouse.wheel < 0) {
      cameraOrbitDistance = Math.max(cameraOrbitDistance-zoomSpeed, 2.5)
    }
    if (mouse.wheel > 0) {
      cameraOrbitDistance += zoomSpeed
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
        Math.round(planeIntersection[0]),
        0, 
        Math.round(planeIntersection[2]),
      ]
    }
  
    actionTypes.forEach((mouseAction, index) => {
      if (keyboard[index+1]) {
        currentActionType = mouseAction
      }
    })

    if (keyboard.ARROWLEFT && !prevKeyboard.ARROWLEFT) {
      brushSize = Math.max(brushSize - 1, 1)
    }
    if (keyboard.ARROWRIGHT && !prevKeyboard.ARROWRIGHT) {
      brushSize++
    }
  
    const landPoints = getAllLandsPointsWithinBrush()
    const heightDelta = 0.1
    if (keyboard.ARROWUP || (mouse.buttons[0] && currentActionType === 'raise')) {
      landPoints.forEach(landPoint => {
        landPoint.height += heightDelta
      })
      new Set(landPoints.map(x => x.land)).forEach(land => {
        updateHeightMap(land)
      })
    }
    if (keyboard.ARROWDOWN || (mouse.buttons[0] && currentActionType === 'lower')) {
      landPoints.forEach(landPoint => {
        landPoint.height -= heightDelta
      })
      new Set(landPoints.map(x => x.land)).forEach(land => {
        updateHeightMap(land)
      })
    }
    if (keyboard.DELETE || (mouse.buttons[0] && currentActionType === 'reset')) {
      landPoints.forEach(landPoint => {
        landPoint.height = 0
        landPoint.type = 'grass'
        if (landPoint.prop) {
          landPoint.prop = null
          landPoint.land.propCount--
        }
      })

      new Set(landPoints.map(x => x.land)).forEach(land => {
        updateHeightMap(land)
        updateColorMap(land)
        updatePropMap(land)
      })
    }

    if (keyboard.C && !prevKeyboard.C) {
      currentPropType = propTypes[Math.max(propTypes.indexOf(currentPropType) - 1, 0)]
    }
    if (keyboard.V && !prevKeyboard.V) {
      currentPropType = propTypes[Math.min(propTypes.indexOf(currentPropType) + 1, propTypes.length - 1)]
    }
    if (keyboard.E || (mouse.buttons[0] && currentActionType === 'prop')) {
      landPoints.forEach(landPoint => {
        if (currentPropType) {
          if (!landPoint.prop) {
            if (landPoint.land.propCount >= maxPropCount) {
              return
            }
            landPoint.land.propCount++
          }
          landPoint.prop = {
            type: currentPropType,
            text: '' 
          }
        } else if (landPoint.prop) {
          landPoint.prop = null
          landPoint.land.propCount--
        }
      })

      new Set(landPoints.map(x => x.land)).forEach(land => {
        updatePropMap(land)
      })
    }

    if (keyboard.Z && !prevKeyboard.Z) {
      currentLandType = landTypes[Math.max(landTypes.indexOf(currentLandType) - 1, 0)]
    }
    if (keyboard.X && !prevKeyboard.X) {
      currentLandType = landTypes[Math.min(landTypes.indexOf(currentLandType) + 1, landTypes.length - 1)]
    }
    if (keyboard.Q || (mouse.buttons[0] && currentActionType === 'paint')) {
      landPoints.forEach(landPoint => {
        landPoint.type = currentLandType
      })
      new Set(landPoints.map(x => x.land)).forEach(land => {
        updateColorMap(land)
      })
    }

    if (keyboard[' ']) {
      const props = landPoints.filter(x => x.prop).map(x => x.prop)
      if (props.length) {
        debugger
        const text = prompt(`Edit text for ${props.length} prop(s)`, props[0].text)
        if (text != null) {
          props.forEach(prop => { prop.text = text })
        }
        keyboard[' '] = false
      }
    }

    // TODO: Look ahead and remove activeLand dependency
    const landPointAtPlayer = activeLand.points[
      Math.round(playerPosition[0] - activeLand.x * activeLand.size) + 
      Math.round(playerPosition[2] - activeLand.y * activeLand.size) * activeLand.size]
    if (landPointAtPlayer && landPointAtPlayer.prop) {
      propText = landPointAtPlayer.prop.text
    } else {
      propText = null
    }
  }

  function getAllLandsPointsWithinBrush() {
    const landPoints = []
    for (let i = 0 ; i < 2 * (brushSize - 1) + 1; ++i) {
      for (let j = 0 ; j < 2 * (brushSize - 1) + 1; ++j) {
        const brushOffsetX = i - brushSize + 1
        const brushOffsetY = j - brushSize + 1
        const worldLandX = Math.floor((markerPosition[0] + brushOffsetX) / landSize)
        const worldLandY = Math.floor((markerPosition[2] + brushOffsetY) / landSize)
        const land = world.lands[`${worldLandX}_${worldLandY}`]
        if (land) {
          const x = markerPosition[0] - land.x * landSize + brushOffsetX 
          const y = markerPosition[2] - land.y * landSize + brushOffsetY
          const landPoint = land.points[y * land.size + x]
          if (!landPoints.includes(landPoint)) {
            landPoints.push(landPoint)
          }
        }
      }
    }
    return landPoints
  }

  function updateCamera(playerPosition) {
    camera.near = 1
    camera.far = 1000
    camera.aspect = gl.canvas.clientWidth / gl.canvas.clientHeight
    camera.target = v3.add(playerPosition, [0, 1.5, 0])
  
    let offset = [
      cameraOrbitDistance * Math.sin(cameraOrbitHorisontal) * Math.cos(cameraOrbitVertical), 
      cameraOrbitDistance * Math.sin(cameraOrbitVertical),
      -cameraOrbitDistance * Math.cos(cameraOrbitHorisontal) * Math.cos(cameraOrbitVertical),
    ]
  
    camera.position = v3.add(playerPosition, offset)
    camera.update()
  }

  function updateHeightMap (land) {
    for (let i = 0; i < land.points.length; ++i) {
      land.heightMap[i] = land.points[i].height
    }
    land.heightMapDirty = true
  }

  function updateColorMap (land) {
    const colorMap = land.colorMap
    for (let i = 0; i < land.points.length; ++i) {
      switch(land.points[i].type) {
        case 'grass':
          colorMap[3*i + 0] = 71 
          colorMap[3*i + 1] = 176 
          colorMap[3*i + 2] = 20
          break
        case 'dirt':
          colorMap[3*i + 0] = 118 
          colorMap[3*i + 1] = 85 
          colorMap[3*i + 2] = 10
          break
        case 'sand':
          colorMap[3*i + 0] = 246 
          colorMap[3*i + 1] = 228 
          colorMap[3*i + 2] = 173
          break
        default:
          colorMap[3*i + 0] = 255 
          colorMap[3*i + 1] = 255 
          colorMap[3*i + 2] = 255
      }
    }
    land.colorMapDirty = true
  }

  function updatePropMap (land) {
    for (let i = 0; i < land.points.length; ++i) {
      land.propMap[i] = land.points[i].prop
    }
  }

  function getOrCreateLand(worldLandX, worldLandY) {
    const worldLandKey = `${worldLandX}_${worldLandY}`
    if (!world.lands[worldLandKey]) {
      world.lands[worldLandKey] = createLand(landSize, worldLandX, worldLandY)
    }
    return world.lands[worldLandKey]
  }

  function createLand(size, x, y) {
    const mapSize = size*size
    const land = {
      name: '',
      owner: user.name,
      authors: [user.name],
      size,
      x,
      y,
      points: new Array(mapSize),
      heightMap: new Float32Array(new Array(mapSize)),
      colorMap: new Uint8Array(new Array(mapSize * 3)),
      propMap: new Array(mapSize),
      heightMapDirty: false,
      colorMapDirty: false,
      propCount: 0,
    }

    for (let i = 0; i < mapSize; ++i) {
      land.points[i] = {
        land,
        height: 0,
        type: 'grass',
        prop: null
      }
    }

    updateHeightMap(land)
    updateColorMap(land)
    updatePropMap(land)

    return land
  }
}