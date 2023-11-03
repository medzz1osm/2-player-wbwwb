/**************************************

CAMERA:
The graphics & controls for this sucka

**************************************/

Game.addToManifest({

	cam_frame_2: "sprites/cam/cam copy.png",
	cam_flash_2: "sprites/cam/cam-flash.png",
	cam_instructions2: "sprites/cam/cam-instructions2.png",

	cam_snap_2: "sounds/cam_snap.mp3"

});

Camera2.WIDTH = Game.width/4;
Camera2.HEIGHT = Game.height/4;

function Camera2(scene, options){

	var self = this;
	options = options || {};

	// Properties
	self.scene = scene;
    self.x = Game.width/1.25;
    self.y = Game.height/2;
	self.width = Camera2.WIDTH;
	self.height = Camera2.HEIGHT;



	////////////////////////////////
	///// GRAPHICS /////////////////
	////////////////////////////////

	// MAIN CONTAINER
	self.graphics = new PIXI.Container();
	scene.graphics.addChild(self.graphics);

	// PHOTO
	self.photo = new PIXI.Container();
	self.graphics.addChild(self.photo);
	self.photoTexture = null;

	// FLASH, FRAME, INSTRUCTIONS
	var resources = PIXI.loader.resources;
	
	self.flash = new PIXI.Sprite(resources.cam_flash.texture);
	self.flash.scale.x = self.flash.scale.y = 0.5;
    self.flash.anchor.x = self.flash.anchor.y = 0.5;
    self.flash.alpha = 0;
    self.graphics.addChild(self.flash);
	
	self.frame = new PIXI.Sprite(resources.cam_frame_2.texture);
	self.frame.scale.x = self.frame.scale.y = 0.5;
    self.frame.anchor.x = self.frame.anchor.y = 0.5;
    self.graphics.addChild(self.frame);

	if(!options.noIntro){
	    self.instructions = new PIXI.Sprite(resources.cam_instructions2.texture);
		self.instructions.scale.x = self.instructions.scale.y = 0.5;
	    self.instructions.anchor.x = 0.5;
	    self.instructions.anchor.y = 0;
	    self.instructions.y = 67.5;
	    self.graphics.addChild(self.instructions);
	    self.instructions.alpha = 0;
	    Tween_get(self.instructions)
	    	.wait(_s(BEAT))
	    	.to({alpha:1}, _s(BEAT*0.5));
	}


	////////////////////////////////
	///// CONTROLS /////////////////
	////////////////////////////////

    // Controls!
	self.frozen = false;

	// Define key codes for WASD and E
	const KEY_up = 'ArrowUp';
	const KEY_left = 'ArrowLeft';
	const KEY_down = 'ArrowDown';
	const KEY_right = 'ArrowRight';
	const KEY_select = 'Shift';
	
	// Initialize variables for movement
	let isMovingUp = false;
	let isMovingLeft = false;
	let isMovingDown = false;
	let isMovingRight = false;
	
	// Event listener for keydown
	document.addEventListener('keydown', function (event) {
		if (self.frozen) return;
		switch (event.key) {
			case KEY_up:
				isMovingUp = true;
				break;
			case KEY_left:
				isMovingLeft = true;
				break;
			case KEY_down:
				isMovingDown = true;
				break;
			case KEY_right:
				isMovingRight = true;
				break;
			case KEY_select:
				// Handle taking a picture (you can add your logic here)
				self.takePhoto(); // Call the Camera's takePhoto method


				// ONLY ONCE. FREEZE.
				if(self.frozen) return;
				if(!options.streaming){
					self.frozen = true;
					scene.camera.frozen = true;
				}

				// Tell the director
				if(!options.streaming){
					scene.director.takePhoto(self);
				}

				// SOUND!
				if(self.noSounds) return;
				Game.sounds.cam_snap.play();

				break;
		}
	});
	
	// Event listener for keyup
	document.addEventListener('keyup', function (event) {
		if (self.frozen) return;
		switch (event.key) {
			case KEY_up:
				isMovingUp = false;
				break;
			case KEY_left:
				isMovingLeft = false;
				break;
			case KEY_down:
				isMovingDown = false;
				break;
			case KEY_right:
				isMovingRight = false;
				break;
		}
	});
	
	// Update function
	function update() {
		if (isMovingUp) {
			self.y -= 4; // Adjust the value to control the speed
		}
		if (isMovingLeft) {
			self.x -= 4; // Adjust the value to control the speed
		}
		if (isMovingDown) {
			self.y += 4; // Adjust the value to control the speed
		}
		if (isMovingRight) {
			self.x += 4; // Adjust the value to control the speed
		}
	
		// Call this function within your game loop or update loop
		requestAnimationFrame(update);
	}
	
	// Start the game loop
	update();
	



	/////////////////////////////////////
	///// PHOTO - TAKE, HIDE, RESET /////
	/////////////////////////////////////

	// Take Photo!
	self.takePhoto = function(){

		if(!options.streaming){

			// Just update that...
			self.updatePosition();

		    // Save the texture
		    self.photoTexture = self.getTexture();

		    // Make it part of my graphics
		    var photo = new PIXI.Sprite(self.photoTexture);
		    photo.anchor.x = photo.anchor.y = 0.5;
		    self.photo.removeChildren();
		    self.photo.addChild(photo);

		}

	    // Flash!
		self.flash.alpha = 1;
		Tween_get(self.flash).to({alpha:0}, _s(0.25));

		// Fade out instructions...
		if(!options.noIntro){
			var instr = self.instructions;
			if(instr.alpha>0){
				Tween_get(instr).to({alpha:0}, _s(BEAT*0.25));
	    	}
	    }

	    // Callback?
	    if(options.onTakePhoto){
	    	options.onTakePhoto();
	    }

	};

	// Get texture!
	var renderTexturePoolIndex = 0;
	var renderTexturePool = [
		new PIXI.RenderTexture(Game.renderer, self.width, self.height),
		new PIXI.RenderTexture(Game.renderer, self.width, self.height)
	];
	self.getTexture = function(){

		// TAKE THE TEXTURE!
	    var sw = self.width;
	    var sh = self.height;
	    var sx = self.x-sw/2;
	    var sy = self.y-sh/2;

	    var matrix = new PIXI.Matrix();
	    matrix.translate(-scene.graphics.x, -scene.graphics.y);
	    matrix.scale(1/scene.graphics.scale.x, 1/scene.graphics.scale.y);
	    matrix.translate(-sx,-sy);

	    var renderTexture = renderTexturePool[renderTexturePoolIndex];
	    renderTexture.render(scene.world.graphics, matrix); // TO DO: higher rez
	    renderTexturePoolIndex = (renderTexturePoolIndex+1)%renderTexturePool.length;

	    // Return texture!
	    return renderTexture;

	};

	// Hide Camera
	self.hide = function(){
		self.graphics.visible = false;
		self.photo.removeChildren();
	};

	// Reset Camera
	self.reset = function(){
		var g = self.graphics;
		g.scale.x = g.scale.y = 1;
		g.visible = true;
		self.frozen = false;
		self.updatePosition();
	};




	//////////////////////////
	///// UPDATE /////////////
	//////////////////////////

	// Update
	self.updatePosition = function(){
		
		// Constraints
	    if(self.x<self.width/2) self.x=self.width/1.99;
	    if(self.x>Game.width-self.width/2) self.x=Game.width-self.width/1.99;
	    if(self.y<self.height/2) self.y=self.height/1.99;
	    if(self.y>Game.height-self.height/2) self.y=Game.height-self.height/1.99;

	    // Container moves!
		self.graphics.x = self.x;
		self.graphics.y = self.y;

	};
	self.update = function(){
		if(!self.frozen) self.updatePosition();
	};

	// And that's all she wrote.
	self.update();




	//////////////////////////
	///// MISC CRAP //////////
	//////////////////////////

	self.isOverTV = function(smaller){
		var x = self.x;
		var y = self.y;
		var cx = Game.width/2;
		var cy = Game.height/2;
		var w = smaller ? 140 : self.width;
		var h = smaller ? 90 : self.height;
		var l = cx - w/2;
		var r = cx + w/2;
		var t = cy - h/2;
		var b = cy + h/2;
		return (l<x && x<r && t<y && y<b);
	};



};
