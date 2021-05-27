import { createRender_Prop } from './_Prop.js'
import { shape_box } from './helpers/shapes.js'

export function createRender_PoleVertical(gl) {
  const top = 5.0
  const bottom = -0.5
  const thick = 0.1

  const { mesh, normals, colors } = shape_box(
    [0, (top - bottom) / 2 + bottom, 0], 
    [thick, 0, 0], 
    [0, (top - bottom) / 2, 0], 
    [0, 0, thick], 

    [1, 0, 0, 1]
  )
  return createRender_Prop(gl, mesh, normals, colors)
}