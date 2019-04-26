var dictionary = (function(){
	var lang = lang || 'english';

	var dictMap =  {
		'AddToGroup': {english: 'Add to Group', italiano: 'Aggiungi a un gruppo', deutsch: 'Zur Gruppe hinzufügen'},
		'Cancel': {english: 'Cancel', italiano: 'Annulla', deutsch: 'Abbrechen'},
		'CenterSelection': {english: 'Center selection', italiano: 'Centra selezione', deutsch: 'Auswahl zentrieren'},
		'ChooseFile': {eng: 'Choose file', italiano: 'Scegli il file', deutsch: 'Datei wählen'},
		'Close': {english: 'Close', italiano: 'Chiudi', deutsch: 'Schließen'},
		'Color': {english: 'Color', italiano: 'Colore', deutsch: 'Farbe'},
		'CreateGroup': {english: 'Create group', italiano: 'Crea gruppo', deutsch: 'Gruppe erstellen'},
		'CreateRelative': {english: 'Create relative', italiano: 'Crea familiare', deutsch: 'Familienmitglied erstellen'},
		'Delete': {english: 'Delete', italiano: 'Elimina', deutsch: 'Löschen'},
		'Description': {english: 'Description', italiano: 'Descrizione', deutsch: 'Beschreibung'},
		'DeselectAll': {english: 'Deselect All', italiano: 'Deseleziona tutto', deutsch: 'Alle Markierungen aufheben'},
		'Edit': {english: 'Edit', italiano: 'Modifica', deutsch: 'Bearbeiten'},
		'EditSelected': {english: 'Edit selected', italiano: 'Modifica selezionato', deutsch: 'Ausgewählte bearbeiten'},
		'Extend': {english: 'Extend', italiano: 'Mostra tutto', deutsch: 'Ausdehnen'},
		'Extension': {english: 'Extension', italiano: 'Formato', deutsch: 'Format'},
		'FileName': {english: 'File name', italiano: 'Nome file', deutsch: 'Dateiname'},
		'Group': {english: 'Group', italiano: 'Gruppo', deutsch: 'Gruppe'},
		'Height': {english: 'Height', italiano: 'Altezza', deutsch: 'Höhe'},
		'Image': {english: 'Image', italiano: 'Immagine', deutsch: 'Image'},
		'InsertName': {english: 'Insert name', italiano: 'Inserire il nome', deutsch: 'Namen einfügen'},
		'LinkToPartner': {english: 'Link to partner', italiano: 'Collega al partner', deutsch: 'Verbindung zum Partner'},
		'LoadedTree': {english: 'Loaded tree', italiano: 'Albero caricato', deutsch: 'Lade Baum'},
		'ModifiedTreeAlert': {english: 'Current tree has been modified. Do you want save changes?', italiano: 'L\'albero corrente è stato modificato. Vuoi salvare le modifiche prima di continuare?', deutsch: 'Aktueller Baum wurde geändert. Wollen Sie die Änderungen speichern?'},
		'MultiSelection': {english: 'Multi selection', italiano: 'Selezione multipla', deutsch: 'Mehrfachauswahl'},
		'Name': {english: 'Name', italiano: 'Nome', deutsch: 'Vorname'},
		'NewGroup': {english: 'New group', italiano: 'Nuovo gruppo', deutsch: 'Neue Gruppe'},
		'NewTree': {english: 'New', italiano: 'Nuovo', deutsch: 'Neu'},
		'NoEmptyField': {english: 'This field is required', italiano: 'Questo campo non può essere vuoto', deutsch: 'Dieses Feld ist erforderlich'},
		'Open': {english: 'Open', italiano: 'Apri', deutsch: 'Öffnen'},
		'Redo': {english: 'Redo', italiano: 'Riapplica', deutsch: 'Wiederholen'},
		'Relative': {english: 'Relative', italiano: 'Familiare', deutsch: 'Familienmitglied'},
		'RemoveFromGroup': {english: 'Remove from group', italiano: 'Rimuovi dal gruppo', deutsch: 'Aus Gruppe entfernen' },
		'Save': {english: 'Save', italiano: 'Salva', deutsch: 'Speichern'},
		'SaveAs': {english: 'Save as', italiano: 'Salva come', deutsch: 'Speichern als'},
		'Scale': {english: 'Scale', italiano: 'Scala', deutsch: 'Skala'},
		'SelectAll': {english: 'Select all', italiano: 'Seleziona tutto', deutsch: 'Alles auswählen'},
		'SelectArea': {english: 'Select area', italiano: 'Area di Selezione', deutsch: 'Bereich auswählen'},
		'selectedItems': {english: 'selected items', italiano: 'elementi selezionati', deutsch: 'ausgewählte Elemente'},
		'Sex': {english: 'Sex', italiano: 'Sesso', deutsch: 'Geschlecht'},
		'ShowInfo': {english: 'Show info', italiano: 'Informazioni', deutsch: 'Info anzeigen'},
		'Surname': {english: 'Surname', italiano: 'Cognome', deutsch:'Familienname'},
		'Text': {english: 'Text', italiano: 'Testo', deutsch: 'Text'},
		'TextSize': {english: 'Text size', italiano: 'Dimensione del testo', deutsch: 'Textgröße'},
		'Undo': {english: 'Undo', italiano: 'Annulla', deutsch: 'Rückgängig'},	
		'View': {english: 'View', italiano: 'Vista', deutsch: 'Ansicht'},	
		'Warning': 	{english: 'Warning', italiano: 'Attenzione', deutsch: 'Warnung'},
		'Width': {english: 'Width', italiano: 'Lunghezza', deutsch: 'Breite'},
		'Yes': {english: 'Yes', italiano: 'S&igrave', deutsch: 'Ja'},	
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
			$('#bgMenu-close span.item-text').html(get('Close'));
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
			$('#nodeMenu-close span.item-text').html(get('Close'));
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
			$('#groupMenu-close span.item-text').html(get('Close'));		
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
