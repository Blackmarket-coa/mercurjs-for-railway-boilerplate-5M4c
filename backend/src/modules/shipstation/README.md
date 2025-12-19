# ShipStation Module - Fixed Version

## Installation Instructions

1. **Backup your current files** (if needed):
   ```bash
   cd backend/src/modules/shipstation
   mkdir ../shipstation-backup
   cp * ../shipstation-backup/
   ```

2. **Delete the old files**:
   ```bash
   cd backend/src/modules/shipstation
   rm -f client.ts service.ts types.ts index.ts
   ```

3. **Copy the new files** from this directory to `backend/src/modules/shipstation/`:
   - `types.ts`
   - `client.ts`
   - `service.ts`
   - `index.ts`

4. **Verify your medusa-config.ts** includes the module:
   ```typescript
   module.exports = defineConfig({
     // ... other config
     modules: [
       {
         resolve: "@medusajs/medusa/fulfillment",
         options: {
           providers: [
             {
               resolve: "@medusajs/medusa/fulfillment-manual",
               id: "manual",
             },
             {
               resolve: "./src/modules/shipstation",
               id: "shipstation",
               options: {
                 api_key: process.env.SHIPSTATION_API_KEY,
               },
             },
           ],
         },
       },
     ],
   })
   ```

5. **Ensure your .env has the API key**:
   ```
   SHIPSTATION_API_KEY=your_actual_api_key_here
   ```

6. **Rebuild and deploy**:
   ```bash
   # Locally
   npm run build
   npm run start

   # Or push to Railway to trigger deployment
   git add .
   git commit -m "Fix ShipStation module structure"
   git push
   ```

## What Was Fixed

The original files had several critical issues:

1. **Duplicate class declarations** - Classes were declared multiple times in the same file
2. **Misplaced imports** - Import statements appeared in the middle of class definitions
3. **Malformed file structure** - Missing line breaks between declarations
4. **Type definition issues** - Missing proper type exports

All of these issues have been resolved in the clean versions provided.

## File Structure

```
backend/src/modules/shipstation/
├── index.ts         # Module provider export
├── service.ts       # Main service implementing fulfillment methods
├── client.ts        # ShipStation API client
└── types.ts         # TypeScript type definitions
```

## Testing

After deployment, test the integration:

1. Go to Medusa Admin → Settings → Locations & Shipping
2. Edit a location and enable the ShipStation provider
3. Create a shipping option with "Calculated" price type
4. Select a ShipStation fulfillment option
5. Test checkout in your storefront

## Support

If you encounter issues:
- Check Railway build logs for TypeScript errors
- Verify your SHIPSTATION_API_KEY is set correctly
- Ensure you've enabled carriers in your ShipStation account
- Check that the Shipping API add-on is activated in ShipStation
