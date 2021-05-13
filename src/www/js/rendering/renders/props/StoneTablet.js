import { createShader } from '../../shaders.js'
import { createArrayBuffer } from '../../buffers.js'

export function createRender_StoneTablet(gl) {
  const Shader = createShader(gl, {
    attributes: {
      vertexPosition: 'vec4',
      a_color: 'vec4'
    },
    uniforms: {
      cameraView: 'mat4',
      worldPosition: 'vec3'
    },
    varyings: {
      v_color: 'vec4'
    },
    vertex: `
      void main() {
        mat4 toWorldSpace = mat4(
          1.0, 0, 0, worldPosition.x,
          0, 1.0, 0, worldPosition.y,
          0, 0, 1.0, worldPosition.z,
          0, 0, 0, 1.0
        );

        v_color = a_color;
        gl_Position = vertexPosition 
          * toWorldSpace
          * cameraView;
      }
    `,
    fragment: `
      void main() {
        fragment = v_color;
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

  const stoneColor = [0.75, 0.76, 0.65, 1]
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
    a_color: {
      size: 4,
      type: gl.FLOAT,
      normalized: false,
      stride: 0,
      offset: 0,
      buffer: colorBuffer
    }
  }

  const uniforms = {
    cameraView: null,
    worldPosition: null
  }

  let currentCameraView
  let currentPosition
  return (cameraView, position) => {
    if (currentCameraView != cameraView) {
      uniforms.cameraView = ['Matrix4fv', false, cameraView]
      currentCameraView = cameraView
    }
    if (currentPosition != position) {
      uniforms.worldPosition = ['3f', ...position]
      currentPosition = position
    }

    Shader({
      attributes,
      uniforms
    })

    gl.drawArrays(gl.TRIANGLES, 0, mesh.length)
  }
}