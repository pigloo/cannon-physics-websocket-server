 "use strict";

const CANNON = require('cannon');

class Physics {

    constructor(){

        this._world = new CANNON.World();
        this._world.broadphase = new CANNON.NaiveBroadphase();
        //_world.broadphase = new CANNON.SAPBroadphase(world);
        this._world.broadphase.useBoundingBoxes = true;
        this._world.allowSleep = true;
        this._world.gravity.set(0, -9.82, 0);

        this._world.solver.iterations = 10;
        this._world.defaultContactMaterial.contactEquationStiffness = 1e9;
        this._world.defaultContactMaterial.contactEquationRelaxation = 1;

    }

    get world(){

        return this._world;

    }

    updatePhysics() {

        var dt = 1 / 60;
        this._world.step(dt);

    }

    addBody(body) {

        this._world.addBody(body);

    }

    removeBody(body) {

        this._world.removeBody(body);

    }
}

module.exports = Physics;
