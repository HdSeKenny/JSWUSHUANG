// quite untested, adapted from BigstickCarpet's gist, attempt to make it simpler to use

function openIndexedDB(fileindex) {
  // This works on all devices/browsers, and uses IndexedDBShim as a final fallback
  const indexedDB =
    window.indexedDB ||
    window.mozIndexedDB ||
    window.webkitIndexedDB ||
    window.msIndexedDB ||
    window.shimIndexedDB
  const openDB = indexedDB.open('dkp_database', 1)

  openDB.onupgradeneeded = function() {
    const db = {}
    db.result = openDB.result
    db.store = db.result.createObjectStore('dkp_objects_store', { keyPath: 'id' })
    if (fileindex) db.index = db.store.createIndex('name_index', fileindex)
  }

  return openDB
}

function getStoreIndexedDB(openDB) {
  const db = {}
  db.result = openDB.result
  db.tx = db.result.transaction('dkp_objects_store', 'readwrite')
  db.store = db.tx.objectStore('dkp_objects_store')
  db.index = db.store.index('name_index')

  return db
}

function saveIndexedDB(filename, filedata, fileindex) {
  const openDB = openIndexedDB(fileindex)

  openDB.onsuccess = function() {
    var db = getStoreIndexedDB(openDB)

    db.store.put({ id: filename, data: filedata })
  }

  return true
}

// function findIndexedDB(filesearch, callback) {
//   return loadIndexedDB(null, callback, filesearch)
// }

function loadIndexedDB(filename, filesearch, callback) {
  var openDB = openIndexedDB()

  openDB.onsuccess = function() {
    var db = getStoreIndexedDB(openDB)

    var getData
    if (filename) {
      getData = db.store.get(filename)
    } else {
      getData = db.index.get(filesearch)
    }

    getData.onsuccess = function() {
      callback(getData.result.data)
    }

    db.tx.oncomplete = function() {
      db.result.close()
    }
  }

  return true
}

// function example () {
//   var fileindex = ["name.last", "name.first"];
//   saveIndexedDB(12345, {name: {first: "John", last: "Doe"}, age: 42});
//   saveIndexedDB(67890, {name: {first: "Bob", last: "Smith"}, age: 35}, fileindex);

//   loadIndexedDB(12345, callbackJohn);
//   findIndexedDB(["Smith", "Bob"], callbackBob);
// }

// function callbackJohn(filedata) {
//   console.log(filedata.name.first)
// }

// function callbackBob(filedata) {
//   console.log(filedata.name.first)
// }

const _indexdb = {
  save: saveIndexedDB,
  get: loadIndexedDB,
}

export default _indexdb
