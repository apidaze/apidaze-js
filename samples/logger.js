// eslint-disable-next-line
const defaultBehaviour = console.log;

// eslint-disable-next-line
console.log = (...args) => {
  defaultBehaviour(...args);
  document.getElementById("output").appendChild(document.createTextNode(args.join("")));
  document.getElementById("output").appendChild(document.createElement("br"));
}
