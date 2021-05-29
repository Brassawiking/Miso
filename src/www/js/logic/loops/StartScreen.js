import { ui, markup } from '../../rendering/ui.js'
import { changeLog } from '../../changeLog.js'
import { createLoop_MainGame } from './MainGame/MainGame.js'

export function createLoop_StartScreen ({ 
  data,
}) {
  const [root, { 
    ui_form, 
    ui_changeLog 
  }] =  markup(`
    <miso-start-screen>
      <div ref="changeLog"class="ui-box ui-bottom ui-left" style="font-size: 13px; white-space: pre-line; height: 300px; width: 300px; overflow: auto;"></div>

      <form class="ui-box ui-bottom ui-right ui-rows" ref="form">
        <label>
          Player name <br/>
          <input type="text" required name="username" spellcheck="false" />
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

  ui_changeLog.textContent = changeLog

  ui_form.elements.username.value = localStorage.getItem('user-name')
  ui_form.addEventListener('submit', e => {
    e.preventDefault()
    data.user = { name: e.target.elements.username.value }
    data.gameMode = e.target.elements.mode.value
    localStorage.setItem('user-name', data.user.name)

    document.body.focus()
    root.classList.add('ui-fade-out')

    setTimeout(() => {
      root.remove()
    }, 1000)
  })

  ui_form.elements.username.focus()

  return () => {
    if (data.gameMode) {
      return createLoop_MainGame
    }
  }
}