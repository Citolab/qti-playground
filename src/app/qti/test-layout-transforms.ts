/**
 * Restructuring the assessment test document for the two player layouts.
 *
 * qti-components has no "render the whole test" or "render these three items"
 * navigation mode — only `item` and `section`. A section navigation, though,
 * loads *all* of that section's direct item-ref children in parallel and renders
 * them in document order. So both multi-question screens the playground offers
 * are the same trick with a different grouping:
 *
 * - vertical: one section holding the entire test  →  one continuous page.
 * - classic:  one section per shared stimulus      →  a booklet page per source.
 *
 * Both run from `postLoadTestTransformCallback`, i.e. after qti-components has
 * already resolved item-ref hrefs against the test URL, so they only ever move
 * elements around — never rewrite a path.
 *
 * Adapted from `flattenTestToSingleSection` in cito-test-uit's data package.
 */
import type { transformTestApi } from "@citolab/qti-components";

/**
 * Identifier of the synthetic section vertical mode collapses the whole test
 * into. The player navigates to exactly this id, once.
 */
export const VERTICAL_SECTION_ID = "QTI-PLAYGROUND-VERTICAL-ALL";

/** Prefix for the synthetic sections shared-stimulus grouping creates. */
const STIMULUS_SECTION_PREFIX = "QTI-PLAYGROUND-STIMULUS-";

const ITEM_REF = "qti-assessment-item-ref";
const SECTION = "qti-assessment-section";

/**
 * The section structure a transform left behind — everything the player needs
 * to navigate by section without re-reading the rendered document: which
 * section an item now lives in, and what order the sections are in.
 *
 * `sections` is empty when the transform found nothing to do, which the player
 * reads as "navigate by item, the way it always did".
 */
export interface SectionGrouping {
  /** Section identifiers in document order. */
  sections: string[];
  /** Item-ref identifier → the section it now lives in. */
  sectionByItemRef: Map<string, string>;
  /** Section identifier → its item-refs, in document order. */
  itemRefsBySection: Map<string, string[]>;
}

export const emptyGrouping = (): SectionGrouping => ({
  sections: [],
  sectionByItemRef: new Map(),
  itemRefsBySection: new Map(),
});

const recordGrouping = (
  grouping: SectionGrouping,
  sectionId: string,
  itemRef: Element,
) => {
  const id = itemRef.getAttribute("identifier") ?? "";
  if (!id) return;
  grouping.sectionByItemRef.set(id, sectionId);
  const members = grouping.itemRefsBySection.get(sectionId);
  if (members) members.push(id);
  else {
    grouping.itemRefsBySection.set(sectionId, [id]);
    grouping.sections.push(sectionId);
  }
};

/**
 * Section titles are the booklet's headings ("Nestkasten", "Onderwaterhockey").
 * Stash them on the item refs before a regrouping throws the sections away, so
 * the flattened page can still show where a new chapter starts.
 */
const recordSectionProvenance = (itemRefs: Element[]) => {
  const sectionKeyOf = (itemRef: Element) =>
    itemRef.closest(SECTION)?.getAttribute("identifier") ||
    `item:${itemRef.getAttribute("identifier")}`;

  // A chapter heading only says something when the booklet has more than one
  // chapter; a test authored as a single section would open with a meaningless
  // "Section 1".
  const hasSeveralSections = new Set(itemRefs.map(sectionKeyOf)).size > 1;

  const seen = new Set<string>();
  itemRefs.forEach((itemRef) => {
    const section = itemRef.closest(SECTION);
    const sectionId = section?.getAttribute("identifier") ?? "";
    const sectionTitle = section?.getAttribute("title") ?? "";

    if (sectionId) itemRef.setAttribute("data-source-section-id", sectionId);
    if (sectionTitle) {
      itemRef.setAttribute("data-source-section-title", sectionTitle);
    }

    const key = sectionKeyOf(itemRef);
    if (hasSeveralSections && !seen.has(key)) {
      seen.add(key);
      itemRef.setAttribute("data-section-start", "true");
    } else {
      itemRef.removeAttribute("data-section-start");
    }
  });
};

const createSection = (
  xml: XMLDocument,
  testPart: Element,
  identifier: string,
  title: string,
): Element => {
  const section = xml.createElementNS(testPart.namespaceURI, SECTION);
  section.setAttribute("identifier", identifier);
  section.setAttribute("title", title);
  section.setAttribute("visible", "true");
  section.setAttribute("keep-together", "true");
  return section;
};

/**
 * Collapse the test into a single section holding every item ref, so a single
 * section navigation renders the whole booklet as one continuous page.
 *
 * `qti-ordering` / `qti-selection` are not carried over: by the time this runs
 * their effect is already materialized into document order.
 */
export const flattenTestToSingleSection = (
  doc: transformTestApi,
): SectionGrouping => {
  const grouping = emptyGrouping();

  doc.fn((xml) => {
    const testPart = xml.querySelector("qti-test-part");
    if (!testPart) return;

    const itemRefs = Array.from(testPart.querySelectorAll(ITEM_REF));
    if (itemRefs.length === 0) return;

    recordSectionProvenance(itemRefs);

    const flatSection = createSection(xml, testPart, VERTICAL_SECTION_ID, "");
    itemRefs.forEach((itemRef) => {
      flatSection.appendChild(itemRef);
      recordGrouping(grouping, VERTICAL_SECTION_ID, itemRef);
    });

    testPart
      .querySelectorAll(`:scope > ${SECTION}`)
      .forEach((section) => section.remove());
    testPart.appendChild(flatSection);
  });

  return grouping;
};

/**
 * Put the items that share a stimulus into a section of their own, so classic
 * navigation shows the source once with all its questions beside it — one
 * booklet page per source — instead of repeating the reading text on three
 * consecutive screens.
 *
 * `stimulusIdByItemRef` maps an item-ref identifier to the stimulus it places;
 * only ids listed in `sharedIds` group (a stimulus used by one item needs no
 * section, that item already has a screen to itself). Items outside any group
 * keep a one-item section each, because section navigation is all-or-nothing:
 * once the player navigates by section, every item has to be reachable as one.
 *
 * Callers check `sharedIds` first, so an ordinary test never goes through here
 * at all and keeps navigating by item.
 */
export const groupItemRefsBySharedStimulus = (
  doc: transformTestApi,
  stimulusIdByItemRef: ReadonlyMap<string, string>,
  sharedIds: ReadonlySet<string>,
): SectionGrouping => {
  const grouping = emptyGrouping();

  doc.fn((xml) => {
    const testPart = xml.querySelector("qti-test-part");
    if (!testPart) return;

    const itemRefs = Array.from(testPart.querySelectorAll(ITEM_REF));
    if (itemRefs.length === 0) return;

    recordSectionProvenance(itemRefs);

    /** The group an item belongs to, or null when it stands alone. */
    const groupOf = (itemRef: Element): string | null => {
      const id = itemRef.getAttribute("identifier") ?? "";
      const stimulusId = stimulusIdByItemRef.get(id);
      return stimulusId && sharedIds.has(stimulusId) ? stimulusId : null;
    };

    // Walk in document order and start a new section whenever the group
    // changes, so the booklet's reading order survives. Items sharing a source
    // but separated by an unrelated question therefore land in two sections
    // rather than being reordered into one.
    const sections: Element[] = [];
    let currentGroup: string | null | undefined;
    let currentSection: Element | null = null;
    let standaloneIndex = 0;

    itemRefs.forEach((itemRef) => {
      const group = groupOf(itemRef);
      const startNewSection =
        currentSection === null || group === null || group !== currentGroup;

      if (startNewSection) {
        const identifier =
          group === null
            ? `${STIMULUS_SECTION_PREFIX}ITEM-${standaloneIndex++}`
            : `${STIMULUS_SECTION_PREFIX}${group}`;
        currentSection = createSection(
          xml,
          testPart,
          identifier,
          itemRef.getAttribute("data-source-section-title") ?? "",
        );
        sections.push(currentSection);
        currentGroup = group;
      }

      currentSection!.appendChild(itemRef);
      recordGrouping(
        grouping,
        currentSection!.getAttribute("identifier") ?? "",
        itemRef,
      );
    });

    testPart
      .querySelectorAll(`:scope > ${SECTION}`)
      .forEach((section) => section.remove());
    sections.forEach((section) => testPart.appendChild(section));
  });

  return grouping;
};
