export class FileManager {
  constructor(octokit, owner, repo, sender, senderMail) {
    this.octokit = octokit;
    this.owner = owner;
    this.repo = repo;
    this.sender = sender;
    this.senderMail = senderMail;
  }

  async createFile(filePath, fileContent, commitMessage){
    try {
      await this.octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
        owner: this.owner,
        repo: this.repo,
        path: filePath,
        message: commitMessage,
        committer: {
          name: this.sender,
          email: this.senderMail
        },
        content: fileContent,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      });
    }catch (error){
      console.log(error.message);
    }
  }

  async updateFile(filePath, fileContent, commitMessage, sender, senderMail){
    try {
        sha = this.getSha(filePath);
      await this.octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
        owner: this.owner,
        repo: this.repo,
        path: filePath,
        message: commitMessage,
        committer: {
          name: this.sender,
          email: this.senderMail
        },
        sha: sha,
        content: fileContent,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      });
    }catch (error){
      console.log(error.message);
    }
  }

  async getFile(filePath){
    try {
        const response = await this.octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
            owner: this.owner,
            repo: this.repo,
            path: filePath,
            headers: {
              'X-GitHub-Api-Version': '2022-11-28'
            }
        });
        const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
        return content;
    }catch (error){
      console.log(error.message);
    }
  }

  async getSha(filePath){
    octokit.repos.getContent({
      owner: this.owner,
      repo: this.repo,
      filePath
    }).then(response => {
      return response.data.sha;
    }).catch(error => {
      console.error(error);
      return null;
    });
  }

}