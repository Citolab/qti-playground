import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  GitCommit,
  Book,
  ArrowRight,
  Mail,
  Code,
  Repeat,
  Shield,
  Package,
  FlaskConical,
} from "lucide-react";
import {
  qtiLandingFeatures,
  blocksQtiResponse,
} from "./items";
import { itemCss } from "../itemCss";
import { QtiProsemirrorEditor } from "../components/editor/qti-prosemirror-editor";

const LANDING_CHOICE_ITEM_XML = `<qti-assessment-item xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" xsi:schema-location="http://www.imsglobal.org/xsd/imsqtiasi_v3p0 https://purl.imsglobal.org/spec/qti/v3p0/schema/xsd/imsqti_asiv3p0_v1p0.xsd" identifier="landing-choice-editor" title="Landing Choice Editor" adaptive="false" time-dependent="false">
  <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier"></qti-response-declaration>
  <qti-item-body>
    <qti-choice-interaction response-identifier="RESPONSE" shuffle="false" max-choices="1" min-choices="1">
      <qti-prompt>What do you want to do?</qti-prompt>
      <qti-simple-choice identifier="ChoiceA">Use QTI-components to display items.</qti-simple-choice>
      <qti-simple-choice identifier="ChoiceB">Theme your own assessment player.</qti-simple-choice>
      <qti-simple-choice identifier="ChoiceC">Use our tooling to modify our convert QTI packages</qti-simple-choice>
      <qti-simple-choice identifier="ChoiceD">Use our tooling that empowers software developers with a head start in building PCIs by generating boilerplate code using a simple CLI.</qti-simple-choice>
    </qti-choice-interaction>
  </qti-item-body>
</qti-assessment-item>`;

const LANDING_PCI_ITEM_XML = `<qti-assessment-item xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" xsi:schema-location="http://www.imsglobal.org/xsd/imsqtiasi_v3p0 https://purl.imsglobal.org/spec/qti/v3p0/schema/xsd/imsqti_asiv3p0_v1p0.xsd" identifier="landing-pci" title="Landing PCI" adaptive="false" time-dependent="false">
  <qti-response-declaration identifier="RESPONSE2" cardinality="single" base-type="string"></qti-response-declaration>
  <qti-item-body>
    <p>QTI component can be integrated into nearly any web application, regardless of the frontend framework you use.</p>
    <p>
      <qti-portable-custom-interaction custom-interaction-type-identifier="blocks" data-version="1.0.0" data-grid-divisions="10" data-cube-pixel-size="80" data-height="280" module="blocks" response-identifier="RESPONSE2">
        <qti-interaction-modules>
          <qti-interaction-module id="blocks" primary-path="pci/blocks/interaction/runtime/js/index.js" />
        </qti-interaction-modules>
        <qti-interaction-markup>
          <div class="pciInteraction">
            <div class="prompt" />
            <ul class="pci" />
          </div>
        </qti-interaction-markup>
      </qti-portable-custom-interaction>
    </p>
  </qti-item-body>
</qti-assessment-item>`;

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const pciItemRef = useRef<HTMLElement | null>(null);
  const [isInlineEditorOpen, setIsInlineEditorOpen] = useState(false);
  const [landingChoiceXml, setLandingChoiceXml] = useState(LANDING_CHOICE_ITEM_XML);

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 24;
    const serializedResponse = JSON.stringify(blocksQtiResponse);

    const applyResponse = (): boolean => {
      const container = pciItemRef.current?.querySelector("item-container");
      const assessmentItem = container?.shadowRoot?.querySelector(
        "qti-assessment-item",
      ) as
        | {
            updateResponseVariable?: (identifier: string, value: string) => void;
            getResponse?: (identifier: string) => { value?: unknown } | null;
            shadowRoot?: ShadowRoot | null;
            querySelector?: (selector: string) => Element | null;
          }
        | null;

      assessmentItem?.updateResponseVariable?.("RESPONSE2", serializedResponse);

      const pciElement = assessmentItem?.shadowRoot?.querySelector(
        "qti-portable-custom-interaction"
      ) as
        | {
            setResponse?: (value: unknown) => void;
            getResponse?: () => unknown;
          }
        | null;
      const pciElementInLightDom = assessmentItem?.querySelector?.(
        "qti-portable-custom-interaction"
      ) as
        | {
            setResponse?: (value: unknown) => void;
            getResponse?: () => unknown;
          }
        | null;
      pciElement?.setResponse?.(serializedResponse);
      pciElement?.setResponse?.(blocksQtiResponse);
      pciElementInLightDom?.setResponse?.(serializedResponse);
      pciElementInLightDom?.setResponse?.(blocksQtiResponse);

      const currentResponse =
        assessmentItem?.getResponse?.("RESPONSE2")?.value ??
        pciElement?.getResponse?.() ??
        pciElementInLightDom?.getResponse?.();
      if (
        currentResponse !== null &&
        currentResponse !== undefined &&
        String(currentResponse) !== ""
      ) {
        return true;
      }
      return false;
    };

    const startTimer = window.setTimeout(() => {
      const interval = window.setInterval(() => {
        const settled = applyResponse();
        attempts += 1;
        if (settled || attempts >= maxAttempts) {
          window.clearInterval(interval);
        }
      }, 650);
    }, 1200);

    return () => {
      window.clearTimeout(startTimer);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section with Side-by-Side Layout on Large Screens */}
      <div className="pt-16 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="lg:flex lg:items-center lg:gap-12">
          {/* Text Content */}
          <div className="lg:w-1/2">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
              CitoLab open-source QTI tooling
            </h1>
            <p className="mt-6 max-w-2xl text-xl text-gray-500">
              Convert and display QTI packages with our open-source QTI
              components and conversion tools
            </p>
            <div className="mt-10">
              <button
                onClick={() => navigate("/package")}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-citolab-600 hover:bg-citolab-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-citolab-500"
              >
                Select your QTI package
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Hero Image - only on larger screens */}
          <div className="mt-8 lg:mt-0 lg:w-1/2">
            <div className="mt-4 bg-gray-100 rounded-lg p-4 -mb-40">
              <qti-item ref={pciItemRef}>
                <item-container itemXML={LANDING_PCI_ITEM_XML}>
                  <template
                    dangerouslySetInnerHTML={{
                      __html: `<style>${itemCss}</style>`,
                    }}
                  ></template>
                </item-container>
              </qti-item>
            </div>
            <div className="mt-4 bg-gray-100 rounded-lg p-4">
              <div className="h-[24rem] overflow-auto">
                {isInlineEditorOpen ? (
                  <QtiProsemirrorEditor
                    sourceXml={landingChoiceXml}
                    onSourceChange={(nextXml) => setLandingChoiceXml(nextXml)}
                    className="h-full overflow-auto rounded border border-gray-200 bg-white p-4"
                  />
                ) : (
                  <qti-item>
                    <item-container itemXML={landingChoiceXml}>
                      <template
                        dangerouslySetInnerHTML={{
                          __html: `<style>${itemCss}</style>`,
                        }}
                      ></template>
                    </item-container>
                  </qti-item>
                )}
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() =>
                  setIsInlineEditorOpen((current) => !current)
                }
                className="inline-flex items-center gap-x-1.5 rounded-md border border-citolab-600 px-2.5 py-1.5 text-sm font-semibold text-citolab-700 hover:bg-citolab-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-citolab-600"
              >
                <FlaskConical className="-ml-0.5 h-4 w-4" aria-hidden="true" />
                {isInlineEditorOpen ? "Save" : "Try our editor now!"}
                <span className="rounded bg-citolab-600 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-white">
                  Beta
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Libraries Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-citolab-600 tracking-wide uppercase">
              Open Source Libraries
            </h2>
            <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Powered by CitoLab
            </p>
          </div>

          <div className="mt-12">
            {/* 
                          On mobile: 1 column
                          On small screens: 2 columns, except QTI Player (spans 2)
                        */}
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              {/* QTI Player - always full width */}
              <div className="pt-6 bg-gray-100 relative sm:col-span-2">
                <div className="flow-root rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-[#f6c900] rounded-md shadow-lg">
                        <Repeat className="h-6 w-6" />
                      </span>
                    </div>
                    <a href="https://site.imsglobal.org/certifications/cito/cito-qti-player">
                      <img
                        src="/1edtech_trusted-apps-certified.svg"
                        alt="1EdTech Trusted Apps Certified"
                        className="absolute bottom-4 right-4 w-24"
                      />
                    </a>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                      QTI Player
                    </h3>
                    <p className="mt-5 text-base text-gray-500">
                      a minimal, fully functional example of a QTI Player using
                      @citolab/qti-components. It serves as a "Hello World" or
                      cookbook-style reference for implementing a QTI player
                    </p>
                    <div className="mt-18">
                      <a
                        href="https://github.com/Citolab/qti-player"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm font-medium text-citolab-600 hover:text-citolab-500 mr-5"
                      >
                        <GitCommit className="h-5 w-5 mr-2" />
                        GitHub
                      </a>
                      <a
                        href="https://stackblitz.com/~/github.com/Citolab/qti-player?file=index.html"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm font-medium text-citolab-600 hover:text-citolab-500"
                      >
                        <Book className="h-5 w-5 mr-2" />
                        Stackblitz
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* QTI Components */}
              <div className="pt-6 bg-gray-100">
                <div className="flow-root rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-[#f6c900] rounded-md shadow-lg">
                        <Code className="h-6 w-6" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                      QTI Components
                    </h3>
                    <p className="mt-5 text-base text-gray-500">
                      A web component library that renders QTI items in any web
                      application. Highly customizable and easy to integrate.
                    </p>
                    <div className="mt-6 flex space-x-4">
                      <a
                        href="https://github.com/citolab/qti-components"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm font-medium text-citolab-600 hover:text-citolab-500"
                      >
                        <GitCommit className="h-5 w-5 mr-2" />
                        GitHub
                      </a>
                      <a
                        href="https://www.npmjs.com/package/@citolab/qti-components"
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

              {/* QTI Convert */}
              <div className="pt-6 bg-gray-100">
                <div className="flow-root rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3  bg-[#f6c900] rounded-md shadow-lg">
                        <Repeat className="h-6 w-6" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                      QTI Convert
                    </h3>
                    <p className="mt-5 text-base text-gray-500">
                      A library that enables seamless conversion between QTI 2.x
                      and QTI 3 formats, ensuring compatibility across different
                      assessment platforms.
                    </p>
                    <div className="mt-6">
                      <a
                        href="https://github.com/citolab/qti-convert"
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

              {/* QTI Playground */}
              <div className="pt-6 bg-gray-100">
                <div className="flow-root rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-[#f6c900] rounded-md shadow-lg">
                        <Repeat className="h-6 w-6" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                      QTI Playground
                    </h3>
                    <p className="mt-5 text-base text-gray-500">
                      The application you are seeing now is open source as well
                    </p>
                    <div className="mt-6">
                      <a
                        href="https://github.com/citolab/qti-playground"
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

              {/* tspci */}
              <div className="pt-6 bg-gray-100">
                <div className="flow-root rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3  bg-[#f6c900] rounded-md shadow-lg">
                        <Repeat className="h-6 w-6" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                      tspci
                    </h3>
                    <p className="mt-5 text-base text-gray-500">
                      A library and CLI tool for software developers to spin up
                      a PCI (Portable Custom Interaction) development
                      environment in a few seconds. It makes it easy to test,
                      develop and debug custom interactions for QTI Components.
                      The bundling automatically includes 3rd party libraries
                      and images.
                    </p>
                    <div className="mt-6">
                      <a
                        href="https://github.com/citolab/tspci"
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
                        href="https://github.com/citolab/tspci-examples"
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
            Start using our converter today - it's free and powered by
            open-source technology.
          </p>
          <button
            onClick={() => navigate("/package")}
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
            <h2 className="text-base font-semibold text-citolab-600 tracking-wide uppercase">
              Features
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              This application uses powerful open-source libraries developed by
              CitoLab
            </p>

            {/* Client-side processing callout */}
            <div className="mt-6 inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800">
              <Shield className="h-5 w-5 mr-2" />
              <span className="font-medium">Client-side Processing</span>
            </div>
          </div>

          {/* Feature List */}
          <div className="mt-12 max-w-3xl mx-auto">
            <div className="bg-gray-100 rounded-lg p-4 pr-8">
              <qti-item>
                <item-container itemXML={qtiLandingFeatures}>
                  <template
                    dangerouslySetInnerHTML={{
                      __html: `<style>${itemCss}</style>`,
                    }}
                  ></template>
                </item-container>
              </qti-item>
            </div>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
          <div className="lg:grid lg:grid-cols-3 lg:gap-8 lg:items-center">
            <div className="bg-citolab-700 rounded-lg p-4 text-w">
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                Need Help?
              </h2>
              <p className="mt-3 max-w-3xl text-white text-lg">
                Have questions about our QTI tools or need assistance with your
                implementation? Our team of developers is ready to help.
              </p>
              <div className="mt-8">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-3 text-base text-white">
                    <p>
                      Contact one of our developers for support or questions
                    </p>
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
                    <a
                      href="mailto:romy.noordhof@cito.nl"
                      className="text-base text-citolab-600 hover:text-citolab-500"
                    >
                      <h3 className="text-lg font-medium text-gray-900">
                        Romy Noordhof
                      </h3>
                      <p className="text-sm text-gray-500">
                        Head of team prototyping
                      </p>
                    </a>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <Mail className="h-5 w-5 text-citolab-500" />
                  </div>
                  <div className="ml-3">
                    <a
                      href="mailto:Patrick.deKlein@cito.nl"
                      className="text-base text-citolab-600 hover:text-citolab-500"
                    >
                      <h3 className="text-lg font-medium text-gray-900">
                        Patrick de Klein
                      </h3>
                      <p className="text-sm text-gray-500">
                        Frontend developer/ UX Specialist
                      </p>
                    </a>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <Mail className="h-5 w-5 text-citolab-500" />
                  </div>
                  <div className="ml-3">
                    <a
                      href="mailto:marcel.hoekstra@cito.nl"
                      className="text-base text-citolab-600 hover:text-citolab-500"
                    >
                      <h3 className="text-lg font-medium text-gray-900">
                        Marcel Hoekstra
                      </h3>
                      <p className="text-sm text-gray-500">
                        Fullstack Developer
                      </p>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <a href="https://site.imsglobal.org/certifications/cito/cito-qti-player">
              <img
                src="/1edtech_trusted-apps-certified.svg"
                alt="1EdTech Trusted Apps Certified"
                className="m-12 w-auto"
              />
            </a>
          </div>
        </div>
      </div>

      {/* Footer with improved padding for smaller screens */}
      <footer className="bg-gray-50">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:py-12 lg:px-8">
          <div className="pb-6 border-b border-gray-200">
            <p className="text-center text-base text-gray-400">
              &copy; {new Date().getFullYear()} CitoLab. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
