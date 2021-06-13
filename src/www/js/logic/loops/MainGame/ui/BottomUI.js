import { preact } from '../../../../rendering/ui.js'
const  { html, useState } = preact
import { Inventory } from './Inventory.js'
import { Events } from './Events.js'
import { Shop } from './Shop.js'

const menuSound = new Audio('https://opengameart.org/sites/default/files/audio_preview/mouseclick.wav.mp3')
const tabSound = new Audio('https://opengameart.org/sites/default/files/Menu%20Selection%20Click%20%28preview%29.mp3')

export function BottomUI({ state, state: { player } }) {
  const [expanded, setExpanded] = useState(false)
  const [tab, setTab] = useState('inventory')

  const tabSelected = tab => {
    setTab(tab)

    if (tabSound.paused) {
      tabSound.play()
    } else {
      tabSound.currentTime = 0
    }
  }

  const toggle = e => {
    e.target.blur();

    setExpanded(!expanded)
    if (menuSound.paused) {
      menuSound.play()
    } else {
      menuSound.currentTime = 0
    }
  }

  return html`
    <div 
      class="bottomUI ${expanded ? 'expanded' : ''}" 
      onmousedown=${e => { e.stopPropagation() }} 
      onmousemove=${e => { e.stopPropagation() }}
      onmousewheel=${e => { e.stopPropagation() }}
      onkeydown=${e => { e.stopPropagation() }}
    >
      <div class="quickbar">
        <div class="statBar" style="color: red;">
          <div class="statBarIcon">♥</div>
          ${
            Array(player.toughness.max).fill(null).map((_, index) => html`
              <div class="statBarPoint ${index+1 > player.toughness.value ? 'empty' : ''}"/>
            `)
          }
        </div>
        <div class="statBar" style="color: gold;">
          <div class="statBarIcon">➤</div>
          ${
            Array(player.stamina.max).fill(null).map((_, index) => html`
              <div class="statBarPoint ${index+1 > player.stamina.value ? 'empty' : ''}"/>
            `)
          }
        </div>
        <div class="statBar" style="color: cyan;">
          <div class="statBarIcon">★</div>
          ${
            Array(player.ability.max).fill(null).map((_, index) => html`
              <div class="statBarPoint ${index+1 > player.ability.value ? 'empty' : ''}"/>
            `)
          }
        </div>
        <div class="statBar" style="color: lime;" >
          <div class="statBarIcon">⭯</div>
          ${
            Array(player.recovery.max).fill(null).map((_, index) => html`
              <div class="statBarPoint ${index+1 > player.recovery.value ? 'empty' : ''}"/>
            `)
          }
        </div>

        <div style="flex: 1 1 0;"/>

        <button 
          onclick=${e => {
            e.target.blur()
            state.help = !state.help
          }}
          class="${state.help ? 'selected' : ''}"
        >
          Help
        </button>
        <button onclick=${toggle}>
          ${expanded ? '▼ Close' : '▲ Open'}
        </button>
      </div>

      <div style="padding: 20px;">
        [Quick summary]
      </div>
 
      <div style="flex: 1 1 0; min-height: 0; padding: 10px; display: flex; flex-direction: column;">
        <div class="tabs">
          <div onclick=${() => tabSelected('inventory')} class="tab ${tab == 'inventory' ? 'selected' : '' }">
            <div style="font-size: 12px;">${player.items.filter(x => x).length} / ${player.items.length}</div>
            Inventory 
          </div>
          <div onclick=${() => tabSelected('events')} class="tab ${tab == 'events' ? 'selected' : '' }">
            Events
          </div>
          <div onclick=${() => tabSelected('shop')} class="tab ${tab == 'shop' ? 'selected' : '' }">
            Shop
          </div>
        </div>
        <div style="flex: 1 1 0; overflow: auto;">
          ${tab == 'inventory' && html`
            <${Inventory}
              state=${state}
            />
          `}
          ${tab == 'events' && html`
            <${Events}
              state=${state}
            />
          `}
          ${tab == 'shop' && html`
            <${Shop}
              state=${state}
            />
          `}
        </div>
      </div>
    </div>

    <style>
      .bottomUI {
        position: fixed;
        z-index: 100;
        bottom: 0; 
        left: 0;
        width: 100%; 
        height: calc(100% - 80px); 
        background: rgba(0,0,0,0.5); 
        color: #fff;
        transition: 350ms;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
      }

      .bottomUI:not(.expanded) {
        transform: translateY(calc(100% - 24px));
      }

      .bottomUI .quickbar {
        display: flex; 
        padding: 4px; 
        height: 28px;
        box-sizing: border-box; 
        position: relative;
      }

      .bottomUI .quickbar button {
        all: revert;
        box-sizing: border-box;
        height: 32px; 
        margin: 0 10px;
        transform: translateY(-20px);
        border-radius: 9999px;
        border: 1px solid #fff;
        background: #000;
        color: #fff;
        font-size: 16px;
        line-height: 32px;
        padding: 0 15px;
        cursor: pointer;
      }

      .bottomUI .quickbar button.selected {
        background: #fff;
        color: #000;
      }

      .bottomUI .statBar {
        display: flex;
        box-sizing: border-box;
        height: 24px; 
        padding: 2px; 
        margin: 0 8px;
        transform: skew(-15deg) translateY(-16px);
        border-radius: 4px;
        border: 1px solid #fff;
        background: #000;
      }

      .bottomUI .statBarIcon {
        padding: 0 2px;
        line-height: 20px;
        font-weight: 900;
      }

      .bottomUI .statBarPoint {
        height: 100%; 
        margin: 0 2px; 
        width: 8px; 
        border-radius: 2px;
        background: currentColor; 
        box-shadow: rgba(0, 0, 0, 0.3) -1px -1px 2px 0px inset, #fff 1px 1px 2px 0px inset; 
      }

      .bottomUI .statBarPoint.empty {
        opacity: 0.35;
      }

      .bottomUI .tabs {
        display: flex; 
        border-bottom: 1px solid #fff;
        font-size: 20px;
        align-items: flex-end;
      }

      .bottomUI .tab {
        margin: 0 20px; 
        padding: 5px 0; 
        border-bottom: 3px solid transparent; 
        cursor: pointer; 
        font-weight: light;
        cursor: pointer;
        width: 150px;
        text-align: center;
      }

      .bottomUI .tab:hover {
        font-weight: bold;
      }

      .bottomUI .tab.selected {
        font-weight: bold;
        border-color: #fff;
      }
    </style>
  `
}