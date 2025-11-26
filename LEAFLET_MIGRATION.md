# Google Maps to Leaflet/OpenStreetMap Migration

## Summary
Successfully migrated the User App from Google Maps to Leaflet with OpenStreetMap tiles.

## Changes Made

### 1. Dependencies Installed
- `leaflet` - Main mapping library
- `@types/leaflet` - TypeScript definitions
- `leaflet-routing-machine` - For directions/routing
- `@types/leaflet-routing-machine` - TypeScript definitions

Install command:
```bash
npm install leaflet @types/leaflet leaflet-routing-machine @types/leaflet-routing-machine --save --legacy-peer-deps
```

### 2. Files Modified

#### src/index.html
- Removed Google Maps API script
- Added Leaflet CSS and JS from CDN

#### src/global.scss
- Added Leaflet CSS import
- Added Leaflet Routing Machine CSS import
- Added custom map container styles

#### src/app/city/city.page.ts
- Replaced `google.maps` with Leaflet API
- Changed Google Places Autocomplete to Nominatim API (OpenStreetMap geocoding)
- Updated map initialization and marker handling
- Changed from `GoogleAutocomplete` to Nominatim fetch API

#### src/app/city/city.page.html
- Updated autocomplete results display from `item.description` to `item.display_name`

#### src/app/address/address.page.ts
- Same changes as city.page.ts
- Updated to use Leaflet and Nominatim

#### src/app/address/address.page.html
- Updated autocomplete results display from `item.description` to `item.display_name`

#### src/app/detail/detail.page.ts
- Replaced Google Maps directions with Leaflet Routing Machine
- Changed `directionsService` and `directionsDisplay` to `routingControl`
- Updated route calculation and display

#### src/app/item/item.page.html
- Changed Google Maps link to OpenStreetMap link for directions

## Features

### Geocoding & Address Search
- Uses **Nominatim API** (OpenStreetMap's free geocoding service)
- No API key required
- Supports address autocomplete with minimum 3 characters

### Mapping
- Uses **OpenStreetMap** tiles (free, no API key needed)
- Marker customization with custom icons
- Draggable map with center marker

### Routing/Directions
- Uses **Leaflet Routing Machine**
- Provides turn-by-turn directions
- Shows estimated travel time
- Displays route on map with polyline

## Benefits

1. **No API Key Required** - OpenStreetMap and Nominatim are completely free
2. **No Usage Limits** - Unlike Google Maps API quotas
3. **Open Source** - Full control and customization
4. **Privacy** - No tracking by third-party services
5. **Cost** - Zero cost for any usage level

## Usage Guidelines

### Nominatim API
- Fair usage: max 1 request per second
- User-Agent header recommended in production
- Consider self-hosting for high-volume apps

### OpenStreetMap Tiles
- Respect tile usage policy
- Consider using alternative tile providers for production (Mapbox, Thunderforest, etc.)
- Can self-host tiles for unlimited usage

## Testing

After migration, test these features:
1. Map loads correctly on city selection page
2. Address autocomplete works (type 3+ characters)
3. Selecting autocomplete result centers map
4. "Locate" button gets current location
5. Saving address stores correct coordinates
6. Order detail map shows route with directions
7. Item page opens correct location in OpenStreetMap

## Notes

- Leaflet marker icons require the `map-marker.png` asset in `src/assets/`
- Routing uses OSRM (Open Source Routing Machine) by default
- Map tiles load from `tile.openstreetmap.org` CDN
- All coordinates are in standard lat/lng format (no conversion needed)
