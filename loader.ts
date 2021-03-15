import { ansi } from "https://deno.land/x/cliffy/ansi/ansi.ts";
import {infoColor} from "./logger.ts";

const TIME = 100;
const FRAMES = ["⣾","⣽","⣻","⢿","⡿","⣟","⣯","⣷"];

class Loader {
  public running: boolean = false;
  public frame: number = 0;
  private timeout: number | undefined;
  public text: string = "Loading";
  constructor() {
    this.running = false;
  }
  get show() {
    return this.running
  }
  set show(val: boolean) {
    this.running = val;
    if(val) {
      this.frame = 0;
      console.log('');
      this.tick();
    } else {
      console.log(ansi.eraseUp(1).toString())
      if(this.timeout) {
        clearTimeout(this.timeout);
      }
    }
  }
  tick() {
    console.log(
      ansi.cursorPrevLine.text(` ${infoColor(FRAMES[this.frame])} ${this.text}`).toString()
    );
    this.frame = (this.frame + 1) % (FRAMES.length-1)
    if(this.running) {
      this.timeout = setTimeout(this.tick.bind(this), TIME);
    }
  }
}

const loader = new Loader();

export default loader;