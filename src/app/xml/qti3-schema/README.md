# QTI 3.0 XML schema

Read by `../xml-validation.worker.ts` (bundled as text). Copied from qti-construction
(`backend/QtiConstruction.Core/Qti/Schema`), which downloaded them from 1EdTech on 2026-10-14.

| File | Source |
| --- | --- |
| `imsqti_asiv3p0_v1p0.xsd` | `https://purl.imsglobal.org/spec/qti/v3p0/schema/xsd/imsqti_asiv3p0_v1p0.xsd` (sha256 `01290bee61a090fa83d2d313f6821156eac9364a7a1f99caa21b1e8fbe0e8bac`) **with its `xs:annotation` documentation removed** (18.6 MB → 0.6 MB, nothing else changed): `perl -0pe 's/<xs:annotation>.*?<\/xs:annotation>\s*//gs'` |
| `xml.xsd`, `XInclude.xsd` | `https://purl.imsglobal.org/spec/w3/2001/schema/xsd/`; `XInclude.xsd` converted from UTF-16 to UTF-8 (the worker imports the files as UTF-8 text) |
| `mathml3*.xsd` | `https://purl.imsglobal.org/spec/mathml/v3p0/schema/xsd/` |
| `ssmlv1p1-core.xsd` | **A stand-in**, not the official file (from qti-construction): the official SSML 1.1 core schema uses an `xsd:redefine` that breaks XSD 1.0 derivation rules. It declares the twelve SSML elements the QTI schema references, with lax content. |

Imports are resolved by file name to these files, never fetched over the network.
