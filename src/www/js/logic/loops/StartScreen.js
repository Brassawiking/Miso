import { createLoop_MainGame } from './MainGame.js'

export function createLoop_StartScreen ({ 
  ui,
  data,
}) {
  ui.innerHTML = `
    <style>
      .login {
        display: flex;
        flex-direction: column;
        padding: 20px;
        border-radius: 5px;
        background: rgba(0, 0, 0, 0.3);
        color: #fff;
        font-family: "Gothic A1", sans-serif;
      }

      .login input[type="text"] {
        border-radius: 5px;
        border: none;
        padding: 5px;
        background: rgba(0, 0, 0, 0.3);
        color: #fff;
        outline: none;
      }

      .login fieldset {
        margin: 10px 0; 
        padding: 0; 
        border: none; 
        text-align: center;
      }

      .login button {
        cursor: pointer;
        border-radius: 9999px;
        border: none;

        align-self: center;
        padding: 5px 20px;
        font-family: "Gothic A1", sans-serif;
        font-weight: bold;

        background: #fff;
        color: #343a4a;
      }
    </style>

    <div style="
      background-image: url(svg/logo.svg), linear-gradient(0deg, #baf1fa 0%, #79e4f5 100%);
      background-position: center;
      background-repeat: no-repeat;
      background-size: contain; 
      height: 100%;
      display: flex;
      align-items: flex-end;
      justify-content: flex-end;
      padding: 10px;
      box-sizing: border-box;
    ">
      <form class="login">
        <label>
          Player name <br/>
          <input type="text" required name="username" autofocus />
        </label>
        <fieldset>
          <label>
            <input name="mode" type="radio" value="online" disabled />
            Online
          </label>
          <label>
            <input name="mode" type="radio" value="offline" checked />
            Offline
          </label>
        </fieldset>
        <button>Start</button>
      </form>
    </div>
  `

  const ui_form = ui.querySelector('form')
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