import { shape_box } from './helpers/shapes.js'
import { createRender_Prop } from './_Prop.js'

export function createRender_PoleVertical(gl) {
  const base = -0.5
  const thick = 0.1
  const height = 5

  const { mesh, normals, colors } = shape_box(
    [-thick, base, -thick], 
    [-thick, height, -thick], 
    [thick, height, -thick], 
    [thick, base, -thick], 

    [thick, base, thick], 
    [thick, height, thick], 
    [-thick, height, thick], 
    [-thick, base, thick], 

    [1, 0, 0, 1]
  )
  return createRender_Prop(gl, mesh, normals, colors)
}