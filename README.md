# Probot: Minimum Reviews [![Build Status](https://travis-ci.org/raulriera/probot-minimum-reviews.svg?branch=master)](https://travis-ci.org/raulriera/probot-minimum-reviews)

> a GitHub App built with [Probot](https://github.com/probot/probot) that enforces a minimum number of reviews in Pull Requests.

![Screenshot](https://user-images.githubusercontent.com/24159/38566574-0015d8b6-3cb2-11e8-872f-e9495192581e.png)

## Usage

1. **[Configure the GitHub App](https://github.com/apps/minimum-reviews)**
2. Create `.github/minimum-reviews.yml` based on the following template.
3. It will wait for pull requests to be reviewed before marking them as ready to be merged.

A `.github/minimum-reviews.yml` file is required to enable the plugin.

```yml
# Number of reviews required to mark the pull request as valid
reviewsUntilReady: 2

# Number of changes in the pull request to start enforcing the reviewsUntilReady rule
changesThreshold: 100

# Message to display when the commit status passes
readyMessage: 'No pending reviews'

# Message to display when the commit status fails
notReadyMessage: 'Pending review approvals'

# Status to set the commit to when waiting for reviews
# 'failure, error, and pending' are the suggested options
notReadyState: 'pending'
```

## Deployment

See [docs/deploy.md](docs/deploy.md) if you would like to run your own instance of this app.

[![Remix on Glitch](https://cdn.glitch.com/2703baf2-b643-4da7-ab91-7ee2a2d00b5b%2Fremix-button.svg)](https://glitch.com/edit/#!/remix/horn-produce)
