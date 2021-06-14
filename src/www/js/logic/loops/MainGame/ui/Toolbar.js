import { preact } from '../../../../rendering/ui.js'
import { LAND } from '../../../entities.js'
import { loadLandIntoWorld } from '../../../data.js'
import { actionTypes, landTypes, propTypes} from '../_enums.js'
const  { html } = preact

export function Toolbar({ state, state: { brush, player, world }, data: { user }}) {
  const save = e => {
    e.target.blur()
    
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
          delete point._position
          if (point.prop) {
            delete point.prop.activeText
          }
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
  }

  const load = e => {
    e.target.blur()

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
  }

  return html`
    <div 
      class="toolbar" 
      onmousedown=${e => { e.stopPropagation() }} 
      onkeydown=${e => { e.stopPropagation() }}
    >
      <label>
        Mouse:
        ${' '}
        <select 
          value=${state.currentActionType} 
          oninput=${e => { state.currentActionType = e.target.value; e.target.blur(); }} 
          tabindex="-1"
        >
          ${
            actionTypes.map((actionType, index) => html`
              <option value=${actionType}>
                [${index+1}] ${actionType.toUpperCase()}
              </option>
            `)
          }
        </select>
      </label>
      <label>
        Land [Q / Z / X]: 
        ${' '}
        <select 
          value=${state.currentLandType} 
          oninput=${e => { state.currentLandType = e.target.value; e.target.blur(); }} 
          tabindex="-1"
        >
          ${
            landTypes.map(landType => html`
              <option value=${landType}>
                ${landType.toUpperCase()}
              </option>
            `)
          }
        </select>
      </label>
      <label>
        Prop [E / R / C / V]: 
        ${' '}
        <select 
          value=${state.currentPropType} 
          oninput=${e => { state.currentPropType = e.target.value; e.target.blur(); }} 
          tabindex="-1"
        >
          ${
            propTypes.map(propType => html`
              <option value=${propType}>
                ${propType.toUpperCase()}
              </option>
            `)
          }
        </select>
      </label>
      <label>
        Gravity [G]:
        ${' '}
        <input
          checked=${state.gravity}
          oninput=${e => { state.gravity = e.target.checked; e.target.blur(); }}
          type="checkbox" 
          tabindex="-1"
        />
      </label>
      <label>
        Soft brush [T]:
        ${' '}
        <input 
          checked=${brush.soft}
          oninput=${e => { brush.soft = e.target.checked; e.target.blur(); }}
          type="checkbox" 
          tabindex="-1"
        />
      </label>
      <label>
        Debug:
        ${' '}
        <input
          checked=${state.debug}
          oninput=${e => { state.debug = e.target.checked; e.target.blur(); }}
          type="checkbox" 
          tabindex="-1"
        />
      </label>
      <button onclick=${save} style="margin: 0 4px;">
        Save
      </button>
      <button onclick=${load} style="margin: 0 4px;">
        Load
      </button>
    </div>

    <style>
      .toolbar {
        position: absolute;
        top: 10px;
        left: 10px;
        max-width: calc(100vw - 110px);
        font-family: "Gothic A1", sans-serif;
        font-size: 14px;
      }
      
      .toolbar label {
        margin: 0 5px;
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
  `
}