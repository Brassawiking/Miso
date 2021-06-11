import { ui } from '../../../rendering/ui.js'
import { LAND } from '../../entities.js'
import { loadLandIntoWorld } from '../../data.js'
import { actionTypes, landTypes, propTypes} from './_enums.js'
import { jsonCopy } from '../../../common/util.js'

import { h, render } from '../../../external/preact.module.js'
import { useState, useEffect } from '../../../external/preact.hooks.module.js'
import htm from '../../../external/htm.module.js'
const html = htm.bind(h)  

export function init_UI({ 
  state,
  state: {
    brush,
    world,
  },
  data: {
    user
  }
}) {
  return () => {
    render(html`
      <${App}
        state=${state}
        user=${user}
        brush=${brush} 
        world=${world}
      />
    `, ui)
  }
}

function App({ state, state: { player }, user, brush, world }) {
  const [showInventory, setShowInventory] = useState(false)
  const [showCharacter, setShowCharacter] = useState(false)
  const [showHelp, setShowHelp] = useState(true)

  const save = () => {
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

  const load = () => {
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
    <div>
      <${LandText} state=${state} />
      <${PropDialog} state=${state} />

      <${Toolbar} state=${state} />
      <${Info} 
        showHelp=${showHelp} 
        brush=${brush}
        world=${world}
      />

      <ul class="menu" onmousedown=${e => { e.stopPropagation() }}>
        <li 
          onclick=${() => { setShowInventory(!showInventory) }} 
          class=${showInventory ? 'selected' : ''}
        >
          Inv
        </li>
        <li 
          onclick=${() => { setShowCharacter(!showCharacter) }} 
          class=${showCharacter ? 'selected' : ''}
        >
          Char
        </li>
        <li onclick=${save}>
          Save
        </li>
        <li onclick=${load}>
          Load
        </li>
        <li 
          onclick=${() => { setShowHelp(!showHelp) }} 
          class=${showHelp ? 'selected' : ''}
        >
          Help
        </li>
      </ul>

      ${showInventory && html`
        <${Inventory} player=${player} />
      `}

      ${showCharacter && html`
        <${Character} state=${state} />
      `}
      
      ${state.editingProps && html`
        <${EditingProps} state=${state} />
      `}
    </div>
  `
}

function Toolbar({ state, state: { brush } }) {
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
    </div>
  `
}

function LandText({ state, state: { player, world }}) {
  const activeLand = LAND.at(player.position, world)

  useEffect(() => {
    // Temp fix
    const element = document.querySelector('.js-land-text')
    let fadeTimer

    element.classList.remove('ui-fade-in')
    element.classList.add('ui-fade-out')

    fadeTimer = setTimeout(() => {
      // Temp fix
      element.innerHTML = `
        <h1 style="text-align: center;">${activeLand.name || 'Unclaimed Land...'}</h1>
        ${activeLand.owner || '(You can claim this land if you want to)'} 
      `
      element.classList.add('ui-fade-in')
      element.classList.remove('ui-fade-out')
      element.hidden = false
      
      fadeTimer = setTimeout(() => {
        element.classList.remove('ui-fade-in')
        element.classList.add('ui-fade-out')
      }, 2000)
    }, 1000)

    return () => {
      clearTimeout(fadeTimer)
    }
  }, [activeLand.name, activeLand.owner])

  return html`
    <div 
      hidden
      class="js-land-text ui-box ui-center" 
      style="text-align: right;"
    />
  `
}

function PropDialog({ state, state: { player } }) {
  return html`
    ${state.interactiveLandpoint && html`
      <div class="ui-box ui-center" style="white-space: pre;">
        ${state.interactiveLandpoint.prop.activeText || state.interactiveLandpoint.prop.text}
        ${state.interactiveLandpoint.prop.interactions && 
          state.interactiveLandpoint.prop.interactions
            .filter(interaction => {
              if (interaction.conditions) {
                for (const condition in interaction.conditions) {
                  if (!!player.events[condition] != interaction.conditions[condition]) {
                    return false
                  }
                }
              }
              return true
            })
            .map(interaction => html`
              <button
                onmousedown=${e => {
                  e.stopPropagation()
                  const effects = interaction.effects
                  if (effects.text || effects.text == null) {
                    state.interactiveLandpoint.prop.activeText = effects.text
                  }
                  for (const event in effects.events) {
                    player.events[event] = effects.events[event]
                  }
                }}
                style="display: block; margin: 10px auto;"
              >
                ${interaction.action}
              </button>
            `)
        }
      </div>
    `}
  `
}

function Inventory({ player }) {
  const buyItem = itemToBuy => {
    if (itemToBuy != null) {
      const firstEmptySlot = player.items.indexOf(null)
      if (firstEmptySlot < 0) {
        alert('No more room in inventory')
      } else {
        let item = null
        switch (itemToBuy) {
          case 'lightfoot':
            item = {
              name: 'Lightfoot',
              icon: 'https://i.pinimg.com/originals/40/ed/8e/40ed8e381cf0876d77b540144c1247e0.png',
              type: 'mod',
              effects: {
                speed: 0.1,
              }
            }
            break
          case 'eaglewings':
            item = {
              name: 'Lightfoot',
              icon: 'https://i.pinimg.com/originals/3b/37/86/3b37860fb69293ef99bba496fe9cb1d5.png',
              type: 'mod',
              effects: {
                jump: 0.5,
              }
            }
            break
        }
        player.items[firstEmptySlot] = item
      }
    }
  }

  return html`
    <div class="inventory ui-box ui-rows" onmousedown=${e => { e.stopPropagation() }}>
      <h1>
        Inventory
      </h1>
      <div style="margin: 10px 0;">
        Buy:
        ${' '}
        <button onclick=${() => { buyItem('lightfoot') }}>MOD: "Lightfoot"</button>
        ${' '}
        <button onclick=${() => { buyItem('eaglewings') }}>MOD: "Eagle Wings"</button>
      </div>
      <div class="grid">
        ${
          player.items.map((item, index) => html`
            <div
              onmousedown=${e => {
                if (e.button == 2) {
                  player.items[index] = null
                }
              }}
              title=${item && `
${item.type.toUpperCase()}:
"${item.name}"

EFFECTS:
${Object.keys(item.effects).map(effect => `${effect}: ${item.effects[effect]}`).join('\n')}

(Right-click to remove)
              `}
              class="slot"
            >
            ${item && html`
              <img 
                src="${item.icon}"
                style="pointer-events: none;"
              />
            `}
            </div>
          `)
        }
      </div>
    </div>
  `
}

function Character({ state: { player }}) {
  return html`
    <div class="inventory ui-box ui-rows" onmousedown=${e => { e.stopPropagation() }}>
      <h1>Character</h1>

      <h2>Events</h2>
      <ul>
        ${Object.keys(player.events).map(event => html`
          <li>
            ${event}: ${player.events[event] + ''}
            ${' '}
            <button onclick=${() => { delete player.events[event] }}>
              Remove
            </button>
          </li>
        `)}
      </ul>
    </div>
  `
}

function Info({ showHelp, brush, world }) {
  const landAtBrush = LAND.at(brush.position, world) || {}
  return html`
    <div class="ui-box ui-bottom ui-right">
      <table>
        <tr><th colspan="2"> ----- Brush info ----- </th></tr>
        <tr><th> Size </th><td> ${(brush.size-1)*2 + 1} </td></tr>
        <tr><th> Position </th><td> ${brush.position[0] + ', ' + brush.position[2]} </td></tr>
        <tr><th> Land name </th><td> ${landAtBrush.owner != null ? landAtBrush.name : 'NOT CLAIMED'} </td></tr>
        <tr><th> Land owner </th><td> ${landAtBrush.owner != null ? landAtBrush.owner : 'NOT CLAIMED'} </td></tr>
        <tr><th> Land props </th><td> ${landAtBrush.propCount + ' / ' + world.maxPropCount} </td></tr>
      </table>

      ${showHelp && html`
        <table>
          <tr><th colspan="2"> ----- Controls ----- </th></tr>
          <tr><th> Enter </th><td> Claim / Rename land </td></tr>
          <tr><th> WASD </th><td> Move </td></tr>
          <tr><th> Page up </th><td> Jump / Fly up </td></tr>
          <tr><th> Page down </th><td> Fly down </td></tr>
          <tr><th> Up / Down </th><td> Land height </td></tr>
          <tr><th> Left / Right </th><td> Brush size </td></tr>
          <tr><th> Mouse left </th><td> Action </td></tr>
          <tr><th> Mouse right </th><td> Rotate camera </td></tr>
          <tr><th> Mouse wheel </th><td> Zoom </td></tr>
          <tr><th> Space </th><td> Edit prop </td></tr>
          <tr><th> (Shift +) K / L </th><td> Rotate prop </td></tr>
          <tr><th> Delete </th><td> Reset land </td></tr>
          <tr><th> [A / B / C / ...] </th><td> Shortcuts </td></tr>
        </table>
      `}
    </div>
  `
}

function EditingProps({ state, state: { editingProps } }) {
  const updateProps = () => {
    editingProps.forEach(prop => { 
      prop.text = editingProps[0].text 
      prop.activeText = editingProps[0].activeText 
      prop.interactions = jsonCopy(editingProps[0].interactions) 
    })
  }
  
  return html`
    <div 
      class="inventory ui-box" 
      style="z-index: 10;"
      tabindex="-1" 
      onmousedown=${e => { e.stopPropagation() }}
      onkeydown=${e => { e.stopPropagation() }}
    >
      <h1>
        Editing ${editingProps.length} prop(s)
        ${' '}
        <button onclick=${e => { state.editingProps = null }}>
          Done
        </button>
      </h1>

      <label style="display: inline-block;">
        Prop text <br/>
        <textarea
          autofocus
          style="width: 300px; height: 100px; box-sizing: border-box; resize: none;"
          placeholder="Something to grab the attention..."
          value=${editingProps[0].text || ''}
          oninput=${e => {
            editingProps[0].text = e.target.value
            updateProps()
          }}
        />
      </label>

      ${' '}

      <label style="display: inline-block; visibility: hidden;">
        Current interaction text <br/>
        <textarea
          style="width: 300px; height: 100px; box-sizing: border-box; resize: none;"
          placeholder="Added through interactions..."
          value=${editingProps[0].activeText || ''}
          oninput=${e => {
            editingProps[0].activeText = e.target.value
            updateProps()
          }}
        />
      </label>

      <div style="display: none;">
      <h2>Interactions</h2>
      <button onclick=${e => {
        editingProps[0].interactions.push({
          action: 'Could you tell me more?',
          conditions: {
            greeter1: false
          },
          effects: {
            text: 'It is just like, reeeeaaaaally big maaaan',
            events: {
              greeter1: true
            } 
          }
        })
        updateProps()
      }}>
        Add interaction
      </button>

      ${editingProps[0].interactions.map(interaction => html`
        <div style="display: flex;">
          <div>
            Action:<br/>
            <input 
              value=${interaction.action}
              oninput=${e => {
                interaction.action = e.target.value
                updateProps()
              }}
            />
          </div>

          <div>
            Effects:
            <div>
              <input 
                type="checkbox" 
                checked=${interaction.effects.text != null}
                oninput=${() => {
                  interaction.effects.text != null 
                  ? delete interaction.effects.text 
                  : interaction.effects.text = 'Hello'
                }}
              />
              Text:
              <input value=${interaction.effects.text} disabled=${interaction.effects.text == null}/>
            </div> 
          </div>

          <button onclick=${() => {
            editingProps[0].interactions.splice(editingProps[0].interactions.indexOf(interaction), 1)
            updateProps() 
          }}>
            Remove
          </button>
        </div>
      `)}
     </div>
    </div>
  `
}