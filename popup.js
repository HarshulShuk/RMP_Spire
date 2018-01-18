var instructors = new Array();
var overviewArr = new Array();
var hiddenDiv;
var shownDiv;

document.addEventListener('click',function(e){
	if(e.target.href!==undefined){
		chrome.tabs.create({url:e.target.href});
	}
})

chrome.tabs.query({active:true, currentWindow:true}, function(tabs){
	chrome.tabs.sendMessage(tabs[0].id, {action:"find"}, function(response){
		instructors = response.array;
		hiddenDiv = document.getElementById("hidden");
		shownDiv = document.getElementById("shown");
		insertHeader();
		if(instructors.length == 0){
			shownDiv.append(createElement("div","There are no professors on this page", "noprof", null));
		} else if(response.findProf == true){
			shownDiv.append(createElement("div","Loading...", "loading", null));
			overviewArr = new Array();
			console.log("Professors detected: ");
			instructors.forEach(function(item, index){
				console.log(item.name);
				queryGoogleSearch(item.name, queryRMP);
			})
			setTimeout(function(){
				constructPopup();
			}, 2000);
		} else {
			overviewArr = response.array;
			constructPopup();
		}
		setTimeout(function(){
			chrome.tabs.sendMessage(tabs[0].id, {action:"save", array: overviewArr}, function(response){});
		}, 2000);
	});
});

function constructPopup(){
	overviewArr.forEach(function(item,index){
		console.log(item.name + ": " + item.quality + ", " + item.percent + ", " + item.difficulty);
		console.log("Link: " + item.link);
	});
	if(overviewArr.length == 0){
		clearTempText();
		shownDiv.append(createElement("div","None of the professors on this page are on RateMyProfessor!", "nomatch",null));
	} else {
		insertProfessors();
	}
}

function createElement(elementTag, text, idText, classText){
	var ele = document.createElement(elementTag);
	if(text != null){
		ele.appendChild(document.createTextNode(text));
	}
	if(idText != null){
		var attr = document.createAttribute("id");
		attr.value = idText;
		ele.setAttributeNode(attr);
	}
	if(classText != null){
		var attr = document.createAttribute("class");
		attr.value = classText;
		ele.setAttributeNode(attr);
	}
	return ele;
}

function insertHeader(){
	var headerDiv = createElement("div",null,"header",null);
	var spire = createElement("span", "Spire ", null, null);
	var union = createElement("span", '\u222A', "union", null);
	var rmp = createElement("span", " RMP", null, null);
	headerDiv.appendChild(spire);
	headerDiv.appendChild(union);
	headerDiv.appendChild(rmp);
	shownDiv.appendChild(headerDiv);
}

function createTableLabels(){
	var row = createElement("tr",null,null,"label");

	var c1 = createElement("td",null,null,null);
	var name = createElement("span", "Professor", null, null);
	var alignC1 = document.createAttribute("align");
	alignC1.value = "left";
	c1.setAttributeNode(alignC1);
	c1.appendChild(name);
	row.appendChild(c1);

	var c2 = createElement("td",null,null,null);
	var quality = createElement("span", "Quality", null, "rightalign");
	var alignC2 = document.createAttribute("align");
	alignC2.value = "right";
	c2.setAttributeNode(alignC2);
	c2.appendChild(quality);
	row.appendChild(c2);

	var c3 = createElement("td",null,null,null);
	var percent = createElement("span", "Would Repeat", null, "rightalign");
	var alignC3 = document.createAttribute("align");
	alignC3.value = "right";
	c3.setAttributeNode(alignC3);
	c3.appendChild(percent);
	row.appendChild(c3);

	var c4 = createElement("td",null,null,null);
	var difficulty = createElement("span", "Difficulty", null, "rightalign");
	var alignC4 = document.createAttribute("align");
	alignC4.value = "right";
	c4.setAttributeNode(alignC4);
	c4.appendChild(difficulty);
	row.appendChild(c4);

	return row;
}

function clearTempText(){
	var loading = document.getElementById("loading");
	var noprof = document.getElementById("noprof");
	var nomatch = document.getElementById("nomatch");
	if(loading){
		shownDiv.removeChild(loading);
	} 
	else if(noprof){
		shownDiv.removeChild(noprof);
	} else if(nomatch){
		shownDiv.removeChild(nomatch);
	}
}

function insertProfessors(){
	clearTempText();
	var professorsDiv = createElement("div", null, "profContent", null);
	var table = createElement("table", null, null, null);
	table.appendChild(createTableLabels());

	overviewArr.forEach(function(item, index){
		var row = createElement("tr",null,null, "prof");

		var c1 = createElement("td",null,null,null);
		var name = createElement("a", item.name, null, null);
		var link = document.createAttribute("href");
		link.value = item.link;
		name.setAttributeNode(link);

		c1.appendChild(name);
		row.appendChild(c1);

		var c2 = createElement("td",null,null,null);
		var quality = createElement("span", item.quality, null, "alignright");
		var alignC2 = document.createAttribute("align");
		alignC2.value = "right";
		c2.setAttributeNode(alignC2);
		c2.appendChild(quality);
		row.appendChild(c2);

		var c3 = createElement("td",null,null,null);
		var percent = createElement("span", item.percent, null, "alignright");
		var alignC3 = document.createAttribute("align");
		alignC3.value = "right";
		c3.setAttributeNode(alignC3);
		c3.appendChild(percent);
		row.appendChild(c3);

		var c4 = createElement("td",null,null,null);
		var difficulty = createElement("span", item.difficulty, null, "alignright");
		var alignC4 = document.createAttribute("align");
		alignC4.value = "right";
		c4.setAttributeNode(alignC4);
		c4.appendChild(difficulty);
		row.appendChild(c4);

		table.appendChild(row);
	})
	professorsDiv.appendChild(table);
	shownDiv.appendChild(professorsDiv);
}

function queryGoogleSearch(professor, callback){
	var googleRequest = createCORSRequest('GET', "https://www.google.com/search?q=" + professor + " from University of Massachusetts Amherst + RateMyProfessors");
	if(googleRequest){
		googleRequest.onerror = function(){
			alert("Error making google request");
		}
		googleRequest.onreadystatechange = function(){
			if (googleRequest.readyState == 4 && googleRequest.status == 200){
				if(googleRequest.responseText){
					callback(professor, googleRequest.responseText, parseRMP);
				} else alert("Invalid Google responseText");
			 }
		};
		googleRequest.send();
	} else {
		alert("Google CORS not supported");
	}
}

function isSearchMatch(description, link, professor){
	var nameMatch = false;
	if(description.includes(professor)){
		nameMatch = true;
	} else {
		var spaceIndex = professor.indexOf(" ");
		var profFirstName = professor.substring(0,spaceIndex).trim();
		var profLastName = professor.substring(spaceIndex + 1).trim();
		var lastNameIndex = description.indexOf(profLastName);
		if(lastNameIndex != -1){
			var descripFirstName = description.substring(0,lastNameIndex).trim();
			nameMatch = description.includes(profFirstName) || profFirstName.includes(descripFirstName);
		} else {
			nameMatch = false;
		}
	}
	return nameMatch && description.includes("University of Massachusetts") && link.includes("ratemyprofessors");
}

function queryRMP(professor, googleText, callback){
	hiddenDiv.innerHTML = googleText;
	var searchLinks = createArrayFromElements(document.getElementsByClassName("_Rm"));
	var searchDescription = createArrayFromElements(document.getElementsByClassName("r"));
	hiddenDiv.innerHTML = "";
	var RMPRequest;
	for(var i =0; i<searchDescription.length && i<2 ;i++){
		if(isSearchMatch(searchDescription[i], searchLinks[i], professor)){
			RMPRequest = createCORSRequest('GET', "https://" + searchLinks[i]);
			if(RMPRequest){
				RMPRequest.onerror = function(){
					alert("Error making RateMyProfessor request");
				}
				RMPRequest.onreadystatechange = function(){
					if(RMPRequest.readyState == 4 && RMPRequest.status == 200){
						if(RMPRequest.responseText){
							console.log("https://" + searchLinks[i]);
							callback(professor, RMPRequest.responseText, "https://" + searchLinks[i]);
						} else alert("Invalid RateMyProfessor response text");
					}
				}
				RMPRequest.send();
			}  else {
				alert("RateMyProfessors.com does not support CORS");
			}
			break;
		}
	}
}

function parseRMP(professor, RMPText, link){
	hiddenDiv.innerHTML = RMPText;
  	var grades = createArrayFromElements(document.getElementsByClassName("grade"));
  	hiddenDiv.innerHTML = "";
  	var newProf = new ProfessorOverview(professor, grades[0], grades[1], grades[2], link);
  	overviewArr.push(newProf);
}

function createArrayFromElements(elements){
	var arr = new Array();
	for(var i=0; i<elements.length && i<3; i++){
		arr.push(elements[i].innerText);
	}
	return arr;
}

function createCORSRequest(method, url){
	var xhr = new XMLHttpRequest();
	if("withCredentials" in xhr){
		xhr.open(method, url, true);
	} else xhr = null;
	return xhr;
}

function ProfessorOverview(name, quality, percent, difficulty, link){
	this.name = name.trim();
	this.quality = quality.trim();
	this.percent = percent.trim();
	this.difficulty = difficulty.trim();
	this.link = link;
}