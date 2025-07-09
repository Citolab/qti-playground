import React, { RefCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { UseStoreContext } from '../store/store-context';
import { initialState, OnEditItemAction, SelectAssessmentAction } from '../store/store';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
import { CustomElements } from '@citolab/qti-components/react';
import { QtiAssessmentItem, QtiTest, TestNavigation } from '@citolab/qti-components';
import { ChevronLeft, Edit, Code, ChevronRight } from 'lucide-react';

import DraggablePopup from '../components/draggable-popup';
import ModeSwitch from '../components/mode-switcher';
/* React */
declare module 'react' {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace JSX {
        // eslint-disable-next-line @typescript-eslint/no-empty-interface
        interface IntrinsicElements extends CustomElements {
            'style': React.DetailedHTMLProps<React.StyleHTMLAttributes<HTMLStyleElement>, HTMLStyleElement>;
        }
    }
}

export const AssessmentPage: React.FC = () => {
    const navigate = useNavigate();
    const qtiTestNavigationRef = useRef<TestNavigation>(null);
    const qtiTestRef = useRef<QtiTest>(null);
    const [queryParams] = useSearchParams();
    const [state, setState] = useState(initialState);
    const { store } = UseStoreContext();
    const [showVariables, setShowVariables] = useState(false);
    const [currentItemIdentifier, setCurrentItemIdentifier] = useState('');

    useEffect(() => {
        const subs = store.subscribe((setState));
        return () => subs?.unsubscribe();
    }, [store]);

    // Create a ref callback that can be passed directly to the element
    const refCallback: RefCallback<QtiTest> = (element) => {
        if (element) {
            // Store element in ref
            qtiTestRef.current = element;

            // Set up event listeners immediately
            element.addEventListener('qti-assessment-item-connected', handleItemConnected);
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
                qtiTestRef.current.removeEventListener('qti-assessment-item-connected', handleItemConnected);
            }
        };
    }, []);


    const { assessmentId } = useParams<{
        assessmentId: string;
    }>();
    const selectedAssessment = state.assessments?.find(a => a.assessmentId === state.selectedAssessment);
    const assessment = state.assessments?.find(a => a.assessmentId === assessmentId);


    const handleToggle = (mode: string) => {
        if (qtiTestRef.current)
            qtiTestRef.current.dispatchEvent(
                new CustomEvent('on-test-switch-view', {
                    composed: true,
                    bubbles: true,
                    detail: mode
                })
            );
    };

    useLayoutEffect(() => {
        if (selectedAssessment?.assessmentId !== assessmentId) {
            if (assessmentId) {
                store.dispatch(new SelectAssessmentAction({ assessmentId }));
            } else {
                navigate(`/assessment/${selectedAssessment?.assessmentId}`);
            }
        }
        const itemId = queryParams.get('item');
        if (qtiTestNavigationRef.current) {
            const selectedAssessment = state.assessments.find(a => a.assessmentId === state.selectedAssessment);
            qtiTestRef.current?.addEventListener('qti-assessment-test-connected', () => {
                if (itemId) {
                    const matchingItem = selectedAssessment?.items?.find(i => i.identifier === itemId);
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (qtiTestRef.current as any)?.navigateTo('item', matchingItem?.itemRefIdentifier);
                } else {

                    const firstItem = selectedAssessment?.items?.length ? selectedAssessment?.items[0] : null;
                    if (firstItem !== null && qtiTestRef.current) {
                        // @ts-expect-error
                        qtiTestRef.current.navigateTo('item', firstItem.itemRefIdentifier);
                    }
                }

            })
        }
    }, [selectedAssessment, assessmentId, navigate, store, queryParams]);

    const items = state.itemsPerAssessment.find(i => i.assessmentId === assessmentId)?.items || [];

    const onEditItem = async () => {
        await store.dispatch(new OnEditItemAction({
            identifier: currentItemIdentifier,
        }));
        navigate('/preview');
    };

    if (!selectedAssessment) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="rounded-lg bg-white p-8 shadow-lg">
                    <h2 className="mb-4 text-xl font-medium text-gray-700">No Assessment Selected</h2>
                    <p className="mb-6 text-gray-600">Please select an assessment first to continue.</p>
                    <button
                        onClick={() => navigate('/package')}
                        className="inline-flex items-center rounded-md bg-citolab-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-citolab-500 transition-colors"
                    >
                        Select new package
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full w-full items-center justify-center bg-gray-50">

            {/* Header bar with actions */}
            <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between bg-white px-4 py-3 shadow-md">
                <div className="flex items-center space-x-3">
                    <button
                        className="inline-flex items-center rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                        onClick={() => navigate('/package')}
                    >
                        <ChevronLeft className="mr-1 h-4 w-4" />
                        Back
                    </button>
                    <h1 className="text-lg font-medium text-gray-800">
                        {selectedAssessment?.name || 'Assessment'}
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
                        className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${showVariables
                            ? 'bg-gray-200 text-gray-800'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        onClick={() => setShowVariables(current => !current)}
                    >
                        <Code className="mr-1 h-4 w-4" />
                        {showVariables ? 'Hide Output' : 'Show Output'}
                    </button>
                </div>
            </div>

            {/* Main content */}
            <div className="relative flex h-full w-full flex-col bg-white p-4 overflow-auto mt-16 lg:max-h-[85vh] lg:max-w-6xl lg:rounded-lg lg:shadow-lg">
                <qti-test ref={refCallback} cache-transform className="h-full">
                    <test-navigation
                        initContext={items.map((item) => ({
                            identifier: item.identifier,
                            title: item.title,
                            externalScored: item.interactionType === 'extendedTextEntry'
                        }))}

                        ref={qtiTestNavigationRef}
                        auto-score-items
                        className="flex justify-center h-full overflow-hidden"
                    >
                        <div className="flex flex-col flex-1">
                            <ModeSwitch initialMode='candidate' onCheck={(mode) => {
                                handleToggle(mode);
                            }} />
                            <test-container
                                className="flex-1 overflow-auto p-6 bg-white rounded-lg"
                                testXML={assessment?.content}
                            />
                            <nav className="flex justify-between p-4 bg-gray-50 rounded-lg mt-4">
                                <test-prev className="inline-flex items-center rounded-md bg-citolab-600 px-4 py-2 text-sm font-medium text-white hover:bg-citolab-500 transition-colors">
                                    <ChevronLeft className="mr-1 h-4 w-4" />
                                    Previous
                                </test-prev>
                                <test-next className="inline-flex items-center rounded-md bg-citolab-600 px-4 py-2 text-sm font-medium text-white hover:bg-citolab-500 transition-colors">
                                    Next
                                    <ChevronRight className="ml-1 h-4 w-4" />
                                </test-next>
                            </nav>
                        </div>
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
                        {/* {openOutput && (
                            <div className="w-[300px] bg-white p-4 shadow-lg h-full overflow-auto border-l border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-medium text-gray-800">Output Panel</h3>
                                    <button
                                        className="text-gray-500 hover:text-gray-700 transition-colors"
                                        onClick={() => setOpenOutput(false)}
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                                <div className="p-2 bg-gray-50 rounded-md">
                                    <test-print-item-variables></test-print-item-variables>
                                </div>
                            </div>
                        )} */}
                    </test-navigation>
                </qti-test>
            </div>
        </div >
    );
};