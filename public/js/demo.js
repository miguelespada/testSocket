var acc = [0, 0, 0];

var DEMO = {

	ms_Canvas: null,
	ms_Renderer: null,
	ms_Camera: null, 
	ms_Scene: null, 
	ms_Controls: null,
	ms_Water: null,
	ms_Canoa: null,
	ms_Time: null,
	ms_stats: null,
	ms_socket: null,


    enable: (function enable() {
        try {
            var aCanvas = document.createElement('canvas');
            return !! window.WebGLRenderingContext && (aCanvas.getContext('webgl') || aCanvas.getContext('experimental-webgl'));
        }
        catch(e) {
            return false;
        }
    })(),

	
	initialize: function initialize(inIdCanvas) {
		this.ms_Canvas = $('#'+inIdCanvas);
		
		// Initialize Renderer, Camera and Scene
		this.ms_Renderer = this.enable? new THREE.WebGLRenderer() : new THREE.CanvasRenderer();
		this.ms_Canvas.html(this.ms_Renderer.domElement);
		this.ms_Scene = new THREE.Scene();
		
		this.ms_Camera = new THREE.PerspectiveCamera(55.0, WINDOW.ms_Width / WINDOW.ms_Height, 0.5, 3000000);
		this.ms_Camera.position.set(0, 300, -100);
		this.ms_Camera.lookAt(new THREE.Vector3(0, 0, 0));
		
		// Initialize Orbit control		
		this.ms_Controls = new THREE.OrbitControls(this.ms_Camera, this.ms_Renderer.domElement);
	
		// Add light
		var directionalLight = new THREE.DirectionalLight(0xffff55, 1);
		directionalLight.position.set(0, 500, 1000);
		this.ms_Scene.add(directionalLight);
		
		// Load textures		
		var waterNormals = new THREE.ImageUtils.loadTexture('/img/waternormals.jpg');
		waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping; 
		
		// Create the water effect
		this.ms_Water = new THREE.Water(this.ms_Renderer, this.ms_Camera, this.ms_Scene, {
			textureWidth: 256,
			textureHeight: 256,
			waterNormals: waterNormals,
			alpha: 	1.0,
			sunDirection: directionalLight.position.normalize(),
			sunColor: 0xffffff,
			waterColor: 0x001e0f,
			betaVersion: 0,
			side: THREE.DoubleSide
		});
		var aMeshMirror = new THREE.Mesh(
			new THREE.PlaneBufferGeometry(6000, 4000, 10, 10), 
			this.ms_Water.material
		);
		aMeshMirror.add(this.ms_Water);
		aMeshMirror.rotation.x = - Math.PI * 0.5;
		//aMeshMirror.rotation.z = Math.PI * 0.5;
		
		this.ms_Scene.add(aMeshMirror);

		// create a cube
        var cubeGeometry = new THREE.BoxGeometry(40, 20, 80);
        var cubeMaterial = new THREE.MeshPhongMaterial({color: 'red'});
        this.ms_Canoa = new THREE.Mesh(cubeGeometry, cubeMaterial);

        this.ms_Canoa.castShadow = true;

        var canoa = this.ms_Canoa;

        // add the cube to the scene
        this.ms_Scene.add(this.ms_Canoa);

	
		this.loadSkyBox();

		this.ms_Time = 0;

		this.ms_socket = io();

  		this.ms_socket.on('acc', function(msg){

		    acc =  [Math.floor(msg[0]), Math.floor(msg[1]), Math.floor(msg[2])];
		    var quaternion = new THREE.Quaternion();
			var a = new THREE.Euler( acc[0], acc[1], acc[2], 'XYZ' );
			quaternion.setFromEuler(a);

			//var canoaQuaternion = canoa.quaternion;
			//canoaQuaternion.multiplyQuaternions(quaternion, canoaQuaternion);
			//canoaQuaternion.normalize();
			canoa.setRotationFromQuaternion(quaternion);
		    console.log(msg);
	    });

        this.ms_stats = new Stats();
        this.ms_stats.setMode(0);

        this.ms_stats.domElement.style.position = 'absolute';
        this.ms_stats.domElement.style.left = '0px';
        this.ms_stats.domElement.style.top = '0px';

        document.body.appendChild( this.ms_stats.domElement );		

	},
	
	loadSkyBox: function loadSkyBox() {
		var aCubeMap = THREE.ImageUtils.loadTextureCube([
		  '/img/px.jpg',
		  '/img/nx.jpg',
		  '/img/py.jpg',
		  '/img/ny.jpg',
		  '/img/pz.jpg',
		  '/img/nz.jpg'
		]);
		aCubeMap.format = THREE.RGBFormat;

		var aShader = THREE.ShaderLib['cube'];
		aShader.uniforms['tCube'].value = aCubeMap;

		var aSkyBoxMaterial = new THREE.ShaderMaterial({
		  fragmentShader: aShader.fragmentShader,
		  vertexShader: aShader.vertexShader,
		  uniforms: aShader.uniforms,
		  depthWrite: false,
		  side: THREE.BackSide
		});

		var aSkybox = new THREE.Mesh(
		  new THREE.BoxGeometry(1000000, 1000000, 1000000),
		  aSkyBoxMaterial
		);
		
		this.ms_Scene.add(aSkybox);
	},

    display: function display() {
		this.ms_Water.render();
		this.ms_Renderer.render(this.ms_Scene, this.ms_Camera);
		document.getElementById("Acceleration").innerHTML = acc.toString();
	},
	
	update: function update() {
		this.ms_Time += 0.007;
		this.ms_Water.material.uniforms.time.value += 1.0 / 60.0;
		this.ms_Controls.update();
		//console.log(noise.perlin2(this.ms_Time, 1));


		// this.ms_Canoa.rotation.x = -2 * Math.PI * acc[1] / 360; //noise.perlin2(this.ms_Time, 1) * Math.PI * 0.02;
		// this.ms_Canoa.rotation.y = 2 * Math.PI * acc[0] / 360;
		// this.ms_Canoa.rotation.z = 2 * Math.PI * acc[2] / 360; //noise.perlin2(this.ms_Time, 2) * Math.PI * 0.02;

		this.display();
		this.ms_stats.update();
		//console.log(acc);

	},
	
	resize: function resize(inWidth, inHeight) {
		this.ms_Camera.aspect =  inWidth / inHeight;
		this.ms_Camera.updateProjectionMatrix();
		this.ms_Renderer.setSize(inWidth, inHeight);
		this.ms_Canvas.html(this.ms_Renderer.domElement);
		this.display();
	}

};