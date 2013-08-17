#!/bin/sh

host=localhost
port=27017
db=dnd4e

cd "$(dirname $0)"
for c in `mongo --quiet $host:$port/$db --eval 'db.getCollectionNames()' | sed 's/,/ /g'`
do
    mongoexport --host $host --port $port -d $db -c $c > $c.json
done
