"use strict";

const CANNON = require('cannon');

class Transactions{
    constructor(world, sphereMaterial, removeTransaction){
        this._world = world;
        this._sphereMaterial = sphereMaterial;

        this._removeTransaction = removeTransaction;

        this._bodies = [];
        this._ToRad = 0.0174532925199432957;

        //this._TransactionShape = new CANNON.Sphere(0.2);
        //this._reTransactionShape = new CANNON.Sphere(0.15);

        this._TransactionShape = new CANNON.Cylinder(0.4,0.4,0.1,16);
        var q = new CANNON.Quaternion();
        q.setFromAxisAngle(new CANNON.Vec3(1,0,0),Math.PI / 2);
        this._TransactionShape.transformAllPoints(new CANNON.Vec3(),q);
    }

    addTransaction(callback){

        var identifier = this.generateId();

        var shape;

        shape = this._TransactionShape;

        var position = this.randomPosition();
        var rotation = this.randomRotation();
        //var linearVelocity = this.randomLinearVelocity(1);
        //var angularVelocity = this.randomAngularVelocity(100);

        var body = new CANNON.Body({
            mass: 10,
            material: this._sphereMaterial,
        });

        body.addShape(shape);

        body.position.copy(position);
        body.quaternion.copy(rotation);
        //body.angularVelocity.copy(angularVelocity);
        //body.velocity.copy(linearVelocity);

        body.linearDamping = 0;//0.25;
        body.angularDamping = 0;//0.25;

        var i = this._bodies.length;
        this._bodies[i] = body;

        this._world.add(body);

        var candidate = 0;
        var reTransaction = 0;

        body.candidate = candidate;
        body.reTransaction = reTransaction;
        body.id = identifier;
        var quaternion = body.quaternion;

        var data = {id: identifier, c: candidate, rt: reTransaction, p: position, q: quaternion};

        callback(data);

    }

    generateId(){
        var S4 = function() {
            return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
        };
        return (S4()+S4());
    }

    randomPosition(){
        var x = -3 + Math.random() * 6;
        var y = 15;
        var z = -3 + Math.random() * 6;

        var position = new CANNON.Vec3(x, y, z);

        return position;
    }

    randomRotation(){
        var rx = (Math.floor((Math.random() * 360) + 1)) * this._ToRad;
        var ry = (Math.floor((Math.random() * 360) + 1)) * this._ToRad;
        var rz = (Math.floor((Math.random() * 360) + 1)) * this._ToRad;

        var q = new CANNON.Quaternion();
        q.setFromEuler(rx,ry,rz);

        return q;
    }

    randomLinearVelocity(max){
        var x = (0.5 - Math.random()) * max;
        var y = (0.5 - Math.random()) * max;
        var z = (0.5 - Math.random()) * max;
        var linearVelocity = new CANNON.Vec3(x,y,z);

        return linearVelocity;
    }

    randomAngularVelocity(max){
        var x = (0.5 - Math.random()) * max;
        var y = (0.5 - Math.random()) * max;
        var z = (0.5 - Math.random()) * max;
        var angularVelocity = new CANNON.Vec3(x,y,z);

        return angularVelocity;
    }

    scatter(){
        for(var i = 0; i < this._bodies.length; i++){
            var body = this.bodies[i];
            body.wakeUp();
            var linearVelocity = this.randomLinearVelocity(40);
            var angularVelocity = this.randomAngularVelocity(40);
            body.angularVelocity.copy(angularVelocity);
            body.velocity.copy(linearVelocity);
        }
    }

    updatePositions(){
        var body, i = this._bodies.length;

        var data = [];
        //var data = new ArrayBuffer(7 * i * 4

        while (i--) {
            body = this._bodies[i];
            var id = body.id;

            if (body.position.y < -10) {
                this._world.removeBody(this._bodies[i]);
                this._bodies.splice(i, 1);
                //console.log('body removed');
                this._removeTransaction({id:id});
            } else if (body.sleepState !== 2) {

                var px = +body.position.x.toFixed(4);
                var py = +body.position.y.toFixed(4);
                var pz = +body.position.z.toFixed(4);
                var position = {x:px,y:py,z:pz};

                var qw = +body.quaternion.w.toFixed(4);
                var qx = +body.quaternion.x.toFixed(4);
                var qy = +body.quaternion.y.toFixed(4);
                var qz = +body.quaternion.z.toFixed(4);
                var quaternion = {w:qw,x:qx,y:qy,z:qz};

                var candidate = body.candidate;
                var reTransaction = body.reTransaction;

                //data.push({ id: id, p: position, q: quaternion, c: candidate, rt: reTransaction });
                data.push({ id: id, p: position, q: quaternion });

                /*
                var px = body.position.x;
                var py = body.position.y;
                var pz = body.position.z;
                var qw = body.quaternion.w;
                var qx = body.quaternion.x;
                var qy = body.quaternion.y;
                var qz = body.quaternion.z;

                var d = new Float32Array(data);
                */

            }
        }

        return data;
    }

    getAll(){
        var body, i = this._bodies.length;

        var data = [];
        //var data = new ArrayBuffer(7 * i * 4);

        while (i--) {

            body = this._bodies[i];

            var px = +body.position.x.toFixed(4);
            var py = +body.position.y.toFixed(4);
            var pz = +body.position.z.toFixed(4);
            var position = {x:px,y:py,z:pz};

            var qw = +body.quaternion.w.toFixed(4);
            var qx = +body.quaternion.x.toFixed(4);
            var qy = +body.quaternion.y.toFixed(4);
            var qz = +body.quaternion.z.toFixed(4);
            var quaternion = {w:qw,x:qx,y:qy,z:qz};

            var id = body.id;
            var candidate = body.candidate;
            var reTransaction = body.reTransaction;

            //data.push({ id: id, p: position, q: quaternion, c: candidate, rt: reTransaction});
            data.push({ id: id, p: position, q: quaternion });

        }

        return data;
    }

    get bodies(){
        return this._bodies;
    }

}

module.exports = Transactions;
