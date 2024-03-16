class LabelTemplate{
    constructor(projectManager){
        this.projectManager = projectManager;
        this.fileName = 'labelTemplate.json';
        this.filePath = 'github_invoice/';
    }

    async createTemplateFile(){
        try{
            const data = {
                'currency': 'USD',
                'invoiceColumn': 'Done',
                'quoteColumn': 'Todo',
                'payedColumn': 'pay',
                'documentation': 100,
                'bug': 0,
                'enhancement': 300,
                'duplicate': 0,
                'wontfix': 500,
            }
            const jsonData = JSON.stringify(data, null, 2);
            await this.projectManager.updateFile(this.filePath+this.fileName, jsonData, 'Create label template', 'main');
            return true;
        }catch(e){
            console.log('create label template error: ', e);
            return false;
        }
    }

    async loadTemplateFile(){
        try{
            const content = await this.projectManager.getFile(this.filePath + this.fileName);
            const jsonData = JSON.parse(content);
            return jsonData;
        }catch(e){
            console.log('load label template error: ', e);
            return undefined;
        }
    }

}

module.exports = LabelTemplate;