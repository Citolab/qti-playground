import { ActionType, StateContextType } from 'rx-basic-store';
import axios from 'axios';
import { qtiTransform } from '@citolab/qti-convert/qti-transformer';
import { CheerioAPI } from 'cheerio';
import { getRelativePath, isValidXml, qtiConversionFixes } from '../utils';
import {
  AssessmentInfo,
  ExtendedTestContext,
  ItemInfoWithContent,
  QtiApi,
} from '@citolab/qti-api';
import { convertQti2toQti3 } from '@citolab/qti-convert/qti-convert';
import { processPackage } from '@citolab/qti-convert/qti-helper';

export interface AssessmentInfoWithContent extends AssessmentInfo {
  content: string;
}
const urlsChecked = new Map<string, boolean>();

export interface StateModel {
  init: boolean;
  downloadUrl: string;
  downloadUrlQti3: string;
  loadingItems: boolean;
  qtiInput: string;
  qti3: string;
  qti3ForPreview: string;
  isConverting: boolean;
  isPreparingForPreview: boolean;
  errorMessage: string;
  fillSource: boolean;
  assessments: AssessmentInfoWithContent[];
  importErrors: string[];
  selectedAssessment?: string;
  testContexts: ({ assessmentId: string } & ExtendedTestContext)[];
  itemsPerAssessment: { assessmentId: string; items: ItemInfoWithContent[] }[];
}

export const initialState: StateModel = {
  init: false,
  qtiInput: '',
  qti3: '',
  downloadUrl: '',
  downloadUrlQti3: '',
  qti3ForPreview: '',
  isConverting: false,
  isPreparingForPreview: false,
  fillSource: false,
  loadingItems: false,
  errorMessage: '',
  testContexts: [],
  assessments: [],
  itemsPerAssessment: [],
  importErrors: [],
};

export class RestoreStateAction implements ActionType<StateModel, never> {
  type = 'RESTORE_STATE';

  async execute(ctx: StateContextType<StateModel>): Promise<StateModel> {
   return (ctx.dataApi?.getState() || initialState) as StateModel;
  }
}

export class LoadQtiAction implements ActionType<StateModel, { href: string }> {
  type = 'LOAD_QTI_ACTION';

  constructor(public payload: { href: string }) {}

  async execute(ctx: StateContextType<StateModel>): Promise<StateModel> {
    try {
      await ctx.patchState({
        isConverting: true,
        errorMessage: '',
      });
      const qtiResultData = await axios.get(this.payload.href, {
        responseType: 'text',
      });
      await ctx.patchState({
        qtiInput: qtiResultData.data,
        fillSource: true,
      });
      return ctx.dispatch(new ConvertQtiAction({ qti: qtiResultData.data }));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      return ctx.patchState({
        errorMessage: e.message,
        isConverting: false,
      });
    }
  }
}

export class SetSelectedItemAction
  implements
    ActionType<StateModel, { identifier: string; assessmentId: string }>
{
  type = 'SET_SELECTED_ITEM';

  constructor(public payload: { identifier: string; assessmentId: string }) {}

  async execute(ctx: StateContextType<StateModel>): Promise<StateModel> {
    const currentState = ctx.getState();
    const testContext: { assessmentId: string } & ExtendedTestContext =
      currentState.testContexts.find(
        (t) => t.assessmentId === currentState.selectedAssessment
      ) || {
        items: [],
        navItemId: this.payload.identifier,
        assessmentId: this.payload.assessmentId,
        testOutcomeVariables: [],
      };

    return ctx.dispatch(
      new TestContextChangedAction({
        ...testContext,
        navItemId: this.payload.identifier,
      })
    );
  }
}

export class OnEditItemAction
  implements ActionType<StateModel, { identifier: string }>
{
  type = 'ON_EDIT_ITEM';

  constructor(public payload: { identifier: string }) {}

  async execute(ctx: StateContextType<StateModel>): Promise<StateModel> {
    const currentState = ctx.getState();
    const allItems = currentState.itemsPerAssessment.flatMap((i) => i.items);
    const item = allItems.find((i) => i.identifier === this.payload.identifier);
    if (item) {
      return ctx.patchState({
        fillSource: true,
        qti3: item.content,
        qti3ForPreview: item.content,
      });
    }
    return currentState;
  }
}

export class TestContextChangedAction
  implements
    ActionType<StateModel, { assessmentId: string } & ExtendedTestContext>
{
  type = 'TEST_CONTEXT_CHANGED';

  constructor(public payload: { assessmentId: string } & ExtendedTestContext) {}

  async execute(ctx: StateContextType<StateModel>): Promise<StateModel> {
    const currentState = ctx.getState();
    return ctx.patchState({
      testContexts: currentState.testContexts
        .filter((t) => t.assessmentId !== this.payload.assessmentId)
        .concat([this.payload]),
    });
  }
}

export class SelectAssessmentAction
  implements ActionType<StateModel, { assessmentId: string }>
{
  type = 'SELECT_ASSESSMENT';

  constructor(public payload: { assessmentId: string }) {}

  async execute(ctx: StateContextType<StateModel>): Promise<StateModel> {
    return ctx.patchState({ selectedAssessment: this.payload.assessmentId });
  }
}

export class LoadItemsAction implements ActionType<StateModel, never> {
  type = 'LOAD_ITEMS';

  async execute(ctx: StateContextType<StateModel>): Promise<StateModel> {
    let currentState = ctx.getState();
    await ctx.patchState({
      loadingItems: true,
    });
    const qtiApi = ctx.getContext('qtiApi') as QtiApi;
    for (const assessment of currentState.assessments) {
      let shouldRemove = false;
      try {
        const items = await qtiApi.getItemsByAssessmentId(
          assessment.assessmentId
        );
        if (items && items.length > 0) {
          currentState = await ctx.patchState({
            itemsPerAssessment: currentState.itemsPerAssessment
              .filter((i) => i.assessmentId !== assessment.assessmentId)
              .concat({
                assessmentId: assessment.assessmentId,
                items,
              }),
          });
        } else {
          shouldRemove = true;
        }
      } catch  {
        // assessment can be deleted so remove from state
        shouldRemove = true;
      }

      if (shouldRemove) {
        await ctx.patchState({
          assessments: currentState.assessments.filter(
            (a) => a.assessmentId !== assessment.assessmentId
          ),
        });
      }
    }
    return await ctx.patchState({
      loadingItems: false,
    });
  }
}

export class ProcessPackageAction
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  implements ActionType<StateModel, { file: any, options: {
                            removeStylesheets: boolean,
                            skipValidation: boolean,
                        } }>
{
  type = 'LOAD_ASSESSMENTS';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(public payload: {  file: any, options: {
                            removeStylesheets: boolean,
                            skipValidation: boolean,
                        } }) {}

  async execute(ctx: StateContextType<StateModel>): Promise<StateModel> {
    sessionStorage.clear();
    const assessments: AssessmentInfoWithContent[] = [];
    const items: ItemInfoWithContent[] = [];

    const skipValidation = this.payload.options.skipValidation === false ? false : true;
    const removeStylesheets = this.payload.options.removeStylesheets || false;

    // create a dictionary of items key = identifier, value = content
    const result = await processPackage(
      this.payload.file,
      'https://raw.githubusercontent.com/Citolab/qti30Upgrader/refs/heads/main/qti2xTo30.sef.json',
      true, 
       {
        removeStylesheets,
        skipValidation,
      },
      (itemData) => {
        items.push({
          identifier: itemData.identifier,
          content: itemData.content,
          title: itemData.identifier,
          type: itemData.content.includes('interaction>') ? 'regular' : 'info',
          categories: [],
          href: itemData.relativePath,
        });
      },
      (assessmentData) => {
        assessments.push({
          assessmentId: assessmentData.identifier,
          content: assessmentData.content,
          packageId: assessmentData.identifier,
          assessmentHref: assessmentData.relativePath,
          name: assessmentData.identifier,
          items: assessmentData.itemRefs
            .map((i) => items.find((it) => it.identifier === i.identifier))
            .filter((i) => i !== undefined)
            .map((i) => {
            return {
              identifier: i.identifier,
              title: i.title,
              type: i.type,
              categories: i.categories,
              href: getRelativePath(assessmentData.relativePath, i.href || ''),
              content: i.content,
            };
          }),
        });
      }
    );

    for (const assessment of assessments) {
      for (const itemRef of assessment.items || []) {
        const matchingItem = items.find(i => i.identifier === itemRef.identifier);
        if (matchingItem) {
          const fullKey = encodeURI(itemRef.href || '');
          sessionStorage.setItem(fullKey, matchingItem.content);
        }
      }
    }

  
    return ctx.patchState({
      assessments,
      importErrors: result.errors,
      itemsPerAssessment: assessments.map((a) => {
        return {
          assessmentId: a.assessmentId,
          items: (a.items || []).map((i) => {
            return {
              identifier: i.identifier,
              content: i.content,
              title: i.title,
              type: i.type,
              categories: i.categories || [],
              href: i.href,
            } as ItemInfoWithContent;
          }),
        };
      }),
    });
  }
}

export class StartAssessmentAction
  implements ActionType<StateModel, { assessmentId: string }>
{
  type = 'START_ASSESSMENT_ACTION';

  constructor(public payload: { assessmentId: string }) {}

  async execute(ctx: StateContextType<StateModel>): Promise<StateModel> {
    return ctx.patchState({
      selectedAssessment: this.payload.assessmentId,
    });
  }
}

// export class LoadAssessmentsAction implements ActionType<StateModel, never> {
//   type = 'LOAD_ASSESSMENTS_ACTION';

//   async execute(ctx: StateContextType<StateModel>): Promise<StateModel> {
//     const qtiApi = new QtiApi(apiBase, 'convert-online', '');
//     const currentState = ctx.getState();
//     const assessments: AssessmentInfo[] = [];
//     const asssessmentsToRemove: string[] = [];

//     // check if assessmentIds are already loaded in the assessments list
//     if (
//       currentState.assessments.length ===
//       currentState.uploadedAssessments.length
//     ) {
//       return currentState;
//     }

//     for (const assessmentId of currentState.uploadedAssessments) {
//       try {
//         const assessment = await qtiApi.getAssessment(assessmentId);
//         assessments.push(assessment);
//       } catch (e) {
//         console.error(e);
//         // assessment probable deleted, remove from list
//         asssessmentsToRemove.push(assessmentId);
//       }
//     }
//     return ctx.patchState({
//       uploadedAssessments: currentState.uploadedAssessments.filter(
//         (i) => !asssessmentsToRemove.includes(i)
//       ),
//       assessments,
//     });
//   }
// }

export class Qti3ChangedAction
  implements ActionType<StateModel, { qti: string }>
{
  type = 'QTI3_CHANGED_ACTION';

  constructor(public payload: { qti: string }) {}

  async execute(ctx: StateContextType<StateModel>): Promise<StateModel> {
    await ctx.patchState({
      qti3: this.payload.qti,
    });
    return ctx.dispatch(new PrepareForPreviewAction());
  }
}

export class PrepareForPreviewAction
  implements ActionType<StateModel, { replaceImage?: boolean }>
{
  type = 'PREPARE_FOR_PREVIEW_ACTION';

  constructor(public payload: { replaceImage?: boolean } = {}) {}

  async execute(ctx: StateContextType<StateModel>): Promise<StateModel> {
    const currentstate = ctx.getState();
    await ctx.patchState({
      isPreparingForPreview: true,
      errorMessage: '',
    });
    if (!currentstate.qti3) {
      return ctx.patchState({
        errorMessage: '',
        isPreparingForPreview: false,
      });
    }
    if (!isValidXml(currentstate.qti3)) {
      return ctx.patchState({
        errorMessage: 'Invalid QTI XML',
        isPreparingForPreview: false,
      });
    }
    try {
      const qtiWithReplacementMedia =
        await replaceMediaWithMissingImagePlaceholder(currentstate.qti3);
      const transformedXml = qtiTransform(qtiWithReplacementMedia)
        .fnCh(($: CheerioAPI) =>
          $('qti-inline-choice span').contents().unwrap()
        )
        .fnCh(($: CheerioAPI) => $('*').remove('qti-stylesheet'))
        .xml();
      return ctx.patchState({
        qti3ForPreview: transformedXml,
        isPreparingForPreview: false,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      return ctx.patchState({
        errorMessage: e.message,
        isPreparingForPreview: false,
      });
    }
  }
}

async function checkFileExists(url: string): Promise<boolean> {
  try {
    if (url.startsWith('http') || url.startsWith('//')) {
      return true;
    }
    const response = await axios.head(url);
    return response.status === 200;
  } catch  {
    return false; // assumes any error means the image doesn't exist
  }
}

const replaceMediaWithMissingImagePlaceholder = async (
  xmlString: string,
  attributes = ['src', 'href', 'data']
): Promise<string> => {
  const newXMlDocument = new DOMParser().parseFromString(xmlString, 'text/xml');
  for (const attribute of attributes) {
    const srcAttributes = newXMlDocument.querySelectorAll(
      '[' + attribute + ']'
    );
    for (const node of Array.from(srcAttributes)) {
      const srcValue = node.getAttribute(attribute)!;

      const imageExists = urlsChecked.has(srcValue) 
        ? urlsChecked.get(srcValue)
        : await checkFileExists(srcValue);

      if (!imageExists && !(srcValue.startsWith('data:') || srcValue.startsWith('blob:'))) {
        node.setAttribute(attribute, '/missing.png');
      }
    }
  }
  xmlString = new XMLSerializer().serializeToString(newXMlDocument);
  return xmlString;
};

export class ConvertQtiAction
  implements ActionType<StateModel, { qti: string }>
{
  type = 'CONVERT_QTI_ACTION';

  constructor(public payload: { qti: string }) {}

  async execute(ctx: StateContextType<StateModel>): Promise<StateModel> {
    try {
      await ctx.patchState({
        isConverting: true,
        errorMessage: '',
      });
      if (!this.payload.qti || !isValidXml(this.payload.qti)) {
        return ctx.patchState({
          errorMessage: 'Invalid QTI XML',
          isConverting: false,
        });
      }
      let qti3 = await convertQti2toQti3(
        this.payload.qti,
        'https://raw.githubusercontent.com/Citolab/qti30Upgrader/refs/heads/main/qti2xTo30.sef.json'
      );
      qti3 = await qtiConversionFixes(qti3, '');
      return ctx.patchState({
        qti3,
        isConverting: false,
        qtiInput: this.payload.qti,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      return ctx.patchState({
        errorMessage: e.message,
        isConverting: false,
      });
    }
  }
}
