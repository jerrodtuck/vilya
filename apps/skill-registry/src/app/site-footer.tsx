// App chrome: site-wide footer (copyright + source link).
const REPO_URL = "https://github.com/jerrodtuck/vilya";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="sitefoot">
      <div className="sitefoot-inner">
        <p className="sitefoot-copy">
          © {year} Jerrod Tuck. All rights reserved.
        </p>
        <a
          className="sitefoot-link"
          href={REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
      </div>
    </footer>
  );
}
