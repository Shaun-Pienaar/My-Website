class Spaceship extends PhysicsObject{
    constructor(pos, heading, speed, turnSpeed, img, size){
        super(pos,size/10);
        this.dir = p5.Vector.fromAngle(radians(heading));
        this.heading = degrees(this.dir.heading());
        if(this.size < 33 && this.size > 22){
            this.speed = round(speed/2);
        }
        else{
            this.speed = speed;
        }
        this.turnSpeed = turnSpeed;
        this.img = img;
        this.size = size;
        this.accelerating = false;
        this.tempXPos = undefined;
        this.tempYPos = undefined;
    }

    show(pos){
        imageMode(CENTER);
        push();
        if(pos){
            translate(pos.x, pos.y);
        }
        else{
            translate(this.pos.x, this.pos.y);
        }
        rotate(this.dir.heading());
        image(this.img, 0, 0, this.size, this.size);
        pop();
    }

    update(){
        super.update();
        if(this.accelerating){
            this.dir.normalize();
            this.applyForce(this.dir.mult(this.speed/3));
        }
        let velCopy = this.vel.copy();
        let friction;
        //Adjust friction according to size
        if(this.size < 35 && this.size > 22){
            friction = velCopy.mult(-0.07);
        }
        else if(this.size <= 22){
            friction = velCopy.mult(-0.05);
        }
        else{
            friction = velCopy.mult(-0.1);
        }
        this.applyForce(friction);
    }

    turnLeft(){
        this.heading -= this.turnSpeed;
        this.updateDirection();
    }

    turnRight(){
        this.heading += this.turnSpeed;
        this.updateDirection()
    }

    updateDirection(){
        this.dir = p5.Vector.fromAngle(radians(this.heading));
    }

    fire(){
        let pos = createVector(this.pos.x, this.pos.y);
        pos.add(this.dir.normalize().mult(this.size/2));
        if(pos.x < 0){
            pos.x = width + pos.x;
        }
        else if(pos.x > width){
            pos.x = pos.x - width;
        }
        if(pos.y < 0){
            pos.y = height + pos.y;
        }
        else if(pos.y > height){
            pos.y = pos.y - height;
        }

        let bullet = new Bullet(pos, this.dir);
        return bullet;
    }

    wrap(){
        if(this.pos.x < 0){
            this.pos.x = width;
        }
        else if(this.pos.x > width){
            this.pos.x = 0;
        }
        if(this.pos.y < 0){
            this.pos.y = height;
        }
        else if(this.pos.y > height){
            this.pos.y = 0;
        }

        //Wrap rendering
        let Xoff;
        let Yoff;
        if(this.pos.x - this.size/2 <= 0){
            Xoff = this.pos.x - this.size/2;
            this.tempXPos = width + this.size/2 + Xoff;
        }
        else if(this.pos.x + this.size/2 > width){
            Xoff = this.pos.x + this.size/2 - width;
            this.tempXPos = -this.size/2 + Xoff;
        }
        else{
            this.tempXPos = undefined;
        }
        if(this.pos.y - this.size/2 <= 0){
            Yoff = 0 - (this.pos.y + this.size/2);
            this.tempYPos = height - this.size/2 - Yoff;
        }
        else if(this.pos.y + this.size/2 > height){
            Yoff = this.pos.y + this.size/2 - height;
            this.tempYPos = -this.size/2 + Yoff;
        }
        else{
            this.tempYPos = undefined;
        }

        if(this.tempXPos && this.tempYPos){
            this.show(createVector(this.tempXPos, this.tempYPos));
        }
        if(this.tempXPos){
            this.show(createVector(this.tempXPos, this.pos.y));
        }
        if(this.tempYPos){
            this.show(createVector(this.pos.x, this.tempYPos));
        }

        // imageMode(CENTER);
        // push();
        // translate(tempXPos, tempYPos);
        // rotate(this.dir.heading());
        // image(this.img, 0, 0, this.size, this.size);
        // pop();
    }
}