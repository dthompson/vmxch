function(doc) {
    if (doc.geo) {
        emit({"type": "Point",
              "coordinates": [parseFloat(doc.geo.coordinates[0]), 
                              parseFloat(doc.geo.coordinates[1])]}, {id: doc._id, geo:doc.geo, image:doc.image, plink:doc.plink});    
  }
}


