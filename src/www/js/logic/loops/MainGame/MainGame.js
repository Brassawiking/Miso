import { gl } from '../../../rendering/gl.js'
import { CAMERA, BRUSH, WORLD } from '../../entities.js'
import { init_Camera } from './_camera.js'
import { init_UI } from './_ui.js'
import { init_Movement } from './_movement.js'
import { init_Editing } from './_editing.js'
import { init_World } from './_world.js'
import { actionTypes, landTypes, propTypes} from './_enums.js'

const forestAmbience = new Audio('https://opengameart.org/sites/default/files/Forest_Ambience.mp3')

export async function createLoop_MainGame ({ 
  data 
}) {
  setTimeout(() => {
    forestAmbience.loop = true
    forestAmbience.play()
  }, 1000)

  const state = {
    world: WORLD.identity(),
    brush: BRUSH.identity(),
    camera: CAMERA.identity(),

    player: {
      position: [-5, 1, 2],
      velocity: [0, 0, 0],
      direction: [0, 0, 1],
      swinging: false,

      base: {
        speed: 2,
        jump: 12
      },

      events: {},
      items: new Array(200).fill(null),

      toughness: {
        value: 5,
        max: 5,
      },
      stamina: {
        value: 10,
        max: 10,
      },
      ability: {
        value: 3,
        max: 3,
      },
      recovery: {
        value: 0,
        max: 10,
      },

      takenDamage: false,
      shielded: false,
    },

    currentActionType: actionTypes[0],
    currentLandType: landTypes[0],
    currentPropType: propTypes[0],
    
    gravity: true,
    debug: false,
    help: localStorage.getItem('miso_help') !== 'false',
    fixedLandHeight: 5,

    viewDistance: 1,

    spawnMonsters: true,
    monsters: [],
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
    update_World({ time, deltaTime })
    update_UI()
  }
}

