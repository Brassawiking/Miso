import { createRender_Prop } from './_Prop.js'
import { shape_box } from './helpers/shapes.js'

export function createRender_Steps(gl) {
  const step = 0.3
  const color = [0.5, 0.5, 0.5, 1]
  const width = 1.5
  const depth = 1.5

  const bottomStep = shape_box(
    [0, -step, 0], 
    [width, 0, 0], 
    [0, step/2, 0], 
    [0, 0, depth], 
    color
  )

  const middleStep = shape_box(
    [0, 0, depth*1/3], 
    [width, 0, 0], 
    [0, step/2, 0], 
    [0, 0, depth*2/3], 
    color
  )

  const topStep = shape_box(
    [0, step, depth*2/3], 
    [width, 0, 0], 
    [0, step/2, 0], 
    [0, 0, depth*1/3], 
    color
  )

  return createRender_Prop(
    gl, 
    [
      ...bottomStep.mesh,
      ...middleStep.mesh,
      ...topStep.mesh,
    ], 
    [
      ...bottomStep.normals,
      ...middleStep.normals,
      ...topStep.normals,
    ], 
    [
      ...bottomStep.colors,
      ...middleStep.colors,
      ...topStep.colors,
    ] 
  )
}