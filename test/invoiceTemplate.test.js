const FileManager = require('../fileManager');
const ProjectManager = require('../projectManager');
const InvoiceManager = require('../invoiceManager');
const { Octokit } = require('@octokit/rest');
const dotenv = require('dotenv');
const octokit = new Octokit({
    auth: dotenv.config().parsed.GITHUB_TOKEN,
});

test('create invoice template', async () => {
    const fileManager = new FileManager(octokit, 'github-invoice', 'test-repo', 'kenyhenry', 'henry.keny@outlook.fr');
    const invoiceTemplate = new InvoiceTemplate(fileManager);
    invoiceTemplate.createTemplateFile();
    expect(ret).toBe(true);
});

test('load invoice template', async () => {
    const fileManager = new FileManager(octokit, 'github-invoice', 'test-repo', 'kenyhenry', 'henry.keny@outlook.fr');
    const invoiceTemplate = new InvoiceTemplate(fileManager);
    invoiceTemplate.loadTemplateFile();
    expect(ret.logoUrl.length > 0 && ret.companyName.length > 0 && ret.projectName.length > 0).toBe(true);
});