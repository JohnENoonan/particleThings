// Source for particleThings
// work created by Zeana Llamas, Kalvin Janik, and John Noonan

// examples
// https://threejs.org/examples/webgl_points_sprites.html
// https://www.youtube.com/watch?v=i7DR_Cedbmc
// https://threejs.org/examples/webgl_interactive_points.html
// https://threejs.org/examples/webgl_interactive_raycasting_points.html
//https://threejs.org/examples/webgl_points_dynamic.html
// https://tympanus.net/Development/3d-particle-explorations/index8.html
// ui is http://workshop.chromeexperiments.com/examples/gui/#1--Basic-Usage
// https://stemkoski.github.io/Three.js/GUI-Controller.html


//TODO:
/*
	get points that need to be affected

	create noise field
	attract and repel ability
	UI stuff

*/

// CONSTANTS
var ASPECT = window.innerWidth / window.innerHeight;
var FOV = 80;
var NEAR = 0.01;
var FAR = 10;
var CONTAINER = document.querySelector('#container'); // html dom container

// GLOBALS
var sys; // particle system object
var mouseVel, raycaster, mousePos; // MouseSpeed object used to get mouse velocity
var camera, scene, renderer, controls;
var cube;


// Particle system object that stores particles as THREE.PointsMaterial
class Particles {
  // takes source geometry as THREE.Geometry.
  constructor(geo) {
    // sprite to render points as
    this.texture = new THREE.TextureLoader().load('./data/disc.png');
    this.color = "white" // color of particles
    this.geoScale = 1; // uniform scale used on geo
    this.spriteScale = .01; // scale of the sprite
    this.velocityScale = 1000.0; // divisor factor for velocity
    this.mouseRad = .001; // represented as squared distance
    var material = new THREE.PointsMaterial({
      color: this.color,
      size: this.spriteScale,
      map: this.texture,
      transparent: true,
      sizeAttenuation: true
    });
    material.alphaTest = 0.5; // allows for alpha in sprite to not be rendered
    this.points = new THREE.Points(geo, material); // points object that has particles
    this.points.scale.x = this.points.scale.y = this.points.scale.z = this.geoScale;
    this.points.name = "points object";
    this.points.geometry.name = "geo object";
    console.log(this.points.geometry);
  }

  // testing function to animate points
  animatePoints() {
    // moves model right on x axis
    for (var i = 0; i < this.points.geometry.vertices.length; ++i) {
      this.points.geometry.vertices[i].x += .001;
    }
    this.points.geometry.verticesNeedUpdate = true;
  }
  // testing to move points based on mouse movement
  movePoints(sX, sY) {
    // moves entire model according to mouse velocity
    sX /= this.velocityScale;
    sY /= this.velocityScale;
    for (var i = 0; i < this.points.geometry.vertices.length; ++i) {
      this.points.geometry.vertices[i].x += sX;
      this.points.geometry.vertices[i].y += sY;
    }
    this.points.geometry.verticesNeedUpdate = true;
  }
  // takes mouse position as vector3 and mouse velocity as vector2
  testMouse(mVec, mVel) {
    var mPos = new THREE.Vector3(); // mouse position based on camera
    var targetZ = 0; // what plane the mouse is in
    mVec.unproject(camera); // de project point
    mVec.sub(camera.position).normalize(); // get from origin
    // get position under mouse on plane targetZ
    var distance = (targetZ - camera.position.z) / mVec.z;
    // put in projected space
    mPos.copy(camera.position).add(mVec.multiplyScalar(distance));
    // console.log(mPos);
    var rotated = new THREE.Vector3();
    rotated.copy(mPos);

    rotated.applyQuaternion(camera.quaternion);
    console.log("ROTATED");
    console.log(rotated);
    // get affected vertices
    var verts = this.getAffectedPoints(mPos);
    mVel.divideScalar(this.velocityScale);

    var matrix = new THREE.Matrix4();
    matrix.extractRotation( camera.matrix );
    var camDirection = new THREE.Vector3( 0, 0, 1 );
    camDirection.applyMatrix4( matrix );
  }
  // return list of point indexes that should be affected by mouse
  // input is mouse in window coordinates
  getAffectedPoints(mPos) {

    // console.log(mPos);
    var affectedVerts = []; // list of verts that are within region
    for (var i = 0; i < this.points.geometry.vertices.length; ++i) {
      var vert = this.points.geometry.vertices[i];
      if (vert.distanceToSquared(mPos) < this.mouseRad) {
        affectedVerts.push(i);
      }
    }
    return affectedVerts;
  }

  affectVerts(verts, vel){
    vel.divideScalar(this.velocityScale);
    for (var i = 0; i < verts.length; ++i) {
      this.points.geometry.vertices[verts[i]].x += vel.x;
      this.points.geometry.vertices[verts[i]].y += vel.y;
      this.points.geometry.vertices[verts[i]].z += vel.z;
    }
    this.points.geometry.verticesNeedUpdate = true;
  }

}

// FUNCTIONS
function init() {
  // init camera
  camera = new THREE.PerspectiveCamera(FOV, ASPECT, NEAR, FAR);
  camera.position.z = 1;
  // init mouse velocity
  mouseVel = new MouseSpeed();
  mouseVel.init(handleVelocity); // assign callback
  // init scene
  // testing
  scene = new THREE.Scene();
  var axesHelper = new THREE.AxesHelper( 5 );
  scene.add( axesHelper );
  var m = new THREE.MeshBasicMaterial( {color: 0xffffff} );
  raycaster = new THREE.Raycaster();
  raycaster.params.Points.threshold = .02;
  mousePos = new THREE.Vector2();
  // cube = new THREE.Mesh( new THREE.BoxGeometry( .3, .3, .3 ), m );
  // scene.add( cube );
  scene.background = new THREE.Color(0x333333);
  // init system
  loadModel("./data/bunnyLow.obj");
  // init renderer
  renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  CONTAINER.appendChild(renderer.domElement);
  // init controls
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = .9;
  controls.enablePan = false;
}

// given THREE.Mesh initialize system to its geometry
function initSystem(object, child = 0) {
  // convert to geometry
  var geo = new THREE.Geometry().fromBufferGeometry(object.children[child].geometry);
  sys = new Particles(geo);
  scene.add(sys.points);
}

// helper function to load a modle given its url path
function loadModel(model) {
  var loader = new THREE.OBJLoader();

  loader.load(model,
    // called when resource is loaded
    function(object) {
      initSystem(object);
    },
    // called when loading is in progresses
    function(xhr) {
      console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    // called when loading has errors
    function(error) {
      console.log('An error happened loading ' + model);
    }
  );
}

function testingRay(mVec, mVel){
  raycaster.setFromCamera( mVec, camera );
	var intersects = raycaster.intersectObject(sys.points);
  if ( intersects.length) {
    var pos = sys.points.geometry.vertices[intersects[0].index];
    var verts = sys.getAffectedPoints(pos);
    sys.affectVerts(verts, mVel);
  }

}

// given mouse screen coordinates as vector3 return mouse pos in XYZ
function convertMouseToCamera(mVec){
  var mPos = new THREE.Vector3(); // mouse position based on camera
  var targetZ = 0; // what plane the mouse is in
  mVec.unproject(camera); // de project point
  mVec.sub(camera.position).normalize(); // get from origin
  // get position under mouse on plane targetZ
  var distance = (targetZ - camera.position.z) / mVec.z;
  // put in projected space
  mPos.copy(camera.position).add(mVec.multiplyScalar(distance));
  return mPos;
}

// return vector3 that points direction of camera
function getCamDir(){
  var camDirection = new THREE.Vector3(); // camera's view
  camera.getWorldDirection(camDirection);
  return camDirection;
}

// call back function that is executed on change of mouse velocity
function handleVelocity() {
  // var mVel = new THREE.Vector2(mouseVel.speedX, (-1) * mouseVel.speedY);
  var mVel = mouseVel.mVel;

  if (event != null) {
    var mVec = new THREE.Vector2((event.clientX / window.innerWidth) * 2 - 1,
																	-(event.clientY / window.innerHeight) * 2 + 1);
    // sys.testMouse(mVec, mVel);
    // console.log("cam = " );
    // console.log(camera.quaternion);
    // console.log("cube = " );
    // console.log(cube.quaternion);
    testingRay(mVec, mVel);
  }
}

// animated render loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

// EXECUTION
init();
animate();
