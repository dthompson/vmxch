function(head, req) {
    var row, out, startedOutput = false;

    // Send the same Content-Type as CouchDB would
    if (req.headers.Accept.indexOf('application/json')!=-1)
      start({"headers":{"Content-Type" : "application/json"}});
    else
      start({"headers":{"Content-Type" : "text/plain"}});

    if ('callback' in req.query) send(req.query['callback'] + "(");

    send('{"type": "FeatureCollection", "features":[');
    while (row = getRow()) {
      if (startedOutput) send(",\n");
      out = '{"type": "Feature", "geometry": ' + JSON.stringify(row.value.geometry);
      delete row.value.geometry;
      out += ', "properties": ' + JSON.stringify(row.value) + '}';
      send(out);
      startedOutput = true;
    }
    send("\n]}");
    if ('callback' in req.query) send(")");
};
