import { gl } from '../gl.js'
import { v3 } from '../../common/math.js'

import { createRender_Sky } from '../renders/Sky.js'
import { createRender_Sea } from '../renders/Sea.js'
import { createRender_Terrain } from '../renders/Terrain.js'
import { createRender_TerrainMarker } from '../renders/TerrainMarker.js'
import { createRender_PlayerModel } from '../renders/PlayerModel.js'
import { createRender_Trilobite } from '../renders/Trilobite.js'

import { createRender_Bush } from '../renders/props/Bush.js'
import { createRender_StoneTablet } from '../renders/props/StoneTablet.js'
import { createRender_Tree } from '../renders/props/Tree.js'
import { createRender_Person } from '../renders/props/Person.js'
import { createRender_PoleHorizontal } from '../renders/props/PoleHorizontal.js'
import { createRender_PoleVertical } from '../renders/props/PoleVertical.js'
import { createRender_Fence } from '../renders/props/Fence.js'
import { createRender_Crystal } from '../renders/props/Crystal.js'
import { createRender_HouseRoof } from '../renders/props/HouseRoof.js'
import { createRender_HouseWall } from '../renders/props/HouseWall.js'
import { createRender_Steps } from '../renders/props/Steps.js'
import { createRender_Chest } from '../renders/props/Chest.js'
import { createRender_Campfire } from '../renders/props/Campfire.js'

import { createRender_Line } from '../renders/Line.js'

import { createRender_PostProcessing } from '../renders/PostProcessing.js'
import { LANDPOINT } from '../../logic/entities.js'

export function createScene_World(landSize) {
  const render_Sky = createRender_Sky()
  const render_Sea = createRender_Sea()
  const render_Terrain = createRender_Terrain(landSize+1)
  const render_TerrainMarker = createRender_TerrainMarker()
  const render_PlayerModel = createRender_PlayerModel()
  const render_Line = createRender_Line()
  const render_PostProcessing = createRender_PostProcessing()

  const render_Trilobite = createRender_Trilobite()
  const render_TrilobiteHit = createRender_Trilobite([1, 1, 1, 1])
  
  const propRenders = {
    bush: createRender_Bush(),
    stone_tablet: createRender_StoneTablet(),
    person: createRender_Person(),
    person_red: createRender_Person([1, 0, 0, 1]),
    person_green: createRender_Person([0, 1, 0, 1]),
    person_blue: createRender_Person([0, 0, 1, 1]),
    person_yellow: createRender_Person([1, 1, 0, 1]),
    person_purple: createRender_Person([1, 0, 1, 1]),
    person_cyan: createRender_Person([0, 1, 1, 1]),
    person_white: createRender_Person([1, 1, 1, 1]),
    person_black: createRender_Person([0, 0, 0, 1]),
    tree: createRender_Tree(),
    pole_horizontal: createRender_PoleHorizontal(),
    pole_vertical: createRender_PoleVertical(),
    fence: createRender_Fence(),
    crystal: createRender_Crystal(),
    house_roof: createRender_HouseRoof(),
    house_wall: createRender_HouseWall(),
    steps: createRender_Steps(),
    chest: createRender_Chest(),
    campfire: createRender_Campfire(),
  }

  const landCache = []
  const heightMapCache = []
  const heightMapTextureCache = []
  const colorMapCache = []
  const colorMapTextureCache = []
  const propListCache = []

  const colorTexture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, colorTexture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  
  const depthTexture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, depthTexture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

  const frameBuffer = gl.createFramebuffer()
  gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, colorTexture, 0)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthTexture, 0)
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
 
  return ({
    time,
    lands,
    state,
    state: {
      camera, 
      brush, 
      player,
    },
    sunRay
  }) => {
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer)

    gl.bindTexture(gl.TEXTURE_2D, colorTexture)
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.canvas.width,
      gl.canvas.height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null
    )

    gl.bindTexture(gl.TEXTURE_2D, depthTexture)
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.DEPTH_COMPONENT24,
      gl.canvas.width,
      gl.canvas.height,
      0,
      gl.DEPTH_COMPONENT,
      gl.UNSIGNED_INT,
      null
    )
  
    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LESS)

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    gl.clear(gl.DEPTH_BUFFER_BIT)

    render_Sky(camera, sunRay)
    handleTerrain(camera.matrix, lands, time, sunRay)


    for (let i = 0, len = state.monsters.length; i < len; ++i) {
      const monster = state.monsters[i]
      const modelFacingNormal = [0, 0, -1]
      const direction = v3.normalize(monster.velocity)
      let rotation = Math.acos(v3.dot(modelFacingNormal, direction))
      if (v3.cross(direction, modelFacingNormal)[1] < 0) {
        rotation = 2*Math.PI - rotation 
      }
      const render = monster.isHit || monster.toughness <= 0
        ? render_TrilobiteHit
        : render_Trilobite
      render(camera.matrix, monster.position, sunRay, rotation, 1)
    }

    const modelFacingNormal = [0, 0, -1]
    let playerRotation = Math.acos(v3.dot(modelFacingNormal, player.direction))
    if (v3.cross(player.direction, modelFacingNormal)[1] < 0) {
      playerRotation = 2*Math.PI - playerRotation 
    }
    render_PlayerModel(camera.matrix, player.position, sunRay, playerRotation, player.shielded ? 0.25 : 1)
    
    if (player.swinging) {
      const playerArms = v3.add(player.position, [0, 1.25, 0])
      const swingSpeed = time * 30
      const swingLength = 3
      render_Line(
        camera.matrix,
        playerArms,
        v3.add(
          playerArms,
          [
            Math.sin(swingSpeed) * swingLength,
            0,
            Math.cos(swingSpeed) * swingLength
          ]  
        ),
        [0, 0, 0]
      )
    }

    if (state.interactiveLandpoint) {
      const playerEyes = v3.add(player.position, [0, 2, 0])
      render_Line(  
        camera.matrix, 
        playerEyes, 
        v3.add(
          LANDPOINT.position(state.interactiveLandpoint), 
          [
            0, 
            state.interactiveLandpoint.height + getInterativePropHeightOffset(state.interactiveLandpoint.prop) * state.interactiveLandpoint.prop.scale, 
            0
          ]
        ), 
        [1, 1, 1]
      )
    }

    if (state.debug) {
      const playerCenter = v3.add(player.position, [0, 1, 0])
      render_Line(
        camera.matrix, 
        playerCenter, 
        v3.add(playerCenter, player.velocity), 
        [1, 0, 1]
      )
      render_Line(
        camera.matrix, 
        playerCenter, 
        v3.add(playerCenter, v3.multiply(sunRay, -1)), 
        [1, 1, 0]
      )
      if (state.slopeNormal) {
        render_Line(
          camera.matrix, 
          player.position, 
          v3.add(player.position, v3.multiply(state.slopeNormal, 3)), 
          state.steepness > state.steepThreshold 
            ? [0, 1, 1] 
            : [0, 0, 1]
        )

        if (state.slopeDown) {
          render_Line(
            camera.matrix, 
            playerCenter, 
            v3.add(playerCenter, v3.multiply(state.slopeDown, 3)), 
            [1, 0, 0]
          )
        }
      }
    }

    // Transparent renders
    handleProps(camera.matrix, lands, sunRay)
    render_Sea(camera, sunRay, time)

    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.clear(gl.DEPTH_BUFFER_BIT)

    // TODO: Render to more color attachments for more possibilities (normal maps, etc.)
    render_PostProcessing(colorTexture, depthTexture)
    handleBrush(camera.matrix, brush)

    lands.forEach((land, index) => {
      landCache[index] = land
    })
  }

  function handleTerrain(cameraView, lands, time, sunRay) {
    lands.forEach((land, index) => {
      const landTop = lands.find(l => l.x === land.x && l.y === land.y+1)
      const landRight = lands.find(l => l.x === land.x+1 && l.y === land.y)
      const landTopRight = lands.find(l => l.x === land.x+1 && l.y === land.y+1)

      let heightMapTexture = heightMapTextureCache[index]
      if (!heightMapTexture) {
        heightMapTexture = gl.createTexture()
        gl.bindTexture(gl.TEXTURE_2D, heightMapTexture)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        heightMapTextureCache[index] = heightMapTexture
      }

      let colorMapTexture = colorMapTextureCache[index]
      if (!colorMapTexture) {
        colorMapTexture = gl.createTexture()
        gl.bindTexture(gl.TEXTURE_2D, colorMapTexture)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        colorMapTextureCache[index] = colorMapTexture
      }    

      if (land.heightMapDirty || landTop?.heightMapDirty || landRight?.heightMapDirty || landTopRight?.heightMapDirty || land != landCache[index]) {
        const landSize = Math.sqrt(land.points.length)
        const mapSize = landSize + 1
        let heightMap = heightMapCache[index]
        if (!heightMap) {
          heightMap = new Float32Array(new Array(Math.pow(mapSize, 2)))
          heightMapCache[index] = heightMap
        }

        for (let i = 0; i < mapSize; ++i) {
          for (let j = 0; j < mapSize; ++j) {
            let height

            if (i < landSize && j < landSize) {
              height = land.points[i + j*landSize].height
            }
            else if (i < landSize && j == landSize) {
              height = landTop 
                ? landTop.points[i].height
                : land.points[i + (j-1)*landSize].height
            }
            else if (i == landSize && j < landSize) {
              height = landRight
                ? landRight.points[j * landSize].height
                : height = land.points[(i-1) + j*landSize].height
            }
            else if (landTopRight && i == landSize && j == landSize) {
              height = landTopRight
                ? landTopRight.points[0].height
                : height = land.points[(i-1) + (j-1)*landSize].height
            }

            heightMap[i + j*mapSize] = height;
          }
        }

        gl.bindTexture(gl.TEXTURE_2D, heightMapTexture)
        gl.texImage2D(
          gl.TEXTURE_2D, 
          0, 
          gl.R32F, 
          mapSize,
          mapSize,
          0, 
          gl.RED, 
          gl.FLOAT,
          heightMap
        )
      }

      if (land.colorMapDirty || landTop?.colorMapDirty || landRight?.colorMapDirty || landTopRight?.colorMapDirty || land != landCache[index]) {
        const landSize = Math.sqrt(land.points.length)
        const mapSize = landSize + 1
        let colorMap = colorMapCache[index]
        if (!colorMap) {
          colorMap = new Uint8Array(new Array(mapSize * mapSize * 4))
          colorMapCache[index] = colorMap
        }

        for (let i = 0; i < mapSize; ++i) {
          for (let j = 0; j < mapSize; ++j) {
            let color

            if (i < landSize && j < landSize) {
              color = getColor(land.points[i + j*landSize])
            }
            else if (i < landSize && j == landSize) {
              color = getColor(landTop 
                ? landTop.points[i]
                : land.points[i + (j-1)*landSize]
              )
            }
            else if (i == landSize && j < landSize) {
              color = getColor(landRight
                ? landRight.points[j * landSize]
                : land.points[(i-1) + j*landSize]
              )
            }
            else if (i == landSize && j == landSize) {
              color = getColor(landTopRight 
                ? landTopRight.points[0]
                : land.points[(i-1) + (j-1)*landSize]
              )
            }

            colorMap[i*4 + j*4*mapSize + 0] = color[0]
            colorMap[i*4 + j*4*mapSize + 1] = color[1]
            colorMap[i*4 + j*4*mapSize + 2] = color[2]
            colorMap[i*4 + j*4*mapSize + 3] = 255
          }
        }

        gl.bindTexture(gl.TEXTURE_2D, colorMapTexture)
        gl.texImage2D(
          gl.TEXTURE_2D, 
          0, 
          gl.RGBA, 
          mapSize, 
          mapSize, 
          0, 
          gl.RGBA, 
          gl.UNSIGNED_BYTE,
          colorMap
        )
      }

      render_Terrain({
        time, 
        cameraView, 
        heightMapTexture, 
        colorMapTexture, 
        position: [land.x * landSize, 0, land.y * landSize],
        sunRay
      })
    })
  }

  function handleProps(cameraView, lands, sunRay) {
    lands.forEach((land, index) => {
      if (land.propListDirty || land.heightMapDirty || land != landCache[index]) {
        const landSize = Math.sqrt(land.points.length)

        let propList = propListCache[index]
        if (!propList) {
          propList = []
          propListCache[index] = propList
        }

        propList.length = 0
        for (let i = 0; i < landSize; ++i) {
          for (let j = 0; j < landSize; ++j) {
            const landPoint = land.points[i + j*landSize]
            const prop = landPoint.prop
            if (!prop) {
              continue
            }
            propList.push({
              prop,
              landPoint, 
              position: [
                i + land.x*landSize, 
                landPoint.height,
                j + land.y*landSize
              ],
            }) 
          }
        }
        propList.sort((a, b) => a.prop.type.localeCompare(b.prop.type))
      }

      const propList = propListCache[index]
      for (let i = 0, len = propList.length; i < len; ++i) {
        const { prop, position, landPoint } = propList[i]
        let propRender = propRenders[prop.type]
        if (propRender) {
          propRender(cameraView, position, sunRay, prop.rotation, landPoint._withinBrush ? 0.5 : 1, prop.scale)
        }
      }
    })
  }

  function handleBrush(cameraView, brush) {
    const outlineOffset = brush.size - 1
    const outlineColor = [1, 1, 0]
    render_TerrainMarker(cameraView, brush.position, [1, 0, 0])
    render_TerrainMarker(cameraView, v3.add(brush.position, [outlineOffset, 0, outlineOffset]) , outlineColor)
    render_TerrainMarker(cameraView, v3.add(brush.position, [outlineOffset, 0, -outlineOffset]) , outlineColor)
    render_TerrainMarker(cameraView, v3.add(brush.position, [-outlineOffset, 0, -outlineOffset]) , outlineColor)
    render_TerrainMarker(cameraView, v3.add(brush.position, [-outlineOffset, 0, outlineOffset]) , outlineColor)
  }
}

const colors = {
  'grass': [71, 176, 20],
  'dirt': [118, 85, 10],
  'rock': [61, 53, 75],
  'sand': [246, 228, 173],
  'lava': [255, 0, 50],
}
function getColor(landPoint) {
  return colors[landPoint.type] || [255, 255, 255]
}

function getInterativePropHeightOffset(prop) {
  switch(prop.type) {
    case 'bush': 
      return 1
    case 'stone_tablet': 
      return 1
    case 'pole_horizontal': 
      return 4.5
    case 'fence': 
      return 1
    case 'crystal': 
      return 1
    case 'house_roof': 
      return 4.5
    case 'steps': 
      return 0
    case 'chest': 
      return 0.5
    case 'campfire': 
      return 0.75
    default:
      return 2
  }
}
