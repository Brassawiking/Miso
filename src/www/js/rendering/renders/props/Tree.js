import { createRender_Prop } from './_Prop.js'

export function createRender_Tree(gl) {
  const rootLevel = -0.5
  const rootWidth = -0.25
  const treeHeight = 10;
  const mesh = [
    // front
    -rootWidth, rootLevel, -rootWidth,
    rootWidth, rootLevel, -rootWidth,
    0, treeHeight, 0,

    // back
    -rootWidth, rootLevel, rootWidth,
    rootWidth, rootLevel, rootWidth,
    0, treeHeight, 0,

    // left
    -rootWidth, rootLevel, -rootWidth,
    -rootWidth, rootLevel, rootWidth,
    0, treeHeight, 0,

    // right
    rootWidth, rootLevel, -rootWidth,
    rootWidth, rootLevel, rootWidth,
    0, treeHeight, 0,

    // right leaves
    -2, treeHeight, -2,
    2, treeHeight-2, -2,
    2, treeHeight, 2,

    // left leaves
    -2, treeHeight, -2,
    2, treeHeight, 2,
    -2, treeHeight-2, 2,
  ]

  const frontLeft =     [-1, 0.3, -1]
  const front =         [ 0, 0.3, -1]
  const frontRight =    [ 1, 0.3, -1]
  const backLeft =      [-1, 0.3,  1]
  const back =          [ 0, 0.3,  1]
  const backRight =     [ 1, 0.3,  1]
  const left =          [-1, 0.3,  0]
  const right =         [ 1, 0.3,  0]
  const up           =  [ 0,   1,  0]
  const frontRightUp =  [ 1,   1, -1]
  const backLeftUp =    [-1,   1,  1]
  const normals = [
    ...frontLeft,
    ...frontRight,
    ...front,

    ...backLeft,
    ...backRight,
    ...back,

    ...frontLeft,
    ...backLeft,
    ...left,
   
    ...frontRight,
    ...backRight,
    ...right,

    ...up,
    ...frontRightUp,
    ...up,

    ...up,
    ...up,
    ...backLeftUp,
  ]

  const trunkColor = [0.48, 0.33, 0.19, 1]
  const leafColor = [0.76, 0.04, 0.31, 0.8]
  const colors = [
    ...trunkColor,
    ...trunkColor,
    ...trunkColor,

    ...trunkColor,
    ...trunkColor,
    ...trunkColor,
    
    ...trunkColor,
    ...trunkColor,
    ...trunkColor,

    ...trunkColor,
    ...trunkColor,
    ...trunkColor,
    
    ...leafColor,
    ...leafColor,
    ...leafColor,

    ...leafColor,
    ...leafColor,
    ...leafColor,
  ]

  return createRender_Prop(gl, mesh, normals, colors)
}