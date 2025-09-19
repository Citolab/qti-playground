import React, {
  RefCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { UseStoreContext } from "../store/store-context";
import {
  initialState,
  OnEditItemAction,
  SelectAssessmentAction,
} from "../store/store";
import { useSearchParams, useParams, useNavigate } from "react-router-dom";
import { CustomElements } from "@citolab/qti-components/react";
import { QtiAssessmentItem } from "@citolab/qti-components";
import { QtiTest as QtiTestType } from "@citolab/qti-components/exports/qti-test.js";
import { ChevronLeft, Edit, Code, ChevronRight } from "lucide-react";
import { itemBlobManager } from "../store/item-blob-manager";

import DraggablePopup from "../components/draggable-popup";
import ModeSwitch from "../components/mode-switcher";
import { NavigationBar } from "./nav-list";

/* React */
declare module "react" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface IntrinsicElements extends CustomElements {
      style: React.DetailedHTMLProps<
        React.StyleHTMLAttributes<HTMLStyleElement>,
        HTMLStyleElement
      >;
    }
  }
}

export const AssessmentPage: React.FC = () => {
  const navigate = useNavigate();
  const qtiTestRef = useRef<QtiTestType>(null);
  const [queryParams] = useSearchParams();
  const [state, setState] = useState(initialState);
  const { store } = UseStoreContext();
  const [showVariables, setShowVariables] = useState(false);
  const [currentItemIdentifier, setCurrentItemIdentifier] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [stampContext, setStampContext] = useState<any>(null);

  useEffect(() => {
    const subs = store.subscribe(setState);
    console.log("assessment?.content", assessment?.content);
    return () => subs?.unsubscribe();
  }, [store]);

  // Create a ref callback that can be passed directly to the element
  const refCallback: RefCallback<QtiTestType> = (element) => {
    if (element) {
      // Store element in ref
      qtiTestRef.current = element;

      // Set up event listeners immediately
      element.addEventListener(
        "qti-assessment-item-connected",
        handleItemConnected
      );
    }
  };

  // Define event handler
  const handleItemConnected = (event: Event) => {
    const qtiAssessmentItem = (event as CustomEvent<QtiAssessmentItem>)?.detail;
    const itemId = qtiAssessmentItem?.identifier;
    setCurrentItemIdentifier(itemId);
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (qtiTestRef.current) {
        qtiTestRef.current.removeEventListener(
          "qti-assessment-item-connected",
          handleItemConnected
        );
      }
    };
  }, []);

  const { assessmentId } = useParams<{
    assessmentId: string;
  }>();
  const selectedAssessment = state.assessments?.find(
    (a) => a.id === state.selectedAssessment
  );
  const assessment = state.assessments?.find((a) => a.id === assessmentId);

  const handleToggle = (mode: string) => {
    if (qtiTestRef.current)
      qtiTestRef.current.dispatchEvent(
        new CustomEvent("on-test-switch-view", {
          composed: true,
          bubbles: true,
          detail: mode,
        })
      );
  };

  useLayoutEffect(() => {
    if (selectedAssessment?.id !== assessmentId) {
      if (assessmentId) {
        store.dispatch(new SelectAssessmentAction({ assessmentId }));
      } else {
        navigate(`/assessment/${selectedAssessment?.id}`);
      }
    }
    const itemId = queryParams.get("item");
    if (qtiTestRef.current) {
      const selectedAssessment = state.assessments.find(
        (a) => a.id === state.selectedAssessment
      );
      qtiTestRef.current?.addEventListener(
        "qti-assessment-test-connected",
        () => {
          if (itemId) {
            const matchingItem = selectedAssessment?.items?.find(
              (i) => i.identifier === itemId
            );
            if (qtiTestRef.current && matchingItem) {
              const qtiTest = qtiTestRef.current;
              qtiTest.navigateTo("item", matchingItem.itemRefIdentifier);
            }
          } else {
            const firstItem = selectedAssessment?.items?.length
              ? selectedAssessment?.items[0]
              : null;
            if (firstItem !== null && qtiTestRef.current) {
              qtiTestRef.current.navigateTo(
                "item",
                firstItem.itemRefIdentifier
              );
            }
          }
        }
      );
    }
  }, [selectedAssessment, assessmentId, navigate, store, queryParams]);

  const items =
    state.itemsPerAssessment.find((i) => i.assessmentId === assessmentId)
      ?.items || [];

  const onEditItem = async () => {
    await store.dispatch(
      new OnEditItemAction({
        identifier: currentItemIdentifier,
      })
    );
    navigate("/preview");
  };

  if (!selectedAssessment) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="rounded-lg bg-white p-8 shadow-lg">
          <h2 className="mb-4 text-xl font-medium text-gray-700">
            No Assessment Selected
          </h2>
          <p className="mb-6 text-gray-600">
            Please select an assessment first to continue.
          </p>
          <button
            onClick={() => navigate("/package")}
            className="inline-flex items-center rounded-md bg-citolab-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-citolab-500 transition-colors"
          >
            Select new package
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col bg-gray-50 fixed top-0">
      {/* Fixed Header - Always visible */}
      <div className="flex-shrink-0 flex items-center justify-between bg-white px-4 py-3 shadow-md z-50">
        <div className="flex items-center space-x-3">
          <button
            className="inline-flex items-center rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
            onClick={() => navigate("/package")}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </button>
          <h1 className="text-lg font-medium text-gray-800">
            {selectedAssessment?.name || "Assessment"}
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          <button
            className="inline-flex items-center rounded-md bg-citolab-600 px-3 py-2 text-sm font-medium text-white hover:bg-citolab-500 transition-colors"
            onClick={onEditItem}
          >
            <Edit className="mr-1 h-4 w-4" />
            Edit QTI
          </button>
          <button
            className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              showVariables
                ? "bg-gray-200 text-gray-800"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            onClick={() => setShowVariables((current) => !current)}
          >
            <Code className="mr-1 h-4 w-4" />
            {showVariables ? "Hide Output" : "Show Output"}
          </button>
        </div>
      </div>

      {/* Main content area - takes remaining space */}
      <div className="flex-1 flex items-center justify-center px-4 py-4 min-h-0">
        <div className="w-full max-w-6xl h-full flex flex-col bg-white rounded-lg shadow-lg overflow-hidden">
          <qti-test
            ref={refCallback}
            cache-transform
            className="h-full flex flex-col"
          >
            <test-navigation
              initContext={items.map((item) => ({
                identifier: item.identifier,
                title: item.title,
                externalScored: item.interactionType === "extendedTextEntry",
              }))}
              auto-score-items
              className="h-full flex flex-col"
            >
              <test-stamp
                class="h-full flex flex-col"
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onqti-stamp-context-updated={(e: any) => {
                  setStampContext(e.detail);
                }}
              >
                {/* Mode Switch - Fixed at top of content */}
                <div className="flex-shrink-0 flex justify-center p-4 bg-gray-50 border-b">
                  <ModeSwitch
                    initialMode="candidate"
                    onCheck={(mode) => {
                      handleToggle(mode);
                    }}
                  />
                </div>

                {/* Scrollable content area */}
                <div className="flex-1 overflow-auto">
                  <div className="flex justify-center p-6 min-h-full">
                    <test-container
                      className="w-full max-w-4xl"
                      testXML={assessment?.content}
                      onqti-item-ref-uri-callback={async (
                        event: CustomEvent
                      ) => {
                        // Handle any legacy href-based item requests
                        const uri = event.detail?.uri;
                        if (uri && !uri.startsWith("blob:")) {
                          // Try to resolve from blob manager for backward compatibility
                          const content = await itemBlobManager.getItemByHref(
                            uri
                          );
                          if (content) {
                            event.detail.resolveWith(content);
                          }
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Fixed Bottom navigation - Always visible */}
                <div className="flex-shrink-0 border-t bg-white">
                  <nav className="flex justify-between items-center p-4 max-w-4xl mx-auto min-w-0">
                    <test-prev className="inline-flex items-center rounded-md bg-citolab-600 px-4 py-2 text-sm font-medium text-white hover:bg-citolab-500 transition-colors flex-shrink-0">
                      <ChevronLeft className="mr-1 h-4 w-4" />
                    </test-prev>
                    <div className="flex-1 min-w-0 flex justify-center">
                      <NavigationBar
                        onClick={(id) => {
                          if (qtiTestRef.current) {
                            qtiTestRef.current.navigateTo("item", id);
                          }
                        }}
                        stampContext={stampContext}
                      />
                    </div>
                    <test-next className="inline-flex items-center rounded-md bg-citolab-600 px-4 py-2 text-sm font-medium text-white hover:bg-citolab-500 transition-colors flex-shrink-0">
                      Next
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </test-next>
                  </nav>
                </div>
              </test-stamp>
              <DraggablePopup
                isOpen={showVariables}
                onClose={() => setShowVariables(false)}
                setIsOpen={setShowVariables}
                title={`Item Variable`}
              >
                <div className="bg-gray-50 p-3 rounded">
                  Item Id: {currentItemIdentifier}
                  <test-print-item-variables></test-print-item-variables>
                </div>
              </DraggablePopup>
            </test-navigation>
          </qti-test>
        </div>
      </div>
    </div>
  );
};
