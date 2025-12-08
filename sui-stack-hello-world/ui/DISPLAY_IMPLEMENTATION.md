# Sui Object Display Implementation

Comprehensive implementation of the **Sui Object Display standard** for the Crozz-Coin project, enabling on-chain management of off-chain representation for Move types.

## Overview

The Sui Object Display standard is a template engine that allows developers to define how their on-chain objects should be displayed in wallets, explorers, and other applications. It uses a template string format with `{property}` syntax to substitute object data.

**Reference:** https://docs.sui.io/standards/display

## Implementation Status

✅ **Complete Display Standard Integration**

### Components Implemented

1. **CreateDisplayPanel** (`ui/src/components/CreateDisplayPanel.tsx`)
   - Create new Display<T> objects using `display::new_with_fields`
   - Define multiple key-value pairs for display fields
   - Automatic `update_version` call to commit changes
   - Transfer Display object to creator

2. **UpdateDisplayPanel** (`ui/src/components/UpdateDisplayPanel.tsx`)
   - Add new fields with `display::add_multiple`
   - Edit existing fields with `display::edit`
   - Remove fields with `display::remove`
   - Batch operations in single transaction
   - Commit changes via `update_version`

3. **DisplayViewer** (`ui/src/components/DisplayViewer.tsx`)
   - Query objects via GraphQL with display rendering
   - Automatically fetch and display rendered metadata
   - Show all display fields with proper formatting
   - Handle URLs and errors in display values

4. **DisplayInfo** (`ui/src/DisplayInfo.tsx`)
   - Educational component explaining Display standard
   - Recommended fields documentation
   - Example flow and best practices

## Features

### 1. Display Creation

**Transaction Structure:**
```typescript
// Step 1: Create Display with fields
const [display] = tx.moveCall({
  target: "0x2::display::new_with_fields",
  typeArguments: ["0xPACKAGE::module::Type"],
  arguments: [
    tx.object(publisherObjectId),
    tx.pure.vector("string", keys),
    tx.pure.vector("string", values),
  ],
});

// Step 2: Commit changes (emits event for fullnodes)
tx.moveCall({
  target: "0x2::display::update_version",
  typeArguments: ["0xPACKAGE::module::Type"],
  arguments: [display],
});

// Step 3: Transfer Display to creator
tx.transferObjects([display], sender);
```

**Required Inputs:**
- **Publisher Object ID**: From `package::claim(otw, ctx)` in module init
- **Type Argument**: Full type path (e.g., `0x123::heroes::Hero`)
- **Display Fields**: Key-value pairs with template syntax

### 2. Display Updates

**Supported Operations:**
- **Add Multiple Fields**: `display::add_multiple(display, keys, values)`
- **Edit Single Field**: `display::edit(display, key, newValue)`
- **Remove Field**: `display::remove(display, key)`
- **Commit Changes**: `display::update_version(display)`

All operations can be batched in a single transaction for gas efficiency.

### 3. Display Viewing

**GraphQL Query:**
```graphql
query GetObjectWithDisplay($objectId: SuiAddress!) {
  object(address: $objectId) {
    address
    version
    display {
      key
      value
      error
    }
  }
}
```

**JSON-RPC:**
```typescript
await client.getObject({
  id: objectId,
  options: {
    showDisplay: true
  }
});
```

## Recommended Display Fields

Following Sui standards, the implementation supports these common fields:

| Field | Description | Example Template |
|-------|-------------|-----------------|
| `name` | Object name | `{name}` |
| `description` | Object description | Static or `{description}` |
| `image_url` | Full image URL | `ipfs://{image_url}` |
| `thumbnail_url` | Thumbnail preview | `https://cdn.app.com/thumb/{id}.png` |
| `link` | Application URL | `https://app.com/item/{id}` |
| `project_url` | Project website | `https://myproject.com` |
| `creator` | Creator info | `{creator}` or static |

## Template Syntax

The Display standard uses `{property}` syntax to substitute object fields:

```typescript
// Template examples:
"{name}"                           // Object's name field
"https://app.com/item/{id}"       // Compose URL with object ID
"ipfs://{image_url}"              // IPFS with dynamic CID
"A {category} item by {creator}"  // Multiple substitutions
"Static description"              // No substitution
```

**Supported Property Sources:**
- Object struct fields (e.g., `{name}`, `{level}`)
- System properties (e.g., `{id}`)
- Nested fields (limited depth)

## Use Cases

### 1. Utility Objects (Capabilities)

For capability objects that grant permissions:

```move
public struct CapyManagerCap has key, store { 
  id: UID 
}
```

**Display Configuration:**
```typescript
{
  name: "Capy Manager Capability",
  description: "Grants permission to manage Capy Market",
  image_url: "https://capy.art/icons/manager-cap.png",
  creator: "Capy Labs"
}
```

### 2. Game Items (Data Duplication Optimization)

For items with shared metadata across many instances:

```move
public struct CapyItem has key, store {
  id: UID,
  name: String
}
```

**Display Configuration:**
```typescript
{
  name: "{name}",
  description: "Wearable item for your Capy",
  image_url: "https://capy.art/items/{name}.png",
  project_url: "https://capy.art"
}
```

### 3. Dynamic NFTs (Generative Content)

For objects with dynamic appearance based on attributes:

```move
public struct Capy has key, store {
  id: UID,
  genes: vector<u8>
}
```

**Display Configuration:**
```typescript
{
  name: "Capy #{id}",
  description: "A unique Capy with dynamic SVG generation",
  image_url: "https://api.capy.art/render/{id}",
  link: "https://capy.art/view/{id}"
}
```

### 4. Static NFTs (Immutable Metadata)

For collectibles with fixed metadata:

```move
public struct DevNetNFT has key, store {
  id: UID,
  name: String,
  description: String,
  url: String,
}
```

**Display Configuration:**
```typescript
{
  name: "{name}",
  description: "{description}",
  image_url: "{url}",
  creator: "DevNet Team"
}
```

## Integration with Existing Standards

The Display implementation works seamlessly with other Sui standards:

### Currency Standard
```typescript
// Display for currency coins
{
  name: "{symbol} Coin",
  description: "{description}",
  image_url: "{icon_url}",
  project_url: "https://crozz-coin.com"
}
```

### Coin Standard
```typescript
// Display for custom coins
{
  name: "DEMO Coin",
  description: "Demo coin for testing",
  image_url: "https://demo.com/coin.png"
}
```

### Kiosk Items
```typescript
// Display for items in Kiosk
{
  name: "{name}",
  description: "{description}",
  image_url: "{image_url}",
  link: "https://marketplace.com/item/{id}"
}
```

## Publisher Pattern

The Display standard requires a `Publisher` object, which proves package ownership:

**Move Module Init:**
```move
use sui::package;
use sui::display;

public struct MY_TYPE has drop {}

fun init(otw: MY_TYPE, ctx: &mut TxContext) {
  // 1. Claim Publisher with one-time witness
  let publisher = package::claim(otw, ctx);
  
  // 2. Create Display
  let keys = vector[
    b"name".to_string(),
    b"image_url".to_string(),
  ];
  let values = vector[
    b"{name}".to_string(),
    b"ipfs://{image_url}".to_string(),
  ];
  
  let mut display = display::new_with_fields<MyType>(
    &publisher, keys, values, ctx
  );
  
  // 3. Commit version
  display.update_version();
  
  // 4. Transfer both objects
  transfer::public_transfer(publisher, ctx.sender());
  transfer::public_transfer(display, ctx.sender());
}
```

## UI Components Usage

### Creating Display

1. Navigate to **Create Display Object** panel
2. Enter **Publisher Object ID** (from module init)
3. Enter **Type Argument** (full type path)
4. Add display fields with keys and values
5. Click **Create Display**

### Updating Display

1. Navigate to **Update Display Object** panel
2. Enter **Display Object ID**
3. Enter **Type Argument**
4. Choose operations:
   - Add new fields
   - Edit existing fields
   - Remove fields
5. Click **Update Display**

### Viewing Display

1. Navigate to **Display Viewer** panel
2. Enter any object ID
3. Click **Query Object**
4. View rendered display metadata

## Technical Details

### GraphQL Display Schema

```typescript
interface DisplayField {
  key: string;
  value: string;
  error?: string;
}

interface Object {
  display: DisplayField[];
}
```

### Error Handling

The DisplayViewer component handles display rendering errors:

```typescript
display.forEach(item => {
  if (item.error) {
    // Display error (e.g., missing field, invalid template)
    displayMap[item.key] = `ERROR: ${item.error}`;
  } else {
    displayMap[item.key] = item.value;
  }
});
```

Common errors:
- **Missing field**: Template references non-existent object property
- **Depth exceeded**: Nested field access too deep
- **Parse error**: Invalid template syntax

### Storage Optimization

Display templates reduce on-chain storage by:
1. **Avoiding duplicate URLs**: Use templates instead of storing full URLs per object
2. **Sharing metadata**: Single Display<T> serves all objects of type T
3. **Dynamic generation**: Compose URLs from object properties

Example storage savings:
```move
// Without Display: 500 bytes per object (image_url, description, etc.)
public struct Item {
  id: UID,
  name: String,
  image_url: String,  // 100 bytes
  description: String, // 200 bytes
  project_url: String, // 50 bytes
}

// With Display: 50 bytes per object
public struct Item {
  id: UID,
  name: String, // 50 bytes
  // Other fields in Display template (shared across all items)
}
```

## Best Practices

1. **Create Display in Module Init**: Set up Display during package deployment
2. **Use Templates**: Leverage `{property}` syntax for dynamic content
3. **Keep Publisher Safe**: Protect Publisher object as only it can update Display
4. **Version Updates**: Always call `update_version` after modifications
5. **Test Templates**: Verify template rendering with DisplayViewer before production
6. **Standard Fields**: Use recommended field names for ecosystem compatibility
7. **IPFS for Images**: Use `ipfs://{hash}` for decentralized image storage
8. **Error Handling**: Handle missing fields gracefully in templates

## Example: Complete Display Setup

**Move Module:**
```move
module crozz::hero;

use sui::package;
use sui::display;
use std::string::String;

public struct Hero has key, store {
  id: UID,
  name: String,
  level: u64,
  image_cid: String,
}

public struct HERO has drop {}

fun init(otw: HERO, ctx: &mut TxContext) {
  let publisher = package::claim(otw, ctx);
  
  let keys = vector[
    b"name".to_string(),
    b"description".to_string(),
    b"image_url".to_string(),
    b"link".to_string(),
    b"project_url".to_string(),
  ];
  
  let values = vector[
    b"{name}".to_string(),
    b"A Level {level} Hero of the Crozz Ecosystem".to_string(),
    b"ipfs://{image_cid}".to_string(),
    b"https://crozz.com/hero/{id}".to_string(),
    b"https://crozz.com".to_string(),
  ];
  
  let mut display = display::new_with_fields<Hero>(
    &publisher, keys, values, ctx
  );
  
  display.update_version();
  
  transfer::public_transfer(publisher, ctx.sender());
  transfer::public_transfer(display, ctx.sender());
}

public fun mint(name: String, level: u64, image_cid: String, ctx: &mut TxContext): Hero {
  Hero {
    id: object::new(ctx),
    name,
    level,
    image_cid,
  }
}
```

**UI Usage:**
1. Deploy module (Publisher and Display created automatically)
2. Mint Hero objects with `mint` function
3. Query any Hero with DisplayViewer
4. See rendered metadata:
   ```json
   {
     "name": "Awesome Hero",
     "description": "A Level 42 Hero of the Crozz Ecosystem",
     "image_url": "ipfs://QmXyz123...",
     "link": "https://crozz.com/hero/0x123abc...",
     "project_url": "https://crozz.com"
   }
   ```

## Verification

Run these tests to verify Display implementation:

```bash
# 1. Build project
cd /workspaces/Crozz-Coin/sui-stack-hello-world/ui
pnpm build

# 2. Start dev server
pnpm dev

# 3. Manual testing:
# - Connect wallet on Testnet
# - Navigate to "Create Display Object" panel
# - Create Display for a type
# - Use DisplayViewer to query objects with Display
# - Verify rendered metadata appears correctly
```

## References

- **Sui Object Display Standard**: https://docs.sui.io/standards/display
- **Publisher Pattern**: https://examples.sui.io/basics/publisher.html
- **Move Book - One-Time Witness**: https://move-book.com/programmability/one-time-witness.html
- **GraphQL Display Query**: Included in DisplayViewer component

## Future Enhancements

Potential improvements for Display functionality:

1. **Display Templates Library**: Pre-built templates for common use cases
2. **Preview Mode**: Render template before creation
3. **Batch Display Creation**: Create Display for multiple types at once
4. **Version History**: Track Display changes over time
5. **Display Analytics**: Monitor Display usage and rendering success
6. **Migration Tools**: Update Display for existing objects
7. **Display Governance**: Multi-sig for Display updates

## Conclusion

The Sui Object Display standard implementation provides a complete solution for managing on-chain metadata templates. The three UI components (CreateDisplayPanel, UpdateDisplayPanel, DisplayViewer) enable developers to:

- Create Display objects with Publisher authentication
- Update Display fields dynamically
- View rendered metadata for any object

This implementation follows Sui best practices and integrates seamlessly with the existing Currency Standard and Coin Standard implementations in the Crozz-Coin project.
