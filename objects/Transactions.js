"use strict";

const CANNON = require('cannon');

class Transactions{
    constructor(world, sphereMaterial){
        this._world = world;
        this._sphereMaterial = sphereMaterial;

        this._bodies = [];
        this._ToRad = 0.0174532925199432957;
        this._lastId = 1;

        //this._TransactionShape = new CANNON.Sphere(0.2);

        //ROTATE CYLINDER TO MATCH THREE.JS ORIENTATION

        this._TransactionShape = new CANNON.Cylinder(0.4,0.4,0.1,16);
        var q = new CANNON.Quaternion();
        q.setFromAxisAngle(new CANNON.Vec3(1,0,0),Math.PI / 2);
        this._TransactionShape.transformAllPoints(new CANNON.Vec3(),q);
        
    }

    getNextId() {
      // Resets integer
      if (this._lastId > 2147483647) {
          this._lastId = 1;
      }
      return this._lastId++;
    }

    addTransaction(broadcast){

        //var identifier = this.generateId();
        var identifier = this.getNextId();

        var shape;

        shape = this._TransactionShape;

        var position = this.randomPosition();
        var rotation = this.randomRotation();
        var linearVelocity = this.randomLinearVelocity(1);
        var angularVelocity = this.randomAngularVelocity(10);

        var body = new CANNON.Body({
            mass: 10,
            material: this._sphereMaterial,
        });

        body.addShape(shape);

        body.position.copy(position);
        body.quaternion.copy(rotation);
        body.angularVelocity.copy(angularVelocity);
        body.velocity.copy(linearVelocity);

        body.linearDamping = 0;//0.25;
        body.angularDamping = 0;//0.25;

        var i = this._bodies.length;
        this._bodies[i] = body;

        this._world.add(body);

        body.id = identifier;
        var quaternion = body.quaternion;

        //NECCESARY???

        var px = +body.position.x.toFixed(4);
        var py = +body.position.y.toFixed(4);
        var pz = +body.position.z.toFixed(4);
        position = {x:px,y:py,z:pz};

        var qw = +body.quaternion.w.toFixed(4);
        var qx = +body.quaternion.x.toFixed(4);
        var qy = +body.quaternion.y.toFixed(4);
        var qz = +body.quaternion.z.toFixed(4);
        quaternion = {w:qw,x:qx,y:qy,z:qz};

        //var data = {id: identifier, c: candidate, rt: reTransaction, p: position, q: quaternion};
        var data = {id: identifier, p: position, q: quaternion};

        //callback(data);

        var buffer = new ArrayBuffer(33);
        var view = new DataView(buffer);

        view.setUint8(0, 1); //ADD NODE CODE 1
        view.setUint32(1, data.id);
        view.setFloat32(5, data.p.x);
        view.setFloat32(9, data.p.y);
        view.setFloat32(13, data.p.z);
        view.setFloat32(17, data.q.w);
        view.setFloat32(21, data.q.x);
        view.setFloat32(25, data.q.y);
        view.setFloat32(29, data.q.z);

        //console.log(view.getUint32(1));

        broadcast(buffer, { binary: true, mask: true });

    }

    /*
    generateId(){
        var S4 = function() {
            return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
        };
        return (S4()+S4());
    }
    */

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

    updatePositions(broadcast){
        var body, i = this._bodies.length;

        var data = [];

        while (i--) {
            body = this._bodies[i];
            var id = body.id;

            if (body.position.y < -10) {
                this._world.removeBody(this._bodies[i]);
                this._bodies.splice(i, 1);
                //console.log('body removed');
                //this._removeTransaction({id:id});
                var buffer = new ArrayBuffer(5);
                var view = new DataView(buffer);

                view.setUint8(0, 2); //REMOVE NODE CODE 2
                view.setUint32(1, id);
                broadcast(buffer, { binary: true, mask: true });

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

                data.push({ id: id, p: position, q: quaternion });

            }
        }

        //DIRTY BUT FOR NOW CONVERT JS ARRAY TO BINARY

        var length = data.length;
        var buffer = new ArrayBuffer(2 + (length * 32));
        var view = new DataView(buffer);
        var i32 = 0;

        view.setUint8(0, 4); // ALL CODE 4
        view.setUint8(1, length); // HOW MANY OBJECTS
        for(i=0; i<length; i++){
            i32 = i * 32;
            view.setUint32(2+i32+0, data[i].id);
            view.setFloat32(2+i32+4, data[i].p.x);
            view.setFloat32(2+i32+8, data[i].p.y);
            view.setFloat32(2+i32+12, data[i].p.z);
            view.setFloat32(2+i32+16, data[i].q.w);
            view.setFloat32(2+i32+20, data[i].q.x);
            view.setFloat32(2+i32+24, data[i].q.y);
            view.setFloat32(2+i32+28, data[i].q.z);

            //console.log("should be: " + data[i].id);
            //console.log("actually is : " + view.getUint32(2+i32+0));
        }

        broadcast(buffer, { binary: true, mask: true });
    }

    getAll(user_ws){
        var body, i = this._bodies.length;

        var data = [];

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

            data.push({ id: id, p: position, q: quaternion });

        }

        var length = data.length;
        var buffer = new ArrayBuffer(2 + (length * 32));
        var view = new DataView(buffer);
        var i32 = 0;

        //console.log("Array Length: " + buffer.byteLength);
        //console.log("Update Length: " + length);

        view.setUint8(0, 8); // ALL CODE 8
        view.setUint8(1, length); // HOW MANY OBJECTS
        for(i=0; i<length; i++){
            i32 = i * 32;
            view.setUint32(2+i32+0, data[i].id);
            view.setFloat32(2+i32+4, data[i].p.x);
            view.setFloat32(2+i32+8, data[i].p.y);
            view.setFloat32(2+i32+12, data[i].p.z);
            view.setFloat32(2+i32+16, data[i].q.w);
            view.setFloat32(2+i32+20, data[i].q.x);
            view.setFloat32(2+i32+24, data[i].q.y);
            view.setFloat32(2+i32+28, data[i].q.z);
        }

        user_ws.send(buffer, { binary: true });

    }

    get bodies(){
        return this._bodies;
    }

}

module.exports = Transactions;
