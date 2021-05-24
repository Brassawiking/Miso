import { createShader } from '../shaders.js'
import { createArrayBuffer } from '../buffers.js'

export function createRender_PostProcessing(gl) {
  const Shader = createShader(gl, {
    attributes: {
      vertex: 'vec4'
    },
    uniforms: {
      u_color: 'sampler2D',
      u_depth: 'sampler2D',
      u_resolution: 'vec2',
    },
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
        ivec2 resolution = textureSize(u_color, 0);
        float fudge = 2.0;
        vec2 sampleOffset = vec2(fudge / float(resolution.x), fudge / float(resolution.y)); 

        float d = 
          (-1.0) * texture(u_depth, quadPos + vec2(-sampleOffset.x, -sampleOffset.y)).r +
          (-1.0) * texture(u_depth, quadPos + vec2(0, -sampleOffset.y)).r +
          (-1.0) * texture(u_depth, quadPos + vec2(sampleOffset.x, -sampleOffset.y)).r +

          (-1.0) * texture(u_depth, quadPos + vec2(-sampleOffset.x, 0)).r +
          (8.0) * texture(u_depth, quadPos + vec2(0, 0)).r +
          (-1.0) * texture(u_depth, quadPos + vec2(sampleOffset.x, 0)).r +

          (-1.0) * texture(u_depth, quadPos + vec2(-sampleOffset.x, sampleOffset.y)).r +
          (-1.0) * texture(u_depth, quadPos + vec2(0, sampleOffset.y)).r +
          (-1.0) * texture(u_depth, quadPos + vec2(sampleOffset.x, sampleOffset.y)).r
        ;

        float rawD = texture(u_depth, quadPos).r;
        d = smoothstep(0.1, 1.0, pow(d, 0.25));
        vec3 effectColor = vec3(1.0);

        fragment = vec4(texture(u_color, quadPos).rgb * effectColor * (1.0-d), 1.0);
        //fragment = vec4(d, d, d, 1.0);

        gl_FragDepth = rawD;
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
    vertexPosition: {
      size: 2,
      type: gl.FLOAT,
      normalized: false,
      stride: 0,
      offset: 0,
      buffer: quad
    }
  }

  return (colorTexture, depthTexture) => {
    gl.depthFunc(gl.ALWAYS)
  
    Shader({
      attributes,
      uniforms: {
        u_color: ['1i', 0],
        u_depth: ['1i', 1]
      }
    })

    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, colorTexture)

    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, depthTexture)
  
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4) 

    gl.depthFunc(gl.LESS)
  }
}