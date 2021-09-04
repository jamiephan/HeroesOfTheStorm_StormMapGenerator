// Shamelessly stolen from https://www.w3schools.com/xml/xml_validator.asp

const validateXML = (xmlText) => {

  const ret = (error, message = null) => ({ error, message })

  var xt = "", h3OK = 1
  function checkErrorXML(x) {
    xt = ""
    h3OK = 1
    checkXML(x)
  }

  function checkXML(n) {
    var l, i, nam
    nam = n.nodeName
    if (nam === "h3") {
      if (h3OK === 0) {
        return;
      }
      h3OK = 0
    }
    if (nam === "#text") {
      xt = xt + n.nodeValue + "\n"
    }
    l = n.childNodes.length
    for (i = 0; i < l; i++) {
      checkXML(n.childNodes[i])
    }
  }

  function validateXMLContent(text) {

    // code for Mozilla, Firefox, Opera, etc.
    if (document.implementation.createDocument) {
      try {
        var parser = new DOMParser();
        var xmlDoc = parser.parseFromString(text, "application/xml");
      }
      catch (err) {
        return ret(true, err.message)
        // alert(err.message)
      }

      if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
        checkErrorXML(xmlDoc.getElementsByTagName("parsererror")[0]);
        return ret(true, xt)
        // alert(xt)
      }
      else {
        return ret(false)
        // alert("No errors found");
      }
    }
    else {
      return ret(true, "Your browser does not support XML syntax validation.")
      // alert('Your browser cannot handle XML validation');
    }
  }

  return validateXMLContent(xmlText)
}

export default validateXML;