var score = 0;
var lives = 3;
var gameOver = false;
var gameWon = false;
var gameStarted = false;
var frame = 0;

var swarmDX = 0.35;
var swarmX = 0;
var swarmY = 0;
var swarmDropping = false;
var swarmDropLeft = 0;
var swarmSpeedMul = 1;

var cannonX = 185;
var cannonY = 365;
var cannonSpeed = 5;

var bulletActive = false;
var bulletX = 0;
var bulletY = 0;
var bulletSpeed = 14;
var shootCooldown = 0;

var eb0active = false;
var eb0x = 0;
var eb0y = 0;
var eb0spd = 2;
var eb0type = 0;

var eb1active = false;
var eb1x = 0;
var eb1y = 0;
var eb1spd = 2;
var eb1type = 0;

var eb2active = false;
var eb2x = 0;
var eb2y = 0;
var eb2spd = 2;
var eb2type = 0;

var fireTimer = 0;

// shield blocks - 4 shields with 6 blocks each = 24 total
var shieldX = [];
var shieldY = [];
var shieldHP = [];

var pos0 = 30;
var pos1 = 115;
var pos2 = 210;
var pos3 = 295;

var si = 0;
for (var sc = 0; sc < 3; sc++) {
  for (var sr = 0; sr < 2; sr++) {
    shieldX[si] = pos0 + sc * 14;
    shieldY[si] = 338 + sr * 14;
    shieldHP[si] = 3;
    si++;
  }
}
for (var sc = 0; sc < 3; sc++) {
  for (var sr = 0; sr < 2; sr++) {
    shieldX[si] = pos1 + sc * 14;
    shieldY[si] = 338 + sr * 14;
    shieldHP[si] = 3;
    si++;
  }
}
for (var sc = 0; sc < 3; sc++) {
  for (var sr = 0; sr < 2; sr++) {
    shieldX[si] = pos2 + sc * 14;
    shieldY[si] = 338 + sr * 14;
    shieldHP[si] = 3;
    si++;
  }
}
for (var sc = 0; sc < 3; sc++) {
  for (var sr = 0; sr < 2; sr++) {
    shieldX[si] = pos3 + sc * 14;
    shieldY[si] = 338 + sr * 14;
    shieldHP[si] = 3;
    si++;
  }
}

var bonusActive = false;
var bonusX = -60;
var bonusY = 32;
var bonusPoints = 300;
var bonusTimer = 0;

// aliens - 11 cols and 5 rows = 55 aliens
var COLS = 11;
var ROWS = 5;

var alienX = [];
var alienY = [];
var alienAlive = [];
var alienRow = [];
var alienAnim = [];
var alienPts = [];

for (var r = 0; r < ROWS; r++) {
  for (var c = 0; c < COLS; c++) {
    var ai = r * COLS + c;
    alienX[ai] = 20 + c * 32;
    alienY[ai] = 68 + r * 28;
    alienAlive[ai] = true;
    alienRow[ai] = r;
    alienAnim[ai] = 0;
    if (r == 0) {
      alienPts[ai] = 30;
    } else if (r < 3) {
      alienPts[ai] = 20;
    } else {
      alienPts[ai] = 10;
    }
  }
}

var starX = [];
var starY = [];
var starBig = [];
for (var i = 0; i < 55; i++) {
  starX[i] = (i * 137 + 23) % 400;
  starY[i] = (i * 97 + 11) % 385;
  if (i % 4 == 0) {
    starBig[i] = true;
  } else {
    starBig[i] = false;
  }
}

var flashX = [];
var flashY = [];
var flashT = [];
var numFlashes = 0;


function draw() {
  frame++;

  if (!gameStarted) {
    drawStartScreen();
    if (keyWentDown("space") || keyWentDown("left") || keyWentDown("right") || keyWentDown("up")) {
      gameStarted = true;
    }
    return;
  }

  if (gameOver) {
    drawGameOverScreen();
    if (keyWentDown("space")) {
      resetGame();
    }
    return;
  }

  if (gameWon) {
    drawWinScreen();
    if (keyWentDown("space")) {
      resetGame();
    }
    return;
  }

  moveCannon();
  moveSwarm();
  moveBullet();
  moveEnemyBullets();
  moveBonus();
  updateFlashes();
  checkHits();
  checkWinLose();

  drawEverything();
}


function moveCannon() {
  if (keyDown("left")) {
    cannonX = cannonX - cannonSpeed;
  }
  if (keyDown("right")) {
    cannonX = cannonX + cannonSpeed;
  }

  if (cannonX < 2) {
    cannonX = 2;
  }
  if (cannonX > 368) {
    cannonX = 368;
  }

  if (shootCooldown > 0) {
    shootCooldown--;
  }

  if (keyWentDown("space") || keyWentDown("up")) {
    if (shootCooldown == 0) {
      bulletActive = true;
      bulletX = cannonX + 15;
      bulletY = cannonY;
      shootCooldown = 8;
    }
  }
}


function moveSwarm() {
  var aliveCount = countAlive();
  swarmSpeedMul = 1 + (55 - aliveCount) * 0.006;
  if (swarmSpeedMul > 1.3) {
    swarmSpeedMul = 1.3;
  }

  if (swarmDropping) {
    var step = 1.4 * swarmSpeedMul;
    swarmY = swarmY + step;
    swarmDropLeft = swarmDropLeft - step;
    if (swarmDropLeft <= 0) {
      swarmDropLeft = 0;
      swarmDropping = false;
      swarmDX = -swarmDX;
    }
  } else {
    swarmX = swarmX + swarmDX * swarmSpeedMul;
    var leftEdge = getSwarmLeft() + swarmX;
    var rightEdge = getSwarmRight() + swarmX;
    if (rightEdge > 394 && swarmDX > 0) {
      swarmDropping = true;
      swarmDropLeft = 14;
    }
    if (leftEdge < 6 && swarmDX < 0) {
      swarmDropping = true;
      swarmDropLeft = 14;
    }
  }

  if (frame % 18 == 0) {
    for (var i = 0; i < 55; i++) {
      if (alienAnim[i] == 0) {
        alienAnim[i] = 1;
      } else {
        alienAnim[i] = 0;
      }
    }
  }
}

function getSwarmLeft() {
  var min = 9999;
  for (var i = 0; i < 55; i++) {
    if (alienAlive[i] && alienX[i] < min) {
      min = alienX[i];
    }
  }
  return min - 4;
}

function getSwarmRight() {
  var max = -9999;
  for (var i = 0; i < 55; i++) {
    if (alienAlive[i] && alienX[i] + 22 > max) {
      max = alienX[i] + 22;
    }
  }
  return max + 4;
}

function countAlive() {
  var n = 0;
  for (var i = 0; i < 55; i++) {
    if (alienAlive[i]) {
      n++;
    }
  }
  return n;
}


function moveBullet() {
  if (bulletActive) {
    bulletY = bulletY - bulletSpeed;
    if (bulletY < -10) {
      bulletActive = false;
    }
  }
}


function moveEnemyBullets() {
  if (eb0active) {
    eb0y = eb0y + eb0spd;
    if (eb0type == 1) {
      eb0x = eb0x + Math.sin(eb0y * 0.25) * 2;
    }
    if (eb0y > 410) {
      eb0active = false;
    }
  }
  if (eb1active) {
    eb1y = eb1y + eb1spd;
    if (eb1type == 1) {
      eb1x = eb1x + Math.sin(eb1y * 0.25) * 2;
    }
    if (eb1y > 410) {
      eb1active = false;
    }
  }
  if (eb2active) {
    eb2y = eb2y + eb2spd;
    if (eb2type == 1) {
      eb2x = eb2x + Math.sin(eb2y * 0.25) * 2;
    }
    if (eb2y > 410) {
      eb2active = false;
    }
  }

  fireTimer++;
  if (fireTimer >= 55) {
    fireTimer = 0;
    var shooters = getBottomAliens();
    if (shooters.length > 0) {
      var pick = shooters[Math.floor(Math.random() * shooters.length)];
      var sx = alienX[pick] + swarmX + 10;
      var sy = alienY[pick] + swarmY + 18;
      var spd = 2.2 + Math.random() * 1.6;
      var typ = Math.floor(Math.random() * 3);

      if (!eb0active) {
        eb0active = true;
        eb0x = sx;
        eb0y = sy;
        eb0spd = spd;
        eb0type = typ;
      } else if (!eb1active) {
        eb1active = true;
        eb1x = sx;
        eb1y = sy;
        eb1spd = spd;
        eb1type = typ;
      } else if (!eb2active) {
        eb2active = true;
        eb2x = sx;
        eb2y = sy;
        eb2spd = spd;
        eb2type = typ;
      }
    }
  }
}

function getBottomAliens() {
  var result = [];
  for (var c = 0; c < COLS; c++) {
    for (var r = ROWS - 1; r >= 0; r--) {
      var idx = r * COLS + c;
      if (alienAlive[idx]) {
        result.push(idx);
        break;
      }
    }
  }
  return result;
}


function moveBonus() {
  bonusTimer++;
  if (!bonusActive && bonusTimer >= 800) {
    bonusActive = true;
    bonusX = -60;
    bonusTimer = 0;
    var pts = [50, 100, 150, 300];
    bonusPoints = pts[Math.floor(Math.random() * 4)];
  }
  if (bonusActive) {
    bonusX = bonusX + 1.5;
    if (bonusX > 460) {
      bonusActive = false;
    }
  }
}


function updateFlashes() {
  for (var i = numFlashes - 1; i >= 0; i--) {
    flashT[i]--;
    if (flashT[i] <= 0) {
      flashX[i] = flashX[numFlashes - 1];
      flashY[i] = flashY[numFlashes - 1];
      flashT[i] = flashT[numFlashes - 1];
      numFlashes--;
    }
  }
}

function addFlash(x, y) {
  flashX[numFlashes] = x;
  flashY[numFlashes] = y;
  flashT[numFlashes] = 12;
  numFlashes++;
}


function boxHit(x1, y1, w1, h1, x2, y2, w2, h2) {
  if (x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2) {
    return true;
  }
  return false;
}

function checkHits() {
  var bx = bulletX - 2;
  var by = bulletY - 8;

  if (bulletActive) {
    for (var i = 0; i < 55; i++) {
      if (!alienAlive[i]) {
        continue;
      }
      var ax = alienX[i] + swarmX;
      var ay = alienY[i] + swarmY;
      if (boxHit(bx, by, 4, 10, ax + 2, ay + 2, 18, 14)) {
        alienAlive[i] = false;
        bulletActive = false;
        score = score + alienPts[i];
        addFlash(ax + 11, ay + 8);
        break;
      }
    }
  }

  if (bulletActive && bonusActive) {
    if (boxHit(bx, by, 4, 10, bonusX, bonusY, 40, 14)) {
      bonusActive = false;
      bulletActive = false;
      score = score + bonusPoints;
      addFlash(bonusX + 20, bonusY + 7);
    }
  }

  if (bulletActive) {
    for (var s = 0; s < 24; s++) {
      if (shieldHP[s] <= 0) {
        continue;
      }
      if (boxHit(bx, by, 4, 10, shieldX[s], shieldY[s], 12, 12)) {
        shieldHP[s]--;
        bulletActive = false;
        break;
      }
    }
  }

  if (eb0active) {
    if (boxHit(eb0x - 3, eb0y - 4, 6, 8, cannonX, cannonY, 30, 16)) {
      eb0active = false;
      lives--;
      addFlash(cannonX + 15, cannonY + 8);
      if (lives <= 0) {
        gameOver = true;
      }
    }
    for (var s = 0; s < 24; s++) {
      if (shieldHP[s] > 0) {
        if (boxHit(eb0x - 3, eb0y - 4, 6, 8, shieldX[s], shieldY[s], 12, 12)) {
          shieldHP[s]--;
          eb0active = false;
        }
      }
    }
  }

  if (eb1active) {
    if (boxHit(eb1x - 3, eb1y - 4, 6, 8, cannonX, cannonY, 30, 16)) {
      eb1active = false;
      lives--;
      addFlash(cannonX + 15, cannonY + 8);
      if (lives <= 0) {
        gameOver = true;
      }
    }
    for (var s = 0; s < 24; s++) {
      if (shieldHP[s] > 0) {
        if (boxHit(eb1x - 3, eb1y - 4, 6, 8, shieldX[s], shieldY[s], 12, 12)) {
          shieldHP[s]--;
          eb1active = false;
        }
      }
    }
  }

  if (eb2active) {
    if (boxHit(eb2x - 3, eb2y - 4, 6, 8, cannonX, cannonY, 30, 16)) {
      eb2active = false;
      lives--;
      addFlash(cannonX + 15, cannonY + 8);
      if (lives <= 0) {
        gameOver = true;
      }
    }
    for (var s = 0; s < 24; s++) {
      if (shieldHP[s] > 0) {
        if (boxHit(eb2x - 3, eb2y - 4, 6, 8, shieldX[s], shieldY[s], 12, 12)) {
          shieldHP[s]--;
          eb2active = false;
        }
      }
    }
  }

  for (var i = 0; i < 55; i++) {
    if (alienAlive[i]) {
      if (alienY[i] + swarmY >= 325) {
        gameOver = true;
      }
    }
  }
}

function checkWinLose() {
  if (!gameOver && countAlive() == 0) {
    gameWon = true;
  }
}


function drawEverything() {
  background("black");

  drawStars();
  drawHUD();
  drawShields();
  drawAllAliens();
  drawBonusShip();
  drawCannon();
  drawBullet();
  drawEnemyBullets();
  drawFlashes();

  stroke(rgb(0, 200, 0));
  strokeWeight(2);
  line(0, 388, 400, 388);
  noStroke();
}

function drawStars() {
  noStroke();
  for (var i = 0; i < 55; i++) {
    var twinkle = Math.floor(160 + Math.abs(Math.sin(frame * 0.04 + i)) * 95);
    fill(rgb(twinkle, twinkle, twinkle));
    if (starBig[i]) {
      ellipse(starX[i], starY[i], 2, 2);
    } else {
      ellipse(starX[i], starY[i], 1, 1);
    }
  }
}

function drawHUD() {
  noStroke();
  fill(rgb(0, 255, 0));
  textSize(12);
  text("SCORE: " + score, 6, 14);
  fill(rgb(0, 220, 0));
  text("LIVES:", 285, 14);
  for (var i = 0; i < lives; i++) {
    fill(rgb(0, 220, 0));
    rect(338 + i * 20, 6, 13, 5, 1);
    rect(343 + i * 20, 3, 4, 5);
  }
}

function drawCannon() {
  noStroke();
  fill(rgb(0, 210, 0));
  rect(cannonX, cannonY + 7, 30, 9, 2);
  rect(cannonX + 8, cannonY + 1, 14, 9, 2);
  rect(cannonX + 13, cannonY - 7, 4, 10, 1);
  fill(rgb(100, 255, 100));
  rect(cannonX + 9, cannonY + 2, 5, 3, 1);
  fill(rgb(0, 130, 0));
  rect(cannonX + 3, cannonY + 9, 3, 5);
  rect(cannonX + 24, cannonY + 9, 3, 5);
}

function drawShields() {
  for (var i = 0; i < 24; i++) {
    if (shieldHP[i] <= 0) {
      continue;
    }
    var x = shieldX[i];
    var y = shieldY[i];

    if (shieldHP[i] == 3) {
      fill(rgb(0, 210, 0));
    } else if (shieldHP[i] == 2) {
      fill(rgb(0, 155, 0));
    } else {
      fill(rgb(0, 90, 0));
    }
    noStroke();
    rect(x, y, 12, 12, 1);

    if (shieldHP[i] <= 2) {
      stroke(rgb(0, 40, 0));
      strokeWeight(1);
      line(x + 3, y + 2, x + 6, y + 8);
      line(x + 8, y + 2, x + 5, y + 9);
    }
    if (shieldHP[i] <= 1) {
      line(x + 1, y + 5, x + 11, y + 6);
      line(x + 4, y, x + 2, y + 12);
      line(x + 9, y + 1, x + 11, y + 11);
    }

    noStroke();
    fill(rgb(0, 255, 80));
    rect(x, y, 12, 1);
    rect(x, y, 1, 12);
  }
}

function drawBullet() {
  if (!bulletActive) {
    return;
  }
  noStroke();
  fill(rgb(255, 255, 0));
  rect(bulletX - 2, bulletY - 8, 4, 12, 2);
  fill(rgb(255, 255, 120));
  ellipse(bulletX, bulletY - 2, 5, 10);
}

function drawEnemyBullets() {
  noStroke();

  if (eb0active) {
    if (eb0type == 0) {
      fill(rgb(255, 60, 60));
      rect(eb0x - 2, eb0y - 5, 4, 10, 1);
      fill(rgb(255, 160, 160));
      rect(eb0x - 1, eb0y - 4, 2, 5);
    } else if (eb0type == 1) {
      fill(rgb(255, 210, 0));
      rect(eb0x, eb0y - 8, 3, 4);
      rect(eb0x - 3, eb0y - 4, 6, 4);
      rect(eb0x - 3, eb0y, 6, 4);
      rect(eb0x, eb0y + 4, 3, 4);
      fill(rgb(255, 255, 150));
      rect(eb0x + 1, eb0y - 7, 1, 3);
    } else {
      fill(rgb(200, 60, 255));
      rect(eb0x - 2, eb0y - 7, 4, 12, 2);
      fill(rgb(255, 140, 255));
      ellipse(eb0x, eb0y + 6, 5, 4);
    }
  }

  if (eb1active) {
    if (eb1type == 0) {
      fill(rgb(255, 60, 60));
      rect(eb1x - 2, eb1y - 5, 4, 10, 1);
      fill(rgb(255, 160, 160));
      rect(eb1x - 1, eb1y - 4, 2, 5);
    } else if (eb1type == 1) {
      fill(rgb(255, 210, 0));
      rect(eb1x, eb1y - 8, 3, 4);
      rect(eb1x - 3, eb1y - 4, 6, 4);
      rect(eb1x - 3, eb1y, 6, 4);
      rect(eb1x, eb1y + 4, 3, 4);
      fill(rgb(255, 255, 150));
      rect(eb1x + 1, eb1y - 7, 1, 3);
    } else {
      fill(rgb(200, 60, 255));
      rect(eb1x - 2, eb1y - 7, 4, 12, 2);
      fill(rgb(255, 140, 255));
      ellipse(eb1x, eb1y + 6, 5, 4);
    }
  }

  if (eb2active) {
    if (eb2type == 0) {
      fill(rgb(255, 60, 60));
      rect(eb2x - 2, eb2y - 5, 4, 10, 1);
      fill(rgb(255, 160, 160));
      rect(eb2x - 1, eb2y - 4, 2, 5);
    } else if (eb2type == 1) {
      fill(rgb(255, 210, 0));
      rect(eb2x, eb2y - 8, 3, 4);
      rect(eb2x - 3, eb2y - 4, 6, 4);
      rect(eb2x - 3, eb2y, 6, 4);
      rect(eb2x, eb2y + 4, 3, 4);
      fill(rgb(255, 255, 150));
      rect(eb2x + 1, eb2y - 7, 1, 3);
    } else {
      fill(rgb(200, 60, 255));
      rect(eb2x - 2, eb2y - 7, 4, 12, 2);
      fill(rgb(255, 140, 255));
      ellipse(eb2x, eb2y + 6, 5, 4);
    }
  }
}

function drawFlashes() {
  for (var i = 0; i < numFlashes; i++) {
    var t = flashT[i] / 12;
    var r = Math.floor(14 * (1 - t));
    var bright = Math.floor(255 * t);
    var dim = Math.floor(180 * t);
    noStroke();
    fill(rgb(bright, Math.floor(bright * 0.78), 50));
    ellipse(flashX[i], flashY[i], r, r);
    fill(rgb(dim, Math.floor(dim * 0.39), 0));
    ellipse(flashX[i] - 4, flashY[i] + 2, r / 2, r / 2);
    ellipse(flashX[i] + 5, flashY[i] - 3, r / 2, r / 2);
  }
}


function drawAllAliens() {
  for (var i = 0; i < 55; i++) {
    if (!alienAlive[i]) {
      continue;
    }
    var x = Math.floor(alienX[i] + swarmX);
    var y = Math.floor(alienY[i] + swarmY);
    var f = alienAnim[i];
    var row = alienRow[i];

    if (row == 0) {
      drawSquid(x, y, f);
    } else if (row < 3) {
      drawCrab(x, y, f);
    } else {
      drawOctopus(x, y, f);
    }
  }
}

function drawSquid(x, y, f) {
  noStroke();
  fill(rgb(230, 70, 255));
  ellipse(x + 11, y + 5, 12, 10);
  rect(x + 5, y + 6, 12, 8, 1);
  fill(rgb(0, 0, 0));
  ellipse(x + 8, y + 5, 3, 3);
  ellipse(x + 14, y + 5, 3, 3);
  fill(rgb(255, 220, 255));
  ellipse(x + 9, y + 4, 1.5, 1.5);
  ellipse(x + 15, y + 4, 1.5, 1.5);
  fill(rgb(230, 70, 255));
  if (f == 0) {
    rect(x + 6, y - 4, 2, 5);
    rect(x + 14, y - 4, 2, 5);
    rect(x + 4, y - 5, 4, 2);
    rect(x + 14, y - 5, 4, 2);
  } else {
    rect(x + 5, y - 5, 2, 6);
    rect(x + 15, y - 5, 2, 6);
    rect(x + 3, y - 6, 4, 2);
    rect(x + 15, y - 6, 4, 2);
  }
  fill(rgb(200, 40, 230));
  if (f == 0) {
    rect(x + 5, y + 12, 2, 5);
    rect(x + 10, y + 12, 2, 5);
    rect(x + 15, y + 12, 2, 5);
  } else {
    rect(x + 4, y + 12, 2, 6);
    rect(x + 10, y + 12, 2, 6);
    rect(x + 16, y + 12, 2, 6);
  }
}

function drawCrab(x, y, f) {
  noStroke();
  fill(rgb(60, 210, 255));
  ellipse(x + 11, y + 8, 16, 12);
  rect(x + 3, y + 8, 16, 6);
  fill(rgb(0, 0, 0));
  ellipse(x + 7, y + 6, 4, 4);
  ellipse(x + 15, y + 6, 4, 4);
  fill(rgb(200, 255, 255));
  ellipse(x + 8, y + 5, 2, 2);
  ellipse(x + 16, y + 5, 2, 2);
  fill(rgb(0, 120, 180));
  rect(x + 7, y + 11, 2, 2);
  rect(x + 11, y + 11, 2, 2);
  rect(x + 15, y + 11, 2, 2);
  fill(rgb(60, 210, 255));
  if (f == 0) {
    rect(x - 2, y + 5, 6, 3);
    rect(x + 18, y + 5, 6, 3);
    rect(x - 3, y + 3, 3, 4);
    rect(x + 22, y + 3, 3, 4);
  } else {
    rect(x - 3, y + 6, 6, 3);
    rect(x + 19, y + 6, 6, 3);
    rect(x - 4, y + 4, 3, 4);
    rect(x + 23, y + 4, 3, 4);
  }
  fill(rgb(160, 240, 255));
  rect(x + 5, y + 5, 4, 2, 1);
}

function drawOctopus(x, y, f) {
  noStroke();
  fill(rgb(255, 150, 20));
  ellipse(x + 11, y + 7, 20, 14);
  rect(x + 1, y + 7, 20, 9);
  fill(rgb(0, 0, 0));
  ellipse(x + 7, y + 6, 4, 4);
  ellipse(x + 15, y + 6, 4, 4);
  fill(rgb(255, 240, 200));
  ellipse(x + 8, y + 5, 2, 2);
  ellipse(x + 16, y + 5, 2, 2);
  fill(rgb(215, 110, 0));
  ellipse(x + 11, y + 13, 12, 5);
  fill(rgb(255, 150, 20));
  if (f == 0) {
    rect(x + 1, y + 14, 3, 5);
    rect(x + 6, y + 14, 3, 6);
    rect(x + 12, y + 14, 3, 5);
    rect(x + 17, y + 14, 3, 6);
  } else {
    rect(x + 0, y + 14, 3, 6);
    rect(x + 5, y + 14, 3, 5);
    rect(x + 12, y + 14, 3, 6);
    rect(x + 18, y + 14, 3, 5);
  }
  fill(rgb(255, 210, 120));
  rect(x + 5, y + 5, 5, 2, 1);
}

function drawBonusShip() {
  if (!bonusActive) {
    return;
  }
  var x = bonusX;
  var y = bonusY;
  noStroke();
  fill(rgb(255, 30, 30));
  ellipse(x + 20, y + 7, 42, 12);
  fill(rgb(255, 110, 110));
  ellipse(x + 20, y + 2, 22, 10);
  fill(rgb(255, 255, 180));
  ellipse(x + 10, y + 6, 6, 6);
  ellipse(x + 20, y + 6, 6, 6);
  ellipse(x + 30, y + 6, 6, 6);
  fill(rgb(255, 190, 0));
  ellipse(x + 7, y + 12, 7, 4);
  ellipse(x + 20, y + 12, 7, 4);
  ellipse(x + 33, y + 12, 7, 4);
  fill(rgb(255, 255, 0));
  textSize(8);
  text("+" + bonusPoints, x + 7, y - 3);
}


function drawStartScreen() {
  background("black");
  drawStars();

  noStroke();
  fill(rgb(0, 255, 0));
  textSize(22);
  text("SPACE INVADERS", 68, 90);

  stroke(rgb(0, 180, 0));
  strokeWeight(1);
  line(30, 100, 370, 100);
  noStroke();

  fill(rgb(255, 255, 255));
  textSize(10);
  text("*SCORE ADVANCE TABLE*", 120, 118);

  drawSquid(80, 128, 0);
  fill(rgb(255, 255, 255));
  textSize(10);
  text("= 30 PTS", 110, 142);

  drawCrab(80, 158, 0);
  fill(rgb(255, 255, 255));
  text("= 20 PTS", 110, 172);

  drawOctopus(77, 188, 0);
  fill(rgb(255, 255, 255));
  text("= 10 PTS", 110, 202);

  var bx = 58;
  fill(rgb(255, 30, 30));
  ellipse(bx + 20, 225, 42, 12);
  fill(rgb(255, 110, 110));
  ellipse(bx + 20, 220, 22, 10);
  fill(rgb(255, 255, 180));
  ellipse(bx + 10, 224, 6, 6);
  ellipse(bx + 20, 224, 6, 6);
  ellipse(bx + 30, 224, 6, 6);
  fill(rgb(255, 255, 255));
  textSize(10);
  text("= ??? PTS", 110, 229);

  fill(rgb(0, 200, 255));
  textSize(10);
  text("ARROW KEYS  =  Move cannon", 100, 268);
  text("SPACE / UP  =  Fire", 100, 284);

  if (Math.floor(frame / 28) % 2 == 0) {
    fill(rgb(255, 255, 0));
    textSize(13);
    text("- PRESS SPACE TO PLAY -", 92, 340);
  }
}

function drawGameOverScreen() {
  background("black");
  drawStars();
  noStroke();
  fill(rgb(255, 40, 40));
  textSize(30);
  text("GAME OVER", 88, 160);
  fill(rgb(200, 200, 200));
  textSize(13);
  text("SCORE: " + score, 155, 208);
  if (Math.floor(frame / 28) % 2 == 0) {
    fill(rgb(255, 255, 0));
    textSize(11);
    text("Press SPACE to play again", 100, 265);
  }
}

function drawWinScreen() {
  background("black");
  drawStars();
  noStroke();
  fill(rgb(0, 255, 100));
  textSize(30);
  text("YOU  WIN!", 100, 155);
  fill(rgb(200, 200, 200));
  textSize(13);
  text("SCORE: " + score, 155, 205);
  if (Math.floor(frame / 28) % 2 == 0) {
    fill(rgb(255, 255, 0));
    textSize(11);
    text("Press SPACE to play again", 100, 265);
  }
}


function resetGame() {
  score = 0;
  lives = 3;
  gameOver = false;
  gameWon = false;
  frame = 0;
  swarmDX = 0.35;
  swarmX = 0;
  swarmY = 0;
  swarmDropping = false;
  swarmDropLeft = 0;
  cannonX = 185;
  bulletActive = false;
  shootCooldown = 0;
  bonusActive = false;
  bonusTimer = 0;
  fireTimer = 0;
  numFlashes = 0;
  eb0active = false;
  eb1active = false;
  eb2active = false;

  for (var r = 0; r < ROWS; r++) {
    for (var c = 0; c < COLS; c++) {
      var idx = r * COLS + c;
      alienX[idx] = 20 + c * 32;
      alienY[idx] = 68 + r * 28;
      alienAlive[idx] = true;
      alienAnim[idx] = 0;
      if (r == 0) {
        alienPts[idx] = 30;
      } else if (r < 3) {
        alienPts[idx] = 20;
      } else {
        alienPts[idx] = 10;
      }
    }
  }

  var si = 0;
  for (var sc = 0; sc < 3; sc++) {
    for (var sr = 0; sr < 2; sr++) {
      shieldX[si] = pos0 + sc * 14;
      shieldY[si] = 338 + sr * 14;
      shieldHP[si] = 3;
      si++;
    }
  }
  for (var sc = 0; sc < 3; sc++) {
    for (var sr = 0; sr < 2; sr++) {
      shieldX[si] = pos1 + sc * 14;
      shieldY[si] = 338 + sr * 14;
      shieldHP[si] = 3;
      si++;
    }
  }
  for (var sc = 0; sc < 3; sc++) {
    for (var sr = 0; sr < 2; sr++) {
      shieldX[si] = pos2 + sc * 14;
      shieldY[si] = 338 + sr * 14;
      shieldHP[si] = 3;
      si++;
    }
  }
  for (var sc = 0; sc < 3; sc++) {
    for (var sr = 0; sr < 2; sr++) {
      shieldX[si] = pos3 + sc * 14;
      shieldY[si] = 338 + sr * 14;
      shieldHP[si] = 3;
      si++;
    }
  }
}
