/**
 * Starting point for "New item": the smallest item both the player and the
 * Citolab editor accept.
 *
 * There is deliberately no response or outcome declaration and no response
 * processing. The editor's exporter derives all three from the interactions in
 * the body (see prose-qti's `buildAssessmentItemXml`), so declaring them up
 * front for a body that has no interaction yet would only produce an item whose
 * declarations contradict its content until the first export overwrote them.
 */
export const BLANK_ITEM_IDENTIFIER = "new-item";

export const blankItemXml = (
  identifier = BLANK_ITEM_IDENTIFIER,
  title = "New item",
) => `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqtiasi_v3p0 https://purl.imsglobal.org/spec/qti/v3p0/schema/xsd/imsqti_asiv3p0_v1p0.xsd" identifier="${identifier}" title="${title}" adaptive="false" time-dependent="false" xml:lang="en">
  <qti-item-body>
    <p>Type your question here, then use Insert to add an interaction.</p>
  </qti-item-body>
</qti-assessment-item>
`;
