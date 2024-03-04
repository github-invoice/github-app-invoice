const FileManager = require('../fileManager');
const LabelTemplate = require('../labelTemplate');
const { Octokit } = require('@octokit/rest');
const dotenv = require('dotenv');
const octokit = new Octokit({
    auth: dotenv.config().parsed.GITHUB_TOKEN,
});

test('create label template', async () => {
    const fileManager = new FileManager(octokit, 'github-invoice', 'test-repo', 'kenyhenry', 'henry.keny@outlook.fr');
    const labelTemplate = new LabelTemplate(fileManager);
    await labelTemplate.createTemplateFile();
    expect(ret).toBe(true);
});

test('load label template', async () => {
    const fileManager = new FileManager(octokit, 'github-invoice', 'test-repo', 'kenyhenry', 'henry.keny@outlook.fr');
    const labelTemplate = new LabelTemplate(fileManager);
    await labelTemplate.loadTemplateFile();
    expect(ret.logoUrl.length > 0 && ret.companyName.length > 0 && ret.projectName.length > 0).toBe(true);
});