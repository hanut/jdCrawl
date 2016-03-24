var mongoose = require('mongoose'),
	fs = require('fs');

mongoose.connect('mongodb://localhost/crawltest');

var Shop = mongoose.model('Shop',{category:String,name:String});

function Workbook() {
  if(!(this instanceof Workbook)) return new Workbook();
  this.SheetNames = [];
  this.Sheets = {};
}

var getCategories = function(cb){
	Shop.find().distinct('category',function(err,categories){
		if(err){
			console.log(err);
			cb(false);
		}else{
			cb(categories);
		}
	});
};

var getShops = function(category,cb){
	Shop.find({'category':category}).exec(function(err, shops){
		if(err){
			cb(category,false);
		}else{
			cb(category,shops);
		}
	});
};
var proCats=0;
var startReport = function(){
	getCategories(function(categories){
		// console.log(categories);
		for(var i=0,len=categories.length; i < len; i++){
			var category = categories[i];
			var cLen = categories.length;
			getShops(category,function(category,shops){
				if(shops){
					console.log('writing '+category+" file...");
					var writeStream = fs.createWriteStream("./shops/"+category.replace("|","").substr(0,7)+".xls");
					var fileData = category.toUpperCase()+"\n";
					fileData += "#"+"\t"+"Name"+"\n";
					for(var i=0,len=shops.length;i<len;i++){
						fileData += (i+1)+"\t"+shops[i].name+"\n";
					}
					writeStream.write(fileData);
					writeStream.close();
					proCats++;
					if(proCats>=cLen){
						endReport();
					}
				}
			});
		}
		console.log('Reporting initiated.');
	});
	return;
};

function endReport(){
	process.exit();
};

startReport();