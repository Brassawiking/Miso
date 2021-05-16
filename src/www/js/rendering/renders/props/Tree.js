import { createShader } from '../../shaders.js'
import { createArrayBuffer } from '../../buffers.js'

export function createRender_Tree(gl) {
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

  const rootLevel = -0.5
  const rootWidth = -0.25
  const treeHeight = 10;
  const mesh = [
    // front
    -rootWidth, rootLevel, -rootWidth,
    rootWidth, rootLevel, -rootWidth,
    0, treeHeight, 0,

    // back
    -rootWidth, rootLevel, rootWidth,
    rootWidth, rootLevel, rootWidth,
    0, treeHeight, 0,

    // left
    -rootWidth, rootLevel, -rootWidth,
    -rootWidth, rootLevel, rootWidth,
    0, treeHeight, 0,

    // right
    rootWidth, rootLevel, -rootWidth,
    rootWidth, rootLevel, rootWidth,
    0, treeHeight, 0,

    // right leaves
    -2, treeHeight, -2,
    2, treeHeight-2, -2,
    2, treeHeight, 2,

    // left leaves
    -2, treeHeight, -2,
    2, treeHeight, 2,
    -2, treeHeight-2, 2,
  ]
  const positionBuffer = createArrayBuffer(gl, mesh)

  const frontLeft =     [-1, 0.3, -1]
  const front =         [ 0, 0.3, -1]
  const frontRight =    [ 1, 0.3, -1]
  const backLeft =      [-1, 0.3,  1]
  const back =          [ 0, 0.3,  1]
  const backRight =     [ 1, 0.3,  1]
  const left =          [-1, 0.3,  0]
  const right =         [ 1, 0.3,  0]
  const up           =  [ 0,   1,  0]
  const frontRightUp =  [ 1,   1, -1]
  const backLeftUp =    [-1,   1,  1]
  const normalBuffer = createArrayBuffer(gl, [
    ...frontLeft,
    ...frontRight,
    ...front,

    ...backLeft,
    ...backRight,
    ...back,

    ...frontLeft,
    ...backLeft,
    ...left,
   
    ...frontRight,
    ...backRight,
    ...right,

    ...up,
    ...frontRightUp,
    ...up,

    ...up,
    ...up,
    ...backLeftUp,
  ])

  const trunkColor = [0.48, 0.33, 0.19, 1]
  const leafColor = [0.76, 0.04, 0.31, 0.8]
  const colorBuffer = createArrayBuffer(gl, [
    ...trunkColor,
    ...trunkColor,
    ...trunkColor,

    ...trunkColor,
    ...trunkColor,
    ...trunkColor,
    
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
    }
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

    gl.drawArrays(gl.TRIANGLES, 0, mesh.length / 3)
  }
}