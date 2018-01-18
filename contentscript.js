chrome.extension.sendRequest("runit bish");
var currentProf = new Array();
var validProf = new Array();

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse){
		if(request.action == "find"){
			var frameDoc = document.getElementById("ptifrmtgtframe").contentDocument;
			var count = 0;
			var ele = frameDoc.getElementById("MTG_INSTR$" + count);
			validProf = new Array();
			while(ele != null){
				if(ele.innerText != "Staff" && ele.innerText != "staff"){
					var prof = ele.innerText
					var commaIndex = prof.indexOf(",");
					if(commaIndex != -1){
						var prof1 = prof.substring(0,commaIndex).trim();
						var prof2 = prof.substring(commaIndex + 1).trim();
						if(!validProfIncludesName(prof1)) validProf.push(new ProfessorOverview(prof1, "", "", "", ""));
						if(!validProfIncludesName(prof2)) validProf.push(new ProfessorOverview(prof2, "", "", "", ""));
					} else{
						if(!validProfIncludesName(prof)) validProf.push(new ProfessorOverview(prof, "", "", "", ""));
					}
				}
				count++;
				ele = frameDoc.getElementById("MTG_INSTR$" + count);
			}
			console.log("currentProf: " + currentProf.length);
			console.log("validProf " + validProf.length);
			console.log(currentProfIncludesValidProf());
			if(currentProfIncludesValidProf()){
				console.log("Current includes New");
				sendResponse({array: currentProf, findProf: false});
			} else {
				if(validProfIncludesCurrentProf()){
					console.log("valid true");
					sendResponse({array: currentProf, findProf: false});
				} else {
					console.log("Unique professors - valid false");
					sendResponse({array: validProf, findProf: true});
				}
			}
		} else if (request.action == "save"){
			currentProf = request.array;
			console.log("saved the following:");
			currentProf.forEach(function(item,index){
				console.log(item.name + ": " + item.quality + ", " + item.percent + ", " + item.difficulty);
				console.log("Link: " + item.link);
			});
		}
});

function validProfIncludesName(name){
	for(var i=0; i<validProf.length; i++){
		if(validProf[i].name == name) return true;
	}
	return false;
}

function currentProfIncludesName(name){
	for(var i=0; i<currentProf.length; i++){
		if(currentProf[i].name == name) return true;
	}
	return false;
}


function currentProfIncludesValidProf(){
	if(currentProf.length == 0 || validProf.length == 0) return false;
	for(var i=0; i<validProf.length; i++){
		if(!currentProfIncludesName(validProf[i].name)) return false;
	}
	return true;
}

function validProfIncludesCurrentProf(){
	if(currentProf.length == 0 || validProf.length == 0) return false;
	for(var i=0; i<currentProf.length; i++){
		if(!validProfIncludesName(currentProf[i].name)) return false;
	}
	return true;
}

function ProfessorOverview(name, quality, percent, difficulty, link){
	this.name = name;
	this.quality = quality;
	this.percent = percent;
	this.difficulty = difficulty;
	this.link = link;
}