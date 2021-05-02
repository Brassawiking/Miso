import { createShader } from '../shaders.js'
import { createArrayBuffer } from '../buffers.js'

export function createTerrain(gl, gridSize) {
  const Shader = createShader(gl, {
    attributes: {
      a_pos: 'vec4',
      a_uv: 'vec2'
    },
    uniforms: {
      cameraView: 'mat4',
      time: 'float',
      gridSize: 'float',
      heightMap: 'sampler2D',
      colorMap: 'sampler2D'
    },
    varyings: {
      v_uv: 'vec2',
    },
    vertex: `
      void main() {
        vec4 position = vec4(
          a_pos.x,
          texture(heightMap, a_uv + vec2(0.5, 0.5) / gridSize).r,
          a_pos.y,
          1 
        );

        mat4 toWorldSpace = mat4(
          1.0, 0, 0, 0,
          0, 1.0, 0, 0,
          0, 0, 1.0, 0,
          0, 0, 0, 1.0
        );

        v_uv = a_uv;

        gl_Position = position 
          * toWorldSpace
          * cameraView;
      }
    `,
    fragment: `
      void main() {
        float heightMapSize = float(textureSize(heightMap, 0).x);

        float sampleOffset = (1.0 / heightMapSize) / 1.0;
        float c = texture(heightMap, v_uv + vec2(0.5, 0.5) / heightMapSize).r;
        float t = texture(heightMap, v_uv + vec2(0.5, 0.5+sampleOffset) / heightMapSize).r;
        float b = texture(heightMap, v_uv + vec2(0.5, 0.5-sampleOffset) / heightMapSize).r;
        float r = texture(heightMap, v_uv + vec2(0.5+sampleOffset, 0.5) / heightMapSize).r;
        float l = texture(heightMap, v_uv + vec2(0.5-sampleOffset, 0.5) / heightMapSize).r;

        vec3 vC = vec3(0, c, 0);
        vec3 vT = vec3(0, t, sampleOffset);
        vec3 vB = vec3(0, t, -sampleOffset);
        vec3 vR = vec3(sampleOffset, r, 0);
        vec3 vL = vec3(-sampleOffset, r, 0);

        vec3 normal = normalize(cross(vT - vC, vR - vC));

        float lightTime = time / 1.0;
        float light = dot(-normalize(vec3(sin(lightTime) * 3.0, -3.0, vec3(cos(lightTime) * 3.0))), normal);

        //fragment = vec4(vec3(0.34, 0.69, 0) * max(light, 0.25), 1);
        fragment = vec4((texture(colorMap, v_uv) * max(light, 0.4)).rgb, 1);
        //fragment = vec4(max(light, 0.1) * (normal + 1.0) / 2.0, 1);
        //fragment = vec4((normal + 1.0) / 2.0, 1);
        //fragment = vec4(normal, 1);
      }
    `
  })

  const mesh = []
  const texCoords = []

  for (var y = 0; y < gridSize-1; ++y) {
    for (var x = 0; x < gridSize-1; ++x) {
      mesh.push(
        x, y,
        x+1, y,
        x+1, y+1,
        x+1, y+1,
        x, y+1,
        x, y
      )
      texCoords.push(
        x / gridSize,     y / gridSize,
        (x+1) / gridSize, y / gridSize,
        (x+1) / gridSize, (y+1) / gridSize,
        (x+1) / gridSize, (y+1) / gridSize,
        x / gridSize,     (y+1) / gridSize,
        x / gridSize,     y / gridSize
      )
    }
  }

  const positionBuffer = createArrayBuffer(gl, mesh)
  const texCoordBuffer = createArrayBuffer(gl, texCoords)

  const heightTexture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, heightTexture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  const colorTexture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, colorTexture)      
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  return ({
    time, 
    cameraView,
    heightMap,
    colorMap
  }) => {
    Shader({
      attributes: {
        a_pos: {
          size: 2,
          type: gl.FLOAT,
          normalized: false,
          stride: 0,
          offset: 0,
          buffer: positionBuffer
        },
        a_uv: {
          size: 2,
          type: gl.FLOAT,
          normalized: false,
          stride: 0,
          offset: 0,
          buffer: texCoordBuffer
        }
      },
      uniforms: {
        time: ['1f', time / 1000],
        gridSize: ['1f', gridSize],
        cameraView: ['Matrix4fv', false, cameraView],
        heightMap: ['1i', 0],
        colorMap: ['1i', 1]
      }
    })

    for (let i = 0; i < 16; ++i) {
      const heightMapSize = Math.sqrt(heightMap.length)
      gl.activeTexture(gl['TEXTURE' + i])
      gl.bindTexture(gl.TEXTURE_2D, heightTexture)
      gl.texImage2D(
        gl.TEXTURE_2D, 
        0, 
        gl.R32F, 
        heightMapSize,
        heightMapSize,
        0, 
        gl.RED, 
        gl.FLOAT,
        new Float32Array(heightMap)
      )
    }

    const colorMapSize = Math.sqrt(colorMap.length / 3)
    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, colorTexture)
    gl.texImage2D(
      gl.TEXTURE_2D, 
      0, 
      gl.RGB, 
      colorMapSize, 
      colorMapSize, 
      0, 
      gl.RGB, 
      gl.UNSIGNED_BYTE,
      new Uint8Array(colorMap)
    )

    gl.drawArrays(gl.TRIANGLES, 0, mesh.length)
  }
}