"""Idempotent seed for TyA MVP: owner + demo users + sample campaign/visits."""
import os
import logging
from datetime import datetime, timezone, timedelta

from auth import hash_password
from models import (
    User, Client, PointOfSale, Form, FormSection, FormQuestion,
    Campaign, Visit, new_id, now_iso,
)

logger = logging.getLogger(__name__)

OWNER_EMAIL = os.environ.get("OWNER_EMAIL", "paula.osorio.f86@gmail.com")

DEMO_USERS = [
    {"email": OWNER_EMAIL, "password": "TyA2026!", "full_name": "Paula Osorio", "role": "super_admin"},
    {"email": "admin@tya.com", "password": "Admin2026!", "full_name": "Admin TyA", "role": "admin"},
    {"email": "coordinador@tya.com", "password": "Coord2026!", "full_name": "María Coordinadora", "role": "coordinador"},
    {"email": "supervisor@tya.com", "password": "Super2026!", "full_name": "Jorge Supervisor", "role": "supervisor"},
    {"email": "auditor@tya.com", "password": "Audit2026!", "full_name": "Lucía Auditora", "role": "auditor"},
]


async def seed(db):
    # Users
    users_by_email = {}
    for u in DEMO_USERS:
        existing = await db.users.find_one({"email": u["email"]}, {"_id": 0})
        if existing:
            users_by_email[u["email"]] = existing["id"]
            continue
        user = User(
            email=u["email"],
            full_name=u["full_name"],
            role=u["role"],
            password_hash=hash_password(u["password"]),
        )
        await db.users.insert_one(user.model_dump())
        users_by_email[u["email"]] = user.id
        logger.info(f"Seeded user: {u['email']}")

    # Skip demo business data if already seeded
    if await db.clients.count_documents({}) > 0:
        return

    # Client
    client = Client(name="Supermercados Andina", industry="Retail Alimentos",
                    contact_email="contacto@andina.com.ar")
    await db.clients.insert_one(client.model_dump())

    # Points of sale
    pos_list = [
        PointOfSale(client_id=client.id, name="Andina Palermo", address="Av. Santa Fe 3200", city="CABA", region="Buenos Aires", code="AND-001"),
        PointOfSale(client_id=client.id, name="Andina Belgrano", address="Cabildo 2100", city="CABA", region="Buenos Aires", code="AND-002"),
        PointOfSale(client_id=client.id, name="Andina Rosario Centro", address="Córdoba 1200", city="Rosario", region="Santa Fe", code="AND-003"),
    ]
    for p in pos_list:
        await db.points_of_sale.insert_one(p.model_dump())

    # Form
    form = Form(
        name="Auditoría estándar retail",
        description="Cumplimiento, limpieza, exhibición y atención al cliente",
        sections=[
            FormSection(title="Fachada y acceso", questions=[
                FormQuestion(text="¿La fachada está limpia y sin daños?", type="yes_no", weight=2),
                FormQuestion(text="Estado de la cartelería exterior", type="scale", options=["1","2","3","4","5"], weight=1),
                FormQuestion(text="Foto de la fachada", type="photo", weight=0, required=False),
            ]),
            FormSection(title="Salón de ventas", questions=[
                FormQuestion(text="¿La exhibición sigue el planograma?", type="yes_no", weight=3),
                FormQuestion(text="Cantidad de góndolas con quiebre de stock", type="number", weight=2),
                FormQuestion(text="Comentarios del auditor", type="text", weight=0, required=False),
            ]),
            FormSection(title="Atención al cliente", questions=[
                FormQuestion(text="¿El personal usa uniforme completo?", type="yes_no", weight=2),
                FormQuestion(text="Nota general de atención (1-5)", type="scale", options=["1","2","3","4","5"], weight=3),
            ]),
        ]
    )
    await db.forms.insert_one(form.model_dump())

    # Campaign
    campaign = Campaign(
        name="Campaña Q1 2026 - Cumplimiento Andina",
        client_id=client.id,
        form_id=form.id,
        description="Relevamiento trimestral de cumplimiento en sucursales Andina",
        status="activa",
        starts_at=now_iso(),
        ends_at=(datetime.now(timezone.utc) + timedelta(days=30)).isoformat(),
        target_points_of_sale=[p.id for p in pos_list],
        created_by=users_by_email[OWNER_EMAIL],
    )
    await db.campaigns.insert_one(campaign.model_dump())

    # Visits
    auditor_id = users_by_email["auditor@tya.com"]
    supervisor_id = users_by_email["supervisor@tya.com"]
    for i, pos in enumerate(pos_list):
        scheduled = (datetime.now(timezone.utc) + timedelta(days=i)).isoformat()
        visit = Visit(
            campaign_id=campaign.id,
            point_of_sale_id=pos.id,
            auditor_id=auditor_id,
            scheduled_at=scheduled,
            status="completada" if i == 0 else ("en_curso" if i == 1 else "planificada"),
            total_score=42 if i == 0 else 0,
            max_score=52,
            percentage=80.7 if i == 0 else 0,
            audited_by=supervisor_id if i == 0 else None,
            audited_at=now_iso() if i == 0 else None,
        )
        await db.visits.insert_one(visit.model_dump())

    logger.info("Demo business data seeded")
