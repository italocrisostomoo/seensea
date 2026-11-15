// Distingue "voltar/avançar" (popstate) de uma navegação nova. O popstate marca a
// próxima montagem como travessia; qualquer interação do usuário depois disso
// (clique, tecla) desfaz a marca, para que ela não "vaze" para uma navegação nova.
let traversal = false;
let installed = false;

export function trackTraversals(): void {
  if (installed || typeof window === 'undefined') return;
  installed = true;
  window.addEventListener('popstate', () => {
    traversal = true;
  });
  const clear = () => {
    traversal = false;
  };
  window.addEventListener('pointerdown', clear, true);
  window.addEventListener('keydown', clear, true);
}

// Lê e consome a marca: só a primeira leitura após o popstate vê `true`.
export function consumeTraversal(): boolean {
  const was = traversal;
  traversal = false;
  return was;
}
