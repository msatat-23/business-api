// Actual persisted contact statuses (no "ALL" here — that only exists as a query filter).
// Keep in sync with ContactStatusFilter and the Prisma `Contact.contactStatus` default.
export enum ContactStatus {
  NEW = 'new',
  INPROGRESS = 'inprogress',
  RESOLVED = 'resolved',
}
