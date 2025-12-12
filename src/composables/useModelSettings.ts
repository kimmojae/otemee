const DEFAULT_MODEL = 'gemma3:1b'
const STORAGE_KEY = 'selectedModel'

export const useModelSettings = () => {
  const getDefaultModel = () => {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_MODEL
  }

  const setDefaultModel = (model: string) => {
    localStorage.setItem(STORAGE_KEY, model)
  }

  return {
    DEFAULT_MODEL,
    getDefaultModel,
    setDefaultModel,
  }
}
