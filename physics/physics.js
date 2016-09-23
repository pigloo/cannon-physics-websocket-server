 "use strict";

const CANNON = require('cannon');
const AbstractPhysics = require('./AbstractPhysics');

class Physics extends AbstractPhysics {

    constructor() {

        super();

        this._groundMaterial = new CANNON.Material('ground');
        this._sphereMaterial = new CANNON.Material('sphere');

        this._sphere_ground = new CANNON.ContactMaterial(this._groundMaterial, this._sphereMaterial, {
          friction: 0.001,
          restitution: 0.3
        });

        this._world.addContactMaterial(this._sphere_ground);

        this.addFloor();

    }

    addFloor() {
        var halfExtents = new CANNON.Vec3(4, 1, 4);
        var boxShape = new CANNON.Box(halfExtents);
        var boxBody = new CANNON.Body({
          mass: 0,
          material: this._groundMaterial
        });
        boxBody.addShape(boxShape);
        boxBody.position.set(0,0,0);
        this._world.addBody(boxBody);
    }

    get sphereMaterial(){

        return this._sphereMaterial;
        
    }

}

module.exports = Physics;
