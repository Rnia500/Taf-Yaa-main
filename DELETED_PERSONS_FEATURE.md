# Deleted Persons Management Feature

## Overview
This feature provides a comprehensive system for managing soft and cascade deleted persons in the family tree application. Users can view, restore, or permanently purge deleted persons.

## Features

### 1. Deleted Persons Page
- **URL**: `/deleted-persons` (all trees) or `/deleted-persons/:treeId` (specific tree)
- **Access**: Click the trash icon in the navbar or navigate via mobile menu
- **Layout**: Table view showing deleted persons with their details

### 2. Table Columns
- **Person**: Name and deletion date
- **Deletion Mode**: Soft Delete or Cascade Delete badge
- **Affected**: Number of people and marriages affected
- **Time Remaining**: Countdown timer showing time until permanent deletion
- **Actions**: Restore and Purge buttons

### 3. Deletion Modes

#### Soft Delete
- Person is replaced with a placeholder
- Relationships are preserved
- Can be restored easily
- Only affects the person themselves

#### Cascade Delete
- Person and all descendants are marked for deletion
- Affects multiple people and marriages
- Can restore entire family line
- Shows count of affected people and marriages

### 4. Actions

#### Restore
- Restores the person and their relationships
- For cascade deletions, restores all people in the same deletion batch
- Only available if the undo window hasn't expired
- Shows success message with count of restored items

#### Purge
- Permanently deletes the person (irreversible)
- For cascade deletions, permanently deletes all people in the batch
- Shows warning confirmation before proceeding
- Cleans up all references in marriages

### 5. Countdown Timer
- Shows time remaining until permanent deletion
- Color-coded: Green (safe), Yellow (warning), Red (expired)
- Updates in real-time
- Shows different formats: days, hours, minutes, seconds

## Technical Implementation

### New Components
1. **DeletedPersonsPage**: Main page component with table layout
2. **DeletionCountdown**: Reusable countdown timer component

### New Service Functions
1. **getDeletedPersons()**: Get all deleted persons
2. **getDeletedPersonsByTreeId(treeId)**: Get deleted persons for specific tree
3. **purgePerson(personId)**: Permanently delete a person

### Navigation
- Added trash icon to AdminNavbar
- Added "Deleted Persons" to mobile menu
- Proper routing with tree context

## Usage

1. **Access the Feature**:
   - Click the trash icon in the navbar
   - Or use the mobile menu "Deleted Persons" option

2. **View Deleted Persons**:
   - See all soft and cascade deleted persons
   - Check time remaining for each deletion
   - View affected people and marriages count

3. **Restore a Person**:
   - Click "Restore" button next to the person
   - Person and relationships will be restored
   - Success message will confirm the action

4. **Purge a Person**:
   - Click "Purge" button next to the person
   - Confirm the warning dialog
   - Person will be permanently deleted

## Safety Features

- **Confirmation Dialogs**: All destructive actions require confirmation
- **Time Limits**: 30-day undo window for all deletions
- **Visual Indicators**: Color-coded status and countdown timers
- **Batch Operations**: Cascade deletions are handled as atomic operations
- **Reference Cleanup**: Purge operations clean up all database references

## Error Handling

- Graceful error handling for all operations
- User-friendly error messages
- Loading states for all actions
- Automatic refresh after operations

## Future Enhancements

- Bulk restore/purge operations
- Filtering and sorting options
- Export deleted persons data
- Advanced search functionality
- Deletion history tracking
