const ProjectManager = require('../projectManager');
const { Octokit } = require('@octokit/rest');
const dotenv = require('dotenv');
const octokit = new Octokit({
    auth: dotenv.config().parsed.GITHUB_TOKEN,
});

function randomWords(){
    const wordList = ['apple', 'banana', 'orange', 'pear', 'grape'];
    const randomIndex = Math.floor(Math.random() * wordList.length);
    const randomWord = wordList[randomIndex];
    return randomWord;
}

// test('test get projects id', async () => {
//     const projectManager = new ProjectManager(octokit, 'github-invoice', 'test-repo');
//     let projects = await projectManager.getProjectsIds();
//     expect(projects.length > 0).toBe(true);
// });

// test('test get owner id', async () => {
//     const projectManager = new ProjectManager(octokit, 'github-invoice', 'test-repo');
//     let ownerId = await projectManager.getOwnerId();
//     expect(ownerId.length > 0).toBe(true);
// });

// // test('test create project', async () => {
// //     const projectManager = new ProjectManager(octokit, 'github-invoice', 'test-repo');
// //     const randomWord = randomWords();
// //     let ret = await projectManager.createProject('InvoiceProject'+randomWord);
// //     expect(ret).toBe(true);
// // });

// test('test has projects', async () => {
//     const projectManager = new ProjectManager(octokit, 'github-invoice', 'test-repo');
//     let hasProject = await projectManager.hasProjects();
//     expect(hasProject).toBe(true);
// });

// test('test get repo id', async () => {
//     const projectManager = new ProjectManager(octokit, 'github-invoice', 'test-repo');
//     let repoId = await projectManager.getRepoId();
//     expect(repoId.length > 0).toBe(true);
// });

test('test create column project', async () => {
    const projectManager = new ProjectManager(octokit, 'github-invoice', 'test-repo');
    const randomWord = randomWords();
    let ret = await projectManager.createColumnProject(randomWord);
    expect(ret).toBe(true);
});

// test('test get projects labels', async () => {
//     const projectManager = new ProjectManager(octokit, 'github-invoice', 'test-repo');
//     const randomWord = randomWords();
//     let ret = await projectManager.createProject('InvoiceProject'+randomWord);
//     expect(ret).toBe(true);
// });

// test('test get card in column', async () => {
//     const projectManager = new ProjectManager(octokit, 'github-invoice', 'test-repo');
//     const randomWord = randomWords();
//     let ret = await projectManager.createProject('InvoiceProject'+randomWord);
//     expect(ret).toBe(true);
// });

// test('test move card to column', async () => {
//     const projectManager = new ProjectManager(octokit, 'github-invoice', 'test-repo');
//     const randomWord = randomWords();
//     let ret = await projectManager.createProject('InvoiceProject'+randomWord);
//     expect(ret).toBe(true);
// });