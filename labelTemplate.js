import { ProjectManager } from "./projectManager";

export class LabelTemplate{
    constructor(fileManager, projectManager){
        this.projectManager = projectManager;
        this.fileManager = fileManager;
        this.fileName = 'labelTemplate.json';
        this.filePath = 'github_invoice/';
    }

    createTemplateFile(){
        labels = this.projectManager.getProjectLabels();
        data = {}
        data['currency'] = 'USD';
        labels.forEach(label => {
            data[label] = {
                price: 400,
                hourPrice: 50,
                desc: 'This is a description'
            }
        });
        const jsonData = JSON.stringify(data, null, 2);
        this.fileManager.createFile(this.owner, this.repo, this.filePath + this.fileName, jsonData, 'Create quote template');
    }

    loadTemplateFile(){
        content = this.fileManager.getFile(this.owner, this.repo, this.filePath + this.fileName);
        const jsonData = JSON.parse(content);
        return jsonData;
    }

}