import { gl } from '../../../rendering/gl.js'
import { v3, clamp } from '../../../common/math.js'
import { mouse } from '../../../system/input.js'
import { CAMERA } from '../../entities.js'

export function init_Camera({ 
  state: {
    camera,
    player
  }
}) {
  const orbitSpeed = 1.5;
  const zoomSpeed = 0.01
  const vertBias = 0.001 // Temp fix so the camera don't go bananaz

  let orbitDistance = 6
  let orbitHorisontal = Math.PI / 5
  let orbitVertical= Math.PI / 5
  let orbitMoveStart

  return () => {
    orbitDistance = Math.max(orbitDistance + zoomSpeed*mouse.wheel, 2.5)
  
    if (mouse.right) {
      if (mouse.rightOnce) {
        orbitMoveStart = {
          mouseX: mouse.x,
          mouseY: mouse.y,
          orbitH: orbitHorisontal,
          orbitV: orbitVertical
        }
      }
  
      orbitHorisontal = orbitMoveStart.orbitH - (mouse.x - orbitMoveStart.mouseX) * orbitSpeed
      orbitVertical = clamp(
        orbitMoveStart.orbitV - (mouse.y - orbitMoveStart.mouseY) * orbitSpeed,
        -Math.PI / 2 + vertBias,
        Math.PI / 2 - vertBias
      )
    }

    camera.aspect = gl.canvas.clientWidth / gl.canvas.clientHeight
    camera.target = v3.add(player.position, [0, 1.5, 0])
    CAMERA.orbit(camera, player.position, orbitDistance, orbitHorisontal, orbitVertical)
  }
}