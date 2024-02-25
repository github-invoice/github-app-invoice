const { Octokit } = require('@octokit/rest');
const express = require('express');

const octokit = new Octokit({
  auth: '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',
});

const app = express();

const GithubEvents = {
  installation: 'installation',
  issues: 'issues',
}

app.post('/webhook', express.json({type: 'application/json'}), (request, response) => {
  response.status(202).send('Accepted');
  const githubEvent = request.headers['x-github-event'];
  payload = request.body;

  const owner = payload.repository.owner.login;
  const repo = payload.repository.name;
  const branch = payload.repository.default_branch;

  switch (githubEvent) {
    case GithubEvents.installation:
      const { installation } = req.body;
      if (req.headers['x-github-event'] === 'installation' && req.body.action === 'created') {
        const installationId = installation.id;
        const repositoriesAdded = installation.repositories_added;
        for (const repository of repositoriesAdded) {
          const repositoryName = repository.full_name;
          const path = 'path/to/file.txt';
          const content = 'This is the content of the file.';
          createFile(path, content);
        }
      }
      res.status(200).end();
      break;
    case GithubEvents.issues:
      const data = request.body;
      const action = data.action;
      if (action === 'opened') {
        console.log(`An issue was opened with this title: ${data.issue.title}`);
      } else if (action === 'closed') {
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
