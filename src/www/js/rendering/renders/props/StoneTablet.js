import { createRender_Prop } from './_Prop.js'

export function createRender_StoneTablet() {
  const root = -0.5
  const width = 1
  const height = 1.5
  const depth = 0.1
  const mesh = [
    -width, root, -depth,
    width, root, -depth,
    width, height, 0,

    -width, root, -depth,
    width, height, 0,
    -width, height, 0,

    -width, root, depth,
    width, root, depth,
    width, height, 0,

    -width, root, depth,
    width, height, 0,
    -width, height, 0,

    -width, root, -depth,
    -width, root, depth,
    -width, height, 0,

    width, root, -depth,
    width, root, depth,
    width, height, 0,
  ]

  const frontNormal = [0, 0.1, -1]
  const backNormal = [0, 0.1, 1]
  const leftNormal = [-1, 0, 0]
  const rightNormal = [1, 0, 0]
  const normals = [
    ...frontNormal,
    ...frontNormal,
    ...frontNormal,

    ...frontNormal,
    ...frontNormal,
    ...frontNormal,

    ...backNormal,
    ...backNormal,
    ...backNormal,
   
    ...backNormal,
    ...backNormal,
    ...backNormal,

    ...leftNormal,
    ...leftNormal,
    ...leftNormal,

    ...rightNormal,
    ...rightNormal,
    ...rightNormal,
  ]

  const stoneColor = [0.95, 0.96, 0.85, 1]
  const colors = [
    ...stoneColor,
    ...stoneColor,
    ...stoneColor,

    ...stoneColor,
    ...stoneColor,
    ...stoneColor,

    ...stoneColor,
    ...stoneColor,
    ...stoneColor,

    ...stoneColor,
    ...stoneColor,
    ...stoneColor,

    ...stoneColor,
    ...stoneColor,
    ...stoneColor,

    ...stoneColor,
    ...stoneColor,
    ...stoneColor,
  ]

  return createRender_Prop(mesh, normals, colors)
}