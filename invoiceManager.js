const fs = require('fs');
const cheerio = require('cheerio');
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
        fs.readFile('invoiceTemplate.html', 'utf8', (err, html) => {
            if (err) {
              console.error('Error reading HTML file:', err);
              return;
            }
            const $ = cheerio.load(html);

            // get invoice info
            this.invoiceTemplate.loadTemplateFile();

            // modify html
            $(`#company`).text(invoiceTemplate.companyName);
            $(`#project`).text(invoiceTemplate.projectName);
            $(`#logo`).attr('src', invoiceTemplate.logoUrl);
            // TODO: get element by id
            if(type === 'quote'){
                $(`#type`).text('quote');
                data = this.generateProducts('quote');
            }else{
                $(`#type`).text('invoice');
                data = this.generateProducts('invoice');
            }
            $('tbody').append(data);
            const modifiedHtml = $.html();

            // generate pdf
            pdf.create(modifiedHtml).toBuffer((err, buffer) => {
              if (err) {
                console.error('Error generating PDF:', err);
                return;
              }
              return buffer;
            });
        });
    }

    async generateProducts(type){
        htmlData = ``;
        labelData = this.labelTemplate.loadTemplateFile();
        columns = await this.projectManager.getColumnProject(labelData.quoteColumn);
        columnId = undefined;
        payColumn = columns.find(column => column.name === labelData.payedColumn).id;
        if(type === 'quote'){
            columnId = columns.find(column => column.name === labelData.quoteColumn).id;
        } else if(type === 'invoice'){
            columnId = columns.find(column => column.name === labelData.invoiceColumn).id;
        }
        cards = await this.projectManager.getCardsInColumn(owner, repo, columnId)
        for(card in cards){
            for(label in card.labels){
                if(labelData[label]){
                    price = labelData[label].price;
                    hourPrice = labelData[label].hourPrice;
                    desc = labelData[label].title;
                    htmlData += `<tr><td>${label}</td><td>${price}</td><td>${hourPrice}</td><td>${desc}</td></tr>`;
                }
                this.projectManager.moveCardToColumn(card.id, columnId);
            }
        }
        return htmlData;
    }
}

module.exports = InvoiceManager;