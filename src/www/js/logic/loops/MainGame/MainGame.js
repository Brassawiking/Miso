import { CAMERA, BRUSH, WORLD } from '../../entities.js'

import { init_Camera } from './_camera.js'
import { init_UI } from './_ui.js'
import { init_Movement } from './_movement.js'
import { init_Editing } from './_editing.js'
import { init_World } from './_world.js'

export async function createLoop_MainGame ({ 
  gl,
  ui,  
  keyboard,
  prevKeyboard,
  mouse,
  prevMouse,
  data 
}) {
  const actionTypes = [
    'raise',
    'lower',
    'paint',
    'prop_add',
    'prop_remove',
    'reset'
  ]
  
  const landTypes = [
    'sand',
    'dirt',
    'rock',
    'grass'
  ]

  const propTypes = [
    'tree',
    'bush',
    'stone_tablet',
    'person',
    'pole_vertical',
    'pole_horizontal',
  ]
  
  const state = {
    world: WORLD.identity(),
    brush: BRUSH.identity(),
    camera: CAMERA.identity(),

    player: {
      position: [-5, 1, 2],
      velocity: [0, 0, 0],
      direction: [0, 0, 1],
    },

    currentActionType: actionTypes[0],
    currentLandType: landTypes[0],
    currentPropType: propTypes[0],
    
    gravity: true,
    debug: false,
  }
 
  const update_Camera = init_Camera({ gl, state, mouse, prevMouse })
  const update_Movement = init_Movement({ state, keyboard, prevKeyboard })
  const update_Editing =  init_Editing({ state, keyboard, prevKeyboard, mouse, actionTypes, data })
  const update_UI = init_UI({ state, ui, actionTypes, landTypes, propTypes, data })
  const update_World = await init_World({ gl, state })
  
  return ({time, deltaTime}) => {
    update_Movement({ deltaTime })
    update_Camera()
    update_Editing()
    update_World({ time })
    update_UI()
  }
}

