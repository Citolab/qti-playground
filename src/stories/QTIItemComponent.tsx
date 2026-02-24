import React, { useRef, useEffect, useState } from 'react';
import { qtiTransformItem } from '@citolab/qti-components/qti-transformers';
import { QtiItem } from '@citolab/qti-components';
import { CustomElements } from '@citolab/qti-components/react';
import { itemCss } from '../app/itemCss';

/* React */
declare module 'react' {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface, @typescript-eslint/no-empty-object-type
    interface IntrinsicElements extends CustomElements {}
  }
}

export interface QTIItemComponentProps {
  /** QTI XML content */
  xml: string;
  /** Item XML path (used for PCI module resolution) */
  itemPath?: string;
  /** Item identifier */
  identifier?: string;
  /** Item title */
  title?: string;
  /** Show debug information */
  debug?: boolean;
  /** Custom CSS styles */
  customCSS?: string;
}

/**
 * QTI Item component for rendering QTI assessment items in Storybook
 */
export const QTIItemComponent: React.FC<QTIItemComponentProps> = ({
  xml,
  itemPath,
  identifier,
  title,
  debug = false,
  customCSS,
}) => {
  const qtiItemRef = useRef<QtiItem>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [processedXml, setProcessedXml] = useState<DocumentFragment | null>(null);

  useEffect(() => {
    if (!xml) return;

    let cancelled = false;

    const load = async () => {
      try {
        setErrorMessage(null);

        const transformer = qtiTransformItem()
          .parse(xml)
          .extendElementsWithClass('type')
          .convertCDATAtoComment();

        const hasPci = xml.includes('qti-portable-custom-interaction');
        if (hasPci && itemPath) {
          const itemUrl = new URL(itemPath, window.location.origin);
          const itemDirPath = itemUrl.pathname.replace(/\/[^/]+$/, '');

          const parseModuleResolution = async (url: string): Promise<{ paths: Record<string, string> } | null> => {
            try {
              const response = await fetch(url);
              if (!response.ok) return null;
              const text = await response.text();
              const parsed = JSON.parse(text) as { paths?: unknown };
              if (!parsed || typeof parsed !== 'object' || typeof parsed.paths !== 'object' || parsed.paths === null) {
                return null;
              }
              return { paths: parsed.paths as Record<string, string> };
            } catch {
              return null;
            }
          };

          const getModuleResolutionConfig = async (
            _baseUrl: string,
            configPath: string,
          ): Promise<{ paths: Record<string, string> }> => {
            const normalizedFileUrl = configPath.replace(/^\/+/, '');
            const candidates = [
              `${itemDirPath}/${normalizedFileUrl}`,
              `${itemDirPath}/modules/${normalizedFileUrl}`,
            ];

            for (const candidate of candidates) {
              const parsed = await parseModuleResolution(candidate);
              if (parsed) return parsed;
            }

            return { paths: {} };
          };

          await transformer.configurePci(itemDirPath, getModuleResolutionConfig);
        }

        const transformedDoc = transformer.htmlDoc();
        if (!cancelled) setProcessedXml(transformedDoc);
      } catch (error) {
        if (!cancelled) {
          console.error('Error processing QTI XML:', error);
          setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
          setProcessedXml(null);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [xml, itemPath]);

  const styles = `
    ${itemCss}
    ${customCSS || ''}
    
    /* Storybook-specific styles */
    .qti-item-wrapper {
      padding: 20px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      background: white;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    }
    
    .qti-item-header {
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid #f0f0f0;
    }
    
    .qti-item-title {
      font-size: 18px;
      font-weight: 600;
      color: #333;
      margin: 0 0 4px 0;
    }
    
    .qti-item-identifier {
      font-size: 14px;
      color: #666;
      font-family: monospace;
    }
    
    .qti-error {
      background: #fee;
      border: 1px solid #fcc;
      color: #c00;
      padding: 12px;
      border-radius: 4px;
      margin: 12px 0;
    }
    
    .qti-debug {
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      padding: 12px;
      border-radius: 4px;
      margin: 12px 0;
      font-size: 12px;
      font-family: monospace;
      white-space: pre-wrap;
      max-height: 200px;
      overflow-y: auto;
    }
  `;

  return (
    <div className="qti-item-wrapper">
      {(title || identifier) && (
        <div className="qti-item-header">
          {title && <h2 className="qti-item-title">{title}</h2>}
          {identifier && <div className="qti-item-identifier">ID: {identifier}</div>}
        </div>
      )}
      
      {errorMessage ? (
        <div className="qti-error">
          <strong>QTI Processing Error:</strong> {errorMessage}
        </div>
      ) : processedXml ? (
        <qti-item ref={qtiItemRef}>
          <item-container itemDoc={processedXml}>
            <template
              dangerouslySetInnerHTML={{
                __html: `<style>${styles}</style>`,
              }}
            />
          </item-container>
        </qti-item>
      ) : (
        <div>Loading QTI content...</div>
      )}
      
      {debug && (
        <details style={{ marginTop: '20px' }}>
          <summary>Debug Information</summary>
          <div className="qti-debug">
            <div><strong>Original XML Length:</strong> {xml.length} characters</div>
            <div><strong>Has Error:</strong> {errorMessage ? 'Yes' : 'No'}</div>
            <div><strong>Processed Nodes:</strong> {processedXml?.childNodes.length || 0}</div>
            {errorMessage && (
              <div><strong>Error:</strong> {errorMessage}</div>
            )}
            <div><strong>Original XML (first 500 chars):</strong></div>
            <div>{xml.substring(0, 500)}...</div>
          </div>
        </details>
      )}
    </div>
  );
};
