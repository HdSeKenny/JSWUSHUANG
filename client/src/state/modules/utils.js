export const getSavedState = (key) => {
  return JSON.parse(window.localStorage.getItem(key))
}

export const saveState = (key, state) => {
  window.localStorage.setItem(key, JSON.stringify(state))
}

export const clear = () => {
  window.localStorage.clear()
}
