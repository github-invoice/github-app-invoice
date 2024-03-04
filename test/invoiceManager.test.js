const FileManager = require('../fileManager');
const ProjectManager = require('../projectManager');
const InvoiceManager = require('../invoiceManager');
const { Octokit } = require('@octokit/rest');
const dotenv = require('dotenv');
const octokit = new Octokit({
    auth: dotenv.config().parsed.GITHUB_TOKEN,
});

test('create invoice quote', async () => {
    const projectManager = new ProjectManager(octokit, 'github-invoice', 'test-repo');
    const fileManager = new FileManager(octokit, 'github-invoice', 'test-repo', 'kenyhenry', 'henry.keny@outlook.fr');
    const invoiceManager = new InvoiceManager(fileManager, projectManager);
    try{
      ret = await invoiceManager.createInvoice("invoice");
      const filePath = './example.pdf';
      // Write the buffer into a file
      fs.writeFile(filePath, ret, (error) => {
        if (error) {
          console.error('Error writing PDF buffer to file:', error);
        } else {
          console.log('PDF buffer has been written to file successfully.');
        }
      });

    }catch(e){
      console.log(e);
    }
    // expect(ret).toBe(true);
});

// test('create invoice invoice', async () => {
//     const projectManager = new ProjectManager(octokit, 'github-invoice', 'test-repo');
//     const fileManager = new FileManager(octokit, 'github-invoice', 'test-repo', 'kenyhenry', 'henry.keny@outlook.fr');
//     const invoiceManager = new InvoiceManager(fileManager, projectManager);
//     let filename = randomWords()
//     let ret = await invoiceManager.createInvoice("invoice");
//     expect(ret).toBe(true);
// });