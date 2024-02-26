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
          return true;
        }catch (error){
          console.log(error.message);
          throw error;
        }
    }

    async hasProjects() {
      try {
        const projects = await this.octokit.projects.listForRepo({
          owner:this.owner,
          repo:this.repo
          // org: this.owner
        });
        console.log(projects)
        if (projects.length > 0) {
          return true;
        } else {
          return false;
        }
      } catch (error) {
        console.error('Error:', error.message);
        throw error;
      }
    }

    async getColumnProject(){
        let columns = []
        await this.octokit.projects.listColumns({
          projectId: this.projectId
        }).then(response => {
          columns = response.data;
          columns.forEach(column => {
            columns.push({id:column.id, name:column.name});
          });
          return columns;
        }).catch(error => {
          console.error(error);
          throw error;
        });
    }

    async createColumnProject(name){
      try {
        const response = await this.octokit.projects.createColumn({
          projectId: this.projectId,
          name: name
        });
        console.log(response);
        return true;
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

    async getCardsInColumn(owner, repo, columnId) {
      try {
        const { data: cards } = await this.octokit.projects.listCards({
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
        const response = await this.octokit.projects.moveCard({
          card_id: cardId,
          position: 'top', // You can specify 'top' or 'bottom' for the position within the column
          column_id: columnId
        });
        console.log('Card moved successfully:', response.data);
        return true;
      } catch (error) {
        console.error('Error moving card:', error);
        throw error;
      }
    }
}

module.exports = ProjectManager;