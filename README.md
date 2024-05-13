# Github invoice
This is an extension github to make github handle invoice for each agile project.

## Purpose
- for each open tickets on github, create a quote with all informations relative to the ticket
- push the quote on the repo
- on client sign the quote, assigne the ticket or mark the ticket as ready to develop
- transform quote into invoice
- push the invoice inside the repo
- handle payement
- on payment receive merge the fix issue into delivery (client) branch
- each label has his own price
- free label cancel the quote for the issue

## Install
1. install redis server
create redis configMap using this command
```kubectl create configmap invoice-db-conf --from-file=redis.conf```
then add redis config file content using k9s on editing invoice-db-conf

## Launch
kubectl apply -f ./deployment.yaml