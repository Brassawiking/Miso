import { v3, m4 } from '../common/math.js'

export const CAMERA = {
  identity() {
    const c = {
      position: [0, 0, 0],
      target: [0, 0, 1],
      up: [0, 1, 0],
      near: 1,
      far: 1000,
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
      landSize: 1,
      lands: {},
    }
  },

  landSize(w, s) {  
    w.landSize = s
    return w
  },

  landIndexKey(iX, iY) {
    return iX + '_' + iY
  }
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
      heightMap: new Float32Array(new Array(mapSize)),
      colorMap: new Uint8Array(new Array(mapSize * 3)),
      propMap: new Array(mapSize),
      heightMapDirty: false,
      colorMapDirty: false,
      propCount: 0,
    }
  
    for (let i = 0; i < mapSize; ++i) {
      l.points[i] = LANDPOINT.land(LANDPOINT.identity(), l)
    }
  
    LAND.updateHeightMap(l)
    LAND.updateColorMap(l)
    LAND.updatePropMap(l)

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

  updateHeightMap(land) {
    for (let i = 0; i < land.points.length; ++i) {
      land.heightMap[i] = land.points[i].height
    }
    land.heightMapDirty = true
    return land
  },
  
  updateColorMap(land) {
    const colorMap = land.colorMap
    for (let i = 0; i < land.points.length; ++i) {
      switch(land.points[i].type) {
        case 'grass':
          colorMap[3*i + 0] = 71 
          colorMap[3*i + 1] = 176 
          colorMap[3*i + 2] = 20
          break
        case 'dirt':
          colorMap[3*i + 0] = 118 
          colorMap[3*i + 1] = 85 
          colorMap[3*i + 2] = 10
          break
        case 'rock':
          colorMap[3*i + 0] = 61 
          colorMap[3*i + 1] = 53 
          colorMap[3*i + 2] = 75
          break
        case 'sand':
          colorMap[3*i + 0] = 246 
          colorMap[3*i + 1] = 228 
          colorMap[3*i + 2] = 173
          break
        default:
          colorMap[3*i + 0] = 255 
          colorMap[3*i + 1] = 255 
          colorMap[3*i + 2] = 255
      }
    }
    land.colorMapDirty = true
    return land
  },
  
  updatePropMap(land) {
    for (let i = 0; i < land.points.length; ++i) {
      land.propMap[i] = land.points[i].prop
    }
    return land
  }
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
  }
}

export const PROP = {
  identity() {
    return {
      type: null,
      text: null,
      rotation: 0
    }
  }
}

export const BRUSH = {
  identity() {
    return {
      position: [0, 0, 0],
      size: 1,
    }  
  },

  ownedLandPoints(b, world, user) {
    const landPoints = []
    for (let i = 0 ; i < 2 * (b.size - 1) + 1; ++i) {
      for (let j = 0 ; j < 2 * (b.size - 1) + 1; ++j) {
        const offset = [i-b.size + 1, 0, j-b.size + 1]
        const landPoint = LANDPOINT.at(v3.add(b.position, offset), world)
        
        if (
          landPoint && 
          landPoint.land.owner === user.name && 
          !landPoints.includes(landPoint)
        ) {
            landPoints.push(landPoint)
        }
      }
    }
    return landPoints
  }
}
