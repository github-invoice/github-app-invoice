const { Octokit } = require('@octokit/rest');
const express = require('express');

const octokit = new Octokit({
  auth: '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',
});

const app = express();

const GithubEvents = {
  installation: 'installation',
  created: 'created',
  issues: 'issues',
  createInvoice: 'create-invoice',
  createQuote: 'create-quote',
}

app.post('/webhook', express.json({type: 'application/json'}), (request, response) => {
  response.status(202).send('Accepted');
  const githubEvent = request.headers['x-github-event'];
  payload = request.body;

  const owner = payload.repository.owner.login;
  const repo = payload.repository.name;
  const branch = payload.repository.default_branch;

  switch (githubEvent) {
    case GithubEvents.installation || GithubEvents.created:
      const repositoriesAdded = payload.repositories_added;
      for (const repository of repositoriesAdded) {
        const repositoryName = repository.full_name;
        // TODO: create project if not exists
        // TODO: create template files/folders
        // TODO: create project column
      }
      res.status(200).end();
      break;
    case GithubEvents.issues:
      const data = request.body;
      const action = data.action;
      if (action === 'labeled') {
        // TODO: get label price and create quote
        console.log(`An issue was opened with this title: ${data.issue.title}`);
      } else if (action === 'closed') {
        // TODO: automatique create bil if issue is in DONE
        console.log(`An issue was closed by ${data.issue.user.login}`);
      } else {
        console.log(`Unhandled action for the issue event: ${action}`);
      }
      break;
    default:
      console.log(`Unhandled event: ${githubEvent}`);
  }
});

const port = 3100;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
