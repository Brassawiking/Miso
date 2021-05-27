import { v3 } from '../../../../common/math.js'

export function shape_box(vPos, vX, vY, vZ, color) {
  const front = shape_quad(v3.subtract(vPos, vZ), vX, vY, color)
  const back = shape_quad(v3.add(vPos, vZ), v3.multiply(vX, -1), vY, color)
  const top = shape_quad(v3.add(vPos, vY), vX, vZ, color)
  const bottom = shape_quad(v3.subtract(vPos, vY), v3.multiply(vX, -1), vZ, color)
  const left = shape_quad(v3.subtract(vPos, vX), v3.multiply(vZ, -1), vY, color)
  const right = shape_quad(v3.add(vPos, vX), vZ, vY, color)

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

export function shape_quad(vPos, vX, vY, color) {
  const a = v3.subtract(v3.subtract(vPos, vX), vY)
  const b = v3.add(v3.subtract(vPos, vX), vY)
  const c = v3.add(v3.add(vPos, vX), vY)
  const d = v3.subtract(v3.add(vPos, vX), vY)
  
  const tri0 = shape_triangle(a, b, c, color)
  const tri1 = shape_triangle(c, d, a, color)
  
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

export function shape_triangle(a, b, c, color) {
  const normal = v3.normalize(
    v3.cross(
      v3.subtract(b, a), 
      v3.subtract(c, a)
    )
  )

  const mesh = [
    ...a,
    ...b,
    ...c,
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
