-- CreateEnum
CREATE TYPE "tax_status" AS ENUM ('RESPONSABLE_INSCRIPTO', 'MONOTRIBUTO', 'EXENTO');

-- CreateEnum
CREATE TYPE "lead_status" AS ENUM ('NEW', 'CONTACTED', 'NEGOTIATING', 'CONVERTED', 'REJECTED', 'INACTIVE');

-- CreateEnum
CREATE TYPE "quote_status" AS ENUM ('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "document_applies_to" AS ENUM ('EMPLOYEE', 'EQUIPMENT', 'COMPANY');

-- CreateEnum
CREATE TYPE "document_state" AS ENUM ('PENDING', 'APPROVED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "document_action" AS ENUM ('UPLOADED', 'REPLACED', 'RENEWED', 'DELETED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "identity_document_type" AS ENUM ('DNI', 'LE', 'LC', 'PASSPORT');

-- CreateEnum
CREATE TYPE "gender" AS ENUM ('MALE', 'FEMALE', 'NOT_DECLARED');

-- CreateEnum
CREATE TYPE "marital_status" AS ENUM ('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'SEPARATED', 'DOMESTIC_PARTNERSHIP');

-- CreateEnum
CREATE TYPE "education_level" AS ENUM ('PRIMARY', 'SECONDARY', 'TERTIARY', 'UNIVERSITY', 'POSTGRADUATE');

-- CreateEnum
CREATE TYPE "union_affiliation_status" AS ENUM ('AFFILIATED', 'NOT_AFFILIATED');

-- CreateEnum
CREATE TYPE "cost_type" AS ENUM ('DIRECT', 'INDIRECT');

-- CreateEnum
CREATE TYPE "employee_status" AS ENUM ('INCOMPLETE', 'COMPLETE', 'COMPLETE_EXPIRED_DOCS');

-- CreateEnum
CREATE TYPE "termination_reason" AS ENUM ('DISMISSAL_WITHOUT_CAUSE', 'RESIGNATION', 'DISMISSAL_WITH_CAUSE', 'MUTUAL_AGREEMENT', 'CONTRACT_END', 'DEATH');

-- CreateEnum
CREATE TYPE "vehicle_status" AS ENUM ('INCOMPLETE', 'COMPLETE', 'COMPLETE_EXPIRED_DOCS', 'APPROVED', 'NOT_APPROVED');

-- CreateEnum
CREATE TYPE "vehicle_condition" AS ENUM ('OPERATIVE', 'NOT_OPERATIVE', 'IN_REPAIR', 'CONDITIONAL_OPERATIVE', 'IN_PREPARATION');

-- CreateEnum
CREATE TYPE "vehicle_termination_reason" AS ENUM ('SALE', 'TOTAL_LOSS', 'RETURN', 'OTHER');

-- CreateEnum
CREATE TYPE "vehicle_titularity_type" AS ENUM ('LEASING', 'RENTAL', 'OWNED', 'PLEDGED');

-- CreateEnum
CREATE TYPE "currency" AS ENUM ('USD', 'EUR', 'GBP', 'ARS');

-- CreateTable
CREATE TABLE "countries" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "countries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provinces" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provinces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cities" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "province_id" INTEGER NOT NULL,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "tax_id" TEXT,
    "description" TEXT,
    "website" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "country" TEXT,
    "industry" TEXT,
    "tax_status" "tax_status",
    "logo_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_single_company" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "province_id" INTEGER,
    "city_id" INTEGER,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_members" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" TEXT NOT NULL,
    "is_owner" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "invited_by" TEXT,
    "joined_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "company_id" UUID NOT NULL,
    "role_id" UUID,
    "employee_id" UUID,

    CONSTRAINT "company_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_invitations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "token" UUID NOT NULL DEFAULT gen_random_uuid(),
    "invited_by" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "accepted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "company_id" UUID NOT NULL,
    "role_id" UUID,
    "employee_id" UUID,

    CONSTRAINT "company_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_preferences" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" TEXT NOT NULL,
    "active_company_id" UUID,
    "theme" TEXT NOT NULL DEFAULT 'system',
    "locale" TEXT NOT NULL DEFAULT 'es',
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "module" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parent_path" TEXT,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_roles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "description" TEXT,
    "color" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "company_id" UUID NOT NULL,

    CONSTRAINT "company_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_role_permissions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "module" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role_id" UUID NOT NULL,
    "action_id" UUID NOT NULL,

    CONSTRAINT "company_role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_member_permissions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "module" TEXT NOT NULL,
    "is_granted" BOOLEAN NOT NULL DEFAULT true,
    "assigned_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "member_id" UUID NOT NULL,
    "action_id" UUID NOT NULL,

    CONSTRAINT "company_member_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permission_audit_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "company_id" UUID NOT NULL,
    "performed_by" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "target_type" TEXT NOT NULL,
    "target_id" UUID NOT NULL,
    "target_name" TEXT,
    "module" TEXT,
    "details" JSONB,
    "old_value" JSONB,
    "new_value" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permission_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contract_types" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "company_id" UUID NOT NULL,

    CONSTRAINT "contract_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_positions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "company_id" UUID NOT NULL,

    CONSTRAINT "job_positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "company_id" UUID NOT NULL,

    CONSTRAINT "unions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collective_agreements" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "union_id" UUID NOT NULL,

    CONSTRAINT "collective_agreements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_categories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "agreement_id" UUID NOT NULL,

    CONSTRAINT "job_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cost_centers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "company_id" UUID NOT NULL,

    CONSTRAINT "cost_centers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_brands" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "company_id" UUID NOT NULL,

    CONSTRAINT "vehicle_brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_models" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "brand_id" UUID NOT NULL,

    CONSTRAINT "vehicle_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_types" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "has_hitch" BOOLEAN NOT NULL DEFAULT false,
    "is_tractor_unit" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "company_id" UUID NOT NULL,

    CONSTRAINT "vehicle_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "types_of_vehicles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "company_id" UUID NOT NULL,

    CONSTRAINT "types_of_vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sectors" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "short_description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "company_id" UUID NOT NULL,

    CONSTRAINT "sectors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "type_operatives" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "company_id" UUID NOT NULL,

    CONSTRAINT "type_operatives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_owners" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "cuit" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "company_id" UUID NOT NULL,

    CONSTRAINT "equipment_owners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_owner_titularity_types" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "titularity_type" "vehicle_titularity_type" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "owner_id" UUID NOT NULL,

    CONSTRAINT "equipment_owner_titularity_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contractors" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "tax_id" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "logo_key" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "termination_date" TIMESTAMP(3),
    "reason_for_termination" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "company_id" UUID NOT NULL,

    CONSTRAINT "contractors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contractor_vehicles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vehicle_id" UUID NOT NULL,
    "contractor_id" UUID NOT NULL,

    CONSTRAINT "contractor_vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contractor_employees" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "employee_id" UUID NOT NULL,
    "contractor_id" UUID NOT NULL,

    CONSTRAINT "contractor_employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "tax_id" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "status" "lead_status" NOT NULL DEFAULT 'NEW',
    "notes" TEXT,
    "converted_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "company_id" UUID NOT NULL,
    "converted_to_client_id" UUID,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contacts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "position" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "company_id" UUID NOT NULL,
    "contractor_id" UUID,
    "lead_id" UUID,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "number" TEXT NOT NULL,
    "issue_date" TIMESTAMP(3) NOT NULL,
    "expiration_date" TIMESTAMP(3),
    "status" "quote_status" NOT NULL DEFAULT 'DRAFT',
    "items" JSONB NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "tax" DECIMAL(12,2),
    "total" DECIMAL(12,2) NOT NULL,
    "currency" "currency" NOT NULL DEFAULT 'ARS',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "company_id" UUID NOT NULL,
    "contractor_id" UUID,
    "lead_id" UUID,

    CONSTRAINT "quotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_types" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "applies_to" "document_applies_to" NOT NULL,
    "is_mandatory" BOOLEAN NOT NULL DEFAULT false,
    "has_expiration" BOOLEAN NOT NULL DEFAULT false,
    "is_monthly" BOOLEAN NOT NULL DEFAULT false,
    "is_private" BOOLEAN NOT NULL DEFAULT false,
    "is_termination" BOOLEAN NOT NULL DEFAULT false,
    "is_multi_resource" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_conditional" BOOLEAN NOT NULL DEFAULT false,
    "genders" "gender"[] DEFAULT ARRAY[]::"gender"[],
    "costTypes" "cost_type"[] DEFAULT ARRAY[]::"cost_type"[],
    "advanced_conditions" JSONB,
    "company_id" UUID NOT NULL,

    CONSTRAINT "document_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_type_job_positions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "document_type_id" UUID NOT NULL,
    "job_position_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_type_job_positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_type_contract_types" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "document_type_id" UUID NOT NULL,
    "contract_type_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_type_contract_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_type_job_categories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "document_type_id" UUID NOT NULL,
    "job_category_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_type_job_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_type_unions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "document_type_id" UUID NOT NULL,
    "union_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_type_unions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_type_collective_agreements" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "document_type_id" UUID NOT NULL,
    "collective_agreement_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_type_collective_agreements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_type_vehicle_brands" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "document_type_id" UUID NOT NULL,
    "vehicle_brand_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_type_vehicle_brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_type_vehicle_types" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "document_type_id" UUID NOT NULL,
    "vehicle_type_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_type_vehicle_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_documents" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "state" "document_state" NOT NULL DEFAULT 'PENDING',
    "expiration_date" TIMESTAMP(3),
    "period" TEXT,
    "document_path" TEXT,
    "document_key" TEXT,
    "file_name" TEXT,
    "file_size" INTEGER,
    "mime_type" TEXT,
    "uploaded_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "document_type_id" UUID NOT NULL,
    "employee_id" UUID,

    CONSTRAINT "employee_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_document_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "action" "document_action" NOT NULL,
    "state" "document_state" NOT NULL,
    "document_key" TEXT,
    "file_name" TEXT,
    "file_size" INTEGER,
    "mime_type" TEXT,
    "expiration_date" TIMESTAMP(3),
    "reason" TEXT,
    "changed_by" TEXT NOT NULL,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "document_id" UUID NOT NULL,

    CONSTRAINT "employee_document_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_documents" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "state" "document_state" NOT NULL DEFAULT 'PENDING',
    "expiration_date" TIMESTAMP(3),
    "period" TEXT,
    "document_path" TEXT,
    "document_key" TEXT,
    "file_name" TEXT,
    "file_size" INTEGER,
    "mime_type" TEXT,
    "rejection_reason" TEXT,
    "uploaded_by" TEXT,
    "approved_by" TEXT,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "document_type_id" UUID NOT NULL,
    "vehicle_id" UUID,

    CONSTRAINT "equipment_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_document_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "action" "document_action" NOT NULL,
    "state" "document_state" NOT NULL,
    "document_key" TEXT,
    "file_name" TEXT,
    "file_size" INTEGER,
    "mime_type" TEXT,
    "expiration_date" TIMESTAMP(3),
    "reason" TEXT,
    "changed_by" TEXT NOT NULL,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "document_id" UUID NOT NULL,

    CONSTRAINT "equipment_document_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_documents" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "state" "document_state" NOT NULL DEFAULT 'PENDING',
    "expiration_date" TIMESTAMP(3),
    "period" TEXT,
    "document_path" TEXT,
    "document_key" TEXT,
    "file_name" TEXT,
    "file_size" INTEGER,
    "mime_type" TEXT,
    "rejection_reason" TEXT,
    "uploaded_by" TEXT,
    "approved_by" TEXT,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "document_type_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,

    CONSTRAINT "company_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "employee_number" TEXT NOT NULL,
    "identity_document_type" "identity_document_type" NOT NULL DEFAULT 'DNI',
    "document_number" TEXT NOT NULL,
    "cuil" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "birth_date" TIMESTAMP(3),
    "gender" "gender",
    "marital_status" "marital_status",
    "education_level" "education_level",
    "picture_url" TEXT,
    "picture_key" TEXT,
    "nationality_id" INTEGER,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "street" TEXT NOT NULL,
    "street_number" TEXT NOT NULL,
    "postal_code" TEXT,
    "province_id" INTEGER NOT NULL,
    "city_id" INTEGER,
    "birth_place_id" INTEGER,
    "hire_date" TIMESTAMP(3) NOT NULL,
    "working_hours_per_day" INTEGER,
    "union_affiliation_status" "union_affiliation_status",
    "cost_type" "cost_type",
    "status" "employee_status" NOT NULL DEFAULT 'INCOMPLETE',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "termination_date" TIMESTAMP(3),
    "termination_reason" "termination_reason",
    "company_id" UUID NOT NULL,
    "job_position_id" UUID,
    "contract_type_id" UUID,
    "job_category_id" UUID,
    "cost_center_id" UUID,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "intern_number" TEXT,
    "domain" TEXT,
    "chassis" TEXT,
    "engine" TEXT NOT NULL,
    "serie" TEXT,
    "year" TEXT NOT NULL,
    "kilometer" TEXT DEFAULT '0',
    "picture_url" TEXT,
    "picture_key" TEXT,
    "status" "vehicle_status" NOT NULL DEFAULT 'INCOMPLETE',
    "condition" "vehicle_condition" NOT NULL DEFAULT 'OPERATIVE',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "termination_date" TIMESTAMP(3),
    "termination_reason" "vehicle_termination_reason",
    "titularity_type" "vehicle_titularity_type",
    "contract_number" TEXT,
    "contract_start_date" TIMESTAMP(3),
    "contract_expiration_date" TIMESTAMP(3),
    "currency" "currency",
    "price" DECIMAL(12,2),
    "monthly_price" DECIMAL(12,2),
    "owner_id" UUID,
    "cost_type" "cost_type",
    "company_id" UUID NOT NULL,
    "brand_id" UUID,
    "model_id" UUID,
    "type_id" UUID NOT NULL,
    "type_of_vehicle_id" UUID NOT NULL,
    "cost_center_id" UUID,
    "sector_id" UUID,
    "type_operative_id" UUID,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "countries_name_key" ON "countries"("name");

-- CreateIndex
CREATE UNIQUE INDEX "countries_code_key" ON "countries"("code");

-- CreateIndex
CREATE UNIQUE INDEX "provinces_name_key" ON "provinces"("name");

-- CreateIndex
CREATE UNIQUE INDEX "cities_name_province_id_key" ON "cities"("name", "province_id");

-- CreateIndex
CREATE UNIQUE INDEX "companies_slug_key" ON "companies"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "companies_tax_id_key" ON "companies"("tax_id");

-- CreateIndex
CREATE UNIQUE INDEX "company_members_employee_id_key" ON "company_members"("employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "company_members_company_id_user_id_key" ON "company_members"("company_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "company_invitations_token_key" ON "company_invitations"("token");

-- CreateIndex
CREATE UNIQUE INDEX "company_invitations_company_id_email_key" ON "company_invitations"("company_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_user_id_key" ON "user_preferences"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "routes_path_key" ON "routes"("path");

-- CreateIndex
CREATE UNIQUE INDEX "actions_name_key" ON "actions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "actions_slug_key" ON "actions"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "company_roles_company_id_slug_key" ON "company_roles"("company_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "company_role_permissions_role_id_module_action_id_key" ON "company_role_permissions"("role_id", "module", "action_id");

-- CreateIndex
CREATE UNIQUE INDEX "company_member_permissions_member_id_module_action_id_key" ON "company_member_permissions"("member_id", "module", "action_id");

-- CreateIndex
CREATE INDEX "permission_audit_logs_company_id_created_at_idx" ON "permission_audit_logs"("company_id", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "contract_types_company_id_name_key" ON "contract_types"("company_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "job_positions_company_id_name_key" ON "job_positions"("company_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "unions_company_id_name_key" ON "unions"("company_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "collective_agreements_union_id_name_key" ON "collective_agreements"("union_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "job_categories_agreement_id_name_key" ON "job_categories"("agreement_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "cost_centers_company_id_name_key" ON "cost_centers"("company_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_brands_company_id_name_key" ON "vehicle_brands"("company_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_models_brand_id_name_key" ON "vehicle_models"("brand_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_types_company_id_name_key" ON "vehicle_types"("company_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "types_of_vehicles_company_id_name_key" ON "types_of_vehicles"("company_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "sectors_company_id_name_key" ON "sectors"("company_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "type_operatives_company_id_name_key" ON "type_operatives"("company_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_owners_company_id_cuit_key" ON "equipment_owners"("company_id", "cuit");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_owner_titularity_types_owner_id_titularity_type_key" ON "equipment_owner_titularity_types"("owner_id", "titularity_type");

-- CreateIndex
CREATE UNIQUE INDEX "contractors_company_id_name_key" ON "contractors"("company_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "contractors_company_id_tax_id_key" ON "contractors"("company_id", "tax_id");

-- CreateIndex
CREATE UNIQUE INDEX "contractor_vehicles_vehicle_id_contractor_id_key" ON "contractor_vehicles"("vehicle_id", "contractor_id");

-- CreateIndex
CREATE UNIQUE INDEX "contractor_employees_employee_id_contractor_id_key" ON "contractor_employees"("employee_id", "contractor_id");

-- CreateIndex
CREATE UNIQUE INDEX "leads_company_id_tax_id_key" ON "leads"("company_id", "tax_id");

-- CreateIndex
CREATE UNIQUE INDEX "contacts_contractor_id_key" ON "contacts"("contractor_id");

-- CreateIndex
CREATE UNIQUE INDEX "contacts_lead_id_key" ON "contacts"("lead_id");

-- CreateIndex
CREATE UNIQUE INDEX "quotes_company_id_number_key" ON "quotes"("company_id", "number");

-- CreateIndex
CREATE UNIQUE INDEX "document_types_company_id_name_key" ON "document_types"("company_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "document_types_company_id_slug_key" ON "document_types"("company_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "document_type_job_positions_document_type_id_job_position_i_key" ON "document_type_job_positions"("document_type_id", "job_position_id");

-- CreateIndex
CREATE UNIQUE INDEX "document_type_contract_types_document_type_id_contract_type_key" ON "document_type_contract_types"("document_type_id", "contract_type_id");

-- CreateIndex
CREATE UNIQUE INDEX "document_type_job_categories_document_type_id_job_category__key" ON "document_type_job_categories"("document_type_id", "job_category_id");

-- CreateIndex
CREATE UNIQUE INDEX "document_type_unions_document_type_id_union_id_key" ON "document_type_unions"("document_type_id", "union_id");

-- CreateIndex
CREATE UNIQUE INDEX "document_type_collective_agreements_document_type_id_collec_key" ON "document_type_collective_agreements"("document_type_id", "collective_agreement_id");

-- CreateIndex
CREATE UNIQUE INDEX "document_type_vehicle_brands_document_type_id_vehicle_brand_key" ON "document_type_vehicle_brands"("document_type_id", "vehicle_brand_id");

-- CreateIndex
CREATE UNIQUE INDEX "document_type_vehicle_types_document_type_id_vehicle_type_i_key" ON "document_type_vehicle_types"("document_type_id", "vehicle_type_id");

-- CreateIndex
CREATE UNIQUE INDEX "employee_documents_document_type_id_employee_id_period_key" ON "employee_documents"("document_type_id", "employee_id", "period");

-- CreateIndex
CREATE INDEX "employee_document_history_document_id_idx" ON "employee_document_history"("document_id");

-- CreateIndex
CREATE INDEX "employee_document_history_changed_at_idx" ON "employee_document_history"("changed_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "equipment_documents_document_type_id_vehicle_id_period_key" ON "equipment_documents"("document_type_id", "vehicle_id", "period");

-- CreateIndex
CREATE INDEX "equipment_document_history_document_id_idx" ON "equipment_document_history"("document_id");

-- CreateIndex
CREATE INDEX "equipment_document_history_changed_at_idx" ON "equipment_document_history"("changed_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "company_documents_document_type_id_company_id_period_key" ON "company_documents"("document_type_id", "company_id", "period");

-- CreateIndex
CREATE UNIQUE INDEX "employees_company_id_employee_number_key" ON "employees"("company_id", "employee_number");

-- CreateIndex
CREATE UNIQUE INDEX "employees_company_id_cuil_key" ON "employees"("company_id", "cuil");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_company_id_intern_number_key" ON "vehicles"("company_id", "intern_number");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_company_id_domain_key" ON "vehicles"("company_id", "domain");

-- AddForeignKey
ALTER TABLE "cities" ADD CONSTRAINT "cities_province_id_fkey" FOREIGN KEY ("province_id") REFERENCES "provinces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_province_id_fkey" FOREIGN KEY ("province_id") REFERENCES "provinces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_members" ADD CONSTRAINT "company_members_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_members" ADD CONSTRAINT "company_members_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "company_roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_members" ADD CONSTRAINT "company_members_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_invitations" ADD CONSTRAINT "company_invitations_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_invitations" ADD CONSTRAINT "company_invitations_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "company_roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_invitations" ADD CONSTRAINT "company_invitations_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_roles" ADD CONSTRAINT "company_roles_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_role_permissions" ADD CONSTRAINT "company_role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "company_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_role_permissions" ADD CONSTRAINT "company_role_permissions_action_id_fkey" FOREIGN KEY ("action_id") REFERENCES "actions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_member_permissions" ADD CONSTRAINT "company_member_permissions_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "company_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_member_permissions" ADD CONSTRAINT "company_member_permissions_action_id_fkey" FOREIGN KEY ("action_id") REFERENCES "actions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_types" ADD CONSTRAINT "contract_types_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_positions" ADD CONSTRAINT "job_positions_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unions" ADD CONSTRAINT "unions_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collective_agreements" ADD CONSTRAINT "collective_agreements_union_id_fkey" FOREIGN KEY ("union_id") REFERENCES "unions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_categories" ADD CONSTRAINT "job_categories_agreement_id_fkey" FOREIGN KEY ("agreement_id") REFERENCES "collective_agreements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_centers" ADD CONSTRAINT "cost_centers_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_brands" ADD CONSTRAINT "vehicle_brands_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_models" ADD CONSTRAINT "vehicle_models_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "vehicle_brands"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_types" ADD CONSTRAINT "vehicle_types_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "types_of_vehicles" ADD CONSTRAINT "types_of_vehicles_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sectors" ADD CONSTRAINT "sectors_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "type_operatives" ADD CONSTRAINT "type_operatives_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_owners" ADD CONSTRAINT "equipment_owners_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_owner_titularity_types" ADD CONSTRAINT "equipment_owner_titularity_types_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "equipment_owners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contractors" ADD CONSTRAINT "contractors_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contractor_vehicles" ADD CONSTRAINT "contractor_vehicles_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contractor_vehicles" ADD CONSTRAINT "contractor_vehicles_contractor_id_fkey" FOREIGN KEY ("contractor_id") REFERENCES "contractors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contractor_employees" ADD CONSTRAINT "contractor_employees_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contractor_employees" ADD CONSTRAINT "contractor_employees_contractor_id_fkey" FOREIGN KEY ("contractor_id") REFERENCES "contractors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_converted_to_client_id_fkey" FOREIGN KEY ("converted_to_client_id") REFERENCES "contractors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_contractor_id_fkey" FOREIGN KEY ("contractor_id") REFERENCES "contractors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_contractor_id_fkey" FOREIGN KEY ("contractor_id") REFERENCES "contractors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_types" ADD CONSTRAINT "document_types_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_type_job_positions" ADD CONSTRAINT "document_type_job_positions_document_type_id_fkey" FOREIGN KEY ("document_type_id") REFERENCES "document_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_type_job_positions" ADD CONSTRAINT "document_type_job_positions_job_position_id_fkey" FOREIGN KEY ("job_position_id") REFERENCES "job_positions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_type_contract_types" ADD CONSTRAINT "document_type_contract_types_document_type_id_fkey" FOREIGN KEY ("document_type_id") REFERENCES "document_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_type_contract_types" ADD CONSTRAINT "document_type_contract_types_contract_type_id_fkey" FOREIGN KEY ("contract_type_id") REFERENCES "contract_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_type_job_categories" ADD CONSTRAINT "document_type_job_categories_document_type_id_fkey" FOREIGN KEY ("document_type_id") REFERENCES "document_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_type_job_categories" ADD CONSTRAINT "document_type_job_categories_job_category_id_fkey" FOREIGN KEY ("job_category_id") REFERENCES "job_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_type_unions" ADD CONSTRAINT "document_type_unions_document_type_id_fkey" FOREIGN KEY ("document_type_id") REFERENCES "document_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_type_unions" ADD CONSTRAINT "document_type_unions_union_id_fkey" FOREIGN KEY ("union_id") REFERENCES "unions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_type_collective_agreements" ADD CONSTRAINT "document_type_collective_agreements_document_type_id_fkey" FOREIGN KEY ("document_type_id") REFERENCES "document_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_type_collective_agreements" ADD CONSTRAINT "document_type_collective_agreements_collective_agreement_i_fkey" FOREIGN KEY ("collective_agreement_id") REFERENCES "collective_agreements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_type_vehicle_brands" ADD CONSTRAINT "document_type_vehicle_brands_document_type_id_fkey" FOREIGN KEY ("document_type_id") REFERENCES "document_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_type_vehicle_brands" ADD CONSTRAINT "document_type_vehicle_brands_vehicle_brand_id_fkey" FOREIGN KEY ("vehicle_brand_id") REFERENCES "vehicle_brands"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_type_vehicle_types" ADD CONSTRAINT "document_type_vehicle_types_document_type_id_fkey" FOREIGN KEY ("document_type_id") REFERENCES "document_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_type_vehicle_types" ADD CONSTRAINT "document_type_vehicle_types_vehicle_type_id_fkey" FOREIGN KEY ("vehicle_type_id") REFERENCES "vehicle_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_documents" ADD CONSTRAINT "employee_documents_document_type_id_fkey" FOREIGN KEY ("document_type_id") REFERENCES "document_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_documents" ADD CONSTRAINT "employee_documents_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_document_history" ADD CONSTRAINT "employee_document_history_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "employee_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_documents" ADD CONSTRAINT "equipment_documents_document_type_id_fkey" FOREIGN KEY ("document_type_id") REFERENCES "document_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_documents" ADD CONSTRAINT "equipment_documents_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_document_history" ADD CONSTRAINT "equipment_document_history_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "equipment_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_documents" ADD CONSTRAINT "company_documents_document_type_id_fkey" FOREIGN KEY ("document_type_id") REFERENCES "document_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_documents" ADD CONSTRAINT "company_documents_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_nationality_id_fkey" FOREIGN KEY ("nationality_id") REFERENCES "countries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_province_id_fkey" FOREIGN KEY ("province_id") REFERENCES "provinces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_birth_place_id_fkey" FOREIGN KEY ("birth_place_id") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_job_position_id_fkey" FOREIGN KEY ("job_position_id") REFERENCES "job_positions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_contract_type_id_fkey" FOREIGN KEY ("contract_type_id") REFERENCES "contract_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_job_category_id_fkey" FOREIGN KEY ("job_category_id") REFERENCES "job_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_cost_center_id_fkey" FOREIGN KEY ("cost_center_id") REFERENCES "cost_centers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "equipment_owners"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "vehicle_brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "vehicle_models"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "vehicle_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_type_of_vehicle_id_fkey" FOREIGN KEY ("type_of_vehicle_id") REFERENCES "types_of_vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_cost_center_id_fkey" FOREIGN KEY ("cost_center_id") REFERENCES "cost_centers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_sector_id_fkey" FOREIGN KEY ("sector_id") REFERENCES "sectors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_type_operative_id_fkey" FOREIGN KEY ("type_operative_id") REFERENCES "type_operatives"("id") ON DELETE SET NULL ON UPDATE CASCADE;
