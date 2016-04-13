var editor = ace.edit("editor");
editor.setTheme("ace/theme/monokai");
editor.getSession().setMode("ace/mode/javascript");
editor.$blockScrolling = Infinity;

editor.setOptions({
  fontSize: "10pt"
});

editor.on("change", function() {
	console.log("change");
});

var scanDoc = function(regex, name) {
  var amount = editor.findAll(regex, {
  	caseSensitive: false,
  	regExp: true
  });

  if(amount != 0)
  {
    editor.findPrevious()
    for(var x = 0; x < amount; x++)
    {
      editor.find(regex, {
	  	caseSensitive: false,
	  	regExp: true
	  });
      var row = editor.selection.getCursor().row;
      var tt = editor.session.getLine(row);
      var treeviewElement = document.getElementById("tree_view_content");
      addLink(name, row, treeviewElement);
    }
  }
  else
  {
      var treeviewElement = document.getElementById("tree_view_content");
      treeviewElement.innerHTML = "No results!";
  }
}

var addLink = function(title, row, element) 
{
	element.innerHTML += "<button title='" + title + "' class='std-btn glow-red' onclick='selectLine(" + row + ")'>" + title + ": " + (parseInt(row)+1) + "</button>";
}

var selectLine = function(line) {
  editor.selection.moveCursorFileEnd();
  editor.moveCursorTo(line);
  editor.selection.selectLine();
  var row = editor.selection.getCursor().row;
  editor.scrollToRow(parseInt(row) - 5);
}

scanDoc(/(function)\s[\w]*/g, "function");