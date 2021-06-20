import { createRender_Prop } from './_Prop.js'
import { shape_box } from '../helpers/shapes.js'

export function createRender_Fence() {
  const boardThick = 0.1
  const boardWidth = 1.5
  const boardColor = [0, 0, 1, 1]
  const legHeight = 1.5
  const legThick = 0.1
  const legColor = [1, 1, 1, 1]

  const board0 = shape_box([0, legHeight-2*legThick, -legThick], [boardWidth, 0, 0], [0, boardThick, 0], [0, 0, boardThick/3], boardColor)
  const leg0 = shape_box([-1, legHeight/2, 0], [legThick, 0, 0], [0, legHeight/2, 0], [0, 0, legThick], legColor)
  const leg1 = shape_box([0, legHeight/2, 0], [legThick, 0, 0], [0, legHeight/2, 0], [0, 0, legThick], legColor)
  const leg2 = shape_box([1, legHeight/2, 0], [legThick, 0, 0], [0, legHeight/2, 0], [0, 0, legThick], legColor)

  return createRender_Prop(
    [
      ...board0.mesh,
      ...leg0.mesh,
      ...leg1.mesh,
      ...leg2.mesh,
    ],
    [
      ...board0.normals,
      ...leg0.normals,
      ...leg1.normals,
      ...leg2.normals,
    ],
    [
      ...board0.colors,
      ...leg0.colors,
      ...leg1.colors,
      ...leg2.colors,
    ]
  )
}