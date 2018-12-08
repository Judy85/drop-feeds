/*global FeedsTreeView DefaultValues SideBar browser BrowserManager*/
'use strict';
class FeedsFilterBar { /*exported FeedsFilterBar*/
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._filterEnabled = DefaultValues.filterEnabled;
    this._updateLocalizedStrings();
    document.getElementById('filterField').addEventListener('input', (e) => { this._filterFieldInput_event(e); });
    document.getElementById('filterClearButton').addEventListener('click', (e) => { this._filterClearButtonClicked_event(e); });
  }

  set enabled(enable) {
    this._filterEnabled = enable;
    document.getElementById('filterBar').style.display = enable ? '' : 'none';
    SideBar.instance.resize();
    let filterText = enable ? document.getElementById('filterField').value : '';
    this._applyFilter(filterText);
    if (enable) {
      document.getElementById('filterField').focus(); 
    }
  }

  get enabled() {
    return this._filterEnabled;
  }

  async _updateLocalizedStrings() {
    document.getElementById('filterClearButton').setAttribute('title', browser.i18n.getMessage('sbFilterClearButton'));
  }

  _filterFieldInput_event(event) {
    this._applyFilter(event.target.value);
  }

  _filterClearButtonClicked_event() {
    let filterFieldElm = document.getElementById('filterField');
    filterFieldElm.value = '';
    this._applyFilter('');
    filterFieldElm.focus(); 
  }

  _applyFilter(filterText) {
    try {
      let rootFolderId =  FeedsTreeView.instance.rootFolderUiId;
      let rootFolder = document.getElementById(rootFolderId);
      if (!rootFolder) { return; }
      let feedElementList = [];
      if (filterText == '' ) { 
        feedElementList = [].slice.call(rootFolder.getElementsByTagName('*'));
        feedElementList.map(item => item.style.display = '');
        FeedsTreeView.instance.selectionBar.refresh();
        return; 
      }
      FeedsTreeView.instance.selectionBar.hide();
      let toHideList = BrowserManager.querySelectorAllOnTextContent(rootFolder, 'label, li', filterText, false);
      let toShowLiList = BrowserManager.querySelectorAllOnTextContent(rootFolder, 'label, li', filterText, true);
      let toShowLblList = BrowserManager.querySelectorAllOnTextContent(rootFolder, 'label', filterText, true);
      toHideList.map(item => item.style.display = 'none');
      toShowLiList.map(item => item.style.display = '');
      toShowLblList.map((item) => { 
        let forId = item.getAttribute('for');
        let toShowLblForList = [].slice.call(rootFolder.querySelectorAll('label[for="' + forId + '"]'));
        toShowLblForList.map(lbl => lbl.style.display = '');
      });
    }
    catch (e) {
      /*eslint-disable no-console*/
      console.log(e);
      /*eslint-enable no-console*/
    }
  }

}
