"""Idempotent seed for Gravicentra CX — TyA Consultores tenant with Cinépolis project."""
import os
import logging
from datetime import datetime, timezone, timedelta

from auth import hash_password
from models import (
    User, Client, PointOfSale, Form, FormSection, FormQuestion,
    Campaign, Visit, Tenant, Project, ProjectHRConfig,
    ProjectQuestionnaireConfig, ProjectPaymentConfig, Period,
    Shopper, ProjectShopper, Postulation, Assignment, Liquidation,
    new_id, now_iso,
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


DEMO_SHOPPERS = [
    {"full_name": "Carlos Méndez", "email": "carlos.mendez@example.gt", "phone_e164": "+50255551001", "country": "GT", "city": "Ciudad de Guatemala"},
    {"full_name": "Ana Rodríguez", "email": "ana.rodriguez@example.gt", "phone_e164": "+50255551002", "country": "GT", "city": "Antigua"},
    {"full_name": "Luis Pérez", "email": "luis.perez@example.gt", "phone_e164": "+50255551003", "country": "GT", "city": "Quetzaltenango"},
    {"full_name": "María Castro", "email": "maria.castro@example.hn", "phone_e164": "+50499991001", "country": "HN", "city": "Tegucigalpa"},
    {"full_name": "José Hernández", "email": "jose.hernandez@example.hn", "phone_e164": "+50499991002", "country": "HN", "city": "San Pedro Sula"},
]


async def seed(db):
    # --- Users (idempotent) ---
    users_by_email = {}
    for u in DEMO_USERS:
        existing = await db.users.find_one({"email": u["email"]}, {"_id": 0})
        if existing:
            users_by_email[u["email"]] = existing["id"]
            continue
        user = User(
            email=u["email"], full_name=u["full_name"], role=u["role"],
            password_hash=hash_password(u["password"]),
        )
        await db.users.insert_one(user.model_dump())
        users_by_email[u["email"]] = user.id
        logger.info(f"Seeded user: {u['email']}")

    owner_id = users_by_email[OWNER_EMAIL]

    # --- Tenant TyA ---
    tya = await db.tenants.find_one({"slug": "tya"}, {"_id": 0})
    if not tya:
        tya_model = Tenant(
            name="TyA Consultores",
            slug="tya",
            branding={
                "primary_color": "#0F52BA",
                "logo": "tya",
                "tagline": "Mystery shopping · Auditoría de campo",
            },
            default_locale="es",
            locales_enabled=["es", "en"],
        )
        await db.tenants.insert_one(tya_model.model_dump())
        tya = tya_model.model_dump()
        logger.info("Seeded tenant: TyA")

    # --- Project Cinépolis ---
    cine = await db.projects.find_one({"tenant_id": tya["id"], "code": "CINE"}, {"_id": 0})
    if not cine:
        cine_model = Project(
            tenant_id=tya["id"],
            name="Cinépolis Centroamérica",
            client_name="Cinépolis",
            code="CINE",
            countries=["GT", "HN"],
            currencies=["GTQ", "HNL"],
            hr_config=ProjectHRConfig(
                source_type="google_sheets",
                sheet_id="",
                sheet_tabs={"GT": "MES 26", "HN": "MES 26 HN"},
                column_mapping={
                    "visitKey": "A", "periodo": "B", "pais": "C", "id_cinema": "D",
                    "sucursal": "E", "ciudad": "F", "franja": "G", "quincena": "H",
                    "shopper_asignado": "I", "email": "J", "telefono": "K",
                    "fecha_programada": "L", "fecha_realizada": "M", "estado": "N",
                },
            ),
            questionnaire_config=ProjectQuestionnaireConfig(
                mode="external",
                external_url_template="https://tyaonline.com/q/{visitKey}",
            ),
            payment_config=ProjectPaymentConfig(
                honorarium_amount=200,
                reimbursements=[
                    {"key": "boleto", "label": "Boleto de cine", "amount": 50},
                    {"key": "combo", "label": "Combo (palomitas + bebida)", "amount": 30},
                ],
                currency="GTQ",
                fortnight_rule="Q1: 1-15 · Q2: 16-fin",
            ),
            dashboard_layout=["visits_by_status", "kpi_coverage", "kpi_avg_score", "postulations_queue", "financial_by_period"],
            status="active",
            created_by=owner_id,
        )
        await db.projects.insert_one(cine_model.model_dump())
        cine = cine_model.model_dump()
        logger.info("Seeded project: Cinépolis")

    # --- Periods Q1 2026 GT + HN ---
    periods = await db.periods.find({"tenant_id": tya["id"], "project_id": cine["id"]}, {"_id": 0}).to_list(20)
    if not periods:
        now = datetime.now(timezone.utc)
        q_defs = [
            {"label": "Q1 2026 · GT", "country": "GT", "days_from": -30, "days_to": 15, "fortnight": "Q1"},
            {"label": "Q2 2026 · GT", "country": "GT", "days_from": 15, "days_to": 45, "fortnight": "Q2"},
            {"label": "Q1 2026 · HN", "country": "HN", "days_from": -30, "days_to": 15, "fortnight": "Q1"},
        ]
        for q in q_defs:
            p = Period(
                tenant_id=tya["id"], project_id=cine["id"], label=q["label"],
                country=q["country"], fortnight=q["fortnight"],
                start_date=(now + timedelta(days=q["days_from"])).isoformat(),
                end_date=(now + timedelta(days=q["days_to"])).isoformat(),
                status="open" if q["days_to"] >= 0 else "closed",
            )
            await db.periods.insert_one(p.model_dump())
        periods = await db.periods.find({"tenant_id": tya["id"], "project_id": cine["id"]}, {"_id": 0}).to_list(20)
        logger.info(f"Seeded {len(periods)} periods")

    q1_gt = next((p for p in periods if p["country"] == "GT" and p["fortnight"] == "Q1"), periods[0])

    # --- Shoppers ---
    if await db.shoppers.count_documents({"tenant_id": tya["id"]}) == 0:
        shopper_ids = []
        for s in DEMO_SHOPPERS:
            sh = Shopper(tenant_id=tya["id"], total_visits=0, **s)
            await db.shoppers.insert_one(sh.model_dump())
            shopper_ids.append(sh.id)
            # ProjectShopper
            ps = ProjectShopper(
                tenant_id=tya["id"], project_id=cine["id"], shopper_id=sh.id,
                coverage_cities=[s["city"]],
                certifications=["cinepolis_basic"] if s["country"] == "GT" else [],
            )
            await db.project_shoppers.insert_one(ps.model_dump())
        logger.info(f"Seeded {len(shopper_ids)} shoppers")

    shoppers = await db.shoppers.find({"tenant_id": tya["id"]}, {"_id": 0}).to_list(50)

    # --- Postulations (demo) ---
    if await db.postulations.count_documents({"tenant_id": tya["id"]}) == 0:
        now = datetime.now(timezone.utc)
        pstates = ["submitted", "under_review", "approved", "rejected"]
        for i, sh in enumerate(shoppers[:4]):
            post = Postulation(
                tenant_id=tya["id"], project_id=cine["id"], period_id=q1_gt["id"],
                shopper_id=sh["id"],
                branch_name=f"Cinépolis {['Miraflores','Oakland Mall','Portales','Multiplaza SPS'][i]}",
                proposed_date=(now + timedelta(days=i+2)).isoformat(),
                proposed_slot=["AM", "PM", "EVE", "AM"][i],
                notes=f"Shopper con {['3','5','2','7']} visitas previas · disponibilidad confirmada",
                status=pstates[i],
                reviewed_by=owner_id if pstates[i] in ("approved", "rejected") else None,
                reviewed_at=now.isoformat() if pstates[i] in ("approved", "rejected") else None,
            )
            await db.postulations.insert_one(post.model_dump())
        logger.info("Seeded demo postulations")

    # --- Backward-compatible legacy seed (clients/pos/forms/campaigns/visits) ---
    if await db.clients.count_documents({}) == 0:
        client = Client(name="Cinépolis Guatemala", industry="Entretenimiento",
                        contact_email="operaciones@cinepolis.com.gt")
        await db.clients.insert_one(client.model_dump())

        pos_list = [
            PointOfSale(client_id=client.id, name="Cinépolis Miraflores", address="Miraflores Mall", city="Ciudad de Guatemala", region="GT", code="CINE-GT-001"),
            PointOfSale(client_id=client.id, name="Cinépolis Oakland Mall", address="Oakland Mall", city="Ciudad de Guatemala", region="GT", code="CINE-GT-002"),
            PointOfSale(client_id=client.id, name="Cinépolis Portales", address="Portales Mall", city="Ciudad de Guatemala", region="GT", code="CINE-GT-003"),
        ]
        for p in pos_list:
            await db.points_of_sale.insert_one(p.model_dump())

        form = Form(
            name="Mystery Shopping Cinépolis · Q1 2026",
            description="Auditoría experiencia cliente: taquilla, dulcería, sala, baños",
            sections=[
                FormSection(title="Taquilla / Autoservicio", questions=[
                    FormQuestion(text="¿El tiempo de espera fue menor a 5 minutos?", type="yes_no", weight=3),
                    FormQuestion(text="Amabilidad del cajero (1-5)", type="scale", options=["1","2","3","4","5"], weight=3),
                    FormQuestion(text="Foto del ticket de entrada", type="photo", weight=0, required=True),
                ]),
                FormSection(title="Dulcería", questions=[
                    FormQuestion(text="¿Se ofreció el combo del día?", type="yes_no", weight=2),
                    FormQuestion(text="Limpieza de la dulcería (1-5)", type="scale", options=["1","2","3","4","5"], weight=2),
                    FormQuestion(text="Foto del combo recibido", type="photo", weight=0),
                ]),
                FormSection(title="Sala y baños", questions=[
                    FormQuestion(text="¿La sala estaba limpia al ingresar?", type="yes_no", weight=3),
                    FormQuestion(text="Estado general de los baños (1-5)", type="scale", options=["1","2","3","4","5"], weight=2),
                    FormQuestion(text="Observaciones libres", type="text", weight=0, required=False),
                ]),
            ]
        )
        await db.forms.insert_one(form.model_dump())

        campaign = Campaign(
            name="Cinépolis Q1 2026 · Mystery GT",
            client_id=client.id, form_id=form.id,
            description="Mystery shopping trimestral en salas Cinépolis Guatemala",
            status="activa",
            starts_at=now_iso(),
            ends_at=(datetime.now(timezone.utc) + timedelta(days=30)).isoformat(),
            target_points_of_sale=[p.id for p in pos_list],
            created_by=owner_id,
        )
        await db.campaigns.insert_one(campaign.model_dump())

        auditor_id = users_by_email["auditor@tya.com"]
        supervisor_id = users_by_email["supervisor@tya.com"]
        for i, pos in enumerate(pos_list):
            v = Visit(
                campaign_id=campaign.id, point_of_sale_id=pos.id,
                auditor_id=auditor_id,
                scheduled_at=(datetime.now(timezone.utc) + timedelta(days=i)).isoformat(),
                status="completada" if i == 0 else ("en_curso" if i == 1 else "planificada"),
                total_score=42 if i == 0 else 0, max_score=52,
                percentage=80.7 if i == 0 else 0,
                audited_by=supervisor_id if i == 0 else None,
                audited_at=now_iso() if i == 0 else None,
            )
            await db.visits.insert_one(v.model_dump())

        logger.info("Legacy demo business data seeded")
