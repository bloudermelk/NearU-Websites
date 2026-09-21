/**
 * Styles for the landing homepage (LandingHome.tsx). Inlined in a <style> on
 * the page, like `page-layout-css` on mirrored pages, so the entry visit needs
 * no extra request.
 *
 * Everything is scoped under `.lp` (the <main> element) so it neither leaks
 * into the theme header/footer nor inherits the theme's heading/list/link
 * defaults. Colors come from the brand's --wp--preset--color-- variables in
 * theme.css, so the same component matches every brand's palette.
 */
export const LANDING_CSS = `
.lp{
  --lp-accent:var(--wp--preset--color--primary,#de252c);
  --lp-accent-dark:var(--wp--preset--color--primary-active,#b33330);
  --lp-ink:var(--wp--preset--color--secondary,#1a1a1a);
  --lp-ink-2:var(--wp--preset--color--gray-dark,#323232);
  --lp-muted:#6b6b6b;--lp-line:#e6e6e6;--lp-paper:#fff;--lp-paper-2:#f7f6f3;
  --lp-green:var(--wp--preset--color--check-green,#5AC5A2);--lp-gold:#f5b301;
  --lp-font:var(--wp--preset--font-family--primary,Roboto,system-ui,sans-serif);
  --lp-cond:var(--wp--preset--font-family--secondary,"Roboto Condensed",system-ui,sans-serif);
  --lp-r:14px;--lp-r-lg:22px;--lp-shadow:0 10px 30px rgba(0,0,0,.10);--lp-shadow-lg:0 30px 60px -20px rgba(0,0,0,.35);
  --lp-max:1200px;
  font-family:var(--lp-font);color:var(--lp-ink);background:var(--lp-paper);line-height:1.55;font-size:17px;
}
.lp *,.lp *::before,.lp *::after{box-sizing:border-box}
.lp img{display:block;max-width:100%;height:auto}
.lp a{color:inherit}
.lp p,.lp figure,.lp blockquote{margin:0}
.lp ul{list-style:none;margin:0;padding:0}
.lp h1,.lp h2,.lp h3,.lp h4{margin:0;font-family:var(--lp-font);line-height:1.12;letter-spacing:-.015em;text-transform:none;text-wrap:balance}
.lp h1{font-size:clamp(2.1rem,4.6vw,3.6rem);font-weight:700}
.lp h2{font-size:clamp(1.7rem,3.2vw,2.5rem);font-weight:700}
.lp h3{font-size:1.2rem;font-weight:700}
.lp-wrap{width:min(var(--lp-max),calc(100% - 2.5rem));margin-inline:auto}
.lp .i{width:1em;height:1em;fill:currentColor;flex:none;display:inline-block;vertical-align:-.1em}
.lp-eyebrow{display:block;font-family:var(--lp-cond);font-weight:600;text-transform:uppercase;letter-spacing:.14em;font-size:.8rem;color:var(--lp-accent)}
.lp-lead{font-size:1.12rem;color:var(--lp-ink-2);max-width:60ch}
.lp-center{text-align:center}
.lp-center .lp-lead{margin-inline:auto}
.lp-section{padding-block:clamp(3.5rem,7vw,6rem)}
.lp-head{max-width:720px;margin-bottom:clamp(2rem,4vw,3rem);display:grid;gap:.75rem}
.lp-head.lp-center{margin-inline:auto}
.lp-stars{color:var(--lp-gold);letter-spacing:.06em;font-size:1.05em}

/* buttons */
.lp .btn{display:inline-flex;align-items:center;justify-content:center;gap:.6rem;font-family:var(--lp-font);font-weight:700;font-size:1rem;text-transform:none;letter-spacing:0;border-radius:999px;padding:.95rem 1.5rem;text-decoration:none;border:2px solid transparent;transition:transform .15s,box-shadow .15s,background .15s;cursor:pointer;line-height:1;white-space:nowrap}
.lp .btn:hover{transform:translateY(-1px)}
.lp .btn .i{font-size:1.1em}
.lp .btn-red{background:var(--lp-accent);color:#fff;box-shadow:0 8px 24px -8px rgba(0,0,0,.45)}
.lp .btn-red:hover{background:var(--lp-accent-dark);color:#fff}
.lp .btn-dark{background:var(--lp-ink);color:#fff}
.lp .btn-dark:hover{background:#000;color:#fff}
.lp .btn-ghost{background:transparent;color:#fff;border-color:rgba(255,255,255,.5)}
.lp .btn-ghost:hover{border-color:#fff;background:rgba(255,255,255,.08);color:#fff}
.lp .btn-outline{background:#fff;color:var(--lp-ink);border-color:var(--lp-ink)}
.lp .btn-outline:hover{background:var(--lp-ink);color:#fff}
.lp .btn-lg{padding:1.15rem 1.9rem;font-size:1.08rem}
.lp .btn-block{width:100%}
.lp-actions{display:flex;flex-wrap:wrap;gap:.9rem;margin-top:2rem}

/* hero */
.lp-hero{position:relative;color:#fff;isolation:isolate;overflow:hidden;background:var(--lp-ink)}
.lp-hero-bg{position:absolute;inset:0;z-index:-2}
.lp-hero-bg img{width:100%;height:100%;object-fit:cover;object-position:60% 30%}
.lp-hero::before{content:"";position:absolute;inset:0;z-index:-1;background:linear-gradient(100deg,rgba(15,15,15,.94) 0%,rgba(15,15,15,.82) 45%,rgba(15,15,15,.45) 100%)}
.lp-hero .lp-wrap{display:grid;gap:3rem;padding-block:clamp(3rem,7vw,6rem);align-items:center}
@media(min-width:960px){.lp-hero .lp-wrap{grid-template-columns:1.1fr .9fr}}
.lp-hero h1{max-width:16ch;margin-top:.9rem;color:#fff}
.lp-hero .lp-eyebrow{color:var(--lp-gold)}
.lp-hero .lp-lead{color:rgba(255,255,255,.85);margin-top:1.25rem;max-width:52ch}
.lp-chips{display:flex;flex-wrap:wrap;gap:.6rem .9rem;margin-top:2.25rem;padding-top:1.75rem;border-top:1px solid rgba(255,255,255,.18)}
.lp-chip{display:inline-flex;align-items:center;gap:.5rem;font-size:.92rem;font-weight:600;color:rgba(255,255,255,.92)}
.lp-chip .i{color:var(--lp-green);font-size:1.15rem}
.lp-chip .lp-stars{font-size:.95rem}

/* lead form card */
.lp-card-form{background:#fff;color:var(--lp-ink);border-radius:var(--lp-r-lg);padding:1.75rem;box-shadow:var(--lp-shadow-lg)}
.lp-card-form h2{font-size:1.45rem;color:var(--lp-ink)}
.lp-card-form .lp-sub{color:var(--lp-muted);font-size:.95rem;margin-top:.35rem}
.lp-form{display:grid;gap:.85rem;margin-top:1.25rem}
.lp-form label{display:grid;gap:.35rem;font-size:.85rem;font-weight:600;color:var(--lp-ink-2)}
.lp-form input,.lp-form select{font:inherit;font-size:1rem;padding:.85rem 1rem;border:1.5px solid var(--lp-line);border-radius:10px;background:#fff;color:var(--lp-ink);width:100%;margin:0;box-shadow:none}
.lp-form input:focus,.lp-form select:focus{outline:2px solid var(--lp-accent);outline-offset:1px;border-color:var(--lp-accent)}
.lp-form-row{display:grid;gap:.85rem}
@media(min-width:480px){.lp-form-row{grid-template-columns:1fr 1fr}}
.lp-form-note{font-size:.8rem;color:var(--lp-muted);text-align:center}
.lp-form-note a{color:var(--lp-ink);font-weight:700;text-decoration:none}
.lp-or{display:flex;align-items:center;gap:.75rem;color:var(--lp-muted);font-size:.8rem;text-transform:uppercase;letter-spacing:.12em;font-family:var(--lp-cond);font-weight:600}
.lp-or::before,.lp-or::after{content:"";flex:1;height:1px;background:var(--lp-line)}

/* trust bar */
.lp-trust{background:var(--lp-paper-2);border-bottom:1px solid var(--lp-line)}
.lp-trust .lp-wrap{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:1.5rem 3rem;padding-block:1.4rem}
.lp-trust-rating{display:flex;align-items:center;gap:.75rem;font-weight:700;padding-right:3rem;border-right:1px solid var(--lp-line)}
.lp-trust-rating .g{width:28px;height:28px}
.lp-trust-rating small{display:block;font-weight:500;color:var(--lp-muted);font-size:.8rem}
.lp-trust img{height:44px;width:auto;filter:grayscale(1);opacity:.7;transition:.2s}
.lp-trust img:hover{filter:none;opacity:1}
@media(max-width:700px){.lp-trust-rating{border:0;padding:0;width:100%;justify-content:center}}

/* grids + service cards */
.lp-grid{display:grid;gap:1.25rem}
.lp-grid-4{grid-template-columns:repeat(auto-fit,minmax(240px,1fr))}
.lp-grid-3{grid-template-columns:repeat(auto-fit,minmax(280px,1fr))}
.lp-svc{position:relative;display:grid;gap:.75rem;padding:1.6rem;border-radius:var(--lp-r);background:#fff;border:1px solid var(--lp-line);text-decoration:none;color:var(--lp-ink);transition:transform .18s,box-shadow .18s,border-color .18s}
.lp-svc:hover{transform:translateY(-4px);box-shadow:var(--lp-shadow);border-color:transparent;color:var(--lp-ink)}
.lp-svc-icon{width:56px;height:56px;border-radius:14px;display:grid;place-items:center;background:var(--lp-ink);color:#fff;font-size:1.6rem;transition:.18s}
.lp-svc:hover .lp-svc-icon{background:var(--lp-accent)}
.lp-svc p{color:var(--lp-muted);font-size:.95rem}
.lp-svc-more{margin-top:auto;display:inline-flex;align-items:center;gap:.3rem;font-weight:700;color:var(--lp-accent);font-size:.95rem}
.lp-svc-call{background:var(--lp-ink);color:#fff;border-color:var(--lp-ink);justify-content:center;text-align:center}
.lp-svc-call:hover{color:#fff}
.lp-svc-call h3{color:#fff}
.lp-svc-call .lp-svc-icon{background:var(--lp-accent);margin-inline:auto}
.lp-svc-call p{color:rgba(255,255,255,.75)}
.lp-svc-call .lp-svc-more{color:#fff;justify-content:center}

/* offers */
.lp-offers{background:var(--lp-ink);color:#fff}
.lp-offers h2,.lp-offers h3{color:#fff}
.lp-offers .lp-eyebrow{color:var(--lp-gold)}
.lp-offers .lp-lead{color:rgba(255,255,255,.75)}
.lp-offer{display:grid;gap:.9rem;padding:2rem;border-radius:var(--lp-r-lg);background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12)}
.lp-offer .lp-svc-icon{background:rgba(255,255,255,.1)}
.lp-offer h3{font-size:1.35rem}
.lp-offer p{color:rgba(255,255,255,.8)}
.lp-offer .btn{margin-top:auto;justify-self:start}
.lp-offer.featured{background:var(--lp-accent);border-color:var(--lp-accent)}
.lp-offer.featured .lp-svc-icon{background:rgba(0,0,0,.25)}
.lp-offer.featured .lp-eyebrow{color:#fff}
.lp-offer.featured .btn{background:#fff;color:var(--lp-accent);border-color:#fff}
.lp-offer.featured .btn:hover{background:var(--lp-ink);color:#fff;border-color:var(--lp-ink)}

/* why */
.lp-why .lp-wrap{display:grid;gap:3rem;align-items:center}
@media(min-width:960px){.lp-why .lp-wrap{grid-template-columns:1fr 1fr}}
.lp-why h2{margin-top:.75rem}
.lp-why .lp-lead{margin-top:1rem}
.lp-stats{display:grid;grid-template-columns:repeat(2,1fr);gap:1rem;margin-top:2rem}
.lp-stat{padding:1.25rem 1.4rem;border-radius:var(--lp-r);background:var(--lp-paper-2);border:1px solid var(--lp-line)}
.lp-stat b{display:block;font-size:2rem;line-height:1;color:var(--lp-accent);font-family:var(--lp-cond)}
.lp-stat span{font-size:.9rem;color:var(--lp-muted);font-weight:600}
.lp-checks{margin-top:1.75rem;display:grid;gap:1.1rem}
.lp-checks li{display:grid;grid-template-columns:auto 1fr;gap:.9rem;align-items:start}
.lp-checks .i{color:var(--lp-green);font-size:1.6rem;margin-top:.1rem;background:rgba(90,197,162,.12);border-radius:50%;padding:.2rem}
.lp-checks b{display:block;font-size:1.05rem}
.lp-checks p{color:var(--lp-muted);font-size:.95rem}
.lp-video{position:relative;border-radius:var(--lp-r-lg);overflow:hidden;box-shadow:var(--lp-shadow-lg);background:#000;aspect-ratio:16/9;cursor:pointer;padding:0;border:0;width:100%;display:block}
.lp-video img{width:100%;height:100%;object-fit:cover;opacity:.85}
.lp-video iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
.lp-play{position:absolute;inset:0;display:grid;place-items:center;pointer-events:none}
.lp-play span{width:84px;height:84px;border-radius:50%;background:var(--lp-accent);display:grid;place-items:center;box-shadow:0 0 0 12px rgba(0,0,0,.25);transition:.2s}
.lp-play span::after{content:"";border-left:26px solid #fff;border-top:16px solid transparent;border-bottom:16px solid transparent;margin-left:6px}
.lp-video:hover .lp-play span{transform:scale(1.06)}
.lp-photos{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-top:1rem}
.lp-photos img{border-radius:var(--lp-r);aspect-ratio:4/3;object-fit:cover;width:100%}

/* steps */
.lp-steps{background:var(--lp-paper-2)}
.lp-step{display:grid;gap:.75rem;padding:2rem;background:#fff;border-radius:var(--lp-r);border:1px solid var(--lp-line)}
.lp-step .n{width:44px;height:44px;border-radius:50%;background:var(--lp-accent);color:#fff;display:grid;place-items:center;font-family:var(--lp-cond);font-size:1.3rem;font-weight:600}
.lp-step p{color:var(--lp-muted)}
.lp-steps .lp-actions{justify-content:center;margin-top:2.5rem}

/* reviews */
.lp-reviews-head{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:end;gap:1.5rem;margin-bottom:2rem}
.lp-reviews-head .lp-head{margin:0}
.lp-gscore{display:flex;align-items:center;gap:1rem;padding:1rem 1.25rem;border-radius:var(--lp-r);background:var(--lp-paper-2);border:1px solid var(--lp-line);text-decoration:none}
.lp-gscore .g{width:34px;height:34px}
.lp-gscore b{font-size:1.6rem;line-height:1;font-family:var(--lp-cond)}
.lp-gscore small{display:block;color:var(--lp-muted);font-size:.85rem}
.lp-review{display:grid;gap:1rem;padding:1.75rem;border-radius:var(--lp-r);background:#fff;border:1px solid var(--lp-line);box-shadow:0 4px 20px -10px rgba(0,0,0,.12)}
.lp-review blockquote{color:var(--lp-ink-2);font-size:1rem;line-height:1.6;padding:0;border:0;font-style:normal}
.lp-review footer{display:flex;align-items:center;gap:.8rem;margin-top:auto}
.lp-avatar{width:42px;height:42px;border-radius:50%;background:var(--lp-ink);color:#fff;display:grid;place-items:center;font-weight:700;font-family:var(--lp-cond)}
.lp-review footer b{display:block}
.lp-review footer small{color:var(--lp-muted)}

/* area */
.lp-area{background:var(--lp-paper-2)}
.lp-area .lp-wrap{display:grid;gap:3rem;align-items:center}
@media(min-width:960px){.lp-area .lp-wrap{grid-template-columns:1fr 1fr}}
.lp-area h2{margin-top:.75rem}
.lp-area .lp-lead{margin-top:1rem}
.lp-map{border-radius:var(--lp-r-lg);box-shadow:var(--lp-shadow);width:100%;aspect-ratio:4/3;object-fit:cover}
.lp-addr{display:grid;gap:.6rem;margin-top:1.5rem;color:var(--lp-ink-2)}
.lp-addr div{display:flex;gap:.7rem;align-items:center}
.lp-addr .i{color:var(--lp-accent);font-size:1.2rem}
.lp-addr a{text-decoration:none;font-weight:600}

/* faq */
.lp-faq{max-width:820px;margin-inline:auto;display:grid;gap:.6rem}
.lp-faq details{border:1px solid var(--lp-line);border-radius:var(--lp-r);background:#fff;padding:0 1.4rem}
.lp-faq summary{list-style:none;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:1rem;padding:1.15rem 0;font-weight:700;font-size:1.05rem}
.lp-faq summary::-webkit-details-marker{display:none}
.lp-faq summary .i{color:var(--lp-accent);transition:transform .2s;font-size:1.2rem}
.lp-faq details[open] summary .i{transform:rotate(180deg)}
.lp-faq details p{padding:0 0 1.2rem;color:var(--lp-ink-2)}

/* final cta */
.lp-final{background:var(--lp-accent);color:#fff;text-align:center}
.lp-final h2{font-size:clamp(2rem,4vw,3rem);color:#fff}
.lp-final .lp-lead{color:rgba(255,255,255,.9);margin:1rem auto 0}
.lp-final .lp-actions{justify-content:center}
.lp-final .btn-red{background:#fff;color:var(--lp-accent);box-shadow:none}
.lp-final .btn-red:hover{background:var(--lp-ink);color:#fff}

/* mobile sticky call/book bar (the theme header has no fixed CTA) */
.lp-mbar{position:fixed;left:0;right:0;bottom:0;z-index:60;display:grid;grid-template-columns:1fr 1fr;gap:.5rem;padding:.6rem;background:#fff;border-top:1px solid var(--lp-line);box-shadow:0 -8px 30px rgba(0,0,0,.08)}
.lp-mbar .btn{border-radius:12px;padding:.9rem}
@media(min-width:900px){.lp-mbar{display:none}}
@media(max-width:899px){.site-footer{padding-bottom:72px}}
`;
