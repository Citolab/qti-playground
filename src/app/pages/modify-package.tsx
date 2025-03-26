import React, { useState, useEffect } from 'react';
import { removeMediaFromPackage, removeItemsFromPackage } from '@citolab/qti-convert/qti-helper';
import { convertPackage } from '@citolab/qti-convert/qti-convert';
import { saveAs } from 'file-saver';
import {
    Upload,
    CheckCircle,
    AlertCircle,
    FileText,
    Settings,
    Trash2,
    X,
    List,
    BookOpen,
    ArrowUp
} from 'lucide-react';
import { Terms } from '../components/terms';

// Define the tab options
type TabType = 'upgrade' | 'media' | 'items';

export const ModifyPackagePage: React.FC = () => {
    const [error, setError] = useState<string | null>(null);
    const [inProgress, setInProgress] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [processComplete, setProcessComplete] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('upgrade');
    const [filters, setFilters] = useState({
        video: true,
        audio: true,
        image: false,
        css: false,
        fs500k: false,
    });

    // Item removal state
    const [itemCount, setItemCount] = useState<number>(0);
    const [startIndex, setStartIndex] = useState<number>(0);
    const [endIndex, setEndIndex] = useState<number>(0);
    const [itemsLoaded, setItemsLoaded] = useState(false);
    const [removedItems, setRemovedItems] = useState<string[]>([]);
    const [removedWebcontent, setRemovedWebcontent] = useState<number>(0);

    const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);
        const file = event.dataTransfer?.files[0] || null;
        setSelectedFile(file);
        if (validateFile(file)) {
            if (activeTab === 'items') {
                analyzeItemsInPackage(file);
            }
        }
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);
    };

    const validateFile = (file: File | null) => {
        if (!file) return false;

        setError(null);

        // if (file.size > 10485760 * 3) {
        //     setError('File size should not exceed 30MB');
        //     return false;
        // }

        if (!file.name.endsWith('.zip')) {
            setError('Only .zip files are allowed');
            return false;
        }

        return true;
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files ? event.target.files[0] : null;
        setSelectedFile(file);
        if (validateFile(file)) {
            if (activeTab === 'items' && file) {
                analyzeItemsInPackage(file);
            }
        }
    };

    const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = event.target;
        setFilters(prev => ({
            ...prev,
            [name]: checked
        }));
    };

    const clearSelection = () => {
        setSelectedFile(null);
        setError(null);
        setProcessComplete(false);
        setItemCount(0);
        setStartIndex(0);
        setEndIndex(0);
        setItemsLoaded(false);
        setRemovedItems([]);
    };

    // This function analyzes a QTI package to count the number of assessment items
    const analyzeItemsInPackage = async (file: File) => {
        try {
            setInProgress(true);
            setUploadProgress(0);

            // Simulate progress updates
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => Math.min(prev + 10, 90));
            }, 100);

            // Use JSZip to read the file to count items
            const JSZip = (await import('jszip')).default;
            const zip = await JSZip.loadAsync(file);

            let assessmentItemCount = 0;

            // Scan files to find QTI assessment test with item refs
            for (const relativePath of Object.keys(zip.files)) {
                const zipEntry = zip.files[relativePath];
                const fileType = relativePath.split('.').pop();

                if (fileType === 'xml') {
                    const content = await zipEntry.async('string');

                    // Check if this contains assessment item refs
                    if (content.includes('qti-assessment-item-ref') || content.includes('assessmentItemRef')) {
                        // Count the occurrences of item references
                        const itemRefMatches = content.match(/<(qti-assessment-item-ref|assessmentItemRef)/g);
                        if (itemRefMatches) {
                            assessmentItemCount = itemRefMatches.length;
                            break;
                        }
                    }
                }
            }

            clearInterval(progressInterval);
            setUploadProgress(100);

            // Set the item count and default range
            setItemCount(assessmentItemCount);
            setStartIndex(0);
            setEndIndex(assessmentItemCount > 0 ? assessmentItemCount - 1 : 0);
            setItemsLoaded(true);

            setTimeout(() => {
                setInProgress(false);
            }, 300);
        } catch (e) {
            console.error(e);
            setError('An error occurred analyzing the package');
            setInProgress(false);
        }
    };

    const processFile = async () => {
        if (!selectedFile || !validateFile(selectedFile)) return;

        try {
            setInProgress(true);
            setUploadProgress(0);
            setProcessComplete(false);

            // Simulate progress updates
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => Math.min(prev + 5, 90));
            }, 200);

            let blob;
            const fileName = selectedFile.name;
            const newName = fileName.substring(0, fileName.lastIndexOf('.')) || '';
            let newZipName = '';

            if (activeTab === 'media') {
                // Handle media removal
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const selectedFilters = Object.keys(filters).filter(key => (filters as any)[key]);
                blob = await removeMediaFromPackage(selectedFile, selectedFilters);
                newZipName = `${newName}-stripped.zip`;
            } else if (activeTab === 'items') {
                // Handle item removal
                const result = await removeItemsFromPackage(selectedFile, startIndex, endIndex);
                blob = result.package;
                setRemovedItems(result.removedItems);
                setRemovedWebcontent(result.removedResources || 0);
                newZipName = `${newName}-items-${startIndex}-${endIndex}.zip`;
            } else if (activeTab === 'upgrade') {
                // Handle QTI2 to QTI3 conversion
                blob = await convertPackage(selectedFile, 'https://raw.githubusercontent.com/Citolab/qti30Upgrader/refs/heads/main/qti2xTo30.sef.json');
                newZipName = `${newName}-qti3.zip`;
            }

            clearInterval(progressInterval);
            setUploadProgress(100);

            if (blob) {
                saveAs(blob, newZipName);
                setProcessComplete(true);
            }

            setTimeout(() => {
                setInProgress(false);
            }, 500);
        } catch (e) {
            console.error(e);
            setError('An error occurred during processing');
            setInProgress(false);
        }
    };

    const switchTab = (tab: TabType) => {
        setActiveTab(tab);
        setError(null);
        setProcessComplete(false);

        // If switching to items tab and a file is already selected, analyze it
        if (tab === 'items' && selectedFile && !itemsLoaded) {
            analyzeItemsInPackage(selectedFile);
        }
    };

    useEffect(() => {
        // Reset end index whenever item count changes
        if (itemCount > 0) {
            setEndIndex(itemCount - 1);
        }
    }, [itemCount]);

    return (
        <div className="flex flex-col items-center min-h-screen bg-gray-50 p-4">
            <div className="max-w-3xl w-full bg-white rounded-xl shadow-md overflow-hidden" style={{ minHeight: '80vh' }}>
                <div className="bg-citolab-600 text-white p-6">
                    <h1 className="text-2xl font-bold">QTI Package Modifier</h1>
                    <p className="text-citolab-100 mt-1">
                        Upgrade or modify your QTI packages. QTI2x to QTI3, reduce file size, select specific items, or upgrade formats
                    </p>
                </div>

                {/* Tab navigation */}
                <div className="border-b border-gray-200">
                    <nav className="flex -mb-px">
                        <button
                            onClick={() => switchTab('upgrade')}
                            className={`py-3 px-6 font-medium text-sm border-b-2 
                            ${activeTab === 'upgrade' ? 'border-citolab-600 text-citolab-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                        >
                            <div className="flex items-center space-x-2">
                                <ArrowUp size={18} />
                                <span>Upgrade QTI2 {'>'} QTI3</span>
                            </div>
                        </button>
                        <button
                            onClick={() => switchTab('media')}
                            className={`py-3 px-6 font-medium text-sm border-b-2 
                            ${activeTab === 'media' ? 'border-citolab-600 text-citolab-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                        >
                            <div className="flex items-center space-x-2">
                                <Trash2 size={18} />
                                <span>Remove Media</span>
                            </div>
                        </button>
                        <button
                            onClick={() => switchTab('items')}
                            className={`py-3 px-6 font-medium text-sm border-b-2 
                            ${activeTab === 'items' ? 'border-citolab-600 text-citolab-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                        >
                            <div className="flex items-center space-x-2">
                                <List size={18} />
                                <span>Manage Items</span>
                            </div>
                        </button>
                    </nav>
                </div>

                <div className="p-6">
                    {inProgress ? (
                        <div className="flex flex-col py-10">
                            <div className="w-16 h-16 mb-4 rounded-full bg-citolab-50 flex items-center justify-center">
                                <Upload className="h-8 w-8 text-citolab-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">
                                {activeTab === 'media'
                                    ? 'Processing Media'
                                    : activeTab === 'items'
                                        ? 'Processing Items'
                                        : 'Converting QTI2 to QTI3'}
                            </h3>
                            <p className="text-sm text-gray-500 mb-6">
                                {activeTab === 'media'
                                    ? 'Please wait while we remove the selected media files...'
                                    : activeTab === 'items'
                                        ? itemsLoaded
                                            ? 'Please wait while we process the selected items...'
                                            : 'Analyzing package to count available items...'
                                        : 'Please wait while we convert your QTI2 package to QTI3 format...'}
                            </p>
                            <div className="w-full max-w-md bg-gray-200 rounded-full h-2.5 mb-2">
                                <div
                                    className="bg-citolab-600 h-2.5 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                ></div>
                            </div>
                            <p className="text-sm text-gray-500">{Math.round(uploadProgress)}% complete</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {activeTab === 'media' ? (
                                /* Media Removal Options */
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Settings className="text-citolab-600" size={20} />
                                        <h2 className="text-lg font-semibold text-gray-800">Media Filter Options</h2>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-3">
                                        Select which media types should be removed from the package:
                                    </p>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        <label className="flex items-center space-x-2 p-2 bg-white rounded border border-gray-200 hover:bg-gray-50 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="video"
                                                checked={filters.video}
                                                onChange={handleFilterChange}
                                                className="form-checkbox h-5 w-5 text-citolab-600"
                                            />
                                            <span className="text-gray-700">Video Files</span>
                                        </label>
                                        <label className="flex items-center space-x-2 p-2 bg-white rounded border border-gray-200 hover:bg-gray-50 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="audio"
                                                checked={filters.audio}
                                                onChange={handleFilterChange}
                                                className="form-checkbox h-5 w-5 text-citolab-600"
                                            />
                                            <span className="text-gray-700">Audio Files</span>
                                        </label>
                                        <label className="flex items-center space-x-2 p-2 bg-white rounded border border-gray-200 hover:bg-gray-50 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="image"
                                                checked={filters.image}
                                                onChange={handleFilterChange}
                                                className="form-checkbox h-5 w-5 text-citolab-600"
                                            />
                                            <span className="text-gray-700">Image Files</span>
                                        </label>
                                        <label className="flex items-center space-x-2 p-2 bg-white rounded border border-gray-200 hover:bg-gray-50 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="css"
                                                checked={filters.css}
                                                onChange={handleFilterChange}
                                                className="form-checkbox h-5 w-5 text-citolab-600"
                                            />
                                            <span className="text-gray-700">CSS Files</span>
                                        </label>
                                        <label className="flex items-center space-x-2 p-2 bg-white rounded border border-gray-200 hover:bg-gray-50 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="fs500k"
                                                checked={filters.fs500k}
                                                onChange={handleFilterChange}
                                                className="form-checkbox h-5 w-5 text-citolab-600"
                                            />
                                            <span className="text-gray-700">Files {'>'} 500KB</span>
                                        </label>
                                    </div>
                                </div>
                            ) : activeTab === 'items' ? (
                                /* Item Selection Options */
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <div className="flex items-center gap-2 mb-4">
                                        <BookOpen className="text-citolab-600" size={20} />
                                        <h2 className="text-lg font-semibold text-gray-800">Item Selection Options</h2>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-4">
                                        Select a range of items to keep in the package (items outside this range will be removed):
                                    </p>

                                    {itemsLoaded ? (
                                        <div className="space-y-4">
                                            <div className="bg-white p-3 rounded border border-gray-200">
                                                <p className="text-sm text-gray-700 mb-2">
                                                    This package contains <span className="font-semibold">{itemCount}</span> items (indexed from 0 to {itemCount - 1})
                                                </p>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Start Index
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={startIndex}
                                                            onChange={(e) => {
                                                                const val = parseInt(e.target.value);
                                                                if (!isNaN(val) && val >= 0 && val <= endIndex) {
                                                                    setStartIndex(val);
                                                                }
                                                            }}
                                                            min={0}
                                                            max={endIndex}
                                                            className="w-full p-2 border border-gray-300 rounded focus:ring-citolab-500 focus:border-citolab-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            End Index
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={endIndex}
                                                            onChange={(e) => {
                                                                const val = parseInt(e.target.value);
                                                                if (!isNaN(val) && val >= startIndex && val < itemCount) {
                                                                    setEndIndex(val);
                                                                }
                                                            }}
                                                            min={startIndex}
                                                            max={itemCount - 1}
                                                            className="w-full p-2 border border-gray-300 rounded focus:ring-citolab-500 focus:border-citolab-500"
                                                        />
                                                    </div>
                                                </div>

                                                <p className="mt-3 text-sm text-gray-600">
                                                    You will keep <span className="font-semibold">{endIndex - startIndex + 1}</span> items
                                                    and remove <span className="font-semibold">{itemCount - (endIndex - startIndex + 1)}</span> items.
                                                </p>
                                            </div>

                                            {processComplete && (removedItems.length > 0 || removedWebcontent > 0) && (
                                                <div className="bg-green-50 p-3 rounded border border-green-200">
                                                    <div className="flex items-center gap-2 mb-2 text-green-700">
                                                        <CheckCircle size={16} />
                                                        <p className="font-medium">Successfully processed package</p>
                                                    </div>
                                                    <div className="text-sm text-gray-600 space-y-1">
                                                        <p>Removed {removedItems.length} assessment items</p>
                                                        {removedWebcontent > 0 && (
                                                            <p>Removed {removedWebcontent} unused media/webcontent resources</p>
                                                        )}
                                                        <p className="pt-1 font-medium">New package has been downloaded</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : selectedFile ? (
                                        <div className="text-center p-4 bg-citolab-50 rounded">
                                            <p className="text-sm text-gray-600">
                                                Click "Analyze Package" to count items in the selected file
                                            </p>
                                            <button
                                                onClick={() => analyzeItemsInPackage(selectedFile)}
                                                className="mt-3 bg-citolab-600 text-white py-2 px-4 rounded hover:bg-citolab-700 transition-colors"
                                            >
                                                Analyze Package
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="text-center p-4 bg-citolab-50 rounded">
                                            <p className="text-sm text-gray-600">
                                                Please upload a QTI package to begin
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* QTI2 to QTI3 Upgrade Options */
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <div className="flex items-center gap-2 mb-4">
                                        <ArrowUp className="text-citolab-600" size={20} />
                                        <h2 className="text-lg font-semibold text-gray-800">QTI2 to QTI3 Upgrade</h2>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-4">
                                        Upload a QTI2x package to convert it to the QTI3 format.
                                    </p>

                                    {processComplete && (
                                        <div className="bg-green-50 p-3 rounded border border-green-200">
                                            <div className="flex items-center gap-2 mb-2 text-green-700">
                                                <CheckCircle size={16} />
                                                <p className="font-medium">Successfully converted package</p>
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                <p>Your QTI2 package has been converted to QTI3 format</p>
                                                <p className="pt-1 font-medium">New QTI3 package has been downloaded</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {selectedFile ? (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <FileText className="text-citolab-600" size={20} />
                                            <h2 className="text-lg font-semibold text-gray-800">Selected File</h2>
                                        </div>
                                        <button
                                            onClick={clearSelection}
                                            className="p-1 rounded-full hover:bg-gray-200 text-gray-500"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between p-3 bg-white rounded border border-gray-200">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-citolab-50 rounded-full">
                                                <FileText className="text-citolab-600" size={24} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800">{selectedFile.name}</p>
                                                <p className="text-sm text-gray-500">
                                                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                                                </p>
                                            </div>
                                        </div>

                                        {processComplete ? (
                                            <span className="flex items-center text-green-600 text-sm font-medium">
                                                <CheckCircle size={16} className="mr-1" />
                                                Complete
                                            </span>
                                        ) : (
                                            <button
                                                onClick={processFile}
                                                disabled={!!error || (activeTab === 'items' && !itemsLoaded)}
                                                className="bg-citolab-600 text-white py-2 px-4 rounded hover:bg-citolab-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                                            >
                                                {activeTab === 'upgrade' ? 'Convert Package' : 'Process File'}
                                            </button>
                                        )}
                                    </div>

                                    {error && (
                                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                            <div className="flex items-center gap-2 text-red-600">
                                                <AlertCircle size={16} />
                                                <p className="text-sm font-medium">{error}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div
                                    className={`
                    relative rounded-xl transition-all duration-200 
                    ${isDragging ? 'border-2 border-citolab-500 bg-citolab-50' : 'border-2 border-dashed border-gray-300 bg-gray-50'} 
                    ${'hover:border-citolab-400 hover:bg-gray-100'}
                  `}
                                    onDrop={handleDrop}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                >
                                    <input
                                        id="dropzone-file"
                                        type="file"
                                        className="hidden"
                                        onChange={handleFileChange}
                                        accept=".zip"
                                    />

                                    <label
                                        htmlFor="dropzone-file"
                                        className={`
                      flex flex-col w-full p-10 cursor-pointer`}
                                    >
                                        <div className="flex flex-col items-center justify-center text-center">
                                            <div className={`
                        p-6 mb-4 rounded-full bg-citolab-50 text-citolab-500
                        ${isDragging ? 'animate-pulse' : ''}
                      `}>
                                                <Upload className="w-12 h-12" />
                                            </div>

                                            <h3 className="mb-2 text-xl font-semibold text-gray-700">
                                                {isDragging ? "Drop to upload" : `Upload QTI ${activeTab === 'upgrade' ? '2' : ''} Package`}
                                            </h3>
                                            <p className="mb-4 text-sm text-gray-500">
                                                <span className="font-medium">Click to browse</span> or drag and drop your QTI ZIP file
                                            </p>

                                            <p className="text-xs text-gray-400">
                                                {activeTab === 'upgrade'
                                                    ? 'QTI 2.x ZIP files are supported'
                                                    : 'QTI 2.x and 3 ZIP files are supported'}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                * When uploading you agree to our Terms and Conditions at the end of the page.
                                            </p>
                                        </div>
                                    </label>
                                </div>
                            )}
                        </div>
                    )}
                </div>

            </div>
            <div className="max-w-2xl w-full">
                <Terms></Terms>
            </div>
        </div>
    );
};