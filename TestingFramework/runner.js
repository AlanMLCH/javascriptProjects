const fs = require("fs");
const path = require("path");
const chalk = require("chalk");

const forbiddenDirs  = ['node_modules'];

class Runner {
    constructor(){
        this.testFiles = [];
    };

    async runTests(){
        for(let file of this.testFiles){
            console.log(`---${file.shortName}`)
            const beforeEaches = [];
            global.beforeEach = (fn) =>{
                beforeEaches.push(fn);
            };
            global.it = (desc, fn) =>{
                beforeEaches.forEach(func=>func());
                try{
                    fn();
                    console.log(chalk.green(`OK - ${desc}`))
                } catch(err){
                    const message = err.message.replace(/\n/g, "\n\t\t")
                    console.log(chalk.red(`X - ${desc}`));
                    console.log(chalk.red("\t", err.message));

                }
                
            };
            try{
                require(file.name);
            } catch(err){
                console.log(chalk.red("X - Error loading File.", file.name));
                console.log(chalk.red("\t", err.message));

            }
        }
    }

    async collectFiles(targetPath){
      const files = await fs.promises.readdir(targetPath); 
      
      for (let file of files){
        const filepath = path.join(targetPath, file);
        const stats = await fs.promises.lstat(filepath);

        if(stats.isFile() && file.includes(".test.js")){
            this.testFiles.push({name: filepath, shortName: file})
        } else if(stats.isDirectory()&& !forbiddenDirs.includes(file)){
            const childFiles = await fs.promises.readdir(filepath);

            files.push(...childFiles.map(f=> path.join(file, f)));
        }
      }
    }
}

module.exports = Runner;

