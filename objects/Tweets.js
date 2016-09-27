"use strict";

const CANNON = require('cannon');

class Tweets{
    constructor(world, sphereMaterial, removeTweet){
        this._world = world;
        this._sphereMaterial = sphereMaterial;

        this._removeTweet = removeTweet;

        this._bodies = [];
        this._ToRad = 0.0174532925199432957;

        this._tweetShape = new CANNON.Sphere(0.2);
        this._reTweetShape = new CANNON.Sphere(0.15);
    }

    addTweet(candidate,reTweet,callback){

        var identifier = this.generateId();

        var shape;

        if(reTweet !== 1){
            shape = this._tweetShape;
        }else{
            shape = this._reTweetShape;
        }

        var position = this.randomPosition();
        var rotation = this.randomRotation();
        //var linearVelocity = this.randomLinearVelocity(1);
        //var angularVelocity = this.randomAngularVelocity(100);

        var body = new CANNON.Body({
            mass: 10,
            material: this._sphereMaterial
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

        body.candidate = candidate;
        body.reTweet = reTweet;
        body.id = identifier;
        var quaternion = body.quaternion;

        var data = {id: identifier, c: candidate, rt: reTweet, p: position, q: quaternion};

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

            if (body.position.y < -50) {
                this._world.removeBody(this._bodies[i]);
                this._bodies.splice(i, 1);
                //console.log('body removed');
                this._removeTweet({id:id});
            } else if (body.sleepState !== 2) {

                var px = body.position.x.toFixed(4);
                var py = body.position.y.toFixed(4);
                var pz = body.position.z.toFixed(4);
                var position = {x:px,y:py,z:pz};

                var qw = body.quaternion.w.toFixed(4);
                var qx = body.quaternion.x;//.toFixed(4);
                var qy = body.quaternion.y;//.toFixed(4);
                var qz = body.quaternion.z;//.toFixed(4);

                var quaternion = {w:qw,x:qx,y:qy,z:qz};

                var candidate = body.candidate;
                var reTweet = body.reTweet;

                data.push({ id: id, p: position, q: quaternion, c: candidate, rt: reTweet });

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

            var px = body.position.x.toFixed(4);
            var py = body.position.y.toFixed(4);
            var pz = body.position.z.toFixed(4);
            var position = {x:px,y:py,z:pz};

            var qw = body.quaternion.w.toFixed(4);
            var qx = body.quaternion.x;//.toFixed(4);
            var qy = body.quaternion.y;//.toFixed(4);
            var qz = body.quaternion.z;//.toFixed(4);

            var quaternion = {w:qw,x:qx,y:qy,z:qz};

            var id = body.id;
            var candidate = body.candidate;
            var reTweet = body.reTweet;

            data.push({ id: id, p: position, q: quaternion, c: candidate, rt: reTweet});

        }

        return data;
    }

    get bodies(){
        return this._bodies;
    }

}

module.exports = Tweets;
