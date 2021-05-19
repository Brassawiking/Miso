import { createRender_Prop } from './_Prop.js'

export function createRender_PoleHorizontal(gl) {
  const thick = 0.1
  const width = 2
  const height = 4.5
  const base = height - thick
  const mesh = [
    -width, base, -thick,
    width, base, -thick,
    -width, height, -thick,

    width, base, -thick,
    width, height, -thick,
    -width, height, -thick,

    -width, base, thick,
    width, base, thick,
    -width, height, thick,

    width, base, thick,
    width, height, thick,
    -width, height, thick,
 
    -width, base, -thick,
    -width, base, thick,
    -width, height, -thick,
 
    -width, base, thick,
    -width, height, thick,
    -width, height, -thick,
 
    width, base, -thick,
    width, base, thick,
    width, height, -thick,
 
    width, base, thick,
    width, height, thick,
    width, height, -thick,

    -width, height, -thick,
    width, height, -thick,
    width, height, thick,

    -width, height, -thick,
    width, height, thick,
    -width, height, thick,

    -width, base, -thick,
    width, base, -thick,
    width, base, thick,

    -width, base, -thick,
    width, base, thick,
    -width, base, thick,
  ]

  const frontNormal = [0, 0, -1]
  const backNormal = [0, 0, 1]
  const leftNormal = [-1, 0, 0]
  const rightNormal = [1, 0, 0]
  const upNormal = [0, 1, 0]
  const downNormal = [0, -1, 0]
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

    ...leftNormal,
    ...leftNormal,
    ...leftNormal,

    ...rightNormal,
    ...rightNormal,
    ...rightNormal,

    ...rightNormal,
    ...rightNormal,
    ...rightNormal,

    ...upNormal,
    ...upNormal,
    ...upNormal,

    ...upNormal,
    ...upNormal,
    ...upNormal,

    ...downNormal,
    ...downNormal,
    ...downNormal,

    ...downNormal,
    ...downNormal,
    ...downNormal,
  ]

  const poleColor = [1, 0, 0, 1]
  const colors = [
    ...poleColor,
    ...poleColor,
    ...poleColor,

    ...poleColor,
    ...poleColor,
    ...poleColor,

    ...poleColor,
    ...poleColor,
    ...poleColor,

    ...poleColor,
    ...poleColor,
    ...poleColor,
  
    ...poleColor,
    ...poleColor,
    ...poleColor,
  
    ...poleColor,
    ...poleColor,
    ...poleColor,

    ...poleColor,
    ...poleColor,
    ...poleColor,
  
    ...poleColor,
    ...poleColor,
    ...poleColor,

    ...poleColor,
    ...poleColor,
    ...poleColor,
  
    ...poleColor,
    ...poleColor,
    ...poleColor,

    ...poleColor,
    ...poleColor,
    ...poleColor,
  
    ...poleColor,
    ...poleColor,
    ...poleColor,
  ]

  return createRender_Prop(gl, mesh, normals, colors)
}