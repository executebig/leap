/**
 * @author Mingjie Jiang
 * Main router for the application, handles all routing
 */
const router = require('express').Router()
const auth = require('@routes/auth')

/** Initialize auth system */
router.use(auth.router)
router.use(auth.passAuthContext)

/** Directly rendered pages */
router.get('/', (req, res) => {
  if (req.oidc.isAuthenticated()) {
    // Simulates user state -- see User & Task Interaction Megathread for more details
    // inprogress | completed | idle
    let state = 'inprogress'

    if (state === 'idle') {
      return res.render('pages/dash', {
        title: 'Dashboard',
        // Temporary test object to simulate network req
        data: {
          projects: [
            {
              title: '“Simon Says”',
              description:
                'This is a hardware task. You’ll be getting a hardware kit in the mail, and you’ll be expected to complete the design.',
              type: 'Learning Task',
              thumbnailUrl: '<WIP | url to image>',
              numModulesRequired: 3,
              numModulesAvailable: 6
            },
            {
              title: '“Ship Wreck”',
              description:
                'This is a data science task. You’ll be getting a set of data to analyze, and you’ll be expected to present your results.',
              type: 'Learning Task',
              thumbnailUrl: '<WIP | url to image>',
              numModulesRequired: 2,
              numModulesAvailable: 3
            },
            {
              title: '“Justice Matrix”',
              description:
                'This is an ethics in tech task. You’ll be given specifications and asked to design an algorithm to solve a problem ethically.',
              type: 'Learning Task',
              thumbnailUrl: '<WIP | url to image>',
              numModulesRequired: 2,
              numModulesAvailable: 8
            }
          ]
        }
      })
    } else if (state === 'inprogress') {
      return res.render('pages/modules', {
        title: 'Modules',
        // Temporary test object to simulate network req
        data: {
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
              description:
                'Create a ring of blinking lights using iterative loops & Adafruit MakeCode.',
              points: 1
            },
            {
              id: '53a78ae7-ff40-41d4-8523-6fbf02fe62d4',
              title: 'Blinking Lights',
              description:
                'Create a ring of blinking lights using iterative loops & Adafruit MakeCode.',
              points: 1
            },
            {
              id: '53a78ae7-ff40-41d4-8523-6fbf02fe62d4',
              title: 'Blinking Lights',
              description:
                'Create a ring of blinking lights using iterative loops & Adafruit MakeCode.',
              points: 1
            }
          ],
          modulesOptional: [
            {
              id: '53a78ae7-ff40-41d4-8523-6fbf02fe62d4',
              title: 'Blinking Lights',
              description:
                'Create a ring of blinking lights using iterative loops & Adafruit MakeCode.',
              points: 1
            },
            {
              id: '53a78ae7-ff40-41d4-8523-6fbf02fe62d4',
              title: 'Blinking Lights',
              description:
                'Create a ring of blinking lights using iterative loops & Adafruit MakeCode.',
              points: 1
            },
            {
              id: '53a78ae7-ff40-41d4-8523-6fbf02fe62d4',
              title: 'Blinking Lights',
              description:
                'Create a ring of blinking lights using iterative loops & Adafruit MakeCode.',
              points: 1
            },
            {
              id: '53a78ae7-ff40-41d4-8523-6fbf02fe62d4',
              title: 'Blinking Lights',
              description:
                'Create a ring of blinking lights using iterative loops & Adafruit MakeCode.',
              points: 1
            },
            {
              id: '53a78ae7-ff40-41d4-8523-6fbf02fe62d4',
              title: 'Blinking Lights',
              description:
                'Create a ring of blinking lights using iterative loops & Adafruit MakeCode.',
              points: 1
            },
            {
              id: '53a78ae7-ff40-41d4-8523-6fbf02fe62d4',
              title: 'Blinking Lights',
              description:
                'Create a ring of blinking lights using iterative loops & Adafruit MakeCode.',
              points: 1
            },
            {
              id: '53a78ae7-ff40-41d4-8523-6fbf02fe62d4',
              title: 'Blinking Lights',
              description:
                'Create a ring of blinking lights using iterative loops & Adafruit MakeCode.',
              points: 1
            }
          ]
        }
      })
    }
  } else {
    return res.render('pages/landing', {
      title: 'Home'
    })
  }
})
router.use('/debug', require('@routes/debug'))
router.use('/admin', require('@routes/admin'))
router.use('/module', require('@routes/module'))

// TODO: Error pages should go here.

/** Everything below this line will be protected behind auth */

router.use(auth.forceAuth)

module.exports = router
