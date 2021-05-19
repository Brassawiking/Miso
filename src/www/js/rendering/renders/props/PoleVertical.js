import { createRender_Prop } from './_Prop.js'

export function createRender_PoleVertical(gl) {
  const base = -0.5
  const thick = 0.1
  const height = 5
  const mesh = [
    -thick, base, -thick,
    thick, base, -thick,
    -thick, height, -thick,

    thick, base, -thick,
    thick, height, -thick,
    -thick, height, -thick,

    -thick, base, thick,
    thick, base, thick,
    -thick, height, thick,

    thick, base, thick,
    thick, height, thick,
    -thick, height, thick,
 
    -thick, base, -thick,
    -thick, base, thick,
    -thick, height, -thick,
 
    -thick, base, thick,
    -thick, height, thick,
    -thick, height, -thick,
 
    thick, base, -thick,
    thick, base, thick,
    thick, height, -thick,
 
    thick, base, thick,
    thick, height, thick,
    thick, height, -thick,

    -thick, height, -thick,
    thick, height, -thick,
    thick, height, thick,

    -thick, height, -thick,
    thick, height, thick,
    -thick, height, thick,
  ]

  const frontNormal = [0, 0, -1]
  const backNormal = [0, 0, 1]
  const leftNormal = [-1, 0, 0]
  const rightNormal = [1, 0, 0]
  const upNormal = [0, 1, 0]
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
  ]

  return createRender_Prop(gl, mesh, normals, colors)
}