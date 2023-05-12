class Simple extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({ mode: "closed" });
    shadow.innerHTML = "simple";
  }
}

export default Simple;

