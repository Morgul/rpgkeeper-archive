#!/bin/sh

host=localhost
port=27017
db=dnd4e

cd "$(dirname $0)"
for file in *.json
do
    mongoimport --host $host --port $port -d $db -c ${file%.json} < $file
done
