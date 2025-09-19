# QTI Item Blob Storage Implementation

## Overview

This implementation replaces the sessionStorage-based item storage with blob URLs to solve localStorage size limitations and reduce memory duplication when working with large QTI packages.

## Key Changes

### 1. New Blob Manager (`src/app/store/item-blob-manager.ts`)

- **`ItemBlobManager`**: Singleton class that manages blob storage for XML items
- **`storeItemAsBlob()`**: Converts XML content to blobs and returns blob URLs
- **`getItemFromBlob()`**: Retrieves XML content from blob URLs
- **`getItemByHref()`**: Provides backward compatibility for original href-based lookups
- **`updateAssessmentTestWithBlobUrefs()`**: Updates assessment test content to use blob URLs
- **`cleanup()`**: Properly releases blob URLs to prevent memory leaks

### 2. Updated State Model

**Before:**

- Items stored multiple times: in `assessments[].items[]` with full content AND in `itemsPerAssessment[]` with full content
- SessionStorage used for item content storage
- Large memory footprint with duplication

**After:**

- `ItemInfoWithBlobRef` interface replaces `ItemInfoWithContent`
- Items stored once as blobs, referenced by URLs
- No sessionStorage usage for items
- Significantly reduced memory usage

### 3. Enhanced ProcessPackageAction

- **Blob Creation**: Each item's XML content is converted to a blob during package processing
- **Assessment Update**: Assessment test content is updated to reference blob URLs instead of original hrefs
- **Memory Management**: Old blobs are cleaned up before processing new packages
- **State Optimization**: Items are no longer duplicated in state

### 4. Component Updates

**ItemPreview Component (`src/app/components/item-preview.tsx`)**

- New component that handles async loading of item content from blobs
- Uses React hooks (`useEffect`, `useMemo`) for optimal performance
- Provides loading states and error handling
- Memoized to prevent unnecessary re-renders
- Handles the QTI transformation after content is loaded

**Upload Page Updates**

- Replaced inline item rendering with `ItemPreview` component
- Removed dependency on `item.content` which no longer exists
- Maintains same visual appearance and functionality

### 5. Backward Compatibility

- Custom item reference callback in assessment page handles legacy href requests
- Blob manager can resolve items by original href for compatibility
- Graceful fallback for missing blobs

## Benefits

1. **Memory Efficiency**:
   - Items stored once in blobs instead of multiple times in state
   - No sessionStorage limitations
   - Automatic cleanup prevents memory leaks

2. **Large Package Support**:
   - Can handle packages with many items without localStorage size limits
   - Blob storage scales better than sessionStorage

3. **Performance**:
   - Reduced state object size
   - Faster serialization for localStorage state management
   - On-demand item loading

4. **Reliability**:
   - Automatic cleanup on page unload
   - Error handling for blob access failures
   - Backward compatibility maintained

## Technical Details

### Blob URL Format

- Pattern: `blob:http://localhost:port/uuid`
- Type: `application/xml`
- Automatically managed lifecycle

### Assessment Test Updates

- Original hrefs in assessment test XML are replaced with blob URLs
- Example: `href="items/item1.xml"` → `href="blob:http://localhost:5174/abc123..."`

### Memory Management

- Blob URLs are tracked and properly revoked
- Cleanup happens on:
  - New package processing
  - Page unload
  - Manual cleanup action

## Migration Impact

- **Zero breaking changes** for existing functionality
- **Transparent** to QTI components (they receive valid URLs)
- **Improved** memory usage without changing user experience
- **Enhanced** support for large packages

## Usage

The implementation is automatic - no changes needed in component usage:

```typescript
// Items are automatically stored as blobs during package processing
await store.dispatch(new ProcessPackageAction({ file, options }));

// Assessment tests automatically use blob URLs
<test-container testXML={assessment?.content} />;

// Individual item editing works seamlessly
await store.dispatch(new OnEditItemAction({ identifier }));
```

## Testing

1. Load a large QTI package (many items)
2. Verify assessment test works correctly
3. Check browser dev tools for blob URLs in assessment content
4. Confirm no sessionStorage usage for items
5. Verify memory usage is reduced compared to previous implementation
