// Source for particleThings
// work created by Zeana Llamas, Kalvin Janik, and John Noonan

// CAMERA CONSTANTS
var ASPECT = window.innerWidth / window.innerHeight;
var FOV = 80;
var NEAR = 0.01;
var FAR = 4000;
var CONTAINER = document.querySelector('#container'); // html dom container

// GLOBALS
var sys; // particle system object
var mouseVel; // MouseSpeed object used to get mouse velocity
var raycaster; // raycaster object used to pick
var mouseScreen = new THREE.Vector2(); // mouse position in device coordinates
var camera, scene, renderer, controls; // THREE vars

// gui elements
var attractFlag, repelFlag, mouseFlag, returnsFlag, text, folder, gui, curColor,
    modelScale, particleScale, mouseScale, velScale, particalVel, returnVel,
    texture, modelChosen;
//Gui Parameters
var Parameters = function() {
  this.color = "#ffffff";
  this.geoscale = 1.0;
  this.spritescale = .005;
  this.model = "bunny";
  this.mouseradius = .001;
  this.particle = "disc";
  // movement variables
  this.velocityScale = 1000.0; // divisor factor for velocity
  this.forceSpeed = .03; // speed points are attracted/repelled
  this.returnSpeed = .01; // speed that the points use to return to original pos
  this.attract = false; // whether to have mouse attracttion on
  this.repel = false; // whether to have mouse repel on
  this.mouseDrag = true; // whether to have mouse dragging on
  this.returns = true; // whether to have particles go to rest position
};


// Particle system object that stores particles as THREE.PointsMaterial
// animation on points is done in here
class Particles {
  // takes source geometry as THREE.Geometry.
  constructor(geo) {
    // view variables
    this.texture = new THREE.TextureLoader().load('./data/' + text.particle + '.png');
    this.color = text.color; // color of particles
    this.geoScale = text.geoscale; // uniform scale used on geo
    this.spriteScale = text.spritescale; // scale of the sprite

    // movement variables
    this.velocityScale = text.velocityScale; // divisor factor for velocity
    this.mouseRad = text.mouseradius; // represented as squared distance
    this.forceSpeed = text.forceSpeed; // speed points are attracted/repelled
    this.returnSpeed = text.returnSpeed; // speed that the points use to return to original pos

    // flags
    this.attract = text.attract; // whether to have mouse attracttion on
    this.repel = text.repel; // whether to have mouse repel on
    this.mouseDrag = text.mouseDrag; // whether to have mouse dragging on
    this.returns = text.returns;
    // set material
    var material = new THREE.PointsMaterial({
      color: this.color,
      size: this.spriteScale,
      map: this.texture,
      transparent: true,
      sizeAttenuation: true
    });
    material.alphaTest = 0.5; // allows for alpha in sprite to not be rendered
    // set this.points object that has particles
    this.points = new THREE.Points(geo, material);
    this.points.scale.set(this.geoScale, this.geoScale, this.geoScale);
    this.points.name = "points object";
    this.points.geometry.name = "geo object";
    this.restP = deepCopy(this.points.geometry.vertices); // copy of original point position
  }

  // return list of point indexes that should be affected by mouse
  // input is Vector3 in world space
  getAffectedPoints(mPos) {
    var affectedVerts = []; // list of verts that are within region
    for (var i = 0; i < this.points.geometry.vertices.length; ++i) {
      var vert = this.points.geometry.vertices[i];
      if (vert.distanceToSquared(mPos) < this.mouseRad) {
        affectedVerts.push(i);
      }
    }
    return affectedVerts;
  }

  // edit vertices with indexs in list by adding mouse velocity
  mouseDragPoints(verts, vel, mVec) {
    vel.divideScalar(this.velocityScale); // scale velocity
    // get unit circle position of camera
    var camPos = new THREE.Vector3().copy(camera.position).normalize();
    // angle between x and z
    var angle = Math.atan2(camPos.x, camPos.z);
    for (var i = 0; i < verts.length; ++i) {
      // apply velocity components
      this.points.geometry.vertices[verts[i]].x += vel.x * Math.cos(angle);
      this.points.geometry.vertices[verts[i]].y += vel.y;
      this.points.geometry.vertices[verts[i]].z += -vel.x * Math.sin(angle);
    }
    this.points.geometry.verticesNeedUpdate = true;
  }

  // pull points from verts to center using forceSpeed
  attractPoints(verts, center) {
    for (var i = 0; i < verts.length; ++i) {
      var vert = this.points.geometry.vertices[verts[i]];
      // make sure not to move point if it is "on" center
      if (!vert.distanceToSquared(center) < .01) {
        var diff = new THREE.Vector3().subVectors(center, vert);
        vert.add(diff.multiplyScalar(this.forceSpeed));
      }
    }
    this.points.geometry.verticesNeedUpdate = true;
  }

  // push points from verts away from center using forceSpeed
  repelPoints(verts, center) {
    for (var i = 0; i < verts.length; ++i) {
      var vert = this.points.geometry.vertices[verts[i]];
      var diff = new THREE.Vector3().subVectors(vert, center);
      vert.add(diff.multiplyScalar(this.forceSpeed));
    }
    this.points.geometry.verticesNeedUpdate = true;
  }

  // send all points out from center
  blowupPoints() {
    var center = this.points.geometry.boundingSphere.center;
    var ran = range(0, this.points.geometry.vertices.length);
    this.repelPoints(ran, center);
  }

  // // interpolate given vert w/ noise field
  // noiseMove(vert){
  //
  // }

  // have point at index animate towards going back to rest position
  returnToRest(ind) {
    var vert = this.points.geometry.vertices[ind];
    var dist = vert.distanceToSquared(this.restP[ind]);
    // if points aren't in the same place
    if (!dist < .01) {
      var diff = new THREE.Vector3().subVectors(this.restP[ind], vert);
      var speed = this.returnSpeed;
      if (dist < 1) {
        speed *= 2;
      }
      vert.add(diff.multiplyScalar(speed));
    }
  }

  // render loop update called each frame
  update() {
    if (this.attract) {
      var mPosRay = getMouseFromRay(); // position of mouse from intersect
      if (mPosRay != null) {
        this.attractPoints(this.getAffectedPoints(mPosRay), mPosRay);
      }
    } else if (this.repel) {
      var mPosRay = getMouseFromRay(); // position of mouse from intersect
      if (mPosRay != null) {
        this.repelPoints(this.getAffectedPoints(mPosRay), mPosRay);
      }
    }
    if (this.returns) {
      for (var i = 0; i < this.restP.length; ++i) {
        this.returnToRest(i);
      }
      this.points.geometry.verticesNeedUpdate = true;
    }
  }
}

// initialize all elements and start listeners
function init() {
  // init camera
  camera = new THREE.PerspectiveCamera(FOV, ASPECT, NEAR, FAR);
  //set default cam angle
  camera.position.x = -0.08833024401844962;
  camera.position.y = 0.2913072428616853;
  camera.position.z = 0.2866399709945558;
  // init mouse velocity
  mouseVel = new MouseSpeed();
  mouseVel.init(handleVelocity); // assign callback
  // init scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x80dfff); //colored a la brionne blue
  // testing
  // var axesHelper = new THREE.AxesHelper( 5 );
  // scene.add( axesHelper );
  var m = new THREE.MeshBasicMaterial({
    color: 0xffffff
  });
  // init raycaster for picking
  raycaster = new THREE.Raycaster();
  raycaster.params.Points.threshold = .02;

  // init system
  loadModel("./data/bunny.obj");
  // init renderer
  renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  // init perfomrance stats
  stats = new Stats();
  stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
  document.body.appendChild(stats.dom);
  renderer.setSize(window.innerWidth, window.innerHeight);
  CONTAINER.appendChild(renderer.domElement);
  // init camera controls
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = .9;
  controls.enablePan = false;
  controls.maxPolarAngle = 2;
  controls.minPolarAngle = .8;


  text = new Parameters();
  gui = new dat.GUI();
  curColor = gui.addColor(text, "color");
  texture = gui.add(text, 'particle', ["disc", "stars", "donut", "prof", "bubble", "triangle", "unity", "gimble"]);
  modelScale = gui.add(text, 'geoscale', .01, 3);
  particleScale = gui.add(text, 'spritescale').min(.001).max(.03).step(.001);
  modelChosen = gui.add(text, 'model', ['bunny', 'bunnyLow', 'teapot', 'woman', 'castle', 'pointField']);
  mouseScale = gui.add(text, 'mouseradius', 0, .01);


  folder1 = gui.addFolder('Movement Variables');
  velScale = folder1.add(text, 'velocityScale').min(500).max(10000).step(100);
  particalVel = folder1.add(text, 'forceSpeed').min(.001).max(.05).step(.001);
  returnVel = folder1.add(text, 'returnSpeed').min(.001).max(.05).step(.001);

  folder2 = gui.addFolder('Flags');
  attractFlag = folder2.add(text, 'attract').listen();
  repelFlag = folder2.add(text, 'repel').listen();
  mouseFlag = folder2.add(text, 'mouseDrag');
  returnsFlag = folder2.add(text, 'returns');

}

// movement variables
// this.velocityScale = 1000.0; // divisor factor for velocity
// this.forceSpeed = .01; // speed points are attracted/repelled
// this.returnSpeed = .01; // speed that the points use to return to original pos

// given THREE.Mesh initialize system to its geometry
function initSystem(object, child = 0) {
  // convert to geometry
  var geo = new THREE.Geometry().fromBufferGeometry(object.children[child].geometry);
  sys = new Particles(geo);
  scene.add(sys.points);
  // gui update methods
  // toggle particle mouse attraction
  attractFlag.onChange(function(value) {
    sys.attract = text.attract;
    if (sys.repel == true && sys.attract == true) {
      sys.repel = false;
      text.repel = false;
      gui.repel = false;
    }
  });
  // toggle particle mouse repel
  repelFlag.onChange(function(value) {
    sys.repel = text.repel;
    if (sys.attract == true && sys.repel == true) {
      sys.attract = false;
      text.attract = false;
      gui.attract = false;
    }
  });
  // toggle mouse drag particles
  mouseFlag.onChange(function(value) {
    sys.mouseDrag = text.mouseDrag;
  });
  // toggle particles return to rest position
  returnsFlag.onChange(function(value) {
    sys.returns = text.returns;
  });
  // set effective mouse scale
  mouseScale.onChange(function(value) {
    sys.mouseRad = text.mouseradius;
  });
  // change the model
  modelChosen.onChange(function(value) {
    var model = "./data/" + value + ".obj";
    scene.remove(sys.points);
    sys = null;
    loadModel(model); // create new instance of sys
  });
  // set velocity scale
  velScale.onChange(function(value) {
    sys.velocityScale = text.velocityScale;
  });
  // set how strong the repulsion/attraction is
  particalVel.onChange(function(value) {
    sys.forceSpeed = text.forceSpeed;
  });
  // set how fast particles return to rest
  returnVel.onChange(function(value) {
    sys.returnSpeed = text.returnSpeed;
  });
  // set texture
  texture.onChange(function(value) {
    sys.texture = new THREE.TextureLoader().load('./data/' + value + '.png');
    console.log(value);
    sys.points.material.map = sys.texture;
    sys.points.material.needsUpdate = true;
  });
  // set sprite color
  curColor.onChange(function(value) {
    sys.color = new THREE.Color(parseInt(value.replace("#", "0x"), 16));
    sys.points.material.color.set(sys.color);
  });
  // set goemetry scale
  modelScale.onChange(function(value) {
    sys.geoscale = text.geoscale;
    sys.restP = deepCopy(sys.points.geometry.vertices);
    sys.points.scale.set(sys.geoscale, sys.geoscale, sys.geoscale);
  });
  // set particle scale
  particleScale.onChange(function(value) {
    sys.spritescale = text.spritescale;
    sys.points.material.size = sys.spritescale
  });
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

// function to create and return a deep copy of abritrary object
function deepCopy(o) {
  var output, v, key;
  output = Array.isArray(o) ? [] : {};
  for (key in o) {
    v = o[key];
    output[key] = (typeof v === "object") ? deepCopy(v) : v;
  }
  return output;
}

// get position of mouse based on first thing it intersects
// returns null if no intersects
function getMouseFromRay() {
  raycaster.setFromCamera(mouseScreen, camera);
  var intersects = raycaster.intersectObject(sys.points);
  if (intersects.length) {
    return sys.points.geometry.vertices[intersects[0].index];
  } else {
    return null;
  }
}

// given mouse screen coordinates as vector3 return mouse pos in XYZ
function convertMouseToCamera(mVec) {
  var mPos = new THREE.Vector3(); // mouse position based on camera
  var targetZ = 0; // what plane the mouse is in
  mVec.unproject(camera); // de-project point
  mVec.sub(camera.position).normalize(); // get from origin
  // get position under mouse on plane targetZ
  var distance = (targetZ - camera.position.z) / mVec.z;
  // put in projected space
  mPos.copy(camera.position).add(mVec.multiplyScalar(distance));
  return mPos;
}

// return vector3 that points direction of camera
function getCamDir() {
  var camDirection = new THREE.Vector3(); // camera's view
  camera.getWorldDirection(camDirection);
  return camDirection;
}

// create list of range [start,...,end-1]
function range(start, end) {
  return (new Array(end - start)).fill(undefined).map((_, i) => i + start);
}

// call back function that is executed on change of mouse velocity
function handleVelocity() {
  var mVel = mouseVel.mVel;
  if (event != null) {
    // update mouse position
    mouseScreen.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1);
    // if mouse should drag points
    if (sys.mouseDrag) {
      // get mouse 3D position from intersect
      var mPos = getMouseFromRay();
      if (mPos) {
        var verts = sys.getAffectedPoints(mPos);
        sys.mouseDragPoints(verts, mVel, mPos);
      }
    }
  }
}

// animated render loop
function animate() {
  stats.begin();
  controls.update();
  if (sys) {
    sys.update();
  }
  renderer.render(scene, camera);
  stats.end();
  requestAnimationFrame(animate);
}
// EXECUTION
if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
  alert("ParticleThings is not made to work with mobile devices. Sorry about that.");
}
init();
animate();
