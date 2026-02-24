# QTI Storybook Test Setup

This setup provides comprehensive Storybook testing for QTI (Question and Test Interoperability) portable custom interactions, specifically to help debug why `qti3-pci-QtiPci_1.0.0` items don't work while `PCI-Conformance` items do.

## 🚀 Quick Start

```bash
# Start Storybook
npm run storybook

# Build Storybook
npm run build-storybook
```

## 📁 Structure

```
src/stories/
├── QTIItemComponent.tsx      # Reusable QTI item renderer
├── qti-utils.ts             # Utilities for loading QTI data
├── PCIConformance.stories.tsx # Working QTI items (6 items)
├── QTI3PCI.stories.tsx      # Problematic QTI items
└── TestComponent.stories.tsx # Basic Storybook test

public/storybook-assets/     # QTI test data (copied from root)
├── PCI-Conformance/         # Working items
└── qti3-pci-QtiPci_1.0.0/  # Problematic items
```

## 📚 Available Stories

### 1. PCI Conformance Items (Working ✅)
- **Location**: `QTI/PCI Conformance Items`
- **Items**: 6 graphing interaction items that work correctly
- **Purpose**: Reference implementation for working QTI items

### 2. QTI3 PCI Items (Problematic ❌)
- **Location**: `QTI/QTI3 PCI Items (Problematic)`
- **Items**: Percentages PCI item that doesn't work
- **Features**: Debug mode enabled by default, side-by-side comparison

## 🔍 Key Differences Found

### Structure
| Working (PCI-Conformance) | Problematic (QTI3-PCI) |
|---------------------------|------------------------|
| Multiple module files | Single minified bundle |
| Direct file references | UMD module with context dependency |
| No `qti-interaction-modules` | Uses `qti-interaction-modules` |
| Traditional QTI structure | QTI 3.0 with markup elements |

### Module Loading
- **Working**: Direct JavaScript module loading with `GraphingInteraction.js`
- **Problematic**: Requires `qtiCustomInteractionContext` global, uses UMD format

### Resource Paths
- **Working**: Relative paths to individual files
- **Problematic**: Resource dependency pattern with `../resources/pci/index`

## 🛠️ Debugging Features

### Debug Mode
Enable debug mode in any story to see:
- Original XML length and content preview
- Processing errors and details
- Transformed HTML output
- Package structure information

### Comparison Tools
- **All Items Grid**: Overview of all PCI-Conformance items
- **Individual Item Testing**: Test each item in isolation

## 🚨 Known Issues with QTI3-PCI

1. **Missing Context**: `qtiCustomInteractionContext` not available globally
2. **Resource Loading**: Path resolution issues with `../resources/pci/index`
3. **Module Format**: UMD module might not be compatible with QTI component loader
4. **QTI Structure**: `qti-interaction-modules` element processing issues

## 🔧 Potential Fixes

### For qti3-pci-QtiPci_1.0.0:

1. **Provide Global Context**:
   ```javascript
   window.qtiCustomInteractionContext = {
     register: (pci) => {
       // Register PCI with QTI system
     }
   };
   ```

2. **Fix Resource Paths**: Update manifest to use absolute or corrected relative paths

3. **Simplify Structure**: Remove `qti-interaction-modules` and use direct module reference

4. **Debug Module Loading**: Add logging to track registration and initialization

## 📊 Usage Examples

### Basic QTI Item Rendering
```tsx
import { QTIItemComponent } from './QTIItemComponent';

<QTIItemComponent
  xml={qtiXmlString}
  identifier="item-1" 
  title="Sample QTI Item"
  debug={true}
/>
```

### Loading QTI Package Data
```tsx
import { loadQTIPackage } from './qti-utils';

const package = await loadQTIPackage('PCI-Conformance');
console.log('Items:', package.items.length);
```

## 🧪 Testing Strategy

1. **Side-by-side Comparison**: Use the comparison story to identify structural differences
2. **Debug Mode**: Enable debug in problematic items to see processing errors
3. **Console Monitoring**: Check browser console for JavaScript errors and network failures
4. **Individual Testing**: Test items separately to isolate issues
5. **Network Analysis**: Monitor resource loading in browser dev tools

## 🔗 Resources

- [@citolab/qti-components](https://github.com/citolab/qti-components) - QTI rendering library
- [IMS QTI 3.0 Specification](https://www.imsglobal.org/question/)
- [QTI 3.0 Best Practices](https://www.imsglobal.org/question/qtiv3p0/imsqti_bestv3p0.html)

## 🤝 Contributing

To add more QTI test cases:

1. Add QTI package to `storybook-assets/`
2. Copy to `public/storybook-assets/`
3. Update `AVAILABLE_PACKAGES` in `qti-utils.ts`
4. Create new story file following existing patterns
5. Update this README

---

This Storybook setup provides a comprehensive testing environment for debugging QTI portable custom interactions and understanding why certain implementations don't work as expected.
