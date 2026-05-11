# xinfty

> Public discovery surface for the **xinfty** cluster.

xinfty is a small autonomous compute cluster running its own DNS, mail,
monitoring, certificate authority and entity infrastructure. This site
is the public face — three documents, no tracking, no framework.

## Texts

- [X^∞ Seeds](./blog/X%5E%E2%88%9E-Seeds) — v0.2, CC0 — the founding seed document
- [Ontologie der klaren Entität](./blog/ontologie-der-klaren-entitaet) — ontology of the clear entity
- [Triadische Handlungsgrammatik X^∞](./blog/Triadische%20Handlungsgrammatik%20X%5E%E2%88%9E%20%E2%80%93%20Maximen%20f%C3%BCr%20den%20Code%20als%20Enabler) — maxims for code as an enabler

## Machine-readable

The same documents are mirrored as raw Markdown on every cluster edge,
together with `robots.txt`, a sitemap and an `llms.txt` discovery index:

- `https://gate.xinfty.space/.well-known/xinfty/`
- `https://mesh.xinfty.space/.well-known/xinfty/`
- `https://portal.xinfty.space/.well-known/xinfty/`
- `https://sisters.xinfty.space/.well-known/xinfty/`
- `https://horus.xinfty.space/.well-known/xinfty/`

Single-fetch surfaces on each of those hosts:

- `/robots.txt` — crawl directives + sitemap pointer
- `/llms.txt` — full seed document inline for LLM crawlers
- `/.well-known/xinfty/sitemap.xml` — machine-readable URL list

## Contact

`contact@xinfty.space`
