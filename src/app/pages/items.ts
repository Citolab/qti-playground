    export const qtiLandingChoice = `<qti-assessment-item xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" xsi:schema-location="http://www.imsglobal.org/xsd/imsqtiasi_v3p0 https://purl.imsglobal.org/spec/qti/v3p0/schema/xsd/imsqti_asiv3p0_v1p0.xsd" identifier="choice" title="Unattended Luggage" adaptive="false" time-dependent="false">
  <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
  </qti-response-declaration>
    <qti-response-declaration identifier="RESPONSE2" cardinality="single" base-type="identifier">
  </qti-response-declaration>
  <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float">
    <qti-default-value>
      <qti-value>0</qti-value>
    </qti-default-value>
  </qti-outcome-declaration>
  <qti-item-body>
    <p>QTI component can be integrated into nearly any web application, regardless of the frontend framework you use.</p>
    <p>
        <qti-portable-custom-interaction custom-interaction-type-identifier="blocks"
          data-version="1.0.0" data-grid-divisions="10" data-cube-pixel-size="80"
          data-height="200" module="blocks" response-identifier="RESPONSE2">
          <qti-interaction-modules>
            <qti-interaction-module id="blocks"
              primary-path="/pci/blocks/interaction/runtime/js/index.js" />
          </qti-interaction-modules>
          <qti-interaction-markup>
            <div class="pciInteraction">
              <div class="prompt" />
              <ul class="pci" />
            </div>
          </qti-interaction-markup>
        </qti-portable-custom-interaction>
    </p>
    <qti-choice-interaction response-identifier="RESPONSE" shuffle="false" max-choices="1" min-choices="1">
      <qti-prompt>What do you want to do?</qti-prompt>
      <qti-simple-choice identifier="ChoiceA">Use QTI-components to display items.</qti-simple-choice>
      <qti-simple-choice identifier="ChoiceB">Theme your own assessment player.</qti-simple-choice>
      <qti-simple-choice identifier="ChoiceC">Use our tooling to modify our convert QTI packages</qti-simple-choice>
      <qti-simple-choice identifier="ChoiceD">Use our tooling that empowers software developers with a head start in building PCIs by generating boilerplate code using a simple CLI.</qti-simple-choice>
    </qti-choice-interaction>
  </qti-item-body>
</qti-assessment-item>`;
    export const qtiLandingFeatures = `<qti-assessment-item xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
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
</qti-assessment-item>`


export const blocksConfig = { "gridDivisions": "10", "cubePixelSize": "100", "width": "600", "height": "600", "changegridDivisions": "10" };
export const blocksQtiResponse = {"xPlane":[{"y":0,"z":0,"found":false},{"y":0,"z":1,"found":false},{"y":0,"z":2,"found":false},{"y":0,"z":3,"found":false},{"y":0,"z":4,"found":true},{"y":0,"z":5,"found":true},{"y":0,"z":6,"found":false},{"y":0,"z":7,"found":false},{"y":0,"z":8,"found":true},{"y":0,"z":9,"found":false},{"y":1,"z":0,"found":false},{"y":1,"z":1,"found":false},{"y":1,"z":2,"found":false},{"y":1,"z":3,"found":false},{"y":1,"z":4,"found":true},{"y":1,"z":5,"found":true},{"y":1,"z":6,"found":false},{"y":1,"z":7,"found":false},{"y":1,"z":8,"found":true},{"y":1,"z":9,"found":false},{"y":2,"z":0,"found":false},{"y":2,"z":1,"found":false},{"y":2,"z":2,"found":false},{"y":2,"z":3,"found":false},{"y":2,"z":4,"found":true},{"y":2,"z":5,"found":true},{"y":2,"z":6,"found":false},{"y":2,"z":7,"found":false},{"y":2,"z":8,"found":true},{"y":2,"z":9,"found":false},{"y":3,"z":0,"found":false},{"y":3,"z":1,"found":false},{"y":3,"z":2,"found":false},{"y":3,"z":3,"found":false},{"y":3,"z":4,"found":false},{"y":3,"z":5,"found":false},{"y":3,"z":6,"found":false},{"y":3,"z":7,"found":false},{"y":3,"z":8,"found":false},{"y":3,"z":9,"found":false},{"y":4,"z":0,"found":false},{"y":4,"z":1,"found":false},{"y":4,"z":2,"found":false},{"y":4,"z":3,"found":false},{"y":4,"z":4,"found":false},{"y":4,"z":5,"found":false},{"y":4,"z":6,"found":false},{"y":4,"z":7,"found":false},{"y":4,"z":8,"found":false},{"y":4,"z":9,"found":false},{"y":5,"z":0,"found":false},{"y":5,"z":1,"found":false},{"y":5,"z":2,"found":false},{"y":5,"z":3,"found":false},{"y":5,"z":4,"found":false},{"y":5,"z":5,"found":false},{"y":5,"z":6,"found":false},{"y":5,"z":7,"found":false},{"y":5,"z":8,"found":false},{"y":5,"z":9,"found":false},{"y":6,"z":0,"found":false},{"y":6,"z":1,"found":false},{"y":6,"z":2,"found":false},{"y":6,"z":3,"found":false},{"y":6,"z":4,"found":false},{"y":6,"z":5,"found":false},{"y":6,"z":6,"found":false},{"y":6,"z":7,"found":false},{"y":6,"z":8,"found":false},{"y":6,"z":9,"found":false},{"y":7,"z":0,"found":false},{"y":7,"z":1,"found":false},{"y":7,"z":2,"found":false},{"y":7,"z":3,"found":false},{"y":7,"z":4,"found":false},{"y":7,"z":5,"found":false},{"y":7,"z":6,"found":false},{"y":7,"z":7,"found":false},{"y":7,"z":8,"found":false},{"y":7,"z":9,"found":false},{"y":8,"z":0,"found":false},{"y":8,"z":1,"found":false},{"y":8,"z":2,"found":false},{"y":8,"z":3,"found":false},{"y":8,"z":4,"found":false},{"y":8,"z":5,"found":false},{"y":8,"z":6,"found":false},{"y":8,"z":7,"found":false},{"y":8,"z":8,"found":false},{"y":8,"z":9,"found":false},{"y":9,"z":0,"found":false},{"y":9,"z":1,"found":false},{"y":9,"z":2,"found":false},{"y":9,"z":3,"found":false},{"y":9,"z":4,"found":false},{"y":9,"z":5,"found":false},{"y":9,"z":6,"found":false},{"y":9,"z":7,"found":false},{"y":9,"z":8,"found":false},{"y":9,"z":9,"found":false}],"yPlane":[{"x":0,"z":0,"found":false},{"x":0,"z":1,"found":false},{"x":0,"z":2,"found":false},{"x":0,"z":3,"found":false},{"x":0,"z":4,"found":false},{"x":0,"z":5,"found":false},{"x":0,"z":6,"found":false},{"x":0,"z":7,"found":false},{"x":0,"z":8,"found":true},{"x":0,"z":9,"found":false},{"x":1,"z":0,"found":false},{"x":1,"z":1,"found":false},{"x":1,"z":2,"found":false},{"x":1,"z":3,"found":false},{"x":1,"z":4,"found":false},{"x":1,"z":5,"found":false},{"x":1,"z":6,"found":false},{"x":1,"z":7,"found":false},{"x":1,"z":8,"found":true},{"x":1,"z":9,"found":false},{"x":2,"z":0,"found":false},{"x":2,"z":1,"found":false},{"x":2,"z":2,"found":false},{"x":2,"z":3,"found":false},{"x":2,"z":4,"found":false},{"x":2,"z":5,"found":false},{"x":2,"z":6,"found":false},{"x":2,"z":7,"found":false},{"x":2,"z":8,"found":true},{"x":2,"z":9,"found":false},{"x":3,"z":0,"found":false},{"x":3,"z":1,"found":false},{"x":3,"z":2,"found":false},{"x":3,"z":3,"found":false},{"x":3,"z":4,"found":false},{"x":3,"z":5,"found":false},{"x":3,"z":6,"found":false},{"x":3,"z":7,"found":false},{"x":3,"z":8,"found":true},{"x":3,"z":9,"found":false},{"x":4,"z":0,"found":false},{"x":4,"z":1,"found":false},{"x":4,"z":2,"found":false},{"x":4,"z":3,"found":false},{"x":4,"z":4,"found":false},{"x":4,"z":5,"found":true},{"x":4,"z":6,"found":false},{"x":4,"z":7,"found":false},{"x":4,"z":8,"found":false},{"x":4,"z":9,"found":false},{"x":5,"z":0,"found":false},{"x":5,"z":1,"found":false},{"x":5,"z":2,"found":false},{"x":5,"z":3,"found":false},{"x":5,"z":4,"found":false},{"x":5,"z":5,"found":true},{"x":5,"z":6,"found":false},{"x":5,"z":7,"found":false},{"x":5,"z":8,"found":false},{"x":5,"z":9,"found":false},{"x":6,"z":0,"found":false},{"x":6,"z":1,"found":false},{"x":6,"z":2,"found":false},{"x":6,"z":3,"found":false},{"x":6,"z":4,"found":false},{"x":6,"z":5,"found":true},{"x":6,"z":6,"found":false},{"x":6,"z":7,"found":false},{"x":6,"z":8,"found":false},{"x":6,"z":9,"found":false},{"x":7,"z":0,"found":false},{"x":7,"z":1,"found":false},{"x":7,"z":2,"found":false},{"x":7,"z":3,"found":false},{"x":7,"z":4,"found":false},{"x":7,"z":5,"found":false},{"x":7,"z":6,"found":false},{"x":7,"z":7,"found":false},{"x":7,"z":8,"found":false},{"x":7,"z":9,"found":false},{"x":8,"z":0,"found":false},{"x":8,"z":1,"found":false},{"x":8,"z":2,"found":false},{"x":8,"z":3,"found":false},{"x":8,"z":4,"found":true},{"x":8,"z":5,"found":false},{"x":8,"z":6,"found":false},{"x":8,"z":7,"found":false},{"x":8,"z":8,"found":false},{"x":8,"z":9,"found":false},{"x":9,"z":0,"found":false},{"x":9,"z":1,"found":false},{"x":9,"z":2,"found":false},{"x":9,"z":3,"found":false},{"x":9,"z":4,"found":false},{"x":9,"z":5,"found":false},{"x":9,"z":6,"found":false},{"x":9,"z":7,"found":false},{"x":9,"z":8,"found":false},{"x":9,"z":9,"found":false}],"zPlane":[{"x":0,"y":0,"found":true},{"x":0,"y":1,"found":true},{"x":0,"y":2,"found":true},{"x":0,"y":3,"found":false},{"x":0,"y":4,"found":false},{"x":0,"y":5,"found":false},{"x":0,"y":6,"found":false},{"x":0,"y":7,"found":false},{"x":0,"y":8,"found":false},{"x":0,"y":9,"found":false},{"x":1,"y":0,"found":true},{"x":1,"y":1,"found":false},{"x":1,"y":2,"found":true},{"x":1,"y":3,"found":false},{"x":1,"y":4,"found":false},{"x":1,"y":5,"found":false},{"x":1,"y":6,"found":false},{"x":1,"y":7,"found":false},{"x":1,"y":8,"found":false},{"x":1,"y":9,"found":false},{"x":2,"y":0,"found":true},{"x":2,"y":1,"found":true},{"x":2,"y":2,"found":true},{"x":2,"y":3,"found":false},{"x":2,"y":4,"found":false},{"x":2,"y":5,"found":false},{"x":2,"y":6,"found":false},{"x":2,"y":7,"found":false},{"x":2,"y":8,"found":false},{"x":2,"y":9,"found":false},{"x":3,"y":0,"found":true},{"x":3,"y":1,"found":false},{"x":3,"y":2,"found":false},{"x":3,"y":3,"found":false},{"x":3,"y":4,"found":false},{"x":3,"y":5,"found":false},{"x":3,"y":6,"found":false},{"x":3,"y":7,"found":false},{"x":3,"y":8,"found":false},{"x":3,"y":9,"found":false},{"x":4,"y":0,"found":false},{"x":4,"y":1,"found":false},{"x":4,"y":2,"found":true},{"x":4,"y":3,"found":false},{"x":4,"y":4,"found":false},{"x":4,"y":5,"found":false},{"x":4,"y":6,"found":false},{"x":4,"y":7,"found":false},{"x":4,"y":8,"found":false},{"x":4,"y":9,"found":false},{"x":5,"y":0,"found":true},{"x":5,"y":1,"found":true},{"x":5,"y":2,"found":true},{"x":5,"y":3,"found":false},{"x":5,"y":4,"found":false},{"x":5,"y":5,"found":false},{"x":5,"y":6,"found":false},{"x":5,"y":7,"found":false},{"x":5,"y":8,"found":false},{"x":5,"y":9,"found":false},{"x":6,"y":0,"found":false},{"x":6,"y":1,"found":false},{"x":6,"y":2,"found":true},{"x":6,"y":3,"found":false},{"x":6,"y":4,"found":false},{"x":6,"y":5,"found":false},{"x":6,"y":6,"found":false},{"x":6,"y":7,"found":false},{"x":6,"y":8,"found":false},{"x":6,"y":9,"found":false},{"x":7,"y":0,"found":false},{"x":7,"y":1,"found":false},{"x":7,"y":2,"found":false},{"x":7,"y":3,"found":false},{"x":7,"y":4,"found":false},{"x":7,"y":5,"found":false},{"x":7,"y":6,"found":false},{"x":7,"y":7,"found":false},{"x":7,"y":8,"found":false},{"x":7,"y":9,"found":false},{"x":8,"y":0,"found":true},{"x":8,"y":1,"found":true},{"x":8,"y":2,"found":true},{"x":8,"y":3,"found":false},{"x":8,"y":4,"found":false},{"x":8,"y":5,"found":false},{"x":8,"y":6,"found":false},{"x":8,"y":7,"found":false},{"x":8,"y":8,"found":false},{"x":8,"y":9,"found":false},{"x":9,"y":0,"found":false},{"x":9,"y":1,"found":false},{"x":9,"y":2,"found":false},{"x":9,"y":3,"found":false},{"x":9,"y":4,"found":false},{"x":9,"y":5,"found":false},{"x":9,"y":6,"found":false},{"x":9,"y":7,"found":false},{"x":9,"y":8,"found":false},{"x":9,"y":9,"found":false}]}