// remove shortcut if it is a touch device
var isTouchDevice = 'ontouchstart' in window || 'onmsgesturechange' in window; // cd1 works on most browsers || cd2 works on IE10/11 and Surface
if (isTouchDevice){
	$('.cmd-text').addClass('hidden');
}

var viewport = document.getElementById('viewport');

// resize event
function onResize(){
	var w = document.body.clientWidth,
		h = document.body.clientHeight,
		top = viewport.offsetTop,
		left = viewport.offsetLeft;
	h -= top;
	w -= left;

	familyTree.resize(w, h);
};

if (!isTouchDevice){
	d3.select(document.body)
		.on('keydown', function (ev) {		
			var Keys = {
					DELETE: 46,
					A: 65,
					E: 69,
					S: 83,
					Z: 90,
					Y: 89
				};

			if (['input', 'textarea'].indexOf(d3.event.target.tagName.toLowerCase()) != -1)
				return;

			var w = this.clientWidth,
				h = this.clientHeight;

			// Area Selection
			if ((d3.event.shiftKey) && (!familyTree.getBrushLayer())) {
				familyTree.startBrush();
			}
			// Center selection 
			else if (d3.event.keyCode == Keys.S) {
				familyTree.centerSelection();
			}
			
			// Center all tree
			else if (d3.event.keyCode == Keys.E) {
				familyTree.centerAll();
			}

			// delete nodes and/or links
			else if (d3.event.keyCode == Keys.DELETE) {
				familyTree.hideContextMenus();
				var objects = familyTree.getObjectsToDelete();
		    	familyTree.deleteObjects(objects.nodes, objects.relLinks, objects.childLinks, objects.groups);
			}
				
			else if (d3.event.ctrlKey){
				// Select all tree
				if (d3.event.keyCode == Keys.A) {
					d3.event.preventDefault();
					familyTree.hideContextMenus();
					familyTree.selectAll();
					familyTree.centerAll();
				} 

				// UNDO
				else if (d3.event.keyCode == Keys.Z) 
					familyTree.undo();
			
				// REDO
				else if (d3.event.keyCode == Keys.Y)
					familyTree.redo();
			}
		})
		.on('onkeyup', function() {
			if (d3.event.target.tagName.toLowerCase() == 'input')
				return;

			if (!d3.event.shiftKey && familyTree.isMovingBrush())
				familyTree.endBrush();
		});
}

document.body.onresize = onResize;
	
familyTree.init(viewport, document.body.clientWidth, document.body.clientHeight);
onResize();

var treeNameItem = $('#loaded-tree-name'),
	alertPopup = $('#alert-popup'),
	openFilePopup = $('#open-file-popup'),
	saveAsPopup = $('#save-as-popup'),
	fileField = openFilePopup.find('#field-file-name #input-file'),
	undoMenuItem = $('#undo-item'),
	redoMenuItem = $('#redo-item'),
	deleteMenuItem = $('#delete-item'),
	seachField = $('#search-field'),
	fileNameItem = $('#loaded-file-name'),
	centerSelItem = $('#center-selection-item'),
	extendItem = $('#extend-item');

$('nav').on('mousedown', function(){
	familyTree.hideContextMenus();
});

$('#search-btn').on('click', function(e){
	e.preventDefault();
	var records = seachField.serializeArray(),
		values = {};
	records.forEach(function(rec){values[rec.name] = rec.value;});
	familyTree.search(values);
});

saveAsPopup.on("hide.bs.modal", function () {
    $('#json-format-opt').click();
    $('#input-name').val('');
});

// create new tree
$('#new-item').on('click', function(){
	if (!undoMenuItem.hasClass('disabled')){
		alertPopup.modal();
		alertPopup.isLoadingNewTree = true;
	} else {
		treeNameItem.html(dictionary.get('Default')).removeClass('modified');
		familyTree.load();
	}
});

// open existing tree
var fileContent = null;

openFilePopup.on("hide.bs.modal", function () {
    fileContent = null;
	fileField.val('');
	openFilePopup.find("#upload-file-info").val('');
});

openFilePopup.find('#upload-file-btn').on('click', function(){
	if (fileContent)
		familyTree.load(JSON.parse(fileContent));
	openFilePopup.modal('hide');	
});

fileField.on('change', function(){
	var fileName = $(this).val();
	var nameArray = fileName.split('\\');
	var name = nameArray[nameArray.length - 1];
	openFilePopup.find("#upload-file-info").val(name);

	console.log((window.URL || window.webkitURL).createObjectURL(this.files.item(0)))

	var reader = new FileReader();
	reader.onload = function(){
        treeNameItem.html(name.replace('.json', '')).removeClass('modified');
        fileContent = this.result;
    };
    reader.readAsText(this.files.item(0)); 
})

alertPopup.find('#yes').on('click', function(){ 
	alertPopup.modal('hide');
	saveAsPopup.modal();
});

alertPopup.find('#no').on('click', function(){ 
	alertPopup.modal('hide');
	if (alertPopup.isLoadingNewTree){
		alertPopup.isLoadingNewTree = false;
		familyTree.load();
		treeNameItem.html(dictionary.get('Default'));
	} else if (alertPopup.isOpeningTree){
		alertPopup.isOpeningTree = false;
		openFilePopup.modal();
	} 
});

$('#open-item').on('click', function(){
	if (!undoMenuItem.hasClass('disabled')){
		alertPopup.modal();		
		alertPopup.isOpeningTree = true;
	}
	else 
		openFilePopup.modal();
});

saveAsPopup.find('.btn-group[data-toggle-name]').each(function () {
    var group = $(this);
    var form = group.parents('form').eq(0);
    var name = group.attr('data-toggle-name');
    var hidden = $('input[name="' + name + '"]', form);
    $('button', group).each(function () {
        var button = $(this);
        button.live('click', function () {
            hidden.val($(this).val());
        });
        if (button.val() == hidden.val()) {
            button.addClass('active');
        }
    });
});

$('#save-as-item').on('click', function(){
	saveAsPopup.modal();
});

$('#save-item').on('click', function(){
	familyTree.saveAs('json', treeNameItem.html());
});

saveAsPopup.find("#input-format").on('change', function() {
	var sField =  saveAsPopup.find('#field-scale');
	sField.val(100);
	if ($(this).val() == 'png')
		sField.removeClass('hide');
	else
		sField.addClass('hide');
});

saveAsPopup.find('#save').on('click', function(){
	var form = saveAsPopup.find('.form-horizontal');
		nodeId = form.find('#input-id').val();
	if (!form.valid())
		return;
	var records = form.serializeArray(),
		values = {};
	records.forEach(function(rec){
		values[rec.name] = rec.value;
	});

	familyTree.saveAs(values.format, values.fileName, values.scale);

	saveAsPopup.modal('hide');
	$('json-format-opt').trigger('click');
	$('#input-name').val('');
	$('#field-scale').val(100);

	if (alertPopup.isLoadingNewTree){
		alertPopup.isLoadingNewTree = false;
		familyTree.load();
		treeNameItem.html(dictionary.get('Default'));
	} else if (alertPopup.isOpeningTree){
		alertPopup.isOpeningTree = false;
		openFilePopup.modal();
	} 
});

// edit
$('#edit-menu').on('click', function(){
	var count = familyTree.getSelection().length;
	if (count)
		deleteMenuItem.removeClass('disabled');
	else
		deleteMenuItem.addClass('disabled');
});

undoMenuItem.on('click', function(){
	familyTree.undo();
});

redoMenuItem.on('click', function(){
	familyTree.redo();
});

deleteMenuItem.on('click', function(){
	var objects = familyTree.getObjectsToDelete();
	familyTree.deleteObjects(
		objects.nodes, 
		objects.relLinks, 
		objects.childLinks, 
		function(){ familyTree.draw(); }, 
		function(){ familyTree.draw(); }, 
		function(){ familyTree.draw(); }
	);
})

$('#select-all-item').on('click', function(){
	familyTree.selectAll();
	familyTree.centerAll();
});

//view
$('#view-menu').on('click', function(){
	var count = familyTree.getSelection().length;
	if (count)
		centerSelItem.removeClass('disabled');
	else
		centerSelItem.addClass('disabled');
});

centerSelItem.on('click', function(){
	familyTree.centerSelection();
});

extendItem.on('click', function(){
	familyTree.centerAll();
});

// language
var langMenu = $('#language-menu');
	
langMenu.parent().find('li').each(function(){
	$(this).find('a').on('click', function(){
		langMenu.parent().find('li.active').removeClass('active');
		var $a = $(this);
		$a.parent().addClass('active');
 		var lang = $a.html();	
 		langMenu.html(lang + '<b class = "caret">');
 		dictionary.setLanguage(lang.toLowerCase());
 	});
});	

$(document).on('click', '#main-navbar-collapse', function(e) {
	var $target = $(e.target);
    if($target.is('a') && $target.attr('class') != 'dropdown-toggle' )
    	$(this).collapse('hide');
});

$(document).on('action', function(ev, action, undoCounter, redoCounter){
	if (undoCounter){
		undoMenuItem.removeClass('disabled');
		treeNameItem.addClass('modified');
	}
	else {
		undoMenuItem.addClass('disabled');
		treeNameItem.removeClass('modified');
	}
	if (redoCounter)
		redoMenuItem.removeClass('disabled');
	else 
		redoMenuItem.addClass('disabled');
});