-- The CSV/XLSX import used to fabricate a full record for every row that had
-- no "Name" column value: name = 'Unnamed staff', staff ID = 'IMP-<row>'.
-- That fallback has been removed (blank-name rows are now skipped on import),
-- but records it already created in production need a one-time cleanup.
-- Child records cascade via onDelete: Cascade on their Staff relation.
DELETE FROM "Staff" WHERE "name" = 'Unnamed staff';
