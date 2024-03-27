//important note the data.json must have some values beforehand. also project name on last value in data.json must be common in sheet.

const child_process = require('child_process');
const fs = require("fs");
const path = require("path")
const {google} = require("googleapis")
const { Client } = require("@notionhq/client");
const hljs = require("highlight.js/lib/common");
require("dotenv").config();


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
    range:"projects",
    majorDimension:"COLUMNS"
    })
    return viewColumns.data.values
  }

function updateProjects(project_to_add){
  let data = []
  const len = project_to_add[0].length
  console.log(len)
  for(let i=len-1;i>=1;i--){
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

getProject()
  .then((res)=>{
      const project_to_add = res
      const filepath  = `D:/pet_projects/Arpit078.github.io/data/projects_data.json`
      const updatedData = updateProjects(project_to_add)
      const writeData = JSON.stringify(updatedData)
      console.log(updatedData)
      fs.writeFileSync(filepath, writeData, err => {});
    //   child_process.exec('gitpush.bat', function(error, stdout, stderr) {
    //     console.log(error);
    // });
  })

//books 
async function getBooks(){
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
    range:"books",
    majorDimension:"COLUMNS"
    })
    return viewColumns.data.values
  }

function updateBooks(project_to_add){
  let data = []
  const len = project_to_add[0].length
  console.log(len)
  for(let i=len-1;i>=1;i--){
    const writeObj = 
    {
      "book_name":"",
      "read_date":"",
      "cover_url":"",
      "description":""
  
    }
  writeObj.book_name = project_to_add[0][i]
  writeObj.read_date = project_to_add[3][i]
  writeObj.cover_url = project_to_add[2][i]
  writeObj.description = project_to_add[1][i]


  data.push(writeObj)
  } 
  return data
}

getBooks()
  .then((res)=>{
      const project_to_add = res
      const filepath  = "D:/pet_projects/Arpit078.github.io/data/books_data.json"
      const updatedData = updateBooks(project_to_add)
      const writeData = JSON.stringify(updatedData)
      console.log(updatedData)
      fs.writeFileSync(filepath, writeData, err => {});
    //   child_process.exec('gitpush.bat', function(error, stdout, stderr) {
    //     console.log(error);
    // });
  })





//blogs
//---------------------------------------------------------------------------------
//getblogs
const notion = new Client({ auth: process.env.NOTION_API_KEY });

async function getBlocks(block_id) {
  let { results: children } = await notion.blocks.children.list({ block_id });
  for (const child of children) {
    const grandchildren = await getBlocks(child.id);
    child.children = grandchildren;
  }
  return children;
}

async function importPages() {
  // Retrieve pages from the database.
  let { results: pages } = await notion.databases.query({
    database_id: process.env.NOTION_DATABASE_ID,
  });

  // Attach blocks to pages
  for (const page of pages) {
    const blocks = await getBlocks(page.id);
    page.children = blocks;
  }

  // Write the result to file.
  const outputFile = path.join(__dirname, "notion-export.json");
  fs.writeFileSync(outputFile, JSON.stringify(pages, null, 2));
  console.log(`Wrote ${pages.length} pages to ${outputFile}`);
}

importPages().then(
(res)=>{
  const outputFile = path.join(
    __dirname,
    "./notion-export.json"
  );
  
  if (!fs.existsSync(outputFile)) {
    console.error(`File not found: ${outputFile}`);
    process.exit(1);
  }
  
  const pages = JSON.parse(fs.readFileSync(outputFile));
  
  function resolveTabs(tabsBlocks) {
    return tabsBlocks
      .map((tab) => {
        if (tab.type !== "callout") return null;
        return {
          label: tab.callout.rich_text
            .map(({ plain_text }) => plain_text)
            .join(""),
          text: tab.children[0].paragraph.rich_text
            .map(({ plain_text }) => plain_text)
            .join(""),
        };
      })
      .filter(Boolean);
  }
  
  const calloutMap = {
    tabs: (block) => {
      return {
        component: "Tabs",
        tabs: resolveTabs(block.children),
      };
    },
    code: (block) => {
      if (!block.children[0].code) {
        console.log("Code component must be first child of code callout");
        return null;
      }
      const code = block.children[0].code.rich_text
        .map(({ plain_text }) => plain_text)
        .join("");
      // YOU MAY NEED A MAPPER FOR THIS
      const language = block.children[0].code.language;
      const highlightedCode = hljs.highlight(code, { language }).value;
      return {
        component: "CodeBlock",
        filename: block.callout.rich_text
          .map(({ plain_text }) => plain_text)
          .join(""),
        code: highlightedCode,
        language: block.children[0].code.language,
      };
    },
  };
  
  function resolveCalloutComponent(block) {
    if (block.callout?.icon?.type !== "external") {
      console.log("ICON NOT SUPPORTED:", block.callout.icon);
      return null;
    }
    const iconName = block.callout.icon.external.url
      .split("/")
      .pop()
      .split(".")[0]
      .split("_")[0];
    if (!calloutMap[iconName]) {
      console.log("EXTERNAL ICON NOT SUPPORTED:", iconName);
      return null;
    }
    return calloutMap[iconName](block);
  }
  
  const blockMap = {
    callout: (block) => {
      const result = resolveCalloutComponent(block);
      if (!result) return null;
      return result;
    },
    paragraph: (block) => {
      if (block.paragraph.rich_text.length === 0) return null;
      return {
        component: "paragraph",
        text: block.paragraph.rich_text
          .map(({ plain_text }) => plain_text)
          .join(""),
      };
    },
    bulleted_list_item : (block)=>{
      if (block.bulleted_list_item.rich_text.length === 0) return null;
      return {
          component : "bulleted_list_item",
          text: block.bulleted_list_item.rich_text
          .map(({ plain_text }) => plain_text)
          .join(""),
      }
  
    },
    numbered_list_item : (block)=>{
      if (block.numbered_list_item.rich_text.length === 0) return null;
      return {
          component : "numbered_list_item",
          text: block.numbered_list_item.rich_text
          .map(({ plain_text }) => plain_text)
          .join(""),
      }
  
    },
    code : (block)=>{
      if (block.code.rich_text.length === 0) return null;
      return {
          component : "code",
          text: block.code.rich_text
          .map(({ plain_text }) => plain_text)
          .join(""),
      }
  
    }
  };
  
  function transformBlocks(blocks) {
    return blocks
      .map((block) => {
        if (blockMap[block.type]) {
          return blockMap[block.type](block);
        }
        console.log("NOT SUPPORTED:", block.type);
      })
      .filter(Boolean);
  }
  
  // console.log(pages)
  
  let output = pages.map((page) => {
    const { properties, children, id } = page;
    return {
      id,
      title: properties.Blog.title[0].text.content,
      // urlPath: properties.Slug.rich_text[0].plain_text,
      date:properties.Date.date.start,
      blocks: transformBlocks(children),
    };
  });
  console.log(output)
  const transformedOutput = "D:/pet_projects/Arpit078.github.io/data/blogs_data.json";
  fs.writeFile(transformedOutput, JSON.stringify(output, null, 2),err=>{console.err}
  );
  

  // child_process.exec('gitpush.bat', function(error, stdout, stderr) {
  // console.log(error);
  // });
  console.log(`Transformed ${output.length} pages to ${transformedOutput}`);
}
);
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------



//transform pages




//---------------------------------------------------------------------------------














// async function getBlogs(){
//     const auth =new google.auth.GoogleAuth({
//     keyFile : "cred.json",
//     scopes: "https://www.googleapis.com/auth/spreadsheets"
//   })
  
//     const client = await auth.getClient();
  
//     const googlesheets = google.sheets({version:"v4",auth: client})
  
//     const spreadsheetId = "1sQviPG1zp8vSmaeA0BfZAduqJb1bLAGlrijWFi0bJ8o"
  
//     const viewColumns = await googlesheets.spreadsheets.values.get({
//     auth,
//     spreadsheetId,
//     range:"blogs",
//     majorDimension:"COLUMNS"
//     })
//     return viewColumns.data.values
//   }

// function updateBlogs(project_to_add){
//   let data = []
//   const len = project_to_add[0].length
//   console.log(len)
//   for(let i=len-1;i>=1;i--){
//     const writeObj = 
//     {
//       "title":"",
//       "date":"",
//       "content":""
//     }
//   writeObj.title = project_to_add[0][i]
//   writeObj.date = project_to_add[1][i]
//   writeObj.content = project_to_add[2][i]

//   data.push(writeObj)
//   } 
//   return data
// }

// getBlogs()
//   .then((res)=>{
//       const project_to_add = res
//       const filepath  = "D:/pet_projects/Arpit078.github.io/data/blogs_data.json"
//       const updatedData = updateBlogs(project_to_add)
//       const writeData = JSON.stringify(updatedData)
//       console.log(updatedData)
//       fs.writeFileSync(filepath, writeData, err => {});
//       child_process.exec('gitpush.bat', function(error, stdout, stderr) {
//         console.log(error);
//     });
//   })















