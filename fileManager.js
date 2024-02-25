class FileManager {
  constructor() {
    this.owner = '';
    this.repo = '';
    this.sender = '';
    this.sender_mail = '';
  }

  async createFile(filePath, fileContent, commitMessage){
    try {
      await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
        owner: this.owner,
        repo: this.repo,
        path: filePath,
        message: commitMessage,
        committer: {
          name: this.sender,
          email: this.sender_mail
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

  async updateFile(filePath, fileContent, sha, commitMessage){
    try {
      await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
        owner: this.owner,
        repo: this.repo,
        path: filePath,
        message: commitMessage,
        committer: {
          name: this.sender,
          email: this.sender_mail
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