# Clinic Scheduling Platform - Product Requirements

All organizations, people, and data in this document are fictional. This is an original portfolio project.

## Summary

A scheduling system for **Riverbend Family Medicine**, a fictional single-location primary-care clinic that also operates an urgent care. It books regular scheduled appointments and urgent care visits from one shared pool of provider availability, matches each patient to an eligible provider, and never double-books a provider.

## Users

- **Practice Manager** (Tier 1): owns scheduling rules, provider availability, and reports.
- **Front Desk** (Tier 1): books, reschedules, and cancels appointments day to day.
- **Provider** (Tier 2, read-only): sees their own schedule and submits schedule-change requests.

## Setting

- One clinic location with two kinds of visits:
  - **Scheduled appointments:** regular primary-care visits booked ahead of time.
  - **Urgent care visits:** same-day and walk-in visits, handled in parallel with scheduled appointments.
- **16 providers** cover both: physicians (MD/DO), nurse practitioners (NP), and physician assistants (PA).
- Both kinds of visits draw on the same providers, so availability is one shared pool.

## Visit types

| Type | Length | Buffer | Who may be booked |
| --- | --- | --- | --- |
| Extended (new patient, annual physical, complex visit) | 40 min | 10 min charting buffer after | Physicians and nurse practitioners |
| Standard (follow-up, sick visit, minor injury) | 20 min | none | Any provider |

Pediatric patients may only be booked with pediatric-eligible providers.

## Functional requirements

1. **Two schedules, one availability pool.** A scheduled-appointment book and an urgent care schedule, both drawing on the same provider availability. A provider busy at a given time is unavailable in both.
2. **Automatic matching.** Filter to providers who are available, hold the needed visit credential, and are pediatric-eligible when required. Recommend the provider with the lightest current load. Staff may choose any other eligible provider, never an ineligible one.
3. **Visit rules.** Extended visits reserve a 10-minute charting buffer. Shifts over 6 hours auto-block a 30-minute lunch and two 15-minute breaks (placement configurable).
4. **Coverage guard.** Patients with no remaining covered visits or an expired coverage period are flagged and cannot be booked until the record is updated.
5. **Blackout windows.** Configurable clinic-wide periods (for example, a staff meeting or lunch hour) that block scheduled appointments. Urgent care is unaffected.
6. **Day-to-day workflows.** Cancellations reopen the slot; a waitlist by provider type fills same-day openings; a provider-absence workflow lists affected appointments, finds eligible substitutes, and notifies patients if none is found.
7. **Notifications.** Text confirmation on booking and a reminder 24-48 hours before scheduled appointments. Staff calendar sync with an email fallback. Simulated in the prototype.
8. **Reports (Practice Manager).** Daily schedule summary; weekly productivity (visits per provider, scheduled vs. urgent care, extended vs. standard); coverage utilization; cancellation and no-show patterns; waitlist status.

## Permissions

| Tier | Roles | Access |
| --- | --- | --- |
| 1: full access | Practice Manager, Front Desk | Book, reschedule, cancel; manage patients, coverage, and availability; adjust blackout windows and rules (manager); manage the waitlist; view all reports. |
| 2: read-only | Provider | View own daily and weekly schedule; submit schedule-change requests. No access to other providers' schedules, patient records, or reports. |

## Quality goals

- The matching logic narrows choices so staff do not need to remember credentials or availability.
- Hard to make a mistake: no double-booking, no ineligible or unavailable provider, no booking against exhausted or expired coverage.
- Scheduled and urgent care views look distinct but never conflict.
- Accessible, keyboard-friendly interface; dates and times shown with an explicit time zone (`America/New_York`).

## Acceptance criteria

- [ ] Scheduled and urgent care schedules share one availability pool with no cross-schedule double-booking.
- [ ] Booking filters to eligible providers and recommends a load-balanced choice; overrides only within the eligible pool.
- [ ] 40-minute extended visits (physicians and NPs only) with a 10-minute buffer; 20-minute standard visits.
- [ ] Auto-blocked breaks for shifts over 6 hours.
- [ ] Coverage guard blocks booking on zero remaining visits or expired coverage.
- [ ] Configurable blackout windows affect scheduled appointments only.
- [ ] Cancellations reopen slots; waitlist; provider-absence workflow with substitute search and patient notification fallback.
- [ ] Text confirmations and reminders; staff calendar sync with email fallback.
- [ ] The five manager reports.
- [ ] Two-tier permissions.

## Out of scope

Clinical documentation (charts, notes, prescriptions), billing and claims, and replacement of any electronic health record system. This is scheduling only.

## Fictional provider roster

The seeded roster of 16 fictional providers is defined in the seed data when it is built. Planned mix: 5 physicians, 7 nurse practitioners, 4 physician assistants; at least 10 pediatric-eligible; two or three with variable weekly availability that the manager unlocks by submitting availability.
