// Desenhos da folha impressa, no estilo do template: violão, ondas do rodapé, nota musical e ícones.
// Cores fixas de propósito: a folha é sempre impressa no visual do template (não segue o tema do app).

const MARINHO = '#101e29';
const DOURADO = '#a8782a';
const DOURADO_CLARO = '#c9a25a';
const CREME = '#efe6d2';

/** Violão em pé (braço para cima); a folha o posiciona girado no canto inferior direito. */
export function Violao(props: { class?: string }) {
  const trastes = Array.from({ length: 13 }, (_, i) => -96 - i * 12.5);
  const cordas = [-5, -3, -1, 1, 3, 5];
  return (
    <svg class={props.class} viewBox="-70 -262 140 390" aria-hidden="true">
      {/* Braço */}
      <rect x="-8" y="-262" width="16" height="190" fill={MARINHO} stroke={DOURADO} stroke-width="1" />
      {trastes.map((y) => (
        <line key={y} x1="-8" x2="8" y1={y} y2={y} stroke={DOURADO_CLARO} stroke-width="0.8" />
      ))}
      {/* Corpo: os contornos dourados primeiro e o preenchimento por cima (fica só a borda de fora) */}
      <g stroke={DOURADO} stroke-width="5">
        <ellipse cx="0" cy="-34" rx="40" ry="42" />
        <ellipse cx="0" cy="48" rx="54" ry="58" />
      </g>
      <g fill={MARINHO}>
        <ellipse cx="0" cy="-34" rx="38.6" ry="40.6" />
        <ellipse cx="0" cy="48" rx="52.6" ry="56.6" />
      </g>
      {/* Filete interno */}
      <g fill="none" stroke={DOURADO} stroke-width="0.6" opacity="0.7">
        <ellipse cx="0" cy="-34" rx="35" ry="37" />
        <ellipse cx="0" cy="48" rx="49" ry="53" />
      </g>
      {/* Boca */}
      <circle cx="0" cy="-2" r="17" fill="#09131b" stroke={DOURADO} stroke-width="1.6" />
      <circle cx="0" cy="-2" r="21" fill="none" stroke={DOURADO} stroke-width="0.7" />
      <circle cx="0" cy="-2" r="23.5" fill="none" stroke={DOURADO} stroke-width="0.7" />
      {/* Cavalete */}
      <rect x="-20" y="66" width="40" height="8" rx="3" fill={DOURADO} />
      <rect x="-14" y="67.5" width="28" height="2" rx="1" fill={CREME} />
      {/* Cordas */}
      {cordas.map((x) => (
        <line key={x} x1={x} x2={x * 1.15} y1="-262" y2="69" stroke={CREME} stroke-width="0.45" />
      ))}
    </svg>
  );
}

/** Ondas do rodapé: faixa azul-marinho com linhas douradas por cima. */
export function Ondas(props: { class?: string }) {
  return (
    <svg class={props.class} viewBox="0 0 210 40" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 31 C 40 22, 75 38, 120 30 S 185 14, 210 18 V40 H0 Z" fill={MARINHO} />
      <g fill="none" stroke={DOURADO} stroke-linecap="round">
        <path d="M0 24 C 45 12, 80 32, 125 22 S 190 6, 210 10" stroke-width="0.35" />
        <path d="M0 27.5 C 45 16, 80 35, 125 25.5 S 190 10, 210 13.5" stroke-width="0.3" opacity="0.8" />
        <path d="M0 20.5 C 50 9, 85 28, 128 18.5 S 192 3, 210 6.5" stroke-width="0.25" opacity="0.6" />
      </g>
    </svg>
  );
}

/** Colcheia dourada (canto inferior esquerdo). */
export function Nota(props: { class?: string }) {
  return (
    <svg class={props.class} viewBox="0 0 24 40" aria-hidden="true">
      <path d="M13 2 v27" stroke={DOURADO} stroke-width="2.2" fill="none" />
      <ellipse cx="8" cy="30" rx="7" ry="5" transform="rotate(-20 8 30)" fill={DOURADO} />
      <path d="M13 2 c1 6 10 7 9 17 c-0.5 -6 -6 -8 -9 -9" fill={DOURADO} />
    </svg>
  );
}

/** Duas colcheias (cabeçalho "Ouça a música"). */
export function NotaDupla(props: { class?: string }) {
  return (
    <svg class={props.class} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 18V5l11-2v13" fill="none" stroke={DOURADO_CLARO} stroke-width="2.4" stroke-linejoin="round" />
      <circle cx="6" cy="18" r="3.2" fill={DOURADO_CLARO} />
      <circle cx="17" cy="16" r="3.2" fill={DOURADO_CLARO} />
    </svg>
  );
}

/** Celular (faixa "Escaneie o QR Code"). */
export function Celular(props: { class?: string }) {
  return (
    <svg class={props.class} viewBox="0 0 24 24" fill="none" stroke={CREME} stroke-width="1.6" aria-hidden="true">
      <rect x="6" y="2" width="12" height="20" rx="2.5" />
      <path d="M10.5 18.5h3" stroke-linecap="round" />
    </svg>
  );
}
