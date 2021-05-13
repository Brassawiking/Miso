import { v3 } from '../../common/math.js'

import { createRender_Sky } from '../renders/Sky.js'
import { createRender_Sea } from '../renders/Sea.js'
import { createRender_Terrain } from '../renders/Terrain.js'
import { createRender_TerrainMarker } from '../renders/TerrainMarker.js'
import { createRender_TestModel } from '../renders/TestModel.js'

import { createRender_StoneTablet } from '../renders/props/StoneTablet.js'
import { createRender_Tree } from '../renders/props/Tree.js'

export function createScene_EditingLand(gl, landSize) {
  const render_Sky = createRender_Sky(gl)
  const render_Sea = createRender_Sea(gl)
  const render_Terrain = createRender_Terrain(gl, landSize)
  const render_TerrainMarker = createRender_TerrainMarker(gl)
  const render_TestModel = createRender_TestModel(gl)
  
  const render_StoneTablet = createRender_StoneTablet(gl)
  const render_Tree = createRender_Tree(gl)

  let currentHeightMap
  return ({
    cameraView, 
    time,
    markerPosition,
    brushSize, 
    playerPosition,
    heightMap,
    colorMap,
    propMap
  }) => {
    if (heightMap) {
      currentHeightMap = heightMap
    }

    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LESS)

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    gl.clear(gl.DEPTH_BUFFER_BIT)

    render_Sky()

    // Left Top to Bottom
    render_Terrain({ 
      time, 
      cameraView, 
      heightMap, 
      colorMap, 
      position: [-landSize, 0, landSize] 
    })
    render_Terrain({ 
      time, 
      cameraView, 
      heightMap, 
      colorMap, 
      position: [-landSize, 0, 0] 
    })
    render_Terrain({ 
      time, 
      cameraView, 
      heightMap, 
      colorMap, 
      position: [-landSize, 0, -landSize] 
    })

    // Middle Top to Bottom
    render_Terrain({ 
      time, 
      cameraView, 
      heightMap, 
      colorMap, 
      position: [0, 0, landSize] 
    })
    render_Terrain({ // Main Land
      time, 
      cameraView, 
      heightMap, 
      colorMap, 
      position: [0, 0, 0] 
    })
    render_Terrain({ 
      time, 
      cameraView, 
      heightMap, 
      colorMap, 
      position: [0, 0, -landSize] 
    })

    // Right Top to Bottom
    render_Terrain({ 
      time, 
      cameraView, 
      heightMap, 
      colorMap, 
      position: [landSize, 0, landSize] 
    })
    render_Terrain({ 
      time, 
      cameraView, 
      heightMap, 
      colorMap, 
      position: [landSize, 0, 0] 
    })
    render_Terrain({ 
      time, 
      cameraView, 
      heightMap, 
      colorMap, 
      position: [landSize, 0, -landSize] 
    })
    
    render_TerrainMarker(cameraView, markerPosition, [1, 0, 0])

    const markerOffset = (brushSize - 1)
    const markerOutlineColor = [1, 1, 0]
    render_TerrainMarker(cameraView, v3.add(markerPosition, [markerOffset, 0, markerOffset]) , markerOutlineColor)
    render_TerrainMarker(cameraView, v3.add(markerPosition, [markerOffset, 0, -markerOffset]) , markerOutlineColor)
    render_TerrainMarker(cameraView, v3.add(markerPosition, [-markerOffset, 0, -markerOffset]) , markerOutlineColor)
    render_TerrainMarker(cameraView, v3.add(markerPosition, [-markerOffset, 0, markerOffset]) , markerOutlineColor)
    

    for (let i = 0, len = propMap.length; i < len; ++i) {
      const prop = propMap[i]
      if (prop == null) {
        continue
      }
      const x = i % landSize
      const y = (i - x) / landSize
      switch(prop.type) {
        case 'stone_tablet':
          render_StoneTablet(cameraView, [x, currentHeightMap[i], y])
          break
        case 'tree':
          render_Tree(cameraView, [x, currentHeightMap[i], y])
          break
      }
    }
    render_TestModel(cameraView, playerPosition)

    // Transparent renders
    render_Sea(cameraView)  
  }
}