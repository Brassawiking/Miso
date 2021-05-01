export function createShaderProgram(gl, options) {
  const vsSource = `
    #version 300 es
    precision highp float;

    ${
      Object.keys(options.attributes)
        .map(key => `in ${options.attributes[key]} ${key};`)
        .join('\n')
    }

    ${
      Object.keys(options.varyings)
        .map(key => `out ${options.varyings[key]} ${key};`)
        .join('\n')
    }

    ${
      Object.keys(options.uniforms)
        .map(key => `uniform ${options.uniforms[key]} ${key};`)
        .join('\n')
    }

    ${options.vertex}
  `.trim()

  const fsSource = `
    #version 300 es
    precision highp float;

    ${
      Object.keys(options.uniforms)
        .map(key => `uniform ${options.uniforms[key]} ${key};`)
        .join('\n')
    }

    out vec4 ${options.output || 'fragment'};

    ${
      Object.keys(options.varyings)
        .map(key => `in ${options.varyings[key]} ${key};`)
        .join('\n')
    }

    ${options.fragment}
  `.trim()

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource)
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource)

  const shaderProgram = gl.createProgram()
  gl.attachShader(shaderProgram, vertexShader)
  gl.attachShader(shaderProgram, fragmentShader)
  gl.linkProgram(shaderProgram)

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    throw new Error([
      gl.getProgramInfoLog(shaderProgram),
      gl.getShaderInfoLog(vertexShader),
      gl.getShaderInfoLog(fragmentShader)
    ].join('\n'))
  }

  gl.detachShader(shaderProgram, vertexShader)
  gl.detachShader(shaderProgram, fragmentShader)

  gl.deleteShader(vertexShader)
  gl.deleteShader(fragmentShader)

  return {
    program: shaderProgram,
    attributes: dictionaryMap(options.attributes, key => gl.getAttribLocation(shaderProgram, key)),
    uniforms: dictionaryMap(options.uniforms, key => gl.getUniformLocation(shaderProgram, key)),
    use(inputs) { useShader(gl, this, inputs)  } // nasty 'this'
  }
}

function createShader(gl, type, source) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  return shader
}

function dictionaryMap(dictionary, mapper) {
  return Object
      .keys(dictionary)
      .reduce((acc, key) => {
        acc[key] = mapper(key)
        return acc
      }, {})
}

function useShader(gl, shaderProgram, inputs) {
  gl.useProgram(shaderProgram.program)

  Object.keys(inputs.attributes).forEach(key => {
    const attribute = inputs.attributes[key]
    const attributeLocation = shaderProgram.attributes[key]

    gl.bindBuffer(gl.ARRAY_BUFFER, attribute.buffer)
    gl.enableVertexAttribArray(attributeLocation)
    gl.vertexAttribPointer(
      attributeLocation, 
      attribute.size, 
      attribute.type, 
      attribute.normalized, 
      attribute.stride, 
      attribute.offset
    )
  })

  Object.keys(inputs.uniforms).forEach(key => {
    const uniform = inputs.uniforms[key]
    const uniformLocation = shaderProgram.uniforms[key]

    gl[`uniform${uniform[0]}`](uniformLocation, ...uniform.slice(1))
  })
}