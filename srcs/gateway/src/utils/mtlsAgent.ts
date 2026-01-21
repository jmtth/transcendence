// import { Agent } from 'undici';
// import fs from 'fs';

// export const mtlsAgent = new Agent({
//   connect: {
//     key: fs.readFileSync('/etc/certs/api-gateway.key'),
//     cert: fs.readFileSync('/etc/certs/api-gateway.crt'),
//     ca: fs.readFileSync('/etc/ca/ca.crt'),
//     rejectUnauthorized: true,
//   },
// });
import https from 'https';
import fs from 'fs';

export const agent = new https.Agent({
  key: fs.readFileSync('/etc/certs/api-gateway.key'),
  cert: fs.readFileSync('/etc/certs/api-gateway.crt'),
  ca: fs.readFileSync('/etc/ca/ca.crt'),
  rejectUnauthorized: true,
});
