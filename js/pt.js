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
	move Points

	create noise field
	attract and repel ability
	UI stuff

*/


// CONSTANTS
var ASPECT = window.innerWidth / window.innerHeight;
var FOV = 80; var NEAR = 0.01; var FAR = 10;
var CONTAINER = document.querySelector('#container'); // html dom container

// GLOBALS
var sys; // particle system object
var mouseVel; // MouseSpeed object used to get mouse velocity
var camera, scene, renderer, controls;


// Particle system object that stores particles as THREE.PointsMaterial
class Particles {
	// takes source geometry as THREE.Geometry.
	constructor(geo) {
		// sprite to render points as
		this.texture = new THREE.TextureLoader().load( './data/disc.png' );
		this.color = "white" // color of particles
		this.geoScale = 1; // uniform scale used on geo
		this.spriteScale = .01; // scale of the sprite
		this.velocityScale = 1000.0; // divisor factor for velocity
		var material = new THREE.PointsMaterial({
	    color: this.color,
	    size: this.spriteScale,
			map: this.texture,
			transparent: true,
	    sizeAttenuation: true
	  });
		material.alphaTest = 0.5; // allows for alpha in sprite to not be rendered
    this.points = new THREE.Points(geo, material); // points object that has particles
		console.log(this.points);
		this.points.scale.x = this.points.scale.y = this.points.scale.z = this.geoScale;
  }

	// testing function to animate points
	animatePoints(){
		// moves model right on x axis
		for (var i = 0; i < this.points.geometry.vertices.length; ++i){
			this.points.geometry.vertices[i].x += .001;
		}
		this.points.geometry.verticesNeedUpdate = true;
	}
	// testing to move points based on mouse movement
	movePoints(sX, sY){
		// moves entire model according to mouse velocity
		sX/=this.velocityScale; sY/=this.velocityScale;
		for (var i = 0; i < this.points.geometry.vertices.length; ++i){
			this.points.geometry.vertices[i].x += sX;
			this.points.geometry.vertices[i].y += sY;
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
	controls.enableDamping = true;
	controls.dampingFactor = .9;
	// init mouse velocity
	mouseVel = new MouseSpeed();
	mouseVel.init(handleVelocity); // assign callback
	// init scene
	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0x333333 );
	// init system
	loadModel("./data/bunnyLow.obj");
	// init renderer
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setSize( window.innerWidth, window.innerHeight );
	CONTAINER.appendChild( renderer.domElement );
}

// given Mesh initialize system to its geometry
function initSystem(object, child=0){
	// convert to geometry
	var geo = new THREE.Geometry().fromBufferGeometry( object.children[0].geometry );
	sys = new Particles(geo);
	console.log(sys.points.geometry);
	scene.add(sys.points);
}

// helper function to load a modle given its url path
function loadModel(model){
	var loader = new THREE.OBJLoader();

	loader.load(model,
		// called when resource is loaded
		function ( object ) {
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
	var speedY = (-1)*mouseVel.speedY; // negate to fix to y inversion
	// do anything you want with speed values
	sys.movePoints(speedX, speedY);
	// sys.animatePoints();
}

// animated render loop
function animate() {
	requestAnimationFrame( animate );
	controls.update();
	renderer.render( scene, camera );
}

// EXECUTION
init();
animate();
