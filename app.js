//important note the data.json must have some values beforehand. also project name on last value in data.json must be common in sheet.

const child_process = require('child_process');
const { Console } = require('console');
const fs = require("fs");
const {google} = require("googleapis")


async function getProject(){
    const auth =new google.auth.GoogleAuth({
    keyFile : "cred.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets"
  })
  
    const client = await auth.getClient();
  
    const googlesheets = google.sheets({version:"v4",auth: client})
  
    const spreadsheetId = "1sQviPG1zp8vSmaeA0BfZAduqJb1bLAGlrijWFi0bJ8o"
  
    const viewColumns = await googlesheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range:"data",
    majorDimension:"COLUMNS"
    })
    return viewColumns.data.values
  }

function updateData(project_to_add,data,index){
  const len = project_to_add[0].length
  console.log(len)
  for(let i=index+1;i<len;i++){
    const writeObj = 
    {
      "project_name":"",
      "date":"",
      "github":"",
      "live":"",
      "description":""
  
    }
  writeObj.project_name = project_to_add[0][i]
  writeObj.date = project_to_add[1][i]
  writeObj.github = project_to_add[2][i]
  writeObj.live = project_to_add[3][i]
  writeObj.description = project_to_add[4][i]


  data.push(writeObj)
  } 
  return data
}
function findIndex(project_to_add,data){
      const index = project_to_add[0].indexOf(data[data.length-1].project_name)
      return index
}


  getProject()
  .then((res)=>{
    child_process.exec('gitfetch.bat', function(error, stdout, stderr) {
      console.log(error);
      const project_to_add = res
      const data = JSON.parse(fs.readFileSync("../repo/projects/data.json", "utf-8", (err, dat) => {}));
      const index = findIndex(project_to_add,data)
      const updatedData = updateData(project_to_add,data,index)
      const writeData = JSON.stringify(updatedData)
      console.log(updatedData)
      fs.writeFileSync('../repo/projects/data.json', writeData, err => {});
      child_process.exec('gitpush.bat', function(error, stdout, stderr) {
        console.log(error);
    });
    }); 
  })















