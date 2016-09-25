const CANNON = require('cannon');

module.exports = function funnel(radius, tube, radialSegments, tubularSegments, arc) {
    radius = radius || 1;
    tube = tube || 0.5;
    radialSegments = radialSegments || 8;
    tubularSegments = tubularSegments || 6;
    arc = arc || Math.PI * 2;

    var thetaStart = 1.5;
    var thetaLength = Math.PI;

    var thetaEnd = thetaStart + thetaLength;

    var vertices = [];
    var indices = [];

    for ( var j = 0; j <= radialSegments; j ++ ) {
        for ( var i = 0; i <= tubularSegments; i ++ ) {
            var u = i / tubularSegments * arc; //PHI
            var v = j / radialSegments * Math.PI * 0.5; //THETA

            var x = ( radius + tube * Math.cos( thetaStart + v ) ) * Math.cos( u );
            var y = ( radius + tube * Math.cos( thetaStart + v ) ) * Math.sin( u );
            var z = tube * Math.sin( thetaStart + v );

            vertices.push( x, y, z );
        }
    }

    for ( var j = 1; j <= radialSegments; j ++ ) {
        for ( var i = 1; i <= tubularSegments; i ++ ) {
            var a = ( tubularSegments + 1 ) * j + i - 1;
            var b = ( tubularSegments + 1 ) * ( j - 1 ) + i - 1;
            var c = ( tubularSegments + 1 ) * ( j - 1 ) + i;
            var d = ( tubularSegments + 1 ) * j + i;

            indices.push(a, b, d);
            indices.push(b, c, d);
        }
    }

    return new CANNON.Trimesh(vertices, indices);
};
