const getConfig = require('probot-config')

async function handlePullRequestChange(context) {
  const config = await getConfig(context, 'minimum-reviews.yml')

  const response = await context.github.pullRequests.getReviews({
    owner: context.payload.repository.owner.login,
    repo: context.payload.repository.name,
    number: context.payload.pull_request.number
  })

  const reviewStates = response.data.map(review => review.state)
  const approvals = reviewStates.filter(word => word == 'APPROVED' ).length
  const pendingReviewsCount = Math.max(0, config.reviewsUntilReady - approvals)

  const { head, additions, deletions } = context.payload.pull_request
  const isReadyToMerge = pendingReviewsCount == 0 || (additions + deletions) < config.changesThreshold
  const state = isReadyToMerge ? "success" : config.notReadyState
  const description = isReadyToMerge ? config.readyMessage : config.notReadyMessage

  return context.github.repos.createStatus(context.repo({
    sha: head.sha,
    state: state,
    target_url: config.statusUrl,
    description: description,
    context: 'probot/minimum-reviews'
  }))
}

module.exports = handlePullRequestChange
