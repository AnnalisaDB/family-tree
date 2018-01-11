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
		'DeselectAll': {eng: 'Deselect All', ita: 'Deseleziona tutto'},
		'Edit': {eng: 'Edit', ita: 'Modifica'},
		'EditSelected': {eng: 'Edit selected', ita: 'Modifica selezionato'},
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
		'MultiSelection': { eng: 'Multi selection', ita: 'Selezione multipla'},
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
		'SelectArea': {eng: 'Select area', ita: 'Area di Selezione'},
		'selectedItems': { eng: 'selected items', ita: 'elementi selezionati' },
		'Sex': { eng: 'Sex', ita: 'Sesso' },
		'ShowInfo': { eng: 'Show info', ita: 'Informazioni' },
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
		updateNavBars();
		updatePopups();
		updateCtxMenus();
	};

	function updateNavBars(){
		$('#new-item span.item-text').html(get('NewTree'));
		$('#open-item span.item-text').html(get('Open'));
		$('#save-as-item span.item-text').html(get('SaveAs'));
		$('#undo-item span.item-text').html(get('Undo'));
		$('#redo-item span.item-text').html(get('Redo'));
		$('#delete-item span.item-text').html(get('Delete'));
		$('#select-all-item span.item-text').html(get('SelectAll'));
		$('#selection-area-item span.item-text').html(get('SelectArea'));	
		$('#loaded-tree-label span').html(get('LoadedTree'));
		$('#edit-menu span.item-text').html(get('Edit'));
		$('#view-menu span.item-text').html(get('View'));
		$('#center-selection-item span.item-text').html(get('CenterSelection'));
		$('#extend-item span.item-text').html(get('Extend'));
		$('#select-all-objects span.item-text').html(get('SelectAll'));
		$('#deselect-all-objects span.item-text').html(get('DeselectAll'));
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
	};

	function updateCtxMenus(){
		var $bgContextMenu = $('#bgContextMenu');
		if ($bgContextMenu.length){
			$('#bgContextMenu-create-node span.item-text').html(get('CreateRelative'));
			$('#bgContextMenu-create-group span.item-text').html(get('CreateGroup'));
			$('#bgContextMenu-select-all').html(get('SelectAll') + '<span class="cmd-text">Ctrl+A</span>');
		}
		var $bgMenu = $('#bgMenu');
		if ($bgMenu.length){
			$('#bgMenu-create-node span.item-text').html(get('CreateRelative'));
			$('#bgMenu-create-group span.item-text').html(get('CreateGroup'));
			$('#bgMenu-select-all').html(get('SelectAll') + '<span class="cmd-text">Ctrl+A</span>');
		}

		var $nodeContextMenu = $('#nodeContextMenu');
		if ($nodeContextMenu.length){
			$('#nodeContextMenu-details-node span.item-text').html(get('ShowInfo'));
			$('#nodeContextMenu-edit-node span.item-text').html(get('Edit'));
			$('#nodeContextMenu-delete span.item-text').html(get('Delete'));
			$('#nodeContextMenu-center-selection span.item-text').html(get('CenterSelection'));
			$('#nodeContextMenu-center-all span.item-text').html(get('Extend'));
			$('#nodeContextMenu-link-to-partner').html(get('LinkToPartner'));
			$('#nodeContextMenu-remove-from-group span.item-text').html(get('RemoveFromGroup'));
			$('#nodeContextMenu-add-to-group span.item-text').html(get('AddToGroup'));
			$('#nodeContextMenu-add-to-new-group span.item-text').html(get('NewGroup'));
		}
		var $nodeMenu = $('#nodeMenu');
		if ($nodeMenu.length){
			$('#nodeMenu-details-node span.item-text').html(get('ShowInfo'));
			$('#nodeMenu-edit-node span.item-text').html(get('Edit'));
			$('#nodeMenu-delete span.item-text').html(get('Delete'));
			$('#nodeMenu-center-selection span.item-text').html(get('CenterSelection'));
			$('#nodeMenu-center-all span.item-text').html(get('Extend'));
			$('#nodeMenu-link-to-partner').html(get('LinkToPartner'));
			$('#nodeMenu-remove-from-group span.item-text').html(get('RemoveFromGroup'));
			$('#nodeMenu-add-to-group span.item-text').html(get('AddToGroup'));
			$('#nodeMenu-add-to-new-group span.item-text').html(get('NewGroup'));
		}

		var $groupContextMenu = $('#groupContextMenu');
		if ($groupContextMenu.length){			
			$('#groupContextMenu-details-group span.item-text').html(get('ShowInfo'));
			$('#groupContextMenu-edit-group span.item-text').html(get('Edit'));
			$('#groupContextMenu-delete span.item-text').html(get('Delete'));
			$('#groupContextMenu-center-selection span.item-text').html(get('CenterSelection'));
			$('#groupContextMenu-center-all span.item-text').html(get('Extend'));
		}

		var $groupMenu = $('#groupMenu');
		if ($groupMenu.length){			
			$('#groupMenu-details-group span.item-text').html(get('ShowInfo'));
			$('#groupMenu-edit-group span.item-text').html(get('Edit'));
			$('#groupMenu-delete span.item-text').html(get('Delete'));
			$('#groupMenu-center-selection span.item-text').html(get('CenterSelection'));
			$('#groupMenu-center-all span.item-text').html(get('Extend'));
		}
	};

	return { 
		setLanguage: setLanguage, 
		get: get
	};
})();
