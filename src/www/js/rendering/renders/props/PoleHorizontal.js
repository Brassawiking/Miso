import { createRender_Prop } from './_Prop.js'
import { shape_box } from './helpers/shapes.js'

export function createRender_PoleHorizontal(gl) {
  const thick = 0.1
  const width = Math.sqrt(2)*2
  const height = 4.5
  const top = height + thick
  const bottom = height - thick

  const { mesh, normals, colors } = shape_box(
    [-width, bottom, -thick], 
    [-width, top, -thick], 
    [width, top, -thick], 
    [width, bottom, -thick], 

    [width, bottom, thick], 
    [width, top, thick], 
    [-width, top, thick], 
    [-width, bottom, thick], 

    [1, 0, 0, 1]
  )
  return createRender_Prop(gl, mesh, normals, colors)
}