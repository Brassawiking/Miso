import { gl } from '../gl.js'
import { createShader } from '../shaders.js'
import { createArrayBuffer } from '../buffers.js'

export function createRender_Sky() {
  const Shader = createShader({
    attributes: {
      vertex: 'vec4'
    },
    uniforms: {},
    varyings: {
      quadPos: 'vec2'
    },
    vertex: `
      void main() {
        quadPos = (vertex.xy + 1.0) / 2.0;
        gl_Position = vertex;
      }  
    `,
    fragment: `
      void main() {
        vec3 colarTop = vec3(
          121.0 / 255.0,
          228.0 / 255.0,
          245.0 / 255.0
        );
        vec3 colarBottom = vec3(
          186.0 / 255.0, 
          241.0 / 255.0, 
          250.0 / 255.0
        );
        fragment = vec4(mix(colarBottom, colarTop, quadPos.y), 1);
      }    
    `
  })

  const quad = createArrayBuffer([
    -1, 1,
    1, 1,
    -1, -1,
    1, -1,
  ])

  const attributes = {
    vertexPosition: {
      size: 2,
      type: gl.FLOAT,
      normalized: false,
      stride: 0,
      offset: 0,
      buffer: quad
    }
  }

  return () => {
    gl.disable(gl.DEPTH_TEST)
    gl.depthMask(false)
  
    Shader({
      attributes,
      uniforms: {}
    })
  
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4) 
  
    gl.enable(gl.DEPTH_TEST)
    gl.depthMask(true)

  }
}