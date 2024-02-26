const { Octokit } = require('@octokit/rest');
const express = require('express');
import { ProjectManager } from './projectManager';
import { FileManager } from './fileManager';
import { InvoiceManager } from './invoiceManager';

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
  pullRequest: 'pull_request',
  push: 'push',
  merge: 'merge',
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
        const projectManager = new ProjectManager(octokit, owner, repositoryName);
        const fileManager = new FileManager(octokit, owner, repositoryName);
        if(projectManager.hasProjects() === false){
          projectManager.createProject('InvoiceProject');
        }
        projectManager.createColumnProject('payed');
        const labelTemplate = new LabelTemplate(fileManager, projectManager);
        const invoiceTemplate = new InvoiceTemplate(fileManager);
        labelTemplate.createTemplateFile();
        invoiceTemplate.createTemplateFile();
      }
      res.status(200).end();
      break;

    case GithubEvents.issues:
      const action = payload.action;
      if (action === 'labeled') {
        console.log(`An issue was labeled with this title: ${data.issue.title}`);
        const projectManager = new ProjectManager(octokit, owner, repo);
        const fileManager = new FileManager(octokit, owner, repo);
        const invoiceManager = new InvoiceManager(fileManager, projectManager);
        fileContent = invoiceManager.createInvoice('quote');
        fileManager.createFile('quote.pdf', fileContent);
      } else {
        console.log(`Unhandled action for the issue event: ${action}`);
      }
      break;

    case GithubEvents.pullRequest || GithubEvents.push || GithubEvents.merge:
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
        const projectManager = new ProjectManager(octokit, owner, repo);
        const fileManager = new FileManager(octokit, owner, repo);
        const invoiceManager = new InvoiceManager(fileManager, projectManager);
        fileContent = invoiceManager.createInvoice('invoice');
        fileManager.createFile('invoice.pdf', fileContent);
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
