window.CX = window.CX || {};
CX.backendResources = CX.backendResources || {
  items: [],
  async load(){ return this.items; },
  async saveMetadata(item){ return item || {}; }
};
