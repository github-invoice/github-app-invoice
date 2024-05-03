
docker build -t invoice .
docker tag invoice 159091/invoice:1.0
docker push 159091/invoice:1.0