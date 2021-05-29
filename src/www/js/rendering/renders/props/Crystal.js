import { createRender_Prop } from './_Prop.js'
import { shape_box } from './helpers/shapes.js'

export function createRender_Crystal() {

  const crystal0 = shape_box(
    [0.1, 0.5-0.5, -0.2], 
    [0.2, -0.2, 0], 
    [0.2, 1.2, 0], 
    [0, 0, 0.2], 

    [1, 1, 0.2, 0.7]
  )
  const crystal1 = shape_box(
    [-0.4, 0.5-0.5, 0.2], 
    [0.25, 0.25, 0], 
    [-0.25, 1, 0], 
    [0, 0, 0.25], 

    [0, 0.3, 1, 0.7]
  )
  
  const crystal2 = shape_box(
    [-0.05, 0.2-0.5, 0.1], 
    [0.15, 0, -0.1], 
    [0, 1.5, 0.5], 
    [0, -0.25, 0.25], 

    [1, 0.3, 0, 0.7]
  )
  
  return createRender_Prop(
    [
      ...crystal0.mesh,
      ...crystal1.mesh,
      ...crystal2.mesh,
    ], 
    [
      ...crystal0.normals,
      ...crystal1.normals,
      ...crystal2.normals,
    ], 
    [
      ...crystal0.colors,
      ...crystal1.colors,
      ...crystal2.colors,
    ]
  )
}