import React, { useState, useRef, useEffect } from 'react';
import { X, Move } from 'lucide-react';

interface DraggablePopupProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
    storageKey?: string
}

const DraggablePopup = ({
    isOpen,
    title,
    children,
    onClose,
    storageKey = 'draggablePopupState' // Default key for localStorage
}: DraggablePopupProps) => {
    const popupRef = useRef(null);
    const resizeHandleRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [resizeStartPos, setResizeStartPos] = useState({ x: 0, y: 0 });
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    // Initialize state from localStorage or defaults
    const [popupState, setPopupState] = useState<{ position: { x: number, y: number }, size: { width: number, height: number } }>(() => {
        const savedState = localStorage.getItem(storageKey);
        return savedState ? JSON.parse(savedState) : {
            position: { x: 100, y: 100 },
            size: { width: 384, height: 300 } // 384px = w-96 default
        };
    });

    const { position, size } = popupState;

    // Save state to localStorage whenever it changes
    useEffect(() => {
        if (isOpen) {
            localStorage.setItem(storageKey, JSON.stringify(popupState));
        }
    }, [popupState, isOpen, storageKey]);

    const startDrag = (e: any) => {
        if (popupRef.current) {
            setIsDragging(true);
            setDragOffset({
                x: e.clientX - position.x,
                y: e.clientY - position.y
            });
        }
    };

    const onDrag = (e: MouseEvent) => {
        if (isDragging) {
            // Calculate new position but keep popup within viewport bounds
            const newX = Math.min(
                Math.max(0, e.clientX - dragOffset.x),
                window.innerWidth - size.width
            );
            const newY = Math.min(
                Math.max(0, e.clientY - dragOffset.y),
                window.innerHeight - size.height
            );

            setPopupState(prev => ({
                ...prev,
                position: { x: newX, y: newY }
            }));
        }
    };

    const startResize = (e: any) => {
        setIsResizing(true);
        setResizeStartPos({
            x: e.clientX,
            y: e.clientY
        });
        e.preventDefault();
    };

    const onResize = (e: any) => {
        if (isResizing) {
            const deltaX = e.clientX - resizeStartPos.x;
            const deltaY = e.clientY - resizeStartPos.y;

            const newWidth = Math.max(200, size.width + deltaX);
            const newHeight = Math.max(150, size.height + deltaY);

            setResizeStartPos({
                x: e.clientX,
                y: e.clientY
            });

            setPopupState(prev => ({
                ...prev,
                size: {
                    width: Math.min(newWidth, window.innerWidth - position.x),
                    height: Math.min(newHeight, window.innerHeight - position.y)
                }
            }));
        }
    };

    const endDragOrResize = () => {
        setIsDragging(false);
        setIsResizing(false);
    };

    // Setup and cleanup event listeners
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                onDrag(e);
            }
            if (isResizing) {
                onResize(e);
            }
        };

        const handleMouseUp = () => {
            endDragOrResize();
        };

        if (isDragging || isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, isResizing]);

    if (!isOpen) return null;

    return (
        <div
            ref={popupRef}
            className={`
        fixed bg-white rounded-lg shadow-lg border border-gray-200 transition-shadow
        ${isDragging ? 'shadow-xl cursor-grabbing' : ''} 
        ${isResizing ? 'shadow-xl' : ''}
        overflow-hidden
      `}
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                width: `${size.width}px`,
                height: `${size.height}px`,
                zIndex: 9999
            }}
        >
            {/* Header with drag handle */}
            <div
                className="flex items-center justify-between px-4 py-2 bg-citolab-600 text-white cursor-grab"
                onMouseDown={startDrag}
            >
                <div className="flex items-center">
                    <Move className="w-4 h-4 mr-2" />
                    <h3 className="text-sm font-medium">{title}</h3>
                </div>
                <button
                    onClick={() => onClose()}
                    className="p-1 rounded-full hover:bg-citolab-700 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Content */}
            <div className="p-4 overflow-y-auto" style={{ height: `calc(100% - 42px)` }}>
                {children}
            </div>

            {/* Resize handle - bottom right corner */}
            <div
                ref={resizeHandleRef}
                className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize"
                onMouseDown={startResize}
                style={{
                    backgroundImage: 'radial-gradient(circle, #888 1px, transparent 1px)',
                    backgroundSize: '3px 3px',
                    backgroundPosition: '2px 2px',
                    backgroundRepeat: 'no-repeat',
                    opacity: 0.7
                }}
            />
        </div>
    );
};

export default DraggablePopup;