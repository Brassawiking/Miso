import { v3 } from '../../../../common/math.js'

export function shape_box(
  front_v0, 
  front_v1, 
  front_v2, 
  front_v3,
  back_v0, 
  back_v1, 
  back_v2, 
  back_v3,
  color
) {
  const front = shape_quad(front_v0, front_v1, front_v2, front_v3, color)
  const back = shape_quad(back_v0, back_v1, back_v2, back_v3, color)
  const top = shape_quad(front_v1, back_v2, back_v1, front_v2, color)
  const bottom = shape_quad(back_v3, front_v0, front_v3, back_v0, color)
  const left = shape_quad(back_v3, back_v2, front_v1, front_v0, color)
  const right = shape_quad(front_v3, front_v2, back_v1, back_v0, color)

  const mesh = [
    ...front.mesh,
    ...back.mesh,
    ...top.mesh,
    ...bottom.mesh,
    ...left.mesh,
    ...right.mesh,
  ]
  const normals = [
    ...front.normals,
    ...back.normals,
    ...top.normals,
    ...bottom.normals,
    ...left.normals,
    ...right.normals,
  ]
  const colors = [
    ...front.colors,
    ...back.colors,
    ...top.colors,
    ...bottom.colors,
    ...left.colors,
    ...right.colors,
  ]

  return {
    mesh,
    normals,
    colors
  }
}

export function shape_quad(v0, v1, v2, v3, color) {
  const tri0 = shape_triangle(v0, v1, v2, color)
  const tri1 = shape_triangle(v2, v3, v0, color)
  
  const mesh = [
    ...tri0.mesh,
    ...tri1.mesh,
  ]
  const normals = [
    ...tri0.normals,
    ...tri1.normals,
  ]
  const colors = [
    ...tri0.colors,
    ...tri1.colors,
  ]

  return {
    mesh,
    normals,
    colors
  }
}

export function shape_triangle(v0, v1, v2, color) {
  const normal = v3.normalize(v3.cross(v3.subtract(v1, v0), v3.subtract(v2, v0)))

  const mesh = [
    ...v0,
    ...v1,
    ...v2,
  ]
  const normals = [
    ...normal,
    ...normal,
    ...normal,
  ]
  const colors = [
    ...color,
    ...color,
    ...color,
  ]

  return {
    mesh,
    normals,
    colors
  }
}
