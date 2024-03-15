class FileManager {
  constructor(octokit, owner, repo, sender="undefined", senderMail="undefined") {
    this.octokit = octokit;
    this.owner = owner;
    this.repo = repo;
    this.sender = sender;
    this.senderMail = senderMail;
  }

  async createFile(filePath, fileContent, commitMessage, branch='github-invoice'){
    try {
      let content = Buffer.from(fileContent, 'ascii').toString('base64');
      await this.octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
        owner: this.owner,
        repo: this.repo,
        path: filePath,
        message: "create "+commitMessage,
        branch: branch,
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
      console.log('create file Error:', error.message);
      return false;
    }
  }

  async getSha(filePath){
    try{
      const {data} = await this.octokit.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path: filePath,
        ref: 'github-invoice',
      });
      return data.sha;
    }catch (error) {
      console.error('get sha Error:', error.message);
      return undefined;
    };
  }

  async updateFile(filePath, fileContent, commitMessage, branch='github-invoice'){
    try {
      let sha = await this.getSha(filePath);
      if(sha === undefined){
        this.createFile(filePath, fileContent, commitMessage);
      }else{
        let content = Buffer.from(fileContent, 'ascii').toString('base64');
        await this.octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
          owner: this.owner,
          repo: this.repo,
          path: filePath,
          branch: branch,
          message: "update "+commitMessage,
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
      }
      return true;
    }catch (error){
      console.log('update file Error:', error.message);
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
      console.log('get file Error:', error.message);
      return undefined;
    }
  }
}

module.exports = FileManager;