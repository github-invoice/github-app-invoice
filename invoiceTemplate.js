class InvoiceTemplate{
    logoUrl = '';
    companyName = 'githubInvoice';
    projectName = 'undefined';

    constructor(fileManager){
        this.fileManager = fileManager;
        this.fileName = 'invoiceTemplate.json';
        this.filePath = 'github_invoice/';
    }

    createTemplateFile(){
        data = {
            logoUrl: this.logoUrl,
            companyName: this.companyName,
            projectName: this.projectName
        }
        const jsonData = JSON.stringify(data, null, 2);
        this.fileManager.createFile(this.owner, this.repo, this.filePath + this.fileName, jsonData, 'Create quote template');
    }

    loadTemplateFile(){
        content = this.fileManager.getFile(this.owner, this.repo, this.filePath + this.fileName);
        const jsonData = JSON.parse(content);
        this.logoUrl = jsonData.logoUrl;
        this.companyName = jsonData.companyName;
        this.projectName = jsonData.projectName;
    }

}

module.exports = InvoiceTemplate;