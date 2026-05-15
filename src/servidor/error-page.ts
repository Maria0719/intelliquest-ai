export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <title>Error — AprendeIA</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font: 15px/1.5 system-ui, -apple-system, sans-serif; background: #0f0e17; color: #fff; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 28rem; width: 100%; text-align: center; padding: 2rem; }
      h1 { font-size: 1.25rem; margin: 0 0 0.5rem; }
      p { color: #9ca3af; margin: 0 0 1.5rem; }
      .actions { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; }
      a, button { padding: 0.5rem 1rem; border-radius: 0.5rem; font: inherit; cursor: pointer; text-decoration: none; border: 1px solid transparent; }
      .primary { background: #6d4aff; color: #fff; }
      .secondary { background: transparent; color: #fff; border-color: #374151; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Algo salió mal</h1>
      <p>Ocurrió un error inesperado. Puedes intentar recargar la página o volver al inicio.</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">Reintentar</button>
        <a class="secondary" href="/">Volver al inicio</a>
      </div>
    </div>
  </body>
</html>`;
}
