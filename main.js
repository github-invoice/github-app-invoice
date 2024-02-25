const { Octokit } = require('@octokit/rest');
const express = require('express');

const octokit = new Octokit({
  auth: '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',
});

const app = express();

const owner = 'github-invoice';
const repo = 'test-repo';
const branch = 'main';

async function createFile(filePath, fileContent){
  try {
    await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
      owner: owner,
      repo: repo,
      path: filePath,
      message: 'my commit message',
      committer: {
        name: 'kenyhenry',
        email: 'henry,keny@outlook.fr'
      },
      content: fileContent,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });
  }catch (error){
    console.log(error.message);
  }
}

async function getSha(filePath){
  octokit.repos.getContent({
    owner,
    repo,
    filePath
  }).then(response => {
    console.log(response.data.sha);
  }).catch(error => {
    console.error(error);
  });
}

async function updateFile(filePath, fileContent, sha){
  try {
    await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
      owner: owner,
      repo: repo,
      path: filePath,
      message: 'my commit message',
      committer: {
        name: 'kenyhenry',
        email: 'henry,keny@outlook.fr'
      },
      sha: sha,
      content: fileContent,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });
  }catch (error){
    console.log(error.message);
  }
}

async function getColumnProject(project_id){
    const response = await octokit.projects.listColumns({
      project_id: project_id
    }).then(response => {
      const columns = response.data;
      columns.forEach(column => {
        console.log(column.name);
      });
    }).catch(error => {
      console.error(error);
    });
}

async function createColumnProject(name){
  try {
    const response = await octokit.projects.createColumn({
      project_id: 1,
      name: name
    });
    console.log(response);
  }catch (error){
    console.log(error.message);
  }
}

app.post('/webhook', async (req, res) => {
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
});


app.post('/webhook', express.json({type: 'application/json'}), (request, response) => {

  response.status(202).send('Accepted');

  const githubEvent = request.headers['x-github-event'];
  createColumnProject('payed');
  if (githubEvent === 'issues') {
    const data = request.body;
    const action = data.action;
    if (action === 'opened') {
      console.log(`An issue was opened with this title: ${data.issue.title}`);
    } else if (action === 'closed') {
      console.log(`An issue was closed by ${data.issue.user.login}`);
    } else {
      console.log(`Unhandled action for the issue event: ${action}`);
    }
  } else if (githubEvent === 'ping') {
    console.log('GitHub sent the ping event');
  } else {
    console.log(`Unhandled event: ${githubEvent}`);
  }
});

const port = 3100;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
