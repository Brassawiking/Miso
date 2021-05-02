import { createLoop_EditingLand } from './EditingLand.js'

export function createLoop_GameOver ({ 
  gl, 
  output,
  keyboard,
  prevKeyboard
}) {

  return () => {   
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

    output.innerHTML = `
      GAME OVER!<br/>
      ----------<br/>
      Press Enter to restart
    `.trim()

    if (keyboard.ENTER && !prevKeyboard.ENTER) {
      return createLoop_EditingLand
    }
  }
}