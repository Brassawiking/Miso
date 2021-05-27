import { LAND } from '../../entities.js'
import { loadData, loadLandIntoWorld } from '../../data.js'
import { createScene_World } from '../../../rendering/scenes/World.js'

export async function init_World({
  gl,
  state,
  state: {
    world,
    player,
  }
}) {
  const scene_World = createScene_World(gl, world.landSize)

  const loadedLands = await Promise.all([
    loadData('data/miso_land_-1_0.json'),
    loadData('data/miso_land_-1_-1.json'),
    loadData('data/miso_land_0_-1.json'),
    loadData('data/miso_land_-2_0.json'),
    loadData('data/miso_land_-1_-2.json'),
    loadData('data/miso_land_-1_-3.json'),
  ])
  loadedLands.forEach(x => loadLandIntoWorld(x, world))

  return ({ time }) => {
    const sunSpeed = time / 5 + Math.PI
    const sunRay = [Math.sin(sunSpeed), -1, Math.cos(sunSpeed)]
    const lands = getLands(player, world)

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