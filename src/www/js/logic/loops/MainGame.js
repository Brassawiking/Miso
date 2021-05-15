import { v3, linePlaneIntersectionPoint, clamp } from '../../common/math.js'
import { createScene_World } from '../../rendering/scenes/World.js'
import { WORLD, LAND, CAM, BRUSH, updateHeightMap, updateColorMap, updatePropMap } from '../entities.js'

export function createLoop_MainGame ({ 
  gl,
  ui,  
  keyboard,
  prevKeyboard,
  mouse,
  prevMouse,
  data: { user } 
}) {
  const LAND_SIZE = 256
  const MAX_PROP_COUNT = 1500

  const world = WORLD.landSize(WORLD.identity(), LAND_SIZE)
  const brush = BRUSH.identity()
  const camera = CAM.identity()
 
  window.world = world

  const scene_World = createScene_World(gl, LAND_SIZE)

  const state = {}
  let gravity = false
  let playerPosition = [0, 1, 0]
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


    <style>
      .info {
        position: absolute;
        bottom: 10px;
        right: 10px;
        color: #fff;
        background: rgba(0, 0, 0, 0.3);
        padding: 10px;
        text-align: right;
        font-size: 12px;
        line-height: 12px;
        font-family: "Gothic A1", sans-serif;
        border-radius: 4px;
      }
    </style>
    <div class="js-info info"></div>
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

  const ui_info = ui.querySelector('.js-info')

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

    const worldLandX = Math.floor(playerPosition[0] / LAND_SIZE)
    const worldLandY = Math.floor(playerPosition[2] / LAND_SIZE)
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
      markerPosition: brush.position,
      brushSize: brush.size,
      playerPosition,
      lands
    })

    lands.forEach(land => {
      land.heightMapDirty = false
      land.colorMapDirty = false
    })
     
    const landAtBrush = LAND.at(brush.position, world) || {}
    const infoContent = `
      <table style="width: 100%;">
        <tr><th colspan="2" style="text-align: center;"> ----- Brush info ----- </th><tr>
        <tr><th style="text-align: left;"> Size </th><td> ${(brush.size-1)*2 + 1} </td><tr>
        <tr><th style="text-align: left;"> Position </th><td> ${brush.position[0]}, ${brush.position[2]} </td><tr>
        <tr><th style="text-align: left;"> Land name </th><td> ${landAtBrush.owner != null ? landAtBrush.name : 'NOT CLAIMED'} </td><tr>
        <tr><th style="text-align: left;"> Land owner </th><td> ${landAtBrush.owner != null ? landAtBrush.owner : 'NOT CLAIMED'} </td><tr>
        <tr><th style="text-align: left;"> Land prop count </th><td> ${landAtBrush.propCount} / ${MAX_PROP_COUNT} </td><tr>
      </table>
      <br/>

      <table style="width: 100%;">
        <tr><th colspan="2" style="text-align: center;"> ----- Controls ----- </th><tr>
        <tr><th style="text-align: left;"> Enter </th><td> Claim / Rename land </td><tr>
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

    if (infoContent !== state.prevInfoContent) {
      ui_info.innerHTML = infoContent
      state.prevInfoContent = infoContent
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

    const worldLandX = Math.floor(playerPosition[0] / LAND_SIZE)
    const worldLandY = Math.floor(playerPosition[2] / LAND_SIZE)
    const activeLand = getOrCreateLand(worldLandX, worldLandY)

    if (keyboard.G && !prevKeyboard.G) {
      gravity = !gravity
    }
    if (gravity) {
      const x = Math.floor(playerPosition[0] - activeLand.x * LAND_SIZE)
      const y = Math.floor(playerPosition[2] - activeLand.y * LAND_SIZE)
      playerPosition = v3.add(playerPosition, [
        0, 
        (activeLand.points[y * LAND_SIZE + x].height - playerPosition[1]) / 10, 
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
      brush.position = [
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
      brush.size = Math.max(brush.size - 1, 1)
    }
    if (keyboard.ARROWRIGHT && !prevKeyboard.ARROWRIGHT) {
      brush.size++
    }
  
    const landPoints = BRUSH.ownedLandPoints(brush, world, user)
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
        landPoint.height = 1
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
            if (landPoint.land.propCount >= MAX_PROP_COUNT) {
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

    if (keyboard.ENTER && !prevKeyboard.ENTER) {
      const land = LAND.at(brush.position, world)
      if (!land) {
        return
      }

      if (land.owner == null) {
        const landName = prompt('Claim and name this land')
        if (landName != null) {
          land.owner = user.name
          land.name = landName

          const mapSize = LAND_SIZE * LAND_SIZE
          for (let i = 0; i < mapSize; ++i) {
            land.points[i].height = 1
          }
          updateHeightMap(land)
        }
      } else if (land.owner == user.name) {
        const landName = prompt('Rename this land', land.name)
        if (landName != null) {
          land.name = landName
        }
      }
    }

    if (keyboard[' ']) {
      const props = landPoints.filter(x => x.prop).map(x => x.prop)
      if (props.length) {
        const text = prompt(`Edit text for ${props.length} prop(s)`, props[0].text)
        if (text != null) {
          props.forEach(prop => { prop.text = text })
        }
        keyboard[' '] = false
      }
    }

    // TODO: Look ahead and remove activeLand dependency
    const landPointAtPlayer = activeLand.points[
      Math.round(playerPosition[0] - activeLand.x * LAND_SIZE) + 
      Math.round(playerPosition[2] - activeLand.y * LAND_SIZE) * LAND_SIZE]
    if (landPointAtPlayer && landPointAtPlayer.prop) {
      propText = landPointAtPlayer.prop.text
    } else {
      propText = null
    }
  }

  function updateCamera(playerPosition) {
    camera.aspect = gl.canvas.clientWidth / gl.canvas.clientHeight
    camera.target = v3.add(playerPosition, [0, 1.5, 0])
    CAM.orbit(camera, playerPosition, cameraOrbitDistance, cameraOrbitHorisontal, cameraOrbitVertical)
  }

  function getOrCreateLand(iX, iY) {
    return (
      LAND.at_index(iX, iY, world) ||
      LAND.add(LAND.identity(world.landSize), world, iX, iY)
    )  
  }
}