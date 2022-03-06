#!/usr/bin/env node

import yargs from 'yargs';
import { webpack } from 'webpack';
import path from 'path';
import { writeFile } from 'fs';

const options = yargs
 .usage("Usage: -n <name>")
 .option("file", { alias: "f", describe: "The games main file, webpack entry file", type: "string", requiresArg: true, demandOption: true })
 .option("name", { alias: "n", describe: "The games name", type: "string", requiresArg: true, demandOption: true })
 .parseSync();

const gameName = options.name || options.n 
const file = options.file || options.f
const entry = path.join(process.cwd(), file as string);


console.log(`
Using directory ${process.cwd()}
Entry File: ${entry}
Game Name: ${gameName}
`) 
const config = {
	mode: undefined,
	entry: entry,
	target: 'node',
	output: {
		path: path.resolve(path.join(process.cwd(), 'release')),
		filename: gameName + '.js',
	}
}

console.log(`>> Building ${options.name}...`)

const batch_file = `
start /max node ${options.name + '.js'}
`



webpack(config, (err, stats) => {
	if (err || stats?.hasErrors()) {
		return console.error(err || stats?.toString());
	  }
	console.log(`>> Built ${options.name}`)
	console.log(`>> Creating batch file: \n${batch_file}`)
	writeFile(path.join(process.cwd(), 'release', 'run-' + gameName + '.bat'), batch_file, (err) => {
		if(err) return console.error(err);
		console.log('>> Created batch file')
	});
})

