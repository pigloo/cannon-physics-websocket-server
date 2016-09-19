 "use strict";

const CANNON = require('cannon');

class Tweets{
    constructor(world){
        this._world = world;

        this._bodies = [];
        this._ToRad = 0.0174532925199432957;

        this._tweetShape = new CANNON.Sphere(0.2);
        this._reTweetShape = new CANNON.Sphere(0.15);
    }

    addTweet(candidate,reTweet){

        var shape = this._tweetShape;

        /*
        if(reTweet === false){
            shape = this._tweetShape;
        }else {
            shape = this._reTweetShape;
        }


        if(candidate === 0){
            material = this._trumpMaterial;
        }else{
            material = this._hillaryMaterial;
        }
        */

        var position = this.randomPosition();
        //var rotation = this.randomRotation();
        var linearVelocity = this.randomLinearVelocity(40);
        var angularVelocity = this.randomAngularVelocity(40);

        var body = new CANNON.Body({
          mass: 100,
          //material: sphereMaterial
        });

        body.addShape(shape);
        body.position.copy(position);
        //body.quaternion.copy(rotation);
        //body.angularVelocity.copy(angularVelocity);
        //body.velocity.copy(linearVelocity);

        body.linearDamping = 0.1;
        body.angularDamping = 0.05;

        body.candidate = candidate;

        var i = this._bodies.length;
        this._bodies[i] = body;

        this._world.add(body);

        //console.log('body added');

        /*
        body.addEventListener("collide", function(e){
          console.log(e);
        });
        body.removeEventListener("collide", function(e){
          console.log("event listener removed");
          console.log(e);
        });
        */
    }

    randomPosition(){
        var x = -2.5 + Math.random() * 5;
        var y = 50;
        var z = -2.5 + Math.random() * 5;

        var position = new CANNON.Vec3(x, y, z);

        return position;
    }

    /*
    randomRotation(){
        var rx = (Math.floor((Math.random() * 360) + 1)) * this._ToRad;
        var ry = (Math.floor((Math.random() * 360) + 1)) * this._ToRad;
        var rz = (Math.floor((Math.random() * 360) + 1)) * this._ToRad;

        var e = new THREE.Euler();
        e.set(rx, ry, rz);
        var q = new THREE.Quaternion();
        q.setFromEuler(e);

        return q;
    }
    */

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

    updatePhysics(){
        var body, i = this._bodies.length;

        var data = [];

        while (i--) {
            body = this._bodies[i];

            if (body.position.y < -50) {
                this._world.removeBody(this._bodies[i]);
                this._bodies.splice(i, 1);
                //console.log('body removed');
            }else {

                var x = body.position.x.toFixed(4);
                var y = body.position.y.toFixed(4);
                var z = body.position.z.toFixed(4);
                var position = {x:x,y:y,z:z};

                var w = body.quaternion.w.toFixed(4);
                var x = body.quaternion.x;//.toFixed(4);
                var y = body.quaternion.y;//.toFixed(4);
                var z = body.quaternion.z;//.toFixed(4);

                var rotation = {w:w,x:x,y:y,z:z};

                var candidate = body.candidate;

                data[i] = { p: position, r: rotation, c: candidate};
            }
        }

        return data;
    }

    get bodies(){
        return this._bodies;
    }

}

module.exports = Tweets;
