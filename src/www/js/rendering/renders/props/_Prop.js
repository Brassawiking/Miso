import { gl } from '../../gl.js'
import { createShader } from '../../shaders.js'
import { createArrayBuffer } from '../../buffers.js'

const MAX_PROP_INSTANCE_COUNT = 128
let Shader

export function createRender_Prop(mesh, normals, colors) {
  if (!Shader) {
    Shader = createShader({
      attributes: {
        vertexPosition: 'vec4',
        a_normal: 'vec4',
        a_color: 'vec4',
      },
      uniforms: {
        cameraView: 'mat4',
        u_sunRay: 'vec3',
        u_positions: `vec3[${MAX_PROP_INSTANCE_COUNT}]`,
        u_rotations: `float[${MAX_PROP_INSTANCE_COUNT}]`,
        u_scales: `float[${MAX_PROP_INSTANCE_COUNT}]`,
        u_opacities: `float[${MAX_PROP_INSTANCE_COUNT}]`,
      },
      varyings: {
        v_normal: 'vec4',
        v_color: 'vec4',
        v_opacity: 'float',
      },
      vertex: `
        void main() {
          vec3 worldPosition = u_positions[gl_InstanceID];
          float rotation = u_rotations[gl_InstanceID];
          float scaling = u_scales[gl_InstanceID];
          float opacity = u_opacities[gl_InstanceID];

          mat4 rotate = mat4(
            cos(-rotation), 0, sin(-rotation), 0,
            0, 1.0, 0, 0,
            -sin(-rotation), 0, cos(-rotation), 0,
            0, 0, 0, 1.0
          );

          mat4 scale = mat4(
            scaling, 0, 0, 0,
            0, scaling, 0, 0,
            0, 0, scaling, 0,
            0, 0, 0, 1
          );

          mat4 translate = mat4(
            1.0, 0, 0, worldPosition.x,
            0, 1.0, 0, worldPosition.y,
            0, 0, 1.0, worldPosition.z,
            0, 0, 0, 1.0
          );
  
          v_opacity = opacity;
          v_normal = a_normal
            * rotate;
          v_color = a_color;

          gl_Position = vertexPosition
            * rotate
            * scale
            * translate
            * cameraView;
        }
      `,
      fragment: `
        void main() {
          float light = dot(-normalize(u_sunRay), normalize(v_normal.xyz));
          fragment = vec4((v_color * max(light, 0.4)).rgb, v_color.a * v_opacity);
        }
      `
    })
  }

  const attributes = {
    vertexPosition: {
      size: 3,
      type: gl.FLOAT,
      normalized: false,
      stride: 0,
      offset: 0,
      buffer: createArrayBuffer(mesh)
    },
    a_normal: {
      size: 3,
      type: gl.FLOAT,
      normalized: false,
      stride: 0,
      offset: 0,
      buffer: createArrayBuffer(normals)
    },
    a_color: {
      size: 4,
      type: gl.FLOAT,
      normalized: false,
      stride: 0,
      offset: 0,
      buffer: createArrayBuffer(colors)
    },
  }

  const uniforms = {
    cameraView: null,
    worldPosition: null,
    u_sunRay: null,
    u_rotation: null,
    u_opacity: null,
  }

  let currentCameraView
  let currentSunRay
  return (cameraView, batchPositions, sunRay, batchRotations, batchOpacities, batchScales) => {
    for (let j = 0, len = batchPositions.length / 3 ; j < len; j += MAX_PROP_INSTANCE_COUNT) {
      const start = j
      const end = start + MAX_PROP_INSTANCE_COUNT

      const positions = batchPositions.slice(start*3, end*3)
      const rotations = batchRotations.slice(start, end)
      const opacities = batchOpacities.slice(start, end)
      const scales = batchScales.slice(start, end)

      uniforms.u_positions = ['3fv', positions]
      uniforms.u_rotations = ['1fv', rotations]
      uniforms.u_opacities = ['1fv', opacities]
      uniforms.u_scales = ['1fv', scales]
  
      if (currentCameraView != cameraView) {
        uniforms.cameraView = ['Matrix4fv', false, cameraView]
        currentCameraView = cameraView
      }
      if (currentSunRay != sunRay) {
        uniforms.u_sunRay = ['3f', ...sunRay]
        currentSunRay = sunRay      
      }
  
      Shader({
        attributes,
        uniforms
      })
  
      gl.drawArraysInstanced(gl.TRIANGLES, 0, mesh.length / 3, positions.length / 3)
    }
  }
}