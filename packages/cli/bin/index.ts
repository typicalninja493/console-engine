#!/usr/bin/env node

import yargs from 'yargs';
import { webpack } from 'webpack';
import path from 'path';
import { writeFile } from 'fs';
import cliProgress from 'cli-progress'
import ansiColors from 'ansi-colors';

const options = yargs
 .usage("Usage: -n <name>")
 .option("file", { alias: "f", describe: "The games main file, webpack entry file", type: "string", requiresArg: true, demandOption: true })
 .option("name", { alias: "n", describe: "The game's name", type: "string", requiresArg: true, demandOption: true })
 .parseSync();

const bar = new cliProgress.SingleBar({
    format: `${ansiColors.green('{bar}')} | ${ansiColors.red('{percentage}')}${ansiColors.magenta('%')} | ${ansiColors.cyan('{action}')}`,
    hideCursor: true
});

bar.start(100, 0, {
	action: 'Compiling...'
});

const gameName = options.name || options.n 
const file = options.file || options.f
const entry = path.join(process.cwd(), file as string);

bar.update(10, {
	action: `Creating config...`
})

/*console.log(`
Using directory ${process.cwd()}
Entry File: ${entry}
Game Name: ${gameName}
`) */
const config = {
	mode: undefined,
	entry: entry,
	target: 'node',
	output: {
		path: path.resolve(path.join(process.cwd(), 'release')),
		filename: gameName + '.js',
	}
}

bar.update({
	action: `Creating batch file data`
})


const batch_file = `
start /max node ${options.name + '.js'}
`
bar.update(40, {
	action: `Created batch file`
});

bar.update(60, {
	action: `Base Game compiled, and wrote to release folder`
});
webpack(config, (err, stats) => {
	if (err || stats?.hasErrors()) {
		return console.error(err || stats?.toString());
	  }
	bar.update(80, {
		action: `Creating batch file`
	});
	writeFile(path.join(process.cwd(), 'release', 'run-' + gameName + '.bat'), batch_file, (err) => {
		if(err) return console.error(err);
		bar.update(90, {
			action: `Created Batch File`
		});
		writeFile(path.join(process.cwd(), 'release', 'data.json'), JSON.stringify({ 
			name: gameName, 
			gameFile: path.join(process.cwd(), 'releases', gameName + '.js'), 
			raw: path.join(process.cwd(), ''), 
			run: path.join(process.cwd(), 'release', 'run-' + gameName + '.bat'),
		}, null, 5), (err) => {
			if(err) return console.error(err);
			bar.update(100, {
				action: `Created Version Data`
			});

			bar.stop();
		})
	});
})

