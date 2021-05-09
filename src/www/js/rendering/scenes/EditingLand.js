import { createRender_Sky } from '../renders/Sky.js'
import { createRender_Sea } from '../renders/Sea.js'
import { createRender_Terrain } from '../renders/Terrain.js'
import { createRender_TerrainMarker } from '../renders/TerrainMarker.js'
import { createRender_TestModel } from '../renders/TestModel.js'

export function createScene_EditingLand(gl, landSize) {
  const render_Sky = createRender_Sky(gl)
  const render_Sea = createRender_Sea(gl)
  const render_Terrain = createRender_Terrain(gl, landSize)
  const render_TerrainMarker = createRender_TerrainMarker(gl)
  const render_TestModel = createRender_TestModel(gl)

  return ({
    cameraView, 
    time,
    markerPosition, 
    playerPosition,
    heightMap,
    colorMap,
  }) => {
    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LESS)

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    gl.clear(gl.DEPTH_BUFFER_BIT)

    render_Sky()
    render_Terrain({ 
      time, 
      cameraView, 
      heightMap, 
      colorMap, 
      position: [0, 0, 0] 
    })
    
    render_TerrainMarker(cameraView, markerPosition, [1, 0, 0])
    render_TestModel(cameraView, playerPosition)

    // Transparent renders
    render_Sea(cameraView)  
  }
}