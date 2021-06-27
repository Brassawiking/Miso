import { gl } from '../../gl.js'
import { createShader } from '../../shaders.js'
import { createArrayBuffer } from '../../buffers.js'

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
        worldPosition: 'vec3',
        u_sunRay: 'vec3',
        u_rotation: 'float',
        u_opacity: 'float',
        u_scale: 'float',
      },
      varyings: {
        v_normal: 'vec4',
        v_color: 'vec4',
      },
      vertex: `
        void main() {
          mat4 rotate = mat4(
            cos(-u_rotation), 0, sin(-u_rotation), 0,
            0, 1.0, 0, 0,
            -sin(-u_rotation), 0, cos(-u_rotation), 0,
            0, 0, 0, 1.0
          );

          mat4 scale = mat4(
            u_scale, 0, 0, 0,
            0, u_scale, 0, 0,
            0, 0, u_scale, 0,
            0, 0, 0, 1
          );

          mat4 translate = mat4(
            1.0, 0, 0, worldPosition.x,
            0, 1.0, 0, worldPosition.y,
            0, 0, 1.0, worldPosition.z,
            0, 0, 0, 1.0
          );
  
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
          fragment = vec4((v_color * max(light, 0.4)).rgb, v_color.a * u_opacity);
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
  let currentPosition
  let currentSunRay
  let currentRotation
  let currentOpacity
  let currentScale
  return (cameraView, position, sunRay, rotation, opacity = 1, scale = 1) => {
    if (currentCameraView != cameraView) {
      uniforms.cameraView = ['Matrix4fv', false, cameraView]
      currentCameraView = cameraView
    }
    if (currentPosition != position) {
      uniforms.worldPosition = ['3f', ...position]
      currentPosition = position
    }
    if (currentSunRay != sunRay) {
      uniforms.u_sunRay = ['3f', ...sunRay]
      currentSunRay = sunRay      
    }
    if (currentRotation != rotation) {
      uniforms.u_rotation = ['1f', rotation]
      currentRotation = rotation      
    }
    if (currentOpacity != opacity) {
      uniforms.u_opacity = ['1f', opacity]
      currentOpacity = opacity      
    }
    if (currentScale != scale) {
      uniforms.u_scale = ['1f', scale]
      currentScale = scale
    }

    Shader({
      attributes,
      uniforms
    })

    gl.drawArrays(gl.TRIANGLES, 0, mesh.length / 3)
  }
}