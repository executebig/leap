/**
    @author Mingjie Jiang, Brian Xiang
    Controls all the modules routes
 */

const router = require('express').Router()

// Temporary test object to simulate network req
const debugData = {
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

router.get('/', (req, res) => {
  return res.render('pages/modules', {
    title: 'Modules',
    data: debugData
  })
})

module.exports = router
