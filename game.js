// canvas
var canvas, ctx;
function startCanvas() {
  canvas = document.getElementById("game");
  ctx = canvas.getContext("2d");
  loadImages();
}

function updateCanvas() {
  canvas.width = 900;
  canvas.height = 470;
}

var shipImg, alienImg;
function loadImages() {
  shipImg = new Image();
  alienImg = new Image();

  shipImg.src = "images/ship.png";
  alienImg.src = "images/alien.png";
}

function Ship(x, y, laserColor, defenderOrInvader) {
  this.x = x;
  this.y = y;
  this.laserY = this.y;
  this.laserX = this.x;
  this.defenderOrInvader = defenderOrInvader;
  this.limits = -50;
  this.alive = true;
  this.shooting = false;
  this.movingRight = false;
  this.movingLeft = false;
  this.moveSpeed = 20;
  this.laserSpeed = 5;
  this.laserColor = laserColor;
  if (defenderOrInvader === "invader") {
    this.limits *= -10;
    this.laserSpeed *= -1;
  }
  this.moveLeft = function () {
    if (this.movingLeft === true) {
      this.x -= this.moveSpeed;
      if (!this.shooting) {
        this.laserX = this.x;
      }
    }
  };

  this.stopShoot = function () {
    this.laserY = this.y;
    this.laserX = this.x;
    this.shooting = false;
  };

  this.moveRight = function () {
    if (this.movingRight === true) {
      this.x += this.moveSpeed;
      if (!this.shooting) {
        this.laserX = this.x;
      }
    }
  };
  this.defendershoot = function () {
    if (this.shooting) {
      if (this.laserY >= this.limits) {
        ctx.fillStyle = this.laserColor;
        ctx.fillRect(this.laserX + 27.3, this.laserY, 5, 40);
        this.laserY -= this.laserSpeed;
      } else {
        this.stopShoot();
      }
    }
  };

  this.invadershoot = function () {
    if (this.shooting) {
      if (this.laserY < this.limits) {
        ctx.fillStyle = this.laserColor;
        ctx.fillRect(this.laserX + 23.5, this.laserY + 30, 5, 40);
        this.laserY -= this.laserSpeed;
      } else {
        this.stopShoot();
      }
    }
  };
}
function drawImg(img, x, y) {
  ctx.drawImage(img, 0, 0, 512, 512, x, y, 60, 60);
}

// hiting
function hitBox(x1, x2, hitBoxX, y1, y2, hitBoxY) {
  if (
    Math.abs(distance(x1, x2)) <= hitBoxX &&
    Math.abs(distance(y1, y2)) <= hitBoxY
  ) {
    return true;
  }
  return false;
}

var shipLives = 3;
function laserColapse() {
  for (var i = 0; i < aliens.length; i++) {
    if (
      hitBox(
        ship.laserX,
        aliens[i].laserX,
        10,
        ship.laserY,
        aliens[i].laserY,
        50
      ) &&
      aliens[i].shooting &&
      ship.shooting
    ) {
      ship.stopShoot();
      aliens[i].stopShoot();
    }
    if (
      hitBox(ship.laserX, aliens[i].x, 30, ship.laserY, aliens[i].y, 50) &&
      aliens[i].alive
    ) {
      aliens[i].alive = false;
      ship.stopShoot();
      aliensCopy.pop();
      if (aliensCopy.length < 1) {
        aliens = [...aliensCopy];
      }
    }
    if (hitBox(ship.x, aliens[i].laserX, 30, ship.y, aliens[i].laserY, 40)) {
      aliens[i].stopShoot();
      shipLives -= 1;
      if (shipLives < 1) {
        console.log("game over");
      }
    }
  }
}

// alien logic
var aliens = [];
var aliensCopy;
function spawn() {
  if (aliens.length < 1) {
    var x = 100;
    var y = 50;
    for (var i = 1; i < 22; i++) {
      var newAlien = new Ship(x, y, "white", "invader");
      newAlien.movingRight = true;
      newAlien.moveSpeed = 5;
      aliens.push(newAlien);
      x += 100;
      if (i % 7 == 0) {
        y += 70;
        x = 100;
      }
    }
    aliensCopy = [...aliens];
  }
}

var shoot = 0;
function alienShoot() {
  if (aliens[shoot].shooting) {
    aliens[shoot].invadershoot();
  } else {
    for (var i = 0; i < aliens.length - 1; i++) {
      var random = Math.floor(Math.random() * 150) + 1;
      if (random == 5 && aliens[i].alive) {
        aliens[i].shooting = true;
        shoot = i;
      }
    }
  }
}

function distance(x1, x2) {
  return x1 - x2;
}

function drawAliens() {
  for (var i = 0; i < aliens.length; i++) {
    if (aliens[i].alive) {
      drawImg(alienImg, aliens[i].x, aliens[i].y);
    }
  }
}

function aliensMove() {
  for (var i = 0; i < aliens.length; i++) {
    if (distance(aliens[i].x, 50) < 0 && aliens[i].alive) {
      for (var b = 0; b < aliens.length; b++) {
        aliens[b].movingRight = true;
        aliens[b].movingLeft = false;
      }
    } else if (distance(800, aliens[i].x) < 0 && aliens[i].alive) {
      for (var b = 0; b < aliens.length; b++) {
        aliens[b].movingLeft = true;
        aliens[b].movingRight = false;
        if (aliens.length > 1) {
          if (distance(aliens[i].y, aliens[i - 1].y) == 0) {
            aliens[i].x = aliens[i - 1].x + 100;
          }
        }
      }
    }
    aliens[i].moveRight();
    aliens[i].moveLeft();
  }
}

// ship logic
var ship = new Ship(450, 400, "red", "defender");
ship.movingLeft = true;
ship.movingRight = true;
function shipActions(key) {
  switch (key) {
    case 37:
    case 65:
      ship.moveLeft();
      break;
    case 68:
    case 39:
      ship.moveRight();
      break;
    case 81:
      ship.shooting = true;
      break;
    default:
      console.log(key);
  }
}

// main function
function main() {
  updateCanvas();
  drawImg(shipImg, ship.x, ship.y);
  ship.defendershoot();
  spawn();
  aliensMove();
  drawAliens();
  alienShoot();
  laserColapse();
}
// loop
var divsToremove = document.querySelectorAll("#top-container .ufo-div");
var titleDiv = document.querySelector("#title-div");
var playButton = document.querySelector("#playButton");
playButton.addEventListener("click", function () {
  document.querySelector("#top-container h1").innerHTML =
    "Use 'a' and 'd' or '←' and '→' to move and 'q' to shoot";
  for (var i = 0; i < divsToremove.length; i++) {
    divsToremove[i].remove();
  }
  playButton.disabled = true;
  playButton.classList.add("hide");

  titleDiv.classList.remove("col-4");
  titleDiv.classList.add("col-8");

  var FPS = 20;
  setInterval(main, 1000 / FPS);

  document.addEventListener("keydown", function (event) {
    shipActions(event.keyCode);
  });
});
