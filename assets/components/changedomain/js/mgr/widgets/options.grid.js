changeDomain.grid.Options = function (config) {
    config = config || {};
    if (!config.id) {
        config.id = 'changedomain-options-items';
    }
    Ext.applyIf(config, {
        url: changeDomain.config.connector_url,
        fields: this.getFields(config),
        columns: this.getColumns(config),
        tbar: this.getTopBar(config),
        sm: new Ext.grid.CheckboxSelectionModel(),
        baseParams: {
            action: 'mgr/item/options/getlist',
            domain_id: config.record.id
        },
        listeners: {
            rowDblClick: function (grid, rowIndex, e) {
                var row = grid.store.getAt(rowIndex);
                //this.updateItem(grid, e, row);
            }
        },
        viewConfig: {
            forceFit: true,
            enableRowBody: true,
            autoFill: true,
            showPreview: true,
            scrollOffset: 0,
            // getRowClass: function (rec) {
            //     return !rec.data.active
            //         ? 'changedomain-grid-row-disabled'
            //         : '';
            // }
        },
        paging: true,
        remoteSort: true,
        autoHeight: true,
    });
    changeDomain.grid.Options.superclass.constructor.call(this, config);

    // Clear selection on grid refresh
    this.store.on('load', function () {
        if (this._getSelectedIds().length) {
            this.getSelectionModel().clearSelections();
        }
    }, this);
};
Ext.extend(changeDomain.grid.Options, MODx.grid.Grid, {
    windows: {},

    getMenu: function (grid, rowIndex) {
        var ids = this._getSelectedIds();

        var row = grid.getStore().getAt(rowIndex);
        var menu = changeDomain.utils.getMenu(row.data['actions'], this, ids);

        this.addContextMenuItem(menu);
    },

    createItem: function (btn, e) {
        var w = MODx.load({
            xtype: 'changedomain-options-window-create',
            id: Ext.id(),
            listeners: {
                success: {
                    fn: function () {
                        this.refresh();
                    }, scope: this
                }
            }
        });
        w.reset();
        w.setValues({domain_id: this.config.record.id});
        w.show(e.target);
    },

    removeItem: function () {
        var ids = this._getSelectedIds();
        if (!ids.length) {
            return false;
        }
        MODx.msg.confirm({
            title: ids.length > 1
                ? _('changedomain_option_remove')
                : _('changedomain_option_remove'),
            text: ids.length > 1
                ? _('changedomain_options_remove_confirm')
                : _('changedomain_options_remove_confirm'),
            url: this.config.url,
            params: {
                action: 'mgr/item/options/remove',
                ids: Ext.util.JSON.encode(ids),
            },
            listeners: {
                success: {
                    fn: function () {
                        this.refresh();
                    }, scope: this
                }
            }
        });
        return true;
    },

    getFields: function () {
        return ['id', 'name', 'key', 'value', 'actions'];
    },

    getColumns: function () {
        return [{
            header: _('changedomain_option_id'),
            dataIndex: 'id',
            sortable: true,
            width: 70
        }, {
            header: _('changedomain_option_name'),
            dataIndex: 'name',
            sortable: true,
            width: 100,
        }, {
            header: _('changedomain_option_key'),
            dataIndex: 'key',
            sortable: false,
            width: 100,
        },{
            header: _('changedomain_option_value'),
            dataIndex: 'value',
            sortable: false,
            width: 200,
        },{
            header: _('changedomain_grid_actions'),
            dataIndex: 'actions',
            renderer: changeDomain.utils.renderActions,
            sortable: false,
            width: 100,
            id: 'actions'
        }];
    },

    getTopBar: function () {
        return [{
            text: '<i class="icon icon-plus"></i>&nbsp;' + _('changedomain_option_create'),
            handler: this.createItem,
            scope: this
        }, '->', {
            xtype: 'changedomain-field-search',
            width: 250,
            listeners: {
                search: {
                    fn: function (field) {
                        this._doSearch(field);
                    }, scope: this
                },
                clear: {
                    fn: function (field) {
                        field.setValue('');
                        this._clearSearch();
                    }, scope: this
                },
            }
        }];
    },

    onClick: function (e) {
        var elem = e.getTarget();
        if (elem.nodeName == 'BUTTON') {
            var row = this.getSelectionModel().getSelected();
            if (typeof(row) != 'undefined') {
                var action = elem.getAttribute('action');
                if (action == 'showMenu') {
                    var ri = this.getStore().find('id', row.id);
                    return this._showMenu(this, ri, e);
                }
                else if (typeof this[action] === 'function') {
                    this.menu.record = row.data;
                    return this[action](this, e);
                }
            }
        }
        return this.processEvent('click', e);
    },

    _getSelectedIds: function () {
        var ids = [];
        var selected = this.getSelectionModel().getSelections();

        for (var i in selected) {
            if (!selected.hasOwnProperty(i)) {
                continue;
            }
            ids.push(selected[i]['id']);
        }

        return ids;
    },

    _doSearch: function (tf) {
        this.getStore().baseParams.query = tf.getValue();
        this.getBottomToolbar().changePage(1);
    },

    _clearSearch: function () {
        this.getStore().baseParams.query = '';
        this.getBottomToolbar().changePage(1);
    },
});
Ext.reg('changedomain-options-items', changeDomain.grid.Options);
