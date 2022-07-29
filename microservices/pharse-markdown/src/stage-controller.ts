import pharseMarkdown from './utils'

var fs = require('fs');
  
// Use fs.readFile() method to read the file
fs.readFile('test.md', 'utf8', function(err, data){
      
    // Display the file content
    console.log(pharseMarkdown(data));
});
