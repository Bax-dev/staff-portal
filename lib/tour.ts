export type TourPlacement = 'top' | 'bottom' | 'left' | 'right'

export type TourStep = {
  id: string
  selector: string
  title: string
  body: string
  route: string
  placement: TourPlacement
  openNav?: boolean
}

export const TOUR_STORAGE_KEY = 'smp-tour-completed'

export const tourSteps: TourStep[] = [
  {
    id: 'nav',
    selector: '[data-tour="nav"]',
    title: 'Move around the portal',
    body: 'Use the sidebar to open Overview, Staff directory, Archive, Organization, Documents, Reports and Settings.',
    route: '/',
    placement: 'right',
    openNav: true,
  },
  {
    id: 'overview-stats',
    selector: '[data-tour="overview-stats"]',
    title: 'Workforce at a glance',
    body: 'These cards summarise staff totals, active people, departments and recent records for the directorate.',
    route: '/',
    placement: 'bottom',
  },
  {
    id: 'overview-recent',
    selector: '[data-tour="overview-recent"]',
    title: 'Open a staff record',
    body: 'Select anyone in this list to review their profile, service history and supporting records.',
    route: '/',
    placement: 'right',
  },
  {
    id: 'directory-actions',
    selector: '[data-tour="directory-actions"]',
    title: 'Add, import and export',
    body: 'Create a staff record, upload a register, or download CSV and XLSX copies of the current directory.',
    route: '/staff',
    placement: 'bottom',
  },
  {
    id: 'directory-search',
    selector: '[data-tour="directory-search"]',
    title: 'Find people quickly',
    body: 'Search by name, staff ID or designation, and filter the list to a department or unit.',
    route: '/staff',
    placement: 'bottom',
  },
  {
    id: 'document-types',
    selector: '[data-tour="document-types"]',
    title: 'Keep supporting files here',
    body: 'Upload identity documents and service records, or import a staff register from CSV or XLSX.',
    route: '/documents',
    placement: 'bottom',
  },
  {
    id: 'notifications',
    selector: '[data-tour="notifications"]',
    title: 'Stay up to date',
    body: 'Alerts about workspace activity appear here so you can review them without leaving the page.',
    route: '/documents',
    placement: 'bottom',
  },
  {
    id: 'audit',
    selector: '[data-tour="audit"]',
    title: 'A clear audit trail',
    body: 'Every important change is logged. Open the audit log whenever you need to see who changed what.',
    route: '/documents',
    placement: 'right',
    openNav: true,
  },
]
