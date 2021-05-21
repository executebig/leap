/**
    Module page routing & rendering
*/

const router = require('express').Router()

// Represents an array of module objects
let modules = [
  {
    id: '53a78ae7-ff40-41d4-8523-6fbf02fe62d4', // UUIDv4
    title: 'Blinking Lights',
    thumbnailUrl: '<WIP | url to image>',
    description: 'Create a ring of blinking lights using iterative loops & Adafruit MakeCode.',
    // HTML body content
    content: `
<h2>Module Introduction</h2>
<p>Ever played with the old-school toy “Simon Says”? Well, you’ll be building that this week! You’ll be receiving an Adafruit Circuit Playground Express kit in the mail, and you’ll be building the full game with the board!</p>
<h2>Basic Requirements</h2>
<ul>
  <li>Utilize at least 2 forms of outputs and 2 different types of sensors</li>
  <li>Make a functional game!</li>
  <li>Make it playable!</li>
</ul>
`,
    points: 1
  }
]

// TODO: Implement db queries for module & authorized access
router.get('/:uuid', (req, res, next) => {
  // Simulate db query for module based on id
  const module = modules.find((e) => e.id === req.params.uuid)

  // Simulate auth check for module
  const authorized = true

  if (!module || !authorized) next()

  res.render('pages/module', {
    title: module.title,
    data: module
  })
})

module.exports = router
