/* global browser*/
'use strict';
class RenderPage {
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    let trList = document.querySelectorAll('tr');
    for (let tr of trList) {
      if (tr.cells[0].tagName == 'TH') continue;
      tr.addEventListener('click', (e) => { this.rowOnclickEvent(e); });
      let url = tr.cells[0].childNodes[0].getAttribute('url');
      this.storageGet(url, 'unread').then((state) => {
        if (state == 'read') { tr.classList.add('read'); } else { tr.classList.remove('read'); }
      });
    }

    document.addEventListener('keyup', (e) => { this.rowOnkeyUpEvent(e); });
    document.addEventListener('mousemove', (e) => { this.splitterBarMousemove_event(e); });
    document.addEventListener('mouseup', (e) => { this.splitterBarMouseup_event(e); });
    document.getElementById('splitterBar').addEventListener('mousedown', (e) => { this.splitterBarMousedown_event(e); });


  }

  rowOnclickEvent(e) {
    let tr = this.getTr(e.target);
    this.selectRow(tr);
    this.displayItem(tr.cells[0].childNodes[0].textContent);
    if (e.target.cellIndex == 2) {
      this.switchRawReadState(tr);
    }
    else {
      this.setRawAsRead(tr);
    }
  }

  rowOnkeyUpEvent(e) {
    if (e.defaultPrevented) { return; }
    let dir = 0;
    switch (e.key) {
      case 'ArrowDown':
        dir = 1;
        e.preventDefault();
        break;
      case 'ArrowUp':
        dir = -1;
        e.preventDefault();
        break;
      default:
        return;
    }

    let currentTr = document.querySelectorAll('.selected')[0];
    if (!currentTr) { return; }

    let nextTr = currentTr.parentNode.rows[currentTr.rowIndex + dir];
    if (nextTr.cells[0].tagName == 'TH') nextTr = undefined;
    if (!nextTr) { return; }
    
    this.selectRow(nextTr);
    this.displayItem(nextTr.cells[0].childNodes[0].textContent);
    if (e.target.cellIndex == 2) {
      this.switchRawReadState(nextTr);
    }
    else {
      this.setRawAsRead(nextTr);
    }
  }

  getTr(target) {
    let tr = target;
    while (tr && tr.tagName != 'TR') {
      tr = tr.parentNode;
    }
    return tr;
  }

  setRawAsRead(tr) {
    tr.classList.add('read');
    let itemLink = tr.cells[0].childNodes[0].getAttribute('url');
    this.storageSet(itemLink, 'read');
  }

  setRawAsUnread(tr) {
    tr.classList.remove('read');
    let itemLink = tr.cells[0].childNodes[0].getAttribute('url');
    this.storageSet(itemLink, 'unread');
  }


  switchRawReadState(tr) {
    if (tr.classList.contains('read')) {
      this.setRawAsUnread(tr);
    }
    else {
      this.setRawAsRead(tr);
    }
  }

  selectRow(selectedTr) {
    let trList = document.querySelectorAll('tr');
    for (let tr of trList) {
      tr.classList.remove('selected');
    }
    selectedTr.classList.add('selected');
  }

  displayItem(itemNumber) {
    let itemList = document.getElementsByClassName('item');
    for (let item of itemList) {
      item.classList.remove('displayBlock');
    }
    document.getElementById('item' + itemNumber).classList.add('displayBlock');
  }

  async splitterBarMouseup_event() {
    this._isResizing = false;
  }

  async splitterBarMousedown_event(event) {
    this._isResizing = true;
    this._lastDownY = event.clientY;
  }

  async splitterBarMousemove_event(event) {
    if (!this._isResizing) { return; }
    let delta = event.clientY - this._lastDownY;
    this._lastDownY = event.clientY;
    this.resizeTopPanel(delta);
  }

  resizeTopPanel(delta) {
    let topPanel = document.getElementById('topPanel');
    let maxHeigh = (window.innerHeight - document.getElementById('channelHead').offsetHeight - document.getElementById('splitterBar').offsetHeight) - 1;
    topPanel.style.height = Math.min(Math.max(topPanel.offsetHeight + delta, 0), maxHeigh) + 'px';
  }

  async storageGet(valueName, defaultValue) {
    let value = defaultValue;
    let storedValue = (await browser.storage.local.get(valueName))[valueName];
    if (typeof storedValue != 'undefined') {
      value = storedValue;
    }
    return value;
  }

  async storageSet(valueName, value) {
    await browser.storage.local.set({ [valueName]: value });
  }

}
RenderPage.instance;