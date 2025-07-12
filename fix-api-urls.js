const fs = require('fs');
const path = require('path');

// Function to recursively find all JS/JSX files
function findFiles(dir, extensions = ['.js', '.jsx']) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat && stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      results = results.concat(findFiles(filePath, extensions));
    } else if (extensions.some(ext => file.endsWith(ext))) {
      results.push(filePath);
    }
  });
  
  return results;
}

// Function to replace hardcoded URLs
function replaceUrls(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Replace hardcoded localhost URLs with API_BASE_URL
  const replacements = [
    {
      from: /http:\/\/localhost:6969\/auth\//g,
      to: '${API_BASE_URL}/auth/'
    },
    {
      from: /http:\/\/localhost:6969\/notes\//g,
      to: '${API_BASE_URL}/notes/'
    },
    {
      from: /http:\/\/localhost:6969\/comments\//g,
      to: '${API_BASE_URL}/comments/'
    },
    {
      from: /http:\/\/localhost:6969\/categories\//g,
      to: '${API_BASE_URL}/categories/'
    },
    {
      from: /http:\/\/localhost:6969\/messages\//g,
      to: '${API_BASE_URL}/messages/'
    },
    {
      from: /http:\/\/localhost:6969\/authors\//g,
      to: '${API_BASE_URL}/authors/'
    },
    {
      from: /http:\/\/localhost:6969\/files\//g,
      to: '${API_BASE_URL}/files/'
    },
    {
      from: /http:\/\/localhost:6969\/upload-image/g,
      to: '${API_BASE_URL}/upload-image'
    }
  ];
  
  replacements.forEach(({ from, to }) => {
    if (content.match(from)) {
      content = content.replace(from, to);
      modified = true;
    }
  });
  
  // Add API_BASE_URL import if not already present and we made changes
  if (modified && !content.includes('import API_BASE_URL')) {
    const importStatement = "import API_BASE_URL from '../config/api.js';\n";
    const lines = content.split('\n');
    
    // Find the first import statement
    let insertIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('import ')) {
        insertIndex = i + 1;
      }
    }
    
    lines.splice(insertIndex, 0, importStatement);
    content = lines.join('\n');
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

// Main execution
const clientSrcPath = path.join(__dirname, 'client', 'src');
const files = findFiles(clientSrcPath);

console.log('Fixing hardcoded API URLs...');
files.forEach(file => {
  if (!file.includes('config/api.js')) { // Skip the config file itself
    replaceUrls(file);
  }
});
console.log('Done!'); 