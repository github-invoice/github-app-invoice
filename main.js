const { Octokit } = require('@octokit/rest');
const express = require('express');
const InvoiceTemplate = require('./invoiceTemplate');
const LabelTemplate = require('./labelTemplate');
const InvoiceManager = require('./invoiceManager');
const ProjectManager = require('./projectManager');
const dbManager = require('./dbManager');
const dotenv = require('dotenv');

const app = express();

async function getInstallationAccessToken(installationId) {
  try {
    const response = await octokit.request(
      'POST /app/installations/{installation_id}/access_tokens', {
      installation_id: installationId
    });

    return response.data.token;
  } catch (error) {
    console.error('Error fetching installation access token:', error);
    throw error;
  }
}

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

// TODO: handle uninstallation event for deletion of installationAccessToken
// TODO: only accept requests from GitHub
// TODO: all requests should be authenticated with octokit and get token from database
app.post('/invoice', express.json({type: 'application/json'}), async (request, response) => {
  response.status(202).send('Accepted');
  const githubEvent = request.headers['x-github-event'];
  let payload = request.body;
  const octokit = new Octokit({
    auth: installationAccessToken
  });

  switch (githubEvent) {
    case GithubEvents.installationRepo:
    case GithubEvents.installation:
      if(payload.action !== 'created' && payload.action !== 'added' && payload.action !== 'unsuspend') return;
      try{
        installationId = payload.installation.id;
        const installationAccessToken = await getInstallationAccessToken(installationId);
        // TODO: store installationAccessToken in a secure location & installationId in a database

        const repositoriesAdded = payload.repositories_added;
        for (const repository of repositoriesAdded) {
          let owner = payload.installation.account.login;
          let name = payload.sender.login;
          const repositoryName = repository.name;
          const projectManager = new ProjectManager(octokit, owner, repositoryName, name);
          if(await projectManager.hasProjects() === false){
            await projectManager.createProject('InvoiceProject');
          }
          await projectManager.createColumnProject('pay');
          await projectManager.createDedicatedBranch('github-invoice');
          const labelTemplate = new LabelTemplate(projectManager);
          const invoiceTemplate = new InvoiceTemplate(projectManager);
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
          const invoiceManager = new InvoiceManager(projectManager);
          fileContent = await invoiceManager.createInvoice('quote');
          if(fileContent !== undefined){
            await projectManager.updateFile('quote.pdf', fileContent, "quote", 'github-invoice');
          }
        } catch(error){
          console.error('Error:', error.message);
        }
      } else {
        console.log(`Unhandled action for the issue event: ${action}`);
      }
      break;

    case GithubEvents.push:
    case GithubEvents.pullRequest:
      let owner = payload.repository.owner.login;
      let repo = payload.repository.name;
      const sender = payload.pusher.name;
      const email = payload.pusher.email;
      processInvoice = false;
      if(githubEvent === GithubEvents.pullRequest){
        const pullRequest = payload.pull_request;
        if (pullRequest && pullRequest.base && pullRequest.base.ref === 'main') {
          console.log('Pull request created or updated in main branch:', pullRequest.title);
          processInvoice = true;
        }
      }else if (githubEvent == GithubEvents.push){
        if (payload.ref === 'refs/heads/main') {
          console.log('Push event received in the main branch');
          processInvoice = true;
        }
      }
      if(processInvoice){
        try{
          const projectManager = new ProjectManager(octokit, owner, repo, sender, email);
          const invoiceManager = new InvoiceManager(projectManager);
          fileContent = await invoiceManager.createInvoice('invoice');
          if(fileContent !== undefined){
            await projectManager.updateFile('invoice.pdf', fileContent, "invoice", 'github-invoice');
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
