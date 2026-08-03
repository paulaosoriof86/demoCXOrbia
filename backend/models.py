"""Pydantic models for TyA Consultores platform."""
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Literal
from pydantic import BaseModel, EmailStr, Field
import uuid


def new_id() -> str:
    return str(uuid.uuid4())


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


Role = Literal["super_admin", "admin", "coordinador", "supervisor", "auditor"]
CampaignStatus = Literal["borrador", "activa", "pausada", "finalizada"]
VisitStatus = Literal["planificada", "en_curso", "completada", "auditada", "rechazada"]


# ---------- USER ----------
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: Role = "auditor"
    phone: Optional[str] = None
    active: bool = True


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[Role] = None
    phone: Optional[str] = None
    active: Optional[bool] = None
    password: Optional[str] = None


class User(UserBase):
    id: str = Field(default_factory=new_id)
    password_hash: str = ""
    created_at: str = Field(default_factory=now_iso)


class UserPublic(UserBase):
    id: str
    created_at: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic


# ---------- CLIENT (empresa auditada) ----------
class ClientIn(BaseModel):
    name: str
    industry: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None
    notes: Optional[str] = None


class Client(ClientIn):
    id: str = Field(default_factory=new_id)
    created_at: str = Field(default_factory=now_iso)


# ---------- POINT OF SALE ----------
class PointOfSaleIn(BaseModel):
    client_id: str
    name: str
    address: Optional[str] = None
    city: Optional[str] = None
    region: Optional[str] = None
    code: Optional[str] = None
    manager_name: Optional[str] = None


class PointOfSale(PointOfSaleIn):
    id: str = Field(default_factory=new_id)
    created_at: str = Field(default_factory=now_iso)


# ---------- FORM (dinámico) ----------
class FormQuestion(BaseModel):
    id: str = Field(default_factory=new_id)
    text: str
    type: Literal["text", "number", "single", "multi", "yes_no", "scale", "photo", "audio"] = "text"
    options: List[str] = []
    weight: float = 1.0
    required: bool = True


class FormSection(BaseModel):
    id: str = Field(default_factory=new_id)
    title: str
    questions: List[FormQuestion] = []


class FormIn(BaseModel):
    name: str
    description: Optional[str] = ""
    sections: List[FormSection] = []


class Form(FormIn):
    id: str = Field(default_factory=new_id)
    created_by: Optional[str] = None
    created_at: str = Field(default_factory=now_iso)


# ---------- CAMPAIGN ----------
class CampaignIn(BaseModel):
    name: str
    client_id: str
    form_id: str
    description: Optional[str] = ""
    starts_at: Optional[str] = None
    ends_at: Optional[str] = None
    status: CampaignStatus = "borrador"
    target_points_of_sale: List[str] = []  # IDs


class Campaign(CampaignIn):
    id: str = Field(default_factory=new_id)
    created_by: Optional[str] = None
    created_at: str = Field(default_factory=now_iso)


# ---------- VISIT ----------
class VisitAnswer(BaseModel):
    question_id: str
    value: Any = None
    score: float = 0
    evidence_files: List[str] = []  # file ids


class VisitIn(BaseModel):
    campaign_id: str
    point_of_sale_id: str
    auditor_id: str
    scheduled_at: Optional[str] = None
    notes: Optional[str] = ""


class VisitUpdate(BaseModel):
    scheduled_at: Optional[str] = None
    status: Optional[VisitStatus] = None
    notes: Optional[str] = None
    answers: Optional[List[VisitAnswer]] = None
    signature_file_id: Optional[str] = None


class Visit(VisitIn):
    id: str = Field(default_factory=new_id)
    status: VisitStatus = "planificada"
    answers: List[VisitAnswer] = []
    total_score: float = 0
    max_score: float = 0
    percentage: float = 0
    signature_file_id: Optional[str] = None
    executed_at: Optional[str] = None
    audited_at: Optional[str] = None
    audited_by: Optional[str] = None
    audit_comments: Optional[str] = None
    created_at: str = Field(default_factory=now_iso)


# ---------- FILE ----------
class FileRecord(BaseModel):
    id: str = Field(default_factory=new_id)
    storage_path: str
    original_filename: str
    content_type: str
    size: int
    uploaded_by: str
    context: Optional[str] = None  # e.g. "visit:xxx", "evidence", "signature"
    is_deleted: bool = False
    created_at: str = Field(default_factory=now_iso)


# ---------- AI ----------
class ChatMessage(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str


class ChatRequest(BaseModel):
    session_id: str
    message: str


class DocAnalysisRequest(BaseModel):
    file_id: str
    intent: Literal["extract_form_data", "summarize", "ocr", "transcribe"] = "summarize"
    context: Optional[str] = None


# =========================================================================
# GRAVICENTRA CX — MULTI-TENANT MODEL (Fase A · aditivo, no reemplaza legacy)
# =========================================================================

CanonicalVisitStatus = Literal[
    "available", "postulated", "assigned_without_date", "scheduled",
    "reschedule_requested", "cancel_requested", "completed_visit",
    "questionnaire_open", "questionnaire_completed", "review_pending",
    "review_completed", "submitted_external_or_hr", "liquidation_pending",
    "liquidation_paid", "conflict_review",
]

PostulationStatus = Literal["submitted", "under_review", "approved", "rejected", "cancelled", "expired"]


# ---------- TENANT ----------
class TenantIn(BaseModel):
    name: str
    slug: str
    branding: Dict[str, Any] = {}   # {primary_color, logo_url, tagline}
    default_locale: str = "es"
    locales_enabled: List[str] = ["es"]
    status: Literal["active", "suspended"] = "active"


class Tenant(TenantIn):
    id: str = Field(default_factory=new_id)
    created_at: str = Field(default_factory=now_iso)


# ---------- PROJECT (extended: multi-country, multi-currency) ----------
class ProjectHRConfig(BaseModel):
    source_type: Literal["google_sheets", "csv_upload", "manual"] = "manual"
    sheet_id: Optional[str] = None
    sheet_tabs: Dict[str, str] = {}       # {"GT": "MES 26", "HN": "MES 26 HN"}
    column_mapping: Dict[str, str] = {}   # {"visitKey": "A", "shopper": "H", ...}
    last_synced_at: Optional[str] = None


class ProjectQuestionnaireConfig(BaseModel):
    mode: Literal["internal", "external"] = "internal"
    external_url_template: Optional[str] = None   # e.g. https://tyaonline.com/q/{visitKey}
    internal_form_id: Optional[str] = None


class ProjectPaymentConfig(BaseModel):
    honorarium_amount: float = 0
    reimbursements: List[Dict[str, Any]] = []     # [{"key":"boleto","label":"Boleto","amount":50}]
    currency: str = "USD"
    fortnight_rule: Optional[str] = None


class ProjectIn(BaseModel):
    tenant_id: str
    name: str
    client_name: str
    code: str
    countries: List[str] = []                     # ISO2
    currencies: List[str] = []                    # ISO3
    hr_config: ProjectHRConfig = ProjectHRConfig()
    questionnaire_config: ProjectQuestionnaireConfig = ProjectQuestionnaireConfig()
    payment_config: ProjectPaymentConfig = ProjectPaymentConfig()
    dashboard_layout: List[str] = ["visits_by_status", "kpi_coverage", "kpi_avg_score"]
    status: Literal["draft", "active", "paused", "closed"] = "active"


class Project(ProjectIn):
    id: str = Field(default_factory=new_id)
    created_by: Optional[str] = None
    created_at: str = Field(default_factory=now_iso)


# ---------- PERIOD ----------
class PeriodIn(BaseModel):
    tenant_id: str
    project_id: str
    label: str                                    # "Q1 2026 GT"
    country: Optional[str] = None
    start_date: str
    end_date: str
    fortnight: Optional[str] = None
    status: Literal["planned", "open", "closed"] = "open"


class Period(PeriodIn):
    id: str = Field(default_factory=new_id)
    created_at: str = Field(default_factory=now_iso)


# ---------- SHOPPER ----------
class ShopperIn(BaseModel):
    tenant_id: str
    full_name: str
    email: Optional[EmailStr] = None
    phone_e164: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    dpi_hash: Optional[str] = None                # never store raw DPI in projections
    active: bool = True
    consent_terms_at: Optional[str] = None


class Shopper(ShopperIn):
    id: str = Field(default_factory=new_id)
    total_visits: int = 0
    certifications: List[str] = []
    created_at: str = Field(default_factory=now_iso)


class ProjectShopper(BaseModel):
    id: str = Field(default_factory=new_id)
    tenant_id: str
    project_id: str
    shopper_id: str
    eligible: bool = True
    coverage_cities: List[str] = []
    certifications: List[str] = []
    joined_at: str = Field(default_factory=now_iso)


# ---------- POSTULATION ----------
class PostulationIn(BaseModel):
    tenant_id: str
    project_id: str
    period_id: str
    visit_id: Optional[str] = None                # postular a visita concreta
    branch_name: Optional[str] = None             # o postular a sucursal si visita no publicada
    shopper_id: str
    proposed_date: Optional[str] = None
    proposed_slot: Optional[str] = None           # AM/PM/EVE
    notes: Optional[str] = None


class Postulation(PostulationIn):
    id: str = Field(default_factory=new_id)
    status: PostulationStatus = "submitted"
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[str] = None
    rejection_reason: Optional[str] = None
    created_at: str = Field(default_factory=now_iso)


# ---------- ASSIGNMENT ----------
class Assignment(BaseModel):
    id: str = Field(default_factory=new_id)
    tenant_id: str
    project_id: str
    period_id: str
    visit_id: str
    shopper_id: str
    source: Literal["platform", "hr", "manual"] = "platform"
    sync_status: Literal["pending", "synced", "conflict"] = "pending"
    last_synced_at: Optional[str] = None
    conflict_notes: Optional[str] = None
    created_at: str = Field(default_factory=now_iso)


# ---------- LIQUIDATION ----------
class LiquidationIn(BaseModel):
    tenant_id: str
    project_id: str
    period_id: str
    visit_id: str
    shopper_id: str
    honorarium: float = 0
    reimbursements: Dict[str, float] = {}          # {"boleto": 50, "combo": 30}
    currency: str = "USD"


class Liquidation(LiquidationIn):
    id: str = Field(default_factory=new_id)
    total: float = 0
    status: Literal["eligible", "under_review", "liquidated", "paid", "rejected"] = "eligible"
    batch_id: Optional[str] = None
    paid_at: Optional[str] = None
    created_at: str = Field(default_factory=now_iso)
