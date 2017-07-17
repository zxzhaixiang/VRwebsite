var camera, scene, renderer;
var geometry, material, mesh;

init();
animate();

function init() {


    clock = new THREE.Clock();

	effect = undefined;
	
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.001, 100000);
    camera.position.set(5,4,2);
	//camera.position.set(-5,15,5);
    scene = new THREE.Scene();
	
	var manager = new THREE.LoadingManager();
	manager.onProgress = function(item,loaded,total){
		console.log(item,loaded,total);
	};
	
	var texture = new THREE.Texture();
	
	var onProgress = function ( xhr ) {
		if ( xhr.lengthComputable ) {
			var percentComplete = xhr.loaded / xhr.total * 100;
			console.log( Math.round(percentComplete, 2) + '% downloaded' );
		}
	};

	var onError = function ( xhr ) {
	};
	

	var loader = new THREE.ImageLoader( manager );
    loader.load(
	//  	'model/puppy3-101.jpg', 
	  	'model/Field_301.jpg', 
	//	'model/field201.jpg', 
		function ( image ) {
			texture.image = image;
			texture.needsUpdate = true;
		}
	);

	var loader = new THREE.OBJLoader(manager);
	
	loader.load(
	//	'model/puppy3-1.obj',
		'model/Field_3.obj',
		//'model/field2.obj',
		function(object){
			object.children[0].material.map = texture;
			object.rotation.x = -Math.PI/2;
			object.rotation.z= -Math.PI/2*0.8;
			scene.add(object);
		}, onProgress, onError);
	
	var ambient = new THREE.AmbientLight( 0xffffff );
	scene.add( ambient );


	
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setPixelRatio(window.devicePixelRatio);
	//renderer.setClearColor( 0xaaaaaa, 1 );
	element = renderer.domElement;
	container = document.body;
    container.appendChild(element);
	
	window.addEventListener( 'resize', onWindowResize, false );
	window.addEventListener( 'dblclick', change2Stereo, false );

		
	//rendermanager = new WebVRManager(renderer, effect);

		

	//var is_mobile= /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
		
	//is_mobile = false;//true;
	//if (is_mobile){
		
	//	controls = new THREE.VRControls(camera);
	//}	else {
	controls = new THREE.OrbitControls(camera);
	controls.target.set(camera.position.x+ 0.2 , camera.position.y, camera.position.z+0.05);
	controls.rotateSpeed = 1.5;
	controls.zoomSpeed = 2;
	controls.panSpeed = 2;

	controls.enableZoom  = true;
	controls.enablePan  = true;

	controls.enableDamping  = false;
	controls.dampingFactor = 100;

	controls.keys = [ 65, 83, 68 ];
	
	
		
	function setOrientationControls(e) {
		if (!e.alpha) {
			return;
		}
	  
/* 		effect = new THREE.StereoEffect(renderer);
		effect.setSize(window.innerWidth, window.innerHeight);
 */
		controls = new THREE.DeviceOrientationControls(camera, true);
		controls.connect();
		controls.update();

		element.addEventListener('click', fullscreen, false);

		window.removeEventListener('deviceorientation', setOrientationControls, true);
	  
	}

	window.addEventListener('deviceorientation', setOrientationControls, true);

	var sunpos = initsky();
	
	//var dirLight = new THREE.DirectionalLight( 0xffffff, 0.75);
	//dirLight.position.set( 10, 10, 10).normalize();

	
}

function change2Stereo(){
	
	if (effect===undefined){
		//	effect = new THREE.VREffect(renderer);
		effect = new THREE.StereoEffect(renderer);
		effect.setSize(window.innerWidth, window.innerHeight);
	} else {
		effect = undefined;
	    renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.render(scene,camera);

	}

}


  function fullscreen() {
	if (container.requestFullscreen) {
	  container.requestFullscreen();
	} else if (container.msRequestFullscreen) {
	  container.msRequestFullscreen();
	} else if (container.mozRequestFullScreen) {
	  container.mozRequestFullScreen();
	} else if (container.webkitRequestFullscreen) {
	  container.webkitRequestFullscreen();
	}
  }
  
function initsky(){
	sky = new THREE.Sky();
	scene.add( sky.mesh );
// Add Sun Helper
	sunSphere = new THREE.Mesh(
		new THREE.SphereBufferGeometry( 2000, 16, 8 ),
		new THREE.MeshBasicMaterial( { color: 0xffffee } )
	);
	
	
	var uniforms = sky.uniforms;
	uniforms.turbidity.value = 2;
	uniforms.rayleigh.value = 2;
	uniforms.mieCoefficient.value = 0.005;
	uniforms.mieDirectionalG.value = 0.8;
	uniforms.luminance.value = 0.9;
	
	
	var theta = Math.PI *0.8;
	var phi = 2 * Math.PI * 0.35;

	var distance = 50000;

	sunSphere.position.x = distance * Math.cos( phi );
	sunSphere.position.y = distance * Math.sin( phi ) * Math.sin( theta );
	sunSphere.position.z = distance * Math.sin( phi ) * Math.cos( theta );	

	sunSphere.visible = true;
	scene.add( sunSphere );
	
	sky.uniforms.sunPosition.value.copy( sunSphere.position );
	
	return sunSphere.position;

}
  
function onWindowResize(){
	camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
	
	
	if (effect===undefined){
		renderer.setSize( window.innerWidth, window.innerHeight );
	} else {
		effect.setSize( window.innerWidth, window.innerHeight );
	}
	
}


function animate() {

    var delta = clock.getDelta();
	
	controls.update(delta);
	
    requestAnimationFrame(animate);
	
	if (effect===undefined){
		renderer.render(scene,camera);
	} else {
		effect.render(scene,camera);
	}
	
}