vmx's Helper Functions for CouchDB
==================================

This is a small CouchApp that contains some functions for CouchDB that might
be useful for others as well.

Installing
-------------
* Install the couchapp command line utility
* Clone and enter into this repo
* Execute: "couchapp init"
* Push to the couchdb of choice: couchapp push http://yourcouch/yourdb
* These helpers will now be accessible from http://yourcouch/yourdb/_design/geo

spatial
-------

### points ###

A very simple GeoCouch query that accepts an OpenSearch formatted bounding box parameter and returns all matching geometries within that bounding box.

Example:

    $ curl -X GET 'http://localhost:5984/yourdb/_design/geo/_spatial/points/bbox=-122.677,45.523,-122.675,45.524'
    {"rows":[     
    {"id":"ef512bfdc9b17e9827f7275dd09af1d7","bbox":[-122.675639,45.524063,-122.675639,45.524063],"value":{"id":"ef512bfdc9b17e9827f7275dd09af1d7","geometry":{"coordinates":[-122.675639,45.524063],"type":"Point"}}},
    {"id":"ef512bfdc9b17e9827f7275dd06638b4","bbox":[-122.676609,45.523206,-122.676609,45.523206],"value":{"id":"ef512bfdc9b17e9827f7275dd06638b4","geometry":{"coordinates":[-122.676609,45.523206],"type":"Point"}}},
    {"id":"ef512bfdc9b17e9827f7275dd07d59c0","bbox":[-122.676634,45.523667,-122.676634,45.523667],"value":{"id":"ef512bfdc9b17e9827f7275dd07d59c0","geometry":{"coordinates":[-122.676634,45.523667],"type":"Point"}}}
    ]}

views
-----

### all ###

A simple map function that returns all documents. It's like _all_docs, but
you can apply list functions to it

Example:

    $ curl -X GET 'http://localhost:5984/yourdb/_design/geo/_view/all'
    {"total_rows":3,"offset":0,"rows":[
    {"id":"doc1","key":null,"value":{"_id":"doc1","_rev":"1-fcc4a130df1a91f981a80bed05e5d2ab","color":"blue"}},
    {"id":"doc2","key":null,"value":{"_id":"doc2","_rev":"1-5f9b73300433277490f800eae6fd321d","color":"red"}},
    {"id":"doc3","key":null,"value":{"_id":"doc3","_rev":"1-5660e74843228d3f73f7f3ad7c56efcf","color":"green"}}
    ]}


lists
-----

### count ###

Returns the number of items within the result, instead of the result itself.

Examples:

    $ curl -X GET 'http://localhost:5984/yourdb/_design/geo/_list/count/all'
    {"count": 3}

    $ curl -X GET 'http://localhost:5984/yourdb/_design/geo/_list/count/all?limit=1'
    {"count": 1}

### filter ###

**WARNING**: This is really a hack and potentially insecure, **don't** use it in
production.

You can filter dynamically on attributes in a document. The value you pass in
with the filter parameter get `eval()`ed in the if statement.

Examples:

    $ curl -X GET 'http://localhost:5984/yourdb/_design/geo/_list/filter/all?filter=doc.color=="blue"'
    {"rows":[
    {"_id":"doc1","_rev":"1-fcc4a130df1a91f981a80bed05e5d2ab","color":"blue"}
    ]}

    $ curl -X GET 'http://localhost:5984/yourdb/_design/geo/_list/filter/all?filter=doc.color=="blue"||doc.color=="red"'
    {"rows":[
    {"_id":"doc1","_rev":"1-fcc4a130df1a91f981a80bed05e5d2ab","color":"blue"}
    {"_id":"doc2","_rev":"1-5f9b73300433277490f800eae6fd321d","color":"red"}
    ]}

### geojson ###

This function outputs a GeoJSON FeatureCollection (compatible with
OpenLayers). The geometry is stored in the `geometry` property, all
other properties in the `properties` property.

Examples:

    $ curl -X PUT -d '{"type":"Feature", "color":"orange" ,"geometry":{"type":"Point","coordinates":[11.395,48.949444]}}' 'http://localhost:5984/yourdb/myfeature'
    {"ok":true,"id":"myfeature","rev":"1-2eeb1e5eee6c8e7507b671aa7d5b0654"}

    $ curl -X GET 'http://localhost:5984/yourdb/_design/geo/_list/geojson/all'
    {"type": "FeatureCollection", "features":[{"type": "Feature", "geometry": {"type":"Point","coordinates":[11.395,48.949444]}, "properties": {"_id":"myfeature","_rev":"1-2eeb1e5eee6c8e7507b671aa7d5b0654","type":"Feature","color":"orange"}}


### radius ###

This will take the centroid of the bbox parameter and a supplied radius parameter in meters and filter the rectangularly shaped bounding box result set by circular radius.

**WARNING** This only works with on points, not lines or polygons yet

Example:

    $ curl -X GET 'http://localhost:5984/mydb/_design/geo/_spatiallist/radius/points?bbox=-122.677,45.523,-122.675,45.524&radius=50'
    {"rows":[{"id":"ef512bfdc9b17e9827f7275dd07d59c0","geometry":{"coordinates":[-122.676634,45.523667],"type":"Point"}},
    {"id":"ef512bfdc9b17e9827f7275dd07f4316","geometry":{"coordinates":[-122.676649,45.523966],"type":"Point"}},
    {"id":"ef512bfdc9b17e9827f7275dd08985a9","geometry":{"coordinates":[-122.676652,45.524034],"type":"Point"}}]};

### cluster ###

This groups points into clusters based on proximity. You can supply a threshold (distance in km) which detrimines how much area each cluster covers. 

Some code inspiration from Marker Clusterer - found here: http://code.google.com/p/gmaps-utility-library/


**WARNING** This only works with on points, not lines or polygons (not sure how that would be useful yet)


Example:

    $ curl -X GET 'http://localhost:5984/mydb/_design/geo/_spatiallist/cluster/points?bbox=-122.677,45.523,-122.675,45.524&threshold=50'
    {"rows":[{"center":{"type":"Point","coordinates":[41.35646666666667,1.6144666666666663]},
     "points":[
      {"id":"20132885373657090","geo":{"type":"Point","coordinates":[41.3401,1.3596]}},
      {"id":"20138805986066430","geo":{"type":"Point","coordinates":[41.3493,1.3631]}},
      {"id":"16451998282944512","geo":{"type":"Point","coordinates":[41.38,2.1207]}}],"size":3}]}

