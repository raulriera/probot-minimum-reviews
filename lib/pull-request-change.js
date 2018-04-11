async function handlePullRequestChange (context) {
  let config = await context.config('minimum-reviews.yml')

  if (!config) {
    console.warn('%s missing configuration file', context.payload.repository.full_name)
    return
  }

  const response = await context.github.pullRequests.getReviews({
    owner: context.payload.repository.owner.login,
    repo: context.payload.repository.name,
    number: context.payload.pull_request.number
  })

  const reviewStates = response.data.map(review => review.state)
  const approvals = reviewStates.filter(word => word.toLowerCase() === 'approved').length
  const pendingReviewsCount = Math.max(0, config.reviewsUntilReady - approvals)

  const { head, additions, deletions } = context.payload.pull_request
  const isReadyToMerge = pendingReviewsCount === 0 || (additions + deletions) < config.changesThreshold
  const state = isReadyToMerge ? 'success' : config.notReadyState
  const description = isReadyToMerge ? config.readyMessage : config.notReadyMessage

  return context.github.repos.createStatus(context.repo({
    sha: head.sha,
    state: state,
    description: description,
    context: 'probot/minimum-reviews'
  }))
}

module.exports = handlePullRequestChange
