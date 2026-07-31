'use strict';

/**
 * @file    server.js
 * @brief   basic nodeJS web server
 * @author  Echo-7
 * @date    3 May 2022
 */

import http from 'http';
import url from 'url';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 9999;

const server = new http.createServer(function (req, res) {
    var query = url.parse(req.url, true);  
    var filename = path.join(__dirname, query.pathname);

    if(req.method === 'POST') {
        req.setEncoding('utf8');
        req.on('data', function(data) {
            console.log(data);
            res.write(JSON.stringify({ack:true}));
            res.end();
        });
    } else if(req.method === 'GET') {
        fs.readFile(filename, function(err, data) {
            if(err) {
                res.writeHead(404, {'Content-Type': 'text/plain'});
                return res.end("404 File Not Found: " + filename);
            }
            var mimeType = filename.match(/(?:html|js|css|svg)$/i);
            if(mimeType && mimeType[0] === 'js') {
                mimeType = "text/javascript";
            } else if(mimeType && mimeType[0] === 'svg') {
                mimeType = 'image/svg+xml';
            } else {
                mimeType =  mimeType ? 'text/' + mimeType[0] : 'text/plain';
            }
            
            console.log('serving: ' + filename);
            res.writeHead(200, {'Content-Type': mimeType });
            res.write(data);
            res.end();
        });
    }
    
});

server.listen(PORT);

server.once('listening', function() {
    console.log('server listening on port ' + PORT);
});

server.on('error', function(e) {
    console.log('error code: ' + e.code);
});
