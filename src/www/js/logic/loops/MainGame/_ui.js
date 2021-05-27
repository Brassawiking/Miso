import { v3 } from '../../../common/math.js'
import { LAND, LANDPOINT } from '../../entities.js'
import { loadLandIntoWorld } from '../../data.js'
import { markup } from '../../../rendering/ui.js'

export function init_UI({ 
  ui,
  actionTypes, 
  landTypes, 
  propTypes,
  state,
  state: {
    brush,
    world,
    player,
  },
  data: {
    user
  }
}) {
  const [root, { 
    ui_actionType, 
    ui_landType, 
    ui_propType, 
    ui_gravity,
    ui_brushSoft,
    ui_debug,

    ui_landText,
    ui_propText,

    ui_brushSize,
    ui_brushPosition,
    ui_brushLandName,
    ui_brushLandOwner,
    ui_brushLandPropCount,

    ui_save,
    ui_load,
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
        <label>
          Soft brush [T]:
          <input ref="brushSoft" type="checkbox" tabindex="-1"/>
        </label>
        <label>
          Debug:
          <input ref="debug" type="checkbox" tabindex="-1"/>
        </label>
      </div>

      <div ref="landText" hidden class="ui-box ui-center" style="text-align: right;"></div>
      <div ref="propText" hidden class="ui-box ui-center" style="white-space: pre;"></div>

      <ul class="menu" onmousedown="event.stopPropagation()">
        <li onclick="ui_inventory.hidden = !ui_inventory.hidden; this.classList.toggle('selected')">Inv</li>
        <li onclick="ui_char.hidden = !ui_char.hidden; this.classList.toggle('selected')">Char</li>
        <li ref="save">Save</li>
        <li ref="load">Load</li>
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
          <tr><th> Page up </th><td> Jump / Fly up </td><tr>
          <tr><th> Page down </th><td> Fly down </td><tr>
          <tr><th> Up / Down </th><td> Land height </td><tr>
          <tr><th> Left / Right </th><td> Brush size </td><tr>
          <tr><th> Mouse left </th><td> Action </td><tr>
          <tr><th> Mouse right </th><td> Rotate camera </td><tr>
          <tr><th> Mouse wheel </th><td> Zoom </td><tr>
          <tr><th> Space </th><td> Edit prop </td><tr>
          <tr><th> K / L </th><td> Rotate prop </td><tr>
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
    state.currentActionType = e.target.value
    e.target.blur()
  })

  landTypes.forEach(landType => { ui_landType.add(new Option(landType.toUpperCase(), landType)) })
  ui_landType.addEventListener('input', e => { 
    state.currentLandType = e.target.value
    e.target.blur()
  })

  propTypes.forEach(propType => { ui_propType.add(new Option(propType.toUpperCase(), propType)) })
  ui_propType.addEventListener('input', e => { 
    state.currentPropType = e.target.value
    e.target.blur()
  })

  ui_gravity.addEventListener('input', e => { 
    state.gravity = e.target.checked 
    e.target.blur()
  })

  ui_brushSoft.addEventListener('input', e => { 
    brush.soft = e.target.checked 
    e.target.blur()
  })

  ui_debug.addEventListener('input', e => { 
    state.debug = e.target.checked 
    e.target.blur()
  })

  ui_save.addEventListener('click', e => {
    const land = LAND.at(player.position, world)
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

  ui_load.addEventListener('click', e => {
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.addEventListener('input', e => {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onload = () => {
        loadLandIntoWorld(JSON.parse(reader.result), world)
      };
      reader.readAsText(file)
    })
    fileInput.click()
  })

  let currentLandText
  let currentLandTextTimer
  let propText

  return () => {
    const landAtBrush = LAND.at(brush.position, world) || {}
    ui_brushSize.textContent = (brush.size-1)*2 + 1
    ui_brushPosition.textContent = brush.position[0] + ', ' + brush.position[2]
    ui_brushLandName.textContent = landAtBrush.owner != null ? landAtBrush.name : 'NOT CLAIMED'
    ui_brushLandOwner.textContent = landAtBrush.owner != null ? landAtBrush.owner : 'NOT CLAIMED'
    ui_brushLandPropCount.textContent = landAtBrush.propCount + ' / ' + world.maxPropCount

    ui_landType.value = state.currentLandType
    ui_propType.value = state.currentPropType
    ui_actionType.value = state.currentActionType
    ui_gravity.checked = state.gravity
    ui_brushSoft.checked = brush.soft
    ui_debug.checked = state.debug

    const activeLand = LAND.at(player.position, world)
    const landText = `
      <h1>${activeLand.name || 'Unclaimed Land...'}</h1>
      ${activeLand.owner || '(You can claim this land if you want to)'} 
    `
    if (currentLandText != landText) {
      currentLandText = landText

      ui_landText.classList.remove('ui-fade-in')
      ui_landText.classList.add('ui-fade-out')

      clearTimeout(currentLandTextTimer)
      currentLandTextTimer = setTimeout(() => {
        ui_landText.innerHTML = currentLandText
        ui_landText.classList.add('ui-fade-in')
        ui_landText.classList.remove('ui-fade-out')
        ui_landText.hidden = false
        
        currentLandTextTimer = setTimeout(() => {
          ui_landText.classList.remove('ui-fade-in')
          ui_landText.classList.add('ui-fade-out')
        }, 2000)
      }, 1000)
    }

    ui_propText.hidden = !propText
    ui_propText.textContent = propText

    const landPointAtPlayer = LANDPOINT.at(v3.add(player.position, [0.5, 0, 0.5]), world)
    if (landPointAtPlayer && landPointAtPlayer.prop) {
      propText = landPointAtPlayer.prop.text
    } else {
      propText = null
    }
  }
}