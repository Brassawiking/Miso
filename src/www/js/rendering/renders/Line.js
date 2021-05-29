import { gl } from '../gl.js'
import { createShader } from '../shaders.js'
import { createArrayBuffer } from '../buffers.js'

export function createRender_Line() {
  const Shader = createShader({
    attributes: {
      a_vertex: 'vec4'
    },
    uniforms: {
      u_cameraView: 'mat4',
      u_color: 'vec3',
      u_start: 'vec3',
      u_end: 'vec3',
    },
    varyings: {
    },
    vertex: `
      void main() {
        vec4 position = a_vertex * 0.0;
        position += vec4(u_start, 1.0) * float(gl_VertexID);
        position += vec4(u_end, 1.0) * float(1 - gl_VertexID);

        gl_Position = position 
          * u_cameraView;
      }
    `,
    fragment: `
      void main() {
        fragment = vec4(u_color, 1.0);
      }
    `
  })

  const attributes = {
    a_vertex: {
      size: 1,
      type: gl.FLOAT,
      normalized: false,
      stride: 0,
      offset: 0,
      buffer: createArrayBuffer([0, 0])
    }
  }

  return (cameraView, start, end, color) => {
    Shader({
      attributes,
      uniforms: {
        u_cameraView: ['Matrix4fv', false, cameraView],
        u_color: ['3f', ...color],
        u_start: ['3f', ...start],
        u_end: ['3f', ...end],
      }
    })

    gl.drawArrays(gl.LINES, 0, 2)
  }
} 