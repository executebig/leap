/**
    @author Mingjie Jiang, Brian Xiang
    Controls all the dashboard routes
 */

const router = require('express').Router()

// Temporary test object to simulate network req
const debugData = {
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

router.get('/', (req, res) => {
  return res.render('pages/dash', {
    title: 'Dashboard',
    data: debugData
  })
})

module.exports = router