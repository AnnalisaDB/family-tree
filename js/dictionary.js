var dictionary = (function(){
	var lang = lang || 'eng';

	var dictMap =  {
		'AddToGroup': {eng: 'Add to Group', rus: 'Добавить в группу', ita: 'Aggiungi a un gruppo'}, 
		'Cancel': {eng: 'Cancel', rus: 'Отмена', ita: 'Annulla'}, 
		'CenterSelection': {eng: 'Center selection', rus: 'Приблизить', ita: 'Centra selezione'},
		'ChooseFile': {eng: 'Choose file', rus: 'Выберите файл', ita: 'Scegli il file'},
		'Close': {eng: 'Close', rus: 'Закрыть', ita: 'Chiudi'},
		'Color': {eng: 'Color', rus: 'Цвет', ita: 'Colore'},
		'CreateGroup': {eng: 'Create group', rus: 'Создать группу', ita: 'Crea gruppo'},
		'CreateRelative': {eng: 'Create relative', rus: 'Создать родственника', ita: 'Crea familiare'},
		'Delete': {eng: 'Delete', rus: 'Удалить', ita: 'Elimina'},
		'Description': {eng: 'Description', rus: 'Описание', ita: 'Descrizione'},
		'DeselectAll': {eng: 'Deselect All', rus: 'Сбросить выбор', ita: 'Deseleziona tutto'},
		'Edit': {eng: 'Edit', rus: 'Редактировать', ita: 'Modifica'},
		'EditSelected': {eng: 'Edit selected', rus: 'Редактировать выбранных', ita: 'Modifica selezionato'},
		'Extend': {eng: 'Extend', rus: 'Отдалить', ita: 'Mostra tutto'},
		'Extension': {eng: 'Extension', rus: 'Формат', ita: 'Formato'},
		'FileName': {eng: 'File name', rus: 'Имя файла', ita: 'Nome file'},
		'Group': {eng: 'Group', rus: 'Группа', ita: 'Gruppo'},
		'Height': { eng: 'Height', rus: 'Высота', ita: 'Altezza'},
		'Image': {eng: 'Image', rus: 'Изображение', ita: 'Immagine'},
		'InsertName': {eng: 'Insert name', rus: 'Введите имя файла', ita: 'Inserire il nome'},
		'LinkToPartner': {eng: 'Link to partner', rus: 'Связать с партнером', ita: 'Collega al partner'},
		'LoadedTree': {eng: 'Loaded tree', rus: 'Текущее дерево', ita: 'Albero caricato'},
		'ModifiedTreeAlert': {
			eng: 'Current tree has been modified. Do you want save changes?',
			rus: 'Дерево было изменено. Сохранить изменения?',
			ita: 'L\'albero corrente è stato modificato. Vuoi salvare le modifiche prima di continuare?'
		},
		'MultiSelection': { eng: 'Multi selection', rus: 'Множественный выбор', ita: 'Selezione multipla'},
		'Name': { eng: 'Name', rus: 'Имя', ita: 'Nome'},
		'NewGroup': { eng: 'New group', rus: 'Новая группа', ita: 'Nuovo gruppo'},
		'File': { eng: 'File', rus: 'Файл', ita: 'File'},
		'NewTree': { eng: 'New', rus: 'Новое дерево', ita: 'Nuovo'},
		'NoEmptyField': {
			eng: 'This field is required',
			rus: 'Поле обязательно для заполнения',
			ita: 'Questo campo non può essere vuoto'
		},
		'Open': { eng: 'Open', rus: 'Открыть', ita: 'Apri'},
		'Redo': { eng: 'Redo', rus: 'Повторить', ita: 'Riapplica'},
		'Relative': { eng: 'Relative', rus: 'Родственник', ita: 'Familiare'},
		'RemoveFromGroup': { eng: 'Remove from group', rus: 'Исключить из группы', ita: 'Rimuovi dal gruppo'},
		'Save': { eng: 'Save', rus: 'Сохранить', ita: 'Salva'},
		'SaveAs': { eng: 'Save as', rus: 'Сохранить как…', ita: 'Salva come'},
		'Scale': { eng: 'Scale', rus: 'Масштаб', ita: 'Scala'},
		'SelectAll': { eng: 'Select all', rus: 'Выбрать всех', ita: 'Seleziona tutto'},
		'SelectArea': {eng: 'Select area', rus: 'Выбрать область', ita: 'Area di Selezione'},
		'selectedItems': { eng: 'selected items', rus: 'выбрано', ita: 'elementi selezionati'},
		'Sex': { eng: 'Sex', rus: 'Пол', ita: 'Sesso'},
		'ShowInfo': { eng: 'Show info', rus: 'Информация', ita: 'Informazioni'},
		'Surname': { eng: 'Surname', rus: 'Фамилия', ita: 'Cognome'},
		'Text': { eng: 'Text', rus: 'Название', ita: 'Testo'},
		'TextSize': { eng: 'Text size', rus: 'Размер шрифта', ita: 'Dimensione del testo'},
		'Undo': { eng: 'Undo', rus: 'Отмена', ita: 'Annulla'},
		'View': { eng: 'View', rus: 'Вид', ita: 'Vista'},
		'Warning': 	{ eng: 'Warning', rus: 'Внимание', ita: 'Attenzione'},
		'Width': { eng: 'Width', rus: 'Ширина', ita: 'Lunghezza'},
		'Yes': {eng: 'Yes', rus: 'Да', ita: 'S&igrave'},
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

	function updateNavBars() {
		$('#file-menu').html(get('File'));
		$('#new-item span.item-text').html(get('NewTree'));
		$('#open-item span.item-text').html(get('Open'));
		$('#save-as-item span.item-text').html(get('SaveAs'));
		$('#undo-item span.item-text').html(get('Undo'));
		$('#redo-item span.item-text').html(get('Redo'));
		$('#delete-item span.item-text').html(get('Delete'));
		$('#select-all-item span.item-text').html(get('SelectAll'));
		$('#selection-area-item span.item-text').html(get('SelectArea'));
		$('span#loaded-tree-label').html(get('LoadedTree'));
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
		$nodePopup.find('#field-description label').html(get('Description') + ':');
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
