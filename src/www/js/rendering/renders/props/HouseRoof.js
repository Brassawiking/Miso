import { createRender_Prop } from './_Prop.js'
import { shape_box } from './helpers/shapes.js'

export function createRender_HouseRoof(gl) {
  const thick = 0.1
  const width = 4
  const height = 4.5

  const { mesh, normals, colors } = shape_box(
    [0, height, 0], 
    [width, 0, 0], 
    [0, thick, 0], 
    [0, 0, width], 

    [0.4, 0.4, 0.4, 1]
  )
  return createRender_Prop(gl, mesh, normals, colors)
}
