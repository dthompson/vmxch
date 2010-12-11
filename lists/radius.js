function(head, req) {
    var row;
    // Send the same Content-Type as CouchDB would
    if (req.headers.Accept.indexOf('application/json')!=-1)
      start({"headers":{"Content-Type" : "application/json"}});
    else
      start({"headers":{"Content-Type" : "text/plain"}});

    function isPointInPoly(poly, pt) {
      for (var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
        ((poly[i][1] <= pt[1] && pt[1] < poly[j][1]) || (poly[j][1] <= pt[1] && pt[1] < poly[i][1]))
        && (pt[0] < (poly[j][0] - poly[i][0]) * (pt[1] - poly[i][1]) / (poly[j][1] - poly[i][1]) + poly[i][0])
        && (c = !c);
      return c;
    }
    
    function numberToRadius(number) {
  	   return number * Math.PI / 180;
  	}

  	function numberToDegree(number) {
  	   return number * 180 / Math.PI;
  	}
  	
    function circle(radius, center) {
      // convert degree/km to radiant
      var dist = radius / 6371;
      var radCenter = [numberToRadius(center[0]), numberToRadius(center[1])];
      // 15 sided circle; the larger the radius the more inaccurate it will be
      var steps = 15;
      var poly = [[center[0], center[1]]];
      for (var i = 0; i < steps; i++) {
      	var brng = 2 * Math.PI * i / steps;  
      	var lat = Math.asin(Math.sin(radCenter[0]) * Math.cos(dist) + 
                  Math.cos(radCenter[0]) * Math.sin(dist) * Math.cos(brng));
      	var lng = radCenter[1] + Math.atan2(Math.sin(brng) * Math.sin(dist) *
                          Math.cos(radCenter[0]), 
                          Math.cos(dist) - Math.sin(radCenter[0]) *
                          Math.sin(lat));

          poly[i] = [];
          poly[i][0] = numberToDegree(lat);
          poly[i][1] = numberToDegree(lng);
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
      if (isPointInPoly(circle, [row.value.geometry.coordinates[0], row.value.geometry.coordinates[1]])) {
        if (started) send(",\n");
        send( JSON.stringify(row.value));
        started = true;
      }
    }
    send("]};");
    if ('callback' in req.query) send(")");
};
