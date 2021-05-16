import { createRender_Prop } from './_Prop.js'

export function createRender_Bush(gl) {
  const root = -0.5
  const height = 2
  const brim = 0.75
  const width = 0.95
  const brimOffset = 0.2
  const mesh = [
    0, root, 0,
    0, height, 0,
    -width+brimOffset, brim, -width,

    0, root, 0,
    0, height, 0,
    width, brim, -width+brimOffset,

    0, root, 0,
    0, height, 0,
    width-brimOffset, brim, width,

    0, root, 0,
    0, height, 0,
    -width, brim, width-brimOffset,
  ]

  const frontLeft = [-1, 0.1, -1]
  const frontRight = [1, 0.1, -1]
  const backRight = [1, 0.1, 1]
  const backLeft = [-1, 0.1, 1]
  const up = [0, 1, 0]
  const normals = [
    ...frontLeft,
    ...up,
    ...frontLeft,

    ...frontRight,
    ...up,
    ...frontRight,

    ...backRight,
    ...up,
    ...backRight,

    ...backLeft,
    ...up,
    ...backLeft,
  ]

  const rootColor = [0.5, 0.3, 0.1, 0.9]
  const bushColor = [0.1, 0.7, 0.5, 0.9]
  const colors = [
    ...rootColor,
    ...bushColor,
    ...bushColor,

    ...rootColor,
    ...bushColor,
    ...bushColor,

    ...rootColor,
    ...bushColor,
    ...bushColor,

    ...rootColor,
    ...bushColor,
    ...bushColor,
  ]

  return createRender_Prop(gl, mesh, normals, colors)
}