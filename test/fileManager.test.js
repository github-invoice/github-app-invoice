const { default: test } = require('node:test');
const FileManager = require('../fileManager');
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

test('test has projects', async () => {
    const fileManager = new FileManager(octokit, 'github-invoice', 'test-repo', 'kenyhenry', 'henry.keny@outlook.fr');
    let filename = randomWords()
    let ret = await fileManager.createFile(filename+'_test.txt', 'test', 'test');
    expect(ret).toBe(true);
});

test('test get file', async () => {
    const fileManager = new FileManager(octokit, 'github-invoice', 'test-repo', 'kenyhenry', 'henry.keny@outlook.fr');
    let filename = randomWords()
    let ret = await fileManager.createFile(filename+'_test.txt', 'test', 'test');
    expect(ret).toBe(true);
});

test('test update file', async () => {
    const fileManager = new FileManager(octokit, 'github-invoice', 'test-repo', 'kenyhenry', 'henry.keny@outlook.fr');
    let filename = randomWords()
    let ret = await fileManager.createFile(filename+'_test.txt', 'test', 'test');
    expect(ret).toBe(true);
});

test('test getSha', async () => {
    const fileManager = new FileManager(octokit, 'github-invoice', 'test-repo', 'kenyhenry', 'henry.keny@outlook.fr');
    let filename = randomWords()
    let ret = await fileManager.createFile(filename+'_test.txt', 'test', 'test');
    expect(ret).toBe(true);
});