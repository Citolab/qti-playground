/**
 * The title a candidate should see for a test. The importer names an
 * assessment after its identifier; the test's own `title` attribute is the
 * human one, so it wins whenever the test document has one.
 */
export const assessmentTitleOf = (assessment?: {
  name?: string;
  content?: string;
}): string | undefined => {
  if (!assessment?.content) return assessment?.name;
  const test = new DOMParser()
    .parseFromString(assessment.content, "application/xml")
    .querySelector("qti-assessment-test");
  return test?.getAttribute("title") || assessment.name;
};
