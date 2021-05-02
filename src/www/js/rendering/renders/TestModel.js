import { createShader } from '../shaders.js'
import { createArrayBuffer } from '../buffers.js'

export function createTestModel(gl) {
  const Shader = createShader(gl, {
    attributes: {
      vertexPosition: 'vec4'
    },
    uniforms: {
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
        fragment = vec4(vec3(1.0, 0, 1.0) * gl_FragCoord.z, 1.0);
      }
    `
  })

  const mesh = [
    -1, 1, 1,     // Back-top-left
    1, 1, 1,      // Back-top-right
    -1, -1, 1,    // Back-bottom-left
    1, -1, 1,     // Back-bottom-right
    1, -1, -1,    // Front-bottom-right
    1, 1, 1,      // Back-top-right
    1, 2, -1,     // Front-top-right
    -1, 1, 1,     // Back-top-left
    -1, 2, -1,    // Front-top-left
    -1, -1, 1,    // Back-bottom-left
    -1, -1, -1,   // Front-bottom-left
    1, -1, -1,    // Front-bottom-right
    -1, 1, -1,    // Front-top-left
    1, 1, -1      // Front-top-right
  ]
  const positionBuffer = createArrayBuffer(gl, mesh)

  return (cameraView, position) => {
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
        cameraView: ['Matrix4fv', false, cameraView],
        worldPosition: ['3f', ...position]
      }
    })

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, mesh.length / 3)
  }
}