let camera, scene, renderer;
let geometry, material, mesh;

init();
animate();

function init(){

  let ratio = window.innerWidth / window.innerHeight;

  geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
  material = new THREE.MeshNormalMaterial();
  mesh = new THREE.Mesh(geometry, material);

  scene = new THREE.Scene();
  scene.add(mesh);

  camera = new THREE.PerspectiveCamera(70, ratio, 0.01, 10);
  camera.position.z = 1;

  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

}

function animate() {

  requestAnimationFrame(animate);

  mesh.rotation.x += 0.01;
  // mesh.rotation.y += 0.02;

  renderer.render(scene, camera);

}