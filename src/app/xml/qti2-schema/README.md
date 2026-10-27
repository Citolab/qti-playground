# QTI 2.x schema catalogs

What the QTI 2.1 and 2.2 XML schemas allow per element type (children, attributes, enumerations, documentation), read
by `../schema-catalog.ts` for the XML editors' completion and hover in QTI 2.x documents. The editors do not validate
QTI 2.x; only QTI 3 has its schema files here (`../qti3-schema`).

Written on 2026-10-27 by qti-construction's `scripts/qti-schema-catalog.cs` (`QtiSchemaCatalogBuilder`, the builder of
its `GET /api/qti/schema-catalog`) from the official 1EdTech schemas and their imports in a local folder:

```sh
dotnet run scripts/qti-schema-catalog.cs -- <folder> imsqti_v2p1.xsd qti21-catalog.json
dotnet run scripts/qti-schema-catalog.cs -- <folder> imsqti_v2p2p4.xsd qti22-catalog.json
```

| Catalog | Main schema (sha256) | Imports in the folder |
| --- | --- | --- |
| `qti21-catalog.json` (`http://www.imsglobal.org/xsd/imsqti_v2p1`) | `http://www.imsglobal.org/xsd/qti/qtiv2p1/imsqti_v2p1.xsd` (`3fcdd1673908d553434529828032031e6bc6a0cf5ae310ccc40645b4382d1c89`) | `apipv1p0_qtiextv2p1_v1p0.xsd` (`http://www.imsglobal.org/profile/apip/apipv1p0/`, `9c4c35f4…`), `XInclude.xsd`, `xml.xsd`; MathML: see below |
| `qti22-catalog.json` (`http://www.imsglobal.org/xsd/imsqti_v2p2`) | `https://purl.imsglobal.org/spec/qti/v2p2/schema/xsd/imsqti_v2p2p4.xsd` (`aa1ea66908fe7d50f50362a511ee13e7c6ce2b1afea5c1382aaf3c47d3c0f63c`) | `imsqtiv2p2p4_html5_v1p0.xsd` (same folder on purl, `05d9d985…`), `apipv1p0_qtiextv2p2_v1p0p1.xsd` (`b2dd1e5b…`), `XInclude.xsd`, `xml.xsd`; MathML and SSML: see below |

Stand-ins, because the official files are not used or do not compile in .NET:

- **MathML 2** (`mathml2.xsd`, namespace `http://www.w3.org/1998/Math/MathML`): qti-construction's MathML 3 schema files
  (the same namespace). Completion inside `<math>` therefore follows MathML 3.
- **MathML 3 in `http://www.w3.org/2010/Math/MathML`** (QTI 2.2 only, which imports it next to MathML 2): the same
  MathML 3 files with that namespace (their includes renamed `mathml3-2010-*.xsd`).
- **SSML** (`ssmlv1p0.xsd`, `ssmlv1p1-core.xsd`; QTI 2.2 and APIP): the official files `xsd:redefine` files that are
  not published next to them. qti-construction's lax SSML stand-in (the twelve SSML elements), in
  `http://www.w3.org/2001/10/synthesis` and in `http://www.w3.org/2010/10/synthesis`.

The catalog for a document is chosen by its root element's namespace (`catalogNamespace`); without one, a `qti-…` root
is QTI 3 and a QTI 2 root (`assessmentItem`, …) is QTI 2.2.
