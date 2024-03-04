const FileManager = require('../fileManager');
const ProjectManager = require('../projectManager');
const InvoiceManager = require('../invoiceManager');
const { Octokit } = require('@octokit/rest');
const dotenv = require('dotenv');
const octokit = new Octokit({
    auth: dotenv.config().parsed.GITHUB_TOKEN,
});

// test('create invoice quote', async () => {
//     const projectManager = new ProjectManager(octokit, 'github-invoice', 'test-repo');
//     const fileManager = new FileManager(octokit, 'github-invoice', 'test-repo', 'kenyhenry', 'henry.keny@outlook.fr');
//     const invoiceManager = new InvoiceManager(fileManager, projectManager);
//     let filename = randomWords()
//     let ret = await invoiceManager.createInvoice("quote");
//     expect(ret).toBe(true);
// });

// test('create invoice invoice', async () => {
//     const projectManager = new ProjectManager(octokit, 'github-invoice', 'test-repo');
//     const fileManager = new FileManager(octokit, 'github-invoice', 'test-repo', 'kenyhenry', 'henry.keny@outlook.fr');
//     const invoiceManager = new InvoiceManager(fileManager, projectManager);
//     let filename = randomWords()
//     let ret = await invoiceManager.createInvoice("invoice");
//     expect(ret).toBe(true);
// });