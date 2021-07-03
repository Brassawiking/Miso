import { gl } from '../gl.js'
import { createShader } from '../shaders.js'
import { createArrayBuffer } from '../buffers.js'

export function createRender_Sea() {
  const Shader = createShader({
    attributes: {
      a_pos: 'vec2'
    },
    uniforms: {
      u_cameraView: 'mat4',
      u_cameraPos: 'vec3',
      u_sunRay: 'vec3',
      u_time: 'float',
    },
    varyings: {
      v_pos: 'vec4',
    },
    vertex: `
      void main() {
        vec4 position = vec4(a_pos.x, 0, a_pos.y, 1);

        mat4 toWorldSpace = mat4(
          10000.0, 0, 0, 0,
          0, 1.0, 0, 0,
          0, 0, 10000.0, 0,
          0, 0, 0, 1.0
        );

        v_pos = position * toWorldSpace;

        gl_Position = position 
          * toWorldSpace
          * u_cameraView;
      }  
    `,
    fragment: `
      float getWaterHeight(float x, float y) {
        return (sin(x*0.75 + u_time*2.0) + cos(y*0.75 + u_time*2.0)) / 8.0;
      }

      void main() {
        float sampleOffset = 0.1;
        float h00 = getWaterHeight(v_pos.x, v_pos.z);
        float h10 = getWaterHeight(v_pos.x + sampleOffset, v_pos.z);
        float h01 = getWaterHeight(v_pos.x, v_pos.z  + sampleOffset);

        vec3 normal = normalize(cross(
          vec3(0, h01, sampleOffset) - vec3(0, h00, 0),
          vec3(sampleOffset, h10, 0) - vec3(0, h00, 0)
        ));

        vec3 lightColor = vec3(253.0 / 255.0, 184.0 / 255.0, 19.0 / 255.0);
        vec3 seaColor = vec3(31.0 / 255.0, 74.0 / 255.0, 186.0 / 255.0);

        vec3 diffuse = lightColor
          * max(dot(-normalize(u_sunRay), normal), 0.0)
          * 0.1;

        vec3 viewRay = normalize(v_pos.xyz - u_cameraPos);
        vec3 reflectSunRay = normalize(reflect(-u_sunRay, normal));
        vec3 specular = lightColor
          * pow(max(dot(viewRay, reflectSunRay), 0.0), 64.0)
          * smoothstep(-0.075, 0.0, -normalize(u_sunRay).y)
          * 1.5;
        
        fragment = vec4((diffuse + specular) + seaColor * max(-u_sunRay.y, 0.3), 0.8);
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
    a_pos: {
      size: 2,
      type: gl.FLOAT,
      normalized: false,
      stride: 0,
      offset: 0,
      buffer: quad
    }
  }

  return (camera, sunRay, time) => {
    gl.depthMask(false)

    Shader({
      attributes,
      uniforms: {
        u_cameraView: ['Matrix4fv', false, camera.matrix],
        u_cameraPos: ['3f', ...camera.position],
        u_sunRay: ['3f', ...sunRay],
        u_time: ['1f', time],
      }
    })
  
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4) 

    gl.depthMask(true)
  }
}