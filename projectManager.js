class ProjectManager{
    constructor(){
        this.projects_id = 0;
    }

    async getColumnProject(){
        const response = await octokit.projects.listColumns({
          project_id: this.project_id
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
        const response = await octokit.projects.createColumn({
          project_id: this.project_id,
          name: name
        });
        console.log(response);
      }catch (error){
        console.log(error.message);
      }
    }
}