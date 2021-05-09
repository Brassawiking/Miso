import { createShader } from '../shaders.js'
import { createArrayBuffer } from '../buffers.js'

export function createRender_Tree(gl) {
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

  const rootLevel = -0.5
  const treeHeight = 10;
  const mesh = [
    -0.5, rootLevel, 0,
    0.5, rootLevel, 0,
    0, treeHeight, 0,

    0, rootLevel, -0.5,
    0, rootLevel, 0.5,
    0, treeHeight, 0,

    -2, treeHeight, -2,
    2, treeHeight-2, -2,
    2, treeHeight, 2,

    -2, treeHeight, -2,
    2, treeHeight, 2,
    -2, treeHeight-2, 2,
  ]
  const positionBuffer = createArrayBuffer(gl, mesh)
  const trunkColor = [97/255, 59/255, 22/255, 1]
  const leafColor = [0.76, 0.04, 0.31, 0.8]
  const colorBuffer = createArrayBuffer(gl, [
    ...trunkColor,
    ...trunkColor,
    ...trunkColor,

    ...trunkColor,
    ...trunkColor,
    ...trunkColor,
    
    ...leafColor,
    ...leafColor,
    ...leafColor,

    ...leafColor,
    ...leafColor,
    ...leafColor,
  ])

  return (cameraView, position) => {
    Shader({
      attributes: {
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
      },
      uniforms: {
        cameraView: ['Matrix4fv', false, cameraView],
        worldPosition: ['3f', ...position]
      }
    })

    gl.drawArrays(gl.TRIANGLES, 0, mesh.length)
  }
}