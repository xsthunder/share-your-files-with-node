console.log("hello nodejs");
const filepath = __dirname+"/files";

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
app.get('/pack',(req,res)=>{
	let output = fs.createWriteStream(path);
	output.on('close',()=>{
		res.setHeader('Content-Disposition',contentDisposition(filename));
		res.sendFile(path, getfile());
	});
	output.on('error',(err)=>{
		res.status(500).send(err);
	});
	
	let arch = archiver('zip',{zilb:{level:9}});
	arch.pipe(output);
	arch.directory('files/',false);
	arch.finalize();
});
app.get('/list',(req,res)=>{
	fs.readdir(filepath,(err,files)=>{
		if(err){res.status(400).send(err);return;}
		res.send(files);
	});
});
app.post('/getfile',(req,res)=>{
	//Content-Type: application/x-www-form-urlencoded
	res.setHeader('Content-Disposition',contentDisposition(filename));
	log(req.body);
	if(!req.body.filename){
		res.status(400).send('required field filename');
		return;
	}
	console.log(filepath + req.body.filename +'/');
	fs.readdir( filepath + req.body.filename +'/', (err,files)=>{
		if(err){
			res.sendFile(filepath+req.body.filename, {
				filename:req.body.filename
			});
		}
		else {
			res.send(files);
		}
	});
});
app.use(express.static(__dirname));
app.use(express.static(__dirname+'/files/'));
app.listen(8888);
