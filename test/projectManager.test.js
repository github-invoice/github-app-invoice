const ProjectManager = require('../projectManager');
const { Octokit } = require('@octokit/rest');
const octokit = new Octokit({
    auth: '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',
});

function randomWords(){
    const wordList = ['apple', 'banana', 'orange', 'pear', 'grape'];
    const randomIndex = Math.floor(Math.random() * wordList.length);
    const randomWord = wordList[randomIndex];
    return randomWord;
}

test('test create project', async () => {
    const projectManager = new ProjectManager(octokit, 'github-invoice', 'test-repo');
    const randomWord = randomWords();
    let ret = await projectManager.createProject('InvoiceProject'+randomWord);
    expect(ret).toBe(true);
});

test('test has projects', async () => {
    const projectManager = new ProjectManager(octokit, 'github-invoice', 'test-repo');
    let hasProject = await projectManager.hasProjects();
    expect(hasProject).toBe(true);
});

test('test get column project', async () => {
    const projectManager = new ProjectManager(octokit, 'github-invoice', 'test-repo');
    let column = await projectManager.getColumnProject();
    expect(column).contains({id: 1, name: 'Todo'});
});

test('test create column project', async () => {
    const projectManager = new ProjectManager(octokit, 'github-invoice', 'test-repo');
    const randomWord = randomWords();
    let ret = await projectManager.createColumnProject(randomWord);
    expect(ret).toBe(true);
});

test('test get projects labels', async () => {
    const projectManager = new ProjectManager(octokit, 'github-invoice', 'test-repo');
    const randomWord = randomWords();
    let ret = await projectManager.createProject('InvoiceProject'+randomWord);
    expect(ret).toBe(true);
});

test('test get card in column', async () => {
    const projectManager = new ProjectManager(octokit, 'github-invoice', 'test-repo');
    const randomWord = randomWords();
    let ret = await projectManager.createProject('InvoiceProject'+randomWord);
    expect(ret).toBe(true);
});

test('test move card to column', async () => {
    const projectManager = new ProjectManager(octokit, 'github-invoice', 'test-repo');
    const randomWord = randomWords();
    let ret = await projectManager.createProject('InvoiceProject'+randomWord);
    expect(ret).toBe(true);
});