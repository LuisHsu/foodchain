const fs = require('fs');
const Path = require('path');
fs.readdir(Path.join(__dirname), (err, files) => {
    files.filter(val => val.startsWith('Group')).forEach((path, index) => {
        fs.renameSync(path, Path.join(__dirname, `Marketing_Tile-${index+1}.svg`))
    });
})