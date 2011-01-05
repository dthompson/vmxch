function(head, req) {
    var g = require('vendor/geojson-utils'),
        row,
        threshold =100,
        startedOutput = false;
    log('called');
    if('threshold' in req.query){ threshold = req.query.threshold;}
    

    start({"headers":{"Content-Type" : "application/json"}});


    log("threshold: "+threshold);
    var pc = new g.PointCluster(parseInt(threshold));

    //if ('callback' in req.query) send(req.query['callback'] + "(");

    while (row = getRow()) {
        pc.addToClosestCluster(row.value);
    }
    log("clusters: "+pc.clusters.length);

    send(JSON.stringify({"rows":pc.getClusters()}));

    //if ('callback' in req.query) send(")");
};
