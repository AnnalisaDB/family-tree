var dictionary = (function(){
	var lang = lang || 'eng';

	var dictMap =  {
		'AddToGroup': {eng: 'Add to Group', ita: 'Aggiungi a un gruppo'},
		'Cancel': {eng: 'Cancel', ita: 'Annulla'},
		'CenterSelection': {eng: 'Center selection', ita: 'Centra selezione'},
		'ChooseFile': {eng: 'Choose file', ita: 'Scegli il file'},
		'Color': {eng: 'Color', ita: 'Colore'},
		'CreateGroup': {eng: 'Create group', ita: 'Crea gruppo'},
		'CreateRelative': {eng: 'Create relative', ita: 'Crea familiare'},
		'Delete': {eng: 'Delete', ita: 'Elimina'},
		'Description': {eng: 'Description', ita: 'Descrizione'},
		'Edit': {eng: 'Edit', ita: 'Modifica'},
		'Extend': {eng: 'Extend', ita: 'Mostra tutto'},
		'Extension': {eng: 'Extension', ita: 'Formato'},
		'FileName': {eng: 'File name', ita: 'Nome file'},
		'Group': {eng: 'Group', ita: 'Gruppo'},
		'Height': { eng: 'Height', ita: 'Altezza'},
		'Image': {eng: 'Image', ita: 'Immagine'},
		'InsertName': {eng: 'Insert name', ita: 'Inserire il nome'},
		'LinkToPartner': {eng: 'Link to partner', ita: 'Collega al partner'},
		'LoadedTree': {eng: 'Loaded tree', ita: 'Albero caricato'},
		'ModifiedTreeAlert': { eng: 'Current tree has been modified. Do you want save changes?', ita: 'L\'albero corrente è stato modificato. Vuoi salvare le modifiche prima di continuare?'},
		'Name': { eng: 'Name', ita: 'Nome'},
		'NewGroup': { eng: 'New group', ita: 'Nuovo gruppo'},
		'NewTree': { eng: 'New', ita: 'Nuovo'},
		'NoEmptyField': { eng: 'This field is required', ita: 'Questo campo non può essere vuoto'},
		'Open': { eng: 'Open', ita: 'Apri'},
		'Redo': { eng: 'Redo', ita: 'Riapplica'},
		'Relative': { eng: 'Relative', ita: 'Familiare'},
		'RemoveFromGroup': { eng: 'Remove from group', ita: 'Rimuovi dal gruppo' },
		'Save': { eng: 'Save', ita: 'Salva'},
		'SaveAs': { eng: 'Save as', ita: 'Salva come'},
		'Scale': { eng: 'Scale', ita: 'Scala'},
		'SelectAll': { eng: 'Select all', ita: 'Seleziona tutto' },
		'selectedItems': { eng: 'selected items', ita: 'elementi selezionati' },
		'Sex': { eng: 'Sex', ita: 'Sesso' },
		'Surname': { eng: 'Surname', ita: 'Cognome' },
		'Text': { eng: 'Text', ita: 'Testo' },
		'TextSize': { eng: 'Text size', ita: 'Dimensione del testo' },
		'Undo': { eng: 'Undo', ita: 'Annulla'},	
		'View': { eng: 'View', ita: 'Vista'},	
		'Warning': 	{ eng: 'Warning', ita: 'Attenzione'},
		'Width': { eng: 'Width', ita: 'Lunghezza'},
		'Yes': {eng: 'Yes', ita: 'S&igrave'},	
	};

	function setLanguage(newLang){
		if (newLang == lang)
			return;

		lang = newLang;
		update();
	};

	function get(key){
		var result = key;
		if (dictMap.hasOwnProperty(key) && dictMap[key][lang])
			result = dictMap[key][lang];
		return result;
	};

	function update(){
		updateNavBar();
		updatePopups();
	};

	function updateNavBar(){
		document.getElementById('new-item').innerHTML = get('NewTree');
		document.getElementById('open-item').innerHTML = get('Open') + '...';
		document.getElementById('save-as-item').innerHTML = get('SaveAs') + '...';
		document.getElementById('undo-item').innerHTML = get('Undo') + '<span class="cmd-text">Ctrl+Z</span>';
		document.getElementById('redo-item').innerHTML = get('Redo') + '<span class="cmd-text">Ctrl+Y</span>';
		document.getElementById('create-node-item').innerHTML = get('CreateRelative') + '...';
		document.getElementById('create-group-item').innerHTML = get('CreateGroup') + '...';
		document.getElementById('delete-item').innerHTML = get('Delete') + '<span class="cmd-text">Ctrl+Del</span></a>';
		document.getElementById('select-all-item').innerHTML = get('SelectAll') + '<span class="cmd-text">Ctrl+A</span>';
		document.getElementById('loaded-tree-label').innerHTML = get('LoadedTree');
		document.getElementById('edit-menu').innerHTML = get('Edit') + '<b class = "caret"></b>';
		document.getElementById('view-menu').innerHTML = get('View') + '<b class = "caret"></b>';
		document.getElementById('center-selection-item').innerHTML = get('CenterSelection') + '<span class="cmd-text">S</span>';
		document.getElementById('extend-item').innerHTML = get('Extend') + '<span class="cmd-text">E</span>';
	};

	function updatePopups(){
		var $alertPopup = $('#alert-popup'); 
		$alertPopup.find('.modal-header h4').html(get('Warning'));
		$alertPopup.find('.modal-body').html(get('ModifiedTreeAlert'));
		$alertPopup.find('.modal-footer ok').html(get('Yes'));

		var $savePopup = $('#save-as-popup');
		$savePopup.find('.modal-header .modal-title').html(get('Save'));
		$savePopup.find('#file-format-label').html(get('Extension') + ':');
		$savePopup.find('#svg-format-opt input').html(get('Image')+ 'SVG');
		$savePopup.find('#png-format-opt input').html(get('Image')+ 'PNG');
		$savePopup.find('#field-file-name label').html(get('FileName'));
		$savePopup.find('#input-name').attr('placeholder', get('InsertName')).attr('data-error', get('NoEmptyField'));
		$savePopup.find('#field-scale label').html(get('Scale') + ' (%)');
		$savePopup.find('.modal-footer #save').html(get('Save') );
		$savePopup.find('.modal-footer #cancel').html(get('Cancel') );

		var $nodePopup = $('#node-popup');
		$nodePopup.find('.modal-header .modal-title').html(get('Relative'));
		$nodePopup.find('#field-name label').html(get('Name') + ':');
		$nodePopup.find('#input-name').attr('placeholder', get('InsertName')).attr('data-error', get('NoEmptyField'));
		$nodePopup.find('#field-surname label').html(get('Surname') + ':');
		$nodePopup.find('#field-sex label').html(get('Sex') + ':');
		$nodePopup.find('#ffield-description label').html(get('Description') + ':');
		$savePopup.find('.modal-footer #submit').html(get('Save') );
		$savePopup.find('.modal-footer #cancel').html(get('Cancel') );

		var $groupPopup = $('#group-popup');
		$groupPopup.find('.modal-header .modal-title').html(get('Group'));
		$groupPopup.find('#field-text label').html(get('Text') + ':');
		$groupPopup.find('#field-textSize label').html(get('TextSize') + ':');
		$groupPopup.find('#field-width label').html(get('Width') + ':');
		$groupPopup.find('#field-height label').html(get('Height') + ':');
		$groupPopup.find('#field-color label').html(get('Color') + ':');

		var $openTreePopup = $('#open-file-popup');
		$openTreePopup.find('.modal-header .modal-title').html(get('Open'));
		$openTreePopup.find('#field-file-name label').html(get('ChooseFile') + ':');
		$openTreePopup.find('.modal-footer #cancel').html(get('Cancel') );

		var $bgContextMenu = $('#bgContextMenu');
		$bgContextMenu.find('#create-node').html(get('CreateRelative') + '...');
		$bgContextMenu.find('#create-group').html(get('CreateGroup') + '...');
		$bgContextMenu.find('#select-all').html(get('SelectAll') + '<span class="cmd-text">Ctrl+A</span>');

		var $nodeContextMenu = $('#nodeContextMenu');
		$nodeContextMenu.find('#edit-node').html(get('Edit') + '...');
		$nodeContextMenu.find('#delete').html(get('Delete') + '<span class="cmd-text">Ctrl+Del</span>');
		$nodeContextMenu.find('#center-selection').html(get('CenterSelection') + '<span class="cmd-text">S</span>');
		$nodeContextMenu.find('#center-all').html(get('Extend') + '<span class="cmd-text">E</span>');
		$nodeContextMenu.find('#link-to-partner').html(get('LinkToPartner'));
		$nodeContextMenu.find('#remove-from-group').html(get('RemoveFromGroup'));
		$nodeContextMenu.find('#add-to-group').html(get('AddToGroup') + '<span class="cmd-text caret-right">');
		$nodeContextMenu.find('#add-to-new-group').html(get('NewGroup') + '...');

		var $groupContextMenu = $('#groupContextMenu');
		$groupContextMenu.find('#edit-group').html(get('Edit') + '...');
		$groupContextMenu.find('#delete').html(get('Delete') + '<span class="cmd-text">Ctrl+Del</span>');
		$groupContextMenu.find('#center-selection').html(get('CenterSelection') + '<span class="cmd-text">S</span>');
		$groupContextMenu.find('#center-all').html(get('Extend') + '<span class="cmd-text">E</span>');
	};

	return { 
		setLanguage: setLanguage, 
		get: get
	};
})();
