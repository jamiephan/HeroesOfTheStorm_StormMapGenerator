const localStorageFilesParser = type => {
  type = type.toLowerCase()
  // Read and validate from LocalStorage
  let localStorageFiles = localStorage.getItem(localStorageFilesName(type))
  // Try JSON encode it
  try {
    localStorageFiles = JSON.parse(localStorageFiles)
    let error = false
    // Check the data type
    if (Array.isArray(localStorageFiles)) {

      for (const file of localStorageFiles) {
        if (typeof file.name === "string" &&
          file.name !== "" &&
          file.name.toLocaleLowerCase().endsWith(("." + type)) &&
          typeof file.content === "string") {
          // Pass
        } else {
          localStorageFilesResetter(type, [])
          return []
        }
      }

      if (error) {
        localStorageFilesResetter(type, [])
        return []
      }

      // Check name Duplicate
      if ([...new Set(localStorageFiles.map(x => x.name.toLowerCase()))].length !== localStorageFiles.length) {
        // Same name
        localStorageFilesResetter(type, [])
        return []
      }

      return localStorageFiles

    } else {
      // Not array
      localStorageFilesResetter(type, [])
      return []
    }

  } catch (e) {
    // Not JSON
    localStorageFilesResetter(type, [])
    return []
  }
}

const localStorageFilesSaver = (type, content) => {
  let contentString = ""
  switch (typeof content) {
    case "object":
      contentString = JSON.stringify(content)
      break;
    case "undefined":
      contentString = ""
      break;
    case "string":
      contentString = content
      break;

    default:
      contentString = content.toString()
      break;
  }

  window.localStorage.setItem(localStorageFilesName(type), contentString)
}
const localStorageFilesName = type => "files_" + type.toLocaleLowerCase()
const localStorageFilesResetter = type => localStorageFilesSaver(type, [])

// ========================

const localStorageKeyParser = type => {
  type = type.toLowerCase()
  try {
    return localStorage.getItem(localStorageKeyName(type))
  } catch (e) {
    localStorageKeyResetter(type)
    return ""
  }
}
const localStorageKeySaver = (type, content) => window.localStorage.setItem(localStorageKeyName(type), content.toString())
const localStorageKeyName = type => "key_" + type.toLocaleLowerCase()
const localStorageKeyResetter = type => localStorageKeySaver(type, "")

// ===========================

const localStorageBoolParser = type => {
  type = type.toLowerCase()
  try {
    return Boolean(parseInt(localStorage.getItem(localStorageBoolName(type))))
  } catch (e) {
    localStorageBoolResetter(type)
    return false
  }
}
const localStorageBoolSaver = (type, content) => window.localStorage.setItem(localStorageBoolName(type), content ? "1" : "0")
const localStorageBoolName = type => "bool_" + type.toLocaleLowerCase()
const localStorageBoolResetter = type => localStorageBoolSaver(type, false)

// ===========================

const localStorageArrayParser = type => {
  type = type.toLowerCase()
  try {
    // return Boolean(parseInt(localStorage.getItem(localStorageArrayName(type))))
    const result = JSON.parse(localStorage.getItem(localStorageArrayName(type)))
    if (Array.isArray(result)) {
      return result
    }
    localStorageArrayResetter(type)
    return []
  } catch (e) {
    localStorageArrayResetter(type)
    return false
  }
}
const localStorageArraySaver = (type, content) => window.localStorage.setItem(localStorageArrayName(type), JSON.stringify(content))
const localStorageArrayName = type => "array_" + type.toLocaleLowerCase()
const localStorageArrayResetter = type => localStorageArraySaver(type, JSON.stringify([]))


export const LSFiles = {
  Name: localStorageFilesName,
  Get: localStorageFilesParser,
  Save: localStorageFilesSaver,
  Reset: localStorageFilesResetter
}

export const LSKey = {
  Name: localStorageKeyName,
  Get: localStorageKeyParser,
  Save: localStorageKeySaver,
  Reset: localStorageKeyResetter
}

export const LSBool = {
  Name: localStorageBoolName,
  Get: localStorageBoolParser,
  Save: localStorageBoolSaver,
  Reset: localStorageBoolResetter
}

export const LSArray = {
  Name: localStorageArrayName,
  Get: localStorageArrayParser,
  Save: localStorageArraySaver,
  Reset: localStorageArrayResetter
}

