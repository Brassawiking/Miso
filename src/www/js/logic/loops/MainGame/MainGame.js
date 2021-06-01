import { gl } from '../../../rendering/gl.js'
import { CAMERA, BRUSH, WORLD } from '../../entities.js'
import { init_Camera } from './_camera.js'
import { init_UI } from './_ui.js'
import { init_Movement } from './_movement.js'
import { init_Editing } from './_editing.js'
import { init_World } from './_world.js'
import { actionTypes, landTypes, propTypes} from './_enums.js'

export async function createLoop_MainGame ({ 
  data 
}) {  
  const state = {
    world: WORLD.identity(),
    brush: BRUSH.identity(),
    camera: CAMERA.identity(),

    player: {
      position: [-5, 1, 2],
      velocity: [0, 0, 0],
      direction: [0, 0, 1],

      base: {
        speed: 2,
        jump: 12
      },

      events: {},
      items: new Array(24*12).fill(null)
    },

    currentActionType: actionTypes[0],
    currentLandType: landTypes[0],
    currentPropType: propTypes[0],
    
    gravity: true,
    debug: false,
  }
  
  gl.clearColor(121 / 255, 228 / 255, 245 / 255, 1)
  gl.clear(gl.COLOR_BUFFER_BIT)
 
  const update_Camera = init_Camera({ state })
  const update_Movement = init_Movement({ state })
  const update_Editing = init_Editing({ state, data })
  const update_UI = init_UI({ state, data })
  const update_World = await init_World({ state })
  
  return ({time, deltaTime}) => {
    update_Movement({ deltaTime })
    update_Camera()
    update_Editing()
    update_World({ time })
    update_UI()
  }
}

