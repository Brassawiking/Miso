import { v3, linePlaneIntersectionPoint } from '../../../common/math.js'
import { keyboard, mouse } from '../../../system/input.js'
import { BRUSH, LAND, LANDPOINT, PROP, } from '../../entities.js'
import { actionTypes, landTypes, propTypes} from './_enums.js'

export function init_Editing({
  state,
  state: {
    camera,
    brush,
    world,
  },
  data: {
    user
  },
}) {
  return () => {
    const planeIntersection = linePlaneIntersectionPoint(
      v3.add(camera.z, v3.add(v3.multiply(camera.x, mouse.x * camera.aspect), v3.multiply(camera.y, mouse.y))),
      camera.position,
      [0, 1, 0],
      [0, 0, 0]
    )
  
    if (planeIntersection) {
      brush.position = [
        Math.round(planeIntersection[0]),
        0, 
        Math.round(planeIntersection[2]),
      ]
    }
  
    actionTypes.forEach((mouseAction, index) => {
      if (keyboard.keyOnce(index+1)) {
        state.currentActionType = mouseAction
      }
    })

    if (keyboard.keyOnce('ARROWLEFT')) {
      brush.size = Math.max(brush.size - 1, 1)
    }
    if (keyboard.keyOnce('ARROWRIGHT')) {
      brush.size++
    }
    if (keyboard.keyOnce('T')) {
      brush.soft = !brush.soft
    }
  
    const landPoints = BRUSH.ownedLandPoints(brush, world, user)
    state.ownedLandPointsWithinBrush = landPoints
    
    const heightDelta = 0.1
    if (keyboard.key('ARROWUP') || (mouse.left && state.currentActionType === 'land_raise')) {
      landPoints.forEach(landPoint => {
        let factor = 1
        if (brush.soft) {
          const distance = Math.abs(v3.length(v3.subtract(LANDPOINT.position(landPoint), brush.position)))
          factor = Math.max(brush.size - distance, 0) / brush.size
        }
        landPoint.height += heightDelta * factor
        landPoint.land.heightMapDirty = true
      })
    }

    if (keyboard.key('ARROWDOWN') || (mouse.left && state.currentActionType === 'land_lower')) {
      landPoints.forEach(landPoint => {
        let factor = 1
        if (brush.soft) {
          const distance = Math.abs(v3.length(v3.subtract(LANDPOINT.position(landPoint), brush.position)))
          factor = Math.max(brush.size - distance, 0) / brush.size
        }
        landPoint.height -= heightDelta * factor
        landPoint.land.heightMapDirty = true
      })
    }

    if (mouse.left && state.currentActionType === 'land_even') {
      let averageHeight = landPoints.reduce((sumHeight, land) => sumHeight + land.height, 0) / landPoints.length
      landPoints.forEach(landPoint => {
        let factor = 1
        if (brush.soft) {
          const distance = Math.abs(v3.length(v3.subtract(LANDPOINT.position(landPoint), brush.position)))
          factor = Math.max(brush.size - distance, 0) / brush.size
        }
        landPoint.height += ((averageHeight - landPoint.height) / 10) * factor
        landPoint.land.heightMapDirty = true
      })
    }

    if (mouse.left && state.currentActionType === 'land_fixed') {
      landPoints.forEach(landPoint => {
        let setHeight = true
        if (brush.soft) {
          const distance = Math.abs(v3.length(v3.subtract(LANDPOINT.position(landPoint), brush.position)))
          setHeight = brush.size - distance > 0
        }

        if (setHeight) {
          landPoint.height = state.fixedLandHeight
          landPoint.land.heightMapDirty = true
        }
      })
    }

    if (keyboard.keyOnce('Y')) {
      const landPoint = LANDPOINT.at(brush.position, world)
      if (landPoint) {
        state.fixedLandHeight = landPoint.height
      }
    }

    if (keyboard.key('DELETE') || (mouse.left && state.currentActionType === 'reset')) {
      landPoints.forEach(landPoint => {
        landPoint.height = 1
        landPoint.type = 'grass'
        if (landPoint.prop) {
          landPoint.prop = null
          landPoint.land.propCount--
        }
        landPoint.land.heightMapDirty = true
        landPoint.land.colorMapDirty = true
        landPoint.land.propListDirty = true
      })
    }

    if (keyboard.keyOnce('C')) {
      state.currentPropType = propTypes[Math.max(propTypes.indexOf(state.currentPropType) - 1, 0)]
    }
    if (keyboard.keyOnce('V')) {
      state.currentPropType = propTypes[Math.min(propTypes.indexOf(state.currentPropType) + 1, propTypes.length - 1)]
    }
    if (keyboard.key('E') || (mouse.left && state.currentActionType === 'prop_add')) {
      landPoints.forEach(landPoint => {
        if (!landPoint.prop) {
          if (landPoint.land.propCount >= world.maxPropCount) {
            return
          }
          landPoint.land.propCount++
          landPoint.prop = PROP.identity()
        } 
        landPoint.prop.type = state.currentPropType
        landPoint.land.propListDirty = true
      })
    }
    if (keyboard.key('R') || (mouse.left && state.currentActionType === 'prop_remove')) {
      landPoints.forEach(landPoint => {
        if (landPoint.prop) {
          landPoint.prop = null
          landPoint.land.propCount--
          landPoint.land.propListDirty = true
        }
      })
    }
    const propRotationSpeed = Math.PI / 90
    const propRotationFixedStep = Math.PI / 4
    if ((keyboard.key('K') && !keyboard.key('SHIFT')) || (keyboard.keyOnce('K') && keyboard.key('SHIFT'))) {
      landPoints.forEach(landPoint => {
        if (landPoint.prop) {
          landPoint.prop.rotation += keyboard.key('SHIFT') ? propRotationFixedStep : propRotationSpeed
          landPoint.land.propListDirty = true
        }
      })
    }
    if ((keyboard.key('L') && !keyboard.key('SHIFT')) || (keyboard.keyOnce('L') && keyboard.key('SHIFT'))) {
      landPoints.forEach(landPoint => {
        if (landPoint.prop) {
          landPoint.prop.rotation -= keyboard.key('SHIFT') ? propRotationFixedStep : propRotationSpeed
          landPoint.land.propListDirty = true
        }
      })
    }

    if (keyboard.keyOnce('Z')) {
      state.currentLandType = landTypes[Math.max(landTypes.indexOf(state.currentLandType) - 1, 0)]
    }
    if (keyboard.keyOnce('X')) {
      state.currentLandType = landTypes[Math.min(landTypes.indexOf(state.currentLandType) + 1, landTypes.length - 1)]
    }
    if (keyboard.key('Q') || (mouse.left && state.currentActionType === 'paint')) {
      landPoints.forEach(landPoint => {
        landPoint.type = state.currentLandType
        landPoint.land.colorMapDirty = true
      })
    }

    if (keyboard.keyOnce('ENTER')) {
      const land = LAND.at(brush.position, world)
      if (!land) {
        return
      }

      if (land.owner == null) {
        const landName = prompt('Claim and name this land')
        if (landName != null) {
          land.owner = user.name
          land.name = landName

          const mapSize = world.landSize * world.landSize
          for (let i = 0; i < mapSize; ++i) {
            land.points[i].height = 1
          }
          land.heightMapDirty = true
        }
      } else if (land.owner == user.name) {
        const landName = prompt('Rename this land', land.name || '')
        if (landName != null) {
          land.name = landName
        }
      } else {
        alert(`This land is already claimed by "${land.owner}", try another claiming another land!` )
      }
    }

    if (keyboard.keyOnce(' ')) {
      const props = landPoints.filter(x => x.prop).map(x => x.prop)
      if (props.length) {
        state.editingProps = props
        // const text = prompt(`Edit text for ${props.length} prop(s)`, props[0].text || '')
        // if (text != null) {
        //   props.forEach(prop => { prop.text = text })
        // }
      }
    }
  }
}