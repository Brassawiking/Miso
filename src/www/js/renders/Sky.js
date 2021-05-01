import { createShaderProgram } from '../shaders.js'
import { createArrayBuffer } from '../buffers.js'

export class Sky {

  constructor(gl) {
    this.backgroundShader = createShaderProgram(gl, {
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
          vec3 colarA = vec3(
            193.0 / 255.0,
            220.0 / 255.0,
            237.0 / 255.0
          );
          vec3 colarB = vec3(
            63.0 / 255.0, 
            113.0 / 255.0, 
            183.0 / 255.0
          );
          fragment = vec4(mix(colarA, colarB, quadPos.y), 1);
        }    
      `
    })

    this.backgroundQuad = createArrayBuffer(gl, [
      -1, 1,
      1, 1,
      -1, -1,
      1, -1,
    ])
  }

  render(gl, t) {
    gl.disable(gl.DEPTH_TEST)
    gl.depthMask(false)
  
    this.backgroundShader.use({
      attributes: {
        vertexPosition: {
          size: 2,
          type: gl.FLOAT,
          normalized: false,
          stride: 0,
          offset: 0,
          buffer: this.backgroundQuad
        }
      },
      uniforms: {}
    })
  
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4) 
  
    gl.enable(gl.DEPTH_TEST)
    gl.depthMask(true)
  }
}