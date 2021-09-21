const DKP_DB_NAME = 'DKPSSync'
const CURRENT_DB_SCHEMA_VERSION = 1

let _db

const getDKPIndexedStore = () => new Promise((resolve, reject) => {
  if (_db) {
    const tx = _db.transaction(DKP_DB_NAME, 'readwrite')
    const store = tx.objectStore(DKP_DB_NAME)
    return resolve(store)
  }
  const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB
  if (indexedDB) {
    const open = indexedDB.open('DkpSystem', CURRENT_DB_SCHEMA_VERSION)
    open.onupgradeneeded = (event) => {
      // schema for version 1
      const db = event.target.result
      db.createObjectStore(DKP_DB_NAME, { keyPath: 'key' })
    }

    open.onsuccess = (event) => {
      _db = event.target.result
      const tx = _db.transaction(DKP_DB_NAME, 'readwrite')
      const store = tx.objectStore(DKP_DB_NAME)
      resolve(store)
    }
  }
  else {
    // eslint-disable-next-line no-console
    console.log('client did not support indexedDB, saved report sync disabled')
  }
})

const getSavedDKPData = (store) => new Promise((resolve) => {
  const savedDKPData = store.get('savedDKPData')
  savedDKPData.onsuccess = (event) => {
    const { result } = event.target
    if (result) {
      console.log('getSavedDKPData success')
      return resolve(result.value)
    }
    // return the default value
    return resolve(null)
  }
})

const clearAll = (store) => new Promise((resolve, reject) => {
  const clear = store.clear()
  clear.onsuccess = () => {
    resolve()
  }
  clear.onerror = (event) => {
    const { errorCode } = event.target
    reject('indexedDB: error on clear.', errorCode)
  }
})

const dbHelper = {
  update(savedDKPData) {
    return getDKPIndexedStore().then((store) => {
      store.put({ key: 'savedDKPData', value: savedDKPData })
    })
  },

  get() {
    return getDKPIndexedStore().then((store) => {
      return getSavedDKPData(store)
    })
  },

  clearAllForLogin() {
    return getDKPIndexedStore().then((store) => {
      return clearAll(store)
    })
  }
}

export default dbHelper
