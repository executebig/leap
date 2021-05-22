/**
    @author Mingjie Jiang, Brian Xiang
    Controls all the modules routes
 */

const router = require('express').Router()

// Temporary test object to simulate network req
const debugModulesProject = {
  project: {
    title: '“Simon Says”',
    description:
      'This is a hardware task. You’ll be getting a hardware kit in the mail, and you’ll be expected to complete the design.',
    type: 'Learning Task',
    thumbnailUrl: '<WIP | url to image>',
    numModulesRequired: 3,
    numModulesAvailable: 6
  },
  modulesRequired: [
    {
      id: '53a78ae7-ff40-41d4-8523-6fbf02fe62d4',
      title: 'Blinking Lights',
      description: 'Create a ring of blinking lights using iterative loops & Adafruit MakeCode.',
      points: 1
    },
    {
      id: '53a78ae7-ff40-41d4-8523-6fbf02fe62d4',
      title: 'Blinking Lights',
      description: 'Create a ring of blinking lights using iterative loops & Adafruit MakeCode.',
      points: 1
    },
    {
      id: '53a78ae7-ff40-41d4-8523-6fbf02fe62d4',
      title: 'Blinking Lights',
      description: 'Create a ring of blinking lights using iterative loops & Adafruit MakeCode.',
      points: 1
    }
  ],
  modulesOptional: [
    {
      id: '53a78ae7-ff40-41d4-8523-6fbf02fe62d4',
      title: 'Blinking Lights',
      description: 'Create a ring of blinking lights using iterative loops & Adafruit MakeCode.',
      points: 1
    },
    {
      id: '53a78ae7-ff40-41d4-8523-6fbf02fe62d4',
      title: 'Blinking Lights',
      description: 'Create a ring of blinking lights using iterative loops & Adafruit MakeCode.',
      points: 1
    },
    {
      id: '53a78ae7-ff40-41d4-8523-6fbf02fe62d4',
      title: 'Blinking Lights',
      description: 'Create a ring of blinking lights using iterative loops & Adafruit MakeCode.',
      points: 1
    },
    {
      id: '53a78ae7-ff40-41d4-8523-6fbf02fe62d4',
      title: 'Blinking Lights',
      description: 'Create a ring of blinking lights using iterative loops & Adafruit MakeCode.',
      points: 1
    },
    {
      id: '53a78ae7-ff40-41d4-8523-6fbf02fe62d4',
      title: 'Blinking Lights',
      description: 'Create a ring of blinking lights using iterative loops & Adafruit MakeCode.',
      points: 1
    },
    {
      id: '53a78ae7-ff40-41d4-8523-6fbf02fe62d4',
      title: 'Blinking Lights',
      description: 'Create a ring of blinking lights using iterative loops & Adafruit MakeCode.',
      points: 1
    },
    {
      id: '53a78ae7-ff40-41d4-8523-6fbf02fe62d4',
      title: 'Blinking Lights',
      description: 'Create a ring of blinking lights using iterative loops & Adafruit MakeCode.',
      points: 1
    }
  ]
}

// Represents an array of module objects
const debugModules = [
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

router.get('/', (req, res) => {
  return res.render('pages/modules', {
    title: 'Modules',
    data: debugModulesProject
  })
})

// TODO: Implement db queries for module & authorized access
router.get('/:uuid', (req, res, next) => {
  // Simulate db query for module based on id
  const module = debugModules.find((e) => e.id === req.params.uuid)

  // Simulate additional auth check (ensure user specifically has access to module)
  const authorized = true

  if (!module || !authorized) next()

  res.render('pages/module', {
    title: module.title,
    data: module
  })
})


module.exports = router
