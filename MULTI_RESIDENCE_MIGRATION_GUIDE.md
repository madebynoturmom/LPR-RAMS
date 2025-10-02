# Multi-Residence LPR System - Database Migration Guide

## Overview
This document outlines the migration from a single-residence License Plate Recognition (LPR) system to a multi-residence system that can manage multiple residential complexes from a single platform.

## Current Database Structure (Single Residence)
```
Tables: 9 total
├── admin (7 columns)
├── user (11 columns) 
├── guard (8 columns)
├── vehicle (6 columns)
├── guest_pass (9 columns)
├── guest_pass_history (10 columns)
├── event_log (5 columns)
├── session (3 columns)
└── otp (4 columns)
```

## New Multi-Residence Architecture

### 🏢 **New Core Tables**

#### 1. **residence** - Master residence registry
- `id, name, address, phone, email, timezone, settings, created_at, updated_at, status`
- Manages all residential complexes in the system

#### 2. **residence_admin** - Super administrators
- `id, username, password_hash, name, email, phone, profile_pic, is_super_admin, created_at, updated_at`
- System-wide administrators who can manage multiple residences

#### 3. **residence_admin_access** - Admin-residence permissions
- `id, admin_id, residence_id, permissions, created_at`
- Many-to-many relationship for admin access control

#### 4. **residence_settings** - Residence-specific configurations
- `id, residence_id, setting_key, setting_value, created_at, updated_at`
- Flexible key-value settings per residence

### 🔄 **Modified Existing Tables**

All existing tables now include:
- `residence_id` - Foreign key to residence table
- `created_at, updated_at` - Timestamp tracking
- Additional residence-specific fields

#### Enhanced Features:
- **user**: Added `unit_number` for apartment/unit tracking
- **guard**: Added `shift_start_time, shift_end_time` for scheduling
- **vehicle**: Added `vehicle_type, color, is_active` for better management
- **guest_pass**: Added `approved_by, entry_gate, notes` for tracking
- **event_log**: Added `ip_address, user_agent` for security auditing

## 🚀 **Migration Process**

### Step 1: Backup Current Database
```bash
pg_dump -h localhost -U dev -d lpr > lpr_backup_$(date +%Y%m%d).sql
```

### Step 2: Run Migration Script
```bash
psql -h localhost -U dev -d lpr -f multi_residence_migration.sql
```

### Step 3: Update Application Schema
Replace current schema with the new multi-residence schema:
- `src/lib/server/db/multi-residence-schema.ts`

### Step 4: Data Migration (if existing data)
```sql
-- Example: Assign existing data to a default residence
UPDATE admin SET residence_id = 'res_001' WHERE residence_id IS NULL;
UPDATE user SET residence_id = 'res_001' WHERE residence_id IS NULL;
-- Repeat for all tables...
```

## 🏗️ **System Architecture Changes**

### 🔐 **Authentication Levels**
1. **Super Admin** - Can manage multiple residences
2. **Residence Admin** - Manages specific residence(s)
3. **Local Admin** - Residence-specific admin (existing admin table)
4. **Guard** - Residence-specific security
5. **Resident** - Residence-specific users

### 🏘️ **Multi-Tenancy Features**
- **Data Isolation**: All data scoped by `residence_id`
- **Custom Settings**: Per-residence configurations
- **Flexible Permissions**: Granular access control
- **Scalable**: Easy addition of new residences

### 📊 **New Admin Dashboard Capabilities**
- Residence selection dropdown
- Cross-residence analytics (for super admins)
- Residence-specific reports and management
- Bulk operations across residences

## 🔧 **Backend Changes Required**

### 1. Authentication Service Updates
```typescript
// Add residence context to session
interface SessionUser {
  id: string;
  role: 'super_admin' | 'residence_admin' | 'admin' | 'guard' | 'resident';
  residenceId?: string;
  residences?: string[]; // For multi-residence access
}
```

### 2. Database Query Updates
```typescript
// All queries must include residence filtering
const getVehicles = (residenceId: string) => {
  return db.select().from(vehicle).where(eq(vehicle.residenceId, residenceId));
};
```

### 3. API Route Changes
```typescript
// Add residence middleware
export const GET = async ({ params, locals }) => {
  const { residenceId } = params;
  // Verify user has access to this residence
  // Return residence-specific data
};
```

## 📋 **Implementation Checklist**

### Database Migration
- [x] Create new residence management tables
- [x] Add residence_id to existing tables  
- [x] Create indexes for performance
- [x] Generate migration SQL script
- [x] Update Drizzle schema

### Backend Updates
- [ ] Update authentication service
- [ ] Add residence middleware
- [ ] Modify all database queries
- [ ] Update API routes
- [ ] Add residence selection logic

### Frontend Updates  
- [ ] Add residence selector component
- [ ] Update admin dashboard layout
- [ ] Modify all data fetching
- [ ] Add multi-residence navigation
- [ ] Update user management interfaces

### Testing
- [ ] Test data isolation between residences
- [ ] Verify permission system
- [ ] Test super admin functionality
- [ ] Validate migration process

## 🎯 **Benefits of Multi-Residence System**

1. **Scalability**: Single platform for multiple residential complexes
2. **Cost Efficiency**: Shared infrastructure and maintenance
3. **Centralized Management**: Super admins can oversee multiple properties
4. **Data Security**: Complete isolation between residences
5. **Flexible Pricing**: Per-residence billing model
6. **Easier Updates**: Single codebase for all residences

## 📁 **Files Created/Modified**

### New Files:
- `multi_residence_migration.sql` - Database migration script
- `src/lib/server/db/multi-residence-schema.ts` - Updated Drizzle schema

### Files to Update:
- `src/lib/server/db/schema.ts` - Replace with multi-residence version
- `src/lib/server/auth.ts` - Add residence context
- All API routes in `src/routes/api/` - Add residence filtering
- Admin dashboard components - Add residence selection

## 🚨 **Important Notes**

1. **Breaking Changes**: This is a major architectural change requiring careful migration
2. **Data Backup**: Always backup before migration
3. **Testing**: Thoroughly test in development environment first
4. **Gradual Rollout**: Consider phased implementation
5. **User Training**: Admin users will need training on new multi-residence features

---

**Next Steps**: Run the migration script and begin updating the application code to support multi-residence functionality.