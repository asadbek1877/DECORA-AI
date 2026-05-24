const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(fullPath));
        } else {
            results.push(fullPath);
        }
    });
    return results;
}

const files = walk('./src').filter(f => f.endsWith('.ts'));
let changedCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    // Импортларга .js қўшадиган асосий мантиқ
    const regex = /(from\s+['"])((\.\/|\.\.\/)[^'"]+?)(?<!\.js)(['"])/g;
    const newContent = content.replace(regex, '$1$2.js$4');
    
    if (content !== newContent) {
        fs.writeFileSync(file, newContent, 'utf8');
        changedCount++;
        console.log(`Ўзгарди: ${file}`);
    }
});

console.log(`\nЖами ${changedCount} та файлдаги импортларга .js қўшилди!`);