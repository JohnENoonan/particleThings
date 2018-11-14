// Source for particleThings
// work created by Zeana Llamas, Kalvin Janik, and John Noonan

// constants
var ASPECT = window.innerWidth / window.innerHeight;
var FOV = 70; var NEAR = 0.01; var FAR = 10;
var CONTAINER = document.querySelector('#container');

// globals
var camera, scene, renderer;
var geometry, material, mesh;

init();
animate();

function init() {

	camera = new THREE.PerspectiveCamera( FOV, ASPECT,NEAR, FAR );
	camera.position.z = 1;

	scene = new THREE.Scene();

	geometry = new THREE.BoxGeometry( 0.2, 0.2, 0.2 );
	material = new THREE.MeshNormalMaterial();

	mesh = new THREE.Mesh( geometry, material );
	scene.add( mesh );

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setSize( window.innerWidth, window.innerHeight );
	CONTAINER.appendChild( renderer.domElement );

}

function animate() {

	requestAnimationFrame( animate );

	mesh.rotation.x += 0.01;
	mesh.rotation.y += 0.02;

	renderer.render( scene, camera );

}
