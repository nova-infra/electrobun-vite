import {
  starterVersions,
  templatePackages,
  workspacePackages,
} from "@electrobun-vite/shared";

export function App() {
  const previewImage = `${import.meta.env.BASE_URL}app-preview.png`;

  return (
    <div className="page-shell">
      <header className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Bun workspace for desktop tooling</p>
          <h1>electrobun-vite</h1>
          <p className="lede">
            A workspace that splits the Electrobun toolchain, starter templates,
            and docs site into clear modules, with React 19 and Vite 8 as the
            default front-end path.
          </p>
        </div>
        <img
          alt="Electrobun React Vite starter preview"
          className="preview"
          src={previewImage}
        />
      </header>

      <main className="content">
        <section className="panel">
          <h2>Packages</h2>
          <div className="card-grid">
            {workspacePackages.map((pkg) => (
              <article className="card" key={pkg.name}>
                <strong>{pkg.name}</strong>
                <p>{pkg.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <h2>Templates</h2>
          <div className="card-grid">
            {templatePackages.map((template) => (
              <article className="card" key={template.name}>
                <strong>{template.name}</strong>
                <p>{template.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="panel panel-accent">
          <h2>Default starter versions</h2>
          <ul className="version-list">
            <li>
              <code>electrobun</code>: {starterVersions.electrobun}
            </li>
            <li>
              <code>react</code>: {starterVersions.react}
            </li>
            <li>
              <code>react-dom</code>: {starterVersions.reactDom}
            </li>
            <li>
              <code>vite</code>: {starterVersions.vite}
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}
