import { isBlank } from 'common';
import { Plugin } from 'obsidian';

console.log('Entrou no app', isBlank);

export default class PluginA extends Plugin {
  onload() {
    console.log('Carregou o PluginA', isBlank(false));
  }

  unload() {
    console.log('Descarregou o PluginA', isBlank(true));
  }
}
