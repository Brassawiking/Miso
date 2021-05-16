import { createShader } from '../../shaders.js'
import { createArrayBuffer } from '../../buffers.js'

export function createRender_StoneTablet(gl) {
  const Shader = createShader(gl, {
    attributes: {
      vertexPosition: 'vec4',
      a_normal: 'vec4',
      a_color: 'vec4',
    },
    uniforms: {
      cameraView: 'mat4',
      worldPosition: 'vec3',
      u_sunRay: 'vec3',
    },
    varyings: {
      v_normal: 'vec4',
      v_color: 'vec4',
    },
    vertex: `
      void main() {
        mat4 toWorldSpace = mat4(
          1.0, 0, 0, worldPosition.x,
          0, 1.0, 0, worldPosition.y,
          0, 0, 1.0, worldPosition.z,
          0, 0, 0, 1.0
        );

        v_normal = a_normal;
        v_color = a_color;
        gl_Position = vertexPosition 
          * toWorldSpace
          * cameraView;
      }
    `,
    fragment: `
      void main() {
        float light = dot(-normalize(u_sunRay), normalize(v_normal.xyz));
        fragment = vec4((v_color * max(light, 0.4)).rgb, v_color.a);
      }
    `
  })

  const root = -0.5
  const width = 1
  const height = 1.5
  const depth = 0.1
  const mesh = [
    -width, root, -depth,
    width, root, -depth,
    width, height, 0,

    -width, root, -depth,
    width, height, 0,
    -width, height, 0,

    -width, root, depth,
    width, root, depth,
    width, height, 0,

    -width, root, depth,
    width, height, 0,
    -width, height, 0,

    -width, root, -depth,
    -width, root, depth,
    -width, height, 0,

    width, root, -depth,
    width, root, depth,
    width, height, 0,
  ]
  const positionBuffer = createArrayBuffer(gl, mesh)

  const frontNormal = [0, 0.1, -1]
  const backNormal = [0, 0.1, 1]
  const leftNormal = [-1, 0, 0]
  const rightNormal = [1, 0, 0]
  const normalBuffer = createArrayBuffer(gl, [
    ...frontNormal,
    ...frontNormal,
    ...frontNormal,

    ...frontNormal,
    ...frontNormal,
    ...frontNormal,

    ...backNormal,
    ...backNormal,
    ...backNormal,
   
    ...backNormal,
    ...backNormal,
    ...backNormal,

    ...leftNormal,
    ...leftNormal,
    ...leftNormal,

    ...rightNormal,
    ...rightNormal,
    ...rightNormal,
  ])

  const stoneColor = [0.95, 0.96, 0.85, 1]
  const colorBuffer = createArrayBuffer(gl, [
    ...stoneColor,
    ...stoneColor,
    ...stoneColor,

    ...stoneColor,
    ...stoneColor,
    ...stoneColor,

    ...stoneColor,
    ...stoneColor,
    ...stoneColor,

    ...stoneColor,
    ...stoneColor,
    ...stoneColor,

    ...stoneColor,
    ...stoneColor,
    ...stoneColor,

    ...stoneColor,
    ...stoneColor,
    ...stoneColor,
  ])

  const attributes = {
    vertexPosition: {
      size: 3,
      type: gl.FLOAT,
      normalized: false,
      stride: 0,
      offset: 0,
      buffer: positionBuffer
    },
    a_normal: {
      size: 3,
      type: gl.FLOAT,
      normalized: false,
      stride: 0,
      offset: 0,
      buffer: normalBuffer
    },
    a_color: {
      size: 4,
      type: gl.FLOAT,
      normalized: false,
      stride: 0,
      offset: 0,
      buffer: colorBuffer
    },
  }

  const uniforms = {
    cameraView: null,
    worldPosition: null,
    u_sunRay: null,
  }

  let currentCameraView
  let currentPosition
  let currentSunRay
  return (cameraView, position, sunRay) => {
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

    Shader({
      attributes,
      uniforms
    })

    gl.drawArrays(gl.TRIANGLES, 0, mesh.length)
  }
}