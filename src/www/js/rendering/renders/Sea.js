import { createShader } from '../shaders.js'
import { createArrayBuffer } from '../buffers.js'

export function createRender_Sea(gl) {
  const Shader = createShader(gl, {
    attributes: {
      a_pos: 'vec4'
    },
    uniforms: {
      cameraView: 'mat4',
    },
    varyings: {},
    vertex: `
      void main() {
        vec4 position = vec4(a_pos.x, 0, a_pos.y, 1);

        mat4 toWorldSpace = mat4(
          10000.0, 0, 0, 0,
          0, 1.0, 0, 0,
          0, 0, 10000.0, 0,
          0, 0, 0, 1.0
        );


        gl_Position = position 
          * toWorldSpace
          * cameraView;
      }  
    `,
    fragment: `
      void main() {
        fragment = vec4(31.0 / 255.0, 74.0 / 255.0, 186.0 / 255.0, 0.75);
      }    
    `
  })

  const quad = createArrayBuffer(gl, [
    -1, 1,
    1, 1,
    -1, -1,
    1, -1,
  ])

  const attributes = {
    a_pos: {
      size: 2,
      type: gl.FLOAT,
      normalized: false,
      stride: 0,
      offset: 0,
      buffer: quad
    }
  }

  return (cameraView) => {
    Shader({
      attributes,
      uniforms: {
        cameraView: ['Matrix4fv', false, cameraView]
      }
    })
  
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4) 
  }
}