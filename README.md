# Avon Housing Website Guide

This document is for the client and day-to-day users of the Avon Housing website. It explains how to use the website as a visitor, how to use the admin panel, and what to check when reviewing the property experience.

## Website Purpose

The Avon Housing website is designed to:

- showcase residential and under-construction properties
- let visitors browse listings by category, type, location, and budget
- allow users to submit consultation and inquiry requests
- let the admin team add, edit, feature, and manage listings
- track inquiries and manage property presentation from one control panel

## Important Review Property

Please review the `GREEN VIEW` property on the website.

It is the best example of the full property-detail experience because it contains richer presentation sections such as:

- detailed property overview
- image gallery
- location section
- Vastu grid
- floor plan section
- sunlight and ventilation section
- price breakdown and extra details

If you want to understand how a fully completed premium listing appears to visitors, `GREEN VIEW` should be your reference property.

## For Regular Website Users

### 1. Browsing Properties

Visitors can browse properties from:

- the homepage
- featured collections
- assured resale section
- under-construction section
- the full properties page

Users can open any property card to see:

- photos
- pricing
- location
- property type
- BHK information
- amenities
- description
- special detail sections when available

### 2. Using Search and Filters

Users can narrow properties using filters such as:

- location
- property type
- BHK
- category
- budget
- sorting by price

This helps users quickly shortlist relevant homes.

### 3. Viewing Property Details

On a property page, the user can:

- see the photo gallery
- move between images
- open the property video if one is added
- check amenities
- read the description
- explore floor plan and Vastu information if that property includes it
- view nearby location context

### 4. Favourites and Recently Viewed

Users can:

- add properties to favourites
- revisit recently viewed properties
- check saved browsing activity in their user pages

### 5. Consultation / Inquiry Form

Users can submit an inquiry or consultation request by:

1. opening a property or the consultation page
2. filling in name, phone number, email, purpose, location, budget, type, and BHK
3. submitting the form

Once submitted, the inquiry goes to the admin system for follow-up.

### 6. Login / Signup

Users can:

- create an account with email and password
- sign in with Google
- reset password if needed

After login, users can continue browsing and manage saved activity more easily.

## For Admin Users

### 1. Admin Access

Only the authorized admin account can access the admin panel.

After login, the admin can open:

`/admin`

The admin panel includes these major sections:

- Dashboard
- Properties
- Inquiries
- Market Insights
- Manage Properties

### 2. Dashboard

The dashboard gives a quick business summary, including:

- total properties
- active, sold, and rented counts
- new inquiries
- most viewed properties
- recent activity
- location and inquiry trends

This is the best place to get a quick overview of site activity.

### 3. Adding a New Property

To add a property:

1. open the admin panel
2. go to the property form section
3. fill in the property details

Main fields include:

- title
- price
- location
- type
- BHK
- area
- description
- category
- status
- amenities
- image URLs or uploaded images
- map latitude and longitude
- video URL if available

Then save the property.

### 4. Editing an Existing Property

To edit a property:

1. open `Manage Properties`
2. find the listing
3. click `Edit`
4. update the fields
5. save changes

This can be used for pricing changes, description improvements, image changes, status changes, and presentation updates.

### 5. Featuring a Property

The admin can mark a property as featured.

Featured properties may appear in the homepage featured collections section, giving them stronger visibility.

### 6. Updating Property Status

The admin can update a property status such as:

- active
- sold
- rented

This helps keep visible inventory accurate.

### 7. Deleting a Property

If a property should no longer appear on the website, the admin can remove it from the admin table.

Please use delete carefully, because the property will no longer appear in active listing views.

### 8. Uploading Images

The admin panel supports property images and detail images.

Images may be used for:

- main gallery
- floor plan
- Vastu grid

For best results:

- use clear, high-quality images
- keep gallery images relevant to the actual unit or project
- keep the first image as the strongest cover image

### 9. Property Detail Enhancement Sections

The admin can enrich a premium listing with advanced content such as:

- floor plan image
- floor plan summary
- facing direction
- Vastu grid image
- natural light notes
- ventilation notes
- best season note
- agreement value
- price per square foot
- included items
- other expenses

Again, `GREEN VIEW` should be reviewed as the model example of how these sections appear to visitors.

### 10. Inquiry Management

The admin can review inquiries from the `Inquiries` section.

Each inquiry may contain:

- customer name
- phone number
- email
- location interest
- budget
- property type
- BHK
- linked property interest

Inquiry status can be updated to:

- new
- contacted
- closed

This helps track follow-up progress.

### 11. Market Insights

The admin panel also includes a market insights section to help review:

- hot locations
- popular inventory types
- price band distribution
- inquiry leaders
- promotion gaps

This is useful for internal analysis and content prioritization.

## Recommended Admin Workflow

For routine use, the admin can follow this order:

1. Check the dashboard
2. Review new inquiries
3. Update listing statuses
4. Add or improve property images and descriptions
5. Review featured properties
6. Use `GREEN VIEW` as the benchmark for full-detail premium presentation

## Content Quality Recommendations

To keep the website looking strong:

- use complete and accurate pricing
- avoid empty descriptions
- add multiple property images
- keep BHK and type labels consistent
- include floor plan and Vastu details for premium listings when possible
- verify map location values before publishing

## If Something Looks Wrong

Please report issues such as:

- missing images
- incorrect pricing
- wrong property status
- inquiry form errors
- broken property links
- incorrect admin access behavior

## Final Note

This website is designed to be both a client-facing showcase and an internal property management system.

For presentation review, `GREEN VIEW` should always be checked first because it demonstrates the most complete property-detail format available on the website.

## Deployment Notes

The project is split into:

- `backend` for the Express + MongoDB API
- `real estate proj` for the Vite frontend

For backend hosting on Railway:

1. Deploy the `backend` folder as a separate service.
2. Set Railway variables from `backend/.env.example`.
3. Keep the health check on `/api/health`.
4. After Railway gives you a public backend URL, set `VITE_API_BASE_URL` in the frontend to that URL.
5. Update `CLIENT_ORIGIN` on the backend to the deployed frontend URL so CORS allows the site.

For local development:

- Backend env keys are documented in `backend/.env.example`.
- Frontend env keys are documented in `real estate proj/.env.example`.
