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
