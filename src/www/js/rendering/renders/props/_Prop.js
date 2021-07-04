import { gl } from '../../gl.js'
import { createShader } from '../../shaders.js'
import { createArrayBuffer } from '../../buffers.js'

let Shader

export function createRender_Prop(mesh, normals, colors) {
  if (!Shader) {
    Shader = createShader({
      attributes: {
        a_vertex: 'vec4',
        a_normal: 'vec4',
        a_color: 'vec4',
        a_position: ['vec3'],
        a_rotation: ['float'],
        a_scale: ['float'],
        a_opacity: ['float'],
      },
      uniforms: {
        u_cameraView: 'mat4',
        u_sunRay: 'vec3',
      },
      varyings: {
        v_normal: 'vec4',
        v_color: 'vec4',
        v_opacity: 'float',
      },
      vertex: `
        void main() {
          vec3 worldPosition = a_position;
          float rotation = a_rotation;
          float scaling = a_scale;
          float opacity = a_opacity;

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

          gl_Position = a_vertex
            * rotate
            * scale
            * translate
            * u_cameraView;
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
    a_vertex: {
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
    a_position: {
      size: 3,
      type: gl.FLOAT,
      normalized: false,
      stride: 0,
      offset: 0,
      buffer: gl.createBuffer()
    },
    a_rotation: {
      size: 1,
      type: gl.FLOAT,
      normalized: false,
      stride: 0,
      offset: 0,
      buffer: gl.createBuffer()
    },
    a_scale: {
      size: 1,
      type: gl.FLOAT,
      normalized: false,
      stride: 0,
      offset: 0,
      buffer: gl.createBuffer()
    },
    a_opacity: {
      size: 1,
      type: gl.FLOAT,
      normalized: false,
      stride: 0,
      offset: 0,
      buffer: gl.createBuffer()
    },
  }

  const uniforms = {
    u_cameraView: null,
    u_sunRay: null,
  }

  let currentCameraView
  let currentSunRay
  return (cameraView, positions, sunRay, rotations, opacities, scales) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, attributes.a_position.buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.DYNAMIC_DRAW)

    gl.bindBuffer(gl.ARRAY_BUFFER, attributes.a_rotation.buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rotations), gl.DYNAMIC_DRAW)

    gl.bindBuffer(gl.ARRAY_BUFFER, attributes.a_scale.buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(scales), gl.DYNAMIC_DRAW)

    gl.bindBuffer(gl.ARRAY_BUFFER, attributes.a_opacity.buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(opacities), gl.DYNAMIC_DRAW)
      
    if (currentCameraView != cameraView) {
      uniforms.u_cameraView = ['Matrix4fv', false, cameraView]
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