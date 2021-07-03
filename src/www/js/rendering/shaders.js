import { gl } from './gl.js'

let currentProgram
let cachedAttributeInputs
let cachedUniformInputs

const cachedUniformFunctions = {
  '1f': gl.uniform1f.bind(gl),
  '1fv': gl.uniform1fv.bind(gl),
  '1i': gl.uniform1i.bind(gl),
  '1iv': gl.uniform1iv.bind(gl),
  '2f': gl.uniform2f.bind(gl),
  '2fv': gl.uniform2fv.bind(gl),
  '2i': gl.uniform2i.bind(gl),
  '2iv': gl.uniform2iv.bind(gl),
  '3f': gl.uniform3f.bind(gl),
  '3fv': gl.uniform3fv.bind(gl),
  '3i': gl.uniform3i.bind(gl),
  '3iv': gl.uniform3iv.bind(gl),
  '4f': gl.uniform4f.bind(gl),
  '4fv': gl.uniform4fv.bind(gl),
  '4i': gl.uniform4i.bind(gl),
  '4iv': gl.uniform4iv.bind(gl),
  'Matrix2fv': gl.uniformMatrix2fv.bind(gl),
  'Matrix3fv': gl.uniformMatrix3fv.bind(gl),
  'Matrix4fv': gl.uniformMatrix4fv.bind(gl),
}

export function createShader(options) {
  const shaderProgram = createGLShaderProgram(options)
  const attributes = Object
    .keys(options.attributes)
    .map(attribute => ({ 
      name: attribute, 
      location: gl.getAttribLocation(shaderProgram, attribute)
    }))
  const uniforms = Object
    .keys(options.uniforms)
    .map(uniform => ({ 
      name: uniform, 
      location: gl.getUniformLocation(shaderProgram, uniform)
    }))

  const attributesCount = attributes.length
  const uniformsCount = uniforms.length

  return ({ 
    attributes: attributeInputs, 
    uniforms: uniformInputs 
  }) => {
    if (currentProgram !== shaderProgram) {
      gl.useProgram(shaderProgram)
      currentProgram = shaderProgram
      cachedAttributeInputs = {}
      cachedUniformInputs = {}
    }

    for (let i = 0; i < attributesCount; ++i) {
      const attribute = attributes[i]
      const name = attribute.name
      const input = attributeInputs[name]

      if (cachedAttributeInputs[name] === input) {
        continue
      }
      cachedAttributeInputs[name] = input

      const attributeLocation = attribute.location
      gl.bindBuffer(gl.ARRAY_BUFFER, input.buffer)
      gl.enableVertexAttribArray(attributeLocation)
      gl.vertexAttribPointer(
        attributeLocation, 
        input.size, 
        input.type, 
        input.normalized, 
        input.stride, 
        input.offset
      )
    }
  
    for (let i = 0; i < uniformsCount; ++i) {
      const uniform = uniforms[i]
      const name = uniform.name
      const input = uniformInputs[name]

      const cachedInput = cachedUniformInputs[name]
      if (cachedInput === input) {
        continue
      }
      cachedUniformInputs[name] = input
      
      const [type, ...args] = input
      cachedUniformFunctions[type](uniform.location, ...args)
    }
  }
}

function createGLShaderProgram(options) {
  const shaderProgram = gl.createProgram()
  const vertexShader = createGLShader(gl.VERTEX_SHADER, vertexSource(options))
  const fragmentShader = createGLShader(gl.FRAGMENT_SHADER, fragmentSource(options))

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

  return shaderProgram
}

function vertexSource(options) {
  return `
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
}

function fragmentSource(options) {
  return `
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
}

function createGLShader(type, source) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  return shader
}
