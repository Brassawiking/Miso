import { ui } from '../../rendering/ui.js'
import { changeLog } from '../../changeLog.js'
import { createLoop_MainGame } from './MainGame/MainGame.js'

import { h, render } from '../../external/preact.module.js'
import { useState, useEffect } from '../../external/preact.hooks.module.js'
import htm from '../../external/htm.module.js'
const html = htm.bind(h)  

export function createLoop_StartScreen ({ data }) {  
  render(html`<${App} data=${data}/>`, ui)

  return () => {
    if (data.gameMode) {
      return createLoop_MainGame
    }
  }
}

function App ({ data }) {
  const [playerName, setPlayerName] = useState(localStorage.getItem('user-name'))
  const [gameMode, setGameMode] = useState('offline')

  const handleSubmit = e => {
    e.preventDefault()
    data.user = { name: playerName }
    data.gameMode = gameMode
    localStorage.setItem('user-name', data.user.name)

    // Temp fix
    const root = document.querySelector('miso-start-screen')
    document.body.focus()
    root.classList.add('ui-fade-out')

    setTimeout(() => {
      root.remove()
    }, 1000)
  }

  useEffect(() => {
    // Temp fix
    document.querySelector('.js-player-name').focus()
  })
  
  return html`
    <miso-start-screen>
      <div
        class="ui-box ui-bottom ui-left" 
        style="font-size: 13px; white-space: pre-line; height: 300px; width: 300px; overflow: auto;"
      >
        ${changeLog}
      </div>
      <form
        onsubmit=${handleSubmit} 
        class="ui-box ui-bottom ui-right ui-rows"
      >
        <label>
          Player name <br/>
          <input
            value=${playerName}
            oninput=${e => { setPlayerName(e.target.value) }}
            type="text" 
            required 
            spellcheck=${false} 
            class="js-player-name"
          />
        </label>
        
        <fieldset>
          <label>
            <input 
              type="radio" 
              value="online"
              disabled
              checked=${gameMode == 'online'}
              onchange=${e => { setGameMode(e.target.value) }}
            />
            <s>Online</s>
          </label>
          <label>
            <input 
              type="radio" 
              value="offline" 
              checked=${gameMode == 'offline'}
              onchange=${e => { setGameMode(e.target.value) }}
            />
            Offline
          </label>
        </fieldset>

        <button>Step into Miso!</button>
      </form>
    </miso-start-screen>
  `
}