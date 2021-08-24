/** @desc coded by: Maxim Zaika & Sanjay Sekar Samuel
          library utilised: https://www.npmjs.com/package/exceljs */


var fs = require('fs');
class runWorksheet {
  constructor(data,worksheet,workbook) {
    this.data = data;
    this.worksheet = worksheet;
    this.workbook = workbook;
  }

  writeExcel() {
    var worksheet = this.worksheet;
    var workbook = this.workbook;
    var data = this.data;
    var date = data.date;
    var size_b = data.size_b;
    var size_kb = data.size_kb;
    var data_type = data.data_type;

    worksheet.columns = [ //assigns each column a specific name
          { key: 'from'},
          { key: 'to'},
          { key: 'description'},
          { key: 'amount'},
          { key: 'size_b'},
          { key: 'size_kb'},
          { key: 'data_type'},
          { key: 'date'}
    ]
    var arrData = [];
    arrData.push(data); // pushes dictionary inside the array
    arrData.forEach(function(item, index) { //fills up the array based on the data, and the column name (from prev line of code)
      worksheet.addRow({
         from: item.from,
         to: item.to,
         description: item.description,
         amount: item.amount,
         size_b: item.size_b,
         size_kb: item.size_kb,
         data_type: item.data_type,
         date: item.date
      })
    })

    if (fs.existsSync('../userData.xlsx')) { // checks whether the file exists or not
      workbook.xlsx.readFile('../userData.xlsx') // if file exists, read it
        .then(function() {
            data.date = date;
            data.size_b = size_b;
            data.size_kb = size_kb;
            data.data_type = data_type;
            var worksheet = workbook.getWorksheet(1); // get the data of the old file, and compile
            worksheet.columns = [ //assigns each column a specific name
                  { key: 'from'},
                  { key: 'to'},
                  { key: 'description'},
                  { key: 'amount'},
                  { key: 'size_b'},
                  { key: 'size_kb'},
                  { key: 'data_type'},
                  { key: 'date'}
            ]
            arrData.forEach(function(item, index) { //fills up the array based on the data, and the column name (from prev line of code)
              worksheet.addRow({
                 from: item.from,
                 to: item.to,
                 description: item.description,
                 amount: item.amount,
                 size_b: item.size_b,
                 size_kb: item.size_kb,
                 data_type: item.data_type,
                 date: item.date
              })
            })
            console.log("[EXCEL] ../userData.xlsx has been updated")
            return workbook.xlsx.writeFile('../userData.xlsx'); //rewrites old file with old data + new data
      });
    } else { //if file does not exist, simply creates with the data provided
      workbook.xlsx.writeFile("../userData.xlsx");
      console.log("[EXCEL] new ../userData.xlsx has been created")
    }
  }
}

module.exports = runWorksheet;
