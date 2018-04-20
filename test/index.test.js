// Requiring probot allows us to mock out a robot instance
const {createRobot} = require('probot')
// Requiring our app
const app = require('..')

const config = `
reviewsUntilReady: 2
changesThreshold: 100
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
  let pullRequestResponse

  beforeEach(() => {
    // Here we create a robot instance
    robot = createRobot()
    // Here we initialize the app on the robot instance
    app(robot)
    // // Default values
    pullRequestResponse = {
      additions: 200,
      deletions: 10,
      head: {
        sha: 'e7a3abf45bec74b74fc71d4a653a0e6c754e572a'
      }
    }
    // This is an easy way to mock out the GitHub API
    github = {
      pullRequests: {
        get: jest.fn().mockReturnValue(Promise.resolve({
          data: pullRequestResponse
        })),
        getReviews: jest.fn().mockReturnValue(Promise.resolve({
          data: [{ 'state': 'approved' }]
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
    it('when pull requests reviews are created', async () => {
      const payload = fixture('pull_request_review', './fixtures/pull_request_review.submitted')
      // Simulates delivery of a payload
      await robot.receive(payload)

      expect(github.pullRequests.get).toHaveBeenCalled()
      expect(github.pullRequests.getReviews).toHaveBeenCalled()
      expect(github.repos.createStatus).toHaveBeenCalled()
    })

    it('when pull requests are opened', async () => {
      const payload = fixture('pull_request', './fixtures/pull_request.opened')
      // Simulates delivery of a payload
      await robot.receive(payload)

      expect(github.pullRequests.get).toHaveBeenCalled()
      expect(github.pullRequests.getReviews).toHaveBeenCalled()
      expect(github.repos.createStatus).toHaveBeenCalled()
    })
  })

  describe('test features', () => {
    it('when approvals is too low, pull request is invalid', async () => {
      const payload = fixture('pull_request', './fixtures/pull_request.opened')
      // Simulates delivery of a payload
      await robot.receive(payload)

      expect(github.repos.createStatus).toHaveBeenCalledWith({
        'context': 'probot/minimum-reviews',
        'description': 'Pending review approvals',
        'owner': 'raulriera',
        'repo': 'probot-test',
        'sha': 'e7a3abf45bec74b74fc71d4a653a0e6c754e572a',
        'state': 'pending'
      })
    })

    it('when threshold is low, approvals are ignored, and pull request is valid', async () => {
      const payload = fixture('pull_request', './fixtures/pull_request.opened')
      // Set the threshold to something low
      pullRequestResponse.additions = 1
      pullRequestResponse.deletions = 1
      // Simulates delivery of a payload
      await robot.receive(payload)

      expect(github.repos.createStatus).toHaveBeenCalledWith({
        'context': 'probot/minimum-reviews',
        'description': 'No pending reviews',
        'owner': 'raulriera',
        'repo': 'probot-test',
        'sha': 'e7a3abf45bec74b74fc71d4a653a0e6c754e572a',
        'state': 'success'
      })
    })
  })
})
