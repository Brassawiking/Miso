import { v3 } from '../../../common/math.js'
import { keyboard } from '../../../system/input.js'
import { WORLD } from '../../entities.js'

export function init_Movement({
  state,
  state: { 
    player,
    world,
    camera
  }, 
}) {
  const jumpFallForce = 25
  const freeFallForce = 35
    
  return ({ deltaTime }) => {
    const speed = player.base.speed + player.items.filter(x => x && x.type == 'mod' && x.effects.speed != null).reduce((sum, item) => sum + item.effects.speed, 0)
    const jumpSpeed = player.base.jump + player.items.filter(x => x && x.type == 'mod' && x.effects.jump != null).reduce((sum, item) => sum + item.effects.jump, 0)

    if (keyboard.keyOnce('G')) {
      state.gravity = !state.gravity
    }

    let moveDirection = [0, 0, 0]
    if (
      keyboard.key('D')) {
      moveDirection = v3.add(moveDirection, v3.normalize([camera.x[0], 0, camera.x[2]]))
    }
    if (keyboard.key('A')) {
      moveDirection = v3.add(moveDirection, v3.normalize([-camera.x[0], 0, -camera.x[2]]))
    }
    if (keyboard.key('W')) {
      moveDirection = v3.add(moveDirection, v3.normalize([camera.z[0], 0, camera.z[2]]))
    }
    if (keyboard.key('S')) {
      moveDirection = v3.add(moveDirection, v3.normalize([-camera.z[0], 0, -camera.z[2]]))
    }
    player.velocity = v3.add(player.velocity, v3.multiply(v3.normalize(moveDirection), speed))
    
    if (state.gravity) {
      if (keyboard.keyOnce('PAGEUP') && !player.velocity[1]) {
        player.velocity[1] += jumpSpeed
      }
    } else {
      if (keyboard.key('PAGEUP')) {
        player.velocity[1] += speed
      }
      if (keyboard.key('PAGEDOWN')) {
        player.velocity[1] -= speed
      }
    }
  
    player.velocity[0] *= 0.85
    player.velocity[2] *= 0.85
  
    if (state.gravity) {
      player.velocity[1] -= player.velocity[1] > 0
        ? jumpFallForce * deltaTime
        : freeFallForce * deltaTime
    } else {
      player.velocity[1] *= 0.85
    }
    
    player.position = v3.add(player.position, v3.multiply(player.velocity, deltaTime))
    if (state.gravity) {
      const playerRadius = 0.5
      const seaLevel = -1
      const minHeight = Math.max(WORLD.heightAt(player.position, world), seaLevel)
      const minHeightLeft = Math.max(WORLD.heightAt(v3.add(player.position, [-playerRadius, 0, 0]), world), seaLevel)
      const minHeightRight = Math.max(WORLD.heightAt(v3.add(player.position, [playerRadius, 0, 0]), world), seaLevel)
      const minHeightTop = Math.max(WORLD.heightAt(v3.add(player.position, [0, 0, playerRadius]), world), seaLevel)
      const minHeightBottom = Math.max(WORLD.heightAt(v3.add(player.position, [0, 0, -playerRadius]), world), seaLevel)
      
      const normal = v3.normalize(
        v3.cross(
          v3.subtract([0, minHeightTop, playerRadius], [0, minHeightBottom, -playerRadius]),
          v3.subtract([playerRadius, minHeightRight, 0], [-playerRadius, minHeightLeft, 0])
        )
      )
      state.slopeNormal = normal
  
      const steepThreshold = 0.4
      state.steepThreshold = steepThreshold
  
      const up = [0,1,0]
      const slopeSidway = v3.normalize(v3.cross(normal, up))
      const slopeDown = v3.normalize(v3.cross(normal, slopeSidway))
      state.slopeDown = slopeDown
  
      const slideDirection = v3.normalize([normal[0], 0, normal[2]])
      const steepness = 1 - v3.dot(normal, [0, 1, 0])
      state.steepness = steepness
      const slideSpeed = steepness > steepThreshold
        ? Math.pow((steepness-steepThreshold)/steepThreshold + 1, 3)
        : 0
  
      if (player.position[1] <= minHeight) {
        player.velocity = v3.add(player.velocity, v3.multiply(slideDirection, slideSpeed))
        player.position[1] = minHeight
        player.velocity[1] = 0
      }
    }
  
    if (v3.length(player.velocity) > 0) {
      player.direction = v3.normalize([player.velocity[0], 0, player.velocity[2]])
    }
  }
}