if(Array.prototype.equals)
    console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time 
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i]["name"] == array[i]["name"] && this[i]["row"] == array[i]["row"] && this[i]["type"] == array[i]["type"]) {
        }           
        else {
        	console.log("nope");
        	return false;
        }           
    }       
    console.log("no changes");      
    return true;
}

var entered = 0;

// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", {enumerable: false});

var editor = ace.edit("editor");
editor.setTheme("ace/theme/monokai");
editor.getSession().setMode("ace/mode/javascript");
editor.$blockScrolling = Infinity;
editor.setOptions({
  fontSize: "10pt"
});

var editor_map = ace.edit("editor_map");
editor_map.setTheme("ace/theme/monokai");
editor_map.getSession().setMode("ace/mode/javascript");
editor_map.$blockScrolling = Infinity;
editor_map.setOptions({
  fontSize: "2pt",
  readOnly: true,
  showPrintMargin: false,
  showLineNumbers: false,
  showGutter: false,
  highlightActiveLine: false,
  highlightSelectedWord: false,
  cursorStyle: "slim",
  hScrollBarAlwaysVisible: false,
  vScrollBarAlwaysVisible: true,
});

var oldScans = [];

var MAXSCROLLTOP = editor.session.getScreenLength() * 15;
var OVERLAYSIZE = $("#editor").height() / 5.078947368421052;
var OVERLAYTOP = 0;
var EDITORHEIGHT = $("#editor").height();

editor.on("change", function() {
	scanDoc();
	editor_map.setValue(editor.getValue());
	editor_map.selection.clearSelection();
  MAXSCROLLTOP = editor.session.getScreenLength() * 15;
});

editor.getSession().on('changeScrollTop', function(scroll) {
	percentage = (scroll * 100) / MAXSCROLLTOP;

  var OVERLAYTOP = ((EDITORHEIGHT - OVERLAYSIZE) * percentage) / 100;
  editor_map.session.setScrollTop((scroll / (10/2)) - OVERLAYTOP);

  if(OVERLAYTOP > 0) {
  	$("#scroll_overlay").css("top", OVERLAYTOP + "px")
  } else {
  	$("#scroll_overlay").css("top", "0px")
  }
});

// editor_map.on("cursor_change", function() {
// 		do magic stuff with the other editor
// 
// });

var scanDoc = function() {

	text = editor.getValue();

	var allScans = [];

	allScans = allScans.concat(scanForFunctions(text));
	allScans = allScans.concat(scanForFunctionSek(text));
	allScans = allScans.concat(scanForClassPrototypeFunction(text));
	allScans = allScans.concat(scanForTheLolz(text));

	allScans.sort(function(a, b) {
		return a["row"] - b["row"];
	});

	buildButtonTree(allScans);
}

var scanForTheLolz = function(editorText) {
	var regexFunction = /asdasfasdasd\s?=\s?function/g;
	var arrayFunctions = editorText.match(regexFunction);
	if(arrayFunctions != null) {
		var arrayFunctionNames = [];
		for (var x = 0; x < arrayFunctions.length; x++) {
			var match = null;
			match = /asdasfasdasd\s?=\s?function/g.exec(arrayFunctions[x])
			var row = editorText.slice(1, editorText.search(arrayFunctions[x])).split("\n").length
			arrayFunctionNames.push({ name: match[1] + "." + match[3], row: row, type: 'class-prototype' });
		}
		return arrayFunctionNames;
	}
	else
	{
		return [];
	}
}

var scanForClassPrototypeFunction = function(editorText) {
	var regexFunction = /([\w]*)\.([\w]*)\.([\w]*)\s?=\s?function/g;
	var arrayFunctions = editorText.match(regexFunction);
	if(arrayFunctions != null) {
		var arrayFunctionNames = [];
		for (var x = 0; x < arrayFunctions.length; x++) {
			var match = null;
			match = /([\w]*)\.([\w]*)\.([\w]*)\s?=\s?function/g.exec(arrayFunctions[x])
			var row = editorText.slice(1, editorText.search(arrayFunctions[x])).split("\n").length
			arrayFunctionNames.push({ name: match[1] + "." + match[3], row: row, type: 'class-prototype' });
		}
		return arrayFunctionNames;
	}
	else
	{
		return [];
	}
}

var scanForFunctionSek = function(editorText) {
	var regexFunction = /var\s([\w]*)\s?=\s?function/g;
	var arrayFunctions = editorText.match(regexFunction);
	if(arrayFunctions != null) {
		var arrayFunctionNames = [];
		for (var x = 0; x < arrayFunctions.length; x++) {
			var match = null;
			match = /var\s([\w]*)\s?=\s?function/g.exec(arrayFunctions[x])
			var row = editorText.slice(1, editorText.search(arrayFunctions[x])).split("\n").length
			arrayFunctionNames.push({ name: match[1], row: row, type: 'function' });
		}
		return arrayFunctionNames;
	}
	else
	{
		return [];
	}
}

var scanForFunctions = function(editorText) {
	var regexFunction = /(function)\s([\w]+)\s?\(.*\)/g;
	var arrayFunctions = editorText.match(regexFunction);
	if(arrayFunctions != null) {
		var arrayFunctionNames = [];
		for (var x = 0; x < arrayFunctions.length; x++) {
			var match = null;
			match = /(function)\s([\w]+)\s?\(.*\)/g.exec(arrayFunctions[x])
			var row = editorText.slice(1, editorText.indexOf(arrayFunctions[x])).split("\n").length
			arrayFunctionNames.push({ name: match[2], row: row, type: 'function' });
		}
		return arrayFunctionNames;
	}
	else
	{
		return [];
	}
}

var buildButtonTree = function(elements) 
{
	if(!(oldScans.equals(elements))) {
		oldScans = elements;
		var treeviewElement = document.getElementById("tree_view_content");
		clearElement(treeviewElement);

		for(var x = 0; x < elements.length; x++)
		{
			addLink(elements[x]["name"], elements[x]["row"], elements[x]["type"], treeviewElement);
		}
	}
}

var clearElement = function(element) 
{
	element.innerHTML = "";
}

var addLink = function(title, row, type, element) 
{
	element.innerHTML += "<a title='" + title + "' class='" + type + "-btn' onclick='selectLine(" + (row-1) + ")'>" + title + ": " + (parseInt(row)) + "</a>";
}

var selectLine = function(line) {
  editor.selection.moveCursorFileEnd();
  editor.moveCursorTo(line);
  editor.selection.selectLine();
  var row = editor.selection.getCursor().row;
  editor.scrollToRow(parseInt(row) - 5);
}

scanDoc(/(function)\s([\w]*)/g, "function");

editor_map.setValue(editor.getValue());
editor_map.selection.clearSelection();
$('#scroll_overlay').height(OVERLAYSIZE);

$( window ).resize(function() {
	EDITORHEIGHT = $("#editor").height();
	OVERLAYSIZE = EDITORHEIGHT / 5.078947368421052;
  $('#scroll_overlay').height(OVERLAYSIZE);
});


$("#file").on("change", function() {
	console.log(this.value);
});




// LIB
// 
// Warn if overriding existing method
