# Product Requirements — Sea Soul Sandadi website

## Vision

Sea Soul Sandadi is a once-a-month Sunday gathering by the sea in Visakhapatnam (Vizag). It brings together curated local brands, slow food, live acoustic music and dance, workshops, families and pets in a calm, well-designed space.

It is not a loud flea market and it is not a commercial exhibition. It is a Sunday experience. The website should feel the same way: unhurried, coastal and personal. It should not read like a ticketing portal or a generic event template.

## Audience

| Group | What they want from the site |
| --- | --- |
| Young families | A safe, relaxed Sunday outing; reassurance that kids are welcome |
| Urban professionals | A slower weekend plan with good food and music |
| Entrepreneurs and creators | A curated place to sell; an easy way to ask about a stall |
| Wellness-focused communities | Calm atmosphere, workshops, conscious brands |
| Pet parents | Confirmation that pets are welcome and have space |
| Conscious consumers | Local, handmade, slow-fashion finds |

## Problem

Vizag is growing, but its weekends still lack a consistent, culture-led Sunday space. People who would enjoy the event have no single place to see what it is, what it looks like, when the next edition is, and how to take part. Today that information is scattered across a slide deck and social posts.

The organisers also need to update dates, photos and wording every month without hiring a developer each time.

## The four pillars

1. **Thoughtful Finds:** curated local brands, handmade goods, lifestyle and slow fashion.
2. **Slow Food:** open seating, shared tables, relaxed outdoor dining.
3. **Live Music:** indie and acoustic music, plus dance, that is easy on the soul.
4. **Community and Pets:** family-friendly, pet-friendly, inclusive.

## Goals — public site

1. **Discovery:** a first-time visitor understands what Sea Soul Sandadi is within one screen, then sees the venue and real photos of people shopping, eating, dancing, attending workshops and enjoying photo moments.
2. **Follow for dates and tickets:** dates and ticket announcements happen on Instagram and Facebook (`seasoulsandadi`). The site's main conversion is a follow, not a purchase.
3. **Vendor enquiries:** local brands can start a WhatsApp conversation in one tap, with a prefilled message.
4. **Answer common questions** through a short FAQ.
5. **Work everywhere:** fully responsive from 360 px phones to large desktops, fast on mobile data, accessible by keyboard and screen reader.

## Goals — admin panel

The owner (one person) can, without a developer:

- add, recategorise, reorder, hide and delete photos (gallery, hero, vendor and reel thumbnails);
- set the current edition's date (or keep it as "Announcing Soon") and venue;
- add, edit, reorder and remove FAQ entries;
- edit page copy (headlines, intros, vendor pitch, footer tagline);
- change the WhatsApp number and message, the Instagram/Facebook links, email and phone.

Changes should appear on the public site within seconds of saving.

## Non-goals

- No ticketing, checkout or "Book Tickets" button.
- No prices: not for tickets and not for vendor stalls.
- No vendor application form or vendor database. Enquiries go to WhatsApp.
- No edition history. There is a single current edition, overwritten each month.
- One admin account only. No roles, invitations or public sign-up.
- No user accounts, newsletter or comments for visitors.
- No embedded Instagram feed for now. Reel cards link out to Instagram.

## Success criteria

| Area | Measure |
| --- | --- |
| Clarity | A first-time tester can say what the event is and when to find the next date after scrolling once |
| Follow intent | Instagram/Facebook links are visible in the hero area, the edition card, the follow section and the footer |
| Vendor intent | The WhatsApp CTA opens a chat with the correct number and prefilled text on Android, iOS and desktop |
| Self-serve | The owner updates the edition date and uploads a photo end-to-end in under 5 minutes, with no code change |
| Performance | Lighthouse mobile score of 85+ for Performance and 95+ for Accessibility, SEO and Best Practices |
| Responsiveness | No horizontal scroll or clipped content at 360, 390, 768, 1024, 1280 and 1440 px |
| Brand | Only the three brand colours (terracotta `#d87459`, sea `#006994`, sand `#ecdfc8`) and their tints/shades are used |
| Security | Logged-out users cannot write any data, and no service-role key appears in the client bundle |
