// Heavily stolen + adapted from
// https://github.com/mrdoob/three.js/blob/master/examples/webgl_points_waves.html

const SEPARATION = 75,
  AMOUNTX = 100,
  AMOUNTY = 100

let container, stats
let camera, scene, renderer

let particles,
  count = 0

let mouseX = 0,
  mouseY = 0

let windowHalfX = window.innerWidth / 2
let windowHalfY = window.innerHeight / 2

init()
animate()

function init() {
  container = document.querySelector('div.waves')

  scene = new THREE.Scene()

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 750, 4000)
  camera.position.set(-2000, -200, -2000)
  camera.lookAt(scene.position)
  camera.position.y += 500

  const numParticles = AMOUNTX * AMOUNTY

  const positions = new Float32Array(numParticles * 3)
  const scales = new Float32Array(numParticles)

  let i = 0,
    j = 0

  for (let ix = 0; ix < AMOUNTX; ix++) {
    for (let iy = 0; iy < AMOUNTY; iy++) {
      positions[i] = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2 // x
      positions[i + 1] = 0 // y
      positions[i + 2] = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2 // z

      scales[j] = 1

      i += 3
      j++
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1))

  const material = new THREE.ShaderMaterial({
    uniforms: {
      color: { value: new THREE.Color(0x3d6aff) }
    },
    vertexShader: `
      attribute float scale;

      void main() {
        vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );

        gl_PointSize = scale * ( 300.0 / - mvPosition.z );

        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 color;

      void main() {
        if ( length( gl_PointCoord - vec2( 0.5, 0.5 ) ) > 0.475 ) discard;

        gl_FragColor = vec4( color, 1.0 );
      }
    `
  })

  particles = new THREE.Points(geometry, material)
  scene.add(particles)

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  container.appendChild(renderer.domElement)

  container.style.touchAction = 'none'

  window.addEventListener('resize', onWindowResize)
}

function onWindowResize() {
  windowHalfX = window.innerWidth / 2
  windowHalfY = window.innerHeight / 2

  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight)
}

function animate() {
  requestAnimationFrame(animate)

  render()
}

function render() {
  const positions = particles.geometry.attributes.position.array
  const scales = particles.geometry.attributes.scale.array

  let i = 0,
    j = 0

  for (let ix = 0; ix < AMOUNTX; ix++) {
    for (let iy = 0; iy < AMOUNTY; iy++) {
      positions[i + 1] = Math.sin((ix + count) * 0.3) * 25 + Math.sin((iy + count) * 0.5) * 25

      scales[j] = (Math.sin((ix + count) * 0.3) + 1) * 5 + (Math.sin((iy + count) * 0.5) + 1) * 5

      i += 3
      j++
    }
  }

  particles.geometry.attributes.position.needsUpdate = true
  particles.geometry.attributes.scale.needsUpdate = true

  renderer.render(scene, camera)

  count += 0.1
}
