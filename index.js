console.log("hello nodejs");
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

//app.use(bodyParser.urlencoded({extended:true}));
//app.use(multer());

//app.use(bodyParser.json()); // for parsing application/json
//app.use(multer()); // for parsing multipart/form-data
//
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.get('/pack',(req,res)=>{
	let output = fs.createWriteStream(path);
	output.on('close',()=>{
		res.setHeader('Content-Disposition',contentDisposition(filename));
		res.sendFile(path, getfile());
	});
	output.on('error',(err)=>{
		res.err(500,err);
	});
	
	let arch = archiver('zip',{zilb:{level:9}});
	arch.pipe(output);
	arch.directory('files/',false);
	arch.finalize();
});
app.get('/list',(req,res)=>{
	//let ify = JSON.stringify;
	//console.log('0 res',(res));
	//res.
	fs.readdir('files/',(err,files)=>{
		//console.log('err',err);
		if(err){res.status(400).send(err);return;}
		//console.log('11111111111` res',res);
		//console.log(files);
		res.send(files);
		//res.done(files);
	});
});
app.post('/getfile',(req,res)=>{
	//Content-Type: application/x-www-form-urlencoded
	res.setHeader('Content-Disposition',contentDisposition(filename));
	//log(req);
	log(req.body.filename);
	if(!req.body.filename){
		res.status(400).send('required field filename');
		return;
	}
	res.sendFile(__dirname+"\\files\\"+req.body.filename, {
		filename:req.body.filename
	});

});
app.use(express.static(__dirname));
app.listen(8888);
