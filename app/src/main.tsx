import { render } from 'preact';
import { App } from './ui/App';
import { APP, somenteCelular, somentePc, usaDispositivo } from './app.config';
import { garantirDadosIniciais, lerConfig, pedirArmazenamentoPersistente } from './dados/repositorio';
import { aplicarTema } from './ui/tema';
import { iniciarSincronizacao } from './sync/motor';
// Fontes da folha impressa (só o alfabeto latino, que inclui os acentos do português)
import '@fontsource/kaushan-script/latin-400.css';
import '@fontsource/montserrat/latin-500.css';
import '@fontsource/montserrat/latin-600.css';
import '@fontsource/montserrat/latin-700.css';
import '@fontsource/lato/latin-400.css';
import './estilos/global.css';
import './estilos/formularios.css';
import './estilos/itens.css';
import './estilos/musicas.css';
import './estilos/folha.css';
import './estilos/ajustes.css';

// Perfil de dispositivos (app.config.ts) → classes que ajustam o layout (ver global.css)
const html = document.documentElement;
html.classList.toggle('so-celular', somenteCelular);
html.classList.toggle('so-pc', somentePc);
html.classList.toggle('com-pc', usaDispositivo('pc'));
html.style.setProperty('--primaria-app', APP.corPrimaria);
document.title = APP.nome;

lerConfig().then((c) => aplicarTema(c.tema));
garantirDadosIniciais().then(() => iniciarSincronizacao());
pedirArmazenamentoPersistente();

render(<App />, document.getElementById('app')!);
