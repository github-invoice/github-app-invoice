// graphql url for github
// https://studio.apollographql.com/public/github/variant/current/schema/reference
// graphql doc
// https://docs.github.com/en/graphql/reference
class ProjectManager{
    constructor(octokit, owner, repo, projectId = 1, sender="undefined", senderMail="undefined"){
        this.octokit = octokit;
        this.projectId = projectId;
        this.owner = owner;
        this.repo = repo;
        this.sender = sender;
        this.senderMail = senderMail;
    }

    async getProjectsIds(){
      const owner = this.owner;
      const repository = this.repo;
      const query = `
      query GetAllProjectV2($owner: String!, $repository: String!) {
        repository(owner: $owner, name: $repository) {
          projectsV2(first: 100) {
            nodes {
              id
              createdAt
            }
          }
        }
      }
      `;
      try{
        const data  = await this.octokit.graphql(query, {
          owner,
          repository,
        });
        return data.repository.projectsV2.nodes;
      } catch(error) {
        console.error('get project id error: ', error.message);
        return undefined;
      };
    }

    async getOwnerId(){
      const query = `
      query {
        repository(owner: "github-invoice", name: "test-repo") {
          owner {
            id
          }
        }
      }`;
      try {
        // Send the GraphQL query to get the owner id
        const ret = await this.octokit.graphql(query);
        return ret['repository']['owner']['id'].toString();
      } catch (error) {
        console.error('Error getting owner id:', error.message);
        return undefined;
      }
    }

    async createProject(name){
      const ownerId = await this.getOwnerId();
      const query = `
        mutation {
          createProjectV2(
            input: {
              ownerId: "${ownerId}",
              title: "${name}"
            }
          ){
            projectV2 {
              id
            }
          }
        }`
      try {
        // Send the GraphQL query to create a project
        const ret = await this.octokit.graphql(query, {
          ownerId: ownerId,
        });
        await this.linkProjectToRepo(ret.createProjectV2.projectV2.id);
        return true;
      } catch (error) {
        console.error('Error creating project:', error.message);
        return false;
      }
    }

    async hasProjects() {
      try {
        const projects = await this.getProjectsIds();
        return projects.length > 0;
      } catch (error) {
        console.error('has project Error:', error.message);
        return false;
      }
    }

    async getRepoId(){
      const owner = this.owner;
      const repo = this.repo;
      const query = `
      query GetRepositoryId($owner: String!, $repo: String!) {
        repository(owner: $owner, name: $repo) {
          id
        }
      }
      `;
      try{
        const data  = await this.octokit.graphql(query, {
          owner,
          repo,
        });
        return data.repository.id;
      } catch(error) {
        console.error('get repo id Error:', error.message);
        return undefined;
      };
    }

    async linkProjectToRepo(projectId){
      const repositoryId = await this.getRepoId();
      const query = `
      mutation LinkProjectToRepository($projectId: ID!, $repositoryId: ID!) {
        linkProjectV2ToRepository(input: {projectId: $projectId, repositoryId: $repositoryId}) {
          clientMutationId
        }
      }
      `;
      try{
        const data  = await this.octokit.graphql(query, {
          projectId,
          repositoryId,
        });
        return true;
      } catch(error) {
        console.error('link project to repo Error:', error.message);
        return false;
      };
    }

    async getColumnProject(){
      try {
        let columns = [];
        const projectsIds = await this.getProjectsIds();
        const projectId = projectsIds[0].id;
        const owner = this.owner;
        const repository = this.repo;
        const query = `
        query GetAllProjectV2($owner: String!, $repository: String!) {
          repository(owner: $owner, name: $repository) {
            projectsV2(first: 100) {
              nodes {
                id
                items(first: 100) {
                  nodes {
                    id
                  }
                }
                fields(first: 100) {
                  nodes {
                    ... on
                    ProjectV2Field{
                      id
                    }
                    ... on
                    ProjectV2IterationField{
                      id
                    }
                    ... on
                    ProjectV2SingleSelectField{
                      id
                      name
                      options{
                        id
                        name
                      }
                    }
                  }
                }
              }
            }
          }
        }
        `;
        const response  = await this.octokit.graphql(query, {
          owner,
          repository,
        });
        const projects = response.repository.projectsV2.nodes;
        for(let i = 0; i != projects.length; i++){
          if(projects[i].id == projectId){
            const fields = projects[i].fields.nodes;
            for(let j = 0; j != fields.length; j++){
              columns.push({'fieldId': fields[j].id, 'column':fields[j].options});
            }
          }
        }
        return columns;
      }catch (error){
        console.log('get column project Error:', error.message);
        return undefined;
      }
    }

    async getAllCardsInColumn(columnName) {
      try {
        let items = [];
        const projectsIds = await this.getProjectsIds();
        const projectId = projectsIds[0].id;
        const owner = this.owner;
        const repository = this.repo;
        const query = `
        query GetAllProjectV2($owner: String!, $repository: String!) {
          repository(owner: $owner, name: $repository) {
            projectsV2(first: 5) {
              nodes {
                id
                items(first: 100) {
                  nodes {
                    id
                    fieldValues(first: 10) {
                      nodes {
                        ... on ProjectV2ItemFieldSingleSelectValue{
                          id
                          name
                        }
                        ... on ProjectV2ItemFieldLabelValue{
                          labels(first: 10){
                            nodes{
                              name
                            }
                          }
                        }
                        ... on ProjectV2ItemFieldTextValue{
                          id
                          text
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        `;
        const response  = await this.octokit.graphql(query, {
          owner,
          repository,
        });
        const projects = response.repository.projectsV2.nodes;
        for(let i = 0; i != projects.length; i++){
          if(projects[i].id == projectId){
            const fields = projects[i].items.nodes;
            for(let j = 0; j != fields.length; j++){
              let labels = [];
              let desc = "";
              let itemId = "";
              let fieldColumnName = ""
              if(fields[j].fieldValues){
                const nodes = fields[j].fieldValues.nodes;
                for(let k=0; k != nodes.length; k++){
                  // console.log(nodes[k])
                  if(nodes[k].text){
                    desc = nodes[k].text;
                  }
                  if(nodes[k].id){
                      itemId = fields[j].id;
                      fieldColumnName = nodes[k].name;
                  }
                  if(nodes[k].labels){
                    let labelItems = nodes[k].labels.nodes;
                    for (let l = 0; l != labelItems.length; l++){
                      labels.push(labelItems[l]);
                    }
                  }
                }
                if(fieldColumnName === columnName){
                  items.push({"columnName":fieldColumnName, "itemId":itemId, "labels":labels, "desc":desc});
                }
              }
            }
          }
        }
        return items;
      }catch (error){
        console.log('get all card in column Error:', error.message);
        return undefined;
      }
    }

    async moveCardToColumn(fieldId, itemId, columnId) {
      try {
        const projectsIds = await this.getProjectsIds();
        const projectId = projectsIds[0].id;
        const input = {
          projectId: projectId,
          fieldId: fieldId,
          itemId: itemId,
          value: {
            singleSelectOptionId: columnId,
          }
        };
        const query = `
        mutation UpdateProjectV2ItemFieldValue($input: UpdateProjectV2ItemFieldValueInput!){
          updateProjectV2ItemFieldValue(input: $input) {
            projectV2Item{
              fieldValueByName(name: "Status"){
                __typename
                ... on ProjectV2ItemFieldSingleSelectValue{
                  name
                }
              }
            }
          }
        }
        `;
        const response  = await this.octokit.graphql(query, {
          input
        });
        return true;
      }catch (error){
        console.log('move card to column Error:', error.message);
        return false;
      }
    }

    async createColumnProject(name){
      try {
        const projectsIds = await this.getProjectsIds();
        const projectId = projectsIds[0].id;
        const columns = await this.getColumnProject();
        if(columns.length > 0){
          for(let i = 0; i != columns.length; i++){
            if(columns[i].column){
              for(let j = 0; j != columns[i].column.length; j++){
                if(columns[i].column[j].name === name){
                  return true;
                }
              }
            }
          }
        }
        const input = {
          projectId: projectId,
          name: "github-invoice",
          dataType: "SINGLE_SELECT",
          singleSelectOptions: {
            name: name,
            description: name,
            color: "ORANGE"
          }
        };
        const query = `
        mutation CreateProjectV2Field($input: CreateProjectV2FieldInput!) {
          createProjectV2Field(input: $input) {
            clientMutationId
          }
        }
        `;
        const response  = await this.octokit.graphql(query, {
          input
        });
        return true;
      }catch (error){
        console.log('create column project Error:', error.message);
        return false;
      }
    }

    async getLastCommit(){
      try{
        const owner = this.owner;
        const repo = this.repo;
        const infos = await this.getRepoInfos();
        const {data} = await this.octokit.request('GET /repos/{owner}/{repo}/branches/{branch}', {
          owner: owner,
          repo: repo,
          branch: infos.default_branch,
          headers: {
            'X-GitHub-Api-Version': '2022-11-28'
          }
        })
        return data.commit.sha;
      } catch (error){
        console.log('get last commit Error:', error.message);
        return undefined;
      }
    }

    async createDedicatedBranch(){
      try {
        const sha = await this.getLastCommit();
        const repoId = await this.getRepoId();
        const input = {
          name: "refs/heads/github-invoice",
          oid: sha,
          repositoryId: repoId
        }
        const query = `
        mutation  CreateRef($input:  CreateRefInput!) {
          createRef(input: $input) {
            clientMutationId
          }
        }
        `;
        const response  = await this.octokit.graphql(query, {
          input
        });
        this.deleteAllFiles('github-invoice');
        return true;
      }catch (error){
        console.log('create dedicated branch Error:', error.message);
        return false;
      }
    }

    async getRepoInfos(){
      try {
        const response = await fetch(`https://api.github.com/repos/${this.owner}/${this.repo}`);
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('get repo infos Error:', error.message);
        return undefined;
      }
    }

    /****************
     * FILE MANAGER *
     ****************/
    async getContent(branch, filePath){
      try{
        const {data} = await this.octokit.repos.getContent({
          owner: this.owner,
          repo: this.repo,
          ref: branch,
          path: filePath
        });
        return data;
      }catch (error) {
        console.error('get sha Error:', error.message);
        return undefined;
      };
    }

    async deleteFile(filePath, commitMessage, branch, sha, type){
      try {
        if(sha !== undefined){
          if(type === 'dir'){
            const files = await this.getContent(branch, filePath);
            await Promise.all(files.map(async file => {
              console.log(file)
              this.deleteFile(file.path, commitMessage, branch, file.sha, file.type);
            }));
          }else{
            await this.octokit.request('DELETE /repos/{owner}/{repo}/contents/{path}', {
              owner: this.owner,
              repo: this.repo,
              path: filePath,
              message: "delete "+commitMessage,
              branch: branch,
              committer: {
                name: this.sender,
                email: this.senderMail
              },
              sha: sha,
              headers: {
                'X-GitHub-Api-Version': '2022-11-28'
              }
            });
          }
        }
        return true;
      }catch (error){
        console.log('delete file Error:', error.message);
        return false;
      }
    }

    async deleteAllFiles(branch){
      const content = await this.getContent(branch, '');
        if(content !== undefined){
          for(let i = 0; i != content.length; i++){
            this.deleteFile(content[i].path, 'delete', branch, content[i].sha, content[i].type);
          }
        }
    }

    async createFile(filePath, fileContent, commitMessage, branch){
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
        if(!error instanceof NotFoundError){
          console.error('get sha Error:', error.message);
        }
        return undefined;
      };
    }

    async updateFile(filePath, fileContent, commitMessage, branch){
      try {
        let sha = await this.getSha(filePath);
        if(sha === undefined){
          this.createFile(filePath, fileContent, commitMessage, branch);
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

module.exports = ProjectManager;