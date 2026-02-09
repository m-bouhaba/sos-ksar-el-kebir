# SOS Ksar Development Rules

## Architecture Guidelines

### Server Actions Only
- **NO API routes** - Use Server Actions exclusively for all data operations
- All mutations and data fetching must be implemented as Server Actions
- Place Server Actions in `/actions` directory

### Testing Requirements
- **Tests are mandatory** for all new features
- Write tests before implementing features (TDD approach)
- Use Vitest + React Testing Library
- Test files should be co-located with features or in `/tests` directory
- All tests must pass before merging

### Global Enums
- **Single source of truth**: All enums must be imported from `/types/index.ts`
- Do not redefine enums in components or other files
- Use shared enums for database schema, validation, and UI logic
- Available enums:
  - `UserRole` (citizen, volunteer, admin)
  - `ReportStatus` (pending, in_progress, resolved, cancelled)
  - `ReportType` (medical, fire, accident, crime, natural_disaster, other)
  - `InventoryItem` (first_aid_kit, fire_extinguisher, emergency_blanket, etc.)

### Database Operations
- Use Drizzle ORM for all database operations
- All database queries must be typed using the generated types
- Database schema is defined in `/db/schema/index.ts`
- Use the shared enums for all enum columns

### Code Organization
- Features go in `/features` directory
- Server Actions go in `/actions` directory
- Shared utilities go in `/lib` directory
- Types are centralized in `/types` directory

### Forbidden Patterns
- **NO API routes** (/api/*)
- **NO middleware.ts** (authentication will be handled differently)
- **NO direct database access in components** - use Server Actions
- **NO hardcoded enum values** - always import from `/types`

### Development Workflow
1. Create/update types in `/types/index.ts` if needed
2. Write tests first
3. Implement Server Actions in `/actions`
4. Create UI components in `/features`
5. Ensure all tests pass

### Authentication (Future)
- Better Auth is installed but not configured
- Authentication logic will be added later
- Do not implement any auth features until explicitly requested
