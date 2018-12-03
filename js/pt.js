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
	get mouse velocity
	get points that need to be affected
	move Points

	create noise field
	attract and repel ability
	UI stuff

*/


// CONSTANTS
var ASPECT = window.innerWidth / window.innerHeight;
var FOV = 70; var NEAR = 0.01; var FAR = 10;
var CONTAINER = document.querySelector('#container');

// GLOBALS
var sys, mouseVel;
var camera, scene, renderer, controls;
var geometry, material, points;

// storage class for many particles
class Particles {
	// takes source geometry
	constructor(geo) {
		// sprite to render points as
		this.texture = new THREE.TextureLoader().load( './data/disc.png' );
		this.color = "white" // color of particles
		this.geoScale = 1; // uniform scal used on geo
		this.size = .01;
		var material = new THREE.PointsMaterial({
	    color: this.color,
	    size: this.size,
			map: this.texture,
			transparent: true,
	    sizeAttenuation: true
	  });
		material.alphaTest = 0.5; // allows for alpha in sprite to not be rendered
    this.points = new THREE.Points(geo, material);
  }

	// testing function to animate points
	animatePoints(){
		var positions = this.points.geometry.attributes.position.array;
		var length = this.points.geometry.attributes.position.count/3;
		for(var i = 0; i < this.points.geometry.attributes.position.count; i+=3){
			positions[i]+= .01;
		}
		// for (var i =0; i < this.points.geometry.vertices.length; ++i){
		// 	this.points.geometry.vertices[i].x += .01;
		// }
		this.points.geometry.attributes.position.needsUpdate = true;
	}
	movePoints(sX, sY){
		var positions = this.points.geometry.attributes.position.array;
		sX/=1000.0; sY/=1000.0;
		for(var i = 0; i < this.points.geometry.attributes.position.count; i++){
			positions[i++] += sX;
			positions[i++] += sY;
			i++;
		}
		this.points.geometry.attributes.position.needsUpdate = true;
		console.log(sX,sY);
	}

	// update function called in render loop
	update(){
		// this.animatePoints();
	}

}

// FUNCTIONS
function init() {
	// init camera
	camera = new THREE.PerspectiveCamera( FOV, ASPECT,NEAR, FAR );
	camera.position.z = 1;
	// init controls
	controls = new THREE.OrbitControls( camera );
	controls.enableDamping = true;
	controls.dampingFactor = .9;
	// init mouse velocity
	mouseVel = new MouseSpeed();
	mouseVel.init(handleVelocity); // assign callback
	// init scene
	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0x333333 );
	// init geometry for testing
	geometry = new THREE.BoxGeometry( 0.2, 0.2, 0.2 );
	// init system
	loadModel("./data/bunnyLow.obj");
	// init renderer
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setSize( window.innerWidth, window.innerHeight );
	CONTAINER.appendChild( renderer.domElement );
}

// given object3D initialize system to its geometry
function initSystem(object, child=0){
	sys = new Particles(object.children[0].geometry);
	scene.add(sys.points);
}

// helper function to load a modle given its url path
function loadModel(model){
	var loader = new THREE.OBJLoader();

	loader.load(model,
		// called when resource is loaded
		function ( object ) {
			console.log(object);
			object.scale.x = object.scale.y = object.scale.z = 3;
			initSystem(object);
		},
		// called when loading is in progresses
		function ( xhr ) {
			console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
		},
		// called when loading has errors
		function ( error ) {
			console.log( 'An error happened loading ' + model );
		}
	);
}

// call back function that is executed on change of mouse velocity
function handleVelocity(){
	var speedX = mouseVel.speedX;
	var speedY = mouseVel.speedY;
	// do anything you want with speed values
	// sys.movePoints(speedX, speedY);
	// sys.animatePoints();
	// console.log(speedX, speedY);
}

// animated render loop
function animate() {
	requestAnimationFrame( animate );
	if (sys != null){
		sys.update();
	}
	controls.update();
	renderer.render( scene, camera );
}

// EXECUTION
init();
animate();
