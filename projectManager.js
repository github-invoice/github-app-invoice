export class ProjectManager{
    constructor(octokit, projectId = 0){
        this.octokit = octokit;
        this.projectId = projectId;
    }

    async createProject(name){
        try {
          const response = await this.octokit.projects.createForRepo({
            owner: this.owner,
            repo: this.repo,
            name: name
          });
          console.log(response);
        }catch (error){
          console.log(error.message);
        }
    }

    async getColumnProject(){
        await this.octokit.projects.listColumns({
          projectId: this.projectId
        }).then(response => {
          const columns = response.data;
          columns.forEach(column => {
            console.log(column.name);
          });
        }).catch(error => {
          console.error(error);
        });
    }

    async createColumnProject(name){
      try {
        const response = await this.octokit.projects.createColumn({
          projectId: this.projectId,
          name: name
        });
        console.log(response);
      }catch (error){
        console.log(error.message);
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
          }).catch(error => {
            console.error(error);
          });
    }
}