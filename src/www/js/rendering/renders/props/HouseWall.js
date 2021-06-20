import { createRender_Prop } from './_Prop.js'
import { shape_box } from '../helpers/shapes.js'

export function createRender_HouseWall() {
  const thick = 0.1
  const width = 1.5
  const height = 4.5

  const { mesh, normals, colors } = shape_box(
    [0, height/2, 0], 
    [width, 0, 0], 
    [0, height/2, 0], 
    [0, 0, thick], 

    [195/255, 172/255, 125/255, 1]
  )
  return createRender_Prop(mesh, normals, colors)
}
