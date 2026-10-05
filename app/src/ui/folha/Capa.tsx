// Capa A4 de um estilo (regra 11): só o nome do estilo e o compositor, no visual do template.
import { Nota, Ondas, Violao } from './Desenhos';

/** Nome do estilo grande; nomes longos ficam menores. Em pt. */
export function tamanhoEstilo(estilo: string): number {
  const letras = Math.max(estilo.trim().length, 1);
  return Math.round(Math.max(40, Math.min(96, (96 * 8) / letras)));
}

export function PaginaCapa({ estilo, compositor }: { estilo: string; compositor: string }) {
  return (
    <article class="fl-pagina fl-capa">
      <Ondas class="fl-ondas" />
      <Violao class="fl-violao fl-violao-capa" />
      <Nota class="fl-nota" />

      <div class="fl-capa-conteudo">
        <div class="fl-sobretitulo">
          <span>Repertório</span>
          <i />
        </div>
        <h1 class="fl-capa-estilo" style={{ fontSize: `${tamanhoEstilo(estilo)}pt` }}>
          {estilo}
        </h1>
        <hr class="fl-divisor" />
        {compositor && (
          <>
            <p class="fl-capa-de">Composições de</p>
            <p class="fl-capa-compositor">{compositor}</p>
          </>
        )}
      </div>
    </article>
  );
}
