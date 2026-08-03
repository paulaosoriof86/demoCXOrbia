"""AI orchestrator using Emergent Universal LLM Key."""
import os
import logging
from typing import AsyncGenerator

from emergentintegrations.llm.chat import (
    LlmChat,
    UserMessage,
    TextDelta,
    StreamDone,
)

logger = logging.getLogger(__name__)
EMERGENT_LLM_KEY = os.environ["EMERGENT_LLM_KEY"]

# Model routing
CHATBOT_MODEL = ("openai", "gpt-5.6-terra")
MULTIMODAL_MODEL = ("gemini", "gemini-3.1-pro-preview")
REASONING_MODEL = ("anthropic", "claude-sonnet-5")

SYSTEM_CHATBOT = (
    "Sos el asistente inteligente de la Plataforma TyA Consultores. "
    "Ayudás a auditores, supervisores y coordinadores con consultas técnicas "
    "sobre campañas, visitas de auditoría, formularios, evaluaciones y reportes. "
    "Respondé en español rioplatense, breve y claro. Si te preguntan algo fuera "
    "del ámbito de TyA (auditoría de campo, mystery shopping, control de "
    "cumplimiento en puntos de venta), redirigí amablemente al tema."
)


def chatbot_chat(session_id: str) -> LlmChat:
    return LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=session_id,
        system_message=SYSTEM_CHATBOT,
    ).with_model(*CHATBOT_MODEL)


async def stream_chatbot(session_id: str, user_text: str) -> AsyncGenerator[str, None]:
    chat = chatbot_chat(session_id)
    try:
        async for ev in chat.stream_message(UserMessage(text=user_text)):
            if isinstance(ev, TextDelta):
                yield ev.content
            elif isinstance(ev, StreamDone):
                break
    except Exception as e:
        logger.error(f"chatbot stream error: {e}")
        yield f"\n[error IA: {str(e)[:120]}]"


async def analyze_document(session_id: str, intent: str, text_or_prompt: str) -> str:
    """Non-streaming analysis using appropriate model based on intent."""
    if intent in ("extract_form_data", "ocr", "transcribe"):
        provider, model = MULTIMODAL_MODEL
    else:
        provider, model = REASONING_MODEL

    system = {
        "extract_form_data": "Extraés datos estructurados de documentos y devolvés JSON con los campos detectados.",
        "summarize": "Resumís reportes de auditoría de forma ejecutiva, en español, con hallazgos clave y recomendaciones.",
        "ocr": "Realizás OCR: transcribís el texto visible en la imagen o documento.",
        "transcribe": "Transcribís audio de visitas de auditoría a texto en español, marcando timestamps aproximados.",
    }.get(intent, "Sos un analista de documentos de auditoría.")

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=session_id,
        system_message=system,
    ).with_model(provider, model)

    result = []
    try:
        async for ev in chat.stream_message(UserMessage(text=text_or_prompt)):
            if isinstance(ev, TextDelta):
                result.append(ev.content)
            elif isinstance(ev, StreamDone):
                break
    except Exception as e:
        logger.error(f"analyze_document error: {e}")
        return f"[error IA: {str(e)[:200]}]"
    return "".join(result)
