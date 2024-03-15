class InvoiceTemplate{
    constructor(fileManager){
        this.fileManager = fileManager;
        this.fileName = 'invoiceTemplate.json';
        this.filePath = 'github_invoice/';
    }

    async createTemplateFile(){
        try{
            const data = {
                logoUrl: "https://github.com/github-invoice/github-app-invoice/blob/b259764fe84e0618ec1dd45c7d1eaedeea770b3c/github_invoice_logo.png?raw=true",
                companyName: "githubInvoice",
                tva: "5",
                // Client
                clientProject: "personal-website",
                clientName:  "keet",
                clientAddress: "Guadeloupe",
                clientEmail: "guadeloupe@outlook.fr",
                // Team
                teamProject: "gitcat",
                teamName:  "webmonster",
                teamAddress: "Martinique",
                teamEmail: "martinique@outlook.fr"
            }
            const jsonData = JSON.stringify(data, null, 2);
            await this.fileManager.updateFile(this.filePath+this.fileName, jsonData, 'Create quote template', 'main');
            return true;
        }catch(e){
            console.log('create invoice template error: ', e);
            return false;
        }
    }

    async loadTemplateFile(){
        try{
            const content = await this.fileManager.getFile(this.filePath + this.fileName);
            const jsonData = JSON.parse(content);
            return jsonData;
        }catch(e){
            console.log('load invoice template error: ', e);
            return undefined;
        }
    }

}

module.exports = InvoiceTemplate;