import { createRender_Prop } from './_Prop.js'
import { shape_box } from '../helpers/shapes.js'

export function createRender_Chest() {
  const thick = 0.05
  const width = 0.75
  const depth = 1
  const height = 0.75
  
  const chestColor = [0.5, 0.1, 0.3, 1]

  const front = shape_box(
    [0, height/2, -2*depth], 
    [width, 0, 0], 
    [0, height/2, 0], 
    [0, 0, thick], 
    chestColor
  )
  const back = shape_box(
    [0, height/2, 0], 
    [width, 0, 0], 
    [0, height/2, 0], 
    [0, 0, thick], 
    chestColor
  )
  const left = shape_box(
    [-width, height/2, -depth], 
    [thick, 0, 0], 
    [0, height/2, 0], 
    [0, 0, depth], 
    chestColor
  )
  const right = shape_box(
    [width, height/2, -depth], 
    [thick, 0, 0], 
    [0, height/2, 0], 
    [0, 0, depth], 
    chestColor
  )
  const bottom = shape_box(
    [0, 0, -depth], 
    [width, 0, 0], 
    [0, thick, 0], 
    [0, 0, depth], 

    [0.2, 0.2, 0.2, 1]
  )
  const top = shape_box(
    [0, height+depth/2, -depth], 
    [width, 0, 0], 
    [0, thick/2, thick/2], 
    [0, -depth/2, depth], 

    [0.9, 0.5, 0.4, 1]
  )


  return createRender_Prop(
    [ 
      ...front.mesh,
      ...back.mesh,
      ...left.mesh,
      ...right.mesh,
      ...bottom.mesh,
      ...top.mesh,
    ],
    [ 
      ...front.normals,
      ...back.normals,
      ...left.normals,
      ...right.normals,
      ...bottom.normals,
      ...top.normals,
    ],
    [ 
      ...front.colors,
      ...back.colors,
      ...left.colors,
      ...right.colors,
      ...bottom.colors,
      ...top.colors,
    ]
  )
}