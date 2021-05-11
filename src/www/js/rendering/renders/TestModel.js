import { createShader } from '../shaders.js'
import { createArrayBuffer } from '../buffers.js'

export function createRender_TestModel(gl) {
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
    -0.5, 1, 0.25,     // Back-top-left
    0.5, 1, 0.25,      // Back-top-right
    -0.5, 0, 0.25,    // Back-bottom-left
    0.5, 0, 0.25,     // Back-bottom-right
    0.5, 0, -0.25,    // Front-bottom-right
    0.5, 1, 0.25,      // Back-top-right
    0.5, 2, -0.25,     // Front-top-right
    -0.5, 1, 0.25,     // Back-top-left
    -0.5, 2, -0.25,    // Front-top-left
    -0.5, 0, 0.25,    // Back-bottom-left
    -0.5, 0, -0.25,   // Front-bottom-left
    0.5, 0, -0.25,    // Front-bottom-right
    -0.5, 1, -0.25,    // Front-top-left
    0.5, 1, -0.25      // Front-top-right
  ]
  const positionBuffer = createArrayBuffer(gl, mesh)

  const attributes = {
    vertexPosition: {
      size: 3,
      type: gl.FLOAT,
      normalized: false,
      stride: 0,
      offset: 0,
      buffer: positionBuffer
    }
  }

  return (cameraView, position) => {
    Shader({
      attributes,
      uniforms: {
        cameraView: ['Matrix4fv', false, cameraView],
        worldPosition: ['3f', ...position]
      }
    })

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, mesh.length / 3)
  }
}