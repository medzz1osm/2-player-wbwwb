Game.addToManifest({
	
	logo: "sprites/postcredits/logo.png",

	end_button: "sprites/postcredits/end_button.json"

});

function Scene_Post_Post_Credits() {
    var self = this;
    Scene.call(self);

    self.UNPAUSEABLE = true; // HACK.

    // Layers, yo.
    Game.stage.addChild(MakeSprite("blackout"));
    var cont = new PIXI.Container();
    Game.stage.addChild(cont);
    cont.visible = false;
    cont.addChild(MakeSprite("logo"));

    // Add the "replay this mess" button
    var isHovering = false;
    var replayButton = new PIXI.Container();
    replayButton.x = 480; // Adjust the x-coordinate as needed
    replayButton.y = 325; // Adjust the y-coordinate as needed
    cont.addChild(replayButton);

    var replayBg = MakeMovieClip("end_button");
    replayBg.anchor.x = replayBg.anchor.y = 0.5;
    replayButton.addChild(replayBg);

    var replayLabel = MakeMovieClip("end_button");
    replayLabel.anchor.x = replayLabel.anchor.y = 0.5;
    replayLabel.gotoAndStop(2); // Set the frame for "replay this mess"
    replayButton.addChild(replayLabel);

    // INTERACTIVITY for the "replay this mess" button
    replayButton.interactive = true;
    replayButton.mouseover = replayButton.touchstart = function () {
        isHovering = true;
        replayBg.gotoAndStop(1);
        Tween_get(replayButton.scale).to({ x: 1.05, y: 1.05 }, _s(0.2));
    };
    replayButton.mouseout = function () {
        isHovering = false;
        replayBg.gotoAndStop(0);
        Tween_get(replayButton.scale).to({ x: 1, y: 1 }, _s(0.2));
    };
    replayButton.mousedown = replayButton.touchend = function () {
        isHovering = false;
        Game.sounds.squeak.play();
        // Replace with your replay action
    };

    // CURSOR
    var cursor = new Cursor(self);
    var g = cursor.graphics;
    cont.addChild(g);
    g.scale.x = g.scale.y = 0.5;
    g.x = Game.width / 2;
    g.y = Game.height / 2;

    // TWEEN ANIM
    Tween_get(cont)
        .wait(_s(BEAT * 2))
        .call(function () {
            cont.visible = true;
        });

    // Update!
    self.update = function () {
        cursor.update(isHovering);
    };
}
