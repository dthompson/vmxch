function(doc) { 
  emit(doc.geometry, {id: doc._id, geometry: doc.geometry});
};