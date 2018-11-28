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

// orbit control tumbles


// CONSTANTS
var ASPECT = window.innerWidth / window.innerHeight;
var FOV = 70; var NEAR = 0.01; var FAR = 10;
var CONTAINER = document.querySelector('#container');

// GLOBALS
var sys;
var camera, scene, renderer, controls;
var geometry, material, mesh, points;

// CLASSES
// // data type for one single particle
// class Particle{
// 	// constuctor takes: starting position of point,
// 	constuctor(origPos){
// 		this.pos;
// 		this.size = 1;
// 		this.vel = new THREE.Vector3
// 		this.restP = origPos;
// 		this.pos = this.restP;
// 	}
//
// }
// storage class for many particles
class Particles {
	// takes source geometry and material
	constructor(geo, mat) {
    this.points = new THREE.Points(geo, mat);
  }

	animatePoints(){
		for (var i =0; i < this.points.geometry.vertices.length; ++i){
			this.points.geometry.vertices[i].x += .01;
		}
		this.points.geometry.verticesNeedUpdate = true;
	}

}

// FUNCTIONS
function init() {
	// init camera
	camera = new THREE.PerspectiveCamera( FOV, ASPECT,NEAR, FAR );
	camera.position.z = 1;
	// init controls
	controls = new THREE.OrbitControls( camera );
	// controls.enableDamping(true);
	// controls.dampingFactor(.5);
	// init scene
	scene = new THREE.Scene();
	geometry = new THREE.BoxGeometry( 0.2, 0.2, 0.2 );
	material = new THREE.PointsMaterial({
            color: "yellow",
            size: 5,
            sizeAttenuation: false
        });
	// init system
	sys = new Particles(geometry, material);
	scene.add(sys.points);
	// init renderer
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setSize( window.innerWidth, window.innerHeight );
	CONTAINER.appendChild( renderer.domElement );
}

// animated render loop
function animate() {
	requestAnimationFrame( animate );
	//sys.animatePoints();
	controls.update();
	renderer.render( scene, camera );
}

// EXECUTION
init();
animate();
