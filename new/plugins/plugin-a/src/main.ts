import { greet } from "core-module";
import { Notice, Plugin } from "obsidian";

export default class PluginA extends Plugin {
  onload() {
    console.log("Plugin A loaded");

    greet("DooMWhite");
  }

  onunload() {
    console.log("Plugin A unloaded");
  }
}
