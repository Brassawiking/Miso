import { createLoop_MainGame } from './MainGame.js'
import { markup } from '../../rendering/ui.js'

export function createLoop_StartScreen ({ 
  ui,
  data,
}) {
  const [root, { ui_form }] =  markup(`
    <miso-start-screen>
      <form class="ui-box ui-bottom ui-right ui-rows" ref="form">
        <label>
          Player name <br/>
          <input type="text" required name="username" autofocus spellcheck="false" />
        </label>
        
        <fieldset>
          <label>
            <input name="mode" type="radio" value="online" disabled />
            <s>Online</s>
          </label>
          <label>
            <input name="mode" type="radio" value="offline" checked />
            Offline
          </label>
        </fieldset>

        <button>Step into Miso!</button>
      </form>
    </miso-start-screen>
  `) 
  ui.innerHTML = ''
  ui.appendChild(root)

  ui_form.elements.username.value = localStorage.getItem('user-name')
  ui_form.addEventListener('submit', e => {
    e.preventDefault()
    data.user = { name: e.target.elements.username.value }
    data.gameMode = e.target.elements.mode.value
    localStorage.setItem('user-name', data.user.name)
  })

  return () => {
    if (data.gameMode) {
      return createLoop_MainGame
    }
  }
}