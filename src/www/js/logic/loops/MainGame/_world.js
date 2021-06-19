import { v3 } from '../../../common/math.js'
import { keyboard } from '../../../system/input.js'
import { LAND, LANDPOINT } from '../../entities.js'
import { loadData, loadLandIntoWorld } from '../../data.js'
import { createScene_World } from '../../../rendering/scenes/World.js'
import { 
  sound_recovery, 
  sound_notAvailable, 
  sound_shield, 
  sound_lava, 
  sound_setback,
} from '../../../audio/soundEffects.js'

export async function init_World({
  state,
  state: {
    world,
    player,
  }
}) {
  const scene_World = createScene_World(world.landSize)

  const loadedLands = await Promise.all([
    loadData('data/lands/miso_land_-1_0.json'),
    loadData('data/lands/miso_land_-1_-1.json'),
    loadData('data/lands/miso_land_0_-1.json'),
    loadData('data/lands/miso_land_-2_0.json'),
    loadData('data/lands/miso_land_-1_-2.json'),
    loadData('data/lands/miso_land_-1_-3.json'),
    loadData('data/lands/miso_land_-3_0.json'),
    loadData('data/lands/miso_land_-4_-1.json'),
    loadData('data/lands/miso_land_-5_1.json'),
    loadData('data/lands/miso_land_-5_-1.json'),
    loadData('data/lands/miso_land_-5_0.json'),
    loadData('data/lands/miso_land_-3_-1.json'),
    loadData('data/lands/miso_land_-3_1.json'),
    loadData('data/lands/miso_land_-4_0.json'),
    loadData('data/lands/miso_land_-4_1.json'),
    loadData('data/lands/miso_land_0_-2.json'),
    loadData('data/lands/miso_land_-1_1.json'),
    loadData('data/lands/miso_land_-2_-1.json'),
    loadData('data/lands/miso_land_-1_2.json'),
    loadData('data/lands/miso_land_-4_-2.json'),
    loadData('data/lands/miso_land_1_-2.json'),
    loadData('data/lands/miso_land_0_0.json'),
  ])
  loadedLands.forEach(x => loadLandIntoWorld(x, world))

  setInterval(() => {
    player.recovery.value = Math.min(player.recovery.value + 1, player.recovery.max)
  }, 5000)

  let shieldTimer
  const recoverPoint = (stat) => {
    if (stat.value < stat.max) {
      if (player.recovery.value > 0) {
        stat.value++
        player.recovery.value--
        sound_recovery()
      } else {
        sound_notAvailable()
      }
    }
  }

  return ({ time }) => {
    const sunSpeed = time / 5 + Math.PI
    const sunRay = [Math.sin(sunSpeed), -1, Math.cos(sunSpeed)]
    const lands = getLands(player, world, state)

    state.interactiveLandpoint = getInteractiveProp(player, world)

    if (keyboard.keyOnce('B')) {
      recoverPoint(player.ability)
    }
    if (keyboard.keyOnce('N')) {
      recoverPoint(player.stamina)
    }
    if (keyboard.keyOnce('M')) {
      recoverPoint(player.toughness)
    }

    if (keyboard.keyOnce('P')) {
      state.viewDistance++
    }
    if (keyboard.keyOnce('O')) {
      state.viewDistance = Math.max(state.viewDistance - 1, 1)
    }

    if (keyboard.keyOnce('-')) {
      if (player.ability.value > 0) {
        player.ability.value--
        player.shielded = true
        
        clearTimeout(shieldTimer)
        shieldTimer = setTimeout(() => {
          player.shielded = false
        }, 3000)
  
        sound_shield()
      } else {
        sound_notAvailable()
      }
    }

    if (
      LANDPOINT.at(player.position, world).type == 'lava' &&
      player.velocity[1] == 0 &&
      !player.shielded &&
      !player.takenDamage
    ) {
      player.toughness.value--
      player.takenDamage = true
      player.velocity = v3.add(v3.multiply(player.direction, -30), [0, 10, 0])
      setTimeout(() => {
        player.takenDamage = false
      }, 1000)

      sound_lava()
    }

    if (player.toughness.value <= 0) {
      player.position = [-5, 1, 2]
      player.velocity = [0, 0, 0]
      player.direction = [0, 0, 1]
      player.toughness.value = 1
      player.stamina.value = 0
      player.ability.value = 0
      player.recovery.value = 0
      player.takenDamage = false

      sound_setback()
    }

    if (state.ownedLandPointsWithinBrush) {
      state.ownedLandPointsWithinBrush.forEach(x => {
        x._withinBrush = true
      })
    }

    scene_World({ 
      time,
      lands,
      state,
      sunRay
    })

    if (state.ownedLandPointsWithinBrush) {
      state.ownedLandPointsWithinBrush.forEach(x => {
        delete x._withinBrush
      })
    }

    lands.forEach(land => {
      land.heightMapDirty = false
      land.colorMapDirty = false
      land.propListDirty = false
    })
  }
}

function getLands(player, world, state) {
  const getOrCreateLand = (iX, iY) => 
    LAND.at_index(iX, iY, world) ||
    LAND.add(LAND.identity(world.landSize), world, iX, iY)
 
  const activeLandIndexX = Math.floor(player.position[0] / world.landSize)
  const activeLandIndexY = Math.floor(player.position[2] / world.landSize)
  const activeLand = getOrCreateLand(activeLandIndexX, activeLandIndexY)
  
  const result = []
  const viewDistance = state.viewDistance

  for (let i = -viewDistance; i <= viewDistance ; ++i) {
    for (let j = -viewDistance; j <= viewDistance ; ++j) {
      result.push(getOrCreateLand(activeLand.x + i, activeLand.y + j))
    }
  }

  return result
}

function getInteractiveProp(player, world) {
  const step = 0.75
  const viewForward = v3.normalize(player.direction)
  const viewSideward = v3.normalize(v3.cross([0, 1, 0], player.direction))

  const forward_1  = v3.add(player.position, v3.multiply(viewForward, 1*step))
  const forward_2  = v3.add(player.position, v3.multiply(viewForward, 2*step))
  const forward_3  = v3.add(player.position, v3.multiply(viewForward, 3*step))
  const forward_4  = v3.add(player.position, v3.multiply(viewForward, 4*step))

  const left_1 = v3.multiply(viewSideward, -step)
  const left_2 = v3.multiply(viewSideward, -step*2)
  const left_3 = v3.multiply(viewSideward, -step*3)
  const left_4 = v3.multiply(viewSideward, -step*4)

  const right_1 = v3.multiply(viewSideward, step)
  const right_2 = v3.multiply(viewSideward, step*2)
  const right_3 = v3.multiply(viewSideward, step*3)
  const right_4 = v3.multiply(viewSideward, step*4)

  const viewPoints = [
    player.position,
    v3.add(player.position, left_1),
    v3.add(player.position, right_1),
    v3.add(player.position, left_2),
    v3.add(player.position, right_2),

    forward_1,
    v3.add(forward_1, left_1),
    v3.add(forward_1, right_1),
    v3.add(forward_1, left_2),
    v3.add(forward_1, right_2),

    forward_2,
    v3.add(forward_2, left_1),
    v3.add(forward_2, right_1),
    v3.add(forward_2, left_2),
    v3.add(forward_2, right_2),
    v3.add(forward_2, left_3),
    v3.add(forward_2, right_3),

    forward_3,
    v3.add(forward_3, left_1),
    v3.add(forward_3, right_1),
    v3.add(forward_3, left_2),
    v3.add(forward_3, right_2),
    v3.add(forward_3, left_3),
    v3.add(forward_3, right_3),
    v3.add(forward_3, left_4),
    v3.add(forward_3, right_4),

    forward_4,
    v3.add(forward_4, left_1),
    v3.add(forward_4, right_1),
    v3.add(forward_4, left_2),
    v3.add(forward_4, right_2),
    v3.add(forward_4, left_3),
    v3.add(forward_4, right_3),
    v3.add(forward_4, left_4),
    v3.add(forward_4, right_4),
  ]

  for (let i = 0; i < viewPoints.length; ++i) {
    const landPoint = LANDPOINT.at(viewPoints[i], world)
    if (      
      landPoint &&
      landPoint.prop &&
      (landPoint.prop.text || landPoint.prop.interactions.length)
    ) {
      return landPoint
    }
  }
  
  return null
}