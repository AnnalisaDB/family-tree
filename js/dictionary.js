var dictionary = (function(){
	var lang = lang || 'en';

	var dictMap =  {
		'AddToGroup': {en: 'Add to Group', it: 'Aggiungi a un gruppo', de: 'Zur Gruppe hinzufügen', hu: 'Csoporthoz hozzáadni'},
		'Cancel': {en: 'Cancel', it: 'Annulla', de: 'Abbrechen', hu: 'Mégsem'},
		'CenterSelection': {en: 'Center selection', it: 'Centra selezione', de: 'Auswahl zentrieren', hu: 'Központválasztás'},
		'ChooseFile': {eng: 'Choose file', it: 'Scegli il file', de: 'Datei wählen', hu: 'Válasszon egy fájlt'},
		'Close': {en: 'Close', it: 'Chiudi', de: 'Schließen', hu:'Bezárás'},
		'Color': {en: 'Color', it: 'Colore', de: 'Farbe', hu:'Szín'},
		'CreateGroup': {en: 'Create group', it: 'Crea gruppo', de: 'Gruppe erstellen', hu: 'Csoport létrehozása'},
		'CreateRelative': {en: 'Create relative', it: 'Crea familiare', de: 'Familienmitglied erstellen', hu: 'Családtag létrehozása'},
		'Delete': {en: 'Delete', it: 'Elimina', de: 'Löschen', hu: 'Törlés'},
		'Description': {en: 'Description', it: 'Descrizione', de: 'Beschreibung', hu: 'Leírás'},
		'DeselectAll': {en: 'Deselect All', it: 'Deseleziona tutto', de: 'Alle Markierungen aufheben', hu: 'Az összes kijelölésének megszüntetése'},
		'Edit': {en: 'Edit', it: 'Modifica', de: 'Bearbeiten', hu: 'Szerkesztés'},
		'EditSelected': {en: 'Edit selected', it: 'Modifica selezionato', de: 'Ausgewählte bearbeiten', hu: 'A kiválasztott szerkesztés'},
		'Extend': {en: 'Extend', it: 'Mostra tutto', de: 'Ausdehnen', hu: 'Terjeszkedés'},
		'Extension': {en: 'Extension', it: 'Formato', de: 'Format', hu: 'Formátum'},
        'FamilyTree': {en: 'Family tree', it: 'Albero genealogico', de: 'Stammbaum', hu: 'Családfa'},
		'File': {en: 'File', it: 'File', de: 'Datei', hu: 'Fájl'},
        'FileName': {en: 'File name', it: 'Nome file', de: 'Dateiname', hu: 'Fájlnév'},
		'Group': {en: 'Group', it: 'Gruppo', de: 'Gruppe', hu: 'Csoport'},
		'Height': {en: 'Height', it: 'Altezza', de: 'Höhe', hu: 'Magasság'},
		'Image': {en: 'Image', it: 'Immagine', de: 'Bild', hu: 'Kép'},
		'InsertName': {en: 'Insert name', it: 'Inserire il nome', de: 'Namen einfügen', hu: 'Nevet beadni'},
		'LinkToPartner': {en: 'Link to partner', it: 'Collega al partner', de: 'Paarbeziehung', hu: 'Párkapcsolat'},
		'LoadedTree': {en: 'Loaded tree', it: 'Albero caricato', de: 'Geladener Baum', hu: 'Töltött fa'},
		'ModifiedTreeAlert': {en: 'Current tree has been modified. Do you want save changes?', it: 'L\'albero corrente è stato modificato. Vuoi salvare le modifiche prima di continuare?', de: 'Aktueller Baum wurde geändert. Wollen Sie die Änderungen speichern?', hu: 'Az aktuális fát módosították. Szeretné a változtatásokat menteni?'},
		'MultiSelection': {en: 'Multi selection', it: 'Selezione multipla', de: 'Mehrfachauswahl', hu: 'Többszörös kiválasztás'},
		'Name': {en: 'Name', it: 'Nome', de: 'Vorname', hu: 'Keresztnév'},
		'NewGroup': {en: 'New group', it: 'Nuovo gruppo', de: 'Neue Gruppe', hu: 'Új csoport'},
		'NewTree': {en: 'New', it: 'Nuovo', de: 'Neu', hu: 'Új'},
		'No': {en: 'No', it: 'No', de: 'Nein', hu: 'Nem'},
        'NoEmptyField': {en: 'This field is required', it: 'Questo campo non può essere vuoto', de: 'Dieses Feld ist erforderlich', hu: 'Ez a mező kötelező'},
		'Open': {en: 'Open', it: 'Apri', de: 'Öffnen', hu: 'Megnyitás'},
		'Redo': {en: 'Redo', it: 'Riapplica', de: 'Wiederholen', hu: 'Ismét'},
		'Relative': {en: 'Relative', it: 'Familiare', de: 'Familienmitglied', hu: 'Családtag'},
		'RemoveFromGroup': {en: 'Remove from group', it: 'Rimuovi dal gruppo', de: 'Aus Gruppe entfernen', hu: 'Eltávolítás a csoportból' },
		'Save': {en: 'Save', it: 'Salva', de: 'Speichern', hu: 'Mentés'},
		'SaveAs': {en: 'Save as', it: 'Salva come', de: 'Speichern als', hu: 'Mentés másként'},
		'Scale': {en: 'Scale', it: 'Scala', de: 'Skala', hu: 'Skála'},
		'SelectAll': {en: 'Select all', it: 'Seleziona tutto', de: 'Alles auswählen', hu: 'Az összes kijelölése'},
		'SelectArea': {en: 'Select area', it: 'Area di Selezione', de: 'Bereich auswählen', hu: 'Terület kijelölése'},
		'selectedItems': {en: 'selected items', it: 'elementi selezionati', de: 'ausgewählte Elemente', hu: 'kiválasztott elem'},
		'Sex': {en: 'Sex', it: 'Sesso', de: 'Geschlecht', hu: 'Nem'},
		'ShowInfo': {en: 'Show info', it: 'Informazioni', de: 'Info anzeigen', hu: 'Információ megjelenítése'},
		'Surname': {en: 'Surname', it: 'Cognome', de:'Familienname', hu: 'Családinév'},
		'Text': {en: 'Text', it: 'Testo', de: 'Text', hu: 'Szöveg'},
		'TextSize': {en: 'Text size', it: 'Dimensione del testo', de: 'Textgröße', hu: 'Szövegméret'},
		'Undo': {en: 'Undo', it: 'Annulla', de: 'Rückgängig', hu: 'Visszavonás'},	
		'View': {en: 'View', it: 'Vista', de: 'Ansicht', hu: 'Nézet'},	
		'Warning': 	{en: 'Warning', it: 'Attenzione', de: 'Warnung', hu: 'Figyelmeztetés'},
		'Width': {en: 'Width', it: 'Lunghezza', de: 'Breite', hu: 'Szélesség'},
		'Yes': {en: 'Yes', it: 'Si', de: 'Ja', hu: 'Igen'},
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
		$('#loaded-tree-label span.item-text').html(get('LoadedTree'));
        $('#purpose span.item-text').html(get('FamilyTree'));
        $('#file-menu span.item-text').html(get('File'));
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
		$alertPopup.find('.modal-footer #yes').html(get('Yes'));
        $alertPopup.find('.modal-footer #no').html(get('No'));

		var $savePopup = $('#save-as-popup');
		$savePopup.find('.modal-header .modal-title').html(get('Save'));
		$savePopup.find('#file-format-label').html(get('Extension') + ':');
        $savePopup.find('.col-sm-10 #json-format-opt').html('JSON ' + get('File'));
		$savePopup.find('.col-sm-10 #svg-format-opt').html('SVG ' + get('Image'));
		$savePopup.find('.col-sm-10 #png-format-opt').html('PNG ' + get('Image'));
		$savePopup.find('#field-file-name label').html(get('FileName'));
		$savePopup.find('#input-name').attr('placeholder', get('InsertName')).attr('data-error', get('NoEmptyField'));
		$savePopup.find('#field-scale label').html(get('Scale') + ' (%)');
		$savePopup.find('.modal-footer #save').html(get('Save'));
		$savePopup.find('.modal-footer #cancel').html(get('Cancel'));

		var $nodePopup = $('#node-popup');
		$nodePopup.find('.modal-header .modal-title').html(get('Relative'));
		$nodePopup.find('#field-name label').html(get('Name') + ':');
		$nodePopup.find('#input-name').attr('placeholder', get('InsertName')).attr('data-error', get('NoEmptyField'));
		$nodePopup.find('#field-surname label').html(get('Surname') + ':');
		$nodePopup.find('#field-sex label').html(get('Sex') + ':');
		$nodePopup.find('#field-description label').html(get('Description') + ':');
		$nodePopup.find('.modal-footer #submit').html(get('Save'));
		$nodePopup.find('.modal-footer #cancel').html(get('Cancel'));

		var $groupPopup = $('#group-popup');
		$groupPopup.find('.modal-header .modal-title').html(get('Group'));
		$groupPopup.find('#field-text label').html(get('Text') + ':');
		$groupPopup.find('#field-textSize label').html(get('TextSize') + ':');
		$groupPopup.find('#field-width label').html(get('Width') + ':');
		$groupPopup.find('#field-height label').html(get('Height') + ':');
		$groupPopup.find('#field-color label').html(get('Color') + ':');
        $groupPopup.find('.modal-footer #submit').html(get('Save'));
        $groupPopup.find('.modal-footer #cancel').html(get('Cancel'));

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
