import os
from dotenv import load_dotenv

from services.strategy_service import heuristic_recommendation

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")


def generate_ai_recommendation(
    product_title: str,
    listed_price: float,
    buyer_budget: float,
    current_seller_offer: float,
    strategy: str,
    role: str,
):
    # fallback first
    suggested, reasoning, buyer_message, seller_message = heuristic_recommendation(
        listed_price=listed_price,
        buyer_budget=buyer_budget,
        current_seller_offer=current_seller_offer,
        strategy=strategy,
        role=role,
    )

    # If no key is set, return heuristic response
    if not OPENAI_API_KEY:
        return {
            "suggested_price": suggested,
            "reasoning": reasoning,
            "buyer_message": buyer_message,
            "seller_message": seller_message,
            "strategy": strategy,
            "role": role,
        }

    # Optional LLM enhancement
    try:
        from openai import OpenAI

        client = OpenAI(api_key=OPENAI_API_KEY)

        prompt = f"""
You are an AI negotiation strategist.

Context:
- Product: {product_title}
- Listed price: ₹{listed_price}
- Buyer budget: ₹{buyer_budget}
- Current seller offer: ₹{current_seller_offer}
- Strategy: {strategy}
- Role: {role}

Return:
1. a recommended next price
2. short reasoning
3. a buyer-friendly message
4. a seller-friendly message

Respond in JSON with keys:
suggested_price, reasoning, buyer_message, seller_message
"""

        response = client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "You are a concise AI negotiation expert."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.4,
        )

        content = response.choices[0].message.content or ""

        # If model returns plain text instead of JSON, just fall back
        if "suggested_price" not in content:
            raise ValueError("Unexpected response format")

        import json
        parsed = json.loads(content)

        return {
            "suggested_price": float(parsed.get("suggested_price", suggested)),
            "reasoning": parsed.get("reasoning", reasoning),
            "buyer_message": parsed.get("buyer_message", buyer_message),
            "seller_message": parsed.get("seller_message", seller_message),
            "strategy": strategy,
            "role": role,
        }

    except Exception:
        return {
            "suggested_price": suggested,
            "reasoning": reasoning,
            "buyer_message": buyer_message,
            "seller_message": seller_message,
            "strategy": strategy,
            "role": role,
        }