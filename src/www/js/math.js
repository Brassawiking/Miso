export const v3 = {
  normalize(v) {
    const length = Math.sqrt(
      v[0] * v[0] + 
      v[1] * v[1] + 
      v[2] * v[2]
    )
    return length
      ? [v[0] / length, v[1] / length, v[2] / length]
      : [0, 0, 0]
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
  }
}