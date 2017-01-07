"use strict";

const CANNON = require('cannon');
const AbstractPhysics = require('./AbstractPhysics');
const funnel = require('../objects/funnel');

class Physics extends AbstractPhysics {

    constructor() {

        super();

        this._groundMaterial = new CANNON.Material('ground');
        this._sphereMaterial = new CANNON.Material('sphere');
        this._funnelMaterial = new CANNON.Material('funnel');

        this._sphere_funnel = new CANNON.ContactMaterial(this._funnelMaterial, this._sphereMaterial, {
            friction: 0.01,
            restitution: 0
        });
        this._sphere_ground = new CANNON.ContactMaterial(this._groundMaterial, this._sphereMaterial, {
            friction: 0.001,
            restitution: 0.3
        });

        this._world.addContactMaterial(this._sphere_funnel);
        this._world.addContactMaterial(this._sphere_ground);

        this.addFloor();

        //this.addFunnel(0);
        //this.addFunnel(-0.1);
        //this.addFunnel(-0.2);

    }

    addFloor() {
        var halfExtents = new CANNON.Vec3(4, 1, 4);
        var boxShape = new CANNON.Box(halfExtents);
        var boxBody = new CANNON.Body({
          mass: 0,
          material: this._groundMaterial
        });
        boxBody.addShape(boxShape);
        boxBody.position.set(0,-4,0);
        this._world.addBody(boxBody);
    }

    addFunnel(pos){
        var ToRad = 0.0174532925199432957;

        var shape = funnel(5, 4.6, 8, 16);

        var shapeBody = new CANNON.Body({
          mass: 0,
          material: this._funnelMaterial
        });

        shapeBody.addShape(shape);
        shapeBody.position.set(0,pos,0);

        var rot = -90*ToRad;
        var q = new CANNON.Quaternion();
        q.setFromEuler(rot,0,0);

        shapeBody.quaternion.copy(q);

        this._world.addBody(shapeBody);
    }

    get sphereMaterial(){

        return this._sphereMaterial;

    }

}

module.exports = Physics;
