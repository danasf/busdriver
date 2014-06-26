/*
_____________  _________    __________________________    __________________ 
___  __ )_  / / /_  ___/    ___  __ \__  __ \___  _/_ |  / /__  ____/__  __ \
__  __  |  / / /_____ \     __  / / /_  /_/ /__  / __ | / /__  __/  __  /_/ /
_  /_/ // /_/ / ____/ /     _  /_/ /_  _, _/__/ /  __ |/ / _  /___  _  _, _/ 
/_____/ \____/  /____/      /_____/ /_/ |_| /___/  _____/  /_____/  /_/ |_|  
  

 Bus Driver 1.0                                                                            
 Coded at Hacker School, Summer 2014, by Dana Sniezko
 
 Much gratitude and inspiration c/o Mary Rose Cook's Space Invaders live coding demo 
 https://github.com/maryrosecook/spaceinvaders/blob/master/game.js

 GPL v3


 Sounds:


*/

;(function() {


	/**
	* GAME
	**/
	function Game (canvasId) {
		var canvas = document.getElementById(canvasId);
		var screen = canvas.getContext('2d');
		var size = { x: canvas.width, y: canvas.height };
		this.gameSize = size;
		this.speedY = 0.1;
		this.bg = new Background(this);

		// create bodies array to hold player, obstacles etc
		this.bodies = [];

		// add player to bodies
		this.bodies = this.bodies.concat(new Player(this,size));
		this.bodies = this.bodies.concat(new Car(this,size));
		this.bodies = this.bodies.concat(createWalkers(this,size));
		this.images = { 
			player: "",
			pedestrian: new Image()
		};

		this.images.pedestrian.src = './images/stick.png';


		// add obstacles
		//this.bodies = this.bodies.concat(createObstacles(this));

		var self = this;

		var tick = function() {
			self.update();

			self.draw(screen,size);

			requestAnimationFrame(tick);
		}

		tick();


	};

	// runs and updates game logic

	Game.prototype.update = function() {
		var self = this;

		this.bg.update();

		var isTimeToMakeWalker = function() {
			var randVal = Math.round(Math.random()*100);
	   		if(randVal > 96) {
	   			//console.log("New pedestrian!");
	  			//console.log(self,self.gameSize);
				self.bodies.push(new Pedestrian(self,self.gameSize));
				self.bodies.push(new Car(self,self.gameSize));
	   		}
		};

		var notCollidingWithAnything = function(b1) {
			return self.bodies.filter(function(b2) { return colliding(b1,b2); } ).length === 0;
		};


   		// get rid of things that are no longer on the canvas
   		this.bodies = this.bodies.filter(function(e) {
   			return e.center.y < self.gameSize.y && e.center.x < self.gameSize.x+10 && e.center.x > -1;
   		});

   		// check for collisions
   		this.bodies = this.bodies.filter(notCollidingWithAnything);

   		// update bodies
		for(var i = 0; i < this.bodies.length; i++) {
   	    	this.bodies[i].update();
   		}
   		//console.log(this.bodies.length,"Things on the board");

		isTimeToMakeWalker();
	};

	// draws game elements
	Game.prototype.draw = function(screen,size) {
		screen.clearRect(0,0,size.x,size.y);
		drawBG(screen,this.bg);

		for(var i = 0; i < this.bodies.length; i++) {
			if(this.bodies[i].type == "ped") {
				drawImg(screen,this.bodies[i],this.images.pedestrian);
			} 
			else if(this.bodies[i].type == "car") {
				drawRect(screen,this.bodies[i],"#ff0000");

			}
			else {
				drawRect(screen,this.bodies[i],"#ffffff");
			}
		}
		document.getElementById('speed').innerHTML = Math.round(this.speedY)*10;

	};


	/** 
    * PEDS
    **/
    function Pedestrian(game,gameSize) {
    	this.game = game;
    	this.gameSize = gameSize;
    	this.type="ped";
    	var startX= Math.round(Math.random())*gameSize.x;
    	var startY= Math.floor(Math.random()*gameSize.y)+30;
		this.center = { x:startX, y:startY  };
		this.size = { x:10, y:10 };
		this.velocity = Math.round(Math.random()*2+0.5,3);

    }

    Pedestrian.prototype.update = function () {

    	// if out of bounds reverse! 

    	if(this.center.x < 0 || this.center.x > this.gameSize.x) {
    		this.velocity = -this.velocity;
    		console.log("walk speed changes",this.walkSpeed);
    	}
    	this.center.y += this.game.speedY;
    	this.center.x += this.velocity;
    };


	/** 
    * Cars
    **/
/*    function Car(game,gameSize) {
    	this.game = game;
    	this.gameSize = gameSize;
    	this.type="car";
    	var startX= Math.round(Math.random())*100;
		this.center = { x:100, y:300  };
		this.size = { x:30, y:30 };
		console.log("Car created!");
		console.log(this);

    }

    Car.prototype.update = function () {
    	console.log(car)
    	// if out of bounds reverse! 
    	//this.center.y -= 0.1;
    	console.log("Car center",this.center.y);
    };*/
    function Car(game,gameSize) {
    	this.game = game;
    	this.gameSize = gameSize;
    	this.type="car";
 		var startX= Math.round(Math.random()*gameSize.x,3);
    	//var startY= Math.floor(Math.random()*gameSize.y)+30;
		var startY = 0;
		this.center = { x:startX, y:startY  };
		this.size = { x:30, y:40 };
		this.velocity = Math.round(Math.random()*5+0.5,3);

    }

    Car.prototype.update = function () {

    	if(this.center.x < 0 || this.center.x > this.gameSize.x) {
    		this.velocity = -this.velocity;
    		console.log("walk speed changes",this.walkSpeed);
    	}
    	var speed = this.velocity-this.game.speedY;
    	this.center.y -= (speed > -1) ? speed : -1 ;
    	//this.center.x += this.velocity;
    };




	/** 
    * Background
    **/
    function Background(game) {
    	this.game = game;
    	this.type="bg";
		this.offset = { x:0, y:0 };    
		this.center = { x:100, y:300  };

    }

    Background.prototype.update = function () {

    	if(this.offset.y > 600) {
    		this.offset.y = 0;
    	} else { 
    		this.offset.y += this.game.speedY; 
    	}
    	// if out of bounds reverse! 
    };




	/**
	* PLAYER
	**/

	function Player(game,gameSize) {
		this.game = game;
		this.size = { x:30, y:80 };
		// center x= half of gamesize, y game height -this plus some padding
		this.center = { x:gameSize.x/2, y: gameSize.y - this.size.y *2 };

		this.keys = new Keyboarder();
	};

	Player.prototype.update = function() {
		if(this.keys.isDown(this.keys.KEYS.LEFT)) {
			this.center.x -= 2;
		} 
		else if(this.keys.isDown(this.keys.KEYS.RIGHT)) {
			this.center.x += 2;
		} 
		else if(this.keys.isDown(this.keys.KEYS.UP)) {
			this.game.speedY += this.game.speedY < 10 ? 0.1 : 0;
		} 
		else if(this.keys.isDown(this.keys.KEYS.DOWN)) {
			this.game.speedY -= this.game.speedY > 0 ? 0.1 : 0;
		} 
		else if(this.keys.isDown(this.keys.KEYS.SPACE)) {
			console.log("HONK!!!!!!!!");
		} 
	};


	/**
	* Keyboard states
	**/

	function Keyboarder() {

		var keyState = {};

		window.onkeydown = function(e) {
			keyState[e.keyCode] = true;
		};

		window.onkeyup = function(e) {
			keyState[e.keyCode] = false;
		}

		this.isDown = function(keyCode) {
			return keyState[keyCode] === true;
		}

		// basic keycodes to map
		this.KEYS = { LEFT: 37, RIGHT: 39,UP: 38, DOWN: 40, SPACE: 32 };
	};


	/**
	* HELPERS and LOGIC
	**/


	// returns true if bodies are colliding
	// from https://github.com/maryrosecook/spaceinvaders/blob/master/game.js
	// 1. b1 is the same body as b2.
 	// 2. Right of `b1` is to the left of the left of `b2`.
  	// 3. Bottom of `b1` is above the top of `b2`.
  	// 4. Left of `b1` is to the right of the right of `b2`.
  	// 5. Top of `b1` is below the bottom of `b2`.
	function colliding (b1,b2) {
		return !(
			b1 === b2 
			|| b1.center.x + b1.size.x / 2 < b2.center.x -b2.size.x / 2 
	        || b1.center.y + b1.size.y / 2 < b2.center.y - b2.size.y / 2 
	        || b1.center.x - b1.size.x / 2 > b2.center.x + b2.size.x / 2 
	        || b1.center.y - b1.size.y / 2 > b2.center.y + b2.size.y / 2
		);
	};

	// create some pedestrians to start
	function createWalkers(game,size) {
		var walkers = [];

		for (var i = 0; i < 5; i++) {
			walkers.push(new Pedestrian(game,size));
			walkers.push(new Car(game,size));

		};

		return walkers;

	};

	// draw the body rectangle 
	function drawRect(screen,body,color) {
		screen.fillStyle = color;
		screen.fillRect(body.center.x - body.size.x / 2, body.center.y - body.size.y / 2,body.size.x, body.size.y);
		screen.fill();
	};

	function drawImg(screen,body,img) {
		
		/*img.onload = function() {
		};*/
		if(body.velocity < 0 ) { 
			
		}
		screen.drawImage(img,body.center.x - body.size.x / 2, body.center.y - body.size.y / 2);
	}

	// draw the background and that nonsense
	function drawBG(screen,body) {
		// draw street
		screen.fillStyle = "#333333";
		screen.fillRect(0,0,600,600);

		// draw grassy sides
		screen.fillStyle = "#00ff00";
		screen.fillRect(0,0,30,body.game.gameSize.y);
		screen.fillRect(body.game.gameSize.x,0,300,body.game.gameSize.y);

		for(var i=1; i < 5; i++ ) {


			screen.beginPath();
			screen.strokeStyle = "#ffff00";

			screen.setLineDash([10,5]);
			screen.moveTo((100*i),0+body.offset.y);
	        screen.lineTo((100*i),body.game.gameSize.y);
	        screen.stroke();
	        //console.log(body.offset.y);
	        screen.moveTo((100*i),body.offset.y-5);
	        screen.lineTo((100*i),0);
	  	    screen.stroke();
		}
		
	}



	// when DOM is ready start the game!
	window.onload = function() {
		new Game("drawing");
	};

})();