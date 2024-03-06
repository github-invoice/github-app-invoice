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

    async createInvoice(type){
        // load html
        const html = await fs.promises.readFile('invoiceTemplate.html', 'utf8');
        const $ = cheerio.load(html);
        // get invoice info
        const invoiceTemplate = this.invoiceTemplate.loadTemplateFile();
        // modify html
        $(`#company`).text(invoiceTemplate.companyName);
        $(`#project`).text(invoiceTemplate.projectName);
        $(`#logo`).attr('src', invoiceTemplate.logoUrl);
        let data = '';
        if(type === 'quote'){
            $(`#type`).text('quote');
            data = await this.generateProducts('quote');
        }else{
            $(`#type`).text('invoice');
            data = await this.generateProducts('invoice');
        }
        $('tbody').append(data);
        const htmlModified = $.html();
        // generate pdf
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(htmlModified, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true, preferCSSPageSize: true });
        // Close the browser
        await browser.close();
        return pdfBuffer;
    }

    findColumn(columns, name){
        for(let x = 0; x != columns.length; x++){
            for(let y = 0; y != columns[x].column.length; y++){
                if(columns[x].column[y].name === name){
                    return {"fieldId":columns[x].fieldId, "columnId":columns[x].column[y].id, "columnName":columns[x].column[y].name};
                }
            }
        }
        return undefined;
    }

    async generateProducts(type){
        let htmlData = ``;
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
            htmlData += `<tr><td>${finalLabels || "no labels"}</td><td>${desc}</td><td>1</td><td>${price}</td></tr>`;
            await this.projectManager.moveCardToColumn(payColumn.fieldId, cards[x].itemId, payColumn.columnId);
        }
        return htmlData;
    }
}

module.exports = InvoiceManager;