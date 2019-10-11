const WIDTH = 800;
const HEIGHT = 600;

//Images
let starBackgroundImage;
let spaceshipImage;
let astroidImages = [];

//Sounds
let explosionSfx;
let shootSfx;
let astroidBreakSfx;
let menuTrack;
let backgrounTracks = [];

//GameObjects
let player;
let bullets = [];
let astroids = [];

//Other variables
let inputType = 1;
let canFire = 0;
let score = 0;
let level = 0;
let objectSize;
let buttonSize;
let showMenu = true;
let gameOver = false;
let highscores = [];

function preload(){
  //Load Images
  starBackgroundImage = loadImage('sprites/Star_Background2.png');
  spaceshipImage = loadImage('sprites/Spaceship2.png');
  for(let i = 1; i <= 5; i++){
    astroidImages.push(loadImage(`sprites/Astroid${i}.png`));
  }

  //Load Sounds
  explosionSfx = loadSound('sounds/ExplosionEffect.mp3');
  shootSfx = loadSound('sounds/ShootEffect.mp3');
  astroidBreakSfx = loadSound('sounds/AstroidbreakEffect.mp3');
  menuTrack = loadSound('sounds/Menutrack.mp3');
  for(let i = 1; i <= 3; i++){
    backgrounTracks.push(loadSound(`sounds/Backgroundtrack${i}.mp3`));
  }

  //Load highscores
  getHighscores();
}

function setup() {
  // put setup code here
  createCanvas(windowWidth-15, windowHeight-15);
  objectSize = floor((width + height) / 10);
  buttonSize = (width < height) ? round(width/8) : round(height/8);
  menuTrack.play();
}

function draw() {
  //Background
  imageMode(CORNER);
  image(starBackgroundImage, 0, 0, width, height);
  //Show Menu
  if(showMenu){
    displayMenu();
    if(keyIsPressed){
      inputType = 0;
      startGame();
    }
    if(touches[0]){
      inputType = 1;
      startGame();
    }
  }
  else{
    //Show Game Over screen
    if(gameOver){
      displayGameOverScreen();
    }
    else{
      //Ckeck if level complete
      if(astroids.length < 1){
        startLevel();
      }
      //Regulate firing speed
      if(canFire > 0){
        canFire--;
      }
      //Run Gameloop
      if(inputType === 0){
        checkInput();
      }
      else{
        checkTouchInput();
      }
      updateGameObjects();
      checkCollisions();
      renderFrame();
      displayScore();
      if(inputType !== 0){
        drawButtons();
      }
    }
  }
}

function displayMenu(){
  textAlign(CENTER, CENTER);
  fill(255);
  stroke(255, 0, 0);
  strokeWeight(5);
  textStyle(NORMAL);
  textFont('Georgia', round(objectSize/2.8));
  text('Press any key to start', width/2-300, height/2-round(objectSize*1.4), 600, 100);
  fill(255);
  stroke(0, 0, 255);
  strokeWeight(3);
  textSize(round(objectSize/4.5));
  text('High Scores.', width/2-125, height/2-round(objectSize/2), 250, 60);
  noStroke();
  textSize(round(objectSize/7));
  text(highscores[0].name +' - '+ highscores[0].score, width/2-150, height/2-round(objectSize/7), 300, 50);
  text(highscores[1].name +' - '+ highscores[1].score, width/2-150, height/2+round(objectSize/14), 300, 50);
  text(highscores[2].name +' - '+ highscores[2].score, width/2-150, height/2+round(objectSize/3.5), 300, 50);
  text(highscores[3].name +' - '+ highscores[3].score, width/2-150, height/2+round(objectSize/2), 300, 50);
  text(highscores[4].name +' - '+ highscores[4].score, width/2-150, height/2+round(objectSize/14*10), 300, 50);
}

function displayGameOverScreen(){
  textAlign(CENTER, CENTER);
  fill(255);
  stroke(255, 0, 0);
  strokeWeight(5);
  textFont('Georgia', round(objectSize/2));
  textStyle(NORMAL);
  text('Game Over!', width/2-round(objectSize/3*2), height/2-round(objectSize/3), round(objectSize/3*4), round(objectSize/3*4));
  if(!menuTrack.isPlaying()){
    menuTrack.play();
  }
}

function updateGameObjects(){
  player.update();
  for(let i = bullets.length - 1; i >= 0; i--){
    bullets[i].update();
    //Remove bullets that have collided or left the screen
    if(bullets[i].destroyed){
      bullets.splice(i, 1);
    }
  }
  for(let i = astroids.length - 1; i >= 0; i--){
    astroids[i].update();
    //Remove astroids that have been destroyed
    if(astroids[i].destroyed){
      astroids.splice(i, 1);
    }
  }
}

function renderFrame(){
  player.show();
  player.wrap();
  for(bullet of bullets){
    bullet.show();
  }
  for(astroid of astroids){
    astroid.show();
    astroid.wrap();
  }
}

function displayScore(){
  textSize(18);
  fill(255);
  noStroke();
  text(`Score: ${score}`, 30, 20, 120, 20);
}

function checkInput(){
  if(keyIsDown(32)){
    if(!(canFire > 0)){
      bullets.push(player.fire());
      canFire = 20;
      shootSfx.play();
    }
  }
  if(keyIsDown(UP_ARROW)){
    player.accelerating = true;
  }
  else{
    player.accelerating = false;
  }
  if(keyIsDown(LEFT_ARROW)){
    player.turnLeft();
  }
  if(keyIsDown(RIGHT_ARROW)){
    player.turnRight();
  }
}

function checkTouchInput(){
  for(touch of touches){
    if(touch.x < round(buttonSize*2.5) && touch.x > round(buttonSize/2) && touch.y < height-round(buttonSize/2) && touch.y > height-round(buttonSize*1.5)){
      if(!(canFire > 0)){
        bullets.push(player.fire());
        canFire = 20;
        shootSfx.play();
      }
      continue;
    }
    if(touch.x < width-round(buttonSize*1.5) && touch.x > width-round(buttonSize*2.5) && touch.y < height-round(buttonSize*1.5) && touch.y > height-round(buttonSize*2.5)){
      player.accelerating = true;
      continue;
    }
    else{
      player.accelerating = false;
    }
    if(touch.x < width-round(buttonSize*2.5) && touch.x > width-round(buttonSize*3.5) && touch.y < height-round(buttonSize/2) && touch.y > height-round(buttonSize*1.5)){
      player.turnLeft();
      continue;
    }
    if(touch.x < width-round(buttonSize/2) && touch.x > width-round(buttonSize*1.5) && touch.y < height-round(buttonSize/2) && touch.y > height-round(buttonSize*1.5)){
      player.turnRight();
      continue;
    }
  }
}

function drawButtons(){
  stroke(255);
  noFill();
  strokeWeight(1);
  //Fire button
  rect(floor(buttonSize/2), height-floor(buttonSize*1.5), buttonSize*2, buttonSize);
  textAlign(CENTER);
  textSize(round(buttonSize/2));
  textStyle(NORMAL);
  text('Fire', round(buttonSize/2), height-floor(buttonSize*1.5), buttonSize*2, buttonSize);
  //Up button
  triangle(width-round(buttonSize*2.5), height-round(buttonSize*1.5), width-buttonSize*2, height-round(buttonSize*2.5), width-round(buttonSize*1.5), height-round(buttonSize*1.5));
  //Left button
  triangle(width-round(buttonSize*2.5), height-round(buttonSize*1.5), width-round(buttonSize*2.5), height-round(buttonSize/2), width-round(buttonSize*3.5), height-buttonSize);
  //Right button
  triangle(width-round(buttonSize*1.5), height-round(buttonSize*1.5), width-round(buttonSize/2), height-buttonSize, width-round(buttonSize*1.5), height-round(buttonSize/2));
}

function startGame(){
  showMenu = false;
  gameOver = false;
  score = 0;
  canFire = 5;
  menuTrack.pause();
  menuTrack.stop(0.2);

  //Create player
  player = new Spaceship(createVector(width/2, height/2), -90, round(objectSize/50), 5, spaceshipImage, floor(objectSize/3));

  startLevel();
}

function endGame(){
  gameOver = true;
  level = 0;
  astroids = [];
  bullets = [];
  backgrounTracks[0].pause();
  backgrounTracks[0].stop(0.2);
  explosionSfx.play();
  let newHighscore = false;
  for(let i = highscores.length-1; i >= 0; i--){
    if(score > highscores[i].score){
      newHighscore = true;
      getHighscoreName();
      break;
    }
  }
  if(!newHighscore){
    setTimeout(() => {
      showMenu = true;
    },5000);
  }
}

function startLevel(){
  if(level % 3 === 0){
    backgrounTracks[2].pause();
    backgrounTracks[2].stop();
  }
  else{
    backgrounTracks[(level % 3) - 1].pause();
    backgrounTracks[(level % 3) - 1].stop();
  }
  backgrounTracks[level % 3].play();
  level++;
  bullets = [];
  imageMode(CORNER);
  image(starBackgroundImage, 0, 0, width, height);
  textAlign(CENTER, CENTER);
  fill(255);
  stroke(0, 255, 90);
  strokeWeight(4);
  textStyle(ITALIC);
  textFont('Times New Roman', round(objectSize/14*5.5));
  text('Stage ' + level, width/2-125, height/2-objectSize, 250, 100);
  noLoop();
  player.pos = createVector(width/2,height/2);
  setTimeout(() => {
    createAstroids();
    loop();
  }, 3000);
}

function createAstroids(){
  //Create Astroids
  for(let i = 0; i < level; i++){
    let x = random(width);
    //Make sure astroids dont start too close to player.
    while(x < width/2+objectSize && x > width/2-objectSize){
      x = random(width);
    }
    let y = random(height);
    while(y < height/2+objectSize && y > height/2-objectSize){
      y = random(height);
    }
    let angle = random(360);
    let rotationSpeed = random(-5, 5);
    let imageIndex = floor(random(astroidImages.length));
    let size = floor(random(objectSize - objectSize/6, objectSize + objectSize/6));
    astroids.push(new Astroid(createVector(x, y), p5.Vector.fromAngle(radians(angle)), rotationSpeed, astroidImages[imageIndex], size));
  }
}

function getHighscoreName(){
  let inputDiv = createElement('div');
  let label1 = createElement('label', 'Highscore!</br>');
  label1.style('font-size', '30px');
  label1.style('font-weight', 'bold');
  label1.style('color', 'blue');
  label1.parent(inputDiv);
  let label2 = createElement('label', 'Enter Name:</br>');
  label2.style('font-size', '20px');
  label2.parent(inputDiv);
  let input = createInput();
  input.size(150);
  input.style('border', '2px solid blue');
  input.style('text-align', 'center');
  input.parent(inputDiv);
  inputDiv.position(width/2-85, height/2-170);
  inputDiv.style('background-color', 'grey');
  inputDiv.style('text-align', 'center');
  input.changed(addName);

  function addName(){
    addHighscore(this.value(), score);
    saveHighscores();
    inputDiv.remove();
    setTimeout(() => {
      showMenu = true;
    },1000);
  }
}

function addHighscore(name, score){
  for(let i = 0; i < highscores.length; i++){
    if(score > highscores[i].score){
      let tempName = highscores[i].name;
      let tempScore = highscores[i].score;
      highscores[i].name = name;
      highscores[i].score = score;
      addHighscore(tempName, tempScore);
      break;
    }
  }
}

function checkCollisions(){
  for(astroid of astroids){
    //Detect collisions with player
    let minDistance = player.size/3 + astroid.size/2;
    let distanceToPlayer = dist(astroid.pos.x, astroid.pos.y, player.pos.x , player.pos.y);
    
    let tempD;
    if(astroid.tempXPos && astroid.tempYPos){
      tempD = dist(astroid.tempXPos, astroid.tempYPos, player.pos.x, player.pos.y);
    }
    else if(astroid.tempXPos){
      tempD = dist(astroid.tempXPos, astroid.pos.y, player.pos.x, player.pos.y);
    }
    else if(astroid.tempYPos){
      tempD = dist(astroid.pos.x, astroid.tempYPos, player.pos.x, player.pos.y);
    }
    if(tempD && tempD < distanceToPlayer){
      distanceToPlayer = tempD;
    }

    if(distanceToPlayer < minDistance){
      endGame();
    }

    //Detect collisions with bullets
    let distanceToClosestBullet = Infinity;
    let closestBullet;
    for(bullet of bullets){
      let d = dist(astroid.pos.x, astroid.pos.y, bullet.pos.x, bullet.pos.y);
      if(d < distanceToClosestBullet){
        distanceToClosestBullet = d;
        closestBullet = bullet;
      }

      let tempD;
      if(astroid.tempXPos && astroid.tempYPos){
        tempD = dist(astroid.tempXPos, astroid.tempYPos, bullet.pos.x, bullet.pos.y);
      }
      else if(astroid.tempXPos){
        tempD = dist(astroid.tempXPos, astroid.pos.y, bullet.pos.x, bullet.pos.y);
      }
      else if(astroid.tempYPos){
        tempD = dist(astroid.pos.x, astroid.tempYPos, bullet.pos.x, bullet.pos.y);
      }
      if(tempD && tempD < distanceToClosestBullet){
        distanceToClosestBullet = tempD;
        closestBullet = bullet;
      }
    }
    if(closestBullet){
      if(distanceToClosestBullet < astroid.size/2){
        astroid.destroy();
        astroidBreakSfx.play();
        closestBullet.destroy();
        score += 10;
      }
    }
  }
}

async function getHighscores(){
  let response = await fetch('http://localhost:3000/highscores');
  let data = await response.json();
  highscores = data;
}

async function saveHighscores(){
  let request = {
    method:'POST',
    headers:{
      'Content-Type':'application/json'
    },
    body:JSON.stringify(highscores)
  };
  let response = await fetch('http://localhost:3000/highscores', request);
  let data = await response.json();
  console.log(data);
}

function mousePressed(){
  getAudioContext().resume();
}