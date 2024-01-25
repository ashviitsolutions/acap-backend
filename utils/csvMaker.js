const csv = require('fast-csv');
const fs = require('fs');


const csvMaker = (model) => {
    return (async (req, res) => {

        model.find({}, (err,models) => {
            if (err) {
                console.error(err);
                return;
            }

            const filename = 'orders.csv';
            const ws = fs.createWriteStream(filename);

            // Create a CSV stream and write the documents to the stream
            const csvStream = csv.format({ headers: true });
            csvStream.pipe(ws);

           models.forEach((order) => {
                csvStream.write(order.toObject());
            });

            // End the CSV stream
            csvStream.end();

            console.log(`Exported ${orders.length} documents to ${filename}`);
        });
    })
}

module.exports = {csvMaker}