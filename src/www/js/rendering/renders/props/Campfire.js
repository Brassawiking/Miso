import { createRender_Prop } from './_Prop.js'
import { shape_box } from '../helpers/shapes.js'

export function createRender_Campfire() {
  const logThick = 0.1
  const logWidth = 0.8
  const logColor = [0.58, 0.33, 0.19, 1]

  const fireRoot = logThick
  const fireHeight = 1.5
  const fireBrim = 0.5
  const fireWidth = 0.4
  const fireNormal = [0.15, 1, 0]
  const fireCenterColor = [1, 1, 0.4, 1]
  const fireOuterColor = [1, 0.15, 0, 0.8]

  const fire = {
    mesh: [
      0, fireRoot, 0,
      0, fireHeight, 0,
      -fireWidth, fireBrim, -fireWidth,
  
      0, fireRoot, 0,
      0, fireHeight, 0,
      fireWidth, fireBrim, -fireWidth,
  
      0, fireRoot, 0,
      0, fireHeight, 0,
      fireWidth, fireBrim, fireWidth,
  
      0, fireRoot, 0,
      0, fireHeight, 0,
      -fireWidth, fireBrim, fireWidth,
    ],
    normals: [
      ...fireNormal,
      ...fireNormal,
      ...fireNormal,
  
      ...fireNormal,
      ...fireNormal,
      ...fireNormal,
  
      ...fireNormal,
      ...fireNormal,
      ...fireNormal,
  
      ...fireNormal,
      ...fireNormal,
      ...fireNormal,  
    ],
    colors: [
      ...fireCenterColor,
      ...fireOuterColor,
      ...fireOuterColor,
  
      ...fireCenterColor,
      ...fireOuterColor,
      ...fireOuterColor,
  
      ...fireCenterColor,
      ...fireOuterColor,
      ...fireOuterColor,
  
      ...fireCenterColor,
      ...fireOuterColor,
      ...fireOuterColor,
    ]

  }

  const logA = shape_box(
    [0, 0, 0], 
    [logWidth, 0, 0], 
    [0, logThick, 0], 
    [0, 0, logThick], 
    logColor
  )
  const logB = shape_box(
    [0, 0, 0], 
    [logThick, 0, 0], 
    [0, logThick, 0], 
    [0, 0, logWidth], 
    logColor
  )

  return createRender_Prop(
    [
      ...fire.mesh,
      ...logA.mesh,
      ...logB.mesh,
    ], 
    [
      ...fire.normals,
      ...logA.normals,
      ...logB.normals,
    ], 
    [
      ...fire.colors,
      ...logA.colors,
      ...logB.colors,
    ]
  )
}