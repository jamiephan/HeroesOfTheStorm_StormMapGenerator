import { useState } from "react";
import { LSFiles, LSKey, LSBool } from "../helpers/localStorage"

const dataTypes = new Map()


function useLocalStorage(key, defaultValue, type) {
  if (!(type === "key" || type === "file" || type === "bool")) throw new Error("useLocalStorage() type must be either file,  key or bool")

  const [storedValue, setStoredValue] = useState(() => {
    dataTypes.set(key, type)

    if (type === "key") {
      const LSKeyValue = LSKey.Get(key)
      if (LSKeyValue === "" || LSKeyValue === null) {
        LSKey.Save(key, defaultValue)
        return defaultValue
      } else {
        return LSKeyValue
      }
    }

    if (type === "file") {
      const LSFilesValue = LSFiles.Get(key)
      if (LSFiles.Get(key).length === 0 || LSFilesValue === null) {
        LSFiles.Save(key, defaultValue)
        return defaultValue
      } else {
        return LSFilesValue
      }
    }

    if (type === "bool") {
      const LSBoolValue = LSBool.Get(key)
      if (LSBoolValue === false) {
        LSBool.Save(key, defaultValue)
      }
      return LSBool.Get(key)
    }

  });

  const setValue = (value) => {

    const savingValue = value instanceof Function ? value(storedValue) : value;

    const type = dataTypes.get(key)
    if (type === "key") {
      LSKey.Save(key, savingValue)
    }
    if (type === "file") {
      LSFiles.Save(key, savingValue)
    }
    if (type === "bool") {
      LSBool.Save(key, savingValue)
    }
    setStoredValue(savingValue);

  };
  return [storedValue, setValue];
}

export default useLocalStorage