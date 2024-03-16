const fs = require('fs');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const InvoiceTemplate = require('./invoiceTemplate');
const LabelTemplate = require('./labelTemplate');

class InvoiceManager{
    constructor(fileManager, projectManager){
        this.fileManager = fileManager;
        this.projectManager = projectManager;
        this.invoiceTemplate = new InvoiceTemplate(fileManager);
        this.labelTemplate = new LabelTemplate(fileManager, projectManager);
    }

    findColumn(columns, name){
        for(let x = 0; x != columns.length; x++){
            if(columns[x].column !== undefined){
                for(let y = 0; y != columns[x].column.length; y++){
                    if(columns[x].column[y].name === name){
                        return {"fieldId":columns[x].fieldId, "columnId":columns[x].column[y].id, "columnName":columns[x].column[y].name};
                    }
                }
            }
        }
        return undefined;
    }

    async createInvoice(type){
        // load html
        try{
            const html = await fs.promises.readFile('invoiceTemplate.html', 'utf8');
            const $ = cheerio.load(html);
            // get invoice info
            const invoiceTemplate = await this.invoiceTemplate.loadTemplateFile();
            // modify html
            $(`#company`).text(invoiceTemplate.companyName);
            // client
            $(`#clientName`).text(invoiceTemplate.clientName);
            $(`#clientProject`).text(invoiceTemplate.clientProject);
            $(`#clientAddress`).text(invoiceTemplate.clientAddress);
            $(`#clientEmail`).text(invoiceTemplate.clientEmail);
            // team
            $(`#teamProject`).text(invoiceTemplate.teamProject);
            $(`#teamName`).text(invoiceTemplate.teamName);
            $(`#teamAddress`).text(invoiceTemplate.teamAddress);
            $(`#teamEmail`).text(invoiceTemplate.teamEmail);

            $(`#date`).text(new Date().toLocaleDateString());
            const sha = await this.projectManager.getLastCommit();
            $(`#invoice-number`).text(sha);

            $(`#logo`).attr('src', invoiceTemplate.logoUrl);
            $(`#type`).text(type);

            let htmlData = ``;
            let total = 0;
            const labelData = await this.labelTemplate.loadTemplateFile();
            const columns = await this.projectManager.getColumnProject(labelData.quoteColumn);
            let sourceColumn = undefined;
            const payColumn = this.findColumn(columns, labelData.payedColumn);
            if(type === 'quote'){
                sourceColumn = this.findColumn(columns, labelData.quoteColumn);
            } else if(type === 'invoice'){
                sourceColumn = this.findColumn(columns, labelData.invoiceColumn);
            }
            const cards = await this.projectManager.getAllCardsInColumn(sourceColumn.columnName);
            for(let x = 0; x != cards.length; x++){
                const labels = cards[x].labels
                let finalLabels = "";
                let price = 0;
                let desc = cards[x].desc || 'No description';
                for(let y = 0; y != labels.length; y++){
                    if(labelData[labels[y].name] || labelData[labels[y].name] === 0){
                        price += labelData[labels[y].name];
                        finalLabels += ` ${labels[y].name}`;
                    }
                }
                total += parseInt(price);
                htmlData += `<tr><td>${finalLabels || "no labels"}</td><td>${desc}</td><td>1</td><td>${price}</td></tr>`;
                if(type === 'invoice' && payColumn !== undefined){
                    await this.projectManager.moveCardToColumn(payColumn.fieldId, cards[x].itemId, payColumn.columnId);
                }
            }
            $('tbody').append(htmlData);
            $(`#tva`).text(invoiceTemplate.tva);
            $(`#total`).text(total+((parseInt(invoiceTemplate.tva)/100)*total));
            const htmlModified = $.html();
            // generate pdf
            const browser = await puppeteer.launch({args: ['--no-sandbox']});
            const page = await browser.newPage();
            await page.setContent(htmlModified, { waitUntil: 'networkidle0' });
            const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true, preferCSSPageSize: true });
            // Close the browser
            await browser.close();
            return pdfBuffer;
        } catch (error){
            console.error('create ' + type + ' Error:', error.message);
            return undefined;
        }
    }
}

module.exports = InvoiceManager;