
//var $ = require("jQuery");
var fs = require("fs");

function base_url(str){
	return "http://dict.idioms.moe.edu.tw"+str;
}


var word_folders = fs.readdirSync("words");
var words = [];
for(var i =0; i< word_folders.length;++i){
	var word = word_folders[i];
	var word_contents = fs.readdirSync("words/"+word);
	var word_obj = {word:word};
	for(var j = 0 ; j < word_contents.length;++j){
		word_obj[word_contents[j]] = JSON.parse(fs.readFileSync("words/"+word+"/"+word_contents[j]));
	}
	if(word_obj["pronounce"].chinese_pronounce ==""){
		console.log(word,"missing");
	}else{
		words.push(word_obj);
	}
}

fs.writeFile("export.json", JSON.stringify(words), "UTF-8");

