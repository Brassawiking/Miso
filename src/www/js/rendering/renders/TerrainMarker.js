import { createShader } from '../shaders.js'
import { createArrayBuffer } from '../buffers.js'

export function createRender_TerrainMarker(gl) {
  const Shader = createShader(gl, {
    attributes: {
      vertexPosition: 'vec4'
    },
    uniforms: {
      color: 'vec3',
      cameraView: 'mat4',
      worldPosition: 'vec3'
    },
    varyings: {
    },
    vertex: `
      void main() {
        mat4 toWorldSpace = mat4(
          1.0, 0, 0, worldPosition.x,
          0, 10000.0, 0, worldPosition.y,
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
        fragment = vec4(color * gl_FragCoord.z, 1.0);
      }
    `
  })

  const positionBuffer = createArrayBuffer(gl, [
    0, 1, 0,
    0, -1, 0
  ])

  return (cameraView, position, color) => {
    Shader({
      attributes: {
        vertexPosition: {
          size: 3,
          type: gl.FLOAT,
          normalized: false,
          stride: 0,
          offset: 0,
          buffer: positionBuffer
        }
      },
      uniforms: {
        color: ['3f', ...color],
        cameraView: ['Matrix4fv', false, cameraView],
        worldPosition: ['3f', ...position]
      }
    })

    gl.drawArrays(gl.LINES, 0, 2)
  }
}