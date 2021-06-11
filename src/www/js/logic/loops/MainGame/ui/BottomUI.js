import { preact } from '../../../../rendering/ui.js'
const  { html, useState } = preact
import { Inventory } from './Inventory.js'
import { Events } from './Events.js'

const menuSound = new Audio('https://opengameart.org/sites/default/files/audio_preview/mouseclick.wav.mp3')
const tabSound = new Audio('https://opengameart.org/sites/default/files/Menu%20Selection%20Click%20%28preview%29.mp3')

export function BottomUI({ state }) {
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
        <div style="flex: 1 1 0;">
          <button onclick=${toggle}>
            ${expanded ? '▼ Close' : '▲ Open'}
          </button>
          <button 
            onclick=${e => {
              e.target.blur()
              state.help = !state.help
            }}
            class="${state.help ? 'selected' : ''}"
          >
            Help
          </button>
        </div>
        <div title="Stat: X / Y" class="statBar" style="width: 300px; color: lime; --value: 50%;" />
        <div title="Stat: X / Y" class="statBar" style="width: 30px; color: cyan; --value: 60%;" />
        <div title="Stat: X / Y" class="statBar" style="width: 150px; color: gold; --value: 75%;" />
        <div title="Stat: X / Y" class="statBar" style="width: 200px; color: red; --value: 70%;" />
      </div>

      <div style="padding: 20px;">
        [Quick summary]
      </div>
 
      <div style="flex: 1 1 0; min-height: 0; padding: 10px; display: flex; flex-direction: column;">
        <div class="tabs">
          <div onclick=${() => tabSelected('inventory')} class="tab ${tab == 'inventory' ? 'selected' : '' }">
            Inventory
          </div>
          <div onclick=${() => tabSelected('events')} class="tab ${tab == 'events' ? 'selected' : '' }">
            Events
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
        box-sizing: content-box; /* Map stat to pixels? */
        height: 22px; 
        background: currentColor;
        margin: 0 10px;
        transform: skew(-15deg) translateY(-16px);
        border-radius: 4px;
        border: 1px solid #fff;
        box-shadow: #000 -1px -2px 5px 0px inset, #fff 1px 2px 5px 0px inset;
        position: relative;
        overflow: hidden;
      }

      .bottomUI .statBar:before {
        content: '';
        display: block;
        position: absolute;
        top: 0;
        bottom: 0;
        right: 0;
        width: calc(100% - var(--value));
        background: #000;
      }

      .bottomUI .tabs {
        display: flex; 
        border-bottom: 1px solid #fff;
        font-size: 20px;
      }

      .bottomUI .tab {
        margin: 0 20px; 
        padding: 5px 0; 
        border-bottom: 3px solid transparent; 
        cursor pointer; 
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