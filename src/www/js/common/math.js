export const v3 = {
  normalize(v) {
    const length = v3.length(v)
    return length
      ? [v[0] / length, v[1] / length, v[2] / length]
      : [0, 0, 0]
  },

  length(v) {
    return Math.sqrt(
      v[0] * v[0] + 
      v[1] * v[1] + 
      v[2] * v[2]
    )
  }, 

  add(a, b) {
    return [
      a[0] + b[0],
      a[1] + b[1],
      a[2] + b[2]
    ]
  },

  subtract(a, b) {
    return [
      a[0] - b[0],
      a[1] - b[1],
      a[2] - b[2]
    ]
  },

  multiply(v, scalar) {
    return [
      v[0] * scalar, 
      v[1] * scalar, 
      v[2] * scalar
    ]
  },

  cross(a, b) {
    return [
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0]
    ]
  },

  dot(a, b) {
    return (
      a[0] * b[0] +
      a[1] * b[1] +
      a[2] * b[2]
    )
  }
}

export const m4 = {
  identity() {
    return [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ]
  },

  multiply(a, b) {
    const result = Array(16)

    for (var i = 0 ; i < 4; ++i) {
      for (var j = 0 ; j < 4; ++j) {
        let sum = 0
        for (var k = 0; k < 4; ++k) {
          sum += a[4*i + k] * b[4*k + j]
        }
        result[i*4 + j] = sum
      }
    }

    return result
  },

  multiply_v4(m, v) {
    return [
      m[0]  * v[0] + m[1]  * v[1] + m[2]  * v[2] + m[3] * v[3],
      m[4]  * v[0] + m[5]  * v[1] + m[6]  * v[2] + m[7] * v[3],
      m[8]  * v[0] + m[9]  * v[1] + m[10] * v[2] + m[11] * v[3],
      m[12] * v[0] + m[13] * v[1] + m[14] * v[2] + m[15] * v[3],
    ]
  }
}

export const linePlaneIntersectionPoint = (lineDirection, linePoint, planeNormal, planePoint) => {
  const lineDotNormal = v3.dot(lineDirection, planeNormal)
  if (Math.abs(lineDotNormal) > 0) {
    const distanceToPlane = v3.dot(v3.subtract(planePoint, linePoint), planeNormal) / lineDotNormal
    return v3.add(linePoint, v3.multiply(lineDirection, distanceToPlane))
  } else {
    return null
  }
}

export const clamp = (value, min, max) => Math.min(Math.max(value, min), max)
export const lerp = (a, b, t) => a*(1-t) + b*t
