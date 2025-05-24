function getPath(element) {
  if (!(element instanceof Element)) return null

  const path = []
  let currentElement = element

  while (
    currentElement !== document.documentElement &&
    currentElement !== null
  ) {
    let selector = currentElement.nodeName.toLowerCase()

    if (currentElement.id) {
      selector += `#${currentElement.id}`
    }

    const classList = Array.from(currentElement.classList)
    if (classList.length > 0) {
      selector += "." + classList.join(".")
    }

    if (!currentElement.id) {
      const siblings = Array.from(currentElement.parentNode.children)
      const sameTypeSiblings = siblings.filter(
        (sibling) => sibling.nodeName === currentElement.nodeName
      )

      if (sameTypeSiblings.length > 1) {
        const index = siblings.indexOf(currentElement) + 1
        selector += `:nth-child(${index})`
      }
    }

    path.unshift(selector)
    currentElement = currentElement.parentNode
  }

  if (currentElement === document.documentElement) {
    path.unshift("html")
  }

  if (path[0] !== "body" && path[1] !== "body") {
    path.splice(1, 0, "body")
  }

  return path.join(" ")
}

module.exports = {
  getPath,
}
