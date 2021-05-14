import { createLoop_MainGame } from './MainGame.js'

export function createLoop_StartScreen ({ 
  ui,
  output,
  keyboard,
  prevKeyboard
}) {
  ui.innerHTML = `
    <div style="
      background-image: url(svg/logo.svg), linear-gradient(0deg, #baf1fa 0%, #79e4f5 100%);
      background-position: center;
      background-repeat: no-repeat;
      background-size: contain; 
      height: 100%;
    ">
    </div>
  `

  output.innerHTML = `
    Welcome!<br/>
    ----------------<br/>
    Press Enter to start
  `.trim()

  let touchStart = false
  ui.firstElementChild.addEventListener('touchstart', e => { touchStart = true})

  return () => {
    if (touchStart) {
      return createLoop_MainGame
    } 
    if (keyboard.ENTER && !prevKeyboard.ENTER) {
      return createLoop_MainGame
    }
  }
}