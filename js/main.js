// remove shortcut if it is a touch device
var isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0; 
//  'ontouchstart' in window works on most browsers 
// navigator.msMaxTouchPoints > 0 works for microsoft IE backwards compatibility

var FamilyTree = familyTree(isTouchDevice);

if (isTouchDevice){
	$('.cmd-text:not(.caret-right),#selection-area-item').addClass('hide');
	$('#details-node,#details-group').removeClass('hide');
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

	FamilyTree.resize(w, h);
};

function undo(){
	FamilyTree.undo();
};

function redo(){
	FamilyTree.redo();
};

function selectAll(){
	FamilyTree.selectAll();
	FamilyTree.centerAll();
};

function deleteElements(){
	var objects = FamilyTree.getObjectsToDelete();
	FamilyTree.deleteObjects(
		objects.nodes, 
		objects.relLinks, 
		objects.childLinks,
		objects.groups,
		function(){ FamilyTree.draw(); }, 
		function(){ FamilyTree.draw(); }, 
		function(){ FamilyTree.draw(); }
	);
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
			if ((d3.event.shiftKey) && (!FamilyTree.getBrushLayer())) {
				FamilyTree.startBrush();
			}
			// Center selection 
			else if (d3.event.keyCode == Keys.S) {
				FamilyTree.centerSelection();
			}
			
			// Center all tree
			else if (d3.event.keyCode == Keys.E) {
				FamilyTree.centerAll();
			}

			// delete nodes and/or links
			else if (d3.event.keyCode == Keys.DELETE) {
				FamilyTree.hideContextMenus();
				deleteElements();
			}
				
			else if (d3.event.ctrlKey){
				// Select all tree
				if (d3.event.keyCode == Keys.A) {
					d3.event.preventDefault();
					FamilyTree.hideContextMenus();
					selectAll();
				} 

				// UNDO
				else if (d3.event.keyCode == Keys.Z) 
					undo();
			
				// REDO
				else if (d3.event.keyCode == Keys.Y)
					redo();

				else
					util.selectionMode.enableMulti(isTouchDevice);
			}
		})
		.on('keyup', function() {
			if (d3.event.target.tagName.toLowerCase() == 'input')
				return;

			if (!d3.event.shiftKey && FamilyTree.isMovingBrush())
				FamilyTree.endBrush();

			if (!d3.event.ctrlKey && util.selectionMode.isMulti())
				util.selectionMode.disableMulti();
		});
}

document.body.onresize = onResize;
	
FamilyTree.init(viewport, document.body.clientWidth, document.body.clientHeight);
onResize();

var eventStart = isTouchDevice ? 'touchstart' : 'mousedown';

var mainCollapsableNavbar = $('#main-navbar-collapse'),
	treeNameItem = $('#loaded-tree-name'),
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

$('#search-btn').on(eventStart, function(e){
	e.preventDefault();
	var records = seachField.serializeArray(),
		values = {};
	records.forEach(function(rec){values[rec.name] = rec.value;});
	FamilyTree.search(values);
});

saveAsPopup.on("hide.bs.modal", function () {
    $('#json-format-opt').click();
    $('#input-name').val('');
});

// create new tree
$('#new-item').on(eventStart, function(){
	if (!undoMenuItem.hasClass('disabled')){
		alertPopup.modal();
		alertPopup.isLoadingNewTree = true;
	} else {
		treeNameItem.html(dictionary.get('Default')).removeClass('modified');
		FamilyTree.load();
	}
	if (isTouchDevice && mainCollapsableNavbar.is(':visible')){
		mainCollapsableNavbar.collapse('toggle');
	}
});

// open existing tree
var fileContent = null;

openFilePopup.on("hide.bs.modal", function () {
    fileContent = null;
	fileField.val('');
	openFilePopup.find("#upload-file-info").val('');
});

openFilePopup.find('#upload-file-btn').on(eventStart, function(){
	if (fileContent)
		FamilyTree.load(JSON.parse(fileContent));
	openFilePopup.modal('hide');	
});

fileField.on('change', function(){
	var fileName = $(this).val();
	var nameArray = fileName.split('\\');
	var name = nameArray[nameArray.length - 1];
	openFilePopup.find("#upload-file-info").val(name);

	var reader = new FileReader();
	reader.onload = function(){
        treeNameItem.html(name.replace('.json', '')).removeClass('modified');
        fileContent = this.result;
    };
    reader.readAsText(this.files.item(0)); 
})

alertPopup.find('#yes').on(eventStart, function(){ 
	alertPopup.modal('hide');
	saveAsPopup.modal();
});

alertPopup.find('#no').on(eventStart, function(){ 
	alertPopup.modal('hide');
	if (alertPopup.isLoadingNewTree){
		alertPopup.isLoadingNewTree = false;
		FamilyTree.load();
		treeNameItem.html(dictionary.get('Default'));
	} else if (alertPopup.isOpeningTree){
		alertPopup.isOpeningTree = false;
		openFilePopup.modal();
	} 
});

function showOpenFilePopup (){
	if (!undoMenuItem.hasClass('disabled')){
		alertPopup.modal();		
		alertPopup.isOpeningTree = true;
	} else 
		openFilePopup.modal();
};

$('#open-item').on(eventStart, function(){	
	if (isTouchDevice && mainCollapsableNavbar.is(':visible')){
		mainCollapsableNavbar.collapse('toggle');
		mainCollapsableNavbar.one('hidden.bs.collapse', function(){
			showOpenFilePopup();
		});
	} else 
		showOpenFilePopup();
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

$('#save-as-item').on(eventStart, function(){	
	if (isTouchDevice && mainCollapsableNavbar.is(':visible')){
		mainCollapsableNavbar.collapse('toggle');
		mainCollapsableNavbar.one('hidden.bs.collapse', function(){
			saveAsPopup.modal();
		});
	} else 
		saveAsPopup.modal();
});

$('#save-item').on(eventStart, function(){
	FamilyTree.saveAs('json', treeNameItem.html());
});

saveAsPopup.find("#input-format").on('change', function() {
	var sField =  saveAsPopup.find('#field-scale');
	sField.val(100);
	if ($(this).val() == 'png')
		sField.removeClass('hide');
	else
		sField.addClass('hide');
});

saveAsPopup.find('#save').on(eventStart, function(){
	var form = saveAsPopup.find('.form-horizontal');
		nodeId = form.find('#input-id').val();
	if (!form.valid())
		return;
	var records = form.serializeArray(),
		values = {};
	records.forEach(function(rec){
		values[rec.name] = rec.value;
	});

	FamilyTree.saveAs(values.format, values.fileName, values.scale);

	saveAsPopup.modal('hide');
	$('json-format-opt').trigger(eventStart);
	$('#input-name').val('');
	$('#field-scale').val(100);

	if (alertPopup.isLoadingNewTree){
		alertPopup.isLoadingNewTree = false;
		FamilyTree.load();
		treeNameItem.html(dictionary.get('Default'));
	} else if (alertPopup.isOpeningTree){
		alertPopup.isOpeningTree = false;
		openFilePopup.modal();
	} 
});


// edit
$('#edit-menu').on(eventStart, function (){
	var selection = FamilyTree.getSelectionCount(),
		count = selection.length;
	if (count)
		deleteMenuItem.removeClass('disabled');
	else 
		deleteMenuItem.addClass('disabled');
});

undoMenuItem.on(eventStart, function(){
	if (isTouchDevice && mainCollapsableNavbar.is(':visible')){
		mainCollapsableNavbar.collapse('toggle');
		mainCollapsableNavbar.one('hidden.bs.collapse', function(){
			undo();
		});
	} else 
		undo();
});

redoMenuItem.on(eventStart, function(){
	if (isTouchDevice && mainCollapsableNavbar.is(':visible')){
		mainCollapsableNavbar.collapse('toggle');
		mainCollapsableNavbar.one('hidden.bs.collapse', function(){
			redo();
		});
	} else 
		redo();
});

deleteMenuItem.on(eventStart, function(){
	if (isTouchDevice && mainCollapsableNavbar.is(':visible')){
		mainCollapsableNavbar.collapse('toggle');
		mainCollapsableNavbar.one('hidden.bs.collapse', function(){
			deleteElements();
		});
	} else 
		deleteElements();
});

$('#select-all-item').on(eventStart, function(){
	if (isTouchDevice && mainCollapsableNavbar.is(':visible')){
		mainCollapsableNavbar.collapse('toggle');
		mainCollapsableNavbar.one('hidden.bs.collapse', function(){
			selectAll();
		});
	} else 
		selectAll();
});

$('#selection-area-item').on(eventStart, function(){
	if (!isTouchDevice && !FamilyTree.getBrushLayer()) 
		FamilyTree.startBrush();
});

//view
$('#view-menu').on(eventStart, function(){
	var count = FamilyTree.getSelectionCount();
	if (count)
		centerSelItem.removeClass('disabled');
	else
		centerSelItem.addClass('disabled');
});

centerSelItem.on(eventStart, function(){
	if (isTouchDevice && mainCollapsableNavbar.is(':visible')){
		mainCollapsableNavbar.collapse('toggle');
		mainCollapsableNavbar.one('hidden.bs.collapse', function(){
			FamilyTree.centerSelection();
		});
	} else 
		FamilyTree.centerSelection();
});

extendItem.on(eventStart, function(){
	if (isTouchDevice && mainCollapsableNavbar.is(':visible')){
		mainCollapsableNavbar.collapse('toggle');
		mainCollapsableNavbar.one('hidden.bs.collapse', function(){
			FamilyTree.centerAll();
		});
	} else 
		FamilyTree.centerAll();
});

// hide all visible context menus when clicking or touching a navigation bar 
$('.navbar').on(eventStart, function(e) {
	FamilyTree.hideContextMenus();
});

// language
var langMenu = $('#language-menu');
	
langMenu.parent().find('li').each(function(){
	$(this).find('a').on(eventStart, function(){
		langMenu.parent().find('li.active').removeClass('active');
		var $a = $(this);
		$a.parent().addClass('active');
 		var lang = $a.html();	
 		langMenu.html(lang + '<b class = "caret">');
 		dictionary.setLanguage(lang.toLowerCase());
 	});
});	

$('#viewport').on(eventStart, function(){
	$('.dropdown.open').trigger(eventStart);
});

// multi selection navbar
$('#exit-from-selection-mode a').on(eventStart, function(){
	util.selectionMode.disableMulti(isTouchDevice);
	FamilyTree.deselectAll();
	if (isTouchDevice && mainCollapsableNavbar.is(':visible'))
		mainCollapsableNavbar.collapse('toggle');
});

$('#delete-selected-objects a').on(isTouchDevice ? 'touchend' : 'click', function(){
	deleteElements();
	util.selectionMode.disableMulti(isTouchDevice);
	/*if (isTouchDevice && mainCollapsableNavbar.is(':visible'))
		mainCollapsableNavbar.collapse('toggle');*/
});

$('#center-selected-objects a').on(isTouchDevice ? 'touchend' : 'click', function(){
	FamilyTree.centerSelection();
	util.selectionMode.disableMulti(isTouchDevice);	
	FamilyTree.deselectAll();
	/*if (isTouchDevice && mainCollapsableNavbar.is(':visible'))
		mainCollapsableNavbar.collapse('toggle');*/
});

$('#select-all-objects').on(isTouchDevice ? 'touchend' : 'click', function(){
	FamilyTree.selectAll();
});

$('#deselect-all-objects').on(isTouchDevice ? 'touchend' : 'click', function(){
	FamilyTree.deselectAll();
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
