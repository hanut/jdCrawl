var cheerio = require('cheerio'),
	mongoose = require('mongoose'),
	request = require('request');

mongoose.connect('mongodb://localhost/crawltest');

var Shop = mongoose.model('Shop',{category:String,name:String});

try{
	Shop.remove({},function(){
		console.log('Cleared DB');
		startScraping(function(){
			console.log("Scrape Init finished.")
		});
	});
}catch(e){
	console.log(e);
}

var shopList = [];

var loadPage = function(url,cb){
	request(url, function (error, response, body) {
	  if (!error && response.statusCode == 200) {
	    cb(body); // load the HTML 
	  }else{
	  	console.log(error);
	  	cb(false);
	  }
	});
};

var getShopCategories = function(body, cb){
	var $ = cheerio.load(body);
	var shopCats = [];
	$('#sear-div select option').each(function(index, element){
		var cat = {
			name:element.children[0].data,
			url:element.attribs.value
		};
		shopCats.push(cat);
	});
	shopCats.shift();
	cb(shopCats);
};

var getShopsOnPage = function(url,category,cb){
	loadPage(url, function(body) {
		var $ = cheerio.load(body);
		var list = [];
		var shop = $('td a','.search-table').each(function(index,element){
			list.push({
				name:element.attribs.title.substr(18,element.attribs.title.length),
				category:category.name
			});
		});
		if(list.length <= 0){
			cb(false);
		}else{
			cb(list);
		}
	});
};

var getData = function(category,pageno){
	console.log("==========================================================");
	console.log("CATEGORY "+category.name);
	for(var page=1;page<=3;page++){
		var list = getShopsOnPage(category.url+"/?page="+page,category,function(list){
			if(list){
				console.log(list);
				Shop.insertMany(list,function(err,shops){
					if(err){
						console.log(err);
					}else{
						console.log('Shops for '+category.name+" have been saved");
					}
				});
			}
		});
	}
	// cb(category,shopList);
};

var startScraping = function(cb){
	loadPage('http://dlfmallofindia.in/shop/',function(body){
		if(body){
			getShopCategories(body, function(categories){
				for(var i=0,len=categories.length;i<len;i++){
					getData(categories[i]);
				}
			});
		}
	});
	cb();
};