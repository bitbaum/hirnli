/**
 * ORG-SPECIFIC: Content written for Revamp-IT.
 * To support a new org, rewrite lib/config/team.ts TEAM_MEMBERS + DEPARTMENTS.
 * This file is a re-export shim so page-local imports continue to work.
 */
export { TEAM_MEMBERS, DEPARTMENTS, type TeamMemberDisplay } from '@/lib/config/team';
