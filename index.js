module.exports = (robot) => {
  const handlePullRequest = require('./lib/pull-request-change')

  robot.on([
    'pull_request.opened',
    'pull_request.reopened',
    'pull_request_review.submitted',
    'pull_request_review.dismissed',
    'pull_request.synchronize'
  ], handlePullRequest)
}
