const {getPath} = require('./getPath')

describe("getPath", () => {
  beforeEach(() => {
    document.body.innerHTML = `
        <div id="container">
          <ul class="list">
            <li class="item">Item 1</li>
            <li class="item active">Item 2</li>
            <li class="item">Item 3</li>
          </ul>
          <div class="footer">
            <p>Some text</p>
            <button id="submit-btn" class="btn primary">Submit</button>
          </div>
        </div>
      `
  })

  it("should return null for non-element input", () => {
    expect(getPath(null)).toBeNull()
    expect(getPath(undefined)).toBeNull()
    expect(getPath("string")).toBeNull()
    expect(getPath(123)).toBeNull()
    expect(getPath({})).toBeNull()
  })

  it("should return correct path for element with ID", () => {
    const button = document.getElementById("submit-btn")
    const path = getPath(button)
    expect(path).toBe(
      "html body div#container div.footer button#submit-btn.btn.primary"
    )
    expect(document.querySelector(path)).toBe(button)
  })

  it("should return correct path for element without ID", () => {
    const secondItem = document.querySelectorAll(".item")[1]
    const path = getPath(secondItem)
    expect(path).toBe(
      "html body div#container ul.list li.item.active:nth-child(2)"
    )
    expect(document.querySelector(path)).toBe(secondItem)
  })

  it("should return unique selector", () => {
    const firstItem = document.querySelector(".item")
    const path = getPath(firstItem)
    const elements = document.querySelectorAll(path)
    expect(elements.length).toBe(1)
    expect(elements[0]).toBe(firstItem)
  })

  it("should work for body element", () => {
    const path = getPath(document.body)
    expect(path).toBe("html body")
    expect(document.querySelector(path)).toBe(document.body)
  })
})
