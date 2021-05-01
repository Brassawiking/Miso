import { createShaderProgram } from '../shaders.js'
import { createArrayBuffer } from '../buffers.js'

export class TerrainMarker {
  constructor(gl) {
    this.shaderProgram = createShaderProgram(gl, {
      attributes: {
        vertexPosition: 'vec4'
      },
      uniforms: {
        time: 'float',
        cameraView: 'mat4',
        worldPosition: 'vec3'
      },
      varyings: {
      },
      vertex: `
        void main() {
          mat4 toWorldSpace = mat4(
            1.0, 0, 0, worldPosition.x,
            0, 1.0, 0, worldPosition.y,
            0, 0, 1.0, worldPosition.z,
            0, 0, 0, 1.0
          );

          gl_Position = vertexPosition 
            * toWorldSpace
            * cameraView;
        }
      `,
      fragment: `
        void main() {
          fragment = vec4(vec3(1.0, 0, 0) * gl_FragCoord.z, 1.0);
        }
      `
    })

    const height = 10000
    this.mesh = [
      0, height, 0,
      0, -height, 0
    ]

    this.positionBuffer = createArrayBuffer(gl, this.mesh)
  }

  render(gl, t, cameraView, position) {
    this.shaderProgram.use({
      attributes: {
        vertexPosition: {
          size: 3,
          type: gl.FLOAT,
          normalized: false,
          stride: 0,
          offset: 0,
          buffer: this.positionBuffer
        }
      },
      uniforms: {
        time: ['1f', t / 1000],
        cameraView: ['Matrix4fv', false, cameraView],
        worldPosition: ['3f', ...position]
      }
    })

    gl.drawArrays(gl.LINES, 0, this.mesh.length / 3)
  }
} 