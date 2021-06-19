/** 
    @author Mingjie Jiang
    Renders Markdown content to HTML and sanitizes output
 */

const marked = require('marked')
const DOMPurify = require('isomorphic-dompurify')

module.exports = (md) => {
  // render Markdown
  const dirtyHtml = marked(md)
  // sanitize
  const cleanedHtml = DOMPurify.sanitize(dirtyHtml, {IN_PLACE: true})

  return cleanedHtml
}
