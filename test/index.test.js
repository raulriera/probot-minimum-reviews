// Requiring probot allows us to mock out a robot instance
const {createRobot} = require('probot')
// Requiring our app
const app = require('..')
// Create a fixtures folder in your test folder
// Then put any larger testing payloads in there
const payload = require('./fixtures/pull_request.opened')

describe('your-app', () => {
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
          data: [{ state: "APPROVED" }]
        }))
      },
      repos: {
        async getContent(params) {
          const content = Buffer.from(params).toString('base64')
          return { data: { content } }
        },
        createStatus: jest.fn().mockReturnValue(Promise.resolve({
          data: true
        }))
      }
    }
    // Passes the mocked out GitHub API into out robot instance
    robot.auth = () => Promise.resolve(github)
  })

  describe('your functionality', () => {
    it('performs an action', async () => {
      const payloadFixture = {
        event: "pull_request",
        payload: payload
      }

      // Simulates delivery of a payload
      // payload.event is the X-GitHub-Event header sent by GitHub (for example "push")
      // payload.payload is the actual payload body
      await robot.receive(payloadFixture)

      //console.log(payload)

      expect(github.pullRequests.getReviews).toHaveBeenCalledWith({
        "number": 1,
        "owner": "raulriera",
        "repo": "probot-test"
      })

      // This test would pass if in your main code you called `github.repos.createStatus`
      expect(github.repos.createStatus).toHaveBeenCalledWith({
        "context": "probot/minimum-reviews",
        "description": "No pending reviews",
        "owner": "raulriera",
        "repo": "probot-test",
        "sha": "e7a3abf45bec74b74fc71d4a653a0e6c754e572a",
        "state": "success",
        "target_url": "https://github.com/apps/minimum-reviews"
      })
    })
  })
})
