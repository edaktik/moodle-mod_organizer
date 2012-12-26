M.mod_organizer = {};

M.mod_organizer.init_mod_form = function (Y, activatecheckbox) {
	function check_group_members_only(e) {
		var groupcheckbox = e.target;
	    var groupmembersonlycheckbox = Y.one('#id_groupmembersonly');

	    if (groupmembersonlycheckbox) {
	    	groupmembersonlycheckbox.set('checked', groupcheckbox.get('checked'));
	    }
	    
	}
	
	Y.one('#id_isgrouporganizer').on('change', check_group_members_only);
	
	if (activatecheckbox) {
		Y.one('#id_enableuntil_enabled').simulate('click');
	}
}

M.mod_organizer.init_add_form = function (Y) {
	var form = Y.one('#mform1');
	
	Y.config.win.scrollTo(
			form.one('[name=scrollx]').get('value'), 
			form.one('[name=scrolly]').get('value'));
	
	form.on('submit', save_scroll);
	
	function save_scroll() {
		var body = Y.one('body');
		body.plug(Y.Plugin.ScrollInfo);
		var info = body.scrollInfo.getScrollInfo();
	    form.one('[name=scrollx]').set('value', info.scrollLeft);
	    form.one('[name=scrolly]').set('value', info.scrollTop);
	}
}

M.mod_organizer.init_edit_form = function (Y, imagepaths) {
	function detect_change() {
	    var name = this.get('name').split("[")[0];
	    set_modfield(name, 1);
	    set_icon(name, 'changed');
	}
	
	function set_modfield(name, value) {
		Y.all("#mform1 input[name^=mod_" + name + "]").set('value', value);
	}
	
	function set_icon(name, type) {
		var icons = Y.all("#mform1 img[name$=" + name + "_warning]");

		if (type == 'warning') {
			icons.set('src', imagepaths['warning']);
	        icons.set('title', M.util.get_string('warningtext1', 'organizer'));
		} else if (type == 'changed') {
			icons.set('src', imagepaths['changed']);
	        icons.set('title', M.util.get_string('warningtext2', 'organizer'));
		} else {
			// do nothing
		}
	}
	
	var initialstate;
	
	function toggle_hidden_field(e) {
		var parent = e.target.ancestor();
		if (typeof initialstate == 'undefined') {
			initialstate = e.target.get('checked');
		}
		Y.all('#mform1 [name^=availablefrom]:not([name*=now])').set('disabled', e.target.get('checked'));
	    if(e.target.get('checked')) {
	        Y.Node.create('<input />')
	            .set('type', 'hidden')
	            .set('name', 'availablefrom')
	            .set('value', '0')
	            .appendTo(parent);
	    } else {
	        var hidden = Y.one('#mform1 input[name=availablefrom]');
	        if (hidden) {
	        	hidden.remove();
	        }
	    }
	}
	
	function reset_edit_form(e) {
		set_modfield('', 0);
	    set_icon('', 'warning');
	    Y.all('#mform1 [name^=availablefrom]:not([name*=now])').set('disabled', initialstate);
	}
	
	Y.one('#mform1').delegate('change', detect_change, 'select, input[type=checkbox]');
	Y.one('#mform1').delegate('keydown', detect_change, 'input[type=text], textarea');
	Y.one('#id_availablefrom_now').on('change', toggle_hidden_field);
	Y.one('#id_editreset').on('click', reset_edit_form);
	
	toggle_hidden_field({'target' : Y.one('#id_availablefrom_now')});
}

M.mod_organizer.init_eval_form = function (Y) {
	function toggle_all(e) {
	    var checked = e.target.get('checked');    
	    var sender_class = e.target.getAttribute('class').match(/allow\d+/g)[0];
	    
	    Y.all('input.' + sender_class).each(function (node) {
	    	node.set('value', checked ? 1 : 0);
	    });
	}
	
	Y.all('[name*=allownewappointments]').each(function (node) {
		node.on('click', toggle_all);
	});
}

M.mod_organizer.init_checkboxes = function (Y) {
	function organizer_check_all(e) {
		var checked = e.target.get('checked');
		var table = Y.one('#slot_overview');
		
		var hidden = [];
		var visible = [];
		
		table.one('tbody').all('tr').each(function(node) {
		    if ((node.get('offsetWidth') === 0 && node.get('offsetHeight') === 0) || node.get('display') === 'none') {
		    	node.all('input[type=checkbox]').set('checked', false);
		    } else {
		    	node.all('input[type=checkbox]').set('checked', checked);
		    }
		});
		
		table.one('thead').all('input[type=checkbox]').set('checked', checked);
		table.one('tfoot').all('input[type=checkbox]').set('checked', checked);
	}
	
	Y.one('#slot_overview thead').all('input[type=checkbox]').on('click', organizer_check_all);
	Y.one('#slot_overview tfoot').all('input[type=checkbox]').on('click', organizer_check_all);
}

M.mod_organizer.init_infobox = function (Y) {
	function toggle_past_slots(e) {
		var tablebody = Y.one('#slot_overview tbody');
		var showpastslots = Y.one('#show_past_slots').get('checked');
	    var showmyslotsonly = Y.one('#show_my_slots_only').get('checked');
	    
	    if(showpastslots) {
	        if(showmyslotsonly) {
	        	tablebody.all('tr.past_due.my_slot').show();
	        } else {
	        	tablebody.all('tr.past_due').show();
	        }
	    } else {
	    	tablebody.all('tr.past_due').hide();
	    }
	    
	    toggle_info();
	    
	    M.util.set_user_preference('mod_organizer_showpasttimeslots', (showpastslots));
	    
	}

	function toggle_other_slots(e) {
		var tablebody = Y.one('#slot_overview tbody');
		var showpastslots = Y.one('#show_past_slots').get('checked');
	    var showmyslotsonly = Y.one('#show_my_slots_only').get('checked');
	    
	    if(!showmyslotsonly) {
	        if(showpastslots) {
	        	tablebody.all('tr:not(.info)').show();
	        } else {
	        	tablebody.all('tr:not(.info):not(.past_due)').show();
	        }
	    } else {
	    	tablebody.all('tr:not(.info):not(.my_slot)').hide();
	    }
	    
	    toggle_info();
	    
	    M.util.set_user_preference('mod_organizer_showmyslotsonly', (showmyslotsonly));
	}

	function toggle_info() {
		var tablebody = Y.one('#slot_overview tbody');
		var noninforows = tablebody.all('tr:not(.info)');
	    var noneexist = noninforows.size() == 0;
	    var anyvisible = false;
	    
	    noninforows.each(function (node) {
		    if (!((node.get('offsetWidth') === 0 && 
		    		node.get('offsetHeight') === 0) || 
		    		node.get('display') === 'none')) {
		    	anyvisible = true;
		    }
		});
	    
	    var showpastslots = Y.one('#show_past_slots').get('checked');
	    var showmyslotsonly = Y.one('#show_my_slots_only').get('checked');
	    
	    tablebody.all('tr.info').hide();
	    if(!anyvisible) {
	        if(noneexist) {
	        	tablebody.one('tr.no_slots_defined').show();
	        } else if(showpastslots && !showmyslotsonly) {
	        	tablebody.one('tr.no_slots').show();
	        } else if(showpastslots && showmyslotsonly) {
	        	tablebody.one('tr.no_my_slots').show();
	        } else if(!showpastslots && showmyslotsonly) {
	        	tablebody.one('tr.no_due_my_slots').show();
	        } else {
	        	tablebody.one('tr.no_due_slots').show();
	        }
	    }
	}
	
	function toggle_legend() {
	    var legend = Y.one('#infobox_legend_box');

	    if (!((legend.get('offsetWidth') === 0 && legend.get('offsetHeight') === 0) || legend.get('display') === 'none')) {
	        legend.hide();
	    } else {
	        legend.show();
	    }
	}

	Y.one('#show_past_slots').on('click', toggle_past_slots);
	Y.one('#show_my_slots_only').on('click', toggle_other_slots);
	Y.one('#toggle_legend').on('click', toggle_legend);
}

M.mod_organizer.init_popups = function (Y, popups) {
	var title, id, element;
	
	var titles = [M.util.get_string('studentcomment_title', 'organizer'),
	              M.util.get_string('teachercomment_title', 'organizer'),
	              M.util.get_string('teacherfeedback_title', 'organizer')];
	
	Y.one('form[name=viewform]').delegate('mouseover', show_popup, '*[id*=organizer_popup_icon]');
	Y.one('form[name=viewform]').delegate('mouseout', hide_popup, '*[id*=organizer_popup_icon]');	
	
	var popuppanel = new Y.Panel({
        contentBox 		: Y.Node.create('<div id="organizer_popup_panel" />'),
        headerContent	: '<div id="organizer_popup_header" />',
        bodyContent		: '<div id="organizer_popup_body" />',
        width      		: 300,
        zIndex     		: 100,
        centered   		: false,
        modal      		: false,
        visible    		: false
    });
	
	popuppanel.render();
	
	function show_popup() {
	    var posx = 0;
	    var posy = 0;
	
	    if (!e) {
	    	var e = window.event;
	    }
	    
	    if (e.pageX || e.pageY) {
	        posx = e.pageX;
	        posy = e.pageY;
	    } else if (e.clientX || e.clientY) {
	        posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
	        posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
	    }
	    
	    var data = this.get('id').split('_');
	    
	    var title = titles[data[3]];
	    var content = popups[data[3]][data[4]];
	    
	    Y.one('#organizer_popup_header').set('innerHTML', '<h4>' + title + '</h4>');
	    Y.one('#organizer_popup_body').set('innerHTML', '<p>' + content + '</p>');

	    popuppanel.move([posx + 16, posy + 16]);
	    popuppanel.show();
	    
	}
	
	function hide_popup() {
		popuppanel.hide();
	}
}

M.mod_organizer.init_print_form = function (Y) {
	function toggle_column() {
		var column = this.get('id').split('_')[1];
	    var checked = this.get('checked');
	    
	    Y.one("#col_" + column).set('checked', checked);
	    
	    Y.all("[name=" + column + "_cell]").each(function(node) {
	    	if(checked) {
	    		node.show();
	    	} else {
	    		node.hide();
	    	}
	    });
	}
	
	Y.one('#mform1').delegate('change', toggle_column, 'table th input[type=checkbox]');
}