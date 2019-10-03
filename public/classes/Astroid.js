class Astroid extends PhysicsObject{
    constructor(pos, dir, rotationSpeed, img, size){
        super(pos, size/10);
        this.dir = dir;
        this.rotationSpeed = rotationSpeed;
        this.img = img;
        this.size = size;
        this.speed = floor(random(objectSize/32, objectSize/10));
        this.angle = 0;
        this.destroyed = false;
        //Limit speed of smaller objects
        if(this.size < 20){
            this.speed = floor(this.speed/2);
            if(this.size < 10){
                this.speed = floor(this.speed/3);
            }
        }
        this.applyForce(this.dir.mult(this.speed));
        this.tempXPos = undefined;
        this.tempYPos = undefined;
    }

    update(){
        super.update();
        this.dir.normalize();
        this.angle += this.rotationSpeed;
        if(this.angle >= 360 || this.angle <= -360){
            this.angle = this.angle % 360;
        }
    }

    show(pos){
        fill(255);
        push();
        if(pos){
            translate(pos.x, pos.y);
        }
        else{
            translate(this.pos.x, this.pos.y);
        }
        rotate(radians(this.angle));
        image(this.img, 0, 0, this.size, this.size);
        pop();
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
    }

    destroy(){
        this.destroyed = true;
        if(this.size >= objectSize/3){
            this.dir.normalize();
            let index1 = floor(random(astroidImages.length));
            let index2 = floor(random(astroidImages.length));
            astroids.push(new Astroid(this.pos.copy().add(this.dir.mult(5)), this.dir.copy().normalize(), this.rotationSpeed, astroidImages[index1], this.size/2));
            astroids.push(new Astroid(this.pos.copy().sub(this.dir.mult(5)), this.dir.copy().mult(-1).normalize(), -this.rotationSpeed, astroidImages[index2], this.size/2));
        }
    }
}