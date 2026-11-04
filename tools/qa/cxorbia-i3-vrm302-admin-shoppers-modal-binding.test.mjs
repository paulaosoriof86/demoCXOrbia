import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source = readFileSync(new URL('../../app/modules/shoppers.js', import.meta.url), 'utf8');
const begin = source.indexOf('    const bindRows=()=>{');
const end = source.indexOf('    const renderRowsDom=', begin);
assert.ok(begin >= 0 && end > begin, 'Admin Shoppers bindRows owner not found');
const bindRowsSource = source.slice(begin, end);

function fakeNode(dataset) {
  return {
    dataset,
    checked: false,
    listeners: new Map(),
    addEventListener(name, listener) {
      const arr = this.listeners.get(name) || [];
      arr.push(listener);
      this.listeners.set(name, arr);
    },
    fire(name, event = {}) {
      for (const listener of this.listeners.get(name) || []) listener(event);
    }
  };
}

function fixture() {
  const state = {
    rows: [fakeNode({ sid: 'shopper-1' })],
    boxes: [fakeNode({ selectShopper: 'shopper-1' })],
    opened: [],
    selectionUpdates: 0,
    selected: new Set()
  };
  const document = {
    querySelectorAll(selector) {
      if (selector === '#shBody [data-sid]') return state.rows;
      if (selector === '#shBody [data-select-shopper]') return state.boxes;
      return [];
    }
  };
  const bindRows = vm.runInNewContext(bindRowsSource + '\nbindRows;', {
    document,
    data: { getShopper: id => ({ id }) },
    profileModal: shopper => state.opened.push(shopper.id),
    selectedShopperIds: state.selected,
    updateSelectionBar: () => state.selectionUpdates++
  });
  return { state, bindRows };
}

test('VRM-302 repeated Admin Shopper module mounts bind a row and checkbox once', () => {
  const { state, bindRows } = fixture();
  bindRows();
  bindRows();
  bindRows();
  assert.equal(state.rows[0].listeners.get('click').length, 1);
  assert.equal(state.boxes[0].listeners.get('change').length, 1);
  state.rows[0].fire('click', { target: { closest: () => null } });
  assert.deepEqual(state.opened, ['shopper-1']);
  state.rows[0].fire('click', { target: { closest: () => true } });
  assert.equal(state.opened.length, 1, 'checkbox click must not open a profile');
  state.boxes[0].checked = true;
  state.boxes[0].fire('change');
  assert.equal(state.selectionUpdates, 1);
  assert.equal(state.selected.has('shopper-1'), true);
});

test('VRM-302 source binder remains single-instance after list rerender', () => {
  const { state, bindRows } = fixture();
  bindRows();
  state.rows = [fakeNode({ sid: 'shopper-2' })];
  state.boxes = [fakeNode({ selectShopper: 'shopper-2' })];
  bindRows();
  bindRows();
  assert.equal(state.rows[0].listeners.get('click').length, 1);
  assert.equal(state.boxes[0].listeners.get('change').length, 1);
  state.rows[0].fire('click', { target: { closest: () => null } });
  assert.deepEqual(state.opened, ['shopper-2']);
  state.boxes[0].checked = true;
  state.boxes[0].fire('change');
  assert.equal(state.selectionUpdates, 1);
  assert.equal(state.selected.has('shopper-2'), true);
});
