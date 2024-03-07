class FileManager {
  constructor(octokit, owner, repo, sender, senderMail) {
    this.octokit = octokit;
    this.owner = owner;
    this.repo = repo;
    this.sender = sender;
    this.senderMail = senderMail;
  }

  async createFile(filePath, fileContent, commitMessage){
    try {
      let content = Buffer.from("create "+fileContent, 'ascii').toString('base64');
      await this.octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
        owner: this.owner,
        repo: this.repo,
        path: filePath,
        message: commitMessage,
        branch: 'github-invoice',
        committer: {
          name: this.sender,
          email: this.senderMail
        },
        content: content,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      });
      return true;
    }catch (error){
      console.log(error.message);
      return false;
    }
  }

  async getSha(filePath){
    try{
      const {data} = await this.octokit.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path: filePath
      });
      return data.sha;
    }catch (error) {
      console.error(error);
      return undefined;
    };
  }

  async updateFile(filePath, fileContent, commitMessage){
    try {
      let sha = await this.getSha(filePath);
      if(sha === undefined){
        this.createFile(filePath, fileContent, commitMessage);
      }
      let content = Buffer.from("update "+fileContent, 'ascii').toString('base64');
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
        content: content,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      });
      return true;
    }catch (error){
      console.log(error.message);
      return false;
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
      return undefined;
    }
  }
}

module.exports = FileManager;