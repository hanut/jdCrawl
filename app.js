var cheerio = require('cheerio'),
	excel = require('xlsx'),
	request = require('request');

var loadPage = function(url,cb){
	request(url, function (error, response, body) {
	  if (!error && response.statusCode == 200) {
	    cb(body); // load the HTML 
	  }else{
	  	console.log(error);
	  	console.log(response);
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

var getShopsOnPage = function(url,cb){
	loadPage(url, function(body) {
		var $ = cheerio.load(body);
		$('.search-table tbody tr').each(function(index,element){
			console.log(index);
		});
		cb();
	});
};

var getData = function(category,cb){
	var shopList = [];
	var pageno = 1;
	getShopsOnPage(category.url+"/?page="+pageno,function(){
		console.log("-----------");
	});
	cb(category,shopList);
};

(function(){
	loadPage('http://dlfmallofindia.in/shop/',function(body){
		if(body){
			getShopCategories(body, function(categories){
				for(var i=0,len=categories.length;i<len;i++){
					getData(categories[i],function(cat,shopList){
						console.log(cat.name, shopList);
					});
				}
			});
		}
	});
})();