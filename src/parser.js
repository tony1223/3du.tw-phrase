
var $ = require("jQuery"),
	fs = require("fs");

function base_url(str){
	return "http://dict.idioms.moe.edu.tw"+str;
}


function search(ccd,word,cb){

	$.post("http://dict.idioms.moe.edu.tw/cgi-bin/cydic/gsweb.cgi",
		{
				basicoptsch:1,
				ccd:ccd,
				input:"檢索",
				o:"e0",
				qs0:word,
				sec:"sec1"
		},function(response){
                          console.log("parsing "+word);
			var titles = $(response).find(".fmt1title a");

			var word_defs = [];
			var content_deferes = [];	
			titles.each(function(){
				var href= base_url($(this).attr("href"));
				var found_word = $(this).text();
				fs.appendFile("parse_log.txt", word+"::"+found_word+"\n", 'UTF-8');
				word_def = $.get(href,function(html){
					try{
						fs.mkdirSync("words");
					}catch(ex){	}

					//如果抓過就跳過
					if(fs.existsSync("words/"+found_word)){
						return true;
					}
					try{
						fs.mkdirSync("words/"+found_word);
					}catch(ex){}
					$(html).find(".leftm a").each(function(ind){
						var item = "";

						if($(this).attr("href") == "#XX"){
							return true;
						}
						var defered = null;
						switch(ind){
							case 0:
							 	defered = handle_pronounce_maining(found_word,base_url($(this).attr("href")));
							 	break;
							case 1:
								defered = handle_source(found_word,base_url($(this).attr("href")));
								break;
							case 2:
								defered = handle_source_description(found_word,base_url($(this).attr("href")));
								break;
							case 3:
								defered = handle_reference(found_word,base_url($(this).attr("href")));
								break;
							case 4:
								defered = handle_usage(found_word,base_url($(this).attr("href")));
								break;
							case 5:
								defered = handle_recognize(found_word,base_url($(this).attr("href")));
								break;
							case 6:
								defered = handle_related_word(found_word,base_url($(this).attr("href")));
								break;
						}
						content_deferes.push(defered);
					});
				});
				word_defs.push(word_def);
			});

			$.when(word_def).then(function(){
				$.when(word_def).then(cb);
			})
			
		});

}


function handle_pronounce_maining(word,href){
	return $.get(href,function(res){
		var $res = $(res);

		//pronounce
		var obj = {
			english_pronounce:$res.find(".english_word").text(),
			chinese_pronounce:$res.find(".std2:eq(1)").text()
		};
		fs.writeFileSync("words/"+word+"/pronounce",JSON.stringify(obj) , "UTF-8");

		//meaning
		obj = {
			meaning: $res.find(".std2:eq(3)").text()
		};
		fs.writeFileSync("words/"+word+"/meaning",JSON.stringify(obj) , "UTF-8");
	});

}
function handle_source(word,href){
	return $.get(href,function(res){
		var $res = $(res);

		var obj = {
			source:$res.find(".std2:eq(0)").html()
		};
		fs.writeFileSync("words/"+word+"/source",JSON.stringify(obj) , "UTF-8");
	});
}
function handle_source_description(word,href){
	return $.get(href,function(res){
		var $res = $(res);

		var obj = {
			sourceDescripton:$res.find(".std2:eq(0)").html()
		};
		fs.writeFileSync("words/"+word+"/sourceDescripton",JSON.stringify(obj) , "UTF-8");
	});
}
function handle_reference(word,href){
	return $.get(href,function(res){
		var $res = $(res);

		var referencelist = [];
		$res.find(".std2 .Rulediv").each(function(){
			$(this).find(".english_word").remove();
			referencelist.push($(this).text());
		});

		var obj = {
			referencelist:referencelist
		};
		fs.writeFileSync("words/"+word+"/reference",JSON.stringify(obj) , "UTF-8");
	});
}
function handle_usage(word,href){
	return $.get(href,function(res){
		var $res = $(res);

		var items = $res.find(".std2");

		var obj = {
			meaningDesc:items.eq(0).text(), //語意說明
			usedSituation: items.eq(1).text(), //使用類別,
			samples:items.eq(2).text() //例句
		};
		fs.writeFileSync("words/"+word+"/usage",JSON.stringify(obj) , "UTF-8");
	});
}
function handle_recognize(word,href){
	//TODO check more details
	return $.get(href,function(res){
		var $res = $(res);

		var obj = {
			recognized : $res.find(".std2").html()
		};
		fs.writeFileSync("words/"+word+"/recognize",JSON.stringify(obj) , "UTF-8");
	});
	
}
function handle_related_word(word,href){
	return $.get(href,function(res){
		var $res = $(res);

		var items = $res.find(".fmt16_table");
		var words = [];
		items.each(function(){
			var tds = $(this).find(".fmt16_td2");
			var word = {
				name: tds.eq(0).text(),
				chinese_pronounce:tds.eq(1).text(),
				english_pronounce:tds.eq(2).text(),
				meaning:tds.eq(3).text()
			};
			words.push(word);
		});
		var obj = {
			words: words  //近義
		};
		fs.writeFileSync("words/"+word+"/related_word",JSON.stringify(obj) , "UTF-8");
	});
}

function GetCCD(cb){
	$.get("http://dict.idioms.moe.edu.tw/cgi-bin/cydic/gsweb.cgi?o=dcydic&schfmt=pic",function(response){
		var start = response.indexOf("ccd=");
		var end = response.indexOf("&",start);
		var ccd = response.substring(start+4,end);
		cb(ccd);
	});
}

/*
GetCCD(function(ccd){
	search(ccd,"舉一反三");
});
*/


fs.readFile('words.csv', function (err, data) {
	if (err) throw err;

	var lines = data.toString().split(/[\r\n]+/);
	GetCCD(function(ccd){

           var i =0;
           var getInfo = function(i){
            search(ccd,lines[i],function(){
                if(i > lines.length -1){
                    return true;
                }
                getInfo(i+1);
               
            });
           }
//	   $.each(lines,function(ind,item){
//	    search(ccd,item)
//	   });
	});

});
