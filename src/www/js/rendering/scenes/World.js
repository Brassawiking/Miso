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

    lands.forEach(land => {
      render_Terrain({
        time, 
        cameraView, 
        heightMap:  land.heightMap, 
        colorMap: land.colorMap, 
        position: [land.x * landSize, 0, land.y * landSize] 
      })
    })

    lands.forEach(land => {
      const propMap = land.propMap
      for (let i = 0, len = propMap.length; i < len; ++i) {
        const prop = propMap[i]
        if (prop == null) {
          continue
        }
        const x = i % landSize + land.x * landSize
        const y = (i - x) / landSize + land.y * landSize
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

    const markerOutlineOffset = brushSize - 1
    const markerOutlineColor = [1, 1, 0]
    render_TerrainMarker(cameraView, markerPosition, [1, 0, 0])
    render_TerrainMarker(cameraView, v3.add(markerPosition, [markerOutlineOffset, 0, markerOutlineOffset]) , markerOutlineColor)
    render_TerrainMarker(cameraView, v3.add(markerPosition, [markerOutlineOffset, 0, -markerOutlineOffset]) , markerOutlineColor)
    render_TerrainMarker(cameraView, v3.add(markerPosition, [-markerOutlineOffset, 0, -markerOutlineOffset]) , markerOutlineColor)
    render_TerrainMarker(cameraView, v3.add(markerPosition, [-markerOutlineOffset, 0, markerOutlineOffset]) , markerOutlineColor)

    render_TestModel(cameraView, playerPosition)

    // Transparent renders
    render_Sea(cameraView)  
  }
}