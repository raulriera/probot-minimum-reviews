module.exports = (robot) => {
  const handlePullRequest = require('./lib/pull-request-change')

  robot.on([
    'pull_request.opened',
    'pull_request.edited',
    'pull_request.synchronize',
    'pull_request_review.submitted',
    'pull_request_review.dismissed'
  ], handlePullRequest)
}
