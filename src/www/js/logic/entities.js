import { v3, m4, lerp } from '../common/math.js'
import { LAND_SIZE, MAX_PROP_COUNT } from './constants.js'

export const CAMERA = {
  identity() {
    const c = {
      position: [0, 0, 0],
      target: [0, 0, 1],
      up: [0, 1, 0],
      near: 1,
      far: 10000,
      aspect: 1,
      matrix: m4.identity(),
    }
    CAMERA.update(c)
    return c
  },

  orbit(c, pivot, dist, horiz, vert) {
    let offset = [
      dist * Math.sin(horiz) * Math.cos(vert), 
      dist * Math.sin(vert),
      -dist * Math.cos(horiz) * Math.cos(vert),
    ]
    c.position = v3.add(pivot, offset)
    CAMERA.update(c)
    return c
  },

  update(c) {
    const worldX = [1, 0, 0]
    const worldY = [0, 1, 0]
    const worldZ = [0, 0, 1]

    c.z = v3.normalize(v3.subtract(c.target, c.position))
    c.x = v3.normalize(v3.cross(c.up, c.z))
    c.y = v3.normalize(v3.cross(c.z, c.x))
 
    const translation = [
      1.0, 0, 0, -c.position[0],
      0, 1.0, 0, -c.position[1],
      0, 0, 1.0, -c.position[2],
      0, 0, 0, 1.0
    ]

    const rotation = [
      v3.dot(c.x, worldX), v3.dot(c.x, worldY), v3.dot(c.x, worldZ), 0,
      v3.dot(c.y, worldX), v3.dot(c.y, worldY), v3.dot(c.y, worldZ), 0,
      v3.dot(c.z, worldX), v3.dot(c.z, worldY), v3.dot(c.z, worldZ), 0,
      0, 0, 0, 1
    ]

    const projection = [
      1.0 / c.aspect, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, (c.far + c.near) / (c.far - c.near), -(2.0 * c.far * c.near) / (c.far - c.near),
      0, 0, 1, 0
    ]
    
    c.matrix = m4.multiply(projection, m4.multiply(rotation, translation))
    return c
  }
}

export const WORLD = {
  identity() {
    return {
      landSize: LAND_SIZE,
      maxPropCount: MAX_PROP_COUNT,
      lands: {},
    }
  },

  landIndexKey(iX, iY) {
    return iX + '_' + iY
  },

  heightAt(v, world) {
    const defaultHeight = { height: -10 }
    const x0y0 = (LANDPOINT.at(v3.add(v, [0, 0, 0]), world) || defaultHeight).height
    const x1y0 = (LANDPOINT.at(v3.add(v, [1, 0, 0]), world) || defaultHeight).height
    const x0y1 = (LANDPOINT.at(v3.add(v, [0, 0, 1]), world) || defaultHeight).height
    const x1y1 = (LANDPOINT.at(v3.add(v, [1, 0, 1]), world) || defaultHeight).height
    let fractX = v[0] % 1
    let fractY = v[2] % 1
    if (fractX < 0) {
      fractX = 1 + fractX
    }
    if (fractY < 0) {
      fractY = 1 + fractY
    }

    return lerp(
      lerp(x0y0, x1y0, fractX),
      lerp(x0y1, x1y1, fractX),
      fractY
    )
  },
}

export const LAND = {
  identity(size) {
    const mapSize = size*size
    const l = {
      name: null,
      owner: null,
      authors: [],
      x: null,
      y: null,
      points: new Array(mapSize),
      propMap: new Array(mapSize),
      propCount: 0,

      heightMapDirty: true,
      colorMapDirty: true,
      propListDirty: true,
    }
  
    for (let i = 0; i < mapSize; ++i) {
      l.points[i] = LANDPOINT.land(LANDPOINT.identity(), l)
    }
  
    return l
  },

  index(l, iX, iY) {
    l.x = iX
    l.y = iY
    return l
  },

  add(l, w, iX, iY) {
    w.lands[WORLD.landIndexKey(iX, iY)] = l
    l.x = iX
    l.y = iY
    return l
  },

  at(v, world) {
    const iX = Math.floor(v[0] / world.landSize)
    const iY = Math.floor(v[2] / world.landSize)
    return LAND.at_index(iX, iY, world)
  },

  at_index(iX, iY, world) {
    return world.lands[WORLD.landIndexKey(iX, iY)]
  },
}

export const LANDPOINT = {
  identity() {
    return {
      land: null,
      height: -10,
      type: 'grass',
      prop: null
    }
  },

  land(lp, land) {
    lp.land = land
    return lp
  },

  at(v, world) {
    const land = LAND.at(v, world)
    return land
      ? land.points[
          Math.floor(v[0]) - land.x * world.landSize + 
          (Math.floor(v[2]) - land.y * world.landSize) * world.landSize
        ]
      : null
  },

  position(lp) {
    if (!lp._position) {
      const index = lp.land.points.indexOf(lp)
      const mapSize = Math.sqrt(lp.land.points.length)
      const localX = index % mapSize
      const localY = (index - localX) / mapSize

      lp._position = [
        localX + lp.land.x * mapSize,
        0,
        localY + lp.land.y * mapSize
      ]
    }
    return lp._position
  }
}

export const PROP = {
  identity() {
    return {
      type: null,
      text: null,
      activeText: null,
      rotation: 0,
      scale: 1,
      interactions: [],
      // interactions: [
      //   {
      //     action: 'Could you tell me more?',
      //     conditions: {
      //       greeter1: false
      //     },
      //     effects: {
      //       text: 'It is just like, reeeeaaaaally big maaaan',
      //       events: {
      //         greeter1: true
      //       } 
      //     }
      //   },
      //   {
      //     action: 'Nice shirt!',
      //     conditions: {
      //       greeter1: true,
      //       greeter2: false
      //     },
      //     effects: {
      //       text: 'Thanks!',
      //       events: {
      //         greeter2: true
      //       } 
      //     }
      //   },
      //   {
      //     action: 'See you around!',
      //     conditions: {
      //       greeter1: true
      //     },
      //     effects: {
      //       text: null,
      //       events: {
      //         greeter1: false,
      //         greeter2: false
      //       } 
      //     }
      //   },
      // ]
    }
  }
}

export const BRUSH = {
  identity() {
    return {
      position: [0, 0, 0],
      size: 1,
      soft: true
    }  
  },

  landPoints(b, world, user) {
    const landPoints = new Set()
    for (let i = 0 ; i < 2 * (b.size - 1) + 1; ++i) {
      for (let j = 0 ; j < 2 * (b.size - 1) + 1; ++j) {
        const offset = [i-b.size + 1, 0, j-b.size + 1]
        const landPoint = LANDPOINT.at(v3.add(b.position, offset), world)
        
        if (landPoint) {
          landPoints.add(landPoint)
        }
      }
    }
    return Array.from(landPoints)
  }
}
