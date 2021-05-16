import { v3, linePlaneIntersectionPoint, clamp } from '../../common/math.js'
import { createScene_World } from '../../rendering/scenes/World.js'
import { CAMERA, BRUSH, WORLD, LAND, LANDPOINT, PROP, } from '../entities.js'
import { markup } from '../../rendering/ui.js'

export async function createLoop_MainGame ({ 
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
  const camera = CAMERA.identity()
 
  const scene_World = createScene_World(gl, LAND_SIZE)

  const loadData = async url => (await fetch(url)).json()
  const loadedLands = await Promise.all([
    loadData('data/miso_land_-1_0.json')
  ])
  loadedLands.forEach(data => {
    const land = LAND.identity(LAND_SIZE)
    land.name = data.name
    land.owner = data.owner
    land.authors = data.authors
    land.x = data.x
    land.y = data.y
    land.points.forEach((p, i) => {
      Object.assign(p, data.points[i])
      if (data.points[i].prop) {
        land.propCount++
      }
    })

    LAND.updateHeightMap(land)
    LAND.updateColorMap(land)
    LAND.updatePropMap(land)

    LAND.add(land, world, land.x, land.y)
  })

  const state = {}
  let gravity = true
  let playerPosition = [0, 1, 0]
  let cameraOrbitDistance = 6
  let cameraOrbitHorisontal = 0
  let cameraOrbitVertical = Math.PI / 5
  let propText

  const actionTypes = [
    'raise',
    'lower',
    'paint',
    'prop_add',
    'prop_remove',
    'reset'
  ]
  let currentActionType = actionTypes[0]

  const landTypes = [
    'sand',
    'dirt',
    'rock',
    'grass'
  ]
  let currentLandType = landTypes[0]

  const propTypes = [
    'tree',
    'bush',
    'stone_tablet',
  ]
  let currentPropType = propTypes[0]
  
  const [root, { 
    ui_actionType, 
    ui_landType, 
    ui_propType, 
    ui_gravity, 
    ui_propText,

    ui_brushSize,
    ui_brushPosition,
    ui_brushLandName,
    ui_brushLandOwner,
    ui_brushLandPropCount,

    ui_save
  }] = markup(`
    <div>
      <div class="toolbar" onmousedown="event.stopPropagation()" onkeydown="event.stopPropagation()">
        <label>
          Mouse: 
          <select ref="actionType" tabindex="-1"></select>
        </label>
        <label>
          Land [Q / Z / X]: 
          <select ref="landType" tabindex="-1"></select>
        </label>
        <label>
          Prop [E / R / C / V]: 
          <select ref="propType" tabindex="-1"></select>
        </label>
        <label>
          Gravity [G]:
          <input ref="gravity" type="checkbox" tabindex="-1"/>
        </label>
      </div>

      <div ref="propText" class="ui-box ui-bottom ui-left" style="white-space: pre;"></div>

      <ul class="menu" onmousedown="event.stopPropagation()">
        <li onclick="ui_inventory.hidden = !ui_inventory.hidden; this.classList.toggle('selected')">Inv</li>
        <li onclick="ui_char.hidden = !ui_char.hidden; this.classList.toggle('selected')">Char</li>
        <li ref="save">Save</li>
        <li onclick="ui_help.hidden = !ui_help.hidden; this.classList.toggle('selected')" class="selected">Help</li>
      </ul>

      <div id="ui_inventory" class="inventory ui-box ui-rows" onmousedown="event.stopPropagation()" hidden>
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

      <div id="ui_char" class="inventory ui-box ui-rows" onmousedown="event.stopPropagation()" hidden>
        <h1>Character</h1>
      </div>

      <div class="ui-box ui-bottom ui-right">
        <table>
          <tr><th colspan="2"> ----- Brush info ----- </th><tr>
          <tr><th> Size </th><td ref="brushSize"> </td><tr>
          <tr><th> Position </th><td ref="brushPosition"> </td><tr>
          <tr><th> Land name </th><td ref="brushLandName">  </td><tr>
          <tr><th> Land owner </th><td ref="brushLandOwner"> </td><tr>
          <tr><th> Land props </th><td ref="brushLandPropCount"> </td><tr>
        </table>

        <table id="ui_help">
          <tr><th colspan="2"> ----- Controls ----- </th><tr>
          <tr><th> Enter </th><td> Claim / Rename land </td><tr>
          <tr><th> WASD </th><td> Move </td><tr>
          <tr><th> Shift / Control </th><td> Fly up / down </td><tr>
          <tr><th> Up / Down </th><td> Land height </td><tr>
          <tr><th> Left / Right </th><td> Brush size </td><tr>
          <tr><th> Mouse left </th><td> Action </td><tr>
          <tr><th> Mouse right </th><td> Rotate camera </td><tr>
          <tr><th> Mouse wheel </th><td> Zoom </td><tr>
          <tr><th> Space </th><td> Edit prop </td><tr>
          <tr><th> Delete </th><td> Reset land </td><tr>
          <tr><th> [A / B / C / ...] </th><td> Shortcuts </td><tr>
        </table>
      </div>
    </div>
  `)
  ui.insertBefore(root, ui.firstChild)

  actionTypes.forEach((mouseAction, index) => { 
    ui_actionType.add(new Option(`[${index+1}] ${mouseAction.toUpperCase()}`, mouseAction)) 
  })
  ui_actionType.addEventListener('input', e => { 
    currentActionType = e.target.value
    e.target.blur()
  })

  landTypes.forEach(landType => { ui_landType.add(new Option(landType.toUpperCase(), landType)) })
  ui_landType.addEventListener('input', e => { 
    currentLandType = e.target.value
    e.target.blur()
  })

  propTypes.forEach(propType => { ui_propType.add(new Option(propType.toUpperCase(), propType)) })
  ui_propType.addEventListener('input', e => { 
    currentPropType = e.target.value
    e.target.blur()
  })

  ui_gravity.addEventListener('input', e => { 
    gravity = e.target.checked 
    e.target.blur()
  })

  ui_save.addEventListener('click', e => {
    const land = LAND.at(playerPosition, world)
    if (land && land.owner == user.name) {
      const data = { 
        name: land.name,
        owner: land.owner,
        authors: land.authors,
        x: land.x,
        y: land.y,
        points: land.points.map(x => {
          const point = { ...x }
          delete point.land
          return point
        })
      }

      var download = document.createElement('a')
      download.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(data)))
      download.setAttribute('download', `miso_land_${land.x}_${land.y}.json`)
      download.setAttribute('target', '_blank')
      download.style.display = 'none'
      document.body.appendChild(download)
      download.click()
      document.body.removeChild(download)
    }
  })

  return ({t, dt}) => {
    logic(t, dt)

    const activeLandIndexX = Math.floor(playerPosition[0] / LAND_SIZE)
    const activeLandIndexY = Math.floor(playerPosition[2] / LAND_SIZE)
    const activeLand = getOrCreateLand(activeLandIndexX, activeLandIndexY)
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

    const sunRay = [Math.sin(t / 1000), -1, Math.cos(t / 1000)]
    scene_World({
      cameraView: camera.matrix,
      camera,
      time: t,
      brush,
      playerPosition,
      lands,
      sunRay
    })

    lands.forEach(land => {
      land.heightMapDirty = false
      land.colorMapDirty = false
    })
     
    const landAtBrush = LAND.at(brush.position, world) || {}
    ui_brushSize.textContent = (brush.size-1)*2 + 1
    ui_brushPosition.textContent = brush.position[0] + ', ' + brush.position[2]
    ui_brushLandName.textContent = landAtBrush.owner != null ? landAtBrush.name : 'NOT CLAIMED'
    ui_brushLandOwner.textContent = landAtBrush.owner != null ? landAtBrush.owner : 'NOT CLAIMED'
    ui_brushLandPropCount.textContent = landAtBrush.propCount + ' / ' + MAX_PROP_COUNT

    ui_landType.value = currentLandType
    ui_propType.value = currentPropType
    ui_actionType.value = currentActionType
    ui_gravity.checked = gravity

    ui_propText.hidden = !propText
    ui_propText.textContent = propText
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
      playerPosition = v3.add(playerPosition, [
        0, 
        (Math.max(LANDPOINT.at(v3.add(playerPosition, [0.5, 0, 0.5]), world).height, -1) - playerPosition[1]) / 10, 
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
      const vertBias = 0.001 // Temp fix so the camera don't go bananaz
      cameraOrbitHorisontal = state.orbitMoveStart.orbitH - (mouse.x - state.orbitMoveStart.mouseX) * orbitSpeed
      cameraOrbitVertical = clamp(
        state.orbitMoveStart.orbitV - (mouse.y - state.orbitMoveStart.mouseY) * orbitSpeed,
        -Math.PI / 2 + vertBias,
        Math.PI / 2 - vertBias
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
        LAND.updateHeightMap(land)
      })
    }
    if (keyboard.ARROWDOWN || (mouse.buttons[0] && currentActionType === 'lower')) {
      landPoints.forEach(landPoint => {
        landPoint.height -= heightDelta
      })
      new Set(landPoints.map(x => x.land)).forEach(land => {
        LAND.updateHeightMap(land)
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
        LAND.updateHeightMap(land)
        LAND.updateColorMap(land)
        LAND.updatePropMap(land)
      })
    }

    if (keyboard.C && !prevKeyboard.C) {
      currentPropType = propTypes[Math.max(propTypes.indexOf(currentPropType) - 1, 0)]
    }
    if (keyboard.V && !prevKeyboard.V) {
      currentPropType = propTypes[Math.min(propTypes.indexOf(currentPropType) + 1, propTypes.length - 1)]
    }
    if (keyboard.E || (mouse.buttons[0] && currentActionType === 'prop_add')) {
      landPoints.forEach(landPoint => {
        if (!landPoint.prop) {
          if (landPoint.land.propCount >= MAX_PROP_COUNT) {
            return
          }
          landPoint.land.propCount++
          landPoint.prop = PROP.identity()
        } 
        landPoint.prop.type = currentPropType
      })

      new Set(landPoints.map(x => x.land)).forEach(land => {
        LAND.updatePropMap(land)
      })
    }
    if (keyboard.R || (mouse.buttons[0] && currentActionType === 'prop_remove')) {
      landPoints.forEach(landPoint => {
        if (landPoint.prop) {
          landPoint.prop = null
          landPoint.land.propCount--
        }
      })
      new Set(landPoints.map(x => x.land)).forEach(land => {
        LAND.updatePropMap(land)
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
        LAND.updateColorMap(land)
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
          LAND.updateHeightMap(land)
        }
      } else if (land.owner == user.name) {
        const landName = prompt('Rename this land', land.name)
        if (landName != null) {
          land.name = landName
        }
      } else {
        alert(`This land is already claimed by "${land.owner}", try another claiming another land!` )
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

    const landPointAtPlayer = LANDPOINT.at(v3.add(playerPosition, [0.5, 0, 0.5]), world)
    if (landPointAtPlayer && landPointAtPlayer.prop) {
      propText = landPointAtPlayer.prop.text
    } else {
      propText = null
    }
  }

  function updateCamera(playerPosition) {
    camera.aspect = gl.canvas.clientWidth / gl.canvas.clientHeight
    camera.target = v3.add(playerPosition, [0, 1.5, 0])
    CAMERA.orbit(camera, playerPosition, cameraOrbitDistance, cameraOrbitHorisontal, cameraOrbitVertical)
  }

  function getOrCreateLand(iX, iY) {
    return (
      LAND.at_index(iX, iY, world) ||
      LAND.add(LAND.identity(world.landSize), world, iX, iY)
    )  
  }
}