class ProjectManager{
    constructor(octokit, owner, repo, projectId = 1){
        this.octokit = octokit;
        this.projectId = projectId;
        this.owner = owner;
        this.repo = repo;
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

    async hasProjects() {
      try {
        const { data: projects } = await octokit.projects.listForRepo({
          owner:this.owner,
          repo:this.repo
        });
        if (projects.length > 0) {
          console.log('Repository has projects');
          return true;
        } else {
          console.log('Repository has no projects');
          return false;
        }
      } catch (error) {
        console.error('Error:', error);
        throw error;
      }
    }

    async getColumnProject(){
        columns = []
        await this.octokit.projects.listColumns({
          projectId: this.projectId
        }).then(response => {
          const columns = response.data;
          columns.forEach(column => {
            columns.push({id:column.id, name:column.name});
          });
          return columns;
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

    async getCardsInColumn(owner, repo, columnId) {
      try {
        const { data: cards } = await octokit.projects.listCards({
          column_id: columnId
        });
        return cards;
      } catch (error) {
        console.error('Error getting cards in column:', error);
        throw error;
      }
    }

    async moveCardToColumn(cardId, columnId) {
      try {
        const response = await octokit.projects.moveCard({
          card_id: cardId,
          position: 'top', // You can specify 'top' or 'bottom' for the position within the column
          column_id: columnId
        });
        console.log('Card moved successfully:', response.data);
      } catch (error) {
        console.error('Error moving card:', error);
        throw error;
      }
    }
}