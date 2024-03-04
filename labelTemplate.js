class LabelTemplate{
    constructor(fileManager){
        this.fileManager = fileManager;
        this.fileName = 'labelTemplate.json';
        this.filePath = 'github_invoice/';
    }

    async createTemplateFile(){
        try{
            const data = {
                currency: 'USD',
                invoiceColumn: 'Done',
                quoteColumn: 'Todo',
                payedColumn: 'pay',
                documentation: 100,
                bug: 0,
                enhancement: 300,
                duplicate: 0,
                wontfix: 500,
            }
            const jsonData = JSON.stringify(data, null, 2);
            await this.fileManager.createFile(this.filePath+this.fileName, jsonData, 'Create label template');
            return true;
        }catch(e){
            console.log(e);
            throw e;
        }
    }

    async loadTemplateFile(){
        try{
            const content = await this.fileManager.getFile(this.filePath + this.fileName);
            const jsonData = JSON.parse(content);
            return jsonData;
        }catch(e){
            console.log(e);
            throw e;
        }
    }

}

module.exports = LabelTemplate;