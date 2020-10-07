console.log("hello nodejs");
//const filepath = __dirname+"/files";
const filepath = "./files"
const port = 5000

const express = require('express');
const contentDisposition = require('content-disposition');
const archiver = require('archiver');
const fs = require('fs');
const log = console.log

var bodyParser = require('body-parser');
//var multer = require('multer');

let filename = 'example.zip';
let path = __dirname + filename;
let getfile=()=>{
	let file = {};
	file.name = filename;
	return file;
};

//
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
//log(multer);
//app.use(multer()); // for parsing multipart/form-data
function getClientIp(req) {
	return req.headers['x-forwarded-for'] ||
		req.connection.remoteAddress ||
		req.socket.remoteAddress ||
		req.connection.socket.remoteAddress;
};
app.use((req,res,next)=>{
	let s = (getClientIp(req));
	let ip = s.substr(s.lastIndexOf(':')+1);
    // next()
	if(s == '::1' || ip == "127.0.0.1" || ip == "192.168.1.5" || ip == "192.168.1.6" || ip == "192.168.1.7"|| ip == "192.168.1.103"){
		next();
	}
	else res.send("haha");
});

// no longer in use
// app.get('/pack',(req,res)=>{
// 	let output = fs.createWriteStream(path);
// 	output.on('close',()=>{
// 		res.setHeader('Content-Disposition',contentDisposition(filename));
// 		res.sendFile(path, getfile());
// 	});
// 	output.on('error',(err)=>{
// 		res.status(500).send(err);
// 	});

// 	let arch = archiver('zip',{zilb:{level:9}});
// 	arch.pipe(output);
// 	arch.directory('files/',false);
// 	arch.finalize();
// });

// see https://glitch.com/edit/#!/server-side-cache-express?path=server.js:9:0
var mcache = require('memory-cache');
var cache = (duration) => {
  return (req, res, next) => {
	let key = '__express__' + (req.originalUrl || req.url) + (req.body.filename?req.body.filename:'')
    let cachedBody = mcache.get(key)
    if (cachedBody) {
      res.send(cachedBody)
      return
    } else {
      res.sendResponse = res.send
      res.send = (body) => {
        mcache.put(key, body, duration * 1000);
        res.sendResponse(body)
      }
      next()
    }
  }
}

app.get('/list', cache(5 * 60)/*5 minute*/, (req,res)=>{
	fs.readdir(filepath,(err,files)=>{
		if(err){res.status(400).send(err);return;}
		res.send(files);
	});
});

// avoid accident load of large size file
app.post('/getfile', cache(5 * 60)/*5 minute*/, (req, res) => {
	//Content-Type: application/x-www-form-urlencoded
	res.setHeader('Content-Disposition',contentDisposition(filename));
	if(!req.body.filename){
		res.status(400).send('required field filename');
		return;
	}
	let path  = filepath + req.body.filename +'/'
	fs.readdir( path, (err,files)=>{
		if(err){
			// res.sendFile(filepath+req.body.filename, {
			// 	filename:req.body.filename
			// });
			// console.log('err on readdir', err, path)
			res.send('reading file content is disabled')
		}
		else {
			res.send(files);
		}
	});
});
app.use(express.static(__dirname));
app.use(express.static(filepath));
app.listen(port);
console.log(`app listen on ${port}`)
