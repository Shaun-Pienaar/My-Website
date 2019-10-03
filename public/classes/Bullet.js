class Bullet{
    constructor(pos, dir){
        this.pos = pos;
        this.dir = dir;
        this.destroyed = false;
    }

    update(){
        this.dir.normalize();
        this.pos.add(this.dir.mult(round(objectSize/23)));
        if(this.pos.x > width || this.pos.x < 0 || this.pos.y > height || this.pos.y < 0){
            this.destroy();
        }
    }

    show(){
        fill(255, 20, 70);
        noStroke();
        push();
        translate(this.pos.x, this.pos.y);
        ellipse(0, 0, floor(objectSize/20));
        pop();
    }

    destroy(){
        this.destroyed = true;
    }
}