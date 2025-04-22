import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GitCommit, Book, ArrowRight, Mail, Code, Repeat, Shield, Package } from 'lucide-react';
import { blocksQtiResponse, qtiLandingChoice, qtiLandingFeatures } from './items';
import itemCss from './item.css?inline'
import { QtiAssessmentItem, QtiItem, QtiPortableCustomInteraction } from '@citolab/qti-components';
export const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const qtiLandingChoiceRef = useRef<QtiItem>(null);

    useEffect(() => {
        if (qtiLandingChoiceRef.current) {
            // NORMALLY YOU WOULD NOT RESTORE THE RESPONSE IN A SINGLE QTI ITEM. 
            // FOR QTI-TEST THERE IS A PROPER WAY TO DO THIS, BUT FOR THIS DEMO IT IS OK
            const qtiItem = qtiLandingChoiceRef.current as QtiItem;
            qtiItem.addEventListener('qti-assessment-item-connected', (e) => {
                const assessmentItem = (e as CustomEvent<QtiAssessmentItem>).detail;
                assessmentItem.updateResponseVariable('RESPONSE2', JSON.stringify(blocksQtiResponse));
            });
            setTimeout(() => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const assessmentItem = (qtiItem as any)._qtiAssessmentItem as QtiAssessmentItem;
                const interaction = assessmentItem.querySelector('qti-portable-custom-interaction[response-identifier="RESPONSE2"]') as QtiPortableCustomInteraction;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                // const pci = (interaction as any).pci;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                if (interaction) {
                    interaction.value = JSON.stringify(blocksQtiResponse);
                }
            }, 200);
        }
    }, [qtiLandingChoiceRef,]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
            {/* Hero Section with Side-by-Side Layout on Large Screens */}
            <div className="pt-16 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="lg:flex lg:items-center lg:gap-12">
                    {/* Text Content */}
                    <div className="lg:w-1/2">
                        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
                            Citolab open-source QTI tooling
                        </h1>
                        <p className="mt-6 max-w-2xl text-xl text-gray-500">
                            Convert and display QTI packages with our open-source QTI components and conversion tools
                        </p>
                        <div className="mt-10">
                            <button
                                onClick={() => navigate('/upload')}
                                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-citolab-600 hover:bg-citolab-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-citolab-500"
                            >
                                Upload your QTI package
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Hero Image - only on larger screens */}
                    <div className="mt-8 lg:mt-0 lg:w-1/2">
                        <div className='bg-gray-100 rounded-lg p-4'>
                            <qti-item ref={qtiLandingChoiceRef}>
                                <item-container itemXML={qtiLandingChoice}>
                                    <template dangerouslySetInnerHTML={{ __html: `<style>${itemCss}</style>` }}>
                                    </template>
                                </item-container>
                            </qti-item>
                        </div>
                    </div>
                </div>
            </div>


            {/* Libraries Section */}
            <div className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-base font-semibold text-citolab-600 tracking-wide uppercase">Open Source Libraries</h2>
                        <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
                            Powered by Citolab
                        </p>
                    </div>

                    <div className="mt-12">
                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                            <div className="pt-6 bg-gray-100 ">
                                <div className="flow-root rounded-lg px-6 pb-8">
                                    <div className="-mt-6">
                                        <div>
                                            <span className="inline-flex items-center justify-center p-3 bg-[#f6c900] rounded-md shadow-lg">
                                                <Code className="h-6 w-6" />
                                            </span>
                                        </div>
                                        <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">QTI Components</h3>
                                        <p className="mt-5 text-base text-gray-500">
                                            A web component library that renders QTI items in any web application. Highly customizable and easy to integrate.
                                        </p>
                                        <div className="mt-6 flex space-x-4">
                                            <a
                                                href="https://github.com/Citolab/qti-components"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center text-sm font-medium text-citolab-600 hover:text-citolab-500"
                                            >
                                                <GitCommit className="h-5 w-5 mr-2" />
                                                GitHub
                                            </a>
                                            <a
                                                href="https://www.npmjs.com/package/@citolab/tspci"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center text-sm font-medium text-citolab-600 hover:text-citolab-500"
                                            >
                                                <Package className="h-5 w-5 mr-2" />
                                                npm
                                            </a>
                                            <a
                                                href="https://qti-components.citolab.nl/?path=/docs/%F0%9F%91%8B-hi-qti--docs"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center text-sm font-medium text-citolab-600 hover:text-citolab-500"
                                            >
                                                <Book className="h-5 w-5 mr-2" />
                                                Storybook
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 bg-gray-100">
                                <div className="flow-root rounded-lg px-6 pb-8">
                                    <div className="-mt-6">
                                        <div>
                                            <span className="inline-flex items-center justify-center p-3  bg-[#f6c900] rounded-md shadow-lg">
                                                <Repeat className="h-6 w-6" />
                                            </span>
                                        </div>
                                        <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">QTI Convert</h3>
                                        <p className="mt-5 text-base text-gray-500">
                                            A library that enables seamless conversion between QTI 2.x and QTI 3 formats, ensuring compatibility across different assessment platforms.
                                        </p>
                                        <div className="mt-6">
                                            <a
                                                href="https://github.com/Citolab/qti-convert"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center text-sm font-medium text-citolab-600 hover:text-citolab-500 mr-5"
                                            >
                                                <GitCommit className="h-5 w-5 mr-2" />
                                                GitHub
                                            </a>
                                            <a
                                                href="https://www.npmjs.com/package/@citolab/qti-convert"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center text-sm font-medium text-citolab-600 hover:text-citolab-500"
                                            >
                                                <Package className="h-5 w-5 mr-2" />
                                                npm
                                            </a>

                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="pt-6 bg-gray-100">
                                <div className="flow-root rounded-lg px-6 pb-8">
                                    <div className="-mt-6">
                                        <div>
                                            <span className="inline-flex items-center justify-center p-3  bg-[#f6c900] rounded-md shadow-lg">
                                                <Repeat className="h-6 w-6" />
                                            </span>
                                        </div>
                                        <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">tspci</h3>
                                        <p className="mt-5 text-base text-gray-500">
                                            A library and CLI tool for software developers to spin up a PCI (Portable Custom Interaction) development environment in a few seconds.
                                            It makes it easy to test, develop and debug custom interactions for QTI Components.
                                            The bundling automatically includes 3rd party libraries and images.
                                        </p>
                                        <div className="mt-6">
                                            <a
                                                href="https://github.com/Citolab/tspci"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center text-sm font-medium text-citolab-600 hover:text-citolab-500 mr-5"
                                            >
                                                <GitCommit className="h-5 w-5 mr-2" />
                                                GitHub
                                            </a>
                                            <a
                                                href="https://www.npmjs.com/package/@citolab/tspci"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center text-sm font-medium text-citolab-600 hover:text-citolab-500 mr-5"
                                            >
                                                <Package className="h-5 w-5 mr-2" />
                                                npm
                                            </a>
                                            <a
                                                href="https://github.com/Citolab/tspci-examples"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center text-sm font-medium text-citolab-600 hover:text-citolab-500"
                                            >
                                                <Package className="h-5 w-5 mr-2" />
                                                GitHub examples
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="pt-6 bg-gray-100">
                                <div className="flow-root rounded-lg px-6 pb-8">
                                    <div className="-mt-6">
                                        <div>
                                            <span className="inline-flex items-center justify-center p-3 bg-[#f6c900] rounded-md shadow-lg">
                                                <Repeat className="h-6 w-6" />
                                            </span>
                                        </div>
                                        <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">QTI Playground</h3>
                                        <p className="mt-5 text-base text-gray-500">
                                            The application you are seeing now is open source as well
                                        </p>
                                        <div className="mt-6">
                                            <a
                                                href="https://github.com/Citolab/qti-playground"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center text-sm font-medium text-citolab-600 hover:text-citolab-500"
                                            >
                                                <GitCommit className="h-5 w-5 mr-2" />
                                                GitHub
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div className="bg-citolab-700">
                <div className="max-w-2xl mx-auto text-center py-12 px-4 sm:py-16 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                        Ready to convert your QTI packages?
                    </h2>
                    <p className="mt-4 text-lg leading-6 text-citolab-200">
                        Start using our converter today - it's free and powered by open-source technology.
                    </p>
                    <button
                        onClick={() => navigate('/upload')}
                        className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-citolab-600 bg-white hover:bg-gray-100 sm:w-auto"
                    >
                        Get Started
                    </button>
                </div>
            </div>


            {/* Enhanced Features Section */}
            <div className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-base font-semibold text-citolab-600 tracking-wide uppercase">Features</h2>
                        <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
                            This application uses powerful open-source libraries developed by Citolab
                        </p>

                        {/* Client-side processing callout */}
                        <div className="mt-6 inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800">
                            <Shield className="h-5 w-5 mr-2" />
                            <span className="font-medium">Client-side Processing</span>
                        </div>
                    </div>

                    {/* Feature List */}
                    <div className="mt-12 max-w-3xl mx-auto">
                        <div className='bg-gray-100 rounded-lg p-4 pr-8'>
                            <qti-item>
                                <item-container itemXML={qtiLandingFeatures}>
                                    <template dangerouslySetInnerHTML={{ __html: `<style>${itemCss}</style>` }}>
                                    </template>
                                </item-container>
                            </qti-item>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact */}
            <div className="bg-white">
                <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
                    <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
                        <div className='bg-citolab-700 rounded-lg p-4 text-w'>
                            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                                Need Help?
                            </h2>
                            <p className="mt-3 max-w-3xl text-white text-lg">
                                Have questions about our QTI tools or need assistance with your implementation? Our team of developers is ready to help.
                            </p>
                            <div className="mt-8">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <Mail className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="ml-3 text-base text-white">
                                        <p>Contact one of our developers for support or questions</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Email addresses - Shows to the right on large screens, below on small screens */}
                        <div className="mt-8 lg:mt-0">
                            <div className="space-y-6">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <Mail className="h-5 w-5 text-citolab-500" />
                                    </div>
                                    <div className="ml-3">
                                        <a href="mailto:romy.noordhof@cito.nl" className="text-base text-citolab-600 hover:text-citolab-500">
                                            <h3 className="text-lg font-medium text-gray-900">Romy Noordhof</h3>
                                            <p className="text-sm text-gray-500">Head of team prototyping</p>
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <Mail className="h-5 w-5 text-citolab-500" />
                                    </div>
                                    <div className="ml-3">
                                        <a href="mailto:Patrick.deKlein@cito.nl" className="text-base text-citolab-600 hover:text-citolab-500">
                                            <h3 className="text-lg font-medium text-gray-900">Patrick de Klein</h3>
                                            <p className="text-sm text-gray-500">Frontend developer/ UX Specialist</p>
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <Mail className="h-5 w-5 text-citolab-500" />
                                    </div>
                                    <div className="ml-3">
                                        <a href="mailto:marcel.hoekstra@cito.nl" className="text-base text-citolab-600 hover:text-citolab-500">
                                            <h3 className="text-lg font-medium text-gray-900">Marcel Hoekstra</h3>
                                            <p className="text-sm text-gray-500">Fullstack Developer</p>

                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer with improved padding for smaller screens */}
            <footer className="bg-gray-50">
                <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:py-12 lg:px-8">
                    <div className="pb-6 border-b border-gray-200">
                        <p className="text-center text-base text-gray-400">
                            &copy; {new Date().getFullYear()} Citolab. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div >
    );
};

export default LandingPage;