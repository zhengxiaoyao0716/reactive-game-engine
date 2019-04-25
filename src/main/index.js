/** Server */

import path from 'path';
import fs from 'fs';
import util from 'util';
import carlo from 'carlo';
import parseArgs from '../util/parseArgs';
import core, { subject } from '../core/main';

const buildDir = path.resolve(__dirname, '../../build');
const fsReadFile = util.promisify(fs.readFile);

const args: { dev?: boolean } = parseArgs(process.argv);

const loadPage = args.dev ? 'http://localhost:3000' : '/';
args.dev && console.log(`launch with develop mode, load: ${loadPage}.`); // eslint-disable-line no-console

(async () => {
  const app = await carlo.launch();
  app.on('exit', () => process.exit());

  app.serveFolder(buildDir);
  app.serveHandler(async request => {
    if (args.dev) {
      request.continue();
      return;
    }
    if (request.resourceType() !== 'Document') {
      request.continue();
      return;
    }
    const headers = { 'content-type': 'text/html' };
    const body = await fsReadFile(path.join(buildDir, 'index.html'));
    request.fulfill({ headers, body });
  });

  await app.exposeFunction('args', _ => args);
  await app.exposeFunction('core', core);
  subject.subscribe({ next: data => app.evaluate(data => window.core.subject.next(data), data) }); // pipe the data from server side to browser side.

  await app.load(loadPage);
})();
