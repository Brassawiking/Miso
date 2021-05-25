import { v3, linePlaneIntersectionPoint } from '../../../common/math.js'
import { BRUSH, LAND, LANDPOINT, PROP, } from '../../entities.js'

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
  keyboard,
  prevKeyboard,
  mouse,
  actionTypes,
  landTypes, 
  propTypes,
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
      if (keyboard[index+1]) {
        state.currentActionType = mouseAction
      }
    })

    if (keyboard.ARROWLEFT && !prevKeyboard.ARROWLEFT) {
      brush.size = Math.max(brush.size - 1, 1)
    }
    if (keyboard.ARROWRIGHT && !prevKeyboard.ARROWRIGHT) {
      brush.size++
    }
    if (keyboard.T && !prevKeyboard.T) {
      brush.soft = !brush.soft
    }
  
    const landPoints = BRUSH.ownedLandPoints(brush, world, user)
    const heightDelta = 0.1
    if (keyboard.ARROWUP || (mouse.buttons[0] && state.currentActionType === 'raise')) {
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
    if (keyboard.ARROWDOWN || (mouse.buttons[0] && state.currentActionType === 'lower')) {
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
    if (keyboard.DELETE || (mouse.buttons[0] && state.currentActionType === 'reset')) {
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

    if (keyboard.C && !prevKeyboard.C) {
      state.currentPropType = propTypes[Math.max(propTypes.indexOf(state.currentPropType) - 1, 0)]
    }
    if (keyboard.V && !prevKeyboard.V) {
      state.currentPropType = propTypes[Math.min(propTypes.indexOf(state.currentPropType) + 1, propTypes.length - 1)]
    }
    if (keyboard.E || (mouse.buttons[0] && state.currentActionType === 'prop_add')) {
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
    if (keyboard.R || (mouse.buttons[0] && state.currentActionType === 'prop_remove')) {
      landPoints.forEach(landPoint => {
        if (landPoint.prop) {
          landPoint.prop = null
          landPoint.land.propCount--
          landPoint.land.propListDirty = true
        }
      })
    }
    const propRotationSpeed = Math.PI / 90
    if (keyboard.K) {
      landPoints.forEach(landPoint => {
        if (landPoint.prop) {
          landPoint.prop.rotation += propRotationSpeed
          landPoint.land.propListDirty = true
        }
      })
    }
    if (keyboard.L) {
      landPoints.forEach(landPoint => {
        if (landPoint.prop) {
          landPoint.prop.rotation -= propRotationSpeed
          landPoint.land.propListDirty = true
        }
      })
    }

    if (keyboard.Z && !prevKeyboard.Z) {
      state.currentLandType = landTypes[Math.max(landTypes.indexOf(state.currentLandType) - 1, 0)]
    }
    if (keyboard.X && !prevKeyboard.X) {
      state.currentLandType = landTypes[Math.min(landTypes.indexOf(state.currentLandType) + 1, landTypes.length - 1)]
    }
    if (keyboard.Q || (mouse.buttons[0] && state.currentActionType === 'paint')) {
      landPoints.forEach(landPoint => {
        landPoint.type = state.currentLandType
        landPoint.land.colorMapDirty = true
      })
    }

    if (keyboard.ENTER && !prevKeyboard.ENTER) {
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

    if (keyboard[' ']) {
      const props = landPoints.filter(x => x.prop).map(x => x.prop)
      if (props.length) {
        const text = prompt(`Edit text for ${props.length} prop(s)`, props[0].text || '')
        if (text != null) {
          props.forEach(prop => { prop.text = text })
        }
        keyboard[' '] = false
      }
    }
  }
}