// Requiring probot allows us to mock out a robot instance
const {createRobot} = require('probot')
// Requiring our app
const app = require('..')

const config = `
reviewsUntilReady: 2
changesThreshold: 100
statusUrl: 'https://github.com/apps/minimum-reviews'
readyMessage: 'No pending reviews'
notReadyMessage: 'Pending review approvals'
notReadyState: 'pending'
`

function fixture (name, path) {
  return {
    event: name,
    payload: require(path)
  }
}

describe('probot-minimum-reviews', () => {
  let robot
  let github

  beforeEach(() => {
    // Here we create a robot instance
    robot = createRobot()
    // Here we initialize the app on the robot instance
    app(robot)
    // This is an easy way to mock out the GitHub API
    github = {
      pullRequests: {
        getReviews: jest.fn().mockReturnValue(Promise.resolve({
          data: [{ state: 'approved' }]
        }))
      },
      repos: {
        getContent: jest.fn().mockImplementation(() => Promise.resolve({
          data: {
            content: Buffer.from(config).toString('base64')
          }
        })),
        createStatus: jest.fn().mockReturnValue(Promise.resolve({
          data: true
        }))
      }
    }
    // Passes the mocked out GitHub API into out robot instance
    robot.auth = () => Promise.resolve(github)
  })

  describe('test events', () => {
    /*
    it('when pull requests reviews are created', async () => {
      const payload = fixture('pull_request_review', './fixtures/pull_request_review.submitted')
      // Simulates delivery of a payload
      await robot.receive(payload)

      expect(github.pullRequests.getReviews).toHaveBeenCalled()
      expect(github.repos.createStatus).toHaveBeenCalled()
    })
    */

    it('when pull requests are opened', async () => {
      const payload = fixture('pull_request', './fixtures/pull_request.opened')
      // Simulates delivery of a payload
      await robot.receive(payload)

      expect(github.pullRequests.getReviews).toHaveBeenCalled()
      expect(github.repos.createStatus).toHaveBeenCalled()
    })
  })
})
