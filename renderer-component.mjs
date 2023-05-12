const sym = "render-target";

// simply put I want to avoid collisions and the custom registry polyfill
// did not appear to work!
class Counter {
  #iterations = 0;

  get current() {
    return this.#iterations;
  }

  incr() {
    this.#iterations++;
  }
}

class Renderer extends HTMLElement {
  static instanceCounter = new Counter();
  counter = new Counter();

  static get observedAttributes() {
    return ["ref"];
  }

  constructor() {
    super();
    Renderer.instanceCounter.incr();
    this.attachShadow({ mode: "open" });
  }

  get #instanceCount() {
    return Renderer.instanceCounter.current;
  }

  get #name() {
    return `${sym}-v${this.#instanceCount}.${this.counter.current}`;
  }

  async #render() {
    const { default: Component } = await import(this.attributes.ref.value);
    customElements.define(this.#name, Component);
    this.shadowRoot.innerHTML = `<${this.#name} />`;
  }

  attributeChangedCallback() {
    this.counter.incr();
    this.#render();
  }
}

export default Renderer;
