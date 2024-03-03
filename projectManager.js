class ProjectManager{
    constructor(octokit, owner, repo, projectId = 1){
        this.octokit = octokit;
        this.projectId = projectId;
        this.owner = owner;
        this.repo = repo;
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
        console.error(error);
        throw error;
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
        console.error('Error getting owner id:', error);
        throw error;
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
        console.error('Error creating project:', error);
        return false;
      }
    }

    async hasProjects() {
      try {
        const projects = await this.getProjectsIds();
        return projects.length > 0;
      } catch (error) {
        console.error('Error:', error.message);
        throw error;
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
        console.error(error);
        throw error;
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
        console.error(error);
        throw error;
      };
    }

    async getColumnProject(){
      try {
        columns = [];
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
        console.log(projects[0].items);
        for(let i = 0; i != projects.length; i++){
          if(projects[i].id == projectId){
            const fields = projects[i].fields.nodes;
            for(let j = 0; j != fields.length; j++){
              if(fields[j].name == "Status"){
                columns.append({'fieldId': fields[j].id, 'column':fields[j].options});
              }
            }
          }
        }
        return columns;
      }catch (error){
        console.log(error.message);
        throw error;
      }
    }

    async getAllCardsInColumn(columnId) {
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
                    fieldValues(first: 10) {
                      nodes {
                        ... on ProjectV2ItemFieldSingleSelectValue{
                          id
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
        // console.log(projects[0].items[0].nodes.fielValues);
      }catch (error){
        console.log(error.message);
        throw error;
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
        console.log(response)
        return [];
      }catch (error){
        console.log(error.message);
        throw error;
      }
    }


    async getProjectLabels(){
        labels = []
        this.octokit.projects.listLabels({
            project_id: this.projectId
          }).then(response => {
            const labels = response.data;
            labels.forEach(label => {
              labels.push(label.name);
            });
            return labels;
          }).catch(error => {
            console.error(error);
            throw error;
          });
    }
}

module.exports = ProjectManager;