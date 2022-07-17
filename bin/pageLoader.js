#!/usr/bin/env node

import { program } from 'commander';
import loadPage from '../src/index.js';

program
  .description('Page loader utility')
  .version('0.0.1')
  .argument('<url>')
  .option('-o, --output <dir>', 'output dir', process.cwd())
  .action((url, option) => {
    loadPage(url, option.output).then(console.log);
  });

program.parse();
