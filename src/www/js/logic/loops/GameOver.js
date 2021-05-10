import { createLoop_EditingLand } from './EditingLand.js'

export function createLoop_GameOver ({ 
  gl, 
  ui,
  output,
  keyboard,
  prevKeyboard
}) {
  gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
  ui.innerHTML = ''
  output.innerHTML = `
    GAME OVER!<br/>
    ----------<br/>
    Press Enter to restart
  `.trim()

  return () => {   
    if (keyboard.ENTER && !prevKeyboard.ENTER) {
      return createLoop_EditingLand
    }
  }
}
