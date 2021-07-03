import { gl } from '../gl.js'
import { createShader } from '../shaders.js'
import { createArrayBuffer } from '../buffers.js'

export function createRender_Sky() {
  const Shader = createShader({
    attributes: {
      vertex: 'vec4'
    },
    uniforms: {
      u_sunRay: 'vec3',
      u_cameraX: 'vec3',
      u_cameraY: 'vec3',
      u_cameraZ: 'vec3',
      u_cameraNear: 'float',
      u_cameraAspect: 'float',
    },
    varyings: {
      v_cameraDirection: 'vec3'
    },
    vertex: `
      void main() {
        v_cameraDirection = 
          u_cameraZ * u_cameraNear +
          u_cameraX * vertex.x * u_cameraAspect +
          u_cameraY * vertex.y;

        gl_Position = vertex;
      }  
    `,
    fragment: `
      void main() {
        vec3 dayColor = mix(
          vec3(186.0 / 255.0, 241.0 / 255.0, 250.0 / 255.0), 
          vec3(121.0 / 255.0, 228.0 / 255.0, 245.0 / 255.0), 
          v_cameraDirection.y
        );
        vec3 nightColor = mix(
          vec3(0.0, 0.0, 0.15), 
          vec3(0.4, 0.1, 0.2), 
          1.0 - v_cameraDirection.y
        );

        vec3 toSun = normalize(-u_sunRay);
        float toSunCenter = length(toSun - normalize(v_cameraDirection));
        vec3 sunColor = vec3(253.0 / 255.0, 184.0 / 255.0, 19.0 / 255.0);
        vec3 sunLight = sunColor * pow(max(1.0-toSunCenter, 0.0), 16.0);

        fragment = vec4(mix(nightColor, dayColor, max(toSun.y + 0.25, 0.0)) + sunLight, 1);
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
    vertex: {
      size: 2,
      type: gl.FLOAT,
      normalized: false,
      stride: 0,
      offset: 0,
      buffer: quad
    }
  }

  return (camera, sunRay) => {
    gl.disable(gl.DEPTH_TEST)
    gl.depthMask(false)
  
    Shader({
      attributes,
      uniforms: {
        u_sunRay: ['3f', ...sunRay],
        u_cameraX: ['3f', ...camera.x],
        u_cameraY: ['3f', ...camera.y],
        u_cameraZ: ['3f', ...camera.z],
        u_cameraNear: ['1f', camera.near],
        u_cameraAspect: ['1f', camera.aspect],
      }
    })
  
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4) 
  
    gl.enable(gl.DEPTH_TEST)
    gl.depthMask(true)

  }
}