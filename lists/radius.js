function(head, req) {
    var row;
    // Send the same Content-Type as CouchDB would
    if (req.headers.Accept.indexOf('application/json')!=-1)
      start({"headers":{"Content-Type" : "application/json"}});
    else
      start({"headers":{"Content-Type" : "text/plain"}});

    function isPointInPoly(poly, pt) {
        for(var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
            ((poly[i][1] <= pt[1] && pt[1] < poly[j][1]) || (poly[j][1] <= pt[1] && pt[1] < poly[i][1]))
            && (pt[0] < (poly[j][0] - poly[i][0]) * (pt[1] - poly[i][1]) / (poly[j][1] - poly[i][1]) + poly[i][0])
            && (c = !c);
        return c;
    }
    
    function circle(radius, center) {
        // 15 sided circle; the larger the radius the more inaccurate it will be
        var steps = 15;
        var poly = [[center[0], center[1]]]
        for (var i = 0; i < steps; i++) {
            poly[i] = [];
            poly[i][0] = (center[0] + radius * Math.cos(2 * Math.PI * i / steps));
            poly[i][1] = (center[1] + radius * Math.sin(2 * Math.PI * i / steps));
        }
        return poly;
    }
    
    function rectangleCentroid(bbox) {
      var xmin = bbox[0], ymin = bbox[1], xmax = bbox[2], ymax = bbox[3];
      var xwidth = xmax - xmin;
      var ywidth = ymax - ymin;
      return [xmin + xwidth/2, ymin + ywidth/2];
    }
    
    function metersToDegrees(meters) {
      //non spherical; the larger the area the more innaccurate it will be
      return meters/111319.9;
    }
    
    var radius = metersToDegrees(JSON.parse(req.query.radius)),
        center = rectangleCentroid(JSON.parse("[" + req.query.bbox + "]")),
        callback = req.query.callback;
    
    var circle = circle(radius, center);
    
    if ('callback' in req.query) send(req.query['callback'] + "(");
    var started = false;
    send('{"rows":[');
    while (row = getRow()) {
      if( isPointInPoly( circle, [row.value.geometry.coordinates[0], row.value.geometry.coordinates[1]] ) ) {
        if(started) send(",\n");
        send( JSON.stringify(row.value));
        started = true;
      }
    }
    send("]};");
    if ('callback' in req.query) send(")");
};
