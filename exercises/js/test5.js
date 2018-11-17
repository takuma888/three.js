
var container;

var camera, scene, scene2, renderer, controls, light, refractSphereCamera, refractSphere;

var mesh, lightMesh, geometry;
var spheres = [];

var directionalLight, pointLight;

var mouseX = 0, mouseY = 0;

var mixers = [];

var clock = new THREE.Clock();

function MyModel(opt){

  this.path = opt.path;
  this.name = opt.name;
  this.scale = opt.scale || 1;
  this.scene = opt.scene || window.scene;
  this.object = null;
  this.onload = opt.onload || (()=>{});

  this.initialize();

}

Object.assign(MyModel.prototype, {

  onProgress: function ( xhr ) {
    if ( xhr.lengthComputable ) {
      let percentComplete = xhr.loaded / xhr.total * 100;
      console.log( Math.round( percentComplete, 2 ) + '% downloaded' );
    }
  },

  onError: function ( xhr ) {},

  initialize: function () {

    new THREE.MTLLoader()
      .setPath( this.path )
      .load( this.name + '.mtl', ( materials ) => {

        materials.preload();

        new THREE.OBJLoader()
          .setMaterials( materials )
          .setPath( this.path )
          .load( this.name + '.obj', ( object ) => {

            object.scale.x = object.scale.y = object.scale.z = this.scale;
            object.position.set(0,0,0);
            this.object = object;
            this.scene.add( object );
            this.onload && this.onload();


            object.traverse( function ( child ) {
              if ( child.isMesh ) {
                child.castShadow = true;
                child.receiveShadow = true;
              }
            } );

          }, this.onProgress, this.onError );

      } );

  }

});



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

  scene2 = new THREE.Scene();
  scene2.background = new THREE.Color( 0xa0a0a0 );
  scene2.background = new THREE.CubeTextureLoader()
    .setPath( 'assets/jpg/' )
    .load( [ 'panorama.right.jpg', 'panorama.left.jpg', 'panorama.up.jpg', 'panorama.down.jpg', 'panorama.front.jpg', 'panorama.back.jpg' ] );

  let geometry = new THREE.SphereBufferGeometry( 10, 64, 32 );
  let material = new THREE.MeshBasicMaterial( {
    color: 0xffffff, envMap: scene.background, refractionRatio: 0.9,
    side: THREE.BackSide,
  } );
  material.envMap.mapping = THREE.CubeRefractionMapping;
  let mesh = new THREE.Mesh( geometry, material );
  mesh.position.x = 0;
  mesh.position.y = 5;
  mesh.position.z = 0;
  mesh.scale.x = mesh.scale.y = mesh.scale.z = 1.15;
  scene.add( mesh );

  let geometry2 = new THREE.SphereBufferGeometry( 10, 64, 32 );
  let material2 = new THREE.MeshBasicMaterial( {
    color: 0xffffff, envMap: scene2.background,
    opacity: 0.1,
    premultipliedAlpha: true,
    transparent: true
  } );
  let mesh2 = new THREE.Mesh( geometry2, material2 );
  mesh2.position.x = 0;
  mesh2.position.y = 5;
  mesh2.position.z = 0;
  mesh2.scale.x = mesh2.scale.y = mesh2.scale.z = 1.15;
  scene.add( mesh2 );


  THREE.Loader.Handlers.add( /\.dds$/i, new THREE.DDSLoader() );

  // ground
  var mesh_ground = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2000, 2000 ), new THREE.MeshPhongMaterial( {
    color: 0x777766, depthWrite: false,
    side: THREE.doubleSide,
  } ) );
  mesh_ground.rotation.x = - Math.PI / 2;
  mesh_ground.receiveShadow = true;
  // scene.add( mesh_ground );

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
  // controls.maxPolarAngle = Math.PI * 0.49;


  document.body.addEventListener('touchmove', function (e) {
    e.preventDefault();
  }, {passive: false});


  let modelPath = 'assets/models/';

  let island = new MyModel({
    path: modelPath,
    name: 'island/island',
    scale: 0.164,
    onload: ()=>{

    }
  });

  let windmill = new MyModel({
    path: modelPath,
    name: 'windmill/windmill',
    scale: 0.1,
    onload: function() {
      this.object.position.set(-4,0,-3);
      this.object.rotation.set(0,Math.PI*0.2,0);
    }
  });

  let tree1 = new MyModel({
    path: modelPath,
    name: 'trees/tree1',
    scale: 0.1,
    onload: function() {
      this.object.position.set(0.5,0,-5);
      this.object.rotation.set(0,Math.PI*0.2,0);
    }
  });

  let tree2 = new MyModel({
    path: modelPath,
    name: 'trees/tree2',
    scale: 0.1,
    onload: function() {
      this.object.position.set(3.5,0,-4);
      this.object.rotation.set(0,Math.PI*0.2,0);
    }
  });

  let tree3 = new MyModel({
    path: modelPath,
    name: 'trees/tree3',
    scale: 0.1,
    onload: function() {
      this.object.position.set(6,0,-1.5);
      this.object.rotation.set(0,Math.PI*0.2,0);
    }
  });

  let tree4 = new MyModel({
    path: modelPath,
    name: 'trees/tree4',
    scale: 0.1,
    onload: function() {
      this.object.position.set(-5,0,2.5);
      this.object.rotation.set(0,Math.PI*0.2,0);
    }
  });

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

