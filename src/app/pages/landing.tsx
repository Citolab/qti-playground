import React, { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Editor as MonacoEditor } from "@monaco-editor/react";
import { useNavigate } from "react-router-dom";
import {
  GitCommit,
  Book,
  ArrowRight,
  Mail,
  Code2,
  Repeat,
  Shield,
  Package,
  Play,
  Layers,
  FlaskConical,
  Terminal,
  CheckCircle2,
  Zap,
  Lock,
} from "lucide-react";

import { itemCss } from "../itemCss";
import { QtiProsemirrorEditor } from "../components/editor/qti-prosemirror-editor";
import { QtiAssessmentItem } from "@citolab/qti-components";

const LANDING_CHOICE_ITEM_XML = `<qti-assessment-item xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" xsi:schema-location="http://www.imsglobal.org/xsd/imsqtiasi_v3p0 https://purl.imsglobal.org/spec/qti/v3p0/schema/xsd/imsqti_asiv3p0_v1p0.xsd" identifier="landing-choice-editor" title="Landing Choice Editor" adaptive="false" time-dependent="false">
  <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier"></qti-response-declaration>
  <qti-item-body>
    <qti-choice-interaction response-identifier="RESPONSE" shuffle="false" max-choices="1" min-choices="1">
      <qti-prompt>What do you want to do?</qti-prompt>
      <qti-simple-choice identifier="A">Create, edit and display items.</qti-simple-choice>
      <qti-simple-choice identifier="B">Create and theme your own assessment player</qti-simple-choice>
      <qti-simple-choice identifier="C">Convert QTI packages</qti-simple-choice>
      <qti-simple-choice identifier="D">Build PCI's</qti-simple-choice>
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

const LANDING_ITEM_FEATURES = `<qti-assessment-item xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"
	xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqtiasi_v3p0 https://purl.imsglobal.org/spec/qti/v3p0/schema/xsd/imsqti_asiv3p0_v1p0.xsd"
	identifier="choice" title="Unattended Luggage" adaptive="false" time-dependent="false">
	<qti-item-body>
		<qti-choice-interaction class="qti-input-control-hidden" response-identifier="RESPONSE" max-choices="0">
			<p>Here some features of this webapplication in a multiple response item</p>
			<qti-simple-choice identifier="A">
				<div
					class="flex items-start"><div class="flex-shrink-0"><div
							class="flex items-center justify-center h-12 w-12 rounded-md bg-secondary">
							<svg
								xmlns="http://www.w3.org/2000/svg" width="24" height="24"
								viewBox="0 0 24 24" fill="none" stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round" stroke-linejoin="round"
								class="lucide lucide-file-search h-6 w-6">
								<path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
								<path
									d="M4.268 21a2 2 0 0 0 1.727 1H18a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v3"></path>
								<path d="m9 18-1.5-1.5"></path>
								<circle cx="5" cy="14" r="3"></circle>
							</svg>
						</div></div>
					
						<div
						class="ml-4"><h3 class="text-lg font-medium text-gray-900">Preview QTI
				assessments</h3><p
							class="mt-2 text-base text-gray-500">Upload and instantly preview QTI
				2.x or QTI 3 assessments directly in your browser without sending any data to a
				server.</p></div></div>
			</qti-simple-choice>
			<qti-simple-choice identifier="B">
				<div
					class="flex items-start"><div class="flex-shrink-0"><div
							class="flex items-center justify-center h-12 w-12 rounded-md bg-secondary"><svg
								xmlns="http://www.w3.org/2000/svg" width="24" height="24"
								viewBox="0 0 24 24" fill="none" stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round" stroke-linejoin="round"
								class="lucide lucide-repeat h-6 w-6">
								<path d="m17 2 4 4-4 4"></path>
								<path d="M3 11v-1a4 4 0 0 1 4-4h14"></path>
								<path d="m7 22-4-4 4-4"></path>
								<path d="M21 13v1a4 4 0 0 1-4 4H3"></path>
							</svg></div></div><div
						class="ml-4"><h3 class="text-lg font-medium text-gray-900">Convert QTI 2.x
				to QTI 3</h3><p
							class="mt-2 text-base text-gray-500">Seamlessly convert between QTI
				formats using our powerful client-side conversion engine, ensuring compatibility
				across different assessment platforms.</p></div></div>
			</qti-simple-choice>
			<qti-simple-choice identifier="C">
				<div class="flex items-start"><div
						class="flex-shrink-0"><div
							class="flex items-center justify-center h-12 w-12 rounded-md bg-secondary"><svg
								xmlns="http://www.w3.org/2000/svg" width="24" height="24"
								viewBox="0 0 24 24" fill="none" stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round" stroke-linejoin="round"
								class="lucide lucide-split h-6 w-6">
								<path d="M16 3h5v5"></path>
								<path d="M8 3H3v5"></path>
								<path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3"></path>
								<path d="m15 9 6-6"></path>
							</svg></div></div><div
						class="ml-4"><h3 class="text-lg font-medium text-gray-900">Tools to remove
				media and split packages</h3><p class="mt-2 text-base text-gray-500">Optimize your
				QTI packages by removing unnecessary media files or splitting large packages into
				manageable pieces, all processed locally on your device.</p></div></div>
			</qti-simple-choice>
			<qti-simple-choice identifier="D">
				<div
					class="flex items-start"><div
						class="flex-shrink-0"><div
							class="flex items-center justify-center h-12 w-12 rounded-md bg-secondary"><svg
								xmlns="http://www.w3.org/2000/svg" width="24" height="24"
								viewBox="0 0 24 24" fill="none" stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round" stroke-linejoin="round"
								class="lucide lucide-square-pen h-6 w-6">
								<path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
								<path
									d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"></path>
							</svg></div></div><div
						class="ml-4"><h3 class="text-lg font-medium text-gray-900">Edit QTI items
				with a live previewer</h3><p class="mt-2 text-base text-gray-500">Make changes to
				your QTI items and see the results in real-time with our integrated editor and
				previewer, all running in your browser for maximum privacy.</p></div></div>
			</qti-simple-choice>
		</qti-choice-interaction>
	</qti-item-body>
</qti-assessment-item>`;

const PCI_BLOCKS_RESPONSE = {
  xPlane: [
    { y: 0, z: 0, found: false },
    { y: 0, z: 1, found: false },
    { y: 0, z: 2, found: false },
    { y: 0, z: 3, found: false },
    { y: 0, z: 4, found: true },
    { y: 0, z: 5, found: true },
    { y: 0, z: 6, found: false },
    { y: 0, z: 7, found: false },
    { y: 0, z: 8, found: true },
    { y: 0, z: 9, found: false },
    { y: 1, z: 0, found: false },
    { y: 1, z: 1, found: false },
    { y: 1, z: 2, found: false },
    { y: 1, z: 3, found: false },
    { y: 1, z: 4, found: true },
    { y: 1, z: 5, found: true },
    { y: 1, z: 6, found: false },
    { y: 1, z: 7, found: false },
    { y: 1, z: 8, found: true },
    { y: 1, z: 9, found: false },
    { y: 2, z: 0, found: false },
    { y: 2, z: 1, found: false },
    { y: 2, z: 2, found: false },
    { y: 2, z: 3, found: false },
    { y: 2, z: 4, found: true },
    { y: 2, z: 5, found: true },
    { y: 2, z: 6, found: false },
    { y: 2, z: 7, found: false },
    { y: 2, z: 8, found: true },
    { y: 2, z: 9, found: false },
    { y: 3, z: 0, found: false },
    { y: 3, z: 1, found: false },
    { y: 3, z: 2, found: false },
    { y: 3, z: 3, found: false },
    { y: 3, z: 4, found: false },
    { y: 3, z: 5, found: false },
    { y: 3, z: 6, found: false },
    { y: 3, z: 7, found: false },
    { y: 3, z: 8, found: false },
    { y: 3, z: 9, found: false },
    { y: 4, z: 0, found: false },
    { y: 4, z: 1, found: false },
    { y: 4, z: 2, found: false },
    { y: 4, z: 3, found: false },
    { y: 4, z: 4, found: false },
    { y: 4, z: 5, found: false },
    { y: 4, z: 6, found: false },
    { y: 4, z: 7, found: false },
    { y: 4, z: 8, found: false },
    { y: 4, z: 9, found: false },
    { y: 5, z: 0, found: false },
    { y: 5, z: 1, found: false },
    { y: 5, z: 2, found: false },
    { y: 5, z: 3, found: false },
    { y: 5, z: 4, found: false },
    { y: 5, z: 5, found: false },
    { y: 5, z: 6, found: false },
    { y: 5, z: 7, found: false },
    { y: 5, z: 8, found: false },
    { y: 5, z: 9, found: false },
    { y: 6, z: 0, found: false },
    { y: 6, z: 1, found: false },
    { y: 6, z: 2, found: false },
    { y: 6, z: 3, found: false },
    { y: 6, z: 4, found: false },
    { y: 6, z: 5, found: false },
    { y: 6, z: 6, found: false },
    { y: 6, z: 7, found: false },
    { y: 6, z: 8, found: false },
    { y: 6, z: 9, found: false },
    { y: 7, z: 0, found: false },
    { y: 7, z: 1, found: false },
    { y: 7, z: 2, found: false },
    { y: 7, z: 3, found: false },
    { y: 7, z: 4, found: false },
    { y: 7, z: 5, found: false },
    { y: 7, z: 6, found: false },
    { y: 7, z: 7, found: false },
    { y: 7, z: 8, found: false },
    { y: 7, z: 9, found: false },
    { y: 8, z: 0, found: false },
    { y: 8, z: 1, found: false },
    { y: 8, z: 2, found: false },
    { y: 8, z: 3, found: false },
    { y: 8, z: 4, found: false },
    { y: 8, z: 5, found: false },
    { y: 8, z: 6, found: false },
    { y: 8, z: 7, found: false },
    { y: 8, z: 8, found: false },
    { y: 8, z: 9, found: false },
    { y: 9, z: 0, found: false },
    { y: 9, z: 1, found: false },
    { y: 9, z: 2, found: false },
    { y: 9, z: 3, found: false },
    { y: 9, z: 4, found: false },
    { y: 9, z: 5, found: false },
    { y: 9, z: 6, found: false },
    { y: 9, z: 7, found: false },
    { y: 9, z: 8, found: false },
    { y: 9, z: 9, found: false },
  ],
  yPlane: [
    { x: 0, z: 0, found: false },
    { x: 0, z: 1, found: false },
    { x: 0, z: 2, found: false },
    { x: 0, z: 3, found: false },
    { x: 0, z: 4, found: false },
    { x: 0, z: 5, found: false },
    { x: 0, z: 6, found: false },
    { x: 0, z: 7, found: false },
    { x: 0, z: 8, found: true },
    { x: 0, z: 9, found: false },
    { x: 1, z: 0, found: false },
    { x: 1, z: 1, found: false },
    { x: 1, z: 2, found: false },
    { x: 1, z: 3, found: false },
    { x: 1, z: 4, found: false },
    { x: 1, z: 5, found: false },
    { x: 1, z: 6, found: false },
    { x: 1, z: 7, found: false },
    { x: 1, z: 8, found: true },
    { x: 1, z: 9, found: false },
    { x: 2, z: 0, found: false },
    { x: 2, z: 1, found: false },
    { x: 2, z: 2, found: false },
    { x: 2, z: 3, found: false },
    { x: 2, z: 4, found: false },
    { x: 2, z: 5, found: false },
    { x: 2, z: 6, found: false },
    { x: 2, z: 7, found: false },
    { x: 2, z: 8, found: true },
    { x: 2, z: 9, found: false },
    { x: 3, z: 0, found: false },
    { x: 3, z: 1, found: false },
    { x: 3, z: 2, found: false },
    { x: 3, z: 3, found: false },
    { x: 3, z: 4, found: false },
    { x: 3, z: 5, found: false },
    { x: 3, z: 6, found: false },
    { x: 3, z: 7, found: false },
    { x: 3, z: 8, found: true },
    { x: 3, z: 9, found: false },
    { x: 4, z: 0, found: false },
    { x: 4, z: 1, found: false },
    { x: 4, z: 2, found: false },
    { x: 4, z: 3, found: false },
    { x: 4, z: 4, found: false },
    { x: 4, z: 5, found: true },
    { x: 4, z: 6, found: false },
    { x: 4, z: 7, found: false },
    { x: 4, z: 8, found: false },
    { x: 4, z: 9, found: false },
    { x: 5, z: 0, found: false },
    { x: 5, z: 1, found: false },
    { x: 5, z: 2, found: false },
    { x: 5, z: 3, found: false },
    { x: 5, z: 4, found: false },
    { x: 5, z: 5, found: true },
    { x: 5, z: 6, found: false },
    { x: 5, z: 7, found: false },
    { x: 5, z: 8, found: false },
    { x: 5, z: 9, found: false },
    { x: 6, z: 0, found: false },
    { x: 6, z: 1, found: false },
    { x: 6, z: 2, found: false },
    { x: 6, z: 3, found: false },
    { x: 6, z: 4, found: false },
    { x: 6, z: 5, found: true },
    { x: 6, z: 6, found: false },
    { x: 6, z: 7, found: false },
    { x: 6, z: 8, found: false },
    { x: 6, z: 9, found: false },
    { x: 7, z: 0, found: false },
    { x: 7, z: 1, found: false },
    { x: 7, z: 2, found: false },
    { x: 7, z: 3, found: false },
    { x: 7, z: 4, found: false },
    { x: 7, z: 5, found: false },
    { x: 7, z: 6, found: false },
    { x: 7, z: 7, found: false },
    { x: 7, z: 8, found: false },
    { x: 7, z: 9, found: false },
    { x: 8, z: 0, found: false },
    { x: 8, z: 1, found: false },
    { x: 8, z: 2, found: false },
    { x: 8, z: 3, found: false },
    { x: 8, z: 4, found: true },
    { x: 8, z: 5, found: false },
    { x: 8, z: 6, found: false },
    { x: 8, z: 7, found: false },
    { x: 8, z: 8, found: false },
    { x: 8, z: 9, found: false },
    { x: 9, z: 0, found: false },
    { x: 9, z: 1, found: false },
    { x: 9, z: 2, found: false },
    { x: 9, z: 3, found: false },
    { x: 9, z: 4, found: false },
    { x: 9, z: 5, found: false },
    { x: 9, z: 6, found: false },
    { x: 9, z: 7, found: false },
    { x: 9, z: 8, found: false },
    { x: 9, z: 9, found: false },
  ],
  zPlane: [
    { x: 0, y: 0, found: true },
    { x: 0, y: 1, found: true },
    { x: 0, y: 2, found: true },
    { x: 0, y: 3, found: false },
    { x: 0, y: 4, found: false },
    { x: 0, y: 5, found: false },
    { x: 0, y: 6, found: false },
    { x: 0, y: 7, found: false },
    { x: 0, y: 8, found: false },
    { x: 0, y: 9, found: false },
    { x: 1, y: 0, found: true },
    { x: 1, y: 1, found: false },
    { x: 1, y: 2, found: true },
    { x: 1, y: 3, found: false },
    { x: 1, y: 4, found: false },
    { x: 1, y: 5, found: false },
    { x: 1, y: 6, found: false },
    { x: 1, y: 7, found: false },
    { x: 1, y: 8, found: false },
    { x: 1, y: 9, found: false },
    { x: 2, y: 0, found: true },
    { x: 2, y: 1, found: true },
    { x: 2, y: 2, found: true },
    { x: 2, y: 3, found: false },
    { x: 2, y: 4, found: false },
    { x: 2, y: 5, found: false },
    { x: 2, y: 6, found: false },
    { x: 2, y: 7, found: false },
    { x: 2, y: 8, found: false },
    { x: 2, y: 9, found: false },
    { x: 3, y: 0, found: true },
    { x: 3, y: 1, found: false },
    { x: 3, y: 2, found: false },
    { x: 3, y: 3, found: false },
    { x: 3, y: 4, found: false },
    { x: 3, y: 5, found: false },
    { x: 3, y: 6, found: false },
    { x: 3, y: 7, found: false },
    { x: 3, y: 8, found: false },
    { x: 3, y: 9, found: false },
    { x: 4, y: 0, found: false },
    { x: 4, y: 1, found: false },
    { x: 4, y: 2, found: true },
    { x: 4, y: 3, found: false },
    { x: 4, y: 4, found: false },
    { x: 4, y: 5, found: false },
    { x: 4, y: 6, found: false },
    { x: 4, y: 7, found: false },
    { x: 4, y: 8, found: false },
    { x: 4, y: 9, found: false },
    { x: 5, y: 0, found: true },
    { x: 5, y: 1, found: true },
    { x: 5, y: 2, found: true },
    { x: 5, y: 3, found: false },
    { x: 5, y: 4, found: false },
    { x: 5, y: 5, found: false },
    { x: 5, y: 6, found: false },
    { x: 5, y: 7, found: false },
    { x: 5, y: 8, found: false },
    { x: 5, y: 9, found: false },
    { x: 6, y: 0, found: false },
    { x: 6, y: 1, found: false },
    { x: 6, y: 2, found: true },
    { x: 6, y: 3, found: false },
    { x: 6, y: 4, found: false },
    { x: 6, y: 5, found: false },
    { x: 6, y: 6, found: false },
    { x: 6, y: 7, found: false },
    { x: 6, y: 8, found: false },
    { x: 6, y: 9, found: false },
    { x: 7, y: 0, found: false },
    { x: 7, y: 1, found: false },
    { x: 7, y: 2, found: false },
    { x: 7, y: 3, found: false },
    { x: 7, y: 4, found: false },
    { x: 7, y: 5, found: false },
    { x: 7, y: 6, found: false },
    { x: 7, y: 7, found: false },
    { x: 7, y: 8, found: false },
    { x: 7, y: 9, found: false },
    { x: 8, y: 0, found: true },
    { x: 8, y: 1, found: true },
    { x: 8, y: 2, found: true },
    { x: 8, y: 3, found: false },
    { x: 8, y: 4, found: false },
    { x: 8, y: 5, found: false },
    { x: 8, y: 6, found: false },
    { x: 8, y: 7, found: false },
    { x: 8, y: 8, found: false },
    { x: 8, y: 9, found: false },
    { x: 9, y: 0, found: false },
    { x: 9, y: 1, found: false },
    { x: 9, y: 2, found: false },
    { x: 9, y: 3, found: false },
    { x: 9, y: 4, found: false },
    { x: 9, y: 5, found: false },
    { x: 9, y: 6, found: false },
    { x: 9, y: 7, found: false },
    { x: 9, y: 8, found: false },
    { x: 9, y: 9, found: false },
  ],
};

function prettyPrintXml(xml: string): string {
  const indentUnit = "  ";
  const escapeText = (value: string) =>
    value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const escapeAttribute = (value: string) =>
    escapeText(value).replace(/"/g, "&quot;");

  const formatElement = (element: Element, level: number): string => {
    const indent = indentUnit.repeat(level);
    const attrs = Array.from(element.attributes)
      .map((attr) => `${attr.name}="${escapeAttribute(attr.value)}"`)
      .join(" ");
    const openTag = attrs
      ? `<${element.tagName} ${attrs}>`
      : `<${element.tagName}>`;
    const closeTag = `</${element.tagName}>`;

    const meaningfulChildren = Array.from(element.childNodes).filter((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) return true;
      if (node.nodeType === Node.TEXT_NODE) {
        return Boolean(node.textContent?.trim());
      }
      return false;
    });

    if (meaningfulChildren.length === 0) {
      return `${indent}${openTag}${closeTag}`;
    }

    if (
      meaningfulChildren.length === 1 &&
      meaningfulChildren[0].nodeType === Node.TEXT_NODE
    ) {
      const textValue = escapeText(
        meaningfulChildren[0].textContent?.trim() ?? "",
      );
      return `${indent}${openTag}${textValue}${closeTag}`;
    }

    const childLines = meaningfulChildren.map((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        return formatElement(node as Element, level + 1);
      }
      const textValue = escapeText(node.textContent?.trim() ?? "");
      return `${indentUnit.repeat(level + 1)}${textValue}`;
    });

    return `${indent}${openTag}\n${childLines.join("\n")}\n${indent}${closeTag}`;
  };

  try {
    const documentNode = new DOMParser().parseFromString(
      xml,
      "application/xml",
    );
    if (documentNode.querySelector("parsererror")) {
      return xml;
    }
    return formatElement(documentNode.documentElement, 0);
  } catch {
    return xml;
  }
}

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [landingChoiceXml, setLandingChoiceXml] = useState(
    LANDING_CHOICE_ITEM_XML,
  );
  const prettyLandingChoiceXml = useMemo(
    () => prettyPrintXml(landingChoiceXml),
    [landingChoiceXml],
  );

  const restoreResponses = useCallback(
    (
      assessmentItem: QtiAssessmentItem | null,
      responses: Record<string, unknown>,
    ) => {
      if (!assessmentItem) return;

      // set assessmentItem.variables add if not exists or update if exists with the value from responses
      for (const [identifier, value] of Object.entries(responses)) {
        assessmentItem.updateResponseVariable(
          identifier,
          JSON.stringify(value),
        );
      }
    },
    [],
  );

  const onConnected = useCallback(
    (e: CustomEvent) => {
      const assessmentItem = e.detail as QtiAssessmentItem;
      restoreResponses(assessmentItem, {
        RESPONSE2: PCI_BLOCKS_RESPONSE,
      });
    },
    [restoreResponses],
  );

  return (
    <TooltipProvider>
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-citolab-50/20 to-citolab-teal-50/20">
      {/* Hero Section with Side-by-Side Layout on Large Screens */}
      <div className="pt-16 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="lg:flex lg:items-center lg:gap-12">
          {/* Text Content */}
          <div className="lg:w-1/2">
            <div className="animate-fade-in-up">
              <Badge
                variant="outline"
                className="mb-4 border-citolab-600 text-citolab-600 px-3 py-1 text-sm"
              >
                <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 inline" />
                Open Source · 1EdTech Certified
              </Badge>
            </div>
            <h1
              className="text-4xl font-extrabold sm:text-5xl sm:tracking-tight lg:text-6xl bg-linear-to-r from-citolab-700 to-citolab-teal-500 bg-clip-text text-transparent animate-fade-in-up pb-1"
              style={{ animationDelay: "100ms" }}
            >
              CitoLab open-source QTI tooling
            </h1>
            <p
              className="mt-6 max-w-2xl text-xl text-gray-500 animate-fade-in-up"
              style={{ animationDelay: "200ms" }}
            >
              Convert and display QTI packages with our open-source QTI
              components and conversion tools
            </p>
            <div
              className="mt-6 flex flex-wrap gap-3 animate-fade-in-up"
              style={{ animationDelay: "300ms" }}
            >
              <span className="inline-flex items-center gap-1.5 rounded-full bg-citolab-50 px-3 py-1 text-sm font-medium text-citolab-700 ring-1 ring-inset ring-citolab-600/20">
                <Layers className="h-3.5 w-3.5" />
                5 open-source libraries
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-citolab-teal-50 px-3 py-1 text-sm font-medium text-citolab-teal-700 ring-1 ring-inset ring-citolab-teal-500/20">
                <Zap className="h-3.5 w-3.5" />
                1EdTech Certified
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                <Lock className="h-3.5 w-3.5" />
                100% client-side
              </span>
            </div>
            <div
              className="mt-8 animate-fade-in-up"
              style={{ animationDelay: "400ms" }}
            >
              <Button
                size="lg"
                onClick={() => navigate("/package")}
                className="shadow-lg hover:shadow-xl transition-shadow"
              >
                Select your QTI package
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Editor preview */}
          <div className="mt-8 lg:mt-0 lg:w-1/2">
            <div className="mt-4 bg-gray-100 rounded-lg p-4">
              <div className="h-[24rem] overflow-auto">
                <QtiProsemirrorEditor
                  sourceXml={landingChoiceXml}
                  onSourceChange={(nextXml) => setLandingChoiceXml(nextXml)}
                  className="h-full rounded border border-gray-200 bg-white p-4"
                  showToolbar={true}
                />
              </div>
            </div>
            <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950 p-4">
              <MonacoEditor
                height="18rem"
                language="xml"
                theme="vs-dark"
                value={prettyLandingChoiceXml}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  lineNumbers: "on",
                  folding: true,
                  glyphMargin: false,
                  scrollBeyondLastLine: false,
                  wordWrap: "off",
                  renderLineHighlight: "none",
                }}
              />
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

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* QTI Player - always full width */}
            <Card className="sm:col-span-2 overflow-hidden hover:shadow-md transition-shadow duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2">
                {/* Left: text content */}
                <div className="relative flex flex-col gap-4 p-8">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center p-3 bg-citolab-yellow-500 rounded-md shadow-sm">
                      <Play className="h-6 w-6" />
                    </span>
                    <Badge variant="outline" className="border-citolab-600/30 text-citolab-600 text-xs">
                      Reference Player
                    </Badge>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 tracking-tight">
                      QTI Player
                    </h3>
                    <p className="mt-2 text-base text-gray-500">
                      A minimal, fully functional example of a QTI Player
                      using @citolab/qti-components. It serves as a "Hello
                      World" or cookbook-style reference for implementing a
                      QTI player.
                    </p>
                  </div>
                  <div className="flex items-center gap-5">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a
                          href="https://github.com/Citolab/qti-player"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm font-medium text-citolab-600 hover:text-citolab-500"
                        >
                          <GitCommit className="h-4 w-4 mr-1.5" />
                          GitHub
                        </a>
                      </TooltipTrigger>
                      <TooltipContent>View on GitHub</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a
                          href="https://stackblitz.com/~/github.com/Citolab/qti-player?file=index.html"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm font-medium text-citolab-600 hover:text-citolab-500"
                        >
                          <Book className="h-4 w-4 mr-1.5" />
                          Stackblitz
                        </a>
                      </TooltipTrigger>
                      <TooltipContent>Open in Stackblitz</TooltipContent>
                    </Tooltip>
                  </div>
                  <a
                    href="https://site.imsglobal.org/certifications/cito/cito-qti-player"
                    className="absolute bottom-3 right-3"
                  >
                    <img
                      src="/1edtech_trusted-apps-certified.svg"
                      alt="1EdTech Trusted Apps Certified"
                      className="w-20"
                    />
                  </a>
                </div>
                {/* Right: PCI preview */}
                <div className="bg-gray-50 border-t sm:border-t-0 sm:border-l border-gray-200 flex items-center justify-center p-4">
                  <qti-item onqti-assessment-item-connected={onConnected}>
                    <item-container itemXML={LANDING_PCI_ITEM_XML}>
                      <template
                        dangerouslySetInnerHTML={{
                          __html: `<style>${itemCss}</style>`,
                        }}
                      ></template>
                    </item-container>
                  </qti-item>
                </div>
              </div>
            </Card>

            {/* QTI Components */}
            <Card className="hover:-translate-y-1 hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 mb-2">
                  <span className="inline-flex items-center justify-center p-3 bg-citolab-yellow-500 rounded-md shadow-sm">
                    <Code2 className="h-6 w-6" />
                  </span>
                  <Badge variant="outline" className="border-citolab-600/30 text-citolab-600 text-xs">
                    Web Components
                  </Badge>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 tracking-tight">QTI Components</h3>
              </CardHeader>
              <CardContent>
                <p className="text-base text-gray-500">
                  A web component library that renders QTI items in any web
                  application. Highly customizable and easy to integrate.
                </p>
                <div className="mt-6 flex flex-wrap gap-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a href="https://github.com/citolab/qti-components" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm font-medium text-citolab-600 hover:text-citolab-500">
                        <GitCommit className="h-5 w-5 mr-2" />GitHub
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>View source on GitHub</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a href="https://www.npmjs.com/package/@citolab/qti-components" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm font-medium text-citolab-600 hover:text-citolab-500">
                        <Package className="h-5 w-5 mr-2" />npm
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>Install from npm</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a href="https://qti-components.citolab.nl/?path=/docs/%F0%9F%91%8B-hi-qti--docs" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm font-medium text-citolab-600 hover:text-citolab-500">
                        <Book className="h-5 w-5 mr-2" />Storybook
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>Browse Storybook docs</TooltipContent>
                  </Tooltip>
                </div>
              </CardContent>
            </Card>

            {/* QTI Convert */}
            <Card className="hover:-translate-y-1 hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 mb-2">
                  <span className="inline-flex items-center justify-center p-3 bg-citolab-yellow-500 rounded-md shadow-sm">
                    <Repeat className="h-6 w-6" />
                  </span>
                  <Badge variant="outline" className="border-citolab-600/30 text-citolab-600 text-xs">
                    Conversion Engine
                  </Badge>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 tracking-tight">QTI Convert</h3>
              </CardHeader>
              <CardContent>
                <p className="text-base text-gray-500">
                  A library that enables seamless conversion between QTI 2.x
                  and QTI 3 formats, ensuring compatibility across different
                  assessment platforms.
                </p>
                <div className="mt-6 flex flex-wrap gap-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a href="https://github.com/citolab/qti-convert" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm font-medium text-citolab-600 hover:text-citolab-500">
                        <GitCommit className="h-5 w-5 mr-2" />GitHub
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>View source on GitHub</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a href="https://www.npmjs.com/package/@citolab/qti-convert" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm font-medium text-citolab-600 hover:text-citolab-500">
                        <Package className="h-5 w-5 mr-2" />npm
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>Install from npm</TooltipContent>
                  </Tooltip>
                </div>
              </CardContent>
            </Card>

            {/* QTI Playground */}
            <Card className="hover:-translate-y-1 hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 mb-2">
                  <span className="inline-flex items-center justify-center p-3 bg-citolab-yellow-500 rounded-md shadow-sm">
                    <FlaskConical className="h-6 w-6" />
                  </span>
                  <Badge variant="outline" className="border-citolab-600/30 text-citolab-600 text-xs">
                    This App
                  </Badge>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 tracking-tight">QTI Playground</h3>
              </CardHeader>
              <CardContent>
                <p className="text-base text-gray-500">
                  The application you are seeing now is open source as well
                </p>
                <div className="mt-6 flex flex-wrap gap-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a href="https://github.com/citolab/qti-playground" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm font-medium text-citolab-600 hover:text-citolab-500">
                        <GitCommit className="h-5 w-5 mr-2" />GitHub
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>View source on GitHub</TooltipContent>
                  </Tooltip>
                </div>
              </CardContent>
            </Card>

            {/* tspci */}
            <Card className="hover:-translate-y-1 hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 mb-2">
                  <span className="inline-flex items-center justify-center p-3 bg-citolab-yellow-500 rounded-md shadow-sm">
                    <Terminal className="h-6 w-6" />
                  </span>
                  <Badge variant="outline" className="border-citolab-600/30 text-citolab-600 text-xs">
                    PCI Dev Tool
                  </Badge>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 tracking-tight">tspci</h3>
              </CardHeader>
              <CardContent>
                <p className="text-base text-gray-500">
                  A library and CLI tool for software developers to spin up
                  a PCI (Portable Custom Interaction) development
                  environment in a few seconds. It makes it easy to test,
                  develop and debug custom interactions for QTI Components.
                  The bundling automatically includes 3rd party libraries
                  and images.
                </p>
                <div className="mt-6 flex flex-wrap gap-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a href="https://github.com/citolab/tspci" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm font-medium text-citolab-600 hover:text-citolab-500">
                        <GitCommit className="h-5 w-5 mr-2" />GitHub
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>View source on GitHub</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a href="https://www.npmjs.com/package/@citolab/tspci" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm font-medium text-citolab-600 hover:text-citolab-500">
                        <Package className="h-5 w-5 mr-2" />npm
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>Install from npm</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a href="https://github.com/citolab/tspci-examples" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm font-medium text-citolab-600 hover:text-citolab-500">
                        <Package className="h-5 w-5 mr-2" />Examples
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>Browse PCI examples on GitHub</TooltipContent>
                  </Tooltip>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-linear-to-r from-citolab-700 to-citolab-teal-700">
        <div className="max-w-2xl mx-auto text-center py-12 px-4 sm:py-16 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Ready to convert your QTI packages?
          </h2>
          <p className="mt-4 text-lg leading-6 text-citolab-200">
            Start using our converter today - it's free and powered by
            open-source technology.
          </p>
          <Button
            onClick={() => navigate("/package")}
            className="mt-8 w-full sm:w-auto bg-white text-citolab-600 hover:bg-gray-100 hover:shadow-lg transition-shadow"
            size="lg"
          >
            Get Started
          </Button>
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
                <item-container itemXML={LANDING_ITEM_FEATURES}>
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
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
          <div className="lg:grid lg:grid-cols-3 lg:gap-8 lg:items-center">
            <div className="bg-linear-to-br from-citolab-700 to-citolab-teal-700 rounded-xl p-6">
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                Need Help?
              </h2>
              <p className="mt-3 text-white text-lg">
                Have questions about our QTI tools or need assistance with your
                implementation? Our team of developers is ready to help.
              </p>
              <div className="mt-8 flex items-center gap-3">
                <Mail className="h-6 w-6 text-white shrink-0" />
                <p className="text-base text-white">
                  Contact one of our developers for support or questions
                </p>
              </div>
            </div>

            {/* Team - shows to the right on large screens */}
            <div className="mt-8 lg:mt-0">
              <div className="space-y-6">
                {[
                  { name: "Romy Noordhof", role: "Head of team prototyping", email: "romy.noordhof@cito.nl", initials: "RN", color: "bg-citolab-100 text-citolab-700" },
                  { name: "Patrick de Klein", role: "Frontend developer / UX Specialist", email: "Patrick.deKlein@cito.nl", initials: "PK", color: "bg-citolab-teal-100 text-citolab-teal-700" },
                  { name: "Marcel Hoekstra", role: "Fullstack Developer", email: "marcel.hoekstra@cito.nl", initials: "MH", color: "bg-citolab-yellow-100 text-citolab-yellow-700" },
                ].map(({ name, role, email, initials, color }) => (
                  <a key={email} href={`mailto:${email}`} className="flex items-center gap-4 group">
                    <div className={`shrink-0 h-10 w-10 rounded-full ${color} flex items-center justify-center font-semibold text-sm`}>
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-medium text-gray-900 group-hover:text-citolab-600 transition-colors">
                        {name}
                      </h3>
                      <p className="text-sm text-gray-500">{role}</p>
                    </div>
                    <Mail className="h-4 w-4 text-gray-400 shrink-0 group-hover:text-citolab-500 transition-colors" />
                  </a>
                ))}
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
    </TooltipProvider>
  );
};

export default LandingPage;
