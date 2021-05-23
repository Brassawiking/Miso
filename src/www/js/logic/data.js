import { LAND, PROP, } from './entities.js'

export async function loadData(url) {
  return (await fetch(url)).json()
}

export function loadLandIntoWorld(data, world) {
  const land = LAND.identity(world.landSize)
  land.name = data.name
  land.owner = data.owner
  land.authors = data.authors
  land.x = data.x
  land.y = data.y
  land.points.forEach((point, i) => {
    Object.assign(point, data.points[i])
    const prop = data.points[i].prop
    if (prop) {
      point.prop = Object.assign(PROP.identity(), prop)
      land.propCount++
    }
  })

  LAND.add(land, world, land.x, land.y)
}

