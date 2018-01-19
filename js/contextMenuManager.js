var contextMenuManager = function(isTouchDevice){
	// floating
	var bgCtxMenu, nodeCtxMenu, groupCtxMenu;
	var ctxMenuMaxSize = {width: 370, height: 305};
	// fixed
	var bgMenu, nodeMenu, groupMenu;
	
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

	function createBgCtxMenu(){
		var menuHtml = '<ul class="dropdown-menu" role="menu">'
					+ '   <li><a tabindex="-1" href="#" id="bgContextMenu-create-node">'
					+ '      <i class="glyphicon fa fa-user-plus"></i>'
					+ '      <span class="item-text">Create relative</span>...'
					+ '   </a></li>'
					+ '	  <li><a tabindex="-1" href="#" id="bgContextMenu-create-group">'
					+ '      <i class="glyphicon fa fa-users"></i>'
					+ '      <span class="item-text">Create group</span>...'
					+ '   </a></li>'
					+ '   <li class="divider"></li>'
					+ '   <li><a tabindex="-1" href="#" id="bgContextMenu-select-all">'
					+ '      <span class="cmd-text">Ctrl+A</span>'
					+ '      <span class="item-text">Select all</span>'
					+ '   </a></li>'
					+ '</ul>';
		bgCtxMenu = $('<div>', { id: 'bgContextMenu' });
		bgCtxMenu.addClass('context-menu dropdown clearfix');
		bgCtxMenu.html(menuHtml);
		$('#main-script').before(bgCtxMenu);

		if (isTouchDevice)
			$('.cmd-text:not(.caret-right),#selection-area-item').addClass('hide');
	};

	function createBgMenu(){
		var menuHtml = '<ul class="nav navbar-nav" >'
					+ '   <li><a href="#" id="bgMenu-close">'
					+ '		 <i class="glyphicon fa fa-close"></i>'
					+ '      <span class="item-text">Close</span>'
					+ '   </a></li>'
					+ '   <li><a href="#" id="bgMenu-create-node">'
					+ '      <i class="glyphicon fa fa-user-plus"></i>'
					+ '      <span class="item-text">Create relative</span>...'
					+ '   </a></li>'
					+ '	  <li><a href="#" id="bgMenu-create-group">'
					+ '      <i class="glyphicon fa fa-users"></i>'
					+ '      <span class="item-text">Create group</span>...'
					+ '   </a></li>'
					+ '   <li><a href="#" id="bgMenu-select-all">'
					+ '      <span class="cmd-text">Ctrl+A</span>'
					+ '      <span class="item-text">Select all</span>'
					+ '   </a></li>'
					+ '</ul>';
		bgMenu = $('<div id="bgMenu" class="collapse"></div>');
		bgMenu.html(menuHtml);
		$('#viewport>div.fixed-menu')
			.append($('<a href="#" data-toggle="collapse" id="bgMenu-toggle" data-target="#bgMenu"></a>'))
			.append(bgMenu);
		if (isTouchDevice)
			$('.cmd-text:not(.caret-right),#selection-area-item').addClass('hide');
	};

	function initBackgroundMenu(applyCallbacks, addEventsTo){
		applyCallbacks = applyCallbacks || {};
		addEventsTo = addEventsTo || {};

		bgCtxMenu = $('#bgContextMenu');

		if (!bgCtxMenu || !bgCtxMenu.length)
			createBgCtxMenu();
		
		bgCtxMenu.on(isTouchDevice ? 'touchstart' : 'click', 'a', function() {
			var id = $(this).attr('id');
			if (id == 'bgContextMenu-create-node' || id == 'bgContextMenu-create-group'){
				var left = +bgCtxMenu.css('left').replace('px',''), 
					top = +bgCtxMenu.css('top').replace('px',''); 
				
				var type = id.substring(21);

				if (applyCallbacks.editNewObject)
					applyCallbacks.editNewObject(type, left, top);

				var popup = $('#' + type + '-popup');
				if (popup.length !== 0) {
					var mainCollapsableNavbar = $('#main-navbar-collapse');
					if (isTouchDevice && mainCollapsableNavbar.is(':visible')){
						mainCollapsableNavbar.collapse('toggle');
						mainCollapsableNavbar.one('hidden.bs.collapse', function(){
							popup.modal();
						});
					} else 
						popup.modal();
				}
			}
			else if (id == 'bgContextMenu-select-all' && applyCallbacks.selectAll)
				applyCallbacks.selectAll();
			bgCtxMenu.hide();
		});

		bgMenu = $('#bgMenu');
		if (!bgMenu || !bgMenu.length)
			createBgMenu();

		bgMenu.on(isTouchDevice ? 'touchstart' : 'click', 'a', function() {
			var target = $(this),
				id = target.attr('id');

			bgMenu.collapse('toggle');
			
			bgMenu.one('hidden.bs.collapse', function(){
				if (id == 'bgMenu-create-node' || id == 'bgMenu-create-group'){
					var $viewport = $('#viewport'),
						width = $viewport.width(),
						height = $viewport.height();

					var left = width * 0.5, top = height * 0.5;

					var type = id.substring(14);

					if (applyCallbacks.editNewObject)
						applyCallbacks.editNewObject(type, left, top);

					var popup = $('#' + type + '-popup');
					if (popup.length !== 0) {
						var mainCollapsableNavbar = $('#main-navbar-collapse');
						if (isTouchDevice && mainCollapsableNavbar.is(':visible')){
							mainCollapsableNavbar.collapse('toggle');
							mainCollapsableNavbar.one('hidden.bs.collapse', function(){
								popup.modal();
							});
						} else 
							popup.modal();
					}
				}
				else if (id == 'bgMenu-select-all' && applyCallbacks.selectAll)
					applyCallbacks.selectAll();
			});				
		});

	};

	function resetBackgroundMenu(){
		if (bgCtxMenu && bgCtxMenu.html() !== undefined)
			bgCtxMenu.off(isTouchDevice ? 'touchstart' : 'click', 'a');
		if (bgMenu && bgMenu.html() !== undefined)
			bgMenu.off(isTouchDevice ? 'touchstart' : 'click', 'a');
	};

	function _addEventsToBackground(d3selection, d3container){
		if (!d3selection || d3selection.empty() || !d3container || d3container.empty())
			return;
		d3selection.on(isTouchDevice ? 'touchstart' : 'contextmenu', function(){
			var viewport = $('#viewport');
			if (viewport.width() < ctxMenuMaxSize.width || viewport.height() < ctxMenuMaxSize.height){
				hide();
				if (!bgMenu.is(':visible')){
					setTimeout(function(){
						bgMenu.collapse('toggle'); 
					}, 0);
				}
				return;
			}
			
			d3.event.preventDefault();
			
			var p = util.getPosition(d3.event);
			var x = p[0], y = p[1];

			bgCtxMenu.css({
				left: x,
				top: y
			});
			_setCtxMenuPosition(bgCtxMenu, x, y, d3container);

			bgCtxMenu.slideDown({duration: 200});			
		});
	};

	function createGroupCtxMenu(){
		var menuHtml = '<ul class="dropdown-menu" role="menu">'
					+ '   <li><a tabindex="-1" href="#" id="groupContextMenu-selection" class="disabled" style="margin-left: 20px;"></a></li>'
					+ '   <li class="divider"></li>'
					+ '   <li><a tabindex="-1" href="#" id="groupContextMenu-details-group" class="hide">'
					+ '      <span class="glyphicon glyphicon-info-sign"></span>'
					+ '      <span class="item-text">Show info</span>'
					+ '   </a></li>'
					+ '   <li><a tabindex="-1" href="#" id="groupContextMenu-edit-group">'
					+ '      <span class="glyphicon glyphicon-pencil"></span>'
					+ '      <span class="item-text">Edit</span>...'
					+ '   </a></li>'
					+ '   <li class="divider"></li>'
					+ '   <li><a tabindex="-1" href="#" id="groupContextMenu-delete">'
					+ '      <span class="cmd-text">Del</span>'
					+ '      <span class="glyphicon glyphicon-trash"></span>'
					+ '      <span class="item-text">Delete</span>'
					+ '   </a></li>'
					+ '   <li class="divider"></li>'
					+ '   <li><a tabindex="-1" href="#" id="groupContextMenu-center-selection">'
					+ '      <span class="cmd-text">S</span>'
					+ '      <i class="glyphicon fa fa-bullseye"></i>'
					+ '      <span class="item-text">Center selection</span>'
					+ '   </a></li>'
					+ '   <li><a tabindex="-1" href="#" id="groupContextMenu-center-all">'
					+ '      <span class="cmd-text">E</span>'
					+ '      <span class="glyphicon glyphicon-fullscreen"></span>'
					+ '      <span class="item-text">Extend</span>'
					+ '   </a></li>'
					+ '</ul>';
		groupCtxMenu = $('<div>', { id: 'groupContextMenu' });
		groupCtxMenu.addClass('context-menu dropdown clearfix');
		groupCtxMenu.html(menuHtml);
		$('#main-script').before(groupCtxMenu);

		if (isTouchDevice){
			$('.cmd-text:not(.caret-right),#selection-area-item').addClass('hide');
			$('#groupContextMenu-details-group').removeClass('hide');
		}
	};

	function createGroupMenu(){
		var menuHtml = '<ul class="nav navbar-nav">'
					+ '   <li><a href="#" id="groupMenu-selection" class="disabled" style="margin-left: 20px;"></a></li>'
					+ '   <li><a href="#" id="groupMenu-close">'
					+ '		 <i class="glyphicon fa fa-close"></i>'
					+ '      <span class="item-text">Close</span>'
					+ '   </a></li>'					
					+ '   <li><a href="#" id="groupMenu-details-group" class="hide">'
					+ '      <span class="glyphicon glyphicon-info-sign"></span>'
					+ '      <span class="item-text">Show info</span>'
					+ '   </a></li>'
					+ '   <li><a href="#" id="groupMenu-edit-group">'
					+ '      <span class="glyphicon glyphicon-pencil"></span>'
					+ '      <span class="item-text">Edit</span>...'
					+ '   </a></li>'
					+ '   <li><a href="#" id="groupMenu-delete">'
					+ '      <span class="cmd-text">Del</span>'
					+ '      <span class="glyphicon glyphicon-trash"></span>'
					+ '      <span class="item-text">Delete</span>'
					+ '   </a></li>'
					+ '   <li><a href="#" id="groupMenu-center-selection">'
					+ '      <span class="cmd-text">S</span>'
					+ '      <i class="glyphicon fa fa-bullseye"></i>'
					+ '      <span class="item-text">Center selection</span>'
					+ '   </a></li>'
					+ '   <li><a href="#" id="groupMenu-center-all">'
					+ '      <span class="cmd-text">E</span>'
					+ '      <span class="glyphicon glyphicon-fullscreen"></span>'
					+ '      <span class="item-text">Extend</span>'
					+ '   </a></li>'
					+ '</ul>';
		groupMenu = $('<div class="collapse" id="groupMenu"></div>');
		groupMenu.html(menuHtml);
		$('#viewport>div.fixed-menu')
			.append($('<a href="#" data-toggle="collapse" id="groupMenu-toggle" data-target="#groupMenu"></a>'))
			.append(groupMenu);

		if (isTouchDevice){
			$('.cmd-text:not(.caret-right),#selection-area-item').addClass('hide');
			$('#groupMenu-details-group').removeClass('hide');
		}
	};

	function initGroupMenu(applyCallbacks){
		applyCallbacks = applyCallbacks || {};

		groupCtxMenu = $('#groupContextMenu');

		if (!groupCtxMenu || !groupCtxMenu.length)
			createGroupCtxMenu();

		groupCtxMenu.on(isTouchDevice ? 'touchstart' : 'click', 'a', function(ev) {
			var id = $(this).attr('id');
			
			if (id == 'groupContextMenu-delete' && applyCallbacks.delete){
				applyCallbacks.delete();
			} else if (id == 'groupContextMenu-edit-group'){
				var popup = $('#group-popup');
				popup.modal();
			} else if (id == 'groupContextMenu-center-selection' && applyCallbacks.centerSelection)
				applyCallbacks.centerSelection();
			else if (id == 'groupContextMenu-center-all' && applyCallbacks.centerAll)
				applyCallbacks.centerAll();
			else if (id == 'groupContextMenu-details-group' && applyCallbacks.showInfo)
				applyCallbacks.showInfo(groupCtxMenu.groupId);
			
			groupCtxMenu.hide();
		});

		groupMenu = $('#groupMenu');

		if (!groupMenu || !groupMenu.length)
			createGroupMenu();

		groupMenu.on(isTouchDevice ? 'touchstart' : 'click', 'a', function(ev) {
			var target = $(this),
				id = target.attr('id');
			
			var groupId = groupMenu.groupId;
			groupMenu.collapse('toggle');
			groupMenu.one('hidden.bs.collapse', function(){
				if (id == 'groupMenu-delete' && applyCallbacks.delete){
					applyCallbacks.delete();
				} else if (id == 'groupMenu-edit-group'){
					var popup = $('#group-popup');
					popup.modal();
				} else if (id == 'groupMenu-center-selection' && applyCallbacks.centerSelection)
					applyCallbacks.centerSelection();
				else if (id == 'groupMenu-center-all' && applyCallbacks.centerAll)
					applyCallbacks.centerAll();
				else if (id == 'groupMenu-details-group' && applyCallbacks.showInfo)
					applyCallbacks.showInfo(groupId);
				
				groupCtxMenu.hide();
			});
		});

	};

	function resetGroupMenu(){
		if (groupCtxMenu && groupCtxMenu.html() !== undefined)
			groupCtxMenu.off(isTouchDevice ? 'touchstart' : 'click', 'a');
		if (groupMenu && groupMenu.html() !== undefined)
			groupMenu.off(isTouchDevice ? 'touchstart' : 'click', 'a');
	};

	function _addEventsToGroup(d3selection, d3container, cfg){
		if (!d3selection || d3selection.empty())
			return;

		cfg = cfg || {};
		var getSelectionCount = cfg.getSelectionCount;

		d3selection.on(isTouchDevice ? 'touchstart' : 'contextmenu', function(group){
			var popup = $('#group-popup');		
			['text', 'width', 'height', 'textSize', 'color', 'nodes', 'id'].forEach(function(name){
				var value = group[name];
				var field = popup.find('#input-' + name);
				if (field){
					if (name == 'nodes')
						field.val(value.join(','));
					else 
						field.val(value);
					
					if (field.attr('id') == 'input-color')
						field.trigger('change');
				}
			});
			
			var viewport = $('#viewport');
			if (viewport.width() < ctxMenuMaxSize.width || viewport.height() < ctxMenuMaxSize.height){
				hide();
				groupMenu.groupId = group.id;
				setTimeout(function(){ 
					if (getSelectionCount){
						var count = getSelectionCount();
						groupMenu.find('#groupMenu-selection').html( getSelectionCount() + ' ' + dictionary.get('selectedItems'));
					}
					groupMenu.collapse('toggle'); 
				}, 0);
				return;
			}

			d3.event.preventDefault();

			groupCtxMenu.groupId = group.id;
			var p = util.getPosition(d3.event);
			var x = p[0], y = p[1];
			
			
			groupCtxMenu.css({
				left: x,
				top: y
			});
			
			_setCtxMenuPosition(groupCtxMenu, x, y, d3container);
			
			setTimeout(function(){
				if (getSelectionCount){
					var count = getSelectionCount();
					groupCtxMenu.find('#groupContextMenu-selection').html( getSelectionCount() + ' ' + dictionary.get('selectedItems'));
				}
			}, 0);	
			
			groupCtxMenu.slideDown({duration: 200});		
		});
	};

	function createNodeCtxMenu(){
		var menuHtml = '<ul class="dropdown-menu" role="menu">'
					+ '   <li><a tabindex="-1" href="#" id="nodeContextMenu-selection" class="disabled" style="margin-left: 20px;"></a></li>'
					+ '   <li class="divider"></li>'
					+ '   <li><a tabindex="-1" href="#" id="nodeContextMenu-details-node" class="hide">'
					+ '      <span class="glyphicon glyphicon-info-sign"></span>'
					+ '      <span class="item-text">Show info</span>'
					+ '   </a></li>'
					+ '   <li><a tabindex="-1" href="#" id="nodeContextMenu-edit-node">'
					+ '      <span class="glyphicon glyphicon-pencil"></span>'
					+ '      <span class="item-text">Edit</span>...'
					+ '   </a></li>'
					+ '   <li class="divider"></li>'
					+ '   <li><a tabindex="-1" href="#" id="nodeContextMenu-delete">'
					+ '      <span class="cmd-text">Del</span>'
					+ '      <span class="glyphicon glyphicon-trash"></span>'
					+ '      <span class="item-text">Delete</span>'
					+ '   </a></li>'
					+ '   <li class="divider"></li>'
					+ '   <li><a tabindex="-1" href="#" id="nodeContextMenu-center-selection">'
					+ '      <span class="cmd-text">S</span>'
					+ '      <i class="glyphicon fa fa-bullseye"></i>'
					+ '      <span class="item-text">Center selection</span>'
					+ '   </a></li>'
					+ '   <li><a tabindex="-1" href="#" id="nodeContextMenu-center-all">'
					+ '      <span class="cmd-text">E</span>'
					+ '      <span class="glyphicon glyphicon-fullscreen"></span>'
					+ '      <span class="item-text">Extend</span>'
					+ '   </a></li>'
					+ '   <li class="divider"></li>'
					+ '   <li><a tabindex="-1" href="#" id="nodeContextMenu-link-to-partner">Link to partner</a></li>'
					+ '   <li class="dropdown-submenu">'
					+ '      <a tabindex="-1" href="#" id="nodeContextMenu-add-to-group">'
					+ '         <span class="cmd-text caret-right"></span>'
					+ '         <span class="item-text">Add to group</span>'
					+ '      </a>'
					+ '      <ul class="dropdown-menu"><li>'
					+ '         <a href="#" id="nodeContextMenu-add-to-new-group"><span class="item-text">New group</span>...</a>'
					+ '      </li></ul>'
					+ '   <li class="dropdown-submenu">'
					+ '      <a tabindex="-1" href="#" id="nodeContextMenu-remove-from-group">'
					+ '         <span class="cmd-text caret-right"></span>'
					+ '         <span class="item-text">Remove from group</span>'
					+ '      </a>'
					+ '      <ul class="dropdown-menu"></ul>'
					+ '   </li>'
					+ '</ul>';

		nodeCtxMenu = $('<div>', { id: 'nodeContextMenu' });
		nodeCtxMenu.addClass('context-menu dropdown clearfix');
		nodeCtxMenu.html(menuHtml);
		$('#main-script').before(nodeCtxMenu);

		if (isTouchDevice){
			$('.cmd-text:not(.caret-right),#selection-area-item,#nodeContextMenu-link-to-partner').addClass('hide');
			$('#nodeContextMenu-details-node').removeClass('hide');
		}
	};

	function createNodeMenu(){
		var menuHtml = '<ul class="nav navbar-nav">'
					+ '   <li><a href="#" id="nodeMenu-selection" class="disabled" style="margin-left: 20px;"></a></li>'
					+ '   <li><a href="#" id="nodeMenu-close">'
					+ '		 <i class="glyphicon fa fa-close"></i>'
					+ '      <span class="item-text">Close</span>'
					+ '   </a></li>'
					+ '   <li><a href="#" id="nodeMenu-details-node" class="hide">'
					+ '      <span class="glyphicon glyphicon-info-sign"></span>'
					+ '      <span class="item-text">Show info</span>'
					+ '   </a></li>'					
					+ '   <li><a href="#" id="nodeMenu-edit-node">'
					+ '      <span class="glyphicon glyphicon-pencil"></span>'
					+ '      <span class="item-text">Edit</span>...'
					+ '   </a></li>'
					+ '   <li><a href="#" id="nodeMenu-delete">'
					+ '      <span class="cmd-text">Del</span>'
					+ '      <span class="glyphicon glyphicon-trash"></span>'
					+ '      <span class="item-text">Delete</span>'
					+ '   </a></li>'
					+ '   <li class="divider"></li>'
					+ '   <li><a href="#" id="nodeMenu-center-selection">'
					+ '      <span class="cmd-text">S</span>'
					+ '      <i class="glyphicon fa fa-bullseye"></i>'
					+ '      <span class="item-text">Center selection</span>'
					+ '   </a></li>'
					+ '   <li><a href="#" id="nodeMenu-center-all">'
					+ '      <span class="cmd-text">E</span>'
					+ '      <span class="glyphicon glyphicon-fullscreen"></span>'
					+ '      <span class="item-text">Extend</span>'
					+ '   </a></li>'
					+ '   <li><a href="#" id="nodeMenu-link-to-partner">Link to partner</a></li>'
					+ '   <li class="dropdown">'
					+ '      <a href="#" id="nodeMenu-add-to-group" class="dropdown-toggle" data-toggle="dropdown" aria-expanded="false">'
					+ '         <span class="item-text">Add to group</span>'
					+ '			<b class="caret"></b>'
					+ '      </a>'
					+ '      <ul class="dropdown-menu"><li>'
					+ '         <a href="#" id="nodeMenu-add-to-new-group"><span class="item-text">New group</span>...</a>'
					+ '      </li></ul>'
					+ '   <li class="dropdown">'
					+ '      <a href="#" id="nodeMenu-remove-from-group" class="dropdown-toggle" data-toggle="dropdown" aria-expanded="false">'
					+ '         <span class="item-text">Remove from group</span>'
					+ '			<b class="caret"></b>'
					+ '      </a>'
					+ '      <ul class="dropdown-menu"></ul>'
					+ '   </li>'
					+ '</ul>';
		nodeMenu = $('<div class="collapse" id="nodeMenu"></div>');
		nodeMenu.html(menuHtml);
		$('#viewport>div.fixed-menu')
			.append($('<a href="#" data-toggle="collapse" id="nodeMenu-toggle" data-target="#nodeMenu"></a>'))
			.append(nodeMenu);

		if (isTouchDevice){
			$('.cmd-text:not(.caret-right),#selection-area-item,#nodeMenu-link-to-partner').addClass('hide');
			$('#nodeMenu-details-node').removeClass('hide');
		}
	};

	function initNodeMenu(applyCallbacks){
		applyCallbacks = applyCallbacks || {};

		nodeCtxMenu = $('#nodeContextMenu');

		if (!nodeCtxMenu || !nodeCtxMenu.length)
			createNodeCtxMenu();

		nodeCtxMenu.on(isTouchDevice ? 'touchstart' : 'click', 'a', function() {
			nodeCtxMenu.find('#nodeContextMenu-add-to-group, #nodeContextMenu-remove-from-group').each(function(){
				var groupsList = $(this).next('ul');
				if (groupsList.is(':visible'))
					groupsList
						.removeClass('dropdown-menu-left')
						.removeClass('dropdown-menu-up')
						.hide();
			});
			var id = $(this).attr('id');
			if (id == 'nodeContextMenu-delete' && applyCallbacks.delete)
				applyCallbacks.delete();
			else if (id == 'nodeContextMenu-details-node' && applyCallbacks.showInfo)
				applyCallbacks.showInfo(nodeCtxMenu.nodeId);
			else if (id == 'nodeContextMenu-edit-node' && applyCallbacks.editNode)
				applyCallbacks.editNode()
			else if (id == 'nodeContextMenu-center-selection' && applyCallbacks.centerSelection)
				applyCallbacks.centerSelection(); 
			else if (id == 'nodeContextMenu-center-all' && applyCallbacks.centerAll)
				applyCallbacks.centerAll();
			else if (id == 'nodeContextMenu-link-to-partner' && applyCallbacks.linkToPartner)
				applyCallbacks.linkToPartner();
			else if (id == 'nodeContextMenu-add-to-group' || id == 'nodeContextMenu-remove-from-group'){
				if (isTouchDevice)
					return;
				event.stopPropagation();
				event.preventDefault();
			} else if ((id == 'nodeContextMenu-add-to-new-group' || id.indexOf('nodeContextMenu-add-to-existing-group-') != -1) || 
					(id == 'nodeContextMenu-remove-from-group' || id.indexOf('nodeContextMenu-remove-from-existing-group-') != -1)){
				var el = util.getAncestorByClass(this, 'dropdown-menu');
				if (el)
					$(el).hide();
				if (id == 'nodeContextMenu-add-to-new-group'){
					var left = +nodeCtxMenu.css('left').replace('px',''), 
					top = +nodeCtxMenu.css('top').replace('px',''); 
					if (applyCallbacks.getTmpGroup)
						tmpGroup = applyCallbacks.getTmpGroup(left, top)
					$('#group-popup').modal();
				}
			}
			nodeCtxMenu.hide();
		});

		var groupsListItems = nodeCtxMenu.find('#nodeContextMenu-add-to-group, #nodeContextMenu-remove-from-group');

		if (isTouchDevice){
			groupsListItems.on('touchstart', function() {
				var groupsListMenu = $(this).next('ul');
				_updateGroupsListPosition(groupsListMenu);
				groupsListMenu.slideDown({duration: 200});									
			});
		} else {
			groupsListItems.on('mouseover', function(){
				var groupsListMenu = $(this).next('ul');
				groupsListMenu.slideDown({duration: 200});
				_updateGroupsListPosition(groupsListMenu);
			});

			groupsListItems.on('mouseout', function(ev){
				var el = ev.toElement;
				var ul = $(this).next('ul');
				while (el && el != this.parentNode)
					el = el.parentNode;
				if (!el)
					ul.hide();
			});
		}

		nodeMenu = $('#nodeMenu');
		if (!nodeMenu || !nodeMenu.length)
			createNodeMenu();

		nodeMenu.on(isTouchDevice ? 'touchstart' : 'click', 'a:not(#nodeMenu-add-to-group, #nodeMenu-remove-from-group)', function() {
			var el = this,
				target = $(this),
				id = target.attr('id');
			var nodeId = nodeMenu.nodeId;

			nodeMenu.collapse('toggle');
			nodeMenu.one('hidden.bs.collapse', function(){
				if (id == 'nodeMenu-delete' && applyCallbacks.delete)
					applyCallbacks.delete();
				else if (id == 'nodeMenu-details-node' && applyCallbacks.showInfo)
					applyCallbacks.showInfo(nodeId);
				else if (id == 'nodeMenu-edit-node' && applyCallbacks.editNode)
					applyCallbacks.editNode()
				else if (id == 'nodeMenu-center-selection' && applyCallbacks.centerSelection)
					applyCallbacks.centerSelection(); 
				else if (id == 'nodeMenu-center-all' && applyCallbacks.centerAll)
					applyCallbacks.centerAll();
				else if (id == 'nodeMenu-link-to-partner' && applyCallbacks.linkToPartner)
					applyCallbacks.linkToPartner();
				else if ((id == 'nodeMenu-add-to-new-group' || id.indexOf('nodeMenu-add-to-existing-group-') != -1) || 
					(id == 'nodeMenu-remove-from-group' || id.indexOf('nodeMenu-remove-from-existing-group-') != -1)){
					el = util.getAncestorByClass(el, 'dropdown');
					if (el)
						$(el).find('a.dropdown-toggle').dropdown('toggle');
					if (id == 'nodeMenu-add-to-new-group'){
						var viewport = $('#viewport'),
							x = viewport.width() * 0.5,
							y = viewport.height() * 0.5;
						if (applyCallbacks.getTmpGroup)
							tmpGroup = applyCallbacks.getTmpGroup(x, y)
						$('#group-popup').modal();
					}
				}
			});
		});
	};

	function _updateGroupsListPosition(listMenu){
		if (!listMenu || !listMenu.html())
			return;

		// initialization
		listMenu.removeClass('dropdown-menu-left')
				.removeClass('dropdown-menu-up');

		var menuRect = listMenu.get(0).getBoundingClientRect(),
			viewRect = nodeCtxMenu.viewport.getBoundingClientRect();
		
		if (menuRect.bottom > viewRect.bottom)
			listMenu.addClass('dropdown-menu-up');
		if (menuRect.right > viewRect.right)
			listMenu.addClass('dropdown-menu-left');
	};

	function updateAddToGroupsItem(groupsList, callback){
		callback = callback || function(){};
		
		// context menu
		var $li_ctx = $('#nodeContextMenu-add-to-group').parent('li'),
			menu_ctx = $li_ctx.find('.dropdown-menu');

		var $li = $('#nodeMenu-add-to-group').parent('li'),
			menu = $li.find('.dropdown-menu');

		menu_ctx.off(isTouchDevice ? 'touchstart' : 'click', '.existing-group a');
		menu.off(isTouchDevice ? 'touchstart' : 'click', '.existing-group a');

		// remove last groups list
		menu_ctx.find('.existing-group,.divider').each(function(){
			$(this).remove();
		});
		menu.find('.existing-group').each(function(){
			$(this).remove();
		});
		
		var lastEl_ctx = menu.find('#nodeContextMenu-add-to-new-group').parent('li');
		var lastEl = menu.find('#nodeMenu-add-to-new-group').parent('li');

		if (groupsList && groupsList.length){
			groupsList.sort(function(a, b) {
				var tA = a.text.toUpperCase(); // ignore upper and loadd-to-new-groupwercase
				var tB = b.text.toUpperCase(); // ignore upper and lowercase
				if (tA < tB) return -1;
				if (tA > tB) return 1;
				// texts must be equal
				return 0;
			});

			groupsList.forEach(function(g){
				var text = g.text.split(/\r\n|\r|\n/),
					li_ctx = '<li class="existing-group"><a tabindex="-1" href="#" id="nodeContextMenu-add-to-existing-group-' + g.id + '">',
					li = '<li class="existing-group"><a tabindex="-1" href="#" id="nodeMenu-add-to-existing-group-' + g.id + '">';
				li_ctx += text[0];
				li += text[0];
				if (text.length > 1) {
					li_ctx += '...</a></li>';
					li += '...</a></li>';
				}
				lastEl_ctx.before(li_ctx);
				lastEl.before(li);
			});
			lastEl_ctx.before('<li class="divider"></li>');

			menu_ctx.on(isTouchDevice ? 'touchstart' : 'click', '.existing-group a', function(){
				var el = this,
					$el = $(this),
					id = $el.attr('id').substring(38);
				var el = util.getAncestorByClass(el, 'dropdown-menu');
				if (el)
					$(el).hide();
				nodeCtxMenu.hide();

				callback(id);
			});

			menu.on(isTouchDevice ? 'touchstart' : 'click', '.existing-group a', function(){
				var el = this,
					$el = $(this),
					id = $el.attr('id').substring(31);
				nodeMenu.collapse('toggle');
				nodeMenu.one('hidden.bs.collapse', function(){
					callback(id);
				});
			});
		}
	};

	function updateRemoveFromGroupsItem(groupsList, callback){
		callback = callback || function(){};
		var $li_ctx = $('#nodeContextMenu-remove-from-group').parent('li'),
			menu_ctx = $li_ctx.find('.dropdown-menu');
		var $li = $('#nodeMenu-remove-from-group').parent('li'),
			menu = $li.find('.dropdown-menu');

		menu_ctx.off(isTouchDevice ? 'touchstart' : 'click', '.existing-group a');
		menu.off(isTouchDevice ? 'touchstart' : 'click', '.existing-group a');

		// remove last groups list
		menu_ctx.find('.existing-group').each(function(){
			$(this).remove();
		});
		menu.find('.existing-group').each(function(){
			$(this).remove();
		});
		
		if (groupsList && groupsList.length){
			groupsList.sort(function(a, b) {
				var tA = a.text.toUpperCase(); // ignore upper and loadd-to-new-groupwercase
				var tB = b.text.toUpperCase(); // ignore upper and lowercase
				if (tA < tB) return -1;
				if (tA > tB) return 1;
				// texts must be equal
				return 0;
			});

			groupsList.forEach(function(g){
				var text = g.text.split(/\r\n|\r|\n/),
					li_ctx = '<li class="existing-group"><a tabindex="-1" href="#" id="nodeContextMenu-remove-from-existing-group-' + g.id + '">',
					li = '<li class="existing-group"><a tabindex="-1" href="#" id="nodeMenu-remove-from-existing-group-' + g.id + '">';
				li_ctx += text[0];
				li += text[0];
				if (text.length > 1){
					li_ctx += '...</a></li>';
					li += '...</a></li>';
				}
				menu_ctx.append(li_ctx);
				menu.append(li);
			});
			
			menu_ctx.on(isTouchDevice ? 'touchstart' : 'click', '.existing-group a', function(){
				var el = this,
					$el = $(this),
					id = $el.attr('id').substring(43);
				el = util.getAncestorByClass(el, 'dropdown-menu');
					el = el.parentNode;
				if (el)
					$(el).hide();
				nodeCtxMenu.hide();

				callback(id);
			});

			menu.on(isTouchDevice ? 'touchstart' : 'click', '.existing-group a', function(){
				var el = this,
					$el = $(this),
					id = $el.attr('id').substring(36);
				nodeMenu.collapse('toggle');
				nodeMenu.one('hidden.bs.collapse', function(){
					callback(id);
				});
			});

			$li_ctx.find('#nodeContextMenu-remove-from-group').removeClass('disabled');
			$li.find('#nodeMenu-remove-from-group').removeClass('disabled');
			return;
		}
		$li_ctx.find('#nodeContextMenu-remove-from-group').addClass('disabled');
		$li.find('#nodeMenu-remove-from-group').addClass('disabled');
	};

	function resetNodeMenu(){
		if (nodeCtxMenu && nodeCtxMenu.html() !== undefined){
			nodeCtxMenu.off(isTouchDevice ? 'touchstart' : 'click', 'a');
			if (nodeCtxMenu.viewport){
				$(nodeCtxMenu.viewport).off(isTouchDevice ? 'touchstart' : 'contextmenu');
				nodeCtxMenu.viewport = null;
			}
		}
		if (nodeMenu && nodeMenu.html() !== undefined){
			nodeMenu.off(isTouchDevice ? 'touchstart' : 'click', 'a');
			if (nodeMenu.viewport){
				$(nodeMenu.viewport).off(isTouchDevice ? 'touchstart' : 'contextmenu');
				nodeMenu.viewport = null;
			}
		}
	};

	function _addEventsToNode(d3selection, d3container, cfg){
		if (!d3selection || d3selection.empty())
			return;

		nodeCtxMenu.viewport = d3container.node();
		nodeMenu.viewport = d3container.node();

		cfg = cfg || {};
		var getSelectionCount = cfg.getSelectionCount;
		var updateItems = cfg.updateItems;

		d3selection.on(isTouchDevice ? 'touchstart' : 'contextmenu', function(node){
			var popup = $('#node-popup');		
			['id', 'name', 'surname', 'description', 'sex'].forEach(function(name){
				var value = node[name];
				var field = popup.find('#input-' + name);
				if (field)
					field.val(value);
				if (field.attr('id') == 'input-sex')
					field.trigger('change');
			});

			if (updateItems)
				updateItems();

			var viewport = $('#viewport');
			if (viewport.width() < ctxMenuMaxSize.width || viewport.height() < ctxMenuMaxSize.height){
				hide();
				nodeMenu.nodeId = node.id;
				setTimeout(function(){ 
					if (getSelectionCount){
						var count = getSelectionCount();
						nodeMenu.find('#nodeMenu-selection').html( getSelectionCount() + ' ' + dictionary.get('selectedItems'));
					}
					nodeMenu.collapse('toggle'); 
				}, 0);
				return;
			}

			d3.event.preventDefault();
			
			nodeCtxMenu.nodeId = node.id;
			var p = util.getPosition(d3.event);
			var x = p[0], y = p[1];

			nodeCtxMenu.css({
				left: x,
				top: y
			});
			
			_setCtxMenuPosition(nodeCtxMenu, x, y, d3container);

			setTimeout(function(){
				if (getSelectionCount){
					var count = getSelectionCount();
					nodeCtxMenu.find('#nodeContextMenu-selection').html( getSelectionCount() + ' ' + dictionary.get('selectedItems'));
				}
			}, 0);

			nodeCtxMenu.slideDown({duration: 200});
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

	function addEvents(type, object, container, cfg){
		hide();
		if (type == 'group')
			_addEventsToGroup(object, container, cfg);
		else if (type == 'node'){
			_addEventsToNode(object, container, cfg);
		} else {
			_addEventsToBackground(object, container);
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
		if (bgCtxMenu && bgCtxMenu.length)
			bgCtxMenu.hide();
		if (bgMenu && bgMenu.length && bgMenu.is(':visible')){
			bgMenu.collapse('toggle');
		}
		if (nodeCtxMenu && nodeCtxMenu.length){
			nodeCtxMenu.hide();
			nodeCtxMenu.nodeId = null;
		}
		if (nodeMenu  && nodeMenu.length && nodeMenu.is(':visible')){
			nodeMenu.collapse('toggle');
			nodeMenu.nodeId = null;
		}
		if (groupCtxMenu  && groupCtxMenu.length){
			groupCtxMenu.hide();
			groupCtxMenu.groupId = null;
		}
		if (groupMenu  && groupMenu.length && groupMenu.is(':visible')){
			groupMenu.collapse('toggle');
			groupMenu.groupId = null;
		}
	}

	return {
		initBackgroundMenu: initBackgroundMenu,
		initGroupMenu: initGroupMenu,
		initNodeMenu: initNodeMenu,
		addEvents: addEvents,
		updateAddToGroupsItem: updateAddToGroupsItem,
		updateRemoveFromGroupsItem: updateRemoveFromGroupsItem,
		hide: hide,
		getContextMenu: getContextMenu,
		enableLinkToPartner: enableLinkToPartner,
		disableLinkToPartner: disableLinkToPartner,
		reset: resetContextMenus
	}
};
