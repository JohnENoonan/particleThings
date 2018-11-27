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
var camera, scene, renderer;
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
	constructor(geo, mat) {
    this.points = new THREE.Points(geo, mat);
  }

}

// FUNCTIONS
function init() {

	camera = new THREE.PerspectiveCamera( FOV, ASPECT,NEAR, FAR );
	camera.position.z = 1;

	scene = new THREE.Scene();

	geometry = new THREE.BoxGeometry( 0.2, 0.2, 0.2 );
	// material = new THREE.MeshNormalMaterial();
	material = new THREE.PointsMaterial({
            color: "yellow",
            size: 5,
            sizeAttenuation: false
        });

	sys = new Particles(geometry, material);
	scene.add(sys.points);

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setSize( window.innerWidth, window.innerHeight );
	CONTAINER.appendChild( renderer.domElement );

}

function animate() {

	requestAnimationFrame( animate );

	for (var i =0; i < sys.points.geometry.vertices.length; ++i){
		sys.points.geometry.vertices[i].x += .01;
	}
	sys.points.geometry.verticesNeedUpdate = true;
	// console.log(scene);
	renderer.render( scene, camera );
}

// EXECUTION
init();
animate();
