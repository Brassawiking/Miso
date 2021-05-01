import { createShaderProgram } from '../shaders.js'
import { createArrayBuffer } from '../buffers.js'

export class Terrain {
  constructor(gl, size) {
    this.shaderProgram = createShaderProgram(gl, {
      attributes: {
        a_pos: 'vec4',
        a_uv: 'vec2'
      },
      uniforms: {
        cameraView: 'mat4',
        time: 'float',
        gridSize: 'float',
        landSize: 'float',
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
          float sampleOffset = (1.0 / gridSize) / 1.0;
          float c = texture(heightMap, v_uv + vec2(0.5, 0.5) / gridSize).r;
          float t = texture(heightMap, v_uv + vec2(0.5, 0.5+sampleOffset) / gridSize).r;
          float b = texture(heightMap, v_uv + vec2(0.5, 0.5-sampleOffset) / gridSize).r;
          float r = texture(heightMap, v_uv + vec2(0.5+sampleOffset, 0.5) / gridSize).r;
          float l = texture(heightMap, v_uv + vec2(0.5-sampleOffset, 0.5) / gridSize).r;

          vec3 vC = vec3(0, c, 0);
          vec3 vT = vec3(0, t, sampleOffset);
          vec3 vB = vec3(0, t, -sampleOffset);
          vec3 vR = vec3(sampleOffset, r, 0);
          vec3 vL = vec3(-sampleOffset, r, 0);

          vec3 normal = normalize(cross(vT - vC, vR - vC));

          float lightTime = time / 1.0;
          float light = dot(-normalize(vec3(sin(lightTime) * 3.0, -3.0, vec3(cos(lightTime) * 3.0))), normal);

          //fragment = vec4(vec3(0.34, 0.69, 0) * max(light, 0.25), 1);
          fragment = vec4((texture(colorMap, v_uv) * max(light, 0.25)).rgb, 1);
          //fragment = vec4(max(light, 0.1) * (normal + 1.0) / 2.0, 1);
          //fragment = vec4((normal + 1.0) / 2.0, 1);
          //fragment = vec4(normal, 1);
        }
      `
    })

    this.mesh = []
    this.texCoords = []

    for (var y = 0; y < size-1; ++y) {
      for (var x = 0; x < size-1; ++x) {
        this.mesh.push(
          x, y,
          x+1, y,
          x+1, y+1,
          x+1, y+1,
          x, y+1,
          x, y
        )
        this.texCoords.push(
          x / size,     y / size,
          (x+1) / size, y / size,
          (x+1) / size, (y+1) / size,
          (x+1) / size, (y+1) / size,
          x / size,     (y+1) / size,
          x / size,     y / size
        )
      }
    }
    this.size = size

    this.positionBuffer = createArrayBuffer(gl, this.mesh)
    this.texCoordBuffer = createArrayBuffer(gl, this.texCoords)
  }

  render(gl, t, cameraView, land) {
    this.shaderProgram.use({
      attributes: {
        a_pos: {
          size: 2,
          type: gl.FLOAT,
          normalized: false,
          stride: 0,
          offset: 0,
          buffer: this.positionBuffer
        },
        a_uv: {
          size: 2,
          type: gl.FLOAT,
          normalized: false,
          stride: 0,
          offset: 0,
          buffer: this.texCoordBuffer
        }
      },
      uniforms: {
        time: ['1f', t / 1000],
        gridSize: ['1f', this.size],
        landSize: ['1f', land.size],
        cameraView: ['Matrix4fv', false, cameraView],
        heightMap: ['1i', 0],
        colorMap: ['1i', 1]
      }
    })

    if (!this.texture) {
      this.texture = gl.createTexture()
      gl.bindTexture(gl.TEXTURE_2D, this.texture)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }

    if (!this.colorTexture) {
      this.colorTexture = gl.createTexture()
      gl.bindTexture(gl.TEXTURE_2D, this.colorTexture)      
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }

    for (let i = 0; i < 16; ++i) {
      gl.activeTexture(gl['TEXTURE' + i])
      gl.bindTexture(gl.TEXTURE_2D, this.texture)
      gl.texImage2D(
        gl.TEXTURE_2D, 
        0, 
        gl.R32F, 
        land.size, 
        land.size, 
        0, 
        gl.RED, 
        gl.FLOAT,
        new Float32Array(land.points.map(x => x.height))
      )
    }

    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, this.colorTexture)
    gl.texImage2D(
      gl.TEXTURE_2D, 
      0, 
      gl.RGB, 
      land.size, 
      land.size, 
      0, 
      gl.RGB, 
      gl.UNSIGNED_BYTE,
      new Uint8Array(land.points.flatMap(x => {
        switch(x.type) {
          case 'grass': return [86, 176, 0]
          case 'dirt': return [115, 118, 83]
          case 'sand': return [246, 228, 173]
          default: return [255, 255, 255]
        }
      }))
    )

    gl.drawArrays(gl.TRIANGLES, 0, this.mesh.length)
  }
} 