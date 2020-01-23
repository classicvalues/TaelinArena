// HTML Rendering
const {Component, render} = require("inferno");
const h = require("inferno-hyperscript").h;
const oct = require("./octree.js");
const canvox = require("./canvox.js");
const TA = require("./TaelinArena.js");
const extra = require("./extra.js");
const ethers = require("ethers");
const request = require("xhr-request-promise");
const Register = require("./register.js");
const post = (func, body) => {
  return request("/"+func, {method:"POST",body,json:true});
};

class Main extends Component {
  constructor(props) {
    super(props)
    this.modal = null;
    this.name = null;
    this.wlet = null;
  }
  componentDidMount() {
  }
  render() {
    if (this.modal) {
      return this.modal;
    }

    const button = (content, onclick) => {
      return h("span", {
        style: {
          cursor: "pointer",
        },
        onclick
      }, content);
    };

    var title = h("div", {
      style: {
        "font-size": "16px"
      },
    }, "Taelin::Arena");

    if (this.name) {
      var login = h("div", {
        onClick: () => {
          if (confirm("Clique OK para deslogar.")) {
            this.wlet = null;
            this.name = null;
            this.forceUpdate();
          }
        },
        style: {
          "cursor": "pointer",
          "font-size": "12px"
        },
      }, [this.name]);
    } else {
      var login = h("div", {
        style: {
          "font-size": "12px"
        },
      }, [
        button("Logar", () => {
          var pvt = prompt("Digite sua chave privada:");
          if (pvt && pvt.length===66 || pvt.length===64) {
            window.account = new ethers.Wallet(pvt);

          } else {
            alert("Tá errado isso ae. Você não guardou né?");
          }
        }),
        h("span", {}, " | "),
        button("Registrar", () => {
          this.modal = h(Register, {
            ondone: ({name,wlet}) => {
              this.wlet = wlet;
              this.name = name;
              this.modal = null;
              this.forceUpdate();
            }
          });
          this.forceUpdate();
        }),
      ]);
    };

    return h("div", {
      style: {
        "position": "absolute",
        "background": "#4070D0",
        "height": "24px",
        "display": "flex",
        "flex-flow": "row nowrap",
        "justify-content": "space-between",
        "align-items": "center",
        "width": "100%",
        "font-size": "18px",
        "font-family": "monaco, monospace",
        "padding": "0px 4px",
        "font-weight": "bold",
        "color": "white",
      },
      onClick: () => {
      }
    }, [
      title,
      login,
    ])
  }
};

window.onload = () => {
  // Renders site using Inferno
  render(h(Main), document.getElementById("main"));

  // Creates canvas and inserts on page
  var canvas = canvox();
  document.body.appendChild(canvas);

  // Keys that are pressed
  var key = {};
  var refresh_game_pad = () => {
    var key_d = key.d||0;
    var key_a = key.a||0;
    var key_w = key.w||0;
    var key_s = key.s||0;
    var event = t => {
      var id = 0;
      var dir = t => {
        var x = (key_d||0) - (key_a||0);
        var y = (key_w||0) - (key_s||0);
        var z = 0;
        return t(x)(y)(0);
      }
      return t(id)(dir);
    };
    game = TA.input_game(event)(game);
  };
  document.body.onkeyup = (e) => {
    key[e.key] = 0;
    refresh_game_pad();
  };
  document.body.onkeypress = (e) => {
    key[e.key] = 1;
    refresh_game_pad();
  };

  // FPS metering
  var last_fps_print = extra.now();
  var fps_count = 0;

  // Initial state of the game
  var game = TA.demo_game;

  // Main loop of the game
  setInterval(function main_loop() {
    // Updates the FPS counter
    ++fps_count;
    if (extra.now() > last_fps_print + 1) {
      document.title = "FPS " + fps_count;
      fps_count = 0;
      last_fps_print = extra.now();
    };

    // Renders game to canvas
    TA.render_game(game, canvas);

    // Updates game state
    game = TA.tick_game(game);

  }, 1000 / 24);
};

const name = "x" + Math.floor(Math.random()*65536);
console.log("I'm " + name);
const SimplePeer = require("simple-peer");
const peer = new SimplePeer({initiator:false,trickle:false});
post("offer",{name}).then(data => peer.signal(data));
peer.on('error', err => console.log('error', err))
peer.on('signal', data => post("answer", {name,data}));
peer.on('connect', () => {});
peer.on('data', data => console.log(""+data));
window.say = msg => peer.send(msg);
