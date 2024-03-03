const FileManager = require('../fileManager');
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

// test('create file', async () => {
//     const fileManager = new FileManager(octokit, 'github-invoice', 'test-repo', 'kenyhenry', 'henry.keny@outlook.fr');
//     let filename = randomWords()
//     let ret = await fileManager.createFile(filename+'_test.txt', 'test', 'test');
//     expect(ret).toBe(true);
// });

// test('test getSha', async () => {
//     const fileManager = new FileManager(octokit, 'github-invoice', 'test-repo', 'kenyhenry', 'henry.keny@outlook.fr');
//     let ret = await fileManager.getSha('test.txt');
//     expect(ret.length > 0).toBe(true);
// });

// test('test update file', async () => {
//     const fileManager = new FileManager(octokit, 'github-invoice', 'test-repo', 'kenyhenry', 'henry.keny@outlook.fr');
//     let content = randomWords()
//     let ret = await fileManager.updateFile('test.txt', content, 'test');
//     expect(ret).toBe(true);
// });

// test('test get file', async () => {
//     const fileManager = new FileManager(octokit, 'github-invoice', 'test-repo', 'kenyhenry', 'henry.keny@outlook.fr');
//     let filename = randomWords()
//     let ret = await fileManager.getFile('test.txt');
//     expect(ret).toBe(true);
// });