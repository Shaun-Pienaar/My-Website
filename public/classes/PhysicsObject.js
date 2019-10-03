class PhysicsObject{
    constructor(pos, relMass, initAcc, initVel){
        this.mass = relMass || 1;
        this.pos = pos;
        this.acc = initAcc || createVector(0, 0);
        this.vel = initVel || createVector(0, 0);
    }

    update(){
        this.vel.add(this.acc);
        this.pos.add(this.vel);
        this.acc.mult(0);
    }

    applyForce(force){
        let myForce = force.copy();
        this.acc.add(myForce.div(this.mass));
    }
}