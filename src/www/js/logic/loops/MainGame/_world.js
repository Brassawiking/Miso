import { v3 } from '../../../common/math.js'
import { keyboard } from '../../../system/input.js'
import { LAND, LANDPOINT } from '../../entities.js'
import { loadData, loadLandIntoWorld } from '../../data.js'
import { createScene_World } from '../../../rendering/scenes/World.js'

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
  ])
  loadedLands.forEach(x => loadLandIntoWorld(x, world))

  setInterval(() => {
    player.recovery.value = Math.min(player.recovery.value + 1, player.recovery.max)
  }, 3000)

  return ({ time }) => {
    const sunSpeed = time / 5 + Math.PI
    const sunRay = [Math.sin(sunSpeed), -1, Math.cos(sunSpeed)]
    const lands = getLands(player, world)

    state.interactiveLandpoint = getInteractiveProp(player, world)

    if (
      keyboard.keyOnce('B') && 
      player.toughness.value < player.toughness.max &&
      player.recovery.value > 0
    ) {
      player.toughness.value++
      player.recovery.value--
    }
    
    if (
      keyboard.keyOnce('N') && 
      player.stamina.value < player.stamina.max && 
      player.recovery.value > 0
    ) {
      player.stamina.value++
      player.recovery.value--
    }
    
    if (
      keyboard.keyOnce('M') && 
      player.ability.value < player.ability.max && 
      player.recovery.value > 0
    ) {
      player.ability.value++
      player.recovery.value--
    }

    scene_World({ 
      time,
      lands,
      state,
      sunRay
    })

    lands.forEach(land => {
      land.heightMapDirty = false
      land.colorMapDirty = false
      land.propListDirty = false
    })
  }
}

function getLands(player, world) {
  const getOrCreateLand = (iX, iY) => 
    LAND.at_index(iX, iY, world) ||
    LAND.add(LAND.identity(world.landSize), world, iX, iY)
 
  const activeLandIndexX = Math.floor(player.position[0] / world.landSize)
  const activeLandIndexY = Math.floor(player.position[2] / world.landSize)
  const activeLand = getOrCreateLand(activeLandIndexX, activeLandIndexY)
  
  return [
    getOrCreateLand(activeLand.x-1, activeLand.y+1),
    getOrCreateLand(activeLand.x-1, activeLand.y),
    getOrCreateLand(activeLand.x-1, activeLand.y-1),

    getOrCreateLand(activeLand.x, activeLand.y+1),
    activeLand,
    getOrCreateLand(activeLand.x, activeLand.y-1),

    getOrCreateLand(activeLand.x+1, activeLand.y+1),
    getOrCreateLand(activeLand.x+1, activeLand.y),
    getOrCreateLand(activeLand.x+1, activeLand.y-1),
  ]
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