

var container;

var camera, scene, renderer, controls, light, refractSphereCamera, refractSphere;

var mesh, lightMesh, geometry;
var spheres = [];

var directionalLight, pointLight;

var mouseX = 0, mouseY = 0;

var mixers = [];

var clock = new THREE.Clock();

init();
animate();

function init() {

  container = document.createElement( 'div' );
  document.body.appendChild( container );

  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
  camera.position.z = 40;
  camera.position.y = 5;

  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0xa0a0a0 );
  scene.background = new THREE.CubeTextureLoader()
    .setPath( 'assets/jpg/' )
    .load( [ 'panorama.right.jpg', 'panorama.left.jpg', 'panorama.up.jpg', 'panorama.down.jpg', 'panorama.front.jpg', 'panorama.back.jpg' ] );
  scene.fog = new THREE.Fog( 0xa0a0a0, 20, 100 );

  var geometry = new THREE.SphereBufferGeometry( 10, 128, 128 );
  var material = new THREE.MeshBasicMaterial( {
    color: 0xffffff, envMap: scene.background, refractionRatio: 0.9,
    side: THREE.BackSide,
  } );
  material.envMap.mapping = THREE.CubeRefractionMapping;
  var mesh = new THREE.Mesh( geometry, material );
  mesh.position.x = 0;
  mesh.position.y = 5;
  mesh.position.z = 0;
  mesh.scale.x = mesh.scale.y = mesh.scale.z = 1;
  scene.add( mesh );
  spheres.push( mesh );


  // model
  var loader = new THREE.FBXLoader();
  let model_path = '';
  loader.load( '../examples/models/fbx/Samba Dancing.fbx', function ( object ) {

    object.mixer = new THREE.AnimationMixer( object );
    mixers.push( object.mixer );

    var action = object.mixer.clipAction( object.animations[ 0 ] );
    action.play();

    object.traverse( function ( child ) {
      if ( child.isMesh ) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    } );

    object.scale.x = object.scale.y = object.scale.z = 0.05;
    // object.scale.x = object.scale.y = object.scale.z = 1;
    object.position.set(0,0,0);
    scene.add( object );

  } );

  // ground
  var mesh_ground = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2000, 2000 ), new THREE.MeshPhongMaterial( {
    color: 0x777766, depthWrite: false,
    side: THREE.doubleSide,
  } ) );
  mesh_ground.rotation.x = - Math.PI / 2;
  mesh_ground.receiveShadow = true;
  scene.add( mesh_ground );

  var grid = new THREE.GridHelper( 2000, 20, 0x000000, 0x000000 );
  grid.material.opacity = 0.2;
  grid.material.transparent = true;
  scene.add( grid );

  light = new THREE.HemisphereLight( 0xffffff, 0x444444 );
  light.position.set( 0, 200, 0 );
  scene.add( light );

  light = new THREE.DirectionalLight( 0xffffff );
  light.position.set( 0, 200, 100 );
  light.castShadow = true;
  light.shadow.camera.top = 180;
  light.shadow.camera.bottom = -100;
  light.shadow.camera.left = -120;
  light.shadow.camera.right = 120;
  light.shadowMapWidth = 4096;
  light.shadowMapHeight = 4096;
  scene.add( light );




  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.shadowMap.enabled = true;
  container.appendChild( renderer.domElement );

  window.addEventListener( 'resize', onWindowResize, false );

  controls = new THREE.OrbitControls( camera, renderer.domElement );

  controls.enableZoom = false;
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.rotateSpeed = - 0.25;
  controls.dampingFactor = 0.15;
  controls.maxPolarAngle = Math.PI * 0.49;


  document.body.addEventListener('touchmove', function (e) {
    e.preventDefault();
  }, {passive: false});

}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

  requestAnimationFrame( animate );

  render();

}

function render() {

  var timer = 0.0001 * Date.now();

  controls.update();


  if ( mixers.length > 0 ) {

    for ( var i = 0; i < mixers.length; i ++ ) {

      mixers[ i ].update( clock.getDelta() );

    }

  }

  renderer.render( scene, camera );

}

