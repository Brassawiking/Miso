import { createSky } from '../renders/Sky.js'
import { createSea } from '../renders/Sea.js'
import { createTerrain } from '../renders/Terrain.js'
import { createTerrainMarker } from '../renders/TerrainMarker.js'
import { createTestModel } from '../renders/TestModel.js'

export function createEditingLand(gl, landSize) {
  const Sky = createSky(gl)
  const Sea = createSea(gl)
  const Terrain = createTerrain(gl, landSize)
  const TerrainMarker = createTerrainMarker(gl)
  const TestModel = createTestModel(gl)

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

    Sky()
    Terrain({ time, cameraView, heightMap, colorMap })
    TerrainMarker(cameraView, markerPosition, [1, 0, 0])
    TestModel(cameraView, playerPosition)

    // Transparent renders
    Sea(cameraView)  
  }
}