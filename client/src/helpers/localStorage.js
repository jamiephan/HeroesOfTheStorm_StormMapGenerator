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
        // console.log("LS error: Same name")
        localStorageFilesResetter(type, [])
        return []
      }

      return localStorageFiles

    } else {
      // Not array
      // console.log("LS error: Not Array")
      localStorageFilesResetter(type, [])
      return []
    }

  } catch (e) {
    // Not JSON
    // console.log("LS error: Not JSON")
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

