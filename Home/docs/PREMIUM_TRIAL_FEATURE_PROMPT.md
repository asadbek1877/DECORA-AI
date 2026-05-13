# Decora AI - Premium and Trial Mode Product Prompt

## Purpose
Introduce two clear usage modes in the product: `Premium` and `Trial`, so users can either work with full paid functionality after registration or explore the experience for free through curated demo content.

## Product Goal
The feature must increase conversion to registration and paid usage while still giving new visitors a simple, attractive, and low-friction free experience.

## Core Modes

### 1. Premium Mode
- Premium mode is available only for registered and authenticated users.
- If an unauthenticated user selects Premium mode, the system must redirect them to registration or login.
- The Premium mode UI must clearly display the current credit balance.
- Credit count should always be visible in the main action area, not hidden deep inside settings.
- Premium mode should feel like the main production workflow.

### 2. Trial Mode
- Trial mode must be accessible without payment.
- A prominent CTA button must be shown: `Try for free`.
- Trial mode is designed to showcase the product using preloaded demo images instead of full paid generation freedom.
- The trial experience should be fast, visual, and understandable even for first-time users.

## Trial Mode Experience

### Demo Gallery Rules
- Show exactly 5 demo images in the Trial section.
- These images must be simple, clean, and easy to understand.
- If the user clicks any demo image, the interface should open style-based result variations for that same image.
- The result should demonstrate how one original image can be transformed into multiple design styles.

### Before / After Presentation
- Each demo item should support a `before` and `after` presentation.
- The user must clearly understand:
  - original image
  - transformed image
  - style difference between versions
- The comparison can be shown as:
  - slider comparison
  - side-by-side cards
  - before/after toggle
- The final UI should prioritize visual clarity over complexity.

## Admin Content Management

### Dedicated Demo Content Storage
- Create one dedicated place for Trial demo content management.
- This can be a folder, storage bucket, or a clearly separated admin-managed content area.
- Each demo entry should support:
  - source `before` image
  - generated `after` image or style variants
  - metadata such as title, style name, order, and active status

### Admin Actions
- Admin must be able to upload new Trial demo images.
- Admin must be able to delete old demo images.
- Admin must be able to replace existing demo images with new ones.
- Admin should be able to control which 5 demo items are visible in Trial mode.
- If possible, the content structure should be simple enough that non-technical admins can manage it safely.

## UX Requirements
- The two modes must be visually separated and easy to understand.
- Premium mode should communicate value, credits, and full access.
- Trial mode should communicate simplicity, safety, and instant exploration.
- The switch between modes should be obvious and smooth on both mobile and web.
- Registration prompts should appear only when necessary and should not interrupt Trial browsing.

## Suggested User Flow
1. User lands on the home screen.
2. User sees two options: `Premium` and `Try for free`.
3. If user selects Premium:
   - check authentication
   - if not registered, send to registration/login
   - if registered, show available credits and continue
4. If user selects Trial:
   - open the 5 demo images
   - on image click, show styled variations
   - present results with before/after comparison

## Functional Requirements
- Support two separate entry points: Premium and Trial.
- Restrict Premium to authenticated users only.
- Display credit balance inside Premium mode.
- Display 5 admin-managed demo images inside Trial mode.
- Open style variations when a Trial image is selected.
- Support before/after visualization for each Trial example.
- Support admin upload, delete, and replace actions for Trial assets.

## Non-Functional Requirements
- Demo content loading should be fast.
- Demo images should be optimized for mobile and web.
- The content management structure should be maintainable.
- The feature should be scalable so more demo items or styles can be added later.

## Recommended Implementation Notes
- Keep Trial data separate from user-generated Premium data.
- Reuse the existing before/after component where possible.
- Store Trial demo assets in a predictable structure, for example:

```text
trial-demo/
  item-01/
    before.webp
    style-modern.webp
    style-minimal.webp
    style-luxury.webp
  item-02/
    before.webp
    style-scandinavian.webp
    style-classic.webp
```

- Admin panel should manage these items through a simple CRUD interface.
- If only one transformed result exists per item, still preserve the before/after structure for consistency.

## Success Criteria
- New users can understand the difference between Premium and Trial in a few seconds.
- Trial mode gives a convincing visual preview without requiring payment.
- Premium mode clearly shows credits and encourages registered usage.
- Admin can refresh demo content without developer involvement.

## Final Product Direction
This feature should position Decora AI as a product with:
- a clear monetization path through Premium access
- a frictionless acquisition path through Trial exploration
- strong visual proof through before/after examples
- lightweight admin control over demo content
