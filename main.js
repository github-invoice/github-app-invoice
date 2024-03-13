const { Octokit } = require('@octokit/rest');
const express = require('express');
const InvoiceTemplate = require('./invoiceTemplate');
const LabelTemplate = require('./labelTemplate');
const FileManager = require('./fileManager');
const InvoiceManager = require('./invoiceManager');
const ProjectManager = require('./projectManager');
const dotenv = require('dotenv');

const octokit = new Octokit({
    auth: dotenv.config().parsed.GITHUB_TOKEN,
});

// test
async function fetchUserInfo() {
  try {
    const { data } = await octokit.users.getAuthenticated();
    console.log('Authenticated user:', data);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// fetchUserInfo();

const app = express();

const GithubEvents = {
  installation: 'installation',
  installationRepo: 'installation_repositories',
  created: 'created',
  issues: 'issues',
  createInvoice: 'create-invoice',
  createQuote: 'create-quote',
  pullRequest: 'pull_request',
  push: 'push',
  merge: 'merge',
}

app.post('/webhook', express.json({type: 'application/json'}), async (request, response) => {
  response.status(202).send('Accepted');
  const githubEvent = request.headers['x-github-event'];
  let payload = request.body;
  switch (githubEvent) {
    case GithubEvents.installationRepo:
    case GithubEvents.installation:
      if(payload.action !== 'created' && payload.action !== 'added' && payload.action !== 'unsuspend') return;
      try{
        const repositoriesAdded = payload.repositories_added;
        for (const repository of repositoriesAdded) {
          let owner = payload.installation.account.login;
          let name = payload.sender.login;
          const repositoryName = repository.name;
          const projectManager = new ProjectManager(octokit, owner, repositoryName);
          const fileManager = new FileManager(octokit, owner, repositoryName, name);
          if(await projectManager.hasProjects() === false){
            await projectManager.createProject('InvoiceProject');
          }
          await projectManager.createColumnProject('pay');
          await projectManager.createDedicatedBranch('github-invoice');
          const labelTemplate = new LabelTemplate(fileManager, projectManager);
          const invoiceTemplate = new InvoiceTemplate(fileManager);
          await labelTemplate.createTemplateFile();
          await invoiceTemplate.createTemplateFile();
        }
      }catch(error){
        console.error('Error:', error.message);
      }
      // res.status(200).end();
      break;

    case GithubEvents.issues:
      const action = payload.action;
      if (action === 'labeled' || action === 'unlabeled') {
        try{
          let owner = payload.repository.owner.login;
          let repo = payload.repository.name;
          const projectManager = new ProjectManager(octokit, owner, repo);
          const fileManager = new FileManager(octokit, owner, repo);
          const invoiceManager = new InvoiceManager(fileManager, projectManager);
          fileContent = await invoiceManager.createInvoice('quote');
          if(fileContent === undefined){
            await fileManager.updateFile('quote.pdf', fileContent, "quote");
          }
        } catch(error){
          console.error('Error:', error.message);
        }
      } else {
        console.log(`Unhandled action for the issue event: ${action}`);
      }
      break;

    case GithubEvents.merge:
    case GithubEvents.push:
    case GithubEvents.pullRequest:
      let owner = payload.repository.owner.login;
      let repo = payload.repository.name;
      processInvoice = false;
      if(githubEvent === GithubEvents.pullRequest || githubEvent === GithubEvents.merge){
        const pullRequest = payload.pull_request;
        if (pullRequest && pullRequest.base && pullRequest.base.ref === 'main') {
          console.log('Pull request created or updated in main branch:', pullRequest.title);
          processInvoice = true;
        }
      }else if (githubEvent === GithubEvents.push){
        if (payload.ref === 'refs/heads/main') {
          console.log('Push event received in the main branch');
          processInvoice = true;
        }
      }
      if(processInvoice){
        try{
          const sender = payload.login.name || "undefined";
          const email = payload.pusher.email || "undefined";
          const projectManager = new ProjectManager(octokit, owner, repo);
          const fileManager = new FileManager(octokit, owner, repo, sender, email);
          const invoiceManager = new InvoiceManager(fileManager, projectManager);
          fileContent = await invoiceManager.createInvoice('invoice');
          if(fileContent === undefined){
            await fileManager.updateFile('invoice.pdf', fileContent, "invoice");
          }
        } catch(error){
          console.error('Error:', error.message);
        }
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
