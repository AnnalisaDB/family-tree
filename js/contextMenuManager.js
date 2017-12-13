var contextMenuManager = function(isTouchDevice){
	var bgCtxMenu, nodeCtxMenu, groupCtxMenu;

	function _getPosition(ev){
		var x = 0, y = 0;
		if (isTouchDevice && ev.touches.length == 1)
			ev = ev.touches[0];
		if (ev.pageX || ev.pageY) {
			x = ev.pageX;
			y = ev.pageY;
		} else if (ev.clientX || ev.clientY) {
			x = ev.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
			y = ev.clientY + document.body.scrollTop + document.documentElement.scrollTop;
		}
		return [x, y];
	};

	function _setCtxMenuPosition(ctxMenu, x, y, d3container){
		if (!ctxMenu || !d3container || d3container.empty())
			return;

		x = x || 0;
		y = y || 0;

		var bbox = d3container.node().getBoundingClientRect(),
			viewX = bbox.left,
			viewW = bbox.width,
			menuW = +ctxMenu.css('width').replace('px', ''),
			dx = viewX + viewW - (x + menuW),
			viewY = bbox.top,
			viewH = bbox.height,
			menuH = +ctxMenu.css('height').replace('px', ''),
			dy = viewY + viewH - (y + menuH);

		if (dx < 0)
			ctxMenu.css('left', x + dx)
		if (dy < 0)
			ctxMenu.css('top', y + dy)
	};

	function resetContextMenus(){
		hide();
		resetBackgroundMenu();
		resetNodeMenu();
		resetGroupMenu();
	};

	function initBackgroundMenu(applyCallbacks, onRightClickTo){
		applyCallbacks = applyCallbacks || {};
		onRightClickTo = onRightClickTo || {};

		bgCtxMenu = $('#bgContextMenu');
		
		if (bgCtxMenu && bgCtxMenu.html() !== undefined){

			bgCtxMenu.on(isTouchDevice ? 'touchstart' : 'click', 'a', function() {
				var id = $(this).attr('id');
				if (id == 'create-node' || id == 'create-group'){
					var left = +bgCtxMenu.css('left').replace('px',''), 
						top = +bgCtxMenu.css('top').replace('px',''); 
					
					var type = id.substring(7);

					if (applyCallbacks.editNewObject)
						applyCallbacks.editNewObject(type, left, top);

					var popup = $('#' + type + '-popup');
					if (popup.length !== 0)
						popup.modal();
				}
				else if (id == 'select-all' && applyCallbacks.selectAll)
					applyCallbacks.selectAll();
				bgCtxMenu.hide();
			});
		}
	};

	function resetBackgroundMenu(){
		if (bgCtxMenu && bgCtxMenu.html() !== undefined)
			bgCtxMenu.off(isTouchDevice ? 'touchstart' : 'click', 'a');
	};

	function _onBackgroundRightClick(d3selection, d3container){
		if (!d3selection || d3selection.empty() || !d3container || d3container.empty())
			return;
		d3selection.on(isTouchDevice ? 'touchstart' : 'contextmenu', function(){
			d3.event.preventDefault();
			var p = _getPosition(d3.event);
			var x = p[0], y = p[1];
			
			bgCtxMenu.css({
				display: 'block',
				left: x,
				top: y
			});

			_setCtxMenuPosition(bgCtxMenu, x, y, d3container);
		});
	};

	function initGroupMenu(applyCallbacks){
		applyCallbacks = applyCallbacks || {};

		groupCtxMenu = $('#groupContextMenu');

		if (groupCtxMenu && groupCtxMenu.html() !== undefined){
			
			groupCtxMenu.on(isTouchDevice ? 'touchstart' : 'click', 'a', function(ev) {
				var id = $(this).attr('id');
				
				if (id == 'delete' && applyCallbacks.delete){
					applyCallbacks.delete();
				} else if (id == 'edit-group'){
					var popup = $('#group-popup');
					popup.modal();
				} else if (id == 'center-selection' && applyCallbacks.centerSelection)
					applyCallbacks.centerSelection();
				else if (id == 'center-all' && applyCallbacks.centerAll)
					applyCallbacks.centerAll();
				else if (id == 'details-group' && applyCallbacks.showInfo)
					applyCallbacks.showInfo()
				
				groupCtxMenu.hide();
			});
		}
	};

	function resetGroupMenu(){
		if (groupCtxMenu && groupCtxMenu.html() !== undefined)
			groupCtxMenu.off(isTouchDevice ? 'touchstart' : 'click', 'a');
	};

	function _onGroupRightClick(d3selection, d3container, cfg){
		if (!d3selection || d3selection.empty())
			return;

		cfg = cfg || {};
		var getSelectionCount = cfg.getSelectionCount;

		d3selection.on(isTouchDevice ? 'touchstart' : 'contextmenu', function(group){
			d3.event.preventDefault();
			var p = _getPosition(d3.event);
			var x = p[0], y = p[1];

			groupCtxMenu.css({ display: 'block' });

			var popup = $('#group-popup');		
			['text', 'width', 'height', 'textSize', 'color', 'nodes', 'id'].forEach(function(name){
				var value = group[name];
				var field = popup.find('#input-' + name);
				if (field){
					if (name == 'nodes')
						field.val(value.join(','));
					else
						field.val(value);
				}
			});
			
			if (getSelectionCount){
				var count = getSelectionCount();
				groupCtxMenu.find('#selection').html( getSelectionCount() + ' ' + dictionary.get('selectedItems'));
			}
			
			groupCtxMenu.css({
				left: x,
				top: y
			});
			
			_setCtxMenuPosition(groupCtxMenu, x, y, d3container);
		});
	};

	function initNodeMenu(applyCallbacks){
		applyCallbacks = applyCallbacks || {};

		nodeCtxMenu = $('#nodeContextMenu');

		if (nodeCtxMenu && nodeCtxMenu.html() !== undefined){

			nodeCtxMenu.on(isTouchDevice ? 'touchstart' : 'click', 'a', function() {
				var id = $(this).attr('id');
				if (id == 'delete' && applyCallbacks.delete)
					applyCallbacks.delete();
				else if (id == 'details-node' && applyCallbacks.showInfo)
					applyCallbacks.showInfo();
				else if (id == 'edit-node' && applyCallbacks.editNode)
					applyCallbacks.editNode()
				else if (id == 'center-selection' && applyCallbacks.centerSelection)
					applyCallbacks.centerSelection(); 
				else if (id == 'center-all' && applyCallbacks.centerAll)
					applyCallbacks.centerAll();
				else if (id == 'link-to-partner' && applyCallbacks.linkToPartner)
					applyCallbacks.linkToPartner();
				else if (id == 'add-to-group'){
					event.stopPropagation();
					event.preventDefault();
				} else if ((id == 'add-to-new-group' || id.indexOf('add-to-existing-group-') != -1) || 
						(id == 'remove-from-group' || id.indexOf('remove-from-existing-group-') != -1)){
					var el = this;
					while (el && el.className.indexOf('dropdown-menu') == -1)
						el = el.parentNode;
					if (el)
						$(el).hide();
					if (id == 'add-to-new-group'){
						var left = +nodeCtxMenu.css('left').replace('px',''), 
						top = +nodeCtxMenu.css('top').replace('px',''); 
						if (applyCallbacks.getTmpGroup)
							tmpGroup = applyCallbacks.getTmpGroup(left, top)
						$('#group-popup').modal();
					}
				}
				nodeCtxMenu.hide();
			});

			nodeCtxMenu.find('#add-to-group, #remove-from-group')
				.on('mouseover', function(){
					$(this).next('ul').show();
				}).on('mouseout', function(ev){
					var el = ev.toElement;
					var ul = $(this).next('ul');
					while (el && el != this.parentNode)
						el = el.parentNode;
					if (!el)
						ul.hide();
				});
		}
	};

	function resetNodeMenu(){
		if (nodeCtxMenu && nodeCtxMenu.html() !== undefined)
			nodeCtxMenu.off(isTouchDevice ? 'touchstart' : 'click', 'a');
	};

	function _onNodeRightClick(d3selection, d3container, cfg){
		if (!d3selection || d3selection.empty())
			return;

		cfg = cfg || {};
		var getSelectionCount = cfg.getSelectionCount;
		var updateItems = cfg.updateItems;

		d3selection.on(isTouchDevice ? 'touchstart' : 'contextmenu', function(node){
			d3.event.preventDefault();
			var p = _getPosition(d3.event);
			var x = p[0], y = p[1];

			nodeCtxMenu.css({ display: 'block' });

			var popup = $('#node-popup');		
			['id', 'name', 'surname', 'description', 'sex'].forEach(function(name){
				var value = node[name];
				var field = popup.find('#input-' + name);
				if (field)
					field.val(value);
			});

			if (updateItems)
				updateItems();

			if (getSelectionCount){
				var count = getSelectionCount();
				nodeCtxMenu.find('#selection').html( getSelectionCount() + ' ' + dictionary.get('selectedItems'));
			}
			
			nodeCtxMenu.css({
				left: x,
				top: y
			});
			
			_setCtxMenuPosition(nodeCtxMenu, x, y, d3container);
		});
	};

	function enable($element){
		if (!$element)
			return;
		$element.removeClass('disabled');	
	};

	function disable($element){
		if (!$element)
			return;
		$element.addClass('disabled');	
	};

	function enableLinkToPartner(){
		enable(nodeCtxMenu.find('#link-to-partner'));
	};

	function disableLinkToPartner(){
		disable(nodeCtxMenu.find('#link-to-partner'));
	};

	function onRightClick(type, object, container, cfg){
		if (type == 'group')
			_onGroupRightClick(object, container, cfg);
		else if (type == 'node'){
			_onNodeRightClick(object, container, cfg);
		} else {
			_onBackgroundRightClick(object, container);
		}
	}

	function getContextMenu(type){
		if (type == 'group')
			return groupCtxMenu;

		if (type == 'node')
			return nodeCtxMenu;

		return bgCtxMenu;
	}

	function hide(){
		if (bgCtxMenu)
			bgCtxMenu.hide();
		if (nodeCtxMenu)
			nodeCtxMenu.hide();
		if (groupCtxMenu)
			groupCtxMenu.hide();
	}

	return {
		initBackgroundMenu: initBackgroundMenu,
		initGroupMenu: initGroupMenu,
		initNodeMenu: initNodeMenu,
		onRightClick: onRightClick,
		hide: hide,
		getContextMenu: getContextMenu,
		enableLinkToPartner: enableLinkToPartner,
		disableLinkToPartner: disableLinkToPartner,
		reset: resetContextMenus
	}
};
