import { shape_triangle } from './helpers/shapes.js'
import { createRender_Prop } from './props/_Prop.js'

export function createRender_Trilobite(bodyColor = [1.0, 0.5, 0, 1]) {
  const width = 1
  const face = -0.75
  const tail = 2
  const thick = 0.3
  const center = 0.5

  const topRight = shape_triangle(
    [0, center+thick, face],
    [0, center+thick, tail],
    [width, center-thick, 0],
    bodyColor
  )
  const topLeft = shape_triangle(
    [0, center+thick, face],
    [-width, center-thick, 0],
    [0, center+thick, tail],
    bodyColor
  )
  const front = shape_triangle(
    [0, center+thick, face],
    [width, center-thick, 0],
    [-width, center-thick, 0],
    [0, 0, 0, 1]
  )
  const back = shape_triangle(
    [0, center+thick, tail],
    [-width, center-thick, 0],
    [width, center-thick, 0],
    [0, 0, 0, 1]
  )

  const antennaRight = shape_triangle(
    [width/3, center+thick/2, face/2],
    [width/3, center+thick/2, tail],
    [width/2, center+thick, 0],
    [0, 0, 0, 1]
  )

  const antennaLeft = shape_triangle(
    [-width/3, center+thick/2, face/2],
    [-width/2, center+thick, 0],
    [-width/3, center+thick/2, tail],
    [0, 0, 0, 1]
  )

  const teethRight = shape_triangle(
    [width/4, center, face/3],
    [width/5, center, face/2],
    [width/4, center-thick, face/2],
    [1, 1, 1, 1]
  )

  const teethLeft = shape_triangle(
    [-width/4, center, face/3],
    [-width/5, center, face/2],
    [-width/4, center-thick, face/2],
    [1, 1, 1, 1]
  )

  return createRender_Prop(
    [
      ...topRight.mesh,
      ...topLeft.mesh,
      ...front.mesh,
      ...back.mesh,
      ...antennaRight.mesh,
      ...antennaLeft.mesh,
      ...teethRight.mesh,
      ...teethLeft.mesh,
    ], 
    [
      ...topRight.normals,
      ...topLeft.normals,
      ...front.normals,
      ...back.normals,
      ...antennaRight.normals,
      ...antennaLeft.normals,
      ...teethRight.normals,
      ...teethLeft.normals,
    ], 
    [
      ...topRight.colors,
      ...topLeft.colors,
      ...front.colors,
      ...back.colors,
      ...antennaRight.colors,
      ...antennaLeft.colors,
      ...teethRight.colors,
      ...teethLeft.colors,
    ]
  )
}