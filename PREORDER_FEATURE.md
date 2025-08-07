# Preorder Feature Implementation

## Overview
This implementation adds a comprehensive preorder system to the Kiko Plume Shop, allowing customers to preorder products that are not currently in stock.

## Features

### 1. Product Availability Management
- **In Stock**: Products that are immediately available for purchase
- **Preorder**: Products that can be preordered with custom messages
- **Sold Out**: Products that are no longer available

### 2. Separate Product Sections
The shop now displays products in three distinct sections:
- **In Stock Products**: Green-themed section with "Add to Cart" buttons
- **Preorder Products**: Orange-themed section with "Preorder" buttons
- **Sold Out Products**: Red-themed section with disabled "Sold Out" buttons

### 3. Preorder Modal
When users click "Preorder" on a product, a modal opens that allows them to:
- View product details
- Add a custom message about their preorder request
- Add the item to their cart as a preorder

### 4. Enhanced Cart System
The cart system has been updated to handle preorder items:
- Preorder items are marked with `isPreorder: true`
- Custom messages are stored with preorder items
- Visual indicators distinguish preorder items from regular items

## Technical Implementation

### Type Updates
- Added `availability` field to Product type (`'in_stock' | 'preorder' | 'sold_out'`)
- Added `preorderMessage` field for optional preorder messages
- Updated CartItem interface to include `isPreorder` and `preorderMessage` fields

### Components
1. **PreorderModal**: New component for handling preorder requests
2. **Updated Shop Component**: Modified to display separate product sections
3. **Enhanced CartContext**: Updated to handle preorder functionality

### CSS Styling
- Added preorder-specific button styles (orange theme)
- Added availability badge styles for different product states
- Enhanced visual feedback for preorder interactions

## Usage

### For Customers
1. Browse products in the shop
2. Products are automatically categorized by availability
3. Click "Preorder" on preorder-available products
4. Add a custom message in the modal
5. Confirm to add to cart

### For Developers
1. Set product `availability` field to `'preorder'` for preorder products
2. Optionally set `preorderMessage` for default messages
3. The system will automatically handle the rest

## Testing
The implementation includes mock data for testing:
- Sample In-Stock Product (ID: 1)
- Sample Preorder Product (ID: 2) 
- Sample Sold Out Product (ID: 3)

## Future Enhancements
- Email notifications for preorder confirmations
- Preorder status tracking
- Estimated delivery dates
- Preorder cancellation functionality
- Admin interface for managing preorders
