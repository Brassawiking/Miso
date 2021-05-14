import { v3 } from '../../common/math.js'

import { createRender_Sky } from '../renders/Sky.js'
import { createRender_Sea } from '../renders/Sea.js'
import { createRender_Terrain } from '../renders/Terrain.js'
import { createRender_TerrainMarker } from '../renders/TerrainMarker.js'
import { createRender_TestModel } from '../renders/TestModel.js'

import { createRender_StoneTablet } from '../renders/props/StoneTablet.js'
import { createRender_Tree } from '../renders/props/Tree.js'

export function createScene_World(gl, landSize) {
  const render_Sky = createRender_Sky(gl)
  const render_Sea = createRender_Sea(gl)
  const render_Terrain = createRender_Terrain(gl, landSize)
  const render_TerrainMarker = createRender_TerrainMarker(gl)
  const render_TestModel = createRender_TestModel(gl)
  
  const render_StoneTablet = createRender_StoneTablet(gl)
  const render_Tree = createRender_Tree(gl)

  const landCache = []
  const heightMapTextureCache = []
  const colorMapTextureCache = []

  return ({
    cameraView, 
    time,
    markerPosition,
    brushSize, 
    playerPosition,
    lands
  }) => {
    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LESS)

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    gl.clear(gl.DEPTH_BUFFER_BIT)

    render_Sky()
    terrain(lands, cameraView, time)
    props(lands, cameraView)
    brush(markerPosition, cameraView, brushSize)
    render_TestModel(cameraView, playerPosition)

    // Transparent renders
    render_Sea(cameraView)  
  }

  function terrain(lands, cameraView, time) {
    lands.forEach((land, index) => {
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

      if (land != landCache[index] || land.heightMapDirty) {
        const heightMap = land.heightMap
        const heightMapSize = Math.sqrt(heightMap.length)
        gl.bindTexture(gl.TEXTURE_2D, heightMapTexture)
        gl.texImage2D(
          gl.TEXTURE_2D, 
          0, 
          gl.R32F, 
          heightMapSize,
          heightMapSize,
          0, 
          gl.RED, 
          gl.FLOAT,
          heightMap
        )
      }

      if (land != landCache[index] || land.colorMapDirty) {
        const colorMap = land.colorMap
        const colorMapSize = Math.sqrt(colorMap.length / 3)
        gl.bindTexture(gl.TEXTURE_2D, colorMapTexture)
        gl.texImage2D(
          gl.TEXTURE_2D, 
          0, 
          gl.RGB, 
          colorMapSize, 
          colorMapSize, 
          0, 
          gl.RGB, 
          gl.UNSIGNED_BYTE,
          colorMap
        )
      }

      render_Terrain({
        time, 
        cameraView, 
        heightMapTexture, 
        colorMapTexture, 
        position: [land.x * landSize, 0, land.y * landSize] 
      })

      landCache[index] = land
    })
  }

  function props(lands, cameraView) {
    lands.forEach(land => {
      const propMap = land.propMap
      for (let i = 0, len = propMap.length; i < len; ++i) {
        const prop = propMap[i]
        if (prop == null) {
          continue
        }
        let x = i % landSize
        let y = (i - x) / landSize
        x += land.x * landSize
        y += land.y * landSize
        switch(prop.type) {
          case 'stone_tablet':
            render_StoneTablet(cameraView, [x, land.heightMap[i], y])
            break
          case 'tree':
            render_Tree(cameraView, [x, land.heightMap[i], y])
            break
        }
      }
    })
  }

  function brush(markerPosition, cameraView, brushSize) {
    const markerOutlineOffset = brushSize - 1
    const markerOutlineColor = [1, 1, 0]
    render_TerrainMarker(cameraView, markerPosition, [1, 0, 0])
    render_TerrainMarker(cameraView, v3.add(markerPosition, [markerOutlineOffset, 0, markerOutlineOffset]) , markerOutlineColor)
    render_TerrainMarker(cameraView, v3.add(markerPosition, [markerOutlineOffset, 0, -markerOutlineOffset]) , markerOutlineColor)
    render_TerrainMarker(cameraView, v3.add(markerPosition, [-markerOutlineOffset, 0, -markerOutlineOffset]) , markerOutlineColor)
    render_TerrainMarker(cameraView, v3.add(markerPosition, [-markerOutlineOffset, 0, markerOutlineOffset]) , markerOutlineColor)
  }
}